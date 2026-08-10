import express from 'express';
import {
  getDashboardStats,
  getAppointmentsSummary,
  getServicePerformance,
  getStaffWorkload,
} from '../controllers/dashboardController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect);

router.get('/stats', getDashboardStats);
router.get('/appointments-summary', authorize('admin'), getAppointmentsSummary);
router.get('/service-performance', authorize('admin'), getServicePerformance);
router.get('/staff-workload', authorize('admin'), getStaffWorkload);

export default router;
