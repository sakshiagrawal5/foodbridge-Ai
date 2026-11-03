import { Rescue, RESCUE_STATUS } from '../models/Rescue.js';
import { Donation, DONATION_STATUS } from '../models/Donation.js';
import { Match, MATCH_STATUS } from '../models/Match.js';
import { ImpactRecord } from '../models/ImpactRecord.js';
import { AuditLog } from '../models/AuditLog.js';
import { emitToRoom } from '../sockets/socketHandler.js';

export const ALLOWED_TRANSITIONS = {
  [RESCUE_STATUS.ASSIGNED]: [RESCUE_STATUS.PICKUP_CONFIRMED, RESCUE_STATUS.CANCELLED, RESCUE_STATUS.FAILED],
  [RESCUE_STATUS.PICKUP_CONFIRMED]: [RESCUE_STATUS.PICKED_UP, RESCUE_STATUS.CANCELLED, RESCUE_STATUS.FAILED],
  [RESCUE_STATUS.PICKED_UP]: [RESCUE_STATUS.IN_TRANSIT, RESCUE_STATUS.DELIVERED, RESCUE_STATUS.FAILED],
  [RESCUE_STATUS.IN_TRANSIT]: [RESCUE_STATUS.DELIVERED, RESCUE_STATUS.FAILED],
  [RESCUE_STATUS.DELIVERED]: [],
  [RESCUE_STATUS.FAILED]: [],
  [RESCUE_STATUS.CANCELLED]: [],
};

/**
 * Atomic Acceptance of a proposed Match
 */
export const acceptMatch = async (matchId, ngoUserId) => {
  const match = await Match.findById(matchId).populate('donationId');
  if (!match) {
    throw new Error('Match recommendation not found');
  }

  if (match.ngoId.toString() !== ngoUserId.toString()) {
    throw new Error('Unauthorized: Only the assigned recipient NGO can accept this match.');
  }

  if (match.status !== MATCH_STATUS.PROPOSED) {
    throw new Error(`Match is already in ${match.status} state.`);
  }

  const donation = await Donation.findById(match.donationId._id);
  if (!donation || donation.status === DONATION_STATUS.CANCELLED || donation.status === DONATION_STATUS.EXPIRED) {
    throw new Error('Donation is no longer available for rescue.');
  }

  if (donation.portionsRemaining < match.portionsAllocated) {
    throw new Error(`Insufficient portions remaining. Available: ${donation.portionsRemaining}, Requested: ${match.portionsAllocated}`);
  }

  // Deduct portions and update donation state
  donation.portionsRemaining -= match.portionsAllocated;
  if (donation.portionsRemaining === 0) {
    donation.status = DONATION_STATUS.ASSIGNED;
  } else {
    donation.status = DONATION_STATUS.MATCHED;
  }
  await donation.save();

  // Update match state
  match.status = MATCH_STATUS.ACCEPTED;
  await match.save();

  // Create rescue entity
  const rescue = await Rescue.create({
    donationId: donation._id,
    matchId: match._id,
    donorId: donation.donorId,
    ngoId: ngoUserId,
    portionsAllocated: match.portionsAllocated,
    portionsCollected: 0,
    portionsDelivered: 0,
    routeDistanceKm: match.estimatedDistanceKm,
    status: RESCUE_STATUS.ASSIGNED,
  });

  // Record audit log
  await AuditLog.create({
    actorId: ngoUserId,
    actorRole: 'NGO',
    action: 'ACCEPT_MATCH',
    entityType: 'RESCUE',
    entityId: rescue._id,
    previousState: MATCH_STATUS.PROPOSED,
    newState: RESCUE_STATUS.ASSIGNED,
    reason: 'NGO confirmed acceptance of rescue recommendation.',
    metadata: { matchId: match._id, portions: match.portionsAllocated }
  });

  // Notify real-time subscribers
  emitToRoom(`donation_${donation._id}`, 'RESCUE_STATE_CHANGED', { rescue, donation });
  emitToRoom(`ngo_${ngoUserId}`, 'RESCUE_STATE_CHANGED', { rescue, donation });

  return { rescue, match, donation };
};

/**
 * Safe state transition runner
 */
export const transitionRescueStatus = async (rescueId, nextStatus, actor, details = {}) => {
  const rescue = await Rescue.findById(rescueId);
  if (!rescue) {
    throw new Error('Rescue not found');
  }

  const currentStatus = rescue.status;
  const allowed = ALLOWED_TRANSITIONS[currentStatus] || [];

  if (!allowed.includes(nextStatus)) {
    throw new Error(`Invalid status transition from ${currentStatus} to ${nextStatus}.`);
  }

  const previousState = rescue.status;
  rescue.status = nextStatus;

  // Specific transition business logic
  if (nextStatus === RESCUE_STATUS.PICKED_UP) {
    rescue.pickupTime = new Date();
    rescue.portionsCollected = details.portionsCollected || rescue.portionsAllocated;
    if (details.notes) rescue.handoverNotes = details.notes;

    // Update donation status
    await Donation.findByIdAndUpdate(rescue.donationId, { status: DONATION_STATUS.PICKED_UP });
  }

  if (nextStatus === RESCUE_STATUS.DELIVERED) {
    rescue.deliveryTime = new Date();
    rescue.portionsDelivered = details.portionsDelivered || rescue.portionsCollected || rescue.portionsAllocated;
    if (details.notes) rescue.deliveryProofNotes = details.notes;

    // Update donation status
    await Donation.findByIdAndUpdate(rescue.donationId, { status: DONATION_STATUS.DELIVERED });

    // Generate verified ImpactRecord
    const defaultKgPerMeal = parseFloat(process.env.DEFAULT_KG_PER_PORTION || '0.45');
    const foodWasteAvoidedKg = Number((rescue.portionsDelivered * defaultKgPerMeal).toFixed(2));
    const co2AvoidedKg = Number((foodWasteAvoidedKg * 2.5).toFixed(2));

    await ImpactRecord.findOneAndUpdate(
      { rescueId: rescue._id },
      {
        rescueId: rescue._id,
        donationId: rescue.donationId,
        donorId: rescue.donorId,
        ngoId: rescue.ngoId,
        mealsDelivered: rescue.portionsDelivered,
        estimatedFoodWasteAvoidedKg: foodWasteAvoidedKg,
        conversionFactorKgPerMeal: defaultKgPerMeal,
        co2EquivalentAvoidedKg: co2AvoidedKg,
        calculationMethod: `${rescue.portionsDelivered} portions * ${defaultKgPerMeal} kg/portion standard baseline.`,
        recordedAt: new Date(),
      },
      { upsert: true, new: true }
    );
  }

  if (nextStatus === RESCUE_STATUS.FAILED) {
    rescue.failureReason = details.reason || 'Collection or delivery could not be completed';
    // Revert donation portions
    const donation = await Donation.findById(rescue.donationId);
    if (donation) {
      donation.portionsRemaining += rescue.portionsAllocated;
      donation.status = DONATION_STATUS.AVAILABLE;
      await donation.save();
    }
  }

  await rescue.save();

  // Audit log
  await AuditLog.create({
    actorId: actor._id,
    actorRole: actor.role,
    action: `TRANSITION_TO_${nextStatus}`,
    entityType: 'RESCUE',
    entityId: rescue._id,
    previousState,
    newState: nextStatus,
    reason: details.reason || details.notes || 'Normal rescue workflow progression',
  });

  // Notify socket rooms
  emitToRoom(`donation_${rescue.donationId}`, 'RESCUE_STATE_CHANGED', { rescue });
  emitToRoom(`ngo_${rescue.ngoId}`, 'RESCUE_STATE_CHANGED', { rescue });

  return rescue;
};
