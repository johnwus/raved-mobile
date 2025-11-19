"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.opsController = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const post_model_1 = require("../models/mongoose/post.model");
const story_model_1 = require("../models/mongoose/story.model");
const comment_model_1 = require("../models/mongoose/comment.model");
const like_model_1 = require("../models/mongoose/like.model");
const notification_model_1 = require("../models/mongoose/notification.model");
async function getIndexHealth(req, res) {
    try {
        const db = mongoose_1.default.connection;
        const postIndexes = await post_model_1.Post.collection.indexes();
        const storyIndexes = await story_model_1.Story.collection.indexes();
        const commentIndexes = await comment_model_1.Comment.collection.indexes();
        const likeIndexes = await like_model_1.Like.collection.indexes();
        const notificationIndexes = await notification_model_1.Notification.collection.indexes();
        const storyTtl = storyIndexes.find((i) => i.name?.includes('expiresAt')) || null;
        res.json({
            success: true,
            mongo: {
                name: db.name,
                host: db.client?.s?.host || undefined,
            },
            indexes: {
                post: postIndexes,
                story: storyIndexes,
                comment: commentIndexes,
                like: likeIndexes,
                notification: notificationIndexes,
            },
            ttl: {
                stories: storyTtl ? { key: 'expiresAt', expireAfterSeconds: storyTtl.expireAfterSeconds } : null,
            }
        });
    }
    catch (error) {
        console.error('Index health error', error);
        res.status(500).json({ success: false, error: 'Failed to read index health' });
    }
}
async function getSalesLinkCoverage(req, res) {
    try {
        const totalForSale = await post_model_1.Post.countDocuments({ isForSale: true });
        const withLink = await post_model_1.Post.countDocuments({ isForSale: true, 'saleDetails.storeItemId': { $exists: true, $ne: null } });
        res.json({ success: true, totalForSale, withStoreLink: withLink, coverage: totalForSale ? Math.round((withLink / totalForSale) * 100) : 100 });
    }
    catch (error) {
        console.error('Sales link coverage error', error);
        res.status(500).json({ success: false, error: 'Failed to compute coverage' });
    }
}
exports.opsController = {
    getIndexHealth,
    getSalesLinkCoverage,
};
