import { beforeAll, afterAll } from 'vitest';
import {
  clearDatabase,
  connectToDatabase,
  disconnectFromDatabase,
} from './dbHelper.ts';

beforeAll(async () => {
  await connectToDatabase();
}, 60000);

afterAll(async () => {
  await disconnectFromDatabase();
  await clearDatabase();
});
