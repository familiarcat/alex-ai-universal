#!/usr/bin/env node

/**
 * Alex AI Safety Demo
 * 
 * Demonstrates the safety features that prevent file system corruption and bloat
 */

const { AlexAISafetyManager } = require('../packages/core/dist/index.js');
const fs = require('fs');
const path = require('path');

class SafetyDemo {
  constructor() {
    this.safetyManager = new AlexAISafetyManager();
    this.demoDir = path.join(__dirname, '..', 'safety-demo');
  }

  async run() {
    console.log('🛡️ Alex AI Safety Demo');
    console.log('=====================\n');

    try {
      // Create demo directory
      await this.createDemoDirectory();

      // Demonstrate file system safety
      await this.demonstrateFileSystemSafety();

      // Demonstrate resource monitoring
      await this.demonstrateResourceMonitoring();

      // Demonstrate safety configuration
      await this.demonstrateSafetyConfiguration();

      // Show safety report
      await this.showSafetyReport();

      // Cleanup
      await this.cleanup();

      console.log('\n✅ Safety demo completed successfully!');
      console.log('🛡️ Alex AI is safe to use in any project!');

    } catch (error) {
      console.error('❌ Safety demo failed:', error.message);
    }
  }

  async createDemoDirectory() {
    console.log('📁 Creating demo directory...');
    
    if (!fs.existsSync(this.demoDir)) {
      fs.mkdirSync(this.demoDir, { recursive: true });
    }

    // Create some test files
    const testFiles = [
      'test.js',
      'test.txt',
      'test.json',
      'large-file.txt',
      'binary-file.bin'
    ];

    for (const file of testFiles) {
      const filePath = path.join(this.demoDir, file);
      let content = '';

      if (file === 'large-file.txt') {
        // Create a large file (over 10MB)
        content = 'x'.repeat(11 * 1024 * 1024);
      } else if (file === 'binary-file.bin') {
        // Create a binary file
        content = Buffer.from([0x00, 0x01, 0x02, 0x03, 0x04, 0x05]);
      } else {
        content = `// Test file: ${file}\nconsole.log('Hello from ${file}');`;
      }

      fs.writeFileSync(filePath, content);
    }

    console.log('✅ Demo directory created with test files');
  }

  async demonstrateFileSystemSafety() {
    console.log('\n🔒 Demonstrating File System Safety...');

    const testFiles = [
      'test.js',
      'test.txt',
      'large-file.txt',
      'binary-file.bin',
      'nonexistent.txt'
    ];

    for (const file of testFiles) {
      const filePath = path.join(this.demoDir, file);
      console.log(`\n📄 Testing file: ${file}`);

      try {
        const result = await this.safetyManager.safeReadFile(filePath);
        if (result.success) {
          console.log(`  ✅ Safe to read: ${result.content.length} characters`);
        } else {
          console.log(`  ❌ Unsafe to read: ${result.reason}`);
        }
      } catch (error) {
        console.log(`  ❌ Error: ${error.message}`);
      }
    }
  }

  async demonstrateResourceMonitoring() {
    console.log('\n💾 Demonstrating Resource Monitoring...');

    // Show current resource usage
    const usage = this.safetyManager.resourceMonitor.getCurrentUsage();
    console.log(`  📊 Current Memory Usage: ${usage.memoryUsage}MB`);
    console.log(`  📊 Current CPU Usage: ${usage.cpuUsage}%`);
    console.log(`  📊 Current Disk Usage: ${usage.diskUsage}MB`);

    // Check if within limits
    const withinLimits = this.safetyManager.resourceMonitor.isWithinLimits();
    console.log(`  ${withinLimits ? '✅' : '⚠️'} Resources within limits: ${withinLimits}`);

    // Show resource summary
    console.log('\n📊 Resource Summary:');
    console.log(this.safetyManager.resourceMonitor.getUsageSummary());
  }

  async demonstrateSafetyConfiguration() {
    console.log('\n⚙️ Demonstrating Safety Configuration...');

    // Show current configuration
    const status = this.safetyManager.getSafetyStatus();
    console.log(`  🔒 Read-only mode: ${status.general.readOnlyMode ? 'Enabled' : 'Disabled'}`);
    console.log(`  📊 Max file size: ${Math.round(status.fileSystem.config.maxFileSize / 1024 / 1024)}MB`);
    console.log(`  📊 Max memory usage: ${status.resources.limits.maxMemoryUsage}MB`);
    console.log(`  📊 Max operations per minute: ${status.general.maxOperationsPerMinute}`);

    // Test operation rate limiting
    console.log('\n🔄 Testing operation rate limiting...');
    for (let i = 0; i < 5; i++) {
      const safetyCheck = await this.safetyManager.isOperationSafe('read');
      console.log(`  Operation ${i + 1}: ${safetyCheck.safe ? '✅ Safe' : '❌ Blocked'}`);
    }
  }

  async showSafetyReport() {
    console.log('\n📋 Safety Report:');
    console.log('================');
    console.log(this.safetyManager.getSafetyReport());
  }

  async cleanup() {
    console.log('\n🧹 Cleaning up demo...');
    
    // Clean up safety manager
    this.safetyManager.cleanup();

    // Remove demo directory
    if (fs.existsSync(this.demoDir)) {
      fs.rmSync(this.demoDir, { recursive: true, force: true });
    }

    console.log('✅ Cleanup completed');
  }
}

// Run the safety demo
new SafetyDemo().run();







