#!/usr/bin/env node

/**
 * 🔍 Diagnose Bi-Directional Sync Issues
 * 
 * Identifies why the bi-directional sync isn't working properly
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

class SyncIssueDiagnoser {
  constructor() {
    this.localWorkflows = new Map();
    this.remoteWorkflows = new Map();
    this.syncIssues = [];
  }

  /**
   * Diagnose sync issues
   */
  async diagnoseSyncIssues() {
    console.log('🔍 Diagnosing Bi-Directional Sync Issues');
    console.log('========================================');
    
    try {
      // Step 1: Load local workflows
      await this.loadLocalWorkflows();
      
      // Step 2: Load remote workflows
      await this.loadRemoteWorkflows();
      
      // Step 3: Analyze discrepancies
      this.analyzeDiscrepancies();
      
      // Step 4: Identify sync problems
      this.identifySyncProblems();
      
      // Step 5: Provide solutions
      this.provideSolutions();
      
    } catch (error) {
      console.error('❌ Diagnosis failed:', error.message);
    }
  }

  /**
   * Load local workflows
   */
  async loadLocalWorkflows() {
    console.log('\n📁 Loading Local Workflows...');
    
    const categories = ['CREW', 'SYSTEM', 'COORDINATION', 'ANTI-HALLUCINATION', 'PROJECT', 'UTILITY'];
    let totalLocal = 0;
    
    for (const category of categories) {
      const categoryPath = path.join(__dirname, '..', 'packages', 'core', 'src', `${category.toLowerCase()}-workflows`);
      
      if (fs.existsSync(categoryPath)) {
        const files = fs.readdirSync(categoryPath).filter(file => file.endsWith('.json'));
        
        for (const file of files) {
          const filePath = path.join(categoryPath, file);
          try {
            const content = fs.readFileSync(filePath, 'utf8');
            const workflow = JSON.parse(content);
            
            if (workflow.name) {
              this.localWorkflows.set(workflow.name, {
                name: workflow.name,
                category: category,
                file: file,
                path: filePath,
                id: workflow.id,
                active: workflow.active,
                updatedAt: workflow.updatedAt || workflow.createdAt
              });
              totalLocal++;
            }
          } catch (error) {
            console.log(`⚠️  Could not parse ${file}: ${error.message}`);
          }
        }
        
        console.log(`  📄 ${category}: ${files.length} files`);
      }
    }
    
    console.log(`✅ Loaded ${totalLocal} local workflows`);
  }

  /**
   * Load remote workflows
   */
  async loadRemoteWorkflows() {
    console.log('\n🌐 Loading Remote Workflows...');
    
    const response = await makeN8NRequest('/api/v1/workflows');
    
    if (response.status === 200) {
      const workflows = response.data.data || response.data;
      
      for (const workflow of workflows) {
        this.remoteWorkflows.set(workflow.name, {
          name: workflow.name,
          id: workflow.id,
          active: workflow.active,
          updatedAt: workflow.updatedAt,
          createdAt: workflow.createdAt
        });
      }
      
      console.log(`✅ Loaded ${workflows.length} remote workflows`);
    } else {
      throw new Error(`Failed to fetch remote workflows: ${response.status}`);
    }
  }

  /**
   * Analyze discrepancies
   */
  analyzeDiscrepancies() {
    console.log('\n📊 Analyzing Discrepancies...');
    
    const localNames = Array.from(this.localWorkflows.keys());
    const remoteNames = Array.from(this.remoteWorkflows.keys());
    
    // Find workflows only in local
    const localOnly = localNames.filter(name => !remoteNames.includes(name));
    console.log(`\n📤 Local Only (${localOnly.length}):`);
    localOnly.forEach(name => {
      const workflow = this.localWorkflows.get(name);
      console.log(`  - ${name} (${workflow.category})`);
    });
    
    // Find workflows only in remote
    const remoteOnly = remoteNames.filter(name => !localNames.includes(name));
    console.log(`\n📥 Remote Only (${remoteOnly.length}):`);
    remoteOnly.forEach(name => {
      const workflow = this.remoteWorkflows.get(name);
      console.log(`  - ${name} (ID: ${workflow.id})`);
    });
    
    // Find common workflows with potential issues
    const common = localNames.filter(name => remoteNames.includes(name));
    console.log(`\n🔄 Common Workflows (${common.length}):`);
    
    for (const name of common) {
      const local = this.localWorkflows.get(name);
      const remote = this.remoteWorkflows.get(name);
      
      // Check for discrepancies
      const issues = [];
      
      if (local.id && remote.id && local.id !== remote.id) {
        issues.push('Different IDs');
      }
      
      if (local.active !== remote.active) {
        issues.push(`Active status differs (Local: ${local.active}, Remote: ${remote.active})`);
      }
      
      if (local.updatedAt && remote.updatedAt) {
        const localTime = new Date(local.updatedAt);
        const remoteTime = new Date(remote.updatedAt);
        const timeDiff = Math.abs(localTime - remoteTime);
        
        if (timeDiff > 60000) { // More than 1 minute difference
          issues.push(`Update time differs (${Math.round(timeDiff / 1000)}s)`);
        }
      }
      
      if (issues.length > 0) {
        console.log(`  ⚠️  ${name}: ${issues.join(', ')}`);
        this.syncIssues.push({ name, issues, local, remote });
      } else {
        console.log(`  ✅ ${name}: In sync`);
      }
    }
  }

  /**
   * Identify sync problems
   */
  identifySyncProblems() {
    console.log('\n🔍 Identifying Sync Problems...');
    
    const problems = [];
    
    // Problem 1: Name mismatch
    const nameMismatches = Array.from(this.localWorkflows.entries()).filter(([name, workflow]) => {
      const remoteNames = Array.from(this.remoteWorkflows.keys());
      return !remoteNames.includes(name) && workflow.id && remoteNames.some(remoteName => {
        const remote = this.remoteWorkflows.get(remoteName);
        return remote.id === workflow.id;
      });
    });
    
    if (nameMismatches.length > 0) {
      problems.push({
        type: 'Name Mismatch',
        count: nameMismatches.length,
        description: 'Local and remote workflows have different names but same ID'
      });
    }
    
    // Problem 2: Missing remote workflows
    const missingRemote = Array.from(this.localWorkflows.keys()).filter(name => 
      !Array.from(this.remoteWorkflows.keys()).includes(name)
    );
    
    if (missingRemote.length > 0) {
      problems.push({
        type: 'Missing Remote',
        count: missingRemote.length,
        description: 'Local workflows not found in remote'
      });
    }
    
    // Problem 3: Missing local workflows
    const missingLocal = Array.from(this.remoteWorkflows.keys()).filter(name => 
      !Array.from(this.localWorkflows.keys()).includes(name)
    );
    
    if (missingLocal.length > 0) {
      problems.push({
        type: 'Missing Local',
        count: missingLocal.length,
        description: 'Remote workflows not found in local'
      });
    }
    
    console.log('\n🚨 Identified Problems:');
    problems.forEach((problem, index) => {
      console.log(`\n${index + 1}. ${problem.type} (${problem.count} workflows)`);
      console.log(`   Description: ${problem.description}`);
    });
    
    if (problems.length === 0) {
      console.log('✅ No major sync problems identified');
    }
  }

  /**
   * Provide solutions
   */
  provideSolutions() {
    console.log('\n🔧 SOLUTIONS FOR SYNC ISSUES');
    console.log('=============================');
    
    console.log('\n🎯 SOLUTION 1: Fix Name Mappings');
    console.log('--------------------------------');
    console.log('Create a mapping system to handle name differences between local and remote:');
    console.log('1. Identify workflows by ID rather than name');
    console.log('2. Update sync logic to handle name variations');
    console.log('3. Implement workflow ID-based matching');
    
    console.log('\n🎯 SOLUTION 2: Upload Missing Local Workflows');
    console.log('---------------------------------------------');
    console.log('Upload local workflows that don\'t exist remotely:');
    console.log('1. Use the bi-directional sync script in upload mode');
    console.log('2. Manually upload critical workflows');
    console.log('3. Verify successful deployment');
    
    console.log('\n🎯 SOLUTION 3: Download Missing Remote Workflows');
    console.log('-----------------------------------------------');
    console.log('Download remote workflows that don\'t exist locally:');
    console.log('1. Use the bi-directional sync script in download mode');
    console.log('2. Organize downloaded workflows by category');
    console.log('3. Update local workflow management');
    
    console.log('\n🎯 SOLUTION 4: Implement Real-time Sync');
    console.log('--------------------------------------');
    console.log('Set up automatic synchronization:');
    console.log('1. Monitor N8N API for changes');
    console.log('2. Automatically sync on workflow updates');
    console.log('3. Implement conflict resolution');
    
    console.log('\n🎯 SOLUTION 5: N8N Documentation Integration');
    console.log('-------------------------------------------');
    console.log('For your documentation question:');
    console.log('1. Add N8N API documentation to Cursor AI\'s knowledge base');
    console.log('2. Include workflow management best practices');
    console.log('3. Document bi-directional sync procedures');
    console.log('4. Create troubleshooting guides');
  }
}

// Main execution
async function main() {
  loadZshrcEnv();
  
  const diagnoser = new SyncIssueDiagnoser();
  await diagnoser.diagnoseSyncIssues();
  
  console.log('\n🎯 Sync Issue Diagnosis Complete!');
  console.log('=================================');
  console.log('Review the analysis above to understand sync discrepancies.');
}

main().catch(console.error);
