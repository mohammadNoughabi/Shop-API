import type { Document, Types } from 'mongoose';
import type { Result } from '../../types/serviceResult/index.d.ts';

export interface IProduct extends Document {
  title: string;
  description: string;
  image: string;
  gallery: string[];
  price: string;
  stock: number;
  rate: number;
  category: Types.ObjectId;
  isDeleted: boolean;
  deletedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

// define upload file types
export interface ProductFiles {
  image?: Express.Multer.File[];
  gallery?: Express.Multer.File[];
}

export type GetProductByIdResult = Result<{ product: IProduct }>;
export type GetAllProductsResult = Result<{ products: IProduct[] }>;
export type CreateProductResult = Result<{ product: IProduct }>;
export type UpdateProductResult = Result<{ product: IProduct }>;
export type DeleteProductResult = Result<{ product: IProduct }>;
export type BulkUpdateStockResult = Result<null>;
