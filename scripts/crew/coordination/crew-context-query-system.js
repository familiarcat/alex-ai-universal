#!/usr/bin/env node

/**
 * 🖖 Crew Context Query System
 * 
 * Queries associated knowledge for each crew member from RAG
 * Enables crew members to access their specialized knowledge
 */

const { getMCPMemoryStorage } = require('./utils/mcp-memory-storage');
const { getMCPOpenRouterOptimizer } = require('./utils/mcp-openrouter-optimizer');

console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('🖖 Crew Context Query System');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

const memoryStorage = getMCPMemoryStorage();
const optimizer = getMCPOpenRouterOptimizer();

memoryStorage.initialize();
optimizer.initialize();

// Query crew member's associated knowledge
async function queryCrewContext(crewMemberName, query = '') {
  try {
    // First, get crew member profile
    const profileResult = await memoryStorage.queryMemories(crewMemberName, {
      limit: 1,
      category: 'crew-member',
      crewMember: crewMemberName
    });
    
    if (!profileResult.success || !profileResult.results || profileResult.results.length === 0) {
      return {
        success: false,
        error: `Crew member ${crewMemberName} not found in RAG`
      };
    }
    
    const profile = profileResult.results[0];
    const specialization = profile.metadata?.specialization || 'General';
    const preferredModels = profile.metadata?.preferredModels || [];
    
    // Query associated knowledge
    const knowledgeQuery = query || specialization;
    const knowledgeResult = await memoryStorage.queryMemories(knowledgeQuery, {
      limit: 10,
      crewMember: crewMemberName,
      excludeCategory: 'crew-member'
    });
    
    return {
      success: true,
      crewMember: crewMemberName,
      profile: profile,
      specialization: specialization,
      preferredModels: preferredModels,
      associatedKnowledge: knowledgeResult.results || [],
      totalItems: knowledgeResult.results?.length || 0
    };
  } catch (error) {
    return {
      success: false,
      error: error.message
    };
  }
}

// Optimize LLM call for crew member
async function optimizeForCrewMember(crewMemberName, prompt, query = '') {
  const context = await queryCrewContext(crewMemberName, query);
  
  if (!context.success) {
    throw new Error(context.error);
  }
  
  // Build enhanced prompt with crew context
  const enhancedPrompt = `
As ${crewMemberName}, you specialize in ${context.specialization}.

Your associated knowledge:
${context.associatedKnowledge.slice(0, 5).map(k => `- ${k.title}: ${k.content.substring(0, 150)}...`).join('\n')}

${prompt}
`;
  
  // Optimize model selection for this crew member
  const analysis = await optimizer.optimizeAndCall(enhancedPrompt, {
    crewMember: crewMemberName.toLowerCase().replace(/\s+/g, '-').split('-')[crewMemberName.split(' ').length - 1],
    specialization: context.specialization,
    preferredModels: context.preferredModels,
    context: {
      associatedKnowledge: context.totalItems,
      specialization: context.specialization
    },
    budget: 'balanced',
    complexity: 'medium'
  });
  
  return {
    crewMember: crewMemberName,
    analysis: analysis,
    context: context,
    model: analysis.modelSelection?.model?.name || context.preferredModels[0],
    cost: analysis.cost || analysis.modelSelection?.estimatedCost || 'unknown'
  };
}

// Main execution
async function main() {
  const crewMember = process.argv[2] || 'Commander Data';
  const query = process.argv[3] || 'How can we optimize our system?';
  
  console.log(`👤 Crew Member: ${crewMember}`);
  console.log(`📋 Query: ${query}\n`);
  
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('Step 1: Querying Crew Context');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
  
  const context = await queryCrewContext(crewMember, query);
  
  if (!context.success) {
    console.error(`❌ ${context.error}\n`);
    process.exit(1);
  }
  
  console.log(`✅ Crew Member Profile Found`);
  console.log(`   Specialization: ${context.specialization}`);
  console.log(`   Preferred Models: ${context.preferredModels.join(', ')}`);
  console.log(`   Associated Knowledge: ${context.totalItems} items\n`);
  
  if (context.associatedKnowledge.length > 0) {
    console.log('📚 Associated Knowledge:');
    context.associatedKnowledge.slice(0, 5).forEach((item, index) => {
      console.log(`   ${index + 1}. ${item.title}`);
    });
    console.log('');
  }
  
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('Step 2: Optimizing LLM Selection');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
  
  try {
    const result = await optimizeForCrewMember(crewMember, query, query);
    
    console.log(`✅ Analysis Complete`);
    console.log(`   Model: ${result.model}`);
    console.log(`   Cost: $${result.cost}`);
    console.log(`   Context Items Used: ${result.context.totalItems}\n`);
    
    if (result.analysis && result.analysis.choices && result.analysis.choices[0]) {
      const content = result.analysis.choices[0].message?.content || '';
      console.log('📊 Analysis:');
      console.log(content.substring(0, 500) + '...\n');
    }
  } catch (error) {
    console.error(`❌ Optimization failed: ${error.message}\n`);
  }
  
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
}

if (require.main === module) {
  main().catch(error => {
    console.error('❌ Error:', error);
    process.exit(1);
  });
}

module.exports = { queryCrewContext, optimizeForCrewMember };

