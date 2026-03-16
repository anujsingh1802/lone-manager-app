import { Router } from 'express';
import { createPayment, listPayments } from '../controllers/paymentController.js';
import { requireAuth } from '../middleware/authMiddleware.js';

const router = Router();

router.use(requireAuth);
router.get('/', listPayments);
router.post('/', createPayment);

export default router;
