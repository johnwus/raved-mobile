"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Comment = void 0;
const mongoose_1 = require("mongoose");
const CommentSchema = new mongoose_1.Schema({
    postId: { type: String, required: true, index: true },
    userId: { type: String, required: true },
    text: { type: String, required: true, maxlength: 500 },
    parentCommentId: { type: String, default: null }, // For nested replies
    likesCount: { type: Number, default: 0 },
    // Post-moderation fields
    isRemoved: { type: Boolean, default: false },
    removedReason: {
        type: String,
        enum: ['automated_moderation', 'manual_review', 'user_deleted']
    },
    removedAt: Date,
    isFlaggedForReview: { type: Boolean, default: false },
    moderationResult: {
        isFlagged: Boolean,
        categories: Object,
        category_scores: Object,
        flagged_categories: [String],
        severity: String,
        rawScores: Object,
    },
    moderatedAt: Date,
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
    deletedAt: Date
});
CommentSchema.index({ postId: 1, createdAt: -1 });
// For replies listing and thread queries
CommentSchema.index({ postId: 1, parentCommentId: 1, createdAt: -1 });
// For user comments listing
CommentSchema.index({ userId: 1, createdAt: -1 });
// Post-moderation indexes
CommentSchema.index({ isRemoved: 1, createdAt: -1 });
CommentSchema.index({ isFlaggedForReview: 1, createdAt: -1 });
CommentSchema.index({ moderatedAt: 1 }, { sparse: true });
exports.Comment = (0, mongoose_1.model)('Comment', CommentSchema);
