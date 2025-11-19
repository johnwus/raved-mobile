"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const analytics_controller_1 = require("../controllers/analytics.controller");
const admin_middleware_1 = require("../middleware/admin.middleware");
const auth_middleware_1 = require("../middleware/auth.middleware");
const router = (0, express_1.Router)();
// User analytics routes (require authentication, premium for advanced)
router.get('/user', auth_middleware_1.authenticate, analytics_controller_1.analyticsController.getUserAnalytics.bind(analytics_controller_1.analyticsController));
router.get('/store', auth_middleware_1.authenticate, auth_middleware_1.requirePremium, analytics_controller_1.analyticsController.getStoreAnalytics.bind(analytics_controller_1.analyticsController));
router.post('/track', auth_middleware_1.authenticate, analytics_controller_1.analyticsController.trackEvent.bind(analytics_controller_1.analyticsController));
// Admin analytics routes (all require admin authentication)
router.get('/admin/dashboard', auth_middleware_1.authenticate, admin_middleware_1.requireAdmin, analytics_controller_1.analyticsController.getDashboardOverview.bind(analytics_controller_1.analyticsController));
router.get('/admin/realtime', auth_middleware_1.authenticate, admin_middleware_1.requireAdmin, analytics_controller_1.analyticsController.getRealtimeMetrics.bind(analytics_controller_1.analyticsController));
// User activity endpoints
router.get('/admin/users/:userId/activity', auth_middleware_1.authenticate, admin_middleware_1.requireAdmin, analytics_controller_1.analyticsController.getUserActivityHistory.bind(analytics_controller_1.analyticsController));
// Report generation endpoints
router.post('/admin/reports/generate', auth_middleware_1.authenticate, admin_middleware_1.requireAdmin, analytics_controller_1.analyticsController.generateReport.bind(analytics_controller_1.analyticsController));
router.get('/admin/reports', auth_middleware_1.authenticate, admin_middleware_1.requireAdmin, analytics_controller_1.analyticsController.getReports.bind(analytics_controller_1.analyticsController));
// A/B Testing endpoints
router.post('/admin/ab-tests', auth_middleware_1.authenticate, admin_middleware_1.requireAdmin, analytics_controller_1.analyticsController.createABTest.bind(analytics_controller_1.analyticsController));
router.get('/admin/ab-tests/:testName/variant', auth_middleware_1.authenticate, admin_middleware_1.requireAdmin, analytics_controller_1.analyticsController.getABTestVariant.bind(analytics_controller_1.analyticsController));
router.post('/admin/ab-tests/:testName/results', auth_middleware_1.authenticate, admin_middleware_1.requireAdmin, analytics_controller_1.analyticsController.trackABTestResult.bind(analytics_controller_1.analyticsController));
router.get('/admin/ab-tests/:testName/results', auth_middleware_1.authenticate, admin_middleware_1.requireAdmin, analytics_controller_1.analyticsController.getABTestResults.bind(analytics_controller_1.analyticsController));
// Advanced analytics endpoints
router.post('/admin/query', auth_middleware_1.authenticate, admin_middleware_1.requireAdmin, analytics_controller_1.analyticsController.runCustomQuery.bind(analytics_controller_1.analyticsController));
router.get('/admin/export', auth_middleware_1.authenticate, admin_middleware_1.requireAdmin, analytics_controller_1.analyticsController.exportAnalyticsData.bind(analytics_controller_1.analyticsController));
exports.default = router;
