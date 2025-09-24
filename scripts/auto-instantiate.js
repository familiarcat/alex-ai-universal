#!/usr/bin/env node
/**
 * Alex AI Auto-Instantiation System
 * Automatically activates Alex AI CLI when "Engage Alex AI" is detected
 */

const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

class AlexAIAutoInstantiation {
  constructor() {
    this.projectPath = process.cwd();
    this.alexAIPath = path.join(__dirname, '..');
    this.workingCLIPath = path.join(this.alexAIPath, 'packages', 'cli', 'dist', 'optimized-cli.js');
    this.credentialManagerPath = path.join(this.alexAIPath, 'scripts', 'credential-manager.js');
  }

  async detectEngagementTriggers() {
    const triggers = [
      'engage alex ai',
      'engage alexai',
      'alex ai engage',
      'alexai engage',
      'activate alex ai',
      'start alex ai',
      'alex ai help',
      'alex ai status'
    ];
    
    return triggers;
  }

  async checkSystemHealth() {
    console.log('🖖 Alex AI Auto-Instantiation Check');
    console.log('===================================');
    
    // Check if working CLI exists
    if (!fs.existsSync(this.workingCLIPath)) {
      console.log('❌ Alex AI CLI not found - please run build process');
      return false;
    }

    // Check if credential manager exists
    if (!fs.existsSync(this.credentialManagerPath)) {
      console.log('❌ Credential manager not found');
      return false;
    }

    console.log('✅ Alex AI system files found');
    return true;
  }

  async validateCredentials() {
    console.log('🔐 Validating credentials...');
    
    try {
      const { execSync } = require('child_process');
      const result = execSync(`node ${this.credentialManagerPath} validate`, { 
        encoding: 'utf8',
        cwd: this.alexAIPath 
      });
      
      console.log('✅ Credential validation complete');
      return true;
    } catch (error) {
      console.log('⚠️  Credential validation failed - some features may not work');
      return false;
    }
  }

  async instantiateAlexAI(command = 'status') {
    console.log('🚀 Instantiating Alex AI...');
    console.log(`   Command: ${command}`);
    console.log(`   Project: ${this.projectPath}`);
    
    try {
      const child = spawn('node', [this.workingCLIPath, command], {
        stdio: 'inherit',
        cwd: this.projectPath,
        env: { ...process.env }
      });

      child.on('close', (code) => {
        if (code === 0) {
          console.log('✅ Alex AI instantiation complete');
        } else {
          console.log(`⚠️  Alex AI exited with code ${code}`);
        }
      });

      return true;
    } catch (error) {
      console.log(`❌ Alex AI instantiation failed: ${error.message}`);
      return false;
    }
  }

  async handleNaturalLanguageRequest(request) {
    console.log('🤖 Processing natural language request...');
    console.log(`   Request: "${request}"`);
    
    const lowerRequest = request.toLowerCase();
    
    // Map natural language to CLI commands
    if (lowerRequest.includes('status') || lowerRequest.includes('health')) {
      return await this.instantiateAlexAI('status');
    } else if (lowerRequest.includes('analyze') || lowerRequest.includes('heal')) {
      return await this.instantiateAlexAI('self-heal');
    } else if (lowerRequest.includes('crew') || lowerRequest.includes('team')) {
      return await this.instantiateAlexAI('crew');
    } else if (lowerRequest.includes('performance')) {
      return await this.instantiateAlexAI('performance');
    } else {
      // Default to status
      return await this.instantiateAlexAI('status');
    }
  }

  async createVSCodeIntegration() {
    const vscodeSettings = {
      "alex-ai.autoInstantiate": true,
      "alex-ai.workingCLIPath": this.workingCLIPath,
      "alex-ai.credentialManagerPath": this.credentialManagerPath,
      "alex-ai.triggers": [
        "engage alex ai",
        "alex ai help",
        "alex ai status"
      ]
    };

    const vscodePath = path.join(this.projectPath, '.vscode', 'settings.json');
    const vscodeDir = path.dirname(vscodePath);
    
    if (!fs.existsSync(vscodeDir)) {
      fs.mkdirSync(vscodeDir, { recursive: true });
    }

    fs.writeFileSync(vscodePath, JSON.stringify(vscodeSettings, null, 2));
    console.log('✅ VSCode integration created');
  }

  async createCursorIntegration() {
    const cursorConfig = {
      "alex-ai": {
        "autoInstantiate": true,
        "workingCLIPath": this.workingCLIPath,
        "credentialManagerPath": this.credentialManagerPath,
        "triggers": [
          "engage alex ai",
          "alex ai help",
          "alex ai status"
        ]
      }
    };

    const cursorPath = path.join(this.projectPath, 'cursor-config.json');
    fs.writeFileSync(cursorPath, JSON.stringify(cursorConfig, null, 2));
    console.log('✅ Cursor AI integration created');
  }

  async setupAutoInstantiation() {
    console.log('🖖 Alex AI Auto-Instantiation Setup');
    console.log('===================================');
    
    // Check system health
    const systemHealthy = await this.checkSystemHealth();
    if (!systemHealthy) {
      return false;
    }

    // Validate credentials
    await this.validateCredentials();

    // Create IDE integrations
    await this.createVSCodeIntegration();
    await this.createCursorIntegration();

    console.log('\n🎉 Auto-instantiation setup complete!');
    console.log('\n💡 Usage:');
    console.log('   - In VS Code/Cursor: Type "Engage Alex AI" in chat');
    console.log('   - CLI: node scripts/auto-instantiate.js <command>');
    console.log('   - Natural language: node scripts/auto-instantiate.js "alex ai status"');
    
    return true;
  }
}

// CLI Interface
const autoInstantiation = new AlexAIAutoInstantiation();
const command = process.argv[2];

if (command && !command.startsWith('-')) {
  // Handle natural language requests
  if (command.includes('alex ai') || command.includes('engage')) {
    autoInstantiation.handleNaturalLanguageRequest(command);
  } else {
    // Handle direct commands
    autoInstantiation.instantiateAlexAI(command);
  }
} else {
  // Setup mode
  autoInstantiation.setupAutoInstantiation();
}
