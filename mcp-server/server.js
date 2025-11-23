#!/usr/bin/env node

/**
 * 🖖 MCP Remote Server
 * 
 * Express.js server providing remote access to MCP services
 * Similar architecture to n8n for consistency
 */

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

// Import MCP services
// Handle both local development and Docker deployment paths
let getMCPWorkflowService, getMCPMemoryStorage, getMCPCache, getMCPOpenRouterOptimizer, getMCPMonitoring, getMCPScheduler;

try {
  // Try Docker deployment path first (server.js at /app/mcp-server/server.js, scripts at /app/scripts)
  const workflowService = require('../scripts/utils/mcp-workflow-service');
  const memoryStorage = require('../scripts/utils/mcp-memory-storage');
  const cache = require('../scripts/utils/mcp-context-cache');
  const optimizer = require('../scripts/utils/mcp-openrouter-optimizer');
  const monitoring = require('../scripts/utils/mcp-monitoring');
  const scheduler = require('../scripts/utils/mcp-scheduler');
  
  getMCPWorkflowService = workflowService.getMCPWorkflowService;
  getMCPMemoryStorage = memoryStorage.getMCPMemoryStorage;
  getMCPCache = cache.getMCPCache;
  getMCPOpenRouterOptimizer = optimizer.getMCPOpenRouterOptimizer;
  getMCPMonitoring = monitoring.getMCPMonitoring;
  getMCPScheduler = scheduler.getMCPScheduler;
} catch (e) {
  console.error('Failed to load MCP services:', e.message);
  // Create stub functions to prevent crashes
  getMCPWorkflowService = () => ({ initialize: () => {}, executeWorkflow: async () => ({ error: 'Service not available' }) });
  getMCPMemoryStorage = () => ({ initialize: () => {}, storeMemory: async () => ({ error: 'Service not available' }), queryMemories: async () => ({ error: 'Service not available' }) });
  getMCPCache = () => ({ storeContext: () => {}, getContext: () => null });
  getMCPOpenRouterOptimizer = () => ({ initialize: () => {}, optimizeAndCall: async () => ({ error: 'Service not available' }) });
  getMCPMonitoring = () => ({ initialize: () => {}, getStats: () => ({}), getExecutionHistory: () => [] });
  getMCPScheduler = () => ({ initialize: () => {}, scheduleWorkflow: async () => ({}), getScheduledJobs: () => [] });
}

const app = express();
const PORT = process.env.MCP_PORT || 5679;
const API_KEY = process.env.MCP_API_KEY || process.env.N8N_API_KEY; // Reuse n8n key for now

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json({ limit: '10mb' }));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
});
app.use('/api/', limiter);

// API key authentication middleware
function authenticateApiKey(req, res, next) {
  const apiKey = req.headers['x-mcp-api-key'] || req.headers['authorization']?.replace('Bearer ', '');
  
  if (!API_KEY) {
    return res.status(500).json({ error: 'MCP_API_KEY not configured' });
  }
  
  if (!apiKey || apiKey !== API_KEY) {
    return res.status(401).json({ error: 'Unauthorized: Invalid API key' });
  }
  
  next();
}

// Initialize MCP services
let mcpServices = {
  workflow: null,
  memory: null,
  cache: null,
  optimizer: null,
  monitoring: null,
  scheduler: null,
};

function initializeMCPServices() {
  try {
    mcpServices.workflow = getMCPWorkflowService();
    mcpServices.workflow.initialize();
    
    mcpServices.memory = getMCPMemoryStorage();
    mcpServices.memory.initialize();
    
    mcpServices.cache = getMCPCache();
    
    mcpServices.optimizer = getMCPOpenRouterOptimizer();
    try {
      mcpServices.optimizer.initialize();
    } catch (e) {
      console.warn('OpenRouter optimizer not available');
    }
    
    mcpServices.monitoring = getMCPMonitoring();
    try {
      mcpServices.monitoring.initialize();
    } catch (e) {
      console.warn('Monitoring not available');
    }
    
    mcpServices.scheduler = getMCPScheduler();
    try {
      mcpServices.scheduler.initialize();
    } catch (e) {
      console.warn('Scheduler not available');
    }
    
    console.log('✅ MCP services initialized');
    return true;
  } catch (error) {
    console.error('❌ Failed to initialize MCP services:', error);
    return false;
  }
}

// Health check
app.get('/healthz', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// API Routes

// Workflow endpoints
app.post('/api/workflows/execute', authenticateApiKey, async (req, res) => {
  try {
    const workflow = req.body;
    const result = await mcpServices.workflow.executeWorkflow(workflow);
    res.json({ success: true, result });
  } catch (error) {
    console.error('Workflow execution error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

app.get('/api/workflows', authenticateApiKey, async (req, res) => {
  try {
    // List available workflows (placeholder)
    res.json({ workflows: [] });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Memory endpoints
app.post('/api/memory/store', authenticateApiKey, async (req, res) => {
  try {
    const memoryData = req.body;
    const result = await mcpServices.memory.storeMemory(memoryData);
    res.json({ success: true, result });
  } catch (error) {
    console.error('Memory storage error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

app.post('/api/memory/query', authenticateApiKey, async (req, res) => {
  try {
    const { query, options = {} } = req.body;
    const result = await mcpServices.memory.queryMemories(query, options);
    res.json({ success: true, result });
  } catch (error) {
    console.error('Memory query error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Context endpoints
app.post('/api/context/store', authenticateApiKey, async (req, res) => {
  try {
    const { content, embeddings, metadata } = req.body;
    const result = mcpServices.cache.storeContext(content, embeddings, metadata);
    res.json({ success: true, result });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.get('/api/context/:cacheKey', authenticateApiKey, (req, res) => {
  try {
    const { cacheKey } = req.params;
    const result = mcpServices.cache.getContext(cacheKey);
    res.json({ success: true, result });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// LLM endpoints
app.post('/api/llm/call', authenticateApiKey, async (req, res) => {
  try {
    const { prompt, options = {} } = req.body;
    const result = await mcpServices.optimizer.optimizeAndCall(prompt, options);
    res.json({ success: true, result });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Monitoring endpoints
app.get('/api/monitoring/stats', authenticateApiKey, (req, res) => {
  try {
    const stats = mcpServices.monitoring.getStats();
    res.json({ success: true, stats });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.get('/api/monitoring/history', authenticateApiKey, (req, res) => {
  try {
    const { limit = 50 } = req.query;
    const history = mcpServices.monitoring.getExecutionHistory(parseInt(limit));
    res.json({ success: true, history });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Scheduler endpoints
app.post('/api/scheduler/schedule', authenticateApiKey, async (req, res) => {
  try {
    const { workflowId, cron, parameters } = req.body;
    const scheduleId = await mcpServices.scheduler.scheduleWorkflow(workflowId, cron, parameters);
    res.json({ success: true, scheduleId });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.get('/api/scheduler/jobs', authenticateApiKey, (req, res) => {
  try {
    const jobs = mcpServices.scheduler.getScheduledJobs();
    res.json({ success: true, jobs });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Service status
app.get('/api/status', authenticateApiKey, (req, res) => {
  res.json({
    status: 'operational',
    services: {
      workflow: !!mcpServices.workflow,
      memory: !!mcpServices.memory,
      cache: !!mcpServices.cache,
      optimizer: !!mcpServices.optimizer,
      monitoring: !!mcpServices.monitoring,
      scheduler: !!mcpServices.scheduler,
    },
    timestamp: new Date().toISOString(),
  });
});

// 404 handler for undefined routes
app.use((req, res) => {
  console.warn(`404: Route not found: ${req.method} ${req.path}`);
  res.status(404).json({ 
    error: 'Route not found', 
    method: req.method,
    path: req.path,
    availableRoutes: [
      'GET /healthz',
      'GET /api/status',
      'GET /api/workflows',
      'POST /api/workflows/execute',
      'POST /api/memory/store',
      'POST /api/memory/query',
      'POST /api/context/store',
      'GET /api/context/:cacheKey',
      'POST /api/llm/call',
      'GET /api/monitoring/stats',
      'GET /api/monitoring/history',
      'POST /api/scheduler/schedule',
      'GET /api/scheduler/jobs'
    ]
  });
});

// Error handling
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).json({ error: 'Internal server error', message: err.message });
});

// Start server
if (require.main === module) {
  initializeMCPServices();
  
  app.listen(PORT, '0.0.0.0', () => {
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('🖖 MCP Remote Server');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`✅ Server running on port ${PORT}`);
    console.log(`📡 API endpoint: http://0.0.0.0:${PORT}/api`);
    console.log(`🔐 API Key required: X-MCP-API-KEY header`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
  });
}

module.exports = app;

