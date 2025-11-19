import { Request, Response } from 'express';
import { pgPool } from '../config/database';
import { Post, Comment, Like, NotificationPreference } from '../models/mongoose';
import { getTimeAgo } from '../utils';

// Helper function to get media URL based on post type
function getMediaUrl(post: any): string | null {
    if (post.type === 'image') {
        return post.media?.image || null;
    } else if (post.type === 'video') {
        return post.media?.video || null;
    } else if (post.type === 'carousel' && post.media?.images && post.media.images.length > 0) {
        return post.media.images[0]; // Use first image as primary URL
    }
    return null;
}

export const usersController = {
  // Get user profile
  getProfile: async (req: Request, res: Response) => {
    try {
      const { userId } = req.params;
      const targetUserId = userId || req.user.id;

      const userResult = await pgPool.query(`
        SELECT 
          id, username, email, phone, first_name, last_name, avatar_url, bio,
          location, website, faculty, university, subscription_tier,
          followers_count, following_count, posts_count,
          created_at, updated_at
        FROM users
        WHERE id = $1 AND deleted_at IS NULL
      `, [targetUserId]);

      if (userResult.rows.length === 0) {
        return res.status(404).json({
          success: false,
          error: 'User not found'
        });
      }

      const user = userResult.rows[0];
      res.json({
        success: true,
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          phone: user.phone,
          firstName: user.first_name,
          lastName: user.last_name,
          avatarUrl: user.avatar_url,
          bio: user.bio,
          location: user.location,
          website: user.website,
          faculty: user.faculty,
          university: user.university,
          isVerified: false, // TODO: implement verification
          isPremium: user.subscription_tier === 'premium',
          followersCount: parseInt(user.followers_count) || 0,
          followingCount: parseInt(user.following_count) || 0,
          postsCount: parseInt(user.posts_count) || 0,
          createdAt: user.created_at,
          updatedAt: user.updated_at,
        }
      });
    } catch (error: any) {
      console.error('Get Profile Error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch profile'
      });
    }
  },

  // Update user profile
  updateProfile: async (req: Request, res: Response) => {
    try {
      const userId = req.user.id;
      const {
        firstName,
        lastName,
        username,
        bio,
        location,
        website,
        faculty,
      } = req.body;

      const updateFields: string[] = [];
      const values: any[] = [];
      let paramIndex = 1;

      if (firstName !== undefined) {
        updateFields.push(`first_name = $${paramIndex++}`);
        values.push(firstName);
      }
      if (lastName !== undefined) {
        updateFields.push(`last_name = $${paramIndex++}`);
        values.push(lastName);
      }
      if (username !== undefined) {
        updateFields.push(`username = $${paramIndex++}`);
        values.push(username.toLowerCase());
      }
      if (bio !== undefined) {
        updateFields.push(`bio = $${paramIndex++}`);
        values.push(bio);
      }
      if (location !== undefined) {
        updateFields.push(`location = $${paramIndex++}`);
        values.push(location);
      }
      if (website !== undefined) {
        updateFields.push(`website = $${paramIndex++}`);
        values.push(website);
      }
      if (faculty !== undefined) {
        updateFields.push(`faculty = $${paramIndex++}`);
        values.push(faculty);
      }

      if (updateFields.length === 0) {
        return res.status(400).json({
          success: false,
          error: 'No fields to update'
        });
      }

      updateFields.push(`updated_at = CURRENT_TIMESTAMP`);
      values.push(userId);

      await pgPool.query(`
        UPDATE users
        SET ${updateFields.join(', ')}
        WHERE id = $${paramIndex}
      `, values);

      // Get updated profile
      const userResult = await pgPool.query(`
        SELECT id, username, first_name, last_name, avatar_url, bio, location, website, faculty
        FROM users
        WHERE id = $1
      `, [userId]);

      res.json({
        success: true,
        user: {
          id: userResult.rows[0].id,
          username: userResult.rows[0].username,
          firstName: userResult.rows[0].first_name,
          lastName: userResult.rows[0].last_name,
          avatarUrl: userResult.rows[0].avatar_url,
          bio: userResult.rows[0].bio,
          location: userResult.rows[0].location,
          website: userResult.rows[0].website,
          faculty: userResult.rows[0].faculty,
        }
      });
    } catch (error: any) {
      console.error('Update Profile Error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to update profile'
      });
    }
  },

  // Update avatar
  updateAvatar: async (req: Request, res: Response) => {
    try {
      const userId = req.user.id;
      const { avatarUrl } = req.body;

      await pgPool.query(`
        UPDATE users
        SET avatar_url = $1, updated_at = CURRENT_TIMESTAMP
        WHERE id = $2
      `, [avatarUrl, userId]);

      res.json({
        success: true,
        avatarUrl
      });
    } catch (error: any) {
      console.error('Update Avatar Error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to update avatar'
      });
    }
  },

  // Get user stats
  getUserStats: async (req: Request, res: Response) => {
    try {
      const { userId } = req.params;
      const targetUserId = userId || req.user.id;

      const statsResult = await pgPool.query(`
        SELECT 
          posts_count, followers_count, following_count
        FROM users
        WHERE id = $1 AND deleted_at IS NULL
      `, [targetUserId]);

      if (statsResult.rows.length === 0) {
        return res.status(404).json({
          success: false,
          error: 'User not found'
        });
      }

      const stats = statsResult.rows[0];

      // Get total likes received
      const likesResult = await Like.aggregate([
        {
          $match: {
            targetType: 'post',
            targetId: { $exists: true }
          }
        },
        {
          $lookup: {
            from: 'posts',
            localField: 'targetId',
            foreignField: '_id',
            as: 'post'
          }
        },
        {
          $match: {
            'post.userId': targetUserId
          }
        },
        {
          $count: 'total'
        }
      ]);

      const totalLikes = likesResult[0]?.total || 0;

      res.json({
        success: true,
        stats: {
          postCount: parseInt(stats.posts_count) || 0,
          followerCount: parseInt(stats.followers_count) || 0,
          followingCount: parseInt(stats.following_count) || 0,
          likeCount: totalLikes,
        }
      });
    } catch (error: any) {
      console.error('Get User Stats Error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch user stats'
      });
    }
  },

  // Get user posts
  getUserPosts: async (req: Request, res: Response) => {
    try {
      const { userId } = req.params;
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;
      const skip = (page - 1) * limit;

      const posts = await Post.find({
        userId,
        deletedAt: null
      })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

      // Get user info
      const userResult = await pgPool.query(`
        SELECT id, username, first_name, last_name, avatar_url, faculty
        FROM users WHERE id = $1
      `, [userId]);

      if (userResult.rows.length === 0) {
        return res.status(404).json({
          success: false,
          error: 'User not found'
        });
      }

      const user = userResult.rows[0];
      const userMap = {
        id: user.id,
        username: user.username,
        name: `${user.first_name} ${user.last_name}`,
        avatarUrl: user.avatar_url,
        faculty: user.faculty
      };

      // Check if current user liked each post
      const currentUserId = req.user.id;
      const postIds = posts.map(p => p._id.toString());
      const likes = await Like.find({
        userId: currentUserId,
        targetId: { $in: postIds },
        targetType: 'post'
      }).lean();

      const likedPostIds = new Set(likes.map(l => l.targetId));

      const enrichedPosts = posts.map(post => ({
        id: post._id.toString(),
        user: userMap,
        caption: post.caption || '',
        media: {
          type: post.type,
          url: getMediaUrl(post),
          thumbnail: post.media?.thumbnail,
          items: post.media?.images || []
        },
        tags: post.tags || [],
        likes: post.likesCount || 0,
        comments: post.commentsCount || 0,
        shares: post.sharesCount || 0,
        timeAgo: getTimeAgo(post.createdAt),
        isLiked: likedPostIds.has(post._id.toString()),
        liked: likedPostIds.has(post._id.toString()),
        saved: false,
        forSale: post.isForSale,
        price: post.saleDetails?.price,
      }));

      res.json({
        success: true,
        posts: enrichedPosts,
        pagination: {
          page,
          limit,
          hasMore: posts.length === limit
        }
      });
    } catch (error: any) {
      console.error('Get User Posts Error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch user posts'
      });
    }
  },

  // Get user comments
  getUserComments: async (req: Request, res: Response) => {
    try {
      const { userId } = req.params;
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;
      const skip = (page - 1) * limit;

      const comments = await Comment.find({
        userId,
        deletedAt: null
      })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

      // Get post info for each comment
      const postIds = [...new Set(comments.map(c => c.postId))];
      const posts = await Post.find({
        _id: { $in: postIds }
      }).lean();

      const postMap: any = {};
      posts.forEach(post => {
        postMap[post._id.toString()] = post;
      });

      const enrichedComments = comments.map(comment => ({
        id: comment._id.toString(),
        text: comment.text,
        postId: comment.postId,
        post: postMap[comment.postId] ? {
          id: postMap[comment.postId]._id.toString(),
          caption: postMap[comment.postId].caption,
          media: postMap[comment.postId].media,
        } : null,
        timeAgo: getTimeAgo(comment.createdAt),
      }));

      res.json({
        success: true,
        comments: enrichedComments,
        pagination: {
          page,
          limit,
          hasMore: comments.length === limit
        }
      });
    } catch (error: any) {
      console.error('Get User Comments Error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch user comments'
      });
    }
  },

  // Get user liked posts
  getUserLikedPosts: async (req: Request, res: Response) => {
    try {
      const { userId } = req.params;
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;
      const skip = (page - 1) * limit;

      const likes = await Like.find({
        userId,
        targetType: 'post'
      })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

      const postIds = likes.map(l => l.targetId);
      const posts = await Post.find({
        _id: { $in: postIds },
        deletedAt: null
      }).lean();

      // Get user info for each post
      const userIds = [...new Set(posts.map(p => p.userId))];
      const users = await pgPool.query(`
        SELECT id, username, first_name, last_name, avatar_url, faculty
        FROM users WHERE id = ANY($1)
      `, [userIds]);

      const userMap: any = {};
      users.rows.forEach(u => {
        userMap[u.id] = {
          id: u.id,
          username: u.username,
          name: `${u.first_name} ${u.last_name}`,
          avatarUrl: u.avatar_url,
          faculty: u.faculty
        };
      });

      const enrichedPosts = posts.map(post => ({
        id: post._id.toString(),
        user: userMap[post.userId] || { id: post.userId, name: 'Unknown User' },
        caption: post.caption || '',
        media: {
          type: post.type,
          url: getMediaUrl(post),
          thumbnail: post.media?.thumbnail,
          items: post.media?.images || []
        },
        tags: post.tags || [],
        likes: post.likesCount || 0,
        comments: post.commentsCount || 0,
        shares: post.sharesCount || 0,
        timeAgo: getTimeAgo(post.createdAt),
        isLiked: true,
        liked: true,
        saved: false,
        forSale: post.isForSale,
        price: post.saleDetails?.price,
      }));

      res.json({
        success: true,
        posts: enrichedPosts,
        pagination: {
          page,
          limit,
          hasMore: likes.length === limit
        }
      });
    } catch (error: any) {
      console.error('Get User Liked Posts Error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch liked posts'
      });
    }
  },

// Get user saved posts (bookmarked)
  getUserSavedPosts: async (req: Request, res: Response) => {
    try {
      const { userId } = req.params as any;
      const targetUserId = userId || req.user.id;
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;
      const skip = (page - 1) * limit;

      const saved = await (await import('../models/mongoose')).SavedPost.find({ userId: targetUserId })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean();

      const postIds = saved.map(s => s.postId);
      if (postIds.length === 0) {
        return res.json({ success: true, posts: [], pagination: { page, limit, hasMore: false } });
      }

      const posts = await (await import('../models/mongoose')).Post.find({
        _id: { $in: postIds },
        deletedAt: null
      }).lean();

      // Get user info for each post
      const authorIds = [...new Set(posts.map(p => p.userId))];
      const users = await pgPool.query(`
        SELECT id, username, first_name, last_name, avatar_url, faculty
        FROM users WHERE id = ANY($1)
      `, [authorIds]);

      const userMap: any = {};
      users.rows.forEach(u => {
        userMap[u.id] = {
          id: u.id,
          username: u.username,
          name: `${u.first_name} ${u.last_name}`,
          avatarUrl: u.avatar_url,
          faculty: u.faculty
        };
      });

      const enrichedPosts = posts.map(post => ({
        id: post._id.toString(),
        user: userMap[post.userId] || { id: post.userId, name: 'Unknown User' },
        caption: post.caption || '',
        media: {
          type: post.type,
          url: getMediaUrl(post),
          thumbnail: post.media?.thumbnail,
          items: post.media?.images || []
        },
        tags: post.tags || [],
        likes: post.likesCount || 0,
        comments: post.commentsCount || 0,
        shares: post.sharesCount || 0,
        timeAgo: getTimeAgo(post.createdAt),
        liked: false,
        saved: true,
        forSale: post.isForSale,
        price: post.saleDetails?.price,
      }));

      res.json({
        success: true,
        posts: enrichedPosts,
        pagination: {
          page,
          limit,
          hasMore: saved.length === limit
        }
      });
    } catch (error: any) {
      console.error('Get User Saved Posts Error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch saved posts'
      });
    }
  },

  // Get user connections (followers/following)
  getConnections: async (req: Request, res: Response) => {
    try {
      const { userId } = req.params;
      const targetUserId = userId || req.user.id;
      const currentUserId = req.user.id;
      const { type = 'all' } = req.query; // 'following', 'followers', 'all'

      let following: any[] = [];
      let followers: any[] = [];

      if (type === 'all' || type === 'following') {
        // Get users this user is following
        const followingResult = await pgPool.query(`
          SELECT c.created_at as connected_at, u.id, u.username, u.first_name, u.last_name, u.avatar_url, u.faculty
          FROM connections c
          JOIN users u ON c.following_id = u.id
          WHERE c.follower_id = $1 AND c.status = 'accepted' AND u.deleted_at IS NULL
          ORDER BY c.created_at DESC
        `, [targetUserId]);

        following = followingResult.rows.map(user => ({
          id: user.id,
          username: user.username,
          firstName: user.first_name,
          lastName: user.last_name,
          name: `${user.first_name} ${user.last_name}`,
          avatarUrl: user.avatar_url,
          faculty: user.faculty,
          isMutual: false, // Will be calculated below
          connectedAt: user.connected_at,
          isFollowing: true // Since we're getting following list
        }));
      }

      if (type === 'all' || type === 'followers') {
        // Get users following this user
        const followersResult = await pgPool.query(`
          SELECT c.created_at as connected_at, u.id, u.username, u.first_name, u.last_name, u.avatar_url, u.faculty
          FROM connections c
          JOIN users u ON c.follower_id = u.id
          WHERE c.following_id = $1 AND c.status = 'accepted' AND u.deleted_at IS NULL
          ORDER BY c.created_at DESC
        `, [targetUserId]);

        followers = followersResult.rows.map(user => ({
          id: user.id,
          username: user.username,
          firstName: user.first_name,
          lastName: user.last_name,
          name: `${user.first_name} ${user.last_name}`,
          avatarUrl: user.avatar_url,
          faculty: user.faculty,
          isMutual: false, // Will be calculated below
          connectedAt: user.connected_at,
          isFollowing: false // Check if current user follows this follower
        }));

        // Check mutual follows for followers
        if (followers.length > 0 && currentUserId !== targetUserId) {
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

      // Calculate mutual connections
      if (type === 'all' && following.length > 0 && followers.length > 0) {
        const followingIds = new Set(following.map(f => f.id));
        followers.forEach(follower => {
          follower.isMutual = followingIds.has(follower.id);
        });
        following.forEach(followingUser => {
          const followerIds = new Set(followers.map(f => f.id));
          followingUser.isMutual = followerIds.has(followingUser.id);
        });
      }

      res.json({
        success: true,
        following,
        followers,
        followingCount: following.length,
        followersCount: followers.length
      });
    } catch (error: any) {
      console.error('Get Connections Error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch connections'
      });
    }
  },

  // Follow user
  followUser: async (req: Request, res: Response) => {
    try {
      const followerId = req.user.id;
      const { userId: followingId } = req.params;

      const { connectionService } = await import('../services/connection.service');
      const status = await connectionService.sendFollowRequest(followerId, followingId);

      res.json({
        success: true,
        message: status === 'pending' ? 'Follow request sent' : 'Successfully followed user',
        status
      });
    } catch (error: any) {
      console.error('Follow User Error:', error);
      res.status(400).json({
        success: false,
        error: error.message || 'Failed to follow user'
      });
    }
  },

  // Unfollow user
  unfollowUser: async (req: Request, res: Response) => {
    try {
      const followerId = req.user.id;
      const { userId: followingId } = req.params;

      // Check if connection exists
      const connectionResult = await pgPool.query(
        'SELECT id, status FROM connections WHERE follower_id = $1 AND following_id = $2',
        [followerId, followingId]
      );

      if (connectionResult.rows.length === 0) {
        return res.status(404).json({
          success: false,
          error: 'Connection not found'
        });
      }

      // Delete connection
      await pgPool.query(
        'DELETE FROM connections WHERE follower_id = $1 AND following_id = $2',
        [followerId, followingId]
      );

      // Update counts if it was an accepted connection
      if (connectionResult.rows[0].status === 'accepted') {
        await pgPool.query(
          'UPDATE users SET following_count = GREATEST(0, following_count - 1) WHERE id = $1',
          [followerId]
        );
        await pgPool.query(
          'UPDATE users SET followers_count = GREATEST(0, followers_count - 1) WHERE id = $1',
          [followingId]
        );
      }

      res.json({
        success: true,
        message: 'Successfully unfollowed user'
      });
    } catch (error: any) {
      console.error('Unfollow User Error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to unfollow user'
      });
    }
  },

  // Get user settings
  getUserSettings: async (req: Request, res: Response) => {
    try {
      const userId = req.user.id;
      
      // First, ensure all settings columns exist
      await pgPool.query(`
        ALTER TABLE users 
        ADD COLUMN IF NOT EXISTS profile_visibility VARCHAR(20) DEFAULT 'public',
        ADD COLUMN IF NOT EXISTS show_online_status BOOLEAN DEFAULT TRUE,
        ADD COLUMN IF NOT EXISTS allow_messages VARCHAR(20) DEFAULT 'everyone',
        ADD COLUMN IF NOT EXISTS language VARCHAR(10) DEFAULT 'en',
        ADD COLUMN IF NOT EXISTS date_format VARCHAR(20) DEFAULT 'DD/MM/YYYY',
        ADD COLUMN IF NOT EXISTS currency VARCHAR(10) DEFAULT 'GHS',
        ADD COLUMN IF NOT EXISTS timezone VARCHAR(50) DEFAULT 'UTC',
        ADD COLUMN IF NOT EXISTS analytics_enabled BOOLEAN DEFAULT TRUE,
        ADD COLUMN IF NOT EXISTS personalized_ads_enabled BOOLEAN DEFAULT TRUE;
      `);
      
      const userResult = await pgPool.query(`
        SELECT 
          profile_visibility, show_online_status, allow_messages,
          language, date_format, currency, timezone,
          is_private, read_receipts, allow_downloads, allow_story_sharing,
          analytics_enabled, personalized_ads_enabled
        FROM users
        WHERE id = $1
      `, [userId]);

      if (userResult.rows.length === 0) {
        return res.status(404).json({
          success: false,
          error: 'User not found'
        });
      }

      const user = userResult.rows[0];
      res.json({
        success: true,
        settings: {
          profileVisibility: user.profile_visibility || 'public',
          showOnlineStatus: user.show_online_status !== false,
          allowMessages: user.allow_messages || 'everyone',
          language: user.language || 'en',
          dateFormat: user.date_format || 'DD/MM/YYYY',
          currency: user.currency || 'GHS',
          timezone: user.timezone || 'UTC',
          isPrivate: user.is_private || false,
          readReceipts: user.read_receipts !== false,
          allowDownloads: user.allow_downloads !== false,
          allowStorySharing: user.allow_story_sharing !== false,
          analytics: user.analytics_enabled !== false,
          personalizedAds: user.personalized_ads_enabled !== false,
        }
      });
    } catch (error: any) {
      console.error('Get User Settings Error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch user settings'
      });
    }
  },

  // Update user settings
  updateUserSettings: async (req: Request, res: Response) => {
    try {
      const userId = req.user.id;
      
      // First, ensure all settings columns exist
      await pgPool.query(`
        ALTER TABLE users 
        ADD COLUMN IF NOT EXISTS profile_visibility VARCHAR(20) DEFAULT 'public',
        ADD COLUMN IF NOT EXISTS show_online_status BOOLEAN DEFAULT TRUE,
        ADD COLUMN IF NOT EXISTS allow_messages VARCHAR(20) DEFAULT 'everyone',
        ADD COLUMN IF NOT EXISTS language VARCHAR(10) DEFAULT 'en',
        ADD COLUMN IF NOT EXISTS date_format VARCHAR(20) DEFAULT 'DD/MM/YYYY',
        ADD COLUMN IF NOT EXISTS currency VARCHAR(10) DEFAULT 'GHS',
        ADD COLUMN IF NOT EXISTS timezone VARCHAR(50) DEFAULT 'UTC',
        ADD COLUMN IF NOT EXISTS analytics_enabled BOOLEAN DEFAULT TRUE,
        ADD COLUMN IF NOT EXISTS personalized_ads_enabled BOOLEAN DEFAULT TRUE;
      `);
      
      const {
        profileVisibility,
        showOnlineStatus,
        allowMessages,
        language,
        dateFormat,
        currency,
        timezone,
        isPrivate,
        readReceipts,
        allowDownloads,
        allowStorySharing,
        analytics,
        personalizedAds,
      } = req.body;

      const updateFields: string[] = [];
      const values: any[] = [];
      let paramIndex = 1;

      if (profileVisibility !== undefined) {
        updateFields.push(`profile_visibility = $${paramIndex++}`);
        values.push(profileVisibility);
      }
      if (showOnlineStatus !== undefined) {
        updateFields.push(`show_online_status = $${paramIndex++}`);
        values.push(showOnlineStatus);
      }
      if (allowMessages !== undefined) {
        updateFields.push(`allow_messages = $${paramIndex++}`);
        values.push(allowMessages);
      }
      if (language !== undefined) {
        updateFields.push(`language = $${paramIndex++}`);
        values.push(language);
      }
      if (dateFormat !== undefined) {
        updateFields.push(`date_format = $${paramIndex++}`);
        values.push(dateFormat);
      }
      if (currency !== undefined) {
        updateFields.push(`currency = $${paramIndex++}`);
        values.push(currency);
      }
      if (timezone !== undefined) {
        updateFields.push(`timezone = $${paramIndex++}`);
        values.push(timezone);
      }
      if (isPrivate !== undefined) {
        updateFields.push(`is_private = $${paramIndex++}`);
        values.push(isPrivate);
      }
      if (readReceipts !== undefined) {
        updateFields.push(`read_receipts = $${paramIndex++}`);
        values.push(readReceipts);
      }
      if (allowDownloads !== undefined) {
        updateFields.push(`allow_downloads = $${paramIndex++}`);
        values.push(allowDownloads);
      }
      if (allowStorySharing !== undefined) {
        updateFields.push(`allow_story_sharing = $${paramIndex++}`);
        values.push(allowStorySharing);
      }
      if (analytics !== undefined) {
        updateFields.push(`analytics_enabled = $${paramIndex++}`);
        values.push(analytics);
      }
      if (personalizedAds !== undefined) {
        updateFields.push(`personalized_ads_enabled = $${paramIndex++}`);
        values.push(personalizedAds);
      }

      if (updateFields.length === 0) {
        return res.status(400).json({
          success: false,
          error: 'No fields to update'
        });
      }

      updateFields.push(`updated_at = CURRENT_TIMESTAMP`);
      values.push(userId);

      await pgPool.query(`
        UPDATE users
        SET ${updateFields.join(', ')}
        WHERE id = $${paramIndex}
      `, values);

      res.json({
        success: true,
        message: 'Settings updated successfully'
      });
    } catch (error: any) {
      console.error('Update User Settings Error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to update user settings'
      });
    }
  },

  // Get notification preferences from MongoDB
  getNotificationPreferences: async (req: Request, res: Response) => {
    try {
      const userId = req.user.id;

      // Use findOneAndUpdate with upsert to avoid race condition
      const preferences = await NotificationPreference.findOneAndUpdate(
        { userId },
        {
          $setOnInsert: {
            userId,
            pushEnabled: true,
            likes: true,
            comments: true,
            follows: true,
            mentions: true,
            messages: true,
            events: true,
            sales: true,
            marketing: false,
            soundEnabled: true,
            vibrationEnabled: true,
          }
        },
        { upsert: true, new: true }
      );

      res.json({
        success: true,
        preferences: {
          pushEnabled: preferences.pushEnabled,
          likes: preferences.likes,
          comments: preferences.comments,
          follows: preferences.follows,
          mentions: preferences.mentions,
          messages: preferences.messages,
          events: preferences.events,
          sales: preferences.sales,
          marketing: preferences.marketing,
          soundEnabled: preferences.soundEnabled,
          vibrationEnabled: preferences.vibrationEnabled,
        }
      });

    } catch (error) {
      console.error('Get Notification Preferences Error:', error);
      res.status(500).json({ 
        success: false,
        error: 'Failed to get notification preferences',
        details: error instanceof Error ? error.message : String(error)
      });
    }
  },

  // Update notification preferences in MongoDB
  updateNotificationPreferences: async (req: Request, res: Response) => {
    try {
      const userId = req.user.id;
      let { preferences } = req.body;

      console.log('📝 Raw request body:', req.body);
      console.log('📝 Raw preferences:', preferences, 'type:', typeof preferences);

      // Handle if preferences is stringified
      if (typeof preferences === 'string') {
        console.log('⚠️  Preferences is a string, attempting to parse');
        try {
          preferences = JSON.parse(preferences);
        } catch (e) {
          console.error('❌ Failed to parse preferences string:', e);
          return res.status(400).json({
            success: false,
            error: 'Preferences must be a valid object'
          });
        }
      }

      if (!preferences || typeof preferences !== 'object') {
        console.error('❌ Preferences validation failed:', { preferences, type: typeof preferences });
        return res.status(400).json({
          success: false,
          error: 'Preferences object is required'
        });
      }

      // Valid preference keys
      const validKeys = [
        'pushEnabled', 'likes', 'comments', 'follows', 'mentions',
        'messages', 'events', 'sales', 'marketing', 'soundEnabled', 'vibrationEnabled'
      ];

      // Create update object with only valid keys and boolean values
      const updateData: any = {};
      for (const key of validKeys) {
        if (key in preferences && typeof preferences[key] === 'boolean') {
          updateData[key] = preferences[key];
        }
      }

      console.log('🔄 Update data:', updateData);

      if (Object.keys(updateData).length === 0) {
        return res.status(400).json({
          success: false,
          error: 'No valid boolean preferences provided'
        });
      }

      // Update preferences (create if doesn't exist)
      const updatedPreferences = await NotificationPreference.findOneAndUpdate(
        { userId },
        updateData,
        { new: true, upsert: true }
      );

      console.log('✅ Preferences updated:', updatedPreferences);

      res.json({
        success: true,
        message: 'Notification preferences updated successfully',
        preferences: {
          pushEnabled: updatedPreferences.pushEnabled,
          likes: updatedPreferences.likes,
          comments: updatedPreferences.comments,
          follows: updatedPreferences.follows,
          mentions: updatedPreferences.mentions,
          messages: updatedPreferences.messages,
          events: updatedPreferences.events,
          sales: updatedPreferences.sales,
          marketing: updatedPreferences.marketing,
          soundEnabled: updatedPreferences.soundEnabled,
          vibrationEnabled: updatedPreferences.vibrationEnabled,
        }
      });

    } catch (error) {
      console.error('❌ Update Notification Preferences Error:', error);
      res.status(500).json({ 
        success: false,
        error: 'Failed to update notification preferences',
        details: error instanceof Error ? error.message : String(error)
      });
    }
  },
};

