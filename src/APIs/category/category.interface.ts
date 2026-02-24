import type { Document } from 'mongoose';
import type { Result } from '../../types/serviceResult/index.d.ts';
import type {
  CreateCategoryBody,
  UpdateCategoryBody,
} from './category.schema.ts';

export interface ICategory extends Document {
  id: string;
  title: string;
  slug: string;
  thumbnail: string;
  description: string;
  isDeleted: boolean;
  deletedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export type CreateCategoryData = CreateCategoryBody & { thumbnail: string };
export type UpdateCategoryData = UpdateCategoryBody & { thumbnail?: string };

export type GetCategoryByIdResult = Result<{ category: ICategory }>;
export type GetCategoryBySlugResult = Result<{ category: ICategory }>;
export type GetAllCategoriesResult = Result<{ categories: ICategory[] }>;
export type CreateCategoryResult = Result<{ category: ICategory }>;
export type UpdateCategoryResult = Result<{ category: ICategory }>;
export type DeleteCategoryResult = Result<{ category: ICategory }>;
export type RestoreCategoryResult = Result<{ category: ICategory }>;
