import { Request, Response, NextFunction } from 'express';
import { moderationQueueService } from '../services/moderation-queue.service';

export interface ModeratedRequest extends Request {
  moderationResult?: {
    shouldBlock: boolean;
    needsReview: boolean;
    moderationResult: any;
  };
}

// Middleware to moderate post content
export const moderatePost = async (req: ModeratedRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user.id;
    const { caption, media } = req.body;

    // Skip moderation if no content
    if (!caption && (!media || media.length === 0)) {
      return next();
    }

    const content = caption || '';
    const mediaUrls = media || [];

    // Generate a temporary content ID for moderation
    const contentId = `temp_post_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;

    const moderationResult = await moderationQueueService.processContent(
      contentId,
      'post',
      userId,
      content,
      mediaUrls
    );

    // Attach moderation result to request
    req.moderationResult = moderationResult;

    // If content should be blocked, return error
    if (moderationResult.shouldBlock) {
      return res.status(400).json({
        error: 'Content violates community guidelines and cannot be posted',
        moderation: {
          flagged_categories: moderationResult.moderationResult.flagged_categories,
          severity: moderationResult.moderationResult.severity,
        },
      });
    }

    next();
  } catch (error) {
    console.error('Post moderation error:', error);
    // On moderation failure, allow content but log the error
    next();
  }
};

// Middleware to moderate comment content
export const moderateComment = async (req: ModeratedRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user.id;
    const { text } = req.body;
    const { postId } = req.params;

    // Skip moderation if no content
    if (!text) {
      return next();
    }

    // Generate a temporary content ID for moderation
    const contentId = `temp_comment_${postId}_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;

    const moderationResult = await moderationQueueService.processContent(
      contentId,
      'comment',
      userId,
      text
    );

    // Attach moderation result to request
    req.moderationResult = moderationResult;

    // If content should be blocked, return error
    if (moderationResult.shouldBlock) {
      return res.status(400).json({
        error: 'Comment violates community guidelines and cannot be posted',
        moderation: {
          flagged_categories: moderationResult.moderationResult.flagged_categories,
          severity: moderationResult.moderationResult.severity,
        },
      });
    }

    next();
  } catch (error) {
    console.error('Comment moderation error:', error);
    // On moderation failure (like OpenAI API keys issues), allow content but log the error
    // This prevents blocking legitimate comments when external services are down
    next();
  }
};

// Middleware to moderate message content
export const moderateMessage = async (req: ModeratedRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user.id;
    const { messageType, content, mediaUrl } = req.body;

    // Skip moderation for non-text messages or empty content
    if (messageType !== 'text' || !content) {
      return next();
    }

    // Generate a temporary content ID for moderation
    const contentId = `temp_message_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;

    const mediaUrls = mediaUrl ? [mediaUrl] : undefined;

    const moderationResult = await moderationQueueService.processContent(
      contentId,
      'message',
      userId,
      content,
      mediaUrls
    );

    // Attach moderation result to request
    req.moderationResult = moderationResult;

    // If content should be blocked, return error
    if (moderationResult.shouldBlock) {
      return res.status(400).json({
        error: 'Message violates community guidelines and cannot be sent',
        moderation: {
          flagged_categories: moderationResult.moderationResult.flagged_categories,
          severity: moderationResult.moderationResult.severity,
        },
      });
    }

    next();
  } catch (error) {
    console.error('Message moderation error:', error);
    // On moderation failure, allow content but log the error
    next();
  }
};

// Middleware to moderate story content
export const moderateStory = async (req: ModeratedRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user.id;
    const { type, content, text, thumbnail } = req.body;

    let contentText = '';
    let mediaUrls: string[] = [];

    if (type === 'text' && text) {
      contentText = text;
    } else if (type === 'image' || type === 'video') {
      contentText = content || '';
      if (content) mediaUrls = [content];
      if (thumbnail) mediaUrls.push(thumbnail);
    }

    // Skip moderation if no content
    if (!contentText && mediaUrls.length === 0) {
      return next();
    }

    // Generate a temporary content ID for moderation
    const contentId = `temp_story_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;

    const moderationResult = await moderationQueueService.processContent(
      contentId,
      'story',
      userId,
      contentText,
      mediaUrls.length > 0 ? mediaUrls : undefined
    );

    // Attach moderation result to request
    req.moderationResult = moderationResult;

    // If content should be blocked, return error
    if (moderationResult.shouldBlock) {
      return res.status(400).json({
        error: 'Story violates community guidelines and cannot be posted',
        moderation: {
          flagged_categories: moderationResult.moderationResult.flagged_categories,
          severity: moderationResult.moderationResult.severity,
        },
      });
    }

    next();
  } catch (error) {
    console.error('Story moderation error:', error);
    // On moderation failure, allow content but log the error
    next();
  }
};