import { Request, Response } from 'express';
import { PushNotificationService } from '../services/push-notification.service';
import { Notification } from '../models/mongoose/notification.model';
import { NotificationPreference } from '../models/mongoose/notification-preference.model';
import { getAvatarUrl } from '../utils';
import { pgPool } from '../config/database';

export const notificationsController = {
  // Get user's notifications
  getNotifications: async (req: Request, res: Response) => {
    try {
      const userId = req.user.id;
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;
      const skip = (page - 1) * limit;

      // Get notifications from MongoDB (where they're actually created)
      const notifications = await Notification.find({ userId })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean();

      // Get total count
      const total = await Notification.countDocuments({ userId });

      // Get unread count
      const unreadCount = await Notification.countDocuments({ userId, isRead: false });

      const formattedNotifications = notifications.map((notif: any) => {
        // Build user object if actorName is available
        const user = notif.actorName ? {
          id: notif.actorId,
          name: notif.actorName,
          avatar: notif.actorAvatar || 'https://api.raved.com/default-avatar.png'
        } : undefined;

        // Build rich message based on notification type
        let enrichedMessage = notif.message;
        if (notif.data) {
          // Enhance message with item details if available
          if (notif.data.itemTitle) {
            enrichedMessage = `${notif.message} "${notif.data.itemTitle}"`;
          }
          if (notif.data.postTitle && !enrichedMessage.includes('post')) {
            enrichedMessage = `${notif.message}: "${notif.data.postTitle}"`;
          }
        }

        return {
          id: notif._id,
          type: notif.type,
          title: notif.title,
          message: enrichedMessage,
          user,
          isRead: notif.isRead,
          readAt: notif.readAt,
          createdAt: notif.createdAt,
          postId: notif.referenceType === 'post' ? notif.referenceId : (notif.data?.postId || undefined),
          itemId: notif.referenceType === 'item' ? notif.referenceId : (notif.data?.itemId || undefined),
          eventId: notif.referenceType === 'event' ? notif.referenceId : (notif.data?.eventId || undefined),
          commentId: notif.referenceType === 'comment' ? notif.referenceId : (notif.data?.commentId || undefined),
          data: notif.data,
        };
      });

      res.json({
        notifications: formattedNotifications,
        unreadCount,
        pagination: {
          total,
          page,
          limit,
          hasMore: skip + limit < total,
        },
      });
    } catch (error) {
      console.error('Get Notifications Error:', error);
      res.status(500).json({ error: 'Failed to get notifications' });
    }
  },

  // Mark notification as read (legacy - kept for compatibility)
  markAsRead: async (req: Request, res: Response) => {
    try {
      const userId = req.user.id;
      const { notificationId } = req.params;

      const result = await Notification.findByIdAndUpdate(
        notificationId,
        { isRead: true, readAt: new Date() },
        { new: true }
      );

      if (!result) {
        return res.status(404).json({ success: false, error: 'Notification not found' });
      }

      // Verify notification belongs to user for security
      if (result.userId !== userId) {
        return res.status(403).json({ success: false, error: 'Unauthorized' });
      }

      res.json({ success: true, notification: result });
    } catch (error) {
      console.error('Mark Notification as Read Error:', error);
      res.status(500).json({ error: 'Failed to mark notification as read' });
    }
  },

  // Delete notification (when user interacts with it)
  deleteNotification: async (req: Request, res: Response) => {
    try {
      const userId = req.user.id;
      const { notificationId } = req.params;

      const result = await Notification.findByIdAndDelete(notificationId);

      if (!result) {
        return res.status(404).json({ success: false, error: 'Notification not found' });
      }

      // Verify notification belongs to user for security
      if (result.userId !== userId) {
        return res.status(403).json({ success: false, error: 'Unauthorized' });
      }

      res.json({ success: true, deletedId: notificationId });
    } catch (error) {
      console.error('Delete Notification Error:', error);
      res.status(500).json({ error: 'Failed to delete notification' });
    }
  },

  // Mark all notifications as read
  markAllAsRead: async (req: Request, res: Response) => {
    try {
      const userId = req.user.id;

      const result = await Notification.updateMany(
        { userId, isRead: false },
        { isRead: true, readAt: new Date() }
      );

      res.json({ success: true, modifiedCount: result.modifiedCount });
    } catch (error) {
      console.error('Mark All Notifications as Read Error:', error);
      res.status(500).json({ error: 'Failed to mark all notifications as read' });
    }
  },

  // Delete all notifications (when user clears all)
  deleteAllNotifications: async (req: Request, res: Response) => {
    try {
      const userId = req.user.id;

      const result = await Notification.deleteMany({ userId });

      res.json({ success: true, deletedCount: result.deletedCount });
    } catch (error) {
      console.error('Delete All Notifications Error:', error);
      res.status(500).json({ error: 'Failed to delete all notifications' });
    }
  },

  // Delete read notifications (for cleanup)
  deleteReadNotifications: async (req: Request, res: Response) => {
    try {
      const userId = req.user.id;
      const daysOld = parseInt(req.query.daysOld as string) || 7; // Delete read notifications older than 7 days

      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - daysOld);

      const result = await Notification.deleteMany({
        userId,
        isRead: true,
        readAt: { $lt: cutoffDate }
      });

      res.json({ success: true, deletedCount: result.deletedCount });
    } catch (error) {
      console.error('Delete Read Notifications Error:', error);
      res.status(500).json({ error: 'Failed to delete read notifications' });
    }
  },

  // Send test notification to user
  sendTestNotification: async (req: Request, res: Response) => {
    try {
      const userId = req.user.id;
      const { message } = req.body;

      if (!message) {
        return res.status(400).json({
          error: 'Message is required'
        });
      }

      await PushNotificationService.sendPushNotification(
        userId,
        'Test Notification',
        message,
        { type: 'test' }
      );

      res.json({
        success: true,
        message: 'Test notification sent successfully'
      });

    } catch (error) {
      console.error('Send Test Notification Error:', error);
      res.status(500).json({ error: 'Failed to send test notification' });
    }
  },

  // Send notification to specific user
  sendNotificationToUser: async (req: Request, res: Response) => {
    try {
      const { userId, title, body, data } = req.body;

      if (!userId || !title || !body) {
        return res.status(400).json({
          error: 'userId, title, and body are required'
        });
      }

      await PushNotificationService.sendPushNotification(userId, title, body, data);

      res.json({
        success: true,
        message: 'Notification sent successfully'
      });

    } catch (error) {
      console.error('Send Notification Error:', error);
      res.status(500).json({ error: 'Failed to send notification' });
    }
  },

  // Send notification to multiple users
  sendNotificationToUsers: async (req: Request, res: Response) => {
    try {
      const { userIds, title, body, data } = req.body;

      if (!userIds || !Array.isArray(userIds) || !title || !body) {
        return res.status(400).json({
          error: 'userIds (array), title, and body are required'
        });
      }

      await PushNotificationService.sendNotificationToMultipleUsers(userIds, title, body, data);

      res.json({
        success: true,
        message: `Notification sent to ${userIds.length} users`
      });

    } catch (error) {
      console.error('Send Multiple Notifications Error:', error);
      res.status(500).json({ error: 'Failed to send notifications' });
    }
  },

  // Get user's notification preferences
  getNotificationPreferences: async (req: Request, res: Response) => {
    try {
      const userId = req.user.id;

      // Try to get preferences from MongoDB
      let preferences = await NotificationPreference.findOne({ userId });

      // If not found, create default preferences
      if (!preferences) {
        preferences = await NotificationPreference.create({
          userId,
          pushEnabled: true,
          likes: true,
          comments: true,
          follows: true,
          mentions: true,
          messages: true,
          events: true,
          sales: true,
          marketing: false,
          soundEnabled: true,
          vibrationEnabled: true,
        });
      }

      res.json({
        success: true,
        preferences: {
          pushEnabled: preferences.pushEnabled,
          likes: preferences.likes,
          comments: preferences.comments,
          follows: preferences.follows,
          mentions: preferences.mentions,
          messages: preferences.messages,
          events: preferences.events,
          sales: preferences.sales,
          marketing: preferences.marketing,
          soundEnabled: preferences.soundEnabled,
          vibrationEnabled: preferences.vibrationEnabled,
        }
      });

    } catch (error) {
      console.error('Get Notification Preferences Error:', error);
      res.status(500).json({ error: 'Failed to get notification preferences' });
    }
  },

  // Update user's notification preferences
  updateNotificationPreferences: async (req: Request, res: Response) => {
    try {
      const userId = req.user.id;
      let preferences;

      console.log('📝 Raw request body:', req.body);

      // Check if preferences are sent directly in body or wrapped in preferences key
      if (req.body.preferences !== undefined) {
        preferences = req.body.preferences;
        console.log('📝 Preferences from req.body.preferences:', preferences, 'type:', typeof preferences);
      } else {
        // Check if the body itself is the preferences object
        const bodyKeys = Object.keys(req.body);
        const preferenceKeys = ['pushEnabled', 'likes', 'comments', 'follows', 'mentions', 'messages', 'events', 'sales', 'marketing', 'soundEnabled', 'vibrationEnabled'];
        const hasPreferenceKeys = preferenceKeys.some(key => bodyKeys.includes(key));

        if (hasPreferenceKeys && typeof req.body === 'object') {
          preferences = req.body;
          console.log('📝 Preferences from req.body directly:', preferences, 'type:', typeof preferences);
        } else {
          preferences = req.body.preferences;
          console.log('📝 Preferences fallback:', preferences, 'type:', typeof preferences);
        }
      }

      // Handle if preferences is stringified
      if (typeof preferences === 'string') {
        console.log('⚠️  Preferences is a string, attempting to parse');
        try {
          preferences = JSON.parse(preferences);
        } catch (e) {
          console.error('❌ Failed to parse preferences string:', e);
          return res.status(400).json({
            success: false,
            error: 'Preferences must be a valid object'
          });
        }
      }

      if (!preferences || typeof preferences !== 'object') {
        console.error('❌ Preferences validation failed:', { preferences, type: typeof preferences });
        return res.status(400).json({
          success: false,
          error: 'Preferences object is required'
        });
      }

      // Valid preference keys
      const validKeys = [
        'pushEnabled', 'likes', 'comments', 'follows', 'mentions',
        'messages', 'events', 'sales', 'marketing', 'soundEnabled', 'vibrationEnabled'
      ];

      // Create update object with only valid keys and boolean values (or string representations)
      const updateData: any = {};
      for (const key of validKeys) {
        if (key in preferences) {
          const value = preferences[key];
          // Accept boolean values or string representations of booleans
          if (typeof value === 'boolean') {
            updateData[key] = value;
          } else if (typeof value === 'string') {
            if (value === 'true') {
              updateData[key] = true;
            } else if (value === 'false') {
              updateData[key] = false;
            }
            // Ignore other string values
          }
        }
      }

      console.log('🔄 Update data:', updateData);

      if (Object.keys(updateData).length === 0) {
        return res.status(400).json({
          success: false,
          error: 'No valid boolean preferences provided'
        });
      }

      // Update or create preferences
      const updatedPreferences = await NotificationPreference.findOneAndUpdate(
        { userId },
        updateData,
        { new: true, upsert: true }
      );

      console.log('✅ Preferences updated:', updatedPreferences);

      res.json({
        success: true,
        message: 'Notification preferences updated successfully',
        preferences: {
          pushEnabled: updatedPreferences.pushEnabled,
          likes: updatedPreferences.likes,
          comments: updatedPreferences.comments,
          follows: updatedPreferences.follows,
          mentions: updatedPreferences.mentions,
          messages: updatedPreferences.messages,
          events: updatedPreferences.events,
          sales: updatedPreferences.sales,
          marketing: updatedPreferences.marketing,
          soundEnabled: updatedPreferences.soundEnabled,
          vibrationEnabled: updatedPreferences.vibrationEnabled,
        }
      });

    } catch (error) {
      console.error('❌ Update Notification Preferences Error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to update notification preferences',
        details: error instanceof Error ? error.message : String(error)
      });
    }
  },

  // Create notification
  createNotification: async (userId: string, type: string, title: string, message: string, actorId?: string, data?: any): Promise<any> => {
    try {
      let actorName: string | undefined;
      let actorAvatar: string | undefined;

      // Fetch actor information if actorId is provided
      if (actorId) {
        try {
          const actorResult = await pgPool.query(`
            SELECT first_name, last_name, avatar_url
            FROM users
            WHERE id = $1 AND deleted_at IS NULL
          `, [actorId]);

          if (actorResult.rows.length > 0) {
            const actor = actorResult.rows[0];
            actorName = `${actor.first_name} ${actor.last_name}`.trim();
            actorAvatar = getAvatarUrl(actor.avatar_url, actorId);
          }
        } catch (error) {
          console.warn('Failed to fetch actor info:', error);
          // Continue without actor info
        }
      }

      // Create notification record in database
      const notification = await Notification.create({
        userId,
        type,
        title,
        message,
        actorId,
        actorName,
        actorAvatar,
        data
      });

      // Send push notification
      await PushNotificationService.sendPushNotification(
        userId,
        title,
        message,
        data ? Object.keys(data).reduce((acc, key) => {
          acc[key] = String(data[key]);
          return acc;
        }, {} as { [key: string]: string }) : undefined
      );

      return notification;
    } catch (error) {
      console.error('Error creating notification:', error);
      throw error;
    }
  },
};