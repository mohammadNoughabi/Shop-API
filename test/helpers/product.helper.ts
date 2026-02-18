import Product from '../../src/APIs/product/product.model.ts';
import { createTestCategory } from './category.helper.ts';

export async function createTestProduct(overrides = {}) {
  const category = await createTestCategory();

  const defaultData = {
    title: `Test Product ${Date.now()}`,
    description: 'Test description',
    image: 'test.jpg',
    gallery: ['test1.jpg', 'test2.jpg'],
    price: 9.99,
    stock: 1,
    rate: 2.5,
    category: category._id,
    isDeleted: false,
  };
  const productData = { ...defaultData, ...overrides };
  const product = new Product(productData);
  await product.save();
  return product;
}
