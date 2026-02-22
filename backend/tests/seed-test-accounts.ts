/**
 * Test Account Seeder
 * 
 * Creates permanent test accounts for E2E testing
 * These accounts should ONLY exist in development and test environments
 * 
 * ⚠️ SECURITY WARNING: Never run this in production!
 */

import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';

dotenv.config();

// Prevent running in production
if (process.env.NODE_ENV === 'production') {
  console.error('❌ SECURITY ERROR: Cannot seed test accounts in production!');
  process.exit(1);
}

// Use TEST database for seeding test accounts
const databaseUrl = process.env.DATABASE_TEST_URL || process.env.DATABASE_URL;

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: databaseUrl,
    },
  },
});

/**
 * Test Account Definitions
 * These accounts will be used across all E2E tests
 */
export const TEST_ACCOUNTS = {
  user: {
    email: 'test-user@healthnexus.test',
    password: 'TestUser123!@#',
    firstName: 'Test',
    lastName: 'User',
    role: 'USER' as const,
    emailVerified: true,
  },
  doctor: {
    email: 'test-doctor@healthnexus.test',
    password: 'TestDoctor123!@#',
    firstName: 'Dr. Test',
    lastName: 'Doctor',
    role: 'DOCTOR' as const,
    emailVerified: true,
    // Doctor-specific fields
    specialty: 'Cardiology',
    address: '123 Medical Center Drive',
    city: 'Test City',
    country: 'Test Country',
    phone: '+1-555-TEST-DOC',
    bio: 'Test doctor account for E2E testing',
    yearsOfExperience: 10,
    education: 'MD from Test Medical School',
    languages: 'English, French',
    licenseNumber: 'TEST-DOC-001',
    isVerified: true,
    isActive: true,
  },
  admin: {
    email: 'test-admin@healthnexus.test',
    password: 'TestAdmin123!@#',
    firstName: 'Test',
    lastName: 'Admin',
    role: 'ADMIN' as const,
    emailVerified: true,
  },
};

async function seedTestAccounts() {
  console.log('🌱 Seeding test accounts...');
  console.log(`📊 Using database: ${databaseUrl?.split('@')[1] || 'unknown'}\n`);

  try {
    // Hash passwords
    const hashedPasswords = await Promise.all([
      bcrypt.hash(TEST_ACCOUNTS.user.password, 10),
      bcrypt.hash(TEST_ACCOUNTS.doctor.password, 10),
      bcrypt.hash(TEST_ACCOUNTS.admin.password, 10),
    ]);

    // 1. Create/Update Test User
    console.log('👤 Creating test user account...');
    const testUser = await prisma.user.upsert({
      where: { email: TEST_ACCOUNTS.user.email },
      update: {
        passwordHash: hashedPasswords[0],
        firstName: TEST_ACCOUNTS.user.firstName,
        lastName: TEST_ACCOUNTS.user.lastName,
        emailVerified: TEST_ACCOUNTS.user.emailVerified,
        isActive: true,
        role: TEST_ACCOUNTS.user.role,
        failedLoginAttempts: 0,
        lockedUntil: null,
      },
      create: {
        email: TEST_ACCOUNTS.user.email,
        passwordHash: hashedPasswords[0],
        firstName: TEST_ACCOUNTS.user.firstName,
        lastName: TEST_ACCOUNTS.user.lastName,
        emailVerified: TEST_ACCOUNTS.user.emailVerified,
        isActive: true,
        role: TEST_ACCOUNTS.user.role,
      },
    });
    console.log(`✅ Test user created: ${testUser.email} (ID: ${testUser.id})\n`);

    // 2. Create/Update Test Doctor
    console.log('👨‍⚕️ Creating test doctor account...');
    const testDoctorUser = await prisma.user.upsert({
      where: { email: TEST_ACCOUNTS.doctor.email },
      update: {
        passwordHash: hashedPasswords[1],
        firstName: TEST_ACCOUNTS.doctor.firstName,
        lastName: TEST_ACCOUNTS.doctor.lastName,
        emailVerified: TEST_ACCOUNTS.doctor.emailVerified,
        isActive: true,
        role: TEST_ACCOUNTS.doctor.role,
        failedLoginAttempts: 0,
        lockedUntil: null,
      },
      create: {
        email: TEST_ACCOUNTS.doctor.email,
        passwordHash: hashedPasswords[1],
        firstName: TEST_ACCOUNTS.doctor.firstName,
        lastName: TEST_ACCOUNTS.doctor.lastName,
        emailVerified: TEST_ACCOUNTS.doctor.emailVerified,
        isActive: true,
        role: TEST_ACCOUNTS.doctor.role,
      },
    });

    // Create doctor profile
    const licenseHash = await bcrypt.hash(TEST_ACCOUNTS.doctor.licenseNumber, 10);
    const testDoctor = await prisma.doctor.upsert({
      where: { userId: testDoctorUser.id },
      update: {
        specialty: TEST_ACCOUNTS.doctor.specialty,
        address: TEST_ACCOUNTS.doctor.address,
        city: TEST_ACCOUNTS.doctor.city,
        country: TEST_ACCOUNTS.doctor.country,
        phone: TEST_ACCOUNTS.doctor.phone,
        bio: TEST_ACCOUNTS.doctor.bio,
        yearsOfExperience: TEST_ACCOUNTS.doctor.yearsOfExperience,
        education: TEST_ACCOUNTS.doctor.education,
        languages: TEST_ACCOUNTS.doctor.languages,
        licenseNumberHash: licenseHash,
        isVerified: TEST_ACCOUNTS.doctor.isVerified,
        isActive: TEST_ACCOUNTS.doctor.isActive,
      },
      create: {
        userId: testDoctorUser.id,
        specialty: TEST_ACCOUNTS.doctor.specialty,
        address: TEST_ACCOUNTS.doctor.address,
        city: TEST_ACCOUNTS.doctor.city,
        country: TEST_ACCOUNTS.doctor.country,
        phone: TEST_ACCOUNTS.doctor.phone,
        bio: TEST_ACCOUNTS.doctor.bio,
        yearsOfExperience: TEST_ACCOUNTS.doctor.yearsOfExperience,
        education: TEST_ACCOUNTS.doctor.education,
        languages: TEST_ACCOUNTS.doctor.languages,
        licenseNumberHash: licenseHash,
        isVerified: TEST_ACCOUNTS.doctor.isVerified,
        isActive: TEST_ACCOUNTS.doctor.isActive,
      },
    });
    console.log(`✅ Test doctor created: ${testDoctorUser.email} (ID: ${testDoctorUser.id})`);
    console.log(`   Doctor Profile ID: ${testDoctor.id}\n`);

    // 3. Create/Update Test Admin
    console.log('👑 Creating test admin account...');
    const testAdmin = await prisma.user.upsert({
      where: { email: TEST_ACCOUNTS.admin.email },
      update: {
        passwordHash: hashedPasswords[2],
        firstName: TEST_ACCOUNTS.admin.firstName,
        lastName: TEST_ACCOUNTS.admin.lastName,
        emailVerified: TEST_ACCOUNTS.admin.emailVerified,
        isActive: true,
        role: TEST_ACCOUNTS.admin.role,
        failedLoginAttempts: 0,
        lockedUntil: null,
      },
      create: {
        email: TEST_ACCOUNTS.admin.email,
        passwordHash: hashedPasswords[2],
        firstName: TEST_ACCOUNTS.admin.firstName,
        lastName: TEST_ACCOUNTS.admin.lastName,
        emailVerified: TEST_ACCOUNTS.admin.emailVerified,
        isActive: true,
        role: TEST_ACCOUNTS.admin.role,
      },
    });
    console.log(`✅ Test admin created: ${testAdmin.email} (ID: ${testAdmin.id})\n`);

    console.log('✨ Test accounts seeded successfully!\n');
    console.log('📋 Test Account Credentials:');
    console.log('─────────────────────────────────────────────────────');
    console.log('👤 USER:');
    console.log(`   Email: ${TEST_ACCOUNTS.user.email}`);
    console.log(`   Password: ${TEST_ACCOUNTS.user.password}`);
    console.log('');
    console.log('👨‍⚕️ DOCTOR:');
    console.log(`   Email: ${TEST_ACCOUNTS.doctor.email}`);
    console.log(`   Password: ${TEST_ACCOUNTS.doctor.password}`);
    console.log('');
    console.log('👑 ADMIN:');
    console.log(`   Email: ${TEST_ACCOUNTS.admin.email}`);
    console.log(`   Password: ${TEST_ACCOUNTS.admin.password}`);
    console.log('─────────────────────────────────────────────────────');
    console.log('\n⚠️  These accounts are for testing only!');
    console.log('⚠️  Never use these credentials in production!\n');

  } catch (error) {
    console.error('❌ Error seeding test accounts:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run the seeder if this file is executed directly
const isMainModule = process.argv[1]?.endsWith('seed-test-accounts.ts') || 
                     process.argv[1]?.endsWith('seed-test-accounts.js');

if (isMainModule) {
  seedTestAccounts()
    .then(() => {
      console.log('✅ Seeding completed successfully');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Seeding failed:', error);
      process.exit(1);
    });
}

export default seedTestAccounts;
