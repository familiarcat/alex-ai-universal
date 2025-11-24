#!/usr/bin/env node
/**
 * Generate Complete Cursor AI Startup Prompt
 * 
 * Combines crew memories with startup template to create
 * a ready-to-use prompt for Cursor AI chat.
 * 
 * Usage:
 *   node scripts/generate-cursor-prompt.js
 *   node scripts/generate-cursor-prompt.js --context="Working on dashboard"
 */

const { loadCrewMemories, formatMemoriesForCursor } = require('./crew/coordination/load-crew-memories');
const fs = require('fs');
const path = require('path');

const STARTUP_TEMPLATE = `🖖 Activate Alex AI with Full Crew Memory Context

I'm starting a new Cursor AI chat session and want to include Alex AI crew coordination with full memory context.

Please:
1. Load all crew member memories from our Supabase RAG system
2. Activate Alex AI crew coordination mode
3. Include the following crew members in context:
   - 🎖️ Captain Picard (Strategic leadership)
   - ⚡ Commander Riker (Tactical operations)
   - 🤖 Commander Data (Technical analysis)
   - 🔧 Lieutenant Commander La Forge (Infrastructure)
   - ⚔️ Lieutenant Worf (Security)
   - 💭 Counselor Troi (User experience)
   - 💊 Dr. Crusher (System health)
   - 📻 Lieutenant Uhura (Communication)
   - 💰 Quark (Business optimization)
   - 🛠️ Chief O'Brien (Pragmatic solutions)

4. Maintain chat memory persistence throughout this session
5. Reference previous conversations and decisions from crew memories

{CREW_MEMORIES}

Current project context:
- Repository: alex-ai-universal
- Working on: {CURRENT_CONTEXT}
- Recent focus: Dashboard development, n8n integration, memory system

Let's continue our work with full crew coordination! 🖖`;

async function generatePrompt() {
  try {
    console.log('🖖 Generating Cursor AI Startup Prompt...\n');

    // Load crew memories
    const memoriesByCrew = await loadCrewMemories();
    const memoriesFormatted = formatMemoriesForCursor(memoriesByCrew);

    // Get context from args or use default
    const contextArg = process.argv.find(arg => arg.startsWith('--context='));
    const currentContext = contextArg 
      ? contextArg.split('=')[1].replace(/"/g, '')
      : 'Dashboard development and memory system';

    // Generate prompt
    const prompt = STARTUP_TEMPLATE
      .replace('{CREW_MEMORIES}', memoriesFormatted)
      .replace('{CURRENT_CONTEXT}', currentContext);

    // Save to file
    const outputDir = path.join(process.cwd(), '.cursor', 'alex-ai');
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    const outputFile = path.join(outputDir, 'cursor-startup-prompt.md');
    fs.writeFileSync(outputFile, prompt);

    console.log('\n' + '='.repeat(60) + '\n');
    console.log('✅ Complete Cursor AI Startup Prompt Generated!\n');
    console.log(`📄 Saved to: ${outputFile}\n`);
    console.log('📋 Copy the contents of this file into Cursor AI chat to activate Alex AI\n');
    console.log('='.repeat(60) + '\n');

    // Also output to console for easy copying
    console.log(prompt);

    return prompt;
  } catch (error) {
    console.error('❌ Error generating prompt:', error.message);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  generatePrompt();
}

module.exports = { generatePrompt };

