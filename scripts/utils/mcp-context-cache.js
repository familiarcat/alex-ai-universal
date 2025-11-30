/**
 * 🖖 MCP Context Cache - JavaScript Implementation
 * 
 * In-memory context cache for MCP layer efficiency.
 * Provides context sharing and embedding caching to reduce API calls.
 */

class MCPContextCache {
  constructor() {
    this.cache = new Map();
    this.embeddingCache = new Map();
    this.DEFAULT_TTL = 3600000; // 1 hour
  }

  /**
   * Generate cache key from content
   */
  generateCacheKey(content, metadata = {}) {
    const contentHash = this.hashString(content);
    const metadataHash = this.hashString(JSON.stringify(metadata));
    return `mcp:${contentHash}:${metadataHash}`;
  }

  /**
   * Simple string hash function
   */
  hashString(str) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash).toString(36);
  }

  /**
   * Store context in cache
   */
  storeContext(content, embeddings, metadata) {
    const cacheKey = this.generateCacheKey(content, metadata);
    const timestamp = Date.now();

    const context = {
      id: `mcp-${timestamp}-${Math.random().toString(36).substring(7)}`,
      content,
      embeddings: embeddings || null,
      metadata: {
        sessionId: metadata.sessionId || `session-${timestamp}`,
        crewMembers: metadata.crewMembers || [],
        tags: metadata.tags || [],
        timestamp: new Date().toISOString()
      },
      cacheKey,
      ttl: metadata.ttl || this.DEFAULT_TTL,
      createdAt: timestamp
    };

    this.cache.set(cacheKey, context);

    // Also cache embeddings separately for quick lookup
    if (embeddings) {
      const embeddingKey = this.hashString(content);
      this.embeddingCache.set(embeddingKey, {
        embeddings,
        timestamp,
        ttl: this.DEFAULT_TTL
      });
    }

    return context;
  }

  /**
   * Get context from cache
   */
  getContext(cacheKey) {
    const context = this.cache.get(cacheKey);
    if (context && this.isValid(context)) {
      return context;
    }
    return null;
  }

  /**
   * Get cached embeddings (avoids regeneration)
   */
  getCachedEmbeddings(content) {
    const embeddingKey = this.hashString(content);
    const cached = this.embeddingCache.get(embeddingKey);
    
    if (cached && this.isValidTimestamp(cached.timestamp, cached.ttl)) {
      return cached.embeddings;
    }

    return null;
  }

  /**
   * Check if context is still valid
   */
  isValid(context) {
    const age = Date.now() - context.createdAt;
    return age < context.ttl;
  }

  /**
   * Check if timestamp is still valid
   */
  isValidTimestamp(timestamp, ttl) {
    const age = Date.now() - timestamp;
    return age < ttl;
  }

  /**
   * Share context with crew members
   */
  shareContextWithCrew(contextId, crewMembers) {
    // Find context by ID
    let context = null;
    for (const [key, value] of this.cache.entries()) {
      if (value.id === contextId && this.isValid(value)) {
        context = value;
        break;
      }
    }

    if (!context) {
      return null;
    }

    // Update crew members list
    context.metadata.crewMembers = [
      ...new Set([...context.metadata.crewMembers, ...crewMembers])
    ];

    // Update cache
    this.cache.set(context.cacheKey, context);

    return context;
  }

  /**
   * Cleanup expired entries
   */
  cleanup() {
    let cleaned = 0;

    // Clean context cache
    for (const [key, value] of this.cache.entries()) {
      if (!this.isValid(value)) {
        this.cache.delete(key);
        cleaned++;
      }
    }

    // Clean embedding cache
    for (const [key, value] of this.embeddingCache.entries()) {
      if (!this.isValidTimestamp(value.timestamp, value.ttl)) {
        this.embeddingCache.delete(key);
        cleaned++;
      }
    }

    return cleaned;
  }

  /**
   * Get cache statistics
   */
  getStats() {
    const contexts = Array.from(this.cache.values());
    const validContexts = contexts.filter(c => this.isValid(c));
    const expiredContexts = contexts.filter(c => !this.isValid(c));
    const withEmbeddings = contexts.filter(c => c.embeddings);

    return {
      totalContexts: contexts.length,
      validContexts: validContexts.length,
      expiredContexts: expiredContexts.length,
      totalEmbeddings: withEmbeddings.length,
      embeddingCacheSize: this.embeddingCache.size
    };
  }

  /**
   * Clear all caches
   */
  clear() {
    this.cache.clear();
    this.embeddingCache.clear();
  }
}

// Singleton instance
let mcpCacheInstance = null;

function getMCPCache() {
  if (!mcpCacheInstance) {
    mcpCacheInstance = new MCPContextCache();
    
    // Auto-cleanup every 30 minutes
    setInterval(() => {
      const cleaned = mcpCacheInstance.cleanup();
      if (cleaned > 0) {
        console.log(`🧹 MCP Cache: Cleaned ${cleaned} expired entries`);
      }
    }, 30 * 60 * 1000);
  }
  return mcpCacheInstance;
}

module.exports = { getMCPCache, MCPContextCache };

