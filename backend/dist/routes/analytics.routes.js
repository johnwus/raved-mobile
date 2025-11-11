"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const analytics_controller_1 = require("../controllers/analytics.controller");
const admin_middleware_1 = require("../middleware/admin.middleware");
const auth_middleware_1 = require("../middleware/auth.middleware");
const router = (0, express_1.Router)();
// Apply admin middleware to all analytics routes
router.use(auth_middleware_1.authenticate);
router.use(admin_middleware_1.requireAdmin);
// Dashboard endpoints
router.get('/dashboard', analytics_controller_1.analyticsController.getDashboardOverview.bind(analytics_controller_1.analyticsController));
router.get('/realtime', analytics_controller_1.analyticsController.getRealtimeMetrics.bind(analytics_controller_1.analyticsController));
// User activity endpoints
router.get('/users/:userId/activity', analytics_controller_1.analyticsController.getUserActivityHistory.bind(analytics_controller_1.analyticsController));
// Report generation endpoints
router.post('/reports/generate', analytics_controller_1.analyticsController.generateReport.bind(analytics_controller_1.analyticsController));
router.get('/reports', analytics_controller_1.analyticsController.getReports.bind(analytics_controller_1.analyticsController));
// A/B Testing endpoints
router.post('/ab-tests', analytics_controller_1.analyticsController.createABTest.bind(analytics_controller_1.analyticsController));
router.get('/ab-tests/:testName/variant', analytics_controller_1.analyticsController.getABTestVariant.bind(analytics_controller_1.analyticsController));
router.post('/ab-tests/:testName/results', analytics_controller_1.analyticsController.trackABTestResult.bind(analytics_controller_1.analyticsController));
router.get('/ab-tests/:testName/results', analytics_controller_1.analyticsController.getABTestResults.bind(analytics_controller_1.analyticsController));
// Advanced analytics endpoints
router.post('/query', analytics_controller_1.analyticsController.runCustomQuery.bind(analytics_controller_1.analyticsController));
router.get('/export', analytics_controller_1.analyticsController.exportAnalyticsData.bind(analytics_controller_1.analyticsController));
exports.default = router;
