"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DeviceTokenService = void 0;
const database_1 = require("../config/database");
class DeviceTokenService {
    static async registerToken(userId, token, platform, deviceId, appVersion) {
        try {
            // First, deactivate any existing tokens for this device
            if (deviceId) {
                await database_1.pgPool.query('UPDATE device_tokens SET active = false WHERE user_id = $1 AND device_id = $2 AND token != $3', [userId, deviceId, token]);
            }
            // Insert or update the token
            const result = await database_1.pgPool.query(`
        INSERT INTO device_tokens (user_id, token, platform, device_id, app_version, active, last_used_at)
        VALUES ($1, $2, $3, $4, $5, true, CURRENT_TIMESTAMP)
        ON CONFLICT (token)
        DO UPDATE SET
          user_id = EXCLUDED.user_id,
          platform = EXCLUDED.platform,
          device_id = EXCLUDED.device_id,
          app_version = EXCLUDED.app_version,
          active = true,
          last_used_at = CURRENT_TIMESTAMP,
          updated_at = CURRENT_TIMESTAMP
        RETURNING id
      `, [userId, token, platform, deviceId || null, appVersion || null]);
            return result.rows[0].id;
        }
        catch (error) {
            console.error('Error registering device token:', error);
            throw error;
        }
    }
    static async unregisterToken(userId, token) {
        try {
            await database_1.pgPool.query('UPDATE device_tokens SET active = false, updated_at = CURRENT_TIMESTAMP WHERE user_id = $1 AND token = $2', [userId, token]);
        }
        catch (error) {
            console.error('Error unregistering device token:', error);
            throw error;
        }
    }
    static async getUserTokens(userId) {
        try {
            const result = await database_1.pgPool.query('SELECT token FROM device_tokens WHERE user_id = $1 AND active = true', [userId]);
            return result.rows.map(row => row.token);
        }
        catch (error) {
            console.error('Error getting user tokens:', error);
            return [];
        }
    }
    static async deactivateUserTokens(userId) {
        try {
            await database_1.pgPool.query('UPDATE device_tokens SET active = false, updated_at = CURRENT_TIMESTAMP WHERE user_id = $1', [userId]);
        }
        catch (error) {
            console.error('Error deactivating user tokens:', error);
            throw error;
        }
    }
    static async cleanupInactiveTokens() {
        try {
            // Remove tokens that haven't been used in 30 days
            const result = await database_1.pgPool.query('DELETE FROM device_tokens WHERE active = false AND last_used_at < CURRENT_TIMESTAMP - INTERVAL \'30 days\'');
            console.log(`Cleaned up ${result.rowCount} inactive device tokens`);
        }
        catch (error) {
            console.error('Error cleaning up inactive tokens:', error);
        }
    }
    static async getTokenStats(userId) {
        try {
            const result = await database_1.pgPool.query(`
        SELECT
          COUNT(*) as total_tokens,
          COUNT(*) FILTER (WHERE active = true) as active_tokens,
          COUNT(*) FILTER (WHERE platform = 'ios') as ios_tokens,
          COUNT(*) FILTER (WHERE platform = 'android') as android_tokens,
          COUNT(*) FILTER (WHERE platform = 'web') as web_tokens
        FROM device_tokens
        WHERE user_id = $1
      `, [userId]);
            return result.rows[0];
        }
        catch (error) {
            console.error('Error getting token stats:', error);
            return null;
        }
    }
}
exports.DeviceTokenService = DeviceTokenService;
