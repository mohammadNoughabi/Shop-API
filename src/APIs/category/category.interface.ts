import { Document } from "mongoose";

export interface ICategory extends Document {
  title: string;
  thumbnail: string;
  description: string;
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}
