/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable no-await-in-loop */
import mongoose from 'mongoose';

export async function connectToDatabase() {
  const uri = process.env.MONGO_URI;
  if (!uri) throw new Error('MONGO_URI not set');

  const MAX_ATTEMPTS = 8;
  let attempt = 0;

  while (attempt < MAX_ATTEMPTS) {
    attempt++;
    try {
      await mongoose.connect(uri, {
        dbName: process.env.DATABASE_NAME,
        directConnection: true,
        replicaSet: undefined,
        readPreference: 'primaryPreferred',
        serverSelectionTimeoutMS: 12000,
        socketTimeoutMS: 45000,
        family: 4, // optional: prefer IPv4 on localhost
      });

      // Quick write probe
      await mongoose.connection.db
        ?.collection('probe')
        .insertOne({ ts: new Date() });
      await mongoose.connection.db?.collection('probe').deleteOne({});

      console.log('[DB] Connected and writable after', attempt, 'attempt(s)');
      return;
    } catch (err: any) {
      console.warn(
        `[DB] Connect attempt ${attempt}/${MAX_ATTEMPTS} failed:`,
        err.message,
      );
      if (attempt === MAX_ATTEMPTS) throw err;
      await new Promise((r) => setTimeout(r, 1500)); // backoff
    }
  }
}

export async function disconnectFromDatabase() {
  await mongoose.disconnect();
}

export async function clearDatabase() {
  if (mongoose.connection.readyState !== 1) {
    return;
  }

  const collections = mongoose.connection.collections;
  await Promise.all(
    Object.values(collections).map(async (collection) => {
      await collection.deleteMany({});
    }),
  );
}
