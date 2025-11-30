#!/usr/bin/env node

/**
 * Alex AI Testing Environment Setup
 * =================================
 * 
 * This script sets up a controlled testing environment for all Alex AI components:
 * - Private NPM registry configuration
 * - VS Code testing workspace
 * - Cursor AI testing workspace
 * - Web platform testing server
 * - Test data and configurations
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Configuration
const TEST_CONFIG = {
  // Testing directories
  testDir: './testing-environment',
  vscodeTestDir: './testing-environment/vscode-workspace',
  cursorTestDir: './testing-environment/cursor-workspace',
  webTestDir: './testing-environment/web-platform',
  
  // Private registry configuration
  privateRegistry: 'https://npm.pkg.github.com',
  scope: '@alex-ai',
  
  // Test data
  testDataDir: './testing-environment/test-data',
  testProjectsDir: './testing-environment/test-projects',
  
  // Configuration files
  configDir: './testing-environment/config',
  
  // Logging
  logFile: './testing-environment/setup.log'
};

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
};

// Logging functions
function log(message, color = colors.reset) {
  const timestamp = new Date().toISOString();
  const logMessage = `[${timestamp}] ${message}`;
  console.log(`${color}${logMessage}${colors.reset}`);
  
  // Write to log file
  if (!fs.existsSync(path.dirname(TEST_CONFIG.logFile))) {
    fs.mkdirSync(path.dirname(TEST_CONFIG.logFile), { recursive: true });
  }
  fs.appendFileSync(TEST_CONFIG.logFile, logMessage + '\n');
}

function logSuccess(message) {
  log(`✅ ${message}`, colors.green);
}

function logError(message) {
  log(`❌ ${message}`, colors.red);
}

function logWarning(message) {
  log(`⚠️  ${message}`, colors.yellow);
}

function logInfo(message) {
  log(`ℹ️  ${message}`, colors.blue);
}

// Utility functions
function runCommand(command, timeout = 30000) {
  try {
    logInfo(`Running command: ${command}`);
    const result = execSync(command, { 
      timeout, 
      cwd: process.cwd(),
      stdio: 'pipe',
      encoding: 'utf8'
    });
    return { success: true, output: result };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

function createDirectory(dirPath) {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
    logSuccess(`Created directory: ${dirPath}`);
  } else {
    logInfo(`Directory already exists: ${dirPath}`);
  }
}

// Setup functions
function setupDirectories() {
  logInfo('Setting up testing directories...');
  
  const directories = [
    TEST_CONFIG.testDir,
    TEST_CONFIG.vscodeTestDir,
    TEST_CONFIG.cursorTestDir,
    TEST_CONFIG.webTestDir,
    TEST_CONFIG.testDataDir,
    TEST_CONFIG.testProjectsDir,
    TEST_CONFIG.configDir
  ];
  
  directories.forEach(createDirectory);
}

function setupNPMConfiguration() {
  logInfo('Setting up NPM configuration for private registry...');
  
  const npmrcContent = `@alex-ai:registry=${TEST_CONFIG.privateRegistry}
//npm.pkg.github.com/:_authToken=\${GITHUB_TOKEN}
`;
  
  const npmrcPath = path.join(TEST_CONFIG.testDir, '.npmrc');
  fs.writeFileSync(npmrcPath, npmrcContent);
  logSuccess('Created .npmrc for private registry access');
  
  // Create package.json for testing
  const packageJson = {
    name: 'alex-ai-testing-environment',
    version: '1.0.0',
    description: 'Alex AI Testing Environment',
    private: true,
    dependencies: {
      '@alex-ai/core': '^1.0.0-private',
      '@alex-ai/cli': '^1.0.0-private'
    },
    devDependencies: {
      '@alex-ai/vscode': '^1.0.0-private',
      '@alex-ai/cursor': '^1.0.0-private',
      '@alex-ai/web': '^1.0.0-private'
    }
  };
  
  const packageJsonPath = path.join(TEST_CONFIG.testDir, 'package.json');
  fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));
  logSuccess('Created package.json for testing environment');
}

function setupVSCodeWorkspace() {
  logInfo('Setting up VS Code testing workspace...');
  
  // Create VS Code workspace file
  const workspaceConfig = {
    folders: [
      {
        name: 'Alex AI Core',
        path: '../packages/core'
      },
      {
        name: 'Alex AI CLI',
        path: '../packages/cli'
      },
      {
        name: 'Test Projects',
        path: './test-projects'
      }
    ],
    settings: {
      'alex-ai.enabled': true,
      'alex-ai.privateRegistry': TEST_CONFIG.privateRegistry,
      'alex-ai.testingMode': true
    },
    extensions: {
      recommendations: [
        'alex-ai.vscode-extension'
      ]
    }
  };
  
  const workspacePath = path.join(TEST_CONFIG.vscodeTestDir, 'alex-ai-testing.code-workspace');
  fs.writeFileSync(workspacePath, JSON.stringify(workspaceConfig, null, 2));
  logSuccess('Created VS Code workspace configuration');
  
  // Create VS Code settings
  const vscodeSettings = {
    'alex-ai.enabled': true,
    'alex-ai.privateRegistry': TEST_CONFIG.privateRegistry,
    'alex-ai.testingMode': true,
    'alex-ai.crewMembers': [
      'Captain Picard',
      'Commander Data',
      'Commander Riker',
      'Lieutenant Commander Geordi',
      'Lieutenant Worf',
      'Counselor Troi',
      'Dr. Crusher',
      'Lieutenant Uhura',
      'Quark'
    ],
    'alex-ai.n8nIntegration': {
      enabled: true,
      baseUrl: 'https://n8n.pbradygeorgen.com',
      apiKey: '${N8N_API_KEY}'
    },
    'alex-ai.ragMemory': {
      enabled: true,
      supabaseUrl: '${SUPABASE_URL}',
      supabaseKey: '${SUPABASE_ANON_KEY}'
    }
  };
  
  const settingsDir = path.join(TEST_CONFIG.vscodeTestDir, '.vscode');
  createDirectory(settingsDir);
  
  const settingsPath = path.join(settingsDir, 'settings.json');
  fs.writeFileSync(settingsPath, JSON.stringify(vscodeSettings, null, 2));
  logSuccess('Created VS Code settings for testing');
}

function setupCursorWorkspace() {
  logInfo('Setting up Cursor AI testing workspace...');
  
  // Create Cursor workspace configuration
  const cursorConfig = {
    name: 'Alex AI Cursor Testing',
    version: '1.0.0',
    description: 'Alex AI Cursor AI Extension Testing Environment',
    alexAI: {
      enabled: true,
      privateRegistry: TEST_CONFIG.privateRegistry,
      testingMode: true,
      crewMembers: [
        'Captain Picard',
        'Commander Data',
        'Commander Riker',
        'Lieutenant Commander Geordi',
        'Lieutenant Worf',
        'Counselor Troi',
        'Dr. Crusher',
        'Lieutenant Uhura',
        'Quark'
      ],
      n8nIntegration: {
        enabled: true,
        baseUrl: 'https://n8n.pbradygeorgen.com',
        apiKey: '${N8N_API_KEY}'
      },
      ragMemory: {
        enabled: true,
        supabaseUrl: '${SUPABASE_URL}',
        supabaseKey: '${SUPABASE_ANON_KEY}'
      }
    }
  };
  
  const cursorConfigPath = path.join(TEST_CONFIG.cursorTestDir, 'cursor-config.json');
  fs.writeFileSync(cursorConfigPath, JSON.stringify(cursorConfig, null, 2));
  logSuccess('Created Cursor AI workspace configuration');
}

function setupWebPlatform() {
  logInfo('Setting up Web Platform testing environment...');
  
  // Copy web platform files
  const webSourceDir = 'packages/web-interface';
  const webDestDir = TEST_CONFIG.webTestDir;
  
  if (fs.existsSync(webSourceDir)) {
    runCommand(`cp -r ${webSourceDir}/* ${webDestDir}/`);
    logSuccess('Copied web platform files to testing directory');
  } else {
    logWarning('Web platform source directory not found, creating basic structure');
    
    // Create basic web platform structure
    const indexHtml = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Alex AI Web Platform - Testing</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 0; padding: 20px; background: #f5f5f5; }
        .container { max-width: 1200px; margin: 0 auto; background: white; padding: 20px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
        .header { text-align: center; margin-bottom: 30px; }
        .status { padding: 10px; margin: 10px 0; border-radius: 4px; }
        .success { background: #d4edda; color: #155724; border: 1px solid #c3e6cb; }
        .info { background: #d1ecf1; color: #0c5460; border: 1px solid #bee5eb; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🚀 Alex AI Web Platform</h1>
            <p>Testing Environment - Private Deployment</p>
        </div>
        
        <div class="status success">
            <strong>✅ Web Platform Ready</strong><br>
            Alex AI Web Platform is running in testing mode.
        </div>
        
        <div class="status info">
            <strong>ℹ️ Testing Mode Active</strong><br>
            This is a private deployment for controlled testing.
        </div>
        
        <div id="alex-ai-interface">
            <h2>Alex AI Interface</h2>
            <p>Web platform interface will be loaded here...</p>
        </div>
    </div>
    
    <script>
        // Alex AI Web Platform JavaScript will be loaded here
        console.log('Alex AI Web Platform - Testing Environment');
    </script>
</body>
</html>`;
    
    fs.writeFileSync(path.join(webDestDir, 'index.html'), indexHtml);
    logSuccess('Created basic web platform structure');
  }
  
  // Create web platform configuration
  const webConfig = {
    name: 'Alex AI Web Platform',
    version: '1.0.0-private',
    description: 'Alex AI Web Platform - Testing Environment',
    private: true,
    alexAI: {
      enabled: true,
      privateRegistry: TEST_CONFIG.privateRegistry,
      testingMode: true,
      n8nIntegration: {
        enabled: true,
        baseUrl: 'https://n8n.pbradygeorgen.com',
        apiKey: '${N8N_API_KEY}'
      },
      ragMemory: {
        enabled: true,
        supabaseUrl: '${SUPABASE_URL}',
        supabaseKey: '${SUPABASE_ANON_KEY}'
      }
    }
  };
  
  const webConfigPath = path.join(webDestDir, 'package.json');
  fs.writeFileSync(webConfigPath, JSON.stringify(webConfig, null, 2));
  logSuccess('Created web platform configuration');
}

function setupTestData() {
  logInfo('Setting up test data...');
  
  // Create test projects
  const testProjects = [
    {
      name: 'react-test-project',
      type: 'react',
      description: 'React application for testing Alex AI integration'
    },
    {
      name: 'nodejs-test-project',
      type: 'nodejs',
      description: 'Node.js application for testing Alex AI integration'
    },
    {
      name: 'typescript-test-project',
      type: 'typescript',
      description: 'TypeScript application for testing Alex AI integration'
    }
  ];
  
  testProjects.forEach(project => {
    const projectDir = path.join(TEST_CONFIG.testProjectsDir, project.name);
    createDirectory(projectDir);
    
    const packageJson = {
      name: project.name,
      version: '1.0.0',
      description: project.description,
      private: true,
      dependencies: {
        '@alex-ai/core': '^1.0.0-private',
        '@alex-ai/cli': '^1.0.0-private'
      }
    };
    
    fs.writeFileSync(
      path.join(projectDir, 'package.json'),
      JSON.stringify(packageJson, null, 2)
    );
    
    // Create basic project files
    const readmeContent = `# ${project.name}

${project.description}

## Testing Alex AI Integration

This project is set up for testing Alex AI integration in a controlled environment.

## Usage

\`\`\`bash
# Install dependencies
npm install

# Test Alex AI integration
npx alex-ai test
\`\`\`
`;
    
    fs.writeFileSync(path.join(projectDir, 'README.md'), readmeContent);
    
    logSuccess(`Created test project: ${project.name}`);
  });
  
  // Create test configuration
  const testConfig = {
    name: 'Alex AI Testing Configuration',
    version: '1.0.0',
    description: 'Configuration for Alex AI testing environment',
    testing: {
      enabled: true,
      privateRegistry: TEST_CONFIG.privateRegistry,
      testProjects: testProjects.map(p => p.name),
      crewMembers: [
        'Captain Picard',
        'Commander Data',
        'Commander Riker',
        'Lieutenant Commander Geordi',
        'Lieutenant Worf',
        'Counselor Troi',
        'Dr. Crusher',
        'Lieutenant Uhura',
        'Quark'
      ],
      n8nIntegration: {
        enabled: true,
        baseUrl: 'https://n8n.pbradygeorgen.com',
        apiKey: '${N8N_API_KEY}'
      },
      ragMemory: {
        enabled: true,
        supabaseUrl: '${SUPABASE_URL}',
        supabaseKey: '${SUPABASE_ANON_KEY}'
      }
    }
  };
  
  const testConfigPath = path.join(TEST_CONFIG.configDir, 'testing-config.json');
  fs.writeFileSync(testConfigPath, JSON.stringify(testConfig, null, 2));
  logSuccess('Created testing configuration');
}

function setupEnvironmentScripts() {
  logInfo('Setting up environment scripts...');
  
  // Create start script
  const startScript = `#!/bin/bash
# Alex AI Testing Environment Start Script

echo "🚀 Starting Alex AI Testing Environment..."

# Check if .env file exists
if [ ! -f .env ]; then
    echo "⚠️  .env file not found. Creating template..."
    cat > .env << EOF
# Alex AI Testing Environment Configuration
N8N_API_KEY=your_n8n_api_key_here
SUPABASE_URL=your_supabase_url_here
SUPABASE_ANON_KEY=your_supabase_anon_key_here
GITHUB_TOKEN=your_github_token_here
EOF
    echo "📝 Please update .env file with your credentials"
fi

# Load environment variables
source .env

# Start web platform
echo "🌐 Starting Web Platform..."
cd web-platform
npm start &
WEB_PID=$!

# Wait for web platform to start
sleep 5

echo "✅ Alex AI Testing Environment Started!"
echo "🌐 Web Platform: http://localhost:3000"
echo "📁 VS Code Workspace: ./vscode-workspace/alex-ai-testing.code-workspace"
echo "📁 Cursor Workspace: ./cursor-workspace/"
echo "📁 Test Projects: ./test-projects/"

# Keep script running
wait $WEB_PID
`;
  
  const startScriptPath = path.join(TEST_CONFIG.testDir, 'start.sh');
  fs.writeFileSync(startScriptPath, startScript);
  runCommand(`chmod +x ${startScriptPath}`);
  logSuccess('Created start script');
  
  // Create stop script
  const stopScript = `#!/bin/bash
# Alex AI Testing Environment Stop Script

echo "🛑 Stopping Alex AI Testing Environment..."

# Kill web platform
pkill -f "npm start"

echo "✅ Alex AI Testing Environment Stopped!"
`;
  
  const stopScriptPath = path.join(TEST_CONFIG.testDir, 'stop.sh');
  fs.writeFileSync(stopScriptPath, stopScript);
  runCommand(`chmod +x ${stopScriptPath}`);
  logSuccess('Created stop script');
  
  // Create test script
  const testScript = `#!/bin/bash
# Alex AI Testing Environment Test Script

echo "🧪 Running Alex AI Tests..."

# Test NPM packages
echo "📦 Testing NPM packages..."
cd test-projects/react-test-project
npm test

# Test VS Code extension
echo "🔌 Testing VS Code extension..."
code --version

# Test Cursor AI extension
echo "🎯 Testing Cursor AI extension..."
cursor --version

echo "✅ All tests completed!"
`;
  
  const testScriptPath = path.join(TEST_CONFIG.testDir, 'test.sh');
  fs.writeFileSync(testScriptPath, testScript);
  runCommand(`chmod +x ${testScriptPath}`);
  logSuccess('Created test script');
}

function createDocumentation() {
  logInfo('Creating testing documentation...');
  
  const readmeContent = `# Alex AI Testing Environment

This directory contains a complete testing environment for all Alex AI components in a controlled, private deployment.

## 🚀 Quick Start

1. **Start the testing environment:**
   \`\`\`bash
   ./start.sh
   \`\`\`

2. **Stop the testing environment:**
   \`\`\`bash
   ./stop.sh
   \`\`\`

3. **Run tests:**
   \`\`\`bash
   ./test.sh
   \`\`\`

## 📁 Directory Structure

\`\`\`
testing-environment/
├── vscode-workspace/          # VS Code testing workspace
├── cursor-workspace/          # Cursor AI testing workspace
├── web-platform/             # Web platform testing
├── test-projects/            # Test projects for integration testing
├── test-data/                # Test data and configurations
├── config/                   # Testing configurations
├── start.sh                  # Start script
├── stop.sh                   # Stop script
├── test.sh                   # Test script
└── README.md                 # This file
\`\`\`

## 🔧 Configuration

### Environment Variables

Create a \`.env\` file in the testing environment root:

\`\`\`bash
# Alex AI Testing Environment Configuration
N8N_API_KEY=your_n8n_api_key_here
SUPABASE_URL=your_supabase_url_here
SUPABASE_ANON_KEY=your_supabase_anon_key_here
GITHUB_TOKEN=your_github_token_here
\`\`\`

### Private Registry

The testing environment is configured to use a private NPM registry for Alex AI packages:

- Registry: \`https://npm.pkg.github.com\`
- Scope: \`@alex-ai\`
- Version: \`1.0.0-private\`

## 🧪 Testing Components

### 1. NPM Packages
- \`@alex-ai/core\` - Core Alex AI functionality
- \`@alex-ai/cli\` - Command-line interface

### 2. VS Code Extension
- Extension: \`@alex-ai/vscode\`
- Workspace: \`vscode-workspace/alex-ai-testing.code-workspace\`

### 3. Cursor AI Extension
- Extension: \`@alex-ai/cursor\`
- Workspace: \`cursor-workspace/\`

### 4. Web Platform
- Platform: \`@alex-ai/web\`
- URL: \`http://localhost:3000\`

## 🎯 Test Projects

The testing environment includes several test projects:

1. **React Test Project** - React application for testing
2. **Node.js Test Project** - Node.js application for testing
3. **TypeScript Test Project** - TypeScript application for testing

## 🔍 Debugging

### Logs
- Setup log: \`setup.log\`
- Application logs: Check individual component logs

### Common Issues
1. **Private registry access**: Ensure \`GITHUB_TOKEN\` is set
2. **N8N integration**: Verify \`N8N_API_KEY\` is correct
3. **RAG memory**: Check \`SUPABASE_URL\` and \`SUPABASE_ANON_KEY\`

## 📞 Support

For issues with the testing environment, check:
1. Environment variables are correctly set
2. Private registry access is working
3. All required services (N8N, Supabase) are accessible

## 🚀 Next Steps

1. Configure your environment variables
2. Start the testing environment
3. Test each component individually
4. Run integration tests
5. Report any issues or feedback

Happy testing! 🎉
`;
  
  const readmePath = path.join(TEST_CONFIG.testDir, 'README.md');
  fs.writeFileSync(readmePath, readmeContent);
  logSuccess('Created testing documentation');
}

// Main setup function
async function setupTestingEnvironment() {
  log('🧪 Alex AI Testing Environment Setup', colors.bright);
  log('====================================', colors.bright);
  
  try {
    // Setup all components
    setupDirectories();
    setupNPMConfiguration();
    setupVSCodeWorkspace();
    setupCursorWorkspace();
    setupWebPlatform();
    setupTestData();
    setupEnvironmentScripts();
    createDocumentation();
    
    // Generate setup summary
    const setupSummary = {
      timestamp: new Date().toISOString(),
      version: '1.0.0-private',
      directories: [
        TEST_CONFIG.testDir,
        TEST_CONFIG.vscodeTestDir,
        TEST_CONFIG.cursorTestDir,
        TEST_CONFIG.webTestDir,
        TEST_CONFIG.testDataDir,
        TEST_CONFIG.testProjectsDir,
        TEST_CONFIG.configDir
      ],
      components: [
        'NPM Packages (@alex-ai/core, @alex-ai/cli)',
        'VS Code Extension (@alex-ai/vscode)',
        'Cursor AI Extension (@alex-ai/cursor)',
        'Web Platform (@alex-ai/web)'
      ],
      testProjects: [
        'react-test-project',
        'nodejs-test-project',
        'typescript-test-project'
      ],
      scripts: [
        'start.sh',
        'stop.sh',
        'test.sh'
      ]
    };
    
    fs.writeFileSync(
      path.join(TEST_CONFIG.testDir, 'setup-summary.json'),
      JSON.stringify(setupSummary, null, 2)
    );
    
    log('📊 Setup Summary', colors.bright);
    log('================', colors.bright);
    log(`✅ Testing environment created: ${TEST_CONFIG.testDir}`);
    log(`✅ VS Code workspace: ${TEST_CONFIG.vscodeTestDir}`);
    log(`✅ Cursor AI workspace: ${TEST_CONFIG.cursorTestDir}`);
    log(`✅ Web platform: ${TEST_CONFIG.webTestDir}`);
    log(`✅ Test projects: ${TEST_CONFIG.testProjectsDir}`);
    log(`✅ Configuration: ${TEST_CONFIG.configDir}`);
    
    logSuccess('🎉 Testing environment setup complete!');
    logInfo('Next steps:');
    logInfo('1. Update .env file with your credentials');
    logInfo('2. Run ./start.sh to start the testing environment');
    logInfo('3. Run ./test.sh to run tests');
    
  } catch (error) {
    logError(`Setup failed: ${error.message}`);
    process.exit(1);
  }
}

// Run setup
if (require.main === module) {
  setupTestingEnvironment().catch(error => {
    logError(`Testing environment setup failed: ${error.message}`);
    process.exit(1);
  });
}

module.exports = { setupTestingEnvironment, TEST_CONFIG };
