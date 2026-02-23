// packages
import mongoose from 'mongoose';
import { v4 as uuidv4 } from 'uuid';

// models
import Product from './product.model.ts';

// helpers
import generateUniqueSlug from '../../helpers/generateUniqueSlug.ts';

// types
import type {
  CreateProductInput,
  UpdateProductInput,
} from './product.schema.ts';
import type {
  GetProductByIdResult,
  GetProductBySlugResult,
  GetAllProductsResult,
  CreateProductResult,
  UpdateProductResult,
  DeleteProductResult,
  BulkUpdateStockResult,
} from './product.interface.ts';
class ProductService {
  async getAllProducts(includeDeleted: boolean): Promise<GetAllProductsResult> {
    const products = await Product.find({
      isDeleted: includeDeleted ? { $in: [true, false] } : false,
    }).catch(() => null);
    if (!products) {
      return {
        success: false,
        message: 'Failed to retrieve products',
        statusCode: 500,
      };
    }
    return {
      success: true,
      message: 'Products retrieved successfully',
      statusCode: 200,
      data: { products },
    };
  }

  async getProductById(id: string): Promise<GetProductByIdResult> {
    const product = await Product.findOne({ id, isDeleted: false }).catch(
      () => null,
    );
    if (!product) {
      return {
        success: false,
        message: 'Product not found',
        statusCode: 404,
      };
    }
    return {
      success: true,
      message: 'Product retrieved successfully',
      statusCode: 200,
      data: { product },
    };
  }

  async getProductBySlug(slug: string): Promise<GetProductBySlugResult> {
    const product = await Product.findOne({ slug, isDeleted: false }).catch(
      () => null,
    );
    if (!product) {
      return {
        success: false,
        message: 'Product not found',
        statusCode: 404,
      };
    }
    return {
      success: true,
      message: 'Product retrieved successfully',
      statusCode: 200,
      data: { product },
    };
  }

  async getProductsByCategory(
    categoryId: string,
  ): Promise<GetAllProductsResult> {
    const products = await Product.find({
      categoryId: categoryId,
      isDeleted: false,
    }).catch(() => null);
    if (!products) {
      return {
        success: false,
        message: 'Failed to retrieve products for this category',
        statusCode: 500,
      };
    }
    return {
      success: true,
      message: 'Products retrieved successfully',
      statusCode: 200,
      data: { products },
    };
  }

  async createProduct(data: CreateProductInput): Promise<CreateProductResult> {
    const existingProduct = await Product.findOne({
      title: data.title,
      isDeleted: false,
    }).catch(() => null);
    if (existingProduct) {
      return {
        success: false,
        message: 'Product with this title already exists',
        statusCode: 400,
      };
    }

    const existingSlugs = await Product.find({ isDeleted: false })
      .distinct('slug')
      .catch(() => []);

    const dataToCreate = {
      ...data,
      id: uuidv4(), // generate UUID for id
      slug: generateUniqueSlug(data.title, existingSlugs), // generate unique slug
      categoryId: new mongoose.Types.ObjectId(data.categoryId), // Convert category string to ObjectId
    };
    const newProduct = await Product.create(dataToCreate).catch(() => null);
    if (!newProduct) {
      return {
        success: false,
        message: 'Failed to create product',
        statusCode: 500,
      };
    }
    return {
      success: true,
      message: 'Product created successfully',
      statusCode: 201,
      data: { product: newProduct },
    };
  }

  async updateProduct(
    id: string,
    data: UpdateProductInput,
  ): Promise<UpdateProductResult> {
    const existingProduct = await Product.findOne({
      id,
      isDeleted: false,
    }).catch(() => null);
    if (!existingProduct) {
      return {
        success: false,
        message: 'Product not found',
        statusCode: 404,
      };
    }

    const duplicateTitle = await Product.findOne({
      title: data.title,
      id: { $ne: id },
      isDeleted: false,
    }).catch(() => null);
    if (duplicateTitle && data.title) {
      // ← only check if title is actually being updated
      return {
        success: false,
        message: 'Another product with this title already exists',
        statusCode: 400,
      };
    }

    const existingSlugs = await Product.find({ isDeleted: false })
      .distinct('slug')
      .catch(() => []);

    // Start with the incoming data (which may be partial)
    const dataToUpdate = {
      ...data,
      slug: generateUniqueSlug(
        data.title || existingProduct.title,
        existingSlugs,
      ),
    };

    // Only convert if categoryId is being updated in this request
    if (data.categoryId && typeof data.categoryId === 'string') {
      dataToUpdate.categoryId = data.categoryId;
    }

    // If nothing to update (empty object), you could early-return, but mongoose handles it fine
    const updatedProduct = await Product.findOneAndUpdate(
      { id, isDeleted: false },
      dataToUpdate, // ← now always defined (even if {})
      { new: true, runValidators: true }, // ← runValidators good for price/stock etc.
    ).catch(() => null);

    if (!updatedProduct) {
      return {
        success: false,
        message: 'Product not found',
        statusCode: 404,
      };
    }

    return {
      success: true,
      message: 'Product updated successfully',
      statusCode: 200,
      data: { product: updatedProduct },
    };
  }

  async deleteProduct(id: string): Promise<DeleteProductResult> {
    const existingProduct = await Product.findOne({
      id,
      isDeleted: false,
    }).catch(() => null);
    if (!existingProduct) {
      return {
        success: false,
        message: 'Product not found',
        statusCode: 404,
      };
    }
    const deletedProduct = await Product.findOneAndUpdate(
      { id, isDeleted: false },
      { isDeleted: true, deletedAt: new Date() },
      { new: true },
    ).catch(() => null);
    if (!deletedProduct) {
      return {
        success: false,
        message: 'Product not found',
        statusCode: 404,
      };
    }
    return {
      success: true,
      message: 'Product deleted successfully',
      statusCode: 200,
      data: { product: deletedProduct },
    };
  }

  async bulkUpdateStock(
    soldItems: { productId: string; quantity: number }[],
  ): Promise<BulkUpdateStockResult> {
    const bulkOps = soldItems.map((item) => ({
      updateOne: {
        filter: { id: item.productId, isDeleted: false },
        update: { $inc: { stock: -item.quantity } },
      },
    }));

    const result = await Product.bulkWrite(bulkOps).catch(() => null);
    if (!result) {
      return {
        success: false,
        message: 'Failed to update stock',
        statusCode: 500,
      };
    }
    return {
      success: true,
      message: 'Stock updated successfully',
      statusCode: 200,
    };
  }
}

export default new ProductService();
