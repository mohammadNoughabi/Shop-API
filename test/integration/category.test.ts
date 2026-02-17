import { describe, it, expect, beforeAll } from 'vitest';
import request from 'supertest';
import mongoose from 'mongoose';
import app from '../../src/app.ts';
import { createTestCategory } from '../helpers/category.helper.ts';
import { getAdminToken } from '../helpers/auth.helper.ts';

describe('Category API', () => {
  describe('GET /api/category', () => {
    it('should return all categories', async () => {
      // Create some test categories
      await createTestCategory();
      await createTestCategory();

      const res = await request(app).get('/api/category');

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.categories.length).toBeGreaterThanOrEqual(2);
    });

    it('should return a category by ID', async () => {
      const category = await createTestCategory();

      const res = await request(app).get(`/api/category/${category._id}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.category._id).toBe(category._id.toString());
    });

    it('should return 404 for non-existent category', async () => {
      const fakeId = new mongoose.Types.ObjectId().toString();
      const res = await request(app).get(`/api/category/${fakeId}`);

      expect(res.status).toBe(404);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toBe('Category not found');
    });

    it('should return 400 for invalid category ID', async () => {
      const res = await request(app).get('/api/category/invalid-id');

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });
  });

  describe('POST /api/category', () => {
    let adminToken: string;

    beforeAll(async () => {
      adminToken = await getAdminToken();
      await mongoose.connection.collection('categories').deleteMany({});
    });

    it('should create a new category', async () => {
      const res = await request(app)
        .post('/api/category')
        .set('Cookie', adminToken)
        .field('title', 'New Category')
        .field('description', 'New category description')
        .attach(
          'thumbnail',
          Buffer.from('fake image content'),
          'thumbnail.jpg',
        );

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
    });

    it('should return 400 if thumbnail is missing', async () => {
      const res = await request(app)
        .post('/api/category')
        .set('Cookie', adminToken)
        .field('title', 'Category Without Thumbnail')
        .field('description', 'This category has no thumbnail');

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });

    it('should return 409 if category with same title exists', async () => {
      await createTestCategory({ title: 'Duplicate Title' });
      const res = await request(app)
        .post('/api/category')
        .set('Cookie', adminToken)
        .field('title', 'Duplicate Title')
        .field('description', 'This category has a duplicate title')
        .attach(
          'thumbnail',
          Buffer.from('fake image content'),
          'thumbnail.jpg',
        );

      expect(res.status).toBe(409);
      expect(res.body.success).toBe(false);
    });

    it('should return 401 if user is not authenticated(user role is not admin)', async () => {
      const res = await request(app)
        .post('/api/category')
        .field('title', 'Unauthorized Category')
        .field('description', 'This category should not be created')
        .attach(
          'thumbnail',
          Buffer.from('fake image content'),
          'thumbnail.jpg',
        );

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });
  });

  describe('DELETE /api/category/:id', () => {
    let adminToken: string;

    beforeAll(async () => {
      adminToken = await getAdminToken();
    });

    it('should delete a category', async () => {
      const category = await createTestCategory();
      const res = await request(app)
        .delete(`/api/category/${category._id}`)
        .set('Cookie', adminToken);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });

    it('should return 404 for non-existent category', async () => {
      const fakeId = new mongoose.Types.ObjectId().toString();
      const res = await request(app)
        .delete(`/api/category/${fakeId}`)
        .set('Cookie', adminToken);

      expect(res.status).toBe(404);
      expect(res.body.success).toBe(false);
    });

    it('should return 400 for invalid category ID', async () => {
      const res = await request(app)
        .delete('/api/category/invalid-id')
        .set('Cookie', adminToken);

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });
  });

  describe('PUT /api/category/:id', () => {
    let adminToken: string;

    beforeAll(async () => {
      adminToken = await getAdminToken();
    });

    it('should update a category', async () => {
      const category = await createTestCategory();
      const res = await request(app)
        .put(`/api/category/${category._id}`)
        .set('Cookie', adminToken)
        .send({ title: 'Updated Title' });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });

    it('should return 404 for non-existent category', async () => {
      const fakeId = new mongoose.Types.ObjectId().toString();
      const res = await request(app)
        .put(`/api/category/${fakeId}`)
        .set('Cookie', adminToken)
        .send({ title: 'Updated Title' });

      expect(res.status).toBe(404);
      expect(res.body.success).toBe(false);
    });

    it('should return 400 for invalid category ID', async () => {
      const res = await request(app)
        .put('/api/category/invalid-id')
        .set('Cookie', adminToken)
        .send({ title: 'Updated Title' });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });

    it('should return 400 if no fields provided for update', async () => {
      const category = await createTestCategory();
      const res = await request(app)
        .put(`/api/category/${category._id}`)
        .set('Cookie', adminToken)
        .send({});

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });

    it('should return 409 if category with same title exists', async () => {
      await createTestCategory({ title: 'Existing Title' });
      const category = await createTestCategory({ title: 'Another Title' });
      const res = await request(app)
        .put(`/api/category/${category._id}`)
        .set('Cookie', adminToken)
        .send({ title: 'Existing Title' });

      expect(res.status).toBe(409);
      expect(res.body.success).toBe(false);
    });
  });
});
