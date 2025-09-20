#!/usr/bin/env node

/**
 * N8N Connection Diagnostic Script
 * 
 * Diagnoses and fixes N8N agent connection issues for memory collection and sharing
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const os = require('os');

class N8NConnectionDiagnostic {
  constructor() {
    this.issues = [];
    this.fixes = [];
    this.projectPath = process.cwd();
  }

  async run() {
    console.log('🔍 Alex AI N8N Connection Diagnostic');
    console.log('====================================\n');

    try {
      await this.checkEnvironmentVariables();
      await this.checkZshrcConfiguration();
      await this.checkN8NApiConnection();
      await this.checkSupabaseConnection();
      await this.checkProjectConfiguration();
      await this.generateFixScript();
      await this.displayResults();

    } catch (error) {
      console.error('❌ Diagnostic failed:', error.message);
      process.exit(1);
    }
  }

  async checkEnvironmentVariables() {
    console.log('🔍 Checking environment variables...');
    
    const requiredVars = [
      'N8N_API_URL',
      'N8N_API_KEY', 
      'SUPABASE_URL',
      'SUPABASE_ANON_KEY',
      'OPENAI_API_KEY'
    ];

    const missingVars = [];
    
    for (const varName of requiredVars) {
      if (!process.env[varName]) {
        missingVars.push(varName);
      }
    }

    if (missingVars.length > 0) {
      this.issues.push({
        type: 'environment',
        severity: 'critical',
        message: `Missing environment variables: ${missingVars.join(', ')}`,
        fix: `Set environment variables in ~/.zshrc or .env file`
      });
    } else {
      console.log('✅ All required environment variables are set');
    }
  }

  async checkZshrcConfiguration() {
    console.log('🔍 Checking ~/.zshrc configuration...');
    
    const zshrcPath = path.join(os.homedir(), '.zshrc');
    
    if (!fs.existsSync(zshrcPath)) {
      this.issues.push({
        type: 'configuration',
        severity: 'critical',
        message: '~/.zshrc file not found',
        fix: 'Create ~/.zshrc file with N8N configuration'
      });
      return;
    }

    const zshrcContent = fs.readFileSync(zshrcPath, 'utf8');
    
    const requiredConfigs = [
      'N8N_API_URL',
      'N8N_API_KEY',
      'SUPABASE_URL',
      'SUPABASE_ANON_KEY',
      'OPENAI_API_KEY'
    ];

    const missingConfigs = [];
    
    for (const config of requiredConfigs) {
      if (!zshrcContent.includes(`export ${config}=`)) {
        missingConfigs.push(config);
      }
    }

    if (missingConfigs.length > 0) {
      this.issues.push({
        type: 'configuration',
        severity: 'critical',
        message: `Missing configurations in ~/.zshrc: ${missingConfigs.join(', ')}`,
        fix: 'Add missing configurations to ~/.zshrc file'
      });
    } else {
      console.log('✅ ~/.zshrc configuration is complete');
    }
  }

  async checkN8NApiConnection() {
    console.log('🔍 Testing N8N API connection...');
    
    const n8nApiUrl = process.env.N8N_API_URL || 'https://n8n.pbradygeorgen.com/api/v1';
    const n8nApiKey = process.env.N8N_API_KEY;
    
    if (!n8nApiKey) {
      this.issues.push({
        type: 'connection',
        severity: 'critical',
        message: 'N8N API key not configured',
        fix: 'Set N8N_API_KEY environment variable'
      });
      return;
    }

    try {
      // Test N8N API connection
      const response = await fetch(`${n8nApiUrl}/workflows`, {
        headers: {
          'Authorization': `Bearer ${n8nApiKey}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        console.log('✅ N8N API connection successful');
      } else {
        this.issues.push({
          type: 'connection',
          severity: 'error',
          message: `N8N API connection failed: ${response.status} ${response.statusText}`,
          fix: 'Check N8N API URL and key configuration'
        });
      }
    } catch (error) {
      this.issues.push({
        type: 'connection',
        severity: 'error',
        message: `N8N API connection error: ${error.message}`,
        fix: 'Check network connectivity and N8N server status'
      });
    }
  }

  async checkSupabaseConnection() {
    console.log('🔍 Testing Supabase connection...');
    
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_ANON_KEY;
    
    if (!supabaseUrl || !supabaseKey) {
      this.issues.push({
        type: 'connection',
        severity: 'critical',
        message: 'Supabase configuration missing',
        fix: 'Set SUPABASE_URL and SUPABASE_ANON_KEY environment variables'
      });
      return;
    }

    try {
      // Test Supabase connection
      const response = await fetch(`${supabaseUrl}/rest/v1/`, {
        headers: {
          'apikey': supabaseKey,
          'Authorization': `Bearer ${supabaseKey}`
        }
      });

      if (response.ok) {
        console.log('✅ Supabase connection successful');
      } else {
        this.issues.push({
          type: 'connection',
          severity: 'error',
          message: `Supabase connection failed: ${response.status} ${response.statusText}`,
          fix: 'Check Supabase URL and key configuration'
        });
      }
    } catch (error) {
      this.issues.push({
        type: 'connection',
        severity: 'error',
        message: `Supabase connection error: ${error.message}`,
        fix: 'Check network connectivity and Supabase server status'
      });
    }
  }

  async checkProjectConfiguration() {
    console.log('🔍 Checking project configuration...');
    
    const configPath = path.join(this.projectPath, '.alex-ai-config.json');
    
    if (!fs.existsSync(configPath)) {
      this.issues.push({
        type: 'configuration',
        severity: 'warning',
        message: 'Alex AI configuration file not found',
        fix: 'Run "npx alexi unified-system initialize" to create configuration'
      });
    } else {
      console.log('✅ Alex AI configuration file found');
    }
  }

  async generateFixScript() {
    console.log('🔧 Generating fix script...');
    
    const fixScript = `#!/bin/bash

# Alex AI N8N Connection Fix Script
# Run this script to fix N8N connection issues

echo "🔧 Fixing Alex AI N8N Connection Issues..."
echo "=========================================="

# Check if ~/.zshrc exists
if [ ! -f ~/.zshrc ]; then
    echo "Creating ~/.zshrc file..."
    touch ~/.zshrc
fi

# Add N8N configuration to ~/.zshrc
echo "Adding N8N configuration to ~/.zshrc..."

# Check if configuration already exists
if ! grep -q "N8N_API_URL" ~/.zshrc; then
    echo "" >> ~/.zshrc
    echo "# Alex AI N8N Configuration" >> ~/.zshrc
    echo "export N8N_API_URL=\"https://n8n.pbradygeorgen.com/api/v1\"" >> ~/.zshrc
    echo "export N8N_API_KEY=\"YOUR_N8N_API_KEY_HERE\"" >> ~/.zshrc
    echo "export N8N_WEBHOOK_URL=\"https://n8n.pbradygeorgen.com/webhook\"" >> ~/.zshrc
    echo "export SUPABASE_URL=\"YOUR_SUPABASE_URL_HERE\"" >> ~/.zshrc
    echo "export SUPABASE_ANON_KEY=\"YOUR_SUPABASE_ANON_KEY_HERE\"" >> ~/.zshrc
    echo "export OPENAI_API_KEY=\"YOUR_OPENAI_API_KEY_HERE\"" >> ~/.zshrc
    echo "export ALEX_AI_ENABLE_RAG=\"true\"" >> ~/.zshrc
    echo "export ALEX_AI_ENABLE_SCRAPING=\"true\"" >> ~/.zshrc
    echo "export ALEX_AI_ENABLE_BILATERAL_SYNC=\"true\"" >> ~/.zshrc
    echo "export ALEX_AI_LEARNING_RATE=\"0.1\"" >> ~/.zshrc
    echo "export ALEX_AI_MAX_EMBEDDINGS=\"1000\"" >> ~/.zshrc
    echo "export ALEX_AI_ENCRYPTION_KEY=\"$(openssl rand -base64 32)\"" >> ~/.zshrc
    echo "✅ Configuration added to ~/.zshrc"
else
    echo "✅ N8N configuration already exists in ~/.zshrc"
fi

# Reload ~/.zshrc
echo "Reloading ~/.zshrc..."
source ~/.zshrc

# Initialize Alex AI in current project
echo "Initializing Alex AI in current project..."
npx alexi unified-system initialize

echo "🎉 Fix script completed!"
echo ""
echo "Next steps:"
echo "1. Edit ~/.zshrc and replace placeholder values with your actual API keys"
echo "2. Run: source ~/.zshrc"
echo "3. Run: npx alexi unified-system status"
echo "4. Test: npx alexi unified-system query 'Test N8N connection'"
`;

    fs.writeFileSync('fix-n8n-connection.sh', fixScript);
    execSync('chmod +x fix-n8n-connection.sh');
    
    console.log('✅ Fix script generated: fix-n8n-connection.sh');
  }

  async displayResults() {
    console.log('\n📊 Diagnostic Results');
    console.log('=====================\n');

    if (this.issues.length === 0) {
      console.log('🎉 No issues found! N8N connection should be working.');
      return;
    }

    console.log(`Found ${this.issues.length} issue(s):\n`);

    this.issues.forEach((issue, index) => {
      const emoji = issue.severity === 'critical' ? '🚨' : issue.severity === 'error' ? '❌' : '⚠️';
      console.log(`${emoji} Issue ${index + 1}: ${issue.message}`);
      console.log(`   Type: ${issue.type}`);
      console.log(`   Severity: ${issue.severity}`);
      console.log(`   Fix: ${issue.fix}\n`);
    });

    console.log('🔧 To fix these issues:');
    console.log('1. Run: ./fix-n8n-connection.sh');
    console.log('2. Edit ~/.zshrc with your actual API keys');
    console.log('3. Run: source ~/.zshrc');
    console.log('4. Run: npx alexi unified-system initialize');
    console.log('5. Test: npx alexi unified-system status');
  }
}

// Run the diagnostic
new N8NConnectionDiagnostic().run();



