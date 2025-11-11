import { RateLimiterRedis } from 'rate-limiter-flexible';
import Redis from 'ioredis';
import { CONFIG } from '../config';
import {
  RateLimitTier,
  RateLimitConfig,
  RateLimitOverride,
  RateLimitAnalytics,
  DEFAULT_RATE_LIMIT_TIERS,
  DEFAULT_ENDPOINT_LIMITS
} from '../types/rate-limit';

export class RateLimiterService {
  private redis: Redis;
  private limiters: Map<string, RateLimiterRedis> = new Map();
  private tierOverrides: Map<string, RateLimitOverride> = new Map();
  private endpointLimits: Map<string, RateLimitConfig> = new Map();

  constructor() {
    this.redis = new Redis(CONFIG.REDIS_URL);
    this.initializeLimiters();
    this.loadEndpointLimits();
  }

  private initializeLimiters(): void {
    // Initialize limiters for each tier
    Object.values(DEFAULT_RATE_LIMIT_TIERS).forEach(tier => {
      const limiter = new RateLimiterRedis({
        storeClient: this.redis,
        keyPrefix: `rate_limit:${tier.name}`,
        points: tier.maxRequests,
        duration: Math.floor(tier.windowMs / 1000), // Convert to seconds
        blockDuration: tier.blockDuration ? Math.floor(tier.blockDuration / 1000) : undefined,
      });
      this.limiters.set(tier.name, limiter);
    });
  }

  private loadEndpointLimits(): void {
    // Load default endpoint limits
    Object.entries(DEFAULT_ENDPOINT_LIMITS).forEach(([endpoint, config]) => {
      this.endpointLimits.set(endpoint, config);
    });
  }

  /**
   * Get rate limiter for a specific tier
   */
  private getLimiter(tier: string): RateLimiterRedis {
    const limiter = this.limiters.get(tier);
    if (!limiter) {
      throw new Error(`Rate limiter for tier '${tier}' not found`);
    }
    return limiter;
  }

  /**
   * Get user's effective tier considering overrides
   */
  private getEffectiveTier(userId?: string, defaultTier: string = 'free'): string {
    if (!userId) return defaultTier;

    const override = this.tierOverrides.get(userId);
    if (override && (!override.expiresAt || override.expiresAt > new Date())) {
      return override.tier;
    }

    return defaultTier;
  }

  /**
   * Get rate limit configuration for a user and endpoint
   */
  private getRateLimitConfig(userId?: string, endpoint?: string): RateLimitConfig {
    const tier = this.getEffectiveTier(userId);
    const endpointConfig = endpoint ? this.endpointLimits.get(endpoint) : null;

    if (endpointConfig) {
      return endpointConfig;
    }

    const tierConfig = DEFAULT_RATE_LIMIT_TIERS[tier];
    return {
      tier,
      windowMs: tierConfig.windowMs,
      maxRequests: tierConfig.maxRequests,
      blockDuration: tierConfig.blockDuration,
    };
  }

  /**
   * Check if request should be rate limited
   */
  async checkRateLimit(
    key: string,
    userId?: string,
    endpoint?: string,
    options: { skip?: boolean } = {}
  ): Promise<{
    allowed: boolean;
    remaining: number;
    resetTime: Date;
    retryAfter?: number;
  }> {
    if (options.skip) {
      return {
        allowed: true,
        remaining: 999,
        resetTime: new Date(Date.now() + 900000), // 15 minutes
      };
    }

    const config = this.getRateLimitConfig(userId, endpoint);
    const limiter = this.getLimiter(config.tier);

    try {
      const res = await limiter.get(key);

      if (res && res.remainingPoints <= 0) {
        // Rate limit exceeded
        const resetTime = new Date(Date.now() + (res.msBeforeNext || 0));
        const retryAfter = Math.ceil((res.msBeforeNext || 0) / 1000);

        return {
          allowed: false,
          remaining: 0,
          resetTime,
          retryAfter,
        };
      }

      // Consume a point
      const resConsume = await limiter.consume(key);

      return {
        allowed: true,
        remaining: resConsume.remainingPoints,
        resetTime: new Date(Date.now() + (resConsume.msBeforeNext || 0)),
      };
    } catch (error) {
      console.error('Rate limiter error:', error);
      // Allow request on error to avoid blocking legitimate traffic
      return {
        allowed: true,
        remaining: 999,
        resetTime: new Date(Date.now() + 900000),
      };
    }
  }

  /**
   * Set tier override for a user
   */
  setTierOverride(override: RateLimitOverride): void {
    this.tierOverrides.set(override.userId, override);
  }

  /**
   * Remove tier override for a user
   */
  removeTierOverride(userId: string): void {
    this.tierOverrides.delete(userId);
  }

  /**
   * Update endpoint rate limit configuration
   */
  updateEndpointLimit(endpoint: string, config: RateLimitConfig): void {
    this.endpointLimits.set(endpoint, config);
  }

  /**
   * Get current rate limit status for a key
   */
  async getRateLimitStatus(key: string, tier: string): Promise<{
    remaining: number;
    resetTime: Date;
  } | null> {
    try {
      const limiter = this.getLimiter(tier);
      const res = await limiter.get(key);

      if (!res) return null;

      return {
        remaining: res.remainingPoints,
        resetTime: new Date(Date.now() + (res.msBeforeNext || 0)),
      };
    } catch (error) {
      console.error('Error getting rate limit status:', error);
      return null;
    }
  }

  /**
   * Reset rate limit for a key
   */
  async resetRateLimit(key: string, tier: string): Promise<void> {
    try {
      const limiter = this.getLimiter(tier);
      await limiter.delete(key);
    } catch (error) {
      console.error('Error resetting rate limit:', error);
    }
  }

  /**
   * Get all active tier overrides
   */
  getActiveOverrides(): RateLimitOverride[] {
    const now = new Date();
    return Array.from(this.tierOverrides.values()).filter(
      override => !override.expiresAt || override.expiresAt > now
    );
  }

  /**
   * Clean up expired overrides
   */
  cleanupExpiredOverrides(): void {
    const now = new Date();
    for (const [userId, override] of this.tierOverrides) {
      if (override.expiresAt && override.expiresAt <= now) {
        this.tierOverrides.delete(userId);
      }
    }
  }

  /**
   * Close Redis connection
   */
  async close(): Promise<void> {
    await this.redis.quit();
  }
}

// Singleton instance
export const rateLimiterService = new RateLimiterService();