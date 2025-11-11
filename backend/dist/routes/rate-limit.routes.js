"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const express_validator_1 = require("express-validator");
const rate_limit_controller_1 = require("../controllers/rate-limit.controller");
const auth_middleware_1 = require("../middleware/auth.middleware");
const admin_middleware_1 = require("../middleware/admin.middleware");
const rate_limit_middleware_1 = require("../middleware/rate-limit.middleware");
const router = (0, express_1.Router)();
// All routes require authentication
router.use(auth_middleware_1.authenticate);
// User rate limit status
router.get('/status', rate_limit_controller_1.getUserRateLimitStatus);
// Admin-only routes
router.use(admin_middleware_1.requireAdmin);
router.use(rate_limit_middleware_1.adminRateLimit);
// Statistics and monitoring
router.get('/stats', rate_limit_controller_1.getRateLimitStats);
router.get('/blocked', rate_limit_controller_1.getRecentBlockedRequests);
router.get('/violations', rate_limit_controller_1.getViolationsByIP);
// Rate limit management
router.post('/override', [
    (0, express_validator_1.body)('userId').notEmpty().withMessage('User ID is required'),
    (0, express_validator_1.body)('tier').isIn(['free', 'premium', 'admin']).withMessage('Invalid tier'),
    (0, express_validator_1.body)('customWindowMs').optional().isInt({ min: 1000 }).withMessage('Window must be at least 1000ms'),
    (0, express_validator_1.body)('customMaxRequests').optional().isInt({ min: 1 }).withMessage('Max requests must be at least 1'),
    (0, express_validator_1.body)('customBlockDuration').optional().isInt({ min: 1000 }).withMessage('Block duration must be at least 1000ms'),
    (0, express_validator_1.body)('expiresAt').optional().isISO8601().withMessage('Invalid expiration date'),
], rate_limit_controller_1.setUserRateLimitOverride);
router.delete('/override/:userId', rate_limit_controller_1.removeUserRateLimitOverride);
router.get('/overrides', rate_limit_controller_1.getActiveOverrides);
// Administrative controls
router.post('/reset', [
    (0, express_validator_1.body)('key').notEmpty().withMessage('Key is required'),
    (0, express_validator_1.body)('tier').isIn(['free', 'premium', 'admin']).withMessage('Invalid tier'),
], rate_limit_controller_1.resetRateLimit);
router.put('/endpoint', [
    (0, express_validator_1.body)('endpoint').notEmpty().withMessage('Endpoint is required'),
    (0, express_validator_1.body)('config.tier').isIn(['free', 'premium', 'admin']).withMessage('Invalid tier'),
    (0, express_validator_1.body)('config.windowMs').isInt({ min: 1000 }).withMessage('Window must be at least 1000ms'),
    (0, express_validator_1.body)('config.maxRequests').isInt({ min: 1 }).withMessage('Max requests must be at least 1'),
], rate_limit_controller_1.updateEndpointConfig);
exports.default = router;
