"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.moderationQueueService = void 0;
const moderation_queue_model_1 = require("../models/mongoose/moderation-queue.model");
const database_1 = require("../config/database");
const moderation_service_1 = require("./moderation.service");
class ModerationQueueService {
    // Add content to moderation queue
    async addToQueue(item) {
        try {
            const queueItem = new moderation_queue_model_1.ModerationQueue({
                contentId: item.contentId,
                contentType: item.contentType,
                userId: item.userId,
                content: item.content,
                mediaUrls: item.mediaUrls,
                moderationResult: item.moderationResult,
                userTrustScore: item.userTrustScore,
                status: 'pending',
                autoModerated: false,
            });
            await queueItem.save();
        }
        catch (error) {
            console.error('Error adding to moderation queue:', error);
            throw new Error('Failed to add content to moderation queue');
        }
    }
    // Process content through moderation and decide action
    async processContent(contentId, contentType, userId, content, mediaUrls) {
        try {
            // Get user's trust score
            const userTrustScore = await this.getUserTrustScore(userId);
            // Moderate text content
            const textModeration = await moderation_service_1.moderationService.moderateText(content);
            // Moderate images if present
            let imageModeration;
            if (mediaUrls && mediaUrls.length > 0) {
                // For now, moderate the first image
                imageModeration = await moderation_service_1.moderationService.moderateImage(mediaUrls[0]);
            }
            // Use the more severe moderation result
            const moderationResult = imageModeration && imageModeration.severity > textModeration.severity
                ? imageModeration
                : textModeration;
            // Determine if content should be blocked
            const shouldBlock = moderation_service_1.moderationService.shouldBlockContent(moderationResult, userTrustScore);
            // Determine if content needs admin review
            const needsReview = moderation_service_1.moderationService.needsAdminReview(moderationResult, userTrustScore);
            // If content needs review or is flagged, add to queue
            if (needsReview || moderationResult.isFlagged) {
                await this.addToQueue({
                    contentId,
                    contentType,
                    userId,
                    content,
                    mediaUrls,
                    moderationResult,
                    userTrustScore,
                });
            }
            // If blocked, update user's violation count
            if (shouldBlock) {
                await this.recordViolation(userId, contentType);
            }
            return {
                shouldBlock,
                needsReview,
                moderationResult,
            };
        }
        catch (error) {
            console.error('Error processing content:', error);
            // On error, allow content but flag for review
            return {
                shouldBlock: false,
                needsReview: true,
                moderationResult: {
                    isFlagged: false,
                    categories: {},
                    category_scores: {},
                    flagged_categories: [],
                    severity: 'low',
                },
            };
        }
    }
    // Get user's trust score
    async getUserTrustScore(userId) {
        try {
            const result = await database_1.pgPool.query('SELECT trust_score FROM user_trust_scores WHERE user_id = $1', [userId]);
            if (result.rows.length > 0) {
                return result.rows[0].trust_score;
            }
            // If no trust score exists, create one with default value
            await this.initializeUserTrustScore(userId);
            return 50; // Default trust score
        }
        catch (error) {
            console.error('Error getting user trust score:', error);
            return 50; // Default fallback
        }
    }
    // Initialize trust score for new user
    async initializeUserTrustScore(userId) {
        try {
            // Get user creation date to calculate account age
            const userResult = await database_1.pgPool.query('SELECT created_at, email_verified FROM users WHERE id = $1', [userId]);
            if (userResult.rows.length > 0) {
                const user = userResult.rows[0];
                const accountAgeDays = Math.floor((Date.now() - new Date(user.created_at).getTime()) / (1000 * 60 * 60 * 24));
                await database_1.pgPool.query(`
          INSERT INTO user_trust_scores (
            user_id, trust_score, account_age_days, is_verified, created_at, updated_at
          ) VALUES ($1, $2, $3, $4, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
          ON CONFLICT (user_id) DO NOTHING
        `, [userId, 50, accountAgeDays, user.email_verified]);
            }
        }
        catch (error) {
            console.error('Error initializing user trust score:', error);
        }
    }
    // Record a violation for a user
    async recordViolation(userId, contentType) {
        try {
            const columnMap = {
                post: 'flagged_posts',
                comment: 'flagged_comments',
                message: 'flagged_messages',
                story: 'flagged_posts', // Stories count as posts for trust calculation
            };
            const column = columnMap[contentType];
            await database_1.pgPool.query(`
        UPDATE user_trust_scores
        SET
          ${column} = ${column} + 1,
          violations_count = violations_count + 1,
          last_violation_date = CURRENT_TIMESTAMP,
          trust_score = GREATEST(trust_score - 5, 0),
          updated_at = CURRENT_TIMESTAMP
        WHERE user_id = $1
      `, [userId]);
        }
        catch (error) {
            console.error('Error recording violation:', error);
        }
    }
    // Get pending moderation items
    async getPendingItems(limit = 50, offset = 0) {
        try {
            const items = await moderation_queue_model_1.ModerationQueue.find({
                status: 'pending',
            })
                .sort({ createdAt: -1 })
                .skip(offset)
                .limit(limit)
                .lean();
            return items;
        }
        catch (error) {
            console.error('Error getting pending items:', error);
            return [];
        }
    }
    // Review and approve content
    async approveContent(queueId, adminUserId, notes) {
        try {
            const result = await moderation_queue_model_1.ModerationQueue.updateOne({ _id: queueId, status: 'pending' }, {
                status: 'approved',
                reviewedBy: adminUserId,
                reviewedAt: new Date(),
                reviewNotes: notes,
            });
            return result.modifiedCount > 0;
        }
        catch (error) {
            console.error('Error approving content:', error);
            return false;
        }
    }
    // Review and reject content
    async rejectContent(queueId, adminUserId, notes) {
        try {
            // Get the queue item first
            const queueItem = await moderation_queue_model_1.ModerationQueue.findById(queueId);
            if (!queueItem)
                return false;
            // Update queue item
            await moderation_queue_model_1.ModerationQueue.updateOne({ _id: queueId, status: 'pending' }, {
                status: 'rejected',
                reviewedBy: adminUserId,
                reviewedAt: new Date(),
                reviewNotes: notes,
            });
            // Record violation for the user
            await this.recordViolation(queueItem.userId, queueItem.contentType);
            return true;
        }
        catch (error) {
            console.error('Error rejecting content:', error);
            return false;
        }
    }
    // Get moderation statistics
    async getModerationStats() {
        try {
            const stats = await moderation_queue_model_1.ModerationQueue.aggregate([
                {
                    $group: {
                        _id: '$status',
                        count: { $sum: 1 },
                    },
                },
            ]);
            const result = {
                pending: 0,
                approved: 0,
                rejected: 0,
                autoApproved: 0,
                autoRejected: 0,
                totalProcessed: 0,
            };
            stats.forEach((stat) => {
                switch (stat._id) {
                    case 'pending':
                        result.pending = stat.count;
                        break;
                    case 'approved':
                        result.approved = stat.count;
                        break;
                    case 'rejected':
                        result.rejected = stat.count;
                        break;
                    case 'auto_approved':
                        result.autoApproved = stat.count;
                        break;
                    case 'auto_rejected':
                        result.autoRejected = stat.count;
                        break;
                }
            });
            result.totalProcessed = result.approved + result.rejected + result.autoApproved + result.autoRejected;
            return result;
        }
        catch (error) {
            console.error('Error getting moderation stats:', error);
            return {
                pending: 0,
                approved: 0,
                rejected: 0,
                autoApproved: 0,
                autoRejected: 0,
                totalProcessed: 0,
            };
        }
    }
}
exports.moderationQueueService = new ModerationQueueService();
