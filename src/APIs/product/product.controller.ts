// services
import productService from './product.service.ts';

// utils
import { removeFiles } from '../../utils/removeFile.ts';

// types
import type { Request, Response } from 'express';
import type {
  CreateProductData,
  UpdateProductData,
} from './product.interface.ts';

class ProductController {
  async getAll(_req: Request, res: Response): Promise<Response> {
    const includeDeleted = _req.query.includeDeleted === 'true';
    const result = await productService.getAllProducts(includeDeleted);
    if (!result.success) {
      return res.status(result.statusCode || 500).json(result);
    }
    return res.status(result.statusCode || 200).json(result);
  }

  async getById(req: Request, res: Response): Promise<Response> {
    const id = req.params.id as string; // already validated by Zod → safe string & uuid format
    const result = await productService.getProductById(id);
    if (!result.success) {
      return res.status(result.statusCode || 500).json(result);
    }
    return res.status(result.statusCode || 200).json(result);
  }

  async getBySlug(req: Request, res: Response): Promise<Response> {
    const slug = req.params.slug as string; // already validated by Zod → safe string
    const result = await productService.getProductBySlug(slug);
    if (!result.success) {
      return res.status(result.statusCode || 500).json(result);
    }
    return res.status(result.statusCode || 200).json(result);
  }

  async create(req: Request, res: Response): Promise<Response> {
    const data: CreateProductData = req.body; // Zod validated, so we can safely assert type

    // Narrow req.files type safely
    if (!req.files || Array.isArray(req.files)) {
      return res.status(400).json({
        success: false,
        message: 'Files are required',
      });
    }

    const imageFile = req.files.image[0];
    const galleryFiles = req.files.gallery;

    const imageFilename = imageFile.filename;
    const galleryFilenames = galleryFiles.map((f) => f.filename);

    const serviceInput: CreateProductData = {
      ...data,
      image: imageFilename,
      gallery: galleryFilenames,
    };

    const result = await productService.createProduct(serviceInput);

    if (!result.success) {
      await removeFiles([imageFilename, ...galleryFilenames].filter(Boolean));
      return res.status(result.statusCode || 500).json(result);
    }

    return res.status(result.statusCode || 200).json(result);
  }

  async update(req: Request, res: Response): Promise<Response> {
    const id = req.params.id as string; // Zod validated
    const data: UpdateProductData = req.body; // Zod validated, so we can safely assert type

    let image: Express.Multer.File[] | undefined;
    let gallery: Express.Multer.File[] | undefined;

    if (req.files && !Array.isArray(req.files)) {
      const files = req.files as {
        image?: Express.Multer.File[];
        gallery?: Express.Multer.File[];
      };
      image = files.image;
      gallery = files.gallery;
    }

    const updateData: UpdateProductData = {
      ...data,
    };
    if (image?.length) {
      updateData.image = image[0].filename;
    }
    if (gallery?.length) {
      updateData.gallery = gallery.map((f) => f.filename);
    }

    const result = await productService.updateProduct(id, updateData);

    // Cleanup only new files if business logic rejected update
    if (!result.success && (data.image || data.gallery)) {
      const toRemove: string[] = [];
      if (image) toRemove.push(image[0].filename);
      if (gallery) toRemove.push(...gallery.map((f) => f.filename));
      if (toRemove.length > 0) await removeFiles(toRemove);
    }

    return res.status(result.statusCode || 200).json(result);
  }

  async delete(req: Request, res: Response): Promise<Response> {
    const id = req.params.id as string; // Zod validated
    const result = await productService.deleteProduct(id);
    if (!result.success) {
      return res.status(result.statusCode || 500).json(result);
    }
    return res.status(result.statusCode || 200).json(result);
  }

  async restore(req: Request, res: Response): Promise<Response> {
    const id = req.params.id as string; // Zod validated
    const result = await productService.restoreProduct(id);
    if (!result.success) {
      return res.status(result.statusCode || 500).json(result);
    }
    return res.status(result.statusCode || 200).json(result);
  }
}

export default new ProductController();
