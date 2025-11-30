#!/usr/bin/env node

/**
 * 🖖 Milestone Review System
 * 
 * Coordinates crew review of milestone changes
 * Returns consensus status and recommendations
 * 
 * Usage:
 *   node scripts/crew-coordination/milestone-review.js
 * 
 * Crew Coordination:
 * - Riker: Tactical organization review
 * - Data: Technical analysis
 * - La Forge: Infrastructure impact
 * - Worf: Security assessment
 * - Troi: UX impact analysis
 * - Quark: Cost/benefit review
 * 
 * Output:
 *   { consensus: 'approved' | 'minor_edits' | 'needs_review', edits: [...], crewFeedback: {...} }
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Crew member definitions
const CREW_MEMBERS = {
  riker: {
    name: 'Commander Riker',
    role: 'Tactical Operations',
    emoji: '⚡',
    focus: 'tactical_organization',
    reviewFunction: 'reviewTacticalOrganization'
  },
  data: {
    name: 'Commander Data',
    role: 'Technical Analysis',
    emoji: '🤖',
    focus: 'technical_accuracy',
    reviewFunction: 'reviewTechnicalAccuracy'
  },
  la_forge: {
    name: 'Lieutenant Commander La Forge',
    role: 'Infrastructure',
    emoji: '🔧',
    focus: 'infrastructure_impact',
    reviewFunction: 'reviewInfrastructureImpact'
  },
  worf: {
    name: 'Lieutenant Worf',
    role: 'Security',
    emoji: '⚔️',
    focus: 'security_assessment',
    reviewFunction: 'reviewSecurity'
  },
  troi: {
    name: 'Counselor Troi',
    role: 'User Experience',
    emoji: '💭',
    focus: 'ux_impact',
    reviewFunction: 'reviewUXImpact'
  },
  quark: {
    name: 'Quark',
    role: 'Cost Optimization',
    emoji: '💰',
    focus: 'cost_benefit',
    reviewFunction: 'reviewCostBenefit'
  }
};

/**
 * Get current git changes
 */
function getGitChanges() {
  try {
    const status = execSync('git status --short', { encoding: 'utf8' });
    const diff = execSync('git diff --cached --stat', { encoding: 'utf8' });
    const unstaged = execSync('git diff --stat', { encoding: 'utf8' });
    
    return {
      status: status.trim().split('\n').filter(Boolean),
      staged: diff.trim(),
      unstaged: unstaged.trim()
    };
  } catch (error) {
    return { status: [], staged: '', unstaged: '' };
  }
}

/**
 * Review tactical organization (Riker)
 */
function reviewTacticalOrganization(changes) {
  const fileCount = changes.status.length;
  const hasDocumentation = changes.status.some(f => f.includes('docs/') || f.includes('.md'));
  const hasTests = changes.status.some(f => f.includes('test') || f.includes('spec'));
  
  const feedback = {
    approved: true,
    suggestions: []
  };
  
  if (fileCount > 50) {
    feedback.suggestions.push('Consider breaking into smaller milestones for better organization');
  }
  
  if (!hasDocumentation) {
    feedback.suggestions.push('Consider adding documentation for major changes');
  }
  
  if (!hasTests && changes.status.some(f => f.includes('.ts') || f.includes('.js'))) {
    feedback.suggestions.push('Consider adding tests for new functionality');
  }
  
  return feedback;
}

/**
 * Review technical accuracy (Data)
 */
function reviewTechnicalAccuracy(changes) {
  const hasErrors = changes.status.some(f => f.includes('error') || f.includes('fix'));
  const hasNewFeatures = changes.status.some(f => !f.includes('fix') && !f.includes('refactor'));
  
  const feedback = {
    approved: true,
    suggestions: []
  };
  
  if (hasErrors) {
    feedback.suggestions.push('Verify error fixes are complete and tested');
  }
  
  if (hasNewFeatures) {
    feedback.suggestions.push('Ensure new features have proper error handling');
  }
  
  return feedback;
}

/**
 * Review infrastructure impact (La Forge)
 */
function reviewInfrastructureImpact(changes) {
  const hasConfig = changes.status.some(f => 
    f.includes('config') || 
    f.includes('package.json') || 
    f.includes('docker') ||
    f.includes('deploy')
  );
  const hasAPI = changes.status.some(f => f.includes('api/') || f.includes('route.ts'));
  
  const feedback = {
    approved: true,
    suggestions: []
  };
  
  if (hasConfig) {
    feedback.suggestions.push('Verify configuration changes are backward compatible');
  }
  
  if (hasAPI) {
    feedback.suggestions.push('Test API endpoints for performance impact');
  }
  
  return feedback;
}

/**
 * Review security (Worf)
 */
function reviewSecurity(changes) {
  const hasAuth = changes.status.some(f => 
    f.includes('auth') || 
    f.includes('security') ||
    f.includes('credential')
  );
  const hasAPI = changes.status.some(f => f.includes('api/'));
  
  const feedback = {
    approved: true,
    suggestions: []
  };
  
  if (hasAuth) {
    feedback.suggestions.push('Verify authentication changes maintain security standards');
  }
  
  if (hasAPI) {
    feedback.suggestions.push('Ensure API endpoints have proper authentication');
  }
  
  return feedback;
}

/**
 * Review UX impact (Troi)
 */
function reviewUXImpact(changes) {
  const hasUI = changes.status.some(f => 
    f.includes('component') || 
    f.includes('page.tsx') ||
    f.includes('dashboard')
  );
  
  const feedback = {
    approved: true,
    suggestions: []
  };
  
  if (hasUI) {
    feedback.suggestions.push('Verify UI changes maintain accessibility standards');
  }
  
  return feedback;
}

/**
 * Review cost/benefit (Quark)
 */
function reviewCostBenefit(changes) {
  const hasNewDeps = changes.status.some(f => 
    f.includes('package.json') && 
    !f.includes('package-lock.json')
  );
  const hasAPI = changes.status.some(f => f.includes('api/'));
  
  const feedback = {
    approved: true,
    suggestions: []
  };
  
  if (hasNewDeps) {
    feedback.suggestions.push('Review new dependencies for cost implications');
  }
  
  if (hasAPI) {
    feedback.suggestions.push('Monitor API usage for cost optimization opportunities');
  }
  
  return feedback;
}

/**
 * Main review function
 */
async function reviewMilestone() {
  console.log('🖖 Milestone Review System');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
  
  const changes = getGitChanges();
  
  if (changes.status.length === 0) {
    console.log('⚠️  No changes detected. Nothing to review.\n');
    return {
      consensus: 'needs_review',
      reason: 'No changes to review',
      crewFeedback: {}
    };
  }
  
  console.log(`📊 Changes detected: ${changes.status.length} files\n`);
  
  // Conduct crew review
  const crewFeedback = {};
  const allSuggestions = [];
  
  for (const [id, member] of Object.entries(CREW_MEMBERS)) {
    const reviewFunction = eval(member.reviewFunction); // eslint-disable-line no-eval
    const feedback = reviewFunction(changes);
    
    crewFeedback[id] = {
      name: member.name,
      emoji: member.emoji,
      approved: feedback.approved,
      suggestions: feedback.suggestions
    };
    
    allSuggestions.push(...feedback.suggestions);
    
    const status = feedback.approved ? '✅' : '⚠️';
    console.log(`${status} ${member.emoji} ${member.name}: ${feedback.approved ? 'Approved' : 'Needs Review'}`);
    if (feedback.suggestions.length > 0) {
      feedback.suggestions.forEach(s => console.log(`   💡 ${s}`));
    }
  }
  
  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  
  // Determine consensus
  const allApproved = Object.values(crewFeedback).every(f => f.approved);
  const hasSuggestions = allSuggestions.length > 0;
  
  let consensus;
  if (allApproved && !hasSuggestions) {
    consensus = 'approved';
    console.log('✅ CONSENSUS: Unanimous Approval - Ready for automated push\n');
  } else if (allApproved && hasSuggestions) {
    consensus = 'minor_edits';
    console.log('⚠️  CONSENSUS: Approved with Minor Suggestions - Can auto-apply and push\n');
  } else {
    consensus = 'needs_review';
    console.log('🔄 CONSENSUS: Needs Review - User input required\n');
  }
  
  return {
    consensus,
    edits: allSuggestions,
    crewFeedback,
    changes: {
      fileCount: changes.status.length,
      files: changes.status
    }
  };
}

// Main execution
if (require.main === module) {
  reviewMilestone()
    .then(result => {
      // Output JSON for programmatic use
      if (process.argv.includes('--json')) {
        console.log(JSON.stringify(result, null, 2));
      }
      process.exit(result.consensus === 'needs_review' ? 1 : 0);
    })
    .catch(error => {
      console.error('❌ Review failed:', error);
      process.exit(1);
    });
}

module.exports = { reviewMilestone, CREW_MEMBERS };

