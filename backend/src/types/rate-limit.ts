export interface RateLimitTier {
  name: string;
  windowMs: number; // Time window in milliseconds
  maxRequests: number; // Maximum requests per window
  blockDuration?: number; // Block duration after exceeding limit (optional)
}

export interface RateLimitConfig {
  tier: string;
  windowMs: number;
  maxRequests: number;
  blockDuration?: number;
  bypass?: boolean; // Allow bypass for critical operations
}

export interface RateLimitOverride {
  userId: string;
  tier: string;
  customLimits?: {
    windowMs?: number;
    maxRequests?: number;
    blockDuration?: number;
  };
  expiresAt?: Date;
}

export interface RateLimitHeaders {
  'X-RateLimit-Limit': string;
  'X-RateLimit-Remaining': string;
  'X-RateLimit-Reset': string;
  'X-RateLimit-Retry-After'?: string;
}

export interface RateLimitAnalytics {
  id: string;
  userId?: string;
  ip: string;
  endpoint: string;
  method: string;
  tier: string;
  requestsCount: number;
  blocked: boolean;
  timestamp: Date;
}

export interface EndpointRateLimit {
  path: string;
  methods: string[];
  config: RateLimitConfig;
}

// Default rate limit tiers
export const DEFAULT_RATE_LIMIT_TIERS: Record<string, RateLimitTier> = {
  free: {
    name: 'free',
    windowMs: 15 * 60 * 1000, // 15 minutes
    maxRequests: 100,
    blockDuration: 15 * 60 * 1000, // 15 minutes
  },
  premium: {
    name: 'premium',
    windowMs: 15 * 60 * 1000, // 15 minutes
    maxRequests: 500,
    blockDuration: 5 * 60 * 1000, // 5 minutes
  },
  admin: {
    name: 'admin',
    windowMs: 15 * 60 * 1000, // 15 minutes
    maxRequests: 2000,
    blockDuration: 60 * 1000, // 1 minute
  },
};

// Default endpoint-specific limits
export const DEFAULT_ENDPOINT_LIMITS: Record<string, RateLimitConfig> = {
  auth: {
    tier: 'free',
    windowMs: 15 * 60 * 1000, // 15 minutes
    maxRequests: 5,
    blockDuration: 15 * 60 * 1000,
  },
  upload: {
    tier: 'free',
    windowMs: 60 * 60 * 1000, // 1 hour
    maxRequests: 20,
    blockDuration: 60 * 60 * 1000,
  },
  search: {
    tier: 'free',
    windowMs: 60 * 1000, // 1 minute
    maxRequests: 30,
    blockDuration: 60 * 1000,
  },
  posts: {
    tier: 'free',
    windowMs: 60 * 60 * 1000, // 1 hour
    maxRequests: 10,
    blockDuration: 60 * 60 * 1000,
  },
  comments: {
    tier: 'free',
    windowMs: 60 * 60 * 1000, // 1 hour
    maxRequests: 50,
    blockDuration: 60 * 60 * 1000,
  },
  interactions: {
    tier: 'free',
    windowMs: 60 * 60 * 1000, // 1 hour
    maxRequests: 100,
    blockDuration: 60 * 60 * 1000,
  },
};