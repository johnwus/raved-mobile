export interface RateLimitConfig {
  id: string;
  tier: string;
  windowMs: number;
  maxRequests: number;
  blockDuration?: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface RateLimitOverride {
  id: string;
  userId: string;
  tier: string;
  customWindowMs?: number;
  customMaxRequests?: number;
  customBlockDuration?: number;
  expiresAt?: Date;
  createdAt: Date;
  updatedAt: Date;
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