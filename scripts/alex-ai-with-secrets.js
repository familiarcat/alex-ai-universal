#!/usr/bin/env node

/**
 * Alex AI with Auto-Loading Secrets
 * 
 * This script automatically loads secrets from ~/.zshrc and initializes Alex AI
 * with full N8N integration for memory collection and sharing
 */

const { execSync } = require('child_process');
const path = require('path');
const os = require('os');

class AlexAIWithSecrets {
  constructor() {
    this.secrets = {};
    this.projectPath = process.cwd();
  }

  async initialize() {
    console.log('🚀 Alex AI Universal - Auto-Loading Secrets & Initializing');
    console.log('========================================================\n');

    try {
      // Step 1: Load secrets from ~/.zshrc
      await this.loadSecretsFromZshrc();
      
      // Step 2: Set environment variables
      this.setEnvironmentVariables();
      
      // Step 3: Display system status
      this.displaySystemStatus();
      
      // Step 4: Initialize Alex AI in current project
      await this.initializeAlexAI();
      
      // Step 5: Test N8N integration
      await this.testN8NIntegration();
      
      console.log('\n🎉 Alex AI Universal initialized with full N8N integration!');
      console.log('N8N agents are now ready for memory collection and sharing.');
      
    } catch (error) {
      console.error('\n❌ Failed to initialize Alex AI:', error.message);
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
    
    // Extract environment variables with flexible regex
    const envVarRegex = /export\s+([A-Z0-9_]+)=["']?([^"'\n]+)["']?/g;
    let match;
    
    while ((match = envVarRegex.exec(content)) !== null) {
      const [, key, value] = match;
      const cleanValue = value.replace(/^["']|["']$/g, '').trim();
      this.secrets[key] = cleanValue;
    }

    // Also try a more flexible pattern for lines that don't match the first regex
    const flexibleRegex = /export\s+([A-Z0-9_]+)=([^\n]+)/g;
    while ((match = flexibleRegex.exec(content)) !== null) {
      const [, key, value] = match;
      const cleanValue = value.replace(/^["']|["']$/g, '').trim();
      if (!this.secrets[key]) {
        this.secrets[key] = cleanValue;
      }
    }

    // Map to Alex AI expected variables
    this.mapToAlexAIVariables();
    
    console.log('✅ Secrets loaded successfully');
  }

  mapToAlexAIVariables() {
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

    Object.assign(this.secrets, mappings);
  }

  generateEncryptionKey() {
    const crypto = require('crypto');
    return crypto.randomBytes(32).toString('base64');
  }

  setEnvironmentVariables() {
    for (const [key, value] of Object.entries(this.secrets)) {
      if (value && !value.includes('YOUR_') && !value.includes('_HERE')) {
        process.env[key] = value;
      }
    }
  }

  displaySystemStatus() {
    console.log('\n📊 Alex AI System Status:');
    console.log('========================');
    
    const status = {
      'N8N API': this.secrets.N8N_API_URL && this.secrets.N8N_API_KEY ? '✅ Configured' : '❌ Not configured',
      'Supabase': this.secrets.SUPABASE_URL && this.secrets.SUPABASE_ANON_KEY ? '✅ Configured' : '❌ Not configured',
      'OpenAI': this.secrets.OPENAI_API_KEY ? '✅ Configured' : '❌ Not configured',
      'RAG Learning': this.secrets.ALEX_AI_ENABLE_RAG === 'true' ? '✅ Enabled' : '❌ Disabled',
      'Bilateral Sync': this.secrets.ALEX_AI_ENABLE_BILATERAL_SYNC === 'true' ? '✅ Enabled' : '❌ Disabled',
      'Scraping': this.secrets.ALEX_AI_ENABLE_SCRAPING === 'true' ? '✅ Enabled' : '❌ Disabled'
    };

    for (const [component, statusValue] of Object.entries(status)) {
      console.log(`   ${component}: ${statusValue}`);
    }

    if (this.secrets.N8N_SUB_AGENT_WEBHOOK || this.secrets.N8N_COLLABORATION_WEBHOOK) {
      console.log('\n🔗 Available N8N Webhooks:');
      if (this.secrets.N8N_SUB_AGENT_WEBHOOK) {
        console.log(`   Sub-Agent: ${this.secrets.N8N_SUB_AGENT_WEBHOOK}`);
      }
      if (this.secrets.N8N_COLLABORATION_WEBHOOK) {
        console.log(`   Collaboration: ${this.secrets.N8N_COLLABORATION_WEBHOOK}`);
      }
    }
  }

  async initializeAlexAI() {
    console.log('\n🤖 Initializing Alex AI in current project...');
    
    try {
      // Check if Alex AI is already initialized
      const configPath = path.join(this.projectPath, '.alex-ai-config.json');
      
      if (!require('fs').existsSync(configPath)) {
        console.log('   Creating Alex AI configuration...');
        
        const config = {
          version: "1.0.0",
          projectType: this.detectProjectType(),
          installMethod: "npx",
          ragLearning: {
            enabled: true,
            initialized: true
          },
          crewMembers: {
            enabled: true,
            defaultCrew: "Captain Picard"
          },
          n8nIntegration: {
            enabled: true,
            autoConnect: true
          },
          security: {
            enabled: true,
            fileSystemGuard: true,
            resourceMonitoring: true
          },
          createdAt: new Date().toISOString()
        };
        
        require('fs').writeFileSync(configPath, JSON.stringify(config, null, 2));
        console.log('   ✅ Alex AI configuration created');
      } else {
        console.log('   ✅ Alex AI configuration already exists');
      }
      
    } catch (error) {
      console.log(`   ⚠️  Warning: Could not create configuration: ${error.message}`);
    }
  }

  detectProjectType() {
    if (require('fs').existsSync(path.join(this.projectPath, 'package.json'))) {
      return 'node';
    } else if (require('fs').existsSync(path.join(this.projectPath, 'requirements.txt'))) {
      return 'python';
    } else if (require('fs').existsSync(path.join(this.projectPath, 'Cargo.toml'))) {
      return 'rust';
    } else if (require('fs').existsSync(path.join(this.projectPath, 'go.mod'))) {
      return 'go';
    }
    return 'unknown';
  }

  async testN8NIntegration() {
    console.log('\n🧪 Testing N8N integration...');
    
    try {
      // Test N8N API connection
      if (this.secrets.N8N_API_URL && this.secrets.N8N_API_KEY) {
        const response = await fetch(`${this.secrets.N8N_API_URL}/workflows`, {
          headers: {
            'Authorization': `Bearer ${this.secrets.N8N_API_KEY}`,
            'Content-Type': 'application/json'
          }
        });

        if (response.ok) {
          console.log('   ✅ N8N API connection successful');
        } else {
          console.log(`   ⚠️  N8N API connection failed: ${response.status}`);
        }
      }

      // Test Supabase connection
      if (this.secrets.SUPABASE_URL && this.secrets.SUPABASE_ANON_KEY) {
        const response = await fetch(`${this.secrets.SUPABASE_URL}/rest/v1/`, {
          headers: {
            'apikey': this.secrets.SUPABASE_ANON_KEY,
            'Authorization': `Bearer ${this.secrets.SUPABASE_ANON_KEY}`
          }
        });

        if (response.ok) {
          console.log('   ✅ Supabase connection successful');
        } else {
          console.log(`   ⚠️  Supabase connection failed: ${response.status}`);
        }
      }

    } catch (error) {
      console.log(`   ⚠️  Connection test error: ${error.message}`);
    }
  }
}

// Run the Alex AI initialization
async function main() {
  const alexAI = new AlexAIWithSecrets();
  await alexAI.initialize();
}

if (require.main === module) {
  main();
}

module.exports = AlexAIWithSecrets;
