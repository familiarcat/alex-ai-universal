#!/usr/bin/env node

/**
 * Unified RAG and N8N System Demo
 * 
 * Demonstrates the complete RAG vector learning, N8N bilateral unity, and global scraping system
 */

const { 
  UnifiedRAGN8NSystem,
  ZshrcIntegration 
} = require('../packages/core/dist/index.js');
const path = require('path');

class UnifiedRAGN8NDemo {
  constructor() {
    this.projectPath = process.cwd();
    this.system = new UnifiedRAGN8NSystem({
      projectPath: this.projectPath,
      enableRAG: true,
      enableBilateralSync: true,
      enableScraping: true,
      enableCrossProjectLearning: true,
      learningRate: 0.1,
      maxEmbeddings: 1000,
      syncInterval: 30000
    });
    this.zshrcIntegration = new ZshrcIntegration();
  }

  async run() {
    console.log('🚀 Unified RAG and N8N System Demo');
    console.log('==================================\n');

    try {
      // Show configuration
      await this.showConfiguration();

      // Initialize system
      await this.initializeSystem();

      // Test RAG learning
      await this.testRAGLearning();

      // Test N8N bilateral sync
      await this.testN8NBilateralSync();

      // Test global scraping
      await this.testGlobalScraping();

      // Test unified query processing
      await this.testUnifiedQueryProcessing();

      // Show system status
      await this.showSystemStatus();

      console.log('\n✅ Unified RAG and N8N System Demo completed!');
      console.log('🔍 Alex AI is now ready for production use!');

    } catch (error) {
      console.error('❌ Demo failed:', error.message);
    }
  }

  async showConfiguration() {
    console.log('⚙️ Configuration Status');
    console.log('========================\n');

    try {
      const config = await this.zshrcIntegration.loadConfig();
      const status = this.zshrcIntegration.getConfigStatus(config);
      
      console.log('Configuration Status:');
      console.log(`  N8N: ${status.n8n ? '✅ Configured' : '❌ Not configured'}`);
      console.log(`  Supabase: ${status.supabase ? '✅ Configured' : '❌ Not configured'}`);
      console.log(`  OpenAI: ${status.openai ? '✅ Configured' : '❌ Not configured'}`);
      console.log(`  Alex AI: ${status.alexAi ? '✅ Configured' : '❌ Not configured'}`);
      console.log('');

      console.log('Alex AI Settings:');
      console.log(`  Enable RAG: ${config.alexAiConfig.enableRAG ? '✅ Yes' : '❌ No'}`);
      console.log(`  Enable Scraping: ${config.alexAiConfig.enableScraping ? '✅ Yes' : '❌ No'}`);
      console.log(`  Enable Bilateral Sync: ${config.alexAiConfig.enableBilateralSync ? '✅ Yes' : '❌ No'}`);
      console.log(`  Learning Rate: ${config.alexAiConfig.learningRate}`);
      console.log(`  Max Embeddings: ${config.alexAiConfig.maxEmbeddings}`);
      console.log('');

    } catch (error) {
      console.error('❌ Failed to load configuration:', error.message);
    }
  }

  async initializeSystem() {
    console.log('🚀 Initializing Unified System');
    console.log('==============================\n');

    try {
      await this.system.initialize();
      console.log('✅ Unified system initialized successfully');
      console.log('');

    } catch (error) {
      console.error('❌ Failed to initialize system:', error.message);
      throw error;
    }
  }

  async testRAGLearning() {
    console.log('🧠 Testing RAG Vector Learning');
    console.log('==============================\n');

    try {
      // Test RAG query
      const ragResponse = await this.system.processQuery(
        'What is machine learning?',
        'Commander Data',
        { projectPath: this.projectPath }
      );

      console.log('RAG Learning Test:');
      console.log(`  Query: What is machine learning?`);
      console.log(`  Crew Member: Commander Data`);
      console.log(`  Sources: ${ragResponse.sources.length}`);
      console.log(`  N8N Workflows: ${ragResponse.n8nWorkflows.length}`);
      console.log(`  Scraped Data: ${ragResponse.scrapedData.length}`);
      console.log(`  Learning Suggestions: ${ragResponse.learningSuggestions.length}`);
      console.log('');

    } catch (error) {
      console.error('❌ RAG learning test failed:', error.message);
    }
  }

  async testN8NBilateralSync() {
    console.log('🔄 Testing N8N Bilateral Sync');
    console.log('=============================\n');

    try {
      // Test bilateral sync status
      const status = await this.system.getSystemStatus();
      
      console.log('N8N Bilateral Sync Test:');
      console.log(`  Connected: ${status.bilateralSync.isConnected ? '✅ Yes' : '❌ No'}`);
      console.log(`  Last Sync: ${status.bilateralSync.lastSync ? status.bilateralSync.lastSync.toLocaleString() : 'Never'}`);
      console.log(`  Pending Changes: ${status.bilateralSync.pendingChanges}`);
      console.log(`  Workflows: ${status.n8nConnection.workflowCount}`);
      console.log('');

    } catch (error) {
      console.error('❌ N8N bilateral sync test failed:', error.message);
    }
  }

  async testGlobalScraping() {
    console.log('🕷️ Testing Global Scraping');
    console.log('===========================\n');

    try {
      // Test scraping query
      const scrapingResponse = await this.system.processQuery(
        'Latest security vulnerabilities',
        'Lieutenant Worf',
        { projectPath: this.projectPath }
      );

      console.log('Global Scraping Test:');
      console.log(`  Query: Latest security vulnerabilities`);
      console.log(`  Crew Member: Lieutenant Worf`);
      console.log(`  Sources: ${scrapingResponse.sources.length}`);
      console.log(`  Scraped Data: ${scrapingResponse.scrapedData.length}`);
      console.log('');

    } catch (error) {
      console.error('❌ Global scraping test failed:', error.message);
    }
  }

  async testUnifiedQueryProcessing() {
    console.log('🔍 Testing Unified Query Processing');
    console.log('===================================\n');

    const testQueries = [
      {
        query: 'How do I implement a REST API?',
        crewMember: 'Geordi La Forge',
        description: 'Engineering-focused query'
      },
      {
        query: 'What are the latest AI trends?',
        crewMember: 'Commander Data',
        description: 'AI-focused query'
      },
      {
        query: 'Show me business opportunities',
        crewMember: 'Quark',
        description: 'Business-focused query'
      }
    ];

    for (const test of testQueries) {
      try {
        console.log(`Testing: ${test.description}`);
        console.log(`  Query: ${test.query}`);
        console.log(`  Crew Member: ${test.crewMember}`);
        
        const result = await this.system.processQuery(
          test.query,
          test.crewMember,
          { projectPath: this.projectPath }
        );
        
        console.log(`  ✅ Sources: ${result.sources.length}`);
        console.log(`  ✅ N8N Workflows: ${result.n8nWorkflows.length}`);
        console.log(`  ✅ Scraped Data: ${result.scrapedData.length}`);
        console.log(`  ✅ Learning Suggestions: ${result.learningSuggestions.length}`);
        console.log('');

      } catch (error) {
        console.log(`  ❌ Failed: ${error.message}`);
        console.log('');
      }
    }
  }

  async showSystemStatus() {
    console.log('📊 Final System Status');
    console.log('======================\n');

    try {
      const status = await this.system.getSystemStatus();
      
      const healthEmoji = {
        healthy: '✅',
        degraded: '⚠️',
        offline: '❌'
      };
      
      console.log('Overall Health:');
      console.log(`  Status: ${healthEmoji[status.overallHealth]} ${status.overallHealth.toUpperCase()}`);
      console.log(`  Initialized: ${status.isInitialized ? '✅ Yes' : '❌ No'}`);
      console.log('');

      console.log('RAG Vector Learning System:');
      console.log(`  Connected: ${status.ragSystem.isConnected ? '✅ Yes' : '❌ No'}`);
      console.log(`  Embeddings: ${status.ragSystem.embeddingCount}`);
      console.log(`  Last Learning: ${status.ragSystem.lastLearning ? status.ragSystem.lastLearning.toLocaleString() : 'Never'}`);
      console.log('');

      console.log('N8N Bilateral Unity:');
      console.log(`  Connected: ${status.bilateralSync.isConnected ? '✅ Yes' : '❌ No'}`);
      console.log(`  Last Sync: ${status.bilateralSync.lastSync ? status.bilateralSync.lastSync.toLocaleString() : 'Never'}`);
      console.log(`  Pending Changes: ${status.bilateralSync.pendingChanges}`);
      console.log('');

      console.log('Global Scraping System:');
      console.log(`  Active: ${status.scrapingSystem.isActive ? '✅ Yes' : '❌ No'}`);
      console.log(`  Active Workflows: ${status.scrapingSystem.activeWorkflows}`);
      console.log(`  Last Scraping: ${status.scrapingSystem.lastScraping ? status.scrapingSystem.lastScraping.toLocaleString() : 'Never'}`);
      console.log('');

      console.log('N8N Connection:');
      console.log(`  Connected: ${status.n8nConnection.isConnected ? '✅ Yes' : '❌ No'}`);
      console.log(`  API URL: ${status.n8nConnection.apiUrl}`);
      console.log(`  Workflows: ${status.n8nConnection.workflowCount}`);
      console.log('');

    } catch (error) {
      console.error('❌ Failed to get system status:', error.message);
    }
  }
}

// Run the unified RAG and N8N demo
new UnifiedRAGN8NDemo().run();









<<<<<<< HEAD

=======
>>>>>>> ab4898606e192fe0b56b73b7224a3746d57250d5
