import { Router } from 'express';
import { listReminders, sendReminder } from '../controllers/reminderController.js';
import { requireAuth } from '../middleware/authMiddleware.js';

const router = Router();

router.use(requireAuth);
router.get('/', listReminders);
router.post('/send', sendReminder);

export default router;
