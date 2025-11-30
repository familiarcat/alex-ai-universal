#!/usr/bin/env node

/**
 * 🖖 Milestones Folder Status Check
 * 
 * Checks if the old "milestones" folder is still active and can be safely retired
 * in favor of "milestones-organized".
 * 
 * Crew: Chief O'Brien (pragmatic analysis)
 */

const fs = require('fs');
const path = require('path');

function checkMilestonesFolderStatus() {
  console.log('🖖 Milestones Folder Status Check\n');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
  
  const rootDir = process.cwd();
  const milestonesDir = path.join(rootDir, 'milestones');
  const milestonesOrganizedDir = path.join(rootDir, 'milestones-organized');
  
  const status = {
    milestonesExists: fs.existsSync(milestonesDir),
    milestonesOrganizedExists: fs.existsSync(milestonesOrganizedDir),
    milestonesActive: false,
    canRetire: false,
    recommendations: []
  };
  
  if (!status.milestonesExists) {
    console.log('✅ Old "milestones" folder does not exist - already retired\n');
    return status;
  }
  
  if (!status.milestonesOrganizedExists) {
    console.log('❌ "milestones-organized" folder does not exist!');
    console.log('   Cannot retire "milestones" folder yet.\n');
    status.recommendations.push('Create milestones-organized structure first');
    return status;
  }
  
  console.log('📂 Analyzing milestones folder activity...\n');
  
  // Check for recent activity (last 30 days)
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  
  let recentActivity = false;
  let totalFiles = 0;
  let recentFiles = 0;
  
  function checkDirectory(dir) {
    if (!fs.existsSync(dir)) return;
    
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    
    entries.forEach(entry => {
      const fullPath = path.join(dir, entry.name);
      
      if (entry.isDirectory() && entry.name !== '.git' && entry.name !== 'node_modules') {
        checkDirectory(fullPath);
      } else if (entry.isFile() && entry.name.endsWith('.md')) {
        totalFiles++;
        const stats = fs.statSync(fullPath);
        if (stats.mtime > thirtyDaysAgo) {
          recentFiles++;
          recentActivity = true;
        }
      }
    });
  }
  
  checkDirectory(milestonesDir);
  
  status.milestonesActive = recentActivity;
  status.totalFiles = totalFiles;
  status.recentFiles = recentFiles;
  
  console.log(`📊 Analysis Results:`);
  console.log(`   Total milestone files: ${totalFiles}`);
  console.log(`   Recent files (last 30 days): ${recentFiles}`);
  console.log(`   Recent activity: ${recentActivity ? '✅ Yes' : '❌ No'}\n`);
  
  // Check if milestones-organized has all the files
  let organizedFiles = 0;
  function countOrganizedFiles(dir) {
    if (!fs.existsSync(dir)) return;
    
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    
    entries.forEach(entry => {
      const fullPath = path.join(dir, entry.name);
      
      if (entry.isDirectory() && entry.name !== '.git' && entry.name !== 'node_modules') {
        countOrganizedFiles(fullPath);
      } else if ((entry.isFile() || (entry.isSymbolicLink && entry.isSymbolicLink())) && 
                 entry.name.endsWith('.md') && entry.name !== 'README.md') {
        organizedFiles++;
      }
    });
  }
  
  countOrganizedFiles(milestonesOrganizedDir);
  
  console.log(`📊 Organized Structure:`);
  console.log(`   Files in milestones-organized: ${organizedFiles}`);
  console.log(`   Coverage: ${totalFiles > 0 ? Math.round((organizedFiles / totalFiles) * 100) : 0}%\n`);
  
  // Check for references to milestones folder
  console.log('🔍 Checking for active references to "milestones" folder...\n');
  
  const referencePatterns = [
    /milestones\//g,
    /['"]milestones\//g,
    /from ['"]\.\.\/milestones/g,
    /path.*milestones/g
  ];
  
  let referenceCount = 0;
  const checkedFiles = new Set();
  
  function checkForReferences(dir, maxDepth = 3, currentDepth = 0) {
    if (currentDepth >= maxDepth) return;
    if (!fs.existsSync(dir)) return;
    
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    
    entries.forEach(entry => {
      if (entry.name.startsWith('.') || 
          ['node_modules', '.git', 'dist', 'build', 'coverage'].includes(entry.name)) {
        return;
      }
      
      const fullPath = path.join(dir, entry.name);
      
      if (entry.isDirectory()) {
        checkForReferences(fullPath, maxDepth, currentDepth + 1);
      } else if (entry.isFile() && 
                 ['.js', '.ts', '.json', '.md', '.sh'].includes(path.extname(entry.name))) {
        if (checkedFiles.has(fullPath)) return;
        checkedFiles.add(fullPath);
        
        try {
          const content = fs.readFileSync(fullPath, 'utf-8');
          referencePatterns.forEach(pattern => {
            if (pattern.test(content)) {
              referenceCount++;
            }
          });
        } catch (error) {
          // Skip binary or unreadable files
        }
      }
    });
  }
  
  checkForReferences(rootDir);
  
  console.log(`   References found: ${referenceCount}`);
  
  // Determine if we can retire
  const coverage = totalFiles > 0 ? (organizedFiles / totalFiles) : 1;
  const canRetire = !recentActivity && coverage >= 0.9 && referenceCount < 10;
  
  status.canRetire = canRetire;
  status.coverage = coverage;
  status.referenceCount = referenceCount;
  
  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
  
  if (canRetire) {
    console.log('✅ RECOMMENDATION: Safe to retire "milestones" folder\n');
    console.log('   Conditions met:');
    console.log(`   • No recent activity (last 30 days)`);
    console.log(`   • High coverage (${Math.round(coverage * 100)}%)`);
    console.log(`   • Low reference count (${referenceCount})\n`);
    status.recommendations.push('Can safely archive or remove milestones folder');
    status.recommendations.push('Update any remaining references to use milestones-organized');
  } else {
    console.log('⚠️  RECOMMENDATION: Keep "milestones" folder active\n');
    if (recentActivity) {
      console.log('   Reasons:');
      console.log(`   • Recent activity detected (${recentFiles} files in last 30 days)`);
      status.recommendations.push('Wait for activity to subside before retiring');
    }
    if (coverage < 0.9) {
      console.log(`   • Low coverage (${Math.round(coverage * 100)}% - need 90%+)`);
      status.recommendations.push('Ensure all milestones are migrated to milestones-organized');
    }
    if (referenceCount >= 10) {
      console.log(`   • High reference count (${referenceCount} - need < 10)`);
      status.recommendations.push('Update references to use milestones-organized');
    }
    console.log('');
  }
  
  // Save status report
  const reportPath = path.join(rootDir, 'reports/milestones-folder-status.json');
  const reportDir = path.dirname(reportPath);
  if (!fs.existsSync(reportDir)) {
    fs.mkdirSync(reportDir, { recursive: true });
  }
  
  fs.writeFileSync(reportPath, JSON.stringify({
    timestamp: new Date().toISOString(),
    status,
    analysis: {
      totalFiles,
      recentFiles,
      organizedFiles,
      coverage,
      referenceCount
    }
  }, null, 2));
  
  console.log(`📄 Status report saved to: ${reportPath}\n`);
  
  return status;
}

if (require.main === module) {
  checkMilestonesFolderStatus();
}

module.exports = { checkMilestonesFolderStatus };

