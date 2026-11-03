import { User } from '../models/User.js';
import { NGOProfile } from '../models/NGOProfile.js';
import { Donation } from '../models/Donation.js';
import { Rescue } from '../models/Rescue.js';
import { AuditLog } from '../models/AuditLog.js';

export const getAdminOverview = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const pendingVerifications = await NGOProfile.countDocuments({ verificationStatus: 'PENDING' });
    const availableDonations = await Donation.countDocuments({ status: 'AVAILABLE' });
    const activeRescues = await Rescue.countDocuments({ status: { $in: ['ASSIGNED', 'PICKUP_CONFIRMED', 'PICKED_UP', 'IN_TRANSIT'] } });
    const completedRescues = await Rescue.countDocuments({ status: 'DELIVERED' });
    const failedPickups = await Rescue.countDocuments({ status: 'FAILED' });

    return res.status(200).json({
      success: true,
      data: {
        totalUsers,
        pendingVerifications,
        availableDonations,
        activeRescues,
        completedRescues,
        failedPickups,
      }
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const getPendingVerifications = async (req, res) => {
  try {
    const ngos = await NGOProfile.find().populate('userId', 'name email phone isActive');
    return res.status(200).json({ success: true, count: ngos.length, data: ngos });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const verifyNgo = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, notes } = req.body;

    if (!['VERIFIED', 'REJECTED', 'SUSPENDED'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid verification status.' });
    }

    const ngo = await NGOProfile.findById(id);
    if (!ngo) {
      return res.status(404).json({ success: false, message: 'NGO Profile not found.' });
    }

    const previousStatus = ngo.verificationStatus;
    ngo.verificationStatus = status;
    ngo.verificationNotes = notes || '';
    await ngo.save();

    await AuditLog.create({
      actorId: req.user._id,
      actorRole: 'ADMIN',
      action: `NGO_VERIFICATION_${status}`,
      entityType: 'NGO_VERIFICATION',
      entityId: ngo._id,
      previousState: previousStatus,
      newState: status,
      reason: notes || `Admin updated verification status to ${status}.`,
    });

    return res.status(200).json({ success: true, message: `NGO status updated to ${status}.`, data: ngo });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select('-passwordHash').sort({ createdAt: -1 });
    return res.status(200).json({ success: true, count: users.length, data: users });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const getAuditLogs = async (req, res) => {
  try {
    const logs = await AuditLog.find().populate('actorId', 'name email role').sort({ timestamp: -1 }).limit(100);
    return res.status(200).json({ success: true, count: logs.length, data: logs });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const createNgo = async (req, res) => {
  try {
    const {
      organizationName,
      contactName,
      email,
      phone,
      password,
      registrationNumber,
      collectionCapacity,
      mealDemand,
      serviceRadiusKm,
      address,
      city,
      verificationStatus,
    } = req.body;

    if (!organizationName || !email) {
      return res.status(400).json({ success: false, message: 'Organization name and email are required.' });
    }

    const existingUser = await User.findOne({ email: email.toLowerCase().trim() });
    if (existingUser) {
      return res.status(400).json({ success: false, message: 'A user with this email already exists.' });
    }

    const bcrypt = await import('bcryptjs');
    const salt = await bcrypt.default.genSalt(10);
    const passwordHash = await bcrypt.default.hash(password || 'NgoPass123!', salt);

    const newUser = await User.create({
      name: contactName || organizationName,
      email: email.toLowerCase().trim(),
      passwordHash,
      role: 'NGO',
      phone: phone || '',
      isActive: true,
    });

    const newNgo = await NGOProfile.create({
      userId: newUser._id,
      organizationName,
      registrationNumber: registrationNumber || `NGO-REG-${Date.now().toString().slice(-6)}`,
      collectionCapacity: Number(collectionCapacity) || 150,
      mealDemand: Number(mealDemand) || 100,
      serviceRadiusKm: Number(serviceRadiusKm) || 15,
      verificationStatus: verificationStatus || 'VERIFIED',
      address: {
        street: address || 'Main Road',
        city: city || 'Kanpur',
      },
      contactDetails: {
        email: email.toLowerCase().trim(),
        phone: phone || '',
      },
      transportCapabilities: {
        hasVehicle: true,
        vehicleType: 'AUTO_VAN',
        maxLoadKg: 100,
      },
      foodHandlingCapabilities: {
        hasColdStorage: true,
        hasInsulatedBoxes: true,
        foodSafetyCertified: true,
      },
    });

    await AuditLog.create({
      actorId: req.user._id,
      actorRole: 'ADMIN',
      action: 'ADMIN_CREATE_NGO',
      entityType: 'NGO_PROFILE',
      entityId: newNgo._id,
      newState: newNgo.verificationStatus,
      reason: `Admin directly registered NGO: ${organizationName}`,
    });

    return res.status(201).json({
      success: true,
      message: 'NGO created and added to platform successfully!',
      data: newNgo,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
