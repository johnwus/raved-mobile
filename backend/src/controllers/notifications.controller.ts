import { Request, Response } from 'express';
import { PushNotificationService } from '../services/push-notification.service';
import { Notification } from '../models/mongoose/notification.model';

export const notificationsController = {
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

      // For now, return default preferences
      // In a real implementation, you'd fetch from database
      const preferences = {
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
      };

      res.json({
        success: true,
        preferences
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
      const { preferences } = req.body;

      if (!preferences || typeof preferences !== 'object') {
        return res.status(400).json({
          error: 'Preferences object is required'
        });
      }

      // In a real implementation, you'd save to database
      // For now, just validate and return success
      const validKeys = [
        'pushEnabled', 'likes', 'comments', 'follows', 'mentions',
        'messages', 'events', 'sales', 'marketing', 'soundEnabled', 'vibrationEnabled'
      ];

      const filteredPreferences: any = {};
      for (const key of validKeys) {
        if (typeof preferences[key] === 'boolean') {
          filteredPreferences[key] = preferences[key];
        }
      }

      res.json({
        success: true,
        message: 'Notification preferences updated successfully',
        preferences: filteredPreferences
      });

    } catch (error) {
      console.error('Update Notification Preferences Error:', error);
      res.status(500).json({ error: 'Failed to update notification preferences' });
    }
  },

  // Create notification
  createNotification: async (userId: string, type: string, title: string, message: string, actorId?: string, data?: any): Promise<any> => {
    try {
      // Create notification record in database
      const notification = await Notification.create({
        userId,
        type,
        title,
        message,
        actorId,
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