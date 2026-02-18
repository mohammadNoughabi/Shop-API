import { z } from 'zod';

export const productQuerySchema = z.object({
  query: z.object({
    searchTerm: z.string().optional(),
    sort: z.string().optional(),
    limit: z.coerce.number().optional().default(10),
    page: z.coerce.number().optional().default(1),
    fields: z.string().optional(),
    minPrice: z.coerce.number().optional(),
    maxPrice: z.coerce.number().optional(),
    category: z.string().optional(),
  }),
});
