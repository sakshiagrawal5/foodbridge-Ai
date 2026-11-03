import bcrypt from 'bcryptjs';
import { connectDB, closeDB } from '../src/config/db.js';
import { User } from '../src/models/User.js';
import { DonorProfile } from '../src/models/DonorProfile.js';
import { NGOProfile } from '../src/models/NGOProfile.js';
import { VolunteerProfile } from '../src/models/VolunteerProfile.js';
import { Donation, DONATION_STATUS } from '../src/models/Donation.js';
import { Rescue, RESCUE_STATUS } from '../src/models/Rescue.js';
import { ImpactRecord } from '../src/models/ImpactRecord.js';
import { Match, MATCH_STATUS } from '../src/models/Match.js';
import dotenv from 'dotenv';

dotenv.config();

export const seedDatabase = async () => {
  console.log('🌱 Starting database seeding with realistic demo records...');
  await connectDB();

  // Clear existing collections
  await Promise.all([
    User.deleteMany({}),
    DonorProfile.deleteMany({}),
    NGOProfile.deleteMany({}),
    VolunteerProfile.deleteMany({}),
    Donation.deleteMany({}),
    Rescue.deleteMany({}),
    ImpactRecord.deleteMany({}),
    Match.deleteMany({}),
  ]);

  const salt = await bcrypt.genSalt(10);
  const commonPasswordHash = await bcrypt.hash('password123', salt);

  // 1. Create College Canteen Donor (The Primary Demo Actor)
  const canteenUser = await User.create({
    name: 'NIT Canteen Services',
    email: 'canteen@college.edu',
    passwordHash: commonPasswordHash,
    role: 'DONOR',
    phone: '+91 98765 43210',
    isDemoAccount: true,
  });

  const canteenProfile = await DonorProfile.create({
    userId: canteenUser._id,
    organizationName: 'NIT Central Dining & Food Court',
    organizationType: 'COLLEGE_CANTEEN',
    pickupLocation: {
      type: 'Point',
      coordinates: [77.5946, 12.9716], // Bengaluru center
    },
    address: {
      street: 'Dining Hall Block A, Campus Road',
      city: 'Bengaluru',
      state: 'Karnataka',
      zipCode: '560001',
    },
    contactPerson: {
      name: 'Chef Ramesh Kumar',
      phone: '+91 98765 43210',
    }
  });

  // 2. Create 3 Distinct NGOs with varied capacity, demand, and locations
  // NGO 1: Annapurna Community Food Bank (VERIFIED, High Capacity, High Demand, ~4.2 km)
  const ngo1User = await User.create({
    name: 'Annapurna Food Bank',
    email: 'annapurna@ngo.org',
    passwordHash: commonPasswordHash,
    role: 'NGO',
    phone: '+91 98765 11111',
    isDemoAccount: true,
  });

  const ngo1Profile = await NGOProfile.create({
    userId: ngo1User._id,
    organizationName: 'Annapurna Community Food Bank',
    registrationNumber: 'NGO-KAR-2018-8821',
    verificationStatus: 'VERIFIED',
    serviceRadiusKm: 18,
    mealDemand: 120, // portions
    collectionCapacity: 200, // capacity
    acceptedFoodCategories: ['COOKED_MEALS', 'PACKAGED_FOOD', 'BAKERY_ITEMS'],
    location: {
      type: 'Point',
      coordinates: [77.6101, 12.9550], // ~3.5 km southeast
    },
    address: {
      street: '14th Cross, Shanti Nagar Community Hall',
      city: 'Bengaluru',
      state: 'Karnataka',
      zipCode: '560027',
    },
    foodHandlingCapabilities: {
      hasColdStorage: true,
      hasInsulatedBoxes: true,
      foodSafetyCertified: true,
    },
    transportCapabilities: {
      hasVehicle: true,
      vehicleType: 'AUTO_VAN',
      maxLoadKg: 200,
    }
  });

  // NGO 2: Hope Shelter & Child Welfare (VERIFIED, Medium Capacity 60 portions, ~6.8 km)
  const ngo2User = await User.create({
    name: 'Hope Children Home',
    email: 'hope@ngo.org',
    passwordHash: commonPasswordHash,
    role: 'NGO',
    phone: '+91 98765 22222',
    isDemoAccount: true,
  });

  const ngo2Profile = await NGOProfile.create({
    userId: ngo2User._id,
    organizationName: 'Hope Shelter & Child Welfare',
    registrationNumber: 'NGO-KAR-2021-3912',
    verificationStatus: 'VERIFIED',
    serviceRadiusKm: 12,
    mealDemand: 50,
    collectionCapacity: 60,
    acceptedFoodCategories: ['COOKED_MEALS', 'BAKERY_ITEMS', 'FRUITS_VEGETABLES'],
    location: {
      type: 'Point',
      coordinates: [77.5600, 12.9900], // ~5.5 km northwest
    },
    address: {
      street: '8th Main, Malleshwaram West',
      city: 'Bengaluru',
      state: 'Karnataka',
      zipCode: '560003',
    },
    foodHandlingCapabilities: {
      hasColdStorage: true,
      hasInsulatedBoxes: true,
      foodSafetyCertified: true,
    },
    transportCapabilities: {
      hasVehicle: true,
      vehicleType: 'CAR',
      maxLoadKg: 80,
    }
  });

  // NGO 3: Seva Care Center (PENDING verification - to showcase eligibility exclusion)
  const ngo3User = await User.create({
    name: 'Seva Care Center',
    email: 'seva@ngo.org',
    passwordHash: commonPasswordHash,
    role: 'NGO',
    phone: '+91 98765 33333',
    isDemoAccount: true,
  });

  const ngo3Profile = await NGOProfile.create({
    userId: ngo3User._id,
    organizationName: 'Seva Care Foundation',
    registrationNumber: 'NGO-APP-2025-0019',
    verificationStatus: 'PENDING',
    serviceRadiusKm: 10,
    mealDemand: 80,
    collectionCapacity: 80,
    acceptedFoodCategories: ['COOKED_MEALS'],
    location: {
      type: 'Point',
      coordinates: [77.6250, 12.9350], // Koramangala
    },
    address: {
      street: '5th Block, Koramangala',
      city: 'Bengaluru',
      state: 'Karnataka',
      zipCode: '560034',
    }
  });

  // 3. Create Volunteer
  const volunteerUser = await User.create({
    name: 'Arjun Das (Volunteer)',
    email: 'volunteer@foodbridge.org',
    passwordHash: commonPasswordHash,
    role: 'VOLUNTEER',
    phone: '+91 98765 77777',
    isDemoAccount: true,
  });

  await VolunteerProfile.create({
    userId: volunteerUser._id,
    availability: { isAvailable: true, shift: 'AFTERNOON' },
    transportType: 'TWO_WHEELER',
    maxPortionsCanCarry: 60,
    currentLocation: {
      type: 'Point',
      coordinates: [77.5900, 12.9650],
    },
    completedRescuesCount: 14,
  });

  // 4. Create Platform Administrator
  const adminUser = await User.create({
    name: 'Dr. Anita Roy (Chief Admin)',
    email: 'admin@foodbridge.org',
    passwordHash: commonPasswordHash,
    role: 'ADMIN',
    phone: '+91 98765 00000',
    isDemoAccount: true,
  });

  // 5. Create Primary Demo Donation: Exactly 100 Portions from College Canteen!
  const now = new Date();
  const demoDonation = await Donation.create({
    donorId: canteenUser._id,
    donorProfileId: canteenProfile._id,
    title: 'Surplus Lunch: Fresh Veg Biryani & Dal Makhani',
    foodCategory: 'COOKED_MEALS',
    description: 'Freshly prepared college lunch batch. Packed in clean insulated thermal food containers.',
    portionsAvailable: 100,
    portionsRemaining: 100,
    preparedAt: new Date(now.getTime() - 90 * 60 * 1000), // prepared 1.5 hours ago
    collectionDeadline: new Date(now.getTime() + 4 * 60 * 60 * 1000), // safe window next 4 hours
    storageConditions: 'ROOM_TEMPERATURE',
    foodTemperatureCelsius: 58,
    allergens: ['Dairy (Butter/Ghee)'],
    packagingType: 'SEALED_CONTAINERS',
    pickupAddress: {
      formatted: 'NIT Canteen Logistics Gate 2, Central Campus, Bengaluru',
      city: 'Bengaluru',
    },
    pickupLocation: {
      type: 'Point',
      coordinates: [77.5946, 12.9716],
    },
    donorContact: {
      name: 'Chef Ramesh Kumar',
      phone: '+91 98765 43210',
    },
    safetyDeclarations: {
      hygienicallyPrepared: true,
      storedProperly: true,
      noExpiredIngredients: true,
    },
    safetyStatus: 'ELIGIBLE',
    status: DONATION_STATUS.AVAILABLE,
  });

  // 6. Create Historical Completed Rescues to fuel realistic impact statistics
  const pastDonation1 = await Donation.create({
    donorId: canteenUser._id,
    donorProfileId: canteenProfile._id,
    title: 'Dinner Buffet Roti & Paneer Curry',
    foodCategory: 'COOKED_MEALS',
    description: 'Surplus hot meals from hostel dinner',
    portionsAvailable: 75,
    portionsRemaining: 0,
    preparedAt: new Date(now.getTime() - 26 * 60 * 60 * 1000),
    collectionDeadline: new Date(now.getTime() - 20 * 60 * 60 * 1000),
    storageConditions: 'ROOM_TEMPERATURE',
    pickupLocation: { type: 'Point', coordinates: [77.5946, 12.9716] },
    safetyDeclarations: { hygienicallyPrepared: true, storedProperly: true, noExpiredIngredients: true },
    status: DONATION_STATUS.DELIVERED,
  });

  const pastMatch1 = await Match.create({
    donationId: pastDonation1._id,
    ngoId: ngo1User._id,
    ngoProfileId: ngo1Profile._id,
    portionsAllocated: 75,
    priorityScore: 92.5,
    scoreBreakdown: { urgencyScore: 90, quantityFitScore: 95, travelEfficiencyScore: 88, demandFitScore: 100 },
    estimatedTravelMinutes: 14,
    estimatedDistanceKm: 4.2,
    routingType: 'ROAD_OSRM',
    recommendationExplanation: 'Immediate demand match for 75 portions with high delivery feasibility.',
    status: MATCH_STATUS.COMPLETED,
  });

  const pastRescue1 = await Rescue.create({
    donationId: pastDonation1._id,
    matchId: pastMatch1._id,
    donorId: canteenUser._id,
    ngoId: ngo1User._id,
    volunteerId: volunteerUser._id,
    portionsAllocated: 75,
    portionsCollected: 75,
    portionsDelivered: 75,
    pickupTime: new Date(now.getTime() - 24 * 60 * 60 * 1000),
    deliveryTime: new Date(now.getTime() - 23 * 60 * 60 * 1000),
    routeDistanceKm: 4.2,
    status: RESCUE_STATUS.DELIVERED,
    handoverNotes: 'Insulated containers collected in good condition.',
    deliveryProofNotes: 'Distributed to 75 residents at Shanti Nagar Community Shelter.',
  });

  await ImpactRecord.create({
    rescueId: pastRescue1._id,
    donationId: pastDonation1._id,
    donorId: canteenUser._id,
    ngoId: ngo1User._id,
    mealsDelivered: 75,
    estimatedFoodWasteAvoidedKg: 33.75, // 75 * 0.45
    co2EquivalentAvoidedKg: 84.38,
    conversionFactorKgPerMeal: 0.45,
    calculationMethod: '75 portions * 0.45 kg/portion standard baseline',
    recordedAt: new Date(now.getTime() - 23 * 60 * 60 * 1000),
  });

  console.log('✅ Seeding complete!');
  console.log('--------------------------------------------------');
  console.log('Demo Credentials (password for all: password123):');
  console.log('1. Donor (College Canteen): canteen@college.edu');
  console.log('2. Verified NGO (Annapurna): annapurna@ngo.org');
  console.log('3. Verified NGO (Hope Home): hope@ngo.org');
  console.log('4. Pending NGO (Seva):       seva@ngo.org');
  console.log('5. Volunteer:               volunteer@foodbridge.org');
  console.log('6. Administrator:           admin@foodbridge.org');
  console.log('--------------------------------------------------');
  console.log(`Primary Demo Donation Created: 100 portions (ID: ${demoDonation._id})`);
};

if (process.argv[1].endsWith('seed.js')) {
  seedDatabase()
    .then(() => {
      console.log('Database seed execution finished.');
      process.exit(0);
    })
    .catch((err) => {
      console.error('Seeding failed:', err);
      process.exit(1);
    });
}
