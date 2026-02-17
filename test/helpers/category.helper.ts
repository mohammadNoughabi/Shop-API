import Category from '../../src/APIs/category/category.model.ts';

export async function createTestCategory(overrides = {}) {
  const defaultData = {
    title: `Test Category ${Date.now()}`,
    thumbnail: 'test.jpg',
    description: 'Test description',
    isDeleted: false,
  };

  const category = await Category.create({ ...defaultData, ...overrides });
  return category;
}
