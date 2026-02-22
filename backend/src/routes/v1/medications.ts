import express from "express";
import { authenticateToken, requireAdmin } from "../../middleware/auth";
import * as medicationsController from "../../controllers/medicationsController";

const router = express.Router();

// Public routes
router.get("/", medicationsController.getMedications);
router.get("/search", medicationsController.searchMedications);
router.get("/:id", medicationsController.getMedicationById);

// Admin routes
router.post("/", authenticateToken, requireAdmin, medicationsController.createMedication);
router.put("/:id", authenticateToken, requireAdmin, medicationsController.updateMedication);
router.delete("/:id", authenticateToken, requireAdmin, medicationsController.deleteMedication);

export default router;
