#!/usr/bin/env node

/**
 * 🔴 ALEX AI REAL-TIME MONITORING SYSTEM
 * 
 * This script provides continuous monitoring and synchronization of:
 * - N8N instance at n8n.pbradygeorgen.com
 * - All Alex AI instances
 * - Supabase RAG memory system
 * - Workflow consistency and health
 * 
 * Features:
 * - Real-time monitoring dashboard
 * - Automatic conflict resolution
 * - Health status alerts
 * - Performance metrics
 * - Continuous synchronization
 */

const fs = require('fs');
const path = require('path');
const https = require('https');
const { execSync } = require('child_process');

// Load environment variables from ~/.zshrc
function loadZshrcEnv() {
  try {
    const zshrcPath = path.join(process.env.HOME, '.zshrc');
    const zshrcContent = fs.readFileSync(zshrcPath, 'utf8');
    
    const envVars = {};
    zshrcContent.split('\n').forEach(line => {
      if (line.includes('=') && !line.startsWith('#')) {
        const [key, ...valueParts] = line.split('=');
        let value = valueParts.join('=');
        
        // Remove export keyword if present
        const cleanKey = key.replace(/^export\s+/, '').trim();
        
        // Remove quotes if present
        if ((value.startsWith('"') && value.endsWith('"')) || 
            (value.startsWith("'") && value.endsWith("'"))) {
          value = value.slice(1, -1);
        }
        
        envVars[cleanKey] = value;
      }
    });
    
    return envVars;
  } catch (error) {
    console.error('❌ Failed to load ~/.zshrc:', error.message);
    return {};
  }
}

const env = loadZshrcEnv();
const N8N_API_KEY = env.N8N_API_KEY;
const N8N_BASE_URL = env.N8N_BASE_URL || 'https://n8n.pbradygeorgen.com';
const SUPABASE_URL = env.SUPABASE_URL;
const SUPABASE_ANON_KEY = env.SUPABASE_ANON_KEY;

if (!N8N_API_KEY) {
  console.error('❌ N8N_API_KEY not found in ~/.zshrc');
  process.exit(1);
}

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.error('❌ Supabase credentials not found in ~/.zshrc');
  process.exit(1);
}

console.log('🔴 ALEX AI REAL-TIME MONITORING SYSTEM');
console.log('=======================================');
console.log('');

// Configuration
const CONFIG = {
  n8nBaseUrl: N8N_BASE_URL,
  apiKey: N8N_API_KEY,
  supabaseUrl: SUPABASE_URL,
  supabaseKey: SUPABASE_ANON_KEY,
  localWorkflowsDir: path.join(__dirname, '..', 'packages', 'core', 'src'),
  monitorInterval: 5000, // 5 seconds
  syncInterval: 30000, // 30 seconds
  maxRetries: 3,
  timeout: 10000
};

// Monitoring state
let monitoringState = {
  isRunning: false,
  startTime: null,
  lastSync: null,
  healthStatus: {
    n8n: 'unknown',
    rag: 'unknown',
    localWorkflows: 0,
    overall: 'unknown'
  },
  metrics: {
    totalSyncs: 0,
    successfulSyncs: 0,
    failedSyncs: 0,
    averageSyncTime: 0,
    lastError: null
  },
  alerts: []
};

// Utility functions
function makeN8NRequest(endpoint, method = 'GET', data = null) {
  return new Promise((resolve, reject) => {
    const url = new URL(endpoint, CONFIG.n8nBaseUrl);
    const options = {
      hostname: url.hostname,
      port: url.port || 443,
      path: url.pathname + url.search,
      method: method,
      headers: {
        'X-N8N-API-KEY': CONFIG.apiKey,
        'Content-Type': 'application/json'
      },
      timeout: CONFIG.timeout
    };

    if (data) {
      const postData = JSON.stringify(data);
      options.headers['Content-Length'] = Buffer.byteLength(postData);
    }

    const req = https.request(options, (res) => {
      let responseData = '';
      res.on('data', (chunk) => {
        responseData += chunk;
      });
      res.on('end', () => {
        try {
          const parsed = JSON.parse(responseData);
          resolve({ status: res.statusCode, data: parsed });
        } catch (error) {
          resolve({ status: res.statusCode, data: responseData });
        }
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    req.on('timeout', () => {
      req.destroy();
      reject(new Error('Request timeout'));
    });

    if (data) {
      req.write(JSON.stringify(data));
    }
    req.end();
  });
}

function makeSupabaseRequest(endpoint, method = 'GET', data = null) {
  return new Promise((resolve, reject) => {
    const url = new URL(endpoint, CONFIG.supabaseUrl);
    const options = {
      hostname: url.hostname,
      port: url.port || 443,
      path: url.pathname + url.search,
      method: method,
      headers: {
        'apikey': CONFIG.supabaseKey,
        'Authorization': `Bearer ${CONFIG.supabaseKey}`,
        'Content-Type': 'application/json'
      },
      timeout: CONFIG.timeout
    };

    if (data) {
      const postData = JSON.stringify(data);
      options.headers['Content-Length'] = Buffer.byteLength(postData);
    }

    const req = https.request(options, (res) => {
      let responseData = '';
      res.on('data', (chunk) => {
        responseData += chunk;
      });
      res.on('end', () => {
        try {
          const parsed = JSON.parse(responseData);
          resolve({ status: res.statusCode, data: parsed });
        } catch (error) {
          resolve({ status: res.statusCode, data: responseData });
        }
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    req.on('timeout', () => {
      req.destroy();
      reject(new Error('Request timeout'));
    });

    if (data) {
      req.write(JSON.stringify(data));
    }
    req.end();
  });
}

// Core monitoring functions
async function checkN8NHealth() {
  try {
    const { status, data } = await makeN8NRequest('/api/v1/workflows');
    return {
      status: status === 200 ? 'healthy' : 'unhealthy',
      responseTime: Date.now(),
      workflowCount: Array.isArray(data) ? data.length : 0,
      error: status !== 200 ? `HTTP ${status}` : null
    };
  } catch (error) {
    return {
      status: 'unhealthy',
      responseTime: Date.now(),
      workflowCount: 0,
      error: error.message
    };
  }
}

async function checkRAGHealth() {
  try {
    const { status, data } = await makeSupabaseRequest('/rest/v1/crew_memories?select=count');
    return {
      status: status === 200 ? 'healthy' : 'unhealthy',
      responseTime: Date.now(),
      memoryCount: data?.length || 0,
      error: status !== 200 ? `HTTP ${status}` : null
    };
  } catch (error) {
    return {
      status: 'unhealthy',
      responseTime: Date.now(),
      memoryCount: 0,
      error: error.message
    };
  }
}

function checkLocalWorkflows() {
  try {
    const crewWorkflowsDir = path.join(CONFIG.localWorkflowsDir, 'crew-workflows');
    if (!fs.existsSync(crewWorkflowsDir)) {
      return {
        status: 'unhealthy',
        workflowCount: 0,
        error: 'Local workflows directory not found'
      };
    }
    
    const workflows = fs.readdirSync(crewWorkflowsDir).filter(f => f.endsWith('.json'));
    return {
      status: 'healthy',
      workflowCount: workflows.length,
      error: null
    };
  } catch (error) {
    return {
      status: 'unhealthy',
      workflowCount: 0,
      error: error.message
    };
  }
}

async function performHealthCheck() {
  const startTime = Date.now();
  
  console.log('🏥 Performing health check...');
  
  // Check all systems in parallel
  const [n8nHealth, ragHealth, localHealth] = await Promise.all([
    checkN8NHealth(),
    checkRAGHealth(),
    checkLocalWorkflows()
  ]);
  
  const checkTime = Date.now() - startTime;
  
  // Update monitoring state
  monitoringState.healthStatus = {
    n8n: n8nHealth.status,
    rag: ragHealth.status,
    localWorkflows: localHealth.workflowCount,
    overall: (n8nHealth.status === 'healthy' && ragHealth.status === 'healthy' && localHealth.status === 'healthy') ? 'healthy' : 'degraded'
  };
  
  // Log health status
  console.log(`  📊 N8N: ${n8nHealth.status} (${n8nHealth.workflowCount} workflows)`);
  console.log(`  📊 RAG: ${ragHealth.status} (${ragHealth.memoryCount} memories)`);
  console.log(`  📊 Local: ${localHealth.status} (${localHealth.workflowCount} workflows)`);
  console.log(`  📊 Overall: ${monitoringState.healthStatus.overall}`);
  console.log(`  ⏱️  Check time: ${checkTime}ms`);
  
  // Check for alerts
  if (n8nHealth.error) {
    addAlert('N8N_ERROR', `N8N health check failed: ${n8nHealth.error}`);
  }
  
  if (ragHealth.error) {
    addAlert('RAG_ERROR', `RAG health check failed: ${ragHealth.error}`);
  }
  
  if (localHealth.error) {
    addAlert('LOCAL_ERROR', `Local workflows check failed: ${localHealth.error}`);
  }
  
  return monitoringState.healthStatus;
}

function addAlert(type, message) {
  const alert = {
    id: Date.now(),
    type: type,
    message: message,
    timestamp: new Date().toISOString(),
    resolved: false
  };
  
  monitoringState.alerts.push(alert);
  
  // Keep only last 100 alerts
  if (monitoringState.alerts.length > 100) {
    monitoringState.alerts = monitoringState.alerts.slice(-100);
  }
  
  console.log(`🚨 ALERT [${type}]: ${message}`);
}

async function performSync() {
  const startTime = Date.now();
  
  try {
    console.log('🔄 Performing synchronization...');
    
    // Import the comprehensive sync function
    const { startComprehensiveSync } = require('./comprehensive-alex-ai-sync.js');
    
    await startComprehensiveSync();
    
    const syncTime = Date.now() - startTime;
    
    // Update metrics
    monitoringState.metrics.totalSyncs++;
    monitoringState.metrics.successfulSyncs++;
    monitoringState.metrics.averageSyncTime = 
      (monitoringState.metrics.averageSyncTime * (monitoringState.metrics.totalSyncs - 1) + syncTime) / 
      monitoringState.metrics.totalSyncs;
    
    monitoringState.lastSync = new Date().toISOString();
    
    console.log(`✅ Sync completed in ${syncTime}ms`);
    
  } catch (error) {
    const syncTime = Date.now() - startTime;
    
    // Update metrics
    monitoringState.metrics.totalSyncs++;
    monitoringState.metrics.failedSyncs++;
    monitoringState.metrics.lastError = error.message;
    
    addAlert('SYNC_ERROR', `Synchronization failed: ${error.message}`);
    
    console.error(`❌ Sync failed in ${syncTime}ms:`, error.message);
  }
}

function displayDashboard() {
  // Clear screen
  process.stdout.write('\x1B[2J\x1B[0f');
  
  console.log('🔴 ALEX AI REAL-TIME MONITORING DASHBOARD');
  console.log('==========================================');
  console.log('');
  
  // System status
  console.log('📊 SYSTEM STATUS:');
  console.log(`  N8N: ${monitoringState.healthStatus.n8n}`);
  console.log(`  RAG: ${monitoringState.healthStatus.rag}`);
  console.log(`  Local Workflows: ${monitoringState.healthStatus.localWorkflows}`);
  console.log(`  Overall: ${monitoringState.healthStatus.overall}`);
  console.log('');
  
  // Metrics
  console.log('📈 METRICS:');
  console.log(`  Total Syncs: ${monitoringState.metrics.totalSyncs}`);
  console.log(`  Successful: ${monitoringState.metrics.successfulSyncs}`);
  console.log(`  Failed: ${monitoringState.metrics.failedSyncs}`);
  console.log(`  Success Rate: ${monitoringState.metrics.totalSyncs > 0 ? 
    ((monitoringState.metrics.successfulSyncs / monitoringState.metrics.totalSyncs) * 100).toFixed(1) : 0}%`);
  console.log(`  Average Sync Time: ${monitoringState.metrics.averageSyncTime.toFixed(0)}ms`);
  console.log('');
  
  // Recent alerts
  const recentAlerts = monitoringState.alerts.slice(-5);
  if (recentAlerts.length > 0) {
    console.log('🚨 RECENT ALERTS:');
    recentAlerts.forEach(alert => {
      console.log(`  [${alert.type}] ${alert.message}`);
    });
    console.log('');
  }
  
  // Uptime
  if (monitoringState.startTime) {
    const uptime = Date.now() - monitoringState.startTime;
    const uptimeMinutes = Math.floor(uptime / 60000);
    const uptimeSeconds = Math.floor((uptime % 60000) / 1000);
    console.log(`⏱️  UPTIME: ${uptimeMinutes}m ${uptimeSeconds}s`);
  }
  
  console.log('');
  console.log('Press Ctrl+C to stop monitoring');
  console.log('==========================================');
}

async function startMonitoring() {
  console.log('🚀 Starting real-time monitoring...');
  console.log('');
  
  monitoringState.isRunning = true;
  monitoringState.startTime = Date.now();
  
  // Initial health check
  await performHealthCheck();
  
  // Initial sync
  await performSync();
  
  // Start monitoring loop
  const monitorInterval = setInterval(async () => {
    try {
      await performHealthCheck();
    } catch (error) {
      console.error('❌ Health check failed:', error.message);
    }
  }, CONFIG.monitorInterval);
  
  // Start sync loop
  const syncInterval = setInterval(async () => {
    try {
      await performSync();
    } catch (error) {
      console.error('❌ Sync failed:', error.message);
    }
  }, CONFIG.syncInterval);
  
  // Start dashboard updates
  const dashboardInterval = setInterval(() => {
    displayDashboard();
  }, 2000);
  
  // Handle shutdown
  process.on('SIGINT', () => {
    console.log('\n🛑 Stopping monitoring...');
    
    clearInterval(monitorInterval);
    clearInterval(syncInterval);
    clearInterval(dashboardInterval);
    
    monitoringState.isRunning = false;
    
    console.log('✅ Monitoring stopped');
    process.exit(0);
  });
  
  // Keep the process running
  process.on('uncaughtException', (error) => {
    console.error('❌ Uncaught exception:', error.message);
    addAlert('SYSTEM_ERROR', `Uncaught exception: ${error.message}`);
  });
  
  process.on('unhandledRejection', (reason, promise) => {
    console.error('❌ Unhandled rejection:', reason);
    addAlert('SYSTEM_ERROR', `Unhandled rejection: ${reason}`);
  });
}

// Main execution
if (require.main === module) {
  startMonitoring().catch(console.error);
}

module.exports = {
  startMonitoring,
  performHealthCheck,
  performSync,
  monitoringState
};
