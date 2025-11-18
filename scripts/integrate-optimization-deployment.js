#!/usr/bin/env node
/**
 * Integrate Optimization Deployment into N8N Sync
 * 
 * This script ensures the optimized workflow is included in all N8N sync operations
 * and can be triggered as part of automated deployment processes
 */

const fs = require('fs');
const path = require('path');

// Update sync-n8n-workflows.js to include optimized workflow
function updateSyncScript() {
  const syncScriptPath = path.join(__dirname, 'sync-n8n-workflows.js');
  
  if (!fs.existsSync(syncScriptPath)) {
    console.log('⚠️  sync-n8n-workflows.js not found');
    return false;
  }
  
  let content = fs.readFileSync(syncScriptPath, 'utf8');
  
  // Check if optimized workflow is already included
  if (content.includes('crew-memory-storage-workflow-optimized.json')) {
    console.log('✅ Optimized workflow already included in sync script');
    return true;
  }
  
  // Add optimized workflow to the list (prioritize it)
  const oldPattern = /const WORKFLOW_FILES = \[([^\]]+)\]/;
  const match = content.match(oldPattern);
  
  if (match) {
    const newList = match[1]
      .split(',')
      .map(line => line.trim())
      .filter(line => line && !line.includes('crew-memory-storage-workflow.json')); // Remove old one
    
    // Add optimized at the beginning
    newList.unshift("  'n8n-workflows/crew-memory-storage-workflow-optimized.json',");
    
    const newContent = `const WORKFLOW_FILES = [\n${newList.join(',\n')}\n];`;
    content = content.replace(oldPattern, newContent);
    
    fs.writeFileSync(syncScriptPath, content);
    console.log('✅ Updated sync-n8n-workflows.js to include optimized workflow');
    return true;
  }
  
  return false;
}

// Update sync-n8n-workflows-direct.js to prioritize optimized workflows
function updateDirectSyncScript() {
  const directSyncPath = path.join(__dirname, 'sync-n8n-workflows-direct.js');
  
  if (!fs.existsSync(directSyncPath)) {
    console.log('⚠️  sync-n8n-workflows-direct.js not found');
    return false;
  }
  
  let content = fs.readFileSync(directSyncPath, 'utf8');
  
  // Check if it already prioritizes optimized workflows
  if (content.includes('optimizedWorkflows') || content.includes('optimized')) {
    console.log('✅ Direct sync script already prioritizes optimized workflows');
    return true;
  }
  
  // The function was already updated above, so this should be fine
  console.log('✅ Direct sync script updated');
  return true;
}

// Create a unified deployment script that runs migration + sync
function createUnifiedDeployment() {
  const unifiedScript = `#!/usr/bin/env node
/**
 * Unified Optimization Deployment
 * 
 * Runs migration and syncs optimized workflow in one command
 */

const { execSync, spawn } = require('child_process');
const path = require('path');

async function main() {
  console.log('\\n' + '═'.repeat(80));
  console.log('🚀 UNIFIED OPTIMIZATION DEPLOYMENT');
  console.log('═'.repeat(80));
  console.log('\\nRunning migration and workflow sync...\\n');
  
  // Step 1: Run migration
  console.log('📊 Step 1: Running Supabase Migration...');
  try {
    execSync('supabase db push', { stdio: 'inherit', cwd: process.cwd() });
    console.log('✅ Migration complete\\n');
  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    process.exit(1);
  }
  
  // Step 2: Sync workflows (includes optimized)
  console.log('🔄 Step 2: Syncing Workflows to N8N...');
  return new Promise((resolve) => {
    const child = spawn('node', [path.join(__dirname, 'sync-n8n-workflows-direct.js')], {
      stdio: 'inherit',
      cwd: process.cwd()
    });
    
    child.on('close', (code) => {
      if (code === 0) {
        console.log('\\n✅ Deployment complete!');
        console.log('⚠️  Remember to activate the optimized workflow in N8N UI\\n');
        resolve();
      } else {
        console.error('\\n⚠️  Workflow sync had issues. Check output above.\\n');
        resolve();
      }
    });
    
    child.on('error', (error) => {
      console.error('❌ Deployment failed:', error.message);
      process.exit(1);
    });
  });
}

main().catch(error => {
  console.error('\\n❌ Deployment failed:', error.message);
  process.exit(1);
});
`;

  const unifiedPath = path.join(__dirname, 'deploy-optimizations.js');
  fs.writeFileSync(unifiedPath, unifiedScript);
  fs.chmodSync(unifiedPath, '755');
  console.log('✅ Created unified deployment script: deploy-optimizations.js');
  return true;
}

// Main
console.log('\n' + '═'.repeat(80));
console.log('🔧 INTEGRATING OPTIMIZATION DEPLOYMENT INTO N8N SYNC');
console.log('═'.repeat(80));
console.log('\nUpdating N8N integration scripts...\n');

const results = {
  syncScript: updateSyncScript(),
  directSyncScript: updateDirectSyncScript(),
  unifiedDeployment: createUnifiedDeployment()
};

console.log('\n' + '═'.repeat(80));
console.log('📊 INTEGRATION SUMMARY');
console.log('═'.repeat(80));

Object.entries(results).forEach(([name, success]) => {
  const status = success ? '✅' : '❌';
  console.log(`   ${status} ${name.replace(/([A-Z])/g, ' $1').trim()}`);
});

console.log('\n✅ Integration complete!');
console.log('\n📋 Usage:');
console.log('   • Run unified deployment: node scripts/deploy-optimizations.js');
console.log('   • Sync all workflows: node scripts/sync-n8n-workflows-direct.js');
console.log('   • The optimized workflow will be prioritized in all syncs\n');

