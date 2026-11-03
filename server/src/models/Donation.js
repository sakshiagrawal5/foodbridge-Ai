import mongoose from 'mongoose';

export const DONATION_STATUS = {
  DRAFT: 'DRAFT',
  AVAILABLE: 'AVAILABLE',
  MATCHED: 'MATCHED',
  ASSIGNED: 'ASSIGNED',
  PICKED_UP: 'PICKED_UP',
  DELIVERED: 'DELIVERED',
  EXPIRED: 'EXPIRED',
  CANCELLED: 'CANCELLED',
  FAILED: 'FAILED',
};

const donationSchema = new mongoose.Schema({
  donorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  donorProfileId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'DonorProfile',
  },
  title: {
    type: String,
    required: [true, 'Please specify food title'],
    trim: true,
  },
  foodCategory: {
    type: String,
    enum: ['COOKED_MEALS', 'PACKAGED_FOOD', 'BAKERY_ITEMS', 'FRUITS_VEGETABLES', 'OTHER_ELIGIBLE'],
    required: [true, 'Food category is mandatory'],
  },
  description: {
    type: String,
    trim: true,
    default: '',
  },
  portionsAvailable: {
    type: Number,
    required: [true, 'Portions available is required'],
    min: [1, 'Must have at least 1 portion'],
  },
  portionsRemaining: {
    type: Number,
    required: true,
    min: 0,
  },
  preparedAt: {
    type: Date,
    required: [true, 'Preparation timestamp is required for food safety audit'],
  },
  collectionDeadline: {
    type: Date,
    required: [true, 'Collection deadline is required'],
  },
  storageConditions: {
    type: String,
    enum: ['ROOM_TEMPERATURE', 'REFRIGERATED', 'HEATED_WARMER', 'DEEP_FROZEN'],
    default: 'ROOM_TEMPERATURE',
  },
  foodTemperatureCelsius: {
    type: Number,
    default: 25,
  },
  allergens: {
    type: [String],
    default: [],
  },
  packagingType: {
    type: String,
    enum: ['STAINLESS_STEEL_VESSELS', 'DISPOSABLE_BOXES', 'CARTONS', 'SEALED_CONTAINERS', 'BAGS'],
    default: 'SEALED_CONTAINERS',
  },
  pickupAddress: {
    street: String,
    city: String,
    state: String,
    zipCode: String,
    formatted: String,
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
    }
  },
  donorContact: {
    name: String,
    phone: String,
  },
  safetyDeclarations: {
    hygienicallyPrepared: { type: Boolean, required: true, default: true },
    storedProperly: { type: Boolean, required: true, default: true },
    noExpiredIngredients: { type: Boolean, required: true, default: true },
  },
  safetyStatus: {
    type: String,
    enum: ['ELIGIBLE', 'INSPECTION_REQUIRED', 'EXPIRED_SAFETY_RISK'],
    default: 'ELIGIBLE',
  },
  status: {
    type: String,
    enum: Object.values(DONATION_STATUS),
    default: DONATION_STATUS.AVAILABLE,
  },
  matchesCount: {
    type: Number,
    default: 0,
  }
}, {
  timestamps: true,
});

donationSchema.index({ pickupLocation: '2dsphere' });
donationSchema.index({ status: 1, collectionDeadline: 1 });

export const Donation = mongoose.model('Donation', donationSchema);
