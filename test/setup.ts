import mongoose from 'mongoose';
import { beforeAll, afterAll, beforeEach } from 'vitest';
import dotenv from 'dotenv';

dotenv.config({ path: './test.env' });

// Use your test MongoDB connection string
const TEST_MONGO_URI = `mongodb://${process.env.MONGO_HOST}:${process.env.MONGO_PORT}/${process.env.MONGO_DATABASE_NAME}`;

beforeAll(async () => {
  try {
    console.log('🔌 Connecting to test MongoDB...');

    await mongoose.connect(TEST_MONGO_URI);

    console.log('✅ Connected to test MongoDB');
  } catch (error) {
    console.error('❌ Failed to connect to test MongoDB:');
    console.error(error);
    throw error;
  }
});

afterAll(async () => {
  if (mongoose.connection.readyState !== 0) {
    // Drop the test database after all tests
    await mongoose.connection.dropDatabase();
    await mongoose.connection.close();
    console.log('✅ Disconnected from test MongoDB');
  }
});

// Clear all collections between tests
beforeEach(async () => {
  if (mongoose.connection.readyState !== 0) {
    const collections = mongoose.connection.collections;

    for (const key in collections) {
      const collection = collections[key];
      // eslint-disable-next-line no-await-in-loop
      await collection.deleteMany({});
    }
  }
});
