import { v4 as uuidv4 } from 'uuid';
import { OfflineQueue, OfflineQueueAttributes } from '../models/postgres/offline-queue.model';
import { redis } from '../config/database';
import { CONFIG } from '../config';
import axios, { AxiosResponse } from 'axios';

export interface QueueItem {
  requestId: string;
  method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  url: string;
  headers: Record<string, any>;
  body?: any;
  priority: number;
  maxRetries: number;
  scheduledAt?: Date;
  dependencies?: string[];
  tags?: string[];
}

export class OfflineQueueService {
  private static readonly QUEUE_KEY_PREFIX = 'offline_queue:';
  private static readonly PROCESSING_KEY_PREFIX = 'processing:';
  private static readonly RETRY_KEY_PREFIX = 'retry:';

  /**
   * Add a request to the offline queue
   */
  static async addToQueue(
    userId: string,
    item: Omit<QueueItem, 'requestId'>
  ): Promise<OfflineQueue> {
    const requestId = uuidv4();

    const queueItem: OfflineQueueAttributes = {
      id: uuidv4(),
      userId,
      requestId,
      method: item.method,
      url: item.url,
      headers: item.headers,
      body: item.body,
      priority: item.priority,
      retryCount: 0,
      maxRetries: item.maxRetries,
      status: 'pending',
      scheduledAt: item.scheduledAt,
      dependencies: item.dependencies,
      tags: item.tags,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const offlineQueue = await OfflineQueue.create(queueItem);

    // Add to Redis sorted set for priority ordering
    const score = this.calculatePriorityScore(offlineQueue);
    await redis.zadd(
      `${this.QUEUE_KEY_PREFIX}${userId}`,
      score,
      requestId
    );

    return offlineQueue;
  }

  /**
   * Process pending queue items for a user
   */
  static async processQueue(userId: string): Promise<void> {
    const processingKey = `${this.PROCESSING_KEY_PREFIX}${userId}`;

    // Check if already processing
    const isProcessing = await redis.get(processingKey);
    if (isProcessing) {
      return;
    }

    // Set processing flag
    await redis.setex(processingKey, 300, '1'); // 5 minutes timeout

    try {
      const queueKey = `${this.QUEUE_KEY_PREFIX}${userId}`;

      // Get pending items ordered by priority
      const items = await redis.zrange(queueKey, 0, 9); // Process up to 10 items at once

      for (const requestId of items) {
        await this.processQueueItem(userId, requestId);
      }
    } finally {
      // Remove processing flag
      await redis.del(processingKey);
    }
  }

  /**
   * Process a single queue item
   */
  private static async processQueueItem(userId: string, requestId: string): Promise<void> {
    const queueItem = await OfflineQueue.findOne({
      where: { userId, requestId, status: 'pending' },
    });

    if (!queueItem) {
      return;
    }

    // Check dependencies
    if (queueItem.dependencies && queueItem.dependencies.length > 0) {
      const unresolvedDeps = await this.checkDependencies(queueItem.dependencies);
      if (unresolvedDeps.length > 0) {
        // Dependencies not resolved, skip for now
        return;
      }
    }

    // Update status to processing
    await queueItem.update({ status: 'processing' });

    try {
      // Execute the request
      const response = await this.executeRequest(queueItem);

      // Mark as completed
      await queueItem.update({
        status: 'completed',
        updatedAt: new Date(),
      });

      // Remove from Redis queue
      await redis.zrem(`${this.QUEUE_KEY_PREFIX}${userId}`, requestId);

      // Process dependent items
      await this.processDependentItems(queueItem.requestId);

    } catch (error: any) {
      await this.handleQueueError(queueItem, error);
    }
  }

  /**
   * Execute the queued HTTP request
   */
  private static async executeRequest(queueItem: OfflineQueue): Promise<AxiosResponse> {
    const config = {
      method: queueItem.method,
      url: queueItem.url,
      headers: {
        ...queueItem.headers,
        'Content-Type': 'application/json',
      },
      data: queueItem.body,
      timeout: 30000, // 30 seconds
    };

    return axios(config);
  }

  /**
   * Handle errors in queue processing
   */
  private static async handleQueueError(queueItem: OfflineQueue, error: any): Promise<void> {
    const newRetryCount = queueItem.retryCount + 1;

    if (newRetryCount >= queueItem.maxRetries) {
      // Max retries reached, mark as failed
      await queueItem.update({
        status: 'failed',
        errorMessage: error.message,
        retryCount: newRetryCount,
        updatedAt: new Date(),
      });

      // Remove from Redis queue
      await redis.zrem(`${this.QUEUE_KEY_PREFIX}${queueItem.userId}`, queueItem.requestId);
    } else {
      // Schedule retry with exponential backoff
      const retryDelay = Math.min(1000 * Math.pow(2, newRetryCount), 300000); // Max 5 minutes
      const retryAt = new Date(Date.now() + retryDelay);

      await queueItem.update({
        status: 'pending',
        errorMessage: error.message,
        retryCount: newRetryCount,
        scheduledAt: retryAt,
        updatedAt: new Date(),
      });

      // Update priority score for retry
      const score = this.calculatePriorityScore(queueItem);
      await redis.zadd(
        `${this.QUEUE_KEY_PREFIX}${queueItem.userId}`,
        score,
        queueItem.requestId
      );
    }
  }

  /**
   * Check if dependencies are resolved
   */
  private static async checkDependencies(dependencies: string[]): Promise<string[]> {
    const unresolved: string[] = [];

    for (const depId of dependencies) {
      const depItem = await OfflineQueue.findOne({
        where: { requestId: depId },
      });

      if (!depItem || depItem.status !== 'completed') {
        unresolved.push(depId);
      }
    }

    return unresolved;
  }

  /**
   * Process items that depend on the completed item
   */
  private static async processDependentItems(completedRequestId: string): Promise<void> {
    const dependentItems = await OfflineQueue.findAll({
      where: {
        dependencies: { [require('sequelize').Op.contains]: [completedRequestId] },
        status: 'pending',
      },
    });

    for (const item of dependentItems) {
      // Check if all dependencies are now resolved
      const unresolvedDeps = await this.checkDependencies(item.dependencies || []);
      if (unresolvedDeps.length === 0) {
        // All dependencies resolved, add back to queue
        const score = this.calculatePriorityScore(item);
        await redis.zadd(
          `${this.QUEUE_KEY_PREFIX}${item.userId}`,
          score,
          item.requestId
        );
      }
    }
  }

  /**
   * Calculate priority score for Redis sorted set
   */
  private static calculatePriorityScore(item: OfflineQueue): number {
    const now = Date.now();
    const scheduledTime = item.scheduledAt ? item.scheduledAt.getTime() : now;
    const delay = Math.max(0, scheduledTime - now);

    // Higher priority (lower score) for higher priority numbers and older items
    // Priority ranges from 0-100, delay in milliseconds
    return delay + (100 - item.priority) * 1000;
  }

  /**
   * Get queue statistics for a user
   */
  static async getQueueStats(userId: string): Promise<{
    pending: number;
    processing: number;
    completed: number;
    failed: number;
    total: number;
  }> {
    const stats = await OfflineQueue.findAll({
      where: { userId },
      attributes: [
        'status',
        [require('sequelize').fn('COUNT', require('sequelize').col('status')), 'count'],
      ],
      group: ['status'],
      raw: true,
    });

    const result = {
      pending: 0,
      processing: 0,
      completed: 0,
      failed: 0,
      total: 0,
    };

    stats.forEach((stat: any) => {
      result[stat.status as keyof typeof result] = parseInt(stat.count);
      result.total += parseInt(stat.count);
    });

    return result;
  }

  /**
   * Clear completed/failed items older than specified days
   */
  static async cleanupOldItems(userId: string, daysOld: number = 30): Promise<number> {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysOld);

    const result = await OfflineQueue.destroy({
      where: {
        userId,
        status: ['completed', 'failed'],
        updatedAt: { [require('sequelize').Op.lt]: cutoffDate },
      },
    });

    return result;
  }

  /**
   * Force retry failed items
   */
  static async retryFailedItems(userId: string): Promise<number> {
    const failedItems = await OfflineQueue.findAll({
      where: {
        userId,
        status: 'failed',
        retryCount: { [require('sequelize').Op.lt]: require('sequelize').col('maxRetries') },
      },
    });

    let retriedCount = 0;

    for (const item of failedItems) {
      await item.update({
        status: 'pending',
        errorMessage: undefined,
        scheduledAt: new Date(),
        updatedAt: new Date(),
      });

      const score = this.calculatePriorityScore(item);
      await redis.zadd(
        `${this.QUEUE_KEY_PREFIX}${userId}`,
        score,
        item.requestId
      );

      retriedCount++;
    }

    return retriedCount;
  }
}

export default OfflineQueueService;