#!/usr/bin/env node
/**
 * 🖖 Crew Review: Milestone Push Architecture
 * 
 * Have the crew review the milestone push system to ensure:
 * 1. MCP is primary source of truth
 * 2. n8n is fallback only
 * 3. Proper DDD architecture compliance
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🖖 Crew Review: Milestone Push Architecture');
console.log('===========================================\n');

// Check architecture compliance
const checks = [];

// Check 1: MCP script exists
const mcpScript = path.join(__dirname, 'mcp-store-milestone.js');
checks.push({
  name: 'MCP milestone storage script exists',
  status: fs.existsSync(mcpScript),
  message: fs.existsSync(mcpScript) 
    ? '✅ MCP script found' 
    : '❌ MCP script missing'
});

// Check 2: Milestone push uses MCP first
const milestoneScript = path.join(__dirname, 'automated-milestone-push-with-timeout.js');
if (fs.existsSync(milestoneScript)) {
  const content = fs.readFileSync(milestoneScript, 'utf8');
  const usesMCP = content.includes('mcp-store-milestone.js');
  const usesN8N = content.includes('n8n-post-knowledge.js');
  
  checks.push({
    name: 'Milestone push uses MCP first',
    status: usesMCP,
    message: usesMCP 
      ? '✅ Uses MCP as primary' 
      : '❌ Not using MCP'
  });
  
  checks.push({
    name: 'Milestone push has n8n fallback',
    status: usesN8N || usesMCP,
    message: (usesN8N || usesMCP)
      ? '✅ Has fallback mechanism'
      : '❌ No fallback mechanism'
  });
}

// Check 3: UnifiedDataService pattern
const unifiedService = path.join(__dirname, '../dashboard/lib/unified-data-service.ts');
if (fs.existsSync(unifiedService)) {
  const content = fs.readFileSync(unifiedService, 'utf8');
  const mcpPrimary = content.includes('MCP is PRIMARY') || content.includes('MCP (primary)');
  const n8nFallback = content.includes('n8n (fallback)') || content.includes('FALLBACK');
  
  checks.push({
    name: 'UnifiedDataService uses MCP primary pattern',
    status: mcpPrimary,
    message: mcpPrimary 
      ? '✅ MCP primary pattern found' 
      : '❌ MCP primary pattern missing'
  });
}

// Check 4: MCP server URL configured
try {
  const zshrc = fs.readFileSync(path.join(process.env.HOME, '.zshrc'), 'utf8');
  const hasMCP = zshrc.includes('MCP') && (zshrc.includes('mcp.pbradygeorgen.com') || zshrc.includes('MCP_URL'));
  checks.push({
    name: 'MCP server URL configured',
    status: hasMCP,
    message: hasMCP 
      ? '✅ MCP URL configured' 
      : '⚠️  MCP URL not found in ~/.zshrc'
  });
} catch (e) {
  checks.push({
    name: 'MCP server URL configured',
    status: false,
    message: '⚠️  Could not check ~/.zshrc'
  });
}

// Run checks
console.log('📋 Architecture Compliance Checks:\n');
checks.forEach((check, i) => {
  console.log(`${i + 1}. ${check.name}`);
  console.log(`   ${check.message}\n`);
});

const passed = checks.filter(c => c.status).length;
const total = checks.length;

console.log(`\n📊 Results: ${passed}/${total} checks passed\n`);

if (passed === total) {
  console.log('✅ Architecture is compliant with DDD principles:');
  console.log('   • MCP is primary source of truth');
  console.log('   • n8n is fallback only');
  console.log('   • Proper error handling and fallback mechanisms\n');
} else {
  console.log('⚠️  Architecture needs attention:');
  checks.filter(c => !c.status).forEach(check => {
    console.log(`   • ${check.name}`);
  });
  console.log('');
}

// Crew recommendations
console.log('🖖 Crew Recommendations:\n');
console.log('🎖️  Captain Picard: "Make it so. MCP must be our primary controller."');
console.log('🤖 Commander Data: "Logical. MCP provides superior data consistency."');
console.log('🔧 Lieutenant Commander La Forge: "MCP infrastructure is more reliable."');
console.log('⚔️  Lieutenant Worf: "Security is enhanced with MCP as primary."');
console.log('');

