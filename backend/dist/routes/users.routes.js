"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_middleware_1 = require("../middleware/auth.middleware");
const users_controller_1 = require("../controllers/users.controller");
const router = (0, express_1.Router)();
// All routes require authentication
router.use(auth_middleware_1.authenticate);
// Get current user profile
router.get('/profile', users_controller_1.usersController.getProfile);
// Update current user profile
router.put('/profile', users_controller_1.usersController.updateProfile);
// Update avatar
router.put('/avatar', users_controller_1.usersController.updateAvatar);
// Get user stats
router.get('/stats', users_controller_1.usersController.getUserStats);
// Get user connections (must be before /:userId route)
router.get('/connections', users_controller_1.usersController.getConnections);
// Get user settings (must be before /:userId route)
router.get('/settings', users_controller_1.usersController.getUserSettings);
// Update user settings (must be before /:userId route)
router.put('/settings', users_controller_1.usersController.updateUserSettings);
// Notification preferences (alias for settings)
router.get('/notification-preferences', users_controller_1.usersController.getNotificationPreferences);
router.put('/notification-preferences', users_controller_1.usersController.updateNotificationPreferences);
// Get user by ID profile
router.get('/:userId', users_controller_1.usersController.getProfile);
// Get user stats by ID
router.get('/:userId/stats', users_controller_1.usersController.getUserStats);
// Get user posts
router.get('/:userId/posts', users_controller_1.usersController.getUserPosts);
// Get user comments
router.get('/:userId/comments', users_controller_1.usersController.getUserComments);
// Get user liked posts
router.get('/:userId/liked-posts', users_controller_1.usersController.getUserLikedPosts);
// Get user saved posts
router.get('/:userId/saved-posts', users_controller_1.usersController.getUserSavedPosts);
// Get user connections (followers/following) by userId
router.get('/:userId/connections', users_controller_1.usersController.getConnections);
// Follow user
router.post('/:userId/follow', users_controller_1.usersController.followUser);
// Unfollow user
router.delete('/:userId/follow', users_controller_1.usersController.unfollowUser);
exports.default = router;
