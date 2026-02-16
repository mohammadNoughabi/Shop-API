import request from 'supertest';
import app from '../../src/app.ts';

export const createTestUser = async (role: 'regular' | 'admin' = 'regular') => {
  const userData = {
    username: 'test-username',
    password: 'test-password',
    role: role,
    isDeleted: false,
  };
  const response = await request(app).post('/api/auth/register').send(userData);
  return response.body.data.createdUser;
};

export const getUserToken = async (role: 'regular' | 'admin' = 'regular') => {
  const user = await createTestUser(role);
  const response = await request(app)
    .post('/api/auth/login')
    .send({ username: user.username, password: 'test-password' });
  return response.body.data.token;
};

export const getAdminToken = async () => {
  const adminUser = await createTestUser('admin');
  const response = await request(app)
    .post('/api/auth/login')
    .send({ username: adminUser.username, password: 'test-password' });
  return response.body.data.token;
};
