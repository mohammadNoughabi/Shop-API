import { Document, Schema } from "mongoose";

export interface IProduct extends Document {
  title: string;
  description: string;
  image: string;
  gallery: string[];
  price: string;
  rate: number;
  category: Schema.Types.ObjectId;
  isDeleted: boolean;
  deletedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

// define upload file types
export type ProductFiles = {
  image: Express.Multer.File[];
  gallery: Express.Multer.File[];
};


export type ProductCreationData = Pick<
  IProduct,
  "title" | "description" | "image" | "gallery" | "price" | "category"
>;

export type ProductUpdateData = Partial<
  Pick<
    IProduct,
    "title" | "description" | "image" | "gallery" | "price" | "category"
  >
>;
