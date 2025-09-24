#!/usr/bin/env node

/**
 * 🔧 Fix N8N Connections
 * 
 * Explicitly updates the N8N workflow with the correct connections from local file
 * This should fix the UI display issue where connections appear as null
 */

const https = require('https');
const fs = require('fs');

// Load environment variables from ~/.zshrc
function loadZshrcEnv() {
  try {
    const zshrcPath = require('path').join(process.env.HOME, '.zshrc');
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
const WORKFLOW_ID = 'L6K4bzSKlGC36ABL';
const LOCAL_WORKFLOW_PATH = '/Users/bradygeorgen/Documents/workspace/alex-ai-universal/packages/core/src/crew-workflows/quark-workflow.json';

if (!N8N_API_KEY) {
  console.error('❌ N8N_API_KEY not found in ~/.zshrc');
  process.exit(1);
}

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

// Function to fix N8N connections
async function fixN8NConnections() {
  console.log('🔧 Fixing N8N Connections');
  console.log('==========================');
  
  try {
    // Step 1: Load local workflow
    console.log('📄 Loading local workflow...');
    const localWorkflow = JSON.parse(fs.readFileSync(LOCAL_WORKFLOW_PATH, 'utf8'));
    console.log(`✅ Local workflow loaded: ${localWorkflow.name}`);
    console.log(`   Nodes: ${localWorkflow.nodes.length}`);
    console.log(`   Connections: ${Object.keys(localWorkflow.connections).length}`);
    
    // Step 2: Get current N8N workflow
    console.log('🌐 Getting current N8N workflow...');
    const getResponse = await makeN8NRequest(`workflows/${WORKFLOW_ID}`);
    
    if (getResponse.statusCode !== 200) {
      throw new Error(`Failed to get workflow: ${getResponse.statusCode}`);
    }
    
    const n8nWorkflow = getResponse.data;
    console.log(`✅ N8N workflow found: ${n8nWorkflow.name}`);
    console.log(`   Nodes: ${n8nWorkflow.nodes.length}`);
    console.log(`   Connections: ${n8nWorkflow.connections ? Object.keys(n8nWorkflow.connections).length : 'NULL'}`);
    
    // Step 3: Update N8N workflow with local connections
    console.log('🔄 Updating N8N workflow with local connections...');
    
    const updateData = {
      name: n8nWorkflow.name,
      nodes: localWorkflow.nodes,
      connections: localWorkflow.connections,
      settings: {}
    };
    
    const updateResponse = await makeN8NRequest(`workflows/${WORKFLOW_ID}`, 'PUT', updateData);
    
    if (updateResponse.statusCode !== 200) {
      console.error('❌ Update failed with response:', JSON.stringify(updateResponse.data, null, 2));
      throw new Error(`Failed to update workflow: ${updateResponse.statusCode} - ${JSON.stringify(updateResponse.data)}`);
    }
    
    console.log('✅ N8N workflow updated successfully');
    
    // Step 4: Verify the update
    console.log('🔍 Verifying the update...');
    const verifyResponse = await makeN8NRequest(`workflows/${WORKFLOW_ID}`);
    
    if (verifyResponse.statusCode === 200) {
      const updatedWorkflow = verifyResponse.data;
      console.log('✅ Verification successful:');
      console.log(`   Name: ${updatedWorkflow.name}`);
      console.log(`   Nodes: ${updatedWorkflow.nodes.length}`);
      console.log(`   Connections: ${updatedWorkflow.connections ? Object.keys(updatedWorkflow.connections).length : 'NULL'}`);
      
      if (updatedWorkflow.connections) {
        console.log('🔗 Connection details:');
        Object.keys(updatedWorkflow.connections).forEach(nodeId => {
          const node = updatedWorkflow.nodes.find(n => n.id === nodeId);
          const nodeName = node ? node.name : nodeId;
          const connectionCount = updatedWorkflow.connections[nodeId].main ? 
            updatedWorkflow.connections[nodeId].main.length : 0;
          console.log(`   ${nodeName}: ${connectionCount} connections`);
        });
      }
    }
    
    console.log('');
    console.log('🎉 N8N Connections Fixed!');
    console.log('==========================');
    console.log('The workflow connections have been updated in N8N.');
    console.log('The UI should now properly display all connections.');
    console.log('');
    console.log('🌐 Check the UI at:');
    console.log(`   ${N8N_BASE_URL}/workflow/${WORKFLOW_ID}`);
    console.log('');
    console.log('💡 If the UI still doesn\'t show connections:');
    console.log('   1. Hard refresh your browser (Ctrl+Shift+R)');
    console.log('   2. Clear browser cache');
    console.log('   3. Wait a few seconds for N8N to process the changes');
    
  } catch (error) {
    console.error('❌ Error fixing N8N connections:', error.message);
    process.exit(1);
  }
}

// Run the fix
fixN8NConnections();
