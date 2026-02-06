// services
import productService from './product.service.ts';

// utils
import { removeFiles } from '../../utils/removeFile.ts';

// types
import type { Request, Response } from 'express';
import type {
  IProduct,
  ProductFiles,
  UpdateProductData,
} from './product.interface.ts';
import type {
  CreateProductInput,
  UpdateProductInput,
} from './product.schema.ts';

class ProductController {
  async getAll(req: Request, res: Response): Promise<Response> {
    try {
      const products: IProduct[] = await productService.getAllProducts();
      return res.status(200).json({
        success: true,
        data: { products },
      });
    } catch (error) {
      console.log(error);
      return res
        .status(500)
        .json({ success: false, message: 'Internal server error' });
    }
  }

  async getById(req: Request, res: Response): Promise<Response> {
    try {
      const id = req.params.id as string;
      const product: IProduct | null = await productService.getProductById(id);
      if (!product) {
        return res
          .status(404)
          .json({ success: false, message: 'Product not found' });
      }
      return res.status(200).json({
        success: true,
        data: { product },
      });
    } catch (error) {
      console.log(error);
      return res
        .status(500)
        .json({ success: false, message: 'Internal serever error' });
    }
  }

  async create(req: Request, res: Response): Promise<Response> {
    try {
      const body = req.body as CreateProductInput;
      const files = req.files as ProductFiles | undefined;

      const imageFile = files?.image?.[0];
      if (!imageFile) {
        return res
          .status(400)
          .json({ success: false, message: 'Main image required' });
      }
      const imageFileName = imageFile.filename;

      const galleryFiles = files.gallery ?? [];
      const galleryFilenames = galleryFiles.map(
        (file: Express.Multer.File) => file.filename,
      );

      const allFileNames: string[] = [imageFileName, ...galleryFilenames];

      const createdProduct = await productService.createProduct({
        ...body,
        image: imageFileName,
        gallery: galleryFilenames,
      });
      if (!createdProduct) {
        await removeFiles(allFileNames);
        return res.status(409).json({
          success: false,
          message: 'Product with this title already exists',
        });
      }

      return res.status(201).json({
        success: true,
        message: 'Product created successfully',
        data: { createdProduct },
      });
    } catch (error) {
      console.log(error);
      return res
        .status(500)
        .json({ success: false, message: 'Internal server error' });
    }
  }

  async update(req: Request, res: Response): Promise<Response> {
    try {
      const id = req.params.id as string;
      const body = req.body as UpdateProductInput;
      const files = req.files as ProductFiles | undefined;

      // Get existing product first to handle file cleanup if needed
      const existingProduct = await productService.getProductById(id);
      if (!existingProduct) {
        return res.status(404).json({
          success: false,
          message: 'Product not found',
        });
      }

      let imageFileName: string | undefined;
      let galleryFilenames: string[] = [];

      if (files?.image?.[0]) {
        imageFileName = files.image[0].filename;
        // Optional: remove old image file if new one is uploaded
      }

      if (files?.gallery) {
        galleryFilenames = files.gallery.map(
          (file: Express.Multer.File) => file.filename,
        );
        // Optional: remove old gallery files if new ones are uploaded
      }

      // Prepare update data
      const updateData: UpdateProductData = {
        ...body,
        image: imageFileName,
        gallery: galleryFilenames,
      };

      const updatedProduct = await productService.updateProduct(id, updateData);

      if (!updatedProduct) {
        // Clean up newly uploaded files if update failed
        const allFileNames: string[] = [];
        if (imageFileName) allFileNames.push(imageFileName);
        if (galleryFilenames.length > 0) allFileNames.push(...galleryFilenames);

        if (allFileNames.length > 0) {
          await removeFiles(allFileNames);
        }

        return res.status(500).json({
          success: false,
          message: 'Failed to update product',
        });
      }

      return res.status(200).json({
        success: true,
        message: `Product updated successfully`,
        data: { updatedProduct },
      });
    } catch (error) {
      console.log(error);
      return res
        .status(500)
        .json({ success: false, message: 'Internal server error' });
    }
  }
  async delete(req: Request, res: Response): Promise<Response> {
    try {
      const id = req.params.id as string;
      const deletedProduct = await productService.deleteProduct(id);
      if (!deletedProduct) {
        return res.status(404).json({
          success: false,
          message: 'Product not found',
        });
      }
      return res.status(200).json({
        success: true,
        message: `Product deleted successfully`,
        data: { deletedProduct },
      });
    } catch (error) {
      console.log(error);
      return res
        .status(500)
        .json({ success: false, message: 'Internal server error' });
    }
  }
}

export default new ProductController();
