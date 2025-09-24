#!/usr/bin/env node

/**
 * N8N Integration Sync Inspection Tool
 * 
 * This script inspects the synchronization between:
 * - Remote N8N instance at n8n.pbradygeorgen.com (via API)
 * - Local N8N JSON configuration files
 * 
 * Ensures 1:1 relationship between remote and local workflows
 */

const fs = require('fs');
const path = require('path');
const os = require('os');

class N8NSyncInspector {
  constructor() {
    this.secrets = {};
    this.remoteWorkflows = [];
    this.localWorkflows = [];
    this.syncReport = {
      timestamp: new Date().toISOString(),
      totalRemote: 0,
      totalLocal: 0,
      synced: 0,
      discrepancies: [],
      missingRemote: [],
      missingLocal: [],
      differences: []
    };
  }

  async initialize() {
    console.log('🔍 N8N Integration Sync Inspector');
    console.log('==================================\n');

    try {
      // Step 1: Load secrets from ~/.zshrc
      await this.loadSecretsFromZshrc();
      
      // Step 2: Fetch remote workflows from N8N API
      await this.fetchRemoteWorkflows();
      
      // Step 3: Load local N8N JSON files
      await this.loadLocalWorkflows();
      
      // Step 4: Compare and analyze sync status
      await this.analyzeSyncStatus();
      
      // Step 5: Generate detailed report
      this.generateSyncReport();
      
    } catch (error) {
      console.error('❌ Inspection failed:', error.message);
      process.exit(1);
    }
  }

  async loadSecretsFromZshrc() {
    console.log('🔐 Loading N8N credentials from ~/.zshrc...');
    
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
    console.log(`   API URL: ${this.secrets.N8N_API_URL}`);
    console.log(`   API Key: ${this.secrets.N8N_API_KEY ? '***' + this.secrets.N8N_API_KEY.slice(-4) : 'Not found'}`);
  }

  async fetchRemoteWorkflows() {
    console.log('\n🌐 Fetching remote workflows from N8N API...');
    
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
      // Handle both array and object responses
      this.remoteWorkflows = Array.isArray(data) ? data : (data.data || []);
      this.syncReport.totalRemote = this.remoteWorkflows.length;

      console.log(`✅ Fetched ${this.remoteWorkflows.length} remote workflows`);
      
      // Display workflow summary
      this.remoteWorkflows.forEach((workflow, index) => {
        console.log(`   ${index + 1}. ${workflow.name} (ID: ${workflow.id})`);
        console.log(`      Active: ${workflow.active ? '✅' : '❌'}`);
        console.log(`      Created: ${new Date(workflow.createdAt).toLocaleString()}`);
        console.log(`      Updated: ${new Date(workflow.updatedAt).toLocaleString()}`);
      });

    } catch (error) {
      console.error('❌ Failed to fetch remote workflows:', error.message);
      throw error;
    }
  }

  async loadLocalWorkflows() {
    console.log('\n📁 Loading local N8N JSON configuration files...');
    
    const localN8nDir = path.join(__dirname, 'n8n-workflows');
    const localWorkflowsDir = path.join(__dirname, 'workflows');
    
    // Check multiple possible locations for N8N files
    const possibleDirs = [
      localN8nDir,
      localWorkflowsDir,
      path.join(__dirname, 'n8n'),
      path.join(__dirname, 'config', 'n8n'),
      path.join(__dirname, 'packages', 'n8n-workflows')
    ];

    let foundDir = null;
    for (const dir of possibleDirs) {
      if (fs.existsSync(dir)) {
        foundDir = dir;
        break;
      }
    }

    if (!foundDir) {
      console.log('⚠️  No local N8N directory found, checking for individual JSON files...');
      await this.findIndividualN8nFiles();
      return;
    }

    console.log(`✅ Found local N8N directory: ${foundDir}`);
    
    // Recursively find all JSON files in the directory
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
            
            // Add metadata
            workflow._localFile = item;
            workflow._localPath = itemPath;
            workflow._localModified = stat.mtime;
            workflow._localCategory = path.relative(foundDir, dir);
            
            this.localWorkflows.push(workflow);
          } catch (error) {
            console.log(`⚠️  Failed to parse ${itemPath}: ${error.message}`);
          }
        }
      }
    };

    findWorkflows(foundDir);

    this.syncReport.totalLocal = this.localWorkflows.length;
    console.log(`✅ Loaded ${this.localWorkflows.length} local workflow files`);
  }

  async findIndividualN8nFiles() {
    console.log('🔍 Searching for individual N8N JSON files...');
    
    // Search for N8N JSON files in common locations
    const searchPatterns = [
      '**/*n8n*.json',
      '**/*workflow*.json',
      '**/n8n/**/*.json',
      '**/workflows/**/*.json'
    ];

    const glob = require('glob');
    
    for (const pattern of searchPatterns) {
      try {
        const files = glob.sync(pattern, { cwd: __dirname, ignore: ['node_modules/**', 'dist/**', 'build/**'] });
        
        for (const file of files) {
          try {
            const filePath = path.join(__dirname, file);
            const content = fs.readFileSync(filePath, 'utf8');
            const workflow = JSON.parse(content);
            
            // Check if this looks like an N8N workflow
            if (this.isN8nWorkflow(workflow)) {
              workflow._localFile = path.basename(file);
              workflow._localPath = filePath;
              workflow._localModified = fs.statSync(filePath).mtime;
              
              this.localWorkflows.push(workflow);
            }
          } catch (error) {
            // Skip files that can't be parsed
          }
        }
      } catch (error) {
        // Skip patterns that don't work
      }
    }

    this.syncReport.totalLocal = this.localWorkflows.length;
    console.log(`✅ Found ${this.localWorkflows.length} N8N workflow files`);
  }

  isN8nWorkflow(obj) {
    // Check if object looks like an N8N workflow
    return obj && 
           (obj.nodes && Array.isArray(obj.nodes)) &&
           (obj.connections && typeof obj.connections === 'object');
  }

  async analyzeSyncStatus() {
    console.log('\n🔍 Analyzing sync status between remote and local...');
    
    // Create maps for easier comparison
    const remoteMap = new Map();
    const localMap = new Map();
    
    // Index remote workflows by name and ID
    this.remoteWorkflows.forEach(workflow => {
      remoteMap.set(workflow.name, workflow);
      remoteMap.set(workflow.id, workflow);
    });
    
    // Index local workflows by name and try to match with remote
    this.localWorkflows.forEach(workflow => {
      const name = workflow.name || workflow._localFile.replace('.json', '');
      localMap.set(name, workflow);
    });

    // Find synced workflows
    for (const [name, localWorkflow] of localMap) {
      const remoteWorkflow = remoteMap.get(name);
      if (remoteWorkflow) {
        this.syncReport.synced++;
        
        // Check for differences
        const differences = this.compareWorkflows(remoteWorkflow, localWorkflow);
        if (differences.length > 0) {
          this.syncReport.differences.push({
            name,
            differences,
            remote: remoteWorkflow,
            local: localWorkflow
          });
        }
      } else {
        this.syncReport.missingRemote.push({
          name,
          workflow: localWorkflow
        });
      }
    }

    // Find workflows that exist remotely but not locally
    for (const [name, remoteWorkflow] of remoteMap) {
      if (!localMap.has(name)) {
        this.syncReport.missingLocal.push({
          name,
          workflow: remoteWorkflow
        });
      }
    }
  }

  compareWorkflows(remote, local) {
    const differences = [];
    
    // Compare basic properties
    const propertiesToCompare = ['name', 'active', 'nodes', 'connections', 'settings'];
    
    for (const prop of propertiesToCompare) {
      if (JSON.stringify(remote[prop]) !== JSON.stringify(local[prop])) {
        differences.push({
          property: prop,
          remote: remote[prop],
          local: local[prop]
        });
      }
    }
    
    return differences;
  }

  generateSyncReport() {
    console.log('\n📊 N8N Sync Analysis Report');
    console.log('============================');
    
    console.log(`\n📈 Summary:`);
    console.log(`   Remote Workflows: ${this.syncReport.totalRemote}`);
    console.log(`   Local Workflows: ${this.syncReport.totalLocal}`);
    console.log(`   Synced: ${this.syncReport.synced}`);
    console.log(`   Missing from Remote: ${this.syncReport.missingRemote.length}`);
    console.log(`   Missing from Local: ${this.syncReport.missingLocal.length}`);
    console.log(`   With Differences: ${this.syncReport.differences.length}`);

    // Report missing workflows
    if (this.syncReport.missingRemote.length > 0) {
      console.log(`\n❌ Workflows missing from remote N8N:`);
      this.syncReport.missingRemote.forEach(item => {
        console.log(`   - ${item.name} (${item.workflow._localFile})`);
      });
    }

    if (this.syncReport.missingLocal.length > 0) {
      console.log(`\n❌ Workflows missing from local files:`);
      this.syncReport.missingLocal.forEach(item => {
        console.log(`   - ${item.name} (ID: ${item.workflow.id})`);
      });
    }

    // Report differences
    if (this.syncReport.differences.length > 0) {
      console.log(`\n⚠️  Workflows with differences:`);
      this.syncReport.differences.forEach(item => {
        console.log(`\n   ${item.name}:`);
        item.differences.forEach(diff => {
          console.log(`     - ${diff.property}: Different values`);
        });
      });
    }

    // Generate recommendations
    this.generateRecommendations();

    // Save detailed report
    this.saveDetailedReport();
  }

  generateRecommendations() {
    console.log(`\n💡 Recommendations:`);
    
    if (this.syncReport.missingRemote.length > 0) {
      console.log(`\n1. Upload missing local workflows to N8N:`);
      this.syncReport.missingRemote.forEach(item => {
        console.log(`   - Upload ${item.workflow._localFile} as "${item.name}"`);
      });
    }

    if (this.syncReport.missingLocal.length > 0) {
      console.log(`\n2. Download missing remote workflows locally:`);
      this.syncReport.missingLocal.forEach(item => {
        console.log(`   - Download "${item.name}" (ID: ${item.workflow.id})`);
      });
    }

    if (this.syncReport.differences.length > 0) {
      console.log(`\n3. Sync differences between remote and local:`);
      this.syncReport.differences.forEach(item => {
        console.log(`   - Resolve differences in "${item.name}"`);
      });
    }

    if (this.syncReport.synced === this.syncReport.totalRemote && 
        this.syncReport.synced === this.syncReport.totalLocal &&
        this.syncReport.differences.length === 0) {
      console.log(`\n✅ Perfect sync! All workflows are synchronized.`);
    }
  }

  saveDetailedReport() {
    const reportPath = path.join(__dirname, 'n8n-sync-inspection-report.json');
    
    const detailedReport = {
      ...this.syncReport,
      remoteWorkflows: this.remoteWorkflows.map(w => ({
        id: w.id,
        name: w.name,
        active: w.active,
        createdAt: w.createdAt,
        updatedAt: w.updatedAt
      })),
      localWorkflows: this.localWorkflows.map(w => ({
        name: w.name || w._localFile,
        file: w._localFile,
        path: w._localPath,
        modified: w._localModified,
        nodeCount: w.nodes ? w.nodes.length : 0
      }))
    };

    fs.writeFileSync(reportPath, JSON.stringify(detailedReport, null, 2));
    console.log(`\n📄 Detailed report saved to: ${reportPath}`);
  }
}

// Run the N8N sync inspection
async function main() {
  const inspector = new N8NSyncInspector();
  await inspector.initialize();
}

if (require.main === module) {
  main();
}

module.exports = N8NSyncInspector;
