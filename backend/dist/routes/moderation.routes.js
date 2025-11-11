"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const moderation_controller_1 = require("../controllers/moderation.controller");
const admin_middleware_1 = require("../middleware/admin.middleware");
const auth_middleware_1 = require("../middleware/auth.middleware");
const router = (0, express_1.Router)();
// All moderation routes require authentication and admin access
router.use(auth_middleware_1.authenticate);
router.use(admin_middleware_1.requireAdmin);
// Get pending moderation items
router.get('/pending', moderation_controller_1.getPendingModerationItems);
// Approve content
router.post('/:queueId/approve', moderation_controller_1.approveContent);
// Reject content
router.post('/:queueId/reject', moderation_controller_1.rejectContent);
// Get moderation statistics
router.get('/stats', moderation_controller_1.getModerationStats);
// Get user trust score
router.get('/users/:userId/trust-score', moderation_controller_1.getUserTrustScore);
// Update user trust score
router.put('/users/:userId/trust-score', moderation_controller_1.updateUserTrustScore);
// Get user's moderation history
router.get('/users/:userId/history', moderation_controller_1.getModerationHistory);
exports.default = router;
