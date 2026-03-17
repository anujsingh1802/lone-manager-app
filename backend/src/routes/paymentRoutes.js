import { Router } from 'express';
import { createPayment, listPayments } from '../controllers/paymentController.js';
import { requireAuth } from '../middleware/authMiddleware.js';
import { asyncHandler } from '../utils/asyncHandler.js';

const router = Router();

router.use(requireAuth);
router.get('/', asyncHandler(listPayments));
router.post('/', asyncHandler(createPayment));

export default router;
