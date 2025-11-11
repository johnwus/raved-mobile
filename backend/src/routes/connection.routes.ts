import { Router } from 'express';
import { authenticate } from '../middleware/auth.middleware';
import { connectionController } from '../controllers/connection.controller';

const router = Router();

// Send follow request (for private accounts)
router.post('/request/:userId', authenticate, connectionController.sendFollowRequest);

// Get pending follow requests
router.get('/requests', authenticate, connectionController.getPendingFollowRequests);

// Approve follow request
router.post('/requests/:requestId/approve', authenticate, connectionController.approveFollowRequest);

// Reject follow request
router.post('/requests/:requestId/reject', authenticate, connectionController.rejectFollowRequest);

// Block user
router.post('/block/:userId', authenticate, connectionController.blockUser);

// Unblock user
router.delete('/block/:userId', authenticate, connectionController.unblockUser);

// Get blocked users
router.get('/blocked', authenticate, connectionController.getBlockedUsers);

export default router;
