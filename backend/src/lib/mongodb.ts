import mongoose from 'mongoose';
import { logger } from './logger';

let isConnected = false;

export async function connectMongoDB(): Promise<boolean> {
  if (isConnected) {
    return true;
  }

  // Use test database when NODE_ENV is 'test'
  const mongoUri = process.env.NODE_ENV === 'test' && process.env.MONGODB_TEST_URI
    ? process.env.MONGODB_TEST_URI
    : process.env.MONGODB_URI;
  
  if (!mongoUri) {
    logger.warn('⚠️ MONGODB_URI not set, MongoDB features will be unavailable');
    return false;
  }

  try {
    await mongoose.connect(mongoUri);
    isConnected = true;
    logger.info('✅ MongoDB connected successfully');
    return true;
  } catch (error) {
    logger.error({ err: error }, '❌ MongoDB connection failed');
    return false;
  }
}

export async function disconnectMongoDB(): Promise<void> {
  if (!isConnected) {
    return;
  }

  try {
    await mongoose.disconnect();
    isConnected = false;
    logger.info('✅ MongoDB disconnected');
  } catch (error) {
    logger.error({ err: error }, '❌ MongoDB disconnection failed');
  }
}

export async function checkMongoDBHealth() {
  try {
    if (!isConnected || mongoose.connection.readyState !== 1) {
      return { status: 'unhealthy', error: 'Not connected', timestamp: new Date().toISOString() };
    }
    await mongoose.connection.db?.admin().ping();
    return { status: 'healthy', timestamp: new Date().toISOString() };
  } catch (error: any) {
    return { status: 'unhealthy', error: error.message, timestamp: new Date().toISOString() };
  }
}

export { mongoose };
