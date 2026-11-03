import mongoose from 'mongoose';

export const RESCUE_STATUS = {
  ASSIGNED: 'ASSIGNED',
  PICKUP_CONFIRMED: 'PICKUP_CONFIRMED',
  PICKED_UP: 'PICKED_UP',
  IN_TRANSIT: 'IN_TRANSIT',
  DELIVERED: 'DELIVERED',
  FAILED: 'FAILED',
  CANCELLED: 'CANCELLED',
};

const rescueSchema = new mongoose.Schema({
  donationId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Donation',
    required: true,
  },
  matchId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Match',
    required: true,
  },
  donorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  ngoId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  volunteerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null,
  },
  portionsAllocated: {
    type: Number,
    required: true,
  },
  portionsCollected: {
    type: Number,
    default: 0,
  },
  portionsDelivered: {
    type: Number,
    default: 0,
  },
  pickupTime: {
    type: Date,
    default: null,
  },
  deliveryTime: {
    type: Date,
    default: null,
  },
  routeDistanceKm: {
    type: Number,
    default: 0,
  },
  status: {
    type: String,
    enum: Object.values(RESCUE_STATUS),
    default: RESCUE_STATUS.ASSIGNED,
  },
  handoverNotes: {
    type: String,
    default: '',
  },
  deliveryProofNotes: {
    type: String,
    default: '',
  },
  failureReason: {
    type: String,
    default: '',
  }
}, {
  timestamps: true,
});

rescueSchema.index({ donationId: 1, ngoId: 1 });
rescueSchema.index({ status: 1 });

export const Rescue = mongoose.model('Rescue', rescueSchema);
