#!/usr/bin/env node
/**
 * Update Milestone Tagging
 * 
 * Ensures milestones are properly tagged when stored via N8N workflow
 */

const { execSync } = require('child_process');

// Update the milestone push script to use crew-memory-storage webhook
function updateMilestoneScript() {
  const milestoneScriptPath = require('path').join(__dirname, '..', 'scripts', 'alex-ai-enhanced-milestone-push-corrected.sh');
  
  // Read the script
  const fs = require('fs');
  let scriptContent = fs.readFileSync(milestoneScriptPath, 'utf8');
  
  // Check if it already uses the optimized webhook
  if (scriptContent.includes('crew-memory-storage')) {
    console.log('✅ Milestone script already uses crew-memory-storage webhook');
    return;
  }
  
  // Find the n8n-post-knowledge.js call and update it
  const oldPattern = /node scripts\/n8n-post-knowledge\.js[^\n]*/g;
  const newCall = `node scripts/n8n-post-knowledge.js \\
                    --summary "$milestone_name" \\
                    --features "$features_summary" \\
                    --tags "milestone,git,$branch,role-infrastructure,intention-milestone_tracking"`;
  
  if (scriptContent.match(oldPattern)) {
    scriptContent = scriptContent.replace(oldPattern, newCall);
    fs.writeFileSync(milestoneScriptPath, scriptContent);
    console.log('✅ Updated milestone script to use optimized tagging');
  } else {
    console.log('⚠️  Could not find n8n-post-knowledge.js call in milestone script');
  }
}

// Main
console.log('\n📋 Updating Milestone Tagging...\n');
updateMilestoneScript();
console.log('\n✅ Milestone tagging update complete!\n');

