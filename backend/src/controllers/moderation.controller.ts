import { Request, Response } from 'express';
import { moderationQueueService } from '../services/moderation-queue.service';
import { ModerationQueue } from '../models/mongoose/moderation-queue.model';
import { pgPool } from '../config/database';

export const getPendingModerationItems = async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const offset = (page - 1) * limit;

    const items = await moderationQueueService.getPendingItems(limit, offset);

    // Enrich with user information
    const enrichedItems = await Promise.all(
      items.map(async (item) => {
        try {
          const userResult = await pgPool.query(
            'SELECT username, first_name, last_name, avatar_url FROM users WHERE id = $1',
            [item.userId]
          );

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
        } catch (error) {
          console.error('Error enriching moderation item:', error);
          return item;
        }
      })
    );

    res.json({
      success: true,
      items: enrichedItems,
      pagination: {
        page,
        limit,
        hasMore: enrichedItems.length === limit,
      },
    });
  } catch (error) {
    console.error('Get pending moderation items error:', error);
    res.status(500).json({ error: 'Failed to get pending moderation items' });
  }
};

export const approveContent = async (req: Request, res: Response) => {
  try {
    const { queueId } = req.params;
    const { notes } = req.body;
    const adminUserId = req.user.id;

    const success = await moderationQueueService.approveContent(queueId, adminUserId, notes);

    if (success) {
      res.json({
        success: true,
        message: 'Content approved successfully',
      });
    } else {
      res.status(404).json({ error: 'Content not found or already reviewed' });
    }
  } catch (error) {
    console.error('Approve content error:', error);
    res.status(500).json({ error: 'Failed to approve content' });
  }
};

export const rejectContent = async (req: Request, res: Response) => {
  try {
    const { queueId } = req.params;
    const { notes } = req.body;
    const adminUserId = req.user.id;

    const success = await moderationQueueService.rejectContent(queueId, adminUserId, notes);

    if (success) {
      res.json({
        success: true,
        message: 'Content rejected successfully',
      });
    } else {
      res.status(404).json({ error: 'Content not found or already reviewed' });
    }
  } catch (error) {
    console.error('Reject content error:', error);
    res.status(500).json({ error: 'Failed to reject content' });
  }
};

export const getModerationStats = async (req: Request, res: Response) => {
  try {
    const stats = await moderationQueueService.getModerationStats();

    // Get additional stats from database
    const additionalStats = await getAdditionalModerationStats();

    res.json({
      success: true,
      stats: {
        ...stats,
        ...additionalStats,
      },
    });
  } catch (error) {
    console.error('Get moderation stats error:', error);
    res.status(500).json({ error: 'Failed to get moderation stats' });
  }
};

export const getUserTrustScore = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;

    const result = await pgPool.query(
      'SELECT * FROM user_trust_scores WHERE user_id = $1',
      [userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User trust score not found' });
    }

    const trustScore = result.rows[0];

    // Calculate trust level
    let trustLevel = 'low';
    if (trustScore.trust_score >= 80) trustLevel = 'high';
    else if (trustScore.trust_score >= 50) trustLevel = 'medium';

    res.json({
      success: true,
      trustScore: {
        ...trustScore,
        trust_level: trustLevel,
      },
    });
  } catch (error) {
    console.error('Get user trust score error:', error);
    res.status(500).json({ error: 'Failed to get user trust score' });
  }
};

export const updateUserTrustScore = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    const { trustScore, notes } = req.body;
    const adminUserId = req.user.id;

    // Validate trust score
    if (trustScore < 0 || trustScore > 100) {
      return res.status(400).json({ error: 'Trust score must be between 0 and 100' });
    }

    await pgPool.query(`
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
  } catch (error) {
    console.error('Update user trust score error:', error);
    res.status(500).json({ error: 'Failed to update user trust score' });
  }
};

export const getModerationHistory = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const offset = (page - 1) * limit;

    const items = await ModerationQueue.find({
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
  } catch (error) {
    console.error('Get moderation history error:', error);
    res.status(500).json({ error: 'Failed to get moderation history' });
  }
};

// Helper function to get additional stats
async function getAdditionalModerationStats() {
  try {
    // Get trust score distribution
    const trustScoreStats = await pgPool.query(`
      SELECT
        COUNT(*) as total_users,
        AVG(trust_score) as avg_trust_score,
        COUNT(CASE WHEN trust_score >= 80 THEN 1 END) as high_trust_users,
        COUNT(CASE WHEN trust_score >= 50 AND trust_score < 80 THEN 1 END) as medium_trust_users,
        COUNT(CASE WHEN trust_score < 50 THEN 1 END) as low_trust_users
      FROM user_trust_scores
    `);

    // Get recent violations (last 30 days)
    const recentViolations = await pgPool.query(`
      SELECT COUNT(*) as recent_violations
      FROM user_trust_scores
      WHERE last_violation_date >= CURRENT_DATE - INTERVAL '30 days'
    `);

    return {
      trustScoreStats: trustScoreStats.rows[0],
      recentViolations: recentViolations.rows[0].recent_violations,
    };
  } catch (error) {
    console.error('Error getting additional moderation stats:', error);
    return {};
  }
}