import { Schema, model, Document } from 'mongoose';

interface IMessage extends Document {
  conversationId: string;
  senderId: string;
  receiverId: string;
  messageType: 'text' | 'image' | 'video' | 'post' | 'item';
  content: string;
  mediaUrl?: string;
  referenceType?: string;
  referenceId?: string;
  isRead: boolean;
  readAt?: Date;
  isDelivered: boolean;
  deliveredAt?: Date;
  createdAt: Date;
  deletedAt?: Date;
}

const MessageSchema = new Schema<IMessage>({
  conversationId: { type: String, required: true, index: true },
  senderId: { type: String, required: true },
  receiverId: { type: String, required: true },
  
  messageType: { 
    type: String, 
    enum: ['text', 'image', 'video', 'post', 'item'], 
    default: 'text' 
  },
  content: { type: String, required: true },
  mediaUrl: String,
  
  referenceType: String,
  referenceId: String,
  
  isRead: { type: Boolean, default: false },
  readAt: Date,
  isDelivered: { type: Boolean, default: false },
  deliveredAt: Date,
  
  createdAt: { type: Date, default: Date.now, index: true },
  deletedAt: Date
});

MessageSchema.index({ conversationId: 1, createdAt: -1 });
MessageSchema.index({ senderId: 1, receiverId: 1 });

export const Message = model<IMessage>('Message', MessageSchema);
