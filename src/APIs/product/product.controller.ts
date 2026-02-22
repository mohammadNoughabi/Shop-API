// services
import productService from './product.service.ts';

// utils
import { removeFiles } from '../../utils/removeFile.ts';

// types
import type { Request, Response } from 'express';
import type { ProductFiles } from './product.interface.ts';
import type {
  CreateProductInput,
  UpdateProductInput,
} from './product.schema.ts';

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
    const id = req.params.id as string; // already validated by Zod → safe string & ObjectId format
    const result = await productService.getProductById(id);
    if (!result.success) {
      return res.status(result.statusCode || 500).json(result);
    }
    return res.status(result.statusCode || 200).json(result);
  }

  async create(req: Request, res: Response): Promise<Response> {
    const body = req.body as CreateProductInput;
    const files = req.files as ProductFiles;

    // 1. Extract all uploaded files into a single flat array for validation/cleanup
    const allFiles = [...(files.image || []), ...(files.gallery || [])];

    // 2. Validate File Types (MIME types)
    const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg'];
    const invalidFiles = allFiles.filter(
      (file) => !allowedTypes.includes(file.mimetype),
    );

    if (invalidFiles.length > 0) {
      // Cleanup ALL uploaded files if even one is invalid
      await removeFiles(allFiles.map((f) => f.filename));

      return res.status(400).json({
        success: false,
        message: 'Invalid file format. Only JPEG and PNG are allowed.',
      });
    }

    // Files are required — Zod can't validate multer files → we still check here
    if (!files.image?.[0]) {
      return res.status(400).json({
        success: false,
        message: 'Main image is required',
      });
    }

    const image = files.image[0].filename;
    const gallery = files.gallery?.map((f) => f.filename) ?? [];

    const result = await productService.createProduct({
      ...body,
      image,
      gallery,
    });

    if (!result.success) {
      await removeFiles([image, ...gallery].filter(Boolean));
      return res.status(result.statusCode || 500).json(result);
    }

    return res.status(result.statusCode || 200).json(result);
  }

  async update(req: Request, res: Response): Promise<Response> {
    const id = req.params.id as string; // Zod validated
    const body = req.body as UpdateProductInput;
    const files = req.files as ProductFiles;

    let image: string | undefined;
    let gallery: string[] | undefined;

    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    if (files) {
      if (files.image?.[0]) {
        image = files.image[0].filename;
      }
      if (files.gallery?.length) {
        gallery = files.gallery.map((f) => f.filename);
      }
    }

    const updateData: UpdateProductInput = {
      ...body,
    };

    if (image !== undefined) {
      updateData.image = image;
    }
    if (gallery !== undefined) {
      updateData.gallery = gallery;
    }

    const result = await productService.updateProduct(id, updateData);

    // Cleanup only new files if business logic rejected update
    if (!result.success && (image || gallery)) {
      const toRemove: string[] = [];
      if (image) toRemove.push(image);
      if (gallery) toRemove.push(...gallery);
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
}

export default new ProductController();
