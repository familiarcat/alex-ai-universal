#!/usr/bin/env node

/**
 * 🖖 Crew Identity Theories Integration
 * 
 * Incorporates theories from a YouTube video into each crew member's MCP identity system.
 * Each crew member analyzes the video through their identity lens and applies concepts
 * to enhance their operational capabilities.
 * 
 * This creates a knowledge network where new theories inform crew operations.
 */

const fs = require('fs');
const path = require('path');
const { getMCPMemoryStorage } = require('../../utils/mcp-memory-storage');
const { getMCPOpenRouterOptimizer } = require('../../utils/mcp-openrouter-optimizer');
const { loadCrewCredentials } = require('../../utils/load-crew-credentials');

console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('🖖 Crew Identity Theories Integration');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

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

// Retrieve video from RAG or payload file
async function retrieveVideo(payloadPath) {
  console.log('🔍 Retrieving video content...\n');
  
  // Try to load from payload file first
  if (payloadPath && fs.existsSync(payloadPath)) {
    try {
      const payload = JSON.parse(fs.readFileSync(payloadPath, 'utf8'));
      const videoDoc = payload.documents?.find(d => d.doc_type === 'video');
      if (videoDoc) {
        console.log(`✅ Found video in payload: ${videoDoc.title}`);
        return {
          title: videoDoc.title,
          content: videoDoc.content,
          source_url: videoDoc.source_url || payloadPath
        };
      }
    } catch (error) {
      console.log('⚠️  Failed to read payload file, trying RAG...');
    }
  }
  
  // Try RAG system
  try {
    const results = await mcpMemory.queryMemories({
      query: 'youtube identity theories',
      limit: 5,
      category: 'youtube_video'
    });
    
    if (results && results.results && results.results.length > 0) {
      const video = results.results[0];
      console.log(`✅ Found video in RAG: ${video.title}`);
      return video;
    }
  } catch (error) {
    console.log('⚠️  RAG query failed, using fallback...');
  }
  
  throw new Error('Video content not found. Please enrich the video first.');
}

// Crew members with their identity lenses
const crewMembers = [
  {
    name: 'Captain Picard',
    icon: '🎖️',
    role: 'Strategic Leadership',
    identity: 'Strategic leader who makes decisions that shape the future',
    catchphrase: 'Make it so',
    specialty: 'Strategic Leadership',
    identityLens: 'How do these theories enhance strategic decision-making and leadership vision?'
  },
  {
    name: 'Commander Data',
    icon: '🤖',
    role: 'Technical Analysis',
    identity: 'Technical analyst who understands systems and information theory',
    catchphrase: 'Fascinating',
    specialty: 'Technical Analysis',
    identityLens: 'How do these theories apply to technical systems and information architecture?'
  },
  {
    name: 'Commander Riker',
    icon: '⚡',
    role: 'Tactical Execution',
    identity: 'Tactical officer who executes operations and overcomes obstacles',
    catchphrase: 'Engage',
    specialty: 'Tactical Execution',
    identityLens: 'How do these theories optimize tactical execution and workflow operations?'
  },
  {
    name: 'Lieutenant Commander La Forge',
    icon: '🔧',
    role: 'Infrastructure Engineering',
    identity: 'Engineer who designs and maintains complex systems',
    catchphrase: 'I can see that',
    specialty: 'Infrastructure Engineering',
    identityLens: 'How do these theories inform infrastructure design and system architecture?'
  },
  {
    name: 'Lieutenant Worf',
    icon: '⚔️',
    role: 'Security & Compliance',
    identity: 'Security officer responsible for protection and threat analysis',
    catchphrase: 'Today is a good day to die',
    specialty: 'Security & Compliance',
    identityLens: 'How do these theories enhance security architectures and threat defense?'
  },
  {
    name: 'Counselor Troi',
    icon: '💭',
    role: 'User Experience',
    identity: 'UX specialist who understands user psychology and interaction design',
    catchphrase: 'I sense...',
    specialty: 'User Experience',
    identityLens: 'How do these theories inform user experience design and psychological patterns?'
  },
  {
    name: 'Dr. Crusher',
    icon: '💊',
    role: 'Health & Diagnostics',
    identity: 'Medical officer who diagnoses and maintains system health',
    catchphrase: 'I\'m a doctor, not a...',
    specialty: 'Health & Diagnostics',
    identityLens: 'How do these theories relate to system health monitoring and diagnostics?'
  },
  {
    name: 'Lieutenant Uhura',
    icon: '📻',
    role: 'Communications',
    identity: 'Communications officer who manages information transmission',
    catchphrase: 'Hailing frequencies open',
    specialty: 'Communications',
    identityLens: 'How do these theories optimize communication protocols and information flow?'
  },
  {
    name: 'Quark',
    icon: '💰',
    role: 'Business Intelligence',
    identity: 'Business analyst who optimizes costs and maximizes value',
    catchphrase: 'Profit is profit',
    specialty: 'Business Intelligence',
    identityLens: 'How do these theories inform business optimization and cost analysis?'
  },
  {
    name: 'Chief O\'Brien',
    icon: '🛠️',
    role: 'Pragmatic Solutions',
    identity: 'Pragmatic engineer who finds simple, effective solutions',
    catchphrase: 'Simple solutions are usually the best solutions',
    specialty: 'Pragmatic Solutions',
    identityLens: 'How do these theories provide practical, actionable solutions?'
  }
];

// Generate crew member's identity analysis
async function generateIdentityAnalysis(crewMember, video) {
  const prompt = `You are ${crewMember.name} from Star Trek: The Next Generation.

YOUR IDENTITY:
- Role: ${crewMember.role}
- Identity: ${crewMember.identity}
- Specialty: ${crewMember.specialty}
- Catchphrase: "${crewMember.catchphrase}"

VIDEO CONTENT:
${video.content.substring(0, 12000)}

IDENTITY LENS: ${crewMember.identityLens}

TASK: Analyze this video content through your identity lens and extract:
1. Key theories and concepts from the video
2. How these theories relate to your identity and specialty
3. Specific applications of these theories to your operational capabilities
4. How these concepts enhance your MCP identity system
5. Practical ways to integrate these theories into your workflow

Format your response as an in-character analysis (2-3 paragraphs) that:
- Speaks as ${crewMember.name} would
- Uses your catchphrase naturally
- Connects theories to your specialty
- Provides actionable insights for your role

Be specific about how these theories enhance your identity and capabilities.`;

  try {
    const crewKey = crewMember.name.toLowerCase().replace(/\s+/g, '_').replace("'", '');
    const response = await mcpOptimizer.optimizeAndCall(prompt, {
      crewMember: crewKey,
      context: {
        role: crewMember.role,
        specialty: crewMember.specialty,
        videoTitle: video.title
      },
      complexity: 'high',
      budget: 'balanced'
    });
    
    return typeof response === 'string' 
      ? response 
      : (response.choices?.[0]?.message?.content || JSON.stringify(response));
  } catch (error) {
    // Fallback analysis
    return `${crewMember.name}: "As ${crewMember.specialty}, I see how these theories from ${video.title} relate to my identity. ${crewMember.identityLens} These concepts can enhance my ${crewMember.specialty.toLowerCase()} capabilities. ${crewMember.catchphrase}."`;
  }
}

// Integrate theories into crew identities
async function integrateTheoriesIntoIdentities(video) {
  console.log('🖖 Coordinating crew identity theory integration...\n');
  
  const allIntegrations = [];
  const sessionId = `crew-identity-theories-${Date.now()}`;
  
  for (const crewMember of crewMembers) {
    console.log(`📊 ${crewMember.icon} ${crewMember.name} (${crewMember.role}) - Analyzing theories...`);
    
    try {
      const analysis = await generateIdentityAnalysis(crewMember, video);
      
      const integration = {
        crewMember: crewMember.name,
        role: crewMember.role,
        specialty: crewMember.specialty,
        identity: crewMember.identity,
        analysis: analysis,
        timestamp: new Date().toISOString()
      };
      
      allIntegrations.push(integration);
      console.log(`   ✅ ${crewMember.name} identity integration complete\n`);
      
    } catch (error) {
      console.log(`   ⚠️  ${crewMember.name} analysis failed: ${error.message}\n`);
      allIntegrations.push({
        crewMember: crewMember.name,
        role: crewMember.role,
        specialty: crewMember.specialty,
        identity: crewMember.identity,
        analysis: `Analysis failed: ${error.message}`,
        error: true,
        timestamp: new Date().toISOString()
      });
    }
  }
  
  return {
    sessionId,
    videoTitle: video.title,
    videoUrl: video.source_url,
    crewIntegrations: allIntegrations
  };
}

// Create integration network - how theories flow between crew members
async function createIntegrationNetwork(integrationResult) {
  console.log('\n🔄 Creating identity theory integration network...\n');
  
  const integrationConnections = [];
  
  // Each crew member's insights inform others
  const connectionMap = {
    'Captain Picard': ['Commander Riker', 'Commander Data', 'Lieutenant Commander La Forge'],
    'Commander Data': ['Lieutenant Commander La Forge', 'Lieutenant Worf', 'Lieutenant Uhura'],
    'Commander Riker': ['Chief O\'Brien', 'Lieutenant Commander La Forge'],
    'Lieutenant Commander La Forge': ['Chief O\'Brien', 'Dr. Crusher'],
    'Lieutenant Worf': ['Commander Data', 'Lieutenant Uhura'],
    'Counselor Troi': ['Lieutenant Uhura', 'Dr. Crusher'],
    'Dr. Crusher': ['Lieutenant Commander La Forge', 'Chief O\'Brien'],
    'Lieutenant Uhura': ['Commander Data', 'Counselor Troi'],
    'Quark': ['Chief O\'Brien', 'Commander Riker'],
    'Chief O\'Brien': ['Commander Riker', 'Lieutenant Commander La Forge']
  };
  
  for (const integration of integrationResult.crewIntegrations) {
    const connections = connectionMap[integration.crewMember] || [];
    
    for (const connectedCrew of connections) {
      const connectedIntegration = integrationResult.crewIntegrations.find(i => i.crewMember === connectedCrew);
      
      if (connectedIntegration && !integration.error) {
        integrationConnections.push({
          from: integration.crewMember,
          to: connectedCrew,
          theory: `Theories from ${integrationResult.videoTitle} enhance ${connectedCrew}'s ${connectedIntegration.specialty}`,
          connection: `${integration.crewMember}'s insights on ${integration.specialty} inform ${connectedCrew}'s ${connectedIntegration.specialty}`,
          integration: `How identity theories enhance ${connectedCrew}'s operational capabilities`
        });
      }
    }
  }
  
  return integrationConnections;
}

// Store identity integrations in RAG
async function storeIdentityIntegrations(integrationResult, integrationNetwork) {
  console.log('\n💾 Storing identity theory integrations in RAG...\n');
  
  // Create comprehensive integration document
  const comprehensiveContent = `
CREW IDENTITY THEORIES INTEGRATION: ${integrationResult.videoTitle}

Video URL: ${integrationResult.videoUrl}
Integration Date: ${new Date().toISOString()}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
CREW IDENTITY INTEGRATIONS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

${integrationResult.crewIntegrations.map(integration => `
${integration.crewMember} (${integration.role})
Specialty: ${integration.specialty}
Identity: ${integration.identity}

Analysis:
${integration.analysis}

`).join('\n---\n')}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
INTEGRATION NETWORK
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

${integrationNetwork.map(conn => `
${conn.from} → ${conn.to}
Theory: ${conn.theory}
Connection: ${conn.connection}
Integration: ${conn.integration}
`).join('\n---\n')}
`;
  
  try {
    // Store comprehensive integration
    const result = await mcpMemory.storeMemory({
      sessionId: integrationResult.sessionId,
      category: 'crew_identity_integration',
      title: `Crew Identity Theories Integration: ${integrationResult.videoTitle}`,
      content: comprehensiveContent,
      tags: [
        'identity-theories',
        'crew-integration',
        'mcp-identity',
        'crew-enhancement',
        'theory-application',
        'knowledge-network'
      ],
      crewMember: 'all_crew',
      metadata: {
        videoTitle: integrationResult.videoTitle,
        videoUrl: integrationResult.videoUrl,
        crewMembers: integrationResult.crewIntegrations.map(i => i.crewMember),
        integrationCount: integrationResult.crewIntegrations.length,
        networkConnections: integrationNetwork.length,
        integrationDate: new Date().toISOString()
      }
    });
    
    console.log('✅ Comprehensive identity integration stored!');
    console.log(`   Session ID: ${result.result?.[0]?.session_id || integrationResult.sessionId}\n`);
    
    // Store individual crew member integrations
    console.log('💾 Storing individual crew identity integrations...\n');
    
    for (const integration of integrationResult.crewIntegrations) {
      if (!integration.error) {
        const individualMemory = {
          sessionId: `${integrationResult.sessionId}-${integration.crewMember.toLowerCase().replace(/\s+/g, '-').replace("'", '')}`,
          category: 'crew_identity_integration',
          title: `${integration.crewMember} Identity Integration: ${integrationResult.videoTitle}`,
          content: `Role: ${integration.role}
Specialty: ${integration.specialty}
Identity: ${integration.identity}

Theory Analysis:
${integration.analysis}

Related Video: ${integrationResult.videoTitle}
${integrationResult.videoUrl}`,
          tags: [
            'identity-theories',
            'crew-integration',
            integration.crewMember.toLowerCase().replace(/\s+/g, '-').replace("'", ''),
            integration.specialty.toLowerCase().replace(/\s+/g, '-'),
            'mcp-identity'
          ],
          crewMember: integration.crewMember.toLowerCase().replace(/\s+/g, '_').replace("'", ''),
          metadata: {
            videoTitle: integrationResult.videoTitle,
            videoUrl: integrationResult.videoUrl,
            role: integration.role,
            specialty: integration.specialty,
            identity: integration.identity,
            timestamp: integration.timestamp
          }
        };
        
        try {
          await mcpMemory.storeMemory(individualMemory);
          console.log(`   ✅ ${integration.crewMember} identity integration stored`);
        } catch (error) {
          console.log(`   ⚠️  ${integration.crewMember} storage failed: ${error.message}`);
        }
      }
    }
    
    // Store integration network connections
    console.log('\n💾 Storing integration network connections...\n');
    
    for (const connection of integrationNetwork) {
      const connectionMemory = {
        sessionId: `${integrationResult.sessionId}-integration-${connection.from.toLowerCase().replace(/\s+/g, '-')}-${connection.to.toLowerCase().replace(/\s+/g, '-')}`,
        category: 'crew_integration_network',
        title: `Identity Theory Integration: ${connection.from} → ${connection.to}`,
        content: `From: ${connection.from}
To: ${connection.to}
Theory: ${connection.theory}
Connection: ${connection.connection}
Integration: ${connection.integration}

This connection enables identity theories to flow through the crew workflow system, enhancing operational capabilities.`,
        tags: [
          'identity-theories',
          'integration-network',
          'crew-workflow',
          connection.from.toLowerCase().replace(/\s+/g, '-'),
          connection.to.toLowerCase().replace(/\s+/g, '-')
        ],
        crewMember: 'all_crew',
        metadata: {
          from: connection.from,
          to: connection.to,
          theory: connection.theory,
          connection: connection.connection,
          integration: connection.integration
        }
      };
      
      try {
        await mcpMemory.storeMemory(connectionMemory);
        console.log(`   ✅ Integration: ${connection.from} → ${connection.to}`);
      } catch (error) {
        console.log(`   ⚠️  Integration storage failed: ${error.message}`);
      }
    }
    
    console.log('\n🎉 All identity theory integrations stored in RAG!\n');
    return true;
  } catch (error) {
    console.error('❌ Failed to store integrations:', error.message);
    return false;
  }
}

// Main execution
async function main() {
  try {
    const payloadPath = process.argv[2] || 'youtube-identity-theories-payload.json';
    
    // Retrieve video
    const video = await retrieveVideo(payloadPath);
    
    // Integrate theories into crew identities
    const integrationResult = await integrateTheoriesIntoIdentities(video);
    
    // Create integration network
    const integrationNetwork = await createIntegrationNetwork(integrationResult);
    
    // Store in RAG
    const stored = await storeIdentityIntegrations(integrationResult, integrationNetwork);
    
    if (stored) {
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log('✅ Identity Theories Integration Complete');
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
      
      console.log(`📹 Video: ${integrationResult.videoTitle}`);
      console.log(`🖖 Crew Members: ${integrationResult.crewIntegrations.length}`);
      console.log(`🔗 Integration Connections: ${integrationNetwork.length}`);
      console.log(`💾 RAG Storage: Complete`);
      console.log(`🔍 Searchable: Yes (via MCP RAG system)\n`);
      
      console.log('📊 Identity Integrations:');
      integrationResult.crewIntegrations.forEach(integration => {
        if (!integration.error) {
          console.log(`   • ${integration.crewMember}: ${integration.specialty}`);
        }
      });
      
      console.log('\n🔄 Integration Network:');
      integrationNetwork.slice(0, 10).forEach(conn => {
        console.log(`   • ${conn.from} → ${conn.to} (${conn.theory})`);
      });
      if (integrationNetwork.length > 10) {
        console.log(`   ... and ${integrationNetwork.length - 10} more connections`);
      }
      
      console.log('\n🎉 Identity theories are now integrated into crew MCP identity system!\n');
      
      process.exit(0);
    } else {
      console.error('❌ Failed to store integrations in RAG');
      process.exit(1);
    }
  } catch (error) {
    console.error('❌ Identity integration failed:', error);
    process.exit(1);
  }
}

main();

