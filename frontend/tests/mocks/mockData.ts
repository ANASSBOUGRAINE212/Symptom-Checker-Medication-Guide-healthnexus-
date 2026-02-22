/**
 * Mock Data for Tests
 * Provides realistic test data matching the application's data structures
 * 
 * ⚠️ IMPORTANT: These test accounts are seeded in the database
 * Run: npm run seed:test (in backend) to create them
 */

/**
 * Test Account Credentials
 * These match the seeded accounts in the database
 * Used for both unit tests and E2E tests
 */
export const TEST_CREDENTIALS = {
  user: {
    email: 'test-user@healthnexus.test',
    password: 'TestUser123!@#',
  },
  doctor: {
    email: 'test-doctor@healthnexus.test',
    password: 'TestDoctor123!@#',
  },
  admin: {
    email: 'test-admin@healthnexus.test',
    password: 'TestAdmin123!@#',
  },
};

/**
 * Mock User Data (for unit tests that don't need real DB)
 */
export const mockUser = {
  id: 'test-user-123',
  email: TEST_CREDENTIALS.user.email,
  firstName: 'Test',
  lastName: 'User',
  role: 'USER',
  emailVerified: true,
};

export const mockAdminUser = {
  id: 'admin-user-123',
  email: TEST_CREDENTIALS.admin.email,
  firstName: 'Test',
  lastName: 'Admin',
  role: 'ADMIN',
  emailVerified: true,
};

export const mockDoctorUser = {
  id: 'doctor-user-123',
  email: TEST_CREDENTIALS.doctor.email,
  firstName: 'Dr. Test',
  lastName: 'Doctor',
  role: 'DOCTOR',
  emailVerified: true,
};

/**
 * Mock Authentication Tokens
 */
export const mockAccessToken = 'mock-access-token-123';
export const mockRefreshToken = 'mock-refresh-token-456';

/**
 * Mock Doctor Data
 */
export const mockDoctor = {
  id: 'doctor-123',
  userId: 'doctor-user-123',
  specialization: 'Cardiology',
  licenseNumber: 'LIC123456',
  yearsOfExperience: 10,
  bio: 'Experienced cardiologist with 10 years of practice',
  isVerified: true,
  isActive: true,
  consultationFee: 100,
  user: mockDoctorUser,
};

/**
 * Mock Appointment Data
 */
export const mockAppointment = {
  id: 'appointment-123',
  userId: 'test-user-123',
  doctorId: 'doctor-123',
  appointmentDate: new Date('2026-03-15T10:00:00Z'),
  reason: 'Regular checkup',
  status: 'PENDING',
  notes: null,
  doctor: mockDoctor,
};

/**
 * Mock Disease Data
 */
export const mockDisease = {
  _id: 'disease-123',
  name: 'Common Cold',
  category: 'Respiratory',
  description: 'A viral infection of the upper respiratory tract',
  symptoms: ['Runny nose', 'Sore throat', 'Cough', 'Sneezing'],
  causes: ['Rhinovirus', 'Coronavirus'],
  treatments: ['Rest', 'Fluids', 'Over-the-counter medications'],
  prevention: ['Hand washing', 'Avoid close contact with sick people'],
  severity: 'Mild',
};

/**
 * Mock Medication Data
 */
export const mockMedication = {
  _id: 'medication-123',
  name: 'Paracetamol',
  genericName: 'Acetaminophen',
  category: 'Pain Relief',
  description: 'Pain reliever and fever reducer',
  dosage: '500mg',
  sideEffects: ['Nausea', 'Stomach pain'],
  warnings: ['Do not exceed recommended dose'],
  interactions: ['Alcohol'],
};

/**
 * Mock Diagnosis Data
 */
export const mockDiagnosis = {
  id: 'diagnosis-123',
  userId: 'test-user-123',
  symptoms: ['Fever', 'Cough', 'Fatigue'],
  possibleDiseases: [
    {
      disease: mockDisease,
      matchPercentage: 85,
      matchedSymptoms: ['Fever', 'Cough'],
    },
  ],
  createdAt: new Date('2026-02-01T10:00:00Z'),
};

/**
 * Mock API Responses
 */
export const mockLoginResponse = {
  user: mockUser,
  accessToken: mockAccessToken,
  refreshToken: mockRefreshToken,
  message: 'Login successful',
};

export const mockRegisterResponse = {
  user: mockUser,
  accessToken: mockAccessToken,
  refreshToken: mockRefreshToken,
  message: 'Registration successful. Please verify your email.',
};

/**
 * Mock Error Responses
 */
export const mockErrorResponse = {
  error: 'Something went wrong',
  success: false,
};

export const mockValidationError = {
  error: 'Validation failed',
  details: ['Email is required', 'Password must be at least 8 characters'],
  success: false,
};
