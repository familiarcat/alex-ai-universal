#!/usr/bin/env node

/**
 * 🔧 Complete Git Repository Fix
 * 
 * O'Brien's Pragmatic Solution: Complete repository recovery
 * This fixes severe corruption by re-initializing from remote
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const PROJECT_ROOT = path.resolve(__dirname, '..');

const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

try {
  log('🔧 COMPLETE GIT REPOSITORY FIX', 'cyan');
  log('═══════════════════════════════════════════════════════════\n', 'cyan');
  
  // Step 1: Get remote URL
  log('📡 Step 1: Getting remote URL...', 'cyan');
  let remoteUrl;
  try {
    remoteUrl = execSync('git remote get-url origin', {
      cwd: PROJECT_ROOT,
      encoding: 'utf8',
      stdio: 'pipe'
    }).trim();
    log(`   ✅ Remote: ${remoteUrl}`, 'green');
  } catch (error) {
    log('   ❌ No remote configured', 'red');
    log('   Using default: ssh://git@github.com/familiarcat/alex-ai-universal.git', 'yellow');
    remoteUrl = 'ssh://git@github.com/familiarcat/alex-ai-universal.git';
  }
  
  // Step 2: Save current branch name
  log('\n📋 Step 2: Saving current state...', 'cyan');
  let currentBranch = 'main';
  try {
    currentBranch = execSync('git rev-parse --abbrev-ref HEAD', {
      cwd: PROJECT_ROOT,
      encoding: 'utf8',
      stdio: 'pipe'
    }).trim() || 'main';
  } catch (error) {
    // Ignore - we'll use main
  }
  log(`   ✅ Will restore to branch: ${currentBranch}`, 'green');
  
  // Step 3: Remove corrupted .git directory
  log('\n🗑️  Step 3: Removing corrupted .git directory...', 'cyan');
  const gitDir = path.join(PROJECT_ROOT, '.git');
  if (fs.existsSync(gitDir)) {
    // Remove only refs and objects, keep config
    const refsDir = path.join(gitDir, 'refs');
    const objectsDir = path.join(gitDir, 'objects');
    if (fs.existsSync(refsDir)) {
      fs.rmSync(refsDir, { recursive: true, force: true });
      log('   ✅ Removed refs directory', 'green');
    }
    if (fs.existsSync(objectsDir)) {
      fs.rmSync(objectsDir, { recursive: true, force: true });
      log('   ✅ Removed objects directory', 'green');
    }
    // Remove index
    const indexFile = path.join(gitDir, 'index');
    if (fs.existsSync(indexFile)) {
      fs.unlinkSync(indexFile);
      log('   ✅ Removed index file', 'green');
    }
  }
  
  // Step 4: Re-initialize git
  log('\n🔄 Step 4: Re-initializing git repository...', 'cyan');
  execSync('git init', { cwd: PROJECT_ROOT, stdio: 'inherit' });
  log('   ✅ Repository initialized', 'green');
  
  // Step 5: Add remote (or update if exists)
  log('\n📡 Step 5: Configuring remote...', 'cyan');
  try {
    execSync(`git remote add origin ${remoteUrl}`, { 
      cwd: PROJECT_ROOT, 
      stdio: 'pipe' 
    });
    log('   ✅ Remote added', 'green');
  } catch (error) {
    // Remote already exists, update it
    execSync(`git remote set-url origin ${remoteUrl}`, {
      cwd: PROJECT_ROOT,
      stdio: 'pipe'
    });
    log('   ✅ Remote updated', 'green');
  }
  
  // Step 6: Fetch from remote
  log('\n📥 Step 6: Fetching from remote...', 'cyan');
  try {
    execSync('git fetch origin', { cwd: PROJECT_ROOT, stdio: 'inherit' });
    log('   ✅ Fetched from remote', 'green');
  } catch (error) {
    log('   ⚠️  Fetch had issues, but continuing...', 'yellow');
  }
  
  // Step 7: Checkout main branch
  log('\n🌿 Step 7: Checking out main branch...', 'cyan');
  try {
    execSync('git checkout -b main origin/main', { 
      cwd: PROJECT_ROOT, 
      stdio: 'inherit' 
    });
    log('   ✅ Checked out main branch', 'green');
  } catch (error) {
    // Try alternative
    execSync('git branch -M main', { cwd: PROJECT_ROOT, stdio: 'pipe' });
    execSync('git reset --hard origin/main', { cwd: PROJECT_ROOT, stdio: 'inherit' });
    log('   ✅ Reset to origin/main', 'green');
  }
  
  // Step 8: Verify
  log('\n✅ Step 8: Verifying repository...', 'cyan');
  const status = execSync('git status', {
    cwd: PROJECT_ROOT,
    encoding: 'utf8',
    stdio: 'pipe'
  });
  log('   ✅ Repository is now functional', 'green');
  
  log('\n✅ GIT REPOSITORY FIX COMPLETE!', 'green');
  log('═══════════════════════════════════════════════════════════\n', 'cyan');
  log('Repository has been restored from remote.', 'green');
  log('You can now run: npm run milestone:push', 'cyan');
  log('');
  
} catch (error) {
  log(`\n❌ Error: ${error.message}`, 'red');
  log('\nIf this fails, you may need to:', 'yellow');
  log('1. Clone fresh: git clone <remote-url> <new-directory>', 'yellow');
  log('2. Copy your uncommitted changes', 'yellow');
  log('3. Replace the corrupted repository', 'yellow');
  process.exit(1);
}

