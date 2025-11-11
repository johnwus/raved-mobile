import { Request, Response, NextFunction } from 'express';
import { rateLimiterService } from '../services/rate-limiter.service';
import { rateLimitAnalyticsService } from '../services/rate-limit-analytics.service';
import { RateLimitHeaders } from '../types/rate-limit';

interface RateLimitOptions {
  endpoint?: string;
  skipForAdmins?: boolean;
  skipForCritical?: boolean;
  customKey?: (req: Request) => string;
}

export const createRateLimitMiddleware = (options: RateLimitOptions = {}) => {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      // Determine the key for rate limiting
      const key = options.customKey
        ? options.customKey(req)
        : req.user?.id || req.ip || 'anonymous';

      // Check if request should be skipped
      const shouldSkip =
        (options.skipForAdmins && req.user?.role === 'admin') ||
        (options.skipForCritical && isCriticalOperation(req)) ||
        req.path === '/health' ||
        req.path.startsWith('/static/');

      // Check rate limit
      const result = await rateLimiterService.checkRateLimit(
        key,
        req.user?.id,
        options.endpoint,
        { skip: shouldSkip }
      );

      // Set rate limit headers
      setRateLimitHeaders(res, result);

      if (!result.allowed) {
        // Record blocked request analytics
        rateLimitAnalyticsService.recordEvent({
          userId: req.user?.id,
          ip: req.ip || req.connection.remoteAddress || 'unknown',
          endpoint: options.endpoint || req.path,
          method: req.method,
          tier: req.user?.subscription_tier || 'free',
          requestsCount: 1,
          blocked: true,
        });

        // Rate limit exceeded
        res.status(429).json({
          success: false,
          error: 'Too many requests',
          message: 'Rate limit exceeded. Please try again later.',
          retryAfter: result.retryAfter,
        });
        return;
      }

      // Record analytics
      rateLimitAnalyticsService.recordEvent({
        userId: req.user?.id,
        ip: req.ip || req.connection.remoteAddress || 'unknown',
        endpoint: options.endpoint || req.path,
        method: req.method,
        tier: req.user?.subscription_tier || 'free',
        requestsCount: 1,
        blocked: false,
      });

      // Add rate limit info to request for analytics
      (req as any).rateLimitInfo = {
        key,
        userId: req.user?.id,
        endpoint: options.endpoint || req.path,
        method: req.method,
        allowed: result.allowed,
        remaining: result.remaining,
        resetTime: result.resetTime,
      };

      next();
    } catch (error) {
      console.error('Rate limit middleware error:', error);
      // Allow request on error to avoid blocking legitimate traffic
      next();
    }
  };
};

/**
 * Check if the operation is critical and should bypass rate limiting
 */
function isCriticalOperation(req: Request): boolean {
  const criticalPaths = [
    '/api/v1/auth/login',
    '/api/v1/auth/refresh',
    '/api/v1/health',
    '/api/v1/admin/emergency',
  ];

  return criticalPaths.some(path => req.path.includes(path));
}

/**
 * Set rate limit headers on the response
 */
function setRateLimitHeaders(
  res: Response,
  result: {
    allowed: boolean;
    remaining: number;
    resetTime: Date;
    retryAfter?: number;
  }
): void {
  const headers: Partial<RateLimitHeaders> = {
    'X-RateLimit-Limit': '100', // Default, will be overridden by specific limits
    'X-RateLimit-Remaining': result.remaining.toString(),
    'X-RateLimit-Reset': Math.floor(result.resetTime.getTime() / 1000).toString(),
  };

  if (!result.allowed && result.retryAfter) {
    headers['X-RateLimit-Retry-After'] = result.retryAfter.toString();
  }

  res.set(headers);
}

// Pre-configured middleware for different use cases
export const generalRateLimit = createRateLimitMiddleware();

export const authRateLimit = createRateLimitMiddleware({
  endpoint: 'auth',
  skipForCritical: true,
});

export const uploadRateLimit = createRateLimitMiddleware({
  endpoint: 'upload',
  customKey: (req) => req.user?.id || req.ip || 'anonymous',
});

export const searchRateLimit = createRateLimitMiddleware({
  endpoint: 'search',
});

export const postRateLimit = createRateLimitMiddleware({
  endpoint: 'posts',
  customKey: (req) => req.user?.id || req.ip || 'anonymous',
});

export const commentRateLimit = createRateLimitMiddleware({
  endpoint: 'comments',
  customKey: (req) => req.user?.id || req.ip || 'anonymous',
});

export const interactionRateLimit = createRateLimitMiddleware({
  endpoint: 'interactions',
  customKey: (req) => req.user?.id || req.ip || 'anonymous',
});

// Admin rate limit (more permissive)
export const adminRateLimit = createRateLimitMiddleware({
  skipForAdmins: true,
});

// Critical operations bypass
export const criticalRateLimit = createRateLimitMiddleware({
  skipForCritical: true,
});