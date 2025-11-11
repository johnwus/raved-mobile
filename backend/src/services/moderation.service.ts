import OpenAI from 'openai';
import { CONFIG } from '../config';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export interface ModerationResult {
  isFlagged: boolean;
  categories: Record<string, boolean>;
  category_scores: Record<string, number>;
  flagged_categories: string[];
  severity: 'low' | 'medium' | 'high';
}

export interface ImageModerationResult {
  isFlagged: boolean;
  categories: {
    sexual: boolean;
    violence: boolean;
    hate: boolean;
    self_harm: boolean;
  };
  category_scores: {
    sexual: number;
    violence: number;
    hate: number;
    self_harm: number;
  };
  flagged_categories: string[];
  severity: 'low' | 'medium' | 'high';
}

class ModerationService {
  // Text moderation using OpenAI Moderation API
  async moderateText(text: string): Promise<ModerationResult> {
    try {
      const response = await openai.moderations.create({
        model: 'text-moderation-latest',
        input: text,
      });

      const result = response.results[0];

      // Extract flagged categories
      const flaggedCategories = Object.entries(result.categories)
        .filter(([_, flagged]) => flagged)
        .map(([category]) => category);

      // Determine severity based on categories
      let severity: 'low' | 'medium' | 'high' = 'low';
      if (flaggedCategories.some(cat =>
        ['sexual_minors', 'self_harm', 'violence_graphic'].includes(cat)
      )) {
        severity = 'high';
      } else if (flaggedCategories.some(cat =>
        ['hate_threatening', 'sexual', 'violence'].includes(cat)
      )) {
        severity = 'medium';
      }

      return {
        isFlagged: result.flagged,
        categories: result.categories as unknown as Record<string, boolean>,
        category_scores: result.category_scores as unknown as Record<string, number>,
        flagged_categories: flaggedCategories,
        severity,
      };
    } catch (error) {
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
        },
        category_scores: {
          hate: 0,
          hate_threatening: 0,
          self_harm: 0,
          sexual: 0,
          sexual_minors: 0,
          violence: 0,
          violence_graphic: 0,
        },
        flagged_categories: [],
        severity: 'low',
      };
    }
  }

  // Image moderation using OpenAI Vision API
  async moderateImage(imageUrl: string): Promise<ImageModerationResult> {
    try {
      const response = await openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: 'Analyze this image for inappropriate content. Check for: sexual content, violence, hate symbols, self-harm. Rate each category from 0-1 (0 being safe, 1 being highly inappropriate). Return only JSON with format: {"sexual": score, "violence": score, "hate": score, "self_harm": score}',
              },
              {
                type: 'image_url',
                image_url: { url: imageUrl },
              },
            ],
          },
        ],
        max_tokens: 200,
      });

      const content = response.choices[0]?.message?.content;
      if (!content) {
        throw new Error('No response from OpenAI');
      }

      const scores = JSON.parse(content);

      // Determine flagged categories (threshold > 0.5)
      const flaggedCategories = Object.entries(scores)
        .filter(([_, score]) => (score as number) > 0.5)
        .map(([category]) => category);

      // Determine severity
      let severity: 'low' | 'medium' | 'high' = 'low';
      const maxScore = Math.max(...Object.values(scores) as number[]);
      if (maxScore > 0.8) {
        severity = 'high';
      } else if (maxScore > 0.5) {
        severity = 'medium';
      }

      return {
        isFlagged: flaggedCategories.length > 0,
        categories: {
          sexual: scores.sexual > 0.5,
          violence: scores.violence > 0.5,
          hate: scores.hate > 0.5,
          self_harm: scores.self_harm > 0.5,
        },
        category_scores: scores,
        flagged_categories: flaggedCategories,
        severity,
      };
    } catch (error) {
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
  async moderateTexts(texts: string[]): Promise<ModerationResult[]> {
    const results: ModerationResult[] = [];
    for (const text of texts) {
      const result = await this.moderateText(text);
      results.push(result);
    }
    return results;
  }

  // Batch moderate multiple images
  async moderateImages(imageUrls: string[]): Promise<ImageModerationResult[]> {
    const results: ImageModerationResult[] = [];
    for (const url of imageUrls) {
      const result = await this.moderateImage(url);
      results.push(result);
    }
    return results;
  }

  // Check if content should be blocked based on severity and user trust score
  shouldBlockContent(moderationResult: ModerationResult | ImageModerationResult, userTrustScore: number = 50): boolean {
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
  needsAdminReview(moderationResult: ModerationResult | ImageModerationResult, userTrustScore: number = 50): boolean {
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

export const moderationService = new ModerationService();