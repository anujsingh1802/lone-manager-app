import { Router } from 'express';
import { getProfile, loginOwner } from '../controllers/authController.js';
import { requireAuth } from '../middleware/authMiddleware.js';

const router = Router();

router.post('/login', loginOwner);
router.get('/me', requireAuth, getProfile);

export default router;
