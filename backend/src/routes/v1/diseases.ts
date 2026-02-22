import express from "express";
import { authenticateToken, requireAdmin } from "../../middleware/auth";
import * as diseasesController from "../../controllers/diseasesController";

const router = express.Router();

// Public routes
router.get("/", diseasesController.getDiseases);
router.get("/search", diseasesController.searchDiseases);
router.get("/:id", diseasesController.getDiseaseById);

// Admin routes
router.post("/", authenticateToken, requireAdmin, diseasesController.createDisease);
router.put("/:id", authenticateToken, requireAdmin, diseasesController.updateDisease);
router.delete("/:id", authenticateToken, requireAdmin, diseasesController.deleteDisease);

export default router;
