#!/usr/bin/env node

/**
 * 🔧 Quick Git HEAD Fix
 * 
 * O'Brien's Pragmatic Solution: Reset HEAD to known good commit
 * This fixes the corrupted tree object issue
 */

const { execSync } = require('child_process');
const path = require('path');

const PROJECT_ROOT = path.resolve(__dirname, '..');

try {
  // Get last good commit from remote
  console.log('📡 Fetching from remote...');
  execSync('git fetch origin main', { cwd: PROJECT_ROOT, stdio: 'inherit' });
  
  // Get the commit hash
  const goodCommit = execSync('git log origin/main --oneline -1', {
    cwd: PROJECT_ROOT,
    encoding: 'utf8'
  }).trim().split(' ')[0];
  
  console.log(`✅ Found good commit: ${goodCommit}`);
  
  // Reset HEAD to good commit
  console.log('🔧 Resetting HEAD...');
  execSync(`git update-ref refs/heads/main ${goodCommit}`, { cwd: PROJECT_ROOT });
  execSync('git symbolic-ref HEAD refs/heads/main', { cwd: PROJECT_ROOT });
  
  console.log('✅ HEAD reset complete');
  console.log('✅ Git operations should now work');
  console.log('\nYou can now run: npm run milestone:push');
  
} catch (error) {
  console.error('❌ Error:', error.message);
  process.exit(1);
}

