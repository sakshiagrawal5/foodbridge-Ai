import { Donation, DONATION_STATUS } from '../models/Donation.js';
import { DonorProfile } from '../models/DonorProfile.js';
import { AuditLog } from '../models/AuditLog.js';
import { emitToRoom } from '../sockets/socketHandler.js';

export const getDonations = async (req, res) => {
  try {
    const { status, category, donorId } = req.query;
    const filter = {};

    if (status) filter.status = status;
    if (category) filter.foodCategory = category;
    if (donorId) filter.donorId = donorId;

    // If caller is DONOR and doesn't explicitly query someone else, default to their own
    if (req.user && req.user.role === 'DONOR' && !donorId) {
      filter.donorId = req.user._id;
    }

    const donations = await Donation.find(filter).sort({ createdAt: -1 }).populate('donorId', 'name email phone');
    return res.status(200).json({ success: true, count: donations.length, data: donations });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const getDonationById = async (req, res) => {
  try {
    const donation = await Donation.findById(req.params.id).populate('donorId', 'name email phone');
    if (!donation) {
      return res.status(404).json({ success: false, message: 'Donation listing not found.' });
    }
    return res.status(200).json({ success: true, data: donation });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const createDonation = async (req, res) => {
  try {
    const {
      title,
      foodCategory,
      description,
      portionsAvailable,
      preparedAt,
      collectionDeadline,
      storageConditions,
      foodTemperatureCelsius,
      allergens,
      packagingType,
      pickupAddress,
      pickupLocation,
      safetyDeclarations,
    } = req.body;

    if (!title || !foodCategory || !portionsAvailable || !preparedAt || !collectionDeadline) {
      return res.status(400).json({
        success: false,
        message: 'Missing required donation details (title, category, portions, preparedAt, collectionDeadline).',
      });
    }

    // Food safety validations
    const prepDate = new Date(preparedAt);
    const deadlineDate = new Date(collectionDeadline);
    const now = new Date();

    if (deadlineDate <= prepDate) {
      return res.status(400).json({
        success: false,
        message: 'Collection deadline must be strictly after the preparation time.',
      });
    }

    if (deadlineDate <= now) {
      return res.status(400).json({
        success: false,
        message: 'Collection deadline cannot be in the past.',
      });
    }

    // Retrieve donor profile for default coordinates if not provided
    const donorProfile = await DonorProfile.findOne({ userId: req.user._id });
    const coordinates = pickupLocation?.coordinates || donorProfile?.pickupLocation?.coordinates || [77.5946, 12.9716];

    const donation = await Donation.create({
      donorId: req.user._id,
      donorProfileId: donorProfile?._id,
      title,
      foodCategory,
      description: description || '',
      portionsAvailable: Number(portionsAvailable),
      portionsRemaining: Number(portionsAvailable),
      preparedAt: prepDate,
      collectionDeadline: deadlineDate,
      storageConditions: storageConditions || 'ROOM_TEMPERATURE',
      foodTemperatureCelsius: foodTemperatureCelsius || 25,
      allergens: allergens || [],
      packagingType: packagingType || 'SEALED_CONTAINERS',
      pickupAddress: pickupAddress || { formatted: 'College Canteen Pickup Bay, Campus Center' },
      pickupLocation: {
        type: 'Point',
        coordinates,
      },
      donorContact: {
        name: req.user.name,
        phone: req.user.phone,
      },
      safetyDeclarations: safetyDeclarations || {
        hygienicallyPrepared: true,
        storedProperly: true,
        noExpiredIngredients: true,
      },
      status: DONATION_STATUS.AVAILABLE,
    });

    await AuditLog.create({
      actorId: req.user._id,
      actorRole: req.user.role,
      action: 'CREATE_DONATION',
      entityType: 'DONATION',
      entityId: donation._id,
      newState: DONATION_STATUS.AVAILABLE,
      reason: 'Donor listed surplus food.',
    });

    emitToRoom('donations_feed', 'NEW_DONATION_LISTED', donation);

    return res.status(201).json({ success: true, data: donation });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const updateDonation = async (req, res) => {
  try {
    const donation = await Donation.findById(req.params.id);
    if (!donation) {
      return res.status(404).json({ success: false, message: 'Donation not found.' });
    }

    if (donation.donorId.toString() !== req.user._id.toString() && req.user.role !== 'ADMIN') {
      return res.status(403).json({ success: false, message: 'Unauthorized to modify this donation.' });
    }

    if (![DONATION_STATUS.DRAFT, DONATION_STATUS.AVAILABLE].includes(donation.status)) {
      return res.status(400).json({
        success: false,
        message: `Cannot edit donation in ${donation.status} status once matching/assignment has commenced.`,
      });
    }

    Object.assign(donation, req.body);
    await donation.save();

    return res.status(200).json({ success: true, data: donation });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const cancelDonation = async (req, res) => {
  try {
    const donation = await Donation.findById(req.params.id);
    if (!donation) {
      return res.status(404).json({ success: false, message: 'Donation not found.' });
    }

    if (donation.donorId.toString() !== req.user._id.toString() && req.user.role !== 'ADMIN') {
      return res.status(403).json({ success: false, message: 'Unauthorized to cancel this donation.' });
    }

    if ([DONATION_STATUS.PICKED_UP, DONATION_STATUS.DELIVERED].includes(donation.status)) {
      return res.status(400).json({
        success: false,
        message: `Cannot cancel donation in '${donation.status}' status.`,
      });
    }

    const previousState = donation.status;
    donation.status = DONATION_STATUS.CANCELLED;
    await donation.save();

    await AuditLog.create({
      actorId: req.user._id,
      actorRole: req.user.role,
      action: 'CANCEL_DONATION',
      entityType: 'DONATION',
      entityId: donation._id,
      previousState,
      newState: DONATION_STATUS.CANCELLED,
      reason: req.body.reason || 'Donor cancelled donation.',
    });

    emitToRoom(`donation_${donation._id}`, 'DONATION_CANCELLED', { donationId: donation._id });

    return res.status(200).json({ success: true, message: 'Donation cancelled successfully.', data: donation });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
