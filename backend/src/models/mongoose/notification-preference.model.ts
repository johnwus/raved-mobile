import { Schema, model, Document } from 'mongoose';

interface INotificationPreference extends Document {
  userId: string;
  pushEnabled: boolean;
  likes: boolean;
  comments: boolean;
  follows: boolean;
  mentions: boolean;
  messages: boolean;
  events: boolean;
  sales: boolean;
  marketing: boolean;
  soundEnabled: boolean;
  vibrationEnabled: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const NotificationPreferenceSchema = new Schema<INotificationPreference>(
  {
    userId: { type: String, required: true, unique: true, index: true },
    pushEnabled: { type: Boolean, default: true },
    likes: { type: Boolean, default: true },
    comments: { type: Boolean, default: true },
    follows: { type: Boolean, default: true },
    mentions: { type: Boolean, default: true },
    messages: { type: Boolean, default: true },
    events: { type: Boolean, default: true },
    sales: { type: Boolean, default: true },
    marketing: { type: Boolean, default: false },
    soundEnabled: { type: Boolean, default: true },
    vibrationEnabled: { type: Boolean, default: true },
  },
  {
    timestamps: true,
  }
);

export const NotificationPreference = model<INotificationPreference>(
  'NotificationPreference',
  NotificationPreferenceSchema
);
