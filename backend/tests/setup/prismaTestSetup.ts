// Prisma Test Setup
import { PrismaClient } from '@prisma/client';

let prismaClient: PrismaClient | null = null;

export const getPrismaTestClient = () => {
  if (!prismaClient) {
    prismaClient = new PrismaClient({
      datasources: {
        db: {
          url: process.env.DATABASE_TEST_URL || process.env.DATABASE_URL,
        },
      },
    });
  }
  return prismaClient;
};

export const connectPrismaTest = async () => {
  try {
    const prisma = getPrismaTestClient();
    await prisma.$connect();
    console.log('Prisma Test Connection Established');
    return prisma;
  } catch (error) {
    console.error('Prisma Test Connection Error:', error);
    throw error;
  }
};

export const disconnectPrismaTest = async () => {
  try {
    if (prismaClient) {
      await prismaClient.$disconnect();
      prismaClient = null;
      console.log('Prisma Test Connection Closed');
    }
  } catch (error) {
    console.error('Prisma Test Disconnect Error:', error);
    throw error;
  }
};

export const clearPrismaTables = async () => {
  try {
    const prisma = getPrismaTestClient();
    
    // Delete in order to respect foreign key constraints
    // IMPORTANT: Preserve permanent test accounts (emails ending with @healthnexus.test)
    
    // Get IDs of permanent test accounts to exclude
    const permanentTestUsers = await prisma.user.findMany({
      where: {
        email: {
          endsWith: '@healthnexus.test',
        },
      },
      select: { id: true },
    });
    
    const permanentUserIds = permanentTestUsers.map(u => u.id);
    
    // Delete appointments (exclude those belonging to permanent test users)
    await prisma.appointment.deleteMany({
      where: {
        userId: {
          notIn: permanentUserIds,
        },
      },
    });
    
    // Delete doctor schedules (exclude those belonging to permanent test doctors)
    const permanentDoctors = await prisma.doctor.findMany({
      where: {
        userId: {
          in: permanentUserIds,
        },
      },
      select: { id: true },
    });
    const permanentDoctorIds = permanentDoctors.map(d => d.id);
    
    await prisma.doctorSchedule.deleteMany({
      where: {
        doctorId: {
          notIn: permanentDoctorIds,
        },
      },
    });
    
    // Delete doctors (exclude permanent test doctors)
    await prisma.doctor.deleteMany({
      where: {
        userId: {
          notIn: permanentUserIds,
        },
      },
    });
    
    // Delete refresh tokens (exclude permanent test users)
    await prisma.refreshToken.deleteMany({
      where: {
        userId: {
          notIn: permanentUserIds,
        },
      },
    });
    
    // Delete user profiles (exclude permanent test users)
    await prisma.userProfile.deleteMany({
      where: {
        userId: {
          notIn: permanentUserIds,
        },
      },
    });
    
    // Delete users (exclude permanent test accounts)
    await prisma.user.deleteMany({
      where: {
        email: {
          not: {
            endsWith: '@healthnexus.test',
          },
        },
      },
    });
    
    console.log('Prisma Tables Cleared (Permanent test accounts preserved)');
  } catch (error) {
    console.error('Prisma Clear Tables Error:', error);
    throw error;
  }
};

// Setup and teardown for tests
export const setupPrismaTest = async () => {
  await connectPrismaTest();
};

export const teardownPrismaTest = async () => {
  await clearPrismaTables();
  await disconnectPrismaTest();
};
