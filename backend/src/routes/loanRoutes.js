import { Router } from 'express';
import { createLoan, getLoan, listLoans, updateLoanSignature } from '../controllers/loanController.js';
import { requireAuth } from '../middleware/authMiddleware.js';
import { upload } from '../middleware/uploadMiddleware.js';
import { asyncHandler } from '../utils/asyncHandler.js';

const router = Router();

router.use(requireAuth);
router.get('/', asyncHandler(listLoans));
router.post(
  '/',
  upload.any(),
  asyncHandler(createLoan)
);
router.get('/:id', asyncHandler(getLoan));
router.post('/:id/signature', asyncHandler(updateLoanSignature));

export default router;
