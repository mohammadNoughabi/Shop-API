import { Document } from "mongoose";

export interface ICategory extends Document {
  title: string;
  thumbnail: string;
  description: string;
  isDeleted: boolean;
  deletedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export type CategoryCreationData = Pick<
  ICategory,
  "title" | "description" | "thumbnail"
>;

export type CategoryUpdateData = Partial<
  Pick<ICategory, "title" | "description" | "thumbnail">
>;
