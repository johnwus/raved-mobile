"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BackgroundSyncService = void 0;
const node_cron_1 = __importDefault(require("node-cron"));
const offline_queue_service_1 = require("./offline-queue.service");
const sync_conflict_service_1 = require("./sync-conflict.service");
const offline_status_service_1 = require("./offline-status.service");
const data_versioning_service_1 = require("./data-versioning.service");
const database_1 = require("../config/database");
const index_1 = require("../index");
class BackgroundSyncService {
    /**
     * Initialize background sync jobs
     */
    static initialize() {
        // Process offline queues every 30 seconds
        const queueProcessor = node_cron_1.default.schedule('*/30 * * * * *', async () => {
            await this.processAllQueues();
        });
        // Auto-resolve conflicts every 5 minutes
        const conflictResolver = node_cron_1.default.schedule('*/5 * * * *', async () => {
            await this.autoResolveConflicts();
        });
        // Clean up old data every hour
        const cleanupJob = node_cron_1.default.schedule('0 * * * *', async () => {
            await this.performCleanup();
        });
        // Sync devices that need it every 2 minutes
        const deviceSyncJob = node_cron_1.default.schedule('*/2 * * * *', async () => {
            await this.syncDevicesNeedingUpdate();
        });
        this.cronJobs = [queueProcessor, conflictResolver, cleanupJob, deviceSyncJob];
        // Start all jobs
        this.cronJobs.forEach(job => job.start());
        console.log('✅ Background sync service initialized');
    }
    /**
     * Stop all background jobs
     */
    static stop() {
        this.cronJobs.forEach(job => job.stop());
        this.cronJobs = [];
        console.log('🛑 Background sync service stopped');
    }
    /**
     * Start a manual sync job
     */
    static async startSyncJob(userId, type, metadata) {
        const jobId = `sync_${userId}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        const job = {
            id: jobId,
            userId,
            type,
            status: 'pending',
            progress: 0,
            metadata,
        };
        this.jobs.set(jobId, job);
        // Start the job asynchronously
        this.executeSyncJob(job);
        return jobId;
    }
    /**
     * Get sync job status
     */
    static getSyncJob(jobId) {
        return this.jobs.get(jobId);
    }
    /**
     * Get all active sync jobs for a user
     */
    static getUserSyncJobs(userId) {
        return Array.from(this.jobs.values()).filter(job => job.userId === userId && job.status !== 'completed' && job.status !== 'failed');
    }
    /**
     * Execute a sync job
     */
    static async executeSyncJob(job) {
        try {
            job.status = 'running';
            job.startedAt = new Date();
            job.progress = 0;
            switch (job.type) {
                case 'full_sync':
                    await this.performFullSync(job);
                    break;
                case 'incremental_sync':
                    await this.performIncrementalSync(job);
                    break;
                case 'conflict_resolution':
                    await this.performConflictResolution(job);
                    break;
                case 'queue_processing':
                    await this.performQueueProcessing(job);
                    break;
            }
            job.status = 'completed';
            job.progress = 100;
            job.completedAt = new Date();
            // Notify user of completion
            this.notifyJobCompletion(job);
        }
        catch (error) {
            job.status = 'failed';
            job.errorMessage = error.message;
            job.completedAt = new Date();
            console.error(`Sync job ${job.id} failed:`, error);
            // Notify user of failure
            this.notifyJobFailure(job);
        }
    }
    /**
     * Perform full sync for a user
     */
    static async performFullSync(job) {
        const { userId } = job;
        // Get all user's devices
        const devices = await offline_status_service_1.OfflineStatusService.getUserDevices(userId, true);
        job.progress = 10;
        // Process offline queue
        await offline_queue_service_1.OfflineQueueService.processQueue(userId);
        job.progress = 30;
        // Resolve conflicts
        const resolvedCount = await sync_conflict_service_1.SyncConflictService.autoResolveConflicts(userId, 'all', {
            defaultStrategy: 'server_wins',
        });
        job.progress = 50;
        // Update device statuses
        for (const device of devices) {
            if (device.isOnline) {
                await offline_status_service_1.OfflineStatusService.updateSyncStatus(userId, device.deviceId, {
                    lastSuccessfulSync: new Date(),
                    pendingSyncItems: 0,
                });
            }
        }
        job.progress = 80;
        // Get latest versions for key entities
        const versionStats = await data_versioning_service_1.DataVersioningService.getVersionStats(undefined, undefined, userId);
        job.progress = 100;
        job.metadata = {
            ...job.metadata,
            devicesSynced: devices.length,
            conflictsResolved: resolvedCount,
            versionStats,
        };
    }
    /**
     * Perform incremental sync
     */
    static async performIncrementalSync(job) {
        const { userId } = job;
        // Process only recent queue items
        await offline_queue_service_1.OfflineQueueService.processQueue(userId);
        job.progress = 40;
        // Check for new conflicts
        const conflicts = await sync_conflict_service_1.SyncConflictService.getUnresolvedConflicts(userId);
        job.progress = 60;
        // Update sync status
        const devices = await offline_status_service_1.OfflineStatusService.getUserDevices(userId, true);
        for (const device of devices) {
            if (device.isOnline) {
                await offline_status_service_1.OfflineStatusService.updateSyncStatus(userId, device.deviceId, {
                    lastSuccessfulSync: new Date(),
                });
            }
        }
        job.progress = 100;
        job.metadata = {
            ...job.metadata,
            conflictsFound: conflicts.length,
            devicesUpdated: devices.length,
        };
    }
    /**
     * Perform conflict resolution
     */
    static async performConflictResolution(job) {
        const { userId } = job;
        const entityType = job.metadata?.entityType;
        const resolvedCount = await sync_conflict_service_1.SyncConflictService.autoResolveConflicts(userId, entityType, {
            defaultStrategy: 'merge',
            fieldPriorities: job.metadata?.fieldPriorities || {},
        });
        job.progress = 100;
        job.metadata = {
            ...job.metadata,
            conflictsResolved: resolvedCount,
        };
    }
    /**
     * Perform queue processing
     */
    static async performQueueProcessing(job) {
        const { userId } = job;
        const stats = await offline_queue_service_1.OfflineQueueService.getQueueStats(userId);
        await offline_queue_service_1.OfflineQueueService.processQueue(userId);
        const updatedStats = await offline_queue_service_1.OfflineQueueService.getQueueStats(userId);
        job.progress = 100;
        job.metadata = {
            ...job.metadata,
            itemsProcessed: stats.pending - updatedStats.pending,
            beforeStats: stats,
            afterStats: updatedStats,
        };
    }
    /**
     * Process all users' queues
     */
    static async processAllQueues() {
        try {
            // Get all users with pending queue items
            const usersWithQueues = await database_1.redis.keys('offline_queue:*');
            for (const key of usersWithQueues) {
                const userId = key.replace('offline_queue:', '');
                await offline_queue_service_1.OfflineQueueService.processQueue(userId);
            }
        }
        catch (error) {
            console.error('Failed to process all queues:', error);
        }
    }
    /**
     * Auto-resolve conflicts for all users
     */
    static async autoResolveConflicts() {
        try {
            // Simplified approach: process conflicts for users who have them
            // In production, you'd implement a more efficient batch processing system
            console.log('Auto-resolving conflicts...');
            // This would be implemented with a more sophisticated user discovery mechanism
        }
        catch (error) {
            console.error('Failed to auto-resolve conflicts:', error);
        }
    }
    /**
     * Sync devices that need updates
     */
    static async syncDevicesNeedingUpdate() {
        try {
            const devices = await offline_status_service_1.OfflineStatusService.getDevicesNeedingSync(5); // Devices with 5+ pending items
            for (const device of devices) {
                // Request sync for this device
                await offline_status_service_1.OfflineStatusService.requestDeviceSync(device.userId, device.deviceId);
            }
        }
        catch (error) {
            console.error('Failed to sync devices:', error);
        }
    }
    /**
     * Perform cleanup operations
     */
    static async performCleanup() {
        try {
            // Clean up old queue items
            const usersWithQueues = await database_1.redis.keys('offline_queue:*');
            for (const key of usersWithQueues) {
                const userId = key.replace('offline_queue:', '');
                await offline_queue_service_1.OfflineQueueService.cleanupOldItems(userId, 7); // 7 days
            }
            // Clean up resolved conflicts
            await sync_conflict_service_1.SyncConflictService.cleanupResolvedConflicts(30); // 30 days
            // Clean up offline devices
            await offline_status_service_1.OfflineStatusService.cleanupOfflineDevices(30); // 30 days
            // Clean up old versions (keep last 20 per entity)
            // This would need to be implemented based on specific requirements
        }
        catch (error) {
            console.error('Failed to perform cleanup:', error);
        }
    }
    /**
     * Notify user of job completion
     */
    static notifyJobCompletion(job) {
        try {
            const userRoom = `user:${job.userId}`;
            index_1.io.to(userRoom).emit('sync_job_completed', {
                jobId: job.id,
                type: job.type,
                completedAt: job.completedAt,
                metadata: job.metadata,
            });
        }
        catch (error) {
            console.error('Failed to notify job completion:', error);
        }
    }
    /**
     * Notify user of job failure
     */
    static notifyJobFailure(job) {
        try {
            const userRoom = `user:${job.userId}`;
            index_1.io.to(userRoom).emit('sync_job_failed', {
                jobId: job.id,
                type: job.type,
                errorMessage: job.errorMessage,
                failedAt: job.completedAt,
            });
        }
        catch (error) {
            console.error('Failed to notify job failure:', error);
        }
    }
    /**
     * Get system-wide sync statistics
     */
    static async getSystemSyncStats() {
        const activeJobs = Array.from(this.jobs.values()).filter(job => job.status === 'running' || job.status === 'pending').length;
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const completedJobsToday = Array.from(this.jobs.values()).filter(job => job.status === 'completed' && job.completedAt && job.completedAt >= today).length;
        const failedJobsToday = Array.from(this.jobs.values()).filter(job => job.status === 'failed' && job.completedAt && job.completedAt >= today).length;
        // Get aggregate stats from services
        const [queueStats, conflictStats, deviceStats] = await Promise.all([
            this.getAggregateQueueStats(),
            this.getAggregateConflictStats(),
            offline_status_service_1.OfflineStatusService.getStatusStats(),
        ]);
        return {
            activeJobs,
            completedJobsToday,
            failedJobsToday,
            queueStats,
            conflictStats,
            deviceStats,
        };
    }
    /**
     * Get aggregate queue statistics
     */
    static async getAggregateQueueStats() {
        // This would require a more complex query to aggregate across all users
        // For now, return basic info
        return {
            note: 'Aggregate queue stats require additional implementation',
        };
    }
    /**
     * Get aggregate conflict statistics
     */
    static async getAggregateConflictStats() {
        // This would require a more complex query to aggregate across all users
        // For now, return basic info
        return {
            note: 'Aggregate conflict stats require additional implementation',
        };
    }
}
exports.BackgroundSyncService = BackgroundSyncService;
BackgroundSyncService.jobs = new Map();
BackgroundSyncService.cronJobs = [];
exports.default = BackgroundSyncService;
