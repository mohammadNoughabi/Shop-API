import type { Document } from 'mongoose';

import type {
  CreateCategoryInput,
  UpdateCategoryInput,
} from './category.schema.ts';

export interface ICategory extends Document {
  title: string;
  thumbnail: string;
  description: string;
  isDeleted: boolean;
  deletedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export type CreateCategoryData = CreateCategoryInput & {
  thumbnail: string;
};

export type UpdateCategoryData = UpdateCategoryInput & {
  thumbnail?: string;
};
