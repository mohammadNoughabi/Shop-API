import app from '../../src/app.ts';
import { createTestProduct } from '../helpers/product.helper.ts';
import { createTestCategory } from '../helpers/category.helper.ts';
import Product from '../../src/APIs/product/product.model.ts';
import { describe, it, expect, beforeAll } from 'vitest';
import request from 'supertest';
import mongoose, { Types } from 'mongoose';
import { getAdminToken } from '../helpers/auth.helper.ts';

describe('Product API', () => {
  // ===========================================
  // GET PRODUCT(S)
  // ===========================================

  beforeAll(async () => {
    await Product.deleteMany({});
    await createTestProduct();
  });

  describe('Get /api/product', () => {
    it('should retrieve a list of products', async () => {
      const res = await request(app).get('/api/product');
      expect(res.status).toBe(200);
      expect(res.body.data.products).toHaveLength(1);
    });

    it('should retrieve a single product by ID', async () => {
      const product = await createTestProduct();
      const res = await request(app).get(`/api/product/${product._id}`);
      expect(res.status).toBe(200);
    });

    it('should return 404 for non-existent product', async () => {
      const fakeId = new Types.ObjectId().toString();
      const res = await request(app).get(`/api/product/${fakeId}`);
      expect(res.status).toBe(404);
    });

    it('should return 404 for invalid product ID format', async () => {
      const res = await request(app).get(`/api/product/invalid-id`);
      expect(res.status).toBe(404);
    });

    it('should return 404 for valid ObjectId format but non-existent product', async () => {
      const fakeId = new Types.ObjectId().toString();
      const res = await request(app).get(`/api/product/${fakeId}`);
      expect(res.status).toBe(404);
    });
  });

  // ===========================================
  // POST PRODUCT
  // ===========================================
  describe('Post /api/product', () => {
    let adminToken: string;

    beforeAll(async () => {
      adminToken = await getAdminToken();
      await mongoose.connection.collection('categories').deleteMany({});
    });

    it('should create a new product', async () => {
      // first create a test category to get a valid categoryId for product creation
      const category = await createTestCategory();
      const categoryId = category._id.toString();

      const res = await request(app)
        .post('/api/product')
        .set('Cookie', adminToken)
        .field('title', 'New Product')
        .field('description', 'A new product description')
        .field('price', 19.99)
        .field('stock', 50)
        .field('categoryId', categoryId)
        .attach('image', Buffer.from('fake image content'), 'test-image.jpg')
        .attach('gallery', Buffer.from('fake gallery image'), 'gallery1.jpg');

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.product.title).toBe('New Product');
    });

    it('should return 400 for missing required fields', async () => {
      const res = await request(app)
        .post('/api/product')
        .set('Cookie', adminToken)
        .field('description', 'Missing title and price')
        .field('stock', 50);

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });

    it('should return 400 if image or gallery files are not provided', async () => {
      const category = await createTestCategory();
      const categoryId = category._id.toString();

      const res = await request(app)
        .post('/api/product')
        .set('Cookie', adminToken)
        .field('title', 'Product without Images')
        .field('description', 'This product is missing image and gallery files')
        .field('price', 9.99)
        .field('stock', 20)
        .field('categoryId', categoryId);

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });

    it('should reject if invalid files are uploaded', async () => {
      const category = await createTestCategory();
      const categoryId = category._id.toString();

      const res = await request(app)
        .post('/api/product')
        .set('Cookie', adminToken)
        .field('title', 'Product with Invalid Files')
        .field(
          'description',
          'This product has invalid image and gallery files',
        )
        .field('price', 9.99)
        .field('stock', 20)
        .field('categoryId', categoryId)
        .attach('image', Buffer.from('not an image'), 'test.txt')
        .attach('gallery', Buffer.from('not an image'), 'gallery.txt');

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });

    it('should return 400 for invalid categoryId', async () => {
      const res = await request(app)
        .post('/api/product')
        .set('Cookie', adminToken)
        .field('title', 'Product with Invalid Category')
        .field('description', 'This product has an invalid categoryId')
        .field('price', 9.99)
        .field('stock', 20)
        .field('categoryId', 'invalid-category-id');

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });

    it('should fail if product with the same title already exists', async () => {
      const category = await createTestCategory();
      const categoryId = category._id.toString();

      // First, create a product with a specific title
      await request(app)
        .post('/api/product')
        .set('Cookie', adminToken)
        .field('title', 'Duplicate Title Product')
        .field('description', 'First product with this title')
        .field('price', 9.99)
        .field('stock', 20)
        .field('categoryId', categoryId)
        .attach('image', Buffer.from('fake image content'), 'test-image.jpg')
        .attach('gallery', Buffer.from('fake gallery image'), 'gallery1.jpg');

      // Attempt to create another product with the same title
      const res = await request(app)
        .post('/api/product')
        .set('Cookie', adminToken)
        .field('title', 'Duplicate Title Product') // same title as before
        .field('description', 'Second product with duplicate title')
        .field('price', 19.99)
        .field('stock', 30)
        .field('categoryId', categoryId)
        .attach('image', Buffer.from('fake image content'), 'test-image.jpg')
        .attach('gallery', Buffer.from('fake gallery image'), 'gallery1.jpg');

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toBe('Product with this title already exists');
    });
  });

  // ===========================================
  // UPDATE PRODUCT
  // ===========================================
  describe('Put /api/product/:id', () => {
    let adminToken: string;

    beforeAll(async () => {
      adminToken = await getAdminToken();
    });

    it('should return 404 for non-existent product', async () => {
      const fakeId = new Types.ObjectId().toString();
      const res = await request(app)
        .put(`/api/product/${fakeId}`)
        .set('Cookie', adminToken)
        .field('title', 'Updated Title')
        .field('categoryId', new Types.ObjectId().toString());

      expect(res.status).toBe(404);
      expect(res.body.success).toBe(false);
    });

    it('should return 404 if product is deleted', async () => {
      const product = await createTestProduct({ isDeleted: true });
      const res = await request(app)
        .put(`/api/product/${product._id}`)
        .set('Cookie', adminToken)
        .field('title', 'Updated Title')
        .field('categoryId', new Types.ObjectId().toString());

      expect(res.status).toBe(404);
      expect(res.body.success).toBe(false);
    });

    it('should update an existing product title', async () => {
      const product = await createTestProduct();
      const res = await request(app)
        .put(`/api/product/${product._id}`)
        .set('Cookie', adminToken)
        .field('title', 'Updated Product Title')
        .field('categoryId', product.categoryId.toString());

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.product.title).toBe('Updated Product Title');
    });
  });
});
