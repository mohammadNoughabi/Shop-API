import { v4 as uuidv4 } from 'uuid';
import Category from '../../src/APIs/category/category.model.ts';
import generateUniqueSlug from '../../src/helpers/generateUniqueSlug.ts';

export async function createTestCategory(overrides = {}) {
  const defaultData = {
    id: uuidv4(),
    title: `Test Category ${Date.now()}`,
    slug: generateUniqueSlug(`Test Category ${Date.now()}`),
    thumbnail: 'test.jpg',
    description: 'Test description',
    isDeleted: false,
  };

  const category = await Category.create({ ...defaultData, ...overrides });
  return category;
}
