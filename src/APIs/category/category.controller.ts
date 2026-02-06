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
  async getAll(req: Request, res: Response): Promise<Response> {
    try {
      const categories = await categoryService.getAllCategories();

      return res.status(200).json({
        success: true,
        data: { categories },
      });
    } catch (error) {
      console.error(error);
      return res.status(500).json({
        success: false,
        message: 'Internal server error',
      });
    }
  }

  async getById(req: Request, res: Response): Promise<Response> {
    try {
      const id = req.params.id as string;

      const category = await categoryService.getCategoryById(id);
      if (!category) {
        return res.status(404).json({
          success: false,
          message: 'Category not found',
        });
      }

      return res.status(200).json({
        success: true,
        data: { category },
      });
    } catch (error) {
      console.error(error);
      return res.status(500).json({
        success: false,
        message: 'Internal server error',
      });
    }
  }

  async create(req: Request, res: Response): Promise<Response> {
    try {
      // Body is already validated by Zod
      const body = req.body as CreateCategoryInput;

      const file = req.file;
      if (!file) {
        return res.status(400).json({
          success: false,
          message: 'Thumbnail is required',
        });
      }

      const createdCategory = await categoryService.createCategory({
        ...body,
        thumbnail: file.filename,
      });

      if (!createdCategory) {
        await removeFile(file.filename);
        return res.status(409).json({
          success: false,
          message: 'Category with this title already exists',
        });
      }

      return res.status(201).json({
        success: true,
        message: 'Category created successfully',
        data: { createdCategory },
      });
    } catch (error) {
      console.error(error);
      return res.status(500).json({
        success: false,
        message: 'Internal server error',
      });
    }
  }

  async update(req: Request, res: Response): Promise<Response> {
    try {
      const id = req.params.id as string;
      const body = req.body as UpdateCategoryInput;

      const file = req.file;

      const updateData: UpdateCategoryInput & { thumbnail?: string } = {
        ...body,
      };

      if (file) {
        updateData.thumbnail = file.filename;
      }

      if (Object.keys(updateData).length === 0) {
        return res.status(400).json({
          success: false,
          message: 'No fields provided for update',
        });
      }

      const updatedCategory = await categoryService.updateCategory(
        id,
        updateData,
      );

      if (!updatedCategory) {
        return res.status(404).json({
          success: false,
          message: 'Category not found',
        });
      }

      return res.status(200).json({
        success: true,
        message: 'Category updated successfully',
        data: { updatedCategory },
      });
    } catch (error) {
      console.error(error);
      return res.status(500).json({
        success: false,
        message: 'Internal server error',
      });
    }
  }

  async delete(req: Request, res: Response): Promise<Response> {
    try {
      const id = req.params.id as string;

      const deletedCategory = await categoryService.deleteCategory(id);

      if (!deletedCategory) {
        return res.status(404).json({
          success: false,
          message: 'Category not found',
        });
      }

      return res.status(200).json({
        success: true,
        message: 'Category deleted successfully',
        data: { deletedCategory },
      });
    } catch (error) {
      console.error(error);
      return res.status(500).json({
        success: false,
        message: 'Internal server error',
      });
    }
  }
}

export default new CategoryController();
