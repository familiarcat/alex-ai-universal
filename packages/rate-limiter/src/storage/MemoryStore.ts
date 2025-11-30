/**
 * Memory Store - In-Memory Rate Limit Storage
 * 
 * Fast, simple in-memory storage for rate limiting
 * Suitable for development and single-instance deployments
 * 
 * @author Commander Data (Efficient data structures)
 * @author Chief O'Brien (Pragmatic default implementation)
 */

export interface StorageRecord {
  count: number;
  resetAt: number;
  requests: number[];
}

export interface MemoryStoreConfig {
  cleanupIntervalMs?: number;
  maxKeys?: number;
}

export class MemoryStore {
  private store = new Map<string, StorageRecord>();
  private config: Required<MemoryStoreConfig>;
  private cleanupTimer?: NodeJS.Timeout;

  constructor(config: MemoryStoreConfig = {}) {
    const defaults: Required<MemoryStoreConfig> = {
      cleanupIntervalMs: 60000, // Cleanup every minute
      maxKeys: 10000, // Prevent memory leaks
    };

    this.config = { ...defaults, ...config };
    this.startCleanup();
  }

  /**
   * Get a record from storage
   */
  get(key: string): StorageRecord | undefined {
    return this.store.get(key);
  }

  /**
   * Set a record in storage
   */
  set(key: string, record: StorageRecord): void {
    // Enforce max keys limit
    if (this.store.size >= this.config.maxKeys && !this.store.has(key)) {
      // Remove oldest expired records
      this.cleanup();
      
      // If still at limit, remove oldest record
      if (this.store.size >= this.config.maxKeys) {
        const firstKey = this.store.keys().next().value;
        if (firstKey) {
          this.store.delete(firstKey);
        }
      }
    }

    this.store.set(key, record);
  }

  /**
   * Delete a record from storage
   */
  delete(key: string): boolean {
    return this.store.delete(key);
  }

  /**
   * Clear all records
   */
  clear(): void {
    this.store.clear();
  }

  /**
   * Get all keys
   */
  keys(): string[] {
    return Array.from(this.store.keys());
  }

  /**
   * Get storage size
   */
  size(): number {
    return this.store.size;
  }

  /**
   * Cleanup expired records
   */
  cleanup(): number {
    const now = Date.now();
    let removed = 0;

    for (const [key, record] of this.store.entries()) {
      if (now > record.resetAt) {
        this.store.delete(key);
        removed++;
      }
    }

    return removed;
  }

  /**
   * Start automatic cleanup timer
   */
  private startCleanup(): void {
    this.cleanupTimer = setInterval(() => {
      const removed = this.cleanup();
      if (removed > 0) {
        console.log(`   🧹 MemoryStore: Cleaned up ${removed} expired records`);
      }
    }, this.config.cleanupIntervalMs);

    // Don't prevent process from exiting
    if (this.cleanupTimer.unref) {
      this.cleanupTimer.unref();
    }
  }

  /**
   * Stop automatic cleanup timer
   */
  stopCleanup(): void {
    if (this.cleanupTimer) {
      clearInterval(this.cleanupTimer);
      this.cleanupTimer = undefined;
    }
  }

  /**
   * Get statistics
   */
  getStats() {
    return {
      size: this.store.size,
      maxKeys: this.config.maxKeys,
      utilization: (this.store.size / this.config.maxKeys) * 100,
    };
  }

  /**
   * Destroy the store
   */
  destroy(): void {
    this.stopCleanup();
    this.clear();
  }
}

/**
 * Global singleton instance for convenience
 */
let globalStore: MemoryStore | null = null;

export function getGlobalMemoryStore(config?: MemoryStoreConfig): MemoryStore {
  if (!globalStore) {
    globalStore = new MemoryStore(config);
  }
  return globalStore;
}

