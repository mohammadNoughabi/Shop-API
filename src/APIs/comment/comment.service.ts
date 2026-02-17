import { Types } from 'mongoose';
import Comment from './comment.model.ts';

import type {
  SubmitCommentData,
  SubmitCommentResult,
  DoLikeResult,
  DoDislikeResult,
  UndoLikeResult,
  UndoDislikeResult,
} from './comment.interface.ts';

class CommentService {
  async submitComment(data: SubmitCommentData): Promise<SubmitCommentResult> {
    const { content, productId, userId } = data;

    const createdComment = await Comment.create({
      content,
      productId,
      userId,
    }).catch(() => null);

    if (!createdComment) {
      return {
        success: false,
        message: 'Failed to submit comment',
        statusCode: 500,
      };
    }

    return {
      success: true,
      message: 'Comment submitted successfully',
      statusCode: 201,
      data: { submittedComment: createdComment },
    };
  }

  async doLike(data: {
    commentId: string;
    userId: string;
  }): Promise<DoLikeResult> {
    const { commentId, userId } = data;
    const userObjId = new Types.ObjectId(userId);

    const comment = await Comment.findById(commentId);
    if (!comment) {
      return { success: false, message: 'Comment not found', statusCode: 404 };
    }

    const alreadyLiked = comment.likes.includes(userObjId);
    const alreadyDisliked = comment.dislikes.includes(userObjId);

    if (alreadyLiked) {
      return { success: false, message: 'Already liked', statusCode: 400 };
    }

    // Remove from dislikes if present (toggle behavior)
    if (alreadyDisliked) {
      comment.dislikes.pull(userObjId);
    }

    comment.likes.push(userObjId);
    await comment.save();

    return {
      success: true,
      message: 'Liked',
      statusCode: 200,
      data: { updatedComment: comment },
    };
  }

  async doDislike(data: {
    commentId: string;
    userId: string;
  }): Promise<DoDislikeResult> {
    const { commentId, userId } = data;
    const userObjId = new Types.ObjectId(userId);

    const comment = await Comment.findById(commentId);
    if (!comment) {
      return { success: false, message: 'Comment not found', statusCode: 404 };
    }

    const alreadyDisliked = comment.dislikes.includes(userObjId);
    const alreadyLiked = comment.likes.includes(userObjId);

    if (alreadyDisliked) {
      return { success: false, message: 'Already disliked', statusCode: 400 };
    }

    if (alreadyLiked) {
      comment.likes.pull(userObjId);
    }

    comment.dislikes.push(userObjId);
    await comment.save();

    return {
      success: true,
      message: 'Disliked',
      statusCode: 200,
      data: { updatedComment: comment },
    };
  }

  async undoLike(data: {
    commentId: string;
    userId: string;
  }): Promise<UndoLikeResult> {
    const { commentId, userId } = data;
    const userObjId = new Types.ObjectId(userId);

    const comment = await Comment.findById(commentId);
    if (!comment) {
      return { success: false, message: 'Comment not found', statusCode: 404 };
    }

    if (!comment.likes.includes(userObjId)) {
      return {
        success: false,
        message: 'You have not liked this comment',
        statusCode: 400,
      };
    }

    comment.likes.pull(userObjId);
    await comment.save();

    return {
      success: true,
      message: 'Like removed',
      statusCode: 200,
      data: { updatedComment: comment },
    };
  }

  async undoDislike(data: {
    commentId: string;
    userId: string;
  }): Promise<UndoDislikeResult> {
    const { commentId, userId } = data;
    const userObjId = new Types.ObjectId(userId);

    const comment = await Comment.findById(commentId);
    if (!comment) {
      return { success: false, message: 'Comment not found', statusCode: 404 };
    }

    if (!comment.dislikes.includes(userObjId)) {
      return {
        success: false,
        message: 'You have not disliked this comment',
        statusCode: 400,
      };
    }

    comment.dislikes.pull(userObjId);
    await comment.save();

    return {
      success: true,
      message: 'Dislike removed',
      statusCode: 200,
      data: { updatedComment: comment },
    };
  }
}

export default new CommentService();
