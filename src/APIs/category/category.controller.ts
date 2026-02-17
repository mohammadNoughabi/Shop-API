// services
import categoryService from './category.service.ts';

// utils
import { removeFile } from '../../utils/removeFile.ts';

// types
import type { Request, Response } from 'express';
import type {
  CreateCategoryInput,
  UpdateCategoryInput,
} from './category.schema.ts';

class CategoryController {
  async getAll(_req: Request, res: Response): Promise<Response> {
    const result = await categoryService.getAllCategories();
    if (!result.success) {
      return res.status(result.statusCode || 500).json(result);
    }
    return res.status(result.statusCode || 200).json(result);
  }

  async getById(req: Request, res: Response): Promise<Response> {
    const id = req.params.id as string; // Zod already validated => safe string & ObjectId format
    const result = await categoryService.getCategoryById(id);
    if (!result.success) {
      return res.status(result.statusCode || 500).json(result);
    }
    return res.status(result.statusCode || 200).json(result);
  }

  async create(req: Request, res: Response): Promise<Response> {
    const body = req.body as CreateCategoryInput;
    const file = req.file;

    if (!file) {
      return res.status(400).json({
        success: false,
        message: 'Thumbnail is required',
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
    const id = req.params.id as string; // Zod validated => safe string & ObjectId format
    const body = req.body as UpdateCategoryInput;
    const file = req.file;

    const updateData: UpdateCategoryInput & { thumbnail?: string } = {
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
    const id = req.params.id as string; // Zod validated => safe string & ObjectId format
    const result = await categoryService.deleteCategory(id);
    if (!result.success) {
      return res.status(result.statusCode || 500).json(result);
    }
    return res.status(result.statusCode || 200).json(result);
  }
}

export default new CategoryController();
