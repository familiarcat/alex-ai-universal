#!/usr/bin/env node
/**
 * Unified Optimization Deployment
 * 
 * Runs migration and syncs optimized workflow in one command
 */

const { execSync, spawn } = require('child_process');
const path = require('path');

async function main() {
  console.log('\n' + '═'.repeat(80));
  console.log('🚀 UNIFIED OPTIMIZATION DEPLOYMENT');
  console.log('═'.repeat(80));
  console.log('\nRunning migration and workflow sync...\n');
  
  // Step 1: Run migration
  console.log('📊 Step 1: Running Supabase Migration...');
  try {
    execSync('supabase db push', { stdio: 'inherit', cwd: process.cwd() });
    console.log('✅ Migration complete\n');
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
        console.log('\n✅ Deployment complete!');
        console.log('⚠️  Remember to activate the optimized workflow in N8N UI\n');
        resolve();
      } else {
        console.error('\n⚠️  Workflow sync had issues. Check output above.\n');
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
  console.error('\n❌ Deployment failed:', error.message);
  process.exit(1);
});
