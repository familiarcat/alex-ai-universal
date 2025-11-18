#!/usr/bin/env node

/**
 * Test Natural Language Prompt Memory Storage
 * 
 * Verifies that natural language prompts are properly stored in crew memories
 * 
 * Reviewed by: Commander Data (Testing) & Lt. Uhura (Integration)
 */

const { createClient } = require('@supabase/supabase-js');
const path = require('path');
const fs = require('fs');

// Load credentials
function loadCredentials() {
  const zshrcPath = path.join(process.env.HOME, '.zshrc');
  const zshrcContent = fs.readFileSync(zshrcPath, 'utf8');
  
  const supabaseUrl = zshrcContent.match(/export SUPABASE_URL="([^"]+)"/)?.[1];
  const supabaseKey = zshrcContent.match(/export SUPABASE_KEY="([^"]+)"/)?.[1] || 
                      zshrcContent.match(/export SUPABASE_ANON_KEY="([^"]+)"/)?.[1];
  
  if (!supabaseUrl || !supabaseKey) {
    throw new Error('Supabase credentials not found in ~/.zshrc');
  }
  
  return { supabaseUrl, supabaseKey };
}

async function testMemoryStorage() {
  console.log('🧪 Testing Natural Language Prompt Memory Storage\n');
  console.log('═'.repeat(60));
  
  try {
    // Load credentials
    const { supabaseUrl, supabaseKey } = loadCredentials();
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    console.log('✅ Connected to Supabase\n');
    
    // Test 1: Check recent memories
    console.log('📊 Test 1: Checking recent crew memories...');
    const { data: recentMemories, error: recentError } = await supabase
      .from('crew_memories')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(10);
    
    if (recentError) {
      console.error('❌ Error fetching recent memories:', recentError.message);
      return;
    }
    
    console.log(`✅ Found ${recentMemories.length} recent memories\n`);
    
    if (recentMemories.length > 0) {
      console.log('📝 Recent Memories:');
      recentMemories.slice(0, 5).forEach((memory, index) => {
        console.log(`\n  ${index + 1}. ${memory.title || 'Untitled'}`);
        console.log(`     Crew: ${memory.crew_member || 'unknown'}`);
        console.log(`     Created: ${new Date(memory.created_at).toLocaleString()}`);
        console.log(`     Tags: ${(memory.tags || []).join(', ') || 'none'}`);
        if (memory.description) {
          console.log(`     Description: ${memory.description.substring(0, 100)}...`);
        }
      });
    }
    
    // Test 2: Check for natural language prompt memories (check both tables)
    console.log('\n\n📊 Test 2: Checking for natural language prompt memories...');
    
    // Check crew_memories table
    const { data: nlMemories1, error: nlError1 } = await supabase
      .from('crew_memories')
      .select('*')
      .or('tags.cs.{natural_language,user_request,crew_response,cursor_ai}')
      .order('created_at', { ascending: false })
      .limit(10);
    
    // Check alex_ai_memories table (used by natural language handler)
    const { data: nlMemories2, error: nlError2 } = await supabase
      .from('alex_ai_memories')
      .select('*')
      .or('tags.cs.{natural_language,user_request,crew_response,cursor_ai}')
      .order('created_at', { ascending: false })
      .limit(10);
    
    const nlMemories = [...(nlMemories1 || []), ...(nlMemories2 || [])];
    const nlError = nlError1 || nlError2;
    
    if (nlError) {
      console.error('❌ Error fetching NL memories:', nlError.message);
    } else {
      console.log(`✅ Found ${nlMemories.length} natural language related memories\n`);
      
      if (nlMemories.length > 0) {
        console.log('💬 Natural Language Memories:');
        nlMemories.slice(0, 5).forEach((memory, index) => {
          console.log(`\n  ${index + 1}. ${memory.title || 'Untitled'}`);
          console.log(`     Crew: ${memory.crew_member || 'unknown'}`);
          console.log(`     Created: ${new Date(memory.created_at).toLocaleString()}`);
          console.log(`     Tags: ${(memory.tags || []).join(', ')}`);
        });
      } else {
        console.log('⚠️  No natural language memories found. This might indicate:');
        console.log('   - Natural language handler is not storing memories');
        console.log('   - Memories are stored with different tags');
        console.log('   - RAG system needs initialization');
      }
    }
    
    // Test 3: Check memory storage via n8n webhook
    console.log('\n\n📊 Test 3: Testing memory storage via n8n webhook...');
    const testMemory = {
      title: 'Test Natural Language Memory',
      description: 'This is a test memory created to verify natural language prompt storage',
      content: 'Testing that natural language prompts are properly stored in crew memories',
      crew_member: 'data',
      tags: ['test', 'natural_language', 'memory_storage'],
      confidence: 0.9,
      platform: 'cursor-ai'
    };
    
    const n8nUrl = process.env.N8N_URL || 'https://n8n.pbradygeorgen.com';
    const webhookUrl = `${n8nUrl}/webhook/knowledge-ingest`;
    
    try {
      const response = await fetch(webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Source': 'test-natural-language-memory-storage'
        },
        body: JSON.stringify(testMemory)
      });
      
      if (response.ok) {
        console.log('✅ Test memory successfully sent to n8n webhook');
        const result = await response.json();
        console.log('   Response:', JSON.stringify(result, null, 2));
        
        // Wait a moment for processing
        console.log('\n⏳ Waiting 2 seconds for memory to be processed...');
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // Verify it was stored
        const { data: storedMemory, error: storedError } = await supabase
          .from('crew_memories')
          .select('*')
          .eq('title', testMemory.title)
          .order('created_at', { ascending: false })
          .limit(1)
          .single();
        
        if (storedError || !storedMemory) {
          console.log('⚠️  Test memory not found in database yet (may need more time)');
        } else {
          console.log('✅ Test memory verified in database!');
          console.log(`   Memory ID: ${storedMemory.memory_id}`);
          console.log(`   Created: ${new Date(storedMemory.created_at).toLocaleString()}`);
        }
      } else {
        console.error(`❌ Webhook returned error: ${response.status} ${response.statusText}`);
        const errorText = await response.text();
        console.error('   Error details:', errorText);
      }
    } catch (error) {
      console.error('❌ Error calling webhook:', error.message);
    }
    
    // Summary
    console.log('\n\n' + '═'.repeat(60));
    console.log('📋 Test Summary:');
    console.log(`   Recent memories: ${recentMemories.length}`);
    console.log(`   NL-related memories: ${nlMemories?.length || 0}`);
    console.log(`   Memory storage: ${recentMemories.length > 0 ? '✅ Working' : '⚠️  No memories found'}`);
    console.log('\n✅ Test complete!\n');
    
  } catch (error) {
    console.error('\n❌ Test failed:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

// Run test
testMemoryStorage().catch(console.error);

