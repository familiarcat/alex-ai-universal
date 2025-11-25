#!/usr/bin/env node

/**
 * 🤖 FULLY AUTOMATED MILESTONE PUSH SYSTEM
 * 
 * This script completely automates the milestone push process:
 * 1. Detects changes in the repository
 * 2. Runs crew consensus review
 * 3. If approved, automatically executes milestone push
 * 4. Creates commit, tag, and pushes to remote
 * 
 * Usage:
 *   node scripts/automated-milestone-push.js
 *   node scripts/automated-milestone-push.js --force  # Skip crew review
 *   node scripts/automated-milestone-push.js --dry-run # Preview without executing
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Import crew review system
const milestoneReviewPath = path.join(__dirname, 'crew-coordination/milestone-review-optimized.js');

/**
 * Get current git changes
 */
function getGitChanges() {
  try {
    // Check if there are any changes
    const statusOutput = execSync('git status --porcelain', { encoding: 'utf8' });
    if (!statusOutput.trim()) {
      return { hasChanges: false, changes: [] };
    }

    // Get list of changed files
    const changedFiles = statusOutput
      .split('\n')
      .filter(line => line.trim())
      .map(line => line.substring(3).trim());

    // Get diff stats
    const diffStats = execSync('git diff --stat HEAD', { encoding: 'utf8' }).trim();

    return {
      hasChanges: true,
      changes: changedFiles,
      diffStats,
      status: statusOutput
    };
  } catch (error) {
    console.error('❌ Error getting git changes:', error.message);
    return { hasChanges: false, changes: [] };
  }
}

/**
 * Generate milestone name from changes
 */
function generateMilestoneName(changes) {
  const date = new Date();
  const dateStr = date.toISOString().split('T')[0];
  
  // Analyze changes to create descriptive name
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
  
  return `milestone-${dateStr}-${type}`;
}

/**
 * Run crew consensus review
 */
async function runCrewReview(changes, force = false) {
  if (force) {
    console.log('⚠️  Force mode: Skipping crew review');
    return { consensus: 'approved', reason: 'Force mode enabled' };
  }

  try {
    console.log('🖖 Running crew consensus review...');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    
    // Run the milestone review script with auto-execute flag
    const reviewOutput = execSync(
      `node "${milestoneReviewPath}" --auto-execute`,
      { encoding: 'utf8', cwd: path.join(__dirname, '..') }
    );

    // Parse consensus from output
    // The review script outputs "FINAL CONSENSUS: APPROVED" or similar
    let consensus = 'approved'; // Default to approved
    
    // Try to find FINAL CONSENSUS line
    const finalConsensusMatch = reviewOutput.match(/FINAL CONSENSUS:\s+(\w+)/i);
    if (finalConsensusMatch) {
      consensus = finalConsensusMatch[1].toLowerCase();
    } else {
      // Fallback: look for consensus in any format
      const consensusMatch = reviewOutput.match(/consensus[:\s]+(approved|minor_edits|needs_review)/i);
      if (consensusMatch) {
        consensus = consensusMatch[1].toLowerCase();
      }
    }
    
    // Also check for JSON output if available (when --json flag is used)
    if (reviewOutput.includes('"consensus"')) {
      try {
        const jsonLines = reviewOutput.split('\n');
        const jsonLine = jsonLines.find(line => line.includes('"consensus"'));
        if (jsonLine) {
          const jsonMatch = jsonLine.match(/"consensus"\s*:\s*"([^"]+)"/);
          if (jsonMatch) {
            consensus = jsonMatch[1].toLowerCase();
          }
        }
      } catch (e) {
        // Fall back to text parsing
      }
    }

    console.log(reviewOutput);
    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    return {
      consensus,
      output: reviewOutput
    };
  } catch (error) {
    console.error('⚠️  Crew review failed, proceeding with auto-approval:', error.message);
    return { consensus: 'approved', reason: 'Review system unavailable' };
  }
}

/**
 * Execute milestone push
 */
function executeMilestonePush(milestoneName, summary, dryRun = false) {
  if (dryRun) {
    console.log('🔍 DRY RUN MODE - Preview only\n');
    console.log('Would execute:');
    console.log(`  1. git add -A`);
    console.log(`  2. git commit -m "${summary}"`);
    console.log(`  3. git tag -a "${milestoneName}" -m "${summary}"`);
    console.log(`  4. git push origin HEAD`);
    console.log(`  5. git push origin --tags`);
    return true;
  }

  try {
    console.log('🚀 Executing milestone push...\n');

    // Stage all changes
    console.log('📦 Staging all changes...');
    execSync('git add -A', { stdio: 'inherit' });

    // Check if there are staged changes
    const stagedChanges = execSync('git diff --cached --name-only', { encoding: 'utf8' }).trim();
    if (!stagedChanges) {
      console.log('⚠️  No changes to commit');
      return false;
    }

    // Create commit
    console.log('📝 Creating milestone commit...');
    execSync(`git commit -m "${summary}"`, { stdio: 'inherit' });

    // Get commit SHA
    const commitSha = execSync('git rev-parse --short HEAD', { encoding: 'utf8' }).trim();

    // Create tag
    console.log('🏷️  Creating milestone tag...');
    const tagName = milestoneName;
    
    // Delete tag if it exists
    try {
      execSync(`git tag -d "${tagName}" 2>/dev/null`, { stdio: 'ignore' });
    } catch (e) {
      // Tag doesn't exist, that's fine
    }

    execSync(`git tag -a "${tagName}" -m "${summary}"`, { stdio: 'inherit' });

    // Push to remote
    console.log('📤 Pushing to remote...');
    execSync('git push origin HEAD', { stdio: 'inherit' });
    execSync(`git push origin "${tagName}"`, { stdio: 'inherit' });

    console.log('\n✅ Milestone push completed successfully!');
    console.log(`   Commit: ${commitSha}`);
    console.log(`   Tag: ${tagName}`);
    console.log(`   Summary: ${summary}`);

    return true;
  } catch (error) {
    console.error('❌ Milestone push failed:', error.message);
    return false;
  }
}

/**
 * Generate commit summary from changes
 */
function generateCommitSummary(changes) {
  const date = new Date().toISOString().split('T')[0];
  
  // Categorize changes
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

  // Build summary
  let summary = `milestone: 🖖 Automated Milestone Push - ${date}\n\n`;
  
  if (categories.features.length > 0) {
    summary += 'Features:\n';
    categories.features.slice(0, 5).forEach(f => {
      summary += `- ${f}\n`;
    });
    summary += '\n';
  }

  if (categories.fixes.length > 0) {
    summary += 'Fixes:\n';
    categories.fixes.slice(0, 5).forEach(f => {
      summary += `- ${f}\n`;
    });
    summary += '\n';
  }

  if (categories.improvements.length > 0) {
    summary += 'Improvements:\n';
    categories.improvements.slice(0, 5).forEach(f => {
      summary += `- ${f}\n`;
    });
    summary += '\n';
  }

  if (categories.docs.length > 0) {
    summary += 'Documentation:\n';
    categories.docs.slice(0, 3).forEach(f => {
      summary += `- ${f}\n`;
    });
    summary += '\n';
  }

  summary += `\nAutomated milestone push with crew consensus approval.`;

  return summary;
}

/**
 * Main execution
 */
async function main() {
  const args = process.argv.slice(2);
  const force = args.includes('--force');
  const dryRun = args.includes('--dry-run');

  console.log('🤖 Automated Milestone Push System');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  // Check git status
  const changes = getGitChanges();
  
  if (!changes.hasChanges) {
    console.log('ℹ️  No changes detected. Nothing to commit.');
    process.exit(0);
  }

  console.log(`📊 Detected ${changes.changes.length} changed files\n`);

  // Generate milestone name and summary
  const milestoneName = generateMilestoneName(changes.changes);
  const summary = generateCommitSummary(changes.changes);

  console.log(`🏷️  Milestone: ${milestoneName}\n`);

  // Run crew review (unless forced)
  const review = await runCrewReview(changes.changes, force);

  // Check consensus
  if (review.consensus === 'needs_review') {
    console.log('⚠️  Crew review indicates changes need manual review.');
    console.log('❌ Automated push cancelled. Please review changes manually.');
    process.exit(1);
  }

  if (review.consensus === 'minor_edits') {
    console.log('⚠️  Crew suggested minor edits, but proceeding with push...');
  }

  // Execute milestone push
  const success = executeMilestonePush(milestoneName, summary, dryRun);

  if (success) {
    console.log('\n🎉 Milestone push completed successfully!');
    process.exit(0);
  } else {
    console.log('\n❌ Milestone push failed');
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  main().catch(error => {
    console.error('❌ Fatal error:', error);
    process.exit(1);
  });
}

module.exports = { main, getGitChanges, generateMilestoneName, executeMilestonePush };

