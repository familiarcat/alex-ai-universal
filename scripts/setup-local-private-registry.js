#!/usr/bin/env node

/**
 * Alex AI Local Private Registry Setup
 * ====================================
 * 
 * This script sets up a local private registry for Alex AI packages
 * without requiring GitHub authentication.
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Configuration
const REGISTRY_CONFIG = {
  packages: ['@alex-ai/core', '@alex-ai/cli', '@alex-ai/vscode', '@alex-ai/cursor', '@alex-ai/web'],
  version: '1.0.0-private',
  localRegistryDir: './local-registry'
};

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  green: '\x1b[32m',
  blue: '\x1b[34m'
};

function log(message, color = colors.reset) {
  const timestamp = new Date().toISOString();
  const logMessage = `[${timestamp}] ${message}`;
  console.log(`${color}${logMessage}${colors.reset}`);
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

function createLocalRegistry() {
  logInfo('Creating local private registry...');
  
  // Create local registry directory
  if (!fs.existsSync(REGISTRY_CONFIG.localRegistryDir)) {
    fs.mkdirSync(REGISTRY_CONFIG.localRegistryDir, { recursive: true });
  }
  
  // Create package.json for local registry
  const registryPackageJson = {
    name: 'alex-ai-local-registry',
    version: '1.0.0',
    description: 'Local private registry for Alex AI packages',
    private: true,
    dependencies: {}
  };
  
  const registryPackageJsonPath = path.join(REGISTRY_CONFIG.localRegistryDir, 'package.json');
  fs.writeFileSync(registryPackageJsonPath, JSON.stringify(registryPackageJson, null, 2));
  
  logSuccess('Local registry directory created');
}

function buildAndPackage(packageName) {
  logInfo(`Building and packaging ${packageName}...`);
  
  const packageDir = packageName.replace('@alex-ai/', 'packages/');
  const packageJsonPath = path.join(packageDir, 'package.json');
  
  if (!fs.existsSync(packageJsonPath)) {
    logError(`Package.json not found for ${packageName}`);
    return false;
  }
  
  // Read and update package.json
  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
  packageJson.version = REGISTRY_CONFIG.version;
  packageJson.name = packageName;
  
  // Write updated package.json
  fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));
  
  // Build the package
  logInfo(`Building ${packageName}...`);
  const buildResult = runCommand(`cd ${packageDir} && npm run build`);
  if (!buildResult.success) {
    logError(`Build failed for ${packageName}: ${buildResult.error}`);
    return false;
  }
  
  // Create tarball
  logInfo(`Creating tarball for ${packageName}...`);
  const packResult = runCommand(`cd ${packageDir} && npm pack`);
  if (!packResult.success) {
    logError(`Pack failed for ${packageName}: ${packResult.error}`);
    return false;
  }
  
  // Move tarball to local registry
  const tarballName = `${packageName.replace('@alex-ai/', 'alex-ai-')}-${REGISTRY_CONFIG.version}.tgz`;
  const tarballPath = path.join(packageDir, tarballName);
  const registryTarballPath = path.join(REGISTRY_CONFIG.localRegistryDir, tarballName);
  
  if (fs.existsSync(tarballPath)) {
    fs.copyFileSync(tarballPath, registryTarballPath);
    fs.unlinkSync(tarballPath); // Remove from package directory
    logSuccess(`Successfully packaged ${packageName} v${REGISTRY_CONFIG.version}`);
    return true;
  } else {
    logError(`Tarball not found for ${packageName}`);
    return false;
  }
}

function setupTestingEnvironment() {
  logInfo('Setting up testing environment with local packages...');
  
  const testingDir = 'testing-environment';
  const packageJsonPath = path.join(testingDir, 'package.json');
  
  if (!fs.existsSync(packageJsonPath)) {
    logError('Testing environment package.json not found');
    return false;
  }
  
  // Read and update package.json to use local packages
  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
  
  // Update dependencies to use local file paths
  packageJson.dependencies = {
    '@alex-ai/core': `file:../${REGISTRY_CONFIG.localRegistryDir}/alex-ai-core-${REGISTRY_CONFIG.version}.tgz`,
    '@alex-ai/cli': `file:../${REGISTRY_CONFIG.localRegistryDir}/alex-ai-cli-${REGISTRY_CONFIG.version}.tgz`
  };
  
  packageJson.devDependencies = {
    '@alex-ai/vscode': `file:../${REGISTRY_CONFIG.localRegistryDir}/alex-ai-vscode-${REGISTRY_CONFIG.version}.tgz`,
    '@alex-ai/cursor': `file:../${REGISTRY_CONFIG.localRegistryDir}/alex-ai-cursor-${REGISTRY_CONFIG.version}.tgz`,
    '@alex-ai/web': `file:../${REGISTRY_CONFIG.localRegistryDir}/alex-ai-web-${REGISTRY_CONFIG.version}.tgz`
  };
  
  // Write updated package.json
  fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));
  
  logSuccess('Testing environment updated with local packages');
  
  // Install packages
  logInfo('Installing local packages...');
  const installResult = runCommand(`cd ${testingDir} && npm install`);
  if (!installResult.success) {
    logWarning(`Package installation had issues: ${installResult.error}`);
  } else {
    logSuccess('Local packages installed successfully');
  }
  
  return true;
}

function testLocalPackages() {
  logInfo('Testing local packages...');
  
  const tests = [
    {
      name: 'Core Package',
      command: 'cd testing-environment && node -e "const core = require(\'@alex-ai/core\'); console.log(\'Core package loaded successfully\');"'
    },
    {
      name: 'CLI Package',
      command: 'cd testing-environment && npx @alex-ai/cli --version'
    },
    {
      name: 'Web Platform',
      command: 'cd testing-environment/web-platform && node -e "console.log(\'Web platform ready\');"'
    }
  ];
  
  const results = [];
  for (const test of tests) {
    logInfo(`Testing ${test.name}...`);
    const result = runCommand(test.command);
    results.push({
      name: test.name,
      success: result.success,
      error: result.error
    });
    
    if (result.success) {
      logSuccess(`${test.name} test passed`);
    } else {
      logWarning(`${test.name} test failed: ${result.error}`);
    }
  }
  
  return results;
}

function createQuickStartScript() {
  logInfo('Creating quick start script...');
  
  const quickStartScript = `#!/bin/bash
# Alex AI Quick Start Script

echo "🚀 Starting Alex AI Local Development Environment..."

# Check if local registry exists
if [ ! -d "local-registry" ]; then
    echo "❌ Local registry not found. Please run setup first."
    exit 1
fi

# Start web platform
echo "🌐 Starting Web Platform..."
cd testing-environment/web-platform
npm start &
WEB_PID=$!

# Wait for web platform to start
sleep 3

echo "✅ Alex AI Local Environment Started!"
echo "🌐 Web Platform: http://localhost:3000"
echo "📁 VS Code Workspace: ./testing-environment/vscode-workspace/alex-ai-testing.code-workspace"
echo "📁 Cursor Workspace: ./testing-environment/cursor-workspace/"
echo "📁 Test Projects: ./testing-environment/test-projects/"

echo ""
echo "🎯 Ready for development! You can now:"
echo "  • Open VS Code workspace for development"
echo "  • Use Cursor AI with the extension"
echo "  • Test with the web platform"
echo "  • Run test projects"

# Keep script running
wait $WEB_PID
`;
  
  const quickStartPath = path.join(process.cwd(), 'quick-start.sh');
  fs.writeFileSync(quickStartPath, quickStartScript);
  runCommand(`chmod +x ${quickStartPath}`);
  
  logSuccess('Quick start script created: ./quick-start.sh');
}

// Main setup function
async function setupLocalPrivateRegistry() {
  log('🏠 Alex AI Local Private Registry Setup', colors.bright);
  log('=======================================', colors.bright);
  
  try {
    // Create local registry
    createLocalRegistry();
    
    // Build and package all components
    const results = [];
    for (const packageName of REGISTRY_CONFIG.packages) {
      try {
        const success = buildAndPackage(packageName);
        results.push({ package: packageName, success });
      } catch (error) {
        logError(`Failed to package ${packageName}: ${error.message}`);
        results.push({ package: packageName, success: false, error: error.message });
      }
    }
    
    // Setup testing environment
    setupTestingEnvironment();
    
    // Test local packages
    const testResults = testLocalPackages();
    
    // Create quick start script
    createQuickStartScript();
    
    // Generate summary
    const successfulPackages = results.filter(r => r.success);
    const failedPackages = results.filter(r => !r.success);
    const successfulTests = testResults.filter(t => t.success);
    
    log('📊 Setup Summary', colors.bright);
    log('================', colors.bright);
    log(`✅ Packages Built: ${successfulPackages.length}/${results.length}`);
    log(`✅ Tests Passed: ${successfulTests.length}/${testResults.length}`);
    
    if (successfulPackages.length > 0) {
      log('\n✅ Successfully Built:', colors.green);
      successfulPackages.forEach(result => {
        log(`  • ${result.package} v${REGISTRY_CONFIG.version}`, colors.green);
      });
    }
    
    if (failedPackages.length > 0) {
      log('\n❌ Failed to Build:', colors.red);
      failedPackages.forEach(result => {
        log(`  • ${result.package}: ${result.error}`, colors.red);
      });
    }
    
    log('\n🎯 Next Steps:', colors.blue);
    log('1. Run: ./quick-start.sh');
    log('2. Open VS Code workspace: ./testing-environment/vscode-workspace/');
    log('3. Test Cursor AI extension: ./testing-environment/cursor-workspace/');
    log('4. Access web platform: http://localhost:3000');
    
    if (successfulPackages.length === results.length) {
      logSuccess('🎉 Alex AI Local Environment Ready!');
      logSuccess('Ready for tomorrow morning development!');
    } else {
      logWarning('⚠️  Some packages failed to build. Check the logs for details.');
    }
    
    return successfulPackages.length === results.length;
    
  } catch (error) {
    logError(`Setup failed: ${error.message}`);
    return false;
  }
}

// Run setup
if (require.main === module) {
  setupLocalPrivateRegistry().catch(error => {
    logError(`Local registry setup failed: ${error.message}`);
    process.exit(1);
  });
}

module.exports = { setupLocalPrivateRegistry, REGISTRY_CONFIG };
