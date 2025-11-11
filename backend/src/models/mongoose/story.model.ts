import { Schema, model, Document } from 'mongoose';

interface IStory extends Document {
  userId: string;
  type: 'image' | 'video' | 'template' | 'text';
  content: string;
  text?: string;
  thumbnail?: string;
  allowReplies: boolean;
  addToHighlights: boolean;
  viewsCount: number;
  repliesCount: number;
  expiresAt: Date;
  createdAt: Date;
}

const StorySchema = new Schema<IStory>({
  userId: { type: String, required: true, index: true },
  type: { 
    type: String, 
    enum: ['image', 'video', 'template', 'text'], 
    required: true 
  },
  content: { type: String, required: true }, // URL or template ID
  text: String,
  thumbnail: String,
  
  allowReplies: { type: Boolean, default: true },
  addToHighlights: { type: Boolean, default: false },
  
  viewsCount: { type: Number, default: 0 },
  repliesCount: { type: Number, default: 0 },
  
  expiresAt: { 
    type: Date, 
    default: () => new Date(Date.now() + 24 * 60 * 60 * 1000),
    index: true
  },
  
  createdAt: { type: Date, default: Date.now }
});

StorySchema.index({ userId: 1, expiresAt: -1 });

export const Story = model<IStory>('Story', StorySchema);
