#!/usr/bin/env node

/**
 * Alex AI Complete Deployment and Testing Orchestrator
 * ====================================================
 * 
 * This script orchestrates the complete deployment and testing of all Alex AI components:
 * 1. Deploy private versions of all components
 * 2. Set up controlled testing environment
 * 3. Run comprehensive tests
 * 4. Generate deployment and testing reports
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Import deployment and testing modules
const { deployAllComponents, DEPLOY_CONFIG } = require('./deploy-private-alex-ai');
const { setupTestingEnvironment, TEST_CONFIG } = require('./setup-testing-environment');

// Configuration
const ORCHESTRATOR_CONFIG = {
  // Deployment and testing phases
  phases: [
    'deployment',
    'testing-setup',
    'testing-execution',
    'reporting'
  ],
  
  // Timeouts
  phaseTimeout: 600000, // 10 minutes per phase
  totalTimeout: 2400000, // 40 minutes total
  
  // Reporting
  reportDir: './deployment-reports',
  logFile: './deployment-reports/orchestrator.log',
  
  // Testing
  testTimeout: 300000, // 5 minutes for testing
  maxTestRetries: 3
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
  if (!fs.existsSync(path.dirname(ORCHESTRATOR_CONFIG.logFile))) {
    fs.mkdirSync(path.dirname(ORCHESTRATOR_CONFIG.logFile), { recursive: true });
  }
  fs.appendFileSync(ORCHESTRATOR_CONFIG.logFile, logMessage + '\n');
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

function logPhase(message) {
  log(`🚀 ${message}`, colors.magenta);
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

function createReportDirectory() {
  if (!fs.existsSync(ORCHESTRATOR_CONFIG.reportDir)) {
    fs.mkdirSync(ORCHESTRATOR_CONFIG.reportDir, { recursive: true });
    logSuccess(`Created report directory: ${ORCHESTRATOR_CONFIG.reportDir}`);
  }
}

// Phase execution functions
async function executeDeploymentPhase() {
  logPhase('PHASE 1: DEPLOYMENT');
  log('========================', colors.bright);
  
  const startTime = Date.now();
  
  try {
    logInfo('Starting deployment of all Alex AI components...');
    const deploymentResults = await deployAllComponents();
    
    const endTime = Date.now();
    const duration = endTime - startTime;
    
    logSuccess(`Deployment phase completed in ${duration}ms`);
    
    return {
      phase: 'deployment',
      success: true,
      duration,
      results: deploymentResults,
      timestamp: new Date().toISOString()
    };
    
  } catch (error) {
    const endTime = Date.now();
    const duration = endTime - startTime;
    
    logError(`Deployment phase failed: ${error.message}`);
    
    return {
      phase: 'deployment',
      success: false,
      duration,
      error: error.message,
      timestamp: new Date().toISOString()
    };
  }
}

async function executeTestingSetupPhase() {
  logPhase('PHASE 2: TESTING SETUP');
  log('===========================', colors.bright);
  
  const startTime = Date.now();
  
  try {
    logInfo('Setting up controlled testing environment...');
    await setupTestingEnvironment();
    
    const endTime = Date.now();
    const duration = endTime - startTime;
    
    logSuccess(`Testing setup phase completed in ${duration}ms`);
    
    return {
      phase: 'testing-setup',
      success: true,
      duration,
      timestamp: new Date().toISOString()
    };
    
  } catch (error) {
    const endTime = Date.now();
    const duration = endTime - startTime;
    
    logError(`Testing setup phase failed: ${error.message}`);
    
    return {
      phase: 'testing-setup',
      success: false,
      duration,
      error: error.message,
      timestamp: new Date().toISOString()
    };
  }
}

async function executeTestingExecutionPhase() {
  logPhase('PHASE 3: TESTING EXECUTION');
  log('===============================', colors.bright);
  
  const startTime = Date.now();
  
  try {
    logInfo('Running comprehensive tests...');
    
    const testResults = [];
    
    // Test 1: NPM Package Installation
    logInfo('Testing NPM package installation...');
    const npmTestResult = runCommand('cd testing-environment && npm install', ORCHESTRATOR_CONFIG.testTimeout);
    testResults.push({
      test: 'NPM Package Installation',
      success: npmTestResult.success,
      error: npmTestResult.error
    });
    
    // Test 2: VS Code Extension
    logInfo('Testing VS Code extension...');
    const vscodeTestResult = runCommand('code --version', ORCHESTRATOR_CONFIG.testTimeout);
    testResults.push({
      test: 'VS Code Extension',
      success: vscodeTestResult.success,
      error: vscodeTestResult.error
    });
    
    // Test 3: Cursor AI Extension
    logInfo('Testing Cursor AI extension...');
    const cursorTestResult = runCommand('cursor --version', ORCHESTRATOR_CONFIG.testTimeout);
    testResults.push({
      test: 'Cursor AI Extension',
      success: cursorTestResult.success,
      error: cursorTestResult.error
    });
    
    // Test 4: Web Platform
    logInfo('Testing Web Platform...');
    const webTestResult = runCommand('cd testing-environment/web-platform && npm start &', ORCHESTRATOR_CONFIG.testTimeout);
    testResults.push({
      test: 'Web Platform',
      success: webTestResult.success,
      error: webTestResult.error
    });
    
    // Test 5: Alex AI CLI
    logInfo('Testing Alex AI CLI...');
    const cliTestResult = runCommand('cd testing-environment && npx @alex-ai/cli --version', ORCHESTRATOR_CONFIG.testTimeout);
    testResults.push({
      test: 'Alex AI CLI',
      success: cliTestResult.success,
      error: cliTestResult.error
    });
    
    // Test 6: End-to-End Integration
    logInfo('Testing end-to-end integration...');
    const e2eTestResult = runCommand('node scripts/end-to-end-test-system.js', ORCHESTRATOR_CONFIG.testTimeout);
    testResults.push({
      test: 'End-to-End Integration',
      success: e2eTestResult.success,
      error: e2eTestResult.error
    });
    
    const endTime = Date.now();
    const duration = endTime - startTime;
    
    const successfulTests = testResults.filter(t => t.success).length;
    const totalTests = testResults.length;
    const successRate = Math.round((successfulTests / totalTests) * 100);
    
    logSuccess(`Testing execution phase completed in ${duration}ms`);
    logSuccess(`Test Results: ${successfulTests}/${totalTests} (${successRate}%)`);
    
    return {
      phase: 'testing-execution',
      success: true,
      duration,
      testResults,
      successRate,
      timestamp: new Date().toISOString()
    };
    
  } catch (error) {
    const endTime = Date.now();
    const duration = endTime - startTime;
    
    logError(`Testing execution phase failed: ${error.message}`);
    
    return {
      phase: 'testing-execution',
      success: false,
      duration,
      error: error.message,
      timestamp: new Date().toISOString()
    };
  }
}

async function executeReportingPhase(phaseResults) {
  logPhase('PHASE 4: REPORTING');
  log('======================', colors.bright);
  
  const startTime = Date.now();
  
  try {
    logInfo('Generating comprehensive deployment and testing reports...');
    
    // Generate deployment report
    const deploymentReport = {
      title: 'Alex AI Private Deployment Report',
      timestamp: new Date().toISOString(),
      version: '1.0.0-private',
      phases: phaseResults,
      summary: {
        totalPhases: phaseResults.length,
        successfulPhases: phaseResults.filter(p => p.success).length,
        failedPhases: phaseResults.filter(p => !p.success).length,
        totalDuration: phaseResults.reduce((sum, p) => sum + p.duration, 0),
        overallSuccess: phaseResults.every(p => p.success)
      }
    };
    
    const deploymentReportPath = path.join(ORCHESTRATOR_CONFIG.reportDir, 'deployment-report.json');
    fs.writeFileSync(deploymentReportPath, JSON.stringify(deploymentReport, null, 2));
    logSuccess(`Deployment report saved: ${deploymentReportPath}`);
    
    // Generate testing report
    const testingPhase = phaseResults.find(p => p.phase === 'testing-execution');
    const testingReport = {
      title: 'Alex AI Testing Report',
      timestamp: new Date().toISOString(),
      version: '1.0.0-private',
      testResults: testingPhase?.testResults || [],
      summary: {
        totalTests: testingPhase?.testResults?.length || 0,
        successfulTests: testingPhase?.testResults?.filter(t => t.success).length || 0,
        successRate: testingPhase?.successRate || 0,
        duration: testingPhase?.duration || 0
      }
    };
    
    const testingReportPath = path.join(ORCHESTRATOR_CONFIG.reportDir, 'testing-report.json');
    fs.writeFileSync(testingReportPath, JSON.stringify(testingReport, null, 2));
    logSuccess(`Testing report saved: ${testingReportPath}`);
    
    // Generate comprehensive summary
    const comprehensiveSummary = {
      title: 'Alex AI Complete Deployment and Testing Summary',
      timestamp: new Date().toISOString(),
      version: '1.0.0-private',
      deployment: {
        status: deploymentReport.summary.overallSuccess ? 'SUCCESS' : 'FAILED',
        phases: deploymentReport.summary.successfulPhases,
        totalPhases: deploymentReport.summary.totalPhases,
        duration: deploymentReport.summary.totalDuration
      },
      testing: {
        status: testingPhase?.success ? 'SUCCESS' : 'FAILED',
        successRate: testingPhase?.successRate || 0,
        totalTests: testingPhase?.testResults?.length || 0,
        duration: testingPhase?.duration || 0
      },
      components: [
        'NPM Packages (@alex-ai/core, @alex-ai/cli)',
        'VS Code Extension (@alex-ai/vscode)',
        'Cursor AI Extension (@alex-ai/cursor)',
        'Web Platform (@alex-ai/web)'
      ],
      nextSteps: [
        'Configure environment variables in testing-environment/.env',
        'Start testing environment with ./testing-environment/start.sh',
        'Run tests with ./testing-environment/test.sh',
        'Monitor logs for any issues',
        'Report feedback and issues'
      ]
    };
    
    const summaryPath = path.join(ORCHESTRATOR_CONFIG.reportDir, 'comprehensive-summary.json');
    fs.writeFileSync(summaryPath, JSON.stringify(comprehensiveSummary, null, 2));
    logSuccess(`Comprehensive summary saved: ${summaryPath}`);
    
    const endTime = Date.now();
    const duration = endTime - startTime;
    
    logSuccess(`Reporting phase completed in ${duration}ms`);
    
    return {
      phase: 'reporting',
      success: true,
      duration,
      reports: [
        deploymentReportPath,
        testingReportPath,
        summaryPath
      ],
      timestamp: new Date().toISOString()
    };
    
  } catch (error) {
    const endTime = Date.now();
    const duration = endTime - startTime;
    
    logError(`Reporting phase failed: ${error.message}`);
    
    return {
      phase: 'reporting',
      success: false,
      duration,
      error: error.message,
      timestamp: new Date().toISOString()
    };
  }
}

// Main orchestration function
async function orchestrateDeploymentAndTesting() {
  log('🎯 Alex AI Complete Deployment and Testing Orchestrator', colors.bright);
  log('=======================================================', colors.bright);
  
  const overallStartTime = Date.now();
  const phaseResults = [];
  
  try {
    // Create report directory
    createReportDirectory();
    
    // Execute all phases
    for (const phase of ORCHESTRATOR_CONFIG.phases) {
      logPhase(`Starting ${phase} phase...`);
      
      let phaseResult;
      switch (phase) {
        case 'deployment':
          phaseResult = await executeDeploymentPhase();
          break;
        case 'testing-setup':
          phaseResult = await executeTestingSetupPhase();
          break;
        case 'testing-execution':
          phaseResult = await executeTestingExecutionPhase();
          break;
        case 'reporting':
          phaseResult = await executeReportingPhase(phaseResults);
          break;
        default:
          throw new Error(`Unknown phase: ${phase}`);
      }
      
      phaseResults.push(phaseResult);
      
      if (!phaseResult.success) {
        logError(`Phase ${phase} failed: ${phaseResult.error}`);
        break;
      }
    }
    
    const overallEndTime = Date.now();
    const overallDuration = overallEndTime - overallStartTime;
    
    // Final summary
    const successfulPhases = phaseResults.filter(p => p.success).length;
    const totalPhases = phaseResults.length;
    const overallSuccess = phaseResults.every(p => p.success);
    
    log('📊 FINAL SUMMARY', colors.bright);
    log('================', colors.bright);
    log(`✅ Successful phases: ${successfulPhases}/${totalPhases}`);
    log(`⏱️  Total duration: ${overallDuration}ms`);
    log(`🎯 Overall success: ${overallSuccess ? 'YES' : 'NO'}`);
    
    if (overallSuccess) {
      logSuccess('🎉 Alex AI deployment and testing completed successfully!');
      logInfo('Next steps:');
      logInfo('1. Check deployment reports in ./deployment-reports/');
      logInfo('2. Configure testing environment in ./testing-environment/');
      logInfo('3. Start testing with ./testing-environment/start.sh');
    } else {
      logError('❌ Alex AI deployment and testing failed!');
      logInfo('Check the logs for details on what went wrong.');
    }
    
    return {
      success: overallSuccess,
      duration: overallDuration,
      phases: phaseResults,
      timestamp: new Date().toISOString()
    };
    
  } catch (error) {
    const overallEndTime = Date.now();
    const overallDuration = overallEndTime - overallStartTime;
    
    logError(`Orchestration failed: ${error.message}`);
    
    return {
      success: false,
      duration: overallDuration,
      error: error.message,
      phases: phaseResults,
      timestamp: new Date().toISOString()
    };
  }
}

// Run orchestration
if (require.main === module) {
  orchestrateDeploymentAndTesting().catch(error => {
    logError(`Orchestration system failed: ${error.message}`);
    process.exit(1);
  });
}

module.exports = { orchestrateDeploymentAndTesting, ORCHESTRATOR_CONFIG };
