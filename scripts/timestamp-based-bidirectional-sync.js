#!/usr/bin/env node

/**
 * 🔄 Timestamp-Based Bi-Directional Sync System
 * 
 * Prevents infinite loops by using timestamps to determine which version is newer
 * Only syncs when one version is actually newer than the other
 */

const https = require('https');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

// Load environment variables from ~/.zshrc
function loadZshrcEnv() {
  try {
    const zshrcPath = path.join(process.env.HOME, '.zshrc');
    const zshrcContent = fs.readFileSync(zshrcPath, 'utf8');
    
    const envVars = {};
    zshrcContent.split('\n').forEach(line => {
      if (line.includes('=') && !line.startsWith('#')) {
        const cleanLine = line.replace(/^export\s+/, '');
        const [key, ...valueParts] = cleanLine.split('=');
        const value = valueParts.join('=').trim().replace(/^["']|["']$/g, '');
        if (key && value) {
          envVars[key.trim()] = value;
        }
      }
    });
    
    return envVars;
  } catch (error) {
    console.error('❌ Failed to load ~/.zshrc:', error.message);
    return {};
  }
}

const env = loadZshrcEnv();
const N8N_BASE_URL = env.N8N_BASE_URL || 'https://n8n.pbradygeorgen.com';
const N8N_API_KEY = env.N8N_API_KEY;

if (!N8N_API_KEY) {
  console.error('❌ N8N_API_KEY not found in ~/.zshrc');
  process.exit(1);
}

console.log('🔄 Timestamp-Based Bi-Directional Sync System');
console.log('============================================');
console.log('✅ Environment variables loaded from ~/.zshrc');

// Sync state tracking
let syncState = {
  localHash: null,
  remoteHash: null,
  localTimestamp: null,
  remoteTimestamp: null,
  isProcessing: false,
  lastSyncTime: null
};

// File paths
const LOCAL_WORKFLOW_PATH = '/Users/bradygeorgen/Documents/workspace/alex-ai-universal/packages/core/src/crew-workflows/quark-workflow.json';
const WORKFLOW_ID = 'L6K4bzSKlGC36ABL';

// Function to make N8N API request
function makeN8NRequest(endpoint, method = 'GET', data = null) {
  return new Promise((resolve, reject) => {
    const url = new URL(`${N8N_BASE_URL}/api/v1/${endpoint}`);
    
    const options = {
      hostname: url.hostname,
      port: 443,
      path: url.pathname + url.search,
      method: method,
      headers: {
        'Content-Type': 'application/json',
        'X-N8N-API-KEY': N8N_API_KEY
      }
    };

    const req = https.request(options, (res) => {
      let responseData = '';
      res.on('data', (chunk) => {
        responseData += chunk;
      });
      
      res.on('end', () => {
        try {
          const parsedData = responseData ? JSON.parse(responseData) : {};
          resolve({ statusCode: res.statusCode, data: parsedData });
        } catch (error) {
          resolve({ statusCode: res.statusCode, data: responseData });
        }
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    if (data) {
      req.write(JSON.stringify(data));
    }
    
    req.end();
  });
}

// Function to get file hash
function getFileHash(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    return crypto.createHash('md5').update(content).digest('hex');
  } catch (error) {
    return null;
  }
}

// Function to get file timestamp
function getFileTimestamp(filePath) {
  try {
    const stats = fs.statSync(filePath);
    return stats.mtime.getTime();
  } catch (error) {
    return null;
  }
}

// Function to get local workflow info
function getLocalWorkflowInfo() {
  const hash = getFileHash(LOCAL_WORKFLOW_PATH);
  const timestamp = getFileTimestamp(LOCAL_WORKFLOW_PATH);
  
  return {
    hash,
    timestamp,
    exists: hash !== null && timestamp !== null
  };
}

// Function to get remote workflow info
async function getRemoteWorkflowInfo() {
  try {
    const response = await makeN8NRequest(`workflows/${WORKFLOW_ID}`);
    
    if (response.statusCode === 200) {
      const workflow = response.data;
      const content = JSON.stringify(workflow, null, 2);
      const hash = crypto.createHash('md5').update(content).digest('hex');
      const timestamp = new Date(workflow.updatedAt).getTime();
      
      return {
        hash,
        timestamp,
        exists: true,
        workflow
      };
    } else {
      return { hash: null, timestamp: null, exists: false };
    }
  } catch (error) {
    console.error('❌ Failed to get remote workflow:', error.message);
    return { hash: null, timestamp: null, exists: false };
  }
}

// Function to determine which version is newer
function isLocalNewer(localTimestamp, remoteTimestamp) {
  if (!localTimestamp || !remoteTimestamp) return false;
  return localTimestamp > remoteTimestamp;
}

// Function to determine which version is newer
function isRemoteNewer(localTimestamp, remoteTimestamp) {
  if (!localTimestamp || !remoteTimestamp) return false;
  return remoteTimestamp > localTimestamp;
}

// Function to sync local to remote
async function syncLocalToRemote(localWorkflow) {
  try {
    console.log('📤 Syncing local changes to N8N...');
    
    // Remove read-only fields
    const syncData = { ...localWorkflow };
    delete syncData.id;
    delete syncData.active;
    delete syncData.tags;
    delete syncData.versionId;
    delete syncData.meta;
    delete syncData.createdAt;
    delete syncData.updatedAt;
    
    const response = await makeN8NRequest(`workflows/${WORKFLOW_ID}`, 'PUT', syncData);
    
    if (response.statusCode === 200) {
      console.log('✅ Local changes synced to N8N successfully');
      return true;
    } else {
      console.error('❌ Failed to sync local to remote:', response.statusCode);
      return false;
    }
  } catch (error) {
    console.error('❌ Error syncing local to remote:', error.message);
    return false;
  }
}

// Function to sync remote to local
async function syncRemoteToLocal(remoteWorkflow) {
  try {
    console.log('📥 Syncing remote changes to local...');
    
    // Write remote workflow to local file
    fs.writeFileSync(LOCAL_WORKFLOW_PATH, JSON.stringify(remoteWorkflow, null, 2));
    
    console.log('✅ Remote changes synced to local successfully');
    return true;
  } catch (error) {
    console.error('❌ Error syncing remote to local:', error.message);
    return false;
  }
}

// Function to perform intelligent sync
async function performIntelligentSync() {
  if (syncState.isProcessing) {
    console.log('⏳ Sync already in progress, skipping...');
    return;
  }

  syncState.isProcessing = true;

  try {
    console.log('🔍 Checking sync status...');
    
    // Get current state
    const localInfo = getLocalWorkflowInfo();
    const remoteInfo = await getRemoteWorkflowInfo();
    
    if (!localInfo.exists || !remoteInfo.exists) {
      console.log('⚠️  Local or remote workflow not found, skipping sync');
      return;
    }
    
    // Check if we need to sync
    const localNewer = isLocalNewer(localInfo.timestamp, remoteInfo.timestamp);
    const remoteNewer = isRemoteNewer(localInfo.timestamp, remoteInfo.timestamp);
    const hashesMatch = localInfo.hash === remoteInfo.hash;
    
    console.log(`📊 Sync Analysis:`);
    console.log(`   Local timestamp: ${new Date(localInfo.timestamp).toISOString()}`);
    console.log(`   Remote timestamp: ${new Date(remoteInfo.timestamp).toISOString()}`);
    console.log(`   Local newer: ${localNewer}`);
    console.log(`   Remote newer: ${remoteNewer}`);
    console.log(`   Hashes match: ${hashesMatch}`);
    
    if (hashesMatch) {
      console.log('✅ Workflows are already in sync');
      syncState.lastSyncTime = new Date().toISOString();
      return;
    }
    
    if (localNewer && !remoteNewer) {
      console.log('📤 Local is newer, syncing to remote...');
      const localWorkflow = JSON.parse(fs.readFileSync(LOCAL_WORKFLOW_PATH, 'utf8'));
      await syncLocalToRemote(localWorkflow);
    } else if (remoteNewer && !localNewer) {
      console.log('📥 Remote is newer, syncing to local...');
      await syncRemoteToLocal(remoteInfo.workflow);
    } else {
      console.log('⚠️  Timestamps are equal but hashes differ - manual resolution needed');
      console.log('   This might indicate a conflict that needs human intervention');
    }
    
    // Update sync state
    syncState.lastSyncTime = new Date().toISOString();
    
  } catch (error) {
    console.error('❌ Error during sync:', error.message);
  } finally {
    syncState.isProcessing = false;
  }
}

// Function to start file watching
function startFileWatching() {
  console.log('👀 Starting file watching...');
  
  let lastHash = null;
  
  fs.watchFile(LOCAL_WORKFLOW_PATH, { interval: 1000 }, (curr, prev) => {
    const currentHash = getFileHash(LOCAL_WORKFLOW_PATH);
    
    if (currentHash && currentHash !== lastHash) {
      console.log('📝 Local file changed, triggering sync...');
      lastHash = currentHash;
      
      // Debounce: wait 2 seconds before syncing to avoid rapid changes
      setTimeout(() => {
        performIntelligentSync();
      }, 2000);
    }
  });
  
  console.log('✅ File watching started');
}

// Function to start N8N polling
function startN8NPolling(intervalSeconds = 10) {
  console.log(`🔄 Starting N8N polling (every ${intervalSeconds} seconds)...`);
  
  setInterval(async () => {
    await performIntelligentSync();
  }, intervalSeconds * 1000);
  
  console.log('✅ N8N polling started');
}

// Function to show sync status
async function showSyncStatus() {
  console.log('📊 Sync Status Report');
  console.log('====================');
  
  const localInfo = getLocalWorkflowInfo();
  const remoteInfo = await getRemoteWorkflowInfo();
  
  console.log(`📄 Local workflow:`);
  console.log(`   Path: ${LOCAL_WORKFLOW_PATH}`);
  console.log(`   Exists: ${localInfo.exists}`);
  console.log(`   Hash: ${localInfo.hash ? localInfo.hash.substring(0, 8) + '...' : 'N/A'}`);
  console.log(`   Timestamp: ${localInfo.timestamp ? new Date(localInfo.timestamp).toISOString() : 'N/A'}`);
  
  console.log(`🌐 Remote workflow:`);
  console.log(`   ID: ${WORKFLOW_ID}`);
  console.log(`   Exists: ${remoteInfo.exists}`);
  console.log(`   Hash: ${remoteInfo.hash ? remoteInfo.hash.substring(0, 8) + '...' : 'N/A'}`);
  console.log(`   Timestamp: ${remoteInfo.timestamp ? new Date(remoteInfo.timestamp).toISOString() : 'N/A'}`);
  
  if (localInfo.exists && remoteInfo.exists) {
    const localNewer = isLocalNewer(localInfo.timestamp, remoteInfo.timestamp);
    const remoteNewer = isRemoteNewer(localInfo.timestamp, remoteInfo.timestamp);
    const hashesMatch = localInfo.hash === remoteInfo.hash;
    
    console.log(`🔄 Sync Analysis:`);
    console.log(`   Local newer: ${localNewer}`);
    console.log(`   Remote newer: ${remoteNewer}`);
    console.log(`   In sync: ${hashesMatch}`);
    console.log(`   Needs sync: ${!hashesMatch}`);
  }
  
  console.log(`⏰ Last sync: ${syncState.lastSyncTime || 'Never'}`);
  console.log(`🔄 Processing: ${syncState.isProcessing}`);
}

// Main execution
async function main() {
  const args = process.argv.slice(2);
  
  if (args.includes('--status')) {
    await showSyncStatus();
    return;
  }
  
  if (args.includes('--sync')) {
    await performIntelligentSync();
    return;
  }
  
  console.log('🚀 Starting Timestamp-Based Bi-Directional Sync System');
  console.log('======================================================');
  console.log('This system prevents infinite loops by using timestamps');
  console.log('to determine which version is actually newer.');
  console.log('');
  console.log('🎯 Features:');
  console.log('  • Timestamp-based conflict resolution');
  console.log('  • Intelligent sync direction detection');
  console.log('  • Debounced file watching');
  console.log('  • No infinite loops');
  console.log('');
  console.log('📝 Commands:');
  console.log('  --status  Show current sync status');
  console.log('  --sync    Perform one-time sync');
  console.log('  (no args) Start continuous sync');
  console.log('');
  
  // Start the sync system
  startFileWatching();
  startN8NPolling(10);
  
  console.log('✅ Timestamp-Based Bi-Directional Sync System Running!');
  console.log('======================================================');
  console.log('🔄 Press Ctrl+C to stop the system');
  
  // Handle graceful shutdown
  process.on('SIGINT', () => {
    console.log('\n🛑 Shutting down sync system...');
    process.exit(0);
  });
}

// Run the system
main().catch(console.error);
