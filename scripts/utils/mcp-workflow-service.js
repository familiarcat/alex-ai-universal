/**
 * 🖖 MCP Workflow Service
 * 
 * Provides workflow orchestration using MCP context caching instead of n8n.
 * Handles workflow state, API calls, and context sharing.
 */

const { getMCPCache } = require('./mcp-context-cache');
const { getMCPMemoryStorage } = require('./mcp-memory-storage');
const { getMCPOpenRouterOptimizer } = require('./mcp-openrouter-optimizer');
const { getMCPMonitoring } = require('./mcp-monitoring');
const https = require('https');

class MCPWorkflowService {
  constructor() {
    this.mcpCache = getMCPCache();
    this.memoryStorage = null;
    this.openRouterOptimizer = null;
    this.monitoring = null;
  }

  /**
   * Initialize workflow service
   */
  initialize() {
    this.memoryStorage = getMCPMemoryStorage();
    try {
      this.memoryStorage.initialize();
    } catch (e) {
      // Memory storage optional for some workflows
    }
    
    // Initialize OpenRouter optimizer
    this.openRouterOptimizer = getMCPOpenRouterOptimizer();
    try {
      this.openRouterOptimizer.initialize();
    } catch (e) {
      // OpenRouter optional for some workflows
    }

    // Initialize monitoring
    this.monitoring = getMCPMonitoring();
    try {
      this.monitoring.initialize();
    } catch (e) {
      // Monitoring optional
    }
    
    return true;
  }

  /**
   * Execute workflow with MCP caching and monitoring
   */
  async executeWorkflow(workflowName, workflowData, options = {}) {
    const {
      useCache = true,
      cacheTTL = 3600000, // 1 hour
      retries = 3
    } = options;

    const startTime = Date.now();

    // Check cache first
    if (useCache) {
      const cacheKey = this.mcpCache.generateCacheKey(JSON.stringify({
        workflow: workflowName,
        data: workflowData
      }), options);
      
      const cached = this.mcpCache.getContext(cacheKey);
      if (cached && this.isValidCache(cached, cacheTTL)) {
        console.log(`   ✅ Using cached workflow result (MCP efficiency)`);
        const result = JSON.parse(cached.content);
        
        // Log execution (cached)
        if (this.monitoring) {
          this.monitoring.logExecution({
            workflow: workflowName,
            success: true,
            duration: Date.now() - startTime,
            result: result,
            metadata: { cached: true }
          });
        }
        
        return result;
      }
    }

    // Execute workflow
    let result;
    let error = null;
    let attempts = 0;
    
    while (attempts < retries) {
      try {
        result = await this.runWorkflow(workflowName, workflowData);
        break;
      } catch (err) {
        error = err;
        attempts++;
        if (attempts >= retries) {
          break;
        }
        // Exponential backoff
        await this.sleep(Math.pow(2, attempts) * 1000);
      }
    }

    const duration = Date.now() - startTime;

    // Log execution
    if (this.monitoring) {
      this.monitoring.logExecution({
        workflow: workflowName,
        success: !error,
        duration: duration,
        result: result,
        error: error ? error.message : null,
        metadata: { attempts, retries }
      });

      // Log performance
      this.monitoring.logPerformance({
        workflow: workflowName,
        metric: 'execution_time',
        value: duration,
        unit: 'ms'
      });

      // Log error if any
      if (error) {
        this.monitoring.logError({
          workflow: workflowName,
          message: error.message,
          stack: error.stack,
          context: { workflowData, attempts, retries }
        });
      }
    }

    if (error) {
      throw error;
    }

    // Cache result
    if (useCache && result) {
      this.mcpCache.storeContext(
        JSON.stringify(result),
        null,
        {
          sessionId: `workflow-${workflowName}-${Date.now()}`,
          tags: ['workflow', workflowName]
        }
      );
    }

    return result;
  }

  /**
   * Run specific workflow
   */
  async runWorkflow(workflowName, workflowData) {
    switch (workflowName) {
      case 'knowledge-ingest':
        return await this.knowledgeIngestWorkflow(workflowData);
      case 'milestone-push':
        return await this.milestonePushWorkflow(workflowData);
      case 'memory-store':
        return await this.memoryStoreWorkflow(workflowData);
      case 'crew-analysis':
        return await this.crewAnalysisWorkflow(workflowData);
      case 'llm-call':
        return await this.llmCallWorkflow(workflowData);
      default:
        throw new Error(`Unknown workflow: ${workflowName}`);
    }
  }

  /**
   * Knowledge Ingest Workflow (replaces n8n webhook)
   */
  async knowledgeIngestWorkflow(data) {
    if (!this.memoryStorage) {
      this.initialize();
    }

    const {
      content,
      title,
      category = 'knowledge',
      tags = [],
      metadata = {}
    } = data;

    // Store via MCP memory storage
    const result = await this.memoryStorage.storeMemory({
      title: title || 'Knowledge Entry',
      content,
      category,
      tags,
      sessionId: metadata.sessionId || `knowledge-${Date.now()}`,
      metadata
    });

    return {
      success: true,
      workflow: 'knowledge-ingest',
      result: result,
      method: 'mcp-direct'
    };
  }

  /**
   * Milestone Push Workflow (enhanced MCP version)
   */
  async milestonePushWorkflow(data) {
    const {
      milestonePath,
      milestoneData
    } = data;

    // Use MCP-enhanced milestone push
    const { execSync } = require('child_process');
    const path = require('path');
    const scriptPath = path.join(__dirname, '..', 'push-milestone-to-rag.js');

    try {
      const output = execSync(`node "${scriptPath}" "${milestonePath}"`, {
        encoding: 'utf8',
        cwd: path.dirname(scriptPath)
      });

      return {
        success: true,
        workflow: 'milestone-push',
        output: output,
        method: 'mcp-enhanced'
      };
    } catch (error) {
      throw new Error(`Milestone push failed: ${error.message}`);
    }
  }

  /**
   * Memory Store Workflow (uses MCP memory storage)
   */
  async memoryStoreWorkflow(data) {
    if (!this.memoryStorage) {
      this.initialize();
    }

    return await this.memoryStorage.storeMemory(data);
  }

  /**
   * LLM Call Workflow (with OpenRouter optimization)
   */
  async llmCallWorkflow(data) {
    const {
      prompt,
      taskType,
      complexity = 'medium',
      crewMember,
      budgetConstraint = null,
      estimatedTokens = 1500
    } = data;

    if (!this.openRouterOptimizer) {
      this.initialize();
    }

    // Use OpenRouter optimizer with MCP caching
    const result = await this.openRouterOptimizer.callOpenRouter(
      prompt,
      {
        taskType,
        complexity,
        crewMember,
        budgetConstraint,
        estimatedTokens
      },
      {
        useCache: true
      }
    );

    return {
      success: true,
      workflow: 'llm-call',
      result: result,
      modelSelection: result.modelSelection,
      method: 'mcp-openrouter-optimized'
    };
  }

  /**
   * Crew Analysis Workflow (MCP-enhanced)
   */
  async crewAnalysisWorkflow(data) {
    const {
      query,
      crewMembers = [],
      sessionId
    } = data;

    // Check cache for crew analysis
    const cacheKey = this.mcpCache.generateCacheKey(JSON.stringify({
      query,
      crewMembers
    }), { sessionId });

    const cached = this.mcpCache.getContext(cacheKey);
    if (cached) {
      return JSON.parse(cached.content);
    }

    // Perform crew analysis (simplified - would integrate with actual crew system)
    const analysis = {
      query,
      crewMembers,
      analysis: 'Crew analysis performed via MCP',
      timestamp: new Date().toISOString(),
      cached: false
    };

    // Cache analysis
    this.mcpCache.storeContext(
      JSON.stringify(analysis),
      null,
      {
        sessionId: sessionId || `crew-analysis-${Date.now()}`,
        crewMembers,
        tags: ['crew-analysis', ...crewMembers]
      }
    );

    return analysis;
  }

  /**
   * Check if cache is valid
   */
  isValidCache(context, ttl) {
    const age = Date.now() - new Date(context.metadata.timestamp).getTime();
    return age < (ttl || context.ttl || 3600000);
  }

  /**
   * Sleep utility
   */
  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Get workflow statistics
   */
  getStats() {
    const cacheStats = this.mcpCache.getStats();
    return {
      cache: cacheStats,
      workflows: {
        'knowledge-ingest': 'Available',
        'milestone-push': 'Available',
        'memory-store': 'Available',
        'crew-analysis': 'Available',
        'llm-call': 'Available (with OpenRouter optimization)'
      },
      openRouter: this.openRouterOptimizer ? this.openRouterOptimizer.getStats() : null
    };
  }
}

// Singleton instance
let mcpWorkflowServiceInstance = null;

function getMCPWorkflowService() {
  if (!mcpWorkflowServiceInstance) {
    mcpWorkflowServiceInstance = new MCPWorkflowService();
  }
  return mcpWorkflowServiceInstance;
}

module.exports = { getMCPWorkflowService, MCPWorkflowService };

