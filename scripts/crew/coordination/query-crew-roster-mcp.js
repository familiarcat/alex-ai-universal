#!/usr/bin/env node

/**
 * 🖖 Query Crew Roster from MCP System
 * 
 * Queries the MCP system for crew roster information stored in RAG
 */

const https = require('https');
const { loadCrewCredentials } = require('./utils/load-crew-credentials');

console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('🖖 Crew Roster Check - MCP System');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

const credentials = loadCrewCredentials();
const MCP_URL = process.env.MCP_SERVER_URL || 'https://mcp.pbradygeorgen.com';
const MCP_API_KEY = process.env.MCP_API_KEY || credentials.n8n?.apiKey || credentials.mcp?.apiKey;

if (!MCP_API_KEY) {
  console.error('❌ MCP API key not found');
  process.exit(1);
}

// Query crew roster from MCP memory system
async function queryCrewRoster() {
  return new Promise((resolve, reject) => {
    const url = new URL('/api/memory/query', MCP_URL);
    
    const queryPayload = {
      query: 'crew roster crew members list all crew',
      options: {
        limit: 20,
        category: 'crew',
        tags: ['crew', 'roster', 'crew-member']
      }
    };

    const options = {
      hostname: url.hostname,
      port: url.port || 443,
      path: url.pathname,
      method: 'POST',
      headers: {
        'X-MCP-API-KEY': MCP_API_KEY,
        'Content-Type': 'application/json'
      },
      timeout: 30000,
      rejectUnauthorized: false // Allow self-signed or mismatched certificates during setup
    };

    const req = https.request(options, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        if (res.statusCode === 200) {
          try {
            const data = JSON.parse(body);
            resolve(data);
          } catch (e) {
            reject(new Error(`Parse error: ${e.message}`));
          }
        } else {
          reject(new Error(`HTTP ${res.statusCode}: ${body}`));
        }
      });
    });

    req.on('error', reject);
    req.on('timeout', () => {
      req.destroy();
      reject(new Error('Request timeout'));
    });

    req.write(JSON.stringify(queryPayload));
    req.end();
  });
}

// Get MCP status
async function getMCPStatus() {
  return new Promise((resolve, reject) => {
    const url = new URL('/api/status', MCP_URL);
    
    const options = {
      hostname: url.hostname,
      port: url.port || 443,
      path: url.pathname,
      method: 'GET',
      headers: {
        'X-MCP-API-KEY': MCP_API_KEY,
        'Content-Type': 'application/json'
      },
      timeout: 10000,
      rejectUnauthorized: false // Allow self-signed or mismatched certificates during setup
    };

    const req = https.request(options, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        if (res.statusCode === 200) {
          try {
            const data = JSON.parse(body);
            resolve(data);
          } catch (e) {
            reject(new Error(`Parse error: ${e.message}`));
          }
        } else {
          reject(new Error(`HTTP ${res.statusCode}: ${body}`));
        }
      });
    });

    req.on('error', reject);
    req.on('timeout', () => {
      req.destroy();
      reject(new Error('Request timeout'));
    });

    req.end();
  });
}

async function main() {
  console.log('📡 Step 1: Checking MCP Server Status...\n');
  
  try {
    const status = await getMCPStatus();
    console.log('✅ MCP Server Status:');
    console.log(`   Status: ${status.status}`);
    console.log(`   Services:`);
    Object.entries(status.services || {}).forEach(([service, available]) => {
      console.log(`     ${service}: ${available ? '✅' : '❌'}`);
    });
    console.log('');
  } catch (error) {
    console.log(`⚠️  Status check failed: ${error.message}\n`);
  }

  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('📋 Step 2: Querying Crew Roster from RAG...');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  try {
    const result = await queryCrewRoster();
    
    if (result.success && result.result && result.result.length > 0) {
      console.log(`✅ Found ${result.result.length} crew-related memories in RAG\n`);
      
      console.log('👥 Crew Information Found:');
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
      
      result.result.forEach((memory, index) => {
        console.log(`[${index + 1}] ${memory.title || 'Untitled'}`);
        if (memory.content) {
          const preview = memory.content.substring(0, 200).replace(/\n/g, ' ');
          console.log(`    ${preview}...`);
        }
        if (memory.metadata) {
          console.log(`    Metadata: ${JSON.stringify(memory.metadata).substring(0, 100)}`);
        }
        console.log('');
      });
    } else {
      console.log('⚠️  No crew roster found in RAG system');
      console.log('   This may be normal if crew roster hasn\'t been stored yet.\n');
      
      console.log('💡 To store crew roster in RAG:');
      console.log('   1. Run: node scripts/sync-crew-roster.sh');
      console.log('   2. Or query crew workflows from n8n and store in MCP\n');
    }
  } catch (error) {
    console.log(`❌ Query failed: ${error.message}\n`);
  }

  // Also check local crew files
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('📁 Step 3: Checking Local Crew Files...');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  const fs = require('fs');
  const path = require('path');
  
  const crewMembersDir = path.join(__dirname, '..', 'crew-members');
  if (fs.existsSync(crewMembersDir)) {
    const crewFiles = fs.readdirSync(crewMembersDir).filter(f => f.endsWith('.json'));
    console.log(`✅ Found ${crewFiles.length} crew member profiles locally\n`);
    
    console.log('👥 Local Crew Roster:');
    crewFiles.forEach((file, index) => {
      try {
        const crewData = JSON.parse(fs.readFileSync(path.join(crewMembersDir, file), 'utf8'));
        const name = crewData.name || crewData.personality?.name || file.replace('.json', '');
        const role = crewData.personality?.role || crewData.expertise?.primary || 'Unknown';
        console.log(`   ${index + 1}. ${name} - ${role}`);
      } catch (e) {
        console.log(`   ${index + 1}. ${file.replace('.json', '')} (parse error)`);
      }
    });
    console.log('');
  } else {
    console.log('⚠️  Crew members directory not found\n');
  }

  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
}

main().catch(error => {
  console.error('❌ Error:', error);
  process.exit(1);
});

