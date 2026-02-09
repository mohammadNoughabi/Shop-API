// packages
import mongoose from 'mongoose';

// models
import Product from './product.model.ts';

// types
import type { IProduct } from './product.interface.ts';
import type {
  CreateProductData,
  UpdateProductData,
} from './product.interface.ts';
class ProductService {
  async getAllProducts(): Promise<IProduct[]> {
    const products = await Product.find({ isDeleted: false });
    return products;
  }

  async getProductById(id: string): Promise<IProduct | null> {
    const product = await Product.findById(id);
    return product;
  }

  async createProduct(
    creationData: CreateProductData,
  ): Promise<IProduct | null> {
    const existingProduct = await Product.findOne({
      title: creationData.title,
      isDeleted: false,
    });
    if (existingProduct) {
      return null;
    }
    // Convert category string to ObjectId
    const dataToCreate = {
      ...creationData,
      category: new mongoose.Types.ObjectId(creationData.category),
    };
    const newProduct = await Product.create(dataToCreate);
    return newProduct;
  }

  async updateProduct(
    id: string,
    updateData: UpdateProductData,
  ): Promise<IProduct | null> {
    const existingProduct = await Product.findOne({
      _id: id,
      isDeleted: false,
    });
    if (!existingProduct) {
      return null;
    }
    let dataToUpdate;
    if (updateData.category && typeof updateData.category === 'string') {
      dataToUpdate = {
        ...updateData,
        category: new mongoose.Types.ObjectId(updateData.category),
      };
    }
    const updatedProduct = await Product.findByIdAndUpdate(id, dataToUpdate, {
      new: true,
    });
    return updatedProduct;
  }

  async deleteProduct(id: string): Promise<IProduct | null> {
    const existingProduct = await Product.findOne({
      _id: id,
      isDeleted: false,
    });
    if (!existingProduct) {
      return null;
    }
    const deletedProduct = await Product.findByIdAndUpdate(
      id,
      { isDeleted: true, deletedAt: new Date() },
      { new: true },
    );
    return deletedProduct;
  }

  async updateInventory(id: string, newInventory: number) {
    const existingProduct = await Product.findOne({
      _id: id,
      isDeleted: false,
    });
    if (!existingProduct) {
      return null;
    }
    const updatedProduct = await Product.findByIdAndUpdate(
      id,
      { inventory: newInventory },
      { new: true },
    );
    return updatedProduct;
  }
}

export default new ProductService();
