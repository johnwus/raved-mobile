"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const express_validator_1 = require("express-validator");
const offline_sync_controller_1 = require("../controllers/offline-sync.controller");
const auth_middleware_1 = require("../middleware/auth.middleware");
const validation_middleware_1 = require("../middleware/validation.middleware");
const router = (0, express_1.Router)();
// All routes require authentication
router.use(auth_middleware_1.authenticate);
// Offline queue management
router.post('/queue', [
    (0, express_validator_1.body)('method').isIn(['GET', 'POST', 'PUT', 'PATCH', 'DELETE']).withMessage('Invalid HTTP method'),
    (0, express_validator_1.body)('url').isURL().withMessage('Invalid URL'),
    (0, express_validator_1.body)('headers').optional().isObject().withMessage('Headers must be an object'),
    (0, express_validator_1.body)('priority').optional().isInt({ min: 0, max: 100 }).withMessage('Priority must be between 0 and 100'),
    (0, express_validator_1.body)('maxRetries').optional().isInt({ min: 0, max: 10 }).withMessage('Max retries must be between 0 and 10'),
    (0, express_validator_1.body)('scheduledAt').optional().isISO8601().withMessage('Invalid scheduled date'),
    (0, express_validator_1.body)('dependencies').optional().isArray().withMessage('Dependencies must be an array'),
    (0, express_validator_1.body)('tags').optional().isArray().withMessage('Tags must be an array'),
    validation_middleware_1.handleValidationErrors,
], offline_sync_controller_1.queueOfflineRequest);
router.post('/queue/process', offline_sync_controller_1.processOfflineQueue);
router.get('/queue/status', offline_sync_controller_1.getOfflineQueueStatus);
// Sync conflict resolution
router.post('/conflicts/:conflictId/resolve', [
    (0, express_validator_1.param)('conflictId').isUUID().withMessage('Invalid conflict ID'),
    (0, express_validator_1.body)('strategy').isIn(['local_wins', 'server_wins', 'merge', 'manual']).withMessage('Invalid resolution strategy'),
    (0, express_validator_1.body)('resolvedData').optional().isObject().withMessage('Resolved data must be an object'),
    validation_middleware_1.handleValidationErrors,
], offline_sync_controller_1.resolveSyncConflict);
router.get('/conflicts', [
    (0, express_validator_1.query)('entityType').optional().isString().withMessage('Entity type must be a string'),
    (0, express_validator_1.query)('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
    (0, express_validator_1.query)('offset').optional().isInt({ min: 0 }).withMessage('Offset must be non-negative'),
    validation_middleware_1.handleValidationErrors,
], offline_sync_controller_1.getSyncConflicts);
router.post('/conflicts/auto-resolve', [
    (0, express_validator_1.body)('entityType').optional().isString().withMessage('Entity type must be a string'),
    (0, express_validator_1.body)('rules').optional().isObject().withMessage('Rules must be an object'),
    validation_middleware_1.handleValidationErrors,
], offline_sync_controller_1.autoResolveConflicts);
// Device status management
router.post('/device/status', [
    (0, express_validator_1.body)('deviceId').isString().notEmpty().withMessage('Device ID is required'),
    (0, express_validator_1.body)('isOnline').isBoolean().withMessage('isOnline must be a boolean'),
    (0, express_validator_1.body)('connectionType').optional().isIn(['wifi', 'cellular', 'ethernet', 'unknown']).withMessage('Invalid connection type'),
    (0, express_validator_1.body)('networkQuality').optional().isIn(['excellent', 'good', 'poor', 'offline']).withMessage('Invalid network quality'),
    (0, express_validator_1.body)('batteryLevel').optional().isInt({ min: 0, max: 100 }).withMessage('Battery level must be between 0 and 100'),
    (0, express_validator_1.body)('appVersion').isString().notEmpty().withMessage('App version is required'),
    (0, express_validator_1.body)('platform').isIn(['ios', 'android', 'web']).withMessage('Invalid platform'),
    (0, express_validator_1.body)('syncEnabled').optional().isBoolean().withMessage('syncEnabled must be a boolean'),
    (0, express_validator_1.body)('lastSyncAttempt').optional().isISO8601().withMessage('Invalid last sync attempt date'),
    (0, express_validator_1.body)('lastSuccessfulSync').optional().isISO8601().withMessage('Invalid last successful sync date'),
    (0, express_validator_1.body)('pendingSyncItems').optional().isInt({ min: 0 }).withMessage('Pending sync items must be non-negative'),
    validation_middleware_1.handleValidationErrors,
], offline_sync_controller_1.updateDeviceStatus);
router.get('/device/status', [
    (0, express_validator_1.query)('includeOffline').optional().isBoolean().withMessage('includeOffline must be a boolean'),
    validation_middleware_1.handleValidationErrors,
], offline_sync_controller_1.getDeviceStatuses);
// Offline data management
router.post('/data', [
    (0, express_validator_1.body)('entityType').isString().notEmpty().withMessage('Entity type is required'),
    (0, express_validator_1.body)('entityId').isString().notEmpty().withMessage('Entity ID is required'),
    (0, express_validator_1.body)('data').isObject().withMessage('Data must be an object'),
    (0, express_validator_1.body)('metadata').optional().isObject().withMessage('Metadata must be an object'),
    (0, express_validator_1.body)('expiresAt').optional().isISO8601().withMessage('Invalid expiration date'),
    (0, express_validator_1.body)('priority').optional().isInt({ min: 0, max: 100 }).withMessage('Priority must be between 0 and 100'),
    (0, express_validator_1.body)('tags').optional().isArray().withMessage('Tags must be an array'),
    validation_middleware_1.handleValidationErrors,
], offline_sync_controller_1.storeOfflineData);
router.post('/data/sync', [
    (0, express_validator_1.body)('entityTypes').optional().isArray().withMessage('Entity types must be an array'),
    validation_middleware_1.handleValidationErrors,
], offline_sync_controller_1.syncOfflineData);
router.get('/data/stats', offline_sync_controller_1.getOfflineDataStats);
// Data versioning
router.get('/versions/:entityType/:entityId', [
    (0, express_validator_1.param)('entityType').isString().notEmpty().withMessage('Entity type is required'),
    (0, express_validator_1.param)('entityId').isString().notEmpty().withMessage('Entity ID is required'),
    (0, express_validator_1.query)('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
    (0, express_validator_1.query)('offset').optional().isInt({ min: 0 }).withMessage('Offset must be non-negative'),
    validation_middleware_1.handleValidationErrors,
], offline_sync_controller_1.getDataVersionHistory);
// Analytics and monitoring
router.get('/analytics', [
    (0, express_validator_1.query)('dateRange').optional().isObject().withMessage('Date range must be an object'),
    validation_middleware_1.handleValidationErrors,
], offline_sync_controller_1.getOfflineAnalytics);
// Cache management
router.post('/cache/clear', [
    (0, express_validator_1.body)('entityTypes').optional().isArray().withMessage('Entity types must be an array'),
    validation_middleware_1.handleValidationErrors,
], offline_sync_controller_1.clearUserCache);
router.get('/cache/metrics', offline_sync_controller_1.getCacheMetrics);
exports.default = router;
