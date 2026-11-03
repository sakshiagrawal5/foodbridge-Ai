import express from 'express';
import {
  getRescues,
  getRescueById,
  updateRescueStatus,
  assignVolunteer,
} from '../controllers/rescueController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/', protect, getRescues);
router.get('/:id', protect, getRescueById);
router.patch('/:id/status', protect, updateRescueStatus);
router.post('/:id/assign-volunteer', protect, assignVolunteer);

export default router;
