/**
 * 🖖 MCP Memory Storage Service
 * 
 * Direct Supabase integration for memory storage using MCP context caching.
 * Bypasses n8n webhooks entirely for reliable memory storage.
 */

const https = require('https');
const { loadCrewCredentials } = require('./load-crew-credentials');
const { getMCPCache } = require('./mcp-context-cache');

class MCPMemoryStorage {
  constructor() {
    this.supabaseUrl = null;
    this.supabaseKey = null;
    this.mcpCache = getMCPCache();
  }

  /**
   * Initialize Supabase credentials
   */
  initialize() {
    const { supabase } = loadCrewCredentials();
    this.supabaseUrl = supabase.url;
    this.supabaseKey = supabase.serviceKey || supabase.key;

    if (!this.supabaseUrl || !this.supabaseKey) {
      throw new Error('Supabase credentials not found. Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in ~/.zshrc');
    }

    return true;
  }

  /**
   * Store memory with MCP context caching and smart redundancy checking
   */
  async storeMemory(memoryData) {
    if (!this.supabaseUrl || !this.supabaseKey) {
      this.initialize();
    }

    const {
      content,
      title,
      category = 'memory',
      tags = [],
      crewMember,
      sessionId,
      metadata = {}
    } = memoryData;

    // Check MCP cache first (avoid duplicate storage)
    const cacheKey = this.mcpCache.generateCacheKey(content, {
      title,
      category,
      sessionId
    });

    const cached = this.mcpCache.getContext(cacheKey);
    if (cached) {
      console.log('   ✅ Using cached MCP context (avoiding duplicate storage)');
      return {
        success: true,
        cached: true,
        contextId: cached.id,
        message: 'Memory already cached in MCP system'
      };
    }

    // Smart redundancy check (if smart ingestion available)
    try {
      const { SmartRAGIngestion } = require('../rag-smart-ingestion');
      const smartIngestion = new SmartRAGIngestion();
      await smartIngestion.initialize();
      
      // Quick redundancy check (free)
      const quickCheck = await smartIngestion.quickRedundancyCheck(title, content);
      if (quickCheck.redundant && !metadata.force) {
        console.log(`   ⚠️  Redundant knowledge detected: ${quickCheck.reason}`);
        console.log(`   📋 Similar to: ${quickCheck.existing.title}`);
        return {
          success: false,
          cached: false,
          redundant: true,
          existing: quickCheck.existing,
          message: `Knowledge is redundant: ${quickCheck.reason}`
        };
      }
      
      // Semantic redundancy check (free - uses existing data)
      const semanticCheck = await smartIngestion.semanticRedundancyCheck(title, content);
      if (semanticCheck.redundant && !metadata.force) {
        console.log(`   ⚠️  High semantic overlap: ${(semanticCheck.similarity * 100).toFixed(1)}%`);
        console.log(`   📋 Similar to: ${semanticCheck.existing.title}`);
        return {
          success: false,
          cached: false,
          redundant: true,
          existing: semanticCheck.existing,
          message: `High semantic overlap: ${(semanticCheck.similarity * 100).toFixed(1)}%`
        };
      }
    } catch (error) {
      // If smart ingestion not available, continue with normal flow
      console.log('   ℹ️  Smart ingestion check skipped (continuing with normal storage)');
    }

    // Check for cached embeddings
    const cachedEmbeddings = this.mcpCache.getCachedEmbeddings(content);
    
    // Prepare payload (match working simple-direct-rag-push.js pattern exactly)
    // Schema: id, title, content, embedding, metadata, session_id, created_at, updated_at
    // Note: simple-direct-rag-push.js doesn't include metadata due to schema cache issues
    const payload = {
      session_id: sessionId || `memory-${Date.now()}`,
      title: title || 'Untitled Memory',
      content: content,
      category: category || 'memory'
      // Note: Not including metadata field as schema cache doesn't recognize it
      // Note: Only include embedding if we have one (format as string array)
    };
    
    // Only add embedding if we have one (format as string like simple-direct-rag-push.js)
    if (cachedEmbeddings && Array.isArray(cachedEmbeddings) && cachedEmbeddings.length > 0) {
      payload.embedding = `[${cachedEmbeddings.join(',')}]`;
    }

    // Store in Supabase
    try {
      const result = await this.insertToSupabase(payload);
      
      // Cache the context for future use
      this.mcpCache.storeContext(content, cachedEmbeddings, {
        sessionId: payload.session_id,
        crewMembers: crewMember ? [crewMember] : [],
        tags: tags
      });

      return {
        success: true,
        cached: false,
        result: result,
        message: 'Memory stored successfully via MCP system'
      };
    } catch (error) {
      throw new Error(`Failed to store memory: ${error.message}`);
    }
  }

  /**
   * Insert data into Supabase
   */
  async insertToSupabase(payload) {
    return new Promise((resolve, reject) => {
      const url = new URL('/rest/v1/knowledge_base', this.supabaseUrl);
      const data = JSON.stringify([payload]); // Supabase expects array

      const options = {
        hostname: url.hostname,
        port: url.port || 443,
        path: url.pathname,
        method: 'POST',
        headers: {
          'apikey': this.supabaseKey,
          'Authorization': `Bearer ${this.supabaseKey}`,
          'Content-Type': 'application/json',
          'Prefer': 'return=representation'
        },
        timeout: 30000
      };

      const req = https.request(options, (res) => {
        let body = '';
        res.on('data', chunk => body += chunk);
        res.on('end', () => {
          if (res.statusCode >= 200 && res.statusCode < 300) {
            try {
              const result = JSON.parse(body);
              resolve(result);
            } catch (e) {
              resolve(body);
            }
          } else {
            reject(new Error(`HTTP ${res.statusCode}: ${body}`));
          }
        });
      });

      req.on('error', reject);
      req.on('timeout', () => {
        req.destroy();
        reject(new Error('Request timeout'));
      });

      req.write(data);
      req.end();
    });
  }

  /**
   * Query memories with MCP caching
   */
  async queryMemories(query, options = {}) {
    if (!this.supabaseUrl || !this.supabaseKey) {
      this.initialize();
    }

    const {
      limit = 10,
      category = null,
      crewMember = null,
      useCache = true
    } = options;

    // Check cache first
    if (useCache) {
      const cacheKey = this.mcpCache.generateCacheKey(query, options);
      const cached = this.mcpCache.getContext(cacheKey);
      if (cached) {
        console.log('   ✅ Using cached query results (MCP efficiency)');
        return {
          success: true,
          cached: true,
          results: JSON.parse(cached.content),
          contextId: cached.id
        };
      }
    }

    // Build Supabase query
    // Schema columns: id, title, content, embedding, metadata, session_id, created_at, updated_at
    let queryPath = `/rest/v1/knowledge_base?select=*&limit=${limit}`;
    
    // Category and tags are in metadata JSONB, filter after fetching

    // For semantic search, we'd use pgvector, but for now use text search
    // Note: content is JSONB, so we need to cast it or use a different approach
    // Using or filter with title search instead
    if (query) {
      // Search in title field (text) instead of content (JSONB)
      queryPath += `&title=ilike.%25${encodeURIComponent(query)}%25`;
    }

    try {
      let results = await this.querySupabase(queryPath);
      
      // Filter by category if specified (from metadata)
      if (category) {
        results = results.filter(r => 
          r.metadata && r.metadata.category === category
        );
      }
      
      // Filter by crew member if specified (from metadata)
      if (crewMember) {
        results = results.filter(r => 
          r.metadata && r.metadata.crew_member === crewMember
        );
      }
      
      // Cache results
      if (useCache && results.length > 0) {
        this.mcpCache.storeContext(JSON.stringify(results), null, {
          sessionId: `query-${Date.now()}`,
          tags: ['query', 'memory-search']
        });
      }

      return {
        success: true,
        cached: false,
        results: results,
        count: results.length
      };
    } catch (error) {
      throw new Error(`Failed to query memories: ${error.message}`);
    }
  }

  /**
   * Query Supabase
   */
  async querySupabase(queryPath) {
    return new Promise((resolve, reject) => {
      const url = new URL(queryPath, this.supabaseUrl);

      const options = {
        hostname: url.hostname,
        port: url.port || 443,
        path: url.pathname + url.search,
        method: 'GET',
        headers: {
          'apikey': this.supabaseKey,
          'Authorization': `Bearer ${this.supabaseKey}`,
          'Content-Type': 'application/json'
        },
        timeout: 30000
      };

      const req = https.request(options, (res) => {
        let body = '';
        res.on('data', chunk => body += chunk);
        res.on('end', () => {
          if (res.statusCode >= 200 && res.statusCode < 300) {
            try {
              const result = JSON.parse(body);
              resolve(result);
            } catch (e) {
              resolve(body);
            }
          } else {
            reject(new Error(`HTTP ${res.statusCode}: ${body}`));
          }
        });
      });

      req.on('error', reject);
      req.on('timeout', () => {
        req.destroy();
        reject(new Error('Request timeout'));
      });

      req.end();
    });
  }

  /**
   * Get cache statistics
   */
  getCacheStats() {
    return this.mcpCache.getStats();
  }
}

// Singleton instance
let mcpMemoryStorageInstance = null;

function getMCPMemoryStorage() {
  if (!mcpMemoryStorageInstance) {
    mcpMemoryStorageInstance = new MCPMemoryStorage();
  }
  return mcpMemoryStorageInstance;
}

module.exports = { getMCPMemoryStorage, MCPMemoryStorage };

