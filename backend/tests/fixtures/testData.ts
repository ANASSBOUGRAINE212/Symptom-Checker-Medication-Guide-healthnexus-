/**
 * Test Data Fixtures
 * 
 * Mock data for backend tests
 * Use these for creating test-specific data that will be cleaned up
 */

/**
 * Test Appointment Data
 */
export const testAppointment = {
  appointmentDate: new Date('2026-03-15'),
  appointmentTime: '10:00',
  reason: 'Test appointment - Regular checkup',
  notes: 'This is a test appointment',
};

/**
 * Test Diagnosis Data
 */
export const testDiagnosis = {
  symptoms: ['Fever', 'Cough', 'Fatigue'],
  notes: 'Test diagnosis data',
};

/**
 * Test Disease Data (for admin operations)
 */
export const testDisease = {
  name: 'Test Disease',
  category: 'Test Category',
  description: 'This is a test disease for automated testing',
  symptoms: ['Test Symptom 1', 'Test Symptom 2'],
  causes: ['Test Cause 1'],
  treatments: ['Test Treatment 1'],
  prevention: ['Test Prevention 1'],
  severity: 'Mild',
};

/**
 * Test Medication Data (for admin operations)
 */
export const testMedication = {
  name: 'Test Medication',
  genericName: 'Test Generic Name',
  category: 'Test Category',
  description: 'This is a test medication for automated testing',
  dosage: '500mg',
  sideEffects: ['Test Side Effect 1'],
  warnings: ['Test Warning 1'],
  interactions: ['Test Interaction 1'],
};

/**
 * Test Doctor Profile Data
 */
export const testDoctorProfile = {
  specialty: 'Test Specialty',
  address: '123 Test Street',
  city: 'Test City',
  country: 'Test Country',
  phone: '+1-555-TEST-123',
  bio: 'Test doctor profile for automated testing',
  yearsOfExperience: 5,
  education: 'Test Medical School',
  languages: 'English',
  licenseNumber: 'TEST-LIC-12345',
};

/**
 * Test User Profile Data
 */
export const testUserProfile = {
  dateOfBirth: new Date('1990-01-01'),
  gender: 'Other',
  country: 'Test Country',
  height: 170,
  weight: 70,
  bloodType: 'O+',
  allergies: 'None',
};

/**
 * Generate unique email for temporary test users
 */
export const generateTestEmail = (prefix: string = 'test') => {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).substring(7)}@test.local`;
};

/**
 * Generate unique test data with timestamp
 */
export const generateUniqueTestData = <T extends Record<string, any>>(
  baseData: T,
  uniqueField: keyof T
): T => {
  return {
    ...baseData,
    [uniqueField]: `${baseData[uniqueField]}-${Date.now()}`,
  };
};
