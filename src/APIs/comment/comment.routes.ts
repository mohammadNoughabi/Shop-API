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
  '/like/',
  authenticateToken,
  validate(doLikeSchema),
  commentController.doLike,
);
commentRouter.post(
  '/dislike/',
  authenticateToken,
  validate(doDislikeSchema),
  commentController.doDislike,
);
commentRouter.post(
  '/undo-like/',
  authenticateToken,
  validate(undoLikeSchema),
  commentController.undoLike,
);
commentRouter.post(
  '/undo-dislike/',
  authenticateToken,
  validate(undoDislikeSchema),
  commentController.undoDislike,
);

export default commentRouter;
