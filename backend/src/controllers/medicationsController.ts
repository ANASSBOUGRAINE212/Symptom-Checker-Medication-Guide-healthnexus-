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

export async function searchMedications(req: Request, res: Response) {
  try {
    const { q, category, type } = req.query;
    
    const query: any = {};
    
    if (q) {
      query.$or = [
        { name: { $regex: q, $options: 'i' } },
        { genericName: { $regex: q, $options: 'i' } },
        { description: { $regex: q, $options: 'i' } }
      ];
    }
    
    if (category) {
      query.category = category;
    }
    
    if (type) {
      query.type = type;
    }
    
    const medications = await Medication.find(query).sort({ name: 1 }).limit(50);
    res.json(medications);
  } catch (error) {
    console.error("Error searching medications:", error);
    res.status(500).json({ error: "Failed to search medications" });
  }
}

export async function getMedicationById(req: Request, res: Response) {
  try {
    const { id } = req.params;
    
    // Validate ObjectId format
    if (!id || id === 'undefined' || !/^[0-9a-fA-F]{24}$/.test(id)) {
      return res.status(400).json({ error: "Invalid medication ID format" });
    }
    
    const medication = await Medication.findById(id);
    
    if (!medication) {
      return res.status(404).json({ error: "Medication not found" });
    }
    
    res.json(medication);
  } catch (error) {
    console.error("Error fetching medication:", error);
    res.status(500).json({ error: "Failed to fetch medication" });
  }
}

export async function createMedication(req: Request, res: Response) {
  try {
    const medicationData = req.body;
    
    // Validate required fields
    if (!medicationData.name) {
      return res.status(400).json({ error: "Medication name is required" });
    }
    
    if (!medicationData.category) {
      return res.status(400).json({ error: "Medication category is required" });
    }
    
    // Convert array fields to strings if needed
    if (Array.isArray(medicationData.sideEffects)) {
      medicationData.sideEffects = medicationData.sideEffects.join(', ');
    }
    
    // Set defaults for optional fields
    medicationData.purpose = medicationData.purpose || medicationData.description || '';
    medicationData.howItWorks = medicationData.howItWorks || '';
    medicationData.whenToTake = medicationData.whenToTake || '';
    
    const medication = await Medication.create(medicationData);
    res.status(201).json(medication);
  } catch (error) {
    console.error("Error creating medication:", error);
    res.status(500).json({ error: "Failed to create medication" });
  }
}

export async function updateMedication(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const updateData = req.body;
    
    // Validate ObjectId format
    if (!id || id === 'undefined' || !/^[0-9a-fA-F]{24}$/.test(id)) {
      return res.status(400).json({ error: "Invalid medication ID format" });
    }
    
    // Convert array fields to strings if needed
    if (Array.isArray(updateData.sideEffects)) {
      updateData.sideEffects = updateData.sideEffects.join(', ');
    }
    
    const medication = await Medication.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    );
    
    if (!medication) {
      return res.status(404).json({ error: "Medication not found" });
    }
    
    res.json(medication);
  } catch (error) {
    console.error("Error updating medication:", error);
    res.status(500).json({ error: "Failed to update medication" });
  }
}

export async function deleteMedication(req: Request, res: Response) {
  try {
    const { id } = req.params;
    
    // Validate ObjectId format
    if (!id || id === 'undefined' || !/^[0-9a-fA-F]{24}$/.test(id)) {
      return res.status(400).json({ error: "Invalid medication ID format" });
    }
    
    const medication = await Medication.findByIdAndDelete(id);
    
    if (!medication) {
      return res.status(404).json({ error: "Medication not found" });
    }
    
    res.json({ message: "Medication deleted successfully" });
  } catch (error) {
    console.error("Error deleting medication:", error);
    res.status(500).json({ error: "Failed to delete medication" });
  }
}

