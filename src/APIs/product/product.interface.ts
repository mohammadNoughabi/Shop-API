import type { Document, Types } from 'mongoose';
import type { Result } from '../../types/serviceResult/index.d.ts';
import type { CreateProductBody, UpdateProductBody } from './product.schema.ts';

export interface IProduct extends Document {
  id: string;
  title: string;
  slug: string;
  description: string;
  image: string;
  gallery: string[];
  price: number;
  stock: number;
  rate: number;
  categoryId: Types.ObjectId;
  isDeleted: boolean;
  deletedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

// input types for service layer
export interface CreateProductData extends CreateProductBody {
  image: string;
  gallery?: string[];
}
export interface UpdateProductData extends UpdateProductBody {
  image?: string;
  gallery?: string[];
}

// service result types
export type GetProductByIdResult = Result<{ product: IProduct }>;
export type GetProductBySlugResult = Result<{ product: IProduct }>;
export type GetAllProductsResult = Result<{ products: IProduct[] }>;
export type CreateProductResult = Result<{ product: IProduct }>;
export type UpdateProductResult = Result<{ product: IProduct }>;
export type DeleteProductResult = Result<{ product: IProduct }>;
export type RestoreProductResult = Result<{ product: IProduct }>;
export type BulkUpdateStockResult = Result<null>;
