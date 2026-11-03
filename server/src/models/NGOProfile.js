import mongoose from 'mongoose';

const ngoProfileSchema = new mongoose.Schema({
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
  registrationNumber: {
    type: String,
    default: '',
  },
  verificationStatus: {
    type: String,
    enum: ['PENDING', 'VERIFIED', 'REJECTED', 'SUSPENDED'],
    default: 'PENDING',
  },
  verificationNotes: {
    type: String,
    default: '',
  },
  serviceRadiusKm: {
    type: Number,
    default: 15, // km
  },
  mealDemand: {
    type: Number,
    required: true,
    default: 100, // portions desired today
  },
  collectionCapacity: {
    type: Number,
    required: true,
    default: 150, // maximum portions staff/transport can handle at once
  },
  acceptedFoodCategories: {
    type: [String],
    enum: ['COOKED_MEALS', 'PACKAGED_FOOD', 'BAKERY_ITEMS', 'FRUITS_VEGETABLES', 'OTHER_ELIGIBLE'],
    default: ['COOKED_MEALS', 'PACKAGED_FOOD', 'BAKERY_ITEMS'],
  },
  location: {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point',
    },
    coordinates: {
      type: [Number], // [longitude, latitude]
      required: true,
      default: [77.5946, 12.9716],
    }
  },
  address: {
    street: String,
    city: String,
    state: String,
    zipCode: String,
  },
  operatingHours: {
    open: { type: String, default: '09:00' },
    close: { type: String, default: '21:00' },
  },
  transportCapabilities: {
    hasVehicle: { type: Boolean, default: true },
    vehicleType: { type: String, enum: ['NONE', 'BIKE', 'AUTO_VAN', 'REFRIGERATED_VAN', 'CAR'], default: 'AUTO_VAN' },
    maxLoadKg: { type: Number, default: 100 },
  },
  foodHandlingCapabilities: {
    hasColdStorage: { type: Boolean, default: true },
    hasInsulatedBoxes: { type: Boolean, default: true },
    foodSafetyCertified: { type: Boolean, default: true },
  },
  contactDetails: {
    phone: String,
    emergencyPhone: String,
    email: String,
  }
}, {
  timestamps: true,
});

ngoProfileSchema.index({ location: '2dsphere' });

export const NGOProfile = mongoose.model('NGOProfile', ngoProfileSchema);
