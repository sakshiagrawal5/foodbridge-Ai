import express from 'express';
import {
  getDonations,
  getDonationById,
  createDonation,
  updateDonation,
  cancelDonation,
} from '../controllers/donationController.js';
import { runMatchForDonation } from '../controllers/matchController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/')
  .get(getDonations)
  .post(protect, authorize('DONOR', 'ADMIN'), createDonation);

router.route('/:id')
  .get(getDonationById)
  .patch(protect, updateDonation)
  .delete(protect, cancelDonation);

router.post('/:id/match', protect, runMatchForDonation);

export default router;
