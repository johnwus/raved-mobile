import * as Notifications from 'expo-notifications';
import Constants from 'expo-constants';
import * as Device from 'expo-device';
import { Platform } from 'react-native';
import api from './api';

export class NotificationService {
  static async registerForPushNotificationsAsync(userId: string) {
    if (!Device.isDevice) {
      console.warn('Push notifications can only be registered on a physical device. Skipping registration.');
      return null;
    }

    try {
      console.log('Starting push notification registration for userId:', userId);
      // Get device push token
      const token = await Notifications.getDevicePushTokenAsync();
      console.log('Device push token:', token);

      // Get Expo push token only if projectId looks valid (expo EAS project id)
      const projectId = Constants.expoConfig?.extra?.eas?.projectId;
      console.log('Expo config projectId:', projectId);
      let expoToken: any = null;
      if (projectId && projectId !== '00000000-0000-0000-0000-000000000000') {
        try {
          expoToken = await Notifications.getExpoPushTokenAsync({ projectId });
          console.log('Expo push token:', expoToken);
        } catch (err: any) {
          console.warn('Could not get Expo push token (will proceed with device token):', err?.message || err);
          expoToken = null;
        }
      } else {
        console.warn('Expo projectId not set or is placeholder; skipping Expo push token. projectId:', projectId);
      }

      // Determine platform
      const platform = Platform.OS as 'ios' | 'android' | 'web';

      // Register token with backend
      await this.registerDeviceToken(userId, token.data, platform);

      return { deviceToken: token.data, expoToken: expoToken?.data || null };
    } catch (error) {
      // Don't throw - registration failures shouldn't block login flow
      console.error('Error registering for push notifications (non-fatal):', error);
      return null;
    }
  }

  static async registerDeviceToken(
    userId: string,
    token: string,
    platform: 'ios' | 'android' | 'web',
    deviceId?: string,
    appVersion?: string
  ) {
    try {
      // Get device info if not provided
      const deviceIdToUse = deviceId || (await Device.getDeviceTypeAsync()).toString();
      const appVersionToUse = appVersion || Constants.expoConfig?.version || '1.0.0';

      const response = await api.post('/device-tokens/register', {
        token,
        platform,
        deviceId: deviceIdToUse,
        appVersion: appVersionToUse,
      });

      console.log('Device token registered:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error registering device token:', error);
      throw error;
    }
  }

  static async unregisterDeviceToken(userId: string, token: string) {
    try {
      await api.post('/device-tokens/unregister', { token });

      console.log('Device token unregistered');
    } catch (error) {
      console.error('Error unregistering device token:', error);
      throw error;
    }
  }

  static async scheduleLocalNotification(
    title: string,
    body: string,
    data?: any,
    trigger?: Notifications.NotificationTriggerInput
  ) {
    try {
      const notificationId = await Notifications.scheduleNotificationAsync({
        content: {
          title,
          body,
          data: data || {},
        },
        trigger: trigger || null,
      });

      console.log('Local notification scheduled:', notificationId);
      return notificationId;
    } catch (error) {
      console.error('Error scheduling local notification:', error);
      throw error;
    }
  }

  static async cancelScheduledNotification(notificationId: string) {
    try {
      await Notifications.cancelScheduledNotificationAsync(notificationId);
      console.log('Notification cancelled:', notificationId);
    } catch (error) {
      console.error('Error cancelling notification:', error);
      throw error;
    }
  }

  static async cancelAllScheduledNotifications() {
    try {
      await Notifications.cancelAllScheduledNotificationsAsync();
      console.log('All scheduled notifications cancelled');
    } catch (error) {
      console.error('Error cancelling all notifications:', error);
      throw error;
    }
  }

  static async getScheduledNotifications() {
    try {
      const notifications = await Notifications.getAllScheduledNotificationsAsync();
      console.log('Scheduled notifications:', notifications);
      return notifications;
    } catch (error) {
      console.error('Error getting scheduled notifications:', error);
      throw error;
    }
  }

  static async setNotificationBadge(count: number) {
    try {
      await Notifications.setBadgeCountAsync(count);
      console.log('Badge count set to:', count);
    } catch (error) {
      console.error('Error setting badge count:', error);
      throw error;
    }
  }

  static async getNotificationBadge() {
    try {
      const count = await Notifications.getBadgeCountAsync();
      console.log('Current badge count:', count);
      return count;
    } catch (error) {
      console.error('Error getting badge count:', error);
      throw error;
    }
  }

  static async dismissNotification(notificationId: string) {
    try {
      await Notifications.dismissNotificationAsync(notificationId);
      console.log('Notification dismissed:', notificationId);
    } catch (error) {
      console.error('Error dismissing notification:', error);
      throw error;
    }
  }

  static async dismissAllNotifications() {
    try {
      await Notifications.dismissAllNotificationsAsync();
      console.log('All notifications dismissed');
    } catch (error) {
      console.error('Error dismissing all notifications:', error);
      throw error;
    }
  }

  static async getPresentedNotifications() {
    try {
      const notifications = await Notifications.getPresentedNotificationsAsync();
      console.log('Presented notifications:', notifications);
      return notifications;
    } catch (error) {
      console.error('Error getting presented notifications:', error);
      throw error;
    }
  }

  static async getPermissionsAsync() {
    try {
      const permissions = await Notifications.getPermissionsAsync();
      console.log('Notification permissions:', permissions);
      return permissions;
    } catch (error) {
      console.error('Error getting permissions:', error);
      throw error;
    }
  }

  static async requestPermissionsAsync() {
    try {
      const permissions = await Notifications.requestPermissionsAsync();
      console.log('Requested permissions:', permissions);
      return permissions;
    } catch (error) {
      console.error('Error requesting permissions:', error);
      throw error;
    }
  }
}