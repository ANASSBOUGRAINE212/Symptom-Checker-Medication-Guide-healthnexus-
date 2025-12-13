import { z } from 'zod';
import { Request, Response, NextFunction } from 'express';
import { logSecurityEvent } from './securityLogger';

export const profileUpdateSchema = z.object({
  firstName: z.string().min(1).max(50).optional(),
  lastName: z.string().min(1).max(50).optional(),
  dateOfBirth: z.string().refine((date) => {
    return /^\d{4}-\d{2}-\d{2}(T\d{2}:\d{2}:\d{2}(\.\d{3})?Z?)?$/.test(date);
  }, { message: "Invalid date format" }).optional(),
  gender: z.string().min(1, "Gender is required").refine(val => {
    const validGenders = ['male', 'female', 'non-binary', 'transgender', 'genderfluid', 'intersex', 'prefer not to say'];
    return validGenders.includes(val.toLowerCase());
  }, { message: "Invalid gender option" }),
  country: z.string().min(2).max(100).optional(),
  height: z.number().min(50).max(300).optional(),
  weight: z.number().min(20).max(500).optional(),
  bloodType: z.enum(['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']).optional(),
  allergies: z.string().max(1000).optional(),
  darkMode: z.boolean().optional(),
  dataSharing: z.boolean().optional(),
});

export const diagnosisSchema = z.object({
  symptoms: z.array(z.string().min(1).max(200)).min(1).max(20),
  results: z.array(z.object({
    diseaseId: z.string().min(1),
    diseaseName: z.string().min(1).max(200),
    probability: z.number().min(0).max(100),
    severity: z.string().min(1).max(50),
    matchScore: z.number().min(0),
    confidence: z.number().min(0).max(1).optional(),
  })).min(1).max(10),
  primaryDiseaseId: z.string().min(1),
});

export const diagnosisUpdateSchema = z.object({
  symptoms: z.array(z.string().min(1).max(200)).min(1).max(20),
  results: z.array(z.object({
    diseaseId: z.string().min(1),
    diseaseName: z.string().min(1).max(200),
    probability: z.number().min(0).max(100),
    severity: z.string().min(1).max(50),
    matchScore: z.number().min(0),
    confidence: z.number().min(0).max(1).optional(),
  })).min(1).max(10),
  primaryDiseaseId: z.string().min(1),
});

export const paginationSchema = z.object({
  page: z.string().regex(/^\d+$/).transform(Number).refine(n => n > 0).optional(),
  limit: z.string().regex(/^\d+$/).transform(Number).refine(n => n > 0 && n <= 100).optional(),
});

export function validateBody(schema: z.ZodSchema) {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = schema.safeParse(req.body);
      if (!result.success) {
        logSecurityEvent(req, 'FAILED_VALIDATION', {
          errors: result.error.errors,
          body: req.body
        });

        return res.status(400).json({
          error: 'Validation failed',
          details: result.error.errors.map(err => ({
            field: err.path.join('.'),
            message: err.message,
          })),
        });
      }
      req.body = result.data;
      next();
    } catch (error) {
      logSecurityEvent(req, 'FAILED_VALIDATION', {
        error: error instanceof Error ? error.message : 'Unknown validation error',
        body: req.body
      });
      return res.status(400).json({ error: 'Invalid input data' });
    }
  };
}

export function validateQuery(schema: z.ZodSchema) {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = schema.safeParse(req.query);
      if (!result.success) {
        return res.status(400).json({
          error: 'Query validation failed',
          details: result.error.errors.map(err => ({
            field: err.path.join('.'),
            message: err.message,
          })),
        });
      }
      req.query = result.data;
      next();
    } catch (error) {
      return res.status(400).json({ error: 'Invalid query parameters' });
    }
  };
}

export function validateParams(schema: z.ZodSchema) {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = schema.safeParse(req.params);
      if (!result.success) {
        return res.status(400).json({
          error: 'Parameter validation failed',
          details: result.error.errors.map(err => ({
            field: err.path.join('.'),
            message: err.message,
          })),
        });
      }
      req.params = result.data;
      next();
    } catch (error) {
      return res.status(400).json({ error: 'Invalid parameters' });
    }
  };
}