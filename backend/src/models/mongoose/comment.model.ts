import { Schema, model, Document } from 'mongoose';

interface IComment extends Document {
  postId: string;
  userId: string;
  text: string;
  parentCommentId?: string;
  likesCount: number;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date;
}

const CommentSchema = new Schema<IComment>({
  postId: { type: String, required: true, index: true },
  userId: { type: String, required: true },
  text: { type: String, required: true, maxlength: 500 },
  parentCommentId: { type: String, default: null }, // For nested replies
  
  likesCount: { type: Number, default: 0 },
  
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
  deletedAt: Date
});

CommentSchema.index({ postId: 1, createdAt: -1 });

export const Comment = model<IComment>('Comment', CommentSchema);
