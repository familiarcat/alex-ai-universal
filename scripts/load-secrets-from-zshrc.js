#!/usr/bin/env node

/**
 * Load Secrets from ~/.zshrc Script
 * 
 * Extracts and loads Alex AI secrets from ~/.zshrc for automatic dependency connection
 */

const fs = require('fs');
const path = require('path');
const os = require('os');

class SecretsLoader {
  constructor() {
    this.zshrcPath = path.join(os.homedir(), '.zshrc');
    this.secrets = {};
  }

  async loadSecrets() {
    console.log('🔐 Loading Alex AI secrets from ~/.zshrc...');
    
    try {
      if (!fs.existsSync(this.zshrcPath)) {
        throw new Error('~/.zshrc file not found');
      }

      const zshrcContent = fs.readFileSync(this.zshrcPath, 'utf8');
      this.extractSecrets(zshrcContent);
      this.validateSecrets();
      this.setEnvironmentVariables();
      
      console.log('✅ Alex AI secrets loaded successfully');
      return this.secrets;
      
    } catch (error) {
      console.error('❌ Failed to load secrets:', error.message);
      throw error;
    }
  }

  extractSecrets(content) {
    // Extract environment variables from ~/.zshrc
    const envVarRegex = /export\s+([A-Z_]+)=["']?([^"'\n]+)["']?/g;
    let match;
    
    while ((match = envVarRegex.exec(content)) !== null) {
      const [, key, value] = match;
      
      // Only extract Alex AI related variables
      if (key.includes('N8N') || key.includes('SUPABASE') || key.includes('OPENAI') || key.includes('ALEX_AI')) {
        this.secrets[key] = value;
      }
    }
  }

  validateSecrets() {
    const requiredSecrets = [
      'N8N_API_URL',
      'N8N_API_KEY',
      'SUPABASE_URL',
      'SUPABASE_ANON_KEY',
      'OPENAI_API_KEY'
    ];

    const missingSecrets = [];
    const placeholderSecrets = [];

    for (const secret of requiredSecrets) {
      if (!this.secrets[secret]) {
        missingSecrets.push(secret);
      } else if (this.secrets[secret].includes('YOUR_') || this.secrets[secret].includes('_HERE')) {
        placeholderSecrets.push(secret);
      }
    }

    if (missingSecrets.length > 0) {
      console.warn(`⚠️  Missing secrets: ${missingSecrets.join(', ')}`);
    }

    if (placeholderSecrets.length > 0) {
      console.warn(`⚠️  Placeholder values detected: ${placeholderSecrets.join(', ')}`);
      console.log('   Please update these values in ~/.zshrc with your actual API keys');
    }

    // Check if we have at least some real values
    const realSecrets = Object.entries(this.secrets).filter(([key, value]) => 
      !value.includes('YOUR_') && !value.includes('_HERE') && value.length > 10
    );

    if (realSecrets.length === 0) {
      throw new Error('No valid API keys found in ~/.zshrc');
    }

    console.log(`✅ Found ${realSecrets.length} valid secrets`);
  }

  setEnvironmentVariables() {
    // Set environment variables for current process
    for (const [key, value] of Object.entries(this.secrets)) {
      process.env[key] = value;
    }
  }

  getSecrets() {
    return this.secrets;
  }

  async testConnections() {
    console.log('🧪 Testing API connections...');
    
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
      if (!test.url || !test.key || test.key.includes('YOUR_')) {
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
}

// Run the secrets loader
async function main() {
  const loader = new SecretsLoader();
  
  try {
    await loader.loadSecrets();
    await loader.testConnections();
    
    console.log('\n🎉 Alex AI secrets loaded and connections tested!');
    console.log('You can now use Alex AI with full N8N integration.');
    
  } catch (error) {
    console.error('\n❌ Failed to load secrets:', error.message);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = SecretsLoader;



