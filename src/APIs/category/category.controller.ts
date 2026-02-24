// services
import categoryService from './category.service.ts';

// utils
import { removeFile } from '../../utils/removeFile.ts';

// types
import type { Request, Response } from 'express';
import type {
  CreateCategoryData,
  UpdateCategoryData,
} from './category.interface.ts';

class CategoryController {
  async getAll(req: Request, res: Response): Promise<Response> {
    const includeDeleted = req.query.includeDeleted === 'true';

    const result = await categoryService.getAllCategories(includeDeleted);
    if (!result.success) {
      return res.status(result.statusCode || 500).json(result);
    }
    return res.status(result.statusCode || 200).json(result);
  }

  async getById(req: Request, res: Response): Promise<Response> {
    const id = req.params.id as string; // Zod already validated => safe string & uuid format
    const result = await categoryService.getCategoryById(id);
    if (!result.success) {
      return res.status(result.statusCode || 500).json(result);
    }
    return res.status(result.statusCode || 200).json(result);
  }

  async getBySlug(req: Request, res: Response): Promise<Response> {
    const slug = req.params.slug as string; // Zod already validated => safe string
    const result = await categoryService.getCategoryBySlug(slug);
    if (!result.success) {
      return res.status(result.statusCode || 500).json(result);
    }
    return res.status(result.statusCode || 200).json(result);
  }

  async create(req: Request, res: Response): Promise<Response> {
    const body = req.body as CreateCategoryData;
    const file = req.file;

    if (!file) {
      return res.status(400).json({
        success: false,
        message: 'Thumbnail is required',
      });
    }

    if (
      file.mimetype !== 'image/jpeg' &&
      file.mimetype !== 'image/png' &&
      file.mimetype !== 'image/jpg'
    ) {
      await removeFile(file.filename);
      return res.status(400).json({
        success: false,
        message:
          'Invalid thumbnail format. Only JPEG, JPG, and PNG are allowed.',
      });
    }

    const result = await categoryService.createCategory({
      ...body,
      thumbnail: file.filename,
    });

    if (!result.success) {
      await removeFile(file.filename);
      return res.status(result.statusCode || 500).json(result);
    }

    return res.status(result.statusCode || 201).json(result);
  }

  async update(req: Request, res: Response): Promise<Response> {
    const id = req.params.id as string; // Zod validated => safe string & uuid format
    const body = req.body as UpdateCategoryData;
    const file = req.file;

    const updateData: UpdateCategoryData = {
      ...body,
    };

    if (file) {
      updateData.thumbnail = file.filename;
    }

    // Optional: block empty updates (nice to have)
    if (Object.keys(updateData).length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No fields provided for update',
      });
    }

    const result = await categoryService.updateCategory(id, updateData);

    if (!result.success) {
      // Cleanup only newly uploaded file if business logic rejected
      if (file) {
        await removeFile(file.filename);
      }
      return res.status(result.statusCode || 500).json(result);
    }

    return res.status(result.statusCode || 200).json(result);
  }

  async delete(req: Request, res: Response): Promise<Response> {
    const id = req.params.id as string; // Zod validated => safe string & uuid format
    const result = await categoryService.deleteCategory(id);
    if (!result.success) {
      return res.status(result.statusCode || 500).json(result);
    }
    return res.status(result.statusCode || 200).json(result);
  }

  async restore(req: Request, res: Response): Promise<Response> {
    const id = req.params.id as string; // Zod validated => safe string & uuid format
    const result = await categoryService.restoreCategory(id);
    if (!result.success) {
      return res.status(result.statusCode || 500).json(result);
    }
    return res.status(result.statusCode || 200).json(result);
  }
}

export default new CategoryController();
