import mongoose from 'mongoose';

const impactRecordSchema = new mongoose.Schema({
  rescueId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Rescue',
    required: true,
    unique: true,
  },
  donationId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Donation',
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
  mealsDelivered: {
    type: Number,
    required: true,
    min: 0,
  },
  estimatedFoodWasteAvoidedKg: {
    type: Number,
    required: true,
    min: 0,
  },
  conversionFactorKgPerMeal: {
    type: Number,
    default: 0.45, // 450 grams average meal weight
  },
  calculationMethod: {
    type: String,
    default: 'portions_delivered * 0.45 kg/portion (UNEP/FAO standards baseline)',
  },
  co2EquivalentAvoidedKg: {
    type: Number,
    default: 0, // approx 2.5 kg CO2e avoided per kg food rescued
  },
  recordedAt: {
    type: Date,
    default: Date.now,
  }
}, {
  timestamps: true,
});

impactRecordSchema.index({ recordedAt: -1 });

export const ImpactRecord = mongoose.model('ImpactRecord', impactRecordSchema);
