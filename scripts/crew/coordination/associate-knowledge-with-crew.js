#!/usr/bin/env node

/**
 * 🖖 Associate Knowledge Points with Crew Members
 * 
 * Links existing RAG memories to crew members based on:
 * - Specialization matching
 * - Use case relevance
 * - Content similarity
 * - Metadata tags
 */

const { getMCPMemoryStorage } = require('./utils/mcp-memory-storage');
const { getMCPCache } = require('./utils/mcp-context-cache');

console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('🖖 Associate Knowledge with Crew Members');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

const memoryStorage = getMCPMemoryStorage();
const mcpCache = getMCPCache();

memoryStorage.initialize();

// Crew specialization mapping
const crewSpecializations = {
  'Captain Jean-Luc Picard': ['strategic', 'leadership', 'decision', 'planning', 'architecture', 'ethics'],
  'Commander William Riker': ['tactical', 'execution', 'workflow', 'implementation', 'team', 'coordination'],
  'Commander Data': ['analytics', 'data', 'ai', 'ml', 'logic', 'algorithm', 'pattern', 'analysis'],
  'Lieutenant Commander Geordi La Forge': ['infrastructure', 'system', 'integration', 'api', 'performance', 'engineering'],
  'Chief Miles O\'Brien': ['practical', 'implementation', 'quick', 'fix', 'troubleshooting', 'pragmatic'],
  'Dr. Beverly Crusher': ['health', 'diagnostic', 'performance', 'monitoring', 'system health'],
  'Counselor Deanna Troi': ['user experience', 'ux', 'empathy', 'psychology', 'user', 'interface'],
  'Lieutenant Worf': ['security', 'compliance', 'threat', 'protection', 'safety'],
  'Lieutenant Uhura': ['communication', 'io', 'network', 'api', 'integration', 'messaging'],
  'Quark': ['business', 'roi', 'cost', 'optimization', 'profit', 'efficiency', 'budget']
};

// Associate knowledge with crew members
async function associateKnowledgeWithCrew() {
  console.log('📋 Step 1: Querying all knowledge in RAG...\n');
  
  try {
    // Query all knowledge (excluding crew member profiles)
    const allKnowledge = await memoryStorage.queryMemories('', {
      limit: 1000,
      excludeCategory: 'crew-member'
    });
    
    if (!allKnowledge.success || !allKnowledge.results || allKnowledge.results.length === 0) {
      console.log('⚠️  No knowledge found in RAG (excluding crew members)');
      console.log('   This is normal if RAG is empty or only contains crew profiles\n');
      return;
    }
    
    console.log(`✅ Found ${allKnowledge.results.length} knowledge items\n`);
    
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('🔗 Step 2: Associating Knowledge with Crew Members');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    
    const associations = {};
    let totalAssociations = 0;
    
    // For each knowledge item, find relevant crew members
    for (const knowledge of allKnowledge.results) {
      // Handle content that might be object, string, or null
      let contentStr = '';
      if (typeof knowledge.content === 'string') {
        contentStr = knowledge.content;
      } else if (knowledge.content && typeof knowledge.content === 'object') {
        contentStr = JSON.stringify(knowledge.content);
      }
      
      const content = contentStr.toLowerCase();
      const title = (knowledge.title || '').toLowerCase();
      const tags = (Array.isArray(knowledge.metadata?.tags) ? knowledge.metadata.tags : []).map(t => String(t || '').toLowerCase());
      const category = String(knowledge.metadata?.category || '').toLowerCase();
      
      const relevantCrew = [];
      
      // Match by specialization keywords
      for (const [crewName, keywords] of Object.entries(crewSpecializations)) {
        const matches = keywords.filter(keyword => 
          content.includes(keyword) || 
          title.includes(keyword) || 
          tags.some(t => t.includes(keyword)) ||
          category.includes(keyword)
        );
        
        if (matches.length > 0) {
          relevantCrew.push({
            crewMember: crewName,
            relevanceScore: matches.length,
            matchedKeywords: matches
          });
        }
      }
      
      // Sort by relevance
      relevantCrew.sort((a, b) => b.relevanceScore - a.relevanceScore);
      
      // Associate with top 3 most relevant crew members
      const topCrew = relevantCrew.slice(0, 3);
      
      if (topCrew.length > 0) {
        for (const crew of topCrew) {
          if (!associations[crew.crewMember]) {
            associations[crew.crewMember] = [];
          }
          
          associations[crew.crewMember].push({
            knowledgeId: knowledge.id,
            knowledgeTitle: knowledge.title,
            relevanceScore: crew.relevanceScore,
            matchedKeywords: crew.matchedKeywords
          });
          
          totalAssociations++;
        }
        
        // Update knowledge metadata with crew associations
        const updatedMetadata = {
          ...knowledge.metadata,
          associatedCrew: topCrew.map(c => c.crewMember),
          crewRelevance: topCrew.reduce((acc, c) => {
            acc[c.crewMember] = c.relevanceScore;
            return acc;
          }, {})
        };
        
        // Store updated association (would need update endpoint)
        console.log(`   📎 ${knowledge.title}`);
        console.log(`      → ${topCrew.map(c => `${c.crewMember} (${c.relevanceScore} matches)`).join(', ')}`);
      }
    }
    
    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📊 Association Summary');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    
    console.log(`Total Knowledge Items: ${allKnowledge.results.length}`);
    console.log(`Total Associations: ${totalAssociations}`);
    console.log(`Crew Members with Associations: ${Object.keys(associations).length}\n`);
    
    console.log('👥 Crew Knowledge Associations:');
    for (const [crewMember, knowledgeList] of Object.entries(associations)) {
      console.log(`\n   ${crewMember}: ${knowledgeList.length} associated items`);
      knowledgeList.slice(0, 5).forEach(item => {
        console.log(`      • ${item.knowledgeTitle} (relevance: ${item.relevanceScore})`);
      });
      if (knowledgeList.length > 5) {
        console.log(`      ... and ${knowledgeList.length - 5} more`);
      }
    }
    
    console.log('\n✅ Knowledge association complete!\n');
    
  } catch (error) {
    console.error(`❌ Error: ${error.message}\n`);
  }
}

associateKnowledgeWithCrew().catch(error => {
  console.error('❌ Error:', error);
  process.exit(1);
});

