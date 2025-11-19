import { Request, Response } from 'express';
import { body } from 'express-validator';
import { rateLimiterService } from '../services/rate-limiter.service';
import { rateLimitAnalyticsService } from '../services/rate-limit-analytics.service';
import { RateLimitOverride } from '../types/rate-limit';

/**
 * Get rate limit statistics
 */
export const getRateLimitStats = async (req: Request, res: Response): Promise<void> => {
  try {
    const { start, end } = req.query;

    const timeRange = {
      start: start ? new Date(start as string) : new Date(Date.now() - 24 * 60 * 60 * 1000),
      end: end ? new Date(end as string) : new Date(),
    };

    const stats = rateLimitAnalyticsService.getStatistics(timeRange);

    res.json({
      success: true,
      data: stats,
    });
  } catch (error: any) {
    console.error('Error getting rate limit stats:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get rate limit statistics',
    });
  }
};

/**
 * Get rate limit status for current user
 */
export const getUserRateLimitStatus = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({
        success: false,
        error: 'User not authenticated',
      });
      return;
    }

    const status = await rateLimitAnalyticsService.getUserRateLimitStatus(userId);

    res.json({
      success: true,
      data: status,
    });
  } catch (error: any) {
    console.error('Error getting user rate limit status:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get user rate limit status',
    });
  }
};

/**
 * Get recent blocked requests
 */
export const getRecentBlockedRequests = async (req: Request, res: Response): Promise<void> => {
  try {
    const limit = parseInt(req.query.limit as string) || 50;
    const blocked = rateLimitAnalyticsService.getRecentBlockedRequests(limit);

    res.json({
      success: true,
      data: blocked,
    });
  } catch (error: any) {
    console.error('Error getting recent blocked requests:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get recent blocked requests',
    });
  }
};

/**
 * Get violations by IP
 */
export const getViolationsByIP = async (req: Request, res: Response): Promise<void> => {
  try {
    const { start, end } = req.query;

    const timeRange = {
      start: start ? new Date(start as string) : new Date(Date.now() - 24 * 60 * 60 * 1000),
      end: end ? new Date(end as string) : new Date(),
    };

    const violations = rateLimitAnalyticsService.getViolationsByIP(timeRange);

    res.json({
      success: true,
      data: violations,
    });
  } catch (error: any) {
    console.error('Error getting violations by IP:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get violations by IP',
    });
  }
};

/**
 * Set rate limit override for a user (Admin only)
 */
export const setUserRateLimitOverride = async (req: Request, res: Response): Promise<void> => {
  try {
    const { userId, tier, customWindowMs, customMaxRequests, customBlockDuration, expiresAt } = req.body;

    if (!userId || !tier) {
      res.status(400).json({
        success: false,
        error: 'User ID and tier are required',
      });
      return;
    }

    const override: RateLimitOverride = {
      userId,
      tier,
      customLimits: {
        windowMs: customWindowMs,
        maxRequests: customMaxRequests,
        blockDuration: customBlockDuration,
      },
      expiresAt: expiresAt ? new Date(expiresAt) : undefined,
    };

    rateLimiterService.setTierOverride(override);

    res.json({
      success: true,
      message: 'Rate limit override set successfully',
      data: override,
    });
  } catch (error: any) {
    console.error('Error setting rate limit override:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to set rate limit override',
    });
  }
};

/**
 * Remove rate limit override for a user (Admin only)
 */
export const removeUserRateLimitOverride = async (req: Request, res: Response): Promise<void> => {
  try {
    const { userId } = req.params;

    if (!userId) {
      res.status(400).json({
        success: false,
        error: 'User ID is required',
      });
      return;
    }

    rateLimiterService.removeTierOverride(userId);

    res.json({
      success: true,
      message: 'Rate limit override removed successfully',
    });
  } catch (error: any) {
    console.error('Error removing rate limit override:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to remove rate limit override',
    });
  }
};

/**
 * Get all active rate limit overrides (Admin only)
 */
export const getActiveOverrides = async (req: Request, res: Response): Promise<void> => {
  try {
    const overrides = rateLimiterService.getActiveOverrides();

    res.json({
      success: true,
      data: overrides,
    });
  } catch (error: any) {
    console.error('Error getting active overrides:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get active overrides',
    });
  }
};

/**
 * Reset rate limit for a specific keys (Admin only)
 */
export const resetRateLimit = async (req: Request, res: Response): Promise<void> => {
  try {
    const { key, tier } = req.body;

    if (!key || !tier) {
      res.status(400).json({
        success: false,
        error: 'Key and tier are required',
      });
      return;
    }

    await rateLimiterService.resetRateLimit(key, tier);

    res.json({
      success: true,
      message: 'Rate limit reset successfully',
    });
  } catch (error: any) {
    console.error('Error resetting rate limit:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to reset rate limit',
    });
  }
};

/**
 * Update endpoint rate limit configuration (Admin only)
 */
export const updateEndpointConfig = async (req: Request, res: Response): Promise<void> => {
  try {
    const { endpoint, config } = req.body;

    if (!endpoint || !config) {
      res.status(400).json({
        success: false,
        error: 'Endpoint and config are required',
      });
      return;
    }

    rateLimiterService.updateEndpointLimit(endpoint, config);

    res.json({
      success: true,
      message: 'Endpoint rate limit configuration updated successfully',
    });
  } catch (error: any) {
    console.error('Error updating endpoint config:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update endpoint configuration',
    });
  }
};