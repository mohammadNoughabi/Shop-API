import Category from '../../src/APIs/category/category.model.ts';

export function createTestCategory(overrides = {}) {
  const defaultData = {
    title: `Test Category ${Date.now()}`,
    thumbnail: 'test.jpg',
    description: 'Test description',
    isDeleted: false,
  };

  return Category.create({ ...defaultData, ...overrides });
}
