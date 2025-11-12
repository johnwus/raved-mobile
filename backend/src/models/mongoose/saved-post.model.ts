import { Schema, model, Document } from 'mongoose';

interface ISavedPost extends Document {
  userId: string;
  postId: string;
  createdAt: Date;
}

const SavedPostSchema = new Schema<ISavedPost>({
  userId: { type: String, required: true, index: true },
  postId: { type: String, required: true, index: true },
  createdAt: { type: Date, default: Date.now },
});

SavedPostSchema.index({ userId: 1, postId: 1 }, { unique: true });

export const SavedPost = model<ISavedPost>('SavedPost', SavedPostSchema);