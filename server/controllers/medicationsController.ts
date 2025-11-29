import { Request, Response } from "express";
import { prisma } from "../lib/database";

export async function getMedications(req: Request, res: Response) {
  try {
    const medications = await prisma.medication.findMany();
    res.json(medications);
  } catch (error) {
    console.error("Error fetching medications:", error);
    res.status(500).json({ error: "Failed to fetch medications" });
  }
}
