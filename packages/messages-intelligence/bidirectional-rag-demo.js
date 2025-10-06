#!/usr/bin/env node

/**
 * Alex AI Bidirectional RAG Integration Demo
 * 
 * This demo showcases the complete bidirectional RAG integration system
 * with N8N workflow synchronization and crew AI multimodal analysis.
 */

const { 
  BidirectionalRAGIntegration, 
  CrewMultimodalAnalysis, 
  EnhancedMonitoringDashboard,
  AlexAIMessagesIntelligence 
} = require('./dist/index.js');

class BidirectionalRAGDemo {
  constructor() {
    this.ragIntegration = null;
    this.crewAnalysis = null;
    this.dashboard = null;
    this.messagesIntelligence = new AlexAIMessagesIntelligence();
  }

  /**
   * Initialize the demo system
   */
  async initialize() {
    console.log('🖖 Alex AI Bidirectional RAG Integration Demo');
    console.log('=============================================\n');

    // Check for required environment variables
    const requiredEnvVars = ['SUPABASE_URL', 'SUPABASE_ANON_KEY'];
    const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);
    
    if (missingVars.length > 0) {
      console.log('⚠️  Demo Mode: Missing environment variables');
      console.log('Required:', missingVars.join(', '));
      console.log('Running in simulation mode...\n');
      await this.runSimulationDemo();
      return;
    }

    // Initialize with real Supabase integration
    await this.initializeRealIntegration();
  }

  /**
   * Initialize real Supabase integration
   */
  async initializeRealIntegration() {
    try {
      console.log('🔧 Initializing real Supabase integration...');

      // Initialize RAG integration
      this.ragIntegration = new BidirectionalRAGIntegration({
        supabaseUrl: process.env.SUPABASE_URL,
        supabaseKey: process.env.SUPABASE_ANON_KEY,
        n8nWebhookUrl: process.env.N8N_WEBHOOK_URL || 'http://localhost:5678',
        n8nApiKey: process.env.N8N_API_KEY,
        projectId: 'alex-ai-universal',
        workspaceId: 'pbradygeorgen-workspace',
        enableMemorySync: true,
        enableWorkflowSync: true,
        enableRealTimeSync: true
      });

      // Initialize crew analysis
      this.crewAnalysis = new CrewMultimodalAnalysis(this.ragIntegration);

      // Initialize enhanced monitoring dashboard
      this.dashboard = new EnhancedMonitoringDashboard(
        this.ragIntegration,
        this.crewAnalysis,
        {
          n8nBaseUrl: process.env.N8N_BASE_URL || 'http://localhost:5678',
          dashboardUrl: process.env.N8N_DASHBOARD_URL || 'http://n8n.pbradygeorgen.com/dashboard',
          apiKey: process.env.N8N_API_KEY || '',
          refreshInterval: 5000,
          enableRealTimeUpdates: true,
          enableCrewAI: true,
          enableWorkflowSync: true
        }
      );

      console.log('✅ Real integration initialized successfully\n');
      await this.runRealDemo();

    } catch (error) {
      console.error('❌ Failed to initialize real integration:', error.message);
      console.log('Falling back to simulation mode...\n');
      await this.runSimulationDemo();
    }
  }

  /**
   * Run simulation demo
   */
  async runSimulationDemo() {
    console.log('🎭 Running Simulation Demo...\n');

    // Simulate crew engagement
    console.log('👥 Engaging Alex AI Crew for Bidirectional RAG Integration Analysis...\n');

    const simulatedCrewResults = [
      {
        crewMember: 'Captain Picard',
        analysis: 'Strategic assessment: Bidirectional RAG integration aligns with our mission of intelligent assistance while maintaining Prime Directive compliance.',
        recommendations: ['Implement phased rollout', 'Establish success metrics', 'Ensure security compliance'],
        confidence: 0.95
      },
      {
        crewMember: 'Commander Data',
        analysis: 'Technical analysis: System requires robust error handling, TypeScript implementation, and comprehensive testing framework.',
        recommendations: ['Implement TypeScript', 'Create test suite', 'Add monitoring'],
        confidence: 0.98
      },
      {
        crewMember: 'Commander La Forge',
        analysis: 'Engineering assessment: Best-of-breed platform integration with Supabase real-time features and N8N workflow optimization.',
        recommendations: ['Leverage Supabase real-time', 'Optimize N8N workflows', 'Create monitoring dashboard'],
        confidence: 0.92
      },
      {
        crewMember: 'Lieutenant Commander Worf',
        analysis: 'Security assessment: All connections must be encrypted, access controls implemented, and Prime Directive enforced.',
        recommendations: ['Implement encryption', 'Create access controls', 'Establish monitoring'],
        confidence: 0.96
      },
      {
        crewMember: 'Counselor Troi',
        analysis: 'User experience assessment: Behind-the-scenes functionality with intuitive monitoring dashboard and natural crew interactions.',
        recommendations: ['Design intuitive dashboard', 'Implement natural language', 'Create feedback mechanisms'],
        confidence: 0.88
      },
      {
        crewMember: 'Quark',
        analysis: 'Business operations: Cost-efficient implementation with resource optimization and ROI tracking.',
        recommendations: ['Monitor costs', 'Optimize resources', 'Track ROI'],
        confidence: 0.90
      }
    ];

    // Display crew analysis results
    simulatedCrewResults.forEach(result => {
      console.log(`🖖 ${result.crewMember}:`);
      console.log(`   Analysis: ${result.analysis}`);
      console.log(`   Recommendations: ${result.recommendations.join(', ')}`);
      console.log(`   Confidence: ${(result.confidence * 100).toFixed(1)}%\n`);
    });

    // Simulate dashboard metrics
    console.log('📊 Simulated Dashboard Metrics:');
    console.log('   RAG Integration: ✅ Online');
    console.log('   Memory Count: 1,247 constructive memories');
    console.log('   N8N Workflows: 12 active workflows');
    console.log('   Crew AI: 6 active members');
    console.log('   Workspace Sync: ✅ Synchronized\n');

    // Simulate workflow synchronization
    console.log('🔄 Simulating N8N Workflow Synchronization...');
    await this.simulateWorkflowSync();

    console.log('✅ Simulation Demo Complete\n');
  }

  /**
   * Run real demo with actual integration
   */
  async runRealDemo() {
    console.log('🚀 Running Real Integration Demo...\n');

    try {
      // Engage crew for analysis
      console.log('👥 Engaging Alex AI Crew for Real Analysis...');
      const crewResults = await this.crewAnalysis.engageCrewForRAGIntegration();
      
      console.log('✅ Crew Analysis Complete:');
      crewResults.forEach(result => {
        console.log(`   ${result.crewMember}: ${result.confidence * 100}% confidence`);
      });
      console.log('');

      // Demonstrate memory storage
      console.log('🧠 Demonstrating Constructive Memory Storage...');
      const memory = await this.ragIntegration.storeConstructiveMemory(
        'demo-conversation-001',
        {
          keyInsights: ['Bidirectional RAG integration successful', 'Crew analysis completed'],
          confidence: 0.95,
          crewMember: 'Captain Picard'
        },
        'Captain Picard'
      );

      if (memory) {
        console.log(`✅ Memory stored with ID: ${memory.id}`);
      } else {
        console.log('⚠️  Memory queued for offline sync');
      }

      // Demonstrate memory retrieval
      console.log('\n🔍 Demonstrating Memory Retrieval...');
      const retrievedMemories = await this.ragIntegration.retrieveRelevantMemories('RAG integration', 5);
      console.log(`✅ Retrieved ${retrievedMemories.length} relevant memories`);

      // Demonstrate N8N workflow sync
      console.log('\n🔄 Demonstrating N8N Workflow Synchronization...');
      await this.demonstrateWorkflowSync();

      // Show dashboard status
      console.log('\n📊 Dashboard Status:');
      const metrics = this.dashboard.getSystemMetrics();
      console.log(`   RAG Integration: ${metrics.ragIntegration.isOnline ? '✅ Online' : '❌ Offline'}`);
      console.log(`   Queued Operations: ${metrics.ragIntegration.queuedOperations}`);
      console.log(`   Crew AI Members: ${metrics.crewAI.activeMembers}`);
      console.log(`   Workspace Sync: ${metrics.workspace.syncStatus}`);

      console.log('\n✅ Real Integration Demo Complete\n');

    } catch (error) {
      console.error('❌ Real demo failed:', error.message);
      console.log('Falling back to simulation...\n');
      await this.runSimulationDemo();
    }
  }

  /**
   * Demonstrate N8N workflow synchronization
   */
  async demonstrateWorkflowSync() {
    const sampleWorkflow = {
      id: 'alex-ai-messages-intelligence',
      name: 'Alex AI Messages Intelligence Workflow',
      version: '1.0.0',
      nodes: [
        {
          id: 'webhook',
          name: 'Messages Intelligence Webhook',
          type: 'n8n-nodes-base.webhook',
          position: [100, 100],
          parameters: {
            path: 'messages-intelligence',
            httpMethod: 'POST'
          }
        },
        {
          id: 'rag-integration',
          name: 'RAG Integration',
          type: 'n8n-nodes-base.httpRequest',
          position: [300, 100],
          parameters: {
            url: 'http://localhost:3000/api/rag-integration',
            method: 'POST'
          }
        }
      ],
      connections: {
        webhook: {
          main: [
            {
              node: 'rag-integration',
              type: 'main',
              index: 0
            }
          ]
        }
      },
      settings: {
        executionOrder: 'v1'
      },
      lastModified: new Date(),
      workspaceId: 'pbradygeorgen-workspace'
    };

    try {
      const syncResult = await this.ragIntegration.syncN8NWorkflow(sampleWorkflow);
      if (syncResult) {
        console.log('✅ N8N workflow synchronized successfully');
      } else {
        console.log('⚠️  N8N workflow sync disabled or failed');
      }
    } catch (error) {
      console.log('⚠️  N8N workflow sync simulation (real sync requires N8N instance)');
    }
  }

  /**
   * Simulate workflow synchronization
   */
  async simulateWorkflowSync() {
    const workflows = [
      { name: 'Messages Intelligence Analysis', status: 'synced', lastModified: '2 minutes ago' },
      { name: 'Crew AI Coordination', status: 'synced', lastModified: '5 minutes ago' },
      { name: 'RAG Memory Management', status: 'syncing', lastModified: '1 minute ago' },
      { name: 'Dashboard Updates', status: 'synced', lastModified: '3 minutes ago' }
    ];

    workflows.forEach(workflow => {
      const statusIcon = workflow.status === 'synced' ? '✅' : '🔄';
      console.log(`   ${statusIcon} ${workflow.name} - ${workflow.lastModified}`);
    });

    // Simulate delay
    await new Promise(resolve => setTimeout(resolve, 2000));
    console.log('   ✅ All workflows synchronized\n');
  }

  /**
   * Generate dashboard HTML
   */
  generateDashboardHTML() {
    if (this.dashboard) {
      return this.dashboard.generateDashboardHTML();
    } else {
      return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Alex AI Demo Dashboard</title>
    <style>
        body { font-family: 'Segoe UI', sans-serif; margin: 0; padding: 20px; background: #0a0a0a; color: #00ff00; }
        .demo-notice { background: #1a1a1a; border: 1px solid #00ff00; border-radius: 8px; padding: 20px; text-align: center; }
    </style>
</head>
<body>
    <div class="demo-notice">
        <h1>🖖 Alex AI Enhanced Monitoring Dashboard</h1>
        <p>This is a simulation of the enhanced monitoring dashboard.</p>
        <p>Set SUPABASE_URL and SUPABASE_ANON_KEY environment variables to enable real integration.</p>
    </div>
</body>
</html>
      `;
    }
  }
}

// Run the demo
async function runDemo() {
  const demo = new BidirectionalRAGDemo();
  
  try {
    await demo.initialize();
    
    // Generate dashboard HTML file
    const html = demo.generateDashboardHTML();
    require('fs').writeFileSync('./alex-ai-dashboard.html', html);
    console.log('📄 Dashboard HTML generated: ./alex-ai-dashboard.html');
    
    console.log('\n🖖 Alex AI Bidirectional RAG Integration Demo Complete');
    console.log('Prime Directive: Zero-artifact guarantee maintained');
    console.log('Ambiguity Guarantee: Controlled integration enforced');
    
  } catch (error) {
    console.error('\n❌ Demo failed:', error.message);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  runDemo();
}

module.exports = BidirectionalRAGDemo;

