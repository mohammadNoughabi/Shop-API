import Comment from './comment.model.ts';

import type { SubmitCommentData } from './comment.interface.ts';

class CommentService {
  async submitComment(creationData: SubmitCommentData) {
    const { content, product, user } = creationData;
    const createdComment = await Comment.create({ content, product, user });
    return createdComment;
  }
}

export default new CommentService();
