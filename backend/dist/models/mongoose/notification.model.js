"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Notification = void 0;
const mongoose_1 = require("mongoose");
const NotificationSchema = new mongoose_1.Schema({
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
    data: mongoose_1.Schema.Types.Mixed, // For additional structured data
    isRead: { type: Boolean, default: false, index: true },
    readAt: Date,
}, {
    timestamps: true,
});
NotificationSchema.index({ userId: 1, isRead: 1, createdAt: -1 });
// All notifications for a user ordered by recency
NotificationSchema.index({ userId: 1, createdAt: -1 });
exports.Notification = (0, mongoose_1.model)('Notification', NotificationSchema);
