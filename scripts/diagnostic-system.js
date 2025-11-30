#!/usr/bin/env node

/**
 * 🖖 Alex AI Diagnostic System
 * 
 * Star Trek Medical Diagnostic Levels:
 * - Level 1: Full crew examination across entire codebase (deepest analysis)
 * - Level 2: Targeted team examination of specific aspects (Riker + Quark coordinated)
 * - Level 3: General health check of each system (Crusher, Data, Troi led)
 * 
 * Management:
 * - ⚡ Riker: Tactical organization and crew coordination
 * - 💰 Quark: Cost-benefit optimization and resource allocation
 * 
 * Crew Leaders:
 * - 💊 Crusher: System health and diagnostics
 * - 🤖 Data: Technical analysis and system optimization
 * - 💭 Troi: User experience and psychological assessment
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const PROJECT_ROOT = path.resolve(__dirname, '..');

// Colors
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  cyan: '\x1b[36m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  red: '\x1b[31m',
  magenta: '\x1b[35m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

/**
 * ⚡ Riker's Team Coordination
 */
class RikerTeamCoordinator {
  constructor() {
    this.crewMembers = {
      picard: { name: 'Picard', role: 'Strategic Leadership', cost: 10 },
      riker: { name: 'Riker', role: 'Tactical Execution', cost: 8 },
      data: { name: 'Data', role: 'Technical Analysis', cost: 8 },
      laForge: { name: 'La Forge', role: 'Infrastructure', cost: 7 },
      worf: { name: 'Worf', role: 'Security', cost: 7 },
      troi: { name: 'Troi', role: 'User Experience', cost: 6 },
      crusher: { name: 'Crusher', role: 'Health & Diagnostics', cost: 6 },
      uhura: { name: 'Uhura', role: 'Communications', cost: 5 },
      quark: { name: 'Quark', role: 'Business Optimization', cost: 5 },
      obrien: { name: 'O\'Brien', role: 'Pragmatic Solutions', cost: 4 }
    };
  }

  /**
   * Build team for Level 2 diagnostic
   */
  buildLevel2Team(focusArea, quarkBudget) {
    log('\n⚡ RIKER: Building Level 2 Diagnostic Team', 'blue');
    log('═══════════════════════════════════════════════════════════\n', 'cyan');
    
    // Map focus areas to required crew
    const focusAreaMap = {
      'security': ['worf', 'data', 'laForge'],
      'performance': ['data', 'laForge', 'crusher'],
      'ux': ['troi', 'data', 'uhura'],
      'infrastructure': ['laForge', 'data', 'obrien'],
      'architecture': ['picard', 'data', 'laForge'],
      'cost': ['quark', 'riker', 'data'],
      'health': ['crusher', 'data', 'troi'],
      'integration': ['uhura', 'laForge', 'data']
    };
    
    const requiredCrew = focusAreaMap[focusArea] || ['data', 'laForge', 'crusher'];
    
    // Add Riker (always included for coordination)
    const team = ['riker', ...requiredCrew];
    
    // Calculate cost
    const teamCost = team.reduce((sum, member) => {
      return sum + (this.crewMembers[member]?.cost || 5);
    }, 0);
    
    log(`Focus Area: ${focusArea}`, 'yellow');
    log(`Required Crew: ${requiredCrew.join(', ')}`, 'yellow');
    log(`Team Cost: ${teamCost} units`, 'yellow');
    log(`Quark Budget: ${quarkBudget} units`, 'yellow');
    log('');
    
    if (teamCost > quarkBudget) {
      log('⚠️  Team cost exceeds budget, optimizing...', 'yellow');
      // Remove least critical members
      const optimized = this.optimizeTeam(team, quarkBudget);
      log(`Optimized Team: ${optimized.join(', ')}`, 'green');
      return optimized;
    }
    
    log(`✅ Team approved: ${team.join(', ')}`, 'green');
    return team;
  }

  optimizeTeam(team, budget) {
    // Priority order: Riker (always), then by role importance
    const priority = ['riker', 'data', 'crusher', 'laForge', 'troi', 'quark', 'picard', 'worf', 'uhura', 'obrien'];
    
    const optimized = [];
    let cost = 0;
    
    for (const member of priority) {
      if (team.includes(member)) {
        const memberCost = this.crewMembers[member]?.cost || 5;
        if (cost + memberCost <= budget) {
          optimized.push(member);
          cost += memberCost;
        }
      }
    }
    
    return optimized;
  }
}

/**
 * 💰 Quark's Cost-Benefit Analysis
 */
class QuarkCostOptimizer {
  constructor() {
    this.diagnosticLevels = {
      level1: { baseCost: 100, crewCount: 10, depth: 'deepest' },
      level2: { baseCost: 30, crewCount: 4, depth: 'targeted' },
      level3: { baseCost: 10, crewCount: 3, depth: 'health_check' }
    };
  }

  /**
   * Calculate cost and ROI for diagnostic level
   */
  analyzeDiagnosticCost(level, focusArea = null) {
    log('\n💰 QUARK: Cost-Benefit Analysis', 'magenta');
    log('═══════════════════════════════════════════════════════════\n', 'cyan');
    
    const levelInfo = this.diagnosticLevels[level];
    
    if (!levelInfo) {
      log(`❌ Unknown diagnostic level: ${level}`, 'red');
      return null;
    }
    
    const cost = focusArea 
      ? levelInfo.baseCost * 0.7  // Level 2 with focus area is cheaper
      : levelInfo.baseCost;
    
    const roi = this.calculateROI(level, cost);
    
    log(`Diagnostic Level: ${level.toUpperCase()}`, 'yellow');
    log(`Base Cost: ${levelInfo.baseCost} units`, 'yellow');
    log(`Actual Cost: ${cost} units`, 'yellow');
    log(`Crew Count: ${levelInfo.crewCount}`, 'yellow');
    log(`Depth: ${levelInfo.depth}`, 'yellow');
    log(`ROI: ${roi}%`, roi > 50 ? 'green' : 'yellow');
    log('');
    
    return { cost, roi, levelInfo };
  }

  calculateROI(level, cost) {
    // ROI based on diagnostic value
    const valueMap = {
      level1: 95,  // Highest value, catches everything
      level2: 70,  // Good value, targeted analysis
      level3: 40   // Basic value, quick health check
    };
    
    const value = valueMap[level] || 50;
    const roi = ((value - cost) / cost) * 100;
    
    return Math.max(0, Math.round(roi));
  }

  /**
   * Recommend optimal diagnostic level
   */
  recommendLevel(issueSeverity, issueScope) {
    log('💡 QUARK\'S RECOMMENDATION:', 'magenta');
    
    if (issueSeverity === 'critical' || issueScope === 'system-wide') {
      log('   Level 1 Diagnostic: Full crew examination', 'green');
      log('   Rationale: Critical/system-wide issues require comprehensive analysis', 'yellow');
      return 'level1';
    } else if (issueSeverity === 'high' || issueScope === 'component') {
      log('   Level 2 Diagnostic: Targeted team analysis', 'green');
      log('   Rationale: Focused analysis balances cost and thoroughness', 'yellow');
      return 'level2';
    } else {
      log('   Level 3 Diagnostic: Health check', 'green');
      log('   Rationale: Quick assessment for routine monitoring', 'yellow');
      return 'level3';
    }
  }
}

/**
 * 🖖 Level 1 Diagnostic: Full Crew Examination
 */
async function level1Diagnostic(issue = null) {
  log('\n🖖 LEVEL 1 DIAGNOSTIC: Full Crew Examination', 'bright');
  log('═══════════════════════════════════════════════════════════\n', 'cyan');
  log('Mission: Deepest analysis across entire codebase', 'cyan');
  log('Crew: All 10 crew members', 'cyan');
  log('');
  
  const quark = new QuarkCostOptimizer();
  const costAnalysis = quark.analyzeDiagnosticCost('level1');
  
  log('📋 Diagnostic Scope:', 'blue');
  log('   • Entire codebase analysis', 'yellow');
  log('   • All system components', 'yellow');
  log('   • Cross-component interactions', 'yellow');
  log('   • Architecture patterns', 'yellow');
  log('   • Security vulnerabilities', 'yellow');
  log('   • Performance bottlenecks', 'yellow');
  log('   • UX issues', 'yellow');
  log('   • Infrastructure health', 'yellow');
  log('   • Cost optimization opportunities', 'yellow');
  log('   • Integration points', 'yellow');
  log('');
  
  log('👥 Crew Assignment:', 'blue');
  const crew = ['picard', 'riker', 'data', 'laForge', 'worf', 'troi', 'crusher', 'uhura', 'quark', 'obrien'];
  crew.forEach((member, i) => {
    log(`   ${i + 1}. ${member.charAt(0).toUpperCase() + member.slice(1)}`, 'green');
  });
  log('');
  
  log('🔍 Analysis Areas:', 'blue');
  const areas = [
    'Code structure and organization',
    'Security and compliance',
    'Performance and optimization',
    'User experience and accessibility',
    'Infrastructure and deployment',
    'Cost and resource utilization',
    'Integration and communication',
    'Health and diagnostics',
    'Architecture and design patterns',
    'Pragmatic solutions and fixes'
  ];
  areas.forEach((area, i) => {
    log(`   ${i + 1}. ${area}`, 'yellow');
  });
  log('');
  
  log('⏱️  Estimated Time: 30-60 minutes', 'blue');
  log(`💰 Cost: ${costAnalysis.cost} units`, 'blue');
  log(`📊 ROI: ${costAnalysis.roi}%`, 'blue');
  log('');
  
  log('✅ Level 1 Diagnostic Ready', 'green');
  log('   This would execute full crew coordination via OpenRouter MCP', 'yellow');
  log('   Results stored in RAG system for future reference', 'yellow');
  log('');
  
  return {
    level: 'level1',
    crew: crew,
    cost: costAnalysis.cost,
    roi: costAnalysis.roi,
    scope: 'entire_codebase'
  };
}

/**
 * 🎯 Level 2 Diagnostic: Targeted Team Analysis
 */
async function level2Diagnostic(focusArea, issue = null) {
  log('\n🎯 LEVEL 2 DIAGNOSTIC: Targeted Team Analysis', 'bright');
  log('═══════════════════════════════════════════════════════════\n', 'cyan');
  log(`Mission: Focused analysis on ${focusArea}`, 'cyan');
  log('Coordination: Riker + Quark', 'cyan');
  log('');
  
  const riker = new RikerTeamCoordinator();
  const quark = new QuarkCostOptimizer();
  
  const costAnalysis = quark.analyzeDiagnosticCost('level2', focusArea);
  const team = riker.buildLevel2Team(focusArea, costAnalysis.cost);
  
  log('📋 Diagnostic Scope:', 'blue');
  log(`   • Focused on: ${focusArea}`, 'yellow');
  log(`   • Team size: ${team.length} crew members`, 'yellow');
  log(`   • Cost: ${costAnalysis.cost} units`, 'yellow');
  log(`   • ROI: ${costAnalysis.roi}%`, 'yellow');
  log('');
  
  log('👥 Team Members:', 'blue');
  team.forEach((member, i) => {
    log(`   ${i + 1}. ${member.charAt(0).toUpperCase() + member.slice(1)}`, 'green');
  });
  log('');
  
  log('🔍 Analysis Focus:', 'blue');
  const focusMap = {
    'security': ['Security vulnerabilities', 'Access controls', 'Data protection', 'Compliance'],
    'performance': ['Response times', 'Resource usage', 'Bottlenecks', 'Optimization'],
    'ux': ['User flows', 'Accessibility', 'Design patterns', 'User satisfaction'],
    'infrastructure': ['Deployment', 'Scaling', 'Monitoring', 'Reliability'],
    'architecture': ['Design patterns', 'Code organization', 'Scalability', 'Maintainability'],
    'cost': ['Resource costs', 'Optimization opportunities', 'ROI analysis', 'Budget planning'],
    'health': ['System health', 'Error rates', 'Performance metrics', 'Diagnostics'],
    'integration': ['API connections', 'Data flow', 'Service communication', 'Endpoints']
  };
  
  const focusAreas = focusMap[focusArea] || ['General analysis', 'Component health', 'Integration points'];
  focusAreas.forEach((area, i) => {
    log(`   ${i + 1}. ${area}`, 'yellow');
  });
  log('');
  
  log('⏱️  Estimated Time: 10-20 minutes', 'blue');
  log('');
  
  log('✅ Level 2 Diagnostic Ready', 'green');
  log('   Coordinated by Riker, optimized by Quark', 'yellow');
  log('');
  
  return {
    level: 'level2',
    focusArea: focusArea,
    team: team,
    cost: costAnalysis.cost,
    roi: costAnalysis.roi,
    scope: 'targeted'
  };
}

/**
 * 💊 Level 3 Diagnostic: Health Check
 */
async function level3Diagnostic() {
  log('\n💊 LEVEL 3 DIAGNOSTIC: System Health Check', 'bright');
  log('═══════════════════════════════════════════════════════════\n', 'cyan');
  log('Mission: Quick health assessment of all systems', 'cyan');
  log('Leaders: Crusher, Data, Troi', 'cyan');
  log('');
  
  const quark = new QuarkCostOptimizer();
  const costAnalysis = quark.analyzeDiagnosticCost('level3');
  
  log('📋 Diagnostic Scope:', 'blue');
  log('   • Quick health check of all systems', 'yellow');
  log('   • Basic metrics and status', 'yellow');
  log('   • Identify obvious issues', 'yellow');
  log('   • Routine monitoring', 'yellow');
  log('');
  
  log('👥 Team Leaders:', 'blue');
  log('   1. Crusher - Health & Diagnostics', 'green');
  log('   2. Data - Technical Analysis', 'green');
  log('   3. Troi - User Experience', 'green');
  log('');
  
  log('🔍 Health Check Areas:', 'blue');
  const healthAreas = [
    'System uptime and availability',
    'Error rates and logs',
    'Performance metrics',
    'Resource utilization',
    'User experience metrics',
    'Integration status',
    'Security status',
    'Cost metrics'
  ];
  healthAreas.forEach((area, i) => {
    log(`   ${i + 1}. ${area}`, 'yellow');
  });
  log('');
  
  log('⏱️  Estimated Time: 2-5 minutes', 'blue');
  log(`💰 Cost: ${costAnalysis.cost} units`, 'blue');
  log(`📊 ROI: ${costAnalysis.roi}%`, 'blue');
  log('');
  
  log('✅ Level 3 Diagnostic Ready', 'green');
  log('   Quick assessment for routine monitoring', 'yellow');
  log('');
  
  return {
    level: 'level3',
    team: ['crusher', 'data', 'troi'],
    cost: costAnalysis.cost,
    roi: costAnalysis.roi,
    scope: 'health_check'
  };
}

/**
 * Main diagnostic dispatcher
 */
async function runDiagnostic(level, options = {}) {
  log('🖖 ALEX AI DIAGNOSTIC SYSTEM', 'bright');
  log('═══════════════════════════════════════════════════════════\n', 'cyan');
  
  const { focusArea, issue, issueSeverity, issueScope } = options;
  
  // Quark recommends level if not specified
  if (!level) {
    const quark = new QuarkCostOptimizer();
    level = quark.recommendLevel(issueSeverity || 'medium', issueScope || 'component');
    log(`\n💰 Quark recommends: ${level.toUpperCase()}`, 'magenta');
    log('');
  }
  
  let result;
  
  switch (level) {
    case 'level1':
    case '1':
      result = await level1Diagnostic(issue);
      break;
      
    case 'level2':
    case '2':
      if (!focusArea) {
        log('❌ Level 2 requires a focus area', 'red');
        log('   Available: security, performance, ux, infrastructure, architecture, cost, health, integration', 'yellow');
        return;
      }
      result = await level2Diagnostic(focusArea, issue);
      break;
      
    case 'level3':
    case '3':
      result = await level3Diagnostic();
      break;
      
    default:
      log(`❌ Unknown diagnostic level: ${level}`, 'red');
      log('   Available: level1, level2, level3 (or 1, 2, 3)', 'yellow');
      return;
  }
  
  // Save diagnostic plan
  const outputDir = path.join(PROJECT_ROOT, 'docs', 'diagnostics');
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }
  
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const outputFile = path.join(outputDir, `diagnostic-${level}-${timestamp}.json`);
  
  const diagnosticPlan = {
    timestamp: new Date().toISOString(),
    level: result.level,
    result: result,
    options: options
  };
  
  fs.writeFileSync(outputFile, JSON.stringify(diagnosticPlan, null, 2));
  
  log(`\n💾 Diagnostic plan saved to: ${outputFile}`, 'green');
  log('');
  
  return result;
}

// CLI interface
if (require.main === module) {
  const args = process.argv.slice(2);
  const level = args[0];
  const focusArea = args[1];
  const issue = args.slice(2).join(' ') || null;
  
  const options = {
    focusArea: focusArea,
    issue: issue,
    issueSeverity: process.env.ISSUE_SEVERITY || 'medium',
    issueScope: process.env.ISSUE_SCOPE || 'component'
  };
  
  runDiagnostic(level, options).catch(error => {
    log(`\n❌ Error: ${error.message}`, 'red');
    process.exit(1);
  });
}

module.exports = {
  runDiagnostic,
  level1Diagnostic,
  level2Diagnostic,
  level3Diagnostic,
  RikerTeamCoordinator,
  QuarkCostOptimizer
};

