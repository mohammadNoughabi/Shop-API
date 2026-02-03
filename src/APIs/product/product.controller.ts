// import models
import Product from "./product.model.ts";

// import services
import productService from "./product.service.ts";

// import types
import type { Request, Response } from "express";
import type { IProduct } from "./product.interface.ts";

// define upload file types
type ProductFiles = {
  image: Express.Multer.File[];
  gallery: Express.Multer.File[];
};

class ProductController {
  constructor() {}

  async getAll(req: Request, res: Response) {
    try {
      const products: IProduct[] = await productService.getAllProducts();
      return res.status(200).json({
        success: true,
        products: products,
      });
    } catch (error) {
      console.log(error);
      return res
        .status(500)
        .json({ success: false, message: "Internal server error" });
    }
  }

  async getById(req: Request, res: Response) {
    try {
      const id = req.params.id as string;
      const product: IProduct | null = await productService.getProductById(id);
      if (!product) {
        return res
          .status(404)
          .json({ success: false, message: "Product not found" });
      }
      return res.status(200).json({
        success: true,
        product: product,
      });
    } catch (error) {
      console.log(error);
      return res
        .status(500)
        .json({ success: false, message: "Internal serever error" });
    }
  }

  async create(req: Request, res: Response) {
    try {
      const { title, description, price, category } = req.body;
      if (!title || !description || !price || !category) {
        return res
          .status(400)
          .json({ success: false, message: "Missing required fields" });
      }

      const existingProduct = await Product.findOne({
        title: title,
        isDeleted: false,
      });
      if (existingProduct) {
        return res.status(409).json({
          success: false,
          message: "Product with this name already exists",
        });
      }

      const files = req.files
        ? (req.files as ProductFiles)
        : { image: [], gallery: [] };

      const imageFile = files.image ? files.image[0] : null;
      if (!imageFile) {
        return res
          .status(400)
          .json({ success: false, message: "Main image is required" });
      }

      const galleryFiles = files.gallery || [];
      const galleryFilenames = galleryFiles.map((file) => file.filename);

      const createdProduct = await productService.createProduct({
        title,
        description,
        image: imageFile.filename,
        gallery: galleryFilenames,
        price,
        category,
      });

      return res.status(201).json({
        success: true,
        message: "Product created successfully",
        createdProduct: createdProduct,
      });
    } catch (error) {
      console.log(error);
      return res
        .status(500)
        .json({ success: false, message: "Internal server error" });
    }
  }

  async update(req: Request, res: Response) {
    try {
      const id = req.params.id as string;
      const existingProduct = await Product.findOne({
        _id: id,
        isDeleted: false,
      });
      if (!existingProduct) {
        return res
          .status(404)
          .json({ success: false, message: "Product not found" });
      }
      const { title, description, price, category } = req.body;
      if (!title || !description || !price || !category) {
        return res
          .status(400)
          .json({ success: false, message: "Missing required fields" });
      }

      const files = req.files
        ? (req.files as ProductFiles)
        : { image: [], gallery: [] };

      const imageFile = files.image ? files.image[0] : null;
      const galleryFiles = files.gallery || [];
      const galleryFilenames = galleryFiles.map((file) => file.filename);

      const updateData: Partial<
        Pick<
          IProduct,
          "title" | "description" | "image" | "gallery" | "price" | "category"
        >
      > = {
        title,
        description,
        price,
        category,
      };

      if (imageFile) {
        updateData.image = imageFile.filename;
      }

      if (galleryFilenames.length > 0) {
        updateData.gallery = galleryFilenames;
      }

      const updatedProduct = await productService.updateProduct(id, updateData);
      if (!updatedProduct) {
        return res.status(404).json({
          success: false,
          message: "Product not found",
        });
      }
      return res.status(200).json({
        success: true,
        message: `Product with id ${id} updated successfully`,
        updatedProduct: updatedProduct,
      });
    } catch (error) {
      console.log(error);
      return res
        .status(500)
        .json({ success: false, message: "Internal server error" });
    }
  }

  async delete(req: Request, res: Response) {
    try {
      const id = req.params.id as string;
      const deletedProduct = await productService.deleteProduct(id);
      if (!deletedProduct) {
        return res.status(404).json({
          success: false,
          message: "Product not found",
        });
      }
      return res.status(200).json({
        success: true,
        message: `Product with id ${id} deleted successfully`,
      });
    } catch (error) {
      console.log(error);
      return res
        .status(500)
        .json({ success: false, message: "Internal server error" });
    }
  }
}

export default new ProductController();
