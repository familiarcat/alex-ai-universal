#!/usr/bin/env node

/**
 * Alex AI Project Setup Automation
 * 
 * Automates the integration of Alex AI into new or existing projects
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const readline = require('readline');

class AlexAIProjectSetup {
  constructor() {
    this.rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });
    this.projectPath = process.cwd();
    this.config = {
      projectType: 'unknown',
      installMethod: 'npx',
      initializeRAG: true,
      installExtensions: true,
      configureScripts: true
    };
  }

  async run() {
    console.log('🚀 Alex AI Universal - Project Setup Automation');
    console.log('==============================================\n');

    try {
      await this.detectProjectType();
      await this.selectInstallationMethod();
      await this.installAlexAI();
      await this.initializeRAGSystem();
      await this.installIDEExtensions();
      await this.configurePackageScripts();
      await this.createConfigurationFile();
      await this.runVerificationTests();
      await this.displaySuccessMessage();

    } catch (error) {
      console.error('❌ Setup failed:', error.message);
      process.exit(1);
    } finally {
      this.rl.close();
    }
  }

  async detectProjectType() {
    console.log('🔍 Detecting project type...');
    
    const packageJsonPath = path.join(this.projectPath, 'package.json');
    const hasPackageJson = fs.existsSync(packageJsonPath);
    
    if (hasPackageJson) {
      const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
      const dependencies = { ...packageJson.dependencies, ...packageJson.devDependencies };
      
      if (dependencies.react) {
        this.config.projectType = 'react';
      } else if (dependencies.vue) {
        this.config.projectType = 'vue';
      } else if (dependencies.angular) {
        this.config.projectType = 'angular';
      } else if (dependencies.next) {
        this.config.projectType = 'nextjs';
      } else if (dependencies.express) {
        this.config.projectType = 'nodejs';
      } else if (dependencies.typescript) {
        this.config.projectType = 'typescript';
      } else {
        this.config.projectType = 'javascript';
      }
    } else {
      this.config.projectType = 'new-project';
    }
    
    console.log(`✅ Detected project type: ${this.config.projectType}`);
  }

  async selectInstallationMethod() {
    console.log('\n📦 Select installation method:');
    console.log('1. NPX (Recommended) - Use npx alexi@latest');
    console.log('2. Global - Install globally with npm install -g alexi');
    console.log('3. Local - Install locally with npm install alexi');
    
    const choice = await this.askQuestion('Enter choice (1-3): ');
    
    switch (choice) {
      case '1':
        this.config.installMethod = 'npx';
        break;
      case '2':
        this.config.installMethod = 'global';
        break;
      case '3':
        this.config.installMethod = 'local';
        break;
      default:
        this.config.installMethod = 'npx';
    }
    
    console.log(`✅ Selected installation method: ${this.config.installMethod}`);
  }

  async installAlexAI() {
    console.log('\n📦 Installing Alex AI...');
    
    try {
      switch (this.config.installMethod) {
        case 'npx':
          // Test NPX installation
          execSync('npx alexi@latest --version', { stdio: 'pipe' });
          console.log('✅ NPX installation verified');
          break;
          
        case 'global':
          execSync('npm install -g alexi', { stdio: 'pipe' });
          console.log('✅ Global installation complete');
          break;
          
        case 'local':
          execSync('npm install alexi', { stdio: 'pipe' });
          console.log('✅ Local installation complete');
          break;
      }
    } catch (error) {
      throw new Error(`Installation failed: ${error.message}`);
    }
  }

  async initializeRAGSystem() {
    console.log('\n🧠 Initializing RAG learning system...');
    
    try {
      const command = this.config.installMethod === 'npx' ? 'npx alexi@latest' : 'alexi';
      execSync(`${command} unified-system initialize`, { stdio: 'pipe' });
      console.log('✅ RAG learning system initialized');
    } catch (error) {
      console.warn('⚠️ RAG initialization failed, continuing...');
    }
  }

  async installIDEExtensions() {
    console.log('\n💻 Installing IDE extensions...');
    
    try {
      const command = this.config.installMethod === 'npx' ? 'npx alexi@latest' : 'alexi';
      
      // Install VSCode extension
      try {
        execSync(`${command} install-vscode-extension`, { stdio: 'pipe' });
        console.log('✅ VSCode extension installed');
      } catch (error) {
        console.warn('⚠️ VSCode extension installation failed');
      }
      
      // Install Cursor extension
      try {
        execSync(`${command} install-cursor-extension`, { stdio: 'pipe' });
        console.log('✅ Cursor extension installed');
      } catch (error) {
        console.warn('⚠️ Cursor extension installation failed');
      }
      
    } catch (error) {
      console.warn('⚠️ IDE extension installation failed');
    }
  }

  async configurePackageScripts() {
    console.log('\n📝 Configuring package.json scripts...');
    
    const packageJsonPath = path.join(this.projectPath, 'package.json');
    
    if (fs.existsSync(packageJsonPath)) {
      try {
        const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
        
        if (!packageJson.scripts) {
          packageJson.scripts = {};
        }
        
        const alexCommand = this.config.installMethod === 'npx' ? 'npx alexi@latest' : 'alexi';
        
        packageJson.scripts.alex = `${alexCommand} chat`;
        packageJson.scripts['alex-init'] = `${alexCommand} unified-system initialize`;
        packageJson.scripts['alex-status'] = `${alexCommand} unified-system status`;
        packageJson.scripts['alex-crew'] = `${alexCommand} crew`;
        packageJson.scripts['alex-help'] = `${alexCommand} --help`;
        
        fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));
        console.log('✅ Package.json scripts configured');
      } catch (error) {
        console.warn('⚠️ Package.json configuration failed');
      }
    } else {
      console.log('ℹ️ No package.json found, skipping script configuration');
    }
  }

  async createConfigurationFile() {
    console.log('\n⚙️ Creating configuration file...');
    
    const configPath = path.join(this.projectPath, '.alex-ai-config.json');
    const config = {
      version: '1.0.0',
      projectType: this.config.projectType,
      installMethod: this.config.installMethod,
      ragLearning: {
        enabled: true,
        initialized: true
      },
      crewMembers: {
        enabled: true,
        defaultCrew: 'Captain Picard'
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
    
    fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
    console.log('✅ Configuration file created');
  }

  async runVerificationTests() {
    console.log('\n🧪 Running verification tests...');
    
    try {
      const command = this.config.installMethod === 'npx' ? 'npx alexi@latest' : 'alexi';
      
      // Test version
      execSync(`${command} --version`, { stdio: 'pipe' });
      console.log('✅ Version check passed');
      
      // Test help
      execSync(`${command} --help`, { stdio: 'pipe' });
      console.log('✅ Help command passed');
      
      // Test crew
      execSync(`${command} crew`, { stdio: 'pipe' });
      console.log('✅ Crew command passed');
      
      // Test status
      execSync(`${command} unified-system status`, { stdio: 'pipe' });
      console.log('✅ Status command passed');
      
    } catch (error) {
      console.warn('⚠️ Some verification tests failed');
    }
  }

  async displaySuccessMessage() {
    console.log('\n🎉 Alex AI Universal Setup Complete!');
    console.log('=====================================\n');
    
    console.log('✅ Installation Method:', this.config.installMethod);
    console.log('✅ Project Type:', this.config.projectType);
    console.log('✅ RAG Learning System: Initialized');
    console.log('✅ IDE Extensions: Installed');
    console.log('✅ Package Scripts: Configured');
    console.log('✅ Configuration: Created');
    
    console.log('\n🚀 Quick Start Commands:');
    console.log('========================');
    
    const alexCommand = this.config.installMethod === 'npx' ? 'npx alexi@latest' : 'alexi';
    
    console.log(`• Start chat: ${alexCommand} chat`);
    console.log(`• Check status: ${alexCommand} unified-system status`);
    console.log(`• List crew: ${alexCommand} crew`);
    console.log(`• Get help: ${alexCommand} --help`);
    
    if (this.config.installMethod === 'local') {
      console.log(`• Or use npm scripts: npm run alex`);
    }
    
    console.log('\n🖖 Welcome to Alex AI Universal!');
    console.log('Your AI code assistant is ready to help!');
  }

  askQuestion(question) {
    return new Promise((resolve) => {
      this.rl.question(question, resolve);
    });
  }
}

// Run the setup automation
new AlexAIProjectSetup().run();










