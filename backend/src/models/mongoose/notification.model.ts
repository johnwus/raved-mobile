import { Schema, model, Document } from 'mongoose';

interface INotification extends Document {
  userId: string;
  type: 'like' | 'comment' | 'follow' | 'mention' | 'message' | 'sale' | 'event';
  actorId?: string;
  referenceType?: string;
  referenceId?: string;
  title?: string;
  message?: string;
  imageUrl?: string;
  isRead: boolean;
  readAt?: Date;
  createdAt: Date;
}

const NotificationSchema = new Schema<INotification>({
  userId: { type: String, required: true, index: true },
  type: { 
    type: String, 
    enum: ['like', 'comment', 'follow', 'mention', 'message', 'sale', 'event'], 
    required: true 
  },
  
  actorId: String,
  
  referenceType: String, // 'post', 'comment', 'item', 'event'
  referenceId: String,
  
  title: String,
  message: String,
  imageUrl: String,
  
  isRead: { type: Boolean, default: false },
  readAt: Date,
  
  createdAt: { type: Date, default: Date.now, index: true }
});

NotificationSchema.index({ userId: 1, isRead: 1, createdAt: -1 });

export const Notification = model<INotification>('Notification', NotificationSchema);
