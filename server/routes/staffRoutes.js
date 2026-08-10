import express from 'express';
import {
  getStaff,
  getStaffById,
  getStaffAvailableSlots,
  createStaff,
  updateStaff,
  deleteStaff,
} from '../controllers/staffController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/', getStaff);
router.get('/:id', getStaffById);
router.get('/:id/slots', getStaffAvailableSlots);

// Admin staff management routes
router.post('/', protect, authorize('admin'), createStaff);
router.put('/:id', protect, authorize('admin'), updateStaff);
router.delete('/:id', protect, authorize('admin'), deleteStaff);

export default router;
