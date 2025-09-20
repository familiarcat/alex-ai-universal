#!/usr/bin/env node

/**
 * Enhanced Memory System Demo
 * 
 * Demonstrates the enhanced memory system with crew specialization and universal knowledge
 */

const { execSync } = require('child_process');
const path = require('path');
const os = require('os');

class EnhancedMemorySystemDemo {
  constructor() {
    this.projectPath = process.cwd();
  }

  async run() {
    console.log('🧠 Enhanced Memory System Demo');
    console.log('==============================\n');

    try {
      await this.demonstrateMemorySystem();
      await this.demonstrateCrewSpecialization();
      await this.demonstrateUniversalKnowledge();
      await this.demonstrateN8NWorkflows();
      await this.demonstrateMemoryRouting();
      
      console.log('\n🎉 Enhanced Memory System Demo Complete!');
      console.log('The system successfully demonstrates intelligent memory contribution with crew specialization and universal knowledge management.');
      
    } catch (error) {
      console.error('❌ Demo failed:', error.message);
      process.exit(1);
    }
  }

  async demonstrateMemorySystem() {
    console.log('🔧 Demonstrating Enhanced Memory System...\n');
    
    const demoScript = `
const { EnhancedMemorySystem } = require('@alex-ai/core/dist/memory/enhanced-memory-system');
const { RAGVectorLearningSystem } = require('@alex-ai/core/dist/rag/vector-learning-system');

async function demonstrateMemorySystem() {
  console.log('🧠 Initializing Enhanced Memory System...');
  
  const ragSystem = new RAGVectorLearningSystem('${this.projectPath}');
  const memorySystem = new EnhancedMemorySystem({
    projectPath: '${this.projectPath}',
    enableCrewSpecialization: true,
    enableUniversalKnowledge: true,
    enableN8NWorkflows: true,
    memoryThreshold: 0.7,
    learningRate: 0.1,
    maxMemoriesPerRequest: 10
  }, ragSystem);
  
  await memorySystem.initialize();
  
  const status = memorySystem.getSystemStatus();
  console.log('✅ Memory System Status:', {
    initialized: status.isInitialized,
    crewSpecialization: status.crewSpecialization,
    universalKnowledge: status.universalKnowledge,
    n8nWorkflows: status.n8nWorkflows,
    totalMemories: status.totalMemories,
    health: status.health
  });
  
  return memorySystem;
}

demonstrateMemorySystem().catch(console.error);
    `;
    
    this.runScript(demoScript, 'Memory System Initialization');
  }

  async demonstrateCrewSpecialization() {
    console.log('👥 Demonstrating Crew Specialization...\n');
    
    const demoScript = `
const { EnhancedMemorySystem } = require('@alex-ai/core/dist/memory/enhanced-memory-system');
const { RAGVectorLearningSystem } = require('@alex-ai/core/dist/rag/vector-learning-system');

async function demonstrateCrewSpecialization() {
  const ragSystem = new RAGVectorLearningSystem('${this.projectPath}');
  const memorySystem = new EnhancedMemorySystem({
    projectPath: '${this.projectPath}',
    enableCrewSpecialization: true,
    enableUniversalKnowledge: true,
    enableN8NWorkflows: true,
    memoryThreshold: 0.7,
    learningRate: 0.1,
    maxMemoriesPerRequest: 10
  }, ragSystem);
  
  await memorySystem.initialize();
  
  // Test crew-specific requests
  const crewRequests = [
    {
      request: "Implement secure authentication with JWT tokens and refresh token rotation",
      crewMember: "Lieutenant Worf",
      description: "Security-focused request"
    },
    {
      request: "Create a machine learning model for natural language processing",
      crewMember: "Commander Data",
      description: "AI-focused request"
    },
    {
      request: "Design a microservices architecture with API gateway",
      crewMember: "Commander Riker",
      description: "Architecture-focused request"
    },
    {
      request: "Build a comprehensive testing suite with unit and integration tests",
      crewMember: "Dr. Crusher",
      description: "Testing-focused request"
    }
  ];
  
  console.log('🧠 Processing crew-specific requests...');
  
  for (const test of crewRequests) {
    console.log(\`\\n🔹 Testing: \${test.description}\`);
    console.log(\`   Request: \${test.request}\`);
    console.log(\`   Suggested Crew Member: \${test.crewMember}\`);
    
    try {
      const result = await memorySystem.processRequestAndContributeMemories(
        test.request,
        { test: true, timestamp: new Date().toISOString() },
        test.crewMember
      );
      
      console.log(\`   ✅ Success: \${result.memories.length} memories contributed\`);
      console.log(\`   👥 Routed to: \${result.routingDecision.crewMembers.join(', ')}\`);
      console.log(\`   🎯 Priority: \${result.routingDecision.priority}\`);
      console.log(\`   📊 Confidence: \${(result.routingDecision.confidence * 100).toFixed(1)}%\`);
      
    } catch (error) {
      console.log(\`   ❌ Failed: \${error.message}\`);
    }
  }
  
  // Show crew memory profiles
  console.log('\\n👥 Crew Memory Profiles:');
  const profiles = memorySystem.getCrewMemoryProfiles();
  for (const profile of profiles) {
    console.log(\`   \${profile.crewMember}: \${profile.currentMemoryCount} memories\`);
  }
}

demonstrateCrewSpecialization().catch(console.error);
    `;
    
    this.runScript(demoScript, 'Crew Specialization');
  }

  async demonstrateUniversalKnowledge() {
    console.log('🌐 Demonstrating Universal Knowledge...\n');
    
    const demoScript = `
const { EnhancedMemorySystem } = require('@alex-ai/core/dist/memory/enhanced-memory-system');
const { RAGVectorLearningSystem } = require('@alex-ai/core/dist/rag/vector-learning-system');

async function demonstrateUniversalKnowledge() {
  const ragSystem = new RAGVectorLearningSystem('${this.projectPath}');
  const memorySystem = new EnhancedMemorySystem({
    projectPath: '${this.projectPath}',
    enableCrewSpecialization: true,
    enableUniversalKnowledge: true,
    enableN8NWorkflows: true,
    memoryThreshold: 0.7,
    learningRate: 0.1,
    maxMemoriesPerRequest: 10
  }, ragSystem);
  
  await memorySystem.initialize();
  
  // Test universal knowledge requests
  const universalRequests = [
    "Best practices for code review and quality assurance in software development",
    "Design patterns for scalable microservices architecture",
    "Security principles for web application development",
    "Testing strategies for continuous integration and deployment",
    "API design principles and RESTful service development"
  ];
  
  console.log('🌐 Processing universal knowledge requests...');
  
  for (const request of universalRequests) {
    console.log(\`\\n🔹 Universal Knowledge Request: \${request}\`);
    
    try {
      const result = await memorySystem.processRequestAndContributeMemories(
        request,
        { universalKnowledge: true, timestamp: new Date().toISOString() }
      );
      
      console.log(\`   ✅ Success: \${result.memories.length} memories contributed\`);
      console.log(\`   🌐 Universal Knowledge: \${result.routingDecision.universalKnowledge ? 'Yes' : 'No'}\`);
      console.log(\`   👥 Crew Members: \${result.routingDecision.crewMembers.join(', ')}\`);
      console.log(\`   📊 Confidence: \${(result.routingDecision.confidence * 100).toFixed(1)}%\`);
      
    } catch (error) {
      console.log(\`   ❌ Failed: \${error.message}\`);
    }
  }
  
  // Show universal knowledge statistics
  const status = memorySystem.getSystemStatus();
  console.log(\`\\n📊 Universal Knowledge Statistics:\`);
  console.log(\`   Total Memories: \${status.totalMemories}\`);
  console.log(\`   Universal Memories: \${status.universalMemories}\`);
  console.log(\`   Universal Knowledge Enabled: \${status.universalKnowledge ? 'Yes' : 'No'}\`);
}

demonstrateUniversalKnowledge().catch(console.error);
    `;
    
    this.runScript(demoScript, 'Universal Knowledge');
  }

  async demonstrateN8NWorkflows() {
    console.log('🔄 Demonstrating N8N Workflows...\n');
    
    const demoScript = `
const { EnhancedMemorySystem } = require('@alex-ai/core/dist/memory/enhanced-memory-system');
const { RAGVectorLearningSystem } = require('@alex-ai/core/dist/rag/vector-learning-system');

async function demonstrateN8NWorkflows() {
  const ragSystem = new RAGVectorLearningSystem('${this.projectPath}');
  const memorySystem = new EnhancedMemorySystem({
    projectPath: '${this.projectPath}',
    enableCrewSpecialization: true,
    enableUniversalKnowledge: true,
    enableN8NWorkflows: true,
    memoryThreshold: 0.7,
    learningRate: 0.1,
    maxMemoriesPerRequest: 10
  }, ragSystem);
  
  await memorySystem.initialize();
  
  // Test N8N workflow integration
  const workflowRequests = [
    {
      request: "Implement advanced security features with encryption and authentication",
      crewMember: "Lieutenant Worf",
      description: "Security workflow test"
    },
    {
      request: "Create AI-powered code analysis and suggestion system",
      crewMember: "Commander Data",
      description: "AI workflow test"
    },
    {
      request: "Design comprehensive testing framework with automated quality assurance",
      crewMember: "Dr. Crusher",
      description: "Testing workflow test"
    }
  ];
  
  console.log('🔄 Testing N8N workflow integration...');
  
  for (const test of workflowRequests) {
    console.log(\`\\n🔹 Testing: \${test.description}\`);
    console.log(\`   Request: \${test.request}\`);
    console.log(\`   Crew Member: \${test.crewMember}\`);
    
    try {
      const result = await memorySystem.processRequestAndContributeMemories(
        test.request,
        { workflowTest: true, timestamp: new Date().toISOString() },
        test.crewMember
      );
      
      console.log(\`   ✅ Success: \${result.memories.length} memories contributed\`);
      console.log(\`   🔄 N8N Workflows: \${result.n8nWorkflows.length} triggered\`);
      
      const successfulWorkflows = result.n8nWorkflows.filter(w => w.success);
      console.log(\`   ✅ Successful Workflows: \${successfulWorkflows.length}\`);
      console.log(\`   📊 Success Rate: \${result.n8nWorkflows.length > 0 ? ((successfulWorkflows.length / result.n8nWorkflows.length) * 100).toFixed(1) : 0}%\`);
      
      if (result.n8nWorkflows.length > 0) {
        console.log(\`   🔗 Workflow IDs: \${result.n8nWorkflows.map(w => w.workflowId).join(', ')}\`);
      }
      
    } catch (error) {
      console.log(\`   ❌ Failed: \${error.message}\`);
    }
  }
  
  // Show N8N workflow statuses
  console.log('\\n🔄 N8N Workflow Statuses:');
  const workflowStatuses = memorySystem.getN8NWorkflowStatuses();
  for (const status of workflowStatuses) {
    console.log(\`   \${status.crewMember}: \${status.health} (\${status.totalTriggers} triggers, \${(status.successRate * 100).toFixed(1)}% success)\`);
  }
}

demonstrateN8NWorkflows().catch(console.error);
    `;
    
    this.runScript(demoScript, 'N8N Workflows');
  }

  async demonstrateMemoryRouting() {
    console.log('🧭 Demonstrating Memory Routing...\n');
    
    const demoScript = `
const { EnhancedMemorySystem } = require('@alex-ai/core/dist/memory/enhanced-memory-system');
const { RAGVectorLearningSystem } = require('@alex-ai/core/dist/rag/vector-learning-system');

async function demonstrateMemoryRouting() {
  const ragSystem = new RAGVectorLearningSystem('${this.projectPath}');
  const memorySystem = new EnhancedMemorySystem({
    projectPath: '${this.projectPath}',
    enableCrewSpecialization: true,
    enableUniversalKnowledge: true,
    enableN8NWorkflows: true,
    memoryThreshold: 0.7,
    learningRate: 0.1,
    maxMemoriesPerRequest: 10
  }, ragSystem);
  
  await memorySystem.initialize();
  
  // Test intelligent memory routing
  const routingTests = [
    {
      request: "Fix critical security vulnerability in authentication system",
      expectedCrew: "Lieutenant Worf",
      expectedPriority: "critical",
      description: "Critical security issue"
    },
    {
      request: "Optimize machine learning model performance and accuracy",
      expectedCrew: "Commander Data",
      expectedPriority: "high",
      description: "AI optimization"
    },
    {
      request: "Design scalable microservices architecture with load balancing",
      expectedCrew: "Commander Riker",
      expectedPriority: "high",
      description: "Architecture design"
    },
    {
      request: "Implement comprehensive error handling and logging system",
      expectedCrew: "Dr. Crusher",
      expectedPriority: "medium",
      description: "Error handling"
    },
    {
      request: "Create user-friendly interface with accessibility features",
      expectedCrew: "Counselor Troi",
      expectedPriority: "medium",
      description: "User experience"
    },
    {
      request: "Best practices for API design and documentation standards",
      expectedCrew: undefined,
      expectedPriority: "medium",
      description: "Universal knowledge"
    }
  ];
  
  console.log('🧭 Testing intelligent memory routing...');
  
  for (const test of routingTests) {
    console.log(\`\\n🔹 Testing: \${test.description}\`);
    console.log(\`   Request: \${test.request}\`);
    console.log(\`   Expected Crew: \${test.expectedCrew || 'Universal'}\`);
    console.log(\`   Expected Priority: \${test.expectedPriority}\`);
    
    try {
      const result = await memorySystem.processRequestAndContributeMemories(
        test.request,
        { routingTest: true, timestamp: new Date().toISOString() }
      );
      
      console.log(\`   ✅ Success: \${result.memories.length} memories contributed\`);
      console.log(\`   👥 Routed to: \${result.routingDecision.crewMembers.join(', ')}\`);
      console.log(\`   🎯 Priority: \${result.routingDecision.priority}\`);
      console.log(\`   📊 Confidence: \${(result.routingDecision.confidence * 100).toFixed(1)}%\`);
      console.log(\`   🌐 Universal Knowledge: \${result.routingDecision.universalKnowledge ? 'Yes' : 'No'}\`);
      console.log(\`   💭 Reasoning: \${result.routingDecision.reasoning}\`);
      
      // Check if routing matches expectations
      const routedCorrectly = test.expectedCrew ? 
        result.routingDecision.crewMembers.includes(test.expectedCrew) :
        result.routingDecision.universalKnowledge;
      
      console.log(\`   ✅ Routing Accuracy: \${routedCorrectly ? 'Correct' : 'Needs Improvement'}\`);
      
    } catch (error) {
      console.log(\`   ❌ Failed: \${error.message}\`);
    }
  }
  
  // Show contribution history
  console.log('\\n📜 Recent Contribution History:');
  const history = memorySystem.getContributionHistory();
  const recentHistory = history.slice(-5);
  
  for (let i = 0; i < recentHistory.length; i++) {
    const contribution = recentHistory[i];
    console.log(\`   \${i + 1}. \${contribution.timestamp.toLocaleString()}: \${contribution.memories.length} memories to \${contribution.routingDecision.crewMembers.join(', ')}\`);
  }
}

demonstrateMemoryRouting().catch(console.error);
    `;
    
    this.runScript(demoScript, 'Memory Routing');
  }

  runScript(script, description) {
    try {
      console.log(`🔧 Running ${description}...`);
      execSync(`node -e "${script}"`, { stdio: 'inherit' });
      console.log(`✅ ${description} completed successfully\n`);
    } catch (error) {
      console.log(`⚠️ ${description} completed with warnings: ${error.message}\n`);
    }
  }
}

// Run the demo
new EnhancedMemorySystemDemo().run();



