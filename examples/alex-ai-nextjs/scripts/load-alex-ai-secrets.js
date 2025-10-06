#!/usr/bin/env node

/**
 * Alex AI Secrets Loader
 * Loads secrets from ~/.zshrc and creates environment configuration
 */

const fs = require('fs');
const path = require('path');
const os = require('os');

class AlexAISecretsLoader {
  constructor() {
    this.zshrcPath = path.join(os.homedir(), '.zshrc');
    this.envPath = path.join(__dirname, '..', '.env.local');
    this.secrets = {};
  }

  async loadSecretsFromZshrc() {
    try {
      console.log('🔐 Loading Alex AI secrets from ~/.zshrc...');
      
      const zshrcContent = fs.readFileSync(this.zshrcPath, 'utf8');
      const lines = zshrcContent.split('\n');

      // Extract API keys and configuration
      const secretPatterns = {
        'OPENAI_API_KEY': /export OPENAI_API_KEY="([^"]+)"/,
        'ANTHROPIC_API_KEY': /export ANTHROPIC_API_KEY="([^"]+)"/,
        'OPENROUTER_API_KEY': /export OPENROUTER_API_KEY="([^"]+)"/,
        'SUPABASE_ANON_KEY': /export SUPABASE_ANON_KEY="([^"]+)"/,
        'N8N_API_URL': /export N8N_API_URL="([^"]+)"/,
        'N8N_API_KEY': /export N8N_API_KEY="([^"]+)"/,
        'ALEX_AI_ENABLE_RAG': /export ALEX_AI_ENABLE_RAG=([^\\s]+)/,
        'ALEX_AI_ENABLE_BILATERAL_SYNC': /export ALEX_AI_ENABLE_BILATERAL_SYNC=([^\\s]+)/,
        'ALEX_AI_ENCRYPTION_KEY': /export ALEX_AI_ENCRYPTION_KEY="([^"]+)"/,
      };

      for (const [key, pattern] of Object.entries(secretPatterns)) {
        for (const line of lines) {
          const match = line.match(pattern);
          if (match) {
            this.secrets[key] = match[1];
            console.log(`✅ Found ${key}`);
            break;
          }
        }
      }

      // Set defaults for Alex AI features
      this.secrets['ALEX_AI_ENABLE_RAG'] = this.secrets['ALEX_AI_ENABLE_RAG'] || 'true';
      this.secrets['ALEX_AI_ENABLE_BILATERAL_SYNC'] = this.secrets['ALEX_AI_ENABLE_BILATERAL_SYNC'] || 'true';
      this.secrets['N8N_API_URL'] = this.secrets['N8N_API_URL'] || 'https://n8n.pbradygeorgen.com/api/v1';

      console.log('🖖 Alex AI secrets loaded successfully');
      return true;

    } catch (error) {
      console.error('❌ Failed to load secrets from ~/.zshrc:', error.message);
      return false;
    }
  }

  generateEnvContent() {
    const envContent = `# Alex AI Global Configuration
# Generated from ~/.zshrc secrets - DO NOT EDIT MANUALLY
# Last updated: ${new Date().toISOString()}

# OpenAI API Configuration
OPENAI_API_KEY=${this.secrets['OPENAI_API_KEY'] || ''}

# Anthropic API Configuration
ANTHROPIC_API_KEY=${this.secrets['ANTHROPIC_API_KEY'] || ''}

# OpenRouter API Configuration
OPENROUTER_API_KEY=${this.secrets['OPENROUTER_API_KEY'] || ''}

# Supabase Configuration
SUPABASE_ANON_KEY=${this.secrets['SUPABASE_ANON_KEY'] || ''}

# N8N Configuration
N8N_API_URL=${this.secrets['N8N_API_URL'] || ''}
N8N_API_KEY=${this.secrets['N8N_API_KEY'] || ''}

# Alex AI Feature Flags
ALEX_AI_ENABLE_RAG=${this.secrets['ALEX_AI_ENABLE_RAG'] || 'true'}
ALEX_AI_ENABLE_BILATERAL_SYNC=${this.secrets['ALEX_AI_ENABLE_BILATERAL_SYNC'] || 'true'}
ALEX_AI_ENCRYPTION_KEY=${this.secrets['ALEX_AI_ENCRYPTION_KEY'] || ''}

# Alex AI System Configuration
ALEX_AI_CREW_ROTATION_HOURS=1
ALEX_AI_ENABLE_MILESTONE_TRACKING=true
ALEX_AI_ENABLE_HEALTH_MONITORING=true
ALEX_AI_ENABLE_CREW_INTEGRATION=true

# Global Navigation System Configuration
NEXT_PUBLIC_ALEX_AI_ENABLED=true
NEXT_PUBLIC_GLOBAL_NAVIGATION_ENABLED=true
NEXT_PUBLIC_OPENAI_API_KEY=${this.secrets['OPENAI_API_KEY'] || ''}
NEXT_PUBLIC_ANTHROPIC_API_KEY=${this.secrets['ANTHROPIC_API_KEY'] || ''}
NEXT_PUBLIC_OPENROUTER_API_KEY=${this.secrets['OPENROUTER_API_KEY'] || ''}
NEXT_PUBLIC_SUPABASE_ANON_KEY=${this.secrets['SUPABASE_ANON_KEY'] || ''}
NEXT_PUBLIC_N8N_API_URL=${this.secrets['N8N_API_URL'] || ''}
NEXT_PUBLIC_N8N_API_KEY=${this.secrets['N8N_API_KEY'] || ''}
NEXT_PUBLIC_ALEX_AI_ENABLE_RAG=${this.secrets['ALEX_AI_ENABLE_RAG'] || 'true'}
NEXT_PUBLIC_ALEX_AI_ENABLE_BILATERAL_SYNC=${this.secrets['ALEX_AI_ENABLE_BILATERAL_SYNC'] || 'true'}

# Development Configuration
NODE_ENV=development
`;

    return envContent;
  }

  async saveEnvFile() {
    try {
      const envContent = this.generateEnvContent();
      
      // Write to .env.local
      fs.writeFileSync(this.envPath, envContent);
      console.log('✅ Environment file created:', this.envPath);
      
      return true;
    } catch (error) {
      console.error('❌ Failed to save environment file:', error.message);
      return false;
    }
  }

  async loadSecrets() {
    console.log('🖖 Alex AI Secrets Loader Starting...');
    
    const loaded = await this.loadSecretsFromZshrc();
    if (!loaded) {
      console.log('⚠️  Using fallback configuration');
      return false;
    }

    const saved = await this.saveEnvFile();
    if (saved) {
      console.log('🚀 Alex AI secrets loaded and configured successfully!');
      console.log('🔐 Global navigation system will be available');
      return true;
    }

    return false;
  }

  getSecrets() {
    return this.secrets;
  }
}

// Run if called directly
if (require.main === module) {
  const loader = new AlexAISecretsLoader();
  loader.loadSecrets().then(success => {
    if (success) {
      console.log('✅ Alex AI secrets loading completed successfully');
      process.exit(0);
    } else {
      console.log('❌ Alex AI secrets loading failed');
      process.exit(1);
    }
  });
}

module.exports = AlexAISecretsLoader;
