// Test Setup and Configuration
import { PrismaClient } from '@prisma/client';
import { setupPrismaTest, teardownPrismaTest } from './prismaTestSetup';
import { setupMongoTest, teardownMongoTest } from './mongoTestSetup';
import seedTestAccounts from '../seed-test-accounts';

const prisma = new PrismaClient();

// Global test setup - runs once before all tests
beforeAll(async () => {
  console.log('🚀 Starting test suite...');
  
  try {
    // Initialize database connections
    await Promise.all([
      setupPrismaTest(),
      setupMongoTest(),
    ]);
    
    console.log('✅ Test databases connected');
    
    // Seed test accounts
    console.log('🌱 Seeding test accounts...');
    await seedTestAccounts();
    console.log('✅ Test accounts seeded');
  } catch (error) {
    console.error('❌ Test setup failed:', error);
    throw error;
  }
}, 60000); // Increase timeout for setup to 60 seconds

// Global test teardown - runs once after all tests
afterAll(async () => {
  console.log('🧹 Cleaning up test suite...');
  
  try {
    // Clean up and disconnect
    await Promise.all([
      teardownPrismaTest(),
      teardownMongoTest(),
    ]);
    
    console.log('✅ Test cleanup completed');
  } catch (error) {
    console.error('❌ Test cleanup failed:', error);
    throw error;
  }
});

// Don't clear database before each test - let individual tests handle cleanup
// This prevents foreign key constraint errors

// Export prisma client for tests
export { prisma };
