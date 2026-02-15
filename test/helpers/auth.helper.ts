// test/helpers/auth.helpers.ts
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import User from '../../src/APIs/user/user.model.ts';
import type { IUser } from '../../src/APIs/user/user.interface.ts';

// IMPORTANT: Use the SAME ACCESS_TOKEN_SECRET as in your real app (from .env.test or test.env)
const ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET as string;

/**
 * Creates a test admin user in the database and returns a valid JWT access token
 * Useful for testing protected/admin-only routes
 */
export async function createTestAdminToken(): Promise<string> {
  // Clean any existing test admin to avoid duplicates
  await User.deleteOne({ username: 'testUser' });

  const adminUser: IUser = await User.create({
    username: 'testUser',
    password: await bcrypt.hash('Test1234!', 10),
    role: 'admin',
    // add other required fields if your User model has them
  });

  const payload = {
    id: adminUser._id.toString(),
    username: adminUser.username,
    role: adminUser.role,
  };

  console.log(
    'ACCESS_TOKEN_SECRET in test helper:',
    ACCESS_TOKEN_SECRET ? 'present' : 'MISSING',
  );
  const token = jwt.sign(payload, ACCESS_TOKEN_SECRET, {
    expiresIn: '1h', // enough for test duration
  });

  return token;
}

/**
 * Creates a test regular user (non-admin) and returns token
 * Useful for testing role-based access denial
 */
export async function createTestUserToken(): Promise<string> {
  await User.deleteOne({ username: 'testUser' });

  const user: IUser = await User.create({
    username: 'testUser',
    password: await bcrypt.hash('Test1234!', 10),
    role: 'regular',
  });

  const payload = {
    id: user._id.toString(),
    username: user.username,
    role: user.role,
  };

  return jwt.sign(payload, ACCESS_TOKEN_SECRET, { expiresIn: '1h' });
}

/**
 * Quick helper to generate expired token (for negative testing)
 */
export function createExpiredToken(): string {
  const payload = { id: 'fake', username: 'fakeUsername', role: 'admin' };
  return jwt.sign(payload, ACCESS_TOKEN_SECRET, { expiresIn: '-10s' }); // already expired
}
