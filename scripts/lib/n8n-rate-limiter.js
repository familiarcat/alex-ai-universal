/**
 * N8N RATE LIMITER - CENTRALIZED CONFIGURATION
 * 
 * Purpose: Enforce intelligent rate limiting across all n8n automation scripts
 * Based on: n8n documentation research (November 2025)
 * 
 * Philosophy: "Automation should be patient, not aggressive" - Commander Data
 */

const axios = require('axios');

/**
 * Rate Limiting Configuration
 * Based on empirical testing and n8n best practices
 */
const RATE_LIMIT_CONFIG = {
  // Base delays (in milliseconds)
  MIN_DELAY_BETWEEN_REQUESTS: 2000,    // 2s minimum between ANY requests
  WORKFLOW_OPERATION_DELAY: 3000,       // 3s between workflow operations (activate/deactivate)
  BATCH_DELAY: 5000,                    // 5s between batches
  CONTAINER_RESTART_WAIT: 10000,        // 10s after container restart
  WEBHOOK_REGISTRATION_WAIT: 8000,      // 8s for webhooks to register after activation
  
  // Retry configuration
  MAX_RETRIES: 5,                       // Maximum retry attempts on 429
  INITIAL_RETRY_DELAY: 5000,            // 5s initial retry delay
  MAX_RETRY_DELAY: 60000,               // 60s maximum retry delay
  BACKOFF_MULTIPLIER: 2,                // Exponential backoff multiplier
  
  // Batch configuration
  BATCH_SIZE: 5,                        // Process 5 workflows per batch
  MAX_CONCURRENT_REQUESTS: 3,           // Never exceed 3 concurrent requests
  
  // Monitoring
  LOG_RATE_LIMIT_HEADERS: true,         // Log X-RateLimit-* headers
  ADAPTIVE_TIMING: true,                // Adjust delays based on response times
};

/**
 * Sleep helper
 */
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Enhanced API call with intelligent rate limiting and retry logic
 * 
 * Features:
 * - Exponential backoff on 429 errors
 * - Monitors response time and adjusts delays
 * - Logs rate limit headers if available
 * - Respects configured delays and retry limits
 */
async function rateLimitedRequest(requestFn, options = {}) {
  const {
    operation = 'API call',
    minDelay = RATE_LIMIT_CONFIG.MIN_DELAY_BETWEEN_REQUESTS,
    maxRetries = RATE_LIMIT_CONFIG.MAX_RETRIES,
    retryDelay = RATE_LIMIT_CONFIG.INITIAL_RETRY_DELAY,
    onRetry = null,
    onSuccess = null,
  } = options;

  let lastError = null;
  let currentRetryDelay = retryDelay;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const startTime = Date.now();
      const response = await requestFn();
      const duration = Date.now() - startTime;

      // Log rate limit headers if present
      if (RATE_LIMIT_CONFIG.LOG_RATE_LIMIT_HEADERS && response.headers) {
        const rateLimitInfo = {
          limit: response.headers['x-ratelimit-limit'],
          remaining: response.headers['x-ratelimit-remaining'],
          reset: response.headers['x-ratelimit-reset'],
          retryAfter: response.headers['retry-after'],
        };

        if (rateLimitInfo.limit) {
          console.log(`   📊 Rate Limit: ${rateLimitInfo.remaining}/${rateLimitInfo.limit} remaining`);
        }
      }

      // Adaptive timing: if request took long, increase delay
      let adaptiveDelay = minDelay;
      if (RATE_LIMIT_CONFIG.ADAPTIVE_TIMING && duration > 1000) {
        adaptiveDelay = Math.min(minDelay * 1.5, 5000);
        console.log(`   ⏱️  Slow response (${duration}ms), increasing delay to ${adaptiveDelay}ms`);
      }

      // Success callback
      if (onSuccess) {
        onSuccess(response, duration);
      }

      // Enforce minimum delay before next request
      await sleep(adaptiveDelay);

      return response;

    } catch (error) {
      lastError = error;
      const status = error.response?.status;
      const errorMsg = error.response?.data?.message || error.message;

      // Handle 429 (Too Many Requests) with exponential backoff
      if (status === 429) {
        if (attempt < maxRetries) {
          // Check for Retry-After header
          const retryAfter = error.response?.headers?.['retry-after'];
          const waitTime = retryAfter 
            ? parseInt(retryAfter) * 1000 
            : Math.min(currentRetryDelay, RATE_LIMIT_CONFIG.MAX_RETRY_DELAY);

          console.log(`   ⚠️  Rate limited (429) on ${operation}`);
          console.log(`   ⏳ Waiting ${waitTime/1000}s before retry ${attempt}/${maxRetries}...`);

          if (onRetry) {
            onRetry(attempt, waitTime);
          }

          await sleep(waitTime);
          currentRetryDelay *= RATE_LIMIT_CONFIG.BACKOFF_MULTIPLIER;
          continue;
        }
      }

      // Handle other errors
      if (status && status !== 429) {
        console.log(`   ❌ ${operation} failed with HTTP ${status}: ${errorMsg}`);
      }

      // If we've exhausted retries or it's not a retryable error, throw
      if (attempt >= maxRetries || (status && status !== 429)) {
        throw error;
      }

      // Generic retry for other errors
      await sleep(currentRetryDelay);
      currentRetryDelay *= RATE_LIMIT_CONFIG.BACKOFF_MULTIPLIER;
    }
  }

  throw lastError;
}

/**
 * Process items in batches with rate limiting
 * 
 * Example:
 *   await processBatches(workflows, async (batch, batchNum) => {
 *     // Process batch
 *   });
 */
async function processBatches(items, processFn, options = {}) {
  const {
    batchSize = RATE_LIMIT_CONFIG.BATCH_SIZE,
    batchDelay = RATE_LIMIT_CONFIG.BATCH_DELAY,
    operationName = 'batch',
  } = options;

  const batches = [];
  for (let i = 0; i < items.length; i += batchSize) {
    batches.push(items.slice(i, i + batchSize));
  }

  console.log(`   📦 Processing ${items.length} items in ${batches.length} batches of ${batchSize}`);

  for (let i = 0; i < batches.length; i++) {
    const batchNum = i + 1;
    console.log(`\n   🔄 Processing batch ${batchNum}/${batches.length}...`);

    await processFn(batches[i], batchNum);

    // Delay between batches (except after last batch)
    if (i < batches.length - 1) {
      console.log(`   ⏳ Waiting ${batchDelay/1000}s before next batch...`);
      await sleep(batchDelay);
    }
  }
}

/**
 * Semaphore for limiting concurrent operations
 */
class Semaphore {
  constructor(maxConcurrent) {
    this.maxConcurrent = maxConcurrent;
    this.current = 0;
    this.queue = [];
  }

  async acquire() {
    if (this.current < this.maxConcurrent) {
      this.current++;
      return Promise.resolve();
    }

    return new Promise((resolve) => {
      this.queue.push(resolve);
    });
  }

  release() {
    this.current--;
    if (this.queue.length > 0) {
      this.current++;
      const resolve = this.queue.shift();
      resolve();
    }
  }

  async execute(fn) {
    await this.acquire();
    try {
      return await fn();
    } finally {
      this.release();
    }
  }
}

/**
 * Get recommended delay for specific operation type
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

module.exports = {
  RATE_LIMIT_CONFIG,
  rateLimitedRequest,
  processBatches,
  Semaphore,
  getDelayForOperation,
  sleep,
};

