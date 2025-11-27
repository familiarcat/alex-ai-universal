#!/usr/bin/env node

/**
 * 🤖 AUTOMATED MILESTONE PUSH WITH TIMEOUT & STATUS UPDATES
 * 
 * Fully automated milestone push with:
 * - Timeout protection for all operations
 * - Real-time status updates
 * - Progress indicators
 * - Non-blocking RAG integration
 * 
 * Usage:
 *   node scripts/automated-milestone-push-with-timeout.js
 *   node scripts/automated-milestone-push-with-timeout.js --force
 *   node scripts/automated-milestone-push-with-timeout.js --dry-run
 */

const { execSync, spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

// Configuration - Adaptive timeouts based on operation type
// These are generous to avoid blocking automation, especially with many files
const TIMEOUTS = {
  gitAdd: 120000,      // 2 minutes (can be slow with many files)
  gitCommit: 60000,    // 1 minute (large commits can take time)
  gitTag: 30000,       // 30 seconds
  gitPush: 300000,     // 5 minutes (network operation, can be slow)
  ragIntegration: 30000, // 30 seconds (non-blocking)
};

/**
 * Execute command with timeout and status updates
 */
function execWithTimeout(command, options = {}, timeout = 10000) {
  return new Promise((resolve, reject) => {
    const startTime = Date.now();
    const [cmd, ...args] = command.split(' ');
    
    console.log(`⏳ Executing: ${command.substring(0, 60)}...`);
    
    const child = spawn(cmd, args, {
      ...options,
      shell: true,
      stdio: ['ignore', 'pipe', 'pipe']
    });

    let stdout = '';
    let stderr = '';

    child.stdout.on('data', (data) => {
      stdout += data.toString();
      process.stdout.write(data);
    });

    child.stderr.on('data', (data) => {
      stderr += data.toString();
      process.stderr.write(data);
    });

    const timeoutId = setTimeout(() => {
      child.kill('SIGTERM');
      reject(new Error(`Command timed out after ${timeout}ms: ${command}`));
    }, timeout);

    child.on('close', (code) => {
      clearTimeout(timeoutId);
      const duration = Date.now() - startTime;
      
      if (code === 0) {
        console.log(`✅ Completed in ${duration}ms`);
        resolve(stdout);
      } else {
        reject(new Error(`Command failed with code ${code}: ${stderr || stdout}`));
      }
    });

    child.on('error', (error) => {
      clearTimeout(timeoutId);
      reject(error);
    });
  });
}

/**
 * Get git changes with timeout
 */
function getGitChanges() {
  try {
    console.log('\n📊 Checking repository status...');
    // Quick command - use execSync directly
    const statusOutput = execSync('git status --porcelain', { 
      encoding: 'utf8',
      maxBuffer: 1024 * 1024,
      stdio: 'pipe'
    });
    
    if (!statusOutput.trim()) {
      console.log('ℹ️  No changes detected');
      return { hasChanges: false, changes: [] };
    }

    const changedFiles = statusOutput
      .split('\n')
      .filter(line => line.trim())
      .map(line => line.substring(3).trim());

    console.log(`📝 Found ${changedFiles.length} changed file(s)`);
    
    return {
      hasChanges: true,
      changes: changedFiles,
      status: statusOutput
    };
  } catch (error) {
    console.error('❌ Error checking git status:', error.message);
    return { hasChanges: false, changes: [] };
  }
}

/**
 * Generate milestone name
 */
function generateMilestoneName(changes) {
  const date = new Date();
  const dateStr = date.toISOString().split('T')[0];
  const timeStr = date.toISOString().split('T')[1].split('.')[0].replace(/:/g, '');
  
  const hasUI = changes.some(f => f.includes('component') || f.includes('page.tsx') || f.includes('dashboard'));
  const hasAPI = changes.some(f => f.includes('api/') || f.includes('route.ts'));
  const hasInfra = changes.some(f => f.includes('config') || f.includes('deploy') || f.includes('.sh'));
  const hasDocs = changes.some(f => f.includes('docs/') || f.includes('.md'));
  
  let type = 'updates';
  if (hasUI && hasAPI) type = 'full-stack';
  else if (hasUI) type = 'ui';
  else if (hasAPI) type = 'api';
  else if (hasInfra) type = 'infrastructure';
  else if (hasDocs) type = 'documentation';
  
  return `milestone-${dateStr}-${timeStr}-${type}`;
}

/**
 * Generate commit summary
 */
function generateCommitSummary(changes) {
  const date = new Date().toISOString().split('T')[0];
  const time = new Date().toLocaleTimeString();
  
  const categories = {
    features: [],
    fixes: [],
    improvements: [],
    docs: [],
    refactor: []
  };

  changes.forEach(file => {
    if (file.includes('component') || file.includes('page.tsx') || file.includes('dashboard')) {
      if (file.includes('fix') || file.includes('error')) {
        categories.fixes.push(file);
      } else {
        categories.features.push(file);
      }
    } else if (file.includes('api/')) {
      categories.improvements.push(file);
    } else if (file.includes('docs/') || file.includes('.md')) {
      categories.docs.push(file);
    } else if (file.includes('refactor') || file.includes('optimize')) {
      categories.refactor.push(file);
    } else {
      categories.improvements.push(file);
    }
  });

  let summary = `milestone: Automated Push - ${date} ${time}\n\n`;
  
  if (categories.features.length > 0) {
    summary += 'Features:\n';
    categories.features.slice(0, 5).forEach(f => {
      summary += `- ${f}\n`;
    });
  }
  
  if (categories.fixes.length > 0) {
    summary += '\nFixes:\n';
    categories.fixes.slice(0, 5).forEach(f => {
      summary += `- ${f}\n`;
    });
  }
  
  if (categories.improvements.length > 0) {
    summary += '\nImprovements:\n';
    categories.improvements.slice(0, 3).forEach(f => {
      summary += `- ${f}\n`;
    });
  }
  
  if (categories.docs.length > 0) {
    summary += '\nDocumentation:\n';
    categories.docs.slice(0, 3).forEach(f => {
      summary += `- ${f}\n`;
    });
  }
  
  summary += `\nTotal files changed: ${changes.length}`;
  
  return summary;
}

/**
 * Calculate adaptive timeout based on file count
 */
function getAdaptiveTimeout(baseTimeout, fileCount) {
  // Add 1 second per 10 files, with minimum of base timeout
  const additionalTime = Math.floor(fileCount / 10) * 1000;
  return Math.max(baseTimeout, baseTimeout + additionalTime);
}

/**
 * Execute milestone push with timeouts and status updates
 */
async function executeMilestonePush(milestoneName, summary, fileCount = 0, dryRun = false) {
  if (dryRun) {
    console.log('\n🔍 DRY RUN MODE - Preview only\n');
    console.log('Would execute:');
    console.log(`  1. git add -A`);
    console.log(`  2. git commit -m "${summary.split('\n')[0]}"`);
    console.log(`  3. git tag -a "${milestoneName}" -m "${summary.split('\n')[0]}"`);
    console.log(`  4. git push origin HEAD`);
    console.log(`  5. git push origin --tags`);
    return true;
  }

  try {
    console.log('\n🚀 Starting milestone push...\n');
    
    // Calculate adaptive timeouts based on file count
    const adaptiveTimeouts = {
      gitAdd: getAdaptiveTimeout(TIMEOUTS.gitAdd, fileCount),
      gitCommit: getAdaptiveTimeout(TIMEOUTS.gitCommit, fileCount),
      gitTag: TIMEOUTS.gitTag,
      gitPush: TIMEOUTS.gitPush,
      ragIntegration: TIMEOUTS.ragIntegration
    };
    
    if (fileCount > 100) {
      console.log(`ℹ️  Large change set detected (${fileCount} files)`);
      console.log(`   Using adaptive timeouts for optimal performance\n`);
    }

    // Step 1: Stage changes
    console.log('📦 Step 1/5: Staging all changes...');
    await execWithTimeout('git add -A', {}, adaptiveTimeouts.gitAdd);
    console.log('✅ All changes staged\n');

    // Step 2: Check for staged changes
    console.log('🔍 Step 2/5: Checking staged changes...');
    const stagedChanges = execSync('git diff --cached --name-only', { 
      encoding: 'utf8',
      maxBuffer: 1024 * 1024,
      stdio: 'pipe'
    }).trim();
    
    if (!stagedChanges) {
      console.log('⚠️  No changes to commit');
      return false;
    }
    console.log(`✅ Found ${stagedChanges.split('\n').length} staged file(s)\n`);

    // Step 3: Create commit
    console.log('📝 Step 3/5: Creating milestone commit...');
    const commitMessage = summary.replace(/"/g, '\\"').replace(/\$/g, '\\$');
    await execWithTimeout(
      `git commit -m "${commitMessage}"`,
      {},
      adaptiveTimeouts.gitCommit
    );
    const commitSha = execSync('git rev-parse --short HEAD', { 
      encoding: 'utf8',
      maxBuffer: 1024,
      stdio: 'pipe'
    }).trim();
    console.log(`✅ Commit created: ${commitSha}\n`);

    // Step 4: Create tag
    console.log('🏷️  Step 4/5: Creating milestone tag...');
    try {
      execSync(`git tag -d "${milestoneName}" 2>/dev/null`, { stdio: 'ignore' });
    } catch (e) {
      // Tag doesn't exist, that's fine
    }
    await execWithTimeout(
      `git tag -a "${milestoneName}" -m "${summary.split('\n')[0]}"`,
      {},
      adaptiveTimeouts.gitTag
    );
    console.log(`✅ Tag created: ${milestoneName}\n`);

    // Step 5: Push to remote
    console.log('📤 Step 5/5: Pushing to remote...');
    console.log('   Pushing branch...');
    await execWithTimeout(
      'git push origin HEAD',
      {},
      adaptiveTimeouts.gitPush
    );
    console.log('   Pushing tag...');
    await execWithTimeout(
      `git push origin "${milestoneName}"`,
      {},
      adaptiveTimeouts.gitPush
    );
    console.log('✅ Push completed\n');

    console.log('✅ Milestone push completed successfully!');
    console.log(`   Commit: ${commitSha}`);
    console.log(`   Tag: ${milestoneName}`);
    console.log(`   Summary: ${summary.split('\n')[0]}\n`);

    // Non-blocking RAG integration (with timeout)
    console.log('🧠 Posting milestone to RAG (non-blocking)...');
    setTimeout(async () => {
      try {
        const ragScript = path.join(__dirname, 'n8n-post-knowledge.js');
        if (fs.existsSync(ragScript)) {
          await execWithTimeout(
            `node ${ragScript} --summary "${summary.split('\n')[0]}" --tags "milestone,git"`,
            {},
            TIMEOUTS.ragIntegration
          );
          console.log('✅ RAG integration completed');
        }
      } catch (error) {
        console.warn(`⚠️  RAG integration failed (non-blocking): ${error.message}`);
      }
    }, 100);

    return true;
  } catch (error) {
    console.error(`\n❌ Milestone push failed: ${error.message}`);
    if (error.message.includes('timeout')) {
      console.error('   Operation timed out. This may indicate:');
      console.error('   - Network connectivity issues');
      console.error('   - Git authentication problems');
      console.error('   - Remote repository unavailable');
    }
    return false;
  }
}

/**
 * Main execution
 */
async function main() {
  const args = process.argv.slice(2);
  const force = args.includes('--force');
  const dryRun = args.includes('--dry-run');

  console.log('🖖 Automated Milestone Push System');
  console.log('===================================\n');

  // Get changes
  const changes = getGitChanges();
  
  if (!changes.hasChanges && !force) {
    console.log('ℹ️  No changes detected. Use --force to push anyway.');
    process.exit(0);
  }

  // Generate milestone info
  const milestoneName = generateMilestoneName(changes.changes);
  const summary = generateCommitSummary(changes.changes);
  const fileCount = changes.changes.length;

  console.log(`\n📋 Milestone Details:`);
  console.log(`   Name: ${milestoneName}`);
  console.log(`   Files: ${fileCount}`);
  console.log(`   Summary: ${summary.split('\n')[0]}\n`);

  // Execute push (pass file count for adaptive timeouts)
  const success = await executeMilestonePush(milestoneName, summary, fileCount, dryRun);

  if (success) {
    console.log('🎉 Milestone push completed successfully!\n');
    process.exit(0);
  } else {
    console.log('❌ Milestone push failed\n');
    process.exit(1);
  }
}

// Run main
main().catch(error => {
  console.error('❌ Fatal error:', error);
  process.exit(1);
});

