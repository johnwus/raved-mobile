"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SavedPost = void 0;
const mongoose_1 = require("mongoose");
const SavedPostSchema = new mongoose_1.Schema({
    userId: { type: String, required: true, index: true },
    postId: { type: String, required: true, index: true },
    createdAt: { type: Date, default: Date.now },
});
SavedPostSchema.index({ userId: 1, postId: 1 }, { unique: true });
exports.SavedPost = (0, mongoose_1.model)('SavedPost', SavedPostSchema);
