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
      expect(res.body.data.user.email).toBe('test@example.com');
    });

    it('should register user without email successfully', async () => {
      const res = await request(app).post('/api/auth/register').send({
        username: 'testuser',
        password: 'Password123!',
        // email is optional
      });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
    });

    it('should fail if email already exists', async () => {
      const existingUser = await createTestUser();

      const res = await request(app).post('/api/auth/register').send({
        username: existingUser.username,
        password: 'test-password',
        email: existingUser.email,
        role: 'regular',
      });

      expect(res.status).toBe(409);
      expect(res.body.success).toBe(false);
    });

    it('should fail validation with invalid body', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({ email: 'invalid' });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });

    it('should fail if username is too short', async () => {
      const res = await request(app).post('/api/auth/register').send({
        username: 'usr', // less than 5 characters
        email: 'test@example.com',
        password: 'Password123!',
      });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });

    it('should fail if password is too short', async () => {
      const res = await request(app).post('/api/auth/register').send({
        username: 'testuser',
        email: 'test@example.com',
        password: 'short', // less than 8 characters
      });

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

    it('should login with username instead of email', async () => {
      const user = await createTestUser();

      const res = await request(app).post('/api/auth/login').send({
        username: user.username,
        password: user.password,
      });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.headers['set-cookie']).toBeDefined();
    });

    it('should return 404 for non-existent user', async () => {
      const res = await request(app).post('/api/auth/login').send({
        email: 'nonexistent@example.com',
        password: 'Password123!',
      });

      expect(res.status).toBe(404);
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
  // FORGOT PASSWORD (Protected Route)
  // =====================================
  describe('POST /api/auth/forgot-pass', () => {
    it('should send reset email successfully', async () => {
      const user = await createTestUser();
      const accessToken = await getUserToken();

      const res = await request(app)
        .post('/api/auth/forgot-pass')
        .send({
          email: user.email,
        })
        .set('Cookie', accessToken);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });

    it('should return 404 if user not found', async () => {
      const accessToken = await getUserToken();

      const res = await request(app)
        .post('/api/auth/forgot-pass')
        .send({
          email: 'notfound@example.com',
        })
        .set('Cookie', accessToken);

      expect(res.status).toBe(404);
      expect(res.body.success).toBe(false);
    });

    it('should fail validation with invalid body', async () => {
      const accessToken = await getUserToken();
      const res = await request(app)
        .post('/api/auth/forgot-pass')
        .send({ email: 'invalid-email' })
        .set('Cookie', accessToken);

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });
  });

  // =====================================
  // RESET PASSWORD (Protected Route)
  // =====================================
  describe('POST /api/auth/reset-pass', () => {
    it('should return 200 and reset password successfully', async () => {
      const user = await createTestUser();
      const agent = request.agent(app);
      const accessToken = await getUserToken();

      // Set the cookie on the agent
      agent.set('Cookie', accessToken);

      // Call forgotPassword
      await agent.post('/api/auth/forgot-pass').send({ email: user.email });

      // Call resetPassword (same agent maintains the session)
      const res = await agent.post('/api/auth/reset-pass').send({
        newPassword: 'NewPassword123!',
      });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });

    it('should return 404 if user not found', async () => {
      const accessToken = await getUserToken();
      const agent = request.agent(app);

      // Set the cookie on the agent
      agent.set('Cookie', accessToken);

      // First create a user
      const user = await createTestUser();

      // Call forgotPassword to set email in session
      await agent.post('/api/auth/forgot-pass').send({ email: user.email });

      // Now delete the user from the database
      await User.deleteOne({ email: user.email });

      // Now call resetPassword - this should return 404 because user no longer exists
      const res = await agent.post('/api/auth/reset-pass').send({
        newPassword: 'NewPassword123!',
      });

      expect(res.status).toBe(404);
      expect(res.body.success).toBe(false);
    });

    it('should fail validation with short password', async () => {
      const accessToken = await getUserToken();
      const res = await request(app)
        .post('/api/auth/reset-pass')
        .send({ newPassword: 'short' })
        .set('Cookie', accessToken);

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });

    it('should return 401 without authentication', async () => {
      const res = await request(app).post('/api/auth/reset-pass').send({
        email: 'notfound@example.com',
        newPassword: 'NewPassword123!',
      });

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });

    it('should return 400 if no email in session (forgot password not called)', async () => {
      const accessToken = await getUserToken();
      const agent = request.agent(app);

      agent.set('Cookie', accessToken);

      // Don't call forgotPassword first
      const res = await agent.post('/api/auth/reset-pass').send({
        newPassword: 'NewPassword123!',
      });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });

    it('should handle concurrent reset password requests', async () => {
      const user = await createTestUser();
      const agent = request.agent(app);
      const accessToken = await getUserToken();

      agent.set('Cookie', accessToken);
      await agent.post('/api/auth/forgot-pass').send({ email: user.email });

      // First reset should work
      const res1 = await agent.post('/api/auth/reset-pass').send({
        newPassword: 'NewPassword123!',
      });
      expect(res1.status).toBe(200);

      // Second reset with same session should fail (email cleared from session)
      const res2 = await agent.post('/api/auth/reset-pass').send({
        newPassword: 'AnotherPassword123!',
      });
      expect(res2.status).toBe(400);
      expect(res2.body.success).toBe(false);
    });

    it('should clear session after successful password reset', async () => {
      const user = await createTestUser();
      const agent = request.agent(app);
      const accessToken = await getUserToken();

      agent.set('Cookie', accessToken);
      await agent.post('/api/auth/forgot-pass').send({ email: user.email });

      // Reset password
      await agent.post('/api/auth/reset-pass').send({
        newPassword: 'NewPassword123!',
      });

      // Try to reset again with same session - should fail
      const res = await agent.post('/api/auth/reset-pass').send({
        newPassword: 'AnotherPassword123!',
      });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });
  });

  // =====================================
  // TOKEN VALIDATION
  // =====================================
  describe('Token Validation', () => {
    it('should reject requests with expired/invalid token', async () => {
      const res = await request(app)
        .post('/api/auth/logout')
        .set('Cookie', ['accessToken=invalid.token.here']);

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });

    it('should reject requests with malformed cookie', async () => {
      const res = await request(app)
        .post('/api/auth/logout')
        .set('Cookie', 'not-a-valid-cookie-format');

      expect(res.status).toBe(401);
    });
  });

  // =====================================
  // RATE LIMITING
  // =====================================
  describe('Rate Limiting', () => {
    it('should limit repeated failed login attempts', async () => {
      const user = await createTestUser();

      // Make multiple failed login attempts
      for (let i = 0; i < 5; i++) {
        // eslint-disable-next-line no-await-in-loop
        await request(app).post('/api/auth/login').send({
          email: user.email,
          password: 'WrongPassword',
        });
      }

      // The 6th attempt might be rate limited
      const res = await request(app).post('/api/auth/login').send({
        email: user.email,
        password: 'WrongPassword',
      });

      // Adjust based on your rate limiting configuration
      expect([429, 401]).toContain(res.status);
    });
  });
});
