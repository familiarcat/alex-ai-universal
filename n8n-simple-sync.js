#!/usr/bin/env node

/**
 * N8N Simple Sync System
 * 
 * A simplified bidirectional sync system without external dependencies
 * for keeping local and remote N8N workflows synchronized.
 */

const fs = require('fs');
const path = require('path');
const os = require('os');

class N8NSimpleSync {
  constructor() {
    this.secrets = {};
    this.remoteWorkflows = [];
    this.localWorkflows = [];
    this.syncReport = {
      timestamp: new Date().toISOString(),
      totalSyncs: 0,
      successfulSyncs: 0,
      failedSyncs: 0,
      workflowsCreated: 0,
      workflowsUpdated: 0
    };
  }

  async initialize() {
    console.log('🔄 N8N Simple Sync System');
    console.log('=========================\n');

    try {
      // Step 1: Load secrets and validate
      await this.loadSecretsFromZshrc();
      
      // Step 2: Perform sync
      await this.performSync();
      
      // Step 3: Generate report
      this.generateSyncReport();
      
    } catch (error) {
      console.error('❌ Sync failed:', error.message);
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

  async performSync() {
    console.log('\n🔄 Performing bidirectional sync...');
    
    try {
      // Fetch remote workflows
      await this.fetchRemoteWorkflows();
      
      // Load local workflows
      await this.loadLocalWorkflows();
      
      // Sync remote to local
      await this.syncRemoteToLocal();
      
      // Sync local to remote
      await this.syncLocalToRemote();
      
      console.log('✅ Sync completed successfully');
      
    } catch (error) {
      console.error('❌ Sync failed:', error.message);
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

  async syncRemoteToLocal() {
    console.log('📥 Syncing remote to local...');
    
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

    // Sync remote to local
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

  async syncLocalToRemote() {
    console.log('📤 Syncing local to remote...');
    
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

    // Sync local to remote
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

  generateSyncReport() {
    console.log('\n📊 Sync Report');
    console.log('==============');
    console.log(`Total Syncs: ${this.syncReport.totalSyncs}`);
    console.log(`Successful: ${this.syncReport.successfulSyncs}`);
    console.log(`Failed: ${this.syncReport.failedSyncs}`);
    console.log(`Workflows Created: ${this.syncReport.workflowsCreated}`);
    console.log(`Workflows Updated: ${this.syncReport.workflowsUpdated}`);
  }
}

// Run the simple sync
async function main() {
  const sync = new N8NSimpleSync();
  await sync.initialize();
}

if (require.main === module) {
  main();
}

module.exports = N8NSimpleSync;
