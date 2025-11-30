#!/usr/bin/env node

/**
 * 🖖 Crew Roster Unification System
 * 
 * Analyzes crew roster inconsistencies across:
 * - Local system (multiple definitions)
 * - n8n workflows (hardcoded lists)
 * - MCP server (source of truth)
 * 
 * Crew Coordination:
 * - Quark & Riker: Team organization and optimization
 * - Data: Analysis and comparison
 * - La Forge: MCP integration
 * - Picard: Strategic resolution
 * - O'Brien: Pragmatic implementation
 */

const fs = require('fs');
const path = require('path');

const CREW_TEAMS = [
  {
    team: 'Analysis & Comparison',
    members: ['data', 'la_forge'],
    task: 'Analyze roster differences across systems'
  },
  {
    team: 'MCP Integration',
    members: ['la_forge', 'data'],
    task: 'Extract MCP crew definitions and make them source of truth'
  },
  {
    team: 'Local System Updates',
    members: ['obrien', 'riker'],
    task: 'Update local systems to use MCP roster'
  },
  {
    team: 'n8n Workflow Updates',
    members: ['riker', 'uhura'],
    task: 'Update n8n workflows to use MCP roster'
  },
  {
    team: 'Cost Optimization',
    members: ['quark', 'riker'],
    task: 'Ensure cost/crew optimization processes are preserved'
  },
  {
    team: 'Strategic Oversight',
    members: ['picard', 'riker'],
    task: 'Review and approve unified roster'
  }
];

function loadLocalRosters() {
  const rootDir = process.cwd();
  const rosters = {
    crewRosterJson: null,
    crewManager: null,
    crewAssignment: null,
    configDashboard: null
  };
  
  // Load crew-roster.json
  const rosterPath = path.join(rootDir, 'crew-roster.json');
  if (fs.existsSync(rosterPath)) {
    try {
      rosters.crewRosterJson = JSON.parse(fs.readFileSync(rosterPath, 'utf-8'));
    } catch (error) {
      console.warn(`⚠️  Could not load crew-roster.json: ${error.message}`);
    }
  }
  
  // Extract from crew-manager.ts
  const crewManagerPath = path.join(rootDir, 'packages/core/src/crew-manager.ts');
  if (fs.existsSync(crewManagerPath)) {
    try {
      const content = fs.readFileSync(crewManagerPath, 'utf-8');
      const memberMatches = content.matchAll(/id:\s*['"]([^'"]+)['"],\s*name:\s*['"]([^'"]+)['"]/g);
      rosters.crewManager = Array.from(memberMatches).map(m => ({
        id: m[1],
        name: m[2]
      }));
    } catch (error) {
      console.warn(`⚠️  Could not extract from crew-manager.ts: ${error.message}`);
    }
  }
  
  // Extract from crew-assignment-system.ts
  const assignmentPath = path.join(rootDir, 'lib/crew-assignment-system.ts');
  if (fs.existsSync(assignmentPath)) {
    try {
      const content = fs.readFileSync(assignmentPath, 'utf-8');
      const memberMatches = content.matchAll(/id:\s*['"]([^'"]+)['"],\s*name:\s*['"]([^'"]+)['"]/g);
      rosters.crewAssignment = Array.from(memberMatches).map(m => ({
        id: m[1],
        name: m[2]
      }));
    } catch (error) {
      console.warn(`⚠️  Could not extract from crew-assignment-system.ts: ${error.message}`);
    }
  }
  
  return rosters;
}

function loadN8NRosters() {
  const rootDir = process.cwd();
  const n8nDir = path.join(rootDir, 'n8n-workflows');
  const rosters = [];
  
  if (!fs.existsSync(n8nDir)) {
    return rosters;
  }
  
  function scanDirectory(dir) {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    
    entries.forEach(entry => {
      const fullPath = path.join(dir, entry.name);
      
      if (entry.isDirectory()) {
        scanDirectory(fullPath);
      } else if (entry.isFile() && entry.name.endsWith('.json')) {
        try {
          const content = fs.readFileSync(fullPath, 'utf-8');
          
          // Look for hardcoded crew member arrays
          const crewMatches = content.match(/crewMembers\s*=\s*\[([^\]]+)\]/);
          if (crewMatches) {
            const members = crewMatches[1]
              .split(',')
              .map(m => m.trim().replace(/['"]/g, ''))
              .filter(m => m.length > 0);
            
            if (members.length > 0) {
              rosters.push({
                file: path.relative(rootDir, fullPath),
                members,
                count: members.length
              });
            }
          }
        } catch (error) {
          // Skip invalid JSON
        }
      }
    });
  }
  
  scanDirectory(n8nDir);
  
  return rosters;
}

async function loadMCPRoster() {
  const rootDir = process.cwd();
  const mcpDir = path.join(rootDir, 'mcp-server');
  
  if (!fs.existsSync(mcpDir)) {
    return null;
  }
  
  // Look for crew definitions in MCP server
  const possiblePaths = [
    path.join(mcpDir, 'src/crew.ts'),
    path.join(mcpDir, 'src/crew.js'),
    path.join(mcpDir, 'crew.ts'),
    path.join(mcpDir, 'crew.js'),
    path.join(mcpDir, 'src/index.ts'),
    path.join(mcpDir, 'index.ts')
  ];
  
  for (const filePath of possiblePaths) {
    if (fs.existsSync(filePath)) {
      try {
        const content = fs.readFileSync(filePath, 'utf-8');
        
        // Try to extract crew definitions
        const crewPatterns = [
          /crewMembers\s*[:=]\s*\[([^\]]+)\]/,
          /crew\s*[:=]\s*\[([^\]]+)\]/,
          /members\s*[:=]\s*\[([^\]]+)\]/
        ];
        
        for (const pattern of crewPatterns) {
          const match = content.match(pattern);
          if (match) {
            // Try to parse as JSON or extract IDs
            const members = match[1]
              .split(',')
              .map(m => {
                const idMatch = m.match(/id:\s*['"]([^'"]+)['"]/);
                return idMatch ? idMatch[1] : null;
              })
              .filter(Boolean);
            
            if (members.length > 0) {
              return {
                source: path.relative(rootDir, filePath),
                members,
                count: members.length
              };
            }
          }
        }
      } catch (error) {
        // Continue searching
      }
    }
  }
  
  // If not found, check if MCP server has an API endpoint
  // or if we can query it directly
  return {
    source: 'mcp-server (needs API query)',
    members: [],
    count: 0,
    needsQuery: true
  };
}

function compareRosters(localRosters, n8nRosters, mcpRoster) {
  const comparison = {
    local: {
      crewRosterJson: localRosters.crewRosterJson?.crewMembers?.length || 0,
      crewManager: localRosters.crewManager?.length || 0,
      crewAssignment: localRosters.crewAssignment?.length || 0,
      unique: new Set()
    },
    n8n: {
      workflows: n8nRosters.length,
      uniqueMembers: new Set(),
      inconsistencies: []
    },
    mcp: {
      members: mcpRoster?.members || [],
      count: mcpRoster?.count || 0,
      needsQuery: mcpRoster?.needsQuery || false
    },
    differences: [],
    recommendations: []
  };
  
  // Collect unique local members
  if (localRosters.crewRosterJson?.crewMembers) {
    localRosters.crewRosterJson.crewMembers.forEach(m => {
      comparison.local.unique.add(m.name || m.id);
    });
  }
  if (localRosters.crewManager) {
    localRosters.crewManager.forEach(m => {
      comparison.local.unique.add(m.name || m.id);
    });
  }
  if (localRosters.crewAssignment) {
    localRosters.crewAssignment.forEach(m => {
      comparison.local.unique.add(m.name || m.id);
    });
  }
  
  // Collect n8n members
  n8nRosters.forEach(roster => {
    roster.members.forEach(member => {
      comparison.n8n.uniqueMembers.add(member);
    });
    
    // Check for inconsistencies
    if (roster.count !== n8nRosters[0]?.count) {
      comparison.n8n.inconsistencies.push({
        file: roster.file,
        count: roster.count,
        expected: n8nRosters[0]?.count
      });
    }
  });
  
  // Identify differences
  if (comparison.local.unique.size !== comparison.n8n.uniqueMembers.size) {
    comparison.differences.push({
      type: 'count_mismatch',
      local: comparison.local.unique.size,
      n8n: comparison.n8n.uniqueMembers.size,
      message: `Local has ${comparison.local.unique.size} unique members, n8n has ${comparison.n8n.uniqueMembers.size}`
    });
  }
  
  // Check for members in n8n but not in local
  comparison.n8n.uniqueMembers.forEach(member => {
    if (!Array.from(comparison.local.unique).some(local => 
      local.toLowerCase().includes(member.toLowerCase()) || 
      member.toLowerCase().includes(local.toLowerCase())
    )) {
      comparison.differences.push({
        type: 'missing_in_local',
        member,
        message: `${member} found in n8n but not clearly in local`
      });
    }
  });
  
  return comparison;
}

function generateUnifiedRoster(mcpRoster, localRosters, n8nRosters) {
  // Use MCP as source of truth, enrich with local data
  const unified = {
    version: '2.0.0',
    source: 'mcp-server',
    lastUpdated: new Date().toISOString(),
    crewMembers: []
  };
  
  // If MCP roster is available, use it
  if (mcpRoster && mcpRoster.members && mcpRoster.members.length > 0) {
    mcpRoster.members.forEach(memberId => {
      // Enrich with data from local rosters
      let memberData = {
        id: memberId,
        source: 'mcp'
      };
      
      // Try to find in local rosters
      if (localRosters.crewRosterJson?.crewMembers) {
        const localMember = localRosters.crewRosterJson.crewMembers.find(m => 
          m.id === memberId || m.name?.toLowerCase().includes(memberId.toLowerCase())
        );
        if (localMember) {
          memberData = { ...memberData, ...localMember, source: 'mcp+local' };
        }
      }
      
      unified.crewMembers.push(memberData);
    });
  } else {
    // Fallback: use local roster but mark as needing MCP sync
    console.warn('⚠️  MCP roster not available, using local as fallback');
    if (localRosters.crewRosterJson?.crewMembers) {
      unified.crewMembers = localRosters.crewRosterJson.crewMembers.map(m => ({
        ...m,
        source: 'local (needs MCP sync)'
      }));
    }
  }
  
  unified.totalCrewMembers = unified.crewMembers.length;
  unified.activeCrewMembers = unified.crewMembers.filter(m => m.active !== false).length;
  
  return unified;
}

async function unifyCrewRosters() {
  console.log('🖖 Crew Roster Unification System\n');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
  
  // Team assignments
  console.log('👥 Crew Team Organization:\n');
  CREW_TEAMS.forEach(team => {
    console.log(`   ${team.team}:`);
    console.log(`     Members: ${team.members.map(m => m.replace('_', ' ')).join(', ')}`);
    console.log(`     Task: ${team.task}\n`);
  });
  
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
  
  // Step 1: Load all rosters
  console.log('🤖 Commander Data - Analyzing roster definitions...\n');
  
  console.log('📂 Loading local rosters...');
  const localRosters = loadLocalRosters();
  console.log(`   ✅ Found ${Object.keys(localRosters).filter(k => localRosters[k]).length} local definitions\n`);
  
  console.log('📂 Loading n8n workflow rosters...');
  const n8nRosters = loadN8NRosters();
  console.log(`   ✅ Found ${n8nRosters.length} n8n workflow definitions\n`);
  
  console.log('📂 Loading MCP server roster...');
  const mcpRoster = await loadMCPRoster();
  if (mcpRoster) {
    console.log(`   ✅ Found MCP roster: ${mcpRoster.count} members`);
    if (mcpRoster.needsQuery) {
      console.log(`   ⚠️  MCP roster needs API query\n`);
    } else {
      console.log(`   Source: ${mcpRoster.source}\n`);
    }
  } else {
    console.log('   ⚠️  MCP roster not found\n');
  }
  
  // Step 2: Compare rosters
  console.log('🔍 Comparing rosters across systems...\n');
  const comparison = compareRosters(localRosters, n8nRosters, mcpRoster);
  
  console.log('📊 Comparison Results:\n');
  console.log(`   Local Systems:`);
  console.log(`     crew-roster.json: ${comparison.local.crewRosterJson} members`);
  console.log(`     crew-manager.ts: ${comparison.local.crewManager} members`);
  console.log(`     crew-assignment-system.ts: ${comparison.local.crewAssignment} members`);
  console.log(`     Unique: ${comparison.local.unique.size} members\n`);
  
  console.log(`   n8n Workflows:`);
  console.log(`     Workflows with rosters: ${comparison.n8n.workflows}`);
  console.log(`     Unique members: ${comparison.n8n.uniqueMembers.size}`);
  if (comparison.n8n.inconsistencies.length > 0) {
    console.log(`     ⚠️  Inconsistencies: ${comparison.n8n.inconsistencies.length}`);
  }
  console.log('');
  
  console.log(`   MCP Server:`);
  console.log(`     Members: ${comparison.mcp.count}`);
  if (comparison.mcp.needsQuery) {
    console.log(`     ⚠️  Needs API query to retrieve`);
  }
  console.log('');
  
  // Step 3: Identify differences
  if (comparison.differences.length > 0) {
    console.log('⚠️  Differences Found:\n');
    comparison.differences.forEach((diff, i) => {
      console.log(`   ${i + 1}. [${diff.type}] ${diff.message}`);
    });
    console.log('');
  }
  
  // Step 4: Generate unified roster
  console.log('🔧 Lt. Cmdr. La Forge - Generating unified roster from MCP...\n');
  const unifiedRoster = generateUnifiedRoster(mcpRoster, localRosters, n8nRosters);
  
  console.log(`✅ Unified Roster Generated:`);
  console.log(`   Total Members: ${unifiedRoster.totalCrewMembers}`);
  console.log(`   Active Members: ${unifiedRoster.activeCrewMembers}`);
  console.log(`   Source: ${unifiedRoster.source}\n`);
  
  // Step 5: Generate recommendations
  console.log('💡 Recommendations:\n');
  const recommendations = [
    {
      priority: 'high',
      action: 'Query MCP server API to get authoritative crew roster',
      team: 'MCP Integration Team (La Forge, Data)'
    },
    {
      priority: 'high',
      action: 'Update local systems to use MCP as source of truth',
      team: 'Local System Updates Team (O\'Brien, Riker)'
    },
    {
      priority: 'medium',
      action: 'Update n8n workflows to reference MCP roster instead of hardcoded lists',
      team: 'n8n Workflow Updates Team (Riker, Uhura)'
    },
    {
      priority: 'medium',
      action: 'Create MCP endpoint for crew roster retrieval',
      team: 'MCP Integration Team (La Forge, Data)'
    },
    {
      priority: 'low',
      action: 'Deprecate local crew-roster.json in favor of MCP',
      team: 'Local System Updates Team (O\'Brien, Riker)'
    }
  ];
  
  recommendations.forEach((rec, i) => {
    console.log(`   ${i + 1}. [${rec.priority.toUpperCase()}] ${rec.action}`);
    console.log(`      Team: ${rec.team}\n`);
  });
  
  // Save analysis
  const rootDir = process.cwd();
  const reportDir = path.join(rootDir, 'reports');
  if (!fs.existsSync(reportDir)) {
    fs.mkdirSync(reportDir, { recursive: true });
  }
  
  const reportPath = path.join(reportDir, 'crew-roster-unification-analysis.json');
  fs.writeFileSync(reportPath, JSON.stringify({
    timestamp: new Date().toISOString(),
    comparison,
    unifiedRoster,
    recommendations,
    teams: CREW_TEAMS
  }, null, 2));
  
  console.log(`📄 Analysis saved to: ${reportPath}\n`);
  
  // Save unified roster
  const unifiedPath = path.join(rootDir, 'crew-roster-unified.json');
  fs.writeFileSync(unifiedPath, JSON.stringify(unifiedRoster, null, 2));
  console.log(`📄 Unified roster saved to: ${unifiedPath}\n`);
  
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
  console.log('🎯 Next Steps:');
  console.log('   1. Query MCP server for authoritative crew roster');
  console.log('   2. Update local systems to use MCP roster');
  console.log('   3. Update n8n workflows to reference MCP');
  console.log('   4. Preserve cost/crew optimization processes\n');
  
  return { comparison, unifiedRoster, recommendations };
}

if (require.main === module) {
  unifyCrewRosters().catch(console.error);
}

module.exports = { unifyCrewRosters, loadMCPRoster, generateUnifiedRoster };

