// import libraries
// import models
import Category from "./category.model.ts";

//import services
import categoryService from "./category.service.ts";

// import types
import type { Request, Response, NextFunction } from "express";
import type { ICategory } from "./category.interface.ts";

class CategoryController {
  constructor() {}

  async create(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<Response> {
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
      if (!req.file) {
        return res
          .status(400)
          .json({ success: false, message: "Thumbnail is required" });
      }
      const file = req.file as Express.Multer.File;
      const existingCategory = await Category.findOne({ title: data.title });
      if (existingCategory) {
        return res
          .status(409)
          .json({ success: false, message: "Category already exists" });
      }
      const creationData: Pick<
        ICategory,
        "title" | "description" | "thumbnail"
      > = {
        title: data.title,
        description: data.description,
        thumbnail: file.filename,
      };
      const createdCategory =
        await categoryService.createCategory(creationData);
      return res.status(201).json({
        success: true,
        message: "Category created successfully",
        createdCategory: createdCategory,
      });
    } catch (error) {
      console.log(error);
      return res
        .status(500)
        .json({ success: false, message: "Internal server error" });
    }
  }

  async getAll(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<Response> {
    try {
      const categories = await categoryService.getAllCategories();
      return res.status(200).json({
        success: true,
        categories: categories,
      });
    } catch (error) {
      console.log(error);
      return res
        .status(500)
        .json({ success: false, message: "Internal server error" });
    }
  }

  async getById(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<Response> {
    try {
      const categoryId = req.params.id as string;
      const category = await categoryService.getCategoryById(categoryId);
      if (!category) {
        return res
          .status(404)
          .json({ success: false, message: "Category not found" });
      }
      return res.status(200).json({
        success: true,
        category: category,
      });
    } catch (error) {
      console.log(error);
      return res
        .status(500)
        .json({ success: false, message: "Internal server error" });
    }
  }

  async delete(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<Response> {
    try {
      const categoryId = req.params.id as string;
      const deletedCategory = await categoryService.deleteCategory(categoryId);
      if (!deletedCategory) {
        return res
          .status(404)
          .json({ success: false, message: "Category not found" });
      }
      return res.status(200).json({
        success: true,
        message: "Category deleted successfully",
        deletedCategory: deletedCategory,
      });
    } catch (error) {
      console.log(error);
      return res
        .status(500)
        .json({ success: false, message: "Internal server error" });
    }
  }

  async update(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<Response> {
    try {
      const categoryId = req.params.id as string;
      const data = req.body;
      const updateData: Partial<
        Pick<ICategory, "title" | "description" | "thumbnail">
      > = {};
      if (data.title && data.title.trim() !== "") {
        updateData.title = data.title;
      }
      if (data.description && data.description.trim() !== "") {
        updateData.description = data.description;
      }
      if (req.file) {
        const file = req.file as Express.Multer.File;
        updateData.thumbnail = file.filename;
      }
      const updatedCategory = await categoryService.updateCategory(
        categoryId,
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
        updatedCategory: updatedCategory,
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
