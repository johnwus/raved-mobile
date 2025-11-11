import { Router } from 'express';
import { backupController } from '../controllers/backup.controller';
import { authenticate } from '../middleware/auth.middleware';
import { requireAdmin } from '../middleware/admin.middleware';
import { validateDataIntegrity } from '../middleware/validation.middleware';

const router = Router();

// All backup routes require authentication
router.use(authenticate);

// Admin-only routes
router.post('/admin/create',
  requireAdmin,
  validateDataIntegrity({
    type: { type: 'string', enum: ['full', 'postgresql', 'mongodb'], optional: true },
    compress: { type: 'boolean', optional: true },
    retentionDays: { type: 'number', min: 1, max: 365, optional: true }
  }),
  backupController.createBackup
);

router.get('/admin/list',
  requireAdmin,
  backupController.listBackups
);

router.post('/admin/restore',
  requireAdmin,
  validateDataIntegrity({
    backupId: { type: 'string', required: true },
    targetDatabases: {
      type: 'array',
      items: { type: 'string', enum: ['postgresql', 'mongodb'] },
      optional: true
    }
  }),
  backupController.restoreBackup
);

router.delete('/admin/:backupId',
  requireAdmin,
  backupController.deleteBackup
);

router.get('/admin/:backupId/verify',
  requireAdmin,
  backupController.verifyBackup
);

router.get('/admin/stats',
  requireAdmin,
  backupController.getBackupStats
);

// Data deletion request processing (admin only)
router.post('/admin/process-deletion',
  requireAdmin,
  validateDataIntegrity({
    requestId: { type: 'string', required: true },
    action: { type: 'string', enum: ['approve', 'deny'], required: true }
  }),
  backupController.processDataDeletion
);

// User routes (GDPR compliance)
router.post('/export',
  validateDataIntegrity({
    anonymize: { type: 'boolean', optional: true },
    format: { type: 'string', enum: ['json', 'csv'], optional: true },
    includePersonalData: { type: 'boolean', optional: true },
    dateRange: {
      type: 'object',
      properties: {
        start: { type: 'date' },
        end: { type: 'date' }
      },
      optional: true
    }
  }),
  backupController.exportUserData
);

router.post('/delete-request',
  validateDataIntegrity({
    reason: { type: 'string', maxLength: 500, optional: true },
    confirmDeletion: { type: 'boolean', required: true }
  }),
  backupController.requestDataDeletion
);

export default router;