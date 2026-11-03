import test from 'node:test';
import assert from 'node:assert/strict';
import {
  checkEligibility,
  calculateComponentScores,
  generateExplanation,
} from '../src/services/matchingService.js';
import { calculateHaversineDistance } from '../src/services/routeService.js';

test('Haversine distance calculation is accurate within geographic bounds', () => {
  // Bengaluru Center to Shanti Nagar (~3.5 - 4.5 km)
  const dist = calculateHaversineDistance([77.5946, 12.9716], [77.6101, 12.9550]);
  assert.ok(dist > 2.0 && dist < 6.0, `Expected distance between 2 and 6 km, got ${dist}`);
});

test('Eligibility check excludes unverified NGOs', () => {
  const donation = {
    foodCategory: 'COOKED_MEALS',
    collectionDeadline: new Date(Date.now() + 3 * 3600 * 1000),
    storageConditions: 'ROOM_TEMPERATURE',
  };

  const pendingNgo = {
    verificationStatus: 'PENDING',
    acceptedFoodCategories: ['COOKED_MEALS'],
    collectionCapacity: 100,
    serviceRadiusKm: 15,
  };

  const result = checkEligibility(donation, pendingNgo, 15, 4.0);
  assert.equal(result.isEligible, false);
  assert.ok(result.reasons.some(r => r.includes('PENDING')));
});

test('Eligibility check excludes NGOs when food category is not supported', () => {
  const donation = {
    foodCategory: 'COOKED_MEALS',
    collectionDeadline: new Date(Date.now() + 3 * 3600 * 1000),
    storageConditions: 'ROOM_TEMPERATURE',
  };

  const fruitNgo = {
    verificationStatus: 'VERIFIED',
    acceptedFoodCategories: ['FRUITS_VEGETABLES'],
    collectionCapacity: 100,
    serviceRadiusKm: 15,
  };

  const result = checkEligibility(donation, fruitNgo, 15, 4.0);
  assert.equal(result.isEligible, false);
  assert.ok(result.reasons.some(r => r.includes('category')));
});

test('Eligibility check fails if deadline is expired', () => {
  const expiredDonation = {
    foodCategory: 'COOKED_MEALS',
    collectionDeadline: new Date(Date.now() - 3600 * 1000), // expired 1 hour ago
    storageConditions: 'ROOM_TEMPERATURE',
  };

  const verifiedNgo = {
    verificationStatus: 'VERIFIED',
    acceptedFoodCategories: ['COOKED_MEALS'],
    collectionCapacity: 100,
    serviceRadiusKm: 15,
  };

  const result = checkEligibility(expiredDonation, verifiedNgo, 15, 4.0);
  assert.equal(result.isEligible, false);
  assert.ok(result.reasons.some(r => r.includes('expired')));
});

test('Component scoring correctly weights urgency, quantity, travel, and demand', () => {
  const donation = {
    collectionDeadline: new Date(Date.now() + 2 * 3600 * 1000), // 2 hours remaining
  };

  const ngo = {
    organizationName: 'Annapurna Food Bank',
    mealDemand: 100,
    collectionCapacity: 150,
  };

  const scores = calculateComponentScores(donation, ngo, 15, 100);

  assert.ok(scores.urgencyScore >= 80, 'Urgency score should be high for 2 hours remaining');
  assert.ok(scores.quantityFitScore >= 90, 'Quantity fit should be near 100 for exact portion match');
  assert.ok(scores.finalScore >= 70 && scores.finalScore <= 100, `Final score was ${scores.finalScore}`);
});
