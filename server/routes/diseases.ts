import express from "express";
import * as diseasesController from "../controllers/diseasesController";

const router = express.Router();

router.get("/", diseasesController.getDiseases);

export default router;
