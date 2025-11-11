"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SocialShareService = void 0;
const axios_1 = __importDefault(require("axios"));
const share_service_1 = __importDefault(require("./share.service"));
class SocialShareService {
    // Facebook sharing
    static async shareToFacebook(accessToken, shareUrl, message) {
        try {
            const response = await axios_1.default.post(`https://graph.facebook.com/v18.0/me/feed`, {
                link: shareUrl,
                message: message || 'Check this out!',
                access_token: accessToken
            });
            return response.data;
        }
        catch (error) {
            console.error('Facebook share error:', error);
            throw new Error('Failed to share to Facebook');
        }
    }
    // Twitter sharing
    static async shareToTwitter(apiKey, apiSecret, accessToken, accessTokenSecret, status) {
        try {
            // For Twitter API v2, you'd use the tweets endpoint
            // This is a simplified version - in production, use proper OAuth
            const response = await axios_1.default.post('https://api.twitter.com/2/tweets', {
                text: status
            }, {
                headers: {
                    'Authorization': `Bearer ${accessToken}`,
                    'Content-Type': 'application/json'
                }
            });
            return response.data;
        }
        catch (error) {
            console.error('Twitter share error:', error);
            throw new Error('Failed to share to Twitter');
        }
    }
    // LinkedIn sharing
    static async shareToLinkedIn(accessToken, shareUrl, title, description) {
        try {
            const response = await axios_1.default.post('https://api.linkedin.com/v2/ugcPosts', {
                author: `urn:li:person:${process.env.LINKEDIN_PERSON_URN}`,
                lifecycleState: 'PUBLISHED',
                specificContent: {
                    'com.linkedin.ugc.ShareContent': {
                        shareCommentary: {
                            text: `${title}\n\n${description || ''}\n\n${shareUrl}`
                        },
                        shareMediaCategory: 'NONE'
                    }
                },
                visibility: {
                    'com.linkedin.ugc.MemberNetworkVisibility': 'PUBLIC'
                }
            }, {
                headers: {
                    'Authorization': `Bearer ${accessToken}`,
                    'Content-Type': 'application/json'
                }
            });
            return response.data;
        }
        catch (error) {
            console.error('LinkedIn share error:', error);
            throw new Error('Failed to share to LinkedIn');
        }
    }
    // WhatsApp sharing (via URL scheme)
    static generateWhatsAppUrl(phoneNumber, message) {
        let url = 'https://wa.me/';
        if (phoneNumber) {
            url += phoneNumber;
        }
        if (message) {
            url += `?text=${encodeURIComponent(message)}`;
        }
        return url;
    }
    // Instagram sharing (limited API access, mostly URL-based)
    static generateInstagramUrl(contentUrl) {
        // Instagram doesn't have a direct sharing API for external apps
        // This would typically involve copying to clipboard or using system sharing
        return contentUrl;
    }
    // Generate share preview data
    static async generateSharePreview(contentType, contentId) {
        // This would fetch content details and generate preview data
        // Implementation depends on your content structure
        const baseUrl = process.env.BASE_URL || 'https://yourapp.com';
        const shareUrl = share_service_1.default.generateShareableLink(contentType, contentId);
        return {
            url: shareUrl,
            title: `Check out this ${contentType}`,
            description: `Shared from our app`,
            image: `${baseUrl}/api/share/preview/${contentType}/${contentId}/image`,
            siteName: 'Your App Name'
        };
    }
    // Bulk sharing to multiple platforms
    static async shareToMultiplePlatforms(platforms, shareUrl, title, description, tokens) {
        const results = [];
        for (const platform of platforms) {
            try {
                let result;
                switch (platform) {
                    case 'facebook':
                        if (tokens?.facebook) {
                            result = await this.shareToFacebook(tokens.facebook, shareUrl, title);
                        }
                        break;
                    case 'twitter':
                        if (tokens?.twitter) {
                            result = await this.shareToTwitter(this.TWITTER_API_KEY, '', // apiSecret
                            tokens.twitter, '', // accessTokenSecret
                            `${title} ${shareUrl}`);
                        }
                        break;
                    case 'linkedin':
                        if (tokens?.linkedin) {
                            result = await this.shareToLinkedIn(tokens.linkedin, shareUrl, title, description);
                        }
                        break;
                    default:
                        result = { platform, status: 'not_supported' };
                }
                results.push({
                    platform,
                    success: true,
                    result
                });
            }
            catch (error) {
                results.push({
                    platform,
                    success: false,
                    error: error instanceof Error ? error.message : 'Unknown error'
                });
            }
        }
        return results;
    }
    // Get social media metrics
    static async getSocialMetrics(shareUrl) {
        // This would aggregate metrics from different platforms
        // Implementation would depend on available APIs
        return {
            facebook: {
                shares: 0,
                likes: 0,
                comments: 0
            },
            twitter: {
                retweets: 0,
                likes: 0
            },
            linkedin: {
                shares: 0,
                likes: 0
            }
        };
    }
}
exports.SocialShareService = SocialShareService;
SocialShareService.FACEBOOK_APP_ID = process.env.FACEBOOK_APP_ID;
SocialShareService.TWITTER_API_KEY = process.env.TWITTER_API_KEY;
SocialShareService.LINKEDIN_CLIENT_ID = process.env.LINKEDIN_CLIENT_ID;
exports.default = SocialShareService;
