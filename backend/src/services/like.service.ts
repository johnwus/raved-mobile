import { Post, Like, Notification } from '../models/mongoose';
import { pgPool } from '../config/database';
import { Server } from 'socket.io';
import { notificationsController } from '../controllers/notifications.controller';

export const likePost = async (postId: string, userId: string, userSubscription: string, io: Server) => {
    const post = await Post.findOne({ _id: postId, deletedAt: null });
    if (!post) {
        throw new Error('Post not found');
    }

    const existingLike = await Like.findOne({
        userId,
        targetId: postId,
        targetType: 'post'
    });

    if (existingLike) {
        // Unlike
        await Like.deleteOne({ _id: existingLike._id });
        await Post.updateOne(
            { _id: postId },
            { $inc: { likesCount: -1 } }
        );
        return {
            action: 'unliked',
            likesCount: post.likesCount - 1
        };
    } else {
        // Like
        const like = await Like.create({
            userId,
            targetId: postId,
            targetType: 'post'
        });

        try {
            await Post.updateOne(
                { _id: postId },
                { $inc: { likesCount: 1 } }
            );

            if (post.userId !== userId) {
                // Get user details for notification
                const userResult = await pgPool.query(
                    'SELECT first_name, last_name FROM users WHERE id = $1',
                    [userId]
                );
                const user = userResult.rows[0];

                const actorName = `${user.first_name} ${user.last_name}`;

                // Create notification using the controller
                await notificationsController.createNotification(
                    post.userId,
                    'like',
                    'New Like',
                    `${actorName} liked your post`,
                    userId,
                    { postId, type: 'post' }
                );

                if (userSubscription === 'premium') {
                    // await updateUserScore(post.userId, 'like');
                }
            }

            return {
                action: 'liked',
                likesCount: post.likesCount + 1
            };
        } catch (error) {
            // Rollback
            await Like.deleteOne({ _id: like._id });
            throw error;
        }
    }
};
