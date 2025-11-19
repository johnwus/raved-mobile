"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.likePost = void 0;
const mongoose_1 = require("../models/mongoose");
const database_1 = require("../config/database");
const notifications_controller_1 = require("../controllers/notifications.controller");
const likePost = async (postId, userId, userSubscription, io) => {
    const post = await mongoose_1.Post.findOne({ _id: postId, deletedAt: null });
    if (!post) {
        throw new Error('Post not found');
    }
    const existingLike = await mongoose_1.Like.findOne({
        userId,
        targetId: postId,
        targetType: 'post'
    });
    if (existingLike) {
        // Unlike
        await mongoose_1.Like.deleteOne({ _id: existingLike._id });
        await mongoose_1.Post.updateOne({ _id: postId }, { $inc: { likesCount: -1 } });
        return {
            action: 'unliked',
            likesCount: post.likesCount - 1
        };
    }
    else {
        // Like
        const like = await mongoose_1.Like.create({
            userId,
            targetId: postId,
            targetType: 'post'
        });
        try {
            await mongoose_1.Post.updateOne({ _id: postId }, { $inc: { likesCount: 1 } });
            if (post.userId !== userId) {
                // Get user details for notification
                const userResult = await database_1.pgPool.query('SELECT first_name, last_name FROM users WHERE id = $1', [userId]);
                const user = userResult.rows[0];
                const actorName = `${user.first_name} ${user.last_name}`;
                const postTitle = post.caption?.substring(0, 100) || 'your post';
                // Create notification using the controller with enriched data
                await notifications_controller_1.notificationsController.createNotification(post.userId, 'like', 'New Like', `${actorName} liked your post`, userId, {
                    postId,
                    type: 'post',
                    postTitle
                });
                if (userSubscription === 'premium') {
                    // await updateUserScore(post.userId, 'like');
                }
            }
            return {
                action: 'liked',
                likesCount: post.likesCount + 1
            };
        }
        catch (error) {
            // Rollback
            await mongoose_1.Like.deleteOne({ _id: like._id });
            throw error;
        }
    }
};
exports.likePost = likePost;
