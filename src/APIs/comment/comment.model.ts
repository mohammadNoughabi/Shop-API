import mongoose from 'mongoose';
import { Types } from 'mongoose';
import type { IComment } from './comment.interface.ts';

const commentSchema = new mongoose.Schema<IComment>({
  content: {
    type: String,
    required: true,
  },
  product: {
    type: Types.ObjectId,
    ref: 'Product',
    required: true,
  },
  user: {
    type: Types.ObjectId,
    ref: 'User',
    required: true,
  },
  likes: {
    type: Number,
    default: 0,
  },
  dislikes: {
    type: Number,
    default: 0,
  },
});

const Comment = mongoose.model<IComment>('Comment', commentSchema);

export default Comment;
