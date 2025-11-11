"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.notificationsController = void 0;
const database_1 = require("../config/database");
const utils_1 = require("../utils");
const push_notification_service_1 = require("../services/push-notification.service");
const email_service_1 = require("../services/email.service");
exports.notificationsController = {
    // Get user notifications
    getNotifications: async (req, res) => {
        try {
            const userId = req.user.id;
            const { type, read, page = 1, limit = 20 } = req.query;
            const offset = (Number(page) - 1) * Number(limit);
            let query = `
        SELECT n.*, u.username, u.first_name, u.last_name, u.avatar_url
        FROM notifications n
        LEFT JOIN users u ON n.actor_id = u.id
        WHERE n.user_id = $1 AND n.deleted_at IS NULL
      `;
            const params = [userId];
            let paramIndex = 2;
            // Filter by type
            if (type && type !== 'all') {
                query += ` AND n.type = $${paramIndex}`;
                params.push(type);
                paramIndex++;
            }
            // Filter by read status
            if (read !== undefined) {
                query += ` AND n.is_read = $${paramIndex}`;
                params.push(read === 'true');
                paramIndex++;
            }
            query += ` ORDER BY n.created_at DESC`;
            query += ` LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
            params.push(parseInt(limit), offset);
            const result = await database_1.pgPool.query(query, params);
            const notifications = result.rows.map(notification => ({
                id: notification.id,
                type: notification.type,
                title: notification.title,
                message: notification.message,
                data: notification.data || {},
                isRead: notification.is_read,
                actor: notification.actor_id ? {
                    id: notification.actor_id,
                    username: notification.username,
                    name: `${notification.first_name} ${notification.last_name}`,
                    avatarUrl: notification.avatar_url
                } : null,
                createdAt: notification.created_at,
                timeAgo: (0, utils_1.getTimeAgo)(notification.created_at)
            }));
            // Get unread count
            const unreadResult = await database_1.pgPool.query('SELECT COUNT(*) as count FROM notifications WHERE user_id = $1 AND is_read = false AND deleted_at IS NULL', [userId]);
            res.json({
                success: true,
                notifications,
                unreadCount: parseInt(unreadResult.rows[0].count),
                pagination: {
                    page: parseInt(page),
                    limit: parseInt(limit),
                    hasMore: notifications.length === parseInt(limit)
                }
            });
        }
        catch (error) {
            console.error('Get Notifications Error:', error);
            res.status(500).json({ error: 'Failed to get notifications' });
        }
    },
    // Mark notification as read
    markAsRead: async (req, res) => {
        try {
            const { notificationId } = req.params;
            const userId = req.user.id;
            const result = await database_1.pgPool.query('UPDATE notifications SET is_read = true, updated_at = CURRENT_TIMESTAMP WHERE id = $1 AND user_id = $2 RETURNING *', [notificationId, userId]);
            if (result.rows.length === 0) {
                return res.status(404).json({ error: 'Notification not found' });
            }
            res.json({
                success: true,
                message: 'Notification marked as read'
            });
        }
        catch (error) {
            console.error('Mark As Read Error:', error);
            res.status(500).json({ error: 'Failed to mark notification as read' });
        }
    },
    // Mark all notifications as read
    markAllAsRead: async (req, res) => {
        try {
            const userId = req.user.id;
            await database_1.pgPool.query('UPDATE notifications SET is_read = true, updated_at = CURRENT_TIMESTAMP WHERE user_id = $1 AND is_read = false', [userId]);
            res.json({
                success: true,
                message: 'All notifications marked as read'
            });
        }
        catch (error) {
            console.error('Mark All As Read Error:', error);
            res.status(500).json({ error: 'Failed to mark all notifications as read' });
        }
    },
    // Delete notification
    deleteNotification: async (req, res) => {
        try {
            const { notificationId } = req.params;
            const userId = req.user.id;
            const result = await database_1.pgPool.query('UPDATE notifications SET deleted_at = CURRENT_TIMESTAMP WHERE id = $1 AND user_id = $2 RETURNING *', [notificationId, userId]);
            if (result.rows.length === 0) {
                return res.status(404).json({ error: 'Notification not found' });
            }
            res.json({
                success: true,
                message: 'Notification deleted'
            });
        }
        catch (error) {
            console.error('Delete Notification Error:', error);
            res.status(500).json({ error: 'Failed to delete notification' });
        }
    },
    // Get notification settings
    getNotificationSettings: async (req, res) => {
        try {
            const userId = req.user.id;
            const result = await database_1.pgPool.query('SELECT * FROM notification_settings WHERE user_id = $1', [userId]);
            const settings = result.rows[0] || {
                email_notifications: true,
                push_notifications: true,
                likes_notifications: true,
                comments_notifications: true,
                follows_notifications: true,
                events_notifications: true,
                messages_notifications: true,
                marketing_notifications: false
            };
            res.json({
                success: true,
                settings
            });
        }
        catch (error) {
            console.error('Get Notification Settings Error:', error);
            res.status(500).json({ error: 'Failed to get notification settings' });
        }
    },
    // Update notification settings
    updateNotificationSettings: async (req, res) => {
        try {
            const userId = req.user.id;
            const { email_notifications, push_notifications, likes_notifications, comments_notifications, follows_notifications, events_notifications, messages_notifications, marketing_notifications } = req.body;
            await database_1.pgPool.query(`
        INSERT INTO notification_settings (
          user_id, email_notifications, push_notifications,
          likes_notifications, comments_notifications, follows_notifications,
          events_notifications, messages_notifications, marketing_notifications
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
        ON CONFLICT (user_id) DO UPDATE SET
          email_notifications = EXCLUDED.email_notifications,
          push_notifications = EXCLUDED.push_notifications,
          likes_notifications = EXCLUDED.likes_notifications,
          comments_notifications = EXCLUDED.comments_notifications,
          follows_notifications = EXCLUDED.follows_notifications,
          events_notifications = EXCLUDED.events_notifications,
          messages_notifications = EXCLUDED.messages_notifications,
          marketing_notifications = EXCLUDED.marketing_notifications,
          updated_at = CURRENT_TIMESTAMP
      `, [
                userId, email_notifications, push_notifications,
                likes_notifications, comments_notifications, follows_notifications,
                events_notifications, messages_notifications, marketing_notifications
            ]);
            res.json({
                success: true,
                message: 'Notification settings updated'
            });
        }
        catch (error) {
            console.error('Update Notification Settings Error:', error);
            res.status(500).json({ error: 'Failed to update notification settings' });
        }
    },
    // Create notification (internal function for other services)
    createNotification: async (userId, type, title, message, actorId, data) => {
        try {
            const result = await database_1.pgPool.query(`
        INSERT INTO notifications (user_id, type, title, message, actor_id, data)
        VALUES ($1, $2, $3, $4, $5, $6)
        RETURNING id
      `, [userId, type, title, message, actorId || null, data || {}]);
            const notificationId = result.rows[0].id;
            // Send push notification if enabled
            try {
                // Check if user has push notifications enabled
                const settingsResult = await database_1.pgPool.query('SELECT push_notifications FROM notification_settings WHERE user_id = $1', [userId]);
                const pushEnabled = settingsResult.rows[0]?.push_notifications !== false;
                if (pushEnabled) {
                    // Send push notification
                    await push_notification_service_1.PushNotificationService.sendPushNotification(userId, title, message, data);
                }
            }
            catch (pushError) {
                console.warn('Push notification failed:', pushError);
            }
            // Send real-time notification via Socket.IO
            try {
                const { io } = await Promise.resolve().then(() => __importStar(require('../index')));
                io.to(`user:${userId}`).emit('notification', {
                    id: notificationId,
                    type,
                    title,
                    message,
                    actorId,
                    data,
                    createdAt: new Date()
                });
            }
            catch (socketError) {
                console.warn('Socket notification failed:', socketError);
            }
            // Send email notification if enabled
            try {
                // Check if user has email notifications enabled
                const settingsResult = await database_1.pgPool.query('SELECT email_notifications FROM notification_settings WHERE user_id = $1', [userId]);
                const emailEnabled = settingsResult.rows[0]?.email_notifications !== false;
                if (emailEnabled) {
                    // Send email notification
                    try {
                        // Get user details for email
                        const userResult = await database_1.pgPool.query('SELECT email, first_name FROM users WHERE id = $1', [userId]);
                        if (userResult.rows.length > 0) {
                            const user = userResult.rows[0];
                            // Get actor name if available
                            let actorName = undefined;
                            if (actorId) {
                                const actorResult = await database_1.pgPool.query('SELECT first_name, last_name FROM users WHERE id = $1', [actorId]);
                                if (actorResult.rows.length > 0) {
                                    const actor = actorResult.rows[0];
                                    actorName = `${actor.first_name} ${actor.last_name}`;
                                }
                            }
                            await email_service_1.EmailService.sendNotificationEmail(user.email, user.first_name, {
                                type,
                                title,
                                message,
                                actorName
                            });
                        }
                    }
                    catch (emailError) {
                        console.warn('Email notification failed:', emailError);
                    }
                }
            }
            catch (emailError) {
                console.warn('Email notification check failed:', emailError);
            }
        }
        catch (error) {
            console.error('Create Notification Error:', error);
        }
    }
};
