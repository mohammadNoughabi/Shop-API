import request from 'supertest';
import app from '../../src/app.ts';
import User from '../../src/APIs/user/user.model.ts';

interface CreateUserOptions {
  username?: string;
  email?: string;
  password?: string;
}

export const createTestUser = async (options: CreateUserOptions = {}) => {
  const uniqueId = Date.now();

  const userData = {
    username: options.username ?? `testuser-${uniqueId}`,
    email: options.email ?? `test-${uniqueId}@example.com`,
    password: options.password ?? 'test-password',
  };

  const response = await request(app).post('/api/auth/register').send(userData);

  if (response.status !== 201) {
    throw new Error(`User creation failed: ${JSON.stringify(response.body)}`);
  }

  return userData; // return credentials for login usage
};

export const getUserToken = async (): Promise<string> => {
  const user = await createTestUser();

  const loginResponse = await request(app).post('/api/auth/login').send({
    email: user.email,
    password: user.password,
  });

  const cookies = loginResponse.headers['set-cookie'];

  if (!cookies || !Array.isArray(cookies)) {
    throw new Error('No cookies returned from login');
  }

  const accessTokenCookie = cookies.find((cookie: string) =>
    cookie.startsWith('accessToken='),
  );

  if (!accessTokenCookie) {
    throw new Error('Access token cookie not found');
  }

  return accessTokenCookie.split(';')[0];
};

export const createTestAdmin = async () => {
  const uniqueId = Date.now();

  const adminData = {
    username: `admin-${uniqueId}`,
    email: `admin-${uniqueId}@example.com`,
    password: 'admin-password',
  };

  const response = await request(app)
    .post('/api/auth/register')
    .send({
      ...adminData,
    });

  await User.findOneAndUpdate(
    { email: adminData.email },
    { role: 'admin' },
    { new: true },
  );

  if (response.status !== 201) {
    throw new Error(`Admin creation failed: ${JSON.stringify(response.body)}`);
  }

  return adminData; // return credentials for login usage
};

export const getAdminToken = async (): Promise<string> => {
  const admin = await createTestAdmin();

  const loginResponse = await request(app).post('/api/auth/login').send({
    email: admin.email,
    password: admin.password,
  });

  const cookies = loginResponse.headers['set-cookie'];

  if (!cookies || !Array.isArray(cookies)) {
    throw new Error('No cookies returned from login');
  }

  const accessTokenCookie = cookies.find((cookie: string) =>
    cookie.startsWith('accessToken='),
  );
  if (!accessTokenCookie) {
    throw new Error('Access token cookie not found');
  }
  return accessTokenCookie.split(';')[0];
};
