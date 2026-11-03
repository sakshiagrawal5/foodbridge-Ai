import mongoose from 'mongoose';

export const MATCH_STATUS = {
  PROPOSED: 'PROPOSED',
  ACCEPTED: 'ACCEPTED',
  DECLINED: 'DECLINED',
  EXPIRED: 'EXPIRED',
  CANCELLED: 'CANCELLED',
  COMPLETED: 'COMPLETED',
};

const matchSchema = new mongoose.Schema({
  donationId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Donation',
    required: true,
  },
  ngoId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  ngoProfileId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'NGOProfile',
    required: true,
  },
  portionsAllocated: {
    type: Number,
    required: true,
    min: 1,
  },
  priorityScore: {
    type: Number,
    required: true,
    min: 0,
    max: 100,
  },
  scoreBreakdown: {
    urgencyScore: { type: Number, default: 0 },
    quantityFitScore: { type: Number, default: 0 },
    travelEfficiencyScore: { type: Number, default: 0 },
    demandFitScore: { type: Number, default: 0 },
    weightsUsed: {
      urgency: Number,
      quantity: Number,
      travel: Number,
      demand: Number,
    }
  },
  estimatedTravelMinutes: {
    type: Number,
    required: true,
  },
  estimatedDistanceKm: {
    type: Number,
    required: true,
  },
  routingType: {
    type: String,
    enum: ['ROAD_OSRM', 'GEO_HAVERSINE_SIMULATED'],
    default: 'ROAD_OSRM',
  },
  routeGeometry: {
    type: Object, // GeoJSON or polyline coordinates
    default: null,
  },
  recommendationExplanation: {
    type: String,
    required: true,
  },
  declineReason: {
    type: String,
    default: '',
  },
  status: {
    type: String,
    enum: Object.values(MATCH_STATUS),
    default: MATCH_STATUS.PROPOSED,
  }
}, {
  timestamps: true,
});

matchSchema.index({ donationId: 1, ngoId: 1 });
matchSchema.index({ status: 1 });

export const Match = mongoose.model('Match', matchSchema);
