"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.OfflineQueueService = void 0;
const uuid_1 = require("uuid");
const offline_queue_model_1 = require("../models/postgres/offline-queue.model");
const database_1 = require("../config/database");
const axios_1 = __importDefault(require("axios"));
class OfflineQueueService {
    /**
     * Add a request to the offline queue
     */
    static async addToQueue(userId, item) {
        const requestId = (0, uuid_1.v4)();
        const queueItem = {
            id: (0, uuid_1.v4)(),
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
        const offlineQueue = await offline_queue_model_1.OfflineQueue.create(queueItem);
        // Add to Redis sorted set for priority ordering
        const score = this.calculatePriorityScore(offlineQueue);
        await database_1.redis.zadd(`${this.QUEUE_KEY_PREFIX}${userId}`, score, requestId);
        return offlineQueue;
    }
    /**
     * Process pending queue items for a user
     */
    static async processQueue(userId) {
        const processingKey = `${this.PROCESSING_KEY_PREFIX}${userId}`;
        // Check if already processing
        const isProcessing = await database_1.redis.get(processingKey);
        if (isProcessing) {
            return;
        }
        // Set processing flag
        await database_1.redis.setex(processingKey, 300, '1'); // 5 minutes timeout
        try {
            const queueKey = `${this.QUEUE_KEY_PREFIX}${userId}`;
            // Get pending items ordered by priority
            const items = await database_1.redis.zrange(queueKey, 0, 9); // Process up to 10 items at once
            for (const requestId of items) {
                await this.processQueueItem(userId, requestId);
            }
        }
        finally {
            // Remove processing flag
            await database_1.redis.del(processingKey);
        }
    }
    /**
     * Process a single queue item
     */
    static async processQueueItem(userId, requestId) {
        const queueItem = await offline_queue_model_1.OfflineQueue.findOne({
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
            await database_1.redis.zrem(`${this.QUEUE_KEY_PREFIX}${userId}`, requestId);
            // Process dependent items
            await this.processDependentItems(queueItem.requestId);
        }
        catch (error) {
            await this.handleQueueError(queueItem, error);
        }
    }
    /**
     * Execute the queued HTTP request
     */
    static async executeRequest(queueItem) {
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
        return (0, axios_1.default)(config);
    }
    /**
     * Handle errors in queue processing
     */
    static async handleQueueError(queueItem, error) {
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
            await database_1.redis.zrem(`${this.QUEUE_KEY_PREFIX}${queueItem.userId}`, queueItem.requestId);
        }
        else {
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
            await database_1.redis.zadd(`${this.QUEUE_KEY_PREFIX}${queueItem.userId}`, score, queueItem.requestId);
        }
    }
    /**
     * Check if dependencies are resolved
     */
    static async checkDependencies(dependencies) {
        const unresolved = [];
        for (const depId of dependencies) {
            const depItem = await offline_queue_model_1.OfflineQueue.findOne({
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
    static async processDependentItems(completedRequestId) {
        const dependentItems = await offline_queue_model_1.OfflineQueue.findAll({
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
                await database_1.redis.zadd(`${this.QUEUE_KEY_PREFIX}${item.userId}`, score, item.requestId);
            }
        }
    }
    /**
     * Calculate priority score for Redis sorted set
     */
    static calculatePriorityScore(item) {
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
    static async getQueueStats(userId) {
        const stats = await offline_queue_model_1.OfflineQueue.findAll({
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
        stats.forEach((stat) => {
            result[stat.status] = parseInt(stat.count);
            result.total += parseInt(stat.count);
        });
        return result;
    }
    /**
     * Clear completed/failed items older than specified days
     */
    static async cleanupOldItems(userId, daysOld = 30) {
        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - daysOld);
        const result = await offline_queue_model_1.OfflineQueue.destroy({
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
    static async retryFailedItems(userId) {
        const failedItems = await offline_queue_model_1.OfflineQueue.findAll({
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
            await database_1.redis.zadd(`${this.QUEUE_KEY_PREFIX}${userId}`, score, item.requestId);
            retriedCount++;
        }
        return retriedCount;
    }
}
exports.OfflineQueueService = OfflineQueueService;
OfflineQueueService.QUEUE_KEY_PREFIX = 'offline_queue:';
OfflineQueueService.PROCESSING_KEY_PREFIX = 'processing:';
OfflineQueueService.RETRY_KEY_PREFIX = 'retry:';
exports.default = OfflineQueueService;
