import { Router } from 'express';
import { body, param, query } from 'express-validator';
import {
    queueOfflineRequest,
    processOfflineQueue,
    getOfflineQueueStatus,
    resolveSyncConflict,
    getSyncConflicts,
    autoResolveConflicts,
    updateDeviceStatus,
    getDeviceStatuses,
    storeOfflineData,
    syncOfflineData,
    getOfflineDataStats,
    getDataVersionHistory,
    getOfflineAnalytics,
    clearUserCache,
    getCacheMetrics,
} from '../controllers/offline-sync.controller';
import { authenticate } from '../middleware/auth.middleware';
import { handleValidationErrors } from '../middleware/validation.middleware';

const router = Router();

// All routes require authentication
router.use(authenticate);

// Offline queue management
router.post('/queue', [
    body('method').isIn(['GET', 'POST', 'PUT', 'PATCH', 'DELETE']).withMessage('Invalid HTTP method'),
    body('url').isURL().withMessage('Invalid URL'),
    body('headers').optional().isObject().withMessage('Headers must be an object'),
    body('priority').optional().isInt({ min: 0, max: 100 }).withMessage('Priority must be between 0 and 100'),
    body('maxRetries').optional().isInt({ min: 0, max: 10 }).withMessage('Max retries must be between 0 and 10'),
    body('scheduledAt').optional().isISO8601().withMessage('Invalid scheduled date'),
    body('dependencies').optional().isArray().withMessage('Dependencies must be an array'),
    body('tags').optional().isArray().withMessage('Tags must be an array'),
    handleValidationErrors,
], queueOfflineRequest);

router.post('/queue/process', processOfflineQueue);
router.get('/queue/status', getOfflineQueueStatus);

// Sync conflict resolution
router.post('/conflicts/:conflictId/resolve', [
    param('conflictId').isUUID().withMessage('Invalid conflict ID'),
    body('strategy').isIn(['local_wins', 'server_wins', 'merge', 'manual']).withMessage('Invalid resolution strategy'),
    body('resolvedData').optional().isObject().withMessage('Resolved data must be an object'),
    handleValidationErrors,
], resolveSyncConflict);

router.get('/conflicts', [
    query('entityType').optional().isString().withMessage('Entity type must be a string'),
    query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
    query('offset').optional().isInt({ min: 0 }).withMessage('Offset must be non-negative'),
    handleValidationErrors,
], getSyncConflicts);

router.post('/conflicts/auto-resolve', [
    body('entityType').optional().isString().withMessage('Entity type must be a string'),
    body('rules').optional().isObject().withMessage('Rules must be an object'),
    handleValidationErrors,
], autoResolveConflicts);

// Device status management
router.post('/device/status', [
    body('deviceId').isString().notEmpty().withMessage('Device ID is required'),
    body('isOnline').isBoolean().withMessage('isOnline must be a boolean'),
    body('connectionType').optional().isIn(['wifi', 'cellular', 'ethernet', 'unknown']).withMessage('Invalid connection type'),
    body('networkQuality').optional().isIn(['excellent', 'good', 'poor', 'offline']).withMessage('Invalid network quality'),
    body('batteryLevel').optional().isInt({ min: 0, max: 100 }).withMessage('Battery level must be between 0 and 100'),
    body('appVersion').isString().notEmpty().withMessage('App version is required'),
    body('platform').isIn(['ios', 'android', 'web']).withMessage('Invalid platform'),
    body('syncEnabled').optional().isBoolean().withMessage('syncEnabled must be a boolean'),
    body('lastSyncAttempt').optional().isISO8601().withMessage('Invalid last sync attempt date'),
    body('lastSuccessfulSync').optional().isISO8601().withMessage('Invalid last successful sync date'),
    body('pendingSyncItems').optional().isInt({ min: 0 }).withMessage('Pending sync items must be non-negative'),
    handleValidationErrors,
], updateDeviceStatus);

router.get('/device/status', [
    query('includeOffline').optional().isBoolean().withMessage('includeOffline must be a boolean'),
    handleValidationErrors,
], getDeviceStatuses);

// Offline data management
router.post('/data', [
    body('entityType').isString().notEmpty().withMessage('Entity type is required'),
    body('entityId').isString().notEmpty().withMessage('Entity ID is required'),
    body('data').isObject().withMessage('Data must be an object'),
    body('metadata').optional().isObject().withMessage('Metadata must be an object'),
    body('expiresAt').optional().isISO8601().withMessage('Invalid expiration date'),
    body('priority').optional().isInt({ min: 0, max: 100 }).withMessage('Priority must be between 0 and 100'),
    body('tags').optional().isArray().withMessage('Tags must be an array'),
    handleValidationErrors,
], storeOfflineData);

router.post('/data/sync', [
    body('entityTypes').optional().isArray().withMessage('Entity types must be an array'),
    handleValidationErrors,
], syncOfflineData);

router.get('/data/stats', getOfflineDataStats);

// Data versioning
router.get('/versions/:entityType/:entityId', [
    param('entityType').isString().notEmpty().withMessage('Entity type is required'),
    param('entityId').isString().notEmpty().withMessage('Entity ID is required'),
    query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
    query('offset').optional().isInt({ min: 0 }).withMessage('Offset must be non-negative'),
    handleValidationErrors,
], getDataVersionHistory);

// Analytics and monitoring
router.get('/analytics', [
    query('dateRange').optional().isObject().withMessage('Date range must be an object'),
    handleValidationErrors,
], getOfflineAnalytics);

// Cache management
router.post('/cache/clear', [
    body('entityTypes').optional().isArray().withMessage('Entity types must be an array'),
    handleValidationErrors,
], clearUserCache);

router.get('/cache/metrics', getCacheMetrics);

export default router;