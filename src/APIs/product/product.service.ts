// packages
import mongoose from 'mongoose';

// models
import Product from './product.model.ts';

// types
import type {
  CreateProductInput,
  UpdateProductInput,
} from './product.schema.ts';
import type {
  GetProductByIdResult,
  GetAllProductsResult,
  CreateProductResult,
  UpdateProductResult,
  DeleteProductResult,
  BulkUpdateStockResult,
} from './product.interface.ts';
class ProductService {
  async getAllProducts(): Promise<GetAllProductsResult> {
    const products = await Product.find({ isDeleted: false });
    return {
      success: true,
      message: 'Products retrieved successfully',
      statusCode: 200,
      data: { products },
    };
  }

  async getProductById(id: string): Promise<GetProductByIdResult> {
    const product = await Product.findById(id);
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

  async createProduct(data: CreateProductInput): Promise<CreateProductResult> {
    const existingProduct = await Product.findOne({
      title: data.title,
      isDeleted: false,
    });
    if (existingProduct) {
      return {
        success: false,
        message: 'Product with this title already exists',
        statusCode: 400,
      };
    }
    // Convert category string to ObjectId
    const dataToCreate = {
      ...data,
      category: new mongoose.Types.ObjectId(data.category),
    };
    const newProduct = await Product.create(dataToCreate);
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
      _id: id,
      isDeleted: false,
    });
    if (!existingProduct) {
      return {
        success: false,
        message: 'Product not found',
        statusCode: 404,
      };
    }
    let dataToUpdate;
    if (data.category && typeof data.category === 'string') {
      dataToUpdate = {
        ...data,
        category: new mongoose.Types.ObjectId(data.category),
      };
    }
    const updatedProduct = await Product.findByIdAndUpdate(id, dataToUpdate, {
      new: true,
    });
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
      _id: id,
      isDeleted: false,
    });
    if (!existingProduct) {
      return {
        success: false,
        message: 'Product not found',
        statusCode: 404,
      };
    }
    const deletedProduct = await Product.findByIdAndUpdate(
      id,
      { isDeleted: true, deletedAt: new Date() },
      { new: true },
    );
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
        filter: { _id: item.productId, isDeleted: false },
        update: { $inc: { stock: -item.quantity } },
      },
    }));

    await Product.bulkWrite(bulkOps);
    return {
      success: true,
      message: 'Stock updated successfully',
      statusCode: 200,
    };
  }
}

export default new ProductService();
