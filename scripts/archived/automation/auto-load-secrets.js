#!/usr/bin/env node

/**
 * Auto-Load Secrets from ~/.zshrc
 * 
 * Automatically extracts and loads Alex AI secrets from ~/.zshrc for seamless dependency connection
 */

const fs = require('fs');
const path = require('path');
const os = require('os');

class AutoSecretsLoader {
  constructor() {
    this.zshrcPath = path.join(os.homedir(), '.zshrc');
    this.secrets = {};
  }

  async loadSecrets() {
    console.log('🔐 Auto-loading Alex AI secrets from ~/.zshrc...');
    
    try {
      if (!fs.existsSync(this.zshrcPath)) {
        throw new Error('~/.zshrc file not found');
      }

      const zshrcContent = fs.readFileSync(this.zshrcPath, 'utf8');
      this.extractSecrets(zshrcContent);
      this.setEnvironmentVariables();
      this.displayStatus();
      
      return this.secrets;
      
    } catch (error) {
      console.error('❌ Failed to load secrets:', error.message);
      throw error;
    }
  }

  extractSecrets(content) {
    // Extract all environment variables from ~/.zshrc
    // Handle both quoted and unquoted values
    const envVarRegex = /export\s+([A-Z_]+)=["']?([^"'\n]+)["']?/g;
    let match;
    
    while ((match = envVarRegex.exec(content)) !== null) {
      const [, key, value] = match;
      // Clean up the value (remove trailing quotes and whitespace)
      const cleanValue = value.replace(/^["']|["']$/g, '').trim();
      this.secrets[key] = cleanValue;
    }

    // Also try a more flexible pattern for lines that don't match the first regex
    const flexibleRegex = /export\s+([A-Z0-9_]+)=([^\n]+)/g;
    while ((match = flexibleRegex.exec(content)) !== null) {
      const [, key, value] = match;
      const cleanValue = value.replace(/^["']|["']$/g, '').trim();
      // Only add if not already found
      if (!this.secrets[key]) {
        this.secrets[key] = cleanValue;
      }
    }

    // Map to Alex AI expected variables
    this.mapToAlexAIVariables();
  }

  mapToAlexAIVariables() {
    // Map existing variables to Alex AI expected format
    const mappings = {
      'N8N_API_URL': this.secrets.N8N_API_URL || 'https://n8n.pbradygeorgen.com/api/v1',
      'N8N_API_KEY': this.secrets.N8N_API_KEY,
      'N8N_WEBHOOK_URL': this.secrets.N8N_WEBHOOK_URL || 'https://n8n.pbradygeorgen.com/webhook',
      'SUPABASE_URL': this.secrets.SUPABASE_URL,
      'SUPABASE_ANON_KEY': this.secrets.SUPABASE_ANON_KEY || this.secrets.SUPABASE_KEY,
      'OPENAI_API_KEY': this.secrets.OPENAI_API_KEY,
      'ALEX_AI_ENABLE_RAG': 'true',
      'ALEX_AI_ENABLE_SCRAPING': 'true',
      'ALEX_AI_ENABLE_BILATERAL_SYNC': 'true',
      'ALEX_AI_LEARNING_RATE': '0.1',
      'ALEX_AI_MAX_EMBEDDINGS': '1000',
      'ALEX_AI_ENCRYPTION_KEY': this.secrets.ALEX_AI_ENCRYPTION_KEY || this.generateEncryptionKey()
    };

    // Update secrets with mapped values
    Object.assign(this.secrets, mappings);
  }

  generateEncryptionKey() {
    const crypto = require('crypto');
    return crypto.randomBytes(32).toString('base64');
  }

  setEnvironmentVariables() {
    // Set environment variables for current process
    for (const [key, value] of Object.entries(this.secrets)) {
      if (value && !value.includes('YOUR_') && !value.includes('_HERE')) {
        process.env[key] = value;
      }
    }
  }

  displayStatus() {
    console.log('\n📊 Alex AI System Status:');
    console.log('========================');
    
    const systemStatus = {
      'N8N API': this.secrets.N8N_API_URL && this.secrets.N8N_API_KEY ? '✅ Configured' : '❌ Not configured',
      'Supabase': this.secrets.SUPABASE_URL && this.secrets.SUPABASE_ANON_KEY ? '✅ Configured' : '❌ Not configured',
      'OpenAI': this.secrets.OPENAI_API_KEY ? '✅ Configured' : '❌ Not configured',
      'RAG Learning': this.secrets.ALEX_AI_ENABLE_RAG === 'true' ? '✅ Enabled' : '❌ Disabled',
      'Bilateral Sync': this.secrets.ALEX_AI_ENABLE_BILATERAL_SYNC === 'true' ? '✅ Enabled' : '❌ Disabled',
      'Scraping': this.secrets.ALEX_AI_ENABLE_SCRAPING === 'true' ? '✅ Enabled' : '❌ Disabled'
    };

    for (const [component, status] of Object.entries(systemStatus)) {
      console.log(`   ${component}: ${status}`);
    }

    console.log('\n🔗 Available N8N Webhooks:');
    if (this.secrets.N8N_SUB_AGENT_WEBHOOK) {
      console.log(`   Sub-Agent: ${this.secrets.N8N_SUB_AGENT_WEBHOOK}`);
    }
    if (this.secrets.N8N_COLLABORATION_WEBHOOK) {
      console.log(`   Collaboration: ${this.secrets.N8N_COLLABORATION_WEBHOOK}`);
    }
  }

  async testConnections() {
    console.log('\n🧪 Testing API connections...');
    
    const tests = [
      {
        name: 'N8N API',
        url: this.secrets.N8N_API_URL,
        key: this.secrets.N8N_API_KEY,
        testPath: '/workflows'
      },
      {
        name: 'Supabase',
        url: this.secrets.SUPABASE_URL,
        key: this.secrets.SUPABASE_ANON_KEY,
        testPath: '/rest/v1/'
      }
    ];

    for (const test of tests) {
      if (!test.url || !test.key) {
        console.log(`⏭️  Skipping ${test.name} (not configured)`);
        continue;
      }

      try {
        const response = await fetch(`${test.url}${test.testPath}`, {
          headers: {
            'Authorization': `Bearer ${test.key}`,
            'Content-Type': 'application/json'
          }
        });

        if (response.ok) {
          console.log(`✅ ${test.name} connection successful`);
        } else {
          console.log(`❌ ${test.name} connection failed: ${response.status}`);
        }
      } catch (error) {
        console.log(`❌ ${test.name} connection error: ${error.message}`);
      }
    }
  }

  getSecrets() {
    return this.secrets;
  }
}

// Run the auto secrets loader
async function main() {
  const loader = new AutoSecretsLoader();
  
  try {
    await loader.loadSecrets();
    await loader.testConnections();
    
    console.log('\n🎉 Alex AI secrets auto-loaded successfully!');
    console.log('N8N agents are now ready for memory collection and sharing.');
    
  } catch (error) {
    console.error('\n❌ Failed to auto-load secrets:', error.message);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = AutoSecretsLoader;
