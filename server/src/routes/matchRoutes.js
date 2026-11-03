import express from 'express';
import {
  getMatchById,
  acceptMatchHandler,
  declineMatchHandler,
} from '../controllers/matchController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/:id', protect, getMatchById);
router.post('/:matchId/accept', protect, authorize('NGO', 'ADMIN'), acceptMatchHandler);
router.post('/:matchId/decline', protect, authorize('NGO', 'ADMIN'), declineMatchHandler);

export default router;
