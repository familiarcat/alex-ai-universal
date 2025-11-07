/**
 * Semaphore - Concurrency Control
 * 
 * Limits the number of concurrent operations to prevent overwhelming external APIs
 * 
 * @author Commander Data (Precise concurrency control)
 * @author Chief O'Brien (Pragmatic implementation)
 */

export class Semaphore {
  private maxConcurrent: number;
  private current: number = 0;
  private queue: Array<() => void> = [];

  constructor(maxConcurrent: number) {
    this.maxConcurrent = maxConcurrent;
  }

  /**
   * Acquire a slot in the semaphore
   * Returns immediately if slots available, otherwise waits in queue
   */
  async acquire(): Promise<void> {
    if (this.current < this.maxConcurrent) {
      this.current++;
      return Promise.resolve();
    }

    return new Promise<void>((resolve) => {
      this.queue.push(resolve);
    });
  }

  /**
   * Release a slot in the semaphore
   * Automatically processes next item in queue if any
   */
  release(): void {
    this.current--;
    if (this.queue.length > 0) {
      this.current++;
      const resolve = this.queue.shift();
      if (resolve) resolve();
    }
  }

  /**
   * Execute a function with semaphore control
   * Automatically acquires and releases
   */
  async execute<T>(fn: () => Promise<T>): Promise<T> {
    await this.acquire();
    try {
      return await fn();
    } finally {
      this.release();
    }
  }

  /**
   * Get current state for monitoring
   */
  getState() {
    return {
      current: this.current,
      maxConcurrent: this.maxConcurrent,
      queued: this.queue.length,
      available: this.maxConcurrent - this.current,
    };
  }
}

