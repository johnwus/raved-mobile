import { Router } from 'express';
import { analyticsController } from '../controllers/analytics.controller';
import { requireAdmin } from '../middleware/admin.middleware';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

// Apply admin middleware to all analytics routes
router.use(authenticate);
router.use(requireAdmin);

// Dashboard endpoints
router.get('/dashboard', analyticsController.getDashboardOverview.bind(analyticsController));
router.get('/realtime', analyticsController.getRealtimeMetrics.bind(analyticsController));

// User activity endpoints
router.get('/users/:userId/activity', analyticsController.getUserActivityHistory.bind(analyticsController));

// Report generation endpoints
router.post('/reports/generate', analyticsController.generateReport.bind(analyticsController));
router.get('/reports', analyticsController.getReports.bind(analyticsController));

// A/B Testing endpoints
router.post('/ab-tests', analyticsController.createABTest.bind(analyticsController));
router.get('/ab-tests/:testName/variant', analyticsController.getABTestVariant.bind(analyticsController));
router.post('/ab-tests/:testName/results', analyticsController.trackABTestResult.bind(analyticsController));
router.get('/ab-tests/:testName/results', analyticsController.getABTestResults.bind(analyticsController));

// Advanced analytics endpoints
router.post('/query', analyticsController.runCustomQuery.bind(analyticsController));
router.get('/export', analyticsController.exportAnalyticsData.bind(analyticsController));

export default router;