#!/usr/bin/env node

/**
 * Alex AI Private Registry Setup
 * =============================
 * 
 * This script sets up private registry authentication for GitHub Packages
 * and publishes Alex AI packages to the private registry.
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Configuration
const REGISTRY_CONFIG = {
  privateRegistry: 'https://npm.pkg.github.com',
  scope: '@alex-ai',
  packages: ['@alex-ai/core', '@alex-ai/cli', '@alex-ai/vscode', '@alex-ai/cursor', '@alex-ai/web'],
  version: '1.0.0-private'
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

function loadEnvironmentVariables() {
  logInfo('Loading environment variables from ~/.zshrc...');
  
  try {
    const zshrcPath = path.join(process.env.HOME, '.zshrc');
    const zshrcContent = fs.readFileSync(zshrcPath, 'utf8');
    
    const envVars = {};
    const lines = zshrcContent.split('\n');
    
    for (const line of lines) {
      const trimmedLine = line.trim();
      if (trimmedLine.startsWith('export ') || (!trimmedLine.startsWith('#') && trimmedLine.includes('='))) {
        const [key, ...valueParts] = trimmedLine.replace('export ', '').split('=');
        if (key && valueParts.length > 0) {
          let value = valueParts.join('=');
          // Remove quotes if present
          if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
            value = value.slice(1, -1);
          }
          envVars[key.trim()] = value;
        }
      }
    }
    
    // Set environment variables
    Object.assign(process.env, envVars);
    
    logSuccess('Environment variables loaded successfully');
    return envVars;
  } catch (error) {
    logError(`Failed to load environment variables: ${error.message}`);
    return {};
  }
}

function setupNPMRegistry() {
  logInfo('Setting up NPM registry configuration...');
  
  // Create .npmrc for private registry
  const npmrcContent = `@alex-ai:registry=${REGISTRY_CONFIG.privateRegistry}
//npm.pkg.github.com/:_authToken=\${GITHUB_TOKEN}
`;
  
  const npmrcPath = path.join(process.cwd(), '.npmrc');
  fs.writeFileSync(npmrcPath, npmrcContent);
  logSuccess('Created .npmrc for private registry access');
  
  // Create .npmrc in testing environment
  const testingNpmrcPath = path.join(process.cwd(), 'testing-environment', '.npmrc');
  fs.writeFileSync(testingNpmrcPath, npmrcContent);
  logSuccess('Created .npmrc in testing environment');
}

function authenticateWithRegistry() {
  logInfo('Authenticating with GitHub Packages...');
  
  if (!process.env.GITHUB_TOKEN) {
    logError('GITHUB_TOKEN not found in environment variables');
    logInfo('Please set GITHUB_TOKEN in your ~/.zshrc file');
    return false;
  }
  
  // Set up authentication
  const authCommand = `echo "//npm.pkg.github.com/:_authToken=${process.env.GITHUB_TOKEN}" | npm config set registry ${REGISTRY_CONFIG.privateRegistry}`;
  const authResult = runCommand(authCommand);
  
  if (!authResult.success) {
    logError(`Authentication failed: ${authResult.error}`);
    return false;
  }
  
  logSuccess('Successfully authenticated with GitHub Packages');
  return true;
}

function publishPackage(packageName) {
  logInfo(`Publishing ${packageName}...`);
  
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
  
  // Add private registry configuration
  packageJson.publishConfig = {
    registry: REGISTRY_CONFIG.privateRegistry
  };
  
  // Write updated package.json
  fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));
  
  // Build the package
  logInfo(`Building ${packageName}...`);
  const buildResult = runCommand(`cd ${packageDir} && npm run build`);
  if (!buildResult.success) {
    logError(`Build failed for ${packageName}: ${buildResult.error}`);
    return false;
  }
  
  // Publish to private registry
  logInfo(`Publishing ${packageName} to private registry...`);
  const publishResult = runCommand(`cd ${packageDir} && npm publish --registry=${REGISTRY_CONFIG.privateRegistry}`);
  if (!publishResult.success) {
    logError(`Publish failed for ${packageName}: ${publishResult.error}`);
    return false;
  }
  
  logSuccess(`Successfully published ${packageName} v${REGISTRY_CONFIG.version}`);
  return true;
}

function testPrivatePackages() {
  logInfo('Testing private packages...');
  
  // Test package installation
  const testResult = runCommand('cd testing-environment && npm install');
  if (!testResult.success) {
    logError(`Package installation test failed: ${testResult.error}`);
    return false;
  }
  
  logSuccess('Private packages installed successfully');
  
  // Test CLI
  const cliTestResult = runCommand('cd testing-environment && npx @alex-ai/cli --version');
  if (!cliTestResult.success) {
    logWarning(`CLI test failed: ${cliTestResult.error}`);
  } else {
    logSuccess('CLI test passed');
  }
  
  return true;
}

// Main setup function
async function setupPrivateRegistry() {
  log('🔐 Alex AI Private Registry Setup', colors.bright);
  log('=================================', colors.bright);
  
  try {
    // Load environment variables
    const envVars = loadEnvironmentVariables();
    
    // Setup NPM registry
    setupNPMRegistry();
    
    // Authenticate with registry
    if (!authenticateWithRegistry()) {
      logError('Authentication failed. Please check your GITHUB_TOKEN.');
      return false;
    }
    
    // Publish packages
    const results = [];
    for (const packageName of REGISTRY_CONFIG.packages) {
      try {
        const success = publishPackage(packageName);
        results.push({ package: packageName, success });
      } catch (error) {
        logError(`Failed to publish ${packageName}: ${error.message}`);
        results.push({ package: packageName, success: false, error: error.message });
      }
    }
    
    // Test private packages
    testPrivatePackages();
    
    // Generate summary
    const successfulPackages = results.filter(r => r.success);
    const failedPackages = results.filter(r => !r.success);
    
    log('📊 Setup Summary', colors.bright);
    log('================', colors.bright);
    log(`✅ Successful: ${successfulPackages.length}/${results.length}`);
    log(`❌ Failed: ${failedPackages.length}/${results.length}`);
    
    if (successfulPackages.length > 0) {
      log('\n✅ Successfully Published:', colors.green);
      successfulPackages.forEach(result => {
        log(`  • ${result.package} v${REGISTRY_CONFIG.version}`, colors.green);
      });
    }
    
    if (failedPackages.length > 0) {
      log('\n❌ Failed to Publish:', colors.red);
      failedPackages.forEach(result => {
        log(`  • ${result.package}: ${result.error}`, colors.red);
      });
    }
    
    if (successfulPackages.length === results.length) {
      logSuccess('🎉 All packages published successfully!');
      logSuccess('Alex AI is ready for private testing!');
    } else {
      logWarning('⚠️  Some packages failed to publish. Check the logs for details.');
    }
    
    return successfulPackages.length === results.length;
    
  } catch (error) {
    logError(`Setup failed: ${error.message}`);
    return false;
  }
}

// Run setup
if (require.main === module) {
  setupPrivateRegistry().catch(error => {
    logError(`Private registry setup failed: ${error.message}`);
    process.exit(1);
  });
}

module.exports = { setupPrivateRegistry, REGISTRY_CONFIG };
