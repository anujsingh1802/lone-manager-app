import { Router } from 'express';
import {
  createCustomer,
  deleteCustomer,
  getCustomer,
  getCustomerProfile,
  listCustomers,
  updateCustomer,
} from '../controllers/customerController.js';
import { requireAuth } from '../middleware/authMiddleware.js';
import { upload } from '../middleware/uploadMiddleware.js';
import { asyncHandler } from '../utils/asyncHandler.js';

const router = Router();

router.use(requireAuth);
router.get('/', asyncHandler(listCustomers));
router.post('/', upload.array('documents', 5), asyncHandler(createCustomer));
router.get('/:id/profile', asyncHandler(getCustomerProfile));
router.get('/:id', asyncHandler(getCustomer));
router.put('/:id', upload.array('documents', 5), asyncHandler(updateCustomer));
router.delete('/:id', asyncHandler(deleteCustomer));

export default router;
