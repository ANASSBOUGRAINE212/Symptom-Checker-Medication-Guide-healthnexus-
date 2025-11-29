/**
 * Shared code between client and server
 * Useful to share types between client and server
 * and/or small pure JS functions that can be used on both client and server
 */

/**
 * Response type for /api/demo
 */
export interface DemoResponse {
  message: string;
  dbConnected?: boolean;
  timestamp?: string;
}

/**
 * User profile interface
 */
export interface UserProfile {
  id?: string;
  userId?: string;
  dateOfBirth?: string | Date;
  gender?: string;
  country?: string;
  height?: number | string;
  weight?: number | string;
  bloodType?: string;
  allergies?: string;
  darkMode?: boolean;
  dataSharing?: boolean;
  createdAt?: string | Date;
  updatedAt?: string | Date;
}

/**
 * Disease interface
 */
export interface Disease {
  id: string;
  name: string;
  category: string;
  categories?: string[];
  severity: string;
  definition: string;
  symptoms: string[];
  causes: string[];
  testsAndProcedures: string[];
  medications: string[];
  treatments?: string[];
  prevention: string[];
  prognosis: string;
  prevalence?: string;
  createdAt?: string | Date;
  updatedAt?: string | Date;
}

/**
 * Medication interface
 */
export interface Medication {
  id: string;
  name: string;
  purpose: string;
  disease: string;
  sideEffects: string;
  dosage: string[];
  contraindications: string[];
  interactions: string[];
  howItWorks: string;
  whenToTake: string;
  warnings: string[];
  category: string;
  categories?: string[];
  createdAt?: string | Date;
  updatedAt?: string | Date;
}

/**
 * Diagnosis result interface
 */
export interface DiagnosisResult {
  diseaseName: string;
  matchScore: number;
  probability: number;
}
