/**
 * @alex-ai/rate-limiter - Unified Rate Limiting for Alex AI Universal
 * 
 * A comprehensive rate limiting system that prevents 429 errors across all
 * Alex AI platforms: n8n automation, Next.js APIs, and enterprise systems.
 * 
 * @author The Alex AI Crew
 * @version 1.0.0
 */

// Core exports
export { RateLimiter, RateLimiterConfig, RateLimitedRequestOptions, DEFAULT_CONFIG } from './core/RateLimiter';
export { Semaphore } from './core/Semaphore';

// Adapters
export { N8nAdapter, N8nAdapterConfig, createN8nRateLimiter } from './adapters/N8nAdapter';
export { NextJsAdapter, NextJsRateLimiterConfig, createNextJsRateLimiter, RateLimitRecord } from './adapters/NextJsAdapter';

// Storage
export { MemoryStore, MemoryStoreConfig, StorageRecord, getGlobalMemoryStore } from './storage/MemoryStore';

/**
 * Quick Start Examples:
 * 
 * // For n8n automation scripts
 * import { createN8nRateLimiter } from '@alex-ai/rate-limiter';
 * 
 * const rateLimiter = createN8nRateLimiter({ maxConcurrent: 3 });
 * await rateLimiter.apiCall(() => axios.get('/api/workflows'));
 * 
 * // For Next.js API routes
 * import { createNextJsRateLimiter } from '@alex-ai/rate-limiter';
 * 
 * const limiter = createNextJsRateLimiter({ maxRequests: 100, windowMs: 60000 });
 * const result = limiter.checkLimit(request, 'create-project');
 * if (!result.allowed) {
 *   return NextResponse.json(result.response.body, {
 *     status: result.response.status,
 *     headers: result.response.headers
 *   });
 * }
 * 
 * // For custom implementations
 * import { RateLimiter, Semaphore } from '@alex-ai/rate-limiter';
 * 
 * const rateLimiter = new RateLimiter({ maxRetries: 5, backoffMultiplier: 2 });
 * const semaphore = new Semaphore(3);
 * 
 * await semaphore.execute(async () => {
 *   return rateLimiter.execute(() => myApiCall());
 * });
 */

