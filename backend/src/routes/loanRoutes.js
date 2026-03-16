import { Router } from 'express';
import { createLoan, getLoan, listLoans, updateLoanSignature } from '../controllers/loanController.js';
import { requireAuth } from '../middleware/authMiddleware.js';
import { upload } from '../middleware/uploadMiddleware.js';

const router = Router();

router.use(requireAuth);
router.get('/', listLoans);
router.post(
  '/',
  upload.any(),
  createLoan
);
router.get('/:id', getLoan);
router.post('/:id/signature', updateLoanSignature);

export default router;
