import type { Request, Response } from 'express';

import commentService from './comment.service.ts';
import type { SubmitCommentSchema } from './comment.schema.ts';
import { Types } from 'mongoose';

class CommentController {
  async submit(req: Request, res: Response): Promise<Response> {
    const userId = req.user._id as string;
    const { content } = req.body as SubmitCommentSchema['body'];
    const { productId } = req.query as SubmitCommentSchema['query'];
    const result = await commentService.submitComment({
      content,
      productId: new Types.ObjectId(productId),
      userId: new Types.ObjectId(userId),
    });
    if (!result.success) {
      return res.status(result.statusCode || 500).json(result);
    }
    return res.status(result.statusCode || 200).json(result);
  }

  async doLike(req: Request, res: Response): Promise<Response> {
    const userId = req.user._id as string;
    const commentId = req.query.commentId as string; // from zod-validated query

    const result = await commentService.doLike({ commentId, userId });
    if (!result.success) {
      return res.status(result.statusCode || 400).json(result);
    }
    return res.status(result.statusCode || 200).json(result);
  }

  async doDislike(req: Request, res: Response): Promise<Response> {
    const userId = req.user._id as string;
    const commentId = req.query.commentId as string;

    const result = await commentService.doDislike({ commentId, userId });
    if (!result.success) {
      return res.status(result.statusCode || 400).json(result);
    }
    return res.status(result.statusCode || 200).json(result);
  }

  async undoLike(req: Request, res: Response): Promise<Response> {
    const userId = req.user._id as string;
    const commentId = req.query.commentId as string;

    const result = await commentService.undoLike({ commentId, userId });
    if (!result.success) {
      return res.status(result.statusCode || 400).json(result);
    }
    return res.status(result.statusCode || 200).json(result);
  }

  async undoDislike(req: Request, res: Response): Promise<Response> {
    const userId = req.user._id as string;
    const commentId = req.query.commentId as string;

    const result = await commentService.undoDislike({ commentId, userId });
    if (!result.success) {
      return res.status(result.statusCode || 400).json(result);
    }
    return res.status(result.statusCode || 200).json(result);
  }
}

export default new CommentController();
