"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getPostComments = exports.commentOnPost = exports.likePost = exports.getPost = exports.getFeed = exports.createPost = void 0;
const express_validator_1 = require("express-validator");
const mongoose_1 = require("../models/mongoose");
const database_1 = require("../config/database");
const utils_1 = require("../utils");
const offline_data_service_1 = __importDefault(require("../services/offline-data.service"));
const data_versioning_service_1 = __importDefault(require("../services/data-versioning.service"));
const selective_cache_service_1 = __importDefault(require("../services/selective-cache.service"));
const offline_analytics_service_1 = __importDefault(require("../services/offline-analytics.service"));
const createPost = async (req, res) => {
    try {
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        const userId = req.user.id;
        const { type, caption, media, location, tags, brand, occasion, visibility, isForSale, saleDetails, offline = false // Check if this is an offline operation
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
                    deviceId: req.headers['x-device-id'],
                },
                expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
                priority: 1,
                tags: ['post', 'create', 'offline'],
            };
            const storedData = await offline_data_service_1.default.storeOfflineData(userId, offlineEntity);
            // Track offline analytics
            await offline_analytics_service_1.default.queueAnalyticsEvent({
                userId,
                sessionId: req.headers['x-session-id'] || `offline_${Date.now()}`,
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
            // Create sale post in MongoDB
            const salePost = new mongoose_1.Post(postData);
            await salePost.save();
            // Update user's post count in PostgreSQL
            await database_1.pgPool.query('UPDATE users SET posts_count = posts_count + 1 WHERE id = $1', [userId]);
            // Create store item entry for marketplace
            await database_1.pgPool.query(`
                INSERT INTO store_items (
                    seller_id, name, description, price, original_price,
                    category, condition, size, brand, color, material,
                    images, payment_methods, meetup_location, seller_phone,
                    status, created_at
                ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, CURRENT_TIMESTAMP)
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
            // Create version record
            await data_versioning_service_1.default.createVersion({
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
                    saleDetails: salePost.saleDetails
                }
            });
        }
        else {
            // Create post in MongoDB
            const post = new mongoose_1.Post(postData);
            await post.save();
            // Update user's post count in PostgreSQL
            await database_1.pgPool.query('UPDATE users SET posts_count = posts_count + 1 WHERE id = $1', [userId]);
            // Create version record
            await data_versioning_service_1.default.createVersion({
                entityType: 'post',
                entityId: post._id.toString(),
                data: postData,
                userId,
                operation: 'create',
            });
            // Cache the post data
            await selective_cache_service_1.default.registerPolicy({
                entityType: 'post',
                cacheable: true,
                strategies: [{
                        key: 'content',
                        ttl: 600,
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
    }
    catch (error) {
        console.error('Create Post Error:', error);
        res.status(500).json({ error: 'Failed to create post' });
    }
};
exports.createPost = createPost;
const getFeed = async (req, res) => {
    try {
        const userId = req.user.id;
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;
        const skip = (page - 1) * limit;
        const offline = req.query.offline === 'true';
        // Try to get from cache first (if not offline request)
        if (!offline) {
            try {
                const cacheKey = `feed_${userId}_${page}_${limit}`;
                const cachedFeed = await selective_cache_service_1.default.get('post', cacheKey, async () => {
                    return await fetchFeedData(userId, page, limit, req.user.faculty);
                }, {
                    userId,
                    priority: 'high',
                    accessPattern: 'read_heavy',
                });
                // Track cache hit
                await offline_analytics_service_1.default.trackOfflineSession(userId, req.headers['x-session-id'] || `feed_${Date.now()}`, {
                    deviceType: req.headers['x-device-type'],
                    userAgent: req.headers['user-agent'],
                }, {
                    startTime: new Date(),
                    endTime: new Date(),
                    pagesViewed: 1,
                    actionsPerformed: 0,
                    dataSynced: 0,
                    errorsEncountered: 0,
                });
                return res.json({
                    success: true,
                    posts: cachedFeed.posts,
                    pagination: cachedFeed.pagination,
                    cached: true,
                });
            }
            catch (cacheError) {
                console.warn('Cache error, falling back to direct fetch:', cacheError);
            }
        }
        // Fetch fresh data
        const feedData = await fetchFeedData(userId, page, limit, req.user.faculty);
        res.json({
            success: true,
            posts: feedData.posts,
            pagination: feedData.pagination,
            cached: false,
        });
    }
    catch (error) {
        console.error('Get Feed Error:', error);
        // Try to get offline data if online request fails
        try {
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 20;
            const offlineData = await offline_data_service_1.default.getOfflineData(req.user.id, 'feed', `feed_${req.user.id}_${page}_${limit}`);
            if (offlineData) {
                return res.json({
                    success: true,
                    posts: offlineData.data.posts || [],
                    pagination: offlineData.data.pagination || { page, limit, hasMore: false },
                    offline: true,
                    message: 'Serving cached offline data',
                });
            }
        }
        catch (offlineError) {
            console.error('Offline fallback failed:', offlineError);
        }
        res.status(500).json({ error: 'Failed to get feed' });
    }
};
exports.getFeed = getFeed;
// Helper function to fetch feed data
async function fetchFeedData(userId, page, limit, faculty) {
    const skip = (page - 1) * limit;
    // Get user's connections for personalized feed
    const connections = await database_1.pgPool.query('SELECT following_id FROM connections WHERE follower_id = $1', [userId]);
    const followingIds = connections.rows.map(r => r.following_id);
    followingIds.push(userId); // Include own posts
    // Get posts from MongoDB
    const posts = await mongoose_1.Post.find({
        userId: { $in: followingIds },
        deletedAt: null,
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
    // Get user info for each post from PostgreSQL
    const userIds = [...new Set(posts.map(p => p.userId))];
    const users = await database_1.pgPool.query('SELECT id, username, first_name, last_name, avatar_url, faculty FROM users WHERE id = ANY($1)', [userIds]);
    const userMap = {};
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
    const likes = await mongoose_1.Like.find({
        userId,
        targetId: { $in: postIds },
        targetType: 'post'
    }).lean();
    const likedPostIds = new Set(likes.map(l => l.targetId));
    // Enrich posts with user data
    const enrichedPosts = posts.map(post => ({
        ...post,
        user: userMap[post.userId],
        isLiked: likedPostIds.has(post._id.toString()),
        timeAgo: (0, utils_1.getTimeAgo)(post.createdAt)
    }));
    return {
        posts: enrichedPosts,
        pagination: {
            page,
            limit,
            hasMore: posts.length === limit
        }
    };
}
const getPost = async (req, res) => {
    try {
        const { postId } = req.params;
        const userId = req.user.id;
        const post = await mongoose_1.Post.findOne({
            _id: postId,
            deletedAt: null
        }).lean();
        if (!post) {
            return res.status(404).json({ error: 'Post not found' });
        }
        // Increment view count
        await mongoose_1.Post.updateOne({ _id: postId }, { $inc: { viewsCount: 1 } });
        // Get post author info
        const user = await database_1.pgPool.query('SELECT id, username, first_name, last_name, avatar_url, faculty FROM users WHERE id = $1', [post.userId]);
        // Check if liked
        const like = await mongoose_1.Like.findOne({
            userId,
            targetId: postId,
            targetType: 'post'
        });
        res.json({
            success: true,
            post: {
                ...post,
                user: {
                    id: user.rows[0].id,
                    username: user.rows[0].username,
                    name: `${user.rows[0].first_name} ${user.rows[0].last_name}`,
                    avatarUrl: user.rows[0].avatar_url,
                    faculty: user.rows[0].faculty
                },
                isLiked: !!like,
                timeAgo: (0, utils_1.getTimeAgo)(post.createdAt)
            }
        });
    }
    catch (error) {
        console.error('Get Post Error:', error);
        res.status(500).json({ error: 'Failed to get post' });
    }
};
exports.getPost = getPost;
const likePost = async (req, res) => {
    try {
        const { postId } = req.params;
        const userId = req.user.id;
        const userSubscription = req.user.subscription_tier;
        // Check if user already liked the post
        const existingLike = await mongoose_1.Like.findOne({
            userId,
            targetId: postId,
            targetType: 'post'
        });
        let liked = false;
        let action = '';
        if (existingLike) {
            // Unlike the post
            await mongoose_1.Like.deleteOne({ _id: existingLike._id });
            await mongoose_1.Post.updateOne({ _id: postId }, { $inc: { likesCount: -1 } });
            action = 'unliked';
        }
        else {
            // Like the post
            await mongoose_1.Like.create({
                userId,
                targetId: postId,
                targetType: 'post'
            });
            await mongoose_1.Post.updateOne({ _id: postId }, { $inc: { likesCount: 1 } });
            liked = true;
            action = 'liked';
            // Create notification for post author (if not liking own post)
            const post = await mongoose_1.Post.findById(postId);
            if (post && post.userId !== userId) {
                const { Notification } = await Promise.resolve().then(() => __importStar(require('../models/mongoose/notification.model')));
                await Notification.create({
                    userId: post.userId,
                    type: 'post_like',
                    title: 'Someone liked your post',
                    message: 'liked your post',
                    actorId: userId,
                    data: { postId }
                });
                // Emit real-time notification
                const { io } = await Promise.resolve().then(() => __importStar(require('../index')));
                io.to(`user:${post.userId}`).emit('notification', {
                    type: 'post_like',
                    message: 'Someone liked your post',
                    actorId: userId,
                    postId
                });
            }
        }
        res.json({
            success: true,
            message: `Post ${action} successfully`,
            liked,
            action
        });
    }
    catch (error) {
        console.error('Like Post Error:', error);
        res.status(500).json({ error: error.message || 'Failed to like post' });
    }
};
exports.likePost = likePost;
const commentOnPost = async (req, res) => {
    try {
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        const { postId } = req.params;
        const userId = req.user.id;
        const { text, parentCommentId } = req.body;
        const userSubscription = req.user.subscription_tier;
        // Verify post exists
        const post = await mongoose_1.Post.findById(postId);
        if (!post) {
            return res.status(404).json({ error: 'Post not found' });
        }
        // Create comment
        const comment = await mongoose_1.Comment.create({
            postId,
            userId,
            text,
            parentCommentId: parentCommentId || null
        });
        // Update post comment count
        await mongoose_1.Post.updateOne({ _id: postId }, { $inc: { commentsCount: 1 } });
        // Create notification for post author (if not commenting on own post)
        if (post.userId !== userId) {
            const { Notification } = await Promise.resolve().then(() => __importStar(require('../models/mongoose/notification.model')));
            await Notification.create({
                userId: post.userId,
                type: 'post_comment',
                title: 'Someone commented on your post',
                message: 'commented on your post',
                actorId: userId,
                data: { postId, commentId: comment._id }
            });
            // Emit real-time notification
            const { io } = await Promise.resolve().then(() => __importStar(require('../index')));
            io.to(`user:${post.userId}`).emit('notification', {
                type: 'post_comment',
                message: 'Someone commented on your post',
                actorId: userId,
                postId,
                commentId: comment._id
            });
        }
        // If replying to a comment, notify the original commenter
        if (parentCommentId) {
            const parentComment = await mongoose_1.Comment.findById(parentCommentId);
            if (parentComment && parentComment.userId !== userId && parentComment.userId !== post.userId) {
                const { Notification } = await Promise.resolve().then(() => __importStar(require('../models/mongoose/notification.model')));
                await Notification.create({
                    userId: parentComment.userId,
                    type: 'comment_reply',
                    title: 'Someone replied to your comment',
                    message: 'replied to your comment',
                    actorId: userId,
                    data: { postId, commentId: comment._id, parentCommentId }
                });
                // Emit real-time notification
                const { io } = await Promise.resolve().then(() => __importStar(require('../index')));
                io.to(`user:${parentComment.userId}`).emit('notification', {
                    type: 'comment_reply',
                    message: 'Someone replied to your comment',
                    actorId: userId,
                    postId,
                    commentId: comment._id
                });
            }
        }
        res.json({
            success: true,
            message: 'Comment created successfully',
            comment: {
                id: comment._id,
                text: comment.text,
                userId: comment.userId,
                postId: comment.postId,
                parentCommentId: comment.parentCommentId,
                createdAt: comment.createdAt,
                timeAgo: (0, utils_1.getTimeAgo)(comment.createdAt)
            }
        });
    }
    catch (error) {
        console.error('Comment Error:', error);
        res.status(500).json({ error: error.message || 'Failed to create comment' });
    }
};
exports.commentOnPost = commentOnPost;
const getPostComments = async (req, res) => {
    try {
        const { postId } = req.params;
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;
        const skip = (page - 1) * limit;
        const comments = await mongoose_1.Comment.find({
            postId,
            parentCommentId: null,
            deletedAt: null
        })
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .lean();
        // Get user info for comments
        const userIds = [...new Set(comments.map(c => c.userId))];
        const users = await database_1.pgPool.query('SELECT id, username, first_name, last_name, avatar_url FROM users WHERE id = ANY($1)', [userIds]);
        const userMap = {};
        users.rows.forEach(u => {
            userMap[u.id] = {
                id: u.id,
                username: u.username,
                name: `${u.first_name} ${u.last_name}`,
                avatarUrl: u.avatar_url
            };
        });
        const enrichedComments = comments.map(comment => ({
            ...comment,
            user: userMap[comment.userId],
            timeAgo: (0, utils_1.getTimeAgo)(comment.createdAt)
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
    }
    catch (error) {
        console.error('Get Comments Error:', error);
        res.status(500).json({ error: 'Failed to get comments' });
    }
};
exports.getPostComments = getPostComments;
