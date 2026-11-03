import { NGOProfile } from '../models/NGOProfile.js';
import { Donation } from '../models/Donation.js';
import { Match, MATCH_STATUS } from '../models/Match.js';
import { calculateHaversineDistance } from '../services/routeService.js';

export const getNgoProfile = async (req, res) => {
  try {
    const profile = await NGOProfile.findOne({ userId: req.user._id }).populate('userId', 'name email phone');
    if (!profile) {
      return res.status(404).json({ success: false, message: 'NGO Profile not found.' });
    }
    return res.status(200).json({ success: true, data: profile });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const updateNgoProfile = async (req, res) => {
  try {
    const profile = await NGOProfile.findOneAndUpdate(
      { userId: req.user._id },
      { $set: req.body },
      { new: true, runValidators: true }
    );
    return res.status(200).json({ success: true, data: profile });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const updateDemandAndCapacity = async (req, res) => {
  try {
    const { mealDemand, collectionCapacity } = req.body;
    const update = {};
    if (mealDemand !== undefined) update.mealDemand = Number(mealDemand);
    if (collectionCapacity !== undefined) update.collectionCapacity = Number(collectionCapacity);

    const profile = await NGOProfile.findOneAndUpdate(
      { userId: req.user._id },
      { $set: update },
      { new: true }
    );
    return res.status(200).json({ success: true, message: 'Demand & capacity updated.', data: profile });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const getNearbyDonations = async (req, res) => {
  try {
    const profile = await NGOProfile.findOne({ userId: req.user._id });
    if (!profile) {
      return res.status(404).json({ success: false, message: 'NGO Profile not found.' });
    }

    const availableDonations = await Donation.find({
      status: { $in: ['AVAILABLE', 'MATCHED'] },
      portionsRemaining: { $gt: 0 },
      collectionDeadline: { $gt: new Date() },
    }).populate('donorId', 'name email phone');

    // Annotate with distance to this NGO
    const results = availableDonations.map((d) => {
      const distance = calculateHaversineDistance(profile.location.coordinates, d.pickupLocation.coordinates);
      return {
        ...d.toObject(),
        distanceKm: distance,
        withinServiceRadius: distance <= (profile.serviceRadiusKm || 15),
      };
    });

    results.sort((a, b) => a.distanceKm - b.distanceKm);

    return res.status(200).json({ success: true, count: results.length, data: results });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const getNgoMatches = async (req, res) => {
  try {
    const matches = await Match.find({ ngoId: req.user._id })
      .populate({
        path: 'donationId',
        populate: { path: 'donorId', select: 'name email phone' },
      })
      .sort({ createdAt: -1 });

    return res.status(200).json({ success: true, count: matches.length, data: matches });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
