import { RequestHandler } from "express";
import { prisma } from "../lib/database";
import { Request, Response } from "express";
import { logger, createAuditLog, createPerformanceLog } from "../lib/logger";
import { encryptField, decryptField } from "../lib/encryption";
import { Disease } from "../../database/mongodb/models/Disease";

export const getUserProfile: RequestHandler = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      include: { profile: true }
    });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json({
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        profile: user.profile
      }
    });
  } catch (error) {
    console.error('Get user profile error:', error);
    res.status(500).json({ error: 'Failed to get user profile' });
  }
};

export const updateUserProfile: RequestHandler = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }
    const {
      firstName,
      lastName,
      dateOfBirth,
      gender,
      country,
      height,
      weight,
      bloodType,
      allergies,
      darkMode,
      dataSharing
    } = req.body;

    if (firstName || lastName) {
      await prisma.user.update({
        where: { id: req.user.id },
        data: {
          firstName: firstName ?? undefined,
          lastName: lastName ?? undefined
        }
      });
    }
    const profile = await prisma.userProfile.upsert({
      where: { userId: req.user.id },
      update: {
        dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : undefined,
        gender: gender ?? undefined,
        country: country ?? undefined,
        height: height !== undefined && height !== null && `${height}` !== '' ? parseInt(height) : undefined,
        weight: weight !== undefined && weight !== null && `${weight}` !== '' ? parseInt(weight) : undefined,
        bloodType: bloodType ?? undefined,
        allergies: allergies ?? undefined,
        darkMode: darkMode !== undefined ? darkMode : undefined,
        dataSharing: dataSharing !== undefined ? dataSharing : undefined,
      },
      create: {
        userId: req.user.id,
        dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : undefined,
        gender: gender ?? undefined,
        country: country ?? undefined,
        height: height !== undefined && height !== null && `${height}` !== '' ? parseInt(height) : undefined,
        weight: weight !== undefined && weight !== null && `${weight}` !== '' ? parseInt(weight) : undefined,
        bloodType: bloodType ?? undefined,
        allergies: allergies ?? undefined,
        darkMode: darkMode !== undefined ? darkMode : false,
        dataSharing: dataSharing !== undefined ? dataSharing : true,
      }
    });
    res.json({ profile });
  } catch (error) {
    console.error('Update user profile error:', error);
    res.status(500).json({ error: 'Failed to update user profile' });
  }
};

export const recordDiagnosis: RequestHandler = async (req, res) => {
  const startTime = Date.now();
  
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }
    
    const { symptoms, results, primaryDiseaseId } = req.body;
    
    if (!symptoms || !Array.isArray(symptoms)) {
      return res.status(400).json({ error: 'Valid symptoms array is required' });
    }
    if (!results || !Array.isArray(results)) {
      return res.status(400).json({ error: 'Valid results array is required' });
    }
    if (!primaryDiseaseId) {
      return res.status(400).json({ error: 'Primary disease ID is required' });
    }
    
    const disease = await Disease.findById(primaryDiseaseId);
    
    if (!disease) {
      return res.status(400).json({ error: 'Invalid primary disease ID provided' });
    }
    
    const diagnosis = await prisma.diagnosis.create({
      data: {
        userId: req.user.id,
        symptomsEncrypted: encryptField(symptoms),
        resultsEncrypted: encryptField(results),
        diseaseId: primaryDiseaseId
      }
    });
    
    const duration = Date.now() - startTime;
    
    logger.info(createAuditLog('DIAGNOSIS_CREATED', {
      userId: req.user.id,
      diagnosisId: diagnosis.id,
      primaryDiseaseId: primaryDiseaseId,
      primaryDiseaseName: disease.name,
      symptomsCount: symptoms.length,
      resultsCount: results.length,
      correlationId: (req as any).correlationId,
      ip: req.ip,
      userAgent: req.get('User-Agent'),
    }));
    
    logger.info(createPerformanceLog('DIAGNOSIS_CREATION', duration, {
      userId: req.user.id,
      symptomsCount: symptoms.length,
      resultsCount: results.length,
      correlationId: (req as any).correlationId,
    }));
    
    res.json({ 
      diagnosis: {
        ...diagnosis,
        disease: {
          id: disease._id.toString(),
          name: disease.name,
          severity: disease.severity
        }
      }
    });
  } catch (error) {
    const duration = Date.now() - startTime;
    
    logger.error({
      err: error,
      userId: req.user?.id,
      correlationId: (req as any).correlationId,
      duration,
    }, 'Failed to record diagnosis');
    
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    res.status(500).json({ 
      error: 'Failed to record diagnosis',
      details: errorMessage,
      timestamp: new Date().toISOString()
    });
  }
};

export const getUserDiagnoses: RequestHandler = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;
    
    const totalCount = await prisma.diagnosis.count({
      where: { userId: req.user.id }
    });
    
    const diagnoses = await prisma.diagnosis.findMany({
      where: { userId: req.user.id },
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit
    });

    const decryptedDiagnoses = await Promise.all(diagnoses.map(async (diagnosis) => {
      let disease = null;
      if (diagnosis.diseaseId) {
        const diseaseDoc = await Disease.findById(diagnosis.diseaseId);
        if (diseaseDoc) {
          disease = {
            id: diseaseDoc._id.toString(),
            name: diseaseDoc.name,
            severity: diseaseDoc.severity
          };
        }
      }
      
      return {
        ...diagnosis,
        symptoms: decryptField(diagnosis.symptomsEncrypted),
        results: decryptField(diagnosis.resultsEncrypted),
        disease,
        symptomsEncrypted: undefined,
        resultsEncrypted: undefined
      };
    }));

    res.json({ 
      diagnoses: decryptedDiagnoses,
      pagination: {
        total: totalCount,
        page,
        limit,
        pages: Math.ceil(totalCount / limit)
      }
    });
  } catch (error) {
    console.error('Get user diagnoses error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    res.status(500).json({ 
      error: 'Failed to get user diagnoses',
      details: errorMessage,
      timestamp: new Date().toISOString()
    });
  }
};

export const getDiagnosisStats: RequestHandler = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }
    
    const diagnosisCount = await prisma.diagnosis.count({
      where: { userId: req.user.id }
    });
    
    const lastDiagnosis = await prisma.diagnosis.findFirst({
      where: { userId: req.user.id },
      orderBy: { createdAt: 'desc' }
    });
    
    const recentDiagnoses = await prisma.diagnosis.findMany({
      where: { userId: req.user.id },
      orderBy: { createdAt: 'desc' },
      take: 5
    });
    
    const recentActivities = await Promise.all(recentDiagnoses.map(async (diagnosis) => {
      let diseaseName = 'Health check completed';
      if (diagnosis.diseaseId) {
        const disease = await Disease.findById(diagnosis.diseaseId);
        if (disease) {
          diseaseName = `Diagnosed with ${disease.name}`;
        }
      }
      return {
        id: diagnosis.id,
        type: 'diagnosis',
        description: diseaseName,
        timestamp: diagnosis.createdAt
      };
    }));
    
    res.json({
      diagnosisCount,
      lastDiagnosis: lastDiagnosis?.createdAt || null,
      recentActivities
    });
  } catch (error) {
    console.error('Get diagnosis stats error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    res.status(500).json({ 
      error: 'Failed to get diagnosis statistics',
      details: errorMessage,
      timestamp: new Date().toISOString()
    });
  }
};

export const getDiagnosisById: RequestHandler = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }
    const { id } = req.params;
    if (!id) {
      return res.status(400).json({ error: 'Diagnosis ID is required' });
    }
    
    const diagnosis = await prisma.diagnosis.findFirst({
      where: { 
        id,
        userId: req.user.id
      }
    });
    
    if (!diagnosis) {
      return res.status(404).json({ error: 'Diagnosis not found' });
    }
    
    let disease = null;
    if (diagnosis.diseaseId) {
      const diseaseDoc = await Disease.findById(diagnosis.diseaseId);
      if (diseaseDoc) {
        disease = diseaseDoc.toJSON();
      }
    }
    
    res.json({ 
      diagnosis: {
        ...diagnosis,
        symptoms: decryptField(diagnosis.symptomsEncrypted),
        results: decryptField(diagnosis.resultsEncrypted),
        disease,
        symptomsEncrypted: undefined,
        resultsEncrypted: undefined
      }
    });
  } catch (error) {
    console.error('Get diagnosis by ID error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    res.status(500).json({ 
      error: 'Failed to get diagnosis',
      details: errorMessage,
      timestamp: new Date().toISOString()
    });
  }
};

export const deleteDiagnosis: RequestHandler = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }
    const { id } = req.params;
    if (!id) {
      return res.status(400).json({ error: 'Diagnosis ID is required' });
    }
    const diagnosis = await prisma.diagnosis.findUnique({
      where: { 
        id,
        userId: req.user.id
      }
    });
    if (!diagnosis) {
      return res.status(404).json({ error: 'Diagnosis not found or you do not have permission to delete it' });
    }
    await prisma.diagnosis.delete({
      where: { id }
    });
    res.json({ 
      success: true,
      message: 'Diagnosis deleted successfully',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Delete diagnosis error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    res.status(500).json({ 
      error: 'Failed to delete diagnosis',
      details: errorMessage,
      timestamp: new Date().toISOString()
    });
  }
};

export const updateDiagnosis: RequestHandler = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }
    const { id } = req.params;
    const { symptoms, results, primaryDiseaseId } = req.body;
    
    if (!id) {
      return res.status(400).json({ error: 'Diagnosis ID is required' });
    }
    if (!symptoms || !Array.isArray(symptoms) || symptoms.length === 0) {
      return res.status(400).json({ error: 'Symptoms array is required and must not be empty' });
    }
    if (!results || !Array.isArray(results)) {
      return res.status(400).json({ error: 'Results array is required' });
    }
    if (!primaryDiseaseId) {
      return res.status(400).json({ error: 'Primary disease ID is required' });
    }
    
    const disease = await Disease.findById(primaryDiseaseId);
    if (!disease) {
      return res.status(404).json({ error: 'Disease not found' });
    }
    
    const existingDiagnosis = await prisma.diagnosis.findUnique({
      where: { 
        id,
        userId: req.user.id
      }
    });
    if (!existingDiagnosis) {
      return res.status(404).json({ error: 'Diagnosis not found or you do not have permission to update it' });
    }
    
    const updatedDiagnosis = await prisma.diagnosis.update({
      where: { id },
      data: {
        symptomsEncrypted: encryptField(symptoms),
        resultsEncrypted: encryptField(results),
        diseaseId: primaryDiseaseId
      }
    });
    
    res.json({ 
      success: true,
      message: 'Diagnosis updated successfully',
      diagnosis: {
        ...updatedDiagnosis,
        disease: {
          id: disease._id.toString(),
          name: disease.name,
          severity: disease.severity
        }
      },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Update diagnosis error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    res.status(500).json({ 
      error: 'Failed to update diagnosis',
      details: errorMessage,
      timestamp: new Date().toISOString()
    });
  }
};
