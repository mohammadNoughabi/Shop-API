import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';
import { beforeAll, afterAll, beforeEach } from 'vitest';

let mongoServer: MongoMemoryServer;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const mongoUri = mongoServer.getUri();

  await mongoose.connect(mongoUri);
  console.log('✅ Test MongoDB connected (in-memory)');
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
  console.log('🛑 Test MongoDB stopped');
});

// Clear database between tests (prevents data leakage)
beforeEach(async () => {
  const collections = mongoose.connection.collections;

  await Promise.all(
    Object.values(collections).map((collection) => collection.deleteMany({})),
  );
});
