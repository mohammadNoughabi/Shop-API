import searchSortFilterService from './service.ts';

import type { Request, Response } from 'express';
import type { IProductQuery } from './interface';

class searchSortFilterController {
  async search(req: Request, res: Response): Promise<Response> {
    const query = req.query as IProductQuery;
    const result = await searchSortFilterService.search(query);
    if (!result.success) {
      return res.status(result.statusCode || 500).json(result);
    }
    return res.status(result.statusCode || 200).json(result);
  }
}

export default new searchSortFilterController();
