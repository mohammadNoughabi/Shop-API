import Product from '../product/product.model.ts';
import type { IProductQuery, SearchResult, Filter } from './interface.ts';

class SearchSortFilterService {
  async search(query: IProductQuery): Promise<SearchResult> {
    const {
      searchTerm,
      sort = '-createdAt',
      limit = 10,
      page = 1,
      fields,
      minPrice,
      maxPrice,
      category,
    } = query;

    const filter: Filter = {};

    // Text search (assuming field is now "title")
    if (searchTerm?.trim()) {
      filter.title = { $regex: searchTerm.trim(), $options: 'i' };
    }

    // Price range – IMPORTANT: assumes price is number in schema
    if (minPrice !== undefined || maxPrice !== undefined) {
      filter.price = {};
      if (minPrice !== undefined && !isNaN(minPrice)) {
        filter.price.$gte = minPrice; // ← number
      }
      if (maxPrice !== undefined && !isNaN(maxPrice)) {
        filter.price.$lte = maxPrice; // ← number
      }
    }

    if (category?.trim()) {
      filter.category = category.trim();
    }

    // ── Safe sorting ───────────────────────────────────────
    let sortObj: Record<string, 1 | -1> = { createdAt: -1 };

    if (sort && typeof sort === 'string') {
      const safeSortFields = [
        'title',
        'price',
        'createdAt',
        'updatedAt',
        'rating',
        '-title',
        '-price',
        '-createdAt',
        '-updatedAt',
        '-rating',
      ];

      if (safeSortFields.includes(sort)) {
        const field = sort.startsWith('-') ? sort.slice(1) : sort;
        sortObj = { [field]: sort.startsWith('-') ? -1 : 1 };
      }
    }

    // ── Projection / select fields ─────────────────────────
    let projection: Record<string, 1> = {};

    if (fields && typeof fields === 'string') {
      const fieldList = fields
        .split(',')
        .map((f: string) => f.trim())
        .filter(Boolean);

      if (fieldList.length > 0) {
        projection = fieldList.reduce((acc, f) => ({ ...acc, [f]: 1 }), {});
      }
    } else if (Array.isArray(fields) && fields.length > 0) {
      projection = fields.reduce(
        (acc, f) => ({ ...acc, [f.trim()]: 1 }),
        {} as Record<string, 1>,
      );
    }

    // ── Execute query ──────────────────────────────────────
    const productsQuery = Product.find(filter)
      .sort(sortObj)
      .skip((page - 1) * limit)
      .limit(limit);

    if (Object.keys(projection).length > 0) {
      productsQuery.select(projection);
    }

    const [products, total] = await Promise.all([
      productsQuery.lean(),
      Product.countDocuments(filter),
    ]);

    return {
      success: true,
      message: 'Products retrieved successfully',
      statusCode: 200,
      data: {
        total,
        page,
        limit,
        products,
      },
    };
  }
}

export default new SearchSortFilterService();
