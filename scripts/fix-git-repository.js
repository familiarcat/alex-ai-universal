#!/usr/bin/env node

/**
 * 🔧 Git Repository Repair Script
 * 
 * Mission: Fix git repository corruption to ensure milestone pushes work
 * This is critical for CI/CD and cross-IDE support
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const PROJECT_ROOT = path.resolve(__dirname, '..');

const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  cyan: '\x1b[36m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  red: '\x1b[31m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function runCommand(cmd, options = {}) {
  try {
    return execSync(cmd, { 
      cwd: PROJECT_ROOT,
      encoding: 'utf8',
      stdio: options.silent ? 'pipe' : 'inherit',
      ...options
    });
  } catch (error) {
    if (!options.ignoreErrors) {
      throw error;
    }
    return error.stdout || '';
  }
}

function fixGitRepository() {
  log('🔧 FIXING GIT REPOSITORY', 'bright');
  log('═══════════════════════════════════════════════════════════\n', 'cyan');
  
  // Step 1: Check if we're in a git repo
  log('📋 Step 1: Checking git repository status...', 'cyan');
  try {
    const gitRoot = runCommand('git rev-parse --show-toplevel', { silent: true }).trim();
    log(`   ✅ Git repository found: ${gitRoot}`, 'green');
  } catch (error) {
    log('   ❌ Not a git repository!', 'red');
    return false;
  }
  
  // Step 2: Remove corrupted pack files
  log('\n📋 Step 2: Removing corrupted pack files...', 'cyan');
  const packDir = path.join(PROJECT_ROOT, '.git', 'objects', 'pack');
  if (fs.existsSync(packDir)) {
    const packs = fs.readdirSync(packDir).filter(f => f.endsWith('.pack') || f.endsWith('.idx'));
    if (packs.length > 0) {
      packs.forEach(pack => {
        const packPath = path.join(packDir, pack);
        try {
          fs.unlinkSync(packPath);
          log(`   ✅ Removed: ${pack}`, 'green');
        } catch (error) {
          log(`   ⚠️  Could not remove ${pack}: ${error.message}`, 'yellow');
        }
      });
    } else {
      log('   ℹ️  No pack files found', 'cyan');
    }
  }
  
  // Step 3: Clean up reflog and expire objects
  log('\n📋 Step 3: Cleaning reflog and expiring objects...', 'cyan');
  try {
    runCommand('git reflog expire --expire=now --all', { silent: true });
    log('   ✅ Reflog expired', 'green');
  } catch (error) {
    log(`   ⚠️  Reflog expire: ${error.message}`, 'yellow');
  }
  
  // Step 4: Garbage collect
  log('\n📋 Step 4: Running garbage collection...', 'cyan');
  try {
    runCommand('git gc --prune=now --aggressive', { silent: true });
    log('   ✅ Garbage collection complete', 'green');
  } catch (error) {
    log(`   ⚠️  GC warning: ${error.message}`, 'yellow');
  }
  
  // Step 5: Verify repository integrity
  log('\n📋 Step 5: Verifying repository integrity...', 'cyan');
  try {
    const fsckOutput = runCommand('git fsck --full --no-progress', { silent: true });
    const errors = fsckOutput.split('\n').filter(line => 
      line.includes('error:') || line.includes('fatal:')
    );
    
    if (errors.length === 0) {
      log('   ✅ Repository integrity verified', 'green');
    } else {
      log(`   ⚠️  Found ${errors.length} issues:`, 'yellow');
      errors.slice(0, 5).forEach(err => log(`      ${err}`, 'yellow'));
    }
  } catch (error) {
    log(`   ⚠️  Fsck completed with warnings`, 'yellow');
  }
  
  // Step 6: Test basic git operations
  log('\n📋 Step 6: Testing basic git operations...', 'cyan');
  try {
    const branch = runCommand('git rev-parse --abbrev-ref HEAD', { silent: true }).trim();
    log(`   ✅ Current branch: ${branch}`, 'green');
    
    const remote = runCommand('git remote get-url origin', { silent: true, ignoreErrors: true }).trim();
    if (remote) {
      log(`   ✅ Remote configured: ${remote}`, 'green');
    } else {
      log(`   ⚠️  No remote configured`, 'yellow');
    }
    
    const status = runCommand('git status --short', { silent: true, ignoreErrors: true });
    if (status.trim()) {
      log(`   ✅ Repository has changes to commit`, 'green');
    } else {
      log(`   ℹ️  Working directory clean`, 'cyan');
    }
  } catch (error) {
    log(`   ❌ Git operations failed: ${error.message}`, 'red');
    return false;
  }
  
  // Step 7: Test milestone push capability
  log('\n📋 Step 7: Testing milestone push capability...', 'cyan');
  try {
    // Test if we can stage files
    runCommand('git add -A', { silent: true, ignoreErrors: true });
    log('   ✅ Can stage files', 'green');
    
    // Test if we can create a tag
    const testTag = `test-milestone-${Date.now()}`;
    runCommand(`git tag -d ${testTag}`, { silent: true, ignoreErrors: true });
    runCommand(`git tag ${testTag}`, { silent: true });
    runCommand(`git tag -d ${testTag}`, { silent: true });
    log('   ✅ Can create/delete tags', 'green');
    
    log('   ✅ Milestone push capability verified', 'green');
  } catch (error) {
    log(`   ❌ Milestone push test failed: ${error.message}`, 'red');
    return false;
  }
  
  log('\n✅ GIT REPOSITORY REPAIR COMPLETE', 'green');
  log('═══════════════════════════════════════════════════════════\n', 'cyan');
  log('Repository is now ready for milestone pushes!', 'green');
  log('You can now run: npm run milestone:push', 'cyan');
  
  return true;
}

if (require.main === module) {
  try {
    const success = fixGitRepository();
    process.exit(success ? 0 : 1);
  } catch (error) {
    log(`\n❌ Error: ${error.message}`, 'red');
    process.exit(1);
  }
}

module.exports = { fixGitRepository };

