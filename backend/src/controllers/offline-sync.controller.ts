import { Request, Response } from 'express';
import { validationResult } from 'express-validator';
import OfflineQueueService from '../services/offline-queue.service';
import SyncConflictService, { ConflictResolution } from '../services/sync-conflict.service';
import OfflineStatusService, { DeviceStatusUpdate } from '../services/offline-status.service';
import OfflineDataService, { OfflineEntity } from '../services/offline-data.service';
import DataVersioningService from '../services/data-versioning.service';
import OfflineAnalyticsService from '../services/offline-analytics.service';
import SelectiveCacheService from '../services/selective-cache.service';

/**
 * Add a request to the offline queue
 */
export const queueOfflineRequest = async (req: Request, res: Response) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const userId = req.user.id;
        const {
            method,
            url,
            headers = {},
            body,
            priority = 0,
            maxRetries = 3,
            scheduledAt,
            dependencies = [],
            tags = []
        } = req.body;

        const queueItem = await OfflineQueueService.addToQueue(userId, {
            method,
            url,
            headers,
            body,
            priority,
            maxRetries,
            scheduledAt: scheduledAt ? new Date(scheduledAt) : undefined,
            dependencies,
            tags,
        });

        // Track analytics
        await OfflineAnalyticsService.queueAnalyticsEvent({
            userId,
            sessionId: req.headers['x-session-id'] as string || `queue_${Date.now()}`,
            eventType: 'offline_request_queued',
            eventCategory: 'offline_sync',
            eventAction: method,
            timestamp: new Date(),
            offline: true,
            metadata: {
                url,
                priority,
                hasDependencies: dependencies.length > 0,
            },
        });

        res.json({
            success: true,
            message: 'Request queued for offline processing',
            queueItem: {
                id: queueItem.id,
                requestId: queueItem.requestId,
                method: queueItem.method,
                url: queueItem.url,
                priority: queueItem.priority,
                status: queueItem.status,
                createdAt: queueItem.createdAt,
            },
        });

    } catch (error: any) {
        console.error('Queue offline request error:', error);
        res.status(500).json({ error: error.message || 'Failed to queue request' });
    }
};

/**
 * Process queued offline requests
 */
export const processOfflineQueue = async (req: Request, res: Response) => {
    try {
        const userId = req.user.id;
        const { maxItems } = req.body;

        // Process queue items
        await OfflineQueueService.processQueue(userId);

        // Get updated queue stats
        const stats = await OfflineQueueService.getQueueStats(userId);

        res.json({
            success: true,
            message: 'Queue processing completed',
            stats,
        });

    } catch (error: any) {
        console.error('Process offline queue error:', error);
        res.status(500).json({ error: error.message || 'Failed to process queue' });
    }
};

/**
 * Get offline queue status
 */
export const getOfflineQueueStatus = async (req: Request, res: Response) => {
    try {
        const userId = req.user.id;
        const stats = await OfflineQueueService.getQueueStats(userId);

        res.json({
            success: true,
            stats,
        });

    } catch (error: any) {
        console.error('Get queue status error:', error);
        res.status(500).json({ error: error.message || 'Failed to get queue status' });
    }
};

/**
 * Resolve sync conflicts
 */
export const resolveSyncConflict = async (req: Request, res: Response) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { conflictId } = req.params;
        const { strategy, resolvedData } = req.body;
        const userId = req.user.id;

        const resolution: ConflictResolution = {
            strategy,
            resolvedData,
            resolvedBy: userId,
        };

        const conflict = await SyncConflictService.resolveConflict(conflictId, resolution);

        // Track analytics
        await OfflineAnalyticsService.queueAnalyticsEvent({
            userId,
            sessionId: req.headers['x-session-id'] as string || `conflict_${Date.now()}`,
            eventType: 'conflict_resolved',
            eventCategory: 'sync',
            eventAction: strategy,
            timestamp: new Date(),
            offline: false,
            metadata: {
                conflictId,
                entityType: conflict.entityType,
                entityId: conflict.entityId,
            },
        });

        res.json({
            success: true,
            message: 'Conflict resolved successfully',
            conflict: {
                id: conflict.id,
                entityType: conflict.entityType,
                entityId: conflict.entityId,
                resolutionStrategy: conflict.resolutionStrategy,
                resolved: conflict.resolved,
                resolvedAt: conflict.resolvedAt,
            },
        });

    } catch (error: any) {
        console.error('Resolve conflict error:', error);
        res.status(500).json({ error: error.message || 'Failed to resolve conflict' });
    }
};

/**
 * Get unresolved sync conflicts
 */
export const getSyncConflicts = async (req: Request, res: Response) => {
    try {
        const userId = req.user.id;
        const { entityType, limit = 50, offset = 0 } = req.query;

        const conflicts = await SyncConflictService.getUnresolvedConflicts(
            userId,
            entityType as string,
            parseInt(limit as string),
            parseInt(offset as string)
        );

        res.json({
            success: true,
            conflicts: conflicts.map(conflict => ({
                id: conflict.id,
                entityType: conflict.entityType,
                entityId: conflict.entityId,
                conflictType: conflict.conflictType,
                localVersion: conflict.localVersion,
                serverVersion: conflict.serverVersion,
                localData: conflict.localData,
                serverData: conflict.serverData,
                createdAt: conflict.createdAt,
            })),
        });

    } catch (error: any) {
        console.error('Get sync conflicts error:', error);
        res.status(500).json({ error: error.message || 'Failed to get conflicts' });
    }
};

/**
 * Auto-resolve conflicts
 */
export const autoResolveConflicts = async (req: Request, res: Response) => {
    try {
        const userId = req.user.id;
        const { entityType, rules } = req.body;

        const resolvedCount = await SyncConflictService.autoResolveConflicts(userId, entityType, rules);

        res.json({
            success: true,
            message: `Auto-resolved ${resolvedCount} conflicts`,
            resolvedCount,
        });

    } catch (error: any) {
        console.error('Auto-resolve conflicts error:', error);
        res.status(500).json({ error: error.message || 'Failed to auto-resolve conflicts' });
    }
};

/**
 * Update device offline status
 */
export const updateDeviceStatus = async (req: Request, res: Response) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const userId = req.user.id;
        const update: DeviceStatusUpdate = {
            userId,
            ...req.body,
        };

        const status = await OfflineStatusService.updateDeviceStatus(update);

        res.json({
            success: true,
            message: 'Device status updated',
            status: {
                deviceId: status.deviceId,
                isOnline: status.isOnline,
                lastSeen: status.lastSeen,
                platform: status.platform,
                syncEnabled: status.syncEnabled,
                pendingSyncItems: status.pendingSyncItems,
            },
        });

    } catch (error: any) {
        console.error('Update device status error:', error);
        res.status(500).json({ error: error.message || 'Failed to update device status' });
    }
};

/**
 * Get device statuses
 */
export const getDeviceStatuses = async (req: Request, res: Response) => {
    try {
        const userId = req.user.id;
        const { includeOffline = true } = req.query;

        const devices = await OfflineStatusService.getUserDevices(
            userId,
            includeOffline === 'true'
        );

        res.json({
            success: true,
            devices: devices.map(device => ({
                deviceId: device.deviceId,
                isOnline: device.isOnline,
                lastSeen: device.lastSeen,
                platform: device.platform,
                appVersion: device.appVersion,
                syncEnabled: device.syncEnabled,
                pendingSyncItems: device.pendingSyncItems,
                lastSuccessfulSync: device.lastSuccessfulSync,
            })),
        });

    } catch (error: any) {
        console.error('Get device statuses error:', error);
        res.status(500).json({ error: error.message || 'Failed to get device statuses' });
    }
};

/**
 * Store offline data
 */
export const storeOfflineData = async (req: Request, res: Response) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const userId = req.user.id;
        const entity: OfflineEntity = req.body;

        const storedData = await OfflineDataService.storeOfflineData(userId, entity);

        res.json({
            success: true,
            message: 'Offline data stored successfully',
            data: {
                id: storedData.id,
                entityType: storedData.entityType,
                entityId: storedData.entityId,
                version: storedData.version,
                syncStatus: storedData.syncStatus,
                expiresAt: storedData.expiresAt,
            },
        });

    } catch (error: any) {
        console.error('Store offline data error:', error);
        res.status(500).json({ error: error.message || 'Failed to store offline data' });
    }
};

/**
 * Sync offline data
 */
export const syncOfflineData = async (req: Request, res: Response) => {
    try {
        const userId = req.user.id;
        const { entityTypes } = req.body;

        const result = await OfflineDataService.syncOfflineData(userId, entityTypes);

        // Track sync performance
        await OfflineAnalyticsService.trackSyncPerformance(
            userId,
            req.headers['x-device-id'] as string || 'unknown',
            {
                syncType: 'incremental',
                itemsSynced: result.synced,
                duration: 0, // Would need to track actual duration
                success: result.errors === 0,
                dataTransferred: 0, // Would need to calculate
            }
        );

        res.json({
            success: true,
            message: `Synced ${result.synced} items, ${result.conflicts} conflicts, ${result.errors} errors`,
            result,
        });

    } catch (error: any) {
        console.error('Sync offline data error:', error);
        res.status(500).json({ error: error.message || 'Failed to sync offline data' });
    }
};

/**
 * Get offline data statistics
 */
export const getOfflineDataStats = async (req: Request, res: Response) => {
    try {
        const userId = req.user.id;
        const stats = await OfflineDataService.getOfflineDataStats(userId);

        res.json({
            success: true,
            stats,
        });

    } catch (error: any) {
        console.error('Get offline data stats error:', error);
        res.status(500).json({ error: error.message || 'Failed to get offline data stats' });
    }
};

/**
 * Get data version history
 */
export const getDataVersionHistory = async (req: Request, res: Response) => {
    try {
        const { entityType, entityId } = req.params;
        const { limit = 50, offset = 0 } = req.query;

        const versions = await DataVersioningService.getVersionHistory(
            entityType,
            entityId,
            parseInt(limit as string),
            parseInt(offset as string)
        );

        res.json({
            success: true,
            versions: versions.map(version => ({
                id: version.id,
                version: version.version,
                operation: version.operation,
                userId: version.userId,
                checksum: version.checksum,
                createdAt: version.createdAt,
                metadata: version.metadata,
            })),
        });

    } catch (error: any) {
        console.error('Get version history error:', error);
        res.status(500).json({ error: error.message || 'Failed to get version history' });
    }
};

/**
 * Get offline analytics
 */
export const getOfflineAnalytics = async (req: Request, res: Response) => {
    try {
        const userId = req.user.id;
        const { dateRange } = req.query;

        const report = await OfflineAnalyticsService.generateOfflineReport(
            userId,
            dateRange && typeof dateRange === 'object' && 'start' in dateRange && 'end' in dateRange ? {
                start: new Date(dateRange.start as string),
                end: new Date(dateRange.end as string),
            } : undefined
        );

        res.json({
            success: true,
            report,
        });

    } catch (error: any) {
        console.error('Get offline analytics error:', error);
        res.status(500).json({ error: error.message || 'Failed to get offline analytics' });
    }
};

/**
 * Clear user cache
 */
export const clearUserCache = async (req: Request, res: Response) => {
    try {
        const userId = req.user.id;
        const { entityTypes } = req.body;

        if (entityTypes && Array.isArray(entityTypes)) {
            for (const entityType of entityTypes) {
                await SelectiveCacheService.invalidateByType(entityType);
            }
        } else {
            // Clear all user-related cache
            await SelectiveCacheService.invalidateByType('user');
            await SelectiveCacheService.invalidateByType('post');
            await SelectiveCacheService.invalidateByType('event');
        }

        res.json({
            success: true,
            message: 'Cache cleared successfully',
        });

    } catch (error: any) {
        console.error('Clear cache error:', error);
        res.status(500).json({ error: error.message || 'Failed to clear cache' });
    }
};

/**
 * Get cache performance metrics
 */
export const getCacheMetrics = async (req: Request, res: Response) => {
    try {
        const metrics = await SelectiveCacheService.getCacheMetrics();

        res.json({
            success: true,
            metrics,
        });

    } catch (error: any) {
        console.error('Get cache metrics error:', error);
        res.status(500).json({ error: error.message || 'Failed to get cache metrics' });
    }
};