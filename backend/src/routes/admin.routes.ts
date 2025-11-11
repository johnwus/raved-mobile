import { Router } from 'express';
import { body } from 'express-validator';
import { authenticate } from '../middleware/auth.middleware';
import { requireAdmin } from '../middleware/admin.middleware';
import { adminController } from '../controllers/admin.controller';

const router = Router();

// Get content reports
router.get('/admin/reports', authenticate, requireAdmin, adminController.getReports);

// Report content
router.post('/reports', authenticate, [
  body('contentType').isIn(['post', 'comment', 'user', 'item', 'event']),
  body('contentId').notEmpty(),
  body('reason').notEmpty().isLength({ max: 100 }),
  body('description').optional().isLength({ max: 500 })
], adminController.reportContent);

// Resolve report
router.post('/admin/reports/:reportId/resolve', authenticate, requireAdmin, [
  body('action').isIn(['dismiss', 'warn', 'remove_content', 'suspend_user']),
  body('notes').optional().isLength({ max: 500 })
], adminController.resolveReport);

// Get platform statistics (admin only)
router.get('/admin/statistics', authenticate, requireAdmin, adminController.getPlatformStatistics);

// Get user management list
router.get('/admin/users', authenticate, requireAdmin, adminController.getUserManagementList);

// Theme management endpoints
router.get('/admin/themes/analytics', authenticate, requireAdmin, adminController.getThemeAnalytics);
router.get('/admin/themes/usage', authenticate, requireAdmin, adminController.getThemeUsageStats);
router.post('/admin/themes/default', authenticate, requireAdmin, [
  body('themeId').isIn(['default', 'rose', 'emerald', 'ocean', 'sunset', 'galaxy']),
  body('darkMode').isBoolean()
], adminController.setDefaultTheme);

export default router;
