import type { Types, Document } from 'mongoose';
import type { Result } from '../../types/serviceResult/index.d.ts';

export interface IComment extends Document {
  content: string;
  productId: Types.ObjectId;
  userId: Types.ObjectId;
  likes: Types.Array<Types.ObjectId>;
  dislikes: Types.Array<Types.ObjectId>;
}

export interface SubmitCommentData {
  content: string;
  productId: Types.ObjectId;
  userId: Types.ObjectId;
}

export type SubmitCommentResult = Result<{ submittedComment: IComment }>;
export type DoLikeResult = Result<{ updatedComment: IComment }>;
export type DoDislikeResult = Result<{ updatedComment: IComment }>;
export type UndoLikeResult = Result<{ updatedComment: IComment }>;
export type UndoDislikeResult = Result<{ updatedComment: IComment }>;
