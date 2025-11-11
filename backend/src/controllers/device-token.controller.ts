import { Request, Response } from 'express';
import { DeviceTokenService } from '../services/device-token.service';

export const deviceTokenController = {
  // Register device token
  registerToken: async (req: Request, res: Response) => {
    try {
      const userId = req.user.id;
      const { token, platform, deviceId, appVersion } = req.body;

      // Validate required fields
      if (!token || !platform) {
        return res.status(400).json({
          error: 'Token and platform are required'
        });
      }

      // Validate platform
      if (!['ios', 'android', 'web'].includes(platform)) {
        return res.status(400).json({
          error: 'Platform must be ios, android, or web'
        });
      }

      const tokenId = await DeviceTokenService.registerToken(
        userId,
        token,
        platform,
        deviceId,
        appVersion
      );

      res.json({
        success: true,
        message: 'Device token registered successfully',
        tokenId
      });

    } catch (error) {
      console.error('Register Token Error:', error);
      res.status(500).json({ error: 'Failed to register device token' });
    }
  },

  // Unregister device token
  unregisterToken: async (req: Request, res: Response) => {
    try {
      const userId = req.user.id;
      const { token } = req.body;

      if (!token) {
        return res.status(400).json({
          error: 'Token is required'
        });
      }

      await DeviceTokenService.unregisterToken(userId, token);

      res.json({
        success: true,
        message: 'Device token unregistered successfully'
      });

    } catch (error) {
      console.error('Unregister Token Error:', error);
      res.status(500).json({ error: 'Failed to unregister device token' });
    }
  },

  // Get user's device tokens
  getUserTokens: async (req: Request, res: Response) => {
    try {
      const userId = req.user.id;

      const tokens = await DeviceTokenService.getUserTokens(userId);

      res.json({
        success: true,
        tokens
      });

    } catch (error) {
      console.error('Get User Tokens Error:', error);
      res.status(500).json({ error: 'Failed to get user tokens' });
    }
  },

  // Get token statistics
  getTokenStats: async (req: Request, res: Response) => {
    try {
      const userId = req.user.id;

      const stats = await DeviceTokenService.getTokenStats(userId);

      res.json({
        success: true,
        stats
      });

    } catch (error) {
      console.error('Get Token Stats Error:', error);
      res.status(500).json({ error: 'Failed to get token statistics' });
    }
  },

  // Deactivate all user tokens (useful for logout)
  deactivateAllTokens: async (req: Request, res: Response) => {
    try {
      const userId = req.user.id;

      await DeviceTokenService.deactivateUserTokens(userId);

      res.json({
        success: true,
        message: 'All device tokens deactivated successfully'
      });

    } catch (error) {
      console.error('Deactivate All Tokens Error:', error);
      res.status(500).json({ error: 'Failed to deactivate device tokens' });
    }
  }
};