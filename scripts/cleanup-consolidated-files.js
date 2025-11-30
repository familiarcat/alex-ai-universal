#!/usr/bin/env node

/**
 * 🖖 Cleanup Consolidated Files
 * 
 * Removes duplicate/consolidated files to keep structure clean
 * Only removes files that have been consolidated into newer versions
 */

const fs = require('fs');
const path = require('path');

const PROJECT_ROOT = path.resolve(__dirname, '..');

// Colors
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

/**
 * Find and remove duplicate implementation plans
 */
function cleanupImplementationPlans() {
  log('\n📋 Cleaning up duplicate implementation plans...', 'cyan');
  
  const plansDir = path.join(PROJECT_ROOT, 'docs', 'crew-coordination');
  if (!fs.existsSync(plansDir)) return;

  const files = fs.readdirSync(plansDir)
    .filter(f => f.startsWith('implementation-plan-') && f.endsWith('.json'))
    .map(f => ({
      name: f,
      path: path.join(plansDir, f),
      mtime: fs.statSync(path.join(plansDir, f)).mtime
    }))
    .sort((a, b) => b.mtime - a.mtime); // Newest first

  if (files.length > 1) {
    // Keep the newest, remove older duplicates
    const newest = files[0];
    const duplicates = files.slice(1);
    
    log(`  ✅ Keeping: ${newest.name} (newest)`, 'green');
    
    duplicates.forEach(dup => {
      try {
        fs.unlinkSync(dup.path);
        log(`  🗑️  Removed: ${dup.name}`, 'yellow');
      } catch (error) {
        log(`  ⚠️  Could not remove ${dup.name}: ${error.message}`, 'yellow');
      }
    });
  }
}

/**
 * Find and remove duplicate architectural reviews
 */
function cleanupArchitecturalReviews() {
  log('\n📊 Cleaning up duplicate architectural reviews...', 'cyan');
  
  const reviewsDir = path.join(PROJECT_ROOT, 'docs', 'crew-coordination');
  if (!fs.existsSync(reviewsDir)) return;

  const files = fs.readdirSync(reviewsDir)
    .filter(f => f.startsWith('architectural-review-') && f.endsWith('.json'))
    .map(f => ({
      name: f,
      path: path.join(reviewsDir, f),
      mtime: fs.statSync(path.join(reviewsDir, f)).mtime
    }))
    .sort((a, b) => b.mtime - a.mtime); // Newest first

  if (files.length > 1) {
    // Keep the newest, remove older duplicates
    const newest = files[0];
    const duplicates = files.slice(1);
    
    log(`  ✅ Keeping: ${newest.name} (newest)`, 'green');
    
    duplicates.forEach(dup => {
      try {
        fs.unlinkSync(dup.path);
        log(`  🗑️  Removed: ${dup.name}`, 'yellow');
      } catch (error) {
        log(`  ⚠️  Could not remove ${dup.name}: ${error.message}`, 'yellow');
      }
    });
  }
}

/**
 * Main execution
 */
function main() {
  log('\n🖖 CLEANUP: CONSOLIDATED FILES', 'cyan');
  log('═══════════════════════════════════════════════════════════\n', 'cyan');

  try {
    cleanupImplementationPlans();
    cleanupArchitecturalReviews();

    log('\n✅ Cleanup complete!', 'green');
    log('═══════════════════════════════════════════════════════════\n', 'cyan');

  } catch (error) {
    log(`\n❌ Error during cleanup: ${error.message}`, 'red');
    process.exit(1);
  }
}

main();

