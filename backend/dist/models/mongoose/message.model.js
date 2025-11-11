"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Message = void 0;
const mongoose_1 = require("mongoose");
const MessageSchema = new mongoose_1.Schema({
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
exports.Message = (0, mongoose_1.model)('Message', MessageSchema);
