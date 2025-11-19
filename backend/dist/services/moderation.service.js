"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.moderationService = void 0;
// Google Perspective API client
class PerspectiveAPI {
    constructor(apiKey) {
        this.baseUrl = 'https://commentanalyzer.googleapis.com/v1alpha1/comments:analyze';
        this.apiKey = apiKey;
    }
    async analyzeText(text) {
        const response = await fetch(`${this.baseUrl}?key=${this.apiKey}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                comment: { text },
                languages: ['en'],
                requestedAttributes: {
                    TOXICITY: {},
                    SEVERE_TOXICITY: {},
                    IDENTITY_ATTACK: {},
                    INSULT: {},
                    PROFANITY: {},
                    THREAT: {},
                },
            }),
        });
        if (!response.ok) {
            throw new Error(`Perspective API error: ${response.status}`);
        }
        return response.json();
    }
}
const perspectiveClient = new PerspectiveAPI(process.env.PERSPECTIVE_API_KEY || 'dummy-keys');
class ModerationService {
    // Text moderation using Google Perspective API (FREE)
    async moderateText(text) {
        try {
            const response = await perspectiveClient.analyzeText(text);
            const scores = response.attributeScores;
            // Check for self-harm/death threat keywords (these should ALWAYS be high severity)
            const selfHarmPatterns = [
                /kill\s+(yourself|yourself|thyself|yourself)/i,
                /suicide/i,
                /(hang|poison|overdose|cut)\s+(yourself|yourself|thyself)/i,
                /slit\s+(wrist|throat)/i,
                /(jump|throw yourself)/i,
                /end\s+(it|your life)/i,
            ];
            const isSelfHarmThreat = selfHarmPatterns.some(pattern => pattern.test(text));
            // Map Perspective API scores to our format
            const categories = {
                hate: scores.IDENTITY_ATTACK?.summaryScore?.value > 0.5 || false,
                hate_threatening: scores.IDENTITY_ATTACK?.summaryScore?.value > 0.7 || false,
                self_harm: isSelfHarmThreat || false,
                sexual: false, // Perspective doesn't have explicit sexual category
                sexual_minors: false, // Perspective doesn't have this category
                violence: scores.THREAT?.summaryScore?.value > 0.5 || false,
                violence_graphic: scores.THREAT?.summaryScore?.value > 0.7 || false,
                profanity: scores.PROFANITY?.summaryScore?.value > 0.5 || false,
                insult: scores.INSULT?.summaryScore?.value > 0.5 || false,
            };
            const category_scores = {
                hate: scores.IDENTITY_ATTACK?.summaryScore?.value || 0,
                hate_threatening: scores.IDENTITY_ATTACK?.summaryScore?.value || 0,
                self_harm: isSelfHarmThreat ? 0.95 : 0, // Self-harm always scores high
                sexual: 0,
                sexual_minors: 0,
                violence: scores.THREAT?.summaryScore?.value || 0,
                violence_graphic: scores.THREAT?.summaryScore?.value || 0,
                profanity: scores.PROFANITY?.summaryScore?.value || 0,
                insult: scores.INSULT?.summaryScore?.value || 0,
            };
            // Extract flagged categories
            const flaggedCategories = Object.entries(categories)
                .filter(([_, flagged]) => flagged)
                .map(([category]) => category);
            // Determine severity based on scores
            let severity = 'low';
            const maxScore = Math.max(...Object.values(category_scores));
            if (maxScore > 0.8) {
                severity = 'high';
            }
            else if (maxScore > 0.6) {
                severity = 'medium';
            }
            return {
                isFlagged: flaggedCategories.length > 0,
                categories,
                category_scores,
                flagged_categories: flaggedCategories,
                severity,
            };
        }
        catch (error) {
            console.error('Text moderation error:', error);
            // Fallback: return safe result if API fails
            return {
                isFlagged: false,
                categories: {
                    hate: false,
                    hate_threatening: false,
                    self_harm: false,
                    sexual: false,
                    sexual_minors: false,
                    violence: false,
                    violence_graphic: false,
                    profanity: false,
                    insult: false,
                },
                category_scores: {
                    hate: 0,
                    hate_threatening: 0,
                    self_harm: 0,
                    sexual: 0,
                    sexual_minors: 0,
                    violence: 0,
                    violence_graphic: 0,
                    profanity: 0,
                    insult: 0,
                },
                flagged_categories: [],
                severity: 'low',
            };
        }
    }
    // Image moderation - simplified for free tier (basic checks only)
    async moderateImage(imageUrl) {
        try {
            // For free tier, we'll do basic checks without AI
            // In production, you could integrate a free image moderation service
            console.log(`Image moderation: checking ${imageUrl}`);
            // Basic URL validation and size checks could go here
            // For now, return safe result since we don't have free image moderation
            return {
                isFlagged: false,
                categories: {
                    sexual: false,
                    violence: false,
                    hate: false,
                    self_harm: false,
                },
                category_scores: {
                    sexual: 0,
                    violence: 0,
                    hate: 0,
                    self_harm: 0,
                },
                flagged_categories: [],
                severity: 'low',
            };
        }
        catch (error) {
            console.error('Image moderation error:', error);
            // Fallback: return safe result if API fails
            return {
                isFlagged: false,
                categories: {
                    sexual: false,
                    violence: false,
                    hate: false,
                    self_harm: false,
                },
                category_scores: {
                    sexual: 0,
                    violence: 0,
                    hate: 0,
                    self_harm: 0,
                },
                flagged_categories: [],
                severity: 'low',
            };
        }
    }
    // Batch moderate multiple texts
    async moderateTexts(texts) {
        const results = [];
        for (const text of texts) {
            const result = await this.moderateText(text);
            results.push(result);
        }
        return results;
    }
    // Batch moderate multiple images
    async moderateImages(imageUrls) {
        const results = [];
        for (const url of imageUrls) {
            const result = await this.moderateImage(url);
            results.push(result);
        }
        return results;
    }
    // Check if content should be blocked based on severity and user trust score
    shouldBlockContent(moderationResult, userTrustScore = 50) {
        const { severity, isFlagged } = moderationResult;
        // Always block high severity content
        if (severity === 'high') {
            return true;
        }
        // Block medium severity for low trust users
        if (severity === 'medium' && userTrustScore < 70) {
            return true;
        }
        // Block any flagged content for very low trust users
        if (isFlagged && userTrustScore < 30) {
            return true;
        }
        return false;
    }
    // Check if content needs admin review
    needsAdminReview(moderationResult, userTrustScore = 50) {
        const { severity, isFlagged } = moderationResult;
        // High severity always needs review
        if (severity === 'high') {
            return true;
        }
        // Medium severity for medium trust users
        if (severity === 'medium' && userTrustScore < 80) {
            return true;
        }
        // Any flagged content for low trust users
        if (isFlagged && userTrustScore < 50) {
            return true;
        }
        return false;
    }
}
exports.moderationService = new ModerationService();
