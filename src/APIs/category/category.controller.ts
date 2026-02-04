//import services
import categoryService from "./category.service.ts";

// import types
import type { Request, Response } from "express";
import type {
  CategoryCreationData,
  CategoryUpdateData,
} from "./category.interface.ts";

class CategoryController {
  constructor() {}

  async getAll(req: Request, res: Response): Promise<Response> {
    try {
      const categories = await categoryService.getAllCategories();
      return res.status(200).json({
        success: true,
        data: { categories },
      });
    } catch (error) {
      console.log(error);
      return res
        .status(500)
        .json({ success: false, message: "Internal server error" });
    }
  }

  async getById(req: Request, res: Response): Promise<Response> {
    try {
      const id = req.params.id as string;
      const category = await categoryService.getCategoryById(id);
      if (!category) {
        return res
          .status(404)
          .json({ success: false, message: "Category not found" });
      }
      return res.status(200).json({
        success: true,
        data: { category },
      });
    } catch (error) {
      console.log(error);
      return res
        .status(500)
        .json({ success: false, message: "Internal server error" });
    }
  }

  async create(req: Request, res: Response): Promise<Response> {
    try {
      const data = req.body;
      if (
        !data.title ||
        data.title.trim() === "" ||
        !data.description ||
        data.description.trim() === ""
      ) {
        return res
          .status(400)
          .json({ success: false, message: "All fields are required" });
      }
      const file = req.file ? (req.file as Express.Multer.File) : null;
      if (!file) {
        return res.status(400).json({
          success: false,
          message: "Thumbnail is required",
        });
      }
      const creationData: CategoryCreationData = {
        title: data.title,
        description: data.description,
        thumbnail: file.filename,
      };
      const createdCategory =
        await categoryService.createCategory(creationData);
      if (!createdCategory) {
        return res
          .status(409)
          .json({
            success: false,
            message: "Category with this title already exists",
          });
      }
      return res.status(201).json({
        success: true,
        message: "Category created successfully",
        data: { createdCategory },
      });
    } catch (error) {
      console.log(error);
      return res
        .status(500)
        .json({ success: false, message: "Internal server error" });
    }
  }

  async update(req: Request, res: Response): Promise<Response> {
    try {
      const id = req.params.id as string;
      const data = req.body;
      const updateData: CategoryUpdateData = {};
      if (data.title && data.title.trim() !== "") {
        updateData.title = data.title;
      }
      if (data.description && data.description.trim() !== "") {
        updateData.description = data.description;
      }
      const file = req.file ? (req.file as Express.Multer.File) : null;
      if (!file) {
        return res.status(400).json({
          success: false,
          message: "Thumbnail is required",
        });
      }
      updateData.thumbnail = file.filename;
      const updatedCategory = await categoryService.updateCategory(
        id,
        updateData,
      );
      if (!updatedCategory) {
        return res
          .status(404)
          .json({ success: false, message: "Category not found" });
      }
      return res.status(200).json({
        success: true,
        message: "Category updated successfully",
        data: { updatedCategory },
      });
    } catch (error) {
      console.log(error);
      return res
        .status(500)
        .json({ success: false, message: "Internal server error" });
    }
  }

  async delete(req: Request, res: Response): Promise<Response> {
    try {
      const id = req.params.id as string;
      const deletedCategory = await categoryService.deleteCategory(id);
      if (!deletedCategory) {
        return res
          .status(404)
          .json({ success: false, message: "Category not found" });
      }
      return res.status(200).json({
        success: true,
        message: "Category deleted successfully",
        data: { deletedCategory },
      });
    } catch (error) {
      console.log(error);
      return res
        .status(500)
        .json({ success: false, message: "Internal server error" });
    }
  }
}

export default new CategoryController();
