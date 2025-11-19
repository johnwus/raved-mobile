import { Request, Response } from 'express';
import { validationResult } from 'express-validator';
import { Post, Comment, Like, SavedPost } from '../models/mongoose';
import { pgPool } from '../config/database';
import { getTimeAgo } from '../utils';
import OfflineDataService from '../services/offline-data.service';
import DataVersioningService from '../services/data-versioning.service';
import SelectiveCacheService from '../services/selective-cache.service';
import OfflineAnalyticsService from '../services/offline-analytics.service';
import { moderateCommentAfterCreation } from '../middleware/post-moderation.middleware';

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

export const createPost = async (req: Request, res: Response) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const userId = req.user.id;
        const {
            type,
            caption,
            media,
            location,
            tags,
            brand,
            occasion,
            visibility,
            isForSale,
            saleDetails,
            offline = false // Check if this is an offline operation
        } = req.body;
        
        // Prepare post data
        const postData = {
            userId,
            type,
            caption,
            media,
            location,
            tags: tags || [],
            brand,
            occasion,
            visibility: visibility || 'public',
            isForSale: isForSale || false,
            saleDetails: isForSale ? {
                itemName: saleDetails.itemName,
                price: saleDetails.price,
                originalPrice: saleDetails.originalPrice,
                category: saleDetails.category,
                condition: saleDetails.condition,
                size: saleDetails.size,
                brand: saleDetails.brand,
                color: saleDetails.color,
                material: saleDetails.material,
                paymentMethods: saleDetails.paymentMethods || ['momo'],
                meetupLocation: saleDetails.meetupLocation,
                sellerPhone: saleDetails.sellerPhone,
                negotiable: saleDetails.negotiable || false
            } : null,
            faculty: req.user.faculty
        };

        if (offline) {
            // Store for offline processing
            const offlineEntity = {
                entityType: 'post',
                entityId: `temp_${Date.now()}_${Math.random()}`,
                data: postData,
                metadata: {
                    operation: 'create',
                    offline: true,
                    createdAt: new Date(),
                    deviceId: req.headers['x-device-id'] as string,
                },
                expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
                priority: 1,
                tags: ['post', 'create', 'offline'],
            };

            const storedData = await OfflineDataService.storeOfflineData(userId, offlineEntity);

            // Track offline analytics
            await OfflineAnalyticsService.queueAnalyticsEvent({
                userId,
                sessionId: req.headers['x-session-id'] as string || `offline_${Date.now()}`,
                eventType: 'offline_post_create',
                eventCategory: 'offline_actions',
                eventAction: 'queued',
                timestamp: new Date(),
                offline: true,
                metadata: {
                    entityType: 'post',
                },
            });

            return res.json({
                success: true,
                message: 'Post queued for offline creation',
                offline: true,
                offlineId: storedData.id,
                post: {
                    id: offlineEntity.entityId,
                    ...postData,
                    offline: true,
                }
            });
        }

        // Handle sale post creation
        if (isForSale && saleDetails) {
            // Create store item entry for marketplace first to obtain id
            const storeInsert = await pgPool.query(`
                INSERT INTO store_items (
                    seller_id, name, description, price, original_price,
                    category, condition, size, brand, color, material,
                    images, payment_methods, meetup_location, seller_phone,
                    status, created_at
                ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, CURRENT_TIMESTAMP)
                RETURNING id
            `, [
                userId,
                saleDetails.itemName,
                caption || '',
                saleDetails.price,
                saleDetails.originalPrice || null,
                saleDetails.category,
                saleDetails.condition,
                saleDetails.size || null,
                saleDetails.brand || null,
                saleDetails.color || null,
                saleDetails.material || null,
                media || [],
                saleDetails.paymentMethods || ['momo'],
                saleDetails.meetupLocation || null,
                saleDetails.sellerPhone || null,
                'active'
            ]);
            const storeItemId = storeInsert.rows[0].id;

            // Create sale post in MongoDB with direct link to store item
            const salePost = new Post({
                ...postData,
                saleDetails: {
                    ...postData.saleDetails,
                    storeItemId,
                }
            });
            await salePost.save();

            // Update user's post count in PostgreSQL
            await pgPool.query(
                'UPDATE users SET posts_count = posts_count + 1 WHERE id = $1',
                [userId]
            );

            // Create version record
            await DataVersioningService.createVersion({
                entityType: 'post',
                entityId: salePost._id.toString(),
                data: postData,
                userId,
                operation: 'create',
                metadata: {
                    isForSale: true,
                    saleDetails,
                },
            });

            res.json({
                success: true,
                message: 'Sale post created successfully',
                post: {
                    id: salePost._id,
                    userId: salePost.userId,
                    type: salePost.type,
                    caption: salePost.caption,
                    media: salePost.media,
                    createdAt: salePost.createdAt,
                    isForSale: true,
                    saleDetails: {
                        ...salePost.saleDetails,
                        storeItemId,
                    }
                }
            });
        } else {
                // Create post in MongoDB
                const post = new Post(postData);

                await post.save();

                // Update user's post count in PostgreSQL
                await pgPool.query(
                    'UPDATE users SET posts_count = posts_count + 1 WHERE id = $1',
                    [userId]
                );

                // Create version record
                await DataVersioningService.createVersion({
                    entityType: 'post',
                    entityId: post._id.toString(),
                    data: postData,
                    userId,
                    operation: 'create',
                });

                // Cache the post data
                await SelectiveCacheService.registerPolicy({
                    entityType: 'post',
                    cacheable: true,
                    strategies: [{
                        key: 'content',
                        ttl: 600, // 10 minutes
                        priority: 'high',
                    }],
                    fallbackStrategy: 'cache_first',
                });

                res.json({
                    success: true,
                    message: 'Post created successfully',
                    post: {
                        id: post._id,
                        userId: post.userId,
                        type: post.type,
                        caption: post.caption,
                        media: post.media,
                        createdAt: post.createdAt,
                        isForSale: post.isForSale
                    }
                });
            }        
    } catch (error) {
        console.error('Create Post Error:', error);
        res.status(500).json({ error: 'Failed to create post' });
    }
};

export const savePost = async (req: Request, res: Response) => {
    const userId = req.user.id;
    const { postId } = req.params as any;
    try {
        const post = await Post.findById(postId);
        if (!post || post.deletedAt) {
            return res.status(404).json({ success: false, error: 'Post not found' });
        }
        await SavedPost.updateOne(
            { userId, postId },
            { $setOnInsert: { userId, postId, createdAt: new Date() } },
            { upsert: true }
        );
        // Increment savesCount (best-effort)
        await Post.updateOne({ _id: postId }, { $inc: { savesCount: 1 } });
        return res.json({ success: true });
    } catch (error: any) {
        if (error?.code === 11000) {
            return res.json({ success: true }); // already saved
        }
        console.error('Save Post Error:', error);
        return res.status(500).json({ success: false, error: 'Failed to save post' });
    }
};

export const unsavePost = async (req: Request, res: Response) => {
    const userId = req.user.id;
    const { postId } = req.params as any;
    try {
        const result = await SavedPost.deleteOne({ userId, postId });
        if (result.deletedCount) {
            await Post.updateOne({ _id: postId }, { $inc: { savesCount: -1 } });
        }
        return res.json({ success: true });
    } catch (error) {
        console.error('Unsave Post Error:', error);
        return res.status(500).json({ success: false, error: 'Failed to unsave post' });
    }
};

export const sharePost = async (req: Request, res: Response) => {
    const userId = req.user.id;
    const { postId } = req.params as any;
    try {
        const post = await Post.findById(postId);
        if (!post || post.deletedAt) {
            return res.status(404).json({ success: false, error: 'Post not found' });
        }
        await Post.updateOne({ _id: postId }, { $inc: { sharesCount: 1 } });
        // Optionally persist share in Postgres 'share' table if present
        try {
            await pgPool.query(
                'INSERT INTO shares (user_id, post_id, created_at) VALUES ($1, $2, CURRENT_TIMESTAMP) ON CONFLICT DO NOTHING',
                [userId, postId]
            );
        } catch (e: any) {
            // Non-fatal if PG insert fails
            console.warn('Share PG insert failed:', e?.message || e);
        }
        return res.json({ success: true });
    } catch (error) {
        console.error('Share Post Error:', error);
        return res.status(500).json({ success: false, error: 'Failed to share post' });
    }
};

export const getFeed = async (req: Request, res: Response) => {
    try {
        const userId = req.user.id;
        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 20;
        const skip = (page - 1) * limit;
        const offline = req.query.offline === 'true';

        // TEMPORARILY DISABLED: Cache returns wrong format (has _id instead of id)
        // TODO: Fix FeedAlgorithmService to return proper format, then re-enable caching
        // if (!offline) {
        //     try {
        //         const cacheKey = `feed_v2_${userId}_${page}_${limit}`;
        //         const cachedFeed = await SelectiveCacheService.get(...);
        //         return res.json({ success: true, posts: cachedFeed.posts, pagination: cachedFeed.pagination, cached: true });
        //     } catch (cacheError) {
        //         console.warn('Cache error, falling back to direct fetch:', cacheError);
        //     }
        // }

        // Fetch fresh data
        const feedData = await fetchFeedData(userId, page, limit, req.user.faculty);

        // Disable HTTP caching to ensure fresh data is always returned
        res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, private');
        res.setHeader('Pragma', 'no-cache');
        res.setHeader('Expires', '0');

        res.json({
            success: true,
            posts: feedData.posts,
            pagination: feedData.pagination,
            cached: false,
        });

    } catch (error) {
        console.error('Get Feed Error:', error);

        // Try to get offline data if online request fails
        try {
            const page = parseInt(req.query.page as string) || 1;
            const limit = parseInt(req.query.limit as string) || 20;
            const offlineData = await OfflineDataService.getOfflineData(
                req.user.id,
                'feed',
                `feed_${req.user.id}_${page}_${limit}`
            );

            if (offlineData) {
                return res.json({
                    success: true,
                    posts: offlineData.data.posts || [],
                    pagination: offlineData.data.pagination || { page, limit, hasMore: false },
                    offline: true,
                    message: 'Serving cached offline data',
                });
            }
        } catch (offlineError) {
            console.error('Offline fallback failed:', offlineError);
        }

        res.status(500).json({ error: 'Failed to get feed' });
    }
};

// Get post suggestions
export const getPostSuggestions = async (req: Request, res: Response) => {
    try {
        const userId = req.user.id;
        const limit = parseInt(req.query.limit as string) || 10;

        const { FeedAlgorithmService } = await import('../services/feed-algorithm.service');
        const suggestions = await FeedAlgorithmService.getPostSuggestions(userId, limit);

        // Enrich with user data
        const userIds = [...new Set(suggestions.map(p => p.userId))];
        const users = await pgPool.query(
            'SELECT id, username, first_name, last_name, avatar_url, faculty FROM users WHERE id = ANY($1)',
            [userIds]
        );

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

        const enrichedSuggestions = suggestions.map(post => ({
            id: post._id.toString(),
            user: {
                id: userMap[post.userId]?.id || post.userId,
                name: userMap[post.userId]?.name || 'Unknown User',
                username: userMap[post.userId]?.username,
                avatar: userMap[post.userId]?.avatarUrl || '',
                faculty: userMap[post.userId]?.faculty || post.faculty
            },
            caption: post.caption || '',
            media: {
                type: post.type,
                url: getMediaUrl(post),
                thumbnail: post.media?.thumbnail,
                items: post.media?.images || post.media?.items || []
            },
            tags: post.tags || [],
            likes: post.likesCount || 0,
            comments: post.commentsCount || 0,
            shares: post.sharesCount || 0,
            timeAgo: getTimeAgo(post.createdAt),
            liked: false,
            saved: false,
            forSale: post.isForSale,
            price: post.saleDetails?.price,
            // preserve storeItemId if present
            saleDetails: post.isForSale && post.saleDetails ? { storeItemId: (post.saleDetails as any).storeItemId } : undefined,
            location: post.location,
            faculty: post.faculty,
            createdAt: post.createdAt,
        }));

        res.json({
            success: true,
            suggestions: enrichedSuggestions
        });
    } catch (error) {
        console.error('Get Post Suggestions Error:', error);
        res.status(500).json({ error: 'Failed to get post suggestions' });
    }
};

// Get trending posts
export const getTrendingPosts = async (req: Request, res: Response) => {
    try {
        const userId = req.user.id;
        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 20;
        const timeWindow = (req.query.timeWindow as '24h' | '7d' | '30d') || '24h';

        const { FeedAlgorithmService } = await import('../services/feed-algorithm.service');
        const result = await FeedAlgorithmService.getTrendingPosts(userId, page, limit, timeWindow);

        // Enrich with user data (similar to getFeed)
        const userIds = [...new Set(result.posts.map(p => p.userId))];
        const users = await pgPool.query(
            'SELECT id, username, first_name, last_name, avatar_url, faculty FROM users WHERE id = ANY($1)',
            [userIds]
        );

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

        const postIds = result.posts.map(p => p._id.toString());
        const likes = await Like.find({
            userId,
            targetId: { $in: postIds },
            targetType: 'post'
        }).lean();

        const likedPostIds = new Set(likes.map(l => l.targetId));

        const enrichedPosts = result.posts.map(post => ({
            id: post._id.toString(),
            user: {
                id: userMap[post.userId]?.id || post.userId,
                name: userMap[post.userId]?.name || 'Unknown User',
                username: userMap[post.userId]?.username,
                avatar: userMap[post.userId]?.avatarUrl || '',
                faculty: userMap[post.userId]?.faculty || post.faculty
            },
            caption: post.caption || '',
            media: {
                type: post.type,
                url: getMediaUrl(post),
                thumbnail: post.media?.thumbnail,
                items: post.media?.images || post.media?.items || []
            },
            tags: post.tags || [],
            likes: post.likesCount || 0,
            comments: post.commentsCount || 0,
            shares: post.sharesCount || 0,
            timeAgo: getTimeAgo(post.createdAt),
            liked: likedPostIds.has(post._id.toString()),
            isLiked: likedPostIds.has(post._id.toString()),
            saved: false,
            forSale: post.isForSale,
            price: post.saleDetails?.price,
            saleDetails: post.isForSale && post.saleDetails ? { storeItemId: (post.saleDetails as any).storeItemId } : undefined,
            location: post.location,
            faculty: post.faculty,
            createdAt: post.createdAt,
        }));

        res.json({
            success: true,
            posts: enrichedPosts,
            pagination: result.pagination
        });
    } catch (error) {
        console.error('Get Trending Posts Error:', error);
        res.status(500).json({ error: 'Failed to get trending posts' });
    }
};

// Helper function to fetch feed data
async function fetchFeedData(userId: string, page: number, limit: number, faculty: string) {
    const startTime = Date.now();
    console.log(`🔍 fetchFeedData START - userId: ${userId}, page: ${page}, limit: ${limit}`);

    const skip = (page - 1) * limit;

    // Get user's connections for personalized feed
    const connectionsStart = Date.now();
    const connections = await pgPool.query(
        'SELECT following_id FROM connections WHERE follower_id = $1',
        [userId]
    );
    console.log(`⏱️ Connections query took: ${Date.now() - connectionsStart}ms, found: ${connections.rows.length}`);

    const followingIds = connections.rows.map(r => r.following_id);
    followingIds.push(userId); // Include own posts

    // Get posts from MongoDB
    const postsStart = Date.now();
    const posts = await Post.find({
        userId: { $in: followingIds },
        deletedAt: null,
        isRemoved: { $ne: true }, // Exclude moderated/removed posts
        $or: [
        { visibility: 'public' },
        { visibility: 'connections', userId: { $in: followingIds } },
        { visibility: 'faculty', faculty }
        ]
    })
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .lean();
    console.log(`⏱️ MongoDB posts query took: ${Date.now() - postsStart}ms, found: ${posts.length} posts`);

    // Get user info for each post from PostgreSQL
    const userIds = [...new Set(posts.map(p => p.userId))];
    const usersStart = Date.now();
    const users = await pgPool.query(
        'SELECT id, username, first_name, last_name, avatar_url, faculty FROM users WHERE id = ANY($1)',
        [userIds]
    );
    console.log(`⏱️ PostgreSQL users query took: ${Date.now() - usersStart}ms, found: ${users.rows.length} users`);

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

    // Check if current user liked each post
    const postIds = posts.map(p => p._id.toString());
    const likesStart = Date.now();
    const likes = await Like.find({
        userId,
        targetId: { $in: postIds },
        targetType: 'post'
    }).lean();
    console.log(`⏱️ MongoDB likes query took: ${Date.now() - likesStart}ms, found: ${likes.length} likes`);

    const likedPostIds = new Set(likes.map(l => l.targetId));

    // Enrich posts with user data and transform to frontend format
    const enrichedPosts = posts.map(post => {
        // Determine media URL based on post type
        let mediaUrl = null;
        if (post.type === 'image') {
            mediaUrl = post.media?.image;
        } else if (post.type === 'video') {
            mediaUrl = post.media?.video;
        } else if (post.type === 'carousel' && post.media?.images && post.media.images.length > 0) {
            mediaUrl = post.media.images[0]; // Use first image as primary URL
        }

        return {
            id: post._id.toString(),
            user: {
                id: userMap[post.userId]?.id || post.userId,
                name: userMap[post.userId]?.name || 'Unknown User',
                username: userMap[post.userId]?.username,
                avatar: userMap[post.userId]?.avatarUrl || '',
                faculty: userMap[post.userId]?.faculty || 'Unknown'
            },
            caption: post.caption || '',
            media: {
                type: post.type,
                url: mediaUrl,
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
            saved: false, // TODO: implement save functionality
            forSale: post.isForSale,
            price: post.saleDetails?.price,
            saleDetails: post.isForSale && post.saleDetails ? {
                    itemName: post.caption || 'Fashion Item',
                    price: (post.saleDetails as any).price,
                    originalPrice: undefined,
                    category: (post.saleDetails as any).category,
                    condition: (post.saleDetails as any).condition,
                    size: (post.saleDetails as any).size,
                    brand: undefined,
                    color: undefined,
                    material: undefined,
                    paymentMethods: (post.saleDetails as any).paymentMethods,
                    meetupLocation: (post.saleDetails as any).meetupLocation,
                    sellerPhone: (post.saleDetails as any).contactPhone,
                    negotiable: false,
                    storeItemId: (post.saleDetails as any).storeItemId,
            } : undefined,
            location: post.location,
            brand: post.brand,
            occasion: post.occasion,
            visibility: post.visibility,
            createdAt: post.createdAt
        };
    });

    console.log(`✅ fetchFeedData COMPLETE - Total time: ${Date.now() - startTime}ms, returning ${enrichedPosts.length} posts`);

    return {
        posts: enrichedPosts,
        pagination: {
            page,
            limit,
            hasMore: posts.length === limit
        }
    };
}

export const getPost = async (req: Request, res: Response) => {
    try {
        const { postId } = req.params;
        const userId = req.user.id;
        
        const post = await Post.findOne({
            _id: postId,
            deletedAt: null
        }).lean();
        
        if (!post) {
            return res.status(404).json({ error: 'Post not found' });
        }
        
        // Increment view count
        await Post.updateOne(
            { _id: postId },
            { $inc: { viewsCount: 1 } }
        );
        
        // Get post author info
        const user = await pgPool.query(
            'SELECT id, username, first_name, last_name, avatar_url, faculty FROM users WHERE id = $1',
            [post.userId]
        );
        
        // Check if liked
        const like = await Like.findOne({
            userId,
            targetId: postId,
            targetType: 'post'
        });
        
        res.json({
            success: true,
            post: {
                id: post._id.toString(),
                user: {
                    id: user.rows[0].id,
                    name: `${user.rows[0].first_name} ${user.rows[0].last_name}`,
                    username: user.rows[0].username,
                    avatar: user.rows[0].avatar_url || '',
                    faculty: user.rows[0].faculty
                },
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
                isLiked: !!like,
                liked: !!like,
                saved: false, // TODO: implement save functionality
                forSale: post.isForSale,
                price: post.saleDetails?.price,
            saleDetails: post.isForSale && post.saleDetails ? {
                itemName: post.caption || 'Fashion Item',
                price: (post.saleDetails as any).price,
                originalPrice: undefined,
                category: (post.saleDetails as any).category,
                condition: (post.saleDetails as any).condition,
                size: (post.saleDetails as any).size,
                brand: undefined,
                color: undefined,
                material: undefined,
                paymentMethods: (post.saleDetails as any).paymentMethods,
                meetupLocation: (post.saleDetails as any).meetupLocation,
                sellerPhone: (post.saleDetails as any).contactPhone,
                negotiable: false,
                storeItemId: (post.saleDetails as any).storeItemId,
            } : undefined,
                location: post.location,
                brand: post.brand,
                occasion: post.occasion,
                visibility: post.visibility,
                createdAt: post.createdAt
            }
        });
        
    } catch (error) {
        console.error('Get Post Error:', error);
        res.status(500).json({ error: 'Failed to get post' });
    }
};

export const likePost = async (req: Request, res: Response) => {
    try {
        const { postId } = req.params;
        const userId = req.user.id;
        const userSubscription = req.user.subscription_tier;

        // Check if user already liked the post
        const existingLike = await Like.findOne({
            userId,
            targetId: postId,
            targetType: 'post'
        });

        let liked = false;
        let action = '';

        if (existingLike) {
            // Unlike the post
            await Like.deleteOne({ _id: existingLike._id });
            await Post.updateOne(
                { _id: postId },
                { $inc: { likesCount: -1 } }
            );
            action = 'unliked';
        } else {
            // Like the post
            await Like.create({
                userId,
                targetId: postId,
                targetType: 'post'
            });
            await Post.updateOne(
                { _id: postId },
                { $inc: { likesCount: 1 } }
            );
            liked = true;
            action = 'liked';

            // Create notification for post author (if not liking own post)
            const post = await Post.findById(postId);
            if (post && post.userId !== userId) {
                try {
                    // Get actor (liker) info for notification
                    const actorInfo = await pgPool.query(
                        'SELECT id, username, first_name, avatar_url FROM users WHERE id = $1',
                        [userId]
                    );
                    const actor = actorInfo.rows[0];
                    const actorName = actor ? `${actor.first_name || actor.username}` : 'Someone';
                    const actorAvatar = actor?.avatar_url || 'https://api.raved.com/default-avatar.png';

                    console.log('📢 Creating like notification with actor:', { userId, actorName, actorAvatar });

                    const { Notification } = await import('../models/mongoose/notification.model');
                    const notifData = {
                        userId: post.userId,
                        type: 'like',
                        title: `${actorName} liked your post`,
                        message: `${actorName} liked your post`,
                        actorId: userId,
                        actorName,
                        actorAvatar,
                        referenceType: 'post',
                        referenceId: postId
                    };
                    console.log('💾 Saving like notification:', notifData);
                    await Notification.create(notifData);
                    console.log('✅ Like notification saved');

                    // Emit real-time notification (wrapped in try-catch to prevent blocking)
                    try {
                        const { io } = await import('../index');
                        if (io) {
                            io.to(`user:${post.userId}`).emit('notification', {
                                type: 'like',
                                message: `${actorName} liked your post`,
                                actorId: userId,
                                actorName,
                                actorAvatar,
                                postId
                            });
                        }
                    } catch (ioError) {
                        console.warn('Failed to emit socket notification:', ioError);
                        // Don't fail the request if socket emission fails
                    }
                } catch (notifError) {
                    console.warn('Failed to create notification:', notifError);
                    // Don't fail the request if notification creation fails
                }
            }
        }

        res.json({
            success: true,
            message: `Post ${action} successfully`,
            liked,
            action
        });
    } catch (error: any) {
        console.error('Like Post Error:', error);
        res.status(500).json({ error: error.message || 'Failed to like post' });
    }
};

export const commentOnPost = async (req: Request, res: Response) => {
    try {
        const { postId } = req.params;
        const { text, parentCommentId } = req.body;
        const userId = req.user.id;

        console.log('📝 Comment submission received:', {
            postId,
            userId,
            text: text?.substring(0, 50),
            parentCommentId
        });

        // Manual validation
        if (!text || typeof text !== 'string') {
            console.error('❌ No text provided');
            return res.status(400).json({ 
                error: 'Comment text is required'
            });
        }

        const trimmedText = text.trim();
        if (trimmedText.length === 0) {
            console.error('❌ Empty text after trim');
            return res.status(400).json({ 
                error: 'Comment text cannot be empty'
            });
        }

        if (trimmedText.length > 500) {
            console.error('❌ Text too long:', trimmedText.length);
            return res.status(400).json({ 
                error: 'Comment must be 500 characters or less'
            });
        }

        console.log('✅ Validation passed');

        const userSubscription = req.user.subscription_tier;

        // Verify post exists
        const post = await Post.findById(postId);
        if (!post) {
            return res.status(404).json({ error: 'Post not found' });
        }

        // Create comment
        const comment = await Comment.create({
            postId,
            userId,
            text: trimmedText,
            parentCommentId: parentCommentId || null
        });

        // Update post comment count
        await Post.updateOne(
            { _id: postId },
            { $inc: { commentsCount: 1 } }
        );

        // Get user info for the comment
        const userInfo = await pgPool.query(
            'SELECT id, username, first_name, last_name, avatar_url FROM users WHERE id = $1',
            [comment.userId]
        );

        const user = userInfo.rows[0];

        // Return success immediately
        res.json({
            success: true,
            message: 'Comment created successfully',
            comment: {
                id: comment._id,
                text: comment.text,
                userId: comment.userId,
                user: {
                    id: user.id,
                    name: `${user.first_name} ${user.last_name}`,
                    username: user.username,
                    avatarUrl: user.avatar_url
                },
                postId: comment.postId,
                parentCommentId: comment.parentCommentId,
                createdAt: comment.createdAt,
                timeAgo: getTimeAgo(comment.createdAt)
            }
        });

        // Post-processing: Moderate the comment asynchronously
        moderateCommentAfterCreation(
            comment._id.toString(),
            userId,
            postId,
            text
        ).catch((err: any) => console.error('Async comment moderation failed:', err));

        // Post-processing: Send notifications asynchronously
        setTimeout(async () => {
            try {
                // Get actor (commenter) info for notifications
                const actorInfo = await pgPool.query(
                    'SELECT id, username, first_name, last_name, avatar_url FROM users WHERE id = $1',
                    [userId]
                );
                const actor = actorInfo.rows[0];
                const actorName = actor ? `${actor.first_name || actor.username}` : 'Unknown';
                const actorAvatar = actor?.avatar_url || 'https://api.raved.com/default-avatar.png';

                console.log('📢 Creating notifications with actor:', { userId, actorName, actorAvatar });

                // Create notification for post author (if not commenting on own post)
                if (post.userId !== userId) {
                    const { Notification } = await import('../models/mongoose/notification.model');
                    const notifData = {
                        userId: post.userId,
                        type: 'post_comment',
                        title: `${actorName} commented on your post`,
                        message: `${actorName} commented on your post`,
                        actorId: userId,
                        actorName,
                        actorAvatar,
                        referenceType: 'post',
                        referenceId: postId,
                        data: { postId, commentId: comment._id }
                    };
                    console.log('💾 Saving notification:', notifData);
                    await Notification.create(notifData);
                    console.log('✅ Notification saved for post author');

                    // Emit real-time notification
                    const { io } = await import('../index');
                    io.to(`user:${post.userId}`).emit('notification', {
                        type: 'post_comment',
                        message: `${actorName} commented on your post`,
                        actorId: userId,
                        actorName,
                        actorAvatar,
                        postId,
                        commentId: comment._id
                    });
                }

                // If replying to a comment, notify the original commenter
                if (parentCommentId) {
                    const parentComment = await Comment.findById(parentCommentId);
                    if (parentComment && parentComment.userId !== userId && parentComment.userId !== post.userId) {
                        const { Notification } = await import('../models/mongoose/notification.model');
                        const replyNotifData = {
                            userId: parentComment.userId,
                            type: 'comment_reply',
                            title: `${actorName} replied to your comment`,
                            message: `${actorName} replied to your comment`,
                            actorId: userId,
                            actorName,
                            actorAvatar,
                            referenceType: 'comment',
                            referenceId: comment._id,
                            data: { postId, commentId: comment._id, parentCommentId }
                        };
                        console.log('💾 Saving reply notification:', replyNotifData);
                        await Notification.create(replyNotifData);
                        console.log('✅ Notification saved for parent commenter');

                        // Emit real-time notification
                        const { io } = await import('../index');
                        io.to(`user:${parentComment.userId}`).emit('notification', {
                            type: 'comment_reply',
                            message: `${actorName} replied to your comment`,
                            actorId: userId,
                            actorName,
                            actorAvatar,
                            postId,
                            commentId: comment._id
                        });
                    }
                }
            } catch (notifError) {
                console.error('Async notification failed:', notifError);
            }
        }, 100); // Small delay to ensure response is sent first

    } catch (error: any) {
        console.error('Comment Error:', error);
        res.status(500).json({ error: error.message || 'Failed to create comment' });
    }
};

export const getPostComments = async (req: Request, res: Response) => {
    try {
        const { postId } = req.params;
        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 20;
        const skip = (page - 1) * limit;

        // Get paginated top-level comments only (exclude replies)
        const topLevelComments = await Comment.find({
            postId,
            parentCommentId: null, // Only top-level comments
            deletedAt: null,
            isRemoved: { $ne: true } // Exclude moderated/removed comments
        })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean();

        // Get all replies for these top-level comments
        const topLevelCommentIds = topLevelComments.map(c => c._id.toString());
        const replies = await Comment.find({
            postId,
            parentCommentId: { $in: topLevelCommentIds },
            deletedAt: null,
            isRemoved: { $ne: true } // Exclude moderated/removed comments
        })
        .sort({ createdAt: 1 }) // Sort replies chronologically (oldest first)
        .lean();

        // Combine all comments for user lookup and likes check
        const allComments = [...topLevelComments, ...replies];

        // Get user info for all comments
        const userIds = [...new Set(allComments.map(c => c.userId))];
        const users = await pgPool.query(
            'SELECT id, username, first_name, last_name, avatar_url FROM users WHERE id = ANY($1)',
            [userIds]
        );

        const userMap: any = {};
        users.rows.forEach(u => {
            userMap[u.id] = {
            id: u.id,
            username: u.username,
            name: `${u.first_name} ${u.last_name}`,
            avatarUrl: u.avatar_url
            };
        });

        // Check which comments are liked by current user
        const commentIds = allComments.map(c => c._id.toString());
        const commentLikes = await Like.find({
            userId: req.user.id,
            targetId: { $in: commentIds },
            targetType: 'comment'
        }).lean();

        const likedCommentIds = new Set(commentLikes.map(l => l.targetId));

        // Create a map of replies by parent ID
        const repliesMap: any = {};
        replies.forEach(reply => {
            const parentId = reply.parentCommentId?.toString();
            if (parentId) {
                if (!repliesMap[parentId]) {
                    repliesMap[parentId] = [];
                }
                repliesMap[parentId].push(reply);
            }
        });

        const enrichedComments = topLevelComments.map(comment => ({
            id: comment._id.toString(),
            user: userMap[comment.userId],
            text: comment.text,
            timeAgo: getTimeAgo(comment.createdAt),
            likes: comment.likesCount || 0,
            liked: likedCommentIds.has(comment._id.toString()),
            createdAt: comment.createdAt,
            replies: (repliesMap[comment._id.toString()] || []).map((reply: any) => ({
                id: reply._id.toString(),
                user: userMap[reply.userId],
                text: reply.text,
                timeAgo: getTimeAgo(reply.createdAt),
                likes: reply.likesCount || 0,
                liked: likedCommentIds.has(reply._id.toString()),
                createdAt: reply.createdAt
            }))
        }));

        // Check if there are more top-level comments for pagination
        const totalTopLevelComments = await Comment.countDocuments({
            postId,
            parentCommentId: null,
            deletedAt: null,
            isRemoved: { $ne: true }
        });

        // Also sync the comment count for this post (exclude removed comments)
        try {
            const totalCommentCount = await Comment.countDocuments({
                postId,
                deletedAt: null,
                isRemoved: { $ne: true }
            });
            if (totalCommentCount !== undefined) {
                await Post.updateOne(
                    { _id: postId },
                    { $set: { commentsCount: totalCommentCount } }
                );
            }
        } catch (syncError) {
            console.warn('⚠️ Failed to sync comment count:', syncError);
        }

        res.json({
            success: true,
            comments: enrichedComments,
            pagination: {
                page,
                limit,
                hasMore: (page * limit) < totalTopLevelComments
            }
        });

    } catch (error) {
        console.error('Get Comments Error:', error);
        res.status(500).json({ error: 'Failed to get comments' });
    }
};

export const deleteComment = async (req: Request, res: Response) => {
    try {
        const { postId, commentId } = req.params;
        const userId = req.user.id;

        // Find the comment
        const comment = await Comment.findById(commentId);
        if (!comment) {
            return res.status(404).json({ error: 'Comment not found' });
        }

        // Check if user owns the comment or the post
        const post = await Post.findById(postId);
        if (!post) {
            return res.status(404).json({ error: 'Post not found' });
        }

        if (comment.userId !== userId && post.userId !== userId) {
            return res.status(403).json({ error: 'Not authorized to delete this comment' });
        }

        // Soft delete the comment
        await Comment.updateOne(
            { _id: commentId },
            { deletedAt: new Date() }
        );

        // Decrement post comment count
        await Post.updateOne(
            { _id: postId },
            { $inc: { commentsCount: -1 } }
        );

        res.json({
            success: true,
            message: 'Comment deleted successfully'
        });

    } catch (error) {
        console.error('Delete Comment Error:', error);
        res.status(500).json({ error: 'Failed to delete comment' });
    }
};

export const likeComment = async (req: Request, res: Response) => {
    try {
        const { postId, commentId } = req.params;
        const userId = req.user.id;

        // Check if user already liked the comment
        const existingLike = await Like.findOne({
            userId,
            targetId: commentId,
            targetType: 'comment'
        });

        let liked = false;
        let action = '';

        if (existingLike) {
            // Unlike the comment
            await Like.deleteOne({ _id: existingLike._id });
            await Comment.updateOne(
                { _id: commentId },
                { $inc: { likesCount: -1 } }
            );
            action = 'unliked';
        } else {
            // Like the comment
            await Like.create({
                userId,
                targetId: commentId,
                targetType: 'comment'
            });
            await Comment.updateOne(
                { _id: commentId },
                { $inc: { likesCount: 1 } }
            );
            liked = true;
            action = 'liked';
        }

        res.json({
            success: true,
            message: `Comment ${action} successfully`,
            liked,
            action
        });
    } catch (error: any) {
        console.error('Like Comment Error:', error);
        res.status(500).json({ error: error.message || 'Failed to like comment' });
    }
};

export const getPostStoreItem = async (req: Request, res: Response) => {
    try {
        const { postId } = req.params as any;
        // Ensure post exists
        const post = await Post.findById(postId).lean();
        if (!post || !post.isForSale || !post.saleDetails) {
            return res.status(404).json({ success: false, error: 'No store item for this post' });
        }
        const userId = post.userId;
        const name = (post.saleDetails as any).itemName || post.caption || '';
        const price = (post.saleDetails as any).price || null;

        // Try an exact match first by seller and name and (optional) price
        const baseQuery = ['SELECT id FROM store_items WHERE seller_id = $1 AND status = $2 AND deleted_at IS NULL'];
        const params: any[] = [userId, 'active'];
        if (name) { baseQuery.push('AND name = $' + (params.length + 1)); params.push(name); }
        if (price) { baseQuery.push('AND price = $' + (params.length + 1)); params.push(price); }
        baseQuery.push('ORDER BY created_at DESC LIMIT 1');
        const exact = await pgPool.query(baseQuery.join(' '), params);
        if (exact.rows[0]?.id) {
            return res.json({ success: true, itemId: exact.rows[0].id });
        }

        // Fallback: fuzzy name match
        const fuzzy = await pgPool.query(
            'SELECT id FROM store_items WHERE seller_id = $1 AND status = $2 AND deleted_at IS NULL AND similarity(name, $3) > 0.3 ORDER BY similarity(name, $3) DESC, created_at DESC LIMIT 1',
            [userId, 'active', name]
        ).catch(() => ({ rows: [] } as any));
        if (fuzzy.rows?.[0]?.id) {
            return res.json({ success: true, itemId: fuzzy.rows[0].id });
        }
        return res.status(404).json({ success: false, error: 'Store item not found for post' });
    } catch (error) {
        console.error('Get Post Store Item Error:', error);
        res.status(500).json({ success: false, error: 'Failed to get store item for post' });
    }
};

export const getFacultyPosts = async (req: Request, res: Response) => {
    try {
        const { facultyId } = req.params;
        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 20;
        const userId = req.user.id;

        console.log('🎓 getFacultyPosts - facultyId:', facultyId);

        // Convert facultyId back to faculty name (capitalize first letter of each word)
        const facultyName = facultyId
            .split('-')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ');
        console.log('🎓 getFacultyPosts - facultyName:', facultyName);

        const skip = (page - 1) * limit;
        
        // First, get all user IDs with this faculty from PostgreSQL
        const usersResult = await pgPool.query(
            'SELECT id FROM users WHERE LOWER(faculty) = LOWER($1) AND deleted_at IS NULL',
            [facultyName]
        );
        const facultyUserIds = usersResult.rows.map(r => r.id);
        console.log('🎓 getFacultyPosts - found users:', facultyUserIds.length);

        if (facultyUserIds.length === 0) {
            return res.json({
                success: true,
                posts: [],
                pagination: {
                    page,
                    limit,
                    hasMore: false
                }
            });
        }
        
        // Get posts from MongoDB filtered by user IDs with this faculty (exclude removed content)
        const posts = await Post.find({
            userId: { $in: facultyUserIds },
            deletedAt: null,
            isRemoved: { $ne: true }, // Exclude moderated/removed posts
            $or: [
                { visibility: 'public' },
                { visibility: 'faculty' }
            ]
        })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean();

        console.log('🎓 getFacultyPosts - found posts:', posts.length);
        if (posts.length > 0) {
            console.log('🎓 getFacultyPosts - first post sample:', JSON.stringify(posts[0], null, 2));
        }

        // Get user info for each post from PostgreSQL
        const userIds = [...new Set(posts.map(p => p.userId))];
        const users = await pgPool.query(
            'SELECT id, username, first_name, last_name, avatar_url, faculty FROM users WHERE id = ANY($1)',
            [userIds]
        );
        
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
        
        // Check if current user liked each post
        const postIds = posts.map(p => p._id.toString());
        const likes = await Like.find({
            userId,
            targetId: { $in: postIds },
            targetType: 'post'
        }).lean();
        
        const likedPostIds = new Set(likes.map(l => l.targetId));
        
        // Enrich posts with user data
        const enrichedPosts = posts.map(post => ({
            id: post._id.toString(),
            user: {
                id: userMap[post.userId]?.id || post.userId,
                name: userMap[post.userId]?.name || 'Unknown User',
                username: userMap[post.userId]?.username,
                avatar: userMap[post.userId]?.avatarUrl || '',
                faculty: userMap[post.userId]?.faculty || 'Unknown'
            },
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
            saleDetails: post.isForSale && post.saleDetails ? {
                itemName: post.caption || 'Fashion Item',
                price: (post.saleDetails as any).price,
                originalPrice: undefined,
                category: (post.saleDetails as any).category,
                condition: (post.saleDetails as any).condition,
                size: (post.saleDetails as any).size,
                brand: undefined,
                color: undefined,
                material: undefined,
                paymentMethods: (post.saleDetails as any).paymentMethods,
                meetupLocation: (post.saleDetails as any).meetupLocation,
                sellerPhone: (post.saleDetails as any).contactPhone,
                negotiable: false,
                storeItemId: (post.saleDetails as any).storeItemId,
            } : undefined,
            location: post.location,
            visibility: post.visibility,
            createdAt: post.createdAt
        }));

        console.log('🎓 getFacultyPosts - enriched posts count:', enrichedPosts.length);
        if (enrichedPosts.length > 0) {
            console.log('🎓 getFacultyPosts - first enriched post:', JSON.stringify(enrichedPosts[0], null, 2));
        }

        res.json({
            success: true,
            posts: enrichedPosts,
            pagination: {
                page,
                limit,
                hasMore: posts.length === limit
            }
        });
        
    } catch (error) {
        console.error('Get Faculty Posts Error:', error);
        res.status(500).json({ error: 'Failed to get faculty posts' });
    }
};

/**
 * Sync comment counts for all posts
 * Iterates through all posts and verifies/updates their commentsCounts
 */
export const syncCommentCounts = async (req: Request, res: Response) => {
    try {
        console.log('🔄 Starting comment count sync...');
        
        const posts = await Post.find({ deletedAt: null });
        let fixedCount = 0;
        
        for (const post of posts) {
            const actualCommentCount = await Comment.countDocuments({
                postId: post._id,
                deletedAt: null
            });
            
            if (actualCommentCount !== post.commentsCount) {
                console.log(`📍 Post ${post._id}: count mismatch ${post.commentsCount} -> ${actualCommentCount}`);
                await Post.updateOne(
                    { _id: post._id },
                    { $set: { commentsCount: actualCommentCount } }
                );
                fixedCount++;
            }
        }
        
        console.log(`✅ Sync complete: ${fixedCount}/${posts.length} posts fixed`);
        res.json({
            success: true,
            message: `Synced comment counts: ${fixedCount}/${posts.length} posts fixed`,
            fixed: fixedCount,
            total: posts.length
        });
    } catch (error) {
        console.error('❌ Sync comment counts error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to sync comment counts'
        });
    }
};