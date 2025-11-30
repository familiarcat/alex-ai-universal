/**
 * N8N RATE LIMITER - LEGACY WRAPPER
 * 
 * This file now wraps @alex-ai/rate-limiter for backward compatibility
 * All new code should import directly from @alex-ai/rate-limiter
 * 
 * @deprecated Use @alex-ai/rate-limiter package directly
 * @author Lieutenant Worf (Migration strategy)
 * @author Lt. Cmdr. Geordi (Backward compatibility)
 */

// Import from unified package
const { createN8nRateLimiter, DEFAULT_CONFIG } = require('../../packages/rate-limiter/dist/index');

// Create default rate limiter instance
const defaultRateLimiter = createN8nRateLimiter();

/**
 * Rate Limiting Configuration (for backward compatibility)
 * @deprecated Import DEFAULT_CONFIG from @alex-ai/rate-limiter instead
 */
const RATE_LIMIT_CONFIG = {
  MIN_DELAY_BETWEEN_REQUESTS: DEFAULT_CONFIG.minDelayBetweenRequests,
  WORKFLOW_OPERATION_DELAY: DEFAULT_CONFIG.operationDelay,
  BATCH_DELAY: DEFAULT_CONFIG.batchDelay,
  CONTAINER_RESTART_WAIT: 10000,
  WEBHOOK_REGISTRATION_WAIT: 8000,
  MAX_RETRIES: DEFAULT_CONFIG.maxRetries,
  INITIAL_RETRY_DELAY: DEFAULT_CONFIG.initialRetryDelay,
  MAX_RETRY_DELAY: DEFAULT_CONFIG.maxRetryDelay,
  BACKOFF_MULTIPLIER: DEFAULT_CONFIG.backoffMultiplier,
  BATCH_SIZE: 5,
  MAX_CONCURRENT_REQUESTS: 3,
  LOG_RATE_LIMIT_HEADERS: DEFAULT_CONFIG.logRateLimitHeaders,
  ADAPTIVE_TIMING: DEFAULT_CONFIG.adaptiveTiming,
};

/**
 * Sleep helper (for backward compatibility)
 * @deprecated Use await rateLimiter.sleep() or built-in delays
 */
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Enhanced API call with intelligent rate limiting and retry logic
 * @deprecated Use defaultRateLimiter.apiCall() instead
 */
async function rateLimitedRequest(requestFn, options = {}) {
  const { operation = 'API call', onRetry, onSuccess } = options;
  
  // Configure callbacks if provided
  if (onRetry || onSuccess) {
    const config = {};
    if (onRetry) config.onRetry = onRetry;
    if (onSuccess) config.onSuccess = onSuccess;
    
    const customRateLimiter = createN8nRateLimiter(config);
    return customRateLimiter.apiCall(requestFn, operation);
  }
  
  // Use default rate limiter
  return defaultRateLimiter.apiCall(requestFn, operation);
}

/**
 * Process items in batches with rate limiting
 * @deprecated Use defaultRateLimiter.processBatches() instead
 */
async function processBatches(items, processFn, options = {}) {
  const { batchSize = RATE_LIMIT_CONFIG.BATCH_SIZE } = options;
  return defaultRateLimiter.processBatches(items, processFn, batchSize);
}

/**
 * Semaphore for limiting concurrent operations
 * @deprecated Import Semaphore from @alex-ai/rate-limiter instead
 */
const { Semaphore } = require('../../packages/rate-limiter/dist/index');

/**
 * Get recommended delay for specific operation type
 * @deprecated Configuration is now handled internally by the rate limiter
 */
function getDelayForOperation(operationType) {
  const delays = {
    'fetch': RATE_LIMIT_CONFIG.MIN_DELAY_BETWEEN_REQUESTS,
    'activate': RATE_LIMIT_CONFIG.WORKFLOW_OPERATION_DELAY,
    'deactivate': RATE_LIMIT_CONFIG.WORKFLOW_OPERATION_DELAY,
    'test': RATE_LIMIT_CONFIG.MIN_DELAY_BETWEEN_REQUESTS,
    'batch': RATE_LIMIT_CONFIG.BATCH_DELAY,
  };

  return delays[operationType] || RATE_LIMIT_CONFIG.MIN_DELAY_BETWEEN_REQUESTS;
}

// Export for backward compatibility
module.exports = {
  RATE_LIMIT_CONFIG,
  rateLimitedRequest,
  processBatches,
  Semaphore,
  getDelayForOperation,
  sleep,
  // New unified API
  createN8nRateLimiter,
  defaultRateLimiter,
};

