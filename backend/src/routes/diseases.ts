import express from "express";
import multer from "multer";
import * as diseasesController from "../controllers/diseasesController";
import { authenticateToken, requireAdmin } from "../middleware/auth";

const router = express.Router();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    const allowedTypes = ['text/csv', 'application/json'];
    const allowedExtensions = ['.csv', '.json'];
    const fileExt = file.originalname.substring(file.originalname.lastIndexOf('.')).toLowerCase();
    
    if (allowedTypes.includes(file.mimetype) || allowedExtensions.includes(fileExt)) {
      cb(null, true);
    } else {
      cb(new Error('Only CSV and JSON files are allowed'));
    }
  }
});

// Public
router.get("/", diseasesController.getDiseases);

// Import/Export (Admin)
router.post("/import/csv", authenticateToken, requireAdmin, upload.single('file'), diseasesController.importDiseasesFromCSV);
router.get("/export/csv", authenticateToken, requireAdmin, diseasesController.exportDiseasesToCSV);

// By ID
router.get("/:id", diseasesController.getDiseaseById);

// Admin CRUD
router.post("/", authenticateToken, requireAdmin, diseasesController.createDisease);
router.put("/:id", authenticateToken, requireAdmin, diseasesController.updateDisease);
router.delete("/:id", authenticateToken, requireAdmin, diseasesController.deleteDisease);

export default router;
