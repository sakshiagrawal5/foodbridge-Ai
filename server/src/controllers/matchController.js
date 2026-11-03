import { Donation } from '../models/Donation.js';
import { Match, MATCH_STATUS } from '../models/Match.js';
import { findMatchesForDonation } from '../services/matchingService.js';
import { acceptMatch } from '../services/rescueService.js';
import { emitToRoom } from '../sockets/socketHandler.js';

export const runMatchForDonation = async (req, res) => {
  try {
    const donation = await Donation.findById(req.params.id);
    if (!donation) {
      return res.status(404).json({ success: false, message: 'Donation not found.' });
    }

    if (donation.status === 'EXPIRED' || donation.status === 'CANCELLED') {
      return res.status(400).json({ success: false, message: `Cannot match donation in ${donation.status} status.` });
    }

    const matchResults = await findMatchesForDonation(donation);

    // Save proposed matches to DB for persistence
    const savedMatches = [];
    for (const rec of matchResults.recommendations) {
      // Upsert proposed match
      const matchDoc = await Match.findOneAndUpdate(
        { donationId: donation._id, ngoId: rec.ngoId },
        {
          donationId: donation._id,
          ngoId: rec.ngoId,
          ngoProfileId: rec.ngoProfileId,
          portionsAllocated: rec.portionsAllocated,
          priorityScore: rec.priorityScore,
          scoreBreakdown: rec.scoreBreakdown,
          estimatedTravelMinutes: rec.estimatedTravelMinutes,
          estimatedDistanceKm: rec.estimatedDistanceKm,
          routingType: rec.routingType,
          routeGeometry: rec.routeGeometry,
          recommendationExplanation: rec.recommendationExplanation,
          status: MATCH_STATUS.PROPOSED,
        },
        { upsert: true, new: true }
      );
      savedMatches.push({ ...rec, matchId: matchDoc._id });
    }

    donation.matchesCount = matchResults.recommendations.length;
    await donation.save();

    emitToRoom(`donation_${donation._id}`, 'MATCHES_GENERATED', {
      donationId: donation._id,
      count: savedMatches.length,
    });

    return res.status(200).json({
      success: true,
      donationId: donation._id,
      evaluatedAt: matchResults.evaluatedAt,
      eligibleCount: matchResults.eligibleCount,
      recommendations: savedMatches,
      excludedCandidates: matchResults.excludedCandidates,
      multiNgoSplitPlan: matchResults.multiNgoSplitPlan,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const getMatchById = async (req, res) => {
  try {
    const match = await Match.findById(req.params.id)
      .populate('donationId')
      .populate('ngoId', 'name email phone')
      .populate('ngoProfileId');
    if (!match) {
      return res.status(404).json({ success: false, message: 'Match record not found.' });
    }
    return res.status(200).json({ success: true, data: match });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const acceptMatchHandler = async (req, res) => {
  try {
    const { matchId } = req.params;
    const result = await acceptMatch(matchId, req.user._id);
    return res.status(200).json({
      success: true,
      message: 'Match successfully accepted! Rescue assignment created.',
      data: result,
    });
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
};

export const declineMatchHandler = async (req, res) => {
  try {
    const { matchId } = req.params;
    const { reason } = req.body;

    const match = await Match.findById(matchId);
    if (!match) {
      return res.status(404).json({ success: false, message: 'Match recommendation not found.' });
    }

    if (match.ngoId.toString() !== req.user._id.toString() && req.user.role !== 'ADMIN') {
      return res.status(403).json({ success: false, message: 'Unauthorized to decline this match.' });
    }

    match.status = MATCH_STATUS.DECLINED;
    match.declineReason = reason || 'Recipient NGO declined without specific reason.';
    await match.save();

    return res.status(200).json({
      success: true,
      message: 'Match declined.',
      data: match,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
