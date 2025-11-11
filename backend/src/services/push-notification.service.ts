import * as admin from 'firebase-admin';
import { pgPool } from '../config/database';

export class PushNotificationService {
  private static initialized = false;

  static initialize() {
    if (this.initialized) return;

    try {
      // Initialize Firebase Admin SDK
      const serviceAccount = {
        type: "service_account",
        project_id: process.env.FIREBASE_PROJECT_ID,
        private_key_id: process.env.FIREBASE_PRIVATE_KEY_ID,
        private_key: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
        client_email: process.env.FIREBASE_CLIENT_EMAIL,
        client_id: process.env.FIREBASE_CLIENT_ID,
        auth_uri: "https://accounts.google.com/o/oauth2/auth",
        token_uri: "https://oauth2.googleapis.com/token",
        auth_provider_x509_cert_url: "https://www.googleapis.com/oauth2/v1/certs",
        client_x509_cert_url: process.env.FIREBASE_CLIENT_X509_CERT_URL
      };

      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount as admin.ServiceAccount),
        projectId: process.env.FIREBASE_PROJECT_ID
      });

      this.initialized = true;
      console.log('Firebase Admin SDK initialized successfully');
    } catch (error) {
      console.error('Failed to initialize Firebase Admin SDK:', error);
    }
  }

  static async sendPushNotification(
    userId: string,
    title: string,
    body: string,
    data?: { [key: string]: string }
  ) {
    try {
      // Get user's device tokens
      const result = await pgPool.query(
        'SELECT token, platform FROM device_tokens WHERE user_id = $1 AND active = true',
        [userId]
      );

      if (result.rows.length === 0) {
        console.log(`No active device tokens found for user ${userId}`);
        return;
      }

      const tokens = result.rows.map(row => row.token);

      // Send notifications individually (Firebase Admin SDK v11+ doesn't have sendMulticast)
      const promises = tokens.map(token => {
        const message = {
          token,
          notification: {
            title,
            body,
          },
          data: data || {},
        };

        return admin.messaging().send(message);
      });

      const results = await Promise.allSettled(promises);

      let successCount = 0;
      const failedTokens: string[] = [];

      results.forEach((result, idx) => {
        if (result.status === 'fulfilled') {
          successCount++;
        } else {
          failedTokens.push(tokens[idx]);
        }
      });

      console.log(`Push notification sent to ${successCount} devices for user ${userId}`);

      // Handle failed tokens (remove invalid ones)
      if (failedTokens.length > 0) {
        await this.removeInvalidTokens(failedTokens);
      }

    } catch (error) {
      console.error('Error sending push notification:', error);
    }
  }

  static async sendNotificationToMultipleUsers(
    userIds: string[],
    title: string,
    body: string,
    data?: { [key: string]: string }
  ) {
    const promises = userIds.map(userId =>
      this.sendPushNotification(userId, title, body, data)
    );

    await Promise.allSettled(promises);
  }

  private static async removeInvalidTokens(tokens: string[]) {
    try {
      await pgPool.query(
        'UPDATE device_tokens SET active = false WHERE token = ANY($1)',
        [tokens]
      );
      console.log(`Removed ${tokens.length} invalid device tokens`);
    } catch (error) {
      console.error('Error removing invalid tokens:', error);
    }
  }

  static async getUserTokens(userId: string): Promise<string[]> {
    try {
      const result = await pgPool.query(
        'SELECT token FROM device_tokens WHERE user_id = $1 AND active = true',
        [userId]
      );

      return result.rows.map(row => row.token);
    } catch (error) {
      console.error('Error getting user tokens:', error);
      return [];
    }
  }
}