#!/usr/bin/env node

/**
 * Alex AI Private Deployment System
 * =================================
 * 
 * This script deploys private versions of all Alex AI components:
 * - NPM packages (@alex-ai/core, @alex-ai/cli)
 * - VS Code Extension
 * - Cursor AI Extension
 * - Web Platform
 * 
 * All components are deployed to private registries for controlled testing.
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Configuration
const DEPLOY_CONFIG = {
  // Private registry configuration
  privateRegistry: 'https://npm.pkg.github.com',
  scope: '@alex-ai',
  
  // Version configuration
  version: '1.0.0-private',
  
  // Deployment targets
  targets: {
    npm: ['@alex-ai/core', '@alex-ai/cli'],
    vscode: '@alex-ai/vscode',
    cursor: '@alex-ai/cursor',
    web: '@alex-ai/web'
  },
  
  // Build configuration
  buildTimeout: 300000, // 5 minutes
  maxRetries: 3,
  
  // Deployment directories
  deployDir: './deployments',
  webDeployDir: './deployments/web-platform',
  
  // Logging
  logFile: './deployments/deployment.log'
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
  if (!fs.existsSync(path.dirname(DEPLOY_CONFIG.logFile))) {
    fs.mkdirSync(path.dirname(DEPLOY_CONFIG.logFile), { recursive: true });
  }
  fs.appendFileSync(DEPLOY_CONFIG.logFile, logMessage + '\n');
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
function runCommand(command, timeout = DEPLOY_CONFIG.buildTimeout, retries = DEPLOY_CONFIG.maxRetries) {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      logInfo(`Running command (attempt ${attempt}/${retries}): ${command}`);
      const result = execSync(command, { 
        timeout, 
        cwd: process.cwd(),
        stdio: 'pipe',
        encoding: 'utf8'
      });
      return { success: true, output: result, attempt };
    } catch (error) {
      logWarning(`Command failed (attempt ${attempt}/${retries}): ${error.message}`);
      if (attempt === retries) {
        return { success: false, error: error.message, attempt };
      }
      // Wait before retry
      const waitTime = attempt * 2000; // 2s, 4s, 6s
      logInfo(`Waiting ${waitTime}ms before retry...`);
      execSync(`sleep ${waitTime / 1000}`);
    }
  }
}

// Package deployment functions
async function deployNPMPackage(packageName) {
  logInfo(`Deploying NPM package: ${packageName}`);
  
  const packageDir = packageName.replace('@alex-ai/', 'packages/');
  const packageJsonPath = path.join(packageDir, 'package.json');
  
  if (!fs.existsSync(packageJsonPath)) {
    throw new Error(`Package.json not found for ${packageName}`);
  }
  
  // Read and update package.json
  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
  packageJson.version = DEPLOY_CONFIG.version;
  packageJson.name = packageName;
  
  // Add private registry configuration
  packageJson.publishConfig = {
    registry: DEPLOY_CONFIG.privateRegistry
  };
  
  // Write updated package.json
  fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));
  
  // Build the package
  logInfo(`Building ${packageName}...`);
  const buildResult = runCommand(`cd ${packageDir} && npm run build`);
  if (!buildResult.success) {
    throw new Error(`Build failed for ${packageName}: ${buildResult.error}`);
  }
  
  // Publish to private registry
  logInfo(`Publishing ${packageName} to private registry...`);
  const publishResult = runCommand(`cd ${packageDir} && npm publish --registry=${DEPLOY_CONFIG.privateRegistry}`);
  if (!publishResult.success) {
    throw new Error(`Publish failed for ${packageName}: ${publishResult.error}`);
  }
  
  logSuccess(`Successfully deployed ${packageName} v${DEPLOY_CONFIG.version}`);
  return { package: packageName, version: DEPLOY_CONFIG.version, success: true };
}

async function deployVSCodeExtension() {
  logInfo('Deploying VS Code Extension...');
  
  const extensionDir = 'packages/vscode-extension';
  const packageJsonPath = path.join(extensionDir, 'package.json');
  
  if (!fs.existsSync(packageJsonPath)) {
    throw new Error('VS Code extension package.json not found');
  }
  
  // Read and update package.json
  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
  packageJson.version = DEPLOY_CONFIG.version;
  packageJson.name = DEPLOY_CONFIG.targets.vscode;
  
  // Add private registry configuration
  packageJson.publishConfig = {
    registry: DEPLOY_CONFIG.privateRegistry
  };
  
  // Write updated package.json
  fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));
  
  // Build the extension
  logInfo('Building VS Code Extension...');
  const buildResult = runCommand(`cd ${extensionDir} && npm run build`);
  if (!buildResult.success) {
    throw new Error(`VS Code extension build failed: ${buildResult.error}`);
  }
  
  // Package the extension
  logInfo('Packaging VS Code Extension...');
  const packageResult = runCommand(`cd ${extensionDir} && npx vsce package --out ${DEPLOY_CONFIG.deployDir}/vscode-extension.vsix`);
  if (!packageResult.success) {
    throw new Error(`VS Code extension packaging failed: ${packageResult.error}`);
  }
  
  logSuccess(`Successfully packaged VS Code Extension v${DEPLOY_CONFIG.version}`);
  return { package: 'VS Code Extension', version: DEPLOY_CONFIG.version, success: true };
}

async function deployCursorExtension() {
  logInfo('Deploying Cursor AI Extension...');
  
  const extensionDir = 'packages/cursor-extension';
  const packageJsonPath = path.join(extensionDir, 'package.json');
  
  if (!fs.existsSync(packageJsonPath)) {
    throw new Error('Cursor AI extension package.json not found');
  }
  
  // Read and update package.json
  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
  packageJson.version = DEPLOY_CONFIG.version;
  packageJson.name = DEPLOY_CONFIG.targets.cursor;
  
  // Add private registry configuration
  packageJson.publishConfig = {
    registry: DEPLOY_CONFIG.privateRegistry
  };
  
  // Write updated package.json
  fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));
  
  // Build the extension
  logInfo('Building Cursor AI Extension...');
  const buildResult = runCommand(`cd ${extensionDir} && npm run build`);
  if (!buildResult.success) {
    throw new Error(`Cursor AI extension build failed: ${buildResult.error}`);
  }
  
  // Package the extension
  logInfo('Packaging Cursor AI Extension...');
  const packageResult = runCommand(`cd ${extensionDir} && npx vsce package --out ${DEPLOY_CONFIG.deployDir}/cursor-extension.vsix`);
  if (!packageResult.success) {
    throw new Error(`Cursor AI extension packaging failed: ${packageResult.error}`);
  }
  
  logSuccess(`Successfully packaged Cursor AI Extension v${DEPLOY_CONFIG.version}`);
  return { package: 'Cursor AI Extension', version: DEPLOY_CONFIG.version, success: true };
}

async function deployWebPlatform() {
  logInfo('Deploying Web Platform...');
  
  const webDir = 'packages/web-interface';
  const packageJsonPath = path.join(webDir, 'package.json');
  
  if (!fs.existsSync(packageJsonPath)) {
    throw new Error('Web platform package.json not found');
  }
  
  // Read and update package.json
  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
  packageJson.version = DEPLOY_CONFIG.version;
  packageJson.name = DEPLOY_CONFIG.targets.web;
  
  // Add private registry configuration
  packageJson.publishConfig = {
    registry: DEPLOY_CONFIG.privateRegistry
  };
  
  // Write updated package.json
  fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));
  
  // Create deployment directory
  if (!fs.existsSync(DEPLOY_CONFIG.webDeployDir)) {
    fs.mkdirSync(DEPLOY_CONFIG.webDeployDir, { recursive: true });
  }
  
  // Copy web files
  logInfo('Copying web platform files...');
  const copyResult = runCommand(`cp -r ${webDir}/* ${DEPLOY_CONFIG.webDeployDir}/`);
  if (!copyResult.success) {
    throw new Error(`Web platform copy failed: ${copyResult.error}`);
  }
  
  // Create deployment package
  logInfo('Creating web platform deployment package...');
  const packageResult = runCommand(`cd ${DEPLOY_CONFIG.deployDir} && tar -czf web-platform.tar.gz web-platform/`);
  if (!packageResult.success) {
    throw new Error(`Web platform packaging failed: ${packageResult.error}`);
  }
  
  logSuccess(`Successfully packaged Web Platform v${DEPLOY_CONFIG.version}`);
  return { package: 'Web Platform', version: DEPLOY_CONFIG.version, success: true };
}

// Main deployment function
async function deployAllComponents() {
  log('🚀 Alex AI Private Deployment System', colors.bright);
  log('=====================================', colors.bright);
  
  // Create deployment directory
  if (!fs.existsSync(DEPLOY_CONFIG.deployDir)) {
    fs.mkdirSync(DEPLOY_CONFIG.deployDir, { recursive: true });
  }
  
  const results = [];
  
  try {
    // Deploy NPM packages
    logInfo('Starting NPM package deployment...');
    for (const packageName of DEPLOY_CONFIG.targets.npm) {
      try {
        const result = await deployNPMPackage(packageName);
        results.push(result);
      } catch (error) {
        logError(`Failed to deploy ${packageName}: ${error.message}`);
        results.push({ package: packageName, success: false, error: error.message });
      }
    }
    
    // Deploy VS Code Extension
    logInfo('Starting VS Code Extension deployment...');
    try {
      const result = await deployVSCodeExtension();
      results.push(result);
    } catch (error) {
      logError(`Failed to deploy VS Code Extension: ${error.message}`);
      results.push({ package: 'VS Code Extension', success: false, error: error.message });
    }
    
    // Deploy Cursor AI Extension
    logInfo('Starting Cursor AI Extension deployment...');
    try {
      const result = await deployCursorExtension();
      results.push(result);
    } catch (error) {
      logError(`Failed to deploy Cursor AI Extension: ${error.message}`);
      results.push({ package: 'Cursor AI Extension', success: false, error: error.message });
    }
    
    // Deploy Web Platform
    logInfo('Starting Web Platform deployment...');
    try {
      const result = await deployWebPlatform();
      results.push(result);
    } catch (error) {
      logError(`Failed to deploy Web Platform: ${error.message}`);
      results.push({ package: 'Web Platform', success: false, error: error.message });
    }
    
    // Generate deployment report
    const successfulDeployments = results.filter(r => r.success);
    const failedDeployments = results.filter(r => !r.success);
    
    log('📊 Deployment Summary', colors.bright);
    log('====================', colors.bright);
    log(`✅ Successful: ${successfulDeployments.length}/${results.length}`);
    log(`❌ Failed: ${failedDeployments.length}/${results.length}`);
    
    if (successfulDeployments.length > 0) {
      log('\n✅ Successful Deployments:', colors.green);
      successfulDeployments.forEach(result => {
        log(`  • ${result.package} v${result.version}`, colors.green);
      });
    }
    
    if (failedDeployments.length > 0) {
      log('\n❌ Failed Deployments:', colors.red);
      failedDeployments.forEach(result => {
        log(`  • ${result.package}: ${result.error}`, colors.red);
      });
    }
    
    // Save deployment results
    const deploymentResults = {
      timestamp: new Date().toISOString(),
      version: DEPLOY_CONFIG.version,
      successful: successfulDeployments,
      failed: failedDeployments,
      total: results.length,
      successRate: `${Math.round((successfulDeployments.length / results.length) * 100)}%`
    };
    
    fs.writeFileSync(
      path.join(DEPLOY_CONFIG.deployDir, 'deployment-results.json'),
      JSON.stringify(deploymentResults, null, 2)
    );
    
    log(`\n📁 Deployment files saved to: ${DEPLOY_CONFIG.deployDir}`, colors.cyan);
    log(`📝 Deployment log saved to: ${DEPLOY_CONFIG.logFile}`, colors.cyan);
    
    if (successfulDeployments.length === results.length) {
      logSuccess('🎉 All components deployed successfully!');
      logSuccess('Alex AI is ready for controlled testing!');
    } else {
      logWarning('⚠️  Some components failed to deploy. Check the log for details.');
    }
    
  } catch (error) {
    logError(`Deployment failed: ${error.message}`);
    process.exit(1);
  }
}

// Run deployment
if (require.main === module) {
  deployAllComponents().catch(error => {
    logError(`Deployment system failed: ${error.message}`);
    process.exit(1);
  });
}

module.exports = { deployAllComponents, DEPLOY_CONFIG };
