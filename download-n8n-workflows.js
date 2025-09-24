#!/usr/bin/env node

/**
 * N8N Workflow Downloader
 * 
 * This script downloads all remote N8N workflows and saves them as local JSON files
 * to achieve complete bidirectional sync between remote and local workflows.
 */

const fs = require('fs');
const path = require('path');
const os = require('os');

class N8NWorkflowDownloader {
  constructor() {
    this.secrets = {};
    this.remoteWorkflows = [];
    this.downloadReport = {
      timestamp: new Date().toISOString(),
      totalRemote: 0,
      downloaded: 0,
      skipped: 0,
      errors: [],
      categories: {}
    };
  }

  async initialize() {
    console.log('📥 N8N Workflow Downloader');
    console.log('==========================\n');

    try {
      // Step 1: Load secrets from ~/.zshrc
      await this.loadSecretsFromZshrc();
      
      // Step 2: Fetch all remote workflows
      await this.fetchRemoteWorkflows();
      
      // Step 3: Create local directory structure
      await this.createLocalDirectories();
      
      // Step 4: Download workflows by category
      await this.downloadWorkflowsByCategory();
      
      // Step 5: Generate download report
      this.generateDownloadReport();
      
    } catch (error) {
      console.error('❌ Download failed:', error.message);
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
  }

  async fetchRemoteWorkflows() {
    console.log('\n🌐 Fetching all remote workflows...');
    
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
      this.downloadReport.totalRemote = this.remoteWorkflows.length;

      console.log(`✅ Fetched ${this.remoteWorkflows.length} remote workflows`);
      
    } catch (error) {
      console.error('❌ Failed to fetch remote workflows:', error.message);
      throw error;
    }
  }

  async createLocalDirectories() {
    console.log('\n📁 Creating local directory structure...');
    
    const baseDir = path.join(__dirname, 'n8n-workflows');
    const categories = [
      'crew-workflows',
      'system-workflows', 
      'coordination-workflows',
      'anti-hallucination-workflows',
      'project-workflows',
      'utility-workflows',
      'downloaded-workflows'
    ];

    // Create base directory
    if (!fs.existsSync(baseDir)) {
      fs.mkdirSync(baseDir, { recursive: true });
    }

    // Create category directories
    for (const category of categories) {
      const categoryDir = path.join(baseDir, category);
      if (!fs.existsSync(categoryDir)) {
        fs.mkdirSync(categoryDir, { recursive: true });
      }
    }

    console.log('✅ Local directory structure created');
  }

  detectWorkflowCategory(workflow) {
    const name = workflow.name.toLowerCase();
    
    // Crew workflows
    if (name.includes('crew') || name.includes('captain') || name.includes('commander') || 
        name.includes('lieutenant') || name.includes('doctor') || name.includes('counselor') ||
        name.includes('quark') || name.includes('data') || name.includes('riker') ||
        name.includes('troi') || name.includes('crusher') || name.includes('la forge') ||
        name.includes('uhura') || name.includes('worf') || name.includes('spock') ||
        name.includes('tasha yar')) {
      return 'crew-workflows';
    }
    
    // System workflows
    if (name.includes('system') || name.includes('mission control') || name.includes('coordination')) {
      return 'system-workflows';
    }
    
    // Coordination workflows
    if (name.includes('coordination') || name.includes('collaboration') || name.includes('observation lounge')) {
      return 'coordination-workflows';
    }
    
    // Anti-hallucination workflows
    if (name.includes('anti-hallucination') || name.includes('hallucination') || name.includes('detection')) {
      return 'anti-hallucination-workflows';
    }
    
    // Project workflows
    if (name.includes('project') || name.includes('alex ai') || name.includes('job opportunities') ||
        name.includes('resume') || name.includes('contact') || name.includes('mcp')) {
      return 'project-workflows';
    }
    
    // Utility workflows
    if (name.includes('utility') || name.includes('generic') || name.includes('controller') ||
        name.includes('management') || name.includes('sub-workflow')) {
      return 'utility-workflows';
    }
    
    // Default to downloaded-workflows for uncategorized
    return 'downloaded-workflows';
  }

  sanitizeFileName(name) {
    return name
      .replace(/[^a-zA-Z0-9\s-_]/g, '') // Remove special characters
      .replace(/\s+/g, '-') // Replace spaces with hyphens
      .replace(/-+/g, '-') // Replace multiple hyphens with single
      .toLowerCase()
      .trim();
  }

  async downloadWorkflowsByCategory() {
    console.log('\n📥 Downloading workflows by category...');
    
    // Group workflows by category
    const workflowsByCategory = {};
    
    for (const workflow of this.remoteWorkflows) {
      const category = this.detectWorkflowCategory(workflow);
      
      if (!workflowsByCategory[category]) {
        workflowsByCategory[category] = [];
      }
      
      workflowsByCategory[category].push(workflow);
    }

    // Download workflows for each category
    for (const [category, workflows] of Object.entries(workflowsByCategory)) {
      console.log(`\n📂 Processing ${category}: ${workflows.length} workflows`);
      
      this.downloadReport.categories[category] = {
        total: workflows.length,
        downloaded: 0,
        skipped: 0,
        errors: []
      };

      for (const workflow of workflows) {
        try {
          await this.downloadWorkflow(workflow, category);
          this.downloadReport.categories[category].downloaded++;
          this.downloadReport.downloaded++;
        } catch (error) {
          console.log(`   ❌ Failed to download ${workflow.name}: ${error.message}`);
          this.downloadReport.categories[category].errors.push({
            workflow: workflow.name,
            error: error.message
          });
          this.downloadReport.errors.push({
            workflow: workflow.name,
            category,
            error: error.message
          });
        }
      }
    }
  }

  async downloadWorkflow(workflow, category) {
    const baseDir = path.join(__dirname, 'n8n-workflows', category);
    const fileName = `${this.sanitizeFileName(workflow.name)}.json`;
    const filePath = path.join(baseDir, fileName);

    // Check if file already exists
    if (fs.existsSync(filePath)) {
      console.log(`   ⏭️  Skipping ${workflow.name} (already exists)`);
      this.downloadReport.skipped++;
      this.downloadReport.categories[category].skipped++;
      return;
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
      // Add metadata for local management
      _downloadedAt: new Date().toISOString(),
      _category: category,
      _source: 'remote-n8n'
    };

    // Write workflow to file
    fs.writeFileSync(filePath, JSON.stringify(cleanWorkflow, null, 2));
    
    console.log(`   ✅ Downloaded ${workflow.name}`);
  }

  generateDownloadReport() {
    console.log('\n📊 N8N Workflow Download Report');
    console.log('=================================');
    
    console.log(`\n📈 Summary:`);
    console.log(`   Total Remote Workflows: ${this.downloadReport.totalRemote}`);
    console.log(`   Downloaded: ${this.downloadReport.downloaded}`);
    console.log(`   Skipped: ${this.downloadReport.skipped}`);
    console.log(`   Errors: ${this.downloadReport.errors.length}`);

    // Report by category
    console.log(`\n📂 Downloads by Category:`);
    for (const [category, stats] of Object.entries(this.downloadReport.categories)) {
      console.log(`   ${category}:`);
      console.log(`     Total: ${stats.total}`);
      console.log(`     Downloaded: ${stats.downloaded}`);
      console.log(`     Skipped: ${stats.skipped}`);
      console.log(`     Errors: ${stats.errors.length}`);
    }

    // Report errors
    if (this.downloadReport.errors.length > 0) {
      console.log(`\n❌ Errors:`);
      this.downloadReport.errors.forEach(error => {
        console.log(`   - ${error.workflow} (${error.category}): ${error.error}`);
      });
    }

    // Save detailed report
    this.saveDownloadReport();
  }

  saveDownloadReport() {
    const reportPath = path.join(__dirname, 'n8n-download-report.json');
    
    const detailedReport = {
      ...this.downloadReport,
      downloadedWorkflows: this.remoteWorkflows.map(w => ({
        id: w.id,
        name: w.name,
        category: this.detectWorkflowCategory(w),
        active: w.active,
        createdAt: w.createdAt,
        updatedAt: w.updatedAt
      }))
    };

    fs.writeFileSync(reportPath, JSON.stringify(detailedReport, null, 2));
    console.log(`\n📄 Detailed report saved to: ${reportPath}`);
  }
}

// Run the N8N workflow downloader
async function main() {
  const downloader = new N8NWorkflowDownloader();
  await downloader.initialize();
}

if (require.main === module) {
  main();
}

module.exports = N8NWorkflowDownloader;
