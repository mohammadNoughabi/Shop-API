import mongoose from 'mongoose';
import { Types } from 'mongoose';
import type { IComment } from './comment.interface.ts';

const commentSchema = new mongoose.Schema<IComment>({
  id: {
    type: String,
    required: true,
    unique: true,
  },
  content: {
    type: String,
    required: true,
  },
  productId: {
    type: Types.ObjectId,
    ref: 'Product',
    required: true,
  },
  userId: {
    type: Types.ObjectId,
    ref: 'User',
    required: true,
  },
  likes: {
    type: [Types.ObjectId],
    ref: 'User',
    default: [],
  },
  dislikes: {
    type: [Types.ObjectId],
    ref: 'User',
    default: [],
  },
});

const Comment = mongoose.model<IComment>('Comment', commentSchema);

export default Comment;
