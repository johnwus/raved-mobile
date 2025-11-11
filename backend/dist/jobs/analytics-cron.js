"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AnalyticsCronJobs = void 0;
const analytics_service_1 = require("../services/analytics.service");
const logging_middleware_1 = require("../middleware/logging.middleware");
class AnalyticsCronJobs {
    // Run daily analytics aggregation
    static async aggregateDailyMetrics() {
        try {
            logging_middleware_1.logger.info('Starting daily analytics aggregation');
            await analytics_service_1.analyticsService.aggregateDailyMetrics();
            // Clean up old data (older than 90 days)
            await analytics_service_1.analyticsService.cleanupOldData();
            logging_middleware_1.logger.info('Daily analytics aggregation completed');
        }
        catch (error) {
            logging_middleware_1.logger.error('Failed to aggregate daily metrics', error);
        }
    }
    // Generate weekly reports
    static async generateWeeklyReports() {
        try {
            logging_middleware_1.logger.info('Starting weekly report generation');
            const endDate = new Date();
            const startDate = new Date();
            startDate.setDate(endDate.getDate() - 7);
            await analytics_service_1.analyticsService.generateReport('weekly', startDate, endDate);
            logging_middleware_1.logger.info('Weekly report generation completed');
        }
        catch (error) {
            logging_middleware_1.logger.error('Failed to generate weekly reports', error);
        }
    }
    // Generate monthly reports
    static async generateMonthlyReports() {
        try {
            logging_middleware_1.logger.info('Starting monthly report generation');
            const endDate = new Date();
            const startDate = new Date();
            startDate.setMonth(endDate.getMonth() - 1);
            await analytics_service_1.analyticsService.generateReport('monthly', startDate, endDate);
            logging_middleware_1.logger.info('Monthly report generation completed');
        }
        catch (error) {
            logging_middleware_1.logger.error('Failed to generate monthly reports', error);
        }
    }
    // Update real-time metrics cache
    static async updateRealtimeCache() {
        try {
            // Pre-warm cache for common time ranges
            const timeRanges = [60, 1440, 10080]; // 1 hour, 1 day, 1 week
            for (const timeRange of timeRanges) {
                await analytics_service_1.analyticsService.getRealtimeMetrics(timeRange);
            }
            logging_middleware_1.logger.info('Real-time cache updated');
        }
        catch (error) {
            logging_middleware_1.logger.error('Failed to update real-time cache', error);
        }
    }
    // Clean up old analytics data
    static async cleanupOldAnalyticsData() {
        try {
            logging_middleware_1.logger.info('Starting analytics data cleanup');
            await analytics_service_1.analyticsService.cleanupOldData();
            logging_middleware_1.logger.info('Analytics data cleanup completed');
        }
        catch (error) {
            logging_middleware_1.logger.error('Failed to cleanup analytics data', error);
        }
    }
}
exports.AnalyticsCronJobs = AnalyticsCronJobs;
