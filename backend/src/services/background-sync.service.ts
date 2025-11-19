import cron from 'node-cron';
import { OfflineQueueService } from './offline-queue.service';
import { SyncConflictService } from './sync-conflict.service';
import { OfflineStatusService } from './offline-status.service';
import { DataVersioningService } from './data-versioning.service';
import { redis } from '../config/database';
import { io } from '../index';

export interface SyncJob {
  id: string;
  userId: string;
  type: 'full_sync' | 'incremental_sync' | 'conflict_resolution' | 'queue_processing';
  status: 'pending' | 'running' | 'completed' | 'failed';
  progress: number;
  startedAt?: Date;
  completedAt?: Date;
  errorMessage?: string;
  metadata?: Record<string, any>;
}

export class BackgroundSyncService {
  private static jobs = new Map<string, SyncJob>();
  private static cronJobs: any[] = [];

  /**
   * Initialize background sync jobs
   */
  static initialize(): void {
    // Process offline queues every 30 seconds
    const queueProcessor = cron.schedule('*/30 * * * * *', async () => {
      await this.processAllQueues();
    });

    // Auto-resolve conflicts every 5 minutes
    const conflictResolver = cron.schedule('*/5 * * * *', async () => {
      await this.autoResolveConflicts();
    });

    // Clean up old data every hour
    const cleanupJob = cron.schedule('0 * * * *', async () => {
      await this.performCleanup();
    });

    // Sync devices that need it every 2 minutes
    const deviceSyncJob = cron.schedule('*/2 * * * *', async () => {
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
  static stop(): void {
    this.cronJobs.forEach(job => job.stop());
    this.cronJobs = [];
    console.log('🛑 Background sync service stopped');
  }

  /**
   * Start a manual sync job
   */
  static async startSyncJob(
    userId: string,
    type: SyncJob['type'],
    metadata?: Record<string, any>
  ): Promise<string> {
    const jobId = `sync_${userId}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    const job: SyncJob = {
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
  static getSyncJob(jobId: string): SyncJob | undefined {
    return this.jobs.get(jobId);
  }

  /**
   * Get all active sync jobs for a user
   */
  static getUserSyncJobs(userId: string): SyncJob[] {
    return Array.from(this.jobs.values()).filter(
      job => job.userId === userId && job.status !== 'completed' && job.status !== 'failed'
    );
  }

  /**
   * Execute a sync job
   */
  private static async executeSyncJob(job: SyncJob): Promise<void> {
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

    } catch (error: any) {
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
  private static async performFullSync(job: SyncJob): Promise<void> {
    const { userId } = job;

    // Get all user's devices
    const devices = await OfflineStatusService.getUserDevices(userId, true);
    job.progress = 10;

    // Process offline queue
    await OfflineQueueService.processQueue(userId);
    job.progress = 30;

    // Resolve conflicts
    const resolvedCount = await SyncConflictService.autoResolveConflicts(userId, 'all', {
      defaultStrategy: 'server_wins',
    });
    job.progress = 50;

    // Update device statuses
    for (const device of devices) {
      if (device.isOnline) {
        await OfflineStatusService.updateSyncStatus(userId, device.deviceId, {
          lastSuccessfulSync: new Date(),
          pendingSyncItems: 0,
        });
      }
    }
    job.progress = 80;

    // Get latest versions for keys entities
    const versionStats = await DataVersioningService.getVersionStats(undefined, undefined, userId);
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
  private static async performIncrementalSync(job: SyncJob): Promise<void> {
    const { userId } = job;

    // Process only recent queue items
    await OfflineQueueService.processQueue(userId);
    job.progress = 40;

    // Check for new conflicts
    const conflicts = await SyncConflictService.getUnresolvedConflicts(userId);
    job.progress = 60;

    // Update sync status
    const devices = await OfflineStatusService.getUserDevices(userId, true);
    for (const device of devices) {
      if (device.isOnline) {
        await OfflineStatusService.updateSyncStatus(userId, device.deviceId, {
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
  private static async performConflictResolution(job: SyncJob): Promise<void> {
    const { userId } = job;
    const entityType = job.metadata?.entityType;

    const resolvedCount = await SyncConflictService.autoResolveConflicts(userId, entityType, {
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
  private static async performQueueProcessing(job: SyncJob): Promise<void> {
    const { userId } = job;

    const stats = await OfflineQueueService.getQueueStats(userId);
    await OfflineQueueService.processQueue(userId);

    const updatedStats = await OfflineQueueService.getQueueStats(userId);

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
  private static async processAllQueues(): Promise<void> {
    try {
      // Get all users with pending queue items
      const usersWithQueues = await redis.keys('offline_queue:*');

      for (const key of usersWithQueues) {
        const userId = key.replace('offline_queue:', '');
        await OfflineQueueService.processQueue(userId);
      }
    } catch (error) {
      console.error('Failed to process all queues:', error);
    }
  }

  /**
   * Auto-resolve conflicts for all users
   */
  private static async autoResolveConflicts(): Promise<void> {
    try {
      // Simplified approach: process conflicts for users who have them
      // In production, you'd implement a more efficient batch processing system
      console.log('Auto-resolving conflicts...');
      // This would be implemented with a more sophisticated user discovery mechanism
    } catch (error) {
      console.error('Failed to auto-resolve conflicts:', error);
    }
  }

  /**
   * Sync devices that need updates
   */
  private static async syncDevicesNeedingUpdate(): Promise<void> {
    try {
      const devices = await OfflineStatusService.getDevicesNeedingSync(5); // Devices with 5+ pending items

      for (const device of devices) {
        // Request sync for this device
        await OfflineStatusService.requestDeviceSync(device.userId, device.deviceId);
      }
    } catch (error) {
      console.error('Failed to sync devices:', error);
    }
  }

  /**
   * Perform cleanup operations
   */
  private static async performCleanup(): Promise<void> {
    try {
      // Clean up old queue items
      const usersWithQueues = await redis.keys('offline_queue:*');
      for (const key of usersWithQueues) {
        const userId = key.replace('offline_queue:', '');
        await OfflineQueueService.cleanupOldItems(userId, 7); // 7 days
      }

      // Clean up resolved conflicts
      await SyncConflictService.cleanupResolvedConflicts(30); // 30 days

      // Clean up offline devices
      await OfflineStatusService.cleanupOfflineDevices(30); // 30 days

      // Clean up old versions (keep last 20 per entity)
      // This would need to be implemented based on specific requirements

    } catch (error) {
      console.error('Failed to perform cleanup:', error);
    }
  }

  /**
   * Notify user of job completion
   */
  private static notifyJobCompletion(job: SyncJob): void {
    try {
      const userRoom = `user:${job.userId}`;
      io.to(userRoom).emit('sync_job_completed', {
        jobId: job.id,
        type: job.type,
        completedAt: job.completedAt,
        metadata: job.metadata,
      });
    } catch (error) {
      console.error('Failed to notify job completion:', error);
    }
  }

  /**
   * Notify user of job failure
   */
  private static notifyJobFailure(job: SyncJob): void {
    try {
      const userRoom = `user:${job.userId}`;
      io.to(userRoom).emit('sync_job_failed', {
        jobId: job.id,
        type: job.type,
        errorMessage: job.errorMessage,
        failedAt: job.completedAt,
      });
    } catch (error) {
      console.error('Failed to notify job failure:', error);
    }
  }

  /**
   * Get system-wide sync statistics
   */
  static async getSystemSyncStats(): Promise<{
    activeJobs: number;
    completedJobsToday: number;
    failedJobsToday: number;
    queueStats: any;
    conflictStats: any;
    deviceStats: any;
  }> {
    const activeJobs = Array.from(this.jobs.values()).filter(
      job => job.status === 'running' || job.status === 'pending'
    ).length;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const completedJobsToday = Array.from(this.jobs.values()).filter(
      job => job.status === 'completed' && job.completedAt && job.completedAt >= today
    ).length;

    const failedJobsToday = Array.from(this.jobs.values()).filter(
      job => job.status === 'failed' && job.completedAt && job.completedAt >= today
    ).length;

    // Get aggregate stats from services
    const [queueStats, conflictStats, deviceStats] = await Promise.all([
      this.getAggregateQueueStats(),
      this.getAggregateConflictStats(),
      OfflineStatusService.getStatusStats(),
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
  private static async getAggregateQueueStats(): Promise<any> {
    // This would require a more complex query to aggregate across all users
    // For now, return basic info
    return {
      note: 'Aggregate queue stats require additional implementation',
    };
  }

  /**
   * Get aggregate conflict statistics
   */
  private static async getAggregateConflictStats(): Promise<any> {
    // This would require a more complex query to aggregate across all users
    // For now, return basic info
    return {
      note: 'Aggregate conflict stats require additional implementation',
    };
  }
}

export default BackgroundSyncService;