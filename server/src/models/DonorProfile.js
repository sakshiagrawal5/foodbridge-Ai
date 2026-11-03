import mongoose from 'mongoose';

const donorProfileSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true,
  },
  organizationName: {
    type: String,
    required: true,
    trim: true,
  },
  organizationType: {
    type: String,
    enum: ['COLLEGE_CANTEEN', 'RESTAURANT', 'HOSTEL', 'CATERER', 'EVENT_ORGANIZER', 'OTHER'],
    default: 'COLLEGE_CANTEEN',
  },
  address: {
    street: String,
    city: String,
    state: String,
    zipCode: String,
  },
  pickupLocation: {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point',
    },
    coordinates: {
      type: [Number], // [longitude, latitude]
      required: true,
      default: [77.5946, 12.9716], // Default Bengaluru
    }
  },
  operatingHours: {
    open: { type: String, default: '08:00' },
    close: { type: String, default: '22:00' },
  },
  contactPerson: {
    name: String,
    phone: String,
  }
}, {
  timestamps: true,
});

donorProfileSchema.index({ pickupLocation: '2dsphere' });

export const DonorProfile = mongoose.model('DonorProfile', donorProfileSchema);
