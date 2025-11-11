"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.OfflineAnalyticsService = void 0;
const uuid_1 = require("uuid");
const database_1 = require("../config/database");
class OfflineAnalyticsService {
    /**
     * Queue an analytics event for offline processing
     */
    static async queueAnalyticsEvent(event) {
        const queuedEvent = {
            ...event,
            id: (0, uuid_1.v4)(),
            queuedAt: new Date(),
            retryCount: 0,
        };
        await database_1.redis.lpush(this.ANALYTICS_QUEUE_KEY, JSON.stringify(queuedEvent));
    }
    /**
     * Queue an error report for offline processing
     */
    static async queueErrorReport(error) {
        const errorReport = {
            ...error,
            id: (0, uuid_1.v4)(),
            reportedAt: new Date(),
        };
        await database_1.redis.lpush(this.ERROR_QUEUE_KEY, JSON.stringify(errorReport));
    }
    /**
     * Process queued analytics events
     */
    static async processAnalyticsQueue() {
        let processed = 0;
        let failed = 0;
        // Process in batches
        for (let i = 0; i < this.BATCH_SIZE; i++) {
            const eventData = await database_1.redis.rpop(this.ANALYTICS_QUEUE_KEY);
            if (!eventData)
                break;
            try {
                const event = JSON.parse(eventData);
                // Convert to database format
                const dbEvent = {
                    user_id: event.userId || null,
                    session_id: event.sessionId,
                    event_type: event.eventType,
                    event_category: event.eventCategory,
                    event_action: event.eventAction,
                    event_label: event.eventLabel,
                    event_value: event.eventValue,
                    page_url: event.pageUrl,
                    page_title: event.pageTitle,
                    referrer: event.referrer,
                    user_agent: event.userAgent,
                    ip_address: event.ipAddress,
                    device_type: event.deviceType,
                    browser: event.browser,
                    os: event.os,
                    screen_resolution: event.screenResolution,
                    viewport_size: event.viewportSize,
                    timestamp: new Date(event.timestamp),
                    metadata: {
                        ...event.metadata,
                        offline: event.offline,
                        queuedAt: event.queuedAt,
                        retryCount: event.retryCount,
                    },
                    created_at: new Date(),
                };
                await database_1.pgPool.query(`
          INSERT INTO analytics_events (
            user_id, session_id, event_type, event_category, event_action,
            event_label, event_value, page_url, page_title, referrer,
            user_agent, ip_address, device_type, browser, os,
            screen_resolution, viewport_size, timestamp, metadata
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19)
        `, [
                    dbEvent.user_id,
                    dbEvent.session_id,
                    dbEvent.event_type,
                    dbEvent.event_category,
                    dbEvent.event_action,
                    dbEvent.event_label,
                    dbEvent.event_value,
                    dbEvent.page_url,
                    dbEvent.page_title,
                    dbEvent.referrer,
                    dbEvent.user_agent,
                    dbEvent.ip_address,
                    dbEvent.device_type,
                    dbEvent.browser,
                    dbEvent.os,
                    dbEvent.screen_resolution,
                    dbEvent.viewport_size,
                    dbEvent.timestamp,
                    JSON.stringify(dbEvent.metadata || {})
                ]);
                processed++;
            }
            catch (error) {
                console.error('Failed to process analytics event:', error);
                // Re-queue with incremented retry count
                try {
                    const failedEvent = JSON.parse(eventData);
                    failedEvent.retryCount = (failedEvent.retryCount || 0) + 1;
                    if ((failedEvent.retryCount || 0) < this.MAX_RETRY_COUNT) {
                        await database_1.redis.lpush(this.ANALYTICS_QUEUE_KEY, JSON.stringify(failedEvent));
                    }
                    else {
                        // Log permanently failed events
                        await this.logFailedEvent('analytics', failedEvent, error);
                    }
                }
                catch (requeueError) {
                    console.error('Failed to re-queue analytics event:', requeueError);
                }
                failed++;
            }
        }
        return { processed, failed };
    }
    /**
     * Process queued error reports
     */
    static async processErrorQueue() {
        let processed = 0;
        let failed = 0;
        // Process in batches
        for (let i = 0; i < this.BATCH_SIZE; i++) {
            const errorData = await database_1.redis.rpop(this.ERROR_QUEUE_KEY);
            if (!errorData)
                break;
            try {
                const errorReport = JSON.parse(errorData);
                // Store error report (you might want to create a separate table for this)
                // For now, we'll log it as an analytics event
                const dbEvent = {
                    user_id: errorReport.userId || null,
                    session_id: `error_${errorReport.id}`,
                    event_type: 'error',
                    event_category: 'offline_errors',
                    event_action: errorReport.errorType,
                    event_label: errorReport.errorMessage,
                    event_value: null,
                    page_url: errorReport.url,
                    page_title: null,
                    referrer: null,
                    user_agent: errorReport.userAgent,
                    ip_address: null,
                    device_type: null,
                    browser: null,
                    os: null,
                    screen_resolution: null,
                    viewport_size: null,
                    timestamp: new Date(errorReport.timestamp),
                    metadata: {
                        ...errorReport.metadata,
                        stackTrace: errorReport.stackTrace,
                        deviceId: errorReport.deviceId,
                        offline: errorReport.offline,
                        reportedAt: errorReport.reportedAt,
                    },
                };
                await database_1.pgPool.query(`
          INSERT INTO analytics_events (
            user_id, session_id, event_type, event_category, event_action,
            event_label, event_value, page_url, page_title, referrer,
            user_agent, ip_address, device_type, browser, os,
            screen_resolution, viewport_size, timestamp, metadata
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19)
        `, [
                    dbEvent.user_id,
                    dbEvent.session_id,
                    dbEvent.event_type,
                    dbEvent.event_category,
                    dbEvent.event_action,
                    dbEvent.event_label,
                    dbEvent.event_value,
                    dbEvent.page_url,
                    dbEvent.page_title,
                    dbEvent.referrer,
                    dbEvent.user_agent,
                    dbEvent.ip_address,
                    dbEvent.device_type,
                    dbEvent.browser,
                    dbEvent.os,
                    dbEvent.screen_resolution,
                    dbEvent.viewport_size,
                    dbEvent.timestamp,
                    JSON.stringify(dbEvent.metadata || {})
                ]);
                processed++;
            }
            catch (error) {
                console.error('Failed to process error report:', error);
                // Re-queue with incremented retry count if possible
                try {
                    const failedError = JSON.parse(errorData);
                    // For errors, we don't retry, just log the failure
                    await this.logFailedEvent('error', failedError, error);
                }
                catch (logError) {
                    console.error('Failed to log error report failure:', logError);
                }
                failed++;
            }
        }
        return { processed, failed };
    }
    /**
     * Get offline analytics statistics
     */
    static async getOfflineAnalyticsStats() {
        const [queuedEvents, queuedErrors] = await Promise.all([
            database_1.redis.llen(this.ANALYTICS_QUEUE_KEY),
            database_1.redis.llen(this.ERROR_QUEUE_KEY),
        ]);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        // Get today's processed events
        const processedTodayResult = await database_1.pgPool.query(`
      SELECT COUNT(*) as count FROM analytics_events
      WHERE created_at >= $1 AND metadata->>'offline' = 'true'
    `, [today]);
        const processedToday = parseInt(processedTodayResult.rows[0].count);
        // Get today's failed events (this would need a separate failed events table)
        const failedToday = 0; // Placeholder
        // Get offline vs online breakdown
        const offlineCountResult = await database_1.pgPool.query(`
      SELECT COUNT(*) as count FROM analytics_events
      WHERE metadata->>'offline' = 'true'
    `);
        const offlineCount = parseInt(offlineCountResult.rows[0].count);
        const onlineCountResult = await database_1.pgPool.query(`
      SELECT COUNT(*) as count FROM analytics_events
      WHERE metadata->>'offline' = 'false'
    `);
        const onlineCount = parseInt(onlineCountResult.rows[0].count);
        return {
            queuedEvents,
            queuedErrors,
            processedToday,
            failedToday,
            offlineVsOnline: {
                offline: offlineCount,
                online: onlineCount,
            },
        };
    }
    /**
     * Track offline session metrics
     */
    static async trackOfflineSession(userId, sessionId, deviceInfo, sessionData) {
        const event = {
            userId,
            sessionId,
            eventType: 'offline_session',
            eventCategory: 'session',
            eventAction: 'complete',
            eventValue: sessionData.actionsPerformed,
            timestamp: sessionData.endTime,
            deviceType: deviceInfo.deviceType,
            browser: deviceInfo.browser,
            os: deviceInfo.os,
            userAgent: deviceInfo.userAgent,
            metadata: {
                sessionDuration: sessionData.endTime.getTime() - sessionData.startTime.getTime(),
                pagesViewed: sessionData.pagesViewed,
                dataSynced: sessionData.dataSynced,
                errorsEncountered: sessionData.errorsEncountered,
            },
            offline: true,
        };
        await this.queueAnalyticsEvent(event);
    }
    /**
     * Track sync performance metrics
     */
    static async trackSyncPerformance(userId, deviceId, syncMetrics) {
        const event = {
            userId,
            sessionId: `sync_${deviceId}_${Date.now()}`,
            eventType: 'sync_performance',
            eventCategory: 'sync',
            eventAction: syncMetrics.syncType,
            eventValue: syncMetrics.duration,
            timestamp: new Date(),
            metadata: {
                deviceId,
                itemsSynced: syncMetrics.itemsSynced,
                success: syncMetrics.success,
                errorMessage: syncMetrics.errorMessage,
                networkType: syncMetrics.networkType,
                dataTransferred: syncMetrics.dataTransferred,
                throughput: syncMetrics.dataTransferred / (syncMetrics.duration / 1000), // bytes per second
            },
            offline: false, // Sync events are typically online
        };
        await this.queueAnalyticsEvent(event);
    }
    /**
     * Track offline data conflicts
     */
    static async trackDataConflict(userId, entityType, entityId, conflictType, resolutionStrategy, resolved) {
        const event = {
            userId,
            sessionId: `conflict_${entityId}_${Date.now()}`,
            eventType: 'data_conflict',
            eventCategory: 'sync',
            eventAction: conflictType,
            timestamp: new Date(),
            metadata: {
                entityType,
                entityId,
                resolutionStrategy,
                resolved,
            },
            offline: true,
        };
        await this.queueAnalyticsEvent(event);
    }
    /**
     * Generate offline analytics report
     */
    static async generateOfflineReport(userId, dateRange) {
        const whereClause = {};
        if (userId)
            whereClause.user_id = userId;
        if (dateRange) {
            whereClause.timestamp = {
                [require('sequelize').Op.between]: [dateRange.start, dateRange.end],
            };
        }
        // Get all relevant events
        let query = `
      SELECT * FROM analytics_events
      WHERE 1=1
    `;
        const params = [];
        let paramIndex = 1;
        if (userId) {
            query += ` AND user_id = $${paramIndex}`;
            params.push(userId);
            paramIndex++;
        }
        if (dateRange) {
            query += ` AND timestamp BETWEEN $${paramIndex} AND $${paramIndex + 1}`;
            params.push(dateRange.start, dateRange.end);
            paramIndex += 2;
        }
        query += ` ORDER BY timestamp ASC`;
        const result = await database_1.pgPool.query(query, params);
        const events = result.rows;
        // Calculate summary metrics
        const totalEvents = events.length;
        const offlineEvents = events.filter(e => e.metadata && e.metadata.offline === true).length;
        const errorReports = events.filter(e => e.event_category === 'offline_errors').length;
        // Calculate average session duration
        const sessionEvents = events.filter(e => e.event_type === 'offline_session' && e.metadata?.sessionDuration);
        const avgSessionDuration = sessionEvents.length > 0
            ? sessionEvents.reduce((sum, e) => sum + (e.metadata?.sessionDuration || 0), 0) / sessionEvents.length
            : 0;
        // Calculate sync success rate
        const syncEvents = events.filter(e => e.event_category === 'sync');
        const successfulSyncs = syncEvents.filter(e => e.metadata?.success === true).length;
        const syncSuccessRate = syncEvents.length > 0
            ? (successfulSyncs / syncEvents.length) * 100
            : 0;
        // Generate breakdowns
        const byDeviceType = {};
        const byErrorType = {};
        const bySyncType = {};
        events.forEach(event => {
            if (event.device_type) {
                byDeviceType[event.device_type] = (byDeviceType[event.device_type] || 0) + 1;
            }
            if (event.event_category === 'offline_errors') {
                byErrorType[event.event_action] = (byErrorType[event.event_action] || 0) + 1;
            }
            if (event.event_category === 'sync') {
                bySyncType[event.event_action] = (bySyncType[event.event_action] || 0) + 1;
            }
        });
        // Generate trends (simplified - would need more complex aggregation in production)
        const dailyOfflineUsage = [];
        const syncPerformance = [];
        // This would require date aggregation queries in a real implementation
        return {
            summary: {
                totalEvents,
                offlineEvents,
                errorReports,
                avgSessionDuration,
                syncSuccessRate,
            },
            breakdowns: {
                byDeviceType,
                byErrorType,
                bySyncType,
            },
            trends: {
                dailyOfflineUsage,
                syncPerformance,
            },
        };
    }
    /**
     * Log permanently failed events
     */
    static async logFailedEvent(type, event, error) {
        // In production, you'd want to store failed events in a separate table
        // For now, we'll log to console
        console.error(`Permanently failed ${type} event:`, {
            event,
            error: error.message,
            timestamp: new Date(),
        });
    }
    /**
     * Clean up old queued events (failed retries)
     */
    static async cleanupOldQueuedEvents(maxAgeHours = 24) {
        // This would require implementing a cleanup mechanism for Redis
        // For now, return 0 as placeholder
        return 0;
    }
}
exports.OfflineAnalyticsService = OfflineAnalyticsService;
OfflineAnalyticsService.ANALYTICS_QUEUE_KEY = 'offline_analytics_queue';
OfflineAnalyticsService.ERROR_QUEUE_KEY = 'offline_error_queue';
OfflineAnalyticsService.BATCH_SIZE = 100;
OfflineAnalyticsService.MAX_RETRY_COUNT = 3;
exports.default = OfflineAnalyticsService;
