import { Router } from 'express';
import { authenticateToken, requireRole } from '../middleware/auth.js';
import {
  createAppointment,
  getUserAppointments,
  getAppointmentById,
  getDoctorAppointments,
  getAllAppointments,
  updateAppointmentStatus,
  cancelAppointment
} from '../controllers/appointmentsController.js';

const router = Router();

// All routes require authentication
router.use(authenticateToken);

// User's own appointments (must be before /:id routes)
router.get('/', getUserAppointments);
router.get('/doctor', requireRole('DOCTOR'), getDoctorAppointments);
router.get('/all', requireRole('ADMIN'), getAllAppointments);

// Create appointment
router.post('/', createAppointment);

// Get appointment by ID
router.get('/:id', getAppointmentById);

// Update appointment status (doctors only)
router.put('/:id/status', requireRole('DOCTOR'), updateAppointmentStatus);

// Cancel appointment
router.delete('/:id', cancelAppointment);

export default router;
