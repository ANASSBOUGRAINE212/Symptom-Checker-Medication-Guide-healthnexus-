// Test Helper Functions
import { PrismaClient, Role } from '@prisma/client';
import { hashPassword } from '../../src/lib/password';
import { generateAccessToken, generateRefreshToken } from '../../src/lib/jwt';

const prisma = new PrismaClient();

// Generate JWT tokens for testing using the actual JWT library
// This fetches the user's email from database to create valid tokens
export const generateTokens = async (userId: string, role: string = 'USER') => {
  // Fetch the user's actual email from database
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { email: true },
  });
  
  if (!user) {
    throw new Error(`User with id ${userId} not found`);
  }
  
  const accessToken = generateAccessToken({ userId, email: user.email, role });
  const refreshToken = generateRefreshToken({ userId, email: user.email, role });
  return { accessToken, refreshToken };
};

// Generate tokens with a specific email (for permanent test accounts)
export const generateTokensWithEmail = (userId: string, email: string, role: string = 'USER') => {
  const accessToken = generateAccessToken({ userId, email, role });
  const refreshToken = generateRefreshToken({ userId, email, role });
  return { accessToken, refreshToken };
};

// Create test user
export const createTestUser = async (overrides: any = {}) => {
  const defaultUser = {
    email: `test-${Date.now()}@example.com`,
    passwordHash: await hashPassword('Test123!@#'),
    firstName: 'Test',
    lastName: 'User',
    emailVerified: true,
    isActive: true, // Add isActive field
    role: (overrides.role as Role) || Role.USER,
    ...overrides,
  };

  return await prisma.user.create({
    data: defaultUser,
  });
};

// Create test doctor
export const createTestDoctor = async (userId?: string) => {
  const licenseNumberHash = await hashPassword('LICENSE123');
  
  if (userId) {
    // Use existing user
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      throw new Error(`User with id ${userId} not found`);
    }
    
    const doctor = await prisma.doctor.create({
      data: {
        userId: user.id,
        specialty: 'General Practice',
        address: '123 Test St',
        city: 'Test City',
        country: 'Test Country',
        phone: '+1234567890',
        bio: 'Test doctor bio',
        yearsOfExperience: 5,
        education: 'MD from Test University',
        languages: 'English',
        licenseNumberHash,
        isActive: true,
        isVerified: true,
      },
      include: {
        user: true,
      },
    });
    
    return doctor;
  }
  
  // Create user and doctor in a transaction to avoid race conditions
  const result = await prisma.$transaction(async (tx) => {
    const user = await tx.user.create({
      data: {
        email: `doctor-user-${Date.now()}-${Math.random().toString(36).substring(7)}@test.com`,
        passwordHash: await hashPassword('Test123!@#'),
        firstName: 'Test',
        lastName: 'Doctor',
        emailVerified: true,
        isActive: true, // Add isActive field
        role: Role.DOCTOR,
      },
    });
    
    const doctor = await tx.doctor.create({
      data: {
        userId: user.id,
        specialty: 'General Practice',
        address: '123 Test St',
        city: 'Test City',
        country: 'Test Country',
        phone: '+1234567890',
        bio: 'Test doctor bio',
        yearsOfExperience: 5,
        education: 'MD from Test University',
        languages: 'English',
        licenseNumberHash,
        isActive: true,
        isVerified: true,
      },
      include: {
        user: true,
      },
    });
    
    return doctor;
  });
  
  return result;
};

// Create test appointment
export const createTestAppointment = async (userId: string, doctorId: string) => {
  return await prisma.appointment.create({
    data: {
      userId,
      doctorId,
      appointmentDate: new Date('2026-03-01'),
      appointmentTime: '10:00',
      reason: 'Test appointment',
      status: 'PENDING',
    },
  });
};

// Clean up test data
export const cleanupTestData = async () => {
  await prisma.appointment.deleteMany();
  await prisma.doctorSchedule.deleteMany();
  await prisma.doctor.deleteMany();
  await prisma.refreshToken.deleteMany();
  await prisma.userProfile.deleteMany();
  await prisma.user.deleteMany();
};

// Create admin user
export const createTestAdmin = async () => {
  return await createTestUser({
    email: `admin-${Date.now()}@test.com`, // Use unique email with timestamp
    role: Role.ADMIN,
  });
};
