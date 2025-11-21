/**
 * 🖖 Unified Service Accessor
 * 
 * Provides unified access to both MCP and n8n services in the same scope.
 * Allows seamless switching between MCP (preferred) and n8n (fallback).
 */

const { getMCPWorkflowService } = require('./mcp-workflow-service');
const { getMCPMemoryStorage } = require('./mcp-memory-storage');
const { getMCPCache } = require('./mcp-context-cache');
const { getMCPOpenRouterOptimizer } = require('./mcp-openrouter-optimizer');
const { getMCPMonitoring } = require('./mcp-monitoring');
const { getMCPScheduler } = require('./mcp-scheduler');
const { loadCrewCredentials } = require('./load-crew-credentials');

// For remote MCP, use HTTP client
const https = require('https');

class UnifiedServiceAccessor {
  constructor() {
    this.mcpServices = {
      workflow: null,
      memory: null,
      cache: null,
      optimizer: null,
      monitoring: null,
      scheduler: null,
    };
    
    this.mcpRemote = {
      baseUrl: null,
      apiKey: null,
      client: null,
      enabled: false,
    };
    
    this.n8nConfig = {
      baseUrl: null,
      apiKey: null,
      client: null,
    };
    
    this.initialized = false;
    this.useRemoteMCP = false; // Toggle between local and remote MCP
  }

  /**
   * Initialize all MCP services
   */
  initializeMCP() {
    try {
      // Initialize workflow service
      this.mcpServices.workflow = getMCPWorkflowService();
      this.mcpServices.workflow.initialize();
      
      // Initialize memory storage
      this.mcpServices.memory = getMCPMemoryStorage();
      this.mcpServices.memory.initialize();
      
      // Initialize context cache
      this.mcpServices.cache = getMCPCache();
      
      // Initialize OpenRouter optimizer
      this.mcpServices.optimizer = getMCPOpenRouterOptimizer();
      try {
        this.mcpServices.optimizer.initialize();
      } catch (e) {
        // Optional service
      }
      
      // Initialize monitoring
      this.mcpServices.monitoring = getMCPMonitoring();
      try {
        this.mcpServices.monitoring.initialize();
      } catch (e) {
        // Optional service
      }
      
      // Initialize scheduler
      this.mcpServices.scheduler = getMCPScheduler();
      try {
        this.mcpServices.scheduler.initialize();
      } catch (e) {
        // Optional service
      }
      
      console.log('✅ MCP services initialized');
      return true;
    } catch (error) {
      console.error('❌ Failed to initialize MCP services:', error.message);
      return false;
    }
  }

  /**
   * Initialize remote MCP client
   */
  initializeRemoteMCP(config = null) {
    try {
      if (!config) {
        const { n8n } = loadCrewCredentials();
        // Use same base URL as n8n, different port
        config = {
          baseUrl: 'https://mcp.pbradygeorgen.com',
        config = {
          baseUrl: baseUrl || 'https://mcp.pbradygeorgen.com',
          apiKey: n8n.apiKey, // Reuse n8n API key for now
        };
      }
      
      this.mcpRemote.baseUrl = config.baseUrl;
      this.mcpRemote.apiKey = config.apiKey;
      
      // Create remote MCP client (HTTP wrapper)
      this.mcpRemote.client = {
        baseUrl: config.baseUrl,
        apiKey: config.apiKey,
      };
      
      this.mcpRemote.enabled = true;
      console.log('✅ Remote MCP client initialized');
      return true;
    } catch (error) {
      console.error('❌ Failed to initialize remote MCP client:', error.message);
      return false;
    }
  }

  /**
   * Initialize n8n client
   */
  initializeN8N(config = null) {
    try {
      if (!config) {
        const { n8n } = loadCrewCredentials();
        config = {
          baseUrl: n8n.baseUrl,
          apiKey: n8n.apiKey,
        };
      }
      
      this.n8nConfig.baseUrl = config.baseUrl;
      this.n8nConfig.apiKey = config.apiKey;
      
      // Create n8n client (simple HTTP wrapper)
      this.n8nConfig.client = {
        baseUrl: config.baseUrl,
        apiKey: config.apiKey,
      };
      
      console.log('✅ n8n client initialized');
      return true;
    } catch (error) {
      console.error('❌ Failed to initialize n8n client:', error.message);
      return false;
    }
  }

  /**
   * Initialize all services
   */
  initialize(options = {}) {
    const { useRemoteMCP = true } = options; // Default to remote MCP
    this.useRemoteMCP = useRemoteMCP;
    
    if (useRemoteMCP) {
      this.initializeRemoteMCP();
    } else {
      this.initializeMCP();
    }
    
    this.initializeN8N();
    this.initialized = true;
    return true;
  }

  /**
   * Get MCP service by name
   */
  getMCP(serviceName) {
    return this.mcpServices[serviceName] || null;
  }

  /**
   * Get n8n client
   */
  getN8N() {
    return this.n8nConfig.client;
  }

  /**
   * Execute workflow (prefers MCP, falls back to n8n)
   */
  async executeWorkflow(workflow, options = {}) {
    const useMCP = options.useMCP !== false; // Default to MCP
    
    // Try remote MCP first if enabled
    if (useMCP && this.useRemoteMCP && this.mcpRemote.enabled) {
      try {
        return await this.executeRemoteMCPWorkflow(workflow);
      } catch (error) {
        console.warn('⚠️  Remote MCP workflow execution failed, trying local MCP:', error.message);
        // Fall through to local MCP
      }
    }
    
    // Try local MCP
    if (useMCP && !this.useRemoteMCP && this.mcpServices.workflow) {
      try {
        return await this.mcpServices.workflow.executeWorkflow(workflow);
      } catch (error) {
        console.warn('⚠️  Local MCP workflow execution failed, falling back to n8n:', error.message);
        // Fall through to n8n
      }
    }
    
    // Fallback to n8n
    if (this.n8nConfig.client) {
      return await this.executeN8NWorkflow(workflow);
    }
    
    throw new Error('No workflow service available (MCP or n8n)');
  }

  /**
   * Store memory (prefers MCP, falls back to n8n)
   */
  async storeMemory(memoryData, options = {}) {
    const useMCP = options.useMCP !== false; // Default to MCP
    
    // Try remote MCP first if enabled
    if (useMCP && this.useRemoteMCP && this.mcpRemote.enabled) {
      try {
        return await this.storeRemoteMCPMemory(memoryData);
      } catch (error) {
        console.warn('⚠️  Remote MCP memory storage failed, trying local MCP:', error.message);
        // Fall through to local MCP
      }
    }
    
    // Try local MCP
    if (useMCP && !this.useRemoteMCP && this.mcpServices.memory) {
      try {
        return await this.mcpServices.memory.storeMemory(memoryData);
      } catch (error) {
        console.warn('⚠️  Local MCP memory storage failed, falling back to n8n:', error.message);
        // Fall through to n8n
      }
    }
    
    // Fallback to n8n webhook
    if (this.n8nConfig.client) {
      return await this.triggerN8NWebhook('knowledge-ingest', memoryData);
    }
    
    throw new Error('No memory service available (MCP or n8n)');
  }

  /**
   * Query memories (prefers MCP, falls back to n8n)
   */
  async queryMemories(query, options = {}) {
    const useMCP = options.useMCP !== false; // Default to MCP
    
    if (useMCP && this.mcpServices.memory) {
      try {
        return await this.mcpServices.memory.queryMemories(query, options);
      } catch (error) {
        console.warn('⚠️  MCP memory query failed, falling back to n8n:', error.message);
        // Fall through to n8n
      }
    }
    
    // Fallback to n8n webhook
    if (this.n8nConfig.client) {
      return await this.triggerN8NWebhook('knowledge-query', { query, ...options });
    }
    
    throw new Error('No memory service available (MCP or n8n)');
  }

  /**
   * Execute remote MCP workflow via HTTP
   */
  async executeRemoteMCPWorkflow(workflow) {
    return new Promise((resolve, reject) => {
      const url = new URL(`${this.mcpRemote.baseUrl}/api/workflows/execute`);
      const options = {
        hostname: url.hostname,
        port: url.port || 443,
        path: url.pathname,
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-MCP-API-KEY': this.mcpRemote.apiKey,
        },
        timeout: 30000,
      };

      const req = https.request(options, (res) => {
        let body = '';
        res.on('data', chunk => body += chunk);
        res.on('end', () => {
          if (res.statusCode >= 200 && res.statusCode < 300) {
            const parsed = JSON.parse(body);
            resolve(parsed.result || parsed);
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

      req.write(JSON.stringify(workflow));
      req.end();
    });
  }

  /**
   * Store memory via remote MCP
   */
  async storeRemoteMCPMemory(memoryData) {
    return new Promise((resolve, reject) => {
      const url = new URL(`${this.mcpRemote.baseUrl}/api/memory/store`);
      const options = {
        hostname: url.hostname,
        port: url.port || 443,
        path: url.pathname,
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-MCP-API-KEY': this.mcpRemote.apiKey,
        },
        timeout: 30000,
      };

      const req = https.request(options, (res) => {
        let body = '';
        res.on('data', chunk => body += chunk);
        res.on('end', () => {
          if (res.statusCode >= 200 && res.statusCode < 300) {
            const parsed = JSON.parse(body);
            resolve(parsed.result || parsed);
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

      req.write(JSON.stringify(memoryData));
      req.end();
    });
  }

  /**
   * Execute n8n workflow via HTTP
   */
  async executeN8NWorkflow(workflow) {
    return new Promise((resolve, reject) => {
      const url = new URL(`${this.n8nConfig.baseUrl}/webhook/${workflow.webhook || workflow.id}`);
      const options = {
        hostname: url.hostname,
        port: url.port || 443,
        path: url.pathname,
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        timeout: 30000,
      };

      const req = https.request(options, (res) => {
        let body = '';
        res.on('data', chunk => body += chunk);
        res.on('end', () => {
          if (res.statusCode >= 200 && res.statusCode < 300) {
            resolve(JSON.parse(body));
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

      req.write(JSON.stringify(workflow.data || {}));
      req.end();
    });
  }

  /**
   * Trigger n8n webhook
   */
  async triggerN8NWebhook(webhookPath, data) {
    return new Promise((resolve, reject) => {
      const url = new URL(`${this.n8nConfig.baseUrl}/webhook/${webhookPath}`);
      const options = {
        hostname: url.hostname,
        port: url.port || 443,
        path: url.pathname,
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        timeout: 30000,
      };

      const req = https.request(options, (res) => {
        let body = '';
        res.on('data', chunk => body += chunk);
        res.on('end', () => {
          if (res.statusCode >= 200 && res.statusCode < 300) {
            try {
              resolve(JSON.parse(body));
            } catch (e) {
              resolve({ raw: body });
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

      req.write(JSON.stringify(data));
      req.end();
    });
  }

  /**
   * Get service status
   */
  getStatus() {
    return {
      initialized: this.initialized,
      useRemoteMCP: this.useRemoteMCP,
      mcp: {
        local: {
          workflow: !!this.mcpServices.workflow,
          memory: !!this.mcpServices.memory,
          cache: !!this.mcpServices.cache,
          optimizer: !!this.mcpServices.optimizer,
          monitoring: !!this.mcpServices.monitoring,
          scheduler: !!this.mcpServices.scheduler,
        },
        remote: {
          enabled: this.mcpRemote.enabled,
          baseUrl: this.mcpRemote.baseUrl,
        },
      },
      n8n: {
        configured: !!(this.n8nConfig.baseUrl && this.n8nConfig.apiKey),
        baseUrl: this.n8nConfig.baseUrl,
      },
    };
  }
}

let instance = null;

function getUnifiedServiceAccessor() {
  if (!instance) {
    instance = new UnifiedServiceAccessor();
  }
  return instance;
}

module.exports = { getUnifiedServiceAccessor, UnifiedServiceAccessor };

