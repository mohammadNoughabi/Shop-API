import request from 'supertest';
import { describe, it, expect, beforeEach, afterAll, vi } from 'vitest';
import mongoose from 'mongoose';
import app from '../../src/app.ts';
import User from '../../src/APIs/user/user.model.ts';
import { createTestUser, getUserToken } from '../helpers/auth.helper.ts';

// ✅ Mock email sender
vi.mock('../../src/utils/mail.ts', () => ({
  default: vi.fn().mockResolvedValue(true),
}));

describe('Authentication API', () => {
  beforeEach(async () => {
    await User.deleteMany({});
  });

  afterAll(async () => {
    await mongoose.connection.close();
  });

  // =====================================
  // REGISTER
  // =====================================
  describe('POST /api/auth/register', () => {
    it('should register user successfully', async () => {
      const res = await request(app).post('/api/auth/register').send({
        username: 'testuser',
        email: 'test@example.com',
        password: 'Password123!',
      });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.createdUser.email).toBe('test@example.com');
    });

    it('should fail if email already exists', async () => {
      const existingUser = await createTestUser();

      const res = await request(app).post('/api/auth/register').send({
        username: existingUser.username,
        password: 'test-password',
        email: existingUser.email,
        role: 'regular',
      });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });

    it('should fail validation with invalid body', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({ email: 'invalid' });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });
  });

  // =====================================
  // LOGIN
  // =====================================
  describe('POST /api/auth/login', () => {
    it('should login successfully and return cookies', async () => {
      const user = await createTestUser();

      const res = await request(app).post('/api/auth/login').send({
        email: user.email,
        password: user.password,
      });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);

      const cookies = res.headers['set-cookie'];
      expect(Array.isArray(cookies)).toBe(true);
      if (!Array.isArray(cookies)) {
        throw new Error('Expected set-cookie to be an array');
      }
      expect(cookies).toBeDefined();
      expect(cookies.some((c: string) => c.includes('accessToken='))).toBe(
        true,
      );
      expect(cookies.some((c: string) => c.includes('refreshToken='))).toBe(
        true,
      );
    });

    it('should fail with wrong password', async () => {
      const user = await createTestUser();

      const res = await request(app).post('/api/auth/login').send({
        email: user.email,
        password: 'WrongPassword',
      });

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });

    it('should fail if no email or username provided', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({ password: 'Password123!' });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });
  });

  // =====================================
  // LOGOUT (Protected Route)
  // =====================================
  describe('POST /api/auth/logout', () => {
    it('should fail without authentication', async () => {
      const res = await request(app).post('/api/auth/logout');

      expect(res.status).toBe(401);
    });

    it('should logout successfully with valid token', async () => {
      const accessTokenCookie = await getUserToken();

      const res = await request(app)
        .post('/api/auth/logout')
        .set('Cookie', accessTokenCookie);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });
  });

  // =====================================
  // FORGOT PASSWORD
  // =====================================
  describe('POST /api/auth/forgot-pass', () => {
    it('should send reset email successfully', async () => {
      const user = await createTestUser();

      const res = await request(app).post('/api/auth/forgot-pass').send({
        email: user.email,
      });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });

    it('should return 404 if user not found', async () => {
      const res = await request(app).post('/api/auth/forgot-pass').send({
        email: 'notfound@example.com',
      });

      expect(res.status).toBe(404);
      expect(res.body.success).toBe(false);
    });

    it('should fail validation with invalid body', async () => {
      const res = await request(app)
        .post('/api/auth/forgot-pass')
        .send({ email: 'invalid-email' });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });
  });
});
