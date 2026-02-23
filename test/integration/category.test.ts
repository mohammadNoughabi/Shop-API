import { describe, it, expect, beforeAll, beforeEach } from 'vitest';
import request from 'supertest';
import mongoose from 'mongoose';
import { v4 as uuidv4 } from 'uuid';
import app from '../../src/app.ts';
import { createTestCategory } from '../helpers/category.helper.ts';
import { createTestProduct } from '../helpers/product.helper.ts';
import { getAdminToken, getUserToken } from '../helpers/auth.helper.ts';

describe('Category API', () => {
  // =====================================
  // GET CATEGORY(S)
  // =====================================
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

      const res = await request(app).get(`/api/category/${category.id}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.category.id).toBe(category.id);
    });

    it('should return 404 for non-existent category', async () => {
      const fakeId = uuidv4();
      const res = await request(app).get(`/api/category/${fakeId}`);

      expect(res.status).toBe(404);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toBe('Category not found');
    });

    it('should return 404 for valid ObjectId format but non-existent category', async () => {
      const fakeId = uuidv4();
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

  // =====================================
  // POST CATEGORY
  // =====================================
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

    it('should reject invalid image types', async () => {
      const res = await request(app)
        .post('/api/category')
        .set('Cookie', adminToken)
        .field('title', 'Invalid Image Category')
        .field('description', 'Testing invalid image type')
        .attach('thumbnail', Buffer.from('fake text content'), 'document.txt');

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });

    it('should reject images that are too large', async () => {
      // Create a large buffer (e.g., 11MB if limit is 10MB)
      const largeBuffer = Buffer.alloc(11 * 1024 * 1024); // 11MB

      const res = await request(app)
        .post('/api/category')
        .set('Cookie', adminToken)
        .field('title', 'Large Image Category')
        .field('description', 'Testing large image')
        .attach('thumbnail', largeBuffer, 'large.jpg');

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });

    it('should allow updating thumbnail with new image', async () => {
      const category = await createTestCategory();

      const res = await request(app)
        .put(`/api/category/${category.id}`)
        .set('Cookie', adminToken)
        .attach('thumbnail', Buffer.from('new image'), 'new-thumbnail.jpg');

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
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

  // =====================================
  // UPDATE CATEGORY
  // =====================================
  describe('PUT /api/category/:id', () => {
    let adminToken: string;

    beforeAll(async () => {
      adminToken = await getAdminToken();
    });

    it('should update a category', async () => {
      const category = await createTestCategory();
      const res = await request(app)
        .put(`/api/category/${category.id}`)
        .set('Cookie', adminToken)
        .send({ title: 'Updated Title' });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });

    it('should return 404 for non-existent category', async () => {
      const fakeId = uuidv4();
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
        .put(`/api/category/${category.id}`)
        .set('Cookie', adminToken)
        .send({});

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });

    it('should return 409 if category with same title exists', async () => {
      await createTestCategory({ title: 'Existing Title' });
      const category = await createTestCategory({ title: 'Another Title' });
      const res = await request(app)
        .put(`/api/category/${category.id}`)
        .set('Cookie', adminToken)
        .send({ title: 'Existing Title' });

      expect(res.status).toBe(409);
      expect(res.body.success).toBe(false);
    });
  });

  // =====================================
  // DELETE CATEGORY
  // =====================================
  describe('DELETE /api/category/:id', () => {
    let adminToken: string;

    beforeAll(async () => {
      adminToken = await getAdminToken();
    });

    // Add this to clean up before each test
    beforeEach(async () => {
      await mongoose.connection.collection('categories').deleteMany({});
      await mongoose.connection.collection('products').deleteMany({});
    });

    it('should delete a category', async () => {
      const category = await createTestCategory();
      const res = await request(app)
        .delete(`/api/category/${category.id}`)
        .set('Cookie', adminToken);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });

    it('should return 404 for non-existent category', async () => {
      const fakeId = uuidv4();
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

    it('should return 400 if category has associated products', async () => {
      const category = await createTestCategory();
      // Create a product in this category
      await createTestProduct({
        categoryId: category._id.toString(),
      });

      const res = await request(app)
        .delete(`/api/category/${category.id}`)
        .set('Cookie', adminToken);

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toBe(
        'Cannot delete category with associated products',
      );
    });
  });

  // =====================================
  // SOFT DELETE AND RESTORE
  // =====================================
  describe('Category Soft Delete and Restore', () => {
    let adminToken: string;

    beforeAll(async () => {
      adminToken = await getAdminToken();
      await mongoose.connection.collection('categories').deleteMany({});
    });

    it('should soft delete a category', async () => {
      const category = await createTestCategory();

      const deleteRes = await request(app)
        .delete(`/api/category/${category.id}`)
        .set('Cookie', adminToken);

      expect(deleteRes.status).toBe(200);
      expect(deleteRes.body.success).toBe(true);

      // Verify category is not returned in normal queries
      const getRes = await request(app).get(`/api/category/${category.id}`);

      expect(getRes.status).toBe(404);
    });

    it('should restore a soft-deleted category', async () => {
      const category = await createTestCategory();

      // Delete first
      const deleteRes = await request(app)
        .delete(`/api/category/${category.id}`)
        .set('Cookie', adminToken);

      expect(deleteRes.status).toBe(200);

      // Verify it's actually deleted by trying to get it
      const getAfterDelete = await request(app).get(
        `/api/category/${category.id}`,
      );

      expect(getAfterDelete.status).toBe(404);

      // Restore
      const restoreRes = await request(app)
        .post(`/api/category/${category.id}/restore`)
        .set('Cookie', adminToken);

      expect(restoreRes.status).toBe(200);
      expect(restoreRes.body.success).toBe(true);

      // Verify category is accessible again
      const getAfterRestore = await request(app).get(
        `/api/category/${category.id}`,
      );

      expect(getAfterRestore.status).toBe(200);
    });

    it('should include soft-deleted categories with special query param', async () => {
      const category = await createTestCategory();

      await request(app)
        .delete(`/api/category/${category.id}`)
        .set('Cookie', adminToken);

      // Get all categories including deleted
      const res = await request(app)
        .get('/api/category')
        .query({ includeDeleted: true })
        .set('Cookie', adminToken);

      expect(res.status).toBe(200);
      expect(
        res.body.data.categories.some(
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          (c: any) => c.id === category.id,
        ),
      ).toBe(true);
    });
  });

  // =====================================
  // Check authorization for protected routes
  // =====================================
  describe('Category Authorization', () => {
    let userToken: string;

    beforeAll(async () => {
      userToken = await getUserToken(); // Regular user token
    });

    it('should prevent non-admin from creating categories', async () => {
      const res = await request(app)
        .post('/api/category')
        .set('Cookie', userToken)
        .field('title', 'User Created Category')
        .field('description', 'Should not be created')
        .attach('thumbnail', Buffer.from('fake'), 'thumb.jpg');

      expect(res.status).toBe(403); // Forbidden, not just 401
      expect(res.body.success).toBe(false);
    });

    it('should prevent non-admin from deleting categories', async () => {
      const category = await createTestCategory();

      const res = await request(app)
        .delete(`/api/category/${category.id}`)
        .set('Cookie', userToken);

      expect(res.status).toBe(403);
      expect(res.body.success).toBe(false);
    });

    it('should prevent non-admin from updating categories', async () => {
      const category = await createTestCategory();

      const res = await request(app)
        .put(`/api/category/${category.id}`)
        .set('Cookie', userToken)
        .send({ title: 'Hacked Title' });

      expect(res.status).toBe(403);
      expect(res.body.success).toBe(false);
    });

    it('should allow public GET requests without authentication', async () => {
      const res = await request(app).get('/api/category');
      expect(res.status).toBe(200);
    });
  });
});
