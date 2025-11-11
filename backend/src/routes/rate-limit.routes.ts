import { Router } from 'express';
import { body } from 'express-validator';
import {
  getRateLimitStats,
  getUserRateLimitStatus,
  getRecentBlockedRequests,
  getViolationsByIP,
  setUserRateLimitOverride,
  removeUserRateLimitOverride,
  getActiveOverrides,
  resetRateLimit,
  updateEndpointConfig,
} from '../controllers/rate-limit.controller';
import { authenticate } from '../middleware/auth.middleware';
import { requireAdmin } from '../middleware/admin.middleware';
import { adminRateLimit } from '../middleware/rate-limit.middleware';

const router = Router();

// All routes require authentication
router.use(authenticate);

// User rate limit status
router.get('/status', getUserRateLimitStatus);

// Admin-only routes
router.use(requireAdmin);
router.use(adminRateLimit);

// Statistics and monitoring
router.get('/stats', getRateLimitStats);
router.get('/blocked', getRecentBlockedRequests);
router.get('/violations', getViolationsByIP);

// Rate limit management
router.post('/override', [
  body('userId').notEmpty().withMessage('User ID is required'),
  body('tier').isIn(['free', 'premium', 'admin']).withMessage('Invalid tier'),
  body('customWindowMs').optional().isInt({ min: 1000 }).withMessage('Window must be at least 1000ms'),
  body('customMaxRequests').optional().isInt({ min: 1 }).withMessage('Max requests must be at least 1'),
  body('customBlockDuration').optional().isInt({ min: 1000 }).withMessage('Block duration must be at least 1000ms'),
  body('expiresAt').optional().isISO8601().withMessage('Invalid expiration date'),
], setUserRateLimitOverride);

router.delete('/override/:userId', removeUserRateLimitOverride);
router.get('/overrides', getActiveOverrides);

// Administrative controls
router.post('/reset', [
  body('key').notEmpty().withMessage('Key is required'),
  body('tier').isIn(['free', 'premium', 'admin']).withMessage('Invalid tier'),
], resetRateLimit);

router.put('/endpoint', [
  body('endpoint').notEmpty().withMessage('Endpoint is required'),
  body('config.tier').isIn(['free', 'premium', 'admin']).withMessage('Invalid tier'),
  body('config.windowMs').isInt({ min: 1000 }).withMessage('Window must be at least 1000ms'),
  body('config.maxRequests').isInt({ min: 1 }).withMessage('Max requests must be at least 1'),
], updateEndpointConfig);

export default router;