#!/usr/bin/env node

/**
 * N8N Bidirectional Sync System
 * 
 * This script provides automated bidirectional synchronization between
 * local N8N workflow files and the remote N8N instance, ensuring
 * perfect 1:1 relationship at all times.
 */

const fs = require('fs');
const path = require('path');
const os = require('os');
const chokidar = require('chokidar');

class N8NBidirectionalSync {
  constructor() {
    this.secrets = {};
    this.remoteWorkflows = [];
    this.localWorkflows = [];
    this.syncConfig = {
      watchMode: false,
      autoSync: true,
      conflictResolution: 'remote-wins', // 'remote-wins', 'local-wins', 'prompt'
      backupBeforeSync: true,
      syncInterval: 30000, // 30 seconds
      retryAttempts: 3,
      retryDelay: 5000 // 5 seconds
    };
    this.syncReport = {
      timestamp: new Date().toISOString(),
      totalSyncs: 0,
      successfulSyncs: 0,
      failedSyncs: 0,
      conflictsResolved: 0,
      workflowsCreated: 0,
      workflowsUpdated: 0,
      workflowsDeleted: 0
    };
  }

  async initialize(options = {}) {
    console.log('🔄 N8N Bidirectional Sync System');
    console.log('=================================\n');

    try {
      // Merge options with default config
      this.syncConfig = { ...this.syncConfig, ...options };
      
      // Step 1: Load secrets and validate
      await this.loadSecretsFromZshrc();
      
      // Step 2: Initial sync
      await this.performInitialSync();
      
      // Step 3: Set up monitoring based on mode
      if (this.syncConfig.watchMode) {
        await this.setupFileWatcher();
        console.log('👀 File watcher started. Press Ctrl+C to stop.');
      } else {
        await this.setupScheduledSync();
        console.log('⏰ Scheduled sync started. Press Ctrl+C to stop.');
      }
      
    } catch (error) {
      console.error('❌ Sync system failed:', error.message);
      process.exit(1);
    }
  }

  async loadSecretsFromZshrc() {
    console.log('🔐 Loading N8N credentials...');
    
    const zshrcPath = path.join(os.homedir(), '.zshrc');
    
    if (!fs.existsSync(zshrcPath)) {
      throw new Error('~/.zshrc file not found');
    }

    const content = fs.readFileSync(zshrcPath, 'utf8');
    
    // Extract N8N environment variables
    const envVarRegex = /export\s+([A-Z0-9_]+)=["']?([^"'\n]+)["']?/g;
    let match;
    
    while ((match = envVarRegex.exec(content)) !== null) {
      const [, key, value] = match;
      const cleanValue = value.replace(/^["']|["']$/g, '').trim();
      this.secrets[key] = cleanValue;
    }

    // Validate required N8N credentials
    if (!this.secrets.N8N_API_URL || !this.secrets.N8N_API_KEY) {
      throw new Error('N8N API credentials not found in ~/.zshrc');
    }

    console.log('✅ N8N credentials loaded successfully');
  }

  async performInitialSync() {
    console.log('\n🔄 Performing initial sync...');
    
    try {
      // Fetch remote workflows
      await this.fetchRemoteWorkflows();
      
      // Load local workflows
      await this.loadLocalWorkflows();
      
      // Perform bidirectional sync
      await this.syncWorkflows();
      
      console.log('✅ Initial sync completed successfully');
      
    } catch (error) {
      console.error('❌ Initial sync failed:', error.message);
      throw error;
    }
  }

  async fetchRemoteWorkflows() {
    console.log('🌐 Fetching remote workflows...');
    
    try {
      const response = await fetch(`${this.secrets.N8N_API_URL}/workflows`, {
        headers: {
          'X-N8N-API-KEY': this.secrets.N8N_API_KEY,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`N8N API request failed: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      this.remoteWorkflows = Array.isArray(data) ? data : (data.data || []);
      
      console.log(`✅ Fetched ${this.remoteWorkflows.length} remote workflows`);
      
    } catch (error) {
      console.error('❌ Failed to fetch remote workflows:', error.message);
      throw error;
    }
  }

  async loadLocalWorkflows() {
    console.log('📁 Loading local workflows...');
    
    const workflowsDir = path.join(__dirname, 'n8n-workflows');
    this.localWorkflows = [];
    
    if (!fs.existsSync(workflowsDir)) {
      console.log('⚠️  No local workflows directory found');
      return;
    }

    // Recursively find all JSON files
    const findWorkflows = (dir) => {
      const items = fs.readdirSync(dir);
      
      for (const item of items) {
        const itemPath = path.join(dir, item);
        const stat = fs.statSync(itemPath);
        
        if (stat.isDirectory()) {
          findWorkflows(itemPath);
        } else if (item.endsWith('.json')) {
          try {
            const content = fs.readFileSync(itemPath, 'utf8');
            const workflow = JSON.parse(content);
            
            // Add local metadata
            workflow._localPath = itemPath;
            workflow._localModified = stat.mtime;
            workflow._localCategory = path.relative(workflowsDir, dir);
            
            this.localWorkflows.push(workflow);
          } catch (error) {
            console.log(`⚠️  Failed to parse ${itemPath}: ${error.message}`);
          }
        }
      }
    };

    findWorkflows(workflowsDir);
    console.log(`✅ Loaded ${this.localWorkflows.length} local workflows`);
  }

  async syncWorkflows() {
    console.log('🔄 Synchronizing workflows...');
    
    // Create maps for easier comparison
    const remoteMap = new Map();
    const localMap = new Map();
    
    // Index remote workflows by name
    this.remoteWorkflows.forEach(workflow => {
      remoteMap.set(workflow.name, workflow);
    });
    
    // Index local workflows by name
    this.localWorkflows.forEach(workflow => {
      const name = workflow.name || path.basename(workflow._localPath, '.json');
      localMap.set(name, workflow);
    });

    // Sync remote to local (download missing/updated workflows)
    await this.syncRemoteToLocal(remoteMap, localMap);
    
    // Sync local to remote (upload missing/updated workflows)
    await this.syncLocalToRemote(localMap, remoteMap);
    
    console.log('✅ Workflow synchronization completed');
  }

  async syncRemoteToLocal(remoteMap, localMap) {
    console.log('📥 Syncing remote to local...');
    
    for (const [name, remoteWorkflow] of remoteMap) {
      const localWorkflow = localMap.get(name);
      
      if (!localWorkflow) {
        // Workflow doesn't exist locally - download it
        await this.downloadWorkflow(remoteWorkflow);
        this.syncReport.workflowsCreated++;
      } else {
        // Workflow exists - check if it needs updating
        const needsUpdate = this.workflowNeedsUpdate(remoteWorkflow, localWorkflow);
        if (needsUpdate) {
          await this.updateLocalWorkflow(remoteWorkflow, localWorkflow);
          this.syncReport.workflowsUpdated++;
        }
      }
    }
  }

  async syncLocalToRemote(localMap, remoteMap) {
    console.log('📤 Syncing local to remote...');
    
    for (const [name, localWorkflow] of localMap) {
      const remoteWorkflow = remoteMap.get(name);
      
      if (!remoteWorkflow) {
        // Workflow doesn't exist remotely - upload it
        await this.uploadWorkflow(localWorkflow);
        this.syncReport.workflowsCreated++;
      } else {
        // Workflow exists - check if it needs updating
        const needsUpdate = this.workflowNeedsUpdate(localWorkflow, remoteWorkflow);
        if (needsUpdate) {
          await this.updateRemoteWorkflow(localWorkflow, remoteWorkflow);
          this.syncReport.workflowsUpdated++;
        }
      }
    }
  }

  workflowNeedsUpdate(source, target) {
    // Compare key fields that matter for sync
    const sourceJson = JSON.stringify({
      name: source.name,
      nodes: source.nodes,
      connections: source.connections,
      settings: source.settings
    });
    
    const targetJson = JSON.stringify({
      name: target.name,
      nodes: target.nodes,
      connections: target.connections,
      settings: target.settings
    });
    
    return sourceJson !== targetJson;
  }

  async downloadWorkflow(workflow) {
    const category = this.detectWorkflowCategory(workflow);
    const workflowsDir = path.join(__dirname, 'n8n-workflows', category);
    const fileName = `${this.sanitizeFileName(workflow.name)}.json`;
    const filePath = path.join(workflowsDir, fileName);

    // Ensure directory exists
    if (!fs.existsSync(workflowsDir)) {
      fs.mkdirSync(workflowsDir, { recursive: true });
    }

    // Clean workflow data for local storage
    const cleanWorkflow = {
      id: workflow.id,
      name: workflow.name,
      active: workflow.active,
      nodes: workflow.nodes,
      connections: workflow.connections,
      settings: workflow.settings || {},
      staticData: workflow.staticData || null,
      meta: workflow.meta || null,
      pinData: workflow.pinData || null,
      versionId: workflow.versionId,
      triggerCount: workflow.triggerCount,
      createdAt: workflow.createdAt,
      updatedAt: workflow.updatedAt,
      tags: workflow.tags || [],
      _downloadedAt: new Date().toISOString(),
      _category: category,
      _source: 'remote-n8n'
    };

    // Write workflow to file
    fs.writeFileSync(filePath, JSON.stringify(cleanWorkflow, null, 2));
    console.log(`   📥 Downloaded: ${workflow.name}`);
  }

  async updateLocalWorkflow(remoteWorkflow, localWorkflow) {
    const filePath = localWorkflow._localPath;
    
    // Backup existing file if enabled
    if (this.syncConfig.backupBeforeSync) {
      const backupPath = `${filePath}.backup.${Date.now()}`;
      fs.copyFileSync(filePath, backupPath);
    }

    // Update local workflow with remote data
    const updatedWorkflow = {
      ...localWorkflow,
      ...remoteWorkflow,
      _localPath: localWorkflow._localPath,
      _localCategory: localWorkflow._localCategory,
      _lastSyncedAt: new Date().toISOString(),
      _source: 'remote-n8n'
    };

    // Write updated workflow to file
    fs.writeFileSync(filePath, JSON.stringify(updatedWorkflow, null, 2));
    console.log(`   🔄 Updated local: ${remoteWorkflow.name}`);
  }

  async uploadWorkflow(workflow) {
    try {
      const response = await fetch(`${this.secrets.N8N_API_URL}/workflows`, {
        method: 'POST',
        headers: {
          'X-N8N-API-KEY': this.secrets.N8N_API_KEY,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name: workflow.name,
          nodes: workflow.nodes,
          connections: workflow.connections,
          settings: workflow.settings || {}
        })
      });

      if (!response.ok) {
        const errorData = await response.text();
        throw new Error(`Upload failed: ${response.status} ${response.statusText} - ${errorData}`);
      }

      const result = await response.json();
      console.log(`   📤 Uploaded: ${workflow.name} (ID: ${result.id})`);
      
    } catch (error) {
      console.log(`   ❌ Failed to upload ${workflow.name}: ${error.message}`);
      throw error;
    }
  }

  async updateRemoteWorkflow(localWorkflow, remoteWorkflow) {
    try {
      const response = await fetch(`${this.secrets.N8N_API_URL}/workflows/${remoteWorkflow.id}`, {
        method: 'PUT',
        headers: {
          'X-N8N-API-KEY': this.secrets.N8N_API_KEY,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name: localWorkflow.name,
          nodes: localWorkflow.nodes,
          connections: localWorkflow.connections,
          settings: localWorkflow.settings || {}
        })
      });

      if (!response.ok) {
        const errorData = await response.text();
        throw new Error(`Update failed: ${response.status} ${response.statusText} - ${errorData}`);
      }

      console.log(`   🔄 Updated remote: ${localWorkflow.name}`);
      
    } catch (error) {
      console.log(`   ❌ Failed to update remote ${localWorkflow.name}: ${error.message}`);
      throw error;
    }
  }

  detectWorkflowCategory(workflow) {
    const name = workflow.name.toLowerCase();
    
    if (name.includes('crew') || name.includes('captain') || name.includes('commander')) {
      return 'crew-workflows';
    }
    if (name.includes('system') || name.includes('mission control')) {
      return 'system-workflows';
    }
    if (name.includes('coordination') || name.includes('collaboration')) {
      return 'coordination-workflows';
    }
    if (name.includes('anti-hallucination') || name.includes('hallucination')) {
      return 'anti-hallucination-workflows';
    }
    if (name.includes('project') || name.includes('alex ai')) {
      return 'project-workflows';
    }
    if (name.includes('utility') || name.includes('generic')) {
      return 'utility-workflows';
    }
    
    return 'downloaded-workflows';
  }

  sanitizeFileName(name) {
    return name
      .replace(/[^a-zA-Z0-9\s-_]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .toLowerCase()
      .trim();
  }

  async setupFileWatcher() {
    console.log('👀 Setting up file watcher...');
    
    const workflowsDir = path.join(__dirname, 'n8n-workflows');
    
    const watcher = chokidar.watch(workflowsDir, {
      ignored: /(^|[\/\\])\../, // ignore dotfiles
      persistent: true,
      ignoreInitial: true
    });

    watcher.on('change', async (filePath) => {
      console.log(`\n📝 File changed: ${filePath}`);
      await this.handleFileChange(filePath);
    });

    watcher.on('add', async (filePath) => {
      console.log(`\n➕ File added: ${filePath}`);
      await this.handleFileChange(filePath);
    });

    // Handle graceful shutdown
    process.on('SIGINT', () => {
      console.log('\n🛑 Shutting down file watcher...');
      watcher.close();
      process.exit(0);
    });
  }

  async setupScheduledSync() {
    console.log(`⏰ Setting up scheduled sync (every ${this.syncConfig.syncInterval / 1000} seconds)...`);
    
    const syncInterval = setInterval(async () => {
      try {
        console.log('\n🔄 Scheduled sync starting...');
        await this.performSync();
        console.log('✅ Scheduled sync completed');
      } catch (error) {
        console.error('❌ Scheduled sync failed:', error.message);
      }
    }, this.syncConfig.syncInterval);

    // Handle graceful shutdown
    process.on('SIGINT', () => {
      console.log('\n🛑 Shutting down scheduled sync...');
      clearInterval(syncInterval);
      process.exit(0);
    });
  }

  async handleFileChange(filePath) {
    try {
      // Reload local workflows
      await this.loadLocalWorkflows();
      
      // Perform sync
      await this.syncWorkflows();
      
    } catch (error) {
      console.error('❌ File change sync failed:', error.message);
    }
  }

  async performSync() {
    this.syncReport.totalSyncs++;
    
    try {
      // Fetch latest remote workflows
      await this.fetchRemoteWorkflows();
      
      // Load latest local workflows
      await this.loadLocalWorkflows();
      
      // Perform sync
      await this.syncWorkflows();
      
      this.syncReport.successfulSyncs++;
      
    } catch (error) {
      this.syncReport.failedSyncs++;
      throw error;
    }
  }

  generateSyncReport() {
    console.log('\n📊 Sync Report');
    console.log('==============');
    console.log(`Total Syncs: ${this.syncReport.totalSyncs}`);
    console.log(`Successful: ${this.syncReport.successfulSyncs}`);
    console.log(`Failed: ${this.syncReport.failedSyncs}`);
    console.log(`Workflows Created: ${this.syncReport.workflowsCreated}`);
    console.log(`Workflows Updated: ${this.syncReport.workflowsUpdated}`);
    console.log(`Conflicts Resolved: ${this.syncReport.conflictsResolved}`);
  }
}

// CLI interface
async function main() {
  const args = process.argv.slice(2);
  const options = {};

  // Parse command line arguments
  for (let i = 0; i < args.length; i++) {
    switch (args[i]) {
      case '--watch':
        options.watchMode = true;
        break;
      case '--interval':
        options.syncInterval = parseInt(args[++i]) * 1000;
        break;
      case '--no-backup':
        options.backupBeforeSync = false;
        break;
      case '--help':
        console.log(`
N8N Bidirectional Sync System

Usage: node n8n-bidirectional-sync.js [options]

Options:
  --watch              Enable file watcher mode (default: scheduled sync)
  --interval <seconds> Set sync interval in seconds (default: 30)
  --no-backup          Disable backup before sync
  --help               Show this help message

Examples:
  node n8n-bidirectional-sync.js --watch
  node n8n-bidirectional-sync.js --interval 60
  node n8n-bidirectional-sync.js --watch --no-backup
        `);
        process.exit(0);
        break;
    }
  }

  const sync = new N8NBidirectionalSync();
  await sync.initialize(options);
}

if (require.main === module) {
  main();
}

module.exports = N8NBidirectionalSync;
