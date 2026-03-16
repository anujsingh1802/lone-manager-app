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

const router = Router();

router.use(requireAuth);
router.get('/', listCustomers);
router.post('/', upload.array('documents', 5), createCustomer);
router.get('/:id/profile', getCustomerProfile);
router.get('/:id', getCustomer);
router.put('/:id', upload.array('documents', 5), updateCustomer);
router.delete('/:id', deleteCustomer);

export default router;
