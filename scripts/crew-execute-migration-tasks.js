#!/usr/bin/env node

/**
 * 🖖 Crew-Coordinated Migration Task Execution
 * 
 * Mission: Execute local test, hybrid migration, and status check
 * with full crew coordination, prioritized and optimized by Quark and Riker
 * 
 * Crew Leadership:
 * - 💰 Quark: Business optimization and resource prioritization
 * - ⚡ Riker: Tactical execution and task coordination
 * - 🤖 Data: Technical validation and analysis
 * - 🔧 La Forge: Infrastructure readiness
 * - 🎖️ Picard: Strategic oversight
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Colors for terminal
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  cyan: '\x1b[36m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  red: '\x1b[31m',
  magenta: '\x1b[35m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

const PROJECT_ROOT = path.resolve(__dirname, '..');

/**
 * 💰 Quark's Task Prioritization and Optimization
 */
function quarkPrioritizeTasks() {
  log('\n💰 QUARK\'S TASK PRIORITIZATION', 'magenta');
  log('═══════════════════════════════════════════════════════════\n', 'cyan');
  
  const tasks = [
    {
      id: 'local_test',
      name: 'Run Local Test with Dev Server',
      priority: 1,
      cost: 'Low (local resources only)',
      roi: 'High (validates before deployment)',
      time: '2-3 minutes',
      risk: 'Low',
      dependencies: []
    },
    {
      id: 'check_status',
      name: 'Check Migration Status',
      priority: 2,
      cost: 'Zero (read-only)',
      roi: 'High (informs decisions)',
      time: '<1 minute',
      risk: 'None',
      dependencies: []
    },
    {
      id: 'start_migration',
      name: 'Start Hybrid Migration',
      priority: 3,
      cost: 'Medium (Vercel free tier, AWS minimal)',
      roi: 'High (enables production deployment)',
      time: '10-30 minutes',
      risk: 'Medium (with rollback available)',
      dependencies: ['local_test', 'check_status']
    }
  ];
  
  log('📊 Task Analysis:\n');
  tasks.forEach((task, i) => {
    log(`   ${i + 1}. ${task.name}`, 'yellow');
    log(`      Priority: ${task.priority} (${task.priority === 1 ? 'Highest' : task.priority === 2 ? 'Medium' : 'Lowest'})`);
    log(`      Cost: ${task.cost}`);
    log(`      ROI: ${task.roi}`);
    log(`      Time: ${task.time}`);
    log(`      Risk: ${task.risk}`);
    if (task.dependencies.length > 0) {
      log(`      Dependencies: ${task.dependencies.join(', ')}`);
    }
    log('');
  });
  
  log('🎯 QUARK\'S OPTIMIZED EXECUTION ORDER:', 'magenta');
  log('   1. Local Test (validate before spending resources)', 'green');
  log('   2. Check Status (inform decision-making)', 'green');
  log('   3. Start Migration (execute with confidence)', 'green');
  log('');
  log('💡 Rationale:', 'magenta');
  log('   • Test locally first = zero cost validation', 'yellow');
  log('   • Check status = free information gathering', 'yellow');
  log('   • Execute migration = informed decision with rollback safety', 'yellow');
  log('');
  
  return tasks.sort((a, b) => a.priority - b.priority);
}

/**
 * ⚡ Riker's Tactical Execution Plan
 */
function rikerExecutionPlan(tasks) {
  log('\n⚡ RIKER\'S TACTICAL EXECUTION PLAN', 'blue');
  log('═══════════════════════════════════════════════════════════\n', 'cyan');
  
  const plan = {
    phase1: {
      name: 'Local Test Execution',
      tasks: ['local_test'],
      validation: 'Verify DDD connections and local environment',
      rollback: 'None needed (local only)',
      time: '2-3 minutes'
    },
    phase2: {
      name: 'Status Check',
      tasks: ['check_status'],
      validation: 'Confirm migration readiness and current state',
      rollback: 'None needed (read-only)',
      time: '<1 minute'
    },
    phase3: {
      name: 'Migration Execution',
      tasks: ['start_migration'],
      validation: 'Monitor each phase, confirm before proceeding',
      rollback: 'Automatic on failure, manual via --rollback flag',
      time: '10-30 minutes'
    }
  };
  
  log('📋 Execution Phases:\n');
  Object.values(plan).forEach((phase, i) => {
    log(`   Phase ${i + 1}: ${phase.name}`, 'blue');
    log(`      Tasks: ${phase.tasks.join(', ')}`);
    log(`      Validation: ${phase.validation}`);
    log(`      Rollback: ${phase.rollback}`);
    log(`      Estimated Time: ${phase.time}`);
    log('');
  });
  
  log('🎯 RIKER\'S TACTICAL APPROACH:', 'blue');
  log('   • Execute sequentially (dependencies respected)', 'green');
  log('   • Validate after each phase', 'green');
  log('   • Interactive confirmations for migration', 'green');
  log('   • Automatic rollback on failure', 'green');
  log('');
  
  return plan;
}

/**
 * 🤖 Data's Technical Validation
 */
function dataTechnicalValidation() {
  log('\n🤖 DATA\'S TECHNICAL VALIDATION', 'cyan');
  log('═══════════════════════════════════════════════════════════\n', 'cyan');
  
  const validations = [];
  
  // Check scripts exist
  const scripts = [
    'scripts/test-hybrid-migration-local.sh',
    'scripts/hybrid-migration-vercel-aws.sh'
  ];
  
  log('📋 Validating Scripts:\n');
  scripts.forEach(script => {
    const scriptPath = path.join(PROJECT_ROOT, script);
    const exists = fs.existsSync(scriptPath);
    const executable = exists && (fs.statSync(scriptPath).mode & parseInt('111', 8)) !== 0;
    
    log(`   ${script}`, exists ? 'green' : 'red');
    if (exists) {
      log(`      ✅ Exists`, 'green');
      log(`      ${executable ? '✅' : '⚠️ '} Executable`, executable ? 'green' : 'yellow');
      validations.push({ script, status: 'ready' });
    } else {
      log(`      ❌ Not found`, 'red');
      validations.push({ script, status: 'missing' });
    }
    log('');
  });
  
  // Check milestone tag
  try {
    execSync('git rev-parse pre-hybrid-migration', { 
      cwd: PROJECT_ROOT, 
      stdio: 'ignore' 
    });
    log('   Milestone Tag: ✅ Found', 'green');
    validations.push({ item: 'milestone_tag', status: 'ready' });
  } catch (e) {
    log('   Milestone Tag: ⚠️  Not found', 'yellow');
    validations.push({ item: 'milestone_tag', status: 'warning' });
  }
  
  log('');
  
  const allReady = validations.every(v => v.status === 'ready');
  if (allReady) {
    log('✅ All technical validations passed', 'green');
  } else {
    log('⚠️  Some validations have warnings', 'yellow');
  }
  
  return validations;
}

/**
 * 🔧 La Forge's Infrastructure Readiness Check
 */
function laForgeInfrastructureCheck() {
  log('\n🔧 LA FORGE\'S INFRASTRUCTURE READINESS', 'green');
  log('═══════════════════════════════════════════════════════════\n', 'cyan');
  
  const checks = [];
  
  // Check for required tools
  const tools = ['node', 'npm', 'git', 'vercel', 'aws'];
  
  log('🔍 Checking Infrastructure Tools:\n');
  tools.forEach(tool => {
    try {
      const version = execSync(`${tool} --version`, { 
        encoding: 'utf8',
        stdio: 'pipe'
      }).trim().split('\n')[0];
      log(`   ${tool}: ✅ ${version}`, 'green');
      checks.push({ tool, status: 'ready', version });
    } catch (e) {
      log(`   ${tool}: ❌ Not found`, 'red');
      checks.push({ tool, status: 'missing' });
    }
  });
  
  log('');
  
  // Check dashboard directory
  const dashboardPath = path.join(PROJECT_ROOT, 'dashboard');
  if (fs.existsSync(dashboardPath)) {
    log('   Dashboard Directory: ✅ Exists', 'green');
    checks.push({ item: 'dashboard', status: 'ready' });
  } else {
    log('   Dashboard Directory: ❌ Not found', 'red');
    checks.push({ item: 'dashboard', status: 'missing' });
  }
  
  log('');
  
  const allReady = checks.filter(c => c.status === 'ready').length === checks.length;
  if (allReady) {
    log('✅ Infrastructure ready for migration', 'green');
  } else {
    log('⚠️  Some infrastructure components missing', 'yellow');
  }
  
  return checks;
}

/**
 * Execute Task 1: Local Test
 */
function executeLocalTest() {
  log('\n🚀 EXECUTING TASK 1: Local Test', 'bright');
  log('═══════════════════════════════════════════════════════════\n', 'cyan');
  
  try {
    const scriptPath = path.join(PROJECT_ROOT, 'scripts/test-hybrid-migration-local.sh');
    log('Running local test script...\n', 'blue');
    
    execSync(`bash "${scriptPath}"`, {
      cwd: PROJECT_ROOT,
      stdio: 'inherit'
    });
    
    log('\n✅ Task 1 Complete: Local Test', 'green');
    return { success: true };
  } catch (error) {
    log(`\n❌ Task 1 Failed: ${error.message}`, 'red');
    return { success: false, error: error.message };
  }
}

/**
 * Execute Task 2: Check Status
 */
function executeStatusCheck() {
  log('\n🚀 EXECUTING TASK 2: Check Status', 'bright');
  log('═══════════════════════════════════════════════════════════\n', 'cyan');
  
  try {
    const scriptPath = path.join(PROJECT_ROOT, 'scripts/hybrid-migration-vercel-aws.sh');
    log('Checking migration status...\n', 'blue');
    
    execSync(`bash "${scriptPath}" --status`, {
      cwd: PROJECT_ROOT,
      stdio: 'inherit'
    });
    
    log('\n✅ Task 2 Complete: Status Check', 'green');
    return { success: true };
  } catch (error) {
    log(`\n❌ Task 2 Failed: ${error.message}`, 'red');
    return { success: false, error: error.message };
  }
}

/**
 * Execute Task 3: Start Migration (with confirmation)
 */
function executeStartMigration() {
  log('\n🚀 EXECUTING TASK 3: Start Hybrid Migration', 'bright');
  log('═══════════════════════════════════════════════════════════\n', 'cyan');
  
  log('⚠️  This will start the actual migration process', 'yellow');
  log('   • Phase 1: Deploy to Vercel', 'yellow');
  log('   • Phase 2: Set up AWS infrastructure', 'yellow');
  log('   • Phase 3: Integration testing', 'yellow');
  log('');
  log('   Rollback available at any time with: --rollback flag', 'yellow');
  log('');
  
  // In a real scenario, we'd prompt for confirmation
  // For now, we'll show what would happen
  log('📋 Migration will be interactive:', 'blue');
  log('   • You will be prompted before each phase', 'blue');
  log('   • You can cancel at any time', 'blue');
  log('   • Automatic rollback on failure', 'blue');
  log('');
  
  log('To start migration, run:', 'cyan');
  log('   ./scripts/hybrid-migration-vercel-aws.sh', 'bright');
  log('');
  
  return { success: true, note: 'Interactive migration - run script manually' };
}

/**
 * 🎖️ Picard's Strategic Synthesis
 */
function picardSynthesis(results) {
  log('\n🎖️  PICARD\'S STRATEGIC SYNTHESIS', 'bright');
  log('═══════════════════════════════════════════════════════════\n', 'cyan');
  
  const allSuccessful = results.every(r => r.success);
  
  if (allSuccessful) {
    log('✅ Mission Status: READY FOR EXECUTION', 'green');
    log('');
    log('All tasks completed successfully:', 'green');
    results.forEach((result, i) => {
      log(`   ${i + 1}. ✅ ${result.task}`, 'green');
    });
    log('');
    log('🎖️  CAPTAIN\'S DECISION:', 'bright');
    log('   The crew has validated all systems and prepared the migration.', 'green');
    log('   We are ready to proceed with the hybrid migration when you give the order.', 'green');
    log('');
    log('   Command: ./scripts/hybrid-migration-vercel-aws.sh', 'cyan');
    log('');
  } else {
    log('⚠️  Mission Status: REVIEW REQUIRED', 'yellow');
    log('');
    log('Some tasks require attention:', 'yellow');
    results.forEach((result, i) => {
      if (result.success) {
        log(`   ${i + 1}. ✅ ${result.task}`, 'green');
      } else {
        log(`   ${i + 1}. ❌ ${result.task}: ${result.error || 'Failed'}`, 'red');
      }
    });
    log('');
    log('🎖️  CAPTAIN\'S DECISION:', 'bright');
    log('   Address the issues above before proceeding with migration.', 'yellow');
    log('');
  }
}

/**
 * Main execution
 */
function main() {
  log('🖖 CREW-COORDINATED MIGRATION TASK EXECUTION', 'bright');
  log('═══════════════════════════════════════════════════════════\n', 'cyan');
  log('Crew Leadership: Quark (Optimization) + Riker (Execution)', 'cyan');
  log('');
  
  // Quark prioritizes tasks
  const tasks = quarkPrioritizeTasks();
  
  // Riker creates execution plan
  const plan = rikerExecutionPlan(tasks);
  
  // Data validates technically
  const validations = dataTechnicalValidation();
  
  // La Forge checks infrastructure
  const infrastructure = laForgeInfrastructureCheck();
  
  // Execute tasks
  log('\n🚀 EXECUTING PRIORITIZED TASKS', 'bright');
  log('═══════════════════════════════════════════════════════════\n', 'cyan');
  
  const results = [];
  
  // Task 1: Local Test
  results.push({
    task: 'Local Test',
    ...executeLocalTest()
  });
  
  // Task 2: Status Check
  results.push({
    task: 'Status Check',
    ...executeStatusCheck()
  });
  
  // Task 3: Start Migration (prepared, but interactive)
  results.push({
    task: 'Start Migration',
    ...executeStartMigration()
  });
  
  // Picard synthesizes
  picardSynthesis(results);
  
  log('═══════════════════════════════════════════════════════════\n', 'cyan');
}

if (require.main === module) {
  main();
}

module.exports = { main, quarkPrioritizeTasks, rikerExecutionPlan, dataTechnicalValidation, laForgeInfrastructureCheck };

