import type { Request, Response } from 'express';

import commentService from './comment.service.ts';
import type { SubmitCommentData } from './comment.interface.ts';

class CommentController {
  async submit(req: Request, res: Response): Promise<Response> {
    try {
      const content = req.body.content;
      const productId = req.body.productId;
      const userId = req.body.userId;
      const creationData: SubmitCommentData = {
        content,
        product: productId,
        user: userId,
      };
      const newComment = await commentService.submitComment(creationData);
      return res.status(200).json({
        success: true,
        message: 'Comment submitted successfully',
        data: { newComment },
      });
    } catch (error) {
      console.log(error);
      return res
        .status(500)
        .json({ success: false, message: 'Internal srever error' });
    }
  }

  async like() {
    // Not implemented yet
  }

  async disLike() {
    // Not implemented yet
  }

  async undoLike() {
    // Not implemented yet
  }

  async undoDisLike() {
    // Not implemented yet
  }
}

export default new CommentController();
