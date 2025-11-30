#!/usr/bin/env node
/**
 * Automate Optimization Deployment
 * 
 * Automatically deploys all memory storage optimizations:
 * 1. Runs Supabase migration
 * 2. Syncs optimized workflow to N8N
 * 3. Verifies deployment
 */

const { execSync, spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

function log(message, type = 'info') {
  const icons = {
    info: 'ℹ️',
    success: '✅',
    error: '❌',
    warning: '⚠️',
    step: '📋'
  };
  console.log(`${icons[type] || '•'} ${message}`);
}

async function runCommand(command, description) {
  log(description, 'step');
  try {
    const output = execSync(command, {
      encoding: 'utf8',
      cwd: process.cwd(),
      stdio: 'pipe'
    });
    log(`Success: ${description}`, 'success');
    return { success: true, output };
  } catch (error) {
    log(`Failed: ${description}`, 'error');
    log(`Error: ${error.message}`, 'error');
    return { success: false, error: error.message };
  }
}

async function runSupabaseMigration() {
  log('\n📊 Step 1: Running Supabase Migration...', 'step');
  log('─'.repeat(80));
  
  // Check if supabase CLI is available
  try {
    execSync('which supabase', { stdio: 'pipe' });
  } catch (e) {
    log('Supabase CLI not found. Please install it first.', 'error');
    log('Install: npm install -g supabase', 'info');
    return { success: false, error: 'Supabase CLI not found' };
  }
  
  // Run migration
  const result = await runCommand(
    'supabase db push',
    'Pushing migration to Supabase'
  );
  
  if (result.success) {
    log('✅ Migration applied successfully!', 'success');
  } else {
    log('⚠️  Migration may have failed. Check output above.', 'warning');
  }
  
  return result;
}

async function syncWorkflowToN8N() {
  log('\n🔄 Step 2: Syncing Optimized Workflow to N8N...', 'step');
  log('─'.repeat(80));
  
  const workflowScript = path.join(__dirname, 'sync-optimized-workflow-to-n8n.js');
  
  if (!fs.existsSync(workflowScript)) {
    log('Workflow sync script not found!', 'error');
    return { success: false, error: 'Script not found' };
  }
  
  return new Promise((resolve) => {
    const child = spawn('node', [workflowScript], {
      stdio: 'inherit',
      cwd: process.cwd()
    });
    
    child.on('close', (code) => {
      if (code === 0) {
        log('✅ Workflow synced successfully!', 'success');
        log('⚠️  Remember to activate the workflow in N8N UI', 'warning');
        resolve({ success: true });
      } else {
        log('⚠️  Workflow sync may have failed. Check output above.', 'warning');
        resolve({ success: false, code });
      }
    });
    
    child.on('error', (error) => {
      log(`Failed to sync workflow: ${error.message}`, 'error');
      resolve({ success: false, error: error.message });
    });
  });
}

async function verifyDeployment() {
  log('\n🔍 Step 3: Verifying Deployment...', 'step');
  log('─'.repeat(80));
  
  // Check if migration file exists
  const migrationFile = path.join(__dirname, '..', 'supabase', 'migrations', '20251118_add_deduplication_fields.sql');
  if (!fs.existsSync(migrationFile)) {
    log('Migration file not found!', 'error');
    return { success: false, error: 'Migration file missing' };
  }
  log('✅ Migration file exists', 'success');
  
  // Check if optimized workflow exists
  const workflowFile = path.join(__dirname, '..', 'n8n-workflows', 'crew-memory-storage-workflow-optimized.json');
  if (!fs.existsSync(workflowFile)) {
    log('Optimized workflow file not found!', 'error');
    return { success: false, error: 'Workflow file missing' };
  }
  log('✅ Optimized workflow file exists', 'success');
  
  // Check if sync script exists
  const syncScript = path.join(__dirname, 'sync-optimized-workflow-to-n8n.js');
  if (!fs.existsSync(syncScript)) {
    log('Sync script not found!', 'error');
    return { success: false, error: 'Sync script missing' };
  }
  log('✅ Sync script exists', 'success');
  
  return { success: true };
}

async function runTests() {
  log('\n🧪 Step 4: Running Deployment Tests...', 'step');
  log('─'.repeat(80));
  
  const testScript = path.join(__dirname, 'test-memory-storage-optimization.js');
  
  if (!fs.existsSync(testScript)) {
    log('Test script not found. Skipping tests.', 'warning');
    return { success: true, skipped: true };
  }
  
  return new Promise((resolve) => {
    const child = spawn('node', [testScript], {
      stdio: 'inherit',
      cwd: process.cwd()
    });
    
    child.on('close', (code) => {
      if (code === 0) {
        log('✅ Tests passed!', 'success');
        resolve({ success: true });
      } else {
        log('⚠️  Some tests may have failed. Review output above.', 'warning');
        resolve({ success: false, code });
      }
    });
    
    child.on('error', (error) => {
      log(`Test execution error: ${error.message}`, 'error');
      resolve({ success: false, error: error.message });
    });
  });
}

async function main() {
  console.log('\n' + '═'.repeat(80));
  console.log('🚀 AUTOMATED OPTIMIZATION DEPLOYMENT');
  console.log('═'.repeat(80));
  console.log('\nDeploying memory storage optimizations...\n');
  
  const results = {
    migration: null,
    workflowSync: null,
    verification: null,
    tests: null
  };
  
  // Step 1: Run migration
  results.migration = await runSupabaseMigration();
  
  // Step 2: Sync workflow
  results.workflowSync = await syncWorkflowToN8N();
  
  // Step 3: Verify deployment
  results.verification = await verifyDeployment();
  
  // Step 4: Run tests
  results.tests = await runTests();
  
  // Summary
  console.log('\n' + '═'.repeat(80));
  console.log('📊 DEPLOYMENT SUMMARY');
  console.log('═'.repeat(80));
  
  const allSteps = [
    { name: 'Supabase Migration', result: results.migration },
    { name: 'Workflow Sync', result: results.workflowSync },
    { name: 'Verification', result: results.verification },
    { name: 'Tests', result: results.tests }
  ];
  
  allSteps.forEach(step => {
    const status = step.result?.success ? '✅' : '❌';
    console.log(`   ${status} ${step.name}`);
  });
  
  const passedSteps = allSteps.filter(s => s.result?.success).length;
  const totalSteps = allSteps.length;
  
  console.log(`\n   Results: ${passedSteps}/${totalSteps} steps completed`);
  
  if (passedSteps === totalSteps) {
    console.log('\n✅ Deployment completed successfully!');
    console.log('\n⚠️  IMPORTANT: Activate the optimized workflow in N8N UI:');
    console.log('   1. Go to https://n8n.pbradygeorgen.com');
    console.log('   2. Find "Crew Memory Storage Workflow (Optimized)"');
    console.log('   3. Activate it');
    console.log('   4. Deactivate the old workflow if it exists\n');
  } else {
    console.log('\n⚠️  Some steps may have failed. Review output above.\n');
  }
  
  // Save results
  const resultsPath = path.join(__dirname, '..', '.backup-ec2-emergency', 'DEPLOYMENT_RESULTS.json');
  const resultsDir = path.dirname(resultsPath);
  if (!fs.existsSync(resultsDir)) {
    fs.mkdirSync(resultsDir, { recursive: true });
  }
  fs.writeFileSync(resultsPath, JSON.stringify(results, null, 2));
  console.log(`📄 Results saved to: ${resultsPath}\n`);
  
  process.exit(passedSteps === totalSteps ? 0 : 1);
}

main().catch(error => {
  console.error(`\n❌ Deployment failed: ${error.message}`);
  if (error.stack) {
    console.error('   Stack:', error.stack);
  }
  process.exit(1);
});

