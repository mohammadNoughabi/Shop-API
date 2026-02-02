// import models
import Category from "../models/Category.ts";

// import types
import type { ICategory } from "../interfaces/ICategory.ts";

class CategoryService {
  constructor() {}

  async createCategory(
    creationData: Pick<ICategory, "title" | "description" | "thumbnail">,
  ): Promise<ICategory> {
    const newCategory = await Category.create(creationData);
    return newCategory;
  }

  async getAllCategories(): Promise<ICategory[]> {
    const categories = await Category.find({ isDeleted: false });
    return categories;
  }

  async getCategoryById(id: string): Promise<ICategory | null> {
    const category = await Category.findById(id);
    return category;
  }

  async deleteCategory(id: string): Promise<ICategory | null> {
    const deletedCategory = await Category.findByIdAndUpdate(
      id,
      { isDeleted: true },
      { new: true },
    );
    return deletedCategory;
  }

  async updateCategory(
    id: string,
    updateData: Partial<Pick<ICategory, "title" | "description" | "thumbnail">>,
  ): Promise<ICategory | null> {
    const updatedCategory = await Category.findByIdAndUpdate(id, updateData, {
      new: true,
    });
    return updatedCategory;
  }
}

export default new CategoryService();
