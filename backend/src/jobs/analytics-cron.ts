import { analyticsService } from '../services/analytics.service';
import { logger } from '../middleware/logging.middleware';

export class AnalyticsCronJobs {
  // Run daily analytics aggregation
  static async aggregateDailyMetrics() {
    try {
      logger.info('Starting daily analytics aggregation');

      await analyticsService.aggregateDailyMetrics();

      // Clean up old data (older than 90 days)
      await analyticsService.cleanupOldData();

      logger.info('Daily analytics aggregation completed');
    } catch (error) {
      logger.error('Failed to aggregate daily metrics', error);
    }
  }

  // Generate weekly reports
  static async generateWeeklyReports() {
    try {
      logger.info('Starting weekly report generation');

      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(endDate.getDate() - 7);

      await analyticsService.generateReport('weekly', startDate, endDate);

      logger.info('Weekly report generation completed');
    } catch (error) {
      logger.error('Failed to generate weekly reports', error);
    }
  }

  // Generate monthly reports
  static async generateMonthlyReports() {
    try {
      logger.info('Starting monthly report generation');

      const endDate = new Date();
      const startDate = new Date();
      startDate.setMonth(endDate.getMonth() - 1);

      await analyticsService.generateReport('monthly', startDate, endDate);

      logger.info('Monthly report generation completed');
    } catch (error) {
      logger.error('Failed to generate monthly reports', error);
    }
  }

  // Update real-time metrics cache
  static async updateRealtimeCache() {
    try {
      // Pre-warm cache for common time ranges
      const timeRanges = [60, 1440, 10080]; // 1 hour, 1 day, 1 week

      for (const timeRange of timeRanges) {
        await analyticsService.getRealtimeMetrics(timeRange);
      }

      logger.info('Real-time cache updated');
    } catch (error) {
      logger.error('Failed to update real-time cache', error);
    }
  }

  // Clean up old analytics data
  static async cleanupOldAnalyticsData() {
    try {
      logger.info('Starting analytics data cleanup');

      await analyticsService.cleanupOldData();

      logger.info('Analytics data cleanup completed');
    } catch (error) {
      logger.error('Failed to cleanup analytics data', error);
    }
  }
}