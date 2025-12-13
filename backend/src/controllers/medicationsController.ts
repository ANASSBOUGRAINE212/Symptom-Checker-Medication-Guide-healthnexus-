import { Request, Response } from "express";
import { Medication } from "../../database/mongodb/models/Medication";

export async function getMedications(req: Request, res: Response) {
  try {
    const medications = await Medication.find().sort({ createdAt: -1 });
    res.json(medications);
  } catch (error) {
    console.error("Error fetching medications:", error);
    res.status(500).json({ error: "Failed to fetch medications" });
  }
}
