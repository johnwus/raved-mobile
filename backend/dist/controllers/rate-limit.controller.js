"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateEndpointConfig = exports.resetRateLimit = exports.getActiveOverrides = exports.removeUserRateLimitOverride = exports.setUserRateLimitOverride = exports.getViolationsByIP = exports.getRecentBlockedRequests = exports.getUserRateLimitStatus = exports.getRateLimitStats = void 0;
const rate_limiter_service_1 = require("../services/rate-limiter.service");
const rate_limit_analytics_service_1 = require("../services/rate-limit-analytics.service");
/**
 * Get rate limit statistics
 */
const getRateLimitStats = async (req, res) => {
    try {
        const { start, end } = req.query;
        const timeRange = {
            start: start ? new Date(start) : new Date(Date.now() - 24 * 60 * 60 * 1000),
            end: end ? new Date(end) : new Date(),
        };
        const stats = rate_limit_analytics_service_1.rateLimitAnalyticsService.getStatistics(timeRange);
        res.json({
            success: true,
            data: stats,
        });
    }
    catch (error) {
        console.error('Error getting rate limit stats:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to get rate limit statistics',
        });
    }
};
exports.getRateLimitStats = getRateLimitStats;
/**
 * Get rate limit status for current user
 */
const getUserRateLimitStatus = async (req, res) => {
    try {
        const userId = req.user?.id;
        if (!userId) {
            res.status(401).json({
                success: false,
                error: 'User not authenticated',
            });
            return;
        }
        const status = await rate_limit_analytics_service_1.rateLimitAnalyticsService.getUserRateLimitStatus(userId);
        res.json({
            success: true,
            data: status,
        });
    }
    catch (error) {
        console.error('Error getting user rate limit status:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to get user rate limit status',
        });
    }
};
exports.getUserRateLimitStatus = getUserRateLimitStatus;
/**
 * Get recent blocked requests
 */
const getRecentBlockedRequests = async (req, res) => {
    try {
        const limit = parseInt(req.query.limit) || 50;
        const blocked = rate_limit_analytics_service_1.rateLimitAnalyticsService.getRecentBlockedRequests(limit);
        res.json({
            success: true,
            data: blocked,
        });
    }
    catch (error) {
        console.error('Error getting recent blocked requests:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to get recent blocked requests',
        });
    }
};
exports.getRecentBlockedRequests = getRecentBlockedRequests;
/**
 * Get violations by IP
 */
const getViolationsByIP = async (req, res) => {
    try {
        const { start, end } = req.query;
        const timeRange = {
            start: start ? new Date(start) : new Date(Date.now() - 24 * 60 * 60 * 1000),
            end: end ? new Date(end) : new Date(),
        };
        const violations = rate_limit_analytics_service_1.rateLimitAnalyticsService.getViolationsByIP(timeRange);
        res.json({
            success: true,
            data: violations,
        });
    }
    catch (error) {
        console.error('Error getting violations by IP:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to get violations by IP',
        });
    }
};
exports.getViolationsByIP = getViolationsByIP;
/**
 * Set rate limit override for a user (Admin only)
 */
const setUserRateLimitOverride = async (req, res) => {
    try {
        const { userId, tier, customWindowMs, customMaxRequests, customBlockDuration, expiresAt } = req.body;
        if (!userId || !tier) {
            res.status(400).json({
                success: false,
                error: 'User ID and tier are required',
            });
            return;
        }
        const override = {
            userId,
            tier,
            customLimits: {
                windowMs: customWindowMs,
                maxRequests: customMaxRequests,
                blockDuration: customBlockDuration,
            },
            expiresAt: expiresAt ? new Date(expiresAt) : undefined,
        };
        rate_limiter_service_1.rateLimiterService.setTierOverride(override);
        res.json({
            success: true,
            message: 'Rate limit override set successfully',
            data: override,
        });
    }
    catch (error) {
        console.error('Error setting rate limit override:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to set rate limit override',
        });
    }
};
exports.setUserRateLimitOverride = setUserRateLimitOverride;
/**
 * Remove rate limit override for a user (Admin only)
 */
const removeUserRateLimitOverride = async (req, res) => {
    try {
        const { userId } = req.params;
        if (!userId) {
            res.status(400).json({
                success: false,
                error: 'User ID is required',
            });
            return;
        }
        rate_limiter_service_1.rateLimiterService.removeTierOverride(userId);
        res.json({
            success: true,
            message: 'Rate limit override removed successfully',
        });
    }
    catch (error) {
        console.error('Error removing rate limit override:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to remove rate limit override',
        });
    }
};
exports.removeUserRateLimitOverride = removeUserRateLimitOverride;
/**
 * Get all active rate limit overrides (Admin only)
 */
const getActiveOverrides = async (req, res) => {
    try {
        const overrides = rate_limiter_service_1.rateLimiterService.getActiveOverrides();
        res.json({
            success: true,
            data: overrides,
        });
    }
    catch (error) {
        console.error('Error getting active overrides:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to get active overrides',
        });
    }
};
exports.getActiveOverrides = getActiveOverrides;
/**
 * Reset rate limit for a specific key (Admin only)
 */
const resetRateLimit = async (req, res) => {
    try {
        const { key, tier } = req.body;
        if (!key || !tier) {
            res.status(400).json({
                success: false,
                error: 'Key and tier are required',
            });
            return;
        }
        await rate_limiter_service_1.rateLimiterService.resetRateLimit(key, tier);
        res.json({
            success: true,
            message: 'Rate limit reset successfully',
        });
    }
    catch (error) {
        console.error('Error resetting rate limit:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to reset rate limit',
        });
    }
};
exports.resetRateLimit = resetRateLimit;
/**
 * Update endpoint rate limit configuration (Admin only)
 */
const updateEndpointConfig = async (req, res) => {
    try {
        const { endpoint, config } = req.body;
        if (!endpoint || !config) {
            res.status(400).json({
                success: false,
                error: 'Endpoint and config are required',
            });
            return;
        }
        rate_limiter_service_1.rateLimiterService.updateEndpointLimit(endpoint, config);
        res.json({
            success: true,
            message: 'Endpoint rate limit configuration updated successfully',
        });
    }
    catch (error) {
        console.error('Error updating endpoint config:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to update endpoint configuration',
        });
    }
};
exports.updateEndpointConfig = updateEndpointConfig;
