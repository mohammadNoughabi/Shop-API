import app from '../../src/app.ts';
import { createTestProduct } from '../helpers/product.helper.ts';
import Product from '../../src/APIs/product/product.model.ts';
import { describe, it, expect, beforeAll } from 'vitest';
import request from 'supertest';

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
  });

  // ===========================================
  // POST PRODUCT
  // ===========================================
  describe('Post /api/product', () => {});

  // ===========================================
  // UPDATE PRODUCT
  // ===========================================
  describe('Put /api/product/:id', () => {});

  // ===========================================
  // DELETE PRODUCT
  // ===========================================
  describe('Delete /api/product/:id', () => {});
});
