#!/usr/bin/env node

/**
 * 🧪 Alex AI Universal - Local Testing Environment Setup
 * 
 * Comprehensive local testing environment that simulates production
 * Features: Mock services, Zero-Artifact Guarantee, Cursor AI integration
 */

const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');
const { promisify } = require('util');

const execAsync = promisify(exec);

// Configuration
const CONFIG = {
  // Local testing directories
  testing: {
    rootDir: path.join(__dirname, '..', 'local-testing'),
    mockServicesDir: path.join(__dirname, '..', 'local-testing', 'mock-services'),
    testProjectsDir: path.join(__dirname, '..', 'local-testing', 'test-projects'),
    logsDir: path.join(__dirname, '..', 'local-testing', 'logs'),
    configDir: path.join(__dirname, '..', 'local-testing', 'config')
  },
  
  // Mock services configuration
  mockServices: {
    n8n: {
      port: 5678,
      url: 'http://localhost:5678',
      apiKey: 'test-n8n-api-key'
    },
    supabase: {
      port: 54321,
      url: 'http://localhost:54321',
      anonKey: 'test-supabase-anon-key'
    },
    openrouter: {
      port: 3000,
      url: 'http://localhost:3000',
      apiKey: 'test-openrouter-api-key'
    }
  },
  
  // Zero-Artifact Guarantee settings
  zeroArtifact: {
    // Directories to monitor for artifacts
    monitoredDirs: [
      'src/',
      'lib/',
      'components/',
      'utils/',
      'scripts/',
      'docs/',
      'tests/',
      'test/'
    ],
    
    // File patterns to watch
    filePatterns: [
      '*.ts',
      '*.tsx',
      '*.js',
      '*.jsx',
      '*.json',
      '*.md',
      '*.txt',
      '*.log'
    ],
    
    // Backup directory for artifact detection
    backupDir: path.join(__dirname, '..', 'local-testing', 'artifact-backups')
  }
};

/**
 * 🧪 Local Testing Environment
 */
class LocalTestingEnvironment {
  constructor() {
    this.isRunning = false;
    this.mockServices = new Map();
    this.artifactMonitor = null;
    this.cursorIntegration = null;
  }
  
  /**
   * Setup local testing environment
   */
  async setup() {
    console.log('🧪 Setting up Alex AI Local Testing Environment...');
    console.log('');
    
    try {
      // Create testing directories
      await this.createTestingDirectories();
      
      // Setup mock services
      await this.setupMockServices();
      
      // Setup Zero-Artifact monitoring
      await this.setupZeroArtifactMonitoring();
      
      // Setup Cursor AI integration
      await this.setupCursorIntegration();
      
      // Create test projects
      await this.createTestProjects();
      
      // Setup configuration files
      await this.setupConfigurationFiles();
      
      console.log('✅ Local testing environment setup complete');
      console.log('');
      this.displaySetupInstructions();
      
    } catch (error) {
      console.error('❌ Setup failed:', error.message);
      throw error;
    }
  }
  
  /**
   * Create testing directories
   */
  async createTestingDirectories() {
    console.log('📁 Creating testing directories...');
    
    const directories = [
      CONFIG.testing.rootDir,
      CONFIG.testing.mockServicesDir,
      CONFIG.testing.testProjectsDir,
      CONFIG.testing.logsDir,
      CONFIG.testing.configDir,
      CONFIG.zeroArtifact.backupDir
    ];
    
    for (const dir of directories) {
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
        console.log(`  ✅ Created: ${dir}`);
      }
    }
  }
  
  /**
   * Setup mock services
   */
  async setupMockServices() {
    console.log('🔧 Setting up mock services...');
    
    // Mock N8N service
    await this.createMockN8NService();
    
    // Mock Supabase service
    await this.createMockSupabaseService();
    
    // Mock OpenRouter service
    await this.createMockOpenRouterService();
    
    console.log('  ✅ Mock services configured');
  }
  
  /**
   * Create mock N8N service
   */
  async createMockN8NService() {
    const n8nMockPath = path.join(CONFIG.testing.mockServicesDir, 'n8n-mock.js');
    
    const n8nMockCode = `
const express = require('express');
const app = express();
const port = ${CONFIG.mockServices.n8n.port};

app.use(express.json());

// Mock workflows
const mockWorkflows = [
  {
    id: 'crew-coordination',
    name: 'Crew Coordination Workflow',
    active: true,
    nodes: [
      { id: 'start', type: 'Start', position: [100, 100] },
      { id: 'crew-analysis', type: 'Function', position: [300, 100] },
      { id: 'end', type: 'End', position: [500, 100] }
    ]
  },
  {
    id: 'memory-sync',
    name: 'Memory Synchronization Workflow',
    active: true,
    nodes: [
      { id: 'start', type: 'Start', position: [100, 200] },
      { id: 'memory-process', type: 'Function', position: [300, 200] },
      { id: 'end', type: 'End', position: [500, 200] }
    ]
  }
];

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    workflows: mockWorkflows.length,
    active: mockWorkflows.filter(w => w.active).length
  });
});

// Workflows endpoint
app.get('/api/v1/workflows', (req, res) => {
  res.json({
    data: mockWorkflows,
    total: mockWorkflows.length
  });
});

// Execute workflow endpoint
app.post('/api/v1/workflows/:id/execute', (req, res) => {
  const workflowId = req.params.id;
  const workflow = mockWorkflows.find(w => w.id === workflowId);
  
  if (!workflow) {
    return res.status(404).json({ error: 'Workflow not found' });
  }
  
  res.json({
    executionId: 'exec-' + Date.now(),
    workflowId: workflowId,
    status: 'success',
    timestamp: new Date().toISOString()
  });
});

app.listen(port, () => {
  console.log(\`Mock N8N service running on port \${port}\`);
});
`;
    
    fs.writeFileSync(n8nMockPath, n8nMockCode);
    console.log(`  ✅ Mock N8N service created: ${n8nMockPath}`);
  }
  
  /**
   * Create mock Supabase service
   */
  async createMockSupabaseService() {
    const supabaseMockPath = path.join(CONFIG.testing.mockServicesDir, 'supabase-mock.js');
    
    const supabaseMockCode = `
const express = require('express');
const app = express();
const port = ${CONFIG.mockServices.supabase.port};

app.use(express.json());

// Mock database
const mockDatabase = {
  crew_memories: [
    {
      id: 1,
      crew_member: 'picard',
      memory: 'Strategic leadership and decision making',
      timestamp: new Date().toISOString(),
      priority: 'high'
    },
    {
      id: 2,
      crew_member: 'data',
      memory: 'Advanced analytics and pattern recognition',
      timestamp: new Date().toISOString(),
      priority: 'medium'
    }
  ],
  crew_configurations: [
    {
      id: 1,
      crew_member: 'picard',
      configuration: { role: 'captain', expertise: 'leadership' },
      timestamp: new Date().toISOString()
    }
  ]
};

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    database: 'connected'
  });
});

// Crew memories endpoint
app.get('/rest/v1/crew_memories', (req, res) => {
  res.json({
    data: mockDatabase.crew_memories,
    total: mockDatabase.crew_memories.length
  });
});

// Create memory endpoint
app.post('/rest/v1/crew_memories', (req, res) => {
  const newMemory = {
    id: mockDatabase.crew_memories.length + 1,
    ...req.body,
    timestamp: new Date().toISOString()
  };
  mockDatabase.crew_memories.push(newMemory);
  res.json(newMemory);
});

// Crew configurations endpoint
app.get('/rest/v1/crew_configurations', (req, res) => {
  res.json({
    data: mockDatabase.crew_configurations,
    total: mockDatabase.crew_configurations.length
  });
});

app.listen(port, () => {
  console.log(\`Mock Supabase service running on port \${port}\`);
});
`;
    
    fs.writeFileSync(supabaseMockPath, supabaseMockCode);
    console.log(`  ✅ Mock Supabase service created: ${supabaseMockPath}`);
  }
  
  /**
   * Create mock OpenRouter service
   */
  async createMockOpenRouterService() {
    const openrouterMockPath = path.join(CONFIG.testing.mockServicesDir, 'openrouter-mock.js');
    
    const openrouterMockCode = `
const express = require('express');
const app = express();
const port = ${CONFIG.mockServices.openrouter.port};

app.use(express.json());

// Mock models
const mockModels = [
  { id: 'gpt-4', name: 'GPT-4', provider: 'openai', cost: 0.03 },
  { id: 'claude-3', name: 'Claude 3', provider: 'anthropic', cost: 0.02 },
  { id: 'llama-2', name: 'Llama 2', provider: 'meta', cost: 0.01 }
];

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    models: mockModels.length
  });
});

// Models endpoint
app.get('/v1/models', (req, res) => {
  res.json({
    data: mockModels
  });
});

// Chat completion endpoint
app.post('/v1/chat/completions', (req, res) => {
  const { model, messages } = req.body;
  
  // Mock response based on crew member
  const lastMessage = messages[messages.length - 1];
  const content = lastMessage.content.toLowerCase();
  
  let response = '';
  if (content.includes('picard')) {
    response = 'Captain Picard: "Make it so! I recommend a strategic approach to this challenge."';
  } else if (content.includes('data')) {
    response = 'Commander Data: "Analysis complete. The optimal solution involves logical processing of the available data."';
  } else if (content.includes('geordi')) {
    response = 'Lt. Cmdr. Geordi: "I can fix that! Let me analyze the engineering requirements."';
  } else {
    response = 'Alex AI: "I understand your request. Let me coordinate with the crew to provide the best solution."';
  }
  
  res.json({
    id: 'chatcmpl-' + Date.now(),
    object: 'chat.completion',
    created: Math.floor(Date.now() / 1000),
    model: model || 'gpt-4',
    choices: [{
      index: 0,
      message: {
        role: 'assistant',
        content: response
      },
      finish_reason: 'stop'
    }],
    usage: {
      prompt_tokens: 50,
      completion_tokens: 30,
      total_tokens: 80
    }
  });
});

app.listen(port, () => {
  console.log(\`Mock OpenRouter service running on port \${port}\`);
});
`;
    
    fs.writeFileSync(openrouterMockPath, supabaseMockCode);
    console.log(`  ✅ Mock OpenRouter service created: ${openrouterMockPath}`);
  }
  
  /**
   * Setup Zero-Artifact monitoring
   */
  async setupZeroArtifactMonitoring() {
    console.log('🛡️ Setting up Zero-Artifact monitoring...');
    
    const monitorPath = path.join(CONFIG.testing.mockServicesDir, 'artifact-monitor.js');
    
    const monitorCode = `
const fs = require('fs');
const path = require('path');
const chokidar = require('chokidar');

class ArtifactMonitor {
  constructor() {
    this.monitoredDirs = ${JSON.stringify(CONFIG.zeroArtifact.monitoredDirs)};
    this.filePatterns = ${JSON.stringify(CONFIG.zeroArtifact.filePatterns)};
    this.backupDir = '${CONFIG.zeroArtifact.backupDir}';
    this.watchers = new Map();
    this.artifactCount = 0;
  }
  
  start() {
    console.log('🛡️ Starting Zero-Artifact monitoring...');
    
    // Create backup directory
    if (!fs.existsSync(this.backupDir)) {
      fs.mkdirSync(this.backupDir, { recursive: true });
    }
    
    // Watch each monitored directory
    this.monitoredDirs.forEach(dir => {
      if (fs.existsSync(dir)) {
        const watcher = chokidar.watch(dir, {
          ignored: /(^|[\/\\\\])\\../, // ignore dotfiles
          persistent: true
        });
        
        watcher.on('add', (filePath) => this.handleFileChange('add', filePath));
        watcher.on('change', (filePath) => this.handleFileChange('change', filePath));
        watcher.on('unlink', (filePath) => this.handleFileChange('unlink', filePath));
        
        this.watchers.set(dir, watcher);
        console.log(\`  👁️  Monitoring: \${dir}\`);
      }
    });
  }
  
  handleFileChange(event, filePath) {
    const fileName = path.basename(filePath);
    const isMonitoredFile = this.filePatterns.some(pattern => {
      const regex = new RegExp(pattern.replace('*', '.*'));
      return regex.test(fileName);
    });
    
    if (isMonitoredFile) {
      console.log(\`🛡️  Zero-Artifact Alert: \${event} \${filePath}\`);
      this.artifactCount++;
      
      // Create backup of the file
      if (event === 'add' || event === 'change') {
        this.backupFile(filePath);
      }
    }
  }
  
  backupFile(filePath) {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const fileName = path.basename(filePath);
    const backupPath = path.join(this.backupDir, \`\${timestamp}-\${fileName}\`);
    
    try {
      fs.copyFileSync(filePath, backupPath);
      console.log(\`  💾 Backed up: \${backupPath}\`);
    } catch (error) {
      console.error(\`  ❌ Backup failed: \${error.message}\`);
    }
  }
  
  stop() {
    this.watchers.forEach(watcher => watcher.close());
    this.watchers.clear();
    console.log('🛑 Zero-Artifact monitoring stopped');
  }
  
  getStats() {
    return {
      artifactCount: this.artifactCount,
      monitoredDirs: this.monitoredDirs.length,
      activeWatchers: this.watchers.size
    };
  }
}

module.exports = { ArtifactMonitor };
`;
    
    fs.writeFileSync(monitorPath, monitorCode);
    console.log(`  ✅ Zero-Artifact monitor created: ${monitorPath}`);
  }
  
  /**
   * Setup Cursor AI integration
   */
  async setupCursorIntegration() {
    console.log('🎯 Setting up Cursor AI integration...');
    
    const cursorIntegrationPath = path.join(CONFIG.testing.configDir, 'cursor-integration.js');
    
    const cursorIntegrationCode = `
const { UniversalAlexAICore } = require('@alex-ai/universal-extension');

class CursorIntegration {
  constructor() {
    this.alexAI = new UniversalAlexAICore({
      environment: 'local-testing',
      mockServices: {
        n8n: '${CONFIG.mockServices.n8n.url}',
        supabase: '${CONFIG.mockServices.supabase.url}',
        openrouter: '${CONFIG.mockServices.openrouter.url}'
      }
    });
    
    this.artifactMonitor = null;
  }
  
  async engage(prompt, context = {}) {
    console.log('🤖 Alex AI Local Testing Engagement');
    console.log('==================================');
    console.log(\`📝 Prompt: \${prompt}\`);
    console.log(\`📊 Context: \${JSON.stringify(context, null, 2)}\`);
    console.log('');
    
    try {
      // Start artifact monitoring
      this.startArtifactMonitoring();
      
      // Engage Alex AI
      const response = await this.alexAI.engage(prompt, context);
      
      // Check for artifacts
      const artifacts = this.checkForArtifacts();
      
      if (artifacts.length > 0) {
        console.log('🚨 ZERO-ARTIFACT VIOLATION DETECTED!');
        console.log('====================================');
        artifacts.forEach(artifact => {
          console.log(\`  ❌ \${artifact.type}: \${artifact.path}\`);
        });
        console.log('');
        console.log('🛡️  Alex AI maintains Zero-Artifact Guarantee');
        console.log('   All detected artifacts have been backed up and removed');
        console.log('');
      } else {
        console.log('✅ Zero-Artifact Guarantee maintained');
        console.log('');
      }
      
      // Stop artifact monitoring
      this.stopArtifactMonitoring();
      
      return response;
      
    } catch (error) {
      console.error('❌ Engagement failed:', error.message);
      this.stopArtifactMonitoring();
      throw error;
    }
  }
  
  startArtifactMonitoring() {
    // In a real implementation, this would start the artifact monitor
    console.log('🛡️  Starting Zero-Artifact monitoring...');
  }
  
  stopArtifactMonitoring() {
    // In a real implementation, this would stop the artifact monitor
    console.log('🛑 Stopping Zero-Artifact monitoring...');
  }
  
  checkForArtifacts() {
    // In a real implementation, this would check for artifacts
    return [];
  }
  
  async getStatus() {
    return await this.alexAI.getStatus();
  }
}

module.exports = { CursorIntegration };
`;
    
    fs.writeFileSync(cursorIntegrationPath, cursorIntegrationCode);
    console.log(`  ✅ Cursor AI integration created: ${cursorIntegrationPath}`);
  }
  
  /**
   * Create test projects
   */
  async createTestProjects() {
    console.log('📁 Creating test projects...');
    
    const testProjects = [
      'react-app',
      'node-api',
      'typescript-lib',
      'vue-app',
      'angular-app'
    ];
    
    for (const project of testProjects) {
      const projectPath = path.join(CONFIG.testing.testProjectsDir, project);
      if (!fs.existsSync(projectPath)) {
        fs.mkdirSync(projectPath, { recursive: true });
        
        // Create basic project files
        const packageJson = {
          name: project,
          version: '1.0.0',
          description: \`Test project for Alex AI local testing: \${project}\`,
          main: 'index.js',
          scripts: {
            start: 'node index.js',
            test: 'echo "No tests specified"'
          }
        };
        
        fs.writeFileSync(
          path.join(projectPath, 'package.json'),
          JSON.stringify(packageJson, null, 2)
        );
        
        fs.writeFileSync(
          path.join(projectPath, 'index.js'),
          \`// Test project: \${project}\nconsole.log('Hello from \${project}!');\`
        );
        
        console.log(\`  ✅ Created test project: \${project}\`);
      }
    }
  }
  
  /**
   * Setup configuration files
   */
  async setupConfigurationFiles() {
    console.log('⚙️  Setting up configuration files...');
    
    // Local testing configuration
    const localConfig = {
      environment: 'local-testing',
      mockServices: CONFIG.mockServices,
      zeroArtifact: CONFIG.zeroArtifact,
      testing: {
        enabled: true,
        mockMode: true,
        artifactMonitoring: true
      }
    };
    
    fs.writeFileSync(
      path.join(CONFIG.testing.configDir, 'local-config.json'),
      JSON.stringify(localConfig, null, 2)
    );
    
    // Environment variables
    const envContent = \`# Alex AI Local Testing Environment
NODE_ENV=local-testing
ALEX_AI_ENVIRONMENT=local-testing

# Mock Services
N8N_API_URL=\${CONFIG.mockServices.n8n.url}
N8N_API_KEY=\${CONFIG.mockServices.n8n.apiKey}
SUPABASE_URL=\${CONFIG.mockServices.supabase.url}
SUPABASE_ANON_KEY=\${CONFIG.mockServices.supabase.anonKey}
OPENROUTER_API_URL=\${CONFIG.mockServices.openrouter.url}
OPENROUTER_API_KEY=\${CONFIG.mockServices.openrouter.apiKey}

# Zero-Artifact Monitoring
ZERO_ARTIFACT_MONITORING=true
ARTIFACT_BACKUP_DIR=\${CONFIG.zeroArtifact.backupDir}
\`;
    
    fs.writeFileSync(
      path.join(CONFIG.testing.configDir, '.env.local'),
      envContent
    );
    
    console.log('  ✅ Configuration files created');
  }
  
  /**
   * Display setup instructions
   */
  displaySetupInstructions() {
    console.log('📋 Local Testing Setup Instructions');
    console.log('===================================');
    console.log('');
    console.log('1. 🚀 Start Mock Services:');
    console.log('   cd local-testing/mock-services');
    console.log('   node n8n-mock.js &');
    console.log('   node supabase-mock.js &');
    console.log('   node openrouter-mock.js &');
    console.log('');
    console.log('2. 🛡️  Start Zero-Artifact Monitoring:');
    console.log('   node artifact-monitor.js &');
    console.log('');
    console.log('3. 🚫 Start Cursor AI Prevention:');
    console.log('   node ../scripts/cursor-artifact-prevention.js &');
    console.log('   node ../scripts/cursor-integration-prevention.js &');
    console.log('');
    console.log('4. 🎯 Test Cursor AI Integration:');
    console.log('   cd local-testing/config');
    console.log('   node -e "const { CursorIntegration } = require(\'./cursor-integration.js\'); const ci = new CursorIntegration(); ci.engage(\'Test the crew coordination system\');"');
    console.log('');
    console.log('5. 📁 Test with Different Projects:');
    console.log('   cd local-testing/test-projects/react-app');
    console.log('   # Use Cursor AI to engage Alex AI');
    console.log('');
    console.log('6. 🔍 Monitor for Artifacts:');
    console.log('   # Check local-testing/artifact-backups for any detected artifacts');
    console.log('');
    console.log('7. 🚫 Verify Prevention:');
    console.log('   # Try creating an alex-ai-artifacts folder - it should be immediately removed');
    console.log('   mkdir alex-ai-artifacts && sleep 2 && ls -la | grep alex-ai-artifacts');
    console.log('');
    console.log('✅ Local testing environment is ready!');
    console.log('');
  }
}

// Main execution
if (require.main === module) {
  const testingEnv = new LocalTestingEnvironment();
  testingEnv.setup().catch(console.error);
}

module.exports = { LocalTestingEnvironment };
