"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_middleware_1 = require("../middleware/auth.middleware");
const notifications_controller_1 = require("../controllers/notifications.controller");
const router = (0, express_1.Router)();
// Get user notifications
router.get('/', auth_middleware_1.authenticate, notifications_controller_1.notificationsController.getNotifications);
// Mark notification as read
router.patch('/:notificationId/read', auth_middleware_1.authenticate, notifications_controller_1.notificationsController.markAsRead);
// Mark all notifications as read
router.patch('/read-all', auth_middleware_1.authenticate, notifications_controller_1.notificationsController.markAllAsRead);
// Delete notification
router.delete('/:notificationId', auth_middleware_1.authenticate, notifications_controller_1.notificationsController.deleteNotification);
// Get notification settings
router.get('/settings', auth_middleware_1.authenticate, notifications_controller_1.notificationsController.getNotificationSettings);
// Update notification settings
router.patch('/settings', auth_middleware_1.authenticate, notifications_controller_1.notificationsController.updateNotificationSettings);
exports.default = router;
