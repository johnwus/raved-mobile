"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deviceTokenController = void 0;
const device_token_service_1 = require("../services/device-token.service");
exports.deviceTokenController = {
    // Register device token
    registerToken: async (req, res) => {
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
            const tokenId = await device_token_service_1.DeviceTokenService.registerToken(userId, token, platform, deviceId, appVersion);
            res.json({
                success: true,
                message: 'Device token registered successfully',
                tokenId
            });
        }
        catch (error) {
            console.error('Register Token Error:', error);
            res.status(500).json({ error: 'Failed to register device token' });
        }
    },
    // Unregister device token
    unregisterToken: async (req, res) => {
        try {
            const userId = req.user.id;
            const { token } = req.body;
            if (!token) {
                return res.status(400).json({
                    error: 'Token is required'
                });
            }
            await device_token_service_1.DeviceTokenService.unregisterToken(userId, token);
            res.json({
                success: true,
                message: 'Device token unregistered successfully'
            });
        }
        catch (error) {
            console.error('Unregister Token Error:', error);
            res.status(500).json({ error: 'Failed to unregister device token' });
        }
    },
    // Get user's device tokens
    getUserTokens: async (req, res) => {
        try {
            const userId = req.user.id;
            const tokens = await device_token_service_1.DeviceTokenService.getUserTokens(userId);
            res.json({
                success: true,
                tokens
            });
        }
        catch (error) {
            console.error('Get User Tokens Error:', error);
            res.status(500).json({ error: 'Failed to get user tokens' });
        }
    },
    // Get token statistics
    getTokenStats: async (req, res) => {
        try {
            const userId = req.user.id;
            const stats = await device_token_service_1.DeviceTokenService.getTokenStats(userId);
            res.json({
                success: true,
                stats
            });
        }
        catch (error) {
            console.error('Get Token Stats Error:', error);
            res.status(500).json({ error: 'Failed to get token statistics' });
        }
    },
    // Deactivate all user tokens (useful for logout)
    deactivateAllTokens: async (req, res) => {
        try {
            const userId = req.user.id;
            await device_token_service_1.DeviceTokenService.deactivateUserTokens(userId);
            res.json({
                success: true,
                message: 'All device tokens deactivated successfully'
            });
        }
        catch (error) {
            console.error('Deactivate All Tokens Error:', error);
            res.status(500).json({ error: 'Failed to deactivate device tokens' });
        }
    }
};
