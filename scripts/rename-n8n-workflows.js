#!/usr/bin/env node

/**
 * 🖖 N8N Workflow Rename Script
 * 
 * Dynamically renames N8N workflows using the API
 * Uses credentials from ~/.zshrc for authentication
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

// List all workflows
async function listWorkflows() {
  console.log('🔍 Fetching all workflows...');
  
  try {
    const response = await makeN8NRequest('/api/v1/workflows');
    
    if (response.status === 200) {
      const workflows = response.data.data || response.data;
      console.log(`✅ Found ${workflows.length} workflows`);
      return workflows;
    } else {
      console.error(`❌ Failed to fetch workflows: ${response.status}`);
      console.error('Response:', response.data);
      return [];
    }
  } catch (error) {
    console.error('❌ Error fetching workflows:', error.message);
    return [];
  }
}

// Get workflow by ID
async function getWorkflow(workflowId) {
  console.log(`🔍 Fetching workflow: ${workflowId}`);
  
  try {
    const response = await makeN8NRequest(`/api/v1/workflows/${workflowId}`);
    
    if (response.status === 200) {
      return response.data;
    } else {
      console.error(`❌ Failed to fetch workflow ${workflowId}: ${response.status}`);
      return null;
    }
  } catch (error) {
    console.error(`❌ Error fetching workflow ${workflowId}:`, error.message);
    return null;
  }
}

// Update workflow name
async function updateWorkflowName(workflowId, newName) {
  console.log(`🔄 Renaming workflow ${workflowId} to: "${newName}"`);
  
  try {
    // First get the current workflow
    const currentWorkflow = await getWorkflow(workflowId);
    if (!currentWorkflow) {
      console.error(`❌ Could not fetch workflow ${workflowId}`);
      return false;
    }
    
    // Update the name - include required fields
    const updatedWorkflow = {
      name: newName,
      nodes: currentWorkflow.nodes,
      connections: currentWorkflow.connections,
      settings: currentWorkflow.settings || {}
    };
    
    const response = await makeN8NRequest(`/api/v1/workflows/${workflowId}`, 'PUT', updatedWorkflow);
    
    if (response.status === 200) {
      console.log(`✅ Successfully renamed workflow to: "${newName}"`);
      return true;
    } else {
      console.error(`❌ Failed to rename workflow: ${response.status}`);
      console.error('Response:', response.data);
      return false;
    }
  } catch (error) {
    console.error(`❌ Error renaming workflow ${workflowId}:`, error.message);
    return false;
  }
}

// Rename workflow by pattern
async function renameWorkflowByPattern(pattern, newName, dryRun = false) {
  console.log(`🔍 Searching for workflows matching pattern: "${pattern}"`);
  
  const workflows = await listWorkflows();
  const matchingWorkflows = workflows.filter(workflow => 
    workflow.name && workflow.name.toLowerCase().includes(pattern.toLowerCase())
  );
  
  if (matchingWorkflows.length === 0) {
    console.log(`❌ No workflows found matching pattern: "${pattern}"`);
    return;
  }
  
  console.log(`✅ Found ${matchingWorkflows.length} matching workflow(s):`);
  matchingWorkflows.forEach(workflow => {
    console.log(`   - ${workflow.name} (ID: ${workflow.id})`);
  });
  
  if (dryRun) {
    console.log(`🔍 DRY RUN: Would rename to: "${newName}"`);
    return;
  }
  
  for (const workflow of matchingWorkflows) {
    await updateWorkflowName(workflow.id, newName);
  }
}

// Rename specific workflow by ID
async function renameWorkflowById(workflowId, newName) {
  console.log(`🔄 Renaming workflow ${workflowId} to: "${newName}"`);
  
  const success = await updateWorkflowName(workflowId, newName);
  if (success) {
    console.log(`🎉 Workflow ${workflowId} successfully renamed to: "${newName}"`);
  } else {
    console.log(`❌ Failed to rename workflow ${workflowId}`);
  }
}

// Interactive workflow selection and renaming
async function interactiveRename() {
  console.log('🎯 Interactive Workflow Rename');
  
  const workflows = await listWorkflows();
  if (workflows.length === 0) {
    console.log('❌ No workflows found');
    return;
  }
  
  console.log('\n📋 Available Workflows:');
  workflows.forEach((workflow, index) => {
    console.log(`${index + 1}. ${workflow.name} (ID: ${workflow.id})`);
  });
  
  // For demo purposes, let's rename the first workflow
  // In a real interactive script, you'd use readline to get user input
  if (workflows.length > 0) {
    const firstWorkflow = workflows[0];
    const newName = `${firstWorkflow.name} (Updated)`;
    
    console.log(`\n🔄 Renaming first workflow to: "${newName}"`);
    await updateWorkflowName(firstWorkflow.id, newName);
  }
}

// Main function
async function main() {
  console.log('🖖 N8N Workflow Rename Script');
  console.log('============================\n');
  
  // Load credentials
  loadZshrcEnv();
  
  // Parse command line arguments
  const args = process.argv.slice(2);
  
  if (args.length === 0) {
    console.log('Usage:');
    console.log('  node rename-n8n-workflows.js list                    # List all workflows');
    console.log('  node rename-n8n-workflows.js rename <id> <name>      # Rename specific workflow');
    console.log('  node rename-n8n-workflows.js pattern <pattern> <name> # Rename workflows matching pattern');
    console.log('  node rename-n8n-workflows.js interactive             # Interactive rename');
    console.log('  node rename-n8n-workflows.js dry-run <pattern> <name> # Dry run rename');
    console.log('');
    console.log('Examples:');
    console.log('  node rename-n8n-workflows.js list');
    console.log('  node rename-n8n-workflows.js rename L6K4bzSKlGC36ABL "New Workflow Name"');
    console.log('  node rename-n8n-workflows.js pattern "Quark" "Quark - Optimized"');
    console.log('  node rename-n8n-workflows.js dry-run "Crew" "Crew - Updated"');
    return;
  }
  
  const command = args[0];
  
  try {
    switch (command) {
      case 'list':
        const workflows = await listWorkflows();
        if (workflows.length > 0) {
          console.log('\n📋 All Workflows:');
          workflows.forEach(workflow => {
            console.log(`   ${workflow.name} (ID: ${workflow.id})`);
          });
        }
        break;
        
      case 'rename':
        if (args.length < 3) {
          console.error('❌ Usage: rename <workflow_id> <new_name>');
          return;
        }
        await renameWorkflowById(args[1], args[2]);
        break;
        
      case 'pattern':
        if (args.length < 3) {
          console.error('❌ Usage: pattern <pattern> <new_name>');
          return;
        }
        await renameWorkflowByPattern(args[1], args[2]);
        break;
        
      case 'dry-run':
        if (args.length < 3) {
          console.error('❌ Usage: dry-run <pattern> <new_name>');
          return;
        }
        await renameWorkflowByPattern(args[1], args[2], true);
        break;
        
      case 'interactive':
        await interactiveRename();
        break;
        
      default:
        console.error(`❌ Unknown command: ${command}`);
        console.log('Available commands: list, rename, pattern, dry-run, interactive');
    }
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

// Run the script
if (require.main === module) {
  main().catch(console.error);
}

module.exports = {
  listWorkflows,
  getWorkflow,
  updateWorkflowName,
  renameWorkflowByPattern,
  renameWorkflowById,
  interactiveRename
};
