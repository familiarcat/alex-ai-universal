#!/usr/bin/env node

/**
 * Private Installation Test Script
 * 
 * Tests the private NPM package installation and functionality
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

class PrivateInstallationTester {
  constructor() {
    this.testResults = [];
    this.testDir = path.join(__dirname, '..', 'test-installation');
  }

  async runTests() {
    console.log('🧪 Alex AI Private Installation Test Suite');
    console.log('==========================================\n');

    try {
      // Clean up any existing test directory
      this.cleanupTestDir();

      // Test 1: NPX Installation
      await this.testNPXInstallation();

      // Test 2: Global Installation
      await this.testGlobalInstallation();

      // Test 3: Local Installation
      await this.testLocalInstallation();

      // Test 4: Basic Functionality
      await this.testBasicFunctionality();

      // Test 5: Advanced Features
      await this.testAdvancedFeatures();

      // Test 6: Error Handling
      await this.testErrorHandling();

      // Display results
      this.displayResults();

    } catch (error) {
      console.error('❌ Test suite failed:', error.message);
      process.exit(1);
    }
  }

  cleanupTestDir() {
    try {
      if (fs.existsSync(this.testDir)) {
        fs.rmSync(this.testDir, { recursive: true, force: true });
      }
    } catch (error) {
      console.warn('⚠️ Could not clean up test directory:', error.message);
    }
  }

  async testNPXInstallation() {
    console.log('🔍 Testing NPX Installation...');
    
    try {
      const result = execSync('npx alexi@latest --version', { 
        encoding: 'utf8',
        timeout: 30000 
      });
      
      this.testResults.push({
        test: 'NPX Installation',
        status: 'PASS',
        details: `Version: ${result.trim()}`
      });
      
      console.log('✅ NPX installation successful');
      
    } catch (error) {
      this.testResults.push({
        test: 'NPX Installation',
        status: 'FAIL',
        details: error.message
      });
      
      console.log('❌ NPX installation failed:', error.message);
    }
  }

  async testGlobalInstallation() {
    console.log('🔍 Testing Global Installation...');
    
    try {
      // Install globally
      execSync('npm install -g alexi', { 
        encoding: 'utf8',
        timeout: 60000 
      });
      
      // Test global command
      const result = execSync('alexi --version', { 
        encoding: 'utf8',
        timeout: 10000 
      });
      
      this.testResults.push({
        test: 'Global Installation',
        status: 'PASS',
        details: `Version: ${result.trim()}`
      });
      
      console.log('✅ Global installation successful');
      
    } catch (error) {
      this.testResults.push({
        test: 'Global Installation',
        status: 'FAIL',
        details: error.message
      });
      
      console.log('❌ Global installation failed:', error.message);
    }
  }

  async testLocalInstallation() {
    console.log('🔍 Testing Local Installation...');
    
    try {
      // Create test directory
      fs.mkdirSync(this.testDir, { recursive: true });
      process.chdir(this.testDir);
      
      // Initialize npm project
      execSync('npm init -y', { encoding: 'utf8' });
      
      // Install alexi locally
      execSync('npm install alexi', { 
        encoding: 'utf8',
        timeout: 60000 
      });
      
      // Test local installation
      const result = execSync('npx alexi --version', { 
        encoding: 'utf8',
        timeout: 10000 
      });
      
      this.testResults.push({
        test: 'Local Installation',
        status: 'PASS',
        details: `Version: ${result.trim()}`
      });
      
      console.log('✅ Local installation successful');
      
    } catch (error) {
      this.testResults.push({
        test: 'Local Installation',
        status: 'FAIL',
        details: error.message
      });
      
      console.log('❌ Local installation failed:', error.message);
    } finally {
      // Return to original directory
      process.chdir(path.join(__dirname, '..'));
    }
  }

  async testBasicFunctionality() {
    console.log('🔍 Testing Basic Functionality...');
    
    try {
      // Test help command
      const helpResult = execSync('npx alexi --help', { 
        encoding: 'utf8',
        timeout: 10000 
      });
      
      // Test crew command
      const crewResult = execSync('npx alexi crew', { 
        encoding: 'utf8',
        timeout: 10000 
      });
      
      // Test status command
      const statusResult = execSync('npx alexi status', { 
        encoding: 'utf8',
        timeout: 10000 
      });
      
      this.testResults.push({
        test: 'Basic Functionality',
        status: 'PASS',
        details: 'Help, crew, and status commands working'
      });
      
      console.log('✅ Basic functionality successful');
      
    } catch (error) {
      this.testResults.push({
        test: 'Basic Functionality',
        status: 'FAIL',
        details: error.message
      });
      
      console.log('❌ Basic functionality failed:', error.message);
    }
  }

  async testAdvancedFeatures() {
    console.log('🔍 Testing Advanced Features...');
    
    try {
      // Test unified system status
      const unifiedStatus = execSync('npx alexi unified-system status', { 
        encoding: 'utf8',
        timeout: 15000 
      });
      
      // Test learning model verification
      const learningModel = execSync('npx alexi learning-model verify-status', { 
        encoding: 'utf8',
        timeout: 15000 
      });
      
      this.testResults.push({
        test: 'Advanced Features',
        status: 'PASS',
        details: 'Unified system and learning model commands working'
      });
      
      console.log('✅ Advanced features successful');
      
    } catch (error) {
      this.testResults.push({
        test: 'Advanced Features',
        status: 'FAIL',
        details: error.message
      });
      
      console.log('❌ Advanced features failed:', error.message);
    }
  }

  async testErrorHandling() {
    console.log('🔍 Testing Error Handling...');
    
    try {
      // Test invalid command
      try {
        execSync('npx alexi invalid-command', { 
          encoding: 'utf8',
          timeout: 5000 
        });
      } catch (error) {
        // Expected to fail
        if (error.message.includes('Unknown command')) {
          this.testResults.push({
            test: 'Error Handling',
            status: 'PASS',
            details: 'Invalid commands handled gracefully'
          });
          console.log('✅ Error handling successful');
          return;
        }
      }
      
      this.testResults.push({
        test: 'Error Handling',
        status: 'FAIL',
        details: 'Error handling not working as expected'
      });
      
      console.log('❌ Error handling failed');
      
    } catch (error) {
      this.testResults.push({
        test: 'Error Handling',
        status: 'FAIL',
        details: error.message
      });
      
      console.log('❌ Error handling test failed:', error.message);
    }
  }

  displayResults() {
    console.log('\n📊 Test Results Summary');
    console.log('========================\n');
    
    const passed = this.testResults.filter(r => r.status === 'PASS').length;
    const failed = this.testResults.filter(r => r.status === 'FAIL').length;
    const total = this.testResults.length;
    
    console.log(`Total Tests: ${total}`);
    console.log(`Passed: ${passed} ✅`);
    console.log(`Failed: ${failed} ❌`);
    console.log(`Success Rate: ${Math.round((passed / total) * 100)}%\n`);
    
    console.log('Detailed Results:');
    this.testResults.forEach(result => {
      const emoji = result.status === 'PASS' ? '✅' : '❌';
      console.log(`${emoji} ${result.test}: ${result.status}`);
      console.log(`   ${result.details}\n`);
    });
    
    if (failed === 0) {
      console.log('🎉 All tests passed! Private package is ready for use.');
    } else {
      console.log('⚠️ Some tests failed. Review and fix before public release.');
    }
  }
}

// Run the test suite
new PrivateInstallationTester().runTests();









