import type { IProduct } from '../product/product.interface.ts';
import type { Result } from '../../types/serviceResult/index.d.ts';

export interface IProductQuery {
  searchTerm?: string;
  sort?: string;
  limit?: number;
  page?: number;
  fields?: string;
  minPrice?: number;
  maxPrice?: number;
  category?: string;
}

export type SearchResult = Result<{
  total: number;
  page: number | undefined;
  limit: number | undefined;
  products: IProduct[];
}>;

export interface Filter {
  title?: {
    $regex?: string;
    $options?: string;
  };
  price?: {
    $gte?: number;
    $lte?: number;
  };
  category?: string;
}
