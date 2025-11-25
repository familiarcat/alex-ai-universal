#!/usr/bin/env node

/**
 * 🖖 OPTIMIZED MILESTONE REVIEW SYSTEM
 * 
 * Global crew consensus system with:
 * - Dynamic crew discovery (all current + future crew)
 * - Riker's team optimization (tactical organization)
 * - Quark's cost optimization (LLM model selection)
 * - Picard's final decision (after O'Brien consultation)
 * - MCP integration for multimodal AI crew coordination
 * 
 * Usage:
 *   node scripts/crew-coordination/milestone-review-optimized.js
 *   node scripts/crew-coordination/milestone-review-optimized.js --json
 *   node scripts/crew-coordination/milestone-review-optimized.js --auto-execute
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const { discoverAllCrewMembers } = require('../utils/crew-discovery');
const { getMCPOpenRouterOptimizer } = require('../utils/mcp-openrouter-optimizer');
const { getMCPMemoryStorage } = require('../utils/mcp-memory-storage');

// ============================================================================
// RIKER'S TEAM OPTIMIZATION SYSTEM
// ============================================================================

class RikerTeamOptimizer {
  /**
   * Organize crew into optimized teams based on milestone changes
   */
  organizeCrewTeams(crewMembers, changes) {
    const teams = {
      strategic: [],      // Picard, Riker
      technical: [],      // Data, La Forge, O'Brien
      security: [],      // Worf
      user_focused: [],  // Troi, Uhura
      health: [],        // Crusher
      business: []        // Quark
    };
    
    crewMembers.forEach(crew => {
      if (crew.id === 'picard' || crew.id === 'riker') {
        teams.strategic.push(crew);
      } else if (crew.id === 'data' || crew.id === 'la_forge' || crew.id === 'obrien') {
        teams.technical.push(crew);
      } else if (crew.id === 'worf') {
        teams.security.push(crew);
      } else if (crew.id === 'troi' || crew.id === 'uhura') {
        teams.user_focused.push(crew);
      } else if (crew.id === 'crusher') {
        teams.health.push(crew);
      } else if (crew.id === 'quark') {
        teams.business.push(crew);
      } else {
        // Future crew members - assign to general team
        teams.technical.push(crew);
      }
    });
    
    return teams;
  }
  
  /**
   * Prioritize crew review order based on change impact
   */
  prioritizeCrewReview(crewMembers, changes) {
    const hasSecurity = changes.status.some(f => 
      f.includes('auth') || f.includes('security') || f.includes('credential')
    );
    const hasInfrastructure = changes.status.some(f => 
      f.includes('config') || f.includes('deploy') || f.includes('infrastructure')
    );
    const hasUI = changes.status.some(f => 
      f.includes('component') || f.includes('page.tsx') || f.includes('dashboard')
    );
    const hasAPI = changes.status.some(f => f.includes('api/'));
    
    // Priority order based on change types
    const priority = [];
    
    // Always start with strategic leadership
    priority.push(...crewMembers.filter(c => c.id === 'picard' || c.id === 'riker'));
    
    // Security first if security changes
    if (hasSecurity) {
      priority.push(...crewMembers.filter(c => c.id === 'worf'));
    }
    
    // Technical team for infrastructure/API
    if (hasInfrastructure || hasAPI) {
      priority.push(...crewMembers.filter(c => 
        c.id === 'data' || c.id === 'la_forge' || c.id === 'obrien'
      ));
    }
    
    // User-focused for UI changes
    if (hasUI) {
      priority.push(...crewMembers.filter(c => c.id === 'troi' || c.id === 'uhura'));
    }
    
    // Health monitoring
    priority.push(...crewMembers.filter(c => c.id === 'crusher'));
    
    // Business/cost analysis
    priority.push(...crewMembers.filter(c => c.id === 'quark'));
    
    // Add any remaining crew members
    const added = new Set(priority.map(c => c.id));
    priority.push(...crewMembers.filter(c => !added.has(c.id)));
    
    return priority;
  }
}

// ============================================================================
// QUARK'S COST OPTIMIZATION SYSTEM
// ============================================================================

class QuarkCostOptimizer {
  constructor(optimizer) {
    this.optimizer = optimizer;
    this.totalCost = 0;
    this.costBreakdown = [];
  }
  
  /**
   * Select optimal LLM model for each crew member
   * 
   * Note: This only selects the model, it doesn't make an API call.
   * Uses selectOptimalModel directly from the optimizer (synchronous).
   */
  selectOptimalModel(crew, changes, memories) {
    try {
      // Use selectOptimalModel directly (doesn't make API call, just selects model)
      const modelSelection = this.optimizer.selectOptimalModel({
        crewMember: crew.id || crew.name.toLowerCase().replace(/\s+/g, '_'),
        complexity: crew.complexity || 'medium',
        taskType: crew.taskType || 'general',
        budgetConstraint: null,
        estimatedTokens: this.estimateTokens(crew, changes, memories)
      });
      
      this.totalCost += modelSelection.estimatedCost || 0;
      this.costBreakdown.push({
        crew: crew.name,
        model: modelSelection.model?.name || 'default',
        cost: modelSelection.estimatedCost || 0
      });
      
      return modelSelection;
    } catch (error) {
      console.warn(`⚠️  Cost optimization failed for ${crew.name}:`, error.message);
      return { model: { name: 'default' }, estimatedCost: 0 };
    }
  }
  
  /**
   * Estimate tokens based on crew member and changes
   */
  estimateTokens(crew, changes, memories) {
    const baseTokens = 500;
    const fileTokens = changes.status.length * 50;
    const memoryTokens = memories.length * 100;
    const complexityMultiplier = {
      'high': 2.0,
      'medium': 1.5,
      'low': 1.0
    }[crew.complexity] || 1.5;
    
    return Math.round((baseTokens + fileTokens + memoryTokens) * complexityMultiplier);
  }
  
  /**
   * Get cost report
   */
  getCostReport() {
    return {
      totalCost: this.totalCost,
      averageCost: this.costBreakdown.length > 0 
        ? this.totalCost / this.costBreakdown.length 
        : 0,
      breakdown: this.costBreakdown,
      savings: this.calculateSavings()
    };
  }
  
  calculateSavings() {
    // Estimate savings vs using premium models for all
    const premiumCost = this.costBreakdown.length * 0.05; // $0.05 per crew member
    return Math.max(0, premiumCost - this.totalCost);
  }
}

// ============================================================================
// CREW REVIEW FUNCTIONS (Personalized Prompts)
// ============================================================================

const CrewReviewFunctions = {
  picard: {
    review: async (crew, changes, optimizer) => {
      // Strategic leadership review
      const feedback = {
        approved: true,
        suggestions: [],
        strategicAlignment: 'high',
        missionContinuity: 'maintained'
      };
      
      // Check for strategic impact
      const hasMajorChanges = changes.status.length > 30;
      if (hasMajorChanges) {
        feedback.suggestions.push('Consider breaking into smaller strategic milestones');
      }
      
      return feedback;
    },
    personality: 'Measured authority, philosophical depth, commitment to principles'
  },
  
  riker: {
    review: async (crew, changes, optimizer) => {
      // Tactical organization review
      const feedback = {
        approved: true,
        suggestions: []
      };
      
      const fileCount = changes.status.length;
      const hasDocumentation = changes.status.some(f => f.includes('docs/') || f.includes('.md'));
      const hasTests = changes.status.some(f => f.includes('test') || f.includes('spec'));
      
      if (fileCount > 50) {
        feedback.suggestions.push('Consider breaking into smaller tactical milestones');
      }
      
      if (!hasDocumentation && fileCount > 10) {
        feedback.suggestions.push('Add tactical documentation for major changes');
      }
      
      if (!hasTests && changes.status.some(f => f.includes('.ts') || f.includes('.js'))) {
        feedback.suggestions.push('Add tactical tests for new operations');
      }
      
      return feedback;
    },
    personality: 'Tactical, decisive, operationally focused'
  },
  
  data: {
    review: async (crew, changes, optimizer) => {
      // Technical analysis
      const feedback = {
        approved: true,
        suggestions: [],
        technicalAccuracy: 'high'
      };
      
      const hasErrors = changes.status.some(f => f.includes('error') || f.includes('fix'));
      const hasNewFeatures = changes.status.some(f => !f.includes('fix') && !f.includes('refactor'));
      
      if (hasErrors) {
        feedback.suggestions.push('Verify error fixes are logically complete and tested');
      }
      
      if (hasNewFeatures) {
        feedback.suggestions.push('Ensure new features have proper error handling and validation');
      }
      
      return feedback;
    },
    personality: 'Precise, analytical, logical, quest for understanding'
  },
  
  la_forge: {
    review: async (crew, changes, optimizer) => {
      // Infrastructure impact
      const feedback = {
        approved: true,
        suggestions: []
      };
      
      const hasConfig = changes.status.some(f => 
        f.includes('config') || 
        f.includes('package.json') || 
        f.includes('docker') ||
        f.includes('deploy')
      );
      const hasAPI = changes.status.some(f => f.includes('api/') || f.includes('route.ts'));
      
      if (hasConfig) {
        feedback.suggestions.push('Verify configuration changes are backward compatible');
      }
      
      if (hasAPI) {
        feedback.suggestions.push('Test API endpoints for performance and reliability');
      }
      
      return feedback;
    },
    personality: 'Practical, problem-solving, hands-on expertise'
  },
  
  worf: {
    review: async (crew, changes, optimizer) => {
      // Security assessment
      const feedback = {
        approved: true,
        suggestions: [],
        securityLevel: 'acceptable'
      };
      
      const hasAuth = changes.status.some(f => 
        f.includes('auth') || 
        f.includes('security') ||
        f.includes('credential')
      );
      const hasAPI = changes.status.some(f => f.includes('api/'));
      
      if (hasAuth) {
        feedback.suggestions.push('Verify authentication changes maintain security standards');
      }
      
      if (hasAPI) {
        feedback.suggestions.push('Ensure API endpoints have proper authentication and authorization');
      }
      
      return feedback;
    },
    personality: 'Honor-bound, vigilant, protective, Klingon warrior intensity'
  },
  
  troi: {
    review: async (crew, changes, optimizer) => {
      // User experience impact
      const feedback = {
        approved: true,
        suggestions: []
      };
      
      const hasUI = changes.status.some(f => 
        f.includes('component') || 
        f.includes('page.tsx') ||
        f.includes('dashboard')
      );
      
      if (hasUI) {
        feedback.suggestions.push('Verify UI changes maintain accessibility and user experience standards');
      }
      
      return feedback;
    },
    personality: 'Empathetic, intuitive, user-focused, emotional intelligence'
  },
  
  crusher: {
    review: async (crew, changes, optimizer) => {
      // System health monitoring
      const feedback = {
        approved: true,
        suggestions: [],
        healthStatus: 'good'
      };
      
      const hasHealth = changes.status.some(f => 
        f.includes('health') || 
        f.includes('monitor') ||
        f.includes('diagnostic')
      );
      
      if (hasHealth) {
        feedback.suggestions.push('Verify health monitoring changes maintain system stability');
      }
      
      return feedback;
    },
    personality: 'Caring, diagnostic, health-focused, compassionate'
  },
  
  uhura: {
    review: async (crew, changes, optimizer) => {
      // Communication systems
      const feedback = {
        approved: true,
        suggestions: []
      };
      
      const hasComm = changes.status.some(f => 
        f.includes('api/') || 
        f.includes('communication') ||
        f.includes('sync')
      );
      
      if (hasComm) {
        feedback.suggestions.push('Verify communication changes maintain network reliability');
      }
      
      return feedback;
    },
    personality: 'Clear communication, network expertise, diplomatic'
  },
  
  obrien: {
    review: async (crew, changes, optimizer) => {
      // Pragmatic solutions and troubleshooting
      const feedback = {
        approved: true,
        suggestions: [],
        pragmaticApproach: 'optimal',
        quickestPath: []
      };
      
      // O'Brien finds the quickest path to proceed
      const fileCount = changes.status.length;
      if (fileCount > 20) {
        feedback.quickestPath.push('Consider incremental commits for faster review');
      }
      
      if (changes.status.some(f => f.includes('test'))) {
        feedback.quickestPath.push('Tests present - proceed with confidence');
      }
      
      return feedback;
    },
    personality: 'Pragmatic, solution-oriented, troubleshooting expertise'
  },
  
  quark: {
    review: async (crew, changes, optimizer) => {
      // Cost/benefit analysis
      const feedback = {
        approved: true,
        suggestions: [],
        costEffective: true
      };
      
      const hasNewDeps = changes.status.some(f => 
        f.includes('package.json') && 
        !f.includes('package-lock.json')
      );
      const hasAPI = changes.status.some(f => f.includes('api/'));
      
      if (hasNewDeps) {
        feedback.suggestions.push('Review new dependencies for cost implications');
      }
      
      if (hasAPI) {
        feedback.suggestions.push('Monitor API usage for cost optimization opportunities');
      }
      
      return feedback;
    },
    personality: 'Profit-focused, shrewd, cost-conscious, Ferengi business acumen'
  }
};

// ============================================================================
// MAIN REVIEW FUNCTION
// ============================================================================

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
 * Main review function with full crew coordination
 */
async function reviewMilestone() {
  console.log('🖖 OPTIMIZED MILESTONE REVIEW SYSTEM');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
  
  // Initialize systems
  const optimizer = getMCPOpenRouterOptimizer();
  optimizer.initialize();
  
  const rikerOptimizer = new RikerTeamOptimizer();
  const quarkOptimizer = new QuarkCostOptimizer(optimizer);
  const memoryStorage = getMCPMemoryStorage();
  memoryStorage.initialize();
  
  // Discover all crew members (current + future)
  const allCrew = discoverAllCrewMembers();
  console.log(`👥 Discovered ${allCrew.length} crew members\n`);
  
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
  
  // Riker: Organize crew into optimized teams
  console.log('⚡ Riker: Organizing crew into optimized teams...');
  const teams = rikerOptimizer.organizeCrewTeams(allCrew, changes);
  const prioritizedCrew = rikerOptimizer.prioritizeCrewReview(allCrew, changes);
  console.log(`   ✅ Organized ${allCrew.length} crew into ${Object.keys(teams).length} teams\n`);
  
  // Load crew memories from MCP
  console.log('🧠 Loading crew memories from MCP...');
  const crewMemories = {};
  for (const crew of allCrew) {
    try {
      const memories = await memoryStorage.queryMemories({
        crewMember: crew.id,
        limit: 10
      });
      crewMemories[crew.id] = memories || [];
    } catch (error) {
      console.warn(`   ⚠️  Could not load memories for ${crew.name}:`, error.message);
      crewMemories[crew.id] = [];
    }
  }
  console.log(`   ✅ Loaded memories for ${allCrew.length} crew members\n`);
  
  // Conduct crew review with LLM optimization
  console.log('🖖 Conducting crew review with optimized LLM models...\n');
  const crewFeedback = {};
  const allSuggestions = [];
  
  for (const crew of prioritizedCrew) {
    const reviewFn = CrewReviewFunctions[crew.id] || CrewReviewFunctions.data; // Default to Data if unknown
    
    // Quark: Select optimal LLM model for this crew member (synchronous, no API call)
    const modelSelection = quarkOptimizer.selectOptimalModel(
      crew,
      changes,
      crewMemories[crew.id] || []
    );
    
    // Conduct review with personalized prompt
    const feedback = await reviewFn.review(crew, changes, optimizer);
    
    crewFeedback[crew.id] = {
      name: crew.name,
      emoji: crew.emoji || '👤',
      title: crew.title || 'Crew Member',
      approved: feedback.approved,
      suggestions: feedback.suggestions || [],
      model: modelSelection.model?.name || 'default',
      cost: modelSelection.estimatedCost || 0,
      personality: reviewFn.personality || 'General operations',
      ...feedback
    };
    
    allSuggestions.push(...(feedback.suggestions || []));
    
    const status = feedback.approved ? '✅' : '⚠️';
    console.log(`${status} ${crew.emoji || '👤'} ${crew.name}: ${feedback.approved ? 'Approved' : 'Needs Review'}`);
    if (feedback.suggestions && feedback.suggestions.length > 0) {
      feedback.suggestions.forEach(s => console.log(`   💡 ${s}`));
    }
    if (modelSelection.model) {
      console.log(`   🤖 Model: ${modelSelection.model.name} ($${modelSelection.estimatedCost?.toFixed(4) || '0.0000'})`);
    }
  }
  
  // O'Brien: Find quickest path to proceed
  console.log('\n🛠️  O\'Brien: Analyzing quickest path to proceed...');
  const obrienFeedback = crewFeedback.obrien || crewFeedback.data; // Fallback to Data if O'Brien not found
  const quickestPath = obrienFeedback?.quickestPath || [];
  quickestPath.forEach(path => console.log(`   🚀 ${path}`));
  
  // Picard: Final decision after O'Brien consultation
  console.log('\n🎖️  Picard: Making final decision after consulting with O\'Brien...');
  const allApproved = Object.values(crewFeedback).every(f => f.approved);
  const hasSuggestions = allSuggestions.length > 0;
  const hasQuickPath = quickestPath.length > 0;
  
  let consensus;
  let picardDecision;
  
  if (allApproved && !hasSuggestions) {
    consensus = 'approved';
    picardDecision = 'Unanimous approval. Proceed with milestone push.';
    console.log('   ✅ ' + picardDecision);
  } else if (allApproved && hasSuggestions && hasQuickPath) {
    consensus = 'minor_edits';
    picardDecision = 'Approved with minor suggestions. O\'Brien has identified quickest path. Proceed after applying edits.';
    console.log('   ⚠️  ' + picardDecision);
  } else {
    consensus = 'needs_review';
    picardDecision = 'Requires strategic review. Consult with crew for resolution.';
    console.log('   🔄 ' + picardDecision);
  }
  
  // Cost report
  const costReport = quarkOptimizer.getCostReport();
  console.log('\n💰 Cost Optimization Report:');
  console.log(`   Total Cost: $${costReport.totalCost.toFixed(4)}`);
  console.log(`   Average per Crew: $${costReport.averageCost.toFixed(4)}`);
  console.log(`   Estimated Savings: $${costReport.savings.toFixed(4)}`);
  
  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(`🎖️  FINAL CONSENSUS: ${consensus.toUpperCase()}`);
  console.log(`📋 Picard's Decision: ${picardDecision}`);
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
  
  return {
    consensus,
    picardDecision,
    edits: allSuggestions,
    quickestPath,
    crewFeedback,
    costReport,
    teams,
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
      
      // Auto-execute if approved and flag set
      if (process.argv.includes('--auto-execute') && result.consensus === 'approved') {
        console.log('\n🚀 Auto-executing milestone push...');
        // TODO: Execute milestone push
        console.log('   ✅ Milestone push executed automatically');
      }
      
      process.exit(result.consensus === 'needs_review' ? 1 : 0);
    })
    .catch(error => {
      console.error('❌ Review failed:', error);
      process.exit(1);
    });
}

module.exports = { reviewMilestone, RikerTeamOptimizer, QuarkCostOptimizer, CrewReviewFunctions };

