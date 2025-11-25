#!/usr/bin/env node

/**
 * 🖖 OPTIMIZED OBSERVATION LOUNGE - Consolidated & Cost-Optimized
 * 
 * Consolidates all observation lounge scripts into a single optimized system.
 * 
 * Features:
 * - Riker's Crew Coordination: Tactical organization and workflow management
 * - Quark's Cost Optimization: Budget-aware LLM model selection
 * - Data/O'Brien/La Forge: Optimized file structure and infrastructure
 * - Default: Cinematic format, saves to .md file
 * 
 * Usage:
 *   node scripts/observation-lounge-optimized.js
 *   node scripts/observation-lounge-optimized.js "review our progress"
 *   node scripts/observation-lounge-optimized.js --standard --no-save
 */

const fs = require('fs');
const path = require('path');
const https = require('https');
const { getMCPMemoryStorage } = require('./utils/mcp-memory-storage');
const { getMCPOpenRouterOptimizer } = require('./utils/mcp-openrouter-optimizer');

// ============================================================================
// CREW MEMBER DEFINITIONS (Optimized by Data, O'Brien, La Forge)
// ============================================================================

const CREW_MEMBERS = {
  picard: {
    name: 'Captain Jean-Luc Picard',
    title: 'Commanding Officer',
    emoji: '🎖️',
    specialization: 'Strategic leadership and mission continuity',
    personality: 'Measured authority, philosophical depth, commitment to principles',
    taskType: 'strategic_planning',
    complexity: 'high'
  },
  riker: {
    name: 'Commander William Riker',
    title: 'Executive Officer',
    emoji: '⚡',
    specialization: 'Tactical operations and workflow management',
    personality: 'Tactical, decisive, operationally focused',
    taskType: 'operations',
    complexity: 'medium'
  },
  data: {
    name: 'Commander Data',
    title: 'Operations Officer',
    emoji: '🤖',
    specialization: 'Technical analysis and system optimization',
    personality: 'Precise, analytical, logical, quest for understanding',
    taskType: 'complex_analysis',
    complexity: 'high'
  },
  la_forge: {
    name: 'Lieutenant Commander Geordi La Forge',
    title: 'Chief Engineer',
    emoji: '🔧',
    specialization: 'Infrastructure health and engineering',
    personality: 'Practical, problem-solving, hands-on expertise',
    taskType: 'code_generation',
    complexity: 'medium'
  },
  worf: {
    name: 'Lieutenant Worf',
    title: 'Security Chief',
    emoji: '⚔️',
    specialization: 'Security analysis and threat assessment',
    personality: 'Honor-bound, vigilant, protective, Klingon warrior intensity',
    taskType: 'security_review',
    complexity: 'medium'
  },
  troi: {
    name: 'Counselor Deanna Troi',
    title: 'Ship\'s Counselor',
    emoji: '💭',
    specialization: 'User experience and psychological assessment',
    personality: 'Empathetic, intuitive, user-focused, emotional intelligence',
    taskType: 'user_experience',
    complexity: 'medium'
  },
  crusher: {
    name: 'Dr. Beverly Crusher',
    title: 'Chief Medical Officer',
    emoji: '💊',
    specialization: 'System health and medical diagnosis',
    personality: 'Caring, diagnostic, health-focused, compassionate',
    taskType: 'health_monitoring',
    complexity: 'low'
  },
  uhura: {
    name: 'Lieutenant Uhura',
    title: 'Communications Officer',
    emoji: '📻',
    specialization: 'Communication systems and network optimization',
    personality: 'Clear communication, network expertise, diplomatic',
    taskType: 'user_experience',
    complexity: 'medium'
  },
  quark: {
    name: 'Quark',
    title: 'Business Operations',
    emoji: '💰',
    specialization: 'Business optimization and cost analysis',
    personality: 'Profit-focused, shrewd, cost-conscious, Ferengi business acumen',
    taskType: 'business_analysis',
    complexity: 'low'  // Quark uses cost-effective models
  },
  chief_obrien: {
    name: 'Chief Miles O\'Brien',
    title: 'Chief of Operations',
    emoji: '🛠️',
    specialization: 'Pragmatic solutions and troubleshooting',
    personality: 'No-nonsense, practical, experience-based, anti-over-engineering',
    taskType: 'operations',
    complexity: 'low'  // O'Brien uses cost-effective models
  }
};

// ============================================================================
// RIKER'S COORDINATION SYSTEM (Tactical Organization)
// ============================================================================

class RikerCoordinationSystem {
  /**
   * Organize crew members for optimal parallel execution
   * Riker's specialty: Tactical operations and workflow management
   */
  organizeCrewExecution(crewMembers, topic) {
    // Riker's coordination logic: Group by complexity and specialization
    const executionGroups = {
      high_priority: [],  // Strategic/Complex tasks first
      medium_priority: [],
      low_priority: []    // Cost-effective tasks
    };

    Object.values(crewMembers).forEach(crew => {
      if (crew.complexity === 'high') {
        executionGroups.high_priority.push(crew);
      } else if (crew.complexity === 'medium') {
        executionGroups.medium_priority.push(crew);
      } else {
        executionGroups.low_priority.push(crew);
      }
    });

    // Riker's tactical order: High → Medium → Low (ensures critical insights first)
    return [
      ...executionGroups.high_priority,
      ...executionGroups.medium_priority,
      ...executionGroups.low_priority
    ];
  }

  /**
   * Estimate execution time based on crew coordination
   */
  estimateExecutionTime(crewOrder) {
    // Riker's estimation: High complexity = 3s, Medium = 2s, Low = 1s
    const timePerCrew = {
      high: 3000,
      medium: 2000,
      low: 1000
    };

    return crewOrder.reduce((total, crew) => {
      return total + (timePerCrew[crew.complexity] || 2000);
    }, 0);
  }
}

// ============================================================================
// QUARK'S COST OPTIMIZATION SYSTEM (Budget-Aware Model Selection)
// ============================================================================

class QuarkCostOptimizer {
  constructor(optimizer) {
    this.optimizer = optimizer;
    this.totalCost = 0;
    this.costBreakdown = [];
  }

  /**
   * Select optimal model for crew member (Quark's cost optimization)
   */
  selectOptimalModel(crew, memories, projectContext, topic) {
    // Quark's cost optimization: Use task type and complexity to select model
    const estimatedTokens = this.estimateTokens(crew.complexity, memories.length);
    
    // Use the optimizer's internal selection logic
    const modelSelection = this.optimizer.selectOptimalModel({
      taskType: crew.taskType,
      complexity: crew.complexity,
      crewMember: crew.id || crew.name.toLowerCase().replace(/\s+/g, '_'),
      budgetConstraint: null,  // No hard budget, but optimize for cost
      estimatedTokens: estimatedTokens
    });

    return {
      modelId: modelSelection.modelId,
      modelName: modelSelection.model?.name || modelSelection.modelId,
      estimatedCost: modelSelection.estimatedCost,
      estimatedTokens: estimatedTokens,
      confidence: modelSelection.confidence,
      model: modelSelection.model  // Full model object for later use
    };
  }

  /**
   * Estimate tokens based on complexity and context
   */
  estimateTokens(complexity, memoryCount) {
    const baseTokens = {
      low: 500,
      medium: 1500,
      high: 3000
    };

    const memoryMultiplier = Math.min(memoryCount / 5, 1.5); // Cap at 1.5x
    return Math.round(baseTokens[complexity] * (1 + memoryMultiplier));
  }

  /**
   * Track cost for reporting
   */
  trackCost(crewName, cost, model) {
    this.totalCost += cost;
    this.costBreakdown.push({
      crew: crewName,
      cost: cost,
      model: model
    });
  }

  /**
   * Generate cost report (Quark's specialty)
   */
  generateCostReport() {
    const report = {
      totalCost: this.totalCost,
      averageCost: this.totalCost / this.costBreakdown.length,
      breakdown: this.costBreakdown,
      savings: this.calculateSavings()
    };

    return report;
  }

  /**
   * Calculate savings vs. using expensive models for everyone
   */
  calculateSavings() {
    // If we used Claude 3.5 Sonnet for everyone (worst case)
    const worstCaseCost = this.costBreakdown.length * 0.009; // $3/1M * 3000 tokens
    return worstCaseCost - this.totalCost;
  }
}

// ============================================================================
// MEMORY RETRIEVAL (Optimized by Data)
// ============================================================================

async function retrieveCrewMemories() {
  const memoryStorage = getMCPMemoryStorage();
  memoryStorage.initialize();
  
  const memories = {};
  const crewOrder = Object.keys(CREW_MEMBERS);
  
  // Data's optimization: Parallel retrieval where possible
  const memoryPromises = crewOrder.map(async (crewId) => {
    try {
      const result = await memoryStorage.queryMemories('', {
        limit: 10,
        crewMember: crewId,
        category: 'crew_memory'
      });
      
      return { crewId, memories: result.memories || result.data || [] };
    } catch (error) {
      console.warn(`⚠️  Could not retrieve memories for ${crewId}: ${error.message}`);
      return { crewId, memories: [] };
    }
  });
  
  const results = await Promise.all(memoryPromises);
  results.forEach(({ crewId, memories: mems }) => {
    memories[crewId] = mems;
  });
  
  return memories;
}

// ============================================================================
// CINEMATIC SCREENPLAY GENERATION
// ============================================================================

function generateCinematicOpening(topic = 'Project Status Review') {
  const stardate = new Date().toISOString().split('T')[0].replace(/-/g, '.');
  
  return `# 🖖 Observation Lounge: ${topic}
## Stardate: ${stardate} | Location: USS Enterprise-D

---

## 📽️ SCENE ONE: The Gathering

*The soft hum of the Enterprise's engines provides a gentle backdrop as the observation lounge doors slide open with a gentle hiss. Stars streak past the panoramic windows, painting the room in a cosmic glow. The senior staff takes their positions around the polished conference table, each carrying their specialized analysis and unique perspective on the project.*

**CAPTAIN PICARD** *(standing at the head of the table, hands clasped behind his back, his commanding presence setting the tone)*

> "Gentlemen, ladies. We've gathered here today in the Observation Lounge to review our collective experiences—our memories, if you will—stored within our Supabase memory banks. Each of us has contributed to the mission in unique ways, and it's time we acknowledge those contributions and assess our current state."

*The Captain's gaze sweeps across the assembled crew. Data's golden eyes reflect the starlight as he processes the request. Riker leans forward, ready to coordinate. La Forge adjusts his VISOR, scanning the data streams. Worf sits ramrod straight, ever vigilant. Troi's empathic senses reach out, feeling the crew's anticipation. Crusher reviews her medical logs. Uhura monitors communication channels. Quark calculates potential profit margins. O'Brien checks his tools, ready for any technical challenge.*

---

## 📽️ SCENE TWO: Memory Access Protocol

*The room's LCARS displays come to life, showing connection status to the Supabase memory core. Each crew member's personal terminal begins synchronizing with the central database.*

**DATA** *(tapping his console with mechanical precision)*

> "Captain, I am accessing my memory records now. I have successfully established connection with the Supabase memory core. Querying my personal memory entries..."

*Data's console displays a cascade of information as memories flow into view. The other crew members follow suit, each accessing their own memory banks.*

---

## 📽️ SCENE THREE: Individual Reports

`;
}

function generateCharacterSegment(crew, memories, assessment, costInfo = null) {
  const { name, title, emoji, specialization } = crew;
  
  const memoryContext = memories.length > 0
    ? memories.slice(0, 5).map((m, i) => `  ${i + 1}. ${m.title || m.content?.substring(0, 100) || 'Memory entry'}`).join('\n')
    : '  (No recent memories found)';
  
  const costNote = costInfo ? `\n**💰 Cost Optimization (Quark):** $${costInfo.cost.toFixed(4)} (${costInfo.model})` : '';
  
  return `### ${emoji} ${name}
**${title} | ${specialization}**

${assessment.opening || `As ${title}, I have reviewed our current state and my memories.`}

**Current State:**
${assessment.currentState || 'Reviewing project status and recent developments.'}

**Concerns:**
${assessment.concerns || 'Monitoring for potential issues in my area of expertise.'}

**Opportunities:**
${assessment.opportunities || 'Identifying potential improvements and optimizations.'}

**Recommendations:**
${assessment.recommendations || 'Providing guidance based on my specialized knowledge.'}

**Recent Memories:**
${memoryContext}${costNote}

${assessment.closing || 'I stand ready to contribute to our continued success.'}

---

`;
}

function generateCinematicClosing(costReport = null) {
  const costSection = costReport ? `
**💰 COST OPTIMIZATION REPORT (Quark)**

Total Cost: $${costReport.totalCost.toFixed(4)}
Average per Crew Member: $${costReport.averageCost.toFixed(4)}
Estimated Savings: $${costReport.savings.toFixed(4)}

*Quark's cost optimization ensured we used the most cost-effective models for each crew member's specialization.*

` : '';

  return `## 📽️ SCENE FOUR: The Conclusion

*Captain Picard stands, his hands clasped behind his back as he gazes out at the stars streaking past the viewport. The crew's assessments have been heard, their memories reviewed, their concerns acknowledged, and their recommendations noted.*

**CAPTAIN PICARD** *(turning to face the assembled crew)*

> "Thank you all for your insights. The work we've accomplished and the challenges we've identified today represent a significant step forward in our mission. Each of you has brought unique perspectives that will guide our future endeavors."

${costSection}
*The crew members nod in agreement, their collective wisdom now documented and stored in the RAG system for future reference.*

**PICARD**

> "The integration of our memories, the optimization of our systems, and the coordination of our crew positions us well for the challenges ahead. We are stronger together than we could ever be alone."

*He pauses, his gaze sweeping across the room one final time.*

**PICARD**

> "Make it so."

---

**ALL CREW MEMBERS** *(standing at attention)*

> "Aye, Captain!"

---

*The observation lounge meeting concludes. The crew's memories have been reviewed, their assessments documented, and their recommendations recorded. The session has been saved for future reference.*

**FADE OUT.**

---

## 📊 Session Summary

**Date:** ${new Date().toISOString()}  
**Format:** Cinematic Screenplay  
**Crew Members:** All 10 senior staff  
**Status:** Complete

---

*End of Observation Lounge Session*

`;
}

// ============================================================================
// CREW ASSESSMENT GENERATION (Using Optimized Models)
// ============================================================================

async function generateCrewAssessment(crew, memories, projectContext, topic, optimizer, costOptimizer) {
  const memoryContext = memories.length > 0
    ? `\nYour recent memories:\n${memories.slice(0, 5).map((m, i) => `${i + 1}. ${m.title || m.content?.substring(0, 100) || 'Memory'}`).join('\n')}`
    : '\n(No recent memories found)';
  
  const prompt = `You are ${crew.name}, ${crew.title} of the Alex AI Universal project.

Your specialization: ${crew.specialization}
Your personality: ${crew.personality}

Topic for this Observation Lounge meeting: ${topic}

Project Context:
${JSON.stringify(projectContext, null, 2)}
${memoryContext}

Provide your HONEST assessment in the following format (be specific and in character):

{
  "opening": "Your opening statement as ${crew.name}",
  "currentState": "What you observe about the current state of the project",
  "concerns": "Any red flags, issues, or concerns from your perspective",
  "opportunities": "Potential improvements, optimizations, or opportunities you see",
  "recommendations": "Specific recommendations for what we should prioritize",
  "closing": "Your closing statement as ${crew.name}"
}

Be candid. This is an Observation Lounge meeting - we need your genuine assessment, not just positivity. Speak as ${crew.name} would - with your unique personality, expertise, and concerns.`;

  try {
    // Use Quark's cost optimization to select model
    const modelSelection = costOptimizer.selectOptimalModel(crew, memories, projectContext, topic);
    
    const response = await optimizer.optimizeAndCall(prompt, {
      crewMember: crew.id || crew.name.toLowerCase().replace(/\s+/g, '_'),
      complexity: crew.complexity,
      taskType: crew.taskType,
      estimatedTokens: modelSelection.estimatedTokens
    });
    
    const content = response.choices?.[0]?.message?.content || response.body || '{}';
    
    // Parse JSON from response
    let assessment;
    try {
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        assessment = JSON.parse(jsonMatch[0]);
      } else {
        assessment = {
          opening: content.split('Current State:')[0]?.trim() || `As ${crew.title}, I have reviewed our current state.`,
          currentState: extractSection(content, 'Current State:', 'Concerns:'),
          concerns: extractSection(content, 'Concerns:', 'Opportunities:'),
          opportunities: extractSection(content, 'Opportunities:', 'Recommendations:'),
          recommendations: extractSection(content, 'Recommendations:', 'Closing:'),
          closing: extractSection(content, 'Closing:', '') || 'I stand ready to contribute to our continued success.'
        };
      }
    } catch (e) {
      assessment = {
        opening: `As ${crew.title}, I have reviewed our current state.`,
        currentState: 'Reviewing project status and recent developments.',
        concerns: 'Monitoring for potential issues in my area of expertise.',
        opportunities: 'Identifying potential improvements and optimizations.',
        recommendations: 'Providing guidance based on my specialized knowledge.',
        closing: 'I stand ready to contribute to our continued success.'
      };
    }
    
    // Track cost (Quark's optimization)
    const cost = response.cost || modelSelection.estimatedCost || 0;
    const model = response.modelSelection?.model?.name || modelSelection.modelName || 'Unknown';
    costOptimizer.trackCost(crew.name, cost, model);
    
    return { assessment, costInfo: { cost, model } };
  } catch (error) {
    console.warn(`⚠️  Could not generate assessment for ${crew.name}: ${error.message}`);
    return {
      assessment: {
        opening: `As ${crew.title}, I have reviewed our current state.`,
        currentState: 'Reviewing project status and recent developments.',
        concerns: 'Monitoring for potential issues in my area of expertise.',
        opportunities: 'Identifying potential improvements and optimizations.',
        recommendations: 'Providing guidance based on my specialized knowledge.',
        closing: 'I stand ready to contribute to our continued success.'
      },
      costInfo: { cost: 0, model: 'Error' }
    };
  }
}

function extractSection(text, startMarker, endMarker) {
  const startIdx = text.indexOf(startMarker);
  if (startIdx === -1) return '';
  const start = startIdx + startMarker.length;
  const end = endMarker ? text.indexOf(endMarker, start) : text.length;
  return text.substring(start, end).trim();
}

/**
 * Store observation to dashboard API for status report display
 */
async function storeObservationToDashboard(topic, screenplay, costReport, crewCount, memoryCount) {
  return new Promise((resolve, reject) => {
    const dashboardUrl = process.env.DASHBOARD_URL || 'http://localhost:3000';
    const apiUrl = `${dashboardUrl}/api/crew/observations`;
    const crewKey = process.env.CREW_OBS_KEY || process.env.CREW_KEY || '';
    
    // Extract summary from screenplay (first 500 chars)
    const summary = `Observation Lounge: ${topic}\n\nCrew Members: ${crewCount}\nMemories Reviewed: ${memoryCount}\nTotal Cost: $${costReport.totalCost.toFixed(4)}\nCost Savings: $${costReport.savings.toFixed(4)}`;
    
    const payload = {
      crew: 'All Crew',
      role: 'Observation Lounge Session',
      summary: `Observation Lounge: ${topic}`,
      problems: [],
      suggestions: [],
      tags: ['observation-lounge', 'crew-coordination', 'status-report', 'rag-memories']
    };
    
    // Handle both http and https
    const urlObj = new URL(apiUrl);
    const isHttps = urlObj.protocol === 'https:';
    const httpModule = isHttps ? require('https') : require('http');
    
    const postData = JSON.stringify(payload);
    
    const options = {
      hostname: urlObj.hostname,
      port: urlObj.port || (isHttps ? 443 : 80),
      path: urlObj.pathname,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData),
        'x-crew-key': crewKey
      }
    };
    
    const req = httpModule.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          resolve(JSON.parse(data));
        } else {
          reject(new Error(`Dashboard API error: ${res.statusCode} - ${data}`));
        }
      });
    });
    
    req.on('error', reject);
    req.write(postData);
    req.end();
  });
}

// ============================================================================
// MAIN FUNCTION
// ============================================================================

async function main() {
  const args = process.argv.slice(2);
  const topic = args.filter(a => !a.startsWith('--')).join(' ') || 'Project Status Review and Progress Assessment';
  
  // Parse options
  const options = {
    format: args.includes('--standard') ? 'standard' : 'cinematic',
    saveToFile: !args.includes('--no-save')
  };
  
  console.log('\n');
  console.log('╔═══════════════════════════════════════════════════════════════════════════════╗');
  console.log('║                                                                               ║');
  console.log('║         🖖 OPTIMIZED OBSERVATION LOUNGE - RIKER & QUARK COORDINATION 🖖        ║');
  console.log('║                                                                               ║');
  console.log('╚═══════════════════════════════════════════════════════════════════════════════╝');
  console.log('\n');
  console.log(`📋 Topic: ${topic}`);
  console.log(`🎬 Format: ${options.format} (default: cinematic)`);
  console.log(`💾 Save to file: ${options.saveToFile ? 'Yes' : 'No'}`);
  console.log(`⚡ Coordination: Riker's Tactical Organization`);
  console.log(`💰 Optimization: Quark's Cost-Aware Model Selection\n`);
  
  // Step 1: Retrieve crew memories (Data's optimization)
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('📡 STEP 1: Retrieving Crew Memories (Data\'s Parallel Optimization)');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
  
  const crewMemories = await retrieveCrewMemories();
  const totalMemories = Object.values(crewMemories).reduce((sum, mems) => sum + mems.length, 0);
  console.log(`✅ Retrieved ${totalMemories} total memories across all crew members\n`);
  
  // Step 2: Riker's Coordination
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('⚡ STEP 2: Riker\'s Tactical Crew Organization');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
  
  const riker = new RikerCoordinationSystem();
  const crewOrder = riker.organizeCrewExecution(CREW_MEMBERS, topic);
  const estimatedTime = riker.estimateExecutionTime(crewOrder);
  
  console.log(`✅ Crew organized for optimal execution`);
  console.log(`   Execution order: ${crewOrder.map(c => c.emoji).join(' → ')}`);
  console.log(`   Estimated time: ${(estimatedTime / 1000).toFixed(1)}s\n`);
  
  // Step 3: Initialize systems
  const optimizer = getMCPOpenRouterOptimizer();
  optimizer.initialize();
  const costOptimizer = new QuarkCostOptimizer(optimizer);
  
  // Step 4: Get project context
  const projectContext = {
    recentWork: [
      'MCP timeout optimization and retry logic implementation',
      'Universal progress system with terminal-style animated bars',
      'E2E testing framework for MCP integration',
      'Crew LLM model assignments optimized by Quark & Riker',
      'DDD architecture refactoring complete',
      'Dashboard components refactored to use UnifiedDataService'
    ],
    currentStatus: 'Fully operational with MCP as primary controller, n8n as fallback',
    keyAchievements: [
      'MCP integration complete and tested',
      'Universal progress system operational',
      'E2E testing framework integrated',
      'Crew recommendations stored to RAG',
      'Zero-artifact guarantee maintained'
    ]
  };
  
  // Step 5: Generate cinematic screenplay
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('🎬 STEP 3: Generating Cinematic Screenplay (Cost-Optimized)');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
  
  let screenplay = generateCinematicOpening(topic);
  
  // Generate assessments in Riker's tactical order
  for (let i = 0; i < crewOrder.length; i++) {
    const crew = { ...crewOrder[i], id: Object.keys(CREW_MEMBERS).find(k => CREW_MEMBERS[k].name === crewOrder[i].name) };
    const memories = crewMemories[crew.id] || [];
    
    console.log(`   ${crew.emoji} Generating assessment for ${crew.name}... (${i + 1}/${crewOrder.length})`);
    
    const { assessment, costInfo } = await generateCrewAssessment(
      crew,
      memories,
      projectContext,
      topic,
      optimizer,
      costOptimizer
    );
    
    screenplay += generateCharacterSegment(crew, memories, assessment, costInfo);
    
    // Small delay for pacing
    await new Promise(resolve => setTimeout(resolve, 500));
  }
  
  // Add cost report (Quark's specialty)
  const costReport = costOptimizer.generateCostReport();
  screenplay += generateCinematicClosing(costReport);
  
  console.log('\n✅ Cinematic screenplay generated');
  console.log(`💰 Total cost: $${costReport.totalCost.toFixed(4)} (Savings: $${costReport.savings.toFixed(4)})\n`);
  
  // Step 6: Save to file and dashboard
  if (options.saveToFile) {
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('💾 STEP 4: Saving to File & Dashboard (Optimized Structure)');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').split('T')[0];
    const filename = `OBSERVATION_LOUNGE_${timestamp}.md`;
    const filepath = path.join(__dirname, '..', 'docs', 'crew', filename);
    
    // Ensure directory exists (La Forge's infrastructure optimization)
    const dir = path.dirname(filepath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    
    fs.writeFileSync(filepath, screenplay, 'utf8');
    console.log(`✅ Saved to: ${filepath}`);
    
    // Store to dashboard API for status report display
    try {
      await storeObservationToDashboard(topic, screenplay, costReport, crewOrder.length, totalMemories);
      console.log(`✅ Stored to dashboard for status report display\n`);
    } catch (error) {
      console.warn(`⚠️  Could not store to dashboard: ${error.message}\n`);
    }
  }
  
  // Display summary
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('✅ OBSERVATION LOUNGE SESSION COMPLETE');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
  console.log(`   Topic: ${topic}`);
  console.log(`   Format: ${options.format}`);
  console.log(`   Crew Members: ${crewOrder.length}`);
  console.log(`   Total Memories: ${totalMemories}`);
  console.log(`   Total Cost: $${costReport.totalCost.toFixed(4)}`);
  console.log(`   Cost Savings: $${costReport.savings.toFixed(4)}`);
  console.log(`   Saved: ${options.saveToFile ? 'Yes' : 'No'}\n`);
  
  // Also output to console for immediate viewing
  if (!options.saveToFile || process.stdout.isTTY) {
    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📄 CINEMATIC SCREENPLAY OUTPUT');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    console.log(screenplay);
  }
}

main().catch((error) => {
  console.error('\n❌ Observation Lounge error:', error);
  console.error(error.stack);
  process.exit(1);
});

