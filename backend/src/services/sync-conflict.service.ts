import { v4 as uuidv4 } from 'uuid';
import { SyncConflict, SyncConflictAttributes } from '../models/postgres/sync-conflict.model';
import { DataVersion } from '../models/postgres/data-version.model';
import { redis } from '../config/database';
import crypto from 'crypto';

export interface ConflictResolution {
  strategy: 'local_wins' | 'server_wins' | 'merge' | 'manual';
  resolvedData?: any;
  resolvedBy: string;
}

export class SyncConflictService {
  private static readonly CONFLICT_KEY_PREFIX = 'sync_conflict:';

  /**
   * Detect and create a sync conflict
   */
  static async detectConflict(
    userId: string,
    entityType: string,
    entityId: string,
    localVersion: number,
    serverVersion: number,
    localData: any,
    serverData: any,
    conflictType: 'create' | 'update' | 'delete' = 'update'
  ): Promise<SyncConflict | null> {
    // Check if versions are different
    if (localVersion === serverVersion) {
      return null; // No conflict
    }

    // Check if conflict already exists
    const existingConflict = await SyncConflict.findOne({
      where: {
        userId,
        entityType,
        entityId,
        resolved: false,
      },
    });

    if (existingConflict) {
      // Update existing conflict with latest data
      await existingConflict.update({
        localVersion,
        serverVersion,
        localData,
        serverData,
        conflictType,
        updatedAt: new Date(),
      });
      return existingConflict;
    }

    // Create new conflict
    const conflictData: SyncConflictAttributes = {
      id: uuidv4(),
      userId,
      entityType,
      entityId,
      localVersion,
      serverVersion,
      localData,
      serverData,
      conflictType,
      resolutionStrategy: 'manual',
      resolved: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const conflict = await SyncConflict.create(conflictData);

    // Cache conflict for quick access
    await this.cacheConflict(conflict);

    return conflict;
  }

  /**
   * Resolve a sync conflict
   */
  static async resolveConflict(
    conflictId: string,
    resolution: ConflictResolution
  ): Promise<SyncConflict> {
    const conflict = await SyncConflict.findByPk(conflictId);

    if (!conflict) {
      throw new Error('Conflict not found');
    }

    if (conflict.resolved) {
      throw new Error('Conflict already resolved');
    }

    let resolvedData = resolution.resolvedData;

    // Apply resolution strategy
    switch (resolution.strategy) {
      case 'local_wins':
        resolvedData = conflict.localData;
        break;
      case 'server_wins':
        resolvedData = conflict.serverData;
        break;
      case 'merge':
        resolvedData = this.mergeData(conflict.localData, conflict.serverData);
        break;
      case 'manual':
        if (!resolvedData) {
          throw new Error('Manual resolution requires resolvedData');
        }
        break;
    }

    // Update conflict
    await conflict.update({
      resolutionStrategy: resolution.strategy,
      resolved: true,
      resolvedAt: new Date(),
      resolvedBy: resolution.resolvedBy,
      updatedAt: new Date(),
    });

    // Create new version record
    await this.createVersionRecord(conflict, resolvedData, resolution.resolvedBy);

    // Remove from cache
    await this.removeCachedConflict(conflictId);

    return conflict;
  }

  /**
   * Auto-resolve conflicts based on predefined rules
   */
  static async autoResolveConflicts(
    userId: string,
    entityType: string,
    rules?: {
      defaultStrategy: 'local_wins' | 'server_wins' | 'merge';
      fieldPriorities?: Record<string, 'local' | 'server'>;
    }
  ): Promise<number> {
    const conflicts = await SyncConflict.findAll({
      where: {
        userId,
        entityType,
        resolved: false,
      },
    });

    let resolvedCount = 0;

    for (const conflict of conflicts) {
      try {
        let strategy = rules?.defaultStrategy || 'server_wins';
        let resolvedData = conflict.serverData;

        if (strategy === 'merge' && rules?.fieldPriorities) {
          resolvedData = this.mergeDataWithPriorities(
            conflict.localData,
            conflict.serverData,
            rules.fieldPriorities
          );
        } else if (strategy === 'local_wins') {
          resolvedData = conflict.localData;
        }

        await this.resolveConflict(conflict.id, {
          strategy,
          resolvedData,
          resolvedBy: 'auto-resolver',
        });

        resolvedCount++;
      } catch (error) {
        console.error(`Failed to auto-resolve conflict ${conflict.id}:`, error);
      }
    }

    return resolvedCount;
  }

  /**
   * Get unresolved conflicts for a user
   */
  static async getUnresolvedConflicts(
    userId: string,
    entityType?: string,
    limit: number = 50,
    offset: number = 0
  ): Promise<SyncConflict[]> {
    const whereClause: any = {
      userId,
      resolved: false,
    };

    if (entityType) {
      whereClause.entityType = entityType;
    }

    return SyncConflict.findAll({
      where: whereClause,
      order: [['createdAt', 'DESC']],
      limit,
      offset,
    });
  }

  /**
   * Get conflict statistics
   */
  static async getConflictStats(userId: string): Promise<{
    total: number;
    resolved: number;
    unresolved: number;
    byEntityType: Record<string, number>;
    byStrategy: Record<string, number>;
  }> {
    const [total, resolved, unresolved] = await Promise.all([
      SyncConflict.count({ where: { userId } }),
      SyncConflict.count({ where: { userId, resolved: true } }),
      SyncConflict.count({ where: { userId, resolved: false } }),
    ]);

    const byEntityType = await SyncConflict.findAll({
      where: { userId },
      attributes: [
        'entityType',
        [require('sequelize').fn('COUNT', require('sequelize').col('entityType')), 'count'],
      ],
      group: ['entityType'],
      raw: true,
    });

    const byStrategy = await SyncConflict.findAll({
      where: { userId, resolved: true },
      attributes: [
        'resolutionStrategy',
        [require('sequelize').fn('COUNT', require('sequelize').col('resolutionStrategy')), 'count'],
      ],
      group: ['resolutionStrategy'],
      raw: true,
    });

    const entityTypeStats: Record<string, number> = {};
    byEntityType.forEach((stat: any) => {
      entityTypeStats[stat.entityType] = parseInt(stat.count);
    });

    const strategyStats: Record<string, number> = {};
    byStrategy.forEach((stat: any) => {
      strategyStats[stat.resolutionStrategy] = parseInt(stat.count);
    });

    return {
      total,
      resolved,
      unresolved,
      byEntityType: entityTypeStats,
      byStrategy: strategyStats,
    };
  }

  /**
   * Merge data from local and server versions
   */
  private static mergeData(localData: any, serverData: any): any {
    if (!localData || !serverData) {
      return localData || serverData;
    }

    if (typeof localData !== 'object' || typeof serverData !== 'object') {
      // For primitive values, prefer server data
      return serverData;
    }

    const merged = { ...serverData };

    // Merge local data, preferring local for conflicts
    for (const key in localData) {
      if (!(key in serverData)) {
        merged[key] = localData[key];
      } else if (this.isObject(localData[key]) && this.isObject(serverData[key])) {
        merged[key] = this.mergeData(localData[key], serverData[key]);
      }
      // Keep server value for primitive conflicts
    }

    return merged;
  }

  /**
   * Merge data with field-level priorities
   */
  private static mergeDataWithPriorities(
    localData: any,
    serverData: any,
    priorities: Record<string, 'local' | 'server'>
  ): any {
    const merged = { ...serverData };

    for (const key in localData) {
      const priority = priorities[key];
      if (priority === 'local') {
        merged[key] = localData[key];
      } else if (priority === 'server') {
        // Keep server value (already in merged)
      } else if (this.isObject(localData[key]) && this.isObject(serverData[key])) {
        merged[key] = this.mergeDataWithPriorities(
          localData[key],
          serverData[key],
          priorities
        );
      }
    }

    return merged;
  }

  /**
   * Create a version record after conflict resolution
   */
  private static async createVersionRecord(
    conflict: SyncConflict,
    resolvedData: any,
    resolvedBy: string
  ): Promise<void> {
    const checksum = this.generateChecksum(resolvedData);

    await DataVersion.create({
      id: uuidv4(),
      entityType: conflict.entityType,
      entityId: conflict.entityId,
      version: Math.max(conflict.localVersion, conflict.serverVersion) + 1,
      userId: conflict.userId,
      operation: 'update', // Conflict resolution is always an update
      data: resolvedData,
      checksum,
      createdAt: new Date(),
      updatedAt: new Date(),
      metadata: {
        resolvedConflictId: conflict.id,
        resolvedBy,
        resolutionStrategy: conflict.resolutionStrategy,
      },
    });
  }

  /**
   * Cache conflict for quick access
   */
  private static async cacheConflict(conflict: SyncConflict): Promise<void> {
    const cacheKey = `${this.CONFLICT_KEY_PREFIX}${conflict.userId}:${conflict.entityType}:${conflict.entityId}`;
    await redis.setex(cacheKey, 3600, JSON.stringify(conflict.toJSON())); // 1 hour
  }

  /**
   * Remove cached conflict
   */
  private static async removeCachedConflict(conflictId: string): Promise<void> {
    // Find and remove from cache
    const conflict = await SyncConflict.findByPk(conflictId);
    if (conflict) {
      const cacheKey = `${this.CONFLICT_KEY_PREFIX}${conflict.userId}:${conflict.entityType}:${conflict.entityId}`;
      await redis.del(cacheKey);
    }
  }

  /**
   * Generate checksum for data integrity
   */
  private static generateChecksum(data: any): string {
    const dataString = JSON.stringify(data, Object.keys(data).sort());
    return crypto.createHash('sha256').update(dataString).digest('hex');
  }

  /**
   * Check if value is an object
   */
  private static isObject(value: any): boolean {
    return value !== null && typeof value === 'object' && !Array.isArray(value);
  }

  /**
   * Clean up old resolved conflicts
   */
  static async cleanupResolvedConflicts(daysOld: number = 30): Promise<number> {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysOld);

    const result = await SyncConflict.destroy({
      where: {
        resolved: true,
        resolvedAt: { [require('sequelize').Op.lt]: cutoffDate },
      },
    });

    return result;
  }
}

export default SyncConflictService;