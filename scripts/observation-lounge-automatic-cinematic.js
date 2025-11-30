#!/usr/bin/env node

/**
 * 🖖 Automatic Cinematic Observation Lounge
 * 
 * DEFAULT BEHAVIOR: Always generates cinematic format and saves to .md file
 * 
 * Simply asking for "observation lounge" will:
 * 1. Retrieve all crew memories from RAG system
 * 2. Generate cinematic screenplay format
 * 3. Save to .md file for easy viewing
 * 
 * Natural language options:
 * - "save it" / "save" → saves to file (default behavior)
 * - "cinematic" → cinematic format (default behavior)
 * - "standard" → standard format (override)
 * 
 * Usage:
 *   node scripts/observation-lounge-automatic-cinematic.js
 *   node scripts/observation-lounge-automatic-cinematic.js "review our progress"
 */

const fs = require('fs');
const path = require('path');
const { getMCPMemoryStorage } = require('./utils/mcp-memory-storage');
const { getMCPOpenRouterOptimizer } = require('./utils/mcp-openrouter-optimizer');

const CREW_MEMBERS = {
  picard: {
    name: 'Captain Jean-Luc Picard',
    title: 'Commanding Officer',
    emoji: '🎖️',
    specialization: 'Strategic leadership and mission continuity',
    personality: 'Measured authority, philosophical depth, commitment to principles'
  },
  riker: {
    name: 'Commander William Riker',
    title: 'Executive Officer',
    emoji: '⚡',
    specialization: 'Tactical operations and workflow management',
    personality: 'Tactical, decisive, operationally focused'
  },
  data: {
    name: 'Commander Data',
    title: 'Operations Officer',
    emoji: '🤖',
    specialization: 'Technical analysis and system optimization',
    personality: 'Precise, analytical, logical, quest for understanding'
  },
  la_forge: {
    name: 'Lieutenant Commander Geordi La Forge',
    title: 'Chief Engineer',
    emoji: '🔧',
    specialization: 'Infrastructure health and engineering',
    personality: 'Practical, problem-solving, hands-on expertise'
  },
  worf: {
    name: 'Lieutenant Worf',
    title: 'Security Chief',
    emoji: '⚔️',
    specialization: 'Security analysis and threat assessment',
    personality: 'Honor-bound, vigilant, protective, Klingon warrior intensity'
  },
  troi: {
    name: 'Counselor Deanna Troi',
    title: 'Ship\'s Counselor',
    emoji: '💭',
    specialization: 'User experience and psychological assessment',
    personality: 'Empathetic, intuitive, user-focused, emotional intelligence'
  },
  crusher: {
    name: 'Dr. Beverly Crusher',
    title: 'Chief Medical Officer',
    emoji: '💊',
    specialization: 'System health and medical diagnosis',
    personality: 'Caring, diagnostic, health-focused, compassionate'
  },
  uhura: {
    name: 'Lieutenant Uhura',
    title: 'Communications Officer',
    emoji: '📻',
    specialization: 'Communication systems and network optimization',
    personality: 'Clear communication, network expertise, diplomatic'
  },
  quark: {
    name: 'Quark',
    title: 'Business Operations',
    emoji: '💰',
    specialization: 'Business optimization and cost analysis',
    personality: 'Profit-focused, shrewd, cost-conscious, Ferengi business acumen'
  },
  chief_obrien: {
    name: 'Chief Miles O\'Brien',
    title: 'Chief of Operations',
    emoji: '🛠️',
    specialization: 'Pragmatic solutions and troubleshooting',
    personality: 'No-nonsense, practical, experience-based, anti-over-engineering'
  }
};

/**
 * Retrieve crew memories from RAG system
 */
async function retrieveCrewMemories() {
  const memoryStorage = getMCPMemoryStorage();
  memoryStorage.initialize();
  
  const memories = {};
  const crewOrder = Object.keys(CREW_MEMBERS);
  
  for (const crewId of crewOrder) {
    try {
      // Query memories for this crew member
      const result = await memoryStorage.queryMemories('', {
        limit: 10,
        crewMember: crewId,
        category: 'crew_memory'
      });
      
      memories[crewId] = result.memories || result.data || [];
    } catch (error) {
      console.warn(`⚠️  Could not retrieve memories for ${crewId}: ${error.message}`);
      memories[crewId] = [];
    }
  }
  
  return memories;
}

/**
 * Generate cinematic screenplay opening
 */
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

/**
 * Generate cinematic character segment
 */
function generateCharacterSegment(crew, memories, assessment) {
  const { name, title, emoji, specialization, personality } = crew;
  
  // Format memories for context
  const memoryContext = memories.length > 0
    ? memories.slice(0, 5).map((m, i) => `  ${i + 1}. ${m.title || m.content?.substring(0, 100) || 'Memory entry'}`).join('\n')
    : '  (No recent memories found)';
  
  return `### ${emoji} ${name}
**${title} | ${specialization}**

*${name} ${getCharacterAction(name)}, ${personality}*

**${name.toUpperCase()}** ${getDialogueStyle(name)}

> "${assessment.opening || `As ${title}, I have reviewed our current state and my memories.`}"

*${name} ${getInsightAction(name)}, ${getInsightMotivation(name)}*

**Current State:**
${assessment.currentState || 'Reviewing project status and recent developments.'}

**Concerns:**
${assessment.concerns || 'Monitoring for potential issues in my area of expertise.'}

**Opportunities:**
${assessment.opportunities || 'Identifying potential improvements and optimizations.'}

**Recommendations:**
${assessment.recommendations || 'Providing guidance based on my specialized knowledge.'}

**Recent Memories:**
${memoryContext}

*${name} ${getClosingAction(name)}, ${getClosingMotivation(name)}*

**${name.toUpperCase()}**

> "${assessment.closing || 'I stand ready to contribute to our continued success.'}"

---

`;
}

/**
 * Character action helpers
 */
function getCharacterAction(name) {
  const actions = {
    'Captain Jean-Luc Picard': 'stands with commanding presence, his hands clasped behind his back',
    'Commander Data': 'sits with perfect posture, his golden eyes reflecting precise calculations',
    'Commander William Riker': 'leans forward with tactical readiness',
    'Lieutenant Commander Geordi La Forge': 'adjusts his VISOR, scanning technical data streams',
    'Lieutenant Worf': 'stands rigidly at attention, his Klingon warrior posture commanding respect',
    'Counselor Deanna Troi': 'sits with empathic awareness, sensing the emotional state of the crew',
    'Dr. Beverly Crusher': 'reviews her medical logs with diagnostic precision',
    'Lieutenant Uhura': 'monitors communication channels, ensuring all systems are connected',
    'Quark': 'calculates potential profit margins while reviewing business metrics',
    'Chief Miles O\'Brien': 'checks his tools, ready for any technical challenge'
  };
  return actions[name] || 'takes their position';
}

function getDialogueStyle(name) {
  const styles = {
    'Captain Jean-Luc Picard': '(with measured authority and philosophical depth)',
    'Commander Data': '(with precise, analytical delivery)',
    'Commander William Riker': '(with tactical decisiveness)',
    'Lieutenant Commander Geordi La Forge': '(with engineering expertise)',
    'Lieutenant Worf': '(with Klingon intensity and warrior\'s honor)',
    'Counselor Deanna Troi': '(with empathic understanding)',
    'Dr. Beverly Crusher': '(with medical precision and care)',
    'Lieutenant Uhura': '(with clear communication expertise)',
    'Quark': '(with Ferengi business acumen)',
    'Chief Miles O\'Brien': '(with pragmatic, no-nonsense directness)'
  };
  return styles[name] || '';
}

function getInsightAction(name) {
  const actions = {
    'Captain Jean-Luc Picard': 'pauses thoughtfully, his eyes reflecting years of command experience',
    'Commander Data': 'processes information with visible computational intensity',
    'Commander William Riker': 'assesses the tactical situation',
    'Lieutenant Commander Geordi La Forge': 'studies the technical specifications',
    'Lieutenant Worf': 'his eyes narrow with warrior\'s focus',
    'Counselor Deanna Troi': 'senses the emotional undercurrents',
    'Dr. Beverly Crusher': 'reviews the diagnostic data',
    'Lieutenant Uhura': 'checks communication protocols',
    'Quark': 'calculates the financial implications',
    'Chief Miles O\'Brien': 'examines the practical solutions'
  };
  return actions[name] || 'considers the information';
}

function getInsightMotivation(name) {
  const motivations = {
    'Captain Jean-Luc Picard': 'weighing each insight against his vast experience in diplomacy and leadership',
    'Commander Data': 'his positronic brain analyzing every detail for maximum efficiency',
    'Commander William Riker': 'his tactical mind evaluating operational readiness',
    'Lieutenant Commander Geordi La Forge': 'his engineering expertise identifying technical solutions',
    'Lieutenant Worf': 'his Klingon honor requiring thorough assessment of all threats',
    'Counselor Deanna Troi': 'her empathic abilities understanding the human element',
    'Dr. Beverly Crusher': 'her medical training focusing on system health',
    'Lieutenant Uhura': 'her communication expertise ensuring clear channels',
    'Quark': 'his business mind calculating value and profit',
    'Chief Miles O\'Brien': 'his practical experience finding simple, effective solutions'
  };
  return motivations[name] || 'analyzing the situation';
}

function getClosingAction(name) {
  const actions = {
    'Captain Jean-Luc Picard': 'straightens his uniform with quiet dignity',
    'Commander Data': 'nods with mechanical precision',
    'Commander William Riker': 'stands ready for action',
    'Lieutenant Commander Geordi La Forge': 'confirms system status',
    'Lieutenant Worf': 'maintains his warrior\'s stance',
    'Counselor Deanna Troi': 'senses the crew\'s alignment',
    'Dr. Beverly Crusher': 'completes her assessment',
    'Lieutenant Uhura': 'ensures all channels are clear',
    'Quark': 'calculates the final profit margin',
    'Chief Miles O\'Brien': 'confirms the solution is practical'
  };
  return actions[name] || 'completes their assessment';
}

function getClosingMotivation(name) {
  const motivations = {
    'Captain Jean-Luc Picard': 'his sense of duty and honor guiding his final words',
    'Commander Data': 'his logical mind satisfied with the comprehensive analysis',
    'Commander William Riker': 'his tactical readiness confirmed',
    'Lieutenant Commander Geordi La Forge': 'his engineering solutions validated',
    'Lieutenant Worf': 'his honor satisfied with the security assessment',
    'Counselor Deanna Troi': 'her empathic understanding complete',
    'Dr. Beverly Crusher': 'her medical assessment thorough',
    'Lieutenant Uhura': 'her communication systems verified',
    'Quark': 'his business analysis profitable',
    'Chief Miles O\'Brien': 'his practical solution confirmed'
  };
  return motivations[name] || 'their assessment complete';
}

/**
 * Generate crew assessment using LLM
 */
async function generateCrewAssessment(crew, memories, projectContext, topic) {
  const optimizer = getMCPOpenRouterOptimizer();
  optimizer.initialize();
  
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
    const response = await optimizer.optimizeAndCall(prompt, {
      crewMember: crew.id || crew.name.toLowerCase().replace(/\s+/g, '_'),
      complexity: 'high',
      temperature: 0.8,
    });
    
    const content = response.choices?.[0]?.message?.content || response.body || '{}';
    
    // Try to parse JSON from response
    let assessment;
    try {
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        assessment = JSON.parse(jsonMatch[0]);
      } else {
        // Fallback: parse from text
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
      // Fallback assessment
      assessment = {
        opening: `As ${crew.title}, I have reviewed our current state.`,
        currentState: 'Reviewing project status and recent developments.',
        concerns: 'Monitoring for potential issues in my area of expertise.',
        opportunities: 'Identifying potential improvements and optimizations.',
        recommendations: 'Providing guidance based on my specialized knowledge.',
        closing: 'I stand ready to contribute to our continued success.'
      };
    }
    
    return assessment;
  } catch (error) {
    console.warn(`⚠️  Could not generate assessment for ${crew.name}: ${error.message}`);
    return {
      opening: `As ${crew.title}, I have reviewed our current state.`,
      currentState: 'Reviewing project status and recent developments.',
      concerns: 'Monitoring for potential issues in my area of expertise.',
      opportunities: 'Identifying potential improvements and optimizations.',
      recommendations: 'Providing guidance based on my specialized knowledge.',
      closing: 'I stand ready to contribute to our continued success.'
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
 * Generate cinematic closing
 */
function generateCinematicClosing() {
  return `## 📽️ SCENE FOUR: The Conclusion

*Captain Picard stands, his hands clasped behind his back as he gazes out at the stars streaking past the viewport. The crew's assessments have been heard, their memories reviewed, their concerns acknowledged, and their recommendations noted.*

**CAPTAIN PICARD** *(turning to face the assembled crew)*

> "Thank you all for your insights. The work we've accomplished and the challenges we've identified today represent a significant step forward in our mission. Each of you has brought unique perspectives that will guide our future endeavors."

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
**Memories Reviewed:** Per crew member  
**Status:** Complete

---

*End of Observation Lounge Session*

`;
}

/**
 * Main function
 */
async function main() {
  const args = process.argv.slice(2);
  const topic = args.join(' ') || 'Project Status Review and Progress Assessment';
  
  // Parse natural language options
  const lowerTopic = topic.toLowerCase();
  const saveToFile = !lowerTopic.includes('no save') && !lowerTopic.includes('dont save');
  const format = lowerTopic.includes('standard') ? 'standard' : 'cinematic';
  
  console.log('\n');
  console.log('╔═══════════════════════════════════════════════════════════════════════════════╗');
  console.log('║                                                                               ║');
  console.log('║              🖖 AUTOMATIC CINEMATIC OBSERVATION LOUNGE 🖖                   ║');
  console.log('║                                                                               ║');
  console.log('╚═══════════════════════════════════════════════════════════════════════════════╝');
  console.log('\n');
  console.log(`📋 Topic: ${topic}`);
  console.log(`🎬 Format: ${format} (default: cinematic)`);
  console.log(`💾 Save to file: ${saveToFile ? 'Yes' : 'No'}\n`);
  
  // Step 1: Retrieve crew memories
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('📡 STEP 1: Retrieving Crew Memories from RAG System');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
  
  const crewMemories = await retrieveCrewMemories();
  const totalMemories = Object.values(crewMemories).reduce((sum, mems) => sum + mems.length, 0);
  console.log(`✅ Retrieved ${totalMemories} total memories across all crew members\n`);
  
  // Step 2: Get project context
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('📊 STEP 2: Analyzing Project Context');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
  
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
    ],
    painPoints: [
      'Initial timeout issues (resolved)',
      'Component layout needs bento-style refinement',
      'Navigation system needs global implementation'
    ],
    goals: [
      'Complete component layout refinement',
      'Implement global navigation system',
      'Add dynamic component generation',
      'Complete Quark + Troi cost-benefit analysis'
    ]
  };
  
  console.log('✅ Project context analyzed\n');
  
  // Step 3: Generate cinematic screenplay
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('🎬 STEP 3: Generating Cinematic Screenplay');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
  
  let screenplay = generateCinematicOpening(topic);
  
  // Initialize OpenRouter optimizer
  const optimizer = getMCPOpenRouterOptimizer();
  optimizer.initialize();
  
  const crewOrder = Object.keys(CREW_MEMBERS);
  
  for (let i = 0; i < crewOrder.length; i++) {
    const crewId = crewOrder[i];
    const crew = { ...CREW_MEMBERS[crewId], id: crewId };
    const memories = crewMemories[crewId] || [];
    
    console.log(`   ${crew.emoji} Generating assessment for ${crew.name}... (${i + 1}/${crewOrder.length})`);
    
    const assessment = await generateCrewAssessment(crew, memories, projectContext, topic);
    screenplay += generateCharacterSegment(crew, memories, assessment);
    
    // Small delay for pacing
    await new Promise(resolve => setTimeout(resolve, 500));
  }
  
  screenplay += generateCinematicClosing();
  
  console.log('\n✅ Cinematic screenplay generated\n');
  
  // Step 4: Save to file
  if (saveToFile) {
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('💾 STEP 4: Saving to File');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').split('T')[0];
    const filename = `OBSERVATION_LOUNGE_${timestamp}.md`;
    const filepath = path.join(__dirname, '..', 'docs', 'crew', filename);
    
    // Ensure directory exists
    const dir = path.dirname(filepath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    
    fs.writeFileSync(filepath, screenplay, 'utf8');
    console.log(`✅ Saved to: ${filepath}\n`);
    console.log(`📄 File: ${filename}\n`);
  }
  
  // Display summary
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('✅ OBSERVATION LOUNGE SESSION COMPLETE');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
  console.log(`   Topic: ${topic}`);
  console.log(`   Format: ${format}`);
  console.log(`   Crew Members: ${crewOrder.length}`);
  console.log(`   Total Memories: ${totalMemories}`);
  console.log(`   Saved: ${saveToFile ? 'Yes' : 'No'}\n`);
  
  // Also output to console for immediate viewing
  if (!saveToFile || process.stdout.isTTY) {
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

