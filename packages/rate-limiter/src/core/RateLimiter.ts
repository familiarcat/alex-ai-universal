/**
 * RateLimiter - Core Rate Limiting Engine
 * 
 * Unified rate limiting system that prevents 429 errors across all Alex AI systems
 * 
 * Features:
 * - Exponential backoff on 429 errors
 * - Adaptive timing based on response times
 * - Configurable delays and retry logic
 * - Rate limit header monitoring
 * 
 * @author Commander Data (Architecture & algorithms)
 * @author Chief O'Brien (Pragmatic implementation)
 * @author Lieutenant Worf (Security considerations)
 */

export interface RateLimiterConfig {
  // Base delays (milliseconds)
  minDelayBetweenRequests?: number;
  operationDelay?: number;
  batchDelay?: number;
  
  // Retry configuration
  maxRetries?: number;
  initialRetryDelay?: number;
  maxRetryDelay?: number;
  backoffMultiplier?: number;
  
  // Monitoring
  logRateLimitHeaders?: boolean;
  adaptiveTiming?: boolean;
  
  // Callbacks
  onRetry?: (attempt: number, waitTime: number, error: any) => void;
  onSuccess?: (response: any, duration: number) => void;
  onRateLimited?: (response: any) => void;
}

export interface RateLimitedRequestOptions {
  operation?: string;
  minDelay?: number;
  maxRetries?: number;
  retryDelay?: number;
}

export const DEFAULT_CONFIG: Required<RateLimiterConfig> = {
  minDelayBetweenRequests: 2000,    // 2s minimum
  operationDelay: 3000,              // 3s for operations
  batchDelay: 5000,                  // 5s between batches
  maxRetries: 5,
  initialRetryDelay: 5000,           // 5s initial retry
  maxRetryDelay: 60000,              // 60s max retry
  backoffMultiplier: 2,
  logRateLimitHeaders: true,
  adaptiveTiming: true,
  onRetry: () => {},
  onSuccess: () => {},
  onRateLimited: () => {},
};

export class RateLimiter {
  private config: Required<RateLimiterConfig>;

  constructor(config: RateLimiterConfig = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  /**
   * Sleep utility
   */
  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Execute a request with rate limiting and retry logic
   */
  async execute<T>(
    requestFn: () => Promise<T>,
    options: RateLimitedRequestOptions = {}
  ): Promise<T> {
    const {
      operation = 'API call',
      minDelay = this.config.minDelayBetweenRequests,
      maxRetries = this.config.maxRetries,
      retryDelay = this.config.initialRetryDelay,
    } = options;

    let lastError: any = null;
    let currentRetryDelay = retryDelay;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        const startTime = Date.now();
        const response = await requestFn();
        const duration = Date.now() - startTime;

        // Log rate limit headers if present and enabled
        if (this.config.logRateLimitHeaders && this.hasRateLimitHeaders(response)) {
          this.logRateLimitInfo(response);
        }

        // Adaptive timing: increase delay if request was slow
        let adaptiveDelay = minDelay;
        if (this.config.adaptiveTiming && duration > 1000) {
          adaptiveDelay = Math.min(minDelay * 1.5, 5000);
          console.log(`   ⏱️  Slow response (${duration}ms), increasing delay to ${adaptiveDelay}ms`);
        }

        // Success callback
        this.config.onSuccess(response, duration);

        // Enforce minimum delay before next request
        await this.sleep(adaptiveDelay);

        return response;

      } catch (error: any) {
        lastError = error;
        const status = error.response?.status;
        const errorMsg = error.response?.data?.message || error.message;

        // Handle 429 (Too Many Requests)
        if (status === 429) {
          this.config.onRateLimited(error.response);

          if (attempt < maxRetries) {
            // Check for Retry-After header
            const retryAfter = error.response?.headers?.['retry-after'];
            const waitTime = retryAfter 
              ? parseInt(retryAfter) * 1000 
              : Math.min(currentRetryDelay, this.config.maxRetryDelay);

            console.log(`   ⚠️  Rate limited (429) on ${operation}`);
            console.log(`   ⏳ Waiting ${waitTime/1000}s before retry ${attempt}/${maxRetries}...`);

            this.config.onRetry(attempt, waitTime, error);

            await this.sleep(waitTime);
            currentRetryDelay *= this.config.backoffMultiplier;
            continue;
          }
        }

        // Handle other errors
        if (status && status !== 429) {
          console.log(`   ❌ ${operation} failed with HTTP ${status}: ${errorMsg}`);
        }

        // If exhausted retries or non-retryable error, throw
        if (attempt >= maxRetries || (status && status !== 429)) {
          throw error;
        }

        // Generic retry for other errors
        await this.sleep(currentRetryDelay);
        currentRetryDelay *= this.config.backoffMultiplier;
      }
    }

    throw lastError;
  }

  /**
   * Process items in batches with rate limiting
   */
  async processBatches<T, R>(
    items: T[],
    processFn: (batch: T[], batchNum: number) => Promise<R>,
    batchSize: number = 5
  ): Promise<R[]> {
    const batches: T[][] = [];
    for (let i = 0; i < items.length; i += batchSize) {
      batches.push(items.slice(i, i + batchSize));
    }

    console.log(`   📦 Processing ${items.length} items in ${batches.length} batches of ${batchSize}`);

    const results: R[] = [];
    for (let i = 0; i < batches.length; i++) {
      const batchNum = i + 1;
      console.log(`\n   🔄 Processing batch ${batchNum}/${batches.length}...`);

      const result = await processFn(batches[i], batchNum);
      results.push(result);

      // Delay between batches (except after last batch)
      if (i < batches.length - 1) {
        console.log(`   ⏳ Waiting ${this.config.batchDelay/1000}s before next batch...`);
        await this.sleep(this.config.batchDelay);
      }
    }

    return results;
  }

  /**
   * Check if response has rate limit headers
   */
  private hasRateLimitHeaders(response: any): boolean {
    return !!(response?.headers?.['x-ratelimit-limit'] || 
              response?.headers?.['ratelimit-limit']);
  }

  /**
   * Log rate limit information
   */
  private logRateLimitInfo(response: any): void {
    const headers = response.headers || {};
    const limit = headers['x-ratelimit-limit'] || headers['ratelimit-limit'];
    const remaining = headers['x-ratelimit-remaining'] || headers['ratelimit-remaining'];
    const reset = headers['x-ratelimit-reset'] || headers['ratelimit-reset'];

    if (limit) {
      console.log(`   📊 Rate Limit: ${remaining}/${limit} remaining (resets: ${reset})`);
    }
  }

  /**
   * Update configuration
   */
  updateConfig(config: Partial<RateLimiterConfig>): void {
    this.config = { ...this.config, ...config };
  }

  /**
   * Get current configuration
   */
  getConfig(): Readonly<Required<RateLimiterConfig>> {
    return { ...this.config };
  }
}

