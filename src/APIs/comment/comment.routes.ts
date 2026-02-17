import express from 'express';

import commentController from './comment.controller.ts';
import authenticateToken from '../../middlewares/authenticateToken.ts';
import validate from '../../middlewares/zod.validation.ts';
import {
  submitSchema,
  doLikeSchema,
  doDislikeSchema,
  undoLikeSchema,
  undoDislikeSchema,
} from './comment.schema.ts';

const commentRouter = express.Router();

commentRouter.post(
  '/submit',
  authenticateToken,
  validate(submitSchema),
  commentController.submit,
);
commentRouter.post(
  '/like/:id',
  authenticateToken,
  validate(doLikeSchema),
  commentController.doLike,
);
commentRouter.post(
  '/dislike/:id',
  authenticateToken,
  validate(doDislikeSchema),
  commentController.doDislike,
);
commentRouter.post(
  '/undo-like/:id',
  authenticateToken,
  validate(undoLikeSchema),
  commentController.undoLike,
);
commentRouter.post(
  '/undo-dislike/:id',
  authenticateToken,
  validate(undoDislikeSchema),
  commentController.undoDislike,
);

export default commentRouter;
