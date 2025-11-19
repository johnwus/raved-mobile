"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const express_validator_1 = require("express-validator");
const posts_controller_1 = require("../controllers/posts.controller");
const auth_middleware_1 = require("../middleware/auth.middleware");
const rate_limit_middleware_1 = require("../middleware/rate-limit.middleware");
const post_moderation_middleware_1 = require("../middleware/post-moderation.middleware");
const router = (0, express_1.Router)();
// Validators for post creation
const postValidators = [
    (0, express_validator_1.body)('type').isIn(['image', 'video', 'carousel', 'text']),
    (0, express_validator_1.body)('caption').optional().trim().isLength({ max: 2000 }),
];
// Validators for comments
const commentValidators = [
    (0, express_validator_1.body)('text')
        .notEmpty().withMessage('Comment text is required')
        .trim()
        .isLength({ max: 500 }).withMessage('Comment must be 500 characters or less'),
];
router.post('/', auth_middleware_1.authenticate, rate_limit_middleware_1.postRateLimit, postValidators, post_moderation_middleware_1.moderatePostPostProcessing, posts_controller_1.createPost);
router.get('/feed', auth_middleware_1.authenticate, posts_controller_1.getFeed);
router.get('/suggestions', auth_middleware_1.authenticate, posts_controller_1.getPostSuggestions);
router.get('/trending', auth_middleware_1.authenticate, posts_controller_1.getTrendingPosts);
router.get('/faculty/:facultyId', auth_middleware_1.authenticate, posts_controller_1.getFacultyPosts);
router.get('/:postId', auth_middleware_1.authenticate, posts_controller_1.getPost);
// Related store item for a sale post
router.post('/:postId/like', auth_middleware_1.authenticate, rate_limit_middleware_1.interactionRateLimit, posts_controller_1.likePost);
// Save/Unsave post (bookmarks)
router.post('/:postId/save', auth_middleware_1.authenticate, rate_limit_middleware_1.interactionRateLimit, (req, res, next) => (0, posts_controller_1.savePost)(req, res).catch(next));
router.delete('/:postId/save', auth_middleware_1.authenticate, rate_limit_middleware_1.interactionRateLimit, (req, res, next) => (0, posts_controller_1.unsavePost)(req, res).catch(next));
// Share post
router.post('/:postId/share', auth_middleware_1.authenticate, rate_limit_middleware_1.interactionRateLimit, (req, res, next) => (0, posts_controller_1.sharePost)(req, res).catch(next));
router.post('/:postId/comments', auth_middleware_1.authenticate, rate_limit_middleware_1.commentRateLimit, post_moderation_middleware_1.moderateCommentPostProcessing, posts_controller_1.commentOnPost);
router.get('/:postId/comments', auth_middleware_1.authenticate, posts_controller_1.getPostComments);
router.delete('/:postId/comments/:commentId', auth_middleware_1.authenticate, posts_controller_1.deleteComment);
router.post('/:postId/comments/:commentId/like', auth_middleware_1.authenticate, rate_limit_middleware_1.interactionRateLimit, posts_controller_1.likeComment);
// Admin: Sync comment counts (fix out-of-sync counts)
router.post('/admin/sync-comment-counts', auth_middleware_1.authenticate, posts_controller_1.syncCommentCounts);
exports.default = router;
