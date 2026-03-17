import { Router } from 'express';
import { listReminders, sendReminder } from '../controllers/reminderController.js';
import { requireAuth } from '../middleware/authMiddleware.js';
import { asyncHandler } from '../utils/asyncHandler.js';

const router = Router();

router.use(requireAuth);
router.get('/', asyncHandler(listReminders));
router.post('/send', asyncHandler(sendReminder));

export default router;
