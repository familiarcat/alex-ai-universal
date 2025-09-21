#!/usr/bin/env node

/**
 * 🔄 Force N8N UI Refresh
 * 
 * Forces the N8N UI to refresh by deactivating and reactivating the workflow
 * This should make the UI reflect the current API state
 */

const https = require('https');

// Load environment variables from ~/.zshrc
function loadZshrcEnv() {
  try {
    const zshrcPath = require('path').join(process.env.HOME, '.zshrc');
    const zshrcContent = require('fs').readFileSync(zshrcPath, 'utf8');
    
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

// Function to force UI refresh
async function forceUIRefresh() {
  console.log('🔄 Forcing N8N UI Refresh');
  console.log('==========================');
  
  try {
    // Step 1: Get current workflow
    console.log('📋 Getting current workflow...');
    const getResponse = await makeN8NRequest(`workflows/${WORKFLOW_ID}`);
    
    if (getResponse.statusCode !== 200) {
      throw new Error(`Failed to get workflow: ${getResponse.statusCode}`);
    }
    
    const workflow = getResponse.data;
    console.log(`✅ Workflow found: ${workflow.name}`);
    console.log(`   Active: ${workflow.active}`);
    console.log(`   Nodes: ${workflow.nodes.length}`);
    console.log(`   Connections: ${Object.keys(workflow.connections).length}`);
    
    // Step 2: Deactivate workflow
    console.log('⏸️  Deactivating workflow...');
    const deactivateResponse = await makeN8NRequest(`workflows/${WORKFLOW_ID}`, 'PUT', {
      ...workflow,
      active: false
    });
    
    if (deactivateResponse.statusCode !== 200) {
      throw new Error(`Failed to deactivate workflow: ${deactivateResponse.statusCode}`);
    }
    
    console.log('✅ Workflow deactivated');
    
    // Step 3: Wait a moment
    console.log('⏳ Waiting for deactivation to process...');
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Step 4: Reactivate workflow
    console.log('▶️  Reactivating workflow...');
    const reactivateResponse = await makeN8NRequest(`workflows/${WORKFLOW_ID}`, 'PUT', {
      ...workflow,
      active: true
    });
    
    if (reactivateResponse.statusCode !== 200) {
      throw new Error(`Failed to reactivate workflow: ${reactivateResponse.statusCode}`);
    }
    
    console.log('✅ Workflow reactivated');
    
    // Step 5: Verify final state
    console.log('🔍 Verifying final state...');
    const finalResponse = await makeN8NRequest(`workflows/${WORKFLOW_ID}`);
    
    if (finalResponse.statusCode === 200) {
      const finalWorkflow = finalResponse.data;
      console.log('✅ Final verification:');
      console.log(`   Name: ${finalWorkflow.name}`);
      console.log(`   Active: ${finalWorkflow.active}`);
      console.log(`   Nodes: ${finalWorkflow.nodes.length}`);
      console.log(`   Connections: ${Object.keys(finalWorkflow.connections).length}`);
      console.log(`   Updated: ${finalWorkflow.updatedAt}`);
    }
    
    console.log('');
    console.log('🎉 N8N UI Refresh Complete!');
    console.log('============================');
    console.log('The workflow has been deactivated and reactivated.');
    console.log('This should force the N8N UI to refresh and reflect');
    console.log('the current API state.');
    console.log('');
    console.log('🌐 Check the UI at:');
    console.log(`   ${N8N_BASE_URL}/workflow/${WORKFLOW_ID}`);
    console.log('');
    console.log('💡 If the UI still doesn\'t reflect changes:');
    console.log('   1. Hard refresh your browser (Ctrl+Shift+R)');
    console.log('   2. Clear browser cache');
    console.log('   3. Try opening in an incognito/private window');
    
  } catch (error) {
    console.error('❌ Error forcing UI refresh:', error.message);
    process.exit(1);
  }
}

// Run the refresh
forceUIRefresh();