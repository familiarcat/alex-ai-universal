#!/usr/bin/env node

/**
 * 🔍 Query Crew Identity Analyses
 * 
 * Retrieves and displays specific crew member analyses from RAG system
 * for identity theory integrations.
 */

const { getMCPMemoryStorage } = require('../../utils/mcp-memory-storage');

console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('🔍 Query Crew Identity Analyses');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

const mcpMemory = getMCPMemoryStorage();

try {
  mcpMemory.initialize();
} catch (error) {
  console.error('❌ Failed to initialize MCP memory storage:', error.message);
  process.exit(1);
}

// Crew members to query
const crewMembers = [
  'Captain Picard',
  'Commander Data',
  'Commander Riker',
  'Lieutenant Commander La Forge',
  'Lieutenant Worf',
  'Counselor Troi',
  'Dr. Crusher',
  'Lieutenant Uhura',
  'Quark',
  'Chief O\'Brien'
];

// Query for specific crew member or all
const requestedCrew = process.argv[2] || 'all';

async function queryCrewAnalyses() {
  console.log(`📊 Querying identity analyses${requestedCrew !== 'all' ? ` for ${requestedCrew}` : ' for all crew members'}...\n`);
  
  const results = [];
  
  if (requestedCrew === 'all') {
    // Query all crew members
    for (const crewMember of crewMembers) {
      try {
        console.log(`🔍 Querying ${crewMember}...`);
        
        const query = {
          query: `${crewMember} identity integration`,
          limit: 5
        };
        
        const response = await mcpMemory.queryMemories(query);
        
        if (response && response.results && response.results.length > 0) {
          results.push({
            crewMember,
            analyses: response.results
          });
          console.log(`   ✅ Found ${response.results.length} analysis(ies)\n`);
        } else {
          console.log(`   ⚠️  No analyses found\n`);
        }
      } catch (error) {
        console.log(`   ❌ Query failed: ${error.message}\n`);
      }
    }
  } else {
    // Query specific crew member
    const crewMember = crewMembers.find(c => 
      c.toLowerCase().includes(requestedCrew.toLowerCase()) ||
      requestedCrew.toLowerCase().includes(c.toLowerCase().split(' ')[1] || '')
    );
    
    if (!crewMember) {
      console.error(`❌ Crew member not found: ${requestedCrew}`);
      console.log(`Available crew members: ${crewMembers.join(', ')}`);
      process.exit(1);
    }
    
    try {
      console.log(`🔍 Querying ${crewMember}...\n`);
      
      const query = {
        query: `${crewMember} identity integration`,
        limit: 5
      };
      
      const response = await mcpMemory.queryMemories(query);
      
      if (response && response.results && response.results.length > 0) {
        results.push({
          crewMember,
          analyses: response.results
        });
      } else {
        console.log(`⚠️  No analyses found for ${crewMember}`);
      }
    } catch (error) {
      console.error(`❌ Query failed: ${error.message}`);
      process.exit(1);
    }
  }
  
  // Display results
  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('📊 CREW IDENTITY ANALYSES');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
  
  for (const result of results) {
    console.log(`\n${'='.repeat(70)}`);
    console.log(`🎖️ ${result.crewMember}`);
    console.log(`${'='.repeat(70)}\n`);
    
    for (const analysis of result.analyses) {
      console.log(`📄 Title: ${analysis.title || 'Untitled'}`);
      console.log(`📅 Created: ${analysis.created_at || 'Unknown'}`);
      console.log(`🏷️  Tags: ${(analysis.tags || []).join(', ')}\n`);
      
      // Extract and display the analysis content
      const content = analysis.content || '';
      const analysisMatch = content.match(/Analysis:\s*(.+?)(?:\n\n|$)/s);
      const analysisText = analysisMatch ? analysisMatch[1] : content;
      
      // Display first 500 characters, or full if shorter
      if (analysisText.length > 500) {
        console.log(`${analysisText.substring(0, 500)}...\n`);
        console.log(`[Full analysis available in RAG - Session ID: ${analysis.session_id || 'N/A'}]\n`);
      } else {
        console.log(`${analysisText}\n`);
      }
      
      console.log(`─`.repeat(70));
      console.log('');
    }
  }
  
  if (results.length === 0) {
    console.log('⚠️  No analyses found. Make sure identity theories have been integrated.');
    console.log('   Run: node scripts/crew/coordination/crew-identity-theories-integration.js <payload.json>\n');
  }
  
  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(`✅ Retrieved ${results.length} crew member analysis set(s)`);
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
}

queryCrewAnalyses().catch(console.error);

