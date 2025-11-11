import { Request, Response } from 'express';
import { pgPool } from '../config/database';
import { getTimeAgo } from '../utils';

export const connectionsController = {
  // Get user connections (following/followers)
  getUserConnections: async (req: Request, res: Response) => {
    try {
      const { userId } = req.params;
      const currentUserId = req.user.id;
      const { type = 'all' } = req.query; // 'following', 'followers', 'all'

      let following: any[] = [];
      let followers: any[] = [];

      if (type === 'all' || type === 'following') {
        // Get users this user is following
        const followingResult = await pgPool.query(`
          SELECT u.id, u.username, u.first_name, u.last_name, u.avatar_url, u.faculty, u.bio
          FROM connections c
          JOIN users u ON c.following_id = u.id
          WHERE c.follower_id = $1 AND c.status = 'accepted' AND u.deleted_at IS NULL
        `, [userId]);

        following = followingResult.rows.map(user => ({
          id: user.id,
          username: user.username,
          name: `${user.first_name} ${user.last_name}`,
          avatarUrl: user.avatar_url,
          faculty: user.faculty,
          bio: user.bio,
          isFollowing: true // Since we're getting following list
        }));
      }

      if (type === 'all' || type === 'followers') {
        // Get users following this user
        const followersResult = await pgPool.query(`
          SELECT u.id, u.username, u.first_name, u.last_name, u.avatar_url, u.faculty, u.bio
          FROM connections c
          JOIN users u ON c.follower_id = u.id
          WHERE c.following_id = $1 AND c.status = 'accepted' AND u.deleted_at IS NULL
        `, [userId]);

        followers = followersResult.rows.map(user => ({
          id: user.id,
          username: user.username,
          name: `${user.first_name} ${user.last_name}`,
          avatarUrl: user.avatar_url,
          faculty: user.faculty,
          bio: user.bio,
          isFollowing: false // Check if current user follows this follower
        }));

        // Check mutual follows for followers
        if (followers.length > 0 && currentUserId !== userId) {
          const followerIds = followers.map(f => f.id);
          const mutualResult = await pgPool.query(`
            SELECT following_id
            FROM connections
            WHERE follower_id = $1 AND following_id = ANY($2) AND status = 'accepted'
          `, [currentUserId, followerIds]);

          const mutualIds = new Set(mutualResult.rows.map(r => r.following_id));
          followers.forEach(follower => {
            follower.isFollowing = mutualIds.has(follower.id);
          });
        }
      }

      res.json({
        success: true,
        connections: {
          following,
          followers,
          followingCount: following.length,
          followersCount: followers.length
        }
      });

    } catch (error) {
      console.error('Get User Connections Error:', error);
      res.status(500).json({ error: 'Failed to get user connections' });
    }
  },

  // Get connection suggestions
  getConnectionSuggestions: async (req: Request, res: Response) => {
    try {
      const userId = req.user.id;
      const limit = parseInt(req.query.limit as string) || 10;

      // Get users with similar faculty, not already connected, not blocked
      const suggestions = await pgPool.query(`
        SELECT u.id, u.username, u.first_name, u.last_name, u.avatar_url, u.faculty, u.bio,
               COUNT(c2.following_id) as mutual_friends
        FROM users u
        LEFT JOIN connections c1 ON (c1.follower_id = $1 AND c1.following_id = u.id)
                                   OR (c1.follower_id = u.id AND c1.following_id = $1)
        LEFT JOIN connections c2 ON c2.following_id = u.id AND c2.follower_id IN (
          SELECT following_id FROM connections WHERE follower_id = $1 AND status = 'accepted'
        )
        WHERE u.id != $1
          AND u.deleted_at IS NULL
          AND c1.id IS NULL
          AND u.faculty = (SELECT faculty FROM users WHERE id = $1)
          AND u.id NOT IN (
            SELECT blocked_id FROM blocks WHERE blocker_id = $1
          )
        GROUP BY u.id, u.username, u.first_name, u.last_name, u.avatar_url, u.faculty, u.bio
        ORDER BY mutual_friends DESC, u.created_at DESC
        LIMIT $2
      `, [userId, limit]);

      const result = suggestions.rows.map(user => ({
        id: user.id,
        username: user.username,
        name: `${user.first_name} ${user.last_name}`,
        avatarUrl: user.avatar_url,
        faculty: user.faculty,
        bio: user.bio,
        mutualFriends: parseInt(user.mutual_friends),
        reason: user.mutual_friends > 0 ? `${user.mutual_friends} mutual connection${user.mutual_friends > 1 ? 's' : ''}` : 'Same faculty'
      }));

      res.json({
        success: true,
        suggestions: result
      });

    } catch (error) {
      console.error('Get Connection Suggestions Error:', error);
      res.status(500).json({ error: 'Failed to get connection suggestions' });
    }
  }
};