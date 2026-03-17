import { Router } from 'express';
import { createLedgerEntry, listLedgerEntries } from '../controllers/ledgerController.js';
import { requireAuth } from '../middleware/authMiddleware.js';
import { asyncHandler } from '../utils/asyncHandler.js';

const router = Router();

router.use(requireAuth);
router.get('/', asyncHandler(listLedgerEntries));
router.post('/', asyncHandler(createLedgerEntry));

export default router;
