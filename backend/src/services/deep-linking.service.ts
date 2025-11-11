import { pgPool } from '../config/database';

export interface DeepLink {
  id: number;
  contentType: 'post' | 'profile' | 'event' | 'product';
  contentId: string;
  shortCode: string;
  longUrl: string;
  platform?: string;
  campaign?: string;
  metadata?: any;
  clickCount: number;
  lastClickedAt?: Date;
  expiresAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export class DeepLinkingService {
  // Generate short code for deep linking
  static generateShortCode(length: number = 8): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }

  // Create deep link
  static async createDeepLink(
    contentType: 'post' | 'profile' | 'event' | 'product',
    contentId: string,
    platform?: string,
    campaign?: string,
    expiresAt?: Date,
    metadata?: any
  ): Promise<DeepLink> {
    const baseUrl = process.env.BASE_URL || 'https://yourapp.com';
    const shortCode = this.generateShortCode();
    const longUrl = `${baseUrl}/share/${contentType}/${contentId}`;

    const query = `
      INSERT INTO deep_links (
        content_type, content_id, short_code, long_url, platform, campaign,
        metadata, expires_at, click_count, created_at, updated_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 0, NOW(), NOW())
      RETURNING id, content_type, content_id, short_code, long_url, platform,
                campaign, metadata, click_count, last_clicked_at, expires_at, created_at, updated_at
    `;

    const result = await pgPool.query(query, [
      contentType,
      contentId,
      shortCode,
      longUrl,
      platform || null,
      campaign || null,
      JSON.stringify(metadata || {}),
      expiresAt || null
    ]);

    return result.rows[0];
  }

  // Resolve deep link
  static async resolveDeepLink(shortCode: string): Promise<DeepLink | null> {
    const query = `
      SELECT id, content_type, content_id, short_code, long_url, platform,
             campaign, metadata, click_count, last_clicked_at, expires_at, created_at, updated_at
      FROM deep_links
      WHERE short_code = $1 AND (expires_at IS NULL OR expires_at > NOW())
    `;

    const result = await pgPool.query(query, [shortCode]);
    return result.rows[0] || null;
  }

  // Track deep link click
  static async trackDeepLinkClick(
    shortCode: string,
    userAgent?: string,
    ipAddress?: string,
    referrer?: string
  ): Promise<DeepLink | null> {
    const client = await pgPool.connect();

    try {
      await client.query('BEGIN');

      // Get the deep link
      const selectQuery = `
        SELECT id, content_type, content_id, short_code, long_url, platform,
               campaign, metadata, click_count, last_clicked_at, expires_at, created_at, updated_at
        FROM deep_links
        WHERE short_code = $1 AND (expires_at IS NULL OR expires_at > NOW())
        FOR UPDATE
      `;

      const selectResult = await client.query(selectQuery, [shortCode]);
      if (selectResult.rows.length === 0) {
        await client.query('ROLLBACK');
        return null;
      }

      const deepLink = selectResult.rows[0];

      // Update click count and last clicked time
      const updateQuery = `
        UPDATE deep_links
        SET click_count = click_count + 1, last_clicked_at = NOW(), updated_at = NOW()
        WHERE id = $1
      `;

      await client.query(updateQuery, [deepLink.id]);

      // Log the click event
      const logQuery = `
        INSERT INTO deep_link_clicks (
          deep_link_id, user_agent, ip_address, referrer, clicked_at
        ) VALUES ($1, $2, $3, $4, NOW())
      `;

      await client.query(logQuery, [
        deepLink.id,
        userAgent || null,
        ipAddress || null,
        referrer || null
      ]);

      await client.query('COMMIT');

      // Return updated deep link
      const finalQuery = `
        SELECT id, content_type, content_id, short_code, long_url, platform,
               campaign, metadata, click_count, last_clicked_at, expires_at, created_at, updated_at
        FROM deep_links
        WHERE id = $1
      `;

      const finalResult = await client.query(finalQuery, [deepLink.id]);
      return finalResult.rows[0];

    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  // Get deep link analytics
  static async getDeepLinkAnalytics(shortCode: string): Promise<any> {
    const query = `
      SELECT
        dl.click_count,
        dl.last_clicked_at,
        COUNT(dlc.id) as total_clicks,
        COUNT(DISTINCT dlc.ip_address) as unique_clicks,
        MAX(dlc.clicked_at) as last_click_at,
        json_agg(DISTINCT dlc.referrer) FILTER (WHERE dlc.referrer IS NOT NULL) as referrers
      FROM deep_links dl
      LEFT JOIN deep_link_clicks dlc ON dl.id = dlc.deep_link_id
      WHERE dl.short_code = $1
      GROUP BY dl.id, dl.click_count, dl.last_clicked_at
    `;

    const result = await pgPool.query(query, [shortCode]);
    return result.rows[0] || null;
  }

  // Generate platform-specific deep links
  static generatePlatformDeepLink(
    contentType: string,
    contentId: string,
    platform: 'ios' | 'android' | 'web'
  ): string {
    const baseUrl = process.env.BASE_URL || 'https://yourapp.com';

    switch (platform) {
      case 'ios':
        // iOS Universal Links
        return `${baseUrl}/share/${contentType}/${contentId}`;

      case 'android':
        // Android App Links or custom scheme
        const androidScheme = process.env.ANDROID_APP_SCHEME || 'yourapp';
        return `${androidScheme}://share/${contentType}/${contentId}`;

      case 'web':
      default:
        return `${baseUrl}/share/${contentType}/${contentId}`;
    }
  }

  // Create Firebase Dynamic Links (if using Firebase)
  static async createFirebaseDynamicLink(
    contentType: string,
    contentId: string,
    socialTitle?: string,
    socialDescription?: string,
    socialImageUrl?: string
  ): Promise<string> {
    const firebaseApiKey = process.env.FIREBASE_API_KEY;
    const baseUrl = process.env.BASE_URL || 'https://yourapp.com';

    if (!firebaseApiKey) {
      // Fallback to regular deep link
      return this.generatePlatformDeepLink(contentType, contentId, 'web');
    }

    try {
      const response = await fetch(`https://firebasedynamiclinks.googleapis.com/v1/shortLinks?key=${firebaseApiKey}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          dynamicLinkInfo: {
            domainUriPrefix: process.env.FIREBASE_DOMAIN_URI_PREFIX,
            link: `${baseUrl}/share/${contentType}/${contentId}`,
            androidInfo: {
              androidPackageName: process.env.ANDROID_PACKAGE_NAME,
            },
            iosInfo: {
              iosBundleId: process.env.IOS_BUNDLE_ID,
            },
            socialMetaTagInfo: {
              socialTitle: socialTitle || `Check out this ${contentType}`,
              socialDescription: socialDescription || `Shared from our app`,
              socialImageLink: socialImageUrl,
            },
          },
        }),
      });

      const data = await response.json();
      return data.shortLink;

    } catch (error) {
      console.error('Firebase Dynamic Link creation failed:', error);
      // Fallback to regular deep link
      return this.generatePlatformDeepLink(contentType, contentId, 'web');
    }
  }

  // Generate Branch.io deep links (alternative to Firebase)
  static async createBranchDeepLink(
    contentType: string,
    contentId: string,
    metadata?: any
  ): Promise<string> {
    const branchApiKey = process.env.BRANCH_API_KEY;
    const baseUrl = process.env.BASE_URL || 'https://yourapp.com';

    if (!branchApiKey) {
      return this.generatePlatformDeepLink(contentType, contentId, 'web');
    }

    try {
      const response = await fetch('https://api2.branch.io/v1/url', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          branch_key: branchApiKey,
          data: {
            contentType,
            contentId,
            ...metadata,
          },
          ios_url: `${baseUrl}/share/${contentType}/${contentId}`,
          android_url: `${baseUrl}/share/${contentType}/${contentId}`,
          desktop_url: `${baseUrl}/share/${contentType}/${contentId}`,
        }),
      });

      const data = await response.json();
      return data.url;

    } catch (error) {
      console.error('Branch deep link creation failed:', error);
      return this.generatePlatformDeepLink(contentType, contentId, 'web');
    }
  }

  // Clean up expired deep links
  static async cleanupExpiredDeepLinks(): Promise<number> {
    const query = `DELETE FROM deep_links WHERE expires_at IS NOT NULL AND expires_at < NOW()`;
    const result = await pgPool.query(query);
    return result.rowCount || 0;
  }

  // Get deep link by content
  static async getDeepLinkByContent(contentType: string, contentId: string): Promise<DeepLink | null> {
    const query = `
      SELECT id, content_type, content_id, short_code, long_url, platform,
             campaign, metadata, click_count, last_clicked_at, expires_at, created_at, updated_at
      FROM deep_links
      WHERE content_type = $1 AND content_id = $2
      ORDER BY created_at DESC
      LIMIT 1
    `;

    const result = await pgPool.query(query, [contentType, contentId]);
    return result.rows[0] || null;
  }
}

export default DeepLinkingService;