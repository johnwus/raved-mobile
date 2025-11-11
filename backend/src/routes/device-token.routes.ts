import { Router, Request, Response } from 'express';
import { authenticate } from '../middleware/auth.middleware';
import { deviceTokenController } from '../controllers/device-token.controller';

const router = Router();

// All routes require authentication
router.use(authenticate);

// Register device token
router.post('/register', deviceTokenController.registerToken);

// Unregister device token
router.post('/unregister', deviceTokenController.unregisterToken);

// Get user's device tokens
router.get('/', deviceTokenController.getUserTokens);

// Get token statistics
router.get('/stats', deviceTokenController.getTokenStats);

// Deactivate all user tokens
router.post('/deactivate-all', deviceTokenController.deactivateAllTokens);

export default router;