import { Schema, model, Document } from 'mongoose';

interface ILike extends Document {
  userId: string;
  targetId: string;
  targetType: 'post' | 'comment';
  createdAt: Date;
}

const LikeSchema = new Schema<ILike>({
  userId: { type: String, required: true, index: true },
  targetId: { type: String, required: true, index: true }, // Post or Comment ID
  targetType: { type: String, enum: ['post', 'comment'], required: true },
  createdAt: { type: Date, default: Date.now }
});

LikeSchema.index({ userId: 1, targetId: 1, targetType: 1 }, { unique: true });
// Reverse lookup (who liked a post/comment) with recency
LikeSchema.index({ targetType: 1, targetId: 1, createdAt: -1 });

export const Like = model<ILike>('Like', LikeSchema);
