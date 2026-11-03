import { Rescue } from '../models/Rescue.js';
import { transitionRescueStatus } from '../services/rescueService.js';

export const getRescues = async (req, res) => {
  try {
    const { status, donationId } = req.query;
    const filter = {};
    if (status) filter.status = status;
    if (donationId) filter.donationId = donationId;

    if (req.user.role === 'DONOR') {
      filter.donorId = req.user._id;
    } else if (req.user.role === 'NGO') {
      filter.ngoId = req.user._id;
    } else if (req.user.role === 'VOLUNTEER') {
      filter.volunteerId = req.user._id;
    }

    const rescues = await Rescue.find(filter)
      .populate('donationId')
      .populate('donorId', 'name email phone')
      .populate('ngoId', 'name email phone')
      .populate('volunteerId', 'name email phone')
      .populate('matchId')
      .sort({ updatedAt: -1 });

    return res.status(200).json({ success: true, count: rescues.length, data: rescues });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const getRescueById = async (req, res) => {
  try {
    const rescue = await Rescue.findById(req.params.id)
      .populate('donationId')
      .populate('donorId', 'name email phone')
      .populate('ngoId', 'name email phone')
      .populate('volunteerId', 'name email phone')
      .populate('matchId');

    if (!rescue) {
      return res.status(404).json({ success: false, message: 'Rescue mission not found.' });
    }

    return res.status(200).json({ success: true, data: rescue });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const updateRescueStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, portionsCollected, portionsDelivered, notes, reason } = req.body;

    if (!status) {
      return res.status(400).json({ success: false, message: 'Target status is required.' });
    }

    const updatedRescue = await transitionRescueStatus(id, status, req.user, {
      portionsCollected,
      portionsDelivered,
      notes,
      reason,
    });

    return res.status(200).json({
      success: true,
      message: `Rescue status transitioned to ${status}.`,
      data: updatedRescue,
    });
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
};

export const assignVolunteer = async (req, res) => {
  try {
    const { id } = req.params;
    const { volunteerId } = req.body;

    const rescue = await Rescue.findById(id);
    if (!rescue) {
      return res.status(404).json({ success: false, message: 'Rescue not found.' });
    }

    rescue.volunteerId = volunteerId || req.user._id;
    await rescue.save();

    return res.status(200).json({
      success: true,
      message: 'Volunteer assigned successfully.',
      data: rescue,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
