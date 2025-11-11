"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getModerationHistory = exports.updateUserTrustScore = exports.getUserTrustScore = exports.getModerationStats = exports.rejectContent = exports.approveContent = exports.getPendingModerationItems = void 0;
const moderation_queue_service_1 = require("../services/moderation-queue.service");
const moderation_queue_model_1 = require("../models/mongoose/moderation-queue.model");
const database_1 = require("../config/database");
const getPendingModerationItems = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;
        const offset = (page - 1) * limit;
        const items = await moderation_queue_service_1.moderationQueueService.getPendingItems(limit, offset);
        // Enrich with user information
        const enrichedItems = await Promise.all(items.map(async (item) => {
            try {
                const userResult = await database_1.pgPool.query('SELECT username, first_name, last_name, avatar_url FROM users WHERE id = $1', [item.userId]);
                const user = userResult.rows[0];
                return {
                    ...item,
                    user: user ? {
                        id: item.userId,
                        username: user.username,
                        name: `${user.first_name} ${user.last_name}`,
                        avatarUrl: user.avatar_url,
                    } : null,
                };
            }
            catch (error) {
                console.error('Error enriching moderation item:', error);
                return item;
            }
        }));
        res.json({
            success: true,
            items: enrichedItems,
            pagination: {
                page,
                limit,
                hasMore: enrichedItems.length === limit,
            },
        });
    }
    catch (error) {
        console.error('Get pending moderation items error:', error);
        res.status(500).json({ error: 'Failed to get pending moderation items' });
    }
};
exports.getPendingModerationItems = getPendingModerationItems;
const approveContent = async (req, res) => {
    try {
        const { queueId } = req.params;
        const { notes } = req.body;
        const adminUserId = req.user.id;
        const success = await moderation_queue_service_1.moderationQueueService.approveContent(queueId, adminUserId, notes);
        if (success) {
            res.json({
                success: true,
                message: 'Content approved successfully',
            });
        }
        else {
            res.status(404).json({ error: 'Content not found or already reviewed' });
        }
    }
    catch (error) {
        console.error('Approve content error:', error);
        res.status(500).json({ error: 'Failed to approve content' });
    }
};
exports.approveContent = approveContent;
const rejectContent = async (req, res) => {
    try {
        const { queueId } = req.params;
        const { notes } = req.body;
        const adminUserId = req.user.id;
        const success = await moderation_queue_service_1.moderationQueueService.rejectContent(queueId, adminUserId, notes);
        if (success) {
            res.json({
                success: true,
                message: 'Content rejected successfully',
            });
        }
        else {
            res.status(404).json({ error: 'Content not found or already reviewed' });
        }
    }
    catch (error) {
        console.error('Reject content error:', error);
        res.status(500).json({ error: 'Failed to reject content' });
    }
};
exports.rejectContent = rejectContent;
const getModerationStats = async (req, res) => {
    try {
        const stats = await moderation_queue_service_1.moderationQueueService.getModerationStats();
        // Get additional stats from database
        const additionalStats = await getAdditionalModerationStats();
        res.json({
            success: true,
            stats: {
                ...stats,
                ...additionalStats,
            },
        });
    }
    catch (error) {
        console.error('Get moderation stats error:', error);
        res.status(500).json({ error: 'Failed to get moderation stats' });
    }
};
exports.getModerationStats = getModerationStats;
const getUserTrustScore = async (req, res) => {
    try {
        const { userId } = req.params;
        const result = await database_1.pgPool.query('SELECT * FROM user_trust_scores WHERE user_id = $1', [userId]);
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'User trust score not found' });
        }
        const trustScore = result.rows[0];
        // Calculate trust level
        let trustLevel = 'low';
        if (trustScore.trust_score >= 80)
            trustLevel = 'high';
        else if (trustScore.trust_score >= 50)
            trustLevel = 'medium';
        res.json({
            success: true,
            trustScore: {
                ...trustScore,
                trust_level: trustLevel,
            },
        });
    }
    catch (error) {
        console.error('Get user trust score error:', error);
        res.status(500).json({ error: 'Failed to get user trust score' });
    }
};
exports.getUserTrustScore = getUserTrustScore;
const updateUserTrustScore = async (req, res) => {
    try {
        const { userId } = req.params;
        const { trustScore, notes } = req.body;
        const adminUserId = req.user.id;
        // Validate trust score
        if (trustScore < 0 || trustScore > 100) {
            return res.status(400).json({ error: 'Trust score must be between 0 and 100' });
        }
        await database_1.pgPool.query(`
      UPDATE user_trust_scores
      SET trust_score = $1, updated_at = CURRENT_TIMESTAMP
      WHERE user_id = $2
    `, [trustScore, userId]);
        // Log the admin action
        console.log(`Admin ${adminUserId} updated trust score for user ${userId} to ${trustScore}. Notes: ${notes || 'None'}`);
        res.json({
            success: true,
            message: 'User trust score updated successfully',
        });
    }
    catch (error) {
        console.error('Update user trust score error:', error);
        res.status(500).json({ error: 'Failed to update user trust score' });
    }
};
exports.updateUserTrustScore = updateUserTrustScore;
const getModerationHistory = async (req, res) => {
    try {
        const { userId } = req.params;
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;
        const offset = (page - 1) * limit;
        const items = await moderation_queue_model_1.ModerationQueue.find({
            userId,
            status: { $in: ['approved', 'rejected', 'auto_approved', 'auto_rejected'] },
        })
            .sort({ createdAt: -1 })
            .skip(offset)
            .limit(limit)
            .lean();
        res.json({
            success: true,
            history: items,
            pagination: {
                page,
                limit,
                hasMore: items.length === limit,
            },
        });
    }
    catch (error) {
        console.error('Get moderation history error:', error);
        res.status(500).json({ error: 'Failed to get moderation history' });
    }
};
exports.getModerationHistory = getModerationHistory;
// Helper function to get additional stats
async function getAdditionalModerationStats() {
    try {
        // Get trust score distribution
        const trustScoreStats = await database_1.pgPool.query(`
      SELECT
        COUNT(*) as total_users,
        AVG(trust_score) as avg_trust_score,
        COUNT(CASE WHEN trust_score >= 80 THEN 1 END) as high_trust_users,
        COUNT(CASE WHEN trust_score >= 50 AND trust_score < 80 THEN 1 END) as medium_trust_users,
        COUNT(CASE WHEN trust_score < 50 THEN 1 END) as low_trust_users
      FROM user_trust_scores
    `);
        // Get recent violations (last 30 days)
        const recentViolations = await database_1.pgPool.query(`
      SELECT COUNT(*) as recent_violations
      FROM user_trust_scores
      WHERE last_violation_date >= CURRENT_DATE - INTERVAL '30 days'
    `);
        return {
            trustScoreStats: trustScoreStats.rows[0],
            recentViolations: recentViolations.rows[0].recent_violations,
        };
    }
    catch (error) {
        console.error('Error getting additional moderation stats:', error);
        return {};
    }
}
