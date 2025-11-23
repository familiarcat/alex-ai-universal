#!/usr/bin/env node
/**
 * Load Crew Memories for Cursor AI Chat
 * 
 * This script loads all crew member memories from Supabase
 * and formats them for inclusion in Cursor AI chat prompts.
 * 
 * Usage:
 *   node scripts/load-crew-memories.js
 *   node scripts/load-crew-memories.js --format=markdown
 *   node scripts/load-crew-memories.js --format=json
 */

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Load credentials
function loadCredentials() {
  // Try environment variables first
  if (process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return {
      supabaseUrl: process.env.SUPABASE_URL,
      supabaseKey: process.env.SUPABASE_SERVICE_ROLE_KEY
    };
  }

  // Try ~/.zshrc
  try {
    const zshrc = fs.readFileSync(path.join(process.env.HOME, '.zshrc'), 'utf8');
    const urlMatch = zshrc.match(/export\s+SUPABASE_URL=["']?([^"'\s]+)["']?/);
    const keyMatch = zshrc.match(/export\s+SUPABASE_SERVICE_ROLE_KEY=["']?([^"'\s]+)["']?/);
    
    if (urlMatch && keyMatch) {
      return {
        supabaseUrl: urlMatch[1],
        supabaseKey: keyMatch[1]
      };
    }
  } catch (error) {
    // Ignore
  }

  throw new Error('Supabase credentials not found. Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY environment variables.');
}

// Crew member names mapping
const CREW_MEMBERS = {
  picard: 'Captain Jean-Luc Picard',
  riker: 'Commander William Riker',
  data: 'Commander Data',
  la_forge: 'Lieutenant Commander Geordi La Forge',
  worf: 'Lieutenant Worf',
  troi: 'Counselor Deanna Troi',
  crusher: 'Dr. Beverly Crusher',
  uhura: 'Lieutenant Uhura',
  quark: 'Quark',
  chief_obrien: "Chief Miles O'Brien",
  diagnostic_officer: 'Diagnostic Officer'
};

// Format memories for markdown
function formatMemoriesMarkdown(memoriesByCrew) {
  let output = '# 🖖 Alex AI Crew Memories\n\n';
  output += '**Loaded from Supabase RAG Memory System**\n\n';
  output += `**Total Memories**: ${Object.values(memoriesByCrew).flat().length}\n\n`;
  output += '---\n\n';

  for (const [crewId, memories] of Object.entries(memoriesByCrew)) {
    if (memories.length === 0) continue;
    
    const crewName = CREW_MEMBERS[crewId] || crewId;
    output += `## ${crewName} (${crewId})\n\n`;
    output += `**Memories**: ${memories.length}\n\n`;

    // Group by knowledge type
    const byType = {};
    memories.forEach(m => {
      const type = m.knowledge_type || 'general';
      if (!byType[type]) byType[type] = [];
      byType[type].push(m);
    });

    for (const [type, typeMemories] of Object.entries(byType)) {
      output += `### ${type.replace(/_/g, ' ').toUpperCase()}\n\n`;
      
      typeMemories.slice(0, 5).forEach((memory, idx) => {
        output += `#### Memory ${idx + 1}: ${memory.title || 'Untitled'}\n\n`;
        if (memory.summary) {
          output += `**Summary**: ${memory.summary}\n\n`;
        }
        if (memory.key_findings && memory.key_findings.length > 0) {
          output += `**Key Findings**:\n`;
          memory.key_findings.forEach(f => output += `- ${f}\n`);
          output += `\n`;
        }
        if (memory.recommendations && memory.recommendations.length > 0) {
          output += `**Recommendations**:\n`;
          memory.recommendations.forEach(r => output += `- ${r}\n`);
          output += `\n`;
        }
        if (memory.tags && memory.tags.length > 0) {
          output += `**Tags**: ${memory.tags.join(', ')}\n\n`;
        }
        output += `---\n\n`;
      });
    }
    output += `\n`;
  }

  return output;
}

// Format memories for JSON
function formatMemoriesJSON(memoriesByCrew) {
  return JSON.stringify(memoriesByCrew, null, 2);
}

// Format memories for Cursor AI prompt
function formatMemoriesForCursor(memoriesByCrew) {
  let output = '# 🖖 Alex AI Crew Context\n\n';
  output += '**This chat session includes Alex AI crew coordination.**\n\n';
  output += '## Active Crew Members:\n\n';
  
  const activeCrew = Object.entries(memoriesByCrew)
    .filter(([_, memories]) => memories.length > 0)
    .map(([crewId, memories]) => {
      const crewName = CREW_MEMBERS[crewId] || crewId;
      return `- **${crewName}** (${crewId}): ${memories.length} memories`;
    });
  
  output += activeCrew.join('\n') + '\n\n';
  output += '## Recent Key Memories:\n\n';

  // Get most recent memories across all crew
  const allMemories = Object.values(memoriesByCrew).flat();
  const recent = allMemories
    .sort((a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0))
    .slice(0, 10);

  recent.forEach(memory => {
    const crewName = CREW_MEMBERS[memory.crew_member] || memory.crew_member;
    output += `- **${crewName}**: ${memory.title || 'Untitled'}\n`;
    if (memory.summary) {
      output += `  - ${memory.summary.substring(0, 150)}${memory.summary.length > 150 ? '...' : ''}\n`;
    }
  });

  output += '\n---\n\n';
  output += '**Full memories available in crew context. Ask any crew member for their perspective.**\n\n';

  return output;
}

async function loadCrewMemories() {
  try {
    const { supabaseUrl, supabaseKey } = loadCredentials();
    const supabase = createClient(supabaseUrl, supabaseKey);

    console.log('🖖 Loading Crew Memories from Supabase...\n');

    // Load memories for each crew member
    const memoriesByCrew = {};
    const crewIds = Object.keys(CREW_MEMBERS);

    for (const crewId of crewIds) {
      const { data, error } = await supabase
        .from('crew_memories')
        .select('*')
        .eq('crew_member', crewId)
        .order('created_at', { ascending: false })
        .limit(20); // Limit to most recent 20 per crew member

      if (error) {
        console.warn(`⚠️  Error loading memories for ${crewId}:`, error.message);
        memoriesByCrew[crewId] = [];
      } else {
        memoriesByCrew[crewId] = data || [];
        console.log(`✅ ${CREW_MEMBERS[crewId]}: ${(data || []).length} memories`);
      }
    }

    // Get format from args
    const format = process.argv.includes('--format=json') ? 'json' :
                   process.argv.includes('--format=markdown') ? 'markdown' :
                   'cursor';

    let output;
    switch (format) {
      case 'json':
        output = formatMemoriesJSON(memoriesByCrew);
        break;
      case 'markdown':
        output = formatMemoriesMarkdown(memoriesByCrew);
        break;
      default:
        output = formatMemoriesForCursor(memoriesByCrew);
    }

    // Output to console
    console.log('\n' + '='.repeat(60) + '\n');
    console.log(output);
    console.log('\n' + '='.repeat(60) + '\n');

    // Also save to file
    const outputDir = path.join(process.cwd(), '.cursor', 'alex-ai');
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    const outputFile = path.join(outputDir, `crew-memories-${Date.now()}.${format === 'json' ? 'json' : 'md'}`);
    fs.writeFileSync(outputFile, output);
    console.log(`💾 Saved to: ${outputFile}\n`);

    // Also save latest version
    const latestFile = path.join(outputDir, `crew-memories-latest.${format === 'json' ? 'json' : 'md'}`);
    fs.writeFileSync(latestFile, output);
    console.log(`💾 Latest saved to: ${latestFile}\n`);

    return memoriesByCrew;
  } catch (error) {
    console.error('❌ Error loading crew memories:', error.message);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  loadCrewMemories();
}

module.exports = { loadCrewMemories, formatMemoriesForCursor };

