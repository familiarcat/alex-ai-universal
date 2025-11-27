#!/usr/bin/env node

/**
 * 🖖 OPTIMIZED AUTOMATED MILESTONE PUSH
 * 
 * Fully automated milestone push - like a "Save" command
 * - Silent by default (only outputs on error or completion)
 * - Automatically handles common git issues
 * - Excludes build artifacts (.next*, node_modules, etc.)
 * - Auto-retries on transient failures
 * - Only informs user if process cannot complete automatically
 * 
 * Usage:
 *   node scripts/milestone-push-optimized.js
 *   node scripts/milestone-push-optimized.js --verbose
 */

const { execSync, spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

// Configuration
const VERBOSE = process.argv.includes('--verbose');
const MAX_RETRIES = 3;
const RETRY_DELAY = 2000; // 2 seconds

// Build artifact patterns to exclude (even if accidentally staged)
const BUILD_ARTIFACT_PATTERNS = [
  /^dashboard\/\.next/,
  /^dashboard\/\.next-\d+/,
  /^\.next/,
  /^\.next-\d+/,
  /node_modules/,
  /\.cache/,
  /\.tsbuildinfo$/,
  /\.log$/,
  /\.pid$/,
  /\.lock$/
];

/**
 * Silent log (only if verbose)
 */
function log(...args) {
  if (VERBOSE) {
    console.log(...args);
  }
}

/**
 * Error log (always shown)
 */
function error(...args) {
  console.error(...args);
}

/**
 * Success log (always shown, minimal)
 */
function success(message) {
  console.log(`✅ ${message}`);
}

/**
 * Clean up git lock files
 */
function cleanupGitLocks() {
  try {
    const lockFile = path.join(process.cwd(), '.git', 'index.lock');
    if (fs.existsSync(lockFile)) {
      log('🧹 Removing stale git lock file...');
      fs.unlinkSync(lockFile);
      log('✅ Lock file removed');
    }
  } catch (err) {
    // Ignore errors - lock file might not exist or might be legitimately locked
    log('⚠️  Could not remove lock file (may be in use)');
  }
}

/**
 * Get source files only (exclude build artifacts)
 */
function getSourceFiles() {
  try {
    const statusOutput = execSync('git status --porcelain', {
      encoding: 'utf8',
      maxBuffer: 10 * 1024 * 1024, // 10MB
      stdio: 'pipe'
    });

    if (!statusOutput.trim()) {
      return { hasChanges: false, files: [] };
    }

    const allFiles = statusOutput
      .split('\n')
      .filter(line => line.trim())
      .map(line => line.substring(3).trim())
      .filter(file => file.length > 0);

    // Filter out build artifacts
    const sourceFiles = allFiles.filter(file => {
      return !BUILD_ARTIFACT_PATTERNS.some(pattern => pattern.test(file));
    });

    const buildArtifacts = allFiles.filter(file => {
      return BUILD_ARTIFACT_PATTERNS.some(pattern => pattern.test(file));
    });

    if (buildArtifacts.length > 0 && VERBOSE) {
      log(`⚠️  Excluding ${buildArtifacts.length} build artifact(s):`, buildArtifacts.slice(0, 5));
    }

    return {
      hasChanges: sourceFiles.length > 0,
      files: sourceFiles,
      buildArtifacts: buildArtifacts.length
    };
  } catch (err) {
    error(`❌ Error checking git status: ${err.message}`);
    return { hasChanges: false, files: [] };
  }
}

/**
 * Unstage build artifacts
 */
function unstageBuildArtifacts() {
  try {
    const stagedOutput = execSync('git diff --cached --name-only', {
      encoding: 'utf8',
      maxBuffer: 10 * 1024 * 1024,
      stdio: 'pipe'
    });

    if (!stagedOutput.trim()) {
      return;
    }

    const stagedFiles = stagedOutput
      .split('\n')
      .filter(line => line.trim());

    const buildArtifacts = stagedFiles.filter(file => {
      return BUILD_ARTIFACT_PATTERNS.some(pattern => pattern.test(file));
    });

    if (buildArtifacts.length > 0) {
      log(`🧹 Unstaging ${buildArtifacts.length} build artifact(s)...`);
      // Unstage build artifacts
      buildArtifacts.forEach(file => {
        try {
          execSync(`git reset HEAD -- "${file}"`, {
            stdio: 'ignore',
            encoding: 'utf8'
          });
        } catch (err) {
          // Ignore individual file errors
        }
      });
      log(`✅ Unstaged ${buildArtifacts.length} build artifact(s)`);
    }
  } catch (err) {
    // Ignore errors - might not have any staged files
  }
}

/**
 * Generate milestone name
 */
function generateMilestoneName(files) {
  const date = new Date();
  const dateStr = date.toISOString().split('T')[0].replace(/-/g, '');
  const timeStr = date.toISOString().split('T')[1].split('.')[0].replace(/:/g, '');
  
  const hasUI = files.some(f => f.includes('component') || f.includes('page.tsx') || f.includes('dashboard'));
  const hasAPI = files.some(f => f.includes('api/') || f.includes('route.ts'));
  const hasInfra = files.some(f => f.includes('config') || f.includes('deploy') || f.includes('.sh'));
  const hasDocs = files.some(f => f.includes('docs/') || f.includes('.md'));
  
  let type = 'updates';
  if (hasUI && hasAPI) type = 'full-stack';
  else if (hasUI) type = 'ui';
  else if (hasAPI) type = 'api';
  else if (hasInfra) type = 'infra';
  else if (hasDocs) type = 'docs';
  
  return `milestone-${dateStr}-${timeStr}-${type}`;
}

/**
 * Generate commit message
 */
function generateCommitMessage(files) {
  const date = new Date().toISOString().split('T')[0];
  const time = new Date().toLocaleTimeString();
  
  // Categorize files
  const categories = {
    features: files.filter(f => (f.includes('component') || f.includes('page.tsx')) && !f.includes('fix')),
    fixes: files.filter(f => f.includes('fix') || f.includes('error')),
    api: files.filter(f => f.includes('api/') || f.includes('route.ts')),
    docs: files.filter(f => f.includes('docs/') || f.includes('.md')),
    scripts: files.filter(f => f.includes('scripts/') || f.includes('.sh')),
    config: files.filter(f => f.includes('config') || f.includes('.json'))
  };

  let message = `milestone: Automated Push - ${date} ${time}\n\n`;
  
  if (categories.features.length > 0) {
    message += `Features (${categories.features.length}):\n`;
    categories.features.slice(0, 3).forEach(f => {
      message += `- ${f.split('/').pop()}\n`;
    });
    if (categories.features.length > 3) {
      message += `- ... and ${categories.features.length - 3} more\n`;
    }
  }
  
  if (categories.fixes.length > 0) {
    message += `\nFixes (${categories.fixes.length}):\n`;
    categories.fixes.slice(0, 3).forEach(f => {
      message += `- ${f.split('/').pop()}\n`;
    });
  }
  
  if (categories.api.length > 0) {
    message += `\nAPI Changes (${categories.api.length}):\n`;
    categories.api.slice(0, 2).forEach(f => {
      message += `- ${f.split('/').pop()}\n`;
    });
  }
  
  if (categories.docs.length > 0) {
    message += `\nDocumentation (${categories.docs.length}):\n`;
    categories.docs.slice(0, 2).forEach(f => {
      message += `- ${f.split('/').pop()}\n`;
    });
  }
  
  message += `\nTotal: ${files.length} file(s) changed`;
  
  return message;
}

/**
 * Execute git command with retry
 */
function execGitWithRetry(command, description, retries = MAX_RETRIES) {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      log(`⏳ ${description} (attempt ${attempt}/${retries})...`);
      
      const output = execSync(command, {
        encoding: 'utf8',
        maxBuffer: 50 * 1024 * 1024, // 50MB
        stdio: VERBOSE ? 'inherit' : 'pipe',
        timeout: 300000 // 5 minutes
      });
      
      log(`✅ ${description} completed`);
      return { success: true, output };
    } catch (err) {
      const isLastAttempt = attempt === retries;
      const isNetworkError = err.message.includes('timeout') || 
                            err.message.includes('connection') ||
                            err.message.includes('pack-objects');
      
      if (isLastAttempt) {
        return { success: false, error: err.message };
      }
      
      if (isNetworkError) {
        log(`⚠️  ${description} failed (network issue), retrying in ${RETRY_DELAY}ms...`);
        // Wait before retry
        const start = Date.now();
        while (Date.now() - start < RETRY_DELAY) {
          // Busy wait (simple, no dependencies)
        }
      } else {
        // Non-network error, don't retry
        return { success: false, error: err.message };
      }
    }
  }
  
  return { success: false, error: 'Max retries exceeded' };
}

/**
 * Main milestone push execution
 */
async function executeMilestonePush() {
  // Step 0: Cleanup
  cleanupGitLocks();
  
  // Step 1: Get source files only
  log('📊 Checking repository status...');
  const { hasChanges, files, buildArtifacts } = getSourceFiles();
  
  if (!hasChanges) {
    if (VERBOSE) {
      log('ℹ️  No source file changes detected');
    }
    return { success: true, skipped: true, reason: 'No changes' };
  }
  
  log(`📝 Found ${files.length} source file(s) to commit`);
  if (buildArtifacts > 0) {
    log(`⚠️  Excluded ${buildArtifacts} build artifact(s)`);
  }
  
  // Step 2: Stage only source files
  log('📦 Staging source files...');
  const stageResult = execGitWithRetry(
    'git add -A',
    'Staging files'
  );
  
  if (!stageResult.success) {
    error(`❌ Failed to stage files: ${stageResult.error}`);
    return { success: false, error: stageResult.error };
  }
  
  // Step 3: Unstage any build artifacts that got staged
  unstageBuildArtifacts();
  
  // Step 4: Verify we have staged changes
  try {
    const stagedFiles = execSync('git diff --cached --name-only', {
      encoding: 'utf8',
      maxBuffer: 10 * 1024 * 1024,
      stdio: 'pipe'
    }).trim();
    
    if (!stagedFiles) {
      if (VERBOSE) {
        log('ℹ️  No changes to commit after filtering');
      }
      return { success: true, skipped: true, reason: 'No changes after filtering' };
    }
    
    const stagedCount = stagedFiles.split('\n').filter(l => l.trim()).length;
    log(`✅ ${stagedCount} file(s) staged`);
  } catch (err) {
    error(`❌ Failed to check staged files: ${err.message}`);
    return { success: false, error: err.message };
  }
  
  // Step 5: Generate milestone info
  const milestoneName = generateMilestoneName(files);
  const commitMessage = generateCommitMessage(files);
  
  log(`📋 Milestone: ${milestoneName}`);
  
  // Step 6: Create commit
  // Use -F flag with temp file to handle multi-line messages safely
  const tempFile = path.join(process.cwd(), '.git-commit-message.tmp');
  let commitResult;
  try {
    fs.writeFileSync(tempFile, commitMessage, 'utf8');
    commitResult = execGitWithRetry(
      `git commit -F "${tempFile}"`,
      'Creating commit'
    );
    
    // Clean up temp file
    try {
      fs.unlinkSync(tempFile);
    } catch (err) {
      // Ignore cleanup errors
    }
    
    if (!commitResult.success) {
      error(`❌ Failed to create commit: ${commitResult.error}`);
      return { success: false, error: commitResult.error };
    }
  } catch (err) {
    error(`❌ Failed to write commit message: ${err.message}`);
    return { success: false, error: err.message };
  }
  
  // Get commit SHA
  let commitSha;
  try {
    commitSha = execSync('git rev-parse --short HEAD', {
      encoding: 'utf8',
      stdio: 'pipe'
    }).trim();
  } catch (err) {
    commitSha = 'unknown';
  }
  
  log(`✅ Commit created: ${commitSha}`);
  
  // Step 7: Create tag
  log('🏷️  Creating tag...');
  // Delete local tag if it exists (avoid conflicts)
  try {
    execSync(`git tag -d "${milestoneName}" 2>/dev/null`, { stdio: 'ignore' });
  } catch (err) {
    // Tag doesn't exist, that's fine
  }
  
  // Create tag with first line of commit message
  const tagMessage = commitMessage.split('\n')[0];
  const tagResult = execGitWithRetry(
    `git tag -a "${milestoneName}" -m "${tagMessage.replace(/"/g, '\\"')}"`,
    'Creating tag'
  );
  
  if (!tagResult.success) {
    error(`❌ Failed to create tag: ${tagResult.error}`);
    // Continue anyway - commit is already created
  } else {
    log(`✅ Tag created: ${milestoneName}`);
  }
  
  // Step 8: Push to remote
  log('📤 Pushing to remote...');
  
  const pushBranchResult = execGitWithRetry(
    'git push origin HEAD',
    'Pushing branch'
  );
  
  if (!pushBranchResult.success) {
    error(`❌ Failed to push branch: ${pushBranchResult.error}`);
    error(`   Commit ${commitSha} created locally but not pushed`);
    error(`   Run 'git push' manually to complete`);
    return { success: false, error: pushBranchResult.error, commitSha };
  }
  
  const pushTagResult = execGitWithRetry(
    `git push origin "${milestoneName}" 2>&1 || git push origin "${milestoneName}" --force`,
    'Pushing tag'
  );
  
  if (!pushTagResult.success) {
    // Tag push failure is non-critical
    log(`⚠️  Tag push failed (non-critical): ${pushTagResult.error}`);
  }
  
  // Success!
  return {
    success: true,
    commitSha,
    tag: milestoneName,
    filesCount: files.length
  };
}

/**
 * Main execution
 */
async function main() {
  try {
    const result = await executeMilestonePush();
    
    if (result.skipped) {
      // Silent exit for no changes (no action taken, no feedback needed)
      process.exit(0);
    }
    
    if (result.success) {
      // Minimal success feedback - one line confirmation
      // Like a "Save" command that shows "Saved"
      success(`Milestone pushed: ${result.commitSha} (${result.filesCount} files)`);
      process.exit(0);
    } else {
      // Error - always show
      error(`\n❌ Milestone push failed: ${result.error}`);
      if (result.commitSha) {
        error(`   Commit ${result.commitSha} created locally`);
        error(`   Run 'git push' manually to complete`);
      }
      process.exit(1);
    }
  } catch (err) {
    error(`\n❌ Fatal error: ${err.message}`);
    if (VERBOSE) {
      error(err.stack);
    }
    process.exit(1);
  }
}

// Run
main();

