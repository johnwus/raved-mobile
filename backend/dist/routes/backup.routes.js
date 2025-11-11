"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const backup_controller_1 = require("../controllers/backup.controller");
const auth_middleware_1 = require("../middleware/auth.middleware");
const admin_middleware_1 = require("../middleware/admin.middleware");
const validation_middleware_1 = require("../middleware/validation.middleware");
const router = (0, express_1.Router)();
// All backup routes require authentication
router.use(auth_middleware_1.authenticate);
// Admin-only routes
router.post('/admin/create', admin_middleware_1.requireAdmin, (0, validation_middleware_1.validateDataIntegrity)({
    type: { type: 'string', enum: ['full', 'postgresql', 'mongodb'], optional: true },
    compress: { type: 'boolean', optional: true },
    retentionDays: { type: 'number', min: 1, max: 365, optional: true }
}), backup_controller_1.backupController.createBackup);
router.get('/admin/list', admin_middleware_1.requireAdmin, backup_controller_1.backupController.listBackups);
router.post('/admin/restore', admin_middleware_1.requireAdmin, (0, validation_middleware_1.validateDataIntegrity)({
    backupId: { type: 'string', required: true },
    targetDatabases: {
        type: 'array',
        items: { type: 'string', enum: ['postgresql', 'mongodb'] },
        optional: true
    }
}), backup_controller_1.backupController.restoreBackup);
router.delete('/admin/:backupId', admin_middleware_1.requireAdmin, backup_controller_1.backupController.deleteBackup);
router.get('/admin/:backupId/verify', admin_middleware_1.requireAdmin, backup_controller_1.backupController.verifyBackup);
router.get('/admin/stats', admin_middleware_1.requireAdmin, backup_controller_1.backupController.getBackupStats);
// Data deletion request processing (admin only)
router.post('/admin/process-deletion', admin_middleware_1.requireAdmin, (0, validation_middleware_1.validateDataIntegrity)({
    requestId: { type: 'string', required: true },
    action: { type: 'string', enum: ['approve', 'deny'], required: true }
}), backup_controller_1.backupController.processDataDeletion);
// User routes (GDPR compliance)
router.post('/export', (0, validation_middleware_1.validateDataIntegrity)({
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
}), backup_controller_1.backupController.exportUserData);
router.post('/delete-request', (0, validation_middleware_1.validateDataIntegrity)({
    reason: { type: 'string', maxLength: 500, optional: true },
    confirmDeletion: { type: 'boolean', required: true }
}), backup_controller_1.backupController.requestDataDeletion);
exports.default = router;
