#!/usr/bin/env node

/**
 * 🖖 Sync Crew Roster from MCP
 * 
 * Queries MCP server for authoritative crew roster and syncs to:
 * - Local systems (crew-manager.ts, crew-assignment-system.ts, etc.)
 * - n8n workflows (updates hardcoded lists)
 * - Local crew-roster.json (for backward compatibility)
 * 
 * Crew: La Forge (MCP integration), O'Brien (local updates), Riker (n8n updates)
 */

const fs = require('fs');
const path = require('path');
const https = require('https');
const http = require('http');

const MCP_SERVER_URL = process.env.MCP_SERVER_URL || 'http://localhost:5679';
const MCP_API_KEY = process.env.MCP_API_KEY || process.env.N8N_API_KEY;

async function queryMCPRoster() {
  return new Promise((resolve, reject) => {
    const url = new URL(`${MCP_SERVER_URL}/api/crew/roster`);
    const protocol = url.protocol === 'https:' ? https : http;
    
    const options = {
      hostname: url.hostname,
      port: url.port || (url.protocol === 'https:' ? 443 : 80),
      path: url.pathname,
      method: 'GET',
      headers: {
        'X-MCP-API-KEY': MCP_API_KEY || '',
        'Content-Type': 'application/json'
      },
      timeout: 10000
    };
    
    const req = protocol.request(options, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        if (res.statusCode === 200) {
          try {
            const result = JSON.parse(data);
            if (result.success && result.roster) {
              resolve(result.roster);
            } else {
              reject(new Error('Invalid response format from MCP server'));
            }
          } catch (error) {
            reject(new Error(`Failed to parse response: ${error.message}`));
          }
        } else {
          reject(new Error(`MCP server returned status ${res.statusCode}: ${data}`));
        }
      });
    });
    
    req.on('error', (error) => {
      reject(new Error(`Failed to connect to MCP server: ${error.message}`));
    });
    
    req.on('timeout', () => {
      req.destroy();
      reject(new Error('Request timeout'));
    });
    
    req.end();
  });
}

function updateLocalCrewManager(mcpRoster) {
  const rootDir = process.cwd();
  const crewManagerPath = path.join(rootDir, 'packages/core/src/crew-manager.ts');
  
  if (!fs.existsSync(crewManagerPath)) {
    console.warn('⚠️  crew-manager.ts not found, skipping');
    return false;
  }
  
  try {
    let content = fs.readFileSync(crewManagerPath, 'utf-8');
    
    // Find the initializeCrewMembers function
    const startMarker = 'private initializeCrewMembers(): void {';
    const endMarker = '}';
    
    const startIndex = content.indexOf(startMarker);
    if (startIndex === -1) {
      console.warn('⚠️  Could not find initializeCrewMembers function');
      return false;
    }
    
    // Find the end of the members array
    let braceCount = 0;
    let inArray = false;
    let arrayStart = -1;
    let arrayEnd = -1;
    
    for (let i = startIndex; i < content.length; i++) {
      if (content.substring(i, i + 6) === 'const members') {
        // Find the opening bracket
        for (let j = i; j < content.length; j++) {
          if (content[j] === '[') {
            arrayStart = j;
            inArray = true;
            braceCount = 1;
            break;
          }
        }
      }
      
      if (inArray) {
        if (content[i] === '[') braceCount++;
        if (content[i] === ']') {
          braceCount--;
          if (braceCount === 0) {
            arrayEnd = i + 1;
            break;
          }
        }
      }
    }
    
    if (arrayStart === -1 || arrayEnd === -1) {
      console.warn('⚠️  Could not find members array');
      return false;
    }
    
    // Generate new members array from MCP roster
    const membersCode = mcpRoster.crewMembers.map(member => {
      return `      {
        id: '${member.id}',
        name: '${member.name}',
        role: '${member.role}',
        specialization: ${JSON.stringify(member.specialization)},
        status: 'active' as const,
        lastActivity: new Date(),
        capabilities: ${JSON.stringify(member.capabilities)}
      }`;
    }).join(',\n');
    
    const newMembersArray = `const members: CrewMember[] = [\n${membersCode}\n    ]`;
    
    // Replace the array
    content = content.substring(0, arrayStart) + newMembersArray + content.substring(arrayEnd);
    
    fs.writeFileSync(crewManagerPath, content, 'utf-8');
    console.log('✅ Updated packages/core/src/crew-manager.ts');
    return true;
  } catch (error) {
    console.error(`❌ Error updating crew-manager.ts: ${error.message}`);
    return false;
  }
}

function updateCrewRosterJson(mcpRoster) {
  const rootDir = process.cwd();
  const rosterPath = path.join(rootDir, 'crew-roster.json');
  
  // Convert MCP roster format to crew-roster.json format
  const crewRosterJson = {
    version: mcpRoster.version,
    lastUpdated: mcpRoster.lastUpdated,
    n8nInstance: process.env.N8N_INSTANCE || 'https://n8n.pbradygeorgen.com',
    totalCrewMembers: mcpRoster.totalCrewMembers,
    activeCrewMembers: mcpRoster.activeCrewMembers,
    source: 'mcp-server',
    crewMembers: mcpRoster.crewMembers.map(member => ({
      id: member.n8nWorkflowId || member.id,
      name: `${member.name} - ${member.role}`,
      fullName: `CREW - ${member.name} - ${member.role} - OpenRouter - Production`,
      status: member.active ? 'active' : 'inactive',
      workflowUrl: member.n8nWorkflowId 
        ? `https://n8n.pbradygeorgen.com/workflow/${member.n8nWorkflowId}`
        : null,
      nodes: 7, // Default
      lastUpdated: new Date().toISOString().split('T')[0],
      active: member.active,
      specialization: member.specialization.join(', '),
      cost: member.cost,
      capacity: member.capacity,
      preferredModels: member.preferredModels
    }))
  };
  
  fs.writeFileSync(rosterPath, JSON.stringify(crewRosterJson, null, 2), 'utf-8');
  console.log('✅ Updated crew-roster.json');
  return true;
}

function updateN8NWorkflows(mcpRoster) {
  const rootDir = process.cwd();
  const n8nDir = path.join(rootDir, 'n8n-workflows');
  
  if (!fs.existsSync(n8nDir)) {
    console.warn('⚠️  n8n-workflows directory not found');
    return false;
  }
  
  const crewMemberNames = mcpRoster.crewMembers.map(m => m.name);
  const updatedFiles = [];
  
  function scanDirectory(dir) {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    
    entries.forEach(entry => {
      const fullPath = path.join(dir, entry.name);
      
      if (entry.isDirectory()) {
        scanDirectory(fullPath);
      } else if (entry.isFile() && entry.name.endsWith('.json')) {
        try {
          const content = fs.readFileSync(fullPath, 'utf-8');
          const workflow = JSON.parse(content);
          
          // Look for crewMembers arrays in function code
          let modified = false;
          
          if (workflow.nodes) {
            workflow.nodes.forEach(node => {
              if (node.parameters && node.parameters.jsCode) {
                const oldCode = node.parameters.jsCode;
                
                // Check if it has a hardcoded crewMembers array
                const crewMatch = oldCode.match(/crewMembers\s*=\s*\[([^\]]+)\]/);
                if (crewMatch) {
                  // Replace with MCP roster
                  const newCrewArray = `crewMembers = ${JSON.stringify(crewMemberNames)}`;
                  node.parameters.jsCode = oldCode.replace(
                    /crewMembers\s*=\s*\[[^\]]+\]/,
                    newCrewArray
                  );
                  modified = true;
                }
              }
            });
          }
          
          if (modified) {
            fs.writeFileSync(fullPath, JSON.stringify(workflow, null, 2), 'utf-8');
            updatedFiles.push(path.relative(rootDir, fullPath));
          }
        } catch (error) {
          // Skip invalid JSON
        }
      }
    });
  }
  
  scanDirectory(n8nDir);
  
  if (updatedFiles.length > 0) {
    console.log(`✅ Updated ${updatedFiles.length} n8n workflow files:`);
    updatedFiles.forEach(file => console.log(`   - ${file}`));
    return true;
  } else {
    console.log('ℹ️  No n8n workflows found with hardcoded crew rosters');
    return false;
  }
}

async function syncCrewRosterFromMCP() {
  console.log('🖖 Sync Crew Roster from MCP\n');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
  
  console.log('🔧 Lt. Cmdr. La Forge - Querying MCP server for crew roster...\n');
  
  let mcpRoster;
  try {
    mcpRoster = await queryMCPRoster();
    console.log(`✅ Retrieved crew roster from MCP server`);
    console.log(`   Total Members: ${mcpRoster.totalCrewMembers}`);
    console.log(`   Active Members: ${mcpRoster.activeCrewMembers}`);
    console.log(`   Source: ${mcpRoster.source}\n`);
  } catch (error) {
    console.error(`❌ Failed to query MCP server: ${error.message}\n`);
    console.log('⚠️  Falling back to local crew-roster.json\n');
    
    // Fallback to local roster
    const rosterPath = path.join(process.cwd(), 'crew-roster.json');
    if (fs.existsSync(rosterPath)) {
      const localRoster = JSON.parse(fs.readFileSync(rosterPath, 'utf-8'));
      // Convert to MCP format
      mcpRoster = {
        version: '2.0.0',
        source: 'local-fallback',
        totalCrewMembers: localRoster.totalCrewMembers,
        activeCrewMembers: localRoster.activeCrewMembers,
        crewMembers: localRoster.crewMembers.map(m => ({
          id: m.id.toLowerCase().replace(/[^a-z0-9_]/g, '_'),
          name: m.name.split(' - ')[0] || m.name,
          role: m.name.split(' - ')[1] || 'Unknown',
          specialization: [],
          capabilities: [],
          active: m.active,
          n8nWorkflowId: m.id,
          cost: 'medium',
          capacity: 'medium',
          preferredModels: []
        }))
      };
    } else {
      console.error('❌ No fallback roster available');
      return false;
    }
  }
  
  console.log('🛠️  Chief O\'Brien - Updating local systems...\n');
  
  // Update local systems
  const updates = {
    crewManager: updateLocalCrewManager(mcpRoster),
    crewRosterJson: updateCrewRosterJson(mcpRoster)
  };
  
  console.log('\n⚡ Commander Riker - Updating n8n workflows...\n');
  
  // Update n8n workflows
  updates.n8nWorkflows = updateN8NWorkflows(mcpRoster);
  
  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
  console.log('✅ Crew roster sync complete!\n');
  console.log('📊 Summary:');
  console.log(`   MCP Roster: ${mcpRoster.totalCrewMembers} members`);
  console.log(`   Local Updates: ${Object.values(updates).filter(Boolean).length} systems updated`);
  console.log(`   Source: ${mcpRoster.source}\n`);
  
  return { mcpRoster, updates };
}

if (require.main === module) {
  syncCrewRosterFromMCP().catch(console.error);
}

module.exports = { syncCrewRosterFromMCP, queryMCPRoster };

