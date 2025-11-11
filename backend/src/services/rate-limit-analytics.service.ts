import { RateLimitAnalytics } from '../types/rate-limit';
import { rateLimiterService } from './rate-limiter.service';

export class RateLimitAnalyticsService {
  private analytics: RateLimitAnalytics[] = [];
  private maxAnalyticsSize = 10000; // Keep last 10k records in memory

  /**
   * Record a rate limit event
   */
  recordEvent(event: Omit<RateLimitAnalytics, 'id' | 'timestamp'>): void {
    const analyticsEvent: RateLimitAnalytics = {
      id: this.generateId(),
      ...event,
      timestamp: new Date(),
    };

    this.analytics.push(analyticsEvent);

    // Maintain size limit
    if (this.analytics.length > this.maxAnalyticsSize) {
      this.analytics = this.analytics.slice(-this.maxAnalyticsSize);
    }
  }

  /**
   * Get rate limit statistics
   */
  getStatistics(timeRange: { start: Date; end: Date } = {
    start: new Date(Date.now() - 24 * 60 * 60 * 1000), // Last 24 hours
    end: new Date()
  }) {
    const filteredEvents = this.analytics.filter(
      event => event.timestamp >= timeRange.start && event.timestamp <= timeRange.end
    );

    const totalRequests = filteredEvents.length;
    const blockedRequests = filteredEvents.filter(e => e.blocked).length;
    const blockRate = totalRequests > 0 ? (blockedRequests / totalRequests) * 100 : 0;

    // Group by tier
    const tierStats = filteredEvents.reduce((acc, event) => {
      if (!acc[event.tier]) {
        acc[event.tier] = { total: 0, blocked: 0 };
      }
      acc[event.tier].total++;
      if (event.blocked) {
        acc[event.tier].blocked++;
      }
      return acc;
    }, {} as Record<string, { total: number; blocked: number }>);

    // Group by endpoint
    const endpointStats = filteredEvents.reduce((acc, event) => {
      if (!acc[event.endpoint]) {
        acc[event.endpoint] = { total: 0, blocked: 0 };
      }
      acc[event.endpoint].total++;
      if (event.blocked) {
        acc[event.endpoint].blocked++;
      }
      return acc;
    }, {} as Record<string, { total: number; blocked: number }>);

    // Group by user (top 10 most active)
    const userStats = filteredEvents.reduce((acc, event) => {
      if (!event.userId) return acc;

      if (!acc[event.userId]) {
        acc[event.userId] = { total: 0, blocked: 0 };
      }
      acc[event.userId].total++;
      if (event.blocked) {
        acc[event.userId].blocked++;
      }
      return acc;
    }, {} as Record<string, { total: number; blocked: number }>);

    const topUsers = Object.entries(userStats)
      .sort(([, a], [, b]) => b.total - a.total)
      .slice(0, 10);

    return {
      timeRange,
      totalRequests,
      blockedRequests,
      blockRate: Math.round(blockRate * 100) / 100,
      tierStats,
      endpointStats,
      topUsers,
    };
  }

  /**
   * Get rate limit status for a specific user
   */
  async getUserRateLimitStatus(userId: string) {
    const tiers = ['free', 'premium', 'admin'];

    const statusPromises = tiers.map(async (tier) => {
      const key = `user:${userId}`;
      const status = await rateLimiterService.getRateLimitStatus(key, tier);
      return {
        tier,
        status,
      };
    });

    const results = await Promise.all(statusPromises);

    return {
      userId,
      tiers: results,
    };
  }

  /**
   * Get recent blocked requests
   */
  getRecentBlockedRequests(limit: number = 50): RateLimitAnalytics[] {
    return this.analytics
      .filter(event => event.blocked)
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
      .slice(0, limit);
  }

  /**
   * Get rate limit violations by IP
   */
  getViolationsByIP(timeRange: { start: Date; end: Date } = {
    start: new Date(Date.now() - 24 * 60 * 60 * 1000),
    end: new Date()
  }) {
    const filteredEvents = this.analytics.filter(
      event => event.timestamp >= timeRange.start &&
               event.timestamp <= timeRange.end &&
               event.blocked
    );

    const violationsByIP = filteredEvents.reduce((acc, event) => {
      if (!acc[event.ip]) {
        acc[event.ip] = 0;
      }
      acc[event.ip]++;
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(violationsByIP)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 20); // Top 20 violating IPs
  }

  /**
   * Clear old analytics data
   */
  clearOldData(olderThan: Date): void {
    this.analytics = this.analytics.filter(
      event => event.timestamp > olderThan
    );
  }

  /**
   * Export analytics data
   */
  exportData(): RateLimitAnalytics[] {
    return [...this.analytics];
  }

  /**
   * Reset analytics
   */
  reset(): void {
    this.analytics = [];
  }

  private generateId(): string {
    return `analytics_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}

// Singleton instance
export const rateLimitAnalyticsService = new RateLimitAnalyticsService();