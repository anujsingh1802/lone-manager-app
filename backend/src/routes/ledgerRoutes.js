import { Router } from 'express';
import { createLedgerEntry, listLedgerEntries } from '../controllers/ledgerController.js';
import { requireAuth } from '../middleware/authMiddleware.js';

const router = Router();

router.use(requireAuth);
router.get('/', listLedgerEntries);
router.post('/', createLedgerEntry);

export default router;
