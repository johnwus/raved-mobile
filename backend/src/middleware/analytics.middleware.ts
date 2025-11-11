import { Request, Response, NextFunction } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { pgPool } from '../config/database';
import { logger } from './logging.middleware';

// Extend Request interface to include analytics session
declare global {
  namespace Express {
    interface Request {
      sessionId?: string;
      analyticsData?: {
        startTime: number;
        userAgent: string;
        ip: string;
        referrer?: string;
        pageUrl: string;
      };
    }
  }
}

// Generate or retrieve session ID
export function sessionTracker(req: Request, res: Response, next: NextFunction) {
  // Check for existing session in cookie or header
  let sessionId = req.cookies?.session_id || req.headers['x-session-id'] as string;

  if (!sessionId) {
    sessionId = uuidv4();
    // Set session cookie (expires in 30 days)
    res.cookie('session_id', sessionId, {
      maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax'
    });
  }

  req.sessionId = sessionId;
  req.analyticsData = {
    startTime: Date.now(),
    userAgent: req.get('User-Agent') || 'unknown',
    ip: req.ip || req.connection.remoteAddress || 'unknown',
    referrer: req.get('Referer'),
    pageUrl: req.originalUrl
  };

  next();
}

// Track page views and user interactions
export function pageViewTracker(req: Request, res: Response, next: NextFunction) {
  const startTime = Date.now();

  res.on('finish', async () => {
    try {
      const duration = Date.now() - startTime;
      const userId = req.user?.id;
      const sessionId = req.sessionId;

      if (!sessionId) return;

      // Parse user agent for device info
      const userAgent = req.get('User-Agent') || '';
      const deviceInfo = parseUserAgent(userAgent);

      await pgPool.query(`
        INSERT INTO analytics_events (
          user_id, session_id, event_type, event_category, event_action,
          page_url, page_title, referrer, user_agent, ip_address,
          device_type, browser, os, screen_resolution, viewport_size,
          event_value, timestamp, metadata
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18)
      `, [
        userId,
        sessionId,
        'page_view',
        'engagement',
        'view',
        req.originalUrl,
        req.route?.path || req.originalUrl,
        req.get('Referer'),
        userAgent,
        req.ip,
        deviceInfo.deviceType,
        deviceInfo.browser,
        deviceInfo.os,
        req.headers['x-screen-resolution'] as string,
        req.headers['x-viewport-size'] as string,
        duration,
        new Date(),
        {
          method: req.method,
          statusCode: res.statusCode,
          responseTime: duration,
          query: req.query,
          headers: {
            accept: req.get('Accept'),
            acceptLanguage: req.get('Accept-Language'),
            cacheControl: req.get('Cache-Control')
          }
        }
      ]);

      // Update user activity log if user is authenticated
      if (userId) {
        await pgPool.query(`
          INSERT INTO user_activity_logs (
            user_id, activity_type, activity_data, ip_address, user_agent, timestamp
          ) VALUES ($1, $2, $3, $4, $5, $6)
        `, [
          userId,
          'page_view',
          {
            page: req.originalUrl,
            duration,
            sessionId
          },
          req.ip,
          userAgent,
          new Date()
        ]);
      }

    } catch (error) {
      logger.error('Analytics tracking error', error);
    }
  });

  next();
}

// Track custom events
export function eventTracker(req: Request, res: Response, next: NextFunction) {
  // Add event tracking method to response
  res.trackEvent = async (
    eventType: string,
    eventCategory: string,
    eventAction: string,
    eventLabel?: string,
    eventValue?: number,
    metadata?: Record<string, any>
  ) => {
    try {
      const userId = req.user?.id;
      const sessionId = req.sessionId;

      if (!sessionId) return;

      const userAgent = req.get('User-Agent') || '';
      const deviceInfo = parseUserAgent(userAgent);

      await pgPool.query(`
        INSERT INTO analytics_events (
          user_id, session_id, event_type, event_category, event_action,
          event_label, event_value, page_url, user_agent, ip_address,
          device_type, browser, os, timestamp, metadata
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
      `, [
        userId,
        sessionId,
        eventType,
        eventCategory,
        eventAction,
        eventLabel,
        eventValue,
        req.originalUrl,
        userAgent,
        req.ip,
        deviceInfo.deviceType,
        deviceInfo.browser,
        deviceInfo.os,
        new Date(),
        metadata || {}
      ]);

    } catch (error) {
      logger.error('Event tracking error', error);
    }
  };

  next();
}

// Track user interactions (clicks, scrolls, etc.)
export function interactionTracker(req: Request, res: Response, next: NextFunction) {
  // This would typically be used with client-side tracking
  // For now, we'll track API interactions
  res.on('finish', async () => {
    try {
      const userId = req.user?.id;
      const sessionId = req.sessionId;

      if (!sessionId || !userId) return;

      // Track API interactions
      if (req.originalUrl.startsWith('/api/')) {
        await pgPool.query(`
          INSERT INTO analytics_events (
            user_id, session_id, event_type, event_category, event_action,
            page_url, timestamp, metadata
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        `, [
          userId,
          sessionId,
          'api_interaction',
          'engagement',
          req.method.toLowerCase(),
          req.originalUrl,
          new Date(),
          {
            statusCode: res.statusCode,
            contentType: res.get('Content-Type'),
            query: req.query,
            body: req.method !== 'GET' ? '[REDACTED]' : undefined
          }
        ]);
      }

    } catch (error) {
      logger.error('Interaction tracking error', error);
    }
  });

  next();
}

// Track conversions and goals
export function conversionTracker(req: Request, res: Response, next: NextFunction) {
  // This middleware can be used to track specific conversion events
  // For example, when a user completes a purchase, creates a post, etc.

  res.trackConversion = async (
    conversionType: string,
    value?: number,
    metadata?: Record<string, any>
  ) => {
    try {
      const userId = req.user?.id;
      const sessionId = req.sessionId;

      if (!sessionId || !userId) return;

      await pgPool.query(`
        INSERT INTO analytics_events (
          user_id, session_id, event_type, event_category, event_action,
          event_value, timestamp, metadata
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      `, [
        userId,
        sessionId,
        'conversion',
        'goal',
        conversionType,
        value,
        new Date(),
        metadata || {}
      ]);

      // Update metrics
      await updateMetrics(`conversion.${conversionType}`, value || 1, {
        userId,
        sessionId,
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      logger.error('Conversion tracking error', error);
    }
  };

  next();
}

// Helper function to parse user agent
function parseUserAgent(userAgent: string) {
  const ua = userAgent.toLowerCase();

  // Device type detection
  let deviceType = 'desktop';
  if (ua.includes('mobile') || ua.includes('android') || ua.includes('iphone')) {
    deviceType = 'mobile';
  } else if (ua.includes('tablet') || ua.includes('ipad')) {
    deviceType = 'tablet';
  }

  // Browser detection
  let browser = 'unknown';
  if (ua.includes('chrome') && !ua.includes('edg')) {
    browser = 'chrome';
  } else if (ua.includes('firefox')) {
    browser = 'firefox';
  } else if (ua.includes('safari') && !ua.includes('chrome')) {
    browser = 'safari';
  } else if (ua.includes('edg')) {
    browser = 'edge';
  } else if (ua.includes('opera')) {
    browser = 'opera';
  }

  // OS detection
  let os = 'unknown';
  if (ua.includes('windows')) {
    os = 'windows';
  } else if (ua.includes('macintosh') || ua.includes('mac os x')) {
    os = 'macos';
  } else if (ua.includes('linux')) {
    os = 'linux';
  } else if (ua.includes('android')) {
    os = 'android';
  } else if (ua.includes('ios') || ua.includes('iphone') || ua.includes('ipad')) {
    os = 'ios';
  }

  return { deviceType, browser, os };
}

// Update analytics metrics
async function updateMetrics(
  metricName: string,
  value: number,
  tags: Record<string, any>
) {
  try {
    await pgPool.query(`
      INSERT INTO analytics_metrics (
        metric_name, metric_value, metric_type, tags, timestamp
      ) VALUES ($1, $2, $3, $4, $5)
    `, [
      metricName,
      value,
      'counter',
      tags,
      new Date()
    ]);
  } catch (error) {
    logger.error('Metrics update error', error);
  }
}

// Extend Response interface
declare global {
  namespace Express {
    interface Response {
      trackEvent: (
        eventType: string,
        eventCategory: string,
        eventAction: string,
        eventLabel?: string,
        eventValue?: number,
        metadata?: Record<string, any>
      ) => Promise<void>;
      trackConversion: (
        conversionType: string,
        value?: number,
        metadata?: Record<string, any>
      ) => Promise<void>;
    }
  }
}