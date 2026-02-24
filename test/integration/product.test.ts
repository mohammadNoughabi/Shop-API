import app from '../../src/app.ts';
import { createTestProduct } from '../helpers/product.helper.ts';
import { createTestCategory } from '../helpers/category.helper.ts';
import type { IProduct } from '../../src/APIs/product/product.interface.ts';
import Product from '../../src/APIs/product/product.model.ts';
import { describe, it, expect, beforeAll, beforeEach } from 'vitest';
import request from 'supertest';
import mongoose, { Types } from 'mongoose';
import { v4 as uuidv4 } from 'uuid';
import { getAdminToken, getUserToken } from '../helpers/auth.helper.ts';

describe('Product API', () => {
  // ===========================================
  // GET PRODUCT(S)
  // ===========================================

  beforeAll(async () => {
    await Product.deleteMany({});
    await createTestProduct();
  });

  describe('Get /api/product', () => {
    beforeEach(async () => {
      await mongoose.connection.collection('products').deleteMany({});
    });

    it('should retrieve a list of products', async () => {
      await createTestProduct();
      const res = await request(app).get('/api/product');
      expect(res.status).toBe(200);
      expect(res.body.data.products).toHaveLength(1);
    });

    it('should retrieve a single product by ID', async () => {
      const product = await createTestProduct();
      const res = await request(app).get(`/api/product/${product.id}`);
      expect(res.status).toBe(200);
    });

    it('should return 404 for non-existent product', async () => {
      const fakeId = uuidv4();
      const res = await request(app).get(`/api/product/${fakeId}`);
      expect(res.status).toBe(404);
    });

    it('should return 400 for invalid product ID format', async () => {
      const res = await request(app).get(`/api/product/invalid-id`);
      expect(res.status).toBe(400);
    });

    it('should return 404 for valid UUID format but non-existent product', async () => {
      const fakeId = uuidv4();
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

    it('should return 400 if big files are uploaded', async () => {
      const category = await createTestCategory();
      const categoryId = category._id.toString();

      const bigBuffer = Buffer.alloc(5 * 1024 * 1024 + 1); // 5MB + 1 byte

      const res = await request(app)
        .post('/api/product')
        .set('Cookie', adminToken)
        .field('title', 'Product with Big Files')
        .field(
          'description',
          'This product has image and gallery files that are too big',
        )
        .field('price', 9.99)
        .field('stock', 20)
        .field('categoryId', categoryId)
        .attach('image', bigBuffer, 'big-image.jpg')
        .attach('gallery', bigBuffer, 'big-gallery.jpg');

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
      const fakeId = uuidv4();
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
        .put(`/api/product/${product.id}`)
        .set('Cookie', adminToken)
        .field('title', 'Updated Title')
        .field('categoryId', new Types.ObjectId().toString());

      expect(res.status).toBe(404);
      expect(res.body.success).toBe(false);
    });

    it('should update an existing product title', async () => {
      const product = await createTestProduct();
      const res = await request(app)
        .put(`/api/product/${product.id}`)
        .set('Cookie', adminToken)
        .field('title', 'Updated Product Title')
        .field('categoryId', product.categoryId.toString());

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.product.title).toBe('Updated Product Title');
    });

    it('should return 400 for invalid categoryId', async () => {
      const product = await createTestProduct();
      const res = await request(app)
        .put(`/api/product/${product.id}`)
        .set('Cookie', adminToken)
        .field('title', 'Another Update')
        .field('categoryId', 'invalid-category-id');

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });

    it('should return 400 if invalid files are uploaded', async () => {
      const product = await createTestProduct();
      const res = await request(app)
        .put(`/api/product/${product.id}`)
        .set('Cookie', adminToken)
        .field('title', 'Update with Invalid Files')
        .field('categoryId', product.categoryId.toString())
        .attach('image', Buffer.from('not an image'), 'test.txt')
        .attach('gallery', Buffer.from('not an image'), 'gallery.txt');

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });

    it('should return 400 if another product with the same title already exists', async () => {
      const category = await createTestCategory();
      const categoryId = category._id.toString();

      // Create the first product with a specific title
      await createTestProduct({
        title: 'Existing Product Title',
        categoryId: new Types.ObjectId(categoryId),
      });

      // Create another product that we will attempt to update to the same title
      const productToUpdate = await createTestProduct({
        title: 'Product To Update',
        categoryId: new Types.ObjectId(categoryId),
      });

      // Attempt to update the second product's title to the same title as the first product
      const res = await request(app)
        .put(`/api/product/${productToUpdate.id}`)
        .set('Cookie', adminToken)
        .field('title', 'Existing Product Title') // same title as the first product
        .field('categoryId', categoryId);

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });

    it('should return 400 for invalid file types during update', async () => {
      const product = await createTestProduct();
      const res = await request(app)
        .put(`/api/product/${product.id}`)
        .set('Cookie', adminToken)
        .field('title', 'Update with Invalid Files')
        .field('categoryId', product.categoryId.toString())
        .attach('image', Buffer.from('not an image'), 'test.txt')
        .attach('gallery', Buffer.from('not an image'), 'gallery.txt');

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });

    it('should return 400 if big files are uploaded during update', async () => {
      const product = await createTestProduct();
      const bigBuffer = Buffer.alloc(5 * 1024 * 1024 + 1); // 5MB + 1 byte
      const res = await request(app)
        .put(`/api/product/${product.id}`)
        .set('Cookie', adminToken)
        .field('title', 'Update with Big Files')
        .field('categoryId', product.categoryId.toString())
        .attach('image', bigBuffer, 'big-image.jpg')
        .attach('gallery', bigBuffer, 'big-gallery.jpg');

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });
  });

  // ===========================================
  // DELETE PRODUCT
  // ===========================================
  describe('Delete /api/product/:id', () => {
    let adminToken: string;

    beforeAll(async () => {
      adminToken = await getAdminToken();
    });

    it('should return 404 for non-existent product', async () => {
      const fakeId = uuidv4();
      const res = await request(app)
        .delete(`/api/product/${fakeId}`)
        .set('Cookie', adminToken);

      expect(res.status).toBe(404);
      expect(res.body.success).toBe(false);
    });

    it('should return 404 if product is already deleted', async () => {
      const product = await createTestProduct({ isDeleted: true });
      const res = await request(app)
        .delete(`/api/product/${product.id}`)
        .set('Cookie', adminToken);

      expect(res.status).toBe(404);
      expect(res.body.success).toBe(false);
    });

    it('should delete an existing product', async () => {
      const product = await createTestProduct();
      const res = await request(app)
        .delete(`/api/product/${product.id}`)
        .set('Cookie', adminToken);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });

    it('should return 404 when trying to delete the same product again', async () => {
      const product = await createTestProduct();
      // First delete
      await request(app)
        .delete(`/api/product/${product.id}`)
        .set('Cookie', adminToken);

      // Attempt to delete again
      const res = await request(app)
        .delete(`/api/product/${product.id}`)
        .set('Cookie', adminToken);

      expect(res.status).toBe(404);
      expect(res.body.success).toBe(false);
    });
  });

  // ===========================================
  // RESTORE PRODUCT
  // ===========================================
  describe('Restore /api/product/:id/', () => {
    let adminToken: string;

    beforeAll(async () => {
      adminToken = await getAdminToken();
    });

    it('should restore a soft deleted product', async () => {
      const product = await createTestProduct();
      // First soft delete
      await request(app)
        .delete(`/api/product/${product.id}`)
        .set('Cookie', adminToken);

      // Restore the product
      const res = await request(app)
        .post(`/api/product/${product.id}/restore`)
        .set('Cookie', adminToken);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });

    it('should return 404 when trying to restore a product that is not deleted', async () => {
      const product = await createTestProduct();
      const res = await request(app)
        .post(`/api/product/${product.id}/restore`)
        .set('Cookie', adminToken);

      expect(res.status).toBe(404);
      expect(res.body.success).toBe(false);
    });

    it('should return 404 when trying to restore a non-existent product', async () => {
      const fakeId = uuidv4();
      const res = await request(app)
        .post(`/api/product/${fakeId}/restore`)
        .set('Cookie', adminToken);

      expect(res.status).toBe(404);
      expect(res.body.success).toBe(false);
    });

    it('should include the restored product in the product list', async () => {
      const product = await createTestProduct();
      // First soft delete
      await request(app)
        .delete(`/api/product/${product.id}`)
        .set('Cookie', adminToken);

      // Restore the product
      await request(app)
        .post(`/api/product/${product.id}/restore`)
        .set('Cookie', adminToken);

      // Get the list of products
      const res = await request(app).get('/api/product');
      expect(res.status).toBe(200);
      const restoredProduct = res.body.data.products.find(
        (p: IProduct) => p.id === product.id,
      );
      expect(restoredProduct).toBeDefined();
    });
  });

  // ===========================================
  // AUTHENTICATION AND AUTHORIZATION
  // ===========================================
  describe('Authentication and Authorization', () => {
    it('should return 401 for unauthenticated requests to protected endpoints', async () => {
      const res = await request(app)
        .post('/api/product')
        .field('title', 'Unauthorized Product')
        .field('description', 'This should not be created')
        .field('price', 9.99)
        .field('stock', 20)
        .field('categoryId', new Types.ObjectId().toString());

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });

    it('should return 403 for authenticated users without admin role', async () => {
      // Assuming we have a helper function to get a token for a non-admin user
      const userToken = await getUserToken();

      const res = await request(app)
        .post('/api/product')
        .set('Cookie', userToken)
        .field('title', 'Forbidden Product')
        .field('description', 'This should not be created')
        .field('price', 9.99)
        .field('stock', 20)
        .field('categoryId', new Types.ObjectId().toString());

      expect(res.status).toBe(403);
      expect(res.body.success).toBe(false);
    });
  });
});
