import express from 'express';
import { authenticateToken, requireAdmin } from "../../middleware/auth";
import * as adminController from '../../controllers/adminController';

const router = express.Router();

// All admin routes require authentication and admin role
router.use(authenticateToken, requireAdmin);

// Disease management
router.get('/diseases', adminController.getDiseases);
router.post('/diseases', adminController.createDisease);
router.put('/diseases/:id', adminController.updateDisease);
router.delete('/diseases/:id', adminController.deleteDisease);

// Medication management
router.get('/medications', adminController.getMedications);
router.post('/medications', adminController.createMedication);
router.put('/medications/:id', adminController.updateMedication);
router.delete('/medications/:id', adminController.deleteMedication);

// Admin statistics
router.get('/stats', adminController.getAdminStats);

export default router;
