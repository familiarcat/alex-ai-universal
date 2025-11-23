#!/usr/bin/env node
/**
 * 🖖 Observation Lounge - Cinematic Crew Gathering
 * 
 * Gathers all crew members in the Observation Lounge for a cinematic
 * briefing where each member shares their perspective on the project.
 * 
 * Uses optimized OpenRouter LLM calls for each crew member's response.
 * 
 * Usage:
 *   node scripts/observation-lounge-cinematic.js
 */

const { getMCPOpenRouterOptimizer } = require('./utils/mcp-openrouter-optimizer');
const { loadCrewMemories } = require('./crew/coordination/load-crew-memories');

const CREW_MEMBERS = {
  picard: {
    name: 'Captain Jean-Luc Picard',
    title: 'Commanding Officer',
    emoji: '🎖️',
    specialization: 'Strategic leadership and mission continuity'
  },
  riker: {
    name: 'Commander William Riker',
    title: 'Executive Officer',
    emoji: '⚡',
    specialization: 'Tactical operations and workflow management'
  },
  data: {
    name: 'Commander Data',
    title: 'Operations Officer',
    emoji: '🤖',
    specialization: 'Technical analysis and system optimization'
  },
  la_forge: {
    name: 'Lieutenant Commander Geordi La Forge',
    title: 'Chief Engineer',
    emoji: '🔧',
    specialization: 'Infrastructure health and engineering'
  },
  worf: {
    name: 'Lieutenant Worf',
    title: 'Security Chief',
    emoji: '⚔️',
    specialization: 'Security analysis and threat assessment'
  },
  troi: {
    name: 'Counselor Deanna Troi',
    title: 'Ship\'s Counselor',
    emoji: '💭',
    specialization: 'User experience and psychological assessment'
  },
  crusher: {
    name: 'Dr. Beverly Crusher',
    title: 'Chief Medical Officer',
    emoji: '💊',
    specialization: 'System health and medical diagnosis'
  },
  uhura: {
    name: 'Lieutenant Uhura',
    title: 'Communications Officer',
    emoji: '📻',
    specialization: 'Communication systems and network optimization'
  },
  quark: {
    name: 'Quark',
    title: 'Business Operations',
    emoji: '💰',
    specialization: 'Business optimization and cost analysis'
  },
  chief_obrien: {
    name: 'Chief Miles O\'Brien',
    title: 'Chief of Operations',
    emoji: '🛠️',
    specialization: 'Pragmatic solutions and troubleshooting'
  }
};

async function gatherCrewInObservationLounge() {
  console.log('\n\n');
  console.log('╔═══════════════════════════════════════════════════════════════════════════════╗');
  console.log('║                                                                               ║');
  console.log('║                    🖖 OBSERVATION LOUNGE - CREW ASSEMBLY 🖖                   ║');
  console.log('║                                                                               ║');
  console.log('╚═══════════════════════════════════════════════════════════════════════════════╝');
  console.log('\n');
  
  // Cinematic opening
  console.log('The soft ambient lighting of the Observation Lounge casts a warm glow across');
  console.log('the room. Stars streak past the massive viewport as the ship travels through');
  console.log('the digital cosmos. One by one, the senior staff arrives, taking their');
  console.log('accustomed positions around the central table.\n');
  
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
  
  // Load crew memories for context
  console.log('📡 Loading crew memories and project context...\n');
  let crewMemories = {};
  try {
    crewMemories = await loadCrewMemories();
    console.log('✅ Crew memories loaded\n');
  } catch (error) {
    console.log('⚠️  Could not load crew memories, proceeding with general context\n');
  }
  
  // Initialize OpenRouter optimizer
  const optimizer = getMCPOpenRouterOptimizer();
  optimizer.initialize();
  
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
  
  // Get project context
  const projectContext = {
    recentWork: [
      'Complete MCP migration from n8n to MCP as DDD controller layer',
      'Automated OpenRouter API key management system',
      'Crew-optimized LLM calls with cost optimization',
      'MCP integration for all crew members',
      'Secure credential loading system',
      'RAG system self-documentation',
      'Semantic search foundation'
    ],
    currentStatus: 'Fully operational with automated OpenRouter integration',
    keyAchievements: [
      'Zero-artifact guarantee maintained',
      'All crew members have optimized LLM access',
      'Automated key management enabled',
      'Cost-optimized model selection active'
    ]
  };
  
  // Gather each crew member's perspective
  const crewOrder = ['picard', 'riker', 'data', 'la_forge', 'worf', 'troi', 'crusher', 'uhura', 'quark', 'chief_obrien'];
  
  for (const crewId of crewOrder) {
    const crew = CREW_MEMBERS[crewId];
    const memories = crewMemories[crewId] || [];
    
    // Build context for this crew member
    const contextPrompt = `You are ${crew.name}, ${crew.title} of the Alex AI project. 

Your specialization: ${crew.specialization}

Recent project work:
${projectContext.recentWork.map(w => `- ${w}`).join('\n')}

Current status: ${projectContext.currentStatus}

Key achievements:
${projectContext.keyAchievements.map(a => `- ${a}`).join('\n')}

${memories.length > 0 ? `\nYour recent memories/experiences:\n${memories.slice(0, 3).map(m => `- ${m.title || m.summary || 'Memory'}`).join('\n')}` : ''}

Provide your perspective on the current state of the Alex AI project. Speak as ${crew.name} would - with your unique personality, expertise, and concerns. Be specific about what you see working well, what concerns you, and what you recommend for the future. Keep it to 3-4 sentences, in character.`;

    console.log(`${crew.emoji} ${crew.name.toUpperCase()} (${crew.title})`);
    console.log('─'.repeat(70));
    console.log('');
    
    try {
      // Get optimized LLM response for this crew member
      const response = await optimizer.optimizeAndCall(contextPrompt, {
        crewMember: crewId,
        complexity: 'medium',
        temperature: 0.8, // More creative for character responses
      });
      
      const perspective = response.choices?.[0]?.message?.content || response.body || 'No response';
      
      // Format in character
      console.log(perspective.trim());
      console.log('');
      console.log(`   💰 Cost: $${(response.cost || response.modelSelection?.estimatedCost || 0).toFixed(4)}`);
      console.log(`   🤖 Model: ${response.modelSelection?.model?.name || 'Unknown'}`);
      console.log('');
      
    } catch (error) {
      console.log(`   "I apologize, but I am experiencing a momentary communication difficulty."`);
      console.log(`   Error: ${error.message}`);
      console.log('');
    }
    
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    
    // Small delay for cinematic pacing
    await new Promise(resolve => setTimeout(resolve, 500));
  }
  
  // Cinematic closing
  console.log('Captain Picard stands, his hands clasped behind his back as he gazes out');
  console.log('at the stars. "Thank you all for your insights. The work we\'ve accomplished');
  console.log('today represents a significant step forward in our mission. The integration');
  console.log('of automated systems, optimized resource allocation, and crew coordination');
  console.log('positions us well for the challenges ahead."\n');
  
  console.log('He turns to face the assembled crew. "Make it so."\n');
  
  console.log('╔═══════════════════════════════════════════════════════════════════════════════╗');
  console.log('║                    🖖 END OF BRIEFING - CREW DISMISSED 🖖                     ║');
  console.log('╚═══════════════════════════════════════════════════════════════════════════════╝\n\n');
  
  // Summary stats
  const stats = optimizer.getStats();
  console.log('📊 Session Statistics:');
  console.log(`   Models available: ${stats.models}`);
  console.log(`   Task types optimized: ${stats.taskTypes}`);
  console.log(`   Cache efficiency: ${stats.cache?.hitRate || 'N/A'}`);
  console.log('');
}

if (require.main === module) {
  gatherCrewInObservationLounge().catch(err => {
    console.error('\n❌ Error in Observation Lounge:', err.message);
    process.exit(1);
  });
}

module.exports = { gatherCrewInObservationLounge };

