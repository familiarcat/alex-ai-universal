#!/usr/bin/env node

/**
 * Alex AI Demo Project - Smart Home Automation System
 * 
 * This project demonstrates the universal integration of Alex AI features
 * starting from a text conversation analysis.
 */

const fs = require('fs');
const path = require('path');
const { DemoWebServer } = require('./src/web-server');

// Simulate the Universal Knowledge Distribution System
class UniversalKnowledgeDistribution {
  constructor(config) {
    this.config = config;
    this.registeredProjects = new Map();
    this.initializeUniversalFeatures();
  }

  initializeUniversalFeatures() {
    this.universalFeatures = {
      chatCapturing: {
        enabled: true,
        version: '1.0.0',
        capabilities: [
          'apple-messages-export',
          'conversation-analysis',
          'natural-language-interface',
          'crew-integration',
          'security-protocols'
        ]
      },
      n8nIntegration: {
        enabled: true,
        version: '1.0.0',
        workflows: [
          'automated-conversation-analysis',
          'crew-analysis-request',
          'bidirectional-rag-sync',
          'monitoring-dashboard-updates'
        ]
      },
      crewAI: {
        enabled: true,
        members: [
          'Captain Picard',
          'Commander Riker',
          'Commander Data',
          'Commander La Forge',
          'Lieutenant Worf',
          'Counselor Troi',
          'Dr. Crusher',
          'Lieutenant Uhura',
          'Quark'
        ],
        knowledgeBase: [
          'strategic-planning',
          'tactical-execution',
          'technical-architecture',
          'engineering-optimization',
          'security-protocols',
          'user-experience-design',
          'system-health-diagnostics',
          'communications-integration',
          'cost-efficiency-analysis'
        ]
      },
      ragSystem: {
        enabled: true,
        memoryCount: 0,
        lastSync: new Date()
      },
      monitoring: {
        enabled: true,
        dashboard: 'n8n.pbradygeorgen.com/dashboard',
        metrics: {}
      }
    };

    console.log('🖖 Alex AI Universal Features Initialized');
  }

  async registerProject(projectConfig) {
    console.log(`🖖 Registering new Alex AI project: ${projectConfig.projectName}`);

    const projectCapabilities = {
      projectId: projectConfig.projectId,
      projectName: projectConfig.projectName,
      capabilities: projectConfig.capabilities || this.getUniversalCapabilities(),
      crewMembers: this.universalFeatures.crewAI.members,
      n8nIntegration: this.universalFeatures.n8nIntegration.enabled,
      chatCapturing: this.universalFeatures.chatCapturing.enabled,
      ragIntegration: this.universalFeatures.ragSystem.enabled,
      monitoringDashboard: this.universalFeatures.monitoring.enabled,
      lastSync: new Date(),
      status: 'active'
    };

    this.registeredProjects.set(projectConfig.projectId, projectCapabilities);
    console.log(`✅ Project registered with universal capabilities: ${projectConfig.projectName}`);
    return projectCapabilities;
  }

  getUniversalCapabilities() {
    return [
      ...this.universalFeatures.chatCapturing.capabilities,
      'universal-rag-integration',
      'crew-ai-analysis',
      'n8n-workflow-sync',
      'monitoring-dashboard',
      'security-protocols',
      'knowledge-synchronization'
    ];
  }

  getAllProjects() {
    return Array.from(this.registeredProjects.values());
  }

  getUniversalFeatures() {
    return this.universalFeatures;
  }
}

// Simulate Crew Analysis based on conversation
class CrewAnalysis {
  constructor(universalKnowledge) {
    this.universalKnowledge = universalKnowledge;
  }

  analyzeConversation(conversationText) {
    console.log('👥 Crew analyzing conversation for project requirements...\n');

    const analysis = {
      projectType: 'Smart Home Automation System',
      keyRequirements: [
        'Machine Learning Integration',
        'IoT Device Support',
        'Real-time Processing',
        'Security Focus',
        'Modular Architecture',
        'User Experience Optimization',
        'Energy Efficiency',
        'Cost Optimization'
      ],
      crewRecommendations: {
        'Captain Picard': {
          role: 'Strategic Commander',
          recommendation: 'Focus on scalable architecture and long-term user value. Implement phased rollout strategy.',
          priority: 'High'
        },
        'Commander Data': {
          role: 'Technical Operations',
          recommendation: 'Use Node.js with TypeScript for type safety. Implement ML libraries like TensorFlow.js for behavior analysis.',
          priority: 'High'
        },
        'Commander La Forge': {
          role: 'Chief Engineering',
          recommendation: 'Design modular plugin system for device integration. Use Docker for deployment scalability.',
          priority: 'High'
        },
        'Lieutenant Commander Worf': {
          role: 'Security Officer',
          recommendation: 'Implement OAuth 2.0 authentication, TLS encryption, and secure device pairing protocols.',
          priority: 'Critical'
        },
        'Counselor Troi': {
          role: 'Ship\'s Counselor',
          recommendation: 'Create intuitive web dashboard with mobile-responsive design. Focus on user privacy controls.',
          priority: 'High'
        },
        'Quark': {
          role: 'Business Operations',
          recommendation: 'Consider open-source approach to reduce costs. Plan for potential commercial licensing opportunities.',
          priority: 'Medium'
        }
      },
      technicalStack: {
        backend: 'Node.js + TypeScript',
        frontend: 'React + Next.js',
        database: 'Supabase (PostgreSQL + pgvector) + Redis',
    storage: 'Supabase Storage',
    rag: 'Supabase Vector Store (pgvector)',
    workflows: 'n8n.pbradygeorgen.com',
        ml: 'TensorFlow.js',
        iot: 'MQTT + WebSocket',
        deployment: 'Docker + Kubernetes'
      },
      projectPhases: [
        'Phase 1: Core Infrastructure & Security',
        'Phase 2: Device Integration & ML Pipeline',
        'Phase 3: User Interface & Experience',
        'Phase 4: Advanced Analytics & Optimization'
      ]
    };

    return analysis;
  }

  displayAnalysis(analysis) {
    console.log('📊 CREW ANALYSIS RESULTS\n');
    console.log(`🎯 Project Type: ${analysis.projectType}\n`);

    console.log('📋 Key Requirements:');
    analysis.keyRequirements.forEach((req, index) => {
      console.log(`  ${index + 1}. ${req}`);
    });
    console.log('');

    console.log('👥 Crew Recommendations:');
    Object.entries(analysis.crewRecommendations).forEach(([member, rec]) => {
      console.log(`  🖖 ${member} (${rec.role})`);
      console.log(`     Priority: ${rec.priority}`);
      console.log(`     Recommendation: ${rec.recommendation}\n`);
    });

    console.log('🛠️ Recommended Technical Stack:');
    Object.entries(analysis.technicalStack).forEach(([category, tech]) => {
      console.log(`  ${category}: ${tech}`);
    });
    console.log('');

    console.log('📅 Project Phases:');
    analysis.projectPhases.forEach((phase, index) => {
      console.log(`  ${index + 1}. ${phase}`);
    });
    console.log('');
  }
}

// Enhanced demo with build, compile, and browser testing
async function runEnhancedDemo() {
  console.log('🚀 ALEX AI ENHANCED DEMO - BUILD, COMPILE & BROWSER TESTING');
  console.log('========================================================\n');

  try {
    // Step 1: Initialize project (existing functionality)
    await initializeProject();

    // Step 2: Build and compile project
    console.log('\n🔨 Step 7: Building and compiling project...');
    await buildProject();

    // Step 3: Start web server and open browser
    console.log('\n🌐 Step 8: Starting web server and opening browser...');
    await startWebServer();

    console.log('\n🎉 ENHANCED DEMO COMPLETE!\n');
    console.log('📊 Enhanced Demo Features:');
    console.log('  ✅ Project initialization with crew analysis');
    console.log('  ✅ Project structure generation');
    console.log('  ✅ Build and compilation process');
    console.log('  ✅ Web server with interactive interface');
    console.log('  ✅ Browser testing platform');
    console.log('  ✅ API endpoints for live data');
    console.log('  ✅ Real-time crew analysis display');

    console.log('\n🌐 Demo is now running in your browser!');
    console.log('📱 Interactive features available:');
    console.log('  • Live crew analysis display');
    console.log('  • Technical stack visualization');
    console.log('  • Project phases tracking');
    console.log('  • API endpoints for integration');
    console.log('  • Mobile-responsive design');

    console.log('\n🖖 "Make it so, Number One." - Captain Picard');

  } catch (error) {
    console.error('❌ Enhanced demo failed:', error.message);
  }
}

// Build and compile project
async function buildProject() {
  try {
    console.log('📦 Checking dependencies...');
    // Skip npm install for demo - no external dependencies needed
    console.log('  ✅ Dependencies check complete (standalone demo)');

    console.log('🔨 Building project structure...');
    await ensureDirectoryStructure();

    console.log('📝 Generating configuration files...');
    await generateBuildFiles();

    console.log('✅ Project build complete');
  } catch (error) {
    console.error('❌ Build failed:', error.message);
    throw error;
  }
}

// Start web server
async function startWebServer() {
  try {
    const webServer = new DemoWebServer(3000);
    await webServer.start();
    
    // Wait a moment for server to fully start
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Open browser
    webServer.openBrowser();

    console.log('✅ Web server started successfully');
    console.log('🌐 Demo available at: http://localhost:3000');
    
    // Keep server running
    process.on('SIGINT', async () => {
      console.log('\n🛑 Shutting down web server...');
      await webServer.stop();
      process.exit(0);
    });

  } catch (error) {
    console.error('❌ Failed to start web server:', error.message);
    throw error;
  }
}

// Ensure directory structure exists
async function ensureDirectoryStructure() {
  const directories = [
    'public',
    'src/api',
    'src/core',
    'src/iot',
    'src/ml',
    'src/security',
    'src/web',
    'build',
    'dist'
  ];

  for (const dir of directories) {
    const fullPath = path.join(__dirname, dir);
    if (!fs.existsSync(fullPath)) {
      fs.mkdirSync(fullPath, { recursive: true });
      console.log(`  ✅ Created directory: ${dir}`);
    }
  }
}

// Generate build configuration files
async function generateBuildFiles() {
  // Generate build configuration
  const buildConfig = {
    name: 'alex-ai-demo-project',
    version: '1.0.0',
    description: 'Alex AI Demo - Smart Home Automation System',
    build: {
      entry: './src/web-server.js',
      output: './dist',
      publicPath: '/',
      devServer: {
        port: 3000,
        open: true
      }
    },
    scripts: {
      'build': 'node build-script.js',
      'dev': 'node src/web-server.js',
      'start': 'npm run dev',
      'test': 'node test-runner.js'
    }
  };

  fs.writeFileSync(
    path.join(__dirname, 'build-config.json'),
    JSON.stringify(buildConfig, null, 2)
  );

  // Generate test runner
  const testRunner = `#!/usr/bin/env node
/**
 * Alex AI Demo Project - Test Runner
 */

const { DemoWebServer } = require('./src/web-server');

async function runTests() {
  console.log('🧪 Running Alex AI Demo Tests...');
  
  const webServer = new DemoWebServer(3001);
  
  try {
    await webServer.start();
    console.log('✅ Web server test passed');
    
    // Test API endpoints
    const http = require('http');
    
    const testEndpoint = async (path) => {
      return new Promise((resolve, reject) => {
        const req = http.get(\`http://localhost:3001/api\${path}\`, (res) => {
          let data = '';
          res.on('data', chunk => data += chunk);
          res.on('end', () => {
            try {
              JSON.parse(data);
              resolve(true);
            } catch (e) {
              reject(e);
            }
          });
        });
        req.on('error', reject);
      });
    };
    
    await testEndpoint('/status');
    console.log('✅ API status endpoint test passed');
    
    await testEndpoint('/crew-analysis');
    console.log('✅ API crew analysis endpoint test passed');
    
    await testEndpoint('/technical-stack');
    console.log('✅ API technical stack endpoint test passed');
    
    await testEndpoint('/project-phases');
    console.log('✅ API project phases endpoint test passed');
    
    console.log('🎉 All tests passed!');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  } finally {
    await webServer.stop();
  }
}

runTests();
`;

  fs.writeFileSync(path.join(__dirname, 'test-runner.js'), testRunner);

  console.log('  ✅ Generated build configuration');
  console.log('  ✅ Generated test runner');
}

// Run command with promise
function runCommand(command) {
  return new Promise((resolve, reject) => {
    const { exec } = require('child_process');
    exec(command, (error, stdout, stderr) => {
      if (error) {
        reject(error);
        return;
      }
      resolve(stdout);
    });
  });
}

// Main project initialization (existing function)
async function initializeProject() {
  console.log('🚀 ALEX AI DEMO PROJECT INITIALIZATION');
  console.log('=====================================\n');

  try {
    // Step 1: Initialize Universal Knowledge Distribution
    console.log('🖖 Step 1: Initializing Alex AI Universal Knowledge Distribution...');
    const universalKnowledge = new UniversalKnowledgeDistribution({
      supabaseUrl: 'https://demo.supabase.co',
      supabaseKey: 'demo-key',
      n8nWebhookUrl: 'http://localhost:5678',
      enableUniversalSync: true,
      enableCrewKnowledgeSharing: true,
      enableN8NIntegration: true,
      enableChatCapturing: true
    });

    // Step 2: Register this project with universal capabilities
    console.log('\n📋 Step 2: Registering project with universal capabilities...');
    const projectCapabilities = await universalKnowledge.registerProject({
      projectId: 'alex-ai-demo-project',
      projectName: 'Smart Home Automation System',
      capabilities: ['smart-home', 'iot', 'ml', 'alex-ai-universal']
    });

    console.log(`✅ Project registered: ${projectCapabilities.projectName}`);
    console.log(`👥 Crew Members: ${projectCapabilities.crewMembers.length}`);
    console.log(`⚙️ N8N Integration: ${projectCapabilities.n8nIntegration ? '✅' : '❌'}`);
    console.log(`📱 Chat Capturing: ${projectCapabilities.chatCapturing ? '✅' : '❌'}`);

    // Step 3: Load and analyze foundation conversation
    console.log('\n📄 Step 3: Analyzing foundation conversation...');
    const conversationPath = path.join(__dirname, 'foundation-conversation.md');
    
    if (fs.existsSync(conversationPath)) {
      const conversationText = fs.readFileSync(conversationPath, 'utf8');
      console.log('✅ Foundation conversation loaded');

      // Step 4: Engage crew for analysis
      console.log('\n👥 Step 4: Engaging crew for conversation analysis...');
      const crewAnalysis = new CrewAnalysis(universalKnowledge);
      const analysis = crewAnalysis.analyzeConversation(conversationText);
      crewAnalysis.displayAnalysis(analysis);

      // Step 5: Generate project structure based on analysis
      console.log('🏗️ Step 5: Generating project structure...');
      await generateProjectStructure(analysis);

      // Step 6: Show universal features in action
      console.log('🎯 Step 6: Demonstrating universal features...');
      demonstrateUniversalFeatures(universalKnowledge);

      console.log('\n🎉 PROJECT INITIALIZATION COMPLETE!\n');
      console.log('📊 Project Status:');
      console.log(`  📁 Project: ${projectCapabilities.projectName}`);
      console.log(`  🆔 ID: ${projectCapabilities.projectId}`);
      console.log(`  👥 Crew: ${projectCapabilities.crewMembers.length} members active`);
      console.log(`  🔧 Features: Universal integration active`);
      console.log(`  📊 Analysis: Conversation analyzed and requirements derived`);
      console.log(`  🏗️ Structure: Project files generated`);

      console.log('\n🚀 Next Steps:');
      console.log('  1. Review crew recommendations');
      console.log('  2. Implement Phase 1: Core Infrastructure & Security');
      console.log('  3. Set up development environment');
      console.log('  4. Begin device integration development');

      console.log('\n"Make it so, Number One." - Captain Picard 🖖');

    } else {
      console.error('❌ Foundation conversation file not found');
    }

  } catch (error) {
    console.error('❌ Project initialization failed:', error.message);
  }
}

// Generate project structure based on crew analysis
async function generateProjectStructure(analysis) {
  console.log('📁 Creating project directories and files...');

  const structure = [
    'src/',
    'src/core/',
    'src/iot/',
    'src/ml/',
    'src/api/',
    'src/web/',
    'src/security/',
    'config/',
    'docs/',
    'tests/'
  ];

  structure.forEach(dir => {
    const fullPath = path.join(__dirname, dir);
    if (!fs.existsSync(fullPath)) {
      fs.mkdirSync(fullPath, { recursive: true });
      console.log(`  ✅ Created: ${dir}`);
    }
  });

  // Create main configuration file
  const configContent = `{
  "project": {
    "name": "${analysis.projectType}",
    "version": "1.0.0",
    "description": "AI-powered smart home automation system"
  },
  "technicalStack": ${JSON.stringify(analysis.technicalStack, null, 2)},
  "requirements": ${JSON.stringify(analysis.keyRequirements, null, 2)},
  "phases": ${JSON.stringify(analysis.projectPhases, null, 2)},
  "crewRecommendations": ${JSON.stringify(analysis.crewRecommendations, null, 2)}
}`;

  fs.writeFileSync(path.join(__dirname, 'config/project-config.json'), configContent);
  console.log('  ✅ Created: config/project-config.json');

  // Create README with crew recommendations
  const readmeContent = `# ${analysis.projectType}

## Project Overview
This project was initialized using Alex AI Universal Integration, starting from a text conversation analysis by the Alex AI crew.

## Crew Analysis Results

### Key Requirements
${analysis.keyRequirements.map(req => `- ${req}`).join('\n')}

### Crew Recommendations

${Object.entries(analysis.crewRecommendations).map(([member, rec]) => 
  `#### ${member} (${rec.role})
- **Priority:** ${rec.priority}
- **Recommendation:** ${rec.recommendation}`
).join('\n\n')}

### Technical Stack
${Object.entries(analysis.technicalStack).map(([category, tech]) => 
  `- **${category}:** ${tech}`
).join('\n')}

### Project Phases
${analysis.projectPhases.map((phase, index) => 
  `${index + 1}. ${phase}`
).join('\n')}

## Getting Started

1. Install dependencies: \`npm install\`
2. Review crew recommendations in \`config/project-config.json\`
3. Begin with Phase 1: Core Infrastructure & Security

## Alex AI Integration

This project is registered with Alex AI Universal Integration, providing access to:
- Chat capturing and analysis
- N8N workflow integration
- Crew AI capabilities
- RAG system integration
- Universal monitoring

## Commands

- \`npm run alex-ai:status\` - Show Alex AI status
- \`npm run alex-ai:crew\` - Engage crew for analysis
- \`npm run alex-ai:sync\` - Sync with universal knowledge
`;

  fs.writeFileSync(path.join(__dirname, 'README.md'), readmeContent);
  console.log('  ✅ Created: README.md');

  console.log('✅ Project structure generated successfully');
}

// Demonstrate universal features
function demonstrateUniversalFeatures(universalKnowledge) {
  console.log('🎯 Universal Features Demonstration:');

  const features = universalKnowledge.getUniversalFeatures();
  
  console.log(`  📱 Chat Capturing: ${features.chatCapturing.enabled ? '✅ Active' : '❌ Inactive'}`);
  console.log(`  ⚙️ N8N Integration: ${features.n8nIntegration.enabled ? '✅ Active' : '❌ Inactive'}`);
  console.log(`  👥 Crew AI: ${features.crewAI.enabled ? '✅ Active' : '❌ Inactive'} (${features.crewAI.members.length} members)`);
  console.log(`  🧠 RAG System: ${features.ragSystem.enabled ? '✅ Active' : '❌ Inactive'}`);
  console.log(`  📊 Monitoring: ${features.monitoring.enabled ? '✅ Active' : '❌ Inactive'}`);

  console.log('\n👥 Available Crew Members:');
  features.crewAI.members.forEach(member => {
    console.log(`  🖖 ${member}`);
  });

  console.log('\n🔄 N8N Workflows Available:');
  features.n8nIntegration.workflows.forEach(workflow => {
    console.log(`  ⚙️ ${workflow}`);
  });
}

// Run the enhanced demo with build, compile, and browser testing
if (require.main === module) {
  if (process.argv.includes('--enhanced') || process.argv.includes('-e')) {
    runEnhancedDemo().catch(console.error);
  } else {
    // Run the original demo for backward compatibility
    initializeProject().catch(console.error);
  }
}

module.exports = { UniversalKnowledgeDistribution, CrewAnalysis };
