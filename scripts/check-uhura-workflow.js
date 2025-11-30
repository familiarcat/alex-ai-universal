#!/usr/bin/env node

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

async function main() {
  loadZshrcEnv();
  
  console.log('🔍 Checking Uhura workflow settings...');
  
  const response = await makeN8NRequest('/api/v1/workflows/36KPle5mPiMaazG6');
  
  if (response.status === 200) {
    console.log('✅ Uhura workflow fetched successfully');
    console.log('\n📋 Workflow Settings:');
    console.log(JSON.stringify(response.data.settings, null, 2));
    
    // Try to rename with empty settings
    console.log('\n🔄 Attempting rename with empty settings...');
    
    const updatedWorkflow = {
      name: 'CREW - Lieutenant Uhura - Communications & I/O - OpenRouter - Production',
      nodes: response.data.nodes,
      connections: response.data.connections,
      settings: {}
    };
    
    const updateResponse = await makeN8NRequest('/api/v1/workflows/36KPle5mPiMaazG6', 'PUT', updatedWorkflow);
    
    if (updateResponse.status === 200) {
      console.log('✅ Successfully renamed Uhura workflow!');
      console.log('New name:', updateResponse.data.name);
    } else {
      console.log('❌ Still failed:', updateResponse.status);
      console.log('Response:', updateResponse.data);
    }
    
  } else {
    console.error('❌ Failed to fetch Uhura workflow:', response.status);
    console.error('Response:', response.data);
  }
}

main().catch(console.error);
