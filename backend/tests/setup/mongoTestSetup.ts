// MongoDB Test Setup
import mongoose from 'mongoose';

let mongoConnection: typeof mongoose | null = null;

export const connectMongoTest = async () => {
  try {
    if (mongoConnection) {
      return mongoConnection;
    }

    const mongoUri = process.env.MONGODB_TEST_URI || process.env.MONGODB_URI || 'mongodb://localhost:27017/healthnexus_test';
    
    mongoConnection = await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 30000, // 30 second timeout
      socketTimeoutMS: 45000, // 45 second socket timeout
    });
    console.log('MongoDB Test Connection Established');
    
    return mongoConnection;
  } catch (error) {
    console.error('MongoDB Test Connection Error:', error);
    throw error;
  }
};

export const disconnectMongoTest = async () => {
  try {
    if (mongoConnection) {
      await mongoose.disconnect();
      mongoConnection = null;
      console.log('MongoDB Test Connection Closed');
    }
  } catch (error) {
    console.error('MongoDB Test Disconnect Error:', error);
    throw error;
  }
};

export const clearMongoCollections = async () => {
  try {
    const collections = mongoose.connection.collections;
    
    for (const key in collections) {
      const collection = collections[key];
      await collection.deleteMany({});
    }
    
    console.log('MongoDB Collections Cleared');
  } catch (error) {
    console.error('MongoDB Clear Collections Error:', error);
    throw error;
  }
};

// Setup and teardown for tests
export const setupMongoTest = async () => {
  await connectMongoTest();
};

export const teardownMongoTest = async () => {
  await clearMongoCollections();
  await disconnectMongoTest();
};
