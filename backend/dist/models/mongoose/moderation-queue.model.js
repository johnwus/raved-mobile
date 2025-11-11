"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ModerationQueue = void 0;
const mongoose_1 = require("mongoose");
const ModerationQueueSchema = new mongoose_1.Schema({
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
ModerationQueueSchema.pre('save', function (next) {
    this.updatedAt = new Date();
    next();
});
exports.ModerationQueue = (0, mongoose_1.model)('ModerationQueue', ModerationQueueSchema);
