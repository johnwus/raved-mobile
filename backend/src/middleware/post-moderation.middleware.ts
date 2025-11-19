import { Request, Response, NextFunction } from 'express';
import { moderationService } from '../services/moderation.service';
import { pgPool } from '../config/database';
import { Post } from '../models/mongoose/post.model';
import { Comment } from '../models/mongoose/comment.model';
import { Notification } from '../models/mongoose/notification.model';
import { ModerationQueue } from '../models/mongoose/moderation-queue.model';

// ============================================================================
// POST-MODERATION MIDDLEWARE
// ============================================================================

/**
 * Only block EXTREMELY obvious threats pre-emptively
 * Everything else: accept first, moderate later
 * 
 * NOTE: Self-harm content like "kill yourself" will be caught by post-moderation
 * We only pre-block direct threats to OTHERS
 */
function hasExtremeViolation(text: string): boolean {
  if (!text) return false;

  // Normalize text: remove emojis, extra spaces, convert to lowercase
  const normalizedText = text
    .replace(/[\u{1F300}-\u{1F9FF}]/gu, '') // Remove all emojis
    .replace(/\s+/g, ' ') // Normalize whitespace
    .toLowerCase();

  // Only the most severe, unambiguous violations - DIRECT THREATS TO OTHERS
  const extremePatterns = [
    // Death threats with clear intent TO SOMEONE ELSE
    /i (will|am going to|plan to) (kill|murder|assassinate) (you|her|him|them)/i,
    /i'm (going to|will) (kill|murder|assassinate) (you|her|him|them)/i,
    /(kill|murder|assassinate) (you|her|him|them) (tonight|tomorrow|soon|now)/i,

    // Child abuse/exploitation
    /(child|kid|minor) (porn|sex|rape|abuse)/i,
    /cp link|cheese pizza/i, // common CSAM references

    // Extreme violence with weapons AGAINST OTHERS
    /(shoot|stab|bomb) (you|her|him|them|your|their)/i,

    // Worst slurs (N-word, etc.)
    /\bn[i1]gg[ae]r\b/i,

    // Terrorism/mass violence
    /(bomb|attack|shoot up) (the school|the building|everyone|here|there)/i,
  ];

  return extremePatterns.some(pattern => pattern.test(normalizedText));
}

/**
 * Comment middleware - accept immediately, moderate async
 */
export const moderateCommentPostProcessing = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { text } = req.body;
    const userId = req.user?.id;
    const { postId } = req.params;

    console.log('📝 Pre-moderation check for comment:', { text: text?.substring(0, 50), userId, postId });

    if (!text) {
      console.log('❌ No text provided');
      return res.status(400).json({
        error: 'Comment text is required',
      });
    }

    // Only pre-block EXTREME violations (death threats, CSAM, etc.)
    if (hasExtremeViolation(text)) {
      console.log('🚨 EXTREME VIOLATION - Pre-blocking:', text.substring(0, 50));

      // Send notification to user about why their comment was blocked
      if (userId) {
        try {
          const categoryMessages: Record<string, string> = {
            threat: 'threatening language',
            violence: 'violent content',
            hate: 'hate speech',
            sexual_minors: 'content involving minors',
            csam: 'illegal content',
          };

          let reason = 'threatening or violent content';
          
          if (text.includes('kill') || text.includes('murder') || text.includes('assassinate')) {
            reason = 'death threats or violent threats';
          } else if (text.includes('child') || text.includes('minor')) {
            reason = 'content involving minors';
          } else if (text.includes('bomb') || text.includes('shoot') || text.includes('attack')) {
            reason = 'threats of violence or terrorism';
          }

          await Notification.create({
            userId,
            type: 'content_removed',
            title: 'Comment blocked',
            message: `Your comment was blocked because it contains ${reason}. Please review our community guidelines.`,
            data: {
              contentType: 'comment',
              reason: 'extreme_violation',
              blockedContent: text.substring(0, 100),
              blockedAt: new Date(),
            },
            isRead: false,
          });

          console.log('📬 Blocking notification sent to user:', userId);
        } catch (notificationError) {
          console.error('Error sending blocking notification:', notificationError);
          // Continue anyway, don't let notification error block the response
        }
      }

      return res.status(400).json({
        error: 'This comment violates our community guidelines and cannot be posted',
        severity: 'extreme',
        reason: 'Your comment contains threatening or violent language. Please review our community guidelines before posting.',
      });
    }

    console.log('✅ Pre-moderation passed, allowing comment to proceed');

    // Store moderation context for post-processing
    req.moderationContext = {
      contentType: 'comment',
      userId,
      postId,
      text,
    };

    // Let the comment be created immediately
    next();
  } catch (error) {
    console.error('Pre-moderation error:', error);
    next(); // Fail open
  }
};

/**
 * Post-processing: After comment is created, moderate it
 * Call this AFTER the comment is saved in your route handler
 */
export async function moderateCommentAfterCreation(
  commentId: string,
  userId: string,
  postId: string,
  text: string
): Promise<void> {
  try {
    console.log('🔍 Post-moderating comment:', commentId);

    // Moderate the text
    const result = await moderationService.moderateText(text);

    console.log('📊 Moderation result:', {
      commentId,
      isFlagged: result.isFlagged,
      severity: result.severity,
      maxScore: Math.max(...Object.values(result.category_scores)),
    });

    // Get user trust score
    const trustScore = await getUserTrustScore(userId);

    console.log('👤 User trust score:', { userId, trustScore });

    // Check if should be removed
    const shouldRemove = moderationService.shouldBlockContent(result, trustScore);

    console.log('🛑 Moderation decision:', {
      commentId,
      shouldRemove,
      severity: result.severity,
      trustScore,
      flaggedCategories: result.flagged_categories,
    });

    if (shouldRemove) {
      console.log('🗑️  REMOVING flagged comment:', commentId, 'for:', result.flagged_categories.join(', '));

      // 1. Mark comment as removed/hidden
      await Comment.findByIdAndUpdate(commentId, {
        isRemoved: true,
        removedReason: 'automated_moderation',
        moderationResult: result,
        removedAt: new Date(),
      });

      // 2. Send notification to user
      await sendModerationNotification(
        userId,
        'comment',
        commentId,
        result.flagged_categories,
        result.severity
      );

      // 3. Record violation
      await recordViolation(userId, 'comment', result.severity);

      // 4. Notify post author (optional)
      const post = await Post.findById(postId).select('userId');
      if (post && post.userId.toString() !== userId) {
        await Notification.create({
          userId: post.userId,
          type: 'comment_removed',
          message: 'A comment on your post was automatically removed',
          data: { postId, commentId },
          isRead: false,
        });
      }

      console.log('✅ Comment removed and user notified');
    } else if (result.isFlagged) {
      // Medium severity - flag for review but keep visible
      console.log('⚠️  Comment flagged for review but kept visible:', commentId);

      await Comment.findByIdAndUpdate(commentId, {
        isFlaggedForReview: true,
        moderationResult: result,
      });

      // Add to review queue
      await addToReviewQueue({
        contentId: commentId,
        contentType: 'comment',
        userId,
        content: text,
        moderationResult: result,
        userTrustScore: trustScore,
      });
    }

  } catch (error) {
    console.error('Post-moderation error:', error);
    // Don't throw - moderation failure shouldn't break the app
  }
}

/**
 * Post middleware - accept immediately, moderate async
 */
export const moderatePostPostProcessing = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { caption } = req.body;
    const userId = req.user.id;

    // Only pre-block EXTREME violations
    if (hasExtremeViolation(caption)) {
      console.log('🚨 EXTREME VIOLATION - Pre-blocking post');

      // Send notification to user about why their post was blocked
      if (userId) {
        try {
          let reason = 'threatening or violent content';
          
          if (caption.includes('kill') || caption.includes('murder') || caption.includes('assassinate')) {
            reason = 'death threats or violent threats';
          } else if (caption.includes('child') || caption.includes('minor')) {
            reason = 'content involving minors';
          } else if (caption.includes('bomb') || caption.includes('shoot') || caption.includes('attack')) {
            reason = 'threats of violence or terrorism';
          }

          await Notification.create({
            userId,
            type: 'content_removed',
            title: 'Post blocked',
            message: `Your post was blocked because it contains ${reason}. Please review our community guidelines.`,
            metadata: {
              contentType: 'post',
              reason: 'extreme_violation',
              blockedContent: caption.substring(0, 100),
              blockedAt: new Date(),
            },
            priority: 'high',
            isRead: false,
          });

          console.log('📬 Blocking notification sent to user:', userId);
        } catch (notificationError) {
          console.error('Error sending blocking notification:', notificationError);
        }
      }

      return res.status(400).json({
        error: 'This post violates our community guidelines and cannot be posted',
        severity: 'extreme',
        reason: 'Your post contains threatening or violent language. Please review our community guidelines before posting.',
      });
    }

    req.moderationContext = {
      contentType: 'post',
      userId,
      caption,
    };

    next();
  } catch (error) {
    console.error('Pre-moderation error:', error);
    next();
  }
};

/**
 * Post-processing: After post is created
 */
export async function moderatePostAfterCreation(
  postId: string,
  userId: string,
  caption: string
): Promise<void> {
  try {
    console.log('🔍 Post-moderating post:', postId);

    const result = await moderationService.moderateText(caption);
    const trustScore = await getUserTrustScore(userId);
    const shouldRemove = moderationService.shouldBlockContent(result, trustScore);

    if (shouldRemove) {
      console.log('🗑️  Removing flagged post:', postId);

      await Post.findByIdAndUpdate(postId, {
        isRemoved: true,
        removedReason: 'automated_moderation',
        moderationResult: result,
        removedAt: new Date(),
      });

      await sendModerationNotification(
        userId,
        'post',
        postId,
        result.flagged_categories,
        result.severity
      );

      await recordViolation(userId, 'post', result.severity);

      console.log('✅ Post removed and user notified');
    } else if (result.isFlagged) {
      await Post.findByIdAndUpdate(postId, {
        isFlaggedForReview: true,
        moderationResult: result,
      });

      await addToReviewQueue({
        contentId: postId,
        contentType: 'post',
        userId,
        content: caption,
        moderationResult: result,
        userTrustScore: trustScore,
      });
    }
  } catch (error) {
    console.error('Post-moderation error:', error);
  }
};

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

async function getUserTrustScore(userId: string): Promise<number> {
  try {
    const result = await pgPool.query(
      'SELECT trust_score FROM user_trust_scores WHERE user_id = $1',
      [userId]
    );
    return result.rows[0]?.trust_score ?? 50;
  } catch (error) {
    console.error('Error getting trust score:', error);
    return 50;
  }
}

async function recordViolation(
  userId: string,
  contentType: string,
  severity: string
): Promise<void> {
  try {
    const penaltyMap = {
      high: 10,
      medium: 5,
      low: 2,
    };

    const penalty = penaltyMap[severity as keyof typeof penaltyMap] || 5;

    const columnMap: Record<string, string> = {
      post: 'flagged_posts',
      comment: 'flagged_comments',
      message: 'flagged_messages',
    };

    const column = columnMap[contentType] || 'flagged_posts';

    await pgPool.query(`
      UPDATE user_trust_scores
      SET
        ${column} = ${column} + 1,
        violations_count = violations_count + 1,
        last_violation_date = CURRENT_TIMESTAMP,
        trust_score = GREATEST(trust_score - $1, 0),
        updated_at = CURRENT_TIMESTAMP
      WHERE user_id = $2
    `, [penalty, userId]);

    console.log(`📉 User ${userId} trust score reduced by ${penalty}`);
  } catch (error) {
    console.error('Error recording violation:', error);
  }
}

async function sendModerationNotification(
  userId: string,
  contentType: string,
  contentId: string,
  flaggedCategories: string[],
  severity: string
): Promise<void> {
  try {
    const categoryMessages: Record<string, string> = {
      toxicity: 'toxic language',
      severe_toxicity: 'extremely toxic language',
      hate: 'hate speech',
      violence: 'violent content',
      threat: 'threatening language',
      profanity: 'excessive profanity',
      insult: 'personal attacks',
      self_harm: 'self-harm content',
      sexual: 'sexual content',
      sexual_minors: 'content involving minors',
    };

    const reasons = flaggedCategories
      .map(cat => categoryMessages[cat] || cat)
      .join(', ');

    const contentTypeLabel = contentType === 'comment' ? 'comment' : 'post';

    const notification = await Notification.create({
      userId,
      type: 'content_removed',
      title: `Your ${contentTypeLabel} was removed`,
      message: `Your ${contentTypeLabel} was automatically removed for violating our community guidelines: ${reasons}. Repeated violations may result in account restrictions.`,
      data: {
        contentType,
        contentId,
        flaggedCategories,
        severity,
        removedAt: new Date(),
      },
      isRead: false,
    });

    console.log(`📬 Notification sent to user ${userId}:`, notification._id);

    // TODO: Send push notification if user has it enabled
    // await sendPushNotification(userId, notification);

  } catch (error) {
    console.error('Error sending notification:', error);
  }
}

async function addToReviewQueue(item: any): Promise<void> {
  try {
    await ModerationQueue.create({
      contentId: item.contentId,
      contentType: item.contentType,
      userId: item.userId,
      content: item.content,
      moderationResult: item.moderationResult,
      userTrustScore: item.userTrustScore,
      status: 'pending',
      priority: item.moderationResult.severity === 'high' ? 'high' : 'medium',
    });

    console.log(`📋 Added to review queue: ${item.contentId}`);
  } catch (error) {
    console.error('Error adding to review queue:', error);
  }
}

// ============================================================================
// USAGE IN ROUTES
// ============================================================================

/**
 * Example: Comment creation route
 *
 * router.post('/:postId/comments',
 *   authenticate,
 *   moderateCommentPostProcessing,  // Pre-check for extreme violations
 *   async (req, res) => {
 *     const comment = await Comment.create({
 *       postId: req.params.postId,
 *       userId: req.user.id,
 *       text: req.body.text,
 *     });
 *
 *     // Moderate async (don't await)
 *     moderateCommentAfterCreation(
 *       comment._id.toString(),
 *       req.user.id,
 *       req.params.postId,
 *       req.body.text
 *     ).catch(err => console.error('Async moderation failed:', err));
 *
 *     return res.status(201).json({ comment });
 *   }
 * );
 */

/**
 * Example: Post creation route
 *
 * router.post('/',
 *   authenticate,
 *   moderatePostPostProcessing,  // Pre-check for extreme violations
 *   async (req, res) => {
 *     const post = await Post.create({
 *       userId: req.user.id,
 *       caption: req.body.caption,
 *       media: req.body.media,
 *     });
 *
 *     // Moderate async
 *     moderatePostAfterCreation(
 *       post._id.toString(),
 *       req.user.id,
 *       req.body.caption
 *     ).catch(err => console.error('Async moderation failed:', err));
 *
 *     return res.status(201).json({ post });
 *   }
 * );
 */

// Extend Express Request type
declare global {
  namespace Express {
    interface Request {
      moderationContext?: {
        contentType: string;
        userId: string;
        postId?: string;
        text?: string;
        caption?: string;
      };
    }
  }
}

export {
  hasExtremeViolation,
  getUserTrustScore,
  recordViolation,
  sendModerationNotification,
  addToReviewQueue,
};