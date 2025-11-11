"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.OfflineStatusService = void 0;
const uuid_1 = require("uuid");
const offline_status_model_1 = require("../models/postgres/offline-status.model");
const database_1 = require("../config/database");
const index_1 = require("../index");
class OfflineStatusService {
    /**
     * Update or create device offline status
     */
    static async updateDeviceStatus(update) {
        const existingStatus = await offline_status_model_1.OfflineStatus.findOne({
            where: {
                userId: update.userId,
                deviceId: update.deviceId,
            },
        });
        const statusData = {
            userId: update.userId,
            deviceId: update.deviceId,
            isOnline: update.isOnline,
            lastSeen: new Date(),
            connectionType: update.connectionType,
            networkQuality: update.networkQuality,
            batteryLevel: update.batteryLevel,
            appVersion: update.appVersion,
            platform: update.platform,
            syncEnabled: update.syncEnabled ?? true,
            lastSyncAttempt: update.lastSyncAttempt,
            lastSuccessfulSync: update.lastSuccessfulSync,
            pendingSyncItems: update.pendingSyncItems ?? 0,
            updatedAt: new Date(),
        };
        let status;
        if (existingStatus) {
            status = await existingStatus.update(statusData);
        }
        else {
            statusData.id = (0, uuid_1.v4)();
            statusData.createdAt = new Date();
            status = await offline_status_model_1.OfflineStatus.create(statusData);
        }
        // Update cache
        await this.updateStatusCache(status);
        // Notify other devices of status change
        await this.notifyStatusChange(status);
        return status;
    }
    /**
     * Get device status
     */
    static async getDeviceStatus(userId, deviceId) {
        // Check cache first
        const cacheKey = `${this.STATUS_KEY_PREFIX}${userId}:${deviceId}`;
        const cachedStatus = await database_1.redis.get(cacheKey);
        if (cachedStatus) {
            return JSON.parse(cachedStatus);
        }
        // Query database
        const status = await offline_status_model_1.OfflineStatus.findOne({
            where: { userId, deviceId },
        });
        if (status) {
            // Cache the result
            await database_1.redis.setex(cacheKey, 300, JSON.stringify(status.toJSON())); // 5 minutes
        }
        return status;
    }
    /**
     * Get all devices for a user
     */
    static async getUserDevices(userId, includeOffline = true) {
        const whereClause = { userId };
        if (!includeOffline) {
            whereClause.isOnline = true;
        }
        return offline_status_model_1.OfflineStatus.findAll({
            where: whereClause,
            order: [['lastSeen', 'DESC']],
        });
    }
    /**
     * Get online users count
     */
    static async getOnlineUsersCount() {
        return offline_status_model_1.OfflineStatus.count({
            where: { isOnline: true },
            distinct: true,
            col: 'userId',
        });
    }
    /**
     * Mark device as offline
     */
    static async markDeviceOffline(userId, deviceId) {
        const status = await this.getDeviceStatus(userId, deviceId);
        if (status && status.isOnline) {
            await this.updateDeviceStatus({
                userId,
                deviceId,
                isOnline: false,
                networkQuality: 'offline',
                appVersion: status.appVersion,
                platform: status.platform,
            });
        }
    }
    /**
     * Update sync status for a device
     */
    static async updateSyncStatus(userId, deviceId, syncUpdate) {
        const status = await offline_status_model_1.OfflineStatus.findOne({
            where: { userId, deviceId },
        });
        if (!status) {
            return null;
        }
        const updateData = {
            updatedAt: new Date(),
        };
        if (syncUpdate.lastSyncAttempt) {
            updateData.lastSyncAttempt = syncUpdate.lastSyncAttempt;
        }
        if (syncUpdate.lastSuccessfulSync) {
            updateData.lastSuccessfulSync = syncUpdate.lastSuccessfulSync;
        }
        if (syncUpdate.pendingSyncItems !== undefined) {
            updateData.pendingSyncItems = syncUpdate.pendingSyncItems;
        }
        const updatedStatus = await status.update(updateData);
        // Update cache
        await this.updateStatusCache(updatedStatus);
        return updatedStatus;
    }
    /**
     * Get devices that need sync
     */
    static async getDevicesNeedingSync(maxPendingItems = 10) {
        return offline_status_model_1.OfflineStatus.findAll({
            where: {
                isOnline: true,
                syncEnabled: true,
                pendingSyncItems: { [require('sequelize').Op.gte]: maxPendingItems },
            },
            order: [['lastSuccessfulSync', 'ASC']],
        });
    }
    /**
     * Clean up offline devices (older than specified days)
     */
    static async cleanupOfflineDevices(daysOffline = 30) {
        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - daysOffline);
        const result = await offline_status_model_1.OfflineStatus.destroy({
            where: {
                isOnline: false,
                lastSeen: { [require('sequelize').Op.lt]: cutoffDate },
            },
        });
        return result;
    }
    /**
     * Get status statistics
     */
    static async getStatusStats() {
        const [totalDevices, onlineDevices, offlineDevices] = await Promise.all([
            offline_status_model_1.OfflineStatus.count(),
            offline_status_model_1.OfflineStatus.count({ where: { isOnline: true } }),
            offline_status_model_1.OfflineStatus.count({ where: { isOnline: false } }),
        ]);
        const platformStats = await offline_status_model_1.OfflineStatus.findAll({
            attributes: [
                'platform',
                [require('sequelize').fn('COUNT', require('sequelize').col('platform')), 'count'],
            ],
            group: ['platform'],
            raw: true,
        });
        const byPlatform = {};
        platformStats.forEach((stat) => {
            byPlatform[stat.platform] = parseInt(stat.count);
        });
        const avgPendingResult = await offline_status_model_1.OfflineStatus.findAll({
            attributes: [
                [require('sequelize').fn('AVG', require('sequelize').col('pendingSyncItems')), 'avg'],
            ],
            raw: true,
        });
        const averagePendingSyncItems = avgPendingResult[0]?.avg
            ? parseFloat(avgPendingResult[0].avg)
            : 0;
        return {
            totalDevices,
            onlineDevices,
            offlineDevices,
            byPlatform,
            averagePendingSyncItems,
        };
    }
    /**
     * Broadcast status change to user's other devices
     */
    static async notifyStatusChange(status) {
        try {
            // Get user's socket rooms
            const userRoom = `user:${status.userId}`;
            // Emit status update to all user's connected devices
            index_1.io.to(userRoom).emit('device_status_update', {
                deviceId: status.deviceId,
                isOnline: status.isOnline,
                lastSeen: status.lastSeen,
                platform: status.platform,
            });
        }
        catch (error) {
            console.error('Failed to notify status change:', error);
        }
    }
    /**
     * Update status cache
     */
    static async updateStatusCache(status) {
        const cacheKey = `${this.STATUS_KEY_PREFIX}${status.userId}:${status.deviceId}`;
        await database_1.redis.setex(cacheKey, 300, JSON.stringify(status.toJSON())); // 5 minutes
        // Update user devices list cache
        const userDevicesKey = `${this.USER_DEVICES_KEY_PREFIX}${status.userId}`;
        const userDevices = await this.getUserDevices(status.userId);
        await database_1.redis.setex(userDevicesKey, 300, JSON.stringify(userDevices.map(d => d.toJSON())));
    }
    /**
     * Check if user has any online devices
     */
    static async hasOnlineDevices(userId) {
        const onlineCount = await offline_status_model_1.OfflineStatus.count({
            where: {
                userId,
                isOnline: true,
            },
        });
        return onlineCount > 0;
    }
    /**
     * Get user's primary device (most recently seen online device)
     */
    static async getPrimaryDevice(userId) {
        return offline_status_model_1.OfflineStatus.findOne({
            where: {
                userId,
                isOnline: true,
            },
            order: [['lastSeen', 'DESC']],
        });
    }
    /**
     * Force sync for a specific device
     */
    static async requestDeviceSync(userId, deviceId) {
        const status = await this.getDeviceStatus(userId, deviceId);
        if (!status || !status.isOnline || !status.syncEnabled) {
            return false;
        }
        // Emit sync request to the specific device
        const deviceRoom = `device:${deviceId}`;
        index_1.io.to(deviceRoom).emit('force_sync_request', {
            userId,
            deviceId,
            timestamp: new Date(),
        });
        return true;
    }
    /**
     * Bulk update device statuses (for maintenance)
     */
    static async bulkUpdateStatuses(updates) {
        const updatedStatuses = [];
        for (const update of updates) {
            try {
                const status = await this.updateDeviceStatus({
                    userId: update.userId,
                    deviceId: update.deviceId,
                    ...update.updates,
                });
                updatedStatuses.push(status);
            }
            catch (error) {
                console.error(`Failed to update status for device ${update.deviceId}:`, error);
            }
        }
        return updatedStatuses;
    }
}
exports.OfflineStatusService = OfflineStatusService;
OfflineStatusService.STATUS_KEY_PREFIX = 'offline_status:';
OfflineStatusService.USER_DEVICES_KEY_PREFIX = 'user_devices:';
exports.default = OfflineStatusService;
