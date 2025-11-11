"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ShareService = void 0;
const database_1 = require("../config/database");
const crypto_1 = __importDefault(require("crypto"));
class ShareService {
    // Generate unique shareable link
    static generateShareableLink(contentType, contentId, userId) {
        const baseUrl = process.env.BASE_URL || 'https://yourapp.com';
        const shareId = crypto_1.default.randomBytes(8).toString('hex');
        const referralCode = userId ? crypto_1.default.randomBytes(4).toString('hex') : undefined;
        let shareUrl = `${baseUrl}/share/${contentType}/${contentId}/${shareId}`;
        if (referralCode) {
            shareUrl += `?ref=${referralCode}`;
        }
        return shareUrl;
    }
    // Create share record
    static async createShare(contentType, contentId, userId, platform, metadata) {
        const shareUrl = this.generateShareableLink(contentType, contentId, userId);
        const referralCode = crypto_1.default.randomBytes(4).toString('hex');
        const query = `
      INSERT INTO shares (content_type, content_id, user_id, platform, share_url, referral_code, metadata, created_at, updated_at)
      VALUES ($1, $2, $3, $4, $5, $6, $7, NOW(), NOW())
      RETURNING id, content_type, content_id, user_id, platform, share_url, referral_code, metadata, created_at, updated_at
    `;
        const result = await database_1.pgPool.query(query, [
            contentType,
            contentId,
            userId,
            platform,
            shareUrl,
            referralCode,
            JSON.stringify(metadata || {})
        ]);
        return result.rows[0];
    }
    // Get share by ID
    static async getShareById(shareId) {
        const query = `
      SELECT id, content_type, content_id, user_id, platform, share_url, referral_code, metadata, created_at, updated_at
      FROM shares
      WHERE id = $1
    `;
        const result = await database_1.pgPool.query(query, [shareId]);
        return result.rows[0] || null;
    }
    // Get shares by content
    static async getSharesByContent(contentType, contentId) {
        const query = `
      SELECT id, content_type, content_id, user_id, platform, share_url, referral_code, metadata, created_at, updated_at
      FROM shares
      WHERE content_type = $1 AND content_id = $2
      ORDER BY created_at DESC
    `;
        const result = await database_1.pgPool.query(query, [contentType, contentId]);
        return result.rows;
    }
    // Get shares by user
    static async getSharesByUser(userId) {
        const query = `
      SELECT id, content_type, content_id, user_id, platform, share_url, referral_code, metadata, created_at, updated_at
      FROM shares
      WHERE user_id = $1
      ORDER BY created_at DESC
    `;
        const result = await database_1.pgPool.query(query, [userId]);
        return result.rows;
    }
    // Track share analytics
    static async trackShareClick(shareId, userAgent, ipAddress) {
        const query = `
      INSERT INTO share_analytics (share_id, user_agent, ip_address, clicked_at)
      VALUES ($1, $2, $3, NOW())
    `;
        await database_1.pgPool.query(query, [shareId, userAgent, ipAddress]);
    }
    // Get share analytics
    static async getShareAnalytics(shareId) {
        const query = `
      SELECT
        COUNT(*) as total_clicks,
        COUNT(DISTINCT ip_address) as unique_clicks,
        MAX(clicked_at) as last_clicked_at
      FROM share_analytics
      WHERE share_id = $1
    `;
        const result = await database_1.pgPool.query(query, [shareId]);
        return result.rows[0];
    }
    // Generate social media share URLs
    static generateSocialShareUrl(platform, shareUrl, title, description) {
        const encodedUrl = encodeURIComponent(shareUrl);
        const encodedTitle = title ? encodeURIComponent(title) : '';
        const encodedDescription = description ? encodeURIComponent(description) : '';
        switch (platform) {
            case 'facebook':
                return `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`;
            case 'twitter':
                let twitterUrl = `https://twitter.com/intent/tweet?url=${encodedUrl}`;
                if (encodedTitle)
                    twitterUrl += `&text=${encodedTitle}`;
                return twitterUrl;
            case 'instagram':
                // Instagram doesn't support direct sharing via URL, return the share URL
                return shareUrl;
            case 'whatsapp':
                let whatsappUrl = `https://wa.me/?text=${encodedUrl}`;
                if (encodedTitle)
                    whatsappUrl += ` ${encodedTitle}`;
                return whatsappUrl;
            case 'linkedin':
                return `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`;
            default:
                return shareUrl;
        }
    }
    // Process referral code
    static async processReferral(referralCode, newUserId) {
        const query = `
      SELECT user_id FROM shares
      WHERE referral_code = $1
      LIMIT 1
    `;
        const result = await database_1.pgPool.query(query, [referralCode]);
        if (result.rows.length > 0) {
            const referrerId = result.rows[0].user_id;
            // Record referral
            const referralQuery = `
        INSERT INTO referrals (referrer_id, referred_id, referral_code, created_at)
        VALUES ($1, $2, $3, NOW())
      `;
            await database_1.pgPool.query(referralQuery, [referrerId, newUserId, referralCode]);
            return true;
        }
        return false;
    }
    // Get referral stats
    static async getReferralStats(userId) {
        const query = `
      SELECT
        COUNT(*) as total_referrals,
        COUNT(CASE WHEN created_at >= NOW() - INTERVAL '30 days' THEN 1 END) as recent_referrals
      FROM referrals
      WHERE referrer_id = $1
    `;
        const result = await database_1.pgPool.query(query, [userId]);
        return result.rows[0];
    }
}
exports.ShareService = ShareService;
exports.default = ShareService;
