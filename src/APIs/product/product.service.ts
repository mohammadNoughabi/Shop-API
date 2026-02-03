// import models
import Product from "./product.model.ts";

// import types
import type { IProduct } from "./product.interface.ts";
class ProductService {
  constructor() {}

  async getAllProducts(): Promise<IProduct[]> {
    const products = await Product.find({ isDeleted: false });
    return products;
  }

  async getProductById(id: string): Promise<IProduct | null> {
    const product = await Product.findById(id);
    return product;
  }

  async createProduct(
    creationData: Pick<
      IProduct,
      "title" | "description" | "image" | "gallery" | "price" | "category"
    >,
  ): Promise<IProduct | null> {
    const newProduct = await Product.create(creationData);
    return newProduct;
  }

  async updateProduct(
    id: string,
    updateData: Partial<
      Pick<
        IProduct,
        "title" | "description" | "image" | "gallery" | "price" | "category"
      >
    >,
  ): Promise<IProduct | null> {
    const updatedProduct = await Product.findByIdAndUpdate(id, updateData, {
      new: true,
    });
    return updatedProduct;
  }

  async deleteProduct(id: string): Promise<IProduct | null> {
    const deletedProduct = await Product.findByIdAndUpdate(
      id,
      { isDeleted: true, deletedAt: new Date() },
      { new: true },
    );
    return deletedProduct;
  }
}

export default new ProductService();
