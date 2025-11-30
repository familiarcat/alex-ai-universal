#!/usr/bin/env node
/**
 * 🖖 Quark + Riker Task Optimization System
 * 
 * When Quark and Riker collaborate, they create the most efficient
 * task assignments for the crew, optimizing both cost and LLM efficiency.
 * 
 * Quark: Business optimization, cost analysis, resource efficiency
 * Riker: Tactical operations, workflow management, crew coordination
 * 
 * Together: Optimal task routing with cost/performance balance
 * 
 * Usage:
 *   node scripts/crew/quark-riker-task-optimizer.js [task-description]
 */

const { getMCPOpenRouterOptimizer } = require('../utils/mcp-openrouter-optimizer');

class QuarkRikerTaskOptimizer {
  constructor() {
    this.optimizer = getMCPOpenRouterOptimizer();
    this.optimizer.initialize();
  }

  /**
   * Optimize task assignment using Quark + Riker collaboration
   */
  async optimizeTaskAssignment(tasks, context = {}) {
    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('💰⚡ QUARK + RIKER TASK OPTIMIZATION COLLABORATION');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    
    console.log('💰 Quark: "Let me analyze the cost efficiency of these tasks..."');
    console.log('⚡ Riker: "I\'ll coordinate the tactical workflow distribution..."\n');
    
    // Quark's cost optimization analysis
    const quarkPrompt = `You are Quark, the Ferengi business operations specialist. Analyze these tasks for optimal cost efficiency and resource allocation:

Tasks:
${tasks.map((t, i) => `${i + 1}. ${typeof t === 'string' ? t : t.description || t.task || JSON.stringify(t)}`).join('\n')}

Context: ${JSON.stringify(context, null, 2)}

Provide:
1. Cost analysis for each task (estimate LLM costs)
2. Resource efficiency recommendations
3. Priority ranking based on ROI
4. Recommended crew assignments for cost optimization

Be specific, practical, and profit-focused.`;

    // Riker's tactical workflow coordination
    const rikerPrompt = `You are Commander William Riker, Executive Officer. Coordinate these tasks for optimal tactical workflow:

Tasks:
${tasks.map((t, i) => `${i + 1}. ${typeof t === 'string' ? t : t.description || t.task || JSON.stringify(t)}`).join('\n')}

Context: ${JSON.stringify(context, null, 2)}

Provide:
1. Optimal crew member assignments based on specialization
2. Workflow sequencing for maximum efficiency
3. Parallel vs sequential execution recommendations
4. Risk assessment and mitigation strategies

Be tactical, organized, and operationally focused.`;

    console.log('🤖 Quark analyzing cost efficiency...\n');
    
    // Get Quark's analysis (using Gemini Pro for business optimization)
    const quarkAnalysis = await this.optimizer.optimizeAndCall(quarkPrompt, {
      crewMember: 'quark',
      complexity: 'medium',
      taskType: 'business_analysis',
      temperature: 0.7
    });

    console.log('💰 QUARK\'S COST ANALYSIS:');
    console.log('─'.repeat(70));
    const quarkResponse = quarkAnalysis.choices?.[0]?.message?.content || quarkAnalysis.body || 'No response';
    console.log(quarkResponse);
    console.log('─'.repeat(70));
    console.log(`   Model: ${quarkAnalysis.modelSelection?.model?.name || 'Unknown'}`);
    console.log(`   Cost: $${(quarkAnalysis.cost || quarkAnalysis.modelSelection?.estimatedCost || 0).toFixed(4)}\n`);

    console.log('🤖 Riker coordinating tactical workflow...\n');
    
    // Get Riker's coordination (using Llama 3 for cost-effective operations)
    const rikerCoordination = await this.optimizer.optimizeAndCall(rikerPrompt, {
      crewMember: 'riker',
      complexity: 'medium',
      taskType: 'operations',
      temperature: 0.7
    });

    console.log('⚡ RIKER\'S TACTICAL COORDINATION:');
    console.log('─'.repeat(70));
    const rikerResponse = rikerCoordination.choices?.[0]?.message?.content || rikerCoordination.body || 'No response';
    console.log(rikerResponse);
    console.log('─'.repeat(70));
    console.log(`   Model: ${rikerCoordination.modelSelection?.model?.name || 'Unknown'}`);
    console.log(`   Cost: $${(rikerCoordination.cost || rikerCoordination.modelSelection?.estimatedCost || 0).toFixed(4)}\n`);

    // Synthesize their collaboration
    console.log('🤖 Synthesizing Quark + Riker recommendations...\n');
    
    const synthesisPrompt = `Synthesize these two expert analyses into optimal task assignments:

QUARK'S COST ANALYSIS:
${quarkResponse}

RIKER'S TACTICAL COORDINATION:
${rikerResponse}

Create a final optimized task assignment plan that:
1. Balances cost efficiency (Quark's expertise) with operational effectiveness (Riker's expertise)
2. Assigns each task to the optimal crew member
3. Sequences tasks for maximum efficiency
4. Provides cost estimates for the entire workflow
5. Identifies any risks or optimization opportunities

Format as a clear, actionable plan.`;

    const synthesis = await this.optimizer.optimizeAndCall(synthesisPrompt, {
      crewMember: 'quark_riker_collaboration',
      complexity: 'high',
      taskType: 'task_optimization',
      temperature: 0.7
    });

    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('✅ OPTIMIZED TASK ASSIGNMENT PLAN');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    
    const synthesisResponse = synthesis.choices?.[0]?.message?.content || synthesis.body || 'No response';
    console.log(synthesisResponse);
    console.log('\n');
    console.log('📊 Optimization Summary:');
    console.log(`   Quark Analysis Cost: $${(quarkAnalysis.cost || quarkAnalysis.modelSelection?.estimatedCost || 0).toFixed(4)}`);
    console.log(`   Riker Coordination Cost: $${(rikerCoordination.cost || rikerCoordination.modelSelection?.estimatedCost || 0).toFixed(4)}`);
    console.log(`   Synthesis Cost: $${(synthesis.cost || synthesis.modelSelection?.estimatedCost || 0).toFixed(4)}`);
    const totalCost = (quarkAnalysis.cost || 0) + (rikerCoordination.cost || 0) + (synthesis.cost || 0);
    console.log(`   Total Optimization Cost: $${totalCost.toFixed(4)}\n`);
    
    console.log('💰 Quark: "Profit maximized, resources optimized!"');
    console.log('⚡ Riker: "Tactical coordination complete. Crew ready for deployment."\n');
    
    return {
      quarkAnalysis: quarkResponse,
      rikerCoordination: rikerResponse,
      optimizedPlan: synthesisResponse,
      costs: {
        quark: quarkAnalysis.cost || quarkAnalysis.modelSelection?.estimatedCost || 0,
        riker: rikerCoordination.cost || rikerCoordination.modelSelection?.estimatedCost || 0,
        synthesis: synthesis.cost || synthesis.modelSelection?.estimatedCost || 0,
        total: totalCost
      }
    };
  }
}

async function main() {
  const args = process.argv.slice(2);
  
  if (args.length === 0) {
    console.log('Usage: node scripts/crew/quark-riker-task-optimizer.js [task1] [task2] ...');
    console.log('\nExample:');
    console.log('  node scripts/crew/quark-riker-task-optimizer.js "Optimize database queries" "Implement caching layer" "Add monitoring"');
    process.exit(1);
  }
  
  const tasks = args;
  const optimizer = new QuarkRikerTaskOptimizer();
  
  await optimizer.optimizeTaskAssignment(tasks, {
    project: 'Alex AI Universal',
    priority: 'medium',
    deadline: 'flexible'
  });
}

if (require.main === module) {
  main().catch(err => {
    console.error('\n❌ Error:', err.message);
    process.exit(1);
  });
}

module.exports = { QuarkRikerTaskOptimizer };

