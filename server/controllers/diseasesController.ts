import { Request, Response } from "express";
import { prisma } from "../lib/database";

export async function getDiseases(req: Request, res: Response) {
  try {
    const diseases = await prisma.disease.findMany({ orderBy: { createdAt: 'desc' } });
    res.json(diseases);
  } catch (error) {
    console.error("Error fetching diseases:", error);
    res.status(500).json({ error: "Failed to fetch diseases" });
  }
}
