import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { User } from '../models/User.js';
import { DonorProfile } from '../models/DonorProfile.js';
import { NGOProfile } from '../models/NGOProfile.js';
import { VolunteerProfile } from '../models/VolunteerProfile.js';

const signToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'foodbridge_super_secret_jwt_key_2025_impact', {
    expiresIn: process.env.JWT_EXPIRES_IN || '1h',
  });
};

export const register = async (req, res) => {
  try {
    const { name, email, password, role, phone, organizationName, organizationType, address, location } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide name, email, and password.' });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ success: false, message: 'An account with this email already exists.' });
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    const validRole = ['DONOR', 'NGO', 'VOLUNTEER'].includes(role) ? role : 'DONOR';

    const user = await User.create({
      name,
      email,
      passwordHash,
      role: validRole,
      phone: phone || '',
    });

    // Create role-specific profiles
    if (validRole === 'DONOR') {
      await DonorProfile.create({
        userId: user._id,
        organizationName: organizationName || `${name}'s Kitchen`,
        organizationType: organizationType || 'COLLEGE_CANTEEN',
        pickupLocation: {
          type: 'Point',
          coordinates: location?.coordinates || [77.5946, 12.9716],
        },
        address: address || { city: 'Bengaluru' },
      });
    } else if (validRole === 'NGO') {
      await NGOProfile.create({
        userId: user._id,
        organizationName: organizationName || `${name} Foundation`,
        verificationStatus: 'PENDING',
        mealDemand: 100,
        collectionCapacity: 150,
        location: {
          type: 'Point',
          coordinates: location?.coordinates || [77.6000, 12.9800],
        },
        address: address || { city: 'Bengaluru' },
      });
    } else if (validRole === 'VOLUNTEER') {
      await VolunteerProfile.create({
        userId: user._id,
        availability: { isAvailable: true, shift: 'FLEXIBLE' },
        currentLocation: {
          type: 'Point',
          coordinates: location?.coordinates || [77.5946, 12.9716],
        }
      });
    }

    const token = signToken(user._id);

    return res.status(201).json({
      success: true,
      token,
      user,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide email and password.' });
    }

    const user = await User.findOne({ email }).select('+passwordHash');
    if (!user || !user.isActive) {
      return res.status(401).json({ success: false, message: 'Invalid email or password.' });
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid email or password.' });
    }

    const token = signToken(user._id);

    // Fetch corresponding profile
    let profile = null;
    if (user.role === 'DONOR') profile = await DonorProfile.findOne({ userId: user._id });
    if (user.role === 'NGO') profile = await NGOProfile.findOne({ userId: user._id });
    if (user.role === 'VOLUNTEER') profile = await VolunteerProfile.findOne({ userId: user._id });

    return res.status(200).json({
      success: true,
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
      },
      profile,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const getMe = async (req, res) => {
  try {
    const user = req.user;
    let profile = null;
    if (user.role === 'DONOR') profile = await DonorProfile.findOne({ userId: user._id });
    if (user.role === 'NGO') profile = await NGOProfile.findOne({ userId: user._id });
    if (user.role === 'VOLUNTEER') profile = await VolunteerProfile.findOne({ userId: user._id });

    return res.status(200).json({
      success: true,
      user,
      profile,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
