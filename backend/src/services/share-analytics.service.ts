import { pgPool } from '../config/database';

export class ShareAnalyticsService {
  // Track share event
  static async trackShareEvent(
    shareId: number,
    eventType: 'click' | 'view' | 'conversion',
    userId?: string,
    metadata?: any
  ): Promise<void> {
    const query = `
      INSERT INTO share_analytics_events (
        share_id, event_type, user_id, metadata, created_at
      ) VALUES ($1, $2, $3, $4, NOW())
    `;

    await pgPool.query(query, [
      shareId,
      eventType,
      userId || null,
      JSON.stringify(metadata || {})
    ]);
  }

  // Get share analytics
  static async getShareAnalytics(shareId: number): Promise<any> {
    const query = `
      SELECT
        event_type,
        COUNT(*) as count,
        COUNT(DISTINCT user_id) as unique_users,
        MAX(created_at) as last_event_at
      FROM share_analytics_events
      WHERE share_id = $1
      GROUP BY event_type
    `;

    const result = await pgPool.query(query, [shareId]);

    const analytics: any = {
      clicks: 0,
      views: 0,
      conversions: 0,
      uniqueUsers: 0,
      lastEventAt: null
    };

    result.rows.forEach(row => {
      analytics[row.event_type + 's'] = row.count;
      analytics.uniqueUsers = Math.max(analytics.uniqueUsers, row.unique_users);
      if (!analytics.lastEventAt || row.last_event_at > analytics.lastEventAt) {
        analytics.lastEventAt = row.last_event_at;
      }
    });

    return analytics;
  }

  // Get content share analytics
  static async getContentShareAnalytics(contentType: string, contentId: string): Promise<any> {
    const query = `
      SELECT
        s.platform,
        COUNT(DISTINCT s.id) as total_shares,
        COUNT(DISTINCT sae.user_id) as reached_users,
        COUNT(CASE WHEN sae.event_type = 'click' THEN 1 END) as clicks,
        COUNT(CASE WHEN sae.event_type = 'conversion' THEN 1 END) as conversions
      FROM shares s
      LEFT JOIN share_analytics_events sae ON s.id = sae.share_id
      WHERE s.content_type = $1 AND s.content_id = $2
      GROUP BY s.platform
    `;

    const result = await pgPool.query(query, [contentType, contentId]);
    return result.rows;
  }

  // Get user share analytics
  static async getUserShareAnalytics(userId: string): Promise<any> {
    const query = `
      SELECT
        s.content_type,
        COUNT(DISTINCT s.id) as total_shares,
        COUNT(DISTINCT sae.user_id) as reached_users,
        COUNT(CASE WHEN sae.event_type = 'click' THEN 1 END) as clicks,
        COUNT(CASE WHEN sae.event_type = 'conversion' THEN 1 END) as conversions
      FROM shares s
      LEFT JOIN share_analytics_events sae ON s.id = sae.share_id
      WHERE s.user_id = $1
      GROUP BY s.content_type
    `;

    const result = await pgPool.query(query, [userId]);
    return result.rows;
  }

  // Get platform performance analytics
  static async getPlatformAnalytics(platform: string, dateRange?: { start: Date; end: Date }): Promise<any> {
    let query = `
      SELECT
        DATE(created_at) as date,
        COUNT(DISTINCT s.id) as shares,
        COUNT(DISTINCT sae.user_id) as reached_users,
        COUNT(CASE WHEN sae.event_type = 'click' THEN 1 END) as clicks,
        COUNT(CASE WHEN sae.event_type = 'conversion' THEN 1 END) as conversions
      FROM shares s
      LEFT JOIN share_analytics_events sae ON s.id = sae.share_id
      WHERE s.platform = $1
    `;

    const params = [platform];
    let paramIndex = 2;

    if (dateRange) {
      query += ` AND s.created_at >= $${paramIndex} AND s.created_at <= $${paramIndex + 1}`;
      params.push(dateRange.start.toISOString(), dateRange.end.toISOString());
    }

    query += ` GROUP BY DATE(created_at) ORDER BY date DESC`;

    const result = await pgPool.query(query, params);
    return result.rows;
  }

  // Get top performing content
  static async getTopPerformingContent(limit: number = 10): Promise<any> {
    const query = `
      SELECT
        s.content_type,
        s.content_id,
        COUNT(DISTINCT s.id) as total_shares,
        COUNT(DISTINCT sae.user_id) as reached_users,
        COUNT(CASE WHEN sae.event_type = 'click' THEN 1 END) as clicks,
        COUNT(CASE WHEN sae.event_type = 'conversion' THEN 1 END) as conversions,
        ROUND(
          CASE
            WHEN COUNT(DISTINCT s.id) > 0
            THEN COUNT(CASE WHEN sae.event_type = 'conversion' THEN 1 END)::decimal / COUNT(DISTINCT s.id) * 100
            ELSE 0
          END, 2
        ) as conversion_rate
      FROM shares s
      LEFT JOIN share_analytics_events sae ON s.id = sae.share_id
      GROUP BY s.content_type, s.content_id
      ORDER BY total_shares DESC, reached_users DESC
      LIMIT $1
    `;

    const result = await pgPool.query(query, [limit]);
    return result.rows;
  }

  // Get referral analytics
  static async getReferralAnalytics(userId?: string): Promise<any> {
    let query = `
      SELECT
        r.referrer_id,
        COUNT(*) as total_referrals,
        COUNT(CASE WHEN r.created_at >= NOW() - INTERVAL '30 days' THEN 1 END) as recent_referrals,
        COUNT(CASE WHEN u.created_at >= r.created_at THEN 1 END) as successful_referrals
      FROM referrals r
      LEFT JOIN users u ON r.referred_id = u.id
    `;

    const params = [];
    if (userId) {
      query += ` WHERE r.referrer_id = $1`;
      params.push(userId);
    }

    query += ` GROUP BY r.referrer_id ORDER BY total_referrals DESC`;

    const result = await pgPool.query(query, params);
    return result.rows;
  }

  // Generate share performance report
  static async generateShareReport(dateRange: { start: Date; end: Date }): Promise<any> {
    const query = `
      SELECT
        s.platform,
        s.content_type,
        COUNT(DISTINCT s.id) as total_shares,
        COUNT(DISTINCT sae.user_id) as unique_users_reached,
        COUNT(CASE WHEN sae.event_type = 'click' THEN 1 END) as total_clicks,
        COUNT(CASE WHEN sae.event_type = 'view' THEN 1 END) as total_views,
        COUNT(CASE WHEN sae.event_type = 'conversion' THEN 1 END) as total_conversions,
        ROUND(
          CASE
            WHEN COUNT(DISTINCT sae.user_id) > 0
            THEN COUNT(CASE WHEN sae.event_type = 'click' THEN 1 END)::decimal / COUNT(DISTINCT sae.user_id) * 100
            ELSE 0
          END, 2
        ) as click_through_rate,
        ROUND(
          CASE
            WHEN COUNT(CASE WHEN sae.event_type = 'click' THEN 1 END) > 0
            THEN COUNT(CASE WHEN sae.event_type = 'conversion' THEN 1 END)::decimal / COUNT(CASE WHEN sae.event_type = 'click' THEN 1 END) * 100
            ELSE 0
          END, 2
        ) as conversion_rate
      FROM shares s
      LEFT JOIN share_analytics_events sae ON s.id = sae.share_id
      WHERE s.created_at >= $1 AND s.created_at <= $2
      GROUP BY s.platform, s.content_type
      ORDER BY total_shares DESC
    `;

    const result = await pgPool.query(query, [dateRange.start, dateRange.end]);
    return result.rows;
  }
}

export default ShareAnalyticsService;