"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const express_validator_1 = require("express-validator");
const auth_middleware_1 = require("../middleware/auth.middleware");
const admin_middleware_1 = require("../middleware/admin.middleware");
const admin_controller_1 = require("../controllers/admin.controller");
const router = (0, express_1.Router)();
// Get content reports
router.get('/admin/reports', auth_middleware_1.authenticate, admin_middleware_1.requireAdmin, admin_controller_1.adminController.getReports);
// Report content
router.post('/reports', auth_middleware_1.authenticate, [
    (0, express_validator_1.body)('contentType').isIn(['post', 'comment', 'user', 'item', 'event']),
    (0, express_validator_1.body)('contentId').notEmpty(),
    (0, express_validator_1.body)('reason').notEmpty().isLength({ max: 100 }),
    (0, express_validator_1.body)('description').optional().isLength({ max: 500 })
], admin_controller_1.adminController.reportContent);
// Resolve report
router.post('/admin/reports/:reportId/resolve', auth_middleware_1.authenticate, admin_middleware_1.requireAdmin, [
    (0, express_validator_1.body)('action').isIn(['dismiss', 'warn', 'remove_content', 'suspend_user']),
    (0, express_validator_1.body)('notes').optional().isLength({ max: 500 })
], admin_controller_1.adminController.resolveReport);
// Get platform statistics (admin only)
router.get('/admin/statistics', auth_middleware_1.authenticate, admin_middleware_1.requireAdmin, admin_controller_1.adminController.getPlatformStatistics);
// Get user management list
router.get('/admin/users', auth_middleware_1.authenticate, admin_middleware_1.requireAdmin, admin_controller_1.adminController.getUserManagementList);
// Theme management endpoints
router.get('/admin/themes/analytics', auth_middleware_1.authenticate, admin_middleware_1.requireAdmin, admin_controller_1.adminController.getThemeAnalytics);
router.get('/admin/themes/usage', auth_middleware_1.authenticate, admin_middleware_1.requireAdmin, admin_controller_1.adminController.getThemeUsageStats);
router.post('/admin/themes/default', auth_middleware_1.authenticate, admin_middleware_1.requireAdmin, [
    (0, express_validator_1.body)('themeId').isIn(['default', 'rose', 'emerald', 'ocean', 'sunset', 'galaxy']),
    (0, express_validator_1.body)('darkMode').isBoolean()
], admin_controller_1.adminController.setDefaultTheme);
exports.default = router;
