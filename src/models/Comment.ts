import mongoose from "mongoose";

import type { IComment } from "../interfaces/IComment.ts";

const commentSchema = new mongoose.Schema<IComment>(
  {
    username: {
      type: String,
      default: "user",
    },
    content: {
      type: String,
      required: true,
      minLength: 5,
    },
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: [true, "This comment is not related to any product"],
    },
    likes: {
      type: Number,
      default: 0,
    },
    dislikes: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  },
);

const Comment = mongoose.model<IComment>("Comment", commentSchema);

export default Comment;
