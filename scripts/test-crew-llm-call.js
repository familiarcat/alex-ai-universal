#!/usr/bin/env node
/**
 * 🖖 Test Crew LLM Call via MCP
 * 
 * Tests the full crew LLM call system with optimized model selection.
 * 
 * Usage:
 *   node scripts/test-crew-llm-call.js [crew-member] [prompt]
 */

const { getMCPOpenRouterOptimizer } = require('./utils/mcp-openrouter-optimizer');

const CREW_MEMBERS = {
  picard: 'Captain Jean-Luc Picard',
  data: 'Commander Data',
  riker: 'Commander William Riker',
  la_forge: 'Lieutenant Commander Geordi La Forge',
  worf: 'Lieutenant Worf',
  troi: 'Counselor Deanna Troi',
  crusher: 'Dr. Beverly Crusher',
  uhura: 'Lieutenant Uhura',
  quark: 'Quark',
  chief_obrien: "Chief Miles O'Brien"
};

async function testCrewLLMCall(crewMember, prompt) {
  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('🖖 TESTING CREW LLM CALL VIA MCP');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
  
  if (!crewMember || !CREW_MEMBERS[crewMember]) {
    console.log('❌ Invalid crew member');
    console.log('\nAvailable crew members:');
    Object.entries(CREW_MEMBERS).forEach(([id, name]) => {
      console.log(`   ${id.padEnd(15)} - ${name}`);
    });
    console.log('\nUsage: node scripts/test-crew-llm-call.js [crew-member] [prompt]');
    process.exit(1);
  }
  
  if (!prompt) {
    console.log('❌ Prompt is required');
    console.log('\nUsage: node scripts/test-crew-llm-call.js [crew-member] [prompt]');
    process.exit(1);
  }
  
  console.log(`👤 Crew Member: ${CREW_MEMBERS[crewMember]} (${crewMember})`);
  console.log(`💬 Prompt: ${prompt}`);
  console.log('');
  
  try {
    // Initialize optimizer
    const optimizer = getMCPOpenRouterOptimizer();
    optimizer.initialize();
    
    console.log('🤖 Selecting optimal model...');
    
    // First, select optimal model
    const modelSelection = optimizer.selectOptimalModel({
      crewMember,
      complexity: 'medium',
      estimatedTokens: 1500
    });
    
    console.log(`   ✅ Selected: ${modelSelection.model.name}`);
    console.log(`   📊 Model ID: ${modelSelection.modelId}`);
    console.log(`   💰 Estimated Cost: $${modelSelection.estimatedCost.toFixed(4)}`);
    console.log(`   🎯 Confidence: ${(modelSelection.confidence * 100).toFixed(1)}%`);
    console.log(`   📈 Cost Efficiency: ${modelSelection.model.costPer1M < 2.0 ? 'High' : modelSelection.model.costPer1M < 4.0 ? 'Medium' : 'Low'}`);
    console.log('');
    
    console.log('🚀 Making optimized LLM call...');
    console.log('');
    
    // Make the actual LLM call
    const result = await optimizer.optimizeAndCall(prompt, {
      crewMember,
      complexity: 'medium',
      temperature: 0.7
    });
    
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('✅ LLM CALL SUCCESSFUL');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    
    console.log('📝 Response:');
    console.log('─'.repeat(70));
    const response = result.choices?.[0]?.message?.content || result.body || 'No response';
    console.log(response);
    console.log('─'.repeat(70));
    console.log('');
    
    console.log('📊 Call Details:');
    console.log(`   Model Used: ${result.modelSelection?.model?.name || 'Unknown'}`);
    console.log(`   Model ID: ${result.modelSelection?.modelId || 'Unknown'}`);
    console.log(`   Actual Cost: $${(result.cost || result.modelSelection?.estimatedCost || 0).toFixed(4)}`);
    console.log(`   Tokens Used: ${result.usage?.total_tokens || 'N/A'}`);
    console.log(`   Input Tokens: ${result.usage?.prompt_tokens || 'N/A'}`);
    console.log(`   Output Tokens: ${result.usage?.completion_tokens || 'N/A'}`);
    console.log('');
    
    console.log('🎯 Optimization Stats:');
    console.log(`   Confidence: ${((result.modelSelection?.confidence || 0) * 100).toFixed(1)}%`);
    console.log(`   Task Type: ${result.modelSelection?.reasoning?.taskType || 'auto-detected'}`);
    console.log(`   Complexity: ${result.modelSelection?.reasoning?.complexity || 'medium'}`);
    console.log('');
    
    console.log('✅ Test complete! Crew LLM system is working perfectly.\n');
    
  } catch (error) {
    console.error('\n❌ Error:', error.message);
    if (error.message.includes('OPENROUTER_API_KEY')) {
      console.log('\n💡 Make sure OPENROUTER_API_KEY is set in ~/.zshrc');
      console.log('   Run: npm run openrouter:verify');
    }
    process.exit(1);
  }
}

// Get arguments
const crewMember = process.argv[2];
const prompt = process.argv.slice(3).join(' ') || 'Analyze this code for performance issues and suggest optimizations.';

if (require.main === module) {
  testCrewLLMCall(crewMember, prompt).catch(err => {
    console.error('Fatal error:', err);
    process.exit(1);
  });
}

module.exports = { testCrewLLMCall };

