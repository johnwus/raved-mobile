"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CacheService = void 0;
const database_1 = require("../config/database");
const config_1 = require("../config");
class CacheService {
    /**
     * Get data from cache
     */
    static async get(key, options = {}) {
        try {
            const fullKey = this.buildKey(key, options.keyPrefix);
            const cached = await database_1.redis.get(fullKey);
            if (!cached) {
                return null;
            }
            const entry = JSON.parse(cached);
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
        }
        catch (error) {
            console.error('Cache get error:', error);
            return null;
        }
    }
    /**
     * Set data in cache
     */
    static async set(key, data, options = {}) {
        try {
            const fullKey = this.buildKey(key, options.keyPrefix);
            const ttl = options.ttl || this.DEFAULT_TTL;
            const version = await this.getCacheVersion();
            const entry = {
                data,
                timestamp: Date.now(),
                ttl,
                version,
            };
            const serialized = JSON.stringify(entry);
            if (options.compress && serialized.length > 1024) {
                // Implement compression for large data
                await database_1.redis.setex(fullKey, ttl, serialized);
            }
            else {
                await database_1.redis.setex(fullKey, ttl, serialized);
            }
        }
        catch (error) {
            console.error('Cache set error:', error);
        }
    }
    /**
     * Delete data from cache
     */
    static async delete(key, options = {}) {
        try {
            const fullKey = this.buildKey(key, options.keyPrefix);
            await database_1.redis.del(fullKey);
        }
        catch (error) {
            console.error('Cache delete error:', error);
        }
    }
    /**
     * Check if key exists in cache
     */
    static async exists(key, options = {}) {
        try {
            const fullKey = this.buildKey(key, options.keyPrefix);
            const result = await database_1.redis.exists(fullKey);
            return result === 1;
        }
        catch (error) {
            console.error('Cache exists error:', error);
            return false;
        }
    }
    /**
     * Get multiple keys at once
     */
    static async mget(keys, options = {}) {
        try {
            const fullKeys = keys.map(key => this.buildKey(key, options.keyPrefix));
            const results = await database_1.redis.mget(...fullKeys);
            return await Promise.all(results.map(async (result) => {
                if (!result)
                    return null;
                try {
                    const entry = JSON.parse(result);
                    // Check expiration and version
                    if (Date.now() > entry.timestamp + (entry.ttl * 1000)) {
                        return null;
                    }
                    const currentVersion = await this.getCacheVersion();
                    if (entry.version !== currentVersion) {
                        return null;
                    }
                    return entry.data;
                }
                catch {
                    return null;
                }
            }));
        }
        catch (error) {
            console.error('Cache mget error:', error);
            return new Array(keys.length).fill(null);
        }
    }
    /**
     * Set multiple keys at once
     */
    static async mset(entries, globalOptions = {}) {
        try {
            const version = await this.getCacheVersion();
            const pipeline = database_1.redis.multi();
            for (const entry of entries) {
                const fullKey = this.buildKey(entry.key, entry.options?.keyPrefix || globalOptions.keyPrefix);
                const ttl = entry.options?.ttl || globalOptions.ttl || this.DEFAULT_TTL;
                const cacheEntry = {
                    data: entry.data,
                    timestamp: Date.now(),
                    ttl,
                    version,
                };
                pipeline.setex(fullKey, ttl, JSON.stringify(cacheEntry));
            }
            await pipeline.exec();
        }
        catch (error) {
            console.error('Cache mset error:', error);
        }
    }
    /**
     * Clear all cache entries with a prefix
     */
    static async clearByPrefix(prefix) {
        try {
            const pattern = `${config_1.CONFIG.REDIS_CACHE_PREFIX || 'raved:'}${prefix}*`;
            const keys = await database_1.redis.keys(pattern);
            if (keys.length > 0) {
                await database_1.redis.del(...keys);
            }
        }
        catch (error) {
            console.error('Cache clear by prefix error:', error);
        }
    }
    /**
     * Get cache statistics
     */
    static async getStats() {
        try {
            const info = await database_1.redis.info('memory');
            const memoryMatch = info.match(/used_memory:(\d+)/);
            const memoryUsage = memoryMatch ? parseInt(memoryMatch[1]) : 0;
            // Get total keys (approximate)
            const keys = await database_1.redis.keys(`${config_1.CONFIG.REDIS_CACHE_PREFIX || 'raved:'}*`);
            const totalKeys = keys.length;
            return {
                totalKeys,
                memoryUsage,
            };
        }
        catch (error) {
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
    static async invalidatePattern(pattern) {
        try {
            const fullPattern = `${config_1.CONFIG.REDIS_CACHE_PREFIX || 'raved:'}${pattern}`;
            const keys = await database_1.redis.keys(fullPattern);
            if (keys.length > 0) {
                await database_1.redis.del(...keys);
            }
        }
        catch (error) {
            console.error('Cache invalidate pattern error:', error);
        }
    }
    /**
     * Get or set cache with a function
     */
    static async getOrSet(key, fetcher, options = {}) {
        // Try to get from cache first
        const cached = await this.get(key, options);
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
    static async invalidateAll() {
        try {
            const newVersion = Date.now().toString();
            await database_1.redis.set(this.VERSION_KEY, newVersion);
        }
        catch (error) {
            console.error('Cache invalidate all error:', error);
        }
    }
    /**
     * Get current cache version
     */
    static async getCacheVersion() {
        try {
            const version = await database_1.redis.get(this.VERSION_KEY);
            return version || '1';
        }
        catch (error) {
            console.error('Cache version error:', error);
            return '1';
        }
    }
    /**
     * Build full cache key with prefix
     */
    static buildKey(key, prefix) {
        const fullPrefix = prefix || config_1.CONFIG.REDIS_CACHE_PREFIX || 'raved:';
        return `${fullPrefix}${key}`;
    }
    /**
     * Set up cache warming for frequently accessed data
     */
    static async warmCache(entries) {
        try {
            const promises = entries.map(async ({ key, fetcher, options }) => {
                const data = await fetcher();
                await this.set(key, data, options);
            });
            await Promise.allSettled(promises);
        }
        catch (error) {
            console.error('Cache warming error:', error);
        }
    }
    /**
     * Get cache TTL for a key
     */
    static async getTTL(key, options = {}) {
        try {
            const fullKey = this.buildKey(key, options.keyPrefix);
            const ttl = await database_1.redis.ttl(fullKey);
            return ttl;
        }
        catch (error) {
            console.error('Cache TTL error:', error);
            return -1;
        }
    }
    /**
     * Extend TTL for a key
     */
    static async extendTTL(key, additionalSeconds, options = {}) {
        try {
            const fullKey = this.buildKey(key, options.keyPrefix);
            const currentTTL = await database_1.redis.ttl(fullKey);
            if (currentTTL > 0) {
                await database_1.redis.expire(fullKey, currentTTL + additionalSeconds);
            }
        }
        catch (error) {
            console.error('Cache extend TTL error:', error);
        }
    }
}
exports.CacheService = CacheService;
CacheService.DEFAULT_TTL = config_1.CONFIG.CACHE_TTL || 3600; // 1 hour
CacheService.VERSION_KEY = 'cache_version';
exports.default = CacheService;
