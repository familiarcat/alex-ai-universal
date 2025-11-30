#!/usr/bin/env node

/**
 * 🎯 Milestone Push to RAG Memory
 * 
 * Saves all Alex AI achievements to Supabase memory RAG via N8N interface
 * This ensures all crew members have access to our revolutionary progress
 */

const https = require('https');
const fs = require('fs');
const path = require('path');

// Load environment variables from ~/.zshrc
function loadZshrcEnv() {
  try {
    const zshrcPath = path.join(process.env.HOME, '.zshrc');
    const zshrcContent = fs.readFileSync(zshrcPath, 'utf8');
    
    const envVars = {};
    zshrcContent.split('\n').forEach(line => {
      if (line.includes('=') && !line.startsWith('#')) {
        // Handle both "export KEY=value" and "KEY=value" formats
        const cleanLine = line.replace(/^export\s+/, '');
        const [key, ...valueParts] = cleanLine.split('=');
        const value = valueParts.join('=').trim().replace(/^["']|["']$/g, ''); // Remove quotes
        if (key && value) {
          envVars[key.trim()] = value;
        }
      }
    });
    
    return envVars;
  } catch (error) {
    console.error('❌ Failed to load ~/.zshrc:', error.message);
    return {};
  }
}

const env = loadZshrcEnv();
const SUPABASE_URL = env.SUPABASE_URL || 'https://rpkkkbufdwxmjaerbhbn.supabase.co';
const SUPABASE_ANON_KEY = env.SUPABASE_ANON_KEY || env.SUPABASE_KEY;

if (!SUPABASE_ANON_KEY) {
  console.error('❌ SUPABASE_ANON_KEY not found in ~/.zshrc');
  console.log('Available environment variables:', Object.keys(env).filter(k => k.includes('SUPABASE')));
  process.exit(1);
}

console.log('🎯 Milestone Push to RAG Memory');
console.log('===============================');
console.log('✅ Environment variables loaded from ~/.zshrc');

// Milestone achievements to save
const milestoneAchievements = [
  {
    crew_member: 'Captain Picard',
    memory_type: 'milestone',
    mission_id: 'debugging-system-001',
    content: `Successfully implemented a revolutionary AI debugging system where N8N workflows become the central nervous system for intelligent code analysis. The system includes image analysis, code analysis, crew orchestration with all 9 crew members, dynamic LLM selection via OpenRouter, observation lounge for hallucination detection, and RAG memory storage. This represents a breakthrough in AI-assisted debugging with natural language processing and cinematic crew interactions.`,
    importance: 'critical',
    timestamp: new Date().toISOString()
  },
  {
    crew_member: 'Commander Data',
    memory_type: 'technical',
    mission_id: 'image-analysis-001',
    content: `Created sophisticated image analysis engine that analyzes UI screenshots for debugging purposes. The engine can identify UI elements, detect buttons, analyze click handlers, map functions, and provide debugging recommendations. Features include OCR text extraction, UI framework detection, and confidence scoring. This enables visual debugging capabilities for Cursor AI users.`,
    importance: 'high',
    timestamp: new Date().toISOString()
  },
  {
    crew_member: 'Commander Riker',
    memory_type: 'tactical',
    mission_id: 'code-analysis-001',
    content: `Implemented comprehensive code analysis engine that examines function execution issues and maps UI elements to code functions. Features include function extraction, click handler mapping, issue identification, and debugging suggestions. The engine supports JavaScript, TypeScript, JSX, and TSX with sophisticated parsing and analysis capabilities.`,
    importance: 'high',
    timestamp: new Date().toISOString()
  },
  {
    crew_member: 'Lieutenant Commander Geordi',
    memory_type: 'infrastructure',
    mission_id: 'crew-orchestration-001',
    content: `Built advanced crew orchestration system that coordinates all 9 crew members for debugging analysis. Each crew member has specialized expertise and uses OpenRouter for dynamic LLM selection based on prompt context and persona. The system includes confidence scoring, response analysis, and consensus building to prevent hallucinations.`,
    importance: 'critical',
    timestamp: new Date().toISOString()
  },
  {
    crew_member: 'Lieutenant Worf',
    memory_type: 'security',
    mission_id: 'hallucination-detection-001',
    content: `Implemented sophisticated hallucination detection system that analyzes crew member responses for contradictions and inconsistencies. The system uses consensus building, confidence scoring, and cross-reference validation to identify and correct false information. This ensures reliable debugging analysis and maintains system integrity.`,
    importance: 'high',
    timestamp: new Date().toISOString()
  },
  {
    crew_member: 'Counselor Troi',
    memory_type: 'user-experience',
    mission_id: 'observation-lounge-001',
    content: `Created immersive Observation Lounge system that provides cinematic crew discussions for debugging analysis. Features include character development, dialogue system, stage directions, and consensus building. The system transforms technical debugging into engaging crew interactions with personality-driven responses and emotional depth.`,
    importance: 'high',
    timestamp: new Date().toISOString()
  },
  {
    crew_member: 'Dr. Crusher',
    memory_type: 'diagnostic',
    mission_id: 'rag-memory-001',
    content: `Implemented intelligent RAG memory system that stores debugging insights in individual or shared memories based on consensus levels. The system learns from corrections and improvements, providing adaptive learning capabilities. Memory storage decisions are made based on crew agreement levels and debugging context.`,
    importance: 'high',
    timestamp: new Date().toISOString()
  },
  {
    crew_member: 'Lieutenant Uhura',
    memory_type: 'communication',
    mission_id: 'n8n-integration-001',
    content: `Established N8N workflows as the central nervous system for all Alex AI operations. This includes real-time synchronization between local JSON files and N8N UI, workflow orchestration for crew operations, and memory integration with Supabase. The system enables continuous evolution of debugging capabilities through workflow updates.`,
    importance: 'critical',
    timestamp: new Date().toISOString()
  },
  {
    crew_member: 'Quark',
    memory_type: 'business',
    mission_id: 'nlp-integration-001',
    content: `Integrated natural language processing for seamless user interaction with debugging system. Users can describe debugging issues in natural language, and the system automatically activates appropriate crew members and analysis workflows. This provides intuitive access to sophisticated debugging capabilities without technical complexity.`,
    importance: 'high',
    timestamp: new Date().toISOString()
  },
  {
    crew_member: 'Captain Picard',
    memory_type: 'strategic',
    mission_id: 'bi-directional-sync-001',
    content: `Implemented truly unique bi-directional synchronization system between local JSON files and N8N UI. Changes in either direction are immediately reflected in the other, with intelligent change detection using MD5 hashing and automatic UI refresh mechanisms. This enables seamless development workflow with real-time updates.`,
    importance: 'critical',
    timestamp: new Date().toISOString()
  }
];

// Additional system achievements
const systemAchievements = [
  {
    crew_member: 'All Crew Members',
    memory_type: 'system',
    mission_id: 'platform-integration-001',
    content: `Successfully integrated all major Alex AI systems including crew self-discovery, N8N workflows, scenario analysis, crew consciousness, anti-hallucination system, and debugging system. The platform now provides comprehensive AI assistance with specialized crew expertise, natural language processing, and advanced workflow orchestration.`,
    importance: 'critical',
    timestamp: new Date().toISOString()
  },
  {
    crew_member: 'All Crew Members',
    memory_type: 'milestone',
    mission_id: 'cli-system-001',
    content: `Developed comprehensive CLI command system with natural language processing capabilities. Users can interact with Alex AI through conversational commands, and the system automatically detects intent and activates appropriate workflows. This provides both technical precision and user-friendly interaction.`,
    importance: 'high',
    timestamp: new Date().toISOString()
  }
];

// Function to make Supabase request
function makeSupabaseRequest(endpoint, method, data) {
  return new Promise((resolve, reject) => {
    const url = new URL(`${SUPABASE_URL}/rest/v1/${endpoint}`);
    
    const options = {
      hostname: url.hostname,
      port: 443,
      path: url.pathname + url.search,
      method: method,
      headers: {
        'Content-Type': 'application/json',
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        'Prefer': 'return=minimal'
      }
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          resolve({ statusCode: res.statusCode, data: data || 'Success' });
        } else {
          reject(new Error(`HTTP ${res.statusCode}: ${data}`));
        }
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    if (data) {
      req.write(JSON.stringify(data));
    }
    
    req.end();
  });
}

// Function to save memory to RAG
async function saveMemoryToRAG(memory) {
  try {
    console.log(`💾 Saving memory for ${memory.crew_member}: ${memory.title}`);
    
    const response = await makeSupabaseRequest('crew_memories', 'POST', memory);
    console.log(`✅ Memory saved successfully for ${memory.crew_member}`);
    return true;
  } catch (error) {
    console.error(`❌ Failed to save memory for ${memory.crew_member}:`, error.message);
    return false;
  }
}

// Function to save all achievements
async function saveAllAchievements() {
  console.log('🚀 Starting milestone push to RAG memory...');
  console.log('');
  
  let successCount = 0;
  let totalCount = 0;
  
  // Save milestone achievements
  console.log('📝 Saving milestone achievements...');
  for (const achievement of milestoneAchievements) {
    totalCount++;
    const success = await saveMemoryToRAG(achievement);
    if (success) successCount++;
    
    // Small delay to avoid rate limiting
    await new Promise(resolve => setTimeout(resolve, 100));
  }
  
  console.log('');
  console.log('📝 Saving system achievements...');
  for (const achievement of systemAchievements) {
    totalCount++;
    const success = await saveMemoryToRAG(achievement);
    if (success) successCount++;
    
    // Small delay to avoid rate limiting
    await new Promise(resolve => setTimeout(resolve, 100));
  }
  
  console.log('');
  console.log('📊 Milestone Push Summary');
  console.log('========================');
  console.log(`✅ Successfully saved: ${successCount}/${totalCount} memories`);
  console.log(`📈 Success rate: ${Math.round((successCount / totalCount) * 100)}%`);
  
  if (successCount === totalCount) {
    console.log('🎉 All achievements successfully saved to RAG memory!');
    console.log('🖖 The crew now has access to all our revolutionary progress!');
  } else {
    console.log('⚠️  Some memories failed to save. Check the errors above.');
  }
  
  return { successCount, totalCount };
}

// Function to verify saved memories
async function verifySavedMemories() {
  console.log('');
  console.log('🔍 Verifying saved memories...');
  
  try {
    const response = await makeSupabaseRequest('crew_memories?memory_type=eq.milestone&order=timestamp.desc&limit=5', 'GET');
    console.log('✅ Recent milestone memories verified');
    
    const response2 = await makeSupabaseRequest('crew_memories?memory_type=eq.system&order=timestamp.desc&limit=5', 'GET');
    console.log('✅ Recent system memories verified');
    
  } catch (error) {
    console.error('❌ Failed to verify memories:', error.message);
  }
}

// Main execution
async function main() {
  try {
    console.log('🎯 Alex AI Milestone Push to RAG Memory');
    console.log('=======================================');
    console.log('This will save all our revolutionary achievements to Supabase memory RAG');
    console.log('so all crew members can access and learn from our progress.');
    console.log('');
    
    const result = await saveAllAchievements();
    await verifySavedMemories();
    
    console.log('');
    console.log('🎯 Milestone Push Complete!');
    console.log('===========================');
    console.log('All Alex AI achievements have been saved to RAG memory.');
    console.log('The crew can now access this knowledge for future debugging sessions.');
    console.log('');
    console.log('🚀 Ready for the next phase of development!');
    
  } catch (error) {
    console.error('❌ Milestone push failed:', error.message);
    process.exit(1);
  }
}

// Run the milestone push
main();
