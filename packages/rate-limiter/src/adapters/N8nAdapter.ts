/**
 * N8N Adapter - Rate Limiting for n8n Automation Scripts
 * 
 * Designed for command-line automation scripts that interact with n8n API
 * 
 * @author Chief O'Brien (Pragmatic n8n integration)
 * @author Lieutenant Worf (Security validation)
 */

import { RateLimiter, RateLimiterConfig } from '../core/RateLimiter';
import { Semaphore } from '../core/Semaphore';

export interface N8nAdapterConfig extends RateLimiterConfig {
  maxConcurrent?: number;
  workflowOperationDelay?: number;
  containerRestartWait?: number;
  webhookRegistrationWait?: number;
}

export class N8nAdapter {
  private rateLimiter: RateLimiter;
  private semaphore: Semaphore;
  private config: N8nAdapterConfig;

  constructor(config: N8nAdapterConfig = {}) {
    // N8N-specific defaults
    const n8nDefaults: N8nAdapterConfig = {
      minDelayBetweenRequests: 2000,
      operationDelay: 3000,
      batchDelay: 5000,
      maxRetries: 5,
      initialRetryDelay: 5000,
      maxRetryDelay: 60000,
      backoffMultiplier: 2,
      maxConcurrent: 3,
      workflowOperationDelay: 3000,
      containerRestartWait: 10000,
      webhookRegistrationWait: 8000,
      logRateLimitHeaders: true,
      adaptiveTiming: true,
    };

    this.config = { ...n8nDefaults, ...config };
    this.rateLimiter = new RateLimiter(this.config);
    this.semaphore = new Semaphore(this.config.maxConcurrent || 3);
  }

  /**
   * Execute an n8n API call with rate limiting
   */
  async apiCall<T>(requestFn: () => Promise<T>, operation: string = 'n8n API call'): Promise<T> {
    return this.semaphore.execute(async () => {
      return this.rateLimiter.execute(requestFn, { operation });
    });
  }

  /**
   * Fetch workflows with rate limiting
   */
  async fetchWorkflows<T>(fetchFn: () => Promise<T>): Promise<T> {
    return this.apiCall(fetchFn, 'fetch workflows');
  }

  /**
   * Activate a workflow with proper delay
   */
  async activateWorkflow<T>(activateFn: () => Promise<T>): Promise<T> {
    const result = await this.apiCall(activateFn, 'activate workflow');
    // Wait for webhook registration
    await this.sleep(this.config.webhookRegistrationWait || 8000);
    return result;
  }

  /**
   * Deactivate a workflow with proper delay
   */
  async deactivateWorkflow<T>(deactivateFn: () => Promise<T>): Promise<T> {
    return this.apiCall(deactivateFn, 'deactivate workflow');
  }

  /**
   * Toggle workflow (deactivate then activate)
   * This forces webhook re-registration
   */
  async toggleWorkflow<T>(
    deactivateFn: () => Promise<T>,
    activateFn: () => Promise<T>
  ): Promise<{ deactivated: T; activated: T }> {
    const deactivated = await this.deactivateWorkflow(deactivateFn);
    await this.sleep(1000); // Brief pause between deactivate and activate
    const activated = await this.activateWorkflow(activateFn);
    return { deactivated, activated };
  }

  /**
   * Process workflows in batches
   */
  async processBatches<T, R>(
    workflows: T[],
    processFn: (batch: T[], batchNum: number) => Promise<R>,
    batchSize: number = 5
  ): Promise<R[]> {
    return this.rateLimiter.processBatches(workflows, processFn, batchSize);
  }

  /**
   * Wait after container restart
   */
  async waitForContainerRestart(): Promise<void> {
    const waitTime = this.config.containerRestartWait || 10000;
    console.log(`   ⏳ Waiting ${waitTime/1000}s for n8n container to fully restart...`);
    await this.sleep(waitTime);
  }

  /**
   * Get semaphore state for monitoring
   */
  getSemaphoreState() {
    return this.semaphore.getState();
  }

  /**
   * Sleep utility
   */
  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

/**
 * Convenience function to create N8N rate limiter
 */
export function createN8nRateLimiter(config?: N8nAdapterConfig): N8nAdapter {
  return new N8nAdapter(config);
}

