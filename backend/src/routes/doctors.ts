import { Router } from 'express';
import { authenticateToken, requireRole } from '../middleware/auth.js';
import {
  getAllDoctors,
  getDoctorById,
  registerDoctor,
  createDoctor,
  verifyDoctor,
  updateDoctor,
  deleteDoctor,
  rejectDoctor,
  updateDoctorSchedule,
  createDoctorSchedule,
  getDoctorSchedule,
  updateSchedule,
  deleteSchedule
} from '../controllers/doctorsController.js';

const router = Router();

// Public routes
router.get('/', getAllDoctors);
router.get('/:id', getDoctorById);

// Doctor self-registration (no auth required)
router.post('/register', registerDoctor);

// Doctor self-update (doctors can update their own profile)
router.put('/profile', authenticateToken, requireRole('DOCTOR'), updateDoctor);
router.put('/profile/schedule', authenticateToken, requireRole('DOCTOR'), updateDoctorSchedule);

// Schedule management routes (must be before /:id routes)
router.post('/:id/schedule', authenticateToken, requireRole('ADMIN', 'DOCTOR'), createDoctorSchedule);
router.get('/:id/schedule', getDoctorSchedule);
router.put('/schedule/:scheduleId', authenticateToken, requireRole('ADMIN', 'DOCTOR'), updateSchedule);
router.delete('/schedule/:scheduleId', authenticateToken, requireRole('ADMIN', 'DOCTOR'), deleteSchedule);

// Admin-only routes
router.post('/', authenticateToken, requireRole('ADMIN'), createDoctor);
router.put('/:id/verify', authenticateToken, requireRole('ADMIN'), verifyDoctor);
router.post('/:id/reject', authenticateToken, requireRole('ADMIN'), rejectDoctor);
router.put('/:id', authenticateToken, requireRole('ADMIN'), updateDoctor);
router.delete('/:id', authenticateToken, requireRole('ADMIN'), deleteDoctor);
router.put('/:id/schedule', authenticateToken, requireRole('ADMIN'), updateDoctorSchedule);

export default router;
