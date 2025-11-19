import { Router, Request, Response } from 'express';
import { body } from 'express-validator';
import { authenticate } from '../middleware/auth.middleware';
import { interactionRateLimit } from '../middleware/rate-limit.middleware';
import { connectionController } from '../controllers/connection.controller';
import { connectionsController } from '../controllers/connections.controller';

const router = Router();

// Send follow request
router.post('/follow/:userId', authenticate, interactionRateLimit, connectionController.sendFollowRequest);

// Get pending follow requests
router.get('/requests', authenticate, connectionController.getPendingFollowRequests);

// Approve follow request
router.post('/requests/:requestId/approve', authenticate, interactionRateLimit, connectionController.approveFollowRequest);

// Reject follow request
router.post('/requests/:requestId/reject', authenticate, interactionRateLimit, connectionController.rejectFollowRequest);

// Block user
router.post('/block/:userId', authenticate, connectionController.blockUser);

// Unblock user
router.delete('/block/:userId', authenticate, connectionController.unblockUser);

// Get blocked users
router.get('/blocked', authenticate, connectionController.getBlockedUsers);

// Get user connections (following/followers)
router.get('/:userId', authenticate, connectionsController.getUserConnections);

// Get connection suggestions
router.get('/suggestions/list', authenticate, connectionsController.getConnectionSuggestions);

export default router;