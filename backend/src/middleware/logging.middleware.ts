import { Request, Response, NextFunction } from 'express';
import { createWriteStream } from 'fs';
import { join } from 'path';
import { CONFIG } from '../config';

// Create logs directory if it doesn't exist
import { mkdirSync } from 'fs';
try {
  mkdirSync('logs', { recursive: true });
} catch (error) {
  // Directory already exists
}

// Create log stream
const logStream = createWriteStream(join(CONFIG.LOG_FILE), { flags: 'a' });

interface LogEntry {
  timestamp: string;
  level: 'info' | 'warn' | 'error';
  method: string;
  url: string;
  statusCode?: number;
  responseTime?: number;
  userId?: string;
  ip: string;
  userAgent: string;
  message?: string;
  error?: any;
}

class Logger {
  private log(entry: LogEntry) {
    const logLine = JSON.stringify(entry) + '\n';

    // Console logging
    if (CONFIG.LOG_LEVEL === 'info' ||
        (CONFIG.LOG_LEVEL === 'warn' && entry.level !== 'info') ||
        (CONFIG.LOG_LEVEL === 'error' && entry.level === 'error')) {
      console.log(`[${entry.timestamp}] ${entry.level.toUpperCase()}: ${entry.method} ${entry.url} ${entry.statusCode || ''} ${entry.responseTime ? `(${entry.responseTime}ms)` : ''}`);
    }

    // File logging
    logStream.write(logLine);
  }

  info(message: string, data?: any) {
    this.log({
      timestamp: new Date().toISOString(),
      level: 'info',
      ...data
    } as LogEntry);
  }

  warn(message: string, data?: any) {
    this.log({
      timestamp: new Date().toISOString(),
      level: 'warn',
      ...data
    } as LogEntry);
  }

  error(message: string, error?: any, data?: any) {
    this.log({
      timestamp: new Date().toISOString(),
      level: 'error',
      message,
      error: error?.message || error,
      ...data
    } as LogEntry);
  }
}

export const logger = new Logger();

// Request logging middleware
export function requestLogger(req: Request, res: Response, next: NextFunction) {
  const startTime = Date.now();
  const userId = req.user?.id;
  const ip = req.ip || req.connection.remoteAddress || 'unknown';
  const userAgent = req.get('User-Agent') || 'unknown';

  // Log request
  logger.info('Request received', {
    method: req.method,
    url: req.originalUrl,
    userId,
    ip,
    userAgent
  });

  // Log response when request finishes
  res.on('finish', () => {
    const duration = Date.now() - startTime;

    logger.info('Request completed', {
      method: req.method,
      url: req.originalUrl,
      statusCode: res.statusCode,
      responseTime: duration,
      userId,
      ip,
      userAgent
    });
  });

  next();
}

// Error logging middleware
export function errorLogger(error: any, req: Request, res: Response, next: NextFunction) {
  const userId = req.user?.id;
  const ip = req.ip || req.connection.remoteAddress || 'unknown';

  logger.error('Request error', error, {
    method: req.method,
    url: req.originalUrl,
    userId,
    ip,
    statusCode: res.statusCode
  });

  next(error);
}

// Performance monitoring middleware
export function performanceMonitor(req: Request, res: Response, next: NextFunction) {
  const startTime = process.hrtime.bigint();
  const startMemory = process.memoryUsage();

  res.on('finish', () => {
    const endTime = process.hrtime.bigint();
    const endMemory = process.memoryUsage();

    const duration = Number(endTime - startTime) / 1000000; // Convert to milliseconds
    const memoryDelta = {
      rss: endMemory.rss - startMemory.rss,
      heapUsed: endMemory.heapUsed - startMemory.heapUsed,
      heapTotal: endMemory.heapTotal - startMemory.heapTotal
    };

    // Log slow requests (>500ms)
    if (duration > 500) {
      logger.warn('Slow request detected', {
        method: req.method,
        url: req.originalUrl,
        duration: Math.round(duration),
        memoryDelta,
        userId: req.user?.id
      });
    }

    // Log high memory usage requests
    if (memoryDelta.heapUsed > 10 * 1024 * 1024) { // 10MB
      logger.warn('High memory usage request', {
        method: req.method,
        url: req.originalUrl,
        duration: Math.round(duration),
        memoryDelta,
        userId: req.user?.id
      });
    }
  });

  next();
}

// Security event logging
export function securityLogger(req: Request, res: Response, next: NextFunction) {
  // Log suspicious activities
  const suspiciousPatterns = [
    /\bUNION\b|\bSELECT\b|\bDROP\b|\bDELETE\b/i,
    /<script/i,
    /\.\./, // Directory traversal
    /etc\/passwd/i
  ];

  const checkForSuspicious = (value: any): boolean => {
    if (typeof value === 'string') {
      return suspiciousPatterns.some(pattern => pattern.test(value));
    }
    if (typeof value === 'object' && value !== null) {
      return Object.values(value).some(checkForSuspicious);
    }
    return false;
  };

  if (checkForSuspicious(req.query) || checkForSuspicious(req.body)) {
    logger.warn('Suspicious request detected', {
      method: req.method,
      url: req.originalUrl,
      query: req.query,
      body: req.body,
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      userId: req.user?.id
    });
  }

  next();
}

// API usage analytics
export function apiAnalytics(req: Request, res: Response, next: NextFunction) {
  res.on('finish', () => {
    // Log API usage for analytics
    logger.info('API usage', {
      method: req.method,
      url: req.originalUrl,
      statusCode: res.statusCode,
      userId: req.user?.id,
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      timestamp: new Date().toISOString()
    });
  });

  next();
}

// Health check endpoint logger
export function healthLogger(req: Request, res: Response, next: NextFunction) {
  if (req.path === '/health') {
    logger.info('Health check', {
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      timestamp: new Date().toISOString()
    });
  }
  next();
}