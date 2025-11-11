import { Post, Comment, Notification } from '../models/mongoose';
import { pgPool } from '../config/database';
import { notificationsController } from '../controllers/notifications.controller';
import { getAvatarUrl } from '../utils';

export const commentOnPost = async (postId: string, userId: string, text: string, parentCommentId: string | null, userSubscription: string) => {
    const post = await Post.findOne({ _id: postId, deletedAt: null });
    if (!post) {
        throw new Error('Post not found');
    }

    const comment = await Comment.create({
        postId,
        userId,
        text,
        parentCommentId: parentCommentId || null
    });

    try {
        await Post.updateOne(
            { _id: postId },
            { $inc: { commentsCount: 1 } }
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
                'comment',
                'New Comment',
                `${actorName} commented on your post`,
                userId,
                { postId, commentId: comment._id, type: 'post' }
            );

            if (userSubscription === 'premium') {
                // await updateUserScore(post.userId, 'comment');
            }
        }

        const user = await pgPool.query(
            'SELECT id, username, first_name, last_name, avatar_url FROM users WHERE id = $1',
            [userId]
        );

        return {
            id: comment._id,
            text: comment.text,
            user: {
                id: user.rows[0].id,
                username: user.rows[0].username,
                name: `${user.rows[0].first_name} ${user.rows[0].last_name}`,
                avatarUrl: getAvatarUrl(user.rows[0].avatar_url, user.rows[0].id)
            },
            createdAt: comment.createdAt,
        };
    } catch (error) {
        // Rollback
        await Comment.deleteOne({ _id: comment._id });
        throw error;
    }
};
