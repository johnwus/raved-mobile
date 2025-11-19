"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationPreference = void 0;
const mongoose_1 = require("mongoose");
const NotificationPreferenceSchema = new mongoose_1.Schema({
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
}, {
    timestamps: true,
});
exports.NotificationPreference = (0, mongoose_1.model)('NotificationPreference', NotificationPreferenceSchema);
