import { Router } from 'express';
import { body, validationResult } from 'express-validator';
import {
  createPost,
  getFeed,
  getPost,
  likePost,
  commentOnPost,
  getPostComments,
  deleteComment,
  likeComment,
  getFacultyPosts,
  getPostSuggestions,
  getTrendingPosts,
  savePost,
  unsavePost,
  sharePost,
  syncCommentCounts,
} from '../controllers/posts.controller';
import { authenticate } from '../middleware/auth.middleware';
import { postRateLimit, commentRateLimit, interactionRateLimit } from '../middleware/rate-limit.middleware';
import { moderatePostPostProcessing, moderateCommentPostProcessing, moderateCommentAfterCreation, moderatePostAfterCreation } from '../middleware/post-moderation.middleware';

const router = Router();

// Validators for post creation
const postValidators = [
    body('type').isIn(['image', 'video', 'carousel', 'text']),
    body('caption').optional().trim().isLength({ max: 2000 }),
];

// Validators for comments
const commentValidators = [
    body('text')
        .notEmpty().withMessage('Comment text is required')
        .trim()
        .isLength({ max: 500 }).withMessage('Comment must be 500 characters or less'),
];

router.post('/', authenticate, postRateLimit, postValidators, moderatePostPostProcessing, createPost);

router.get('/feed', authenticate, getFeed);

router.get('/suggestions', authenticate, getPostSuggestions);

router.get('/trending', authenticate, getTrendingPosts);

router.get('/faculty/:facultyId', authenticate, getFacultyPosts);

router.get('/:postId', authenticate, getPost);

// Related store item for a sale post

router.post('/:postId/like', authenticate, interactionRateLimit, likePost);

// Save/Unsave post (bookmarks)
router.post('/:postId/save', authenticate, interactionRateLimit, (req, res, next) => savePost(req, res).catch(next));
router.delete('/:postId/save', authenticate, interactionRateLimit, (req, res, next) => unsavePost(req, res).catch(next));

// Share post
router.post('/:postId/share', authenticate, interactionRateLimit, (req, res, next) => sharePost(req, res).catch(next));

router.post('/:postId/comments', authenticate, commentRateLimit, moderateCommentPostProcessing, commentOnPost);

router.get('/:postId/comments', authenticate, getPostComments);

router.delete('/:postId/comments/:commentId', authenticate, deleteComment);

router.post('/:postId/comments/:commentId/like', authenticate, interactionRateLimit, likeComment);

// Admin: Sync comment counts (fix out-of-sync counts)
router.post('/admin/sync-comment-counts', authenticate, syncCommentCounts);

export default router;
