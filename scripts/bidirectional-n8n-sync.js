#!/usr/bin/env node

/**
 * 🖖 Bi-Directional N8N Workflow Sync System
 * 
 * Extends the existing N8N sync system to keep local workflow files
 * and N8N instance in perfect sync with the new organization schema
 */

const https = require('https');
const fs = require('fs');
const path = require('path');

// Load environment variables from ~/.zshrc
function loadZshrcEnv() {
  try {
    const zshrcPath = path.join(require('os').homedir(), '.zshrc');
    const zshrcContent = fs.readFileSync(zshrcPath, 'utf8');
    
    const lines = zshrcContent.split('\n');
    lines.forEach(line => {
      if (line.startsWith('export ')) {
        const [key, value] = line.replace('export ', '').split('=');
        if (key && value) {
          process.env[key] = value.replace(/"/g, '');
        }
      }
    });
    
    console.log('✅ Environment variables loaded from ~/.zshrc');
  } catch (error) {
    console.error('❌ Error loading ~/.zshrc:', error.message);
    process.exit(1);
  }
}

// Make HTTP request to N8N API
function makeN8NRequest(endpoint, method = 'GET', data = null) {
  return new Promise((resolve, reject) => {
    const n8nBaseUrl = process.env.N8N_BASE_URL || 'https://n8n.pbradygeorgen.com';
    const apiKey = process.env.N8N_API_KEY;
    
    if (!apiKey || apiKey === 'your_n8n_api_key_here') {
      console.error('❌ N8N_API_KEY not found in ~/.zshrc or is placeholder');
      process.exit(1);
    }
    
    const url = new URL(endpoint, n8nBaseUrl);
    const options = {
      hostname: url.hostname,
      port: url.port || (url.protocol === 'https:' ? 443 : 80),
      path: url.pathname + url.search,
      method: method,
      headers: {
        'X-N8N-API-KEY': apiKey,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    };
    
    const req = https.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => body += chunk);
      res.on('end', () => {
        try {
          const jsonBody = body ? JSON.parse(body) : {};
          resolve({ status: res.statusCode, data: jsonBody, headers: res.headers });
        } catch (e) {
          resolve({ status: res.statusCode, data: body, headers: res.headers });
        }
      });
    });
    
    req.on('error', reject);
    
    if (data) {
      req.write(JSON.stringify(data));
    }
    
    req.end();
  });
}

// Local workflow directory structure
const WORKFLOW_CATEGORIES = {
  'CREW': 'packages/core/src/crew-workflows',
  'SYSTEM': 'packages/core/src/system-workflows', 
  'COORDINATION': 'packages/core/src/coordination-workflows',
  'ANTI-HALLUCINATION': 'packages/core/src/anti-hallucination/n8n-workflows',
  'PROJECT': 'packages/core/src/project-workflows',
  'UTILITY': 'packages/core/src/utility-workflows'
};

class BiDirectionalN8NSync {
  constructor() {
    this.localWorkflows = new Map();
    this.remoteWorkflows = new Map();
    this.syncStats = {
      localToRemote: 0,
      remoteToLocal: 0,
      conflicts: 0,
      errors: 0
    };
  }

  /**
   * Main sync operation
   */
  async sync() {
    console.log('🖖 Starting Bi-Directional N8N Workflow Sync');
    console.log('============================================');
    
    try {
      // Step 1: Load local workflows
      await this.loadLocalWorkflows();
      
      // Step 2: Load remote workflows
      await this.loadRemoteWorkflows();
      
      // Step 3: Compare and sync
      await this.compareAndSync();
      
      // Step 4: Generate sync report
      this.generateSyncReport();
      
    } catch (error) {
      console.error('❌ Sync failed:', error.message);
      process.exit(1);
    }
  }

  /**
   * Load all local workflow files
   */
  async loadLocalWorkflows() {
    console.log('\n📁 Loading local workflow files...');
    
    for (const [category, dirPath] of Object.entries(WORKFLOW_CATEGORIES)) {
      const fullPath = path.join(process.cwd(), dirPath);
      
      if (fs.existsSync(fullPath)) {
        const files = fs.readdirSync(fullPath).filter(f => f.endsWith('.json'));
        
        for (const file of files) {
          const filePath = path.join(fullPath, file);
          const content = JSON.parse(fs.readFileSync(filePath, 'utf8'));
          
          this.localWorkflows.set(content.name || file, {
            category,
            filePath,
            content,
            lastModified: fs.statSync(filePath).mtime
          });
          
          console.log(`  📄 ${category}: ${file}`);
        }
      } else {
        console.log(`  📁 Creating directory: ${fullPath}`);
        fs.mkdirSync(fullPath, { recursive: true });
      }
    }
    
    console.log(`✅ Loaded ${this.localWorkflows.size} local workflows`);
  }

  /**
   * Load all remote workflows from N8N
   */
  async loadRemoteWorkflows() {
    console.log('\n🌐 Loading remote workflows from N8N...');
    
    try {
      const response = await makeN8NRequest('/api/v1/workflows');
      
      if (response.status === 200) {
        const workflows = response.data.data || response.data;
        
        for (const workflow of workflows) {
          this.remoteWorkflows.set(workflow.name, {
            id: workflow.id,
            content: workflow,
            lastModified: new Date(workflow.updatedAt || workflow.createdAt)
          });
          
          console.log(`  🌐 ${workflow.name} (ID: ${workflow.id})`);
        }
        
        console.log(`✅ Loaded ${this.remoteWorkflows.size} remote workflows`);
      } else {
        throw new Error(`Failed to fetch workflows: ${response.status}`);
      }
    } catch (error) {
      console.error('❌ Error loading remote workflows:', error.message);
      throw error;
    }
  }

  /**
   * Compare local and remote workflows and sync
   */
  async compareAndSync() {
    console.log('\n🔄 Comparing and syncing workflows...');
    
    // Check for local workflows that don't exist remotely
    for (const [name, localWorkflow] of this.localWorkflows) {
      if (!this.remoteWorkflows.has(name)) {
        console.log(`📤 Uploading new workflow: ${name}`);
        await this.uploadWorkflowToN8N(localWorkflow);
        this.syncStats.localToRemote++;
      } else {
        // Compare timestamps and content
        const remoteWorkflow = this.remoteWorkflows.get(name);
        const localNewer = localWorkflow.lastModified > remoteWorkflow.lastModified;
        
        if (localNewer) {
          console.log(`📤 Updating remote workflow: ${name}`);
          await this.updateWorkflowInN8N(name, localWorkflow);
          this.syncStats.localToRemote++;
        } else if (remoteWorkflow.lastModified > localWorkflow.lastModified) {
          console.log(`📥 Updating local workflow: ${name}`);
          await this.updateLocalWorkflow(name, remoteWorkflow);
          this.syncStats.remoteToLocal++;
        }
      }
    }
    
    // Check for remote workflows that don't exist locally
    for (const [name, remoteWorkflow] of this.remoteWorkflows) {
      if (!this.localWorkflows.has(name)) {
        console.log(`📥 Downloading new workflow: ${name}`);
        await this.downloadWorkflowFromN8N(name, remoteWorkflow);
        this.syncStats.remoteToLocal++;
      }
    }
  }

  /**
   * Upload new workflow to N8N
   */
  async uploadWorkflowToN8N(localWorkflow) {
    try {
      const response = await makeN8NRequest('/api/v1/workflows', 'POST', localWorkflow.content);
      
      if (response.status === 201 || response.status === 200) {
        console.log(`  ✅ Uploaded: ${localWorkflow.content.name}`);
      } else {
        console.error(`  ❌ Failed to upload: ${localWorkflow.content.name} (${response.status})`);
        this.syncStats.errors++;
      }
    } catch (error) {
      console.error(`  ❌ Error uploading ${localWorkflow.content.name}:`, error.message);
      this.syncStats.errors++;
    }
  }

  /**
   * Update workflow in N8N
   */
  async updateWorkflowInN8N(name, localWorkflow) {
    try {
      const remoteWorkflow = this.remoteWorkflows.get(name);
      const response = await makeN8NRequest(`/api/v1/workflows/${remoteWorkflow.id}`, 'PUT', {
        name: localWorkflow.content.name,
        nodes: localWorkflow.content.nodes,
        connections: localWorkflow.content.connections,
        settings: localWorkflow.content.settings || {}
      });
      
      if (response.status === 200) {
        console.log(`  ✅ Updated: ${name}`);
      } else {
        console.error(`  ❌ Failed to update: ${name} (${response.status})`);
        this.syncStats.errors++;
      }
    } catch (error) {
      console.error(`  ❌ Error updating ${name}:`, error.message);
      this.syncStats.errors++;
    }
  }

  /**
   * Update local workflow file
   */
  async updateLocalWorkflow(name, remoteWorkflow) {
    try {
      const category = this.determineWorkflowCategory(name);
      const dirPath = WORKFLOW_CATEGORIES[category];
      const fileName = `${name.replace(/[^a-zA-Z0-9]/g, '_')}.json`;
      const filePath = path.join(process.cwd(), dirPath, fileName);
      
      // Create directory if it doesn't exist
      fs.mkdirSync(path.dirname(filePath), { recursive: true });
      
      // Write workflow file
      fs.writeFileSync(filePath, JSON.stringify(remoteWorkflow.content, null, 2));
      
      console.log(`  ✅ Updated local file: ${fileName}`);
    } catch (error) {
      console.error(`  ❌ Error updating local ${name}:`, error.message);
      this.syncStats.errors++;
    }
  }

  /**
   * Download new workflow from N8N
   */
  async downloadWorkflowFromN8N(name, remoteWorkflow) {
    try {
      const category = this.determineWorkflowCategory(name);
      const dirPath = WORKFLOW_CATEGORIES[category];
      const fileName = `${name.replace(/[^a-zA-Z0-9]/g, '_')}.json`;
      const filePath = path.join(process.cwd(), dirPath, fileName);
      
      // Create directory if it doesn't exist
      fs.mkdirSync(path.dirname(filePath), { recursive: true });
      
      // Write workflow file
      fs.writeFileSync(filePath, JSON.stringify(remoteWorkflow.content, null, 2));
      
      console.log(`  ✅ Downloaded: ${fileName}`);
    } catch (error) {
      console.error(`  ❌ Error downloading ${name}:`, error.message);
      this.syncStats.errors++;
    }
  }

  /**
   * Determine workflow category from name
   */
  determineWorkflowCategory(name) {
    if (name.startsWith('CREW -')) return 'CREW';
    if (name.startsWith('SYSTEM -')) return 'SYSTEM';
    if (name.startsWith('COORDINATION -')) return 'COORDINATION';
    if (name.startsWith('ANTI-HALLUCINATION -')) return 'ANTI-HALLUCINATION';
    if (name.startsWith('PROJECT -')) return 'PROJECT';
    if (name.startsWith('UTILITY -')) return 'UTILITY';
    return 'UTILITY'; // Default fallback
  }

  /**
   * Generate sync report
   */
  generateSyncReport() {
    console.log('\n📊 Bi-Directional Sync Report');
    console.log('============================');
    console.log(`📤 Local to Remote: ${this.syncStats.localToRemote} workflows`);
    console.log(`📥 Remote to Local: ${this.syncStats.remoteToLocal} workflows`);
    console.log(`⚠️  Conflicts: ${this.syncStats.conflicts} workflows`);
    console.log(`❌ Errors: ${this.syncStats.errors} workflows`);
    console.log(`📁 Total Local: ${this.localWorkflows.size} workflows`);
    console.log(`🌐 Total Remote: ${this.remoteWorkflows.size} workflows`);
    
    // Save report to file
    const reportPath = path.join(process.cwd(), 'n8n-sync-report.json');
    const report = {
      timestamp: new Date().toISOString(),
      stats: this.syncStats,
      localWorkflows: Array.from(this.localWorkflows.keys()),
      remoteWorkflows: Array.from(this.remoteWorkflows.keys()),
      categories: WORKFLOW_CATEGORIES
    };
    
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
    console.log(`📄 Sync report saved to: ${reportPath}`);
  }
}

// CLI interface
async function main() {
  const args = process.argv.slice(2);
  const command = args[0] || 'sync';
  
  loadZshrcEnv();
  
  const sync = new BiDirectionalN8NSync();
  
  switch (command) {
    case 'sync':
      await sync.sync();
      break;
      
    case 'upload':
      console.log('📤 Upload-only mode (local → remote)');
      await sync.loadLocalWorkflows();
      await sync.loadRemoteWorkflows();
      
      for (const [name, localWorkflow] of sync.localWorkflows) {
        if (!sync.remoteWorkflows.has(name)) {
          await sync.uploadWorkflowToN8N(localWorkflow);
        }
      }
      break;
      
    case 'download':
      console.log('📥 Download-only mode (remote → local)');
      await sync.loadRemoteWorkflows();
      
      for (const [name, remoteWorkflow] of sync.remoteWorkflows) {
        await sync.downloadWorkflowFromN8N(name, remoteWorkflow);
      }
      break;
      
    case 'status':
      console.log('📊 Status check');
      await sync.loadLocalWorkflows();
      await sync.loadRemoteWorkflows();
      sync.generateSyncReport();
      break;
      
    default:
      console.log('Usage:');
      console.log('  node bidirectional-n8n-sync.js sync      # Full bi-directional sync');
      console.log('  node bidirectional-n8n-sync.js upload    # Upload local → remote');
      console.log('  node bidirectional-n8n-sync.js download  # Download remote → local');
      console.log('  node bidirectional-n8n-sync.js status    # Check sync status');
  }
}

// Run if called directly
if (require.main === module) {
  main().catch(console.error);
}

module.exports = { BiDirectionalN8NSync };
