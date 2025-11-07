/**
 * Next.js Adapter - Rate Limiting for Next.js API Routes
 * 
 * Provides middleware for protecting API routes with rate limiting
 * 
 * @author Counselor Troi (User-friendly error messages)
 * @author Dr. Crusher (System health monitoring)
 * @author Lieutenant Worf (Security enforcement)
 */

export interface RateLimitRecord {
  count: number;
  resetAt: number;
  requests: number[];
}

export interface NextJsRateLimiterConfig {
  maxRequests?: number;
  windowMs?: number;
  message?: string;
  statusCode?: number;
  headers?: boolean;
  keyGenerator?: (identifier: string, endpoint: string) => string;
  identifierExtractor?: (request: any) => string;
}

export class NextJsAdapter {
  private store = new Map<string, RateLimitRecord>();
  private config: Required<NextJsRateLimiterConfig>;

  constructor(config: NextJsRateLimiterConfig = {}) {
    const defaults: Required<NextJsRateLimiterConfig> = {
      maxRequests: 100,
      windowMs: 60000,
      message: 'Too many requests, please try again later.',
      statusCode: 429,
      headers: true,
      keyGenerator: (identifier, endpoint) => `${identifier}:${endpoint}`,
      identifierExtractor: (request) => {
        return request.ip || request.headers?.get?.('x-forwarded-for') || 'unknown';
      },
    };

    this.config = { ...defaults, ...config };
  }

  /**
   * Check if request should be rate limited
   * Returns null if allowed, error response if limited
   */
  checkLimit(request: any, endpoint: string): { allowed: boolean; response?: any } {
    const identifier = this.config.identifierExtractor(request);
    const key = this.config.keyGenerator(identifier, endpoint);
    const now = Date.now();

    let record = this.store.get(key);

    // Clean up old records
    if (record && now > record.resetAt) {
      this.store.delete(key);
      record = undefined;
    }

    // Initialize or update record
    if (!record) {
      record = {
        count: 1,
        resetAt: now + this.config.windowMs,
        requests: [now],
      };
      this.store.set(key, record);
      return { allowed: true };
    }

    // Remove requests outside the window
    record.requests = record.requests.filter((time) => time > now - this.config.windowMs);
    record.count = record.requests.length + 1;
    record.requests.push(now);

    // Check if rate limit exceeded
    if (record.count > this.config.maxRequests) {
      const resetIn = Math.ceil((record.resetAt - now) / 1000);

      const response = {
        error: 'Too Many Requests',
        message: this.config.message,
        code: 'RATE_LIMIT_EXCEEDED',
        retryAfter: resetIn,
      };

      const headers = this.config.headers ? {
        'X-RateLimit-Limit': String(this.config.maxRequests),
        'X-RateLimit-Remaining': '0',
        'X-RateLimit-Reset': String(record.resetAt),
        'Retry-After': String(resetIn),
      } : undefined;

      return {
        allowed: false,
        response: {
          body: response,
          status: this.config.statusCode,
          headers,
        },
      };
    }

    return { allowed: true };
  }

  /**
   * Get remaining requests for a key
   */
  getRemaining(request: any, endpoint: string): number {
    const identifier = this.config.identifierExtractor(request);
    const key = this.config.keyGenerator(identifier, endpoint);
    const record = this.store.get(key);

    if (!record) {
      return this.config.maxRequests;
    }

    return Math.max(0, this.config.maxRequests - record.count);
  }

  /**
   * Clear rate limit for a key
   */
  clearLimit(identifier: string, endpoint: string): void {
    const key = this.config.keyGenerator(identifier, endpoint);
    this.store.delete(key);
  }

  /**
   * Clear all rate limits
   */
  clearAll(): void {
    this.store.clear();
  }

  /**
   * Get statistics
   */
  getStats() {
    return {
      totalKeys: this.store.size,
      config: {
        maxRequests: this.config.maxRequests,
        windowMs: this.config.windowMs,
      },
    };
  }
}

/**
 * Convenience function to create Next.js rate limiter
 */
export function createNextJsRateLimiter(config?: NextJsRateLimiterConfig): NextJsAdapter {
  return new NextJsAdapter(config);
}

