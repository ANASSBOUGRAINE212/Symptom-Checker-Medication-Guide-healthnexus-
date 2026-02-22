import { PrismaClient } from '@prisma/client';

declare global {
  var prisma: PrismaClient | undefined;
}

// Use test database when NODE_ENV is 'test'
const getDatabaseUrl = () => {
  if (process.env.NODE_ENV === 'test' && process.env.DATABASE_TEST_URL) {
    return process.env.DATABASE_TEST_URL;
  }
  return process.env.DATABASE_URL;
};

export const prisma = globalThis.prisma || new PrismaClient({
  datasources: {
    db: {
      url: getDatabaseUrl(),
    },
  },
});

if (process.env.NODE_ENV !== 'production') {
  globalThis.prisma = prisma;
}

export default prisma;

export async function connectDB() {
  try {
    await prisma.$connect();
    return true;
  } catch (error) {
    return false;
  }
}

export async function disconnectDB() {
  try {
    await prisma.$disconnect();
  } catch (error) {
    console.error('Database disconnection failed:', error);
  }
}

export async function checkDBHealth() {
  try {
    await prisma.$queryRaw`SELECT 1`;
    return { status: 'healthy', timestamp: new Date().toISOString() };
  } catch (error: any) {
    return { status: 'unhealthy', error: error.message, timestamp: new Date().toISOString() };
  }
}
