// import dependencies
import { v4 as uuidv4 } from 'uuid';

// import models
import Category from './category.model.ts';

// import product service for cascade delete
import productService from '../product/product.service.ts';

// import helpers
import generateUniqueSlug from '../../helpers/generateUniqueSlug.ts';

// import types
import type {
  CreateCategoryData,
  UpdateCategoryData,
} from './category.interface.ts';
import type {
  GetCategoryByIdResult,
  GetCategoryBySlugResult,
  GetAllCategoriesResult,
  CreateCategoryResult,
  UpdateCategoryResult,
  DeleteCategoryResult,
  RestoreCategoryResult,
} from './category.interface.ts';

class CategoryService {
  async getAllCategories(
    includeDeleted: boolean,
  ): Promise<GetAllCategoriesResult> {
    const categories = await Category.find(
      includeDeleted ? {} : { isDeleted: false },
    ).catch(() => null); // ← catch and return null on any error
    if (!categories) {
      return {
        success: false,
        message: 'Failed to retrieve categories',
        statusCode: 500,
      };
    }
    return {
      success: true,
      message: 'Categories retrieved successfully',
      statusCode: 200,
      data: { categories },
    };
  }

  async getCategoryById(id: string): Promise<GetCategoryByIdResult> {
    const category = await Category.findOne({
      id,
      isDeleted: false,
    }).catch(() => null); // ← catch and return null on any error
    if (!category) {
      return {
        success: false,
        message: 'Category not found',
        statusCode: 404,
      };
    }
    return {
      success: true,
      message: 'Category retrieved successfully',
      statusCode: 200,
      data: { category },
    };
  }

  async getCategoryBySlug(slug: string): Promise<GetCategoryBySlugResult> {
    const category = await Category.findOne({
      slug,
      isDeleted: false,
    }).catch(() => null); // ← catch and return null on any error
    if (!category) {
      return {
        success: false,
        message: 'Category not found',
        statusCode: 404,
      };
    }
    return {
      success: true,
      message: 'Category retrieved successfully',
      statusCode: 200,
      data: { category },
    };
  }

  async createCategory(
    data: CreateCategoryData,
  ): Promise<CreateCategoryResult> {
    const existingCategory = await Category.findOne({
      title: data.title,
      isDeleted: false,
    }).catch(() => null);
    if (existingCategory) {
      return {
        success: false,
        message: 'Category with this title already exists',
        statusCode: 409,
      };
    }
    const existingSlugs = await Category.find({ isDeleted: false })
      .distinct('slug')
      .catch(() => []);
    const newCategory = await Category.create({
      ...data,
      id: uuidv4(),
      slug: generateUniqueSlug(data.title, existingSlugs),
    }).catch(() => null);
    if (!newCategory) {
      return {
        success: false,
        message: 'Failed to create category',
        statusCode: 500,
      };
    }
    return {
      success: true,
      message: 'Category created successfully',
      statusCode: 201,
      data: { category: newCategory },
    };
  }

  async updateCategory(
    id: string,
    data: UpdateCategoryData,
  ): Promise<UpdateCategoryResult> {
    const category = await Category.findOne({
      id,
      isDeleted: false,
    }).catch(() => null);
    if (!category) {
      return {
        success: false,
        message: 'Category not found',
        statusCode: 404,
      };
    }
    const existingCategoryWithTitle = await Category.findOne({
      title: data.title,
      isDeleted: false,
      id: { $ne: id },
    }).catch(() => null);
    if (existingCategoryWithTitle) {
      return {
        success: false,
        message: 'Category with this title already exists',
        statusCode: 409,
      };
    }

    const existingSlugs = await Category.find({
      isDeleted: false,
      id: { $ne: id },
    })
      .distinct('slug')
      .catch(() => []);
    const newSlug = generateUniqueSlug(
      data.title || category.title,
      existingSlugs,
    );
    const dataToUpdate = {
      ...data,
      slug: newSlug,
    };

    const updatedCategory = await Category.findOneAndUpdate(
      { id },
      dataToUpdate,
      {
        new: true,
      },
    ).catch(() => null);
    if (!updatedCategory) {
      return {
        success: false,
        message: 'Failed to update category',
        statusCode: 500,
      };
    }
    return {
      success: true,
      message: 'Category updated successfully',
      statusCode: 200,
      data: { category: updatedCategory },
    };
  }

  async deleteCategory(id: string): Promise<DeleteCategoryResult> {
    const existingCategory = await Category.findOne({
      id,
      isDeleted: false,
    }).catch(() => null);
    if (!existingCategory) {
      return {
        success: false,
        message: 'Category not found',
        statusCode: 404,
      };
    }

    const productsInCategory = await productService
      .getProductsByCategory(existingCategory._id.toString())
      .catch(() => null);
    const products =
      productsInCategory &&
      productsInCategory.success &&
      productsInCategory.data
        ? productsInCategory.data.products
        : null;
    if (products && products.length > 0) {
      return {
        success: false,
        message: 'Cannot delete category with associated products',
        statusCode: 400,
      };
    }

    const deletedCategory = await Category.findOneAndUpdate(
      { id },
      { isDeleted: true, deletedAt: new Date() },
      { new: true },
    ).catch(() => null);
    if (!deletedCategory) {
      return {
        success: false,
        message: 'Failed to delete category',
        statusCode: 500,
      };
    }
    return {
      success: true,
      message: 'Category deleted successfully',
      statusCode: 200,
      data: { category: deletedCategory },
    };
  }

  async restoreCategory(id: string): Promise<RestoreCategoryResult> {
    // First check if category exists at all
    const category = await Category.findOne({ id }).catch(() => null);

    if (!category) {
      return {
        success: false,
        message: 'Category not found',
        statusCode: 404,
      };
    }

    // Check if it's already active
    if (!category.isDeleted) {
      return {
        success: false,
        message: 'Category is not deleted',
        statusCode: 400,
      };
    }

    // Restore the category
    const restoredCategory = await Category.findOneAndUpdate(
      { id },
      { isDeleted: false, deletedAt: null },
      { new: true },
    ).catch(() => null);

    if (!restoredCategory) {
      return {
        success: false,
        message: 'Failed to restore category',
        statusCode: 500,
      };
    }

    return {
      success: true,
      message: 'Category restored successfully',
      statusCode: 200,
      data: { category: restoredCategory },
    };
  }
}

export default new CategoryService();
