import { v4 as uuidv4 } from 'uuid';
import { OfflineStatus, OfflineStatusAttributes } from '../models/postgres/offline-status.model';
import { redis } from '../config/database';
import { io } from '../index';

export interface DeviceStatusUpdate {
  userId: string;
  deviceId: string;
  isOnline: boolean;
  connectionType?: 'wifi' | 'cellular' | 'ethernet' | 'unknown';
  networkQuality?: 'excellent' | 'good' | 'poor' | 'offline';
  batteryLevel?: number;
  appVersion: string;
  platform: 'ios' | 'android' | 'web';
  syncEnabled?: boolean;
  lastSyncAttempt?: Date;
  lastSuccessfulSync?: Date;
  pendingSyncItems?: number;
}

export class OfflineStatusService {
  private static readonly STATUS_KEY_PREFIX = 'offline_status:';
  private static readonly USER_DEVICES_KEY_PREFIX = 'user_devices:';

  /**
   * Update or create device offline status
   */
  static async updateDeviceStatus(
    update: DeviceStatusUpdate
  ): Promise<OfflineStatus> {
    const existingStatus = await OfflineStatus.findOne({
      where: {
        userId: update.userId,
        deviceId: update.deviceId,
      },
    });

    const statusData: Partial<OfflineStatusAttributes> = {
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

    let status: OfflineStatus;

    if (existingStatus) {
      status = await existingStatus.update(statusData);
    } else {
      statusData.id = uuidv4();
      statusData.createdAt = new Date();
      status = await OfflineStatus.create(statusData as OfflineStatusAttributes);
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
  static async getDeviceStatus(
    userId: string,
    deviceId: string
  ): Promise<OfflineStatus | null> {
    // Check cache first
    const cacheKey = `${this.STATUS_KEY_PREFIX}${userId}:${deviceId}`;
    const cachedStatus = await redis.get(cacheKey);

    if (cachedStatus) {
      return JSON.parse(cachedStatus);
    }

    // Query database
    const status = await OfflineStatus.findOne({
      where: { userId, deviceId },
    });

    if (status) {
      // Cache the result
      await redis.setex(cacheKey, 300, JSON.stringify(status.toJSON())); // 5 minutes
    }

    return status;
  }

  /**
   * Get all devices for a user
   */
  static async getUserDevices(
    userId: string,
    includeOffline: boolean = true
  ): Promise<OfflineStatus[]> {
    const whereClause: any = { userId };

    if (!includeOffline) {
      whereClause.isOnline = true;
    }

    return OfflineStatus.findAll({
      where: whereClause,
      order: [['lastSeen', 'DESC']],
    });
  }

  /**
   * Get online users count
   */
  static async getOnlineUsersCount(): Promise<number> {
    return OfflineStatus.count({
      where: { isOnline: true },
      distinct: true,
      col: 'userId',
    });
  }

  /**
   * Mark device as offline
   */
  static async markDeviceOffline(
    userId: string,
    deviceId: string
  ): Promise<void> {
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
  static async updateSyncStatus(
    userId: string,
    deviceId: string,
    syncUpdate: {
      lastSyncAttempt?: Date;
      lastSuccessfulSync?: Date;
      pendingSyncItems?: number;
    }
  ): Promise<OfflineStatus | null> {
    const status = await OfflineStatus.findOne({
      where: { userId, deviceId },
    });

    if (!status) {
      return null;
    }

    const updateData: Partial<OfflineStatusAttributes> = {
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
  static async getDevicesNeedingSync(
    maxPendingItems: number = 10
  ): Promise<OfflineStatus[]> {
    return OfflineStatus.findAll({
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
  static async cleanupOfflineDevices(
    daysOffline: number = 30
  ): Promise<number> {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysOffline);

    const result = await OfflineStatus.destroy({
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
  static async getStatusStats(): Promise<{
    totalDevices: number;
    onlineDevices: number;
    offlineDevices: number;
    byPlatform: Record<string, number>;
    averagePendingSyncItems: number;
  }> {
    const [totalDevices, onlineDevices, offlineDevices] = await Promise.all([
      OfflineStatus.count(),
      OfflineStatus.count({ where: { isOnline: true } }),
      OfflineStatus.count({ where: { isOnline: false } }),
    ]);

    const platformStats = await OfflineStatus.findAll({
      attributes: [
        'platform',
        [require('sequelize').fn('COUNT', require('sequelize').col('platform')), 'count'],
      ],
      group: ['platform'],
      raw: true,
    });

    const byPlatform: Record<string, number> = {};
    platformStats.forEach((stat: any) => {
      byPlatform[stat.platform] = parseInt(stat.count);
    });

    const avgPendingResult = await OfflineStatus.findAll({
      attributes: [
        [require('sequelize').fn('AVG', require('sequelize').col('pendingSyncItems')), 'avg'],
      ],
      raw: true,
    });

    const averagePendingSyncItems = (avgPendingResult[0] as any)?.avg
      ? parseFloat((avgPendingResult[0] as any).avg)
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
  private static async notifyStatusChange(status: OfflineStatus): Promise<void> {
    try {
      // Get user's socket rooms
      const userRoom = `user:${status.userId}`;

      // Emit status update to all user's connected devices
      io.to(userRoom).emit('device_status_update', {
        deviceId: status.deviceId,
        isOnline: status.isOnline,
        lastSeen: status.lastSeen,
        platform: status.platform,
      });
    } catch (error) {
      console.error('Failed to notify status change:', error);
    }
  }

  /**
   * Update status cache
   */
  private static async updateStatusCache(status: OfflineStatus): Promise<void> {
    const cacheKey = `${this.STATUS_KEY_PREFIX}${status.userId}:${status.deviceId}`;
    await redis.setex(cacheKey, 300, JSON.stringify(status.toJSON())); // 5 minutes

    // Update user devices list cache
    const userDevicesKey = `${this.USER_DEVICES_KEY_PREFIX}${status.userId}`;
    const userDevices = await this.getUserDevices(status.userId);
    await redis.setex(userDevicesKey, 300, JSON.stringify(userDevices.map(d => d.toJSON())));
  }

  /**
   * Check if user has any online devices
   */
  static async hasOnlineDevices(userId: string): Promise<boolean> {
    const onlineCount = await OfflineStatus.count({
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
  static async getPrimaryDevice(userId: string): Promise<OfflineStatus | null> {
    return OfflineStatus.findOne({
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
  static async requestDeviceSync(
    userId: string,
    deviceId: string
  ): Promise<boolean> {
    const status = await this.getDeviceStatus(userId, deviceId);

    if (!status || !status.isOnline || !status.syncEnabled) {
      return false;
    }

    // Emit sync request to the specific device
    const deviceRoom = `device:${deviceId}`;
    io.to(deviceRoom).emit('force_sync_request', {
      userId,
      deviceId,
      timestamp: new Date(),
    });

    return true;
  }

  /**
   * Bulk update device statuses (for maintenance)
   */
  static async bulkUpdateStatuses(
    updates: Array<{
      userId: string;
      deviceId: string;
      updates: Partial<DeviceStatusUpdate>;
    }>
  ): Promise<OfflineStatus[]> {
    const updatedStatuses: OfflineStatus[] = [];

    for (const update of updates) {
      try {
        const status = await this.updateDeviceStatus({
          userId: update.userId,
          deviceId: update.deviceId,
          ...update.updates,
        } as DeviceStatusUpdate);
        updatedStatuses.push(status);
      } catch (error) {
        console.error(`Failed to update status for device ${update.deviceId}:`, error);
      }
    }

    return updatedStatuses;
  }
}

export default OfflineStatusService;