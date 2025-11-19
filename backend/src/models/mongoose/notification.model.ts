import { Schema, model, Document } from 'mongoose';

interface INotification extends Document {
  userId: string;
  type: 'like' | 'comment' | 'follow' | 'mention' | 'message' | 'sale' | 'event' | 'post_comment' | 'comment_reply' | 'content_removed' | 'comment_removed';
  actorId?: string;
  actorName?: string;
  actorAvatar?: string;
  referenceType?: string;
  referenceId?: string;
  title?: string;
  message?: string;
  imageUrl?: string;
  isRead: boolean;
  readAt?: Date;
  createdAt: Date;
  updatedAt: Date;
  data?: any; // For additional structured data
}

const NotificationSchema = new Schema<INotification>(
  {
    userId: { type: String, required: true, index: true },
    type: {
      type: String,
      enum: ['like', 'comment', 'follow', 'mention', 'message', 'sale', 'event', 'post_comment', 'comment_reply', 'content_removed', 'comment_removed'],
      required: true
    },
    
    actorId: String,
    actorName: String,
    actorAvatar: String,
    
    referenceType: String, // 'post', 'comment', 'item', 'event'
    referenceId: String,
    
    title: String,
    message: String,
    imageUrl: String,

    data: Schema.Types.Mixed, // For additional structured data

    isRead: { type: Boolean, default: false, index: true },
    readAt: Date,
  },
  {
    timestamps: true,
  }
);

NotificationSchema.index({ userId: 1, isRead: 1, createdAt: -1 });
// All notifications for a user ordered by recency
NotificationSchema.index({ userId: 1, createdAt: -1 });

export const Notification = model<INotification>('Notification', NotificationSchema);