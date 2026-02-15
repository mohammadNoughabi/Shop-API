import mongoose from 'mongoose';
import { it, expect, describe, beforeAll, beforeEach } from 'vitest';
import request from 'supertest';
import app from '../../../src/app.ts';
import { createTestCategory } from '../../helpers/category.helper.ts';
import { createTestAdminToken } from '../../helpers/auth.helper.ts';

describe('Category API', () => {
  // Optional: clean DB before/after each test (or beforeAll/afterAll)
  beforeAll(async () => {
    await mongoose.connection.collection('categories').deleteMany({});
    await mongoose.connection.collection('users').deleteMany({});
  });

  // ───────────────────────────────────────────────
  //  GET /api/category   →  list all
  // ───────────────────────────────────────────────

  describe('GET /api/category', () => {
    it('returns 200 and an empty array when no categories exist', async () => {
      const res = await request(app).get('/api/category');

      expect(res.status).toBe(200);
      expect(res.body).toMatchObject({
        success: true,
        data: { categories: [] },
      });
      expect(Array.isArray(res.body.data.categories)).toBe(true);
    });

    it('returns 200 and a list of existing categories', async () => {
      // Arrange
      await createTestCategory({ title: 'Electronics' });
      await createTestCategory({ title: 'Books' });

      // Act
      const res = await request(app).get('/api/category');

      // Assert
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.categories).toHaveLength(2);
      expect(
        res.body.data.categories.map((c: { title: string }) => c.title),
      ).toEqual(expect.arrayContaining(['Electronics', 'Books']));
    });

    it('does not return deleted categories', async () => {
      // Arrange
      const deletedCategory = await createTestCategory({
        title: 'Deleted Category',
        isDeleted: true,
      });

      // Act
      const res = await request(app).get('/api/category');

      // Assert
      expect(res.status).toBe(200);
      expect(res.body.success).toBeTruthy();
      expect(res.body.data.categories).not.toEqual(
        expect.arrayContaining([
          expect.objectContaining({ _id: deletedCategory._id.toString() }),
        ]),
      );
    });

    it('handles server errors gracefully', async () => {
      // Simulate a server error by disconnecting the DB
      await mongoose.disconnect();
      const res = await request(app).get('/api/category');

      expect(res.status).toBe(500);
      expect(res.body.success).toBeFalsy();
      expect(res.body.message).toBe('Internal server error');
      // Reconnect for subsequent tests
      await mongoose.connect(process.env.MONGO_URI!, {
        dbName: process.env.DATABASE_NAME,
      });
    });
  });

  // ───────────────────────────────────────────────
  //  GET /api/category/:id   →  get one
  // ───────────────────────────────────────────────

  describe('GET /api/category/:id', () => {
    it('returns 200 and category when ID exists', async () => {
      const category = await createTestCategory({ title: 'Clothing' });

      const res = await request(app).get(`/api/category/${category._id}`);

      expect(res.status).toBe(200);
      expect(res.body).toMatchObject({
        success: true,
        data: {
          category: {
            _id: category._id.toString(),
            title: 'Clothing',
            thumbnail: 'test.jpg',
            description: 'Test description',
            isDeleted: false,
          },
        },
      });
    });

    it('returns 404 when category does not exist', async () => {
      const fakeId = new mongoose.Types.ObjectId().toString();

      const res = await request(app).get(`/api/category/${fakeId}`);

      expect(res.status).toBe(404);
      expect(res.body).toMatchObject({
        success: false,
        message: 'Category not found',
      });
    });

    it('handles server errors gracefully', async () => {
      // Simulate a server error by disconnecting the DB
      await mongoose.disconnect();
      const fakeId = new mongoose.Types.ObjectId().toString();
      const res = await request(app).get(`/api/category/${fakeId}`);

      expect(res.status).toBe(500);
      expect(res.body.success).toBeFalsy();
      expect(res.body.message).toBe('Internal server error');
      // Reconnect for subsequent tests
      await mongoose.connect(process.env.MONGO_URI!, {
        dbName: process.env.DATABASE_NAME,
      });
    });
  });

  // ───────────────────────────────────────────────
  //  POST /api/category   →  create (with file upload!)
  // ───────────────────────────────────────────────
  describe('POST /api/category', () => {
    let adminToken: string;
    // Create fresh admin token before each test that needs auth
    beforeEach(async () => {
      adminToken = await createTestAdminToken();
    });

    it('returns 400 if thumbnail is missing', async () => {
      const res = await request(app)
        .post('/api/category')
        .set('Cookie', [`accessToken=${adminToken}`])
        .field('title', 'New Category')
        .field('description', 'A new category without thumbnail');

      expect(res.status).toBe(400);
      expect(res.body).toMatchObject({
        success: false,
        message: 'Thumbnail is required',
      });
    });
  });
});
