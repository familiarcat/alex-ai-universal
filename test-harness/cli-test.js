#!/usr/bin/env node

/**
 * Alex AI CLI Test Harness
 * 
 * Comprehensive testing for CLI interface functionality
 */

const { spawn, exec } = require('child_process');
const fs = require('fs');
const path = require('path');
const chalk = require('chalk');

class AlexAICLITest {
  constructor() {
    this.projectRoot = process.cwd();
    this.cliPath = path.join(this.projectRoot, 'packages/cli/dist/simple-cli.js');
    this.testResults = [];
  }

  async runAllTests() {
    console.log(chalk.blue.bold('\n🧪 Alex AI CLI Test Harness'));
    console.log(chalk.gray('============================\n'));

    // Check if CLI exists
    if (!fs.existsSync(this.cliPath)) {
      console.log(chalk.red('❌ CLI binary not found. Building...'));
      await this.buildCLI();
    }

    // Run CLI tests
    await this.testBasicCommands();
    await this.testHelpSystem();
    await this.testVersionInfo();
    await this.testCrewCommands();
    await this.testSecurityCommands();
    await this.testErrorHandling();

    this.generateReport();
  }

  async buildCLI() {
    console.log(chalk.yellow('🔨 Building CLI...'));
    
    return new Promise((resolve, reject) => {
      const process = spawn('npm', ['run', 'build:cli'], {
        cwd: this.projectRoot,
        stdio: 'pipe'
      });

      let output = '';
      let error = '';

      process.stdout.on('data', (data) => {
        output += data.toString();
      });

      process.stderr.on('data', (data) => {
        error += data.toString();
      });

      process.on('close', (code) => {
        if (code === 0) {
          console.log(chalk.green('✅ CLI built successfully'));
          resolve();
        } else {
          console.log(chalk.red('❌ CLI build failed:'), error);
          reject(new Error('CLI build failed'));
        }
      });
    });
  }

  async testBasicCommands() {
    console.log(chalk.yellow('🧪 Testing Basic Commands...'));

    const commands = [
      { cmd: ['help'], name: 'Help Command' },
      { cmd: ['version'], name: 'Version Command' },
      { cmd: ['status'], name: 'Status Command' },
      { cmd: ['crew'], name: 'Crew Command' }
    ];

    for (const command of commands) {
      await this.testCommand(command.cmd, command.name);
    }
  }

  async testHelpSystem() {
    console.log(chalk.yellow('🧪 Testing Help System...'));

    const helpTests = [
      { cmd: ['help'], expected: 'Alex AI' },
      { cmd: ['help', 'crew'], expected: 'crew' },
      { cmd: ['help', 'security'], expected: 'security' },
      { cmd: ['help', 'n8n'], expected: 'n8n' }
    ];

    for (const test of helpTests) {
      await this.testCommandWithOutput(test.cmd, test.expected, `Help: ${test.cmd.join(' ')}`);
    }
  }

  async testVersionInfo() {
    console.log(chalk.yellow('🧪 Testing Version Information...'));

    await this.testCommandWithOutput(['version'], /\d+\.\d+\.\d+/, 'Version Format');
  }

  async testCrewCommands() {
    console.log(chalk.yellow('🧪 Testing Crew Commands...'));

    const crewTests = [
      { cmd: ['crew'], name: 'Crew List' },
      { cmd: ['crew', 'status'], name: 'Crew Status' },
      { cmd: ['crew', 'help'], name: 'Crew Help' }
    ];

    for (const test of crewTests) {
      await this.testCommand(test.cmd, test.name);
    }
  }

  async testSecurityCommands() {
    console.log(chalk.yellow('🧪 Testing Security Commands...'));

    const securityTests = [
      { cmd: ['enterprise-security', 'help'], name: 'Enterprise Security Help' },
      { cmd: ['n8n-security-integration', 'help'], name: 'N8N Security Help' }
    ];

    for (const test of securityTests) {
      await this.testCommand(test.cmd, test.name);
    }
  }

  async testErrorHandling() {
    console.log(chalk.yellow('🧪 Testing Error Handling...'));

    const errorTests = [
      { cmd: ['invalid-command'], name: 'Invalid Command' },
      { cmd: ['crew', 'invalid-subcommand'], name: 'Invalid Subcommand' }
    ];

    for (const test of errorTests) {
      await this.testCommandExpectingError(test.cmd, test.name);
    }
  }

  async testCommand(args, testName) {
    return new Promise((resolve) => {
      const process = spawn('node', [this.cliPath, ...args], {
        cwd: this.projectRoot,
        stdio: 'pipe'
      });

      let output = '';
      let error = '';

      process.stdout.on('data', (data) => {
        output += data.toString();
      });

      process.stderr.on('data', (data) => {
        error += data.toString();
      });

      process.on('close', (code) => {
        const success = code === 0;
        this.recordTest(testName, success, success ? 'Command executed successfully' : `Command failed: ${error}`);
        resolve();
      });

      process.on('error', (err) => {
        this.recordTest(testName, false, `Process error: ${err.message}`);
        resolve();
      });

      // Timeout after 15 seconds
      setTimeout(() => {
        process.kill();
        this.recordTest(testName, false, 'Command timeout');
        resolve();
      }, 15000);
    });
  }

  async testCommandWithOutput(args, expected, testName) {
    return new Promise((resolve) => {
      const process = spawn('node', [this.cliPath, ...args], {
        cwd: this.projectRoot,
        stdio: 'pipe'
      });

      let output = '';
      let error = '';

      process.stdout.on('data', (data) => {
        output += data.toString();
      });

      process.stderr.on('data', (data) => {
        error += data.toString();
      });

      process.on('close', (code) => {
        const success = code === 0 && (typeof expected === 'string' ? output.includes(expected) : expected.test(output));
        this.recordTest(testName, success, success ? 'Expected output found' : `Expected output not found. Got: ${output.substring(0, 100)}...`);
        resolve();
      });

      process.on('error', (err) => {
        this.recordTest(testName, false, `Process error: ${err.message}`);
        resolve();
      });

      // Timeout after 15 seconds
      setTimeout(() => {
        process.kill();
        this.recordTest(testName, false, 'Command timeout');
        resolve();
      }, 15000);
    });
  }

  async testCommandExpectingError(args, testName) {
    return new Promise((resolve) => {
      const process = spawn('node', [this.cliPath, ...args], {
        cwd: this.projectRoot,
        stdio: 'pipe'
      });

      let output = '';
      let error = '';

      process.stdout.on('data', (data) => {
        output += data.toString();
      });

      process.stderr.on('data', (data) => {
        error += data.toString();
      });

      process.on('close', (code) => {
        const success = code !== 0; // Expecting non-zero exit code
        this.recordTest(testName, success, success ? 'Error handled correctly' : 'Expected error but command succeeded');
        resolve();
      });

      process.on('error', (err) => {
        this.recordTest(testName, true, `Process error (expected): ${err.message}`);
        resolve();
      });

      // Timeout after 15 seconds
      setTimeout(() => {
        process.kill();
        this.recordTest(testName, false, 'Command timeout');
        resolve();
      }, 15000);
    });
  }

  recordTest(name, success, message) {
    this.testResults.push({ name, success, message });
    
    if (success) {
      console.log(chalk.green(`  ✅ ${name}: ${message}`));
    } else {
      console.log(chalk.red(`  ❌ ${name}: ${message}`));
    }
  }

  generateReport() {
    const passed = this.testResults.filter(t => t.success).length;
    const failed = this.testResults.filter(t => !t.success).length;
    const total = this.testResults.length;
    const percentage = total > 0 ? ((passed / total) * 100).toFixed(1) : 0;

    console.log(chalk.blue.bold('\n📊 CLI Test Results'));
    console.log(chalk.gray('==================\n'));
    console.log(`Passed: ${chalk.green(passed)} | Failed: ${chalk.red(failed)} | Total: ${total} | Success Rate: ${chalk.cyan(percentage)}%`);

    if (failed > 0) {
      console.log(chalk.red('\nFailed Tests:'));
      this.testResults.filter(t => !t.success).forEach(test => {
        console.log(chalk.red(`  - ${test.name}: ${test.message}`));
      });
    }

    // Save results
    const reportPath = path.join(this.projectRoot, 'cli-test-results.json');
    fs.writeFileSync(reportPath, JSON.stringify({
      timestamp: new Date().toISOString(),
      summary: { passed, failed, total, percentage },
      results: this.testResults
    }, null, 2));

    console.log(chalk.gray(`\n📄 Detailed report saved to: ${reportPath}`));
  }
}

// Run CLI tests
if (require.main === module) {
  const cliTest = new AlexAICLITest();
  cliTest.runAllTests().catch(console.error);
}

module.exports = AlexAICLITest;



<<<<<<< HEAD

=======
>>>>>>> ab4898606e192fe0b56b73b7224a3746d57250d5
