#!/usr/bin/env node

/**
 * N8N Workflow Deployment Script
 * 
 * This script deploys local N8N workflow JSON files to the remote N8N instance
 * at n8n.pbradygeorgen.com, ensuring 1:1 synchronization between local and remote.
 */

const fs = require('fs');
const path = require('path');
const os = require('os');

class N8NWorkflowDeployer {
  constructor() {
    this.secrets = {};
    this.remoteWorkflows = [];
    this.localWorkflows = [];
    this.deploymentReport = {
      timestamp: new Date().toISOString(),
      totalLocal: 0,
      totalRemote: 0,
      deployed: 0,
      updated: 0,
      errors: [],
      skipped: []
    };
  }

  async initialize() {
    console.log('🚀 N8N Workflow Deployment System');
    console.log('==================================\n');

    try {
      // Step 1: Load secrets from ~/.zshrc
      await this.loadSecretsFromZshrc();
      
      // Step 2: Fetch current remote workflows
      await this.fetchRemoteWorkflows();
      
      // Step 3: Load local workflow files
      await this.loadLocalWorkflows();
      
      // Step 4: Analyze deployment needs
      await this.analyzeDeploymentNeeds();
      
      // Step 5: Deploy missing workflows
      await this.deployWorkflows();
      
      // Step 6: Generate deployment report
      this.generateDeploymentReport();
      
    } catch (error) {
      console.error('❌ Deployment failed:', error.message);
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
    console.log('\n🌐 Fetching current remote workflows...');
    
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
      this.deploymentReport.totalRemote = this.remoteWorkflows.length;

      console.log(`✅ Fetched ${this.remoteWorkflows.length} remote workflows`);
      
    } catch (error) {
      console.error('❌ Failed to fetch remote workflows:', error.message);
      throw error;
    }
  }

  async loadLocalWorkflows() {
    console.log('\n📁 Loading local N8N workflow files...');
    
    // Define workflow directories to search
    const workflowDirs = [
      'packages/core/src/crew-workflows',
      'packages/core/src/system-workflows',
      'packages/core/src/coordination-workflows',
      'packages/core/src/anti-hallucination/n8n-workflows',
      'packages/core/src/project-workflows',
      'packages/core/src/utility-workflows'
    ];

    for (const dir of workflowDirs) {
      const fullPath = path.join(__dirname, dir);
      if (fs.existsSync(fullPath)) {
        const files = fs.readdirSync(fullPath).filter(file => file.endsWith('.json'));
        
        for (const file of files) {
          try {
            const filePath = path.join(fullPath, file);
            const content = fs.readFileSync(filePath, 'utf8');
            const workflow = JSON.parse(content);
            
            // Add metadata
            workflow._localFile = file;
            workflow._localPath = filePath;
            workflow._localModified = fs.statSync(filePath).mtime;
            workflow._category = this.detectCategory(dir);
            
            this.localWorkflows.push(workflow);
          } catch (error) {
            console.log(`⚠️  Failed to parse ${file}: ${error.message}`);
          }
        }
      }
    }

    this.deploymentReport.totalLocal = this.localWorkflows.length;
    console.log(`✅ Loaded ${this.localWorkflows.length} local workflow files`);
  }

  detectCategory(dir) {
    if (dir.includes('crew-workflows')) return 'CREW';
    if (dir.includes('system-workflows')) return 'SYSTEM';
    if (dir.includes('coordination-workflows')) return 'COORDINATION';
    if (dir.includes('anti-hallucination')) return 'ANTI-HALLUCINATION';
    if (dir.includes('project-workflows')) return 'PROJECT';
    if (dir.includes('utility-workflows')) return 'UTILITY';
    return 'UNKNOWN';
  }

  async analyzeDeploymentNeeds() {
    console.log('\n🔍 Analyzing deployment needs...');
    
    // Create maps for easier comparison
    const remoteMap = new Map();
    const localMap = new Map();
    
    // Index remote workflows by name
    this.remoteWorkflows.forEach(workflow => {
      remoteMap.set(workflow.name, workflow);
    });
    
    // Index local workflows by name
    this.localWorkflows.forEach(workflow => {
      const name = workflow.name || workflow._localFile.replace('.json', '');
      localMap.set(name, workflow);
    });

    // Find workflows that need deployment
    this.workflowsToDeploy = [];
    this.workflowsToUpdate = [];
    this.workflowsToSkip = [];

    for (const [name, localWorkflow] of localMap) {
      const remoteWorkflow = remoteMap.get(name);
      
      if (!remoteWorkflow) {
        // Workflow doesn't exist remotely - needs deployment
        this.workflowsToDeploy.push({
          name,
          workflow: localWorkflow,
          action: 'deploy'
        });
      } else {
        // Workflow exists - check if it needs updating
        const needsUpdate = this.workflowNeedsUpdate(remoteWorkflow, localWorkflow);
        if (needsUpdate) {
          this.workflowsToUpdate.push({
            name,
            workflow: localWorkflow,
            remoteId: remoteWorkflow.id,
            action: 'update'
          });
        } else {
          this.workflowsToSkip.push({
            name,
            workflow: localWorkflow,
            action: 'skip'
          });
        }
      }
    }

    console.log(`📊 Deployment Analysis:`);
    console.log(`   To Deploy: ${this.workflowsToDeploy.length}`);
    console.log(`   To Update: ${this.workflowsToUpdate.length}`);
    console.log(`   To Skip: ${this.workflowsToSkip.length}`);
  }

  workflowNeedsUpdate(remote, local) {
    // Simple comparison - in production, you might want more sophisticated comparison
    const remoteJson = JSON.stringify(remote, null, 2);
    const localJson = JSON.stringify(local, null, 2);
    
    // Remove dynamic fields that shouldn't be compared
    const cleanRemote = remoteJson.replace(/"id":"[^"]+"/g, '"id":"REMOTE_ID"');
    const cleanLocal = localJson.replace(/"id":"[^"]+"/g, '"id":"LOCAL_ID"');
    
    return cleanRemote !== cleanLocal;
  }

  async deployWorkflows() {
    console.log('\n🚀 Starting workflow deployment...');
    
    // Deploy new workflows
    for (const item of this.workflowsToDeploy) {
      try {
        console.log(`\n📤 Deploying: ${item.name}`);
        await this.deployWorkflow(item.workflow);
        this.deploymentReport.deployed++;
        console.log(`   ✅ Deployed successfully`);
      } catch (error) {
        console.log(`   ❌ Failed to deploy: ${error.message}`);
        this.deploymentReport.errors.push({
          workflow: item.name,
          action: 'deploy',
          error: error.message
        });
      }
    }

    // Update existing workflows
    for (const item of this.workflowsToUpdate) {
      try {
        console.log(`\n🔄 Updating: ${item.name}`);
        await this.updateWorkflow(item.remoteId, item.workflow);
        this.deploymentReport.updated++;
        console.log(`   ✅ Updated successfully`);
      } catch (error) {
        console.log(`   ❌ Failed to update: ${error.message}`);
        this.deploymentReport.errors.push({
          workflow: item.name,
          action: 'update',
          error: error.message
        });
      }
    }

    // Skip unchanged workflows
    for (const item of this.workflowsToSkip) {
      this.deploymentReport.skipped.push({
        workflow: item.name,
        action: 'skip',
        reason: 'No changes detected'
      });
    }
  }

  async deployWorkflow(workflow) {
    // Clean workflow data - only send required fields
    const cleanWorkflow = {
      name: workflow.name,
      nodes: workflow.nodes,
      connections: workflow.connections,
      settings: workflow.settings || {},
    };

    const response = await fetch(`${this.secrets.N8N_API_URL}/workflows`, {
      method: 'POST',
      headers: {
        'X-N8N-API-KEY': this.secrets.N8N_API_KEY,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(cleanWorkflow)
    });

    if (!response.ok) {
      const errorData = await response.text();
      throw new Error(`Deployment failed: ${response.status} ${response.statusText} - ${errorData}`);
    }

    return await response.json();
  }

  async updateWorkflow(workflowId, workflow) {
    // Clean workflow data - only send required fields
    const cleanWorkflow = {
      name: workflow.name,
      nodes: workflow.nodes,
      connections: workflow.connections,
      settings: workflow.settings || {},
    };

    const response = await fetch(`${this.secrets.N8N_API_URL}/workflows/${workflowId}`, {
      method: 'PUT',
      headers: {
        'X-N8N-API-KEY': this.secrets.N8N_API_KEY,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(cleanWorkflow)
    });

    if (!response.ok) {
      const errorData = await response.text();
      throw new Error(`Update failed: ${response.status} ${response.statusText} - ${errorData}`);
    }

    return await response.json();
  }

  generateDeploymentReport() {
    console.log('\n📊 N8N Workflow Deployment Report');
    console.log('==================================');
    
    console.log(`\n📈 Summary:`);
    console.log(`   Local Workflows: ${this.deploymentReport.totalLocal}`);
    console.log(`   Remote Workflows: ${this.deploymentReport.totalRemote}`);
    console.log(`   Deployed: ${this.deploymentReport.deployed}`);
    console.log(`   Updated: ${this.deploymentReport.updated}`);
    console.log(`   Skipped: ${this.deploymentReport.skipped.length}`);
    console.log(`   Errors: ${this.deploymentReport.errors.length}`);

    // Report deployed workflows
    if (this.workflowsToDeploy.length > 0) {
      console.log(`\n✅ Deployed Workflows:`);
      this.workflowsToDeploy.forEach(item => {
        console.log(`   - ${item.name} (${item.workflow._category})`);
      });
    }

    // Report updated workflows
    if (this.workflowsToUpdate.length > 0) {
      console.log(`\n🔄 Updated Workflows:`);
      this.workflowsToUpdate.forEach(item => {
        console.log(`   - ${item.name} (${item.workflow._category})`);
      });
    }

    // Report skipped workflows
    if (this.workflowsToSkip.length > 0) {
      console.log(`\n⏭️  Skipped Workflows (No Changes):`);
      this.workflowsToSkip.forEach(item => {
        console.log(`   - ${item.name} (${item.workflow._category})`);
      });
    }

    // Report errors
    if (this.deploymentReport.errors.length > 0) {
      console.log(`\n❌ Errors:`);
      this.deploymentReport.errors.forEach(error => {
        console.log(`   - ${error.workflow}: ${error.error}`);
      });
    }

    // Save detailed report
    this.saveDeploymentReport();
  }

  saveDeploymentReport() {
    const reportPath = path.join(__dirname, 'n8n-deployment-report.json');
    
    const detailedReport = {
      ...this.deploymentReport,
      deployedWorkflows: this.workflowsToDeploy.map(w => ({
        name: w.name,
        category: w.workflow._category,
        file: w.workflow._localFile
      })),
      updatedWorkflows: this.workflowsToUpdate.map(w => ({
        name: w.name,
        category: w.workflow._category,
        file: w.workflow._localFile,
        remoteId: w.remoteId
      })),
      skippedWorkflows: this.workflowsToSkip.map(w => ({
        name: w.name,
        category: w.workflow._category,
        file: w.workflow._localFile
      }))
    };

    fs.writeFileSync(reportPath, JSON.stringify(detailedReport, null, 2));
    console.log(`\n📄 Detailed report saved to: ${reportPath}`);
  }
}

// Run the N8N workflow deployment
async function main() {
  const deployer = new N8NWorkflowDeployer();
  await deployer.initialize();
}

if (require.main === module) {
  main();
}

module.exports = N8NWorkflowDeployer;
