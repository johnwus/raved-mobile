import mongoose, { Schema } from 'mongoose';

interface IModerationQueue extends mongoose.Document {
  contentId: string;
  contentType: 'post' | 'comment' | 'message';
  userId: string;
  content: string;
  moderationResult: {
    isFlagged: boolean;
    categories: Record<string, boolean>;
    category_scores: Record<string, number>;
    flagged_categories: string[];
    severity: 'low' | 'medium' | 'high';
    rawScores?: any;
  };
  userTrustScore: number;
  status: 'pending' | 'reviewed' | 'approved' | 'removed';
  reviewedBy?: string;
  reviewedAt?: Date;
  decision?: 'approve' | 'remove' | 'escalate';
  notes?: string;
  priority: 'low' | 'medium' | 'high';
  createdAt: Date;
  updatedAt: Date;
}

const ModerationQueueSchema = new Schema<IModerationQueue>({
  contentId: { type: String, required: true, index: true },
  contentType: {
    type: String,
    enum: ['post', 'comment', 'message'],
    required: true
  },
  userId: { type: String, required: true, index: true },
  content: { type: String, required: true },
  moderationResult: { type: Object, required: true },
  userTrustScore: { type: Number, required: true },
  status: {
    type: String,
    enum: ['pending', 'reviewed', 'approved', 'removed'],
    default: 'pending',
    index: true
  },
  reviewedBy: { type: String },
  reviewedAt: { type: Date },
  decision: {
    type: String,
    enum: ['approve', 'remove', 'escalate']
  },
  notes: { type: String },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high'],
    default: 'medium'
  },
}, { timestamps: true });

export const ModerationQueue = mongoose.model<IModerationQueue>('ModerationQueue', ModerationQueueSchema);