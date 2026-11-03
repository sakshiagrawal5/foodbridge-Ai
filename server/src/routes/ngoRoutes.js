import express from 'express';
import {
  getNgoProfile,
  updateNgoProfile,
  updateDemandAndCapacity,
  getNearbyDonations,
  getNgoMatches,
} from '../controllers/ngoController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/profile', protect, getNgoProfile);
router.patch('/profile', protect, authorize('NGO', 'ADMIN'), updateNgoProfile);
router.patch('/demand', protect, authorize('NGO', 'ADMIN'), updateDemandAndCapacity);
router.get('/nearby', protect, getNearbyDonations);
router.get('/matches', protect, authorize('NGO', 'ADMIN'), getNgoMatches);

export default router;
