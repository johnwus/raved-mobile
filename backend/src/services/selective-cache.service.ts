import CacheService from './cache.service';
import { redis } from '../config/database';

export interface CacheStrategy {
  key: string;
  ttl: number;
  priority: 'high' | 'medium' | 'low';
  dependencies?: string[];
  invalidationRules?: {
    onEntityChange?: string[];
    onTimeBased?: number;
    onAccessPattern?: 'lru' | 'lfu';
  };
}

export interface CachePolicy {
  entityType: string;
  cacheable: boolean;
  strategies: CacheStrategy[];
  fallbackStrategy?: 'network_first' | 'cache_first' | 'stale_while_revalidate';
}

export class SelectiveCacheService {
  private static policies = new Map<string, CachePolicy>();
  private static readonly CACHE_HITS_KEY = 'cache_hits';
  private static readonly CACHE_MISSES_KEY = 'cache_misses';

  /**
   * Register a cache policy for an entity type
   */
  static registerPolicy(policy: CachePolicy): void {
    this.policies.set(policy.entityType, policy);
  }

  /**
   * Get cached data with selective caching strategy
   */
  static async get<T = any>(
    entityType: string,
    entityId: string,
    fetcher: () => Promise<T>,
    context?: {
      userId?: string;
      priority?: 'high' | 'medium' | 'low';
      accessPattern?: 'read_heavy' | 'write_heavy' | 'balanced';
    }
  ): Promise<T> {
    const policy = this.policies.get(entityType);

    if (!policy?.cacheable) {
      // No caching policy, fetch directly
      return fetcher();
    }

    // Determine best strategy based on context
    const strategy = this.selectStrategy(policy, context);

    if (!strategy) {
      return fetcher();
    }

    const cacheKey = this.buildCacheKey(entityType, entityId, strategy.key, context);

    // Try cache first
    const cached = await CacheService.get<T>(cacheKey, { ttl: strategy.ttl });

    if (cached !== null) {
      // Cache hit
      await this.recordCacheHit(entityType);
      return cached;
    }

    // Cache miss - fetch and cache
    await this.recordCacheMiss(entityType);

    const data = await fetcher();

    // Apply selective caching based on data characteristics
    if (this.shouldCache(data, strategy, context)) {
      await CacheService.set(cacheKey, data, {
        ttl: strategy.ttl,
        keyPrefix: `selective:${entityType}:`,
      });

      // Set up dependency tracking
      if (strategy.dependencies) {
        await this.trackDependencies(cacheKey, strategy.dependencies, entityId);
      }
    }

    return data;
  }

  /**
   * Invalidate cache for an entity
   */
  static async invalidate(
    entityType: string,
    entityId: string,
    cascade: boolean = true
  ): Promise<void> {
    const policy = this.policies.get(entityType);

    if (!policy) return;

    // Invalidate all strategies for this entity
    for (const strategy of policy.strategies) {
      const cacheKey = this.buildCacheKey(entityType, entityId, strategy.key);
      await CacheService.delete(cacheKey, { keyPrefix: `selective:${entityType}:` });
    }

    // Cascade invalidation if requested
    if (cascade) {
      await this.invalidateDependencies(entityType, entityId);
    }
  }

  /**
   * Bulk invalidate by entity type
   */
  static async invalidateByType(
    entityType: string,
    entityIds?: string[]
  ): Promise<void> {
    const pattern = entityIds
      ? entityIds.map(id => `selective:${entityType}:*:${id}:*`).join(' ')
      : `selective:${entityType}:*`;

    await CacheService.invalidatePattern(pattern);
  }

  /**
   * Warm up cache for frequently accessed entities
   */
  static async warmCache(
    entityType: string,
    entityIds: string[],
    fetcher: (id: string) => Promise<any>
  ): Promise<void> {
    const policy = this.policies.get(entityType);

    if (!policy?.cacheable) return;

    const entries = entityIds.map(entityId => ({
      key: this.buildCacheKey(entityType, entityId, 'default'),
      fetcher: () => fetcher(entityId),
      options: {
        keyPrefix: `selective:${entityType}:`,
        ttl: policy.strategies[0]?.ttl || 3600,
      },
    }));

    await CacheService.warmCache(entries);
  }

  /**
   * Get cache performance metrics
   */
  static async getCacheMetrics(): Promise<{
    hitRate: number;
    totalRequests: number;
    hits: number;
    misses: number;
    byEntityType: Record<string, { hits: number; misses: number; hitRate: number }>;
  }> {
    try {
      const [hits, misses] = await Promise.all([
        redis.get(this.CACHE_HITS_KEY),
        redis.get(this.CACHE_MISSES_KEY),
      ]);

      const totalHits = parseInt(hits || '0');
      const totalMisses = parseInt(misses || '0');
      const totalRequests = totalHits + totalMisses;
      const hitRate = totalRequests > 0 ? (totalHits / totalRequests) * 100 : 0;

      // Get metrics by entity type
      const byEntityType: Record<string, { hits: number; misses: number; hitRate: number }> = {};

      for (const entityType of this.policies.keys()) {
        const [entityHits, entityMisses] = await Promise.all([
          redis.get(`${this.CACHE_HITS_KEY}:${entityType}`),
          redis.get(`${this.CACHE_MISSES_KEY}:${entityType}`),
        ]);

        const eHits = parseInt(entityHits || '0');
        const eMisses = parseInt(entityMisses || '0');
        const eTotal = eHits + eMisses;
        const eHitRate = eTotal > 0 ? (eHits / eTotal) * 100 : 0;

        byEntityType[entityType] = {
          hits: eHits,
          misses: eMisses,
          hitRate: eHitRate,
        };
      }

      return {
        hitRate,
        totalRequests,
        hits: totalHits,
        misses: totalMisses,
        byEntityType,
      };
    } catch (error) {
      console.error('Error getting cache metrics:', error);
      return {
        hitRate: 0,
        totalRequests: 0,
        hits: 0,
        misses: 0,
        byEntityType: {},
      };
    }
  }

  /**
   * Optimize cache based on access patterns
   */
  static async optimizeCache(): Promise<void> {
    const metrics = await this.getCacheMetrics();

    // Identify low-performing caches
    const lowPerformingEntities = Object.entries(metrics.byEntityType)
      .filter(([, stats]) => stats.hitRate < 30 && (stats.hits + stats.misses) > 100)
      .map(([entityType]) => entityType);

    // Adjust TTL for low-performing entities
    for (const entityType of lowPerformingEntities) {
      const policy = this.policies.get(entityType);
      if (policy) {
        // Reduce TTL for low-performing caches
        policy.strategies.forEach(strategy => {
          strategy.ttl = Math.max(strategy.ttl * 0.7, 60); // Minimum 1 minute
        });
      }
    }

    // Identify high-performing caches
    const highPerformingEntities = Object.entries(metrics.byEntityType)
      .filter(([, stats]) => stats.hitRate > 80 && (stats.hits + stats.misses) > 1000)
      .map(([entityType]) => entityType);

    // Increase TTL for high-performing caches
    for (const entityType of highPerformingEntities) {
      const policy = this.policies.get(entityType);
      if (policy) {
        policy.strategies.forEach(strategy => {
          strategy.ttl = Math.min(strategy.ttl * 1.5, 86400); // Maximum 24 hours
        });
      }
    }
  }

  /**
   * Select the best caching strategy based on context
   */
  private static selectStrategy(
    policy: CachePolicy,
    context?: { priority?: 'high' | 'medium' | 'low'; accessPattern?: string }
  ): CacheStrategy | null {
    if (policy.strategies.length === 0) return null;

    // Priority-based selection
    if (context?.priority) {
      const priorityStrategy = policy.strategies.find(s => s.priority === context.priority);
      if (priorityStrategy) return priorityStrategy;
    }

    // Access pattern-based selection
    if (context?.accessPattern === 'read_heavy') {
      return policy.strategies.find(s => s.priority === 'high') || policy.strategies[0];
    }

    // Default to first strategy
    return policy.strategies[0];
  }

  /**
   * Determine if data should be cached based on various factors
   */
  private static shouldCache(
    data: any,
    strategy: CacheStrategy,
    context?: { priority?: string; accessPattern?: string }
  ): boolean {
    // Don't cache null, undefined, or empty data
    if (data == null) return false;

    // Don't cache errors
    if (data instanceof Error) return false;

    // Size-based filtering (don't cache very large objects)
    const dataSize = JSON.stringify(data).length;
    if (dataSize > 1024 * 1024) return false; // 1MB limit

    // Context-based filtering
    if (context?.priority === 'low' && strategy.priority === 'high') {
      return false; // Don't cache low priority data in high priority slots
    }

    return true;
  }

  /**
   * Build cache keys with context
   */
  private static buildCacheKey(
    entityType: string,
    entityId: string,
    strategyKey: string,
    context?: { userId?: string }
  ): string {
    const parts = [entityType, entityId, strategyKey];

    if (context?.userId) {
      parts.push(`user_${context.userId}`);
    }

    return parts.join(':');
  }

  /**
   * Track cache dependencies
   */
  private static async trackDependencies(
    cacheKey: string,
    dependencies: string[],
    entityId: string
  ): Promise<void> {
    const dependencyKey = `deps:${cacheKey}`;

    try {
      // Store reverse dependencies (what depends on what)
      for (const dep of dependencies) {
        const depKey = `rev_deps:${dep}:${entityId}`;
        await redis.sadd(depKey, cacheKey);
        await redis.expire(depKey, 86400); // 24 hours
      }

      // Store forward dependencies
      await redis.sadd(dependencyKey, dependencies);
      await redis.expire(dependencyKey, 86400);
    } catch (error) {
      console.error('Error tracking dependencies:', error);
    }
  }

  /**
   * Invalidate dependent caches
   */
  private static async invalidateDependencies(
    entityType: string,
    entityId: string
  ): Promise<void> {
    try {
      const revDepKey = `rev_deps:${entityType}:${entityId}`;
      const dependentKeys = await redis.smembers(revDepKey);

      if (dependentKeys.length > 0) {
        await redis.del(...dependentKeys.map(key => `selective:${key}`));
        await redis.del(revDepKey);
      }
    } catch (error) {
      console.error('Error invalidating dependencies:', error);
    }
  }

  /**
   * Record cache hit
   */
  private static async recordCacheHit(entityType: string): Promise<void> {
    try {
      await redis.incr(this.CACHE_HITS_KEY);
      await redis.incr(`${this.CACHE_HITS_KEY}:${entityType}`);
    } catch (error) {
      console.error('Error recording cache hit:', error);
    }
  }

  /**
   * Record cache miss
   */
  private static async recordCacheMiss(entityType: string): Promise<void> {
    try {
      await redis.incr(this.CACHE_MISSES_KEY);
      await redis.incr(`${this.CACHE_MISSES_KEY}:${entityType}`);
    } catch (error) {
      console.error('Error recording cache miss:', error);
    }
  }

  /**
   * Set up default cache policies for common entities
   */
  static setupDefaultPolicies(): void {
    // User profile caching
    this.registerPolicy({
      entityType: 'user',
      cacheable: true,
      strategies: [
        {
          key: 'profile',
          ttl: 1800, // 30 minutes
          priority: 'high',
          invalidationRules: {
            onEntityChange: ['user'],
          },
        },
        {
          key: 'stats',
          ttl: 300, // 5 minutes
          priority: 'medium',
        },
      ],
      fallbackStrategy: 'cache_first',
    });

    // Posts caching
    this.registerPolicy({
      entityType: 'post',
      cacheable: true,
      strategies: [
        {
          key: 'content',
          ttl: 600, // 10 minutes
          priority: 'high',
          invalidationRules: {
            onEntityChange: ['post', 'comment', 'like'],
          },
        },
        {
          key: 'feed',
          ttl: 300, // 5 minutes
          priority: 'medium',
        },
      ],
      fallbackStrategy: 'stale_while_revalidate',
    });

    // Events caching
    this.registerPolicy({
      entityType: 'event',
      cacheable: true,
      strategies: [
        {
          key: 'details',
          ttl: 3600, // 1 hour
          priority: 'high',
          invalidationRules: {
            onEntityChange: ['event', 'event_attendee'],
          },
        },
        {
          key: 'list',
          ttl: 600, // 10 minutes
          priority: 'medium',
        },
      ],
      fallbackStrategy: 'cache_first',
    });

    // Store items caching
    this.registerPolicy({
      entityType: 'store_item',
      cacheable: true,
      strategies: [
        {
          key: 'details',
          ttl: 1800, // 30 minutes
          priority: 'high',
          invalidationRules: {
            onEntityChange: ['store_item', 'order'],
          },
        },
        {
          key: 'search',
          ttl: 300, // 5 minutes
          priority: 'medium',
        },
      ],
      fallbackStrategy: 'network_first',
    });
  }
}

export default SelectiveCacheService;