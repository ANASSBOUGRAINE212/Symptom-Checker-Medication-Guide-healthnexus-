import express from "express";
import { authenticateToken } from "../middleware/auth";
import * as userController from "../controllers/userController";
import { validateBody, validateQuery, profileUpdateSchema, diagnosisSchema, diagnosisUpdateSchema, paginationSchema } from "../middleware/validation";

const router = express.Router();

// Profile
router.get("/profile", authenticateToken, userController.getUserProfile);
router.put("/profile", authenticateToken, validateBody(profileUpdateSchema), userController.updateUserProfile);

// Diagnosis
router.post("/diagnosis", authenticateToken, validateBody(diagnosisSchema), userController.recordDiagnosis);
router.get("/diagnoses", authenticateToken, validateQuery(paginationSchema), userController.getUserDiagnoses);
router.get("/diagnosis/stats", authenticateToken, userController.getDiagnosisStats);
router.get("/diagnosis/:id", authenticateToken, userController.getDiagnosisById);
router.delete("/diagnosis/:id", authenticateToken, userController.deleteDiagnosis);
router.put("/diagnosis/:id", authenticateToken, validateBody(diagnosisUpdateSchema), userController.updateDiagnosis);

export default router;
