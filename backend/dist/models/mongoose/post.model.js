"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Post = void 0;
const mongoose_1 = require("mongoose");
const PostSchema = new mongoose_1.Schema({
    userId: { type: String, required: true, index: true },
    type: {
        type: String,
        enum: ['image', 'video', 'carousel', 'text'],
        default: 'image'
    },
    caption: { type: String, maxlength: 2000 },
    media: {
        image: String,
        video: String,
        thumbnail: String,
        images: [String]
    },
    location: String,
    tags: [String],
    brand: String,
    occasion: String,
    visibility: {
        type: String,
        enum: ['public', 'faculty', 'connections', 'private'],
        default: 'public'
    },
    isForSale: { type: Boolean, default: false },
    saleDetails: {
        price: Number,
        condition: String,
        size: String,
        category: String,
        description: String,
        paymentMethods: [String],
        contactPhone: String,
        meetupLocation: String,
        storeItemId: String,
    },
    likesCount: { type: Number, default: 0 },
    commentsCount: { type: Number, default: 0 },
    sharesCount: { type: Number, default: 0 },
    savesCount: { type: Number, default: 0 },
    viewsCount: { type: Number, default: 0 },
    isFeatured: { type: Boolean, default: false },
    featuredAt: Date,
    faculty: String,
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
    createdAt: { type: Date, default: Date.now, index: true },
    updatedAt: { type: Date, default: Date.now },
    deletedAt: Date
}, {
    timestamps: true
});
PostSchema.index({ userId: 1, createdAt: -1 });
PostSchema.index({ tags: 1 });
PostSchema.index({ isForSale: 1 });
PostSchema.index({ isFeatured: 1, createdAt: -1 });
PostSchema.index({ 'saleDetails.storeItemId': 1 }, { sparse: true });
PostSchema.index({ visibility: 1, faculty: 1, createdAt: -1 });
// Post-moderation indexes
PostSchema.index({ isRemoved: 1, createdAt: -1 });
PostSchema.index({ isFlaggedForReview: 1, createdAt: -1 });
PostSchema.index({ moderatedAt: 1 }, { sparse: true });
exports.Post = (0, mongoose_1.model)('Post', PostSchema);
