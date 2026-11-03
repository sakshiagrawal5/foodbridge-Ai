import express from 'express';
import { register, login, getMe } from '../controllers/authController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.get('/me', protect, getMe);

// Instant self-repair demo seed endpoint
router.post('/seed', async (req, res) => {
  try {
    const { seedDatabase } = await import('../../seed/seed.js');
    await seedDatabase();
    res.json({ success: true, message: 'Database successfully re-seeded!' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

export default router;
