import { Router } from 'express';
import { getProfile, loginOwner, registerOwner, verifyOTP } from '../controllers/authController.js';
import { requireAuth } from '../middleware/authMiddleware.js';
import { asyncHandler } from '../utils/asyncHandler.js';

const router = Router();

router.post('/login', asyncHandler(loginOwner));
router.post('/register', asyncHandler(registerOwner));
router.post('/verify-otp', asyncHandler(verifyOTP));
router.get('/me', requireAuth, asyncHandler(getProfile));

export default router;
