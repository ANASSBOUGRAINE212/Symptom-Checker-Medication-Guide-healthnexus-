import { RequestHandler } from "express";
import { prisma } from "../lib/database";

export const getDiseases: RequestHandler = async (req, res) => {
  try {
    const diseases = await prisma.disease.findMany({
      orderBy: { createdAt: 'desc' }
    });
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

    const disease = await prisma.disease.create({
      data: {
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
      }
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

    const disease = await prisma.disease.update({
      where: { id },
      data: {
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
      }
    });

    res.json({ disease });
  } catch (error) {
    console.error('Update disease error:', error);
    res.status(500).json({ error: 'Failed to update disease' });
  }
};

export const deleteDisease: RequestHandler = async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.disease.delete({
      where: { id }
    });
    res.json({ success: true });
  } catch (error) {
    console.error('Delete disease error:', error);
    res.status(500).json({ error: 'Failed to delete disease' });
  }
};

export const getMedications: RequestHandler = async (req, res) => {
  try {
    const medications = await prisma.medication.findMany({
      orderBy: { createdAt: 'desc' }
    });
    // Always return disease as an array
    const meds = medications.map(med => ({
      ...med,
      disease: Array.isArray(med.disease) ? med.disease : (typeof med.disease === 'string' && med.disease ? [med.disease] : [])
    }));
    res.json({ medications: meds });
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

    // Ensure disease is an array
    const diseaseArray = Array.isArray(disease) ? disease : (typeof disease === 'string' && disease ? [disease] : []);

    const medication = await prisma.medication.create({
      data: {
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
      }
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

    // Ensure disease is an array
    const diseaseArray = Array.isArray(disease) ? disease : (typeof disease === 'string' && disease ? [disease] : []);

    const medication = await prisma.medication.update({
      where: { id },
      data: {
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
      }
    });

    res.json({ medication });
  } catch (error) {
    console.error('Update medication error:', error);
    res.status(500).json({ error: 'Failed to update medication' });
  }
};

export const deleteMedication: RequestHandler = async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.medication.delete({
      where: { id }
    });
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

    // Basic counts
    const [diseaseCount, medicationCount, userCount, diagnosisCount] = await Promise.all([
      prisma.disease.count(),
      prisma.medication.count(),
      prisma.user.count(),
      prisma.diagnosis.count()
    ]);

    // Get recent activity (diagnoses in last 24 hours)
    const recentActivity = await prisma.diagnosis.count({
      where: {
        createdAt: {
          gte: new Date(Date.now() - 24 * 60 * 60 * 1000)
        }
      }
    });

    // Get user growth (users created in last 7 days)
    const newUsers = await prisma.user.count({
      where: {
        createdAt: {
          gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
        }
      }
    });

    // Get most common diseases diagnosed
    const commonDiseases = await prisma.diagnosis.groupBy({
      by: ['diseaseId'],
      _count: {
        diseaseId: true
      },
      orderBy: {
        _count: {
          diseaseId: 'desc'
        }
      },
      take: 5,
      where: {
        diseaseId: {
          not: null
        }
      }
    });

    // Get disease details for the common diseases
    const topDiseases = await Promise.all(
      commonDiseases.map(async (item) => {
        if (!item.diseaseId) return null;
        const disease = await prisma.disease.findUnique({
          where: { id: item.diseaseId }
        });
        return {
          id: disease?.id,
          name: disease?.name,
          count: item._count.diseaseId
        };
      })
    );

    res.json({
      totalDiseases: diseaseCount,
      totalMedications: medicationCount,
      totalUsers: userCount,
      totalDiagnoses: diagnosisCount,
      recentActivity,
      userGrowth: newUsers,
      topDiagnoses: topDiseases.filter(Boolean)
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
