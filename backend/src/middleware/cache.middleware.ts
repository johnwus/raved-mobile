import { Request, Response, NextFunction } from 'express';
import { redis } from '../config/database';
import { CONFIG } from '../config';

interface CacheOptions {
  ttl?: number;
  key?: string;
  condition?: (req: Request) => boolean;
}

export function cache(options: CacheOptions = {}) {
  return async (req: Request, res: Response, next: NextFunction) => {
    // Skip caching if condition is not met
    if (options.condition && !options.condition(req)) {
      return next();
    }

    // Generate cache key
    const cacheKey = options.key || generateCacheKey(req);
    const fullKey = `${CONFIG.REDIS_CACHE_PREFIX}${cacheKey}`;

    try {
      // Try to get cached response
      const cachedData = await redis.get(fullKey);
      if (cachedData) {
        const parsedData = JSON.parse(cachedData);
        return res.json(parsedData);
      }

      // Store original json method
      const originalJson = res.json;

      // Override json method to cache response
      res.json = function(data: any) {
        // Cache the response
        const ttl = options.ttl || CONFIG.CACHE_TTL;
        redis.setex(fullKey, ttl, JSON.stringify(data));

        // Call original json method
        return originalJson.call(this, data);
      };

      next();
    } catch (error) {
      // If caching fails, continue without caching
      console.warn('Cache middleware error:', error);
      next();
    }
  };
}

export async function clearCache(pattern: string) {
  try {
    const keys = await redis.keys(`${CONFIG.REDIS_CACHE_PREFIX}${pattern}`);
    if (keys.length > 0) {
      await redis.del(keys);
    }
  } catch (error) {
    console.warn('Cache clear error:', error);
  }
}

export function clearCacheOnChange(pattern: string) {
  return (req: Request, res: Response, next: NextFunction) => {
    const originalJson = res.json;
    res.json = function(data: any) {
      // Clear cache after successful response
      if (res.statusCode >= 200 && res.statusCode < 300) {
        clearCache(pattern);
      }
      return originalJson.call(this, data);
    };
    next();
  };
}

function generateCacheKey(req: Request): string {
  // Generate a unique key based on request
  const parts = [
    req.method,
    req.originalUrl,
    req.user?.id || 'anonymous'
  ];

  // Add query parameters if they exist
  if (Object.keys(req.query).length > 0) {
    parts.push(JSON.stringify(req.query));
  }

  return parts.join(':');
}

// Specific cache strategies for different endpoints
export const cacheStrategies = {
  // Cache user profile data for 30 minutes
  userProfile: cache({ ttl: 30 * 60 }),

  // Cache public posts for 5 minutes
  publicPosts: cache({ ttl: 5 * 60 }),

  // Cache store items for 10 minutes
  storeItems: cache({ ttl: 10 * 60 }),

  // Cache events for 15 minutes
  events: cache({ ttl: 15 * 60 }),

  // Cache search results for 2 minutes
  searchResults: cache({ ttl: 2 * 60 }),

  // Only cache for GET requests
  getOnly: cache({
    condition: (req) => req.method === 'GET'
  }),

  // Cache for authenticated users only
  authenticatedOnly: cache({
    condition: (req) => !!req.user
  })
};