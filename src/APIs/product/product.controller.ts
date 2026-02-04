// import services
import productService from './product.service.ts';

// import types
import type { Request, Response } from 'express';
import type { IProduct } from './product.interface.ts';
import type { ProductFiles } from './product.interface.ts';
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
      const { title, description, price, category } = req.body;
      if (!title || !description || !price || !category) {
        return res
          .status(400)
          .json({ success: false, message: 'Missing required fields' });
      }

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

      const createdProduct = await productService.createProduct({
        title,
        description,
        image: imageFileName,
        gallery: galleryFilenames,
        price,
        category,
      });
      if (!createdProduct) {
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
      const { title, description, price, category } = req.body;
      if (!title || !description || !price || !category) {
        return res
          .status(400)
          .json({ success: false, message: 'Missing required fields' });
      }

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

      const updateData: Partial<
        Pick<
          IProduct,
          'title' | 'description' | 'image' | 'gallery' | 'price' | 'category'
        >
      > = {
        title,
        description,
        image: imageFileName,
        gallery: galleryFilenames,
        price,
        category,
      };

      if (galleryFilenames.length > 0) {
        updateData.gallery = galleryFilenames;
      }

      const updatedProduct = await productService.updateProduct(id, updateData);
      if (!updatedProduct) {
        return res.status(404).json({
          success: false,
          message: 'Product not found',
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
