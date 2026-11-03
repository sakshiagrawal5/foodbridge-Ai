import express from 'express';
import { getImpactAnalytics } from '../controllers/analyticsController.js';

const router = express.Router();

router.get('/impact', getImpactAnalytics);

export default router;
