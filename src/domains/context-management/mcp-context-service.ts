/**
 * 🖖 MCP Context Service
 * 
 * Model Context Protocol layer for cost and time efficiency.
 * Provides standardized context sharing and caching across crew workflows.
 * 
 * DDD Architecture: Domain Service for Context Management
 */

interface MCPContext {
  id: string;
  content: string;
  embeddings?: number[];
  metadata: {
    sessionId: string;
    crewMembers: string[];
    timestamp: string;
    tags: string[];
  };
  cacheKey: string;
  ttl: number; // Time to live in milliseconds
}

interface MCPContextCache {
  [key: string]: MCPContext;
}

export class MCPContextService {
  private cache: MCPContextCache = {};
  private readonly DEFAULT_TTL = 3600000; // 1 hour

  /**
   * Generate cache key from content and metadata
   */
  private generateCacheKey(content: string, metadata: Record<string, any>): string {
    const contentHash = this.hashString(content);
    const metadataHash = this.hashString(JSON.stringify(metadata));
    return `mcp:${contentHash}:${metadataHash}`;
  }

  /**
   * Simple string hash function
   */
  private hashString(str: string): string {
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
  storeContext(
    content: string,
    embeddings: number[] | null,
    metadata: {
      sessionId: string;
      crewMembers?: string[];
      tags?: string[];
    }
  ): MCPContext {
    const cacheKey = this.generateCacheKey(content, metadata);
    
    // Check if already cached
    const existing = this.cache[cacheKey];
    if (existing && this.isValid(existing)) {
      return existing;
    }

    // Create new context
    const context: MCPContext = {
      id: `mcp-${Date.now()}-${Math.random().toString(36).substring(7)}`,
      content,
      embeddings: embeddings || undefined,
      metadata: {
        sessionId: metadata.sessionId,
        crewMembers: metadata.crewMembers || [],
        timestamp: new Date().toISOString(),
        tags: metadata.tags || []
      },
      cacheKey,
      ttl: this.DEFAULT_TTL
    };

    // Store in cache
    this.cache[cacheKey] = context;

    return context;
  }

  /**
   * Retrieve context from cache
   */
  getContext(cacheKey: string): MCPContext | null {
    const context = this.cache[cacheKey];
    if (context && this.isValid(context)) {
      return context;
    }
    return null;
  }

  /**
   * Check if context is still valid (not expired)
   */
  private isValid(context: MCPContext): boolean {
    const age = Date.now() - new Date(context.metadata.timestamp).getTime();
    return age < context.ttl;
  }

  /**
   * Share context with multiple crew members
   * This is the key efficiency gain - one context serves many
   */
  shareContextWithCrew(
    contextId: string,
    crewMembers: string[]
  ): MCPContext | null {
    const context = Object.values(this.cache).find(c => c.id === contextId);
    if (!context || !this.isValid(context)) {
      return null;
    }

    // Update metadata to include crew members
    context.metadata.crewMembers = [
      ...new Set([...context.metadata.crewMembers, ...crewMembers])
    ];

    return context;
  }

  /**
   * Get cached embeddings (avoids regeneration)
   */
  getCachedEmbeddings(content: string): number[] | null {
    // Try to find context by content hash
    const cacheKey = this.generateCacheKey(content, {});
    const context = this.cache[cacheKey];
    
    if (context && this.isValid(context) && context.embeddings) {
      return context.embeddings;
    }

    return null;
  }

  /**
   * Clear expired contexts
   */
  cleanup(): number {
    const before = Object.keys(this.cache).length;
    Object.keys(this.cache).forEach(key => {
      if (!this.isValid(this.cache[key])) {
        delete this.cache[key];
      }
    });
    const after = Object.keys(this.cache).length;
    return before - after;
  }

  /**
   * Get cache statistics
   */
  getStats(): {
    totalContexts: number;
    validContexts: number;
    expiredContexts: number;
    totalEmbeddings: number;
  } {
    const contexts = Object.values(this.cache);
    const valid = contexts.filter(c => this.isValid(c));
    const expired = contexts.filter(c => !this.isValid(c));
    const withEmbeddings = contexts.filter(c => c.embeddings);

    return {
      totalContexts: contexts.length,
      validContexts: valid.length,
      expiredContexts: expired.length,
      totalEmbeddings: withEmbeddings.length
    };
  }
}

// Singleton instance
let mcpContextServiceInstance: MCPContextService | null = null;

export function getMCPContextService(): MCPContextService {
  if (!mcpContextServiceInstance) {
    mcpContextServiceInstance = new MCPContextService();
  }
  return mcpContextServiceInstance;
}

