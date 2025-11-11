import { Router } from 'express';
import {
  getPendingModerationItems,
  approveContent,
  rejectContent,
  getModerationStats,
  getUserTrustScore,
  updateUserTrustScore,
  getModerationHistory,
} from '../controllers/moderation.controller';
import { requireAdmin } from '../middleware/admin.middleware';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

// All moderation routes require authentication and admin access
router.use(authenticate);
router.use(requireAdmin);

// Get pending moderation items
router.get('/pending', getPendingModerationItems);

// Approve content
router.post('/:queueId/approve', approveContent);

// Reject content
router.post('/:queueId/reject', rejectContent);

// Get moderation statistics
router.get('/stats', getModerationStats);

// Get user trust score
router.get('/users/:userId/trust-score', getUserTrustScore);

// Update user trust score
router.put('/users/:userId/trust-score', updateUserTrustScore);

// Get user's moderation history
router.get('/users/:userId/history', getModerationHistory);

export default router;