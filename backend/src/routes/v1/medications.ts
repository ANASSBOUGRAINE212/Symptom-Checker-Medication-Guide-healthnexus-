import express from "express";
import * as medicationsController from "../../controllers/medicationsController";

const router = express.Router();

router.get("/", medicationsController.getMedications);

export default router;
