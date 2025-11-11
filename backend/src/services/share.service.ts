import { pgPool } from '../config/database';
import { Share } from '../models/postgres/share.model';
import crypto from 'crypto';

export class ShareService {
  // Generate unique shareable link
  static generateShareableLink(contentType: string, contentId: string, userId?: string): string {
    const baseUrl = process.env.BASE_URL || 'https://yourapp.com';
    const shareId = crypto.randomBytes(8).toString('hex');
    const referralCode = userId ? crypto.randomBytes(4).toString('hex') : undefined;

    let shareUrl = `${baseUrl}/share/${contentType}/${contentId}/${shareId}`;

    if (referralCode) {
      shareUrl += `?ref=${referralCode}`;
    }

    return shareUrl;
  }

  // Create share record
  static async createShare(
    contentType: 'post' | 'profile' | 'event' | 'product',
    contentId: string,
    userId: string,
    platform: 'facebook' | 'twitter' | 'instagram' | 'whatsapp' | 'native' | 'link',
    metadata?: any
  ): Promise<Share> {
    const shareUrl = this.generateShareableLink(contentType, contentId, userId);
    const referralCode = crypto.randomBytes(4).toString('hex');

    const query = `
      INSERT INTO shares (content_type, content_id, user_id, platform, share_url, referral_code, metadata, created_at, updated_at)
      VALUES ($1, $2, $3, $4, $5, $6, $7, NOW(), NOW())
      RETURNING id, content_type, content_id, user_id, platform, share_url, referral_code, metadata, created_at, updated_at
    `;

    const result = await pgPool.query(query, [
      contentType,
      contentId,
      userId,
      platform,
      shareUrl,
      referralCode,
      JSON.stringify(metadata || {})
    ]);

    return result.rows[0] as Share;
  }

  // Get share by ID
  static async getShareById(shareId: number): Promise<Share | null> {
    const query = `
      SELECT id, content_type, content_id, user_id, platform, share_url, referral_code, metadata, created_at, updated_at
      FROM shares
      WHERE id = $1
    `;

    const result = await pgPool.query(query, [shareId]);
    return result.rows[0] || null;
  }

  // Get shares by content
  static async getSharesByContent(contentType: string, contentId: string): Promise<Share[]> {
    const query = `
      SELECT id, content_type, content_id, user_id, platform, share_url, referral_code, metadata, created_at, updated_at
      FROM shares
      WHERE content_type = $1 AND content_id = $2
      ORDER BY created_at DESC
    `;

    const result = await pgPool.query(query, [contentType, contentId]);
    return result.rows;
  }

  // Get shares by user
  static async getSharesByUser(userId: string): Promise<Share[]> {
    const query = `
      SELECT id, content_type, content_id, user_id, platform, share_url, referral_code, metadata, created_at, updated_at
      FROM shares
      WHERE user_id = $1
      ORDER BY created_at DESC
    `;

    const result = await pgPool.query(query, [userId]);
    return result.rows;
  }

  // Track share analytics
  static async trackShareClick(shareId: number, userAgent?: string, ipAddress?: string): Promise<void> {
    const query = `
      INSERT INTO share_analytics (share_id, user_agent, ip_address, clicked_at)
      VALUES ($1, $2, $3, NOW())
    `;

    await pgPool.query(query, [shareId, userAgent, ipAddress]);
  }

  // Get share analytics
  static async getShareAnalytics(shareId: number): Promise<any> {
    const query = `
      SELECT
        COUNT(*) as total_clicks,
        COUNT(DISTINCT ip_address) as unique_clicks,
        MAX(clicked_at) as last_clicked_at
      FROM share_analytics
      WHERE share_id = $1
    `;

    const result = await pgPool.query(query, [shareId]);
    return result.rows[0];
  }

  // Generate social media share URLs
  static generateSocialShareUrl(
    platform: 'facebook' | 'twitter' | 'instagram' | 'whatsapp' | 'linkedin',
    shareUrl: string,
    title?: string,
    description?: string
  ): string {
    const encodedUrl = encodeURIComponent(shareUrl);
    const encodedTitle = title ? encodeURIComponent(title) : '';
    const encodedDescription = description ? encodeURIComponent(description) : '';

    switch (platform) {
      case 'facebook':
        return `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`;

      case 'twitter':
        let twitterUrl = `https://twitter.com/intent/tweet?url=${encodedUrl}`;
        if (encodedTitle) twitterUrl += `&text=${encodedTitle}`;
        return twitterUrl;

      case 'instagram':
        // Instagram doesn't support direct sharing via URL, return the share URL
        return shareUrl;

      case 'whatsapp':
        let whatsappUrl = `https://wa.me/?text=${encodedUrl}`;
        if (encodedTitle) whatsappUrl += ` ${encodedTitle}`;
        return whatsappUrl;

      case 'linkedin':
        return `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`;

      default:
        return shareUrl;
    }
  }

  // Process referral code
  static async processReferral(referralCode: string, newUserId: string): Promise<boolean> {
    const query = `
      SELECT user_id FROM shares
      WHERE referral_code = $1
      LIMIT 1
    `;

    const result = await pgPool.query(query, [referralCode]);

    if (result.rows.length > 0) {
      const referrerId = result.rows[0].user_id;

      // Record referral
      const referralQuery = `
        INSERT INTO referrals (referrer_id, referred_id, referral_code, created_at)
        VALUES ($1, $2, $3, NOW())
      `;

      await pgPool.query(referralQuery, [referrerId, newUserId, referralCode]);
      return true;
    }

    return false;
  }

  // Get referral stats
  static async getReferralStats(userId: string): Promise<any> {
    const query = `
      SELECT
        COUNT(*) as total_referrals,
        COUNT(CASE WHEN created_at >= NOW() - INTERVAL '30 days' THEN 1 END) as recent_referrals
      FROM referrals
      WHERE referrer_id = $1
    `;

    const result = await pgPool.query(query, [userId]);
    return result.rows[0];
  }
}

export default ShareService;