#!/usr/bin/env node

/**
 * 🚀 Enhanced Bi-Directional N8N Sync System
 * 
 * Operates as N8N experts to ensure fluid bi-directional synchronization
 * between local development files and remote N8N instance
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

class EnhancedBiDirectionalSync {
  constructor() {
    this.localWorkflows = new Map();
    this.remoteWorkflows = new Map();
    this.syncResults = {
      uploaded: [],
      downloaded: [],
      updated: [],
      errors: []
    };
  }

  /**
   * Main sync operation
   */
  async sync(mode = 'full') {
    console.log('🚀 Enhanced Bi-Directional N8N Sync System');
    console.log('==========================================');
    console.log(`🔄 Mode: ${mode.toUpperCase()}`);
    
    try {
      // Step 1: Load workflows
      await this.loadWorkflows();
      
      // Step 2: Perform sync operations
      if (mode === 'upload' || mode === 'full') {
        await this.syncLocalToRemote();
      }
      
      if (mode === 'download' || mode === 'full') {
        await this.syncRemoteToLocal();
      }
      
      // Step 3: Generate comprehensive report
      this.generateSyncReport();
      
    } catch (error) {
      console.error('❌ Sync failed:', error.message);
    }
  }

  /**
   * Load all workflows from both local and remote
   */
  async loadWorkflows() {
    console.log('\n📁 Loading Workflows...');
    
    // Load local workflows
    await this.loadLocalWorkflows();
    
    // Load remote workflows
    await this.loadRemoteWorkflows();
    
    console.log(`✅ Local workflows: ${this.localWorkflows.size}`);
    console.log(`✅ Remote workflows: ${this.remoteWorkflows.size}`);
  }

  /**
   * Load local workflow files
   */
  async loadLocalWorkflows() {
    const categories = ['crew-workflows', 'system-workflows', 'coordination-workflows', 
                       'anti-hallucination-workflows', 'project-workflows', 'utility-workflows'];
    
    for (const category of categories) {
      const categoryPath = path.join(__dirname, '..', 'packages', 'core', 'src', category);
      
      if (fs.existsSync(categoryPath)) {
        const files = fs.readdirSync(categoryPath).filter(file => file.endsWith('.json'));
        
        for (const file of files) {
          const filePath = path.join(categoryPath, file);
          try {
            const content = fs.readFileSync(filePath, 'utf8');
            const workflow = JSON.parse(content);
            
            if (workflow.name) {
              // Normalize the name for comparison
              const normalizedName = this.normalizeWorkflowName(workflow.name);
              
              this.localWorkflows.set(normalizedName, {
                name: workflow.name,
                normalizedName: normalizedName,
                category: category.replace('-workflows', '').toUpperCase(),
                file: file,
                path: filePath,
                content: workflow,
                lastModified: fs.statSync(filePath).mtime,
                id: workflow.id
              });
            }
          } catch (error) {
            console.log(`⚠️  Could not parse ${file}: ${error.message}`);
          }
        }
      }
    }
  }

  /**
   * Load remote workflows from N8N
   */
  async loadRemoteWorkflows() {
    const response = await makeN8NRequest('/api/v1/workflows');
    
    if (response.status === 200) {
      const workflows = response.data.data || response.data;
      
      for (const workflow of workflows) {
        // Normalize the name for comparison
        const normalizedName = this.normalizeWorkflowName(workflow.name);
        
        this.remoteWorkflows.set(normalizedName, {
          name: workflow.name,
          normalizedName: normalizedName,
          id: workflow.id,
          active: workflow.active,
          updatedAt: workflow.updatedAt,
          createdAt: workflow.createdAt,
          content: workflow
        });
      }
    } else {
      throw new Error(`Failed to fetch remote workflows: ${response.status}`);
    }
  }

  /**
   * Normalize workflow names for comparison
   */
  normalizeWorkflowName(name) {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '')
      .replace(/\s+/g, '')
      .trim();
  }

  /**
   * Sync local to remote (upload/update)
   */
  async syncLocalToRemote() {
    console.log('\n📤 Syncing Local to Remote...');
    
    for (const [normalizedName, localWorkflow] of this.localWorkflows) {
      const remoteWorkflow = this.remoteWorkflows.get(normalizedName);
      
      if (!remoteWorkflow) {
        // Upload new workflow
        await this.uploadWorkflow(localWorkflow);
      } else {
        // Update existing workflow
        await this.updateWorkflow(localWorkflow, remoteWorkflow);
      }
    }
  }

  /**
   * Sync remote to local (download)
   */
  async syncRemoteToLocal() {
    console.log('\n📥 Syncing Remote to Local...');
    
    for (const [normalizedName, remoteWorkflow] of this.remoteWorkflows) {
      const localWorkflow = this.localWorkflows.get(normalizedName);
      
      if (!localWorkflow) {
        // Download new workflow
        await this.downloadWorkflow(remoteWorkflow);
      } else {
        // Compare and potentially update local
        await this.compareAndUpdateLocal(localWorkflow, remoteWorkflow);
      }
    }
  }

  /**
   * Upload new workflow to remote
   */
  async uploadWorkflow(localWorkflow) {
    console.log(`📤 Uploading: ${localWorkflow.name}`);
    
    try {
      // Prepare upload payload
      const uploadPayload = {
        name: localWorkflow.content.name,
        nodes: localWorkflow.content.nodes,
        connections: localWorkflow.content.connections,
        settings: localWorkflow.content.settings || {}
      };
      
      const response = await makeN8NRequest('/api/v1/workflows', 'POST', uploadPayload);
      
      if (response.status === 201 || response.status === 200) {
        console.log(`  ✅ Uploaded successfully`);
        this.syncResults.uploaded.push(localWorkflow.name);
      } else {
        console.log(`  ❌ Upload failed: ${response.status}`);
        this.syncResults.errors.push(`${localWorkflow.name}: Upload failed (${response.status})`);
      }
    } catch (error) {
      console.log(`  ❌ Upload error: ${error.message}`);
      this.syncResults.errors.push(`${localWorkflow.name}: ${error.message}`);
    }
  }

  /**
   * Update existing workflow on remote
   */
  async updateWorkflow(localWorkflow, remoteWorkflow) {
    // Check if update is needed
    const needsUpdate = this.workflowNeedsUpdate(localWorkflow, remoteWorkflow);
    
    if (needsUpdate) {
      console.log(`🔄 Updating: ${localWorkflow.name}`);
      
      try {
        // Prepare update payload
        const updatePayload = {
          name: localWorkflow.content.name,
          nodes: localWorkflow.content.nodes,
          connections: localWorkflow.content.connections,
          settings: localWorkflow.content.settings || {}
        };
        
        const response = await makeN8NRequest(`/api/v1/workflows/${remoteWorkflow.id}`, 'PUT', updatePayload);
        
        if (response.status === 200) {
          console.log(`  ✅ Updated successfully`);
          this.syncResults.updated.push(localWorkflow.name);
        } else {
          console.log(`  ❌ Update failed: ${response.status}`);
          this.syncResults.errors.push(`${localWorkflow.name}: Update failed (${response.status})`);
        }
      } catch (error) {
        console.log(`  ❌ Update error: ${error.message}`);
        this.syncResults.errors.push(`${localWorkflow.name}: ${error.message}`);
      }
    } else {
      console.log(`✅ Up to date: ${localWorkflow.name}`);
    }
  }

  /**
   * Download new workflow to local
   */
  async downloadWorkflow(remoteWorkflow) {
    console.log(`📥 Downloading: ${remoteWorkflow.name}`);
    
    try {
      // Determine category based on workflow name
      const category = this.determineCategory(remoteWorkflow.name);
      const categoryDir = path.join(__dirname, '..', 'packages', 'core', 'src', `${category.toLowerCase()}-workflows`);
      
      // Create category directory if it doesn't exist
      if (!fs.existsSync(categoryDir)) {
        fs.mkdirSync(categoryDir, { recursive: true });
      }
      
      // Create filename
      const filename = this.createFilename(remoteWorkflow.name);
      const filePath = path.join(categoryDir, filename);
      
      // Write workflow to file
      fs.writeFileSync(filePath, JSON.stringify(remoteWorkflow.content, null, 2));
      
      console.log(`  ✅ Downloaded to ${filePath}`);
      this.syncResults.downloaded.push(remoteWorkflow.name);
    } catch (error) {
      console.log(`  ❌ Download error: ${error.message}`);
      this.syncResults.errors.push(`${remoteWorkflow.name}: ${error.message}`);
    }
  }

  /**
   * Compare and update local workflow
   */
  async compareAndUpdateLocal(localWorkflow, remoteWorkflow) {
    // Check if local needs update
    const needsUpdate = this.localWorkflowNeedsUpdate(localWorkflow, remoteWorkflow);
    
    if (needsUpdate) {
      console.log(`🔄 Updating local: ${localWorkflow.name}`);
      
      try {
        // Write updated workflow to file
        fs.writeFileSync(localWorkflow.path, JSON.stringify(remoteWorkflow.content, null, 2));
        
        console.log(`  ✅ Local updated successfully`);
      } catch (error) {
        console.log(`  ❌ Local update error: ${error.message}`);
        this.syncResults.errors.push(`${localWorkflow.name}: Local update failed`);
      }
    }
  }

  /**
   * Check if workflow needs update
   */
  workflowNeedsUpdate(localWorkflow, remoteWorkflow) {
    // Compare nodes
    const localNodes = JSON.stringify(localWorkflow.content.nodes);
    const remoteNodes = JSON.stringify(remoteWorkflow.content.nodes);
    
    if (localNodes !== remoteNodes) {
      return true;
    }
    
    // Compare connections
    const localConnections = JSON.stringify(localWorkflow.content.connections);
    const remoteConnections = JSON.stringify(remoteWorkflow.content.connections);
    
    if (localConnections !== remoteConnections) {
      return true;
    }
    
    // Compare settings
    const localSettings = JSON.stringify(localWorkflow.content.settings || {});
    const remoteSettings = JSON.stringify(remoteWorkflow.content.settings || {});
    
    if (localSettings !== remoteSettings) {
      return true;
    }
    
    return false;
  }

  /**
   * Check if local workflow needs update
   */
  localWorkflowNeedsUpdate(localWorkflow, remoteWorkflow) {
    // Simple timestamp comparison for now
    const localTime = localWorkflow.lastModified;
    const remoteTime = new Date(remoteWorkflow.updatedAt);
    
    return remoteTime > localTime;
  }

  /**
   * Determine category from workflow name
   */
  determineCategory(workflowName) {
    const name = workflowName.toLowerCase();
    
    if (name.includes('crew') && !name.includes('crew management')) {
      return 'CREW';
    } else if (name.includes('system') || name.includes('mission control')) {
      return 'SYSTEM';
    } else if (name.includes('coordination') || name.includes('observation')) {
      return 'COORDINATION';
    } else if (name.includes('anti-hallucination') || name.includes('hallucination')) {
      return 'ANTI-HALLUCINATION';
    } else if (name.includes('project') || name.includes('alex ai')) {
      return 'PROJECT';
    } else {
      return 'UTILITY';
    }
  }

  /**
   * Create filename from workflow name
   */
  createFilename(workflowName) {
    return workflowName
      .replace(/[^a-zA-Z0-9\s-]/g, '')
      .replace(/\s+/g, '_')
      .replace(/-+/g, '_')
      .toUpperCase() + '.json';
  }

  /**
   * Generate comprehensive sync report
   */
  generateSyncReport() {
    console.log('\n📊 Enhanced Bi-Directional Sync Report');
    console.log('=====================================');
    
    console.log(`\n📤 Uploaded: ${this.syncResults.uploaded.length} workflows`);
    this.syncResults.uploaded.forEach(name => console.log(`  ✅ ${name}`));
    
    console.log(`\n🔄 Updated: ${this.syncResults.updated.length} workflows`);
    this.syncResults.updated.forEach(name => console.log(`  ✅ ${name}`));
    
    console.log(`\n📥 Downloaded: ${this.syncResults.downloaded.length} workflows`);
    this.syncResults.downloaded.forEach(name => console.log(`  ✅ ${name}`));
    
    if (this.syncResults.errors.length > 0) {
      console.log(`\n❌ Errors: ${this.syncResults.errors.length} workflows`);
      this.syncResults.errors.forEach(error => console.log(`  ❌ ${error}`));
    }
    
    console.log(`\n📁 Total Local: ${this.localWorkflows.size} workflows`);
    console.log(`🌐 Total Remote: ${this.remoteWorkflows.size} workflows`);
    
    // Save report
    const reportPath = path.join(__dirname, '..', 'enhanced-n8n-sync-report.json');
    fs.writeFileSync(reportPath, JSON.stringify(this.syncResults, null, 2));
    console.log(`\n📄 Enhanced sync report saved to: ${reportPath}`);
  }
}

// Main execution
async function main() {
  loadZshrcEnv();
  
  const sync = new EnhancedBiDirectionalSync();
  
  const mode = process.argv[2] || 'full';
  await sync.sync(mode);
  
  console.log('\n🎯 Enhanced Bi-Directional Sync Complete!');
  console.log('========================================');
  console.log('The enhanced sync system now properly detects and syncs');
  console.log('workflow changes between local development and remote N8N instance.');
}

main().catch(console.error);
