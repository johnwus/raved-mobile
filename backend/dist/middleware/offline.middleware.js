"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.conditionalOffline = exports.trackOfflineAnalytics = exports.validateOfflineRequest = exports.offlineFallback = exports.handleOfflineRequests = exports.trackDeviceStatus = void 0;
const offline_status_service_1 = __importDefault(require("../services/offline-status.service"));
const offline_analytics_service_1 = __importDefault(require("../services/offline-analytics.service"));
/**
 * Middleware to track device status and offline capabilities
 */
const trackDeviceStatus = async (req, res, next) => {
    try {
        if (req.user) {
            const deviceId = req.headers['x-device-id'];
            const userAgent = req.headers['user-agent'];
            if (deviceId) {
                // Update device status
                const platform = req.headers['x-platform'];
                const validPlatforms = ['web', 'ios', 'android'];
                const devicePlatform = validPlatforms.includes(platform) ? platform : 'web';
                await offline_status_service_1.default.updateDeviceStatus({
                    userId: req.user.id,
                    deviceId,
                    isOnline: true,
                    appVersion: req.headers['x-app-version'] || 'unknown',
                    platform: devicePlatform,
                    lastSyncAttempt: new Date(),
                });
            }
        }
    }
    catch (error) {
        // Don't fail the request if device tracking fails
        console.warn('Device tracking failed:', error);
    }
    next();
};
exports.trackDeviceStatus = trackDeviceStatus;
/**
 * Middleware to handle offline requests gracefully
 */
const handleOfflineRequests = async (req, res, next) => {
    const isOffline = req.headers['x-offline'] === 'true';
    const deviceId = req.headers['x-device-id'];
    if (isOffline && req.user) {
        try {
            // Check if user has offline capabilities enabled
            const devices = await offline_status_service_1.default.getUserDevices(req.user.id);
            const currentDevice = devices.find(d => d.deviceId === deviceId);
            if (!currentDevice?.syncEnabled) {
                return res.status(403).json({
                    success: false,
                    error: 'Offline sync not enabled',
                    message: 'Offline synchronization is not enabled for this device',
                });
            }
            // Add offline context to request
            req.offlineContext = {
                deviceId,
                isOffline: true,
                syncEnabled: currentDevice.syncEnabled,
                lastSuccessfulSync: currentDevice.lastSuccessfulSync,
            };
        }
        catch (error) {
            console.warn('Offline context setup failed:', error);
        }
    }
    next();
};
exports.handleOfflineRequests = handleOfflineRequests;
/**
 * Middleware to provide offline fallback for critical operations
 */
const offlineFallback = (fallbackHandler) => {
    return async (req, res, next) => {
        const originalJson = res.json;
        let responseSent = false;
        // Override res.json to track if response was sent
        res.json = function (data) {
            responseSent = true;
            return originalJson.call(this, data);
        };
        try {
            await next();
        }
        catch (error) {
            // If no response was sent and we have a fallback, use it
            if (!responseSent && fallbackHandler) {
                try {
                    await fallbackHandler(req, res);
                }
                catch (fallbackError) {
                    console.error('Offline fallback failed:', fallbackError);
                    if (!responseSent) {
                        res.status(500).json({
                            success: false,
                            error: 'Service temporarily unavailable',
                            offline: true,
                            message: 'Please try again when connection is restored',
                        });
                    }
                }
            }
            else if (!responseSent) {
                throw error;
            }
        }
    };
};
exports.offlineFallback = offlineFallback;
/**
 * Middleware to validate offline request parameters
 */
const validateOfflineRequest = (req, res, next) => {
    const offline = req.headers['x-offline'] === 'true';
    if (offline) {
        const requiredHeaders = ['x-device-id', 'x-app-version'];
        const missingHeaders = requiredHeaders.filter(header => !req.headers[header]);
        if (missingHeaders.length > 0) {
            return res.status(400).json({
                success: false,
                error: 'Missing offline headers',
                message: `Required headers missing: ${missingHeaders.join(', ')}`,
                requiredHeaders,
            });
        }
        // Validate device ID format
        const deviceId = req.headers['x-device-id'];
        if (!/^[a-zA-Z0-9\-_]{10,}$/.test(deviceId)) {
            return res.status(400).json({
                success: false,
                error: 'Invalid device ID format',
                message: 'Device ID must be at least 10 characters and contain only alphanumeric characters, hyphens, and underscores',
            });
        }
    }
    next();
};
exports.validateOfflineRequest = validateOfflineRequest;
/**
 * Middleware to handle offline analytics tracking
 */
const trackOfflineAnalytics = async (req, res, next) => {
    const startTime = Date.now();
    const originalJson = res.json;
    const originalStatus = res.status;
    let statusCode = 200;
    let responseSize = 0;
    // Track response
    res.json = function (data) {
        responseSize = JSON.stringify(data).length;
        return originalJson.call(this, data);
    };
    res.status = function (code) {
        statusCode = code;
        return originalStatus.call(this, code);
    };
    // Call next middleware
    await next();
    // Track analytics after response
    try {
        if (req.user) {
            const duration = Date.now() - startTime;
            const isOffline = req.headers['x-offline'] === 'true';
            await offline_analytics_service_1.default.queueAnalyticsEvent({
                userId: req.user.id,
                sessionId: req.headers['x-session-id'] || `session_${Date.now()}`,
                eventType: isOffline ? 'offline_request' : 'online_request',
                eventCategory: 'api_usage',
                eventAction: req.method,
                eventLabel: req.path,
                eventValue: duration,
                timestamp: new Date(),
                offline: isOffline,
                metadata: {
                    statusCode,
                    responseSize,
                    userAgent: req.headers['user-agent'],
                    deviceId: req.headers['x-device-id'],
                    appVersion: req.headers['x-app-version'],
                },
            });
        }
    }
    catch (error) {
        console.warn('Analytics tracking failed:', error);
    }
};
exports.trackOfflineAnalytics = trackOfflineAnalytics;
/**
 * Middleware to enable conditional offline processing
 */
const conditionalOffline = (options) => {
    return async (req, res, next) => {
        const isOffline = req.headers['x-offline'] === 'true';
        const enableOffline = options.enableForOffline !== false;
        if (isOffline && !enableOffline) {
            return res.status(403).json({
                success: false,
                error: 'Offline access disabled',
                message: 'This operation is not available offline',
            });
        }
        // Add offline processing context
        req.offlineOptions = {
            ...options,
            isOffline,
        };
        next();
    };
};
exports.conditionalOffline = conditionalOffline;
