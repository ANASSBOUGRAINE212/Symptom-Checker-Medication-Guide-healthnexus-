import { RequestHandler } from "express";
import { prisma } from "../lib/database";
import { Disease } from "../../database/mongodb/models/Disease";
import { Medication } from "../../database/mongodb/models/Medication";

export const getDiseases: RequestHandler = async (req, res) => {
  try {
    const diseases = await Disease.find().sort({ createdAt: -1 });
    res.json({ diseases });
  } catch (error) {
    console.error('Get diseases error:', error);
    res.status(500).json({ error: 'Failed to get diseases' });
  }
};

export const createDisease: RequestHandler = async (req, res) => {
  try {
    const {
      name,
      category,
      categories,
      severity,
      definition,
      symptoms,
      causes,
      testsAndProcedures,
      medications,
      treatments,
      prevention,
      prognosis,
      prevalence
    } = req.body;

    const disease = await Disease.create({
      name,
      category,
      categories: categories || [],
      severity,
      definition,
      symptoms,
      causes,
      testsAndProcedures,
      medications: medications || [],
      treatments: treatments || [],
      prevention,
      prognosis,
      prevalence
    });

    res.status(201).json({ disease });
  } catch (error) {
    res.status(500).json({ 
      error: 'Failed to create disease',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

export const updateDisease: RequestHandler = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      name,
      category,
      categories,
      severity,
      definition,
      symptoms,
      causes,
      testsAndProcedures,
      medications,
      treatments,
      prevention,
      prognosis,
      prevalence
    } = req.body;

    const disease = await Disease.findByIdAndUpdate(
      id,
      {
        name,
        category,
        categories,
        severity,
        definition,
        symptoms,
        causes,
        testsAndProcedures,
        medications,
        treatments,
        prevention,
        prognosis,
        prevalence,
      },
      { new: true }
    );

    if (!disease) {
      return res.status(404).json({ error: 'Disease not found' });
    }

    res.json({ disease });
  } catch (error) {
    console.error('Update disease error:', error);
    res.status(500).json({ error: 'Failed to update disease' });
  }
};

export const deleteDisease: RequestHandler = async (req, res) => {
  try {
    const { id } = req.params;
    const disease = await Disease.findByIdAndDelete(id);
    
    if (!disease) {
      return res.status(404).json({ error: 'Disease not found' });
    }
    
    res.json({ success: true });
  } catch (error) {
    console.error('Delete disease error:', error);
    res.status(500).json({ error: 'Failed to delete disease' });
  }
};

export const getMedications: RequestHandler = async (req, res) => {
  try {
    const medications = await Medication.find().sort({ createdAt: -1 });
    res.json({ medications });
  } catch (error) {
    console.error('Get medications error:', error);
    res.status(500).json({ error: 'Failed to get medications' });
  }
};

export const createMedication: RequestHandler = async (req, res) => {
  try {
    const {
      name,
      purpose,
      disease,
      category,
      categories,
      sideEffects,
      dosage,
      contraindications,
      interactions,
      howItWorks,
      whenToTake,
      warnings
    } = req.body;

    const diseaseArray = Array.isArray(disease) ? disease : (typeof disease === 'string' && disease ? [disease] : []);

    const medication = await Medication.create({
      name,
      purpose,
      disease: diseaseArray,
      category,
      categories: categories || [],
      sideEffects,
      dosage,
      contraindications: contraindications || [],
      interactions: interactions || [],
      howItWorks,
      whenToTake,
      warnings: warnings || []
    });

    res.status(201).json({ medication });
  } catch (error) {
    console.error('Create medication error:', error);
    res.status(500).json({ error: 'Failed to create medication' });
  }
};

export const updateMedication: RequestHandler = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      name,
      purpose,
      disease,
      category,
      categories,
      sideEffects,
      dosage,
      contraindications,
      interactions,
      howItWorks,
      whenToTake,
      warnings
    } = req.body;

    const diseaseArray = Array.isArray(disease) ? disease : (typeof disease === 'string' && disease ? [disease] : []);

    const medication = await Medication.findByIdAndUpdate(
      id,
      {
        name,
        purpose,
        disease: diseaseArray,
        category,
        categories,
        sideEffects,
        dosage,
        contraindications,
        interactions,
        howItWorks,
        whenToTake,
        warnings
      },
      { new: true }
    );

    if (!medication) {
      return res.status(404).json({ error: 'Medication not found' });
    }

    res.json({ medication });
  } catch (error) {
    console.error('Update medication error:', error);
    res.status(500).json({ error: 'Failed to update medication' });
  }
};

export const deleteMedication: RequestHandler = async (req, res) => {
  try {
    const { id } = req.params;
    const medication = await Medication.findByIdAndDelete(id);
    
    if (!medication) {
      return res.status(404).json({ error: 'Medication not found' });
    }
    
    res.json({ success: true });
  } catch (error) {
    console.error('Delete medication error:', error);
    res.status(500).json({ error: 'Failed to delete medication' });
  }
};

export const getAdminStats: RequestHandler = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const [diseaseCount, medicationCount, userCount, diagnosisCount] = await Promise.all([
      Disease.countDocuments(),
      Medication.countDocuments(),
      prisma.user.count(),
      prisma.diagnosis.count()
    ]);

    const recentActivity = await prisma.diagnosis.count({
      where: {
        createdAt: {
          gte: new Date(Date.now() - 24 * 60 * 60 * 1000)
        }
      }
    });

    const newUsers = await prisma.user.count({
      where: {
        createdAt: {
          gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
        }
      }
    });

    res.json({
      totalDiseases: diseaseCount,
      totalMedications: medicationCount,
      totalUsers: userCount,
      totalDiagnoses: diagnosisCount,
      recentActivity,
      userGrowth: newUsers,
      topDiagnoses: []
    });
  } catch (error) {
    console.error('Get admin stats error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    res.status(500).json({ 
      error: 'Failed to get admin statistics',
      details: errorMessage,
      timestamp: new Date().toISOString()
    });
  }
};
