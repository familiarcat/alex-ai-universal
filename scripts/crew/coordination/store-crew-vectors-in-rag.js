#!/usr/bin/env node

/**
 * 🖖 Store Crew Members as Vector Points in RAG System
 * 
 * Each crew member becomes a vector point with:
 * - Their identity and personality
 * - Their specialties and expertise
 * - Their preferred LLM models
 * - Their typical use cases
 * - Associated knowledge points
 */

const fs = require('fs');
const path = require('path');
const { getMCPMemoryStorage } = require('./utils/mcp-memory-storage');
const { getMCPOpenRouterOptimizer } = require('./utils/mcp-openrouter-optimizer');

console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('🖖 Store Crew Members as Vector Points in RAG');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

const crewMembersDir = path.join(__dirname, '..', 'crew-members');
const memoryStorage = getMCPMemoryStorage();
const optimizer = getMCPOpenRouterOptimizer();

// Initialize services
memoryStorage.initialize();
optimizer.initialize();

// Generate semantic text for crew member vector
function generateCrewVectorText(crewData) {
  const name = crewData.personality?.name || crewData.name || 'Unknown';
  const role = crewData.personality?.role || 'Unknown';
  const specialization = crewData.expertise?.primary || 'General';
  const secondary = crewData.expertise?.secondary || [];
  const years = crewData.expertise?.years || 'Unknown';
  const knownFor = crewData.expertise?.knownFor || [];
  const catchphrases = crewData.personality?.catchphrases || [];
  const traits = crewData.personality?.traits || [];
  const preferredModels = crewData.ai?.preferredModels || [];
  const useCases = crewData.useCases || [];
  const responsibilities = crewData.responsibilities || [];

  return `
Crew Member: ${name}
Role: ${role}
Specialization: ${specialization}
Secondary Specializations: ${secondary.join(', ')}
Experience: ${years} years
Known For: ${knownFor.join(', ')}
Personality Traits: ${traits.join(', ')}
Catchphrases: ${catchphrases.join('; ')}
Preferred LLM Models: ${preferredModels.join(', ')}
Typical Use Cases: ${useCases.join(', ')}
Responsibilities: ${responsibilities.join(', ')}

This crew member specializes in ${specialization} and is known for ${knownFor.join(' and ')}. 
They have ${years} years of experience and typically handle ${useCases.join(', ')}.
Their preferred AI models are ${preferredModels.join(' and ')} for optimal cost and performance.
When seeking analysis in ${specialization}, this crew member should be consulted.
Their expertise includes ${secondary.join(', ')} and they are characterized by ${traits.join(', ')}.
`;
}

// Store crew member as vector point
async function storeCrewMember(crewFile) {
  try {
    const filePath = path.join(crewMembersDir, crewFile);
    const crewData = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    
    const name = crewData.personality?.name || crewData.name || crewFile.replace('.json', '');
    const role = crewData.personality?.role || crewData.expertise?.primary || 'Unknown';
    const specialization = crewData.expertise?.primary || 'General';
    
    console.log(`📦 Storing: ${name}`);
    console.log(`   Role: ${role}`);
    console.log(`   Specialization: ${specialization}`);
    
    // Generate semantic text
    const semanticText = generateCrewVectorText(crewData);
    
    // Generate embedding using OpenRouter (optimized for crew member context)
    let embedding = null;
    try {
      console.log('   🤖 Generating embedding with OpenRouter...');
      embedding = await optimizer.generateEmbedding(semanticText, {
        model: 'openai/text-embedding-3-small', // Cost-effective for crew profiles
        crewMember: name,
        context: 'crew-profile'
      });
      console.log('   ✅ Embedding generated');
    } catch (error) {
      console.log(`   ⚠️  Embedding generation failed: ${error.message}`);
      console.log('   Continuing without embedding (will use full-text search)');
    }
    
    // Store in RAG with crew-specific metadata
    const memoryData = {
      title: `Crew Member: ${name}`,
      content: semanticText,
      category: 'crew-member',
      tags: [
        'crew',
        'crew-member',
        name.toLowerCase().replace(/\s+/g, '-'),
        specialization.toLowerCase().replace(/\s+/g, '-'),
        ...(crewData.expertise?.secondary || []).map(s => s.toLowerCase().replace(/\s+/g, '-')),
        ...(crewData.useCases || []).map(u => u.toLowerCase().replace(/\s+/g, '-'))
      ],
      crewMember: name,
      metadata: {
        crewMember: name,
        role: role,
        specialization: specialization,
        secondarySpecializations: crewData.expertise?.secondary || [],
        yearsExperience: crewData.expertise?.years || 'Unknown',
        knownFor: crewData.expertise?.knownFor || [],
        preferredModels: crewData.ai?.preferredModels || [],
        useCases: crewData.useCases || [],
        responsibilities: crewData.responsibilities || [],
        catchphrases: crewData.personality?.catchphrases || [],
        traits: crewData.personality?.traits || [],
        n8nWorkflowId: crewData.integrations?.n8n?.workflowId,
        webhookPath: crewData.integrations?.n8n?.webhookPath,
        vectorPoint: true,
        storedAt: new Date().toISOString()
      },
      sessionId: `crew-vector-${Date.now()}-${name.toLowerCase().replace(/\s+/g, '-')}`
    };
    
    // Add embedding if available
    if (embedding) {
      memoryData.embedding = embedding;
    }
    
    const result = await memoryStorage.storeMemory(memoryData);
    
    if (result.success) {
      console.log(`   ✅ Stored in RAG${result.cached ? ' (cached)' : ''}`);
      if (result.contextId) {
        console.log(`   📍 Context ID: ${result.contextId}`);
      }
    } else {
      console.log(`   ❌ Storage failed: ${result.error || 'Unknown error'}`);
    }
    
    console.log('');
    return result;
  } catch (error) {
    console.error(`   ❌ Error storing ${crewFile}: ${error.message}\n`);
    return { success: false, error: error.message };
  }
}

// Main execution
async function main() {
  console.log('📋 Step 1: Loading crew member profiles...\n');
  
  if (!fs.existsSync(crewMembersDir)) {
    console.error('❌ Crew members directory not found');
    process.exit(1);
  }
  
  const crewFiles = fs.readdirSync(crewMembersDir).filter(f => f.endsWith('.json')).sort();
  console.log(`✅ Found ${crewFiles.length} crew member profiles\n`);
  
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('📦 Step 2: Storing Crew Members as Vector Points');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
  
  const results = {
    total: crewFiles.length,
    successful: 0,
    failed: 0,
    cached: 0
  };
  
  for (const crewFile of crewFiles) {
    const result = await storeCrewMember(crewFile);
    
    if (result.success) {
      results.successful++;
      if (result.cached) {
        results.cached++;
      }
    } else {
      results.failed++;
    }
    
    // Small delay to avoid rate limiting
    await new Promise(resolve => setTimeout(resolve, 500));
  }
  
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('📊 Storage Summary');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
  
  console.log(`Total Crew Members: ${results.total}`);
  console.log(`✅ Successfully Stored: ${results.successful}`);
  console.log(`💾 Cached (already existed): ${results.cached}`);
  console.log(`❌ Failed: ${results.failed}`);
  console.log(`📈 Success Rate: ${((results.successful / results.total) * 100).toFixed(1)}%\n`);
  
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('✅ Crew Vector System Initialized!');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
  
  console.log('🎯 Next Steps:');
  console.log('   1. Crew members are now vector points in RAG');
  console.log('   2. Query crew members by specialization or use case');
  console.log('   3. Associate knowledge with crew members');
  console.log('   4. Enable multimodal crew coordination');
  console.log('   5. Optimize LLM selection per crew member\n');
}

main().catch(error => {
  console.error('❌ Error:', error);
  process.exit(1);
});

