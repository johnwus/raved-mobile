"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.OfflineDataService = void 0;
const uuid_1 = require("uuid");
const offline_data_model_1 = require("../models/postgres/offline-data.model");
const data_versioning_service_1 = require("./data-versioning.service");
const sync_conflict_service_1 = require("./sync-conflict.service");
const database_1 = require("../config/database");
const crypto_1 = __importDefault(require("crypto"));
class OfflineDataService {
    /**
     * Store data for offline access
     */
    static async storeOfflineData(userId, entity) {
        const checksum = this.generateChecksum(entity.data);
        const version = await data_versioning_service_1.DataVersioningService.getLatestVersion(entity.entityType, entity.entityId) + 1;
        const offlineData = {
            id: (0, uuid_1.v4)(),
            userId,
            entityType: entity.entityType,
            entityId: entity.entityId,
            data: entity.data,
            version,
            lastModified: new Date(),
            syncStatus: 'pending',
            checksum,
            metadata: entity.metadata,
            expiresAt: entity.expiresAt,
            priority: entity.priority || 0,
            tags: entity.tags,
            createdAt: new Date(),
            updatedAt: new Date(),
        };
        const storedData = await offline_data_model_1.OfflineData.create(offlineData);
        // Cache the data
        await this.cacheOfflineData(storedData);
        // Create version record
        await data_versioning_service_1.DataVersioningService.createVersion({
            entityType: entity.entityType,
            entityId: entity.entityId,
            data: entity.data,
            userId,
            operation: 'update',
            metadata: {
                ...entity.metadata,
                offlineStorage: true,
                storedAt: new Date(),
            },
        });
        return storedData;
    }
    /**
     * Retrieve offline data
     */
    static async getOfflineData(userId, entityType, entityId) {
        // Try cache first
        const cacheKey = `${this.OFFLINE_DATA_KEY_PREFIX}${userId}:${entityType}:${entityId}`;
        const cached = await database_1.redis.get(cacheKey);
        if (cached) {
            const data = JSON.parse(cached);
            // Check if expired
            if (data.expiresAt && new Date(data.expiresAt) < new Date()) {
                await this.deleteOfflineData(userId, entityType, entityId);
                return null;
            }
            return data;
        }
        // Query database
        const data = await offline_data_model_1.OfflineData.findOne({
            where: {
                userId,
                entityType,
                entityId,
            },
        });
        if (data && !data.isExpired) {
            await this.cacheOfflineData(data);
            return data;
        }
        return null;
    }
    /**
     * Update offline data
     */
    static async updateOfflineData(userId, entityType, entityId, updates) {
        const existingData = await offline_data_model_1.OfflineData.findOne({
            where: {
                userId,
                entityType,
                entityId,
            },
        });
        if (!existingData) {
            return null;
        }
        const newData = { ...existingData.data, ...updates.data };
        const checksum = this.generateChecksum(newData);
        const version = existingData.version + 1;
        await existingData.update({
            data: newData,
            version,
            lastModified: new Date(),
            syncStatus: 'pending',
            checksum,
            metadata: { ...existingData.metadata, ...updates.metadata },
            expiresAt: updates.expiresAt || existingData.expiresAt,
            priority: updates.priority || existingData.priority,
            tags: updates.tags || existingData.tags,
            updatedAt: new Date(),
        });
        // Update cache
        await this.cacheOfflineData(existingData);
        // Create version record
        await data_versioning_service_1.DataVersioningService.createVersion({
            entityType,
            entityId,
            data: newData,
            userId,
            operation: 'update',
            metadata: {
                ...updates.metadata,
                offlineUpdate: true,
                updatedAt: new Date(),
            },
        });
        return existingData;
    }
    /**
     * Delete offline data
     */
    static async deleteOfflineData(userId, entityType, entityId) {
        const result = await offline_data_model_1.OfflineData.destroy({
            where: {
                userId,
                entityType,
                entityId,
            },
        });
        if (result > 0) {
            // Remove from cache
            const cacheKey = `${this.OFFLINE_DATA_KEY_PREFIX}${userId}:${entityType}:${entityId}`;
            await database_1.redis.del(cacheKey);
        }
        return result > 0;
    }
    /**
     * Sync offline data with server
     */
    static async syncOfflineData(userId, entityTypes) {
        const whereClause = {
            userId,
            syncStatus: ['pending', 'error'],
        };
        if (entityTypes) {
            whereClause.entityType = entityTypes;
        }
        const offlineItems = await offline_data_model_1.OfflineData.findAll({
            where: whereClause,
            order: [
                ['priority', 'DESC'],
                ['lastModified', 'ASC'],
            ],
            limit: this.SYNC_BATCH_SIZE,
        });
        let synced = 0;
        let conflicts = 0;
        let errors = 0;
        let skipped = 0;
        for (const item of offlineItems) {
            try {
                await item.update({ syncStatus: 'syncing' });
                const syncResult = await this.syncSingleItem(item);
                switch (syncResult) {
                    case 'synced':
                        await item.update({ syncStatus: 'synced' });
                        synced++;
                        break;
                    case 'conflict':
                        await item.update({ syncStatus: 'conflict' });
                        conflicts++;
                        break;
                    case 'error':
                        await item.update({ syncStatus: 'error' });
                        errors++;
                        break;
                    case 'skipped':
                        skipped++;
                        break;
                }
            }
            catch (error) {
                console.error(`Failed to sync item ${item.id}:`, error);
                await item.update({ syncStatus: 'error' });
                errors++;
            }
        }
        return { synced, conflicts, errors, skipped };
    }
    /**
     * Sync a single offline data item
     */
    static async syncSingleItem(item) {
        // Check if data is expired
        if (item.isExpired) {
            return 'skipped';
        }
        // Get latest server version
        const serverVersion = await data_versioning_service_1.DataVersioningService.getLatestVersion(item.entityType, item.entityId);
        // If server version is newer, check for conflicts
        if (serverVersion > item.version) {
            const conflictDetected = await sync_conflict_service_1.SyncConflictService.detectConflict(item.userId, item.entityType, item.entityId, item.version, serverVersion, item.data, null, // We don't have server data here
            'update');
            if (conflictDetected) {
                return 'conflict';
            }
        }
        // Create new version on server
        await data_versioning_service_1.DataVersioningService.createVersion({
            entityType: item.entityType,
            entityId: item.entityId,
            data: item.data,
            userId: item.userId,
            operation: 'update',
            metadata: {
                ...item.metadata,
                offlineSync: true,
                syncedAt: new Date(),
            },
        });
        return 'synced';
    }
    /**
     * Get offline data statistics
     */
    static async getOfflineDataStats(userId) {
        const [totalResult, byEntityTypeResult, byStatusResult, expiredResult, needsSyncResult] = await Promise.all([
            offline_data_model_1.OfflineData.count({ where: { userId } }),
            offline_data_model_1.OfflineData.findAll({
                where: { userId },
                attributes: [
                    'entityType',
                    [require('sequelize').fn('COUNT', require('sequelize').col('entityType')), 'count'],
                ],
                group: ['entityType'],
                raw: true,
            }),
            offline_data_model_1.OfflineData.findAll({
                where: { userId },
                attributes: [
                    'syncStatus',
                    [require('sequelize').fn('COUNT', require('sequelize').col('syncStatus')), 'count'],
                ],
                group: ['syncStatus'],
                raw: true,
            }),
            offline_data_model_1.OfflineData.count({
                where: {
                    userId,
                    expiresAt: { [require('sequelize').Op.lt]: new Date() },
                },
            }),
            offline_data_model_1.OfflineData.count({
                where: {
                    userId,
                    syncStatus: ['pending', 'conflict', 'error'],
                },
            }),
        ]);
        const byEntityType = {};
        byEntityTypeResult.forEach((row) => {
            byEntityType[row.entityType] = parseInt(row.count);
        });
        const bySyncStatus = {};
        byStatusResult.forEach((row) => {
            bySyncStatus[row.syncStatus] = parseInt(row.count);
        });
        return {
            totalItems: totalResult,
            byEntityType,
            bySyncStatus,
            expiredItems: expiredResult,
            needsSync: needsSyncResult,
        };
    }
    /**
     * Clean up expired offline data
     */
    static async cleanupExpiredData(userId) {
        const whereClause = {
            expiresAt: { [require('sequelize').Op.lt]: new Date() },
        };
        if (userId) {
            whereClause.userId = userId;
        }
        const result = await offline_data_model_1.OfflineData.destroy({ where: whereClause });
        return result;
    }
    /**
     * Bulk store offline data
     */
    static async bulkStoreOfflineData(userId, entities) {
        const storedItems = [];
        for (const entity of entities) {
            try {
                const stored = await this.storeOfflineData(userId, entity);
                storedItems.push(stored);
            }
            catch (error) {
                console.error(`Failed to store offline data for ${entity.entityType}:${entity.entityId}:`, error);
            }
        }
        return storedItems;
    }
    /**
     * Get offline data by tags
     */
    static async getOfflineDataByTags(userId, tags, entityType) {
        const whereClause = {
            userId,
            tags: { [require('sequelize').Op.overlap]: tags },
        };
        if (entityType) {
            whereClause.entityType = entityType;
        }
        return offline_data_model_1.OfflineData.findAll({
            where: whereClause,
            order: [['lastModified', 'DESC']],
        });
    }
    /**
     * Cache offline data
     */
    static async cacheOfflineData(data) {
        const cacheKey = `${this.OFFLINE_DATA_KEY_PREFIX}${data.userId}:${data.entityType}:${data.entityId}`;
        const ttl = data.expiresAt
            ? Math.max(0, Math.floor((data.expiresAt.getTime() - Date.now()) / 1000))
            : 3600; // 1 hour default
        await database_1.redis.setex(cacheKey, ttl, JSON.stringify(data.toJSON()));
    }
    /**
     * Generate checksum for data integrity
     */
    static generateChecksum(data) {
        const dataString = JSON.stringify(data, Object.keys(data).sort());
        return crypto_1.default.createHash('sha256').update(dataString).digest('hex');
    }
    /**
     * Validate offline data integrity
     */
    static async validateDataIntegrity(userId, entityType, entityId) {
        const data = await offline_data_model_1.OfflineData.findOne({
            where: { userId, entityType, entityId },
        });
        if (!data)
            return false;
        const expectedChecksum = this.generateChecksum(data.data);
        return expectedChecksum === data.checksum;
    }
    /**
     * Export offline data for backup
     */
    static async exportOfflineData(userId, entityTypes) {
        const whereClause = { userId };
        if (entityTypes) {
            whereClause.entityType = entityTypes;
        }
        const data = await offline_data_model_1.OfflineData.findAll({
            where: whereClause,
            order: [['entityType', 'ASC'], ['lastModified', 'DESC']],
        });
        return data.map(item => ({
            entityType: item.entityType,
            entityId: item.entityId,
            data: item.data,
            version: item.version,
            lastModified: item.lastModified,
            metadata: item.metadata,
            tags: item.tags,
        }));
    }
    /**
     * Import offline data from backup
     */
    static async importOfflineData(userId, data) {
        let imported = 0;
        for (const item of data) {
            try {
                await this.storeOfflineData(userId, {
                    entityType: item.entityType,
                    entityId: item.entityId,
                    data: item.data,
                    metadata: {
                        ...item.metadata,
                        imported: true,
                        importDate: new Date(),
                    },
                    tags: item.tags,
                });
                imported++;
            }
            catch (error) {
                console.error(`Failed to import offline data for ${item.entityType}:${item.entityId}:`, error);
            }
        }
        return imported;
    }
}
exports.OfflineDataService = OfflineDataService;
OfflineDataService.OFFLINE_DATA_KEY_PREFIX = 'offline_data:';
OfflineDataService.SYNC_BATCH_SIZE = 50;
exports.default = OfflineDataService;
