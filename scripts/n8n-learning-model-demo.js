#!/usr/bin/env node

/**
 * N8N Learning Model Demo
 * 
 * Demonstrates how to verify N8N learning model functionality across projects
 */

const { 
  SecureN8NSupabaseBridge, 
  LearningModelVerifier,
  LearningModelCLI 
} = require('../packages/core/dist/index.js');
const path = require('path');

class N8NLearningModelDemo {
  constructor() {
    this.projectPath = process.cwd();
    this.bridge = new SecureN8NSupabaseBridge(this.projectPath);
    this.verifier = new LearningModelVerifier(this.projectPath);
    this.cli = new LearningModelCLI(this.projectPath);
  }

  async run() {
    console.log('🔍 N8N Learning Model Verification Demo');
    console.log('=======================================\n');

    try {
      // Show project information
      await this.showProjectInfo();

      // Verify learning model status
      await this.verifyLearningModelStatus();

      // Test learning model functionality
      await this.testLearningModelFunctionality();

      // Show cross-project learning status
      await this.showCrossProjectLearningStatus();

      // Show security compliance
      await this.showSecurityCompliance();

      // Demonstrate CLI commands
      await this.demonstrateCLICommands();

      console.log('\n✅ N8N Learning Model Demo completed!');
      console.log('🔍 You can now verify learning models in any project!');

    } catch (error) {
      console.error('❌ Demo failed:', error.message);
    }
  }

  async showProjectInfo() {
    console.log('📁 Project Information:');
    console.log(`   Path: ${this.projectPath}`);
    console.log(`   Project Hash: ${this.bridge.projectHash}`);
    console.log(`   Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log('');
  }

  async verifyLearningModelStatus() {
    console.log('🔍 Verifying Learning Model Status...');
    console.log('=====================================\n');

    try {
      const status = await this.bridge.verifyN8NLearningModel();
      
      console.log('N8N Learning Model Status:');
      console.log(`  Connection: ${status.isConnected ? '✅ Connected' : '❌ Disconnected'}`);
      console.log(`  Health: ${this.getHealthEmoji(status.health)} ${status.health}`);
      console.log(`  Last Sync: ${status.lastSync ? status.lastSync.toLocaleString() : 'Never'}`);
      console.log(`  Model Count: ${status.modelCount}`);
      console.log(`  Types: ${status.types.join(', ')}`);
      
      if (status.error) {
        console.log(`  Error: ${status.error}`);
      }

      console.log('');

    } catch (error) {
      console.error('❌ Failed to verify learning model status:', error.message);
    }
  }

  async testLearningModelFunctionality() {
    console.log('🧪 Testing Learning Model Functionality...');
    console.log('==========================================\n');

    try {
      // Test crew personality sync
      console.log('Testing crew personality sync...');
      const crewSyncResult = await this.bridge.syncLearningModel('crew-personality', {
        test: true,
        timestamp: new Date().toISOString(),
        project: 'demo-project'
      });

      if (crewSyncResult.success) {
        console.log('✅ Crew personality sync: SUCCESS');
      } else {
        console.log('❌ Crew personality sync: FAILED -', crewSyncResult.error);
      }

      // Test learning model retrieval
      console.log('Testing learning model retrieval...');
      const retrieveResult = await this.bridge.getLearningModel('crew-personality');

      if (retrieveResult.success) {
        console.log('✅ Learning model retrieval: SUCCESS');
      } else {
        console.log('❌ Learning model retrieval: FAILED -', retrieveResult.error);
      }

      console.log('');

    } catch (error) {
      console.error('❌ Failed to test learning model functionality:', error.message);
    }
  }

  async showCrossProjectLearningStatus() {
    console.log('🌐 Cross-Project Learning Status...');
    console.log('===================================\n');

    try {
      const status = await this.bridge.getCrossProjectLearningStatus();
      
      console.log('Cross-Project Learning:');
      console.log(`  Enabled: ${status.isEnabled ? '✅ Yes' : '❌ No'}`);
      console.log(`  Project Count: ${status.projectCount}`);
      console.log(`  Shared Types: ${status.sharedTypes.join(', ')}`);
      console.log(`  Last Global Sync: ${status.lastGlobalSync ? status.lastGlobalSync.toLocaleString() : 'Never'}`);

      console.log('');

    } catch (error) {
      console.error('❌ Failed to get cross-project learning status:', error.message);
    }
  }

  async showSecurityCompliance() {
    console.log('🛡️ Security Compliance Check...');
    console.log('===============================\n');

    try {
      const compliance = await this.bridge.verifySecurityCompliance();
      
      console.log('Security Compliance:');
      console.log(`  Status: ${compliance.isCompliant ? '✅ Compliant' : '❌ Non-Compliant'}`);
      
      if (compliance.issues.length > 0) {
        console.log('  Issues:');
        compliance.issues.forEach(issue => {
          console.log(`    • ${issue}`);
        });
      }
      
      if (compliance.recommendations.length > 0) {
        console.log('  Recommendations:');
        compliance.recommendations.forEach(rec => {
          console.log(`    • ${rec}`);
        });
      }

      console.log('');

    } catch (error) {
      console.error('❌ Failed to check security compliance:', error.message);
    }
  }

  async demonstrateCLICommands() {
    console.log('💻 CLI Commands Demonstration...');
    console.log('================================\n');

    console.log('Available CLI commands:');
    console.log('  npx alexi learning-model verify-status');
    console.log('  npx alexi learning-model show-details');
    console.log('  npx alexi learning-model test-functionality');
    console.log('  npx alexi learning-model help');
    console.log('');

    console.log('What to expect when "Engage AlexAI" works:');
    console.log('  ✅ N8N connection is healthy');
    console.log('  ✅ Supabase connection is healthy');
    console.log('  ✅ Crew personalities are synced');
    console.log('  ✅ AI service integration is working');
    console.log('  ✅ Cross-project memory is enabled');
    console.log('  ✅ Security compliance is verified');
    console.log('');

    console.log('If any of these fail, Alex AI may not work as expected.');
    console.log('Use the CLI commands above to diagnose and fix issues.');
  }

  getHealthEmoji(health) {
    switch (health) {
      case 'healthy': return '✅';
      case 'degraded': return '⚠️';
      case 'offline': return '❌';
      default: return '❓';
    }
  }
}

// Run the N8N learning model demo
new N8NLearningModelDemo().run();









