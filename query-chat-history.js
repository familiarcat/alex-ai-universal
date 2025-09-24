#!/usr/bin/env node

/**
 * Query Alex AI Chat History from Supabase
 * This script retrieves conversation logs and chat history from the Alex AI memory system
 */

const { createClient } = require('@supabase/supabase-js');
const path = require('path');
const os = require('os');

class ChatHistoryQuery {
  constructor() {
    this.supabase = null;
    this.secrets = {};
  }

  async initialize() {
    console.log('🔍 Alex AI Chat History Query Tool');
    console.log('==================================\n');

    try {
      // Load secrets from ~/.zshrc
      await this.loadSecretsFromZshrc();
      
      // Initialize Supabase client
      this.initializeSupabase();
      
      // Query chat history
      await this.queryChatHistory();
      
    } catch (error) {
      console.error('❌ Failed to query chat history:', error.message);
      process.exit(1);
    }
  }

  async loadSecretsFromZshrc() {
    console.log('🔐 Loading secrets from ~/.zshrc...');
    
    const zshrcPath = path.join(os.homedir(), '.zshrc');
    
    if (!require('fs').existsSync(zshrcPath)) {
      throw new Error('~/.zshrc file not found');
    }

    const content = require('fs').readFileSync(zshrcPath, 'utf8');
    
    // Extract environment variables
    const envVarRegex = /export\s+([A-Z0-9_]+)=["']?([^"'\n]+)["']?/g;
    let match;
    
    while ((match = envVarRegex.exec(content)) !== null) {
      const [, key, value] = match;
      const cleanValue = value.replace(/^["']|["']$/g, '').trim();
      this.secrets[key] = cleanValue;
    }

    console.log('✅ Secrets loaded successfully');
  }

  initializeSupabase() {
    if (!this.secrets.SUPABASE_URL || !this.secrets.SUPABASE_ANON_KEY) {
      throw new Error('Supabase credentials not found in ~/.zshrc');
    }

    this.supabase = createClient(
      this.secrets.SUPABASE_URL,
      this.secrets.SUPABASE_ANON_KEY
    );

    console.log('✅ Supabase client initialized');
  }

  async queryChatHistory() {
    console.log('\n📚 Querying Alex AI Chat History...');
    console.log('====================================');

    try {
      // Query for chat-related memories
      const { data: chatMemories, error: chatError } = await this.supabase
        .from('alex_ai_memories')
        .select('*')
        .or('title.ilike.%chat%,description.ilike.%chat%,category.eq.chat')
        .order('created_at', { ascending: false })
        .limit(20);

      if (chatError) {
        console.log('⚠️  Chat memories query failed:', chatError.message);
      } else {
        console.log(`\n💬 Found ${chatMemories?.length || 0} chat-related memories:`);
        if (chatMemories && chatMemories.length > 0) {
          chatMemories.forEach((memory, index) => {
            console.log(`\n${index + 1}. ${memory.title}`);
            console.log(`   Description: ${memory.description}`);
            console.log(`   Category: ${memory.category}`);
            console.log(`   Created: ${new Date(memory.created_at).toLocaleString()}`);
            console.log(`   Status: ${memory.status}`);
            if (memory.content && typeof memory.content === 'object') {
              console.log(`   Content Preview: ${JSON.stringify(memory.content).substring(0, 100)}...`);
            }
          });
        }
      }

      // Query for conversation logs
      const { data: conversationLogs, error: conversationError } = await this.supabase
        .from('alex_ai_memories')
        .select('*')
        .or('title.ilike.%conversation%,description.ilike.%conversation%,tags.cs.{conversation,chat}')
        .order('created_at', { ascending: false })
        .limit(20);

      if (conversationError) {
        console.log('⚠️  Conversation logs query failed:', conversationError.message);
      } else {
        console.log(`\n🗣️  Found ${conversationLogs?.length || 0} conversation logs:`);
        if (conversationLogs && conversationLogs.length > 0) {
          conversationLogs.forEach((log, index) => {
            console.log(`\n${index + 1}. ${log.title}`);
            console.log(`   Description: ${log.description}`);
            console.log(`   Tags: ${log.tags?.join(', ') || 'None'}`);
            console.log(`   Created: ${new Date(log.created_at).toLocaleString()}`);
          });
        }
      }

      // Query for recent memories (last 24 hours)
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      
      const { data: recentMemories, error: recentError } = await this.supabase
        .from('alex_ai_memories')
        .select('*')
        .gte('created_at', yesterday.toISOString())
        .order('created_at', { ascending: false })
        .limit(10);

      if (recentError) {
        console.log('⚠️  Recent memories query failed:', recentError.message);
      } else {
        console.log(`\n⏰ Recent memories (last 24 hours): ${recentMemories?.length || 0}`);
        if (recentMemories && recentMemories.length > 0) {
          recentMemories.forEach((memory, index) => {
            console.log(`\n${index + 1}. ${memory.title}`);
            console.log(`   Created: ${new Date(memory.created_at).toLocaleString()}`);
            console.log(`   Category: ${memory.category}`);
          });
        }
      }

      // Query for crew memories
      const { data: crewMemories, error: crewError } = await this.supabase
        .from('alex_ai_memories')
        .select('*')
        .or('title.ilike.%crew%,description.ilike.%crew%,category.eq.crew_system')
        .order('created_at', { ascending: false })
        .limit(10);

      if (crewError) {
        console.log('⚠️  Crew memories query failed:', crewError.message);
      } else {
        console.log(`\n👥 Found ${crewMemories?.length || 0} crew-related memories:`);
        if (crewMemories && crewMemories.length > 0) {
          crewMemories.forEach((memory, index) => {
            console.log(`\n${index + 1}. ${memory.title}`);
            console.log(`   Description: ${memory.description}`);
            console.log(`   Created: ${new Date(memory.created_at).toLocaleString()}`);
          });
        }
      }

    } catch (error) {
      console.log('❌ Error querying chat history:', error.message);
    }
  }
}

// Run the chat history query
async function main() {
  const query = new ChatHistoryQuery();
  await query.initialize();
}

if (require.main === module) {
  main();
}

module.exports = ChatHistoryQuery;
