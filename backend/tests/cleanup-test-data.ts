/**
 * Test Data Cleanup Script
 * 
 * Clears test data (appointments, diagnoses) while keeping test accounts
 * Useful for resetting test environment without re-seeding accounts
 * 
 * ⚠️ SECURITY WARNING: Never run this in production!
 */

import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';

dotenv.config();

// Prevent running in production
if (process.env.NODE_ENV === 'production') {
  console.error('❌ SECURITY ERROR: Cannot cleanup test data in production!');
  process.exit(1);
}

const prisma = new PrismaClient();

async function cleanupTestData() {
  console.log('🧹 Cleaning up test data...\n');

  try {
    // Get test user IDs
    const testUsers = await prisma.user.findMany({
      where: {
        email: {
          endsWith: '@healthnexus.test'
        }
      },
      select: { id: true, email: true }
    });

    if (testUsers.length === 0) {
      console.log('ℹ️  No test accounts found. Run npm run seed:test first.\n');
      return;
    }

    const testUserIds = testUsers.map(u => u.id);
    console.log(`📋 Found ${testUsers.length} test accounts:`);
    testUsers.forEach(u => console.log(`   - ${u.email}`));
    console.log('');

    // Get test doctor IDs
    const testDoctors = await prisma.doctor.findMany({
      where: {
        userId: {
          in: testUserIds
        }
      },
      select: { id: true }
    });

    const testDoctorIds = testDoctors.map(d => d.id);

    // Delete appointments
    console.log('🗑️  Deleting appointments...');
    const deletedAppointments = await prisma.appointment.deleteMany({
      where: {
        OR: [
          { userId: { in: testUserIds } },
          { doctorId: { in: testDoctorIds } }
        ]
      }
    });
    console.log(`   ✅ Deleted ${deletedAppointments.count} appointments\n`);

    // Delete diagnoses
    console.log('🗑️  Deleting diagnoses...');
    const deletedDiagnoses = await prisma.diagnosis.deleteMany({
      where: {
        userId: { in: testUserIds }
      }
    });
    console.log(`   ✅ Deleted ${deletedDiagnoses.count} diagnoses\n`);

    // Delete refresh tokens
    console.log('🗑️  Deleting refresh tokens...');
    const deletedTokens = await prisma.refreshToken.deleteMany({
      where: {
        userId: { in: testUserIds }
      }
    });
    console.log(`   ✅ Deleted ${deletedTokens.count} refresh tokens\n`);

    // Delete user profiles (but keep the users)
    console.log('🗑️  Deleting user profiles...');
    const deletedProfiles = await prisma.userProfile.deleteMany({
      where: {
        userId: { in: testUserIds }
      }
    });
    console.log(`   ✅ Deleted ${deletedProfiles.count} user profiles\n`);

    console.log('✨ Test data cleanup completed!\n');
    console.log('ℹ️  Test accounts are still available:');
    testUsers.forEach(u => console.log(`   - ${u.email}`));
    console.log('\n💡 Run npm run seed:test to recreate profiles if needed.\n');

  } catch (error) {
    console.error('❌ Error cleaning up test data:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run the cleanup if this file is executed directly
const isMainModule = process.argv[1]?.endsWith('cleanup-test-data.ts') || 
                     process.argv[1]?.endsWith('cleanup-test-data.js');

if (isMainModule) {
  cleanupTestData()
    .then(() => {
      console.log('✅ Cleanup completed successfully');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Cleanup failed:', error);
      process.exit(1);
    });
}

export default cleanupTestData;
