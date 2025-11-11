"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_middleware_1 = require("../middleware/auth.middleware");
const connection_controller_1 = require("../controllers/connection.controller");
const router = (0, express_1.Router)();
// Send follow request (for private accounts)
router.post('/request/:userId', auth_middleware_1.authenticate, connection_controller_1.connectionController.sendFollowRequest);
// Get pending follow requests
router.get('/requests', auth_middleware_1.authenticate, connection_controller_1.connectionController.getPendingFollowRequests);
// Approve follow request
router.post('/requests/:requestId/approve', auth_middleware_1.authenticate, connection_controller_1.connectionController.approveFollowRequest);
// Reject follow request
router.post('/requests/:requestId/reject', auth_middleware_1.authenticate, connection_controller_1.connectionController.rejectFollowRequest);
// Block user
router.post('/block/:userId', auth_middleware_1.authenticate, connection_controller_1.connectionController.blockUser);
// Unblock user
router.delete('/block/:userId', auth_middleware_1.authenticate, connection_controller_1.connectionController.unblockUser);
// Get blocked users
router.get('/blocked', auth_middleware_1.authenticate, connection_controller_1.connectionController.getBlockedUsers);
exports.default = router;
