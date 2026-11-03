import { NGOProfile } from '../models/NGOProfile.js';
import { User } from '../models/User.js';
import { calculateHaversineDistance, getRoadRoute } from './routeService.js';

export const MATCH_CONFIG = {
  WEIGHT_URGENCY: parseFloat(process.env.WEIGHT_URGENCY || '0.35'),
  WEIGHT_QUANTITY: parseFloat(process.env.WEIGHT_QUANTITY || '0.25'),
  WEIGHT_TRAVEL: parseFloat(process.env.WEIGHT_TRAVEL || '0.25'),
  WEIGHT_DEMAND: parseFloat(process.env.WEIGHT_DEMAND || '0.15'),
  MAX_ACCEPTABLE_TRAVEL_MINUTES: parseInt(process.env.MAX_ACCEPTABLE_TRAVEL_MINUTES || '45', 10),
};

/**
 * PHASE A: Eligibility filtering
 * Evaluates whether an NGO is strictly eligible to receive this donation.
 */
export const checkEligibility = (donation, ngoProfile, travelMinutes, distanceKm) => {
  const reasons = [];

  // 1. Verification status check
  if (ngoProfile.verificationStatus !== 'VERIFIED') {
    reasons.push(`NGO verification status is ${ngoProfile.verificationStatus}; must be VERIFIED.`);
  }

  // 2. NGO User active check
  if (ngoProfile.userId && ngoProfile.userId.isActive === false) {
    reasons.push('NGO user account is deactivated or suspended.');
  }

  // 3. Category compatibility
  if (!ngoProfile.acceptedFoodCategories.includes(donation.foodCategory)) {
    reasons.push(`NGO does not accept ${donation.foodCategory} category.`);
  }

  // 4. Capacity check
  if (ngoProfile.collectionCapacity < 5) {
    reasons.push(`NGO collection capacity (${ngoProfile.collectionCapacity}) is insufficient.`);
  }

  // 5. Radius and Service Area
  if (distanceKm > (ngoProfile.serviceRadiusKm || 15)) {
    reasons.push(`Distance (${distanceKm} km) exceeds NGO service radius (${ngoProfile.serviceRadiusKm || 15} km).`);
  }

  // 6. Food safety and deadline feasibility
  const now = new Date();
  const deadline = new Date(donation.collectionDeadline);
  const remainingMinutes = (deadline - now) / (1000 * 60);

  if (remainingMinutes <= 0) {
    reasons.push('Donation collection deadline has already expired.');
  } else if (travelMinutes > remainingMinutes) {
    reasons.push(`Estimated travel time (${travelMinutes}m) exceeds remaining shelf life deadline (${Math.round(remainingMinutes)}m).`);
  }

  // 7. Travel time feasibility threshold
  if (travelMinutes > MATCH_CONFIG.MAX_ACCEPTABLE_TRAVEL_MINUTES) {
    reasons.push(`Travel time (${travelMinutes}m) exceeds maximum acceptable rescue window (${MATCH_CONFIG.MAX_ACCEPTABLE_TRAVEL_MINUTES}m).`);
  }

  // 8. Storage & temperature requirements (e.g. heated/frozen need appropriate handling)
  if (['REFRIGERATED', 'DEEP_FROZEN'].includes(donation.storageConditions) && !ngoProfile.foodHandlingCapabilities?.hasColdStorage) {
    reasons.push(`Donation requires ${donation.storageConditions} handling, but NGO lacks cold storage facilities.`);
  }

  return {
    isEligible: reasons.length === 0,
    reasons,
  };
};

/**
 * PHASE B: Normalized Component Scoring (0 to 100)
 */
export const calculateComponentScores = (donation, ngoProfile, travelMinutes, proposedAllocation) => {
  const now = new Date();
  const deadline = new Date(donation.collectionDeadline);
  const remainingHours = Math.max(0.1, (deadline - now) / (1000 * 60 * 60));

  // 1. Urgency Suitability Score (0 - 100)
  // Higher urgency (shorter remaining safe time) gets higher priority score,
  // provided it is still feasible within safe travel buffer.
  let urgencyScore = 50;
  if (remainingHours <= 1.5) {
    urgencyScore = 100;
  } else if (remainingHours <= 3) {
    urgencyScore = 85;
  } else if (remainingHours <= 6) {
    urgencyScore = 70;
  } else if (remainingHours <= 12) {
    urgencyScore = 55;
  } else {
    urgencyScore = 40;
  }

  // 2. Quantity Fit Score (0 - 100)
  // Evaluates how well the proposed allocation satisfies the NGO's current demand and fits capacity
  const demand = ngoProfile.mealDemand || 50;
  const capacity = ngoProfile.collectionCapacity || 100;
  const targetPortions = Math.min(demand, capacity);
  
  // Ratio of allocation to target
  const fillRatio = proposedAllocation / Math.max(1, targetPortions);
  let quantityFitScore = 100;
  if (fillRatio >= 0.8 && fillRatio <= 1.2) {
    quantityFitScore = 100; // Perfect match
  } else if (fillRatio > 1.2) {
    quantityFitScore = Math.max(40, 100 - (fillRatio - 1.2) * 50);
  } else {
    quantityFitScore = Math.max(30, Math.round(fillRatio * 100));
  }

  // 3. Travel Efficiency Score (0 - 100)
  // 0 min = 100, MAX_ACCEPTABLE_TRAVEL_MINUTES = 0
  const maxTravel = MATCH_CONFIG.MAX_ACCEPTABLE_TRAVEL_MINUTES;
  const travelEfficiencyScore = Math.max(0, Math.round(((maxTravel - Math.min(travelMinutes, maxTravel)) / maxTravel) * 100));

  // 4. Recipient Demand Fit Score (0 - 100)
  // How urgently and fully the NGO demands this specific food type
  let demandFitScore = 70;
  if (ngoProfile.mealDemand >= proposedAllocation) {
    demandFitScore = 95;
  } else if (ngoProfile.mealDemand > 0) {
    demandFitScore = 80;
  } else {
    demandFitScore = 40;
  }

  // Final Weighted Composite Score
  const finalScore = Number((
    MATCH_CONFIG.WEIGHT_URGENCY * urgencyScore +
    MATCH_CONFIG.WEIGHT_QUANTITY * quantityFitScore +
    MATCH_CONFIG.WEIGHT_TRAVEL * travelEfficiencyScore +
    MATCH_CONFIG.WEIGHT_DEMAND * demandFitScore
  ).toFixed(1));

  return {
    urgencyScore,
    quantityFitScore,
    travelEfficiencyScore,
    demandFitScore,
    finalScore,
    weightsUsed: {
      urgency: MATCH_CONFIG.WEIGHT_URGENCY,
      quantity: MATCH_CONFIG.WEIGHT_QUANTITY,
      travel: MATCH_CONFIG.WEIGHT_TRAVEL,
      demand: MATCH_CONFIG.WEIGHT_DEMAND,
    }
  };
};

/**
 * Generate human-readable explainable rationale
 */
export const generateExplanation = (ngoProfile, scores, travelMinutes, distanceKm, proposedAllocation) => {
  const parts = [];
  parts.push(`Verified recipient ${ngoProfile.organizationName} has confirmed demand for ${ngoProfile.mealDemand} portions and capacity of ${ngoProfile.collectionCapacity}.`);
  parts.push(`Feasible road travel of ~${travelMinutes} min (${distanceKm} km) ensures pickup before safety deadline.`);
  
  if (scores.quantityFitScore >= 90) {
    parts.push(`Allocating ${proposedAllocation} portions achieves optimal quantity fit (${scores.quantityFitScore}%).`);
  } else {
    parts.push(`Proposed allocation: ${proposedAllocation} portions.`);
  }

  if (scores.urgencyScore >= 80) {
    parts.push(`High urgency score (${scores.urgencyScore}%) ensures rapid intervention.`);
  }

  return parts.join(' ');
};

/**
 * MAIN INTELLIGENCE ENGINE:
 * Finds, filters, scores, and allocates donations to candidate NGOs
 */
export const findMatchesForDonation = async (donation) => {
  // Fetch all candidate NGOs with populated user status
  const candidateNgos = await NGOProfile.find().populate('userId');

  const eligibleCandidates = [];
  const excludedCandidates = [];

  for (const ngo of candidateNgos) {
    const donorCoord = donation.pickupLocation.coordinates; // [lon, lat]
    const ngoCoord = ngo.location.coordinates; // [lon, lat]

    // Calculate routing & travel feasibility
    const routeInfo = await getRoadRoute(ngoCoord, donorCoord); // NGO traveling to Donor
    const distanceKm = routeInfo.distanceKm;
    const travelMinutes = routeInfo.durationMinutes;

    const eligibility = checkEligibility(donation, ngo, travelMinutes, distanceKm);

    if (!eligibility.isEligible) {
      excludedCandidates.push({
        ngoId: ngo.userId?._id || ngo._id,
        organizationName: ngo.organizationName,
        isEligible: false,
        reasons: eligibility.reasons,
        distanceKm,
        travelMinutes,
      });
      continue;
    }

    // Determine viable portion allocation for this candidate (single NGO allocation)
    const proposedAllocation = Math.min(
      donation.portionsRemaining,
      ngo.collectionCapacity,
      ngo.mealDemand > 0 ? ngo.mealDemand : ngo.collectionCapacity
    );

    const scores = calculateComponentScores(donation, ngo, travelMinutes, proposedAllocation);
    const explanation = generateExplanation(ngo, scores, travelMinutes, distanceKm, proposedAllocation);

    eligibleCandidates.push({
      ngoId: ngo.userId?._id,
      ngoProfileId: ngo._id,
      organizationName: ngo.organizationName,
      isEligible: true,
      priorityScore: scores.finalScore,
      scoreBreakdown: scores,
      portionsAllocated: proposedAllocation,
      ngoDemand: ngo.mealDemand,
      ngoCapacity: ngo.collectionCapacity,
      estimatedDistanceKm: distanceKm,
      estimatedTravelMinutes: travelMinutes,
      routingType: routeInfo.routingType,
      routeGeometry: routeInfo.coordinates,
      recommendationExplanation: explanation,
      ngoLocation: ngo.location,
    });
  }

  // Sort eligible candidates by priority score descending
  eligibleCandidates.sort((a, b) => b.priorityScore - a.priorityScore);

  // Capacity-aware split plan (if top candidate cannot consume all portions)
  let multiNgoSplitPlan = [];
  if (eligibleCandidates.length > 1 && donation.portionsRemaining > eligibleCandidates[0].portionsAllocated) {
    let remainingToAllocate = donation.portionsRemaining;
    for (const candidate of eligibleCandidates) {
      if (remainingToAllocate <= 0) break;
      const alloc = Math.min(remainingToAllocate, candidate.ngoCapacity, candidate.ngoDemand);
      if (alloc > 0) {
        multiNgoSplitPlan.push({
          ngoId: candidate.ngoId,
          organizationName: candidate.organizationName,
          portionsAllocated: alloc,
          estimatedDistanceKm: candidate.estimatedDistanceKm,
          estimatedTravelMinutes: candidate.estimatedTravelMinutes,
        });
        remainingToAllocate -= alloc;
      }
    }
  }

  return {
    donationId: donation._id,
    portionsTotal: donation.portionsAvailable,
    portionsRemaining: donation.portionsRemaining,
    eligibleCount: eligibleCandidates.length,
    recommendations: eligibleCandidates,
    excludedCandidates,
    multiNgoSplitPlan: multiNgoSplitPlan.length > 1 ? multiNgoSplitPlan : null,
    evaluatedAt: new Date(),
  };
};
