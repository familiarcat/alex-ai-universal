#!/usr/bin/env node

/**
 * 🎯 MASTER ALEX AI SYNCHRONIZATION ORCHESTRATOR
 * 
 * This script orchestrates all synchronization systems:
 * - Comprehensive system sync
 * - Secure memory synchronization
 * - Real-time monitoring
 * - Health validation
 * - Conflict resolution
 * 
 * Features:
 * - Centralized orchestration
 * - Intelligent scheduling
 * - Error handling and recovery
 * - Performance optimization
 * - Status reporting
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🎯 MASTER ALEX AI SYNCHRONIZATION ORCHESTRATOR');
console.log('==============================================');
console.log('');

// Configuration
const CONFIG = {
  scriptsDir: path.join(__dirname),
  syncInterval: 30000, // 30 seconds
  memorySyncInterval: 60000, // 1 minute
  healthCheckInterval: 10000, // 10 seconds
  maxRetries: 3,
  timeout: 300000 // 5 minutes
};

// Orchestration state
let orchestrationState = {
  isRunning: false,
  startTime: null,
  lastSync: null,
  lastMemorySync: null,
  lastHealthCheck: null,
  systems: {
    comprehensive: { status: 'unknown', lastRun: null, errors: 0 },
    memory: { status: 'unknown', lastRun: null, errors: 0 },
    monitoring: { status: 'unknown', lastRun: null, errors: 0 }
  },
  metrics: {
    totalSyncs: 0,
    successfulSyncs: 0,
    failedSyncs: 0,
    averageSyncTime: 0,
    lastError: null
  }
};

// Utility functions
function runScript(scriptPath, timeout = CONFIG.timeout) {
  return new Promise((resolve, reject) => {
    const startTime = Date.now();
    
    try {
      console.log(`🔄 Running: ${path.basename(scriptPath)}`);
      
      const result = execSync(`node "${scriptPath}"`, {
        timeout: timeout,
        encoding: 'utf8',
        stdio: 'pipe'
      });
      
      const runTime = Date.now() - startTime;
      console.log(`✅ Completed in ${runTime}ms`);
      
      resolve({
        success: true,
        output: result,
        runTime: runTime,
        error: null
      });
      
    } catch (error) {
      const runTime = Date.now() - startTime;
      console.error(`❌ Failed in ${runTime}ms:`, error.message);
      
      resolve({
        success: false,
        output: error.stdout || '',
        runTime: runTime,
        error: error.message
      });
    }
  });
}

async function runComprehensiveSync() {
  const scriptPath = path.join(CONFIG.scriptsDir, 'comprehensive-alex-ai-sync.js');
  
  try {
    const result = await runScript(scriptPath);
    
    orchestrationState.systems.comprehensive = {
      status: result.success ? 'healthy' : 'unhealthy',
      lastRun: new Date().toISOString(),
      errors: result.success ? 0 : orchestrationState.systems.comprehensive.errors + 1
    };
    
    return result;
    
  } catch (error) {
    orchestrationState.systems.comprehensive = {
      status: 'unhealthy',
      lastRun: new Date().toISOString(),
      errors: orchestrationState.systems.comprehensive.errors + 1
    };
    
    return {
      success: false,
      output: '',
      runTime: 0,
      error: error.message
    };
  }
}

async function runMemorySync() {
  const scriptPath = path.join(CONFIG.scriptsDir, 'secure-memory-sync.js');
  
  try {
    const result = await runScript(scriptPath);
    
    orchestrationState.systems.memory = {
      status: result.success ? 'healthy' : 'unhealthy',
      lastRun: new Date().toISOString(),
      errors: result.success ? 0 : orchestrationState.systems.memory.errors + 1
    };
    
    return result;
    
  } catch (error) {
    orchestrationState.systems.memory = {
      status: 'unhealthy',
      lastRun: new Date().toISOString(),
      errors: orchestrationState.systems.memory.errors + 1
    };
    
    return {
      success: false,
      output: '',
      runTime: 0,
      error: error.message
    };
  }
}

async function runHealthCheck() {
  const scriptPath = path.join(CONFIG.scriptsDir, 'alex-ai-realtime-monitor.js');
  
  try {
    // Run a quick health check (not the full monitoring)
    const result = await runScript(scriptPath, 30000); // 30 second timeout
    
    orchestrationState.systems.monitoring = {
      status: result.success ? 'healthy' : 'unhealthy',
      lastRun: new Date().toISOString(),
      errors: result.success ? 0 : orchestrationState.systems.monitoring.errors + 1
    };
    
    return result;
    
  } catch (error) {
    orchestrationState.systems.monitoring = {
      status: 'unhealthy',
      lastRun: new Date().toISOString(),
      errors: orchestrationState.systems.monitoring.errors + 1
    };
    
    return {
      success: false,
      output: '',
      runTime: 0,
      error: error.message
    };
  }
}

function displayOrchestrationStatus() {
  // Clear screen
  process.stdout.write('\x1B[2J\x1B[0f');
  
  console.log('🎯 MASTER ALEX AI SYNCHRONIZATION ORCHESTRATOR');
  console.log('==============================================');
  console.log('');
  
  // System status
  console.log('📊 SYSTEM STATUS:');
  Object.entries(orchestrationState.systems).forEach(([system, status]) => {
    const statusIcon = status.status === 'healthy' ? '✅' : 
                      status.status === 'unhealthy' ? '❌' : '⚠️';
    console.log(`  ${system.toUpperCase()}: ${statusIcon} ${status.status}`);
    console.log(`    Last Run: ${status.lastRun || 'Never'}`);
    console.log(`    Errors: ${status.errors}`);
  });
  console.log('');
  
  // Metrics
  console.log('📈 METRICS:');
  console.log(`  Total Syncs: ${orchestrationState.metrics.totalSyncs}`);
  console.log(`  Successful: ${orchestrationState.metrics.successfulSyncs}`);
  console.log(`  Failed: ${orchestrationState.metrics.failedSyncs}`);
  console.log(`  Success Rate: ${orchestrationState.metrics.totalSyncs > 0 ? 
    ((orchestrationState.metrics.successfulSyncs / orchestrationState.metrics.totalSyncs) * 100).toFixed(1) : 0}%`);
  console.log(`  Average Sync Time: ${orchestrationState.metrics.averageSyncTime.toFixed(0)}ms`);
  console.log('');
  
  // Last sync info
  if (orchestrationState.lastSync) {
    console.log(`🔄 Last Sync: ${orchestrationState.lastSync}`);
  }
  if (orchestrationState.lastMemorySync) {
    console.log(`💾 Last Memory Sync: ${orchestrationState.lastMemorySync}`);
  }
  if (orchestrationState.lastHealthCheck) {
    console.log(`🏥 Last Health Check: ${orchestrationState.lastHealthCheck}`);
  }
  console.log('');
  
  // Uptime
  if (orchestrationState.startTime) {
    const uptime = Date.now() - orchestrationState.startTime;
    const uptimeMinutes = Math.floor(uptime / 60000);
    const uptimeSeconds = Math.floor((uptime % 60000) / 1000);
    console.log(`⏱️  UPTIME: ${uptimeMinutes}m ${uptimeSeconds}s`);
  }
  
  console.log('');
  console.log('Press Ctrl+C to stop orchestration');
  console.log('==============================================');
}

async function performFullSync() {
  const startTime = Date.now();
  
  try {
    console.log('🚀 Performing full synchronization...');
    console.log('');
    
    // Step 1: Comprehensive sync
    console.log('📊 Step 1: Comprehensive System Sync');
    const comprehensiveResult = await runComprehensiveSync();
    console.log('');
    
    // Step 2: Memory sync
    console.log('💾 Step 2: Secure Memory Sync');
    const memoryResult = await runMemorySync();
    console.log('');
    
    // Step 3: Health check
    console.log('🏥 Step 3: Health Check');
    const healthResult = await runHealthCheck();
    console.log('');
    
    const totalTime = Date.now() - startTime;
    
    // Update metrics
    orchestrationState.metrics.totalSyncs++;
    
    const allSuccessful = comprehensiveResult.success && memoryResult.success && healthResult.success;
    if (allSuccessful) {
      orchestrationState.metrics.successfulSyncs++;
    } else {
      orchestrationState.metrics.failedSyncs++;
    }
    
    orchestrationState.metrics.averageSyncTime = 
      (orchestrationState.metrics.averageSyncTime * (orchestrationState.metrics.totalSyncs - 1) + totalTime) / 
      orchestrationState.metrics.totalSyncs;
    
    orchestrationState.lastSync = new Date().toISOString();
    
    console.log('🎉 FULL SYNCHRONIZATION COMPLETED!');
    console.log('==================================');
    console.log(`📊 Comprehensive Sync: ${comprehensiveResult.success ? '✅' : '❌'}`);
    console.log(`💾 Memory Sync: ${memoryResult.success ? '✅' : '❌'}`);
    console.log(`🏥 Health Check: ${healthResult.success ? '✅' : '❌'}`);
    console.log(`⏱️  Total Time: ${totalTime}ms`);
    console.log(`📈 Overall Status: ${allSuccessful ? '✅ SUCCESS' : '❌ PARTIAL FAILURE'}`);
    console.log('');
    
    return allSuccessful;
    
  } catch (error) {
    const totalTime = Date.now() - startTime;
    
    orchestrationState.metrics.totalSyncs++;
    orchestrationState.metrics.failedSyncs++;
    orchestrationState.metrics.lastError = error.message;
    
    console.error(`❌ Full sync failed in ${totalTime}ms:`, error.message);
    
    return false;
  }
}

async function startOrchestration() {
  console.log('🚀 Starting master orchestration...');
  console.log('');
  
  orchestrationState.isRunning = true;
  orchestrationState.startTime = Date.now();
  
  // Initial full sync
  await performFullSync();
  
  // Start orchestration loops
  const syncInterval = setInterval(async () => {
    try {
      await performFullSync();
    } catch (error) {
      console.error('❌ Sync failed:', error.message);
    }
  }, CONFIG.syncInterval);
  
  const memorySyncInterval = setInterval(async () => {
    try {
      console.log('💾 Running memory sync...');
      const result = await runMemorySync();
      orchestrationState.lastMemorySync = new Date().toISOString();
      console.log(`💾 Memory sync ${result.success ? 'completed' : 'failed'}`);
    } catch (error) {
      console.error('❌ Memory sync failed:', error.message);
    }
  }, CONFIG.memorySyncInterval);
  
  const healthCheckInterval = setInterval(async () => {
    try {
      console.log('🏥 Running health check...');
      const result = await runHealthCheck();
      orchestrationState.lastHealthCheck = new Date().toISOString();
      console.log(`🏥 Health check ${result.success ? 'completed' : 'failed'}`);
    } catch (error) {
      console.error('❌ Health check failed:', error.message);
    }
  }, CONFIG.healthCheckInterval);
  
  // Start dashboard updates
  const dashboardInterval = setInterval(() => {
    displayOrchestrationStatus();
  }, 5000);
  
  // Handle shutdown
  process.on('SIGINT', () => {
    console.log('\n🛑 Stopping orchestration...');
    
    clearInterval(syncInterval);
    clearInterval(memorySyncInterval);
    clearInterval(healthCheckInterval);
    clearInterval(dashboardInterval);
    
    orchestrationState.isRunning = false;
    
    console.log('✅ Orchestration stopped');
    process.exit(0);
  });
  
  // Keep the process running
  process.on('uncaughtException', (error) => {
    console.error('❌ Uncaught exception:', error.message);
  });
  
  process.on('unhandledRejection', (reason, promise) => {
    console.error('❌ Unhandled rejection:', reason);
  });
}

// Main execution
if (require.main === module) {
  startOrchestration().catch(console.error);
}

module.exports = {
  startOrchestration,
  performFullSync,
  runComprehensiveSync,
  runMemorySync,
  runHealthCheck,
  orchestrationState
};
