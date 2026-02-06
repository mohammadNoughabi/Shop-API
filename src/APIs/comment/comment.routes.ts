import express from 'express';

import commentController from './comment.controller.ts';
import authenticateToken from '../../middlewares/authenticateToken.ts';

const commentRouter = express.Router();

commentRouter.post('/submit', authenticateToken, commentController.submit);
commentRouter.post('/like/:id', authenticateToken, commentController.like);
commentRouter.post(
  '/dislike/:id',
  authenticateToken,
  commentController.disLike,
);
commentRouter.post(
  '/undo-like/:id',
  authenticateToken,
  commentController.undoLike,
);
commentRouter.post(
  '/undo-dislike/:id',
  authenticateToken,
  commentController.undoDisLike,
);

export default commentRouter;
