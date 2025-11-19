import { redis } from '../config/database';
import { CONFIG } from '../config';

export interface CacheOptions {
  ttl?: number; // Time to live in seconds
  keyPrefix?: string;
  compress?: boolean;
}

export interface CacheEntry<T = any> {
  data: T;
  timestamp: number;
  ttl: number;
  version: string;
}

export class CacheService {
  private static readonly DEFAULT_TTL = CONFIG.CACHE_TTL || 3600; // 1 hour
  private static readonly VERSION_KEY = 'cache_version';

  /**
   * Get data from cache
   */
  static async get<T = any>(
    key: string,
    options: CacheOptions = {}
  ): Promise<T | null> {
    try {
      const fullKey = this.buildKey(key, options.keyPrefix);
      const cached = await redis.get(fullKey);

      if (!cached) {
        return null;
      }

      const entry: CacheEntry<T> = JSON.parse(cached);

      // Check if entry has expired
      if (Date.now() > entry.timestamp + (entry.ttl * 1000)) {
        await this.delete(key, options);
        return null;
      }

      // Check version for cache invalidation
      const currentVersion = await this.getCacheVersion();
      if (entry.version !== currentVersion) {
        await this.delete(key, options);
        return null;
      }

      return entry.data;
    } catch (error) {
      console.error('Cache get error:', error);
      return null;
    }
  }

  /**
   * Set data in cache
   */
  static async set<T = any>(
    key: string,
    data: T,
    options: CacheOptions = {}
  ): Promise<void> {
    try {
      const fullKey = this.buildKey(key, options.keyPrefix);
      const ttl = options.ttl || this.DEFAULT_TTL;
      const version = await this.getCacheVersion();

      const entry: CacheEntry<T> = {
        data,
        timestamp: Date.now(),
        ttl,
        version,
      };

      const serialized = JSON.stringify(entry);

      if (options.compress && serialized.length > 1024) {
        // Implement compression for large data
        await redis.setex(fullKey, ttl, serialized);
      } else {
        await redis.setex(fullKey, ttl, serialized);
      }
    } catch (error) {
      console.error('Cache set error:', error);
    }
  }

  /**
   * Delete data from cache
   */
  static async delete(
    key: string,
    options: CacheOptions = {}
  ): Promise<void> {
    try {
      const fullKey = this.buildKey(key, options.keyPrefix);
      await redis.del(fullKey);
    } catch (error) {
      console.error('Cache delete error:', error);
    }
  }

  /**
   * Check if keys exists in cache
   */
  static async exists(
    key: string,
    options: CacheOptions = {}
  ): Promise<boolean> {
    try {
      const fullKey = this.buildKey(key, options.keyPrefix);
      const result = await redis.exists(fullKey);
      return result === 1;
    } catch (error) {
      console.error('Cache exists error:', error);
      return false;
    }
  }

  /**
   * Get multiple keys at once
   */
  static async mget<T = any>(
    keys: string[],
    options: CacheOptions = {}
  ): Promise<(T | null)[]> {
    try {
      const fullKeys = keys.map(key => this.buildKey(key, options.keyPrefix));
      const results = await redis.mget(...fullKeys);

      return await Promise.all(results.map(async (result) => {
        if (!result) return null;

        try {
          const entry: CacheEntry<T> = JSON.parse(result);

          // Check expiration and version
          if (Date.now() > entry.timestamp + (entry.ttl * 1000)) {
            return null;
          }

          const currentVersion = await this.getCacheVersion();
          if (entry.version !== currentVersion) {
            return null;
          }

          return entry.data;
        } catch {
          return null;
        }
      }));
    } catch (error) {
      console.error('Cache mget error:', error);
      return new Array(keys.length).fill(null);
    }
  }

  /**
   * Set multiple keys at once
   */
  static async mset(
    entries: Array<{ key: string; data: any; options?: CacheOptions }>,
    globalOptions: CacheOptions = {}
  ): Promise<void> {
    try {
      const version = await this.getCacheVersion();
      const pipeline = redis.multi();

      for (const entry of entries) {
        const fullKey = this.buildKey(entry.key, entry.options?.keyPrefix || globalOptions.keyPrefix);
        const ttl = entry.options?.ttl || globalOptions.ttl || this.DEFAULT_TTL;

        const cacheEntry: CacheEntry = {
          data: entry.data,
          timestamp: Date.now(),
          ttl,
          version,
        };

        pipeline.setex(fullKey, ttl, JSON.stringify(cacheEntry));
      }

      await pipeline.exec();
    } catch (error) {
      console.error('Cache mset error:', error);
    }
  }

  /**
   * Clear all cache entries with a prefix
   */
  static async clearByPrefix(prefix: string): Promise<void> {
    try {
      const pattern = `${CONFIG.REDIS_CACHE_PREFIX || 'raved:'}${prefix}*`;
      const keys = await redis.keys(pattern);

      if (keys.length > 0) {
        await redis.del(...keys);
      }
    } catch (error) {
      console.error('Cache clear by prefix error:', error);
    }
  }

  /**
   * Get cache statistics
   */
  static async getStats(): Promise<{
    totalKeys: number;
    memoryUsage: number;
    hitRate?: number;
  }> {
    try {
      const info = await redis.info('memory');
      const memoryMatch = info.match(/used_memory:(\d+)/);
      const memoryUsage = memoryMatch ? parseInt(memoryMatch[1]) : 0;

      // Get total keys (approximate)
      const keys = await redis.keys(`${CONFIG.REDIS_CACHE_PREFIX || 'raved:'}*`);
      const totalKeys = keys.length;

      return {
        totalKeys,
        memoryUsage,
      };
    } catch (error) {
      console.error('Cache stats error:', error);
      return {
        totalKeys: 0,
        memoryUsage: 0,
      };
    }
  }

  /**
   * Invalidate cache by pattern
   */
  static async invalidatePattern(pattern: string): Promise<void> {
    try {
      const fullPattern = `${CONFIG.REDIS_CACHE_PREFIX || 'raved:'}${pattern}`;
      const keys = await redis.keys(fullPattern);

      if (keys.length > 0) {
        await redis.del(...keys);
      }
    } catch (error) {
      console.error('Cache invalidate pattern error:', error);
    }
  }

  /**
   * Get or set cache with a function
   */
  static async getOrSet<T = any>(
    key: string,
    fetcher: () => Promise<T>,
    options: CacheOptions = {}
  ): Promise<T> {
    // Try to get from cache first
    const cached = await this.get<T>(key, options);
    if (cached !== null) {
      return cached;
    }

    // Fetch fresh data
    const data = await fetcher();

    // Cache the result
    await this.set(key, data, options);

    return data;
  }

  /**
   * Set cache version for invalidation
   */
  static async invalidateAll(): Promise<void> {
    try {
      const newVersion = Date.now().toString();
      await redis.set(this.VERSION_KEY, newVersion);
    } catch (error) {
      console.error('Cache invalidate all error:', error);
    }
  }

  /**
   * Get current cache version
   */
  private static async getCacheVersion(): Promise<string> {
    try {
      const version = await redis.get(this.VERSION_KEY);
      return version || '1';
    } catch (error) {
      console.error('Cache version error:', error);
      return '1';
    }
  }

  /**
   * Build full cache keys with prefix
   */
  private static buildKey(key: string, prefix?: string): string {
    const fullPrefix = prefix || CONFIG.REDIS_CACHE_PREFIX || 'raved:';
    return `${fullPrefix}${key}`;
  }

  /**
   * Set up cache warming for frequently accessed data
   */
  static async warmCache(
    entries: Array<{ key: string; fetcher: () => Promise<any>; options?: CacheOptions }>
  ): Promise<void> {
    try {
      const promises = entries.map(async ({ key, fetcher, options }) => {
        const data = await fetcher();
        await this.set(key, data, options);
      });

      await Promise.allSettled(promises);
    } catch (error) {
      console.error('Cache warming error:', error);
    }
  }

  /**
   * Get cache TTL for a keys
   */
  static async getTTL(
    key: string,
    options: CacheOptions = {}
  ): Promise<number> {
    try {
      const fullKey = this.buildKey(key, options.keyPrefix);
      const ttl = await redis.ttl(fullKey);
      return ttl;
    } catch (error) {
      console.error('Cache TTL error:', error);
      return -1;
    }
  }

  /**
   * Extend TTL for a keys
   */
  static async extendTTL(
    key: string,
    additionalSeconds: number,
    options: CacheOptions = {}
  ): Promise<void> {
    try {
      const fullKey = this.buildKey(key, options.keyPrefix);
      const currentTTL = await redis.ttl(fullKey);

      if (currentTTL > 0) {
        await redis.expire(fullKey, currentTTL + additionalSeconds);
      }
    } catch (error) {
      console.error('Cache extend TTL error:', error);
    }
  }
}

export default CacheService;