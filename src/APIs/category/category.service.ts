// import models
import Category from "./category.model.ts";

// import types
import type {
  ICategory,
  CategoryCreationData,
  CategoryUpdateData,
} from "./category.interface.ts";

class CategoryService {
  constructor() {}

  async getAllCategories(): Promise<ICategory[]> {
    const categories = await Category.find({ isDeleted: false });
    return categories;
  }

  async getCategoryById(id: string): Promise<ICategory | null> {
    const category = await Category.findById(id);
    return category;
  }

  async createCategory(
    creationData: CategoryCreationData,
  ): Promise<ICategory | null> {
    const existingCategory = await Category.findOne({
      title: creationData.title,
      isDeleted: false,
    });
    if (existingCategory) {
      return null;
    }
    const newCategory = await Category.create(creationData);
    return newCategory;
  }

  async updateCategory(
    id: string,
    updateData: CategoryUpdateData,
  ): Promise<ICategory | null> {
    const existingCategory: ICategory | null = await Category.findOne({
      _id: id,
      isDeleted: false,
    });
    if (!existingCategory) {
      return null;
    }
    const updatedCategory = await Category.findByIdAndUpdate(id, updateData, {
      new: true,
    });
    return updatedCategory;
  }

  async deleteCategory(id: string): Promise<ICategory | null> {
    const deletedCategory = await Category.findByIdAndUpdate(
      id,
      { isDeleted: true, deletedAt: new Date() },
      { new: true },
    );
    return deletedCategory;
  }
}

export default new CategoryService();
