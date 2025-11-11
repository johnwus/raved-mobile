import { Request, Response, NextFunction } from 'express';
import OfflineStatusService from '../services/offline-status.service';
import OfflineAnalyticsService from '../services/offline-analytics.service';

/**
 * Middleware to track device status and offline capabilities
 */
export const trackDeviceStatus = async (req: Request, res: Response, next: NextFunction) => {
    try {
        if (req.user) {
            const deviceId = req.headers['x-device-id'] as string;
            const userAgent = req.headers['user-agent'] as string;

            if (deviceId) {
                // Update device status
                const platform = req.headers['x-platform'] as string;
                const validPlatforms = ['web', 'ios', 'android'];
                const devicePlatform = validPlatforms.includes(platform) ? platform as 'web' | 'ios' | 'android' : 'web';

                await OfflineStatusService.updateDeviceStatus({
                    userId: req.user.id,
                    deviceId,
                    isOnline: true,
                    appVersion: req.headers['x-app-version'] as string || 'unknown',
                    platform: devicePlatform,
                    lastSyncAttempt: new Date(),
                });
            }
        }
    } catch (error) {
        // Don't fail the request if device tracking fails
        console.warn('Device tracking failed:', error);
    }

    next();
};

/**
 * Middleware to handle offline requests gracefully
 */
export const handleOfflineRequests = async (req: Request, res: Response, next: NextFunction) => {
    const isOffline = req.headers['x-offline'] === 'true';
    const deviceId = req.headers['x-device-id'] as string;

    if (isOffline && req.user) {
        try {
            // Check if user has offline capabilities enabled
            const devices = await OfflineStatusService.getUserDevices(req.user.id);
            const currentDevice = devices.find(d => d.deviceId === deviceId);

            if (!currentDevice?.syncEnabled) {
                return res.status(403).json({
                    success: false,
                    error: 'Offline sync not enabled',
                    message: 'Offline synchronization is not enabled for this device',
                });
            }

            // Add offline context to request
            (req as any).offlineContext = {
                deviceId,
                isOffline: true,
                syncEnabled: currentDevice.syncEnabled,
                lastSuccessfulSync: currentDevice.lastSuccessfulSync,
            };

        } catch (error) {
            console.warn('Offline context setup failed:', error);
        }
    }

    next();
};

/**
 * Middleware to provide offline fallback for critical operations
 */
export const offlineFallback = (fallbackHandler: (req: Request, res: Response) => Promise<void>) => {
    return async (req: Request, res: Response, next: NextFunction) => {
        const originalJson = res.json;
        let responseSent = false;

        // Override res.json to track if response was sent
        res.json = function(data: any) {
            responseSent = true;
            return originalJson.call(this, data);
        };

        try {
            await next();
        } catch (error: any) {
            // If no response was sent and we have a fallback, use it
            if (!responseSent && fallbackHandler) {
                try {
                    await fallbackHandler(req, res);
                } catch (fallbackError) {
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
            } else if (!responseSent) {
                throw error;
            }
        }
    };
};

/**
 * Middleware to validate offline request parameters
 */
export const validateOfflineRequest = (req: Request, res: Response, next: NextFunction) => {
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
        const deviceId = req.headers['x-device-id'] as string;
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

/**
 * Middleware to handle offline analytics tracking
 */
export const trackOfflineAnalytics = async (req: Request, res: Response, next: NextFunction) => {
    const startTime = Date.now();
    const originalJson = res.json;
    const originalStatus = res.status;

    let statusCode = 200;
    let responseSize = 0;

    // Track response
    res.json = function(data: any) {
        responseSize = JSON.stringify(data).length;
        return originalJson.call(this, data);
    };

    res.status = function(code: number) {
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

            await OfflineAnalyticsService.queueAnalyticsEvent({
                userId: req.user.id,
                sessionId: req.headers['x-session-id'] as string || `session_${Date.now()}`,
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
                    userAgent: req.headers['user-agent'] as string,
                    deviceId: req.headers['x-device-id'] as string,
                    appVersion: req.headers['x-app-version'] as string,
                },
            });
        }
    } catch (error) {
        console.warn('Analytics tracking failed:', error);
    }
};

/**
 * Middleware to enable conditional offline processing
 */
export const conditionalOffline = (options: {
    enableForOffline?: boolean;
    fallbackToCache?: boolean;
    cacheTimeout?: number;
}) => {
    return async (req: Request, res: Response, next: NextFunction) => {
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
        (req as any).offlineOptions = {
            ...options,
            isOffline,
        };

        next();
    };
};