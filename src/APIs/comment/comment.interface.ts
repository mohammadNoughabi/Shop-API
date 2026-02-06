import type { Schema, Document } from 'mongoose';

export interface IComment extends Document {
  content: string;
  product: Schema.Types.ObjectId;
  user: Schema.Types.ObjectId;
  likes: number;
  dislikes: number;
}

export type SubmitCommentData = Pick<IComment, 'content' | 'product' | 'user'>;
