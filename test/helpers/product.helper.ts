import { v4 as uuidv4 } from 'uuid';
import Product from '../../src/APIs/product/product.model.ts';
import { createTestCategory } from './category.helper.ts';
import generateUniqueSlug from '../../src/helpers/generateUniqueSlug.ts';

export async function createTestProduct(overrides = {}) {
  const category = await createTestCategory();

  const defaultData = {
    id: uuidv4(),
    title: `Test Product ${Date.now()}`,
    slug: generateUniqueSlug(`Test Product ${Date.now()}`),
    description: 'Test description',
    image: 'test.jpg',
    gallery: ['test1.jpg', 'test2.jpg'],
    price: 9.99,
    stock: 1,
    rate: 2.5,
    categoryId: category._id,
    isDeleted: false,
  };
  const productData = { ...defaultData, ...overrides };
  const product = new Product(productData);
  await product.save();
  return product;
}
