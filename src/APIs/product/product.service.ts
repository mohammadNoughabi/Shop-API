// import models
import Product from './product.model.ts';

// import types
import type {
  IProduct,
  ProductCreationData,
  ProductUpdateData,
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
    creationData: ProductCreationData,
  ): Promise<IProduct | null> {
    const existingProduct = await Product.findOne({
      title: creationData.title,
      isDeleted: false,
    });
    if (existingProduct) {
      return null;
    }
    const newProduct = await Product.create(creationData);
    return newProduct;
  }

  async updateProduct(
    id: string,
    updateData: ProductUpdateData,
  ): Promise<IProduct | null> {
    const existingProduct = await Product.findOne({
      _id: id,
      isDeleted: false,
    });
    if (!existingProduct) {
      return null;
    }
    const updatedProduct = await Product.findByIdAndUpdate(id, updateData, {
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
}

export default new ProductService();
