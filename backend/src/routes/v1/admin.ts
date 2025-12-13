import express from 'express';
import { authenticateToken, requireAdmin } from "../../middleware/auth";
import * as adminController from '../../controllers/adminController';

const router = express.Router();

router.use(authenticateToken, requireAdmin);

// Diseases
router.get('/diseases', adminController.getDiseases);
router.post('/diseases', adminController.createDisease);
router.put('/diseases/:id', adminController.updateDisease);
router.delete('/diseases/:id', adminController.deleteDisease);

// Medications
router.get('/medications', adminController.getMedications);
router.post('/medications', adminController.createMedication);
router.put('/medications/:id', adminController.updateMedication);
router.delete('/medications/:id', adminController.deleteMedication);

// Stats
router.get('/stats', adminController.getAdminStats);

export default router;
