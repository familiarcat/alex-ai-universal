#!/usr/bin/env node

/**
 * 🖖 Crew YouTube Video Analysis to RAG
 * 
 * Coordinates all crew members to analyze a YouTube video and extract:
 * - Analogies and metaphors
 * - Language patterns
 * - Cultural history insights
 * - Encryption methods
 * - Creation process insights
 * 
 * Stores enriched knowledge in RAG via MCP
 */

const fs = require('fs');
const path = require('path');
const { getMCPMemoryStorage } = require('../../utils/mcp-memory-storage');
const { getMCPOpenRouterOptimizer } = require('../../utils/mcp-openrouter-optimizer');
const { loadCrewCredentials } = require('../../utils/load-crew-credentials');

console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('🖖 Crew YouTube Video Analysis');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

// Load video payload
const payloadPath = process.argv[2] || 'youtube-crew-analysis-payload.json';
if (!fs.existsSync(payloadPath)) {
  console.error(`❌ Payload file not found: ${payloadPath}`);
  console.error('   First run: node scripts/youtube/enrich-youtube-to-rag.js <youtube_url> youtube-crew-analysis-payload.json');
  process.exit(1);
}

const payload = JSON.parse(fs.readFileSync(payloadPath, 'utf8'));
const videoDoc = payload.documents.find(d => d.doc_type === 'video');
const transcriptDocs = payload.documents.filter(d => d.doc_type === 'transcript');
const commentsDoc = payload.documents.find(d => d.doc_type === 'comments');

if (!videoDoc) {
  console.error('❌ No video document found in payload');
  process.exit(1);
}

const videoTitle = videoDoc.title;
const videoUrl = videoDoc.source_url;
const fullContent = [
  videoDoc.content,
  ...transcriptDocs.map(d => d.content),
  commentsDoc ? commentsDoc.content : ''
].filter(Boolean).join('\n\n---\n\n');

console.log(`📹 Video: ${videoTitle}`);
console.log(`🔗 URL: ${videoUrl}`);
console.log(`📊 Content Length: ${fullContent.length} characters`);
console.log(`📝 Transcript Chunks: ${transcriptDocs.length}`);
console.log(`💬 Comments: ${commentsDoc ? 'Available' : 'Not available'}\n`);

// Initialize MCP services
const mcpMemory = getMCPMemoryStorage();
const mcpOptimizer = getMCPOpenRouterOptimizer();

try {
  mcpMemory.initialize();
  mcpOptimizer.initialize();
} catch (error) {
  console.error('❌ Failed to initialize MCP services:', error.message);
  process.exit(1);
}

// Crew members and their analysis focus
const crewAnalysis = [
  {
    name: 'Captain Picard',
    role: 'Strategic Leadership',
    focus: 'Strategic patterns, leadership metaphors, decision-making frameworks',
    prompt: `Analyze this YouTube video content from a strategic leadership perspective. Extract:
- Strategic patterns and frameworks
- Leadership metaphors and analogies
- Decision-making insights
- Long-term vision implications
- How this relates to our creation process

Video: ${videoTitle}
Content: ${fullContent.substring(0, 8000)}`
  },
  {
    name: 'Commander Data',
    role: 'Technical Analysis',
    focus: 'Technical patterns, encryption methods, system architecture',
    prompt: `Analyze this YouTube video content from a technical perspective. Extract:
- Encryption methods and cryptographic patterns
- Technical architectures and systems
- Language patterns and encoding
- Technical metaphors applicable to our system
- How technical concepts relate to our creation process

Video: ${videoTitle}
Content: ${fullContent.substring(0, 8000)}`
  },
  {
    name: 'Commander Riker',
    role: 'Tactical Execution',
    focus: 'Execution patterns, workflow optimization, tactical insights',
    prompt: `Analyze this YouTube video content from a tactical execution perspective. Extract:
- Execution patterns and workflows
- Tactical metaphors and analogies
- Process optimization insights
- How execution patterns relate to our creation process
- Actionable tactical recommendations

Video: ${videoTitle}
Content: ${fullContent.substring(0, 8000)}`
  },
  {
    name: 'Lieutenant Commander La Forge',
    role: 'Infrastructure Engineering',
    focus: 'Infrastructure patterns, engineering metaphors, system design',
    prompt: `Analyze this YouTube video content from an infrastructure engineering perspective. Extract:
- Infrastructure patterns and designs
- Engineering metaphors and analogies
- System design insights
- How infrastructure concepts relate to our creation process
- Engineering best practices

Video: ${videoTitle}
Content: ${fullContent.substring(0, 8000)}`
  },
  {
    name: 'Lieutenant Worf',
    role: 'Security & Compliance',
    focus: 'Security patterns, encryption methods, threat analysis',
    prompt: `Analyze this YouTube video content from a security and compliance perspective. Extract:
- Security patterns and encryption methods
- Threat analysis and defense strategies
- Security metaphors and analogies
- How security concepts relate to our creation process
- Compliance and protection insights

Video: ${videoTitle}
Content: ${fullContent.substring(0, 8000)}`
  },
  {
    name: 'Counselor Troi',
    role: 'User Experience',
    focus: 'Cultural patterns, language nuances, user psychology',
    prompt: `Analyze this YouTube video content from a user experience and cultural perspective. Extract:
- Cultural history and patterns
- Language nuances and communication styles
- User psychology and behavior patterns
- Cultural metaphors and analogies
- How cultural insights relate to our creation process

Video: ${videoTitle}
Content: ${fullContent.substring(0, 8000)}`
  },
  {
    name: 'Dr. Crusher',
    role: 'Health & Diagnostics',
    focus: 'System health patterns, diagnostic metaphors, wellness insights',
    prompt: `Analyze this YouTube video content from a health and diagnostics perspective. Extract:
- Health and wellness patterns
- Diagnostic metaphors and analogies
- System health insights
- How health concepts relate to our creation process
- Preventive and diagnostic strategies

Video: ${videoTitle}
Content: ${fullContent.substring(0, 8000)}`
  },
  {
    name: 'Lieutenant Uhura',
    role: 'Communications',
    focus: 'Communication patterns, language analysis, message encoding',
    prompt: `Analyze this YouTube video content from a communications perspective. Extract:
- Communication patterns and encoding methods
- Language analysis and linguistic patterns
- Message transmission metaphors
- How communication concepts relate to our creation process
- Communication optimization insights

Video: ${videoTitle}
Content: ${fullContent.substring(0, 8000)}`
  },
  {
    name: 'Quark',
    role: 'Business Intelligence',
    focus: 'Business patterns, cost optimization, market insights',
    prompt: `Analyze this YouTube video content from a business intelligence perspective. Extract:
- Business patterns and market insights
- Cost optimization opportunities
- Business metaphors and analogies
- How business concepts relate to our creation process
- ROI and efficiency insights

Video: ${videoTitle}
Content: ${fullContent.substring(0, 8000)}`
  },
  {
    name: 'Chief O\'Brien',
    role: 'Pragmatic Solutions',
    focus: 'Practical patterns, quick fixes, hands-on insights',
    prompt: `Analyze this YouTube video content from a pragmatic solutions perspective. Extract:
- Practical patterns and quick fixes
- Hands-on implementation insights
- Pragmatic metaphors and analogies
- How practical concepts relate to our creation process
- Simple, effective solutions

Video: ${videoTitle}
Content: ${fullContent.substring(0, 8000)}`
  }
];

// Analyze with each crew member
async function analyzeWithCrew() {
  console.log('🖖 Coordinating crew analysis...\n');
  
  const allInsights = [];
  const sessionId = `crew-youtube-analysis-${Date.now()}`;
  
  for (const crew of crewAnalysis) {
    console.log(`📊 ${crew.name} (${crew.role}) analyzing...`);
    
    try {
      // Use OpenRouter to get crew member's analysis
      const crewMemberKey = crew.name.toLowerCase().replace(/\s+/g, '_').replace("'", '');
      const analysis = await mcpOptimizer.optimizeAndCall(crew.prompt, {
        crewMember: crewMemberKey,
        context: {
          videoTitle,
          videoUrl,
          focus: crew.focus,
          taskType: 'video_analysis'
        },
        complexity: 'medium',
        budget: 'balanced'
      });
      
      const insight = {
        crewMember: crew.name,
        role: crew.role,
        focus: crew.focus,
        analysis: typeof analysis === 'string' ? analysis : JSON.stringify(analysis),
        timestamp: new Date().toISOString()
      };
      
      allInsights.push(insight);
      console.log(`   ✅ ${crew.name} analysis complete\n`);
      
    } catch (error) {
      console.log(`   ⚠️  ${crew.name} analysis failed: ${error.message}\n`);
    }
  }
  
  // Create comprehensive crew analysis document
  const crewAnalysisContent = `
CREW ANALYSIS: ${videoTitle}

Video URL: ${videoUrl}
Analysis Date: ${new Date().toISOString()}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
CREW INSIGHTS BY SPECIALTY
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

${allInsights.map(insight => `
🎖️ ${insight.crewMember} (${insight.role})
Focus: ${insight.focus}

Analysis:
${insight.analysis}

`).join('\n---\n')}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
KEY EXTRACTIONS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

ANALOGIES & METAPHORS:
${allInsights.map(i => `- ${i.crewMember}: ${extractAnalogies(i.analysis)}`).filter(Boolean).join('\n')}

LANGUAGE PATTERNS:
${allInsights.map(i => `- ${i.crewMember}: ${extractLanguagePatterns(i.analysis)}`).filter(Boolean).join('\n')}

CULTURAL HISTORY:
${allInsights.map(i => `- ${i.crewMember}: ${extractCulturalHistory(i.analysis)}`).filter(Boolean).join('\n')}

ENCRYPTION METHODS:
${allInsights.map(i => `- ${i.crewMember}: ${extractEncryptionMethods(i.analysis)}`).filter(Boolean).join('\n')}

CREATION PROCESS INSIGHTS:
${allInsights.map(i => `- ${i.crewMember}: ${extractCreationProcess(i.analysis)}`).filter(Boolean).join('\n')}
`;
  
  return {
    sessionId,
    videoTitle,
    videoUrl,
    crewInsights: allInsights,
    comprehensiveAnalysis: crewAnalysisContent
  };
}

// Helper functions to extract specific insights
function extractAnalogies(text) {
  const matches = text.match(/(?:analogy|metaphor|like|similar to|as if)[^.]{0,200}/gi);
  return matches ? matches.slice(0, 2).join('; ') : 'None identified';
}

function extractLanguagePatterns(text) {
  const matches = text.match(/(?:language|linguistic|communication|encoding|decoding)[^.]{0,200}/gi);
  return matches ? matches.slice(0, 2).join('; ') : 'None identified';
}

function extractCulturalHistory(text) {
  const matches = text.match(/(?:cultural|history|tradition|heritage|society)[^.]{0,200}/gi);
  return matches ? matches.slice(0, 2).join('; ') : 'None identified';
}

function extractEncryptionMethods(text) {
  const matches = text.match(/(?:encrypt|decrypt|cipher|code|key|cryptographic|security)[^.]{0,200}/gi);
  return matches ? matches.slice(0, 2).join('; ') : 'None identified';
}

function extractCreationProcess(text) {
  const matches = text.match(/(?:create|build|develop|design|process|workflow|method)[^.]{0,200}/gi);
  return matches ? matches.slice(0, 2).join('; ') : 'None identified';
}

// Store in RAG
async function storeInRAG(analysisResult) {
  console.log('\n💾 Storing crew analysis in RAG system...\n');
  
  const memoryData = {
    session_id: analysisResult.sessionId,
    category: 'crew_analysis',
    title: `Crew Analysis: ${analysisResult.videoTitle}`,
    content: analysisResult.comprehensiveAnalysis,
    tags: [
      'youtube',
      'crew-analysis',
      'video-analysis',
      'analogies',
      'metaphors',
      'language-patterns',
      'cultural-history',
      'encryption-methods',
      'creation-process',
      'rag-enrichment'
    ],
    crewMember: 'all_crew',
    metadata: {
      videoTitle: analysisResult.videoTitle,
      videoUrl: analysisResult.videoUrl,
      crewMembers: analysisResult.crewInsights.map(i => i.crewMember),
      analysisDate: new Date().toISOString(),
      insightsCount: analysisResult.crewInsights.length
    }
  };
  
  try {
    const result = await mcpMemory.storeMemory(memoryData);
    
    if (result && result.success) {
      console.log('✅ Crew analysis stored in RAG system!');
      console.log(`   Session ID: ${result.result?.[0]?.session_id || memoryData.session_id}`);
      console.log(`   Crew Members: ${analysisResult.crewInsights.length}`);
      console.log(`   Video: ${analysisResult.videoTitle}\n`);
      
      // Also store individual crew member insights
      console.log('💾 Storing individual crew member insights...\n');
      
      for (const insight of analysisResult.crewInsights) {
        const individualMemory = {
          session_id: `${analysisResult.sessionId}-${insight.crewMember.toLowerCase().replace(/\s+/g, '-')}`,
          category: 'crew_insight',
          title: `${insight.crewMember} Analysis: ${analysisResult.videoTitle}`,
          content: `Role: ${insight.role}\nFocus: ${insight.focus}\n\nAnalysis:\n${insight.analysis}`,
          tags: [
            'youtube',
            'crew-analysis',
            insight.crewMember.toLowerCase().replace(/\s+/g, '-'),
            insight.role.toLowerCase().replace(/\s+/g, '-')
          ],
          crewMember: insight.crewMember.toLowerCase().replace(/\s+/g, '_'),
          metadata: {
            videoTitle: analysisResult.videoTitle,
            videoUrl: analysisResult.videoUrl,
            role: insight.role,
            focus: insight.focus,
            timestamp: insight.timestamp
          }
        };
        
        try {
          await mcpMemory.storeMemory(individualMemory);
          console.log(`   ✅ ${insight.crewMember} insight stored`);
        } catch (error) {
          console.log(`   ⚠️  ${insight.crewMember} insight storage failed: ${error.message}`);
        }
      }
      
      console.log('\n🎉 All crew analysis stored in RAG system!\n');
      return true;
    } else {
      throw new Error('MCP memory storage returned invalid result');
    }
  } catch (error) {
    console.error('❌ Failed to store crew analysis:', error.message);
    return false;
  }
}

// Main execution
async function main() {
  try {
    // Analyze with crew
    const analysisResult = await analyzeWithCrew();
    
    // Store in RAG
    const stored = await storeInRAG(analysisResult);
    
    if (stored) {
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log('✅ Crew Analysis Complete');
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
      
      console.log(`📹 Video: ${analysisResult.videoTitle}`);
      console.log(`🖖 Crew Members: ${analysisResult.crewInsights.length}`);
      console.log(`💾 RAG Storage: Complete`);
      console.log(`🔍 Searchable: Yes (via MCP RAG system)\n`);
      
      console.log('📊 Key Extractions:');
      console.log('   • Analogies & Metaphors');
      console.log('   • Language Patterns');
      console.log('   • Cultural History');
      console.log('   • Encryption Methods');
      console.log('   • Creation Process Insights\n');
      
      process.exit(0);
    } else {
      console.error('❌ Failed to store analysis in RAG');
      process.exit(1);
    }
  } catch (error) {
    console.error('❌ Crew analysis failed:', error);
    process.exit(1);
  }
}

main();

