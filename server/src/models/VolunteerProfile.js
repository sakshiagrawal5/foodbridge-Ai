import mongoose from 'mongoose';

const volunteerProfileSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true,
  },
  availability: {
    isAvailable: { type: Boolean, default: true },
    shift: { type: String, enum: ['MORNING', 'AFTERNOON', 'EVENING', 'FLEXIBLE'], default: 'FLEXIBLE' },
  },
  transportType: {
    type: String,
    enum: ['TWO_WHEELER', 'FOUR_WHEELER', 'BICYCLE', 'PUBLIC_TRANSIT', 'WALKING'],
    default: 'TWO_WHEELER',
  },
  maxPortionsCanCarry: {
    type: Number,
    default: 50,
  },
  currentLocation: {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point',
    },
    coordinates: {
      type: [Number],
      default: [77.5946, 12.9716],
    }
  },
  completedRescuesCount: {
    type: Number,
    default: 0,
  }
}, {
  timestamps: true,
});

volunteerProfileSchema.index({ currentLocation: '2dsphere' });

export const VolunteerProfile = mongoose.model('VolunteerProfile', volunteerProfileSchema);
