#!/usr/bin/env node

/**
 * 🖖 Multimodal Crew Coordination System
 * 
 * Enables crew members to work in tandem:
 * - Query associated knowledge for each crew member
 * - Coordinate analysis across multiple crew members
 * - Optimize LLM selection per crew member specialty
 * - Aggregate insights from all relevant crew members
 */

const { getMCPMemoryStorage } = require('./utils/mcp-memory-storage');
const { getMCPOpenRouterOptimizer } = require('./utils/mcp-openrouter-optimizer');
const { getMCPCache } = require('./utils/mcp-context-cache');

console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('🖖 Multimodal Crew Coordination System');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

const memoryStorage = getMCPMemoryStorage();
const optimizer = getMCPOpenRouterOptimizer();
const mcpCache = getMCPCache();

memoryStorage.initialize();
optimizer.initialize();

// Get crew member context from RAG
async function getCrewMemberContext(crewMemberName, query = '') {
  try {
    // Query without text search first, then filter by category and crew member
    const result = await memoryStorage.queryMemories(
      '', // Empty query to get all, then filter
      {
        limit: 50, // Get more results to find crew member
        category: 'crew-member'
      }
    );
    
    if (result.success && result.results && result.results.length > 0) {
      // Find the crew member profile (check both exact match and partial match)
      const profile = result.results.find(r => {
        const storedName = r.metadata?.crewMember || r.title?.replace('Crew Member: ', '') || '';
        return (storedName === crewMemberName || 
                storedName.includes(crewMemberName) || 
                crewMemberName.includes(storedName)) &&
               (r.category === 'crew-member' || r.metadata?.category === 'crew-member');
      });
      
      // Get associated knowledge (query separately)
      const knowledgeResult = await memoryStorage.queryMemories('', {
        limit: 20,
        excludeCategory: 'crew-member'
      });
      
      const associatedKnowledge = (knowledgeResult.results || []).filter(r => 
        r.metadata?.associatedCrew?.includes(crewMemberName) ||
        r.metadata?.crewMember === crewMemberName ||
        (r.metadata?.associatedCrew && Array.isArray(r.metadata.associatedCrew) && 
         r.metadata.associatedCrew.some(c => c.includes(crewMemberName) || crewMemberName.includes(c)))
      );
      
      return {
        profile: profile,
        associatedKnowledge: associatedKnowledge,
        totalItems: associatedKnowledge.length
      };
    }
    
    return { profile: null, associatedKnowledge: [], totalItems: 0 };
  } catch (error) {
    console.error(`Error getting context for ${crewMemberName}:`, error.message);
    return { profile: null, associatedKnowledge: [], totalItems: 0 };
  }
}

// Coordinate multiple crew members for analysis
async function coordinateCrewAnalysis(query, relevantCrew = []) {
  console.log(`📋 Analysis Query: "${query}"\n`);
  
  if (relevantCrew.length === 0) {
    // Auto-detect relevant crew based on query
    console.log('🔍 Auto-detecting relevant crew members...\n');
    
    const queryLower = query.toLowerCase();
    const crewKeywords = {
      'Captain Jean-Luc Picard': ['strategic', 'leadership', 'decision', 'planning', 'architecture'],
      'Commander William Riker': ['tactical', 'execution', 'workflow', 'implementation'],
      'Commander Data': ['analytics', 'data', 'ai', 'ml', 'logic', 'analysis'],
      'Lieutenant Commander Geordi La Forge': ['infrastructure', 'system', 'integration', 'api'],
      'Chief Miles O\'Brien': ['practical', 'quick', 'fix', 'troubleshooting'],
      'Dr. Beverly Crusher': ['health', 'diagnostic', 'performance', 'monitoring'],
      'Counselor Deanna Troi': ['user experience', 'ux', 'empathy', 'user'],
      'Lieutenant Worf': ['security', 'compliance', 'threat', 'protection'],
      'Lieutenant Uhura': ['communication', 'network', 'api', 'integration'],
      'Quark': ['business', 'roi', 'cost', 'optimization', 'profit']
    };
    
    for (const [crewName, keywords] of Object.entries(crewKeywords)) {
      if (keywords.some(keyword => queryLower.includes(keyword))) {
        relevantCrew.push(crewName);
      }
    }
    
    if (relevantCrew.length === 0) {
      // Default to strategic crew for general queries
      relevantCrew = ['Captain Jean-Luc Picard', 'Commander Data'];
    }
  }
  
  console.log(`👥 Coordinating ${relevantCrew.length} crew members:\n`);
  relevantCrew.forEach((crew, index) => {
    console.log(`   ${index + 1}. ${crew}`);
  });
  console.log('');
  
  // Get context for each crew member
  const crewContexts = {};
  for (const crewMember of relevantCrew) {
    console.log(`📡 Gathering context for ${crewMember}...`);
    const context = await getCrewMemberContext(crewMember, query);
    crewContexts[crewMember] = context;
    
    if (context.profile) {
      console.log(`   ✅ Profile found`);
      console.log(`   📚 Associated knowledge: ${context.totalItems} items`);
    } else {
      console.log(`   ⚠️  Profile not found in RAG`);
    }
    console.log('');
  }
  
  // Optimize LLM selection per crew member
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('🤖 Step 2: Optimizing LLM Selection per Crew Member');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
  
  const crewAnalyses = {};
  
  for (const crewMember of relevantCrew) {
    const context = crewContexts[crewMember];
    const profile = context.profile;
    
    if (!profile) {
      console.log(`⚠️  Skipping ${crewMember} - profile not found\n`);
      continue;
    }
    
    const preferredModels = profile.metadata?.preferredModels || ['claude-3.7-sonnet'];
    const specialization = profile.metadata?.specialization || 'General';
    
    console.log(`🎯 ${crewMember}`);
    console.log(`   Specialization: ${specialization}`);
    console.log(`   Preferred Models: ${preferredModels.join(', ')}`);
    
    // Build analysis prompt with crew context
    const analysisPrompt = `
As ${crewMember}, analyze the following query using your specialization in ${specialization}.

Query: ${query}

Your associated knowledge:
${context.associatedKnowledge.slice(0, 3).map(k => `- ${k.title}: ${k.content.substring(0, 200)}...`).join('\n')}

Provide analysis from your perspective, focusing on ${specialization}.
`;
    
    try {
      // Optimize and call LLM with crew-specific optimization
      const analysis = await optimizer.optimizeAndCall(analysisPrompt, {
        crewMember: crewMember,
        specialization: specialization,
        preferredModels: preferredModels,
        context: {
          associatedKnowledge: context.associatedKnowledge.length,
          profile: profile.metadata
        },
        budget: 'balanced', // Balance cost and performance
        complexity: 'medium'
      });
      
      crewAnalyses[crewMember] = {
        analysis: analysis,
        model: analysis.model || preferredModels[0],
        cost: analysis.cost || 'unknown',
        specialization: specialization
      };
      
      console.log(`   ✅ Analysis complete (Model: ${crewAnalyses[crewMember].model})`);
      console.log(`   💰 Estimated cost: ${crewAnalyses[crewMember].cost}\n`);
    } catch (error) {
      console.log(`   ❌ Analysis failed: ${error.message}\n`);
    }
  }
  
  // Aggregate insights
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('📊 Step 3: Aggregating Crew Insights');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
  
  const aggregatedInsights = {
    query: query,
    crewMembers: Object.keys(crewAnalyses),
    analyses: crewAnalyses,
    totalCost: Object.values(crewAnalyses).reduce((sum, a) => sum + (parseFloat(a.cost) || 0), 0),
    modelsUsed: [...new Set(Object.values(crewAnalyses).map(a => a.model))]
  };
  
  console.log('✅ Multimodal Crew Coordination Complete!\n');
  console.log('📊 Summary:');
  console.log(`   Crew Members: ${aggregatedInsights.crewMembers.length}`);
  console.log(`   Models Used: ${aggregatedInsights.modelsUsed.join(', ')}`);
  console.log(`   Total Cost: $${aggregatedInsights.totalCost.toFixed(4)}\n`);
  
  return aggregatedInsights;
}

// Main execution
async function main() {
  const query = process.argv[2] || 'How can we optimize our MCP system for cost and performance?';
  const crewMembers = process.argv.slice(3);
  
  const result = await coordinateCrewAnalysis(query, crewMembers);
  
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('🎯 Crew Analyses');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
  
  for (const [crewMember, analysis] of Object.entries(result.analyses)) {
    console.log(`${crewMember} (${analysis.specialization}):`);
    console.log(`   Model: ${analysis.model}`);
    console.log(`   Cost: $${analysis.cost}`);
    if (analysis.analysis && analysis.analysis.content) {
      const preview = analysis.analysis.content.substring(0, 200);
      console.log(`   Analysis: ${preview}...\n`);
    }
  }
  
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
}

// Export for use in other scripts
if (require.main === module) {
  main().catch(error => {
    console.error('❌ Error:', error);
    process.exit(1);
  });
}

module.exports = { coordinateCrewAnalysis, getCrewMemberContext };

