import { Schema, model, Document } from 'mongoose';

export interface IModerationQueue extends Document {
  contentId: string; // ID of the content (post, comment, message)
  contentType: 'post' | 'comment' | 'message' | 'story';
  userId: string; // User who created the content
  content: string; // The actual content text
  mediaUrls?: string[]; // URLs of attached media
  moderationResult: {
    isFlagged: boolean;
    categories: Record<string, boolean>;
    category_scores: Record<string, number>;
    flagged_categories: string[];
    severity: 'low' | 'medium' | 'high';
  };
  status: 'pending' | 'approved' | 'rejected' | 'auto_approved' | 'auto_rejected';
  reviewedBy?: string; // Admin user ID who reviewed
  reviewedAt?: Date;
  reviewNotes?: string;
  autoModerated: boolean; // Whether it was auto-moderated
  userTrustScore: number; // User's trust score at time of moderation
  createdAt: Date;
  updatedAt: Date;
}

const ModerationQueueSchema = new Schema<IModerationQueue>({
  contentId: { type: String, required: true, index: true },
  contentType: {
    type: String,
    enum: ['post', 'comment', 'message', 'story'],
    required: true,
    index: true
  },
  userId: { type: String, required: true, index: true },
  content: { type: String, required: true },
  mediaUrls: [{ type: String }],

  moderationResult: {
    isFlagged: { type: Boolean, required: true },
    categories: { type: Map, of: Boolean, required: true },
    category_scores: { type: Map, of: Number, required: true },
    flagged_categories: [{ type: String }],
    severity: {
      type: String,
      enum: ['low', 'medium', 'high'],
      required: true
    }
  },

  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected', 'auto_approved', 'auto_rejected'],
    default: 'pending',
    index: true
  },

  reviewedBy: String,
  reviewedAt: Date,
  reviewNotes: String,

  autoModerated: { type: Boolean, default: false },
  userTrustScore: { type: Number, required: true, min: 0, max: 100 },

  createdAt: { type: Date, default: Date.now, index: true },
  updatedAt: { type: Date, default: Date.now }
});

// Compound indexes for efficient queries
ModerationQueueSchema.index({ status: 1, createdAt: -1 });
ModerationQueueSchema.index({ userId: 1, createdAt: -1 });
ModerationQueueSchema.index({ contentType: 1, status: 1, createdAt: -1 });

// Update updatedAt on save
ModerationQueueSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

export const ModerationQueue = model<IModerationQueue>('ModerationQueue', ModerationQueueSchema);