#!/usr/bin/env node

/**
 * Alex AI Universal Test Suite
 * 
 * Comprehensive test harness for all Alex AI formats:
 * - CLI Interface
 * - VSCode Extension
 * - Cursor AI Extension
 * - Web Interface
 * - Core Library
 */

const fs = require('fs');
const path = require('path');
const { spawn, exec } = require('child_process');
const chalk = require('chalk');

class AlexAITestSuite {
  constructor() {
    this.testResults = {
      cli: { passed: 0, failed: 0, tests: [] },
      vscode: { passed: 0, failed: 0, tests: [] },
      cursor: { passed: 0, failed: 0, tests: [] },
      web: { passed: 0, failed: 0, tests: [] },
      core: { passed: 0, failed: 0, tests: [] }
    };
    this.projectRoot = process.cwd();
  }

  /**
   * Run all tests
   */
  async runAllTests() {
    console.log(chalk.blue.bold('\n🚀 Alex AI Universal Test Suite'));
    console.log(chalk.gray('====================================\n'));

    try {
      // Test Core Library
      await this.testCoreLibrary();
      
      // Test CLI Interface
      await this.testCLIInterface();
      
      // Test VSCode Extension
      await this.testVSCodeExtension();
      
      // Test Cursor AI Extension
      await this.testCursorAIExtension();
      
      // Test Web Interface
      await this.testWebInterface();
      
      // Generate comprehensive report
      this.generateTestReport();
      
    } catch (error) {
      console.error(chalk.red('❌ Test suite failed:'), error.message);
      process.exit(1);
    }
  }

  /**
   * Test Core Library
   */
  async testCoreLibrary() {
    console.log(chalk.yellow('🧪 Testing Core Library...'));
    
    const tests = [
      {
        name: 'Core Library Import',
        test: () => {
          try {
            const corePath = path.join(this.projectRoot, 'packages/core/dist/index.js');
            if (fs.existsSync(corePath)) {
              return { success: true, message: 'Core library file exists' };
            } else {
              return { success: false, message: 'Core library file not found' };
            }
          } catch (error) {
            return { success: false, message: error.message };
          }
        }
      },
      {
        name: 'TypeScript Compilation',
        test: () => {
          try {
            const distPath = path.join(this.projectRoot, 'packages/core/dist');
            if (fs.existsSync(distPath)) {
              const files = fs.readdirSync(distPath);
              const jsFiles = files.filter(f => f.endsWith('.js'));
              return { 
                success: jsFiles.length > 0, 
                message: `Found ${jsFiles.length} compiled JS files` 
              };
            } else {
              return { success: false, message: 'Dist directory not found' };
            }
          } catch (error) {
            return { success: false, message: error.message };
          }
        }
      },
      {
        name: 'Package Dependencies',
        test: () => {
          try {
            const packageJsonPath = path.join(this.projectRoot, 'packages/core/package.json');
            if (fs.existsSync(packageJsonPath)) {
              const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
              const hasDependencies = packageJson.dependencies && Object.keys(packageJson.dependencies).length > 0;
              return { 
                success: hasDependencies, 
                message: `Package has ${Object.keys(packageJson.dependencies || {}).length} dependencies` 
              };
            } else {
              return { success: false, message: 'Package.json not found' };
            }
          } catch (error) {
            return { success: false, message: error.message };
          }
        }
      }
    ];

    for (const test of tests) {
      const result = test.test();
      this.recordTestResult('core', test.name, result);
    }
  }

  /**
   * Test CLI Interface
   */
  async testCLIInterface() {
    console.log(chalk.yellow('🧪 Testing CLI Interface...'));
    
    const tests = [
      {
        name: 'CLI Binary Exists',
        test: () => {
          try {
            const cliPath = path.join(this.projectRoot, 'packages/cli/dist/simple-cli.js');
            if (fs.existsSync(cliPath)) {
              return { success: true, message: 'CLI binary exists' };
            } else {
              return { success: false, message: 'CLI binary not found' };
            }
          } catch (error) {
            return { success: false, message: error.message };
          }
        }
      },
      {
        name: 'CLI Help Command',
        test: () => {
          return new Promise((resolve) => {
            const cliPath = path.join(this.projectRoot, 'packages/cli/dist/simple-cli.js');
            if (!fs.existsSync(cliPath)) {
              resolve({ success: false, message: 'CLI binary not found' });
              return;
            }

            const process = spawn('node', [cliPath, 'help'], { 
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
              if (code === 0 && output.includes('Alex AI')) {
                resolve({ success: true, message: 'CLI help command works' });
              } else {
                resolve({ success: false, message: `CLI help failed: ${error || output}` });
              }
            });

            process.on('error', (err) => {
              resolve({ success: false, message: `CLI process error: ${err.message}` });
            });

            // Timeout after 10 seconds
            setTimeout(() => {
              process.kill();
              resolve({ success: false, message: 'CLI help command timeout' });
            }, 10000);
          });
        }
      },
      {
        name: 'CLI Version Command',
        test: () => {
          return new Promise((resolve) => {
            const cliPath = path.join(this.projectRoot, 'packages/cli/dist/simple-cli.js');
            if (!fs.existsSync(cliPath)) {
              resolve({ success: false, message: 'CLI binary not found' });
              return;
            }

            const process = spawn('node', [cliPath, 'version'], { 
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
                resolve({ success: true, message: 'CLI version command works' });
              } else {
                resolve({ success: false, message: `CLI version failed: ${error || output}` });
              }
            });

            process.on('error', (err) => {
              resolve({ success: false, message: `CLI process error: ${err.message}` });
            });

            // Timeout after 10 seconds
            setTimeout(() => {
              process.kill();
              resolve({ success: false, message: 'CLI version command timeout' });
            }, 10000);
          });
        }
      }
    ];

    for (const test of tests) {
      const result = await test.test();
      this.recordTestResult('cli', test.name, result);
    }
  }

  /**
   * Test VSCode Extension
   */
  async testVSCodeExtension() {
    console.log(chalk.yellow('🧪 Testing VSCode Extension...'));
    
    const tests = [
      {
        name: 'Extension Package.json',
        test: () => {
          try {
            const packageJsonPath = path.join(this.projectRoot, 'packages/vscode-extension/package.json');
            if (fs.existsSync(packageJsonPath)) {
              const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
              const hasExtensionFields = packageJson.contributes && packageJson.engines;
              return { 
                success: hasExtensionFields, 
                message: 'VSCode extension package.json is valid' 
              };
            } else {
              return { success: false, message: 'VSCode extension package.json not found' };
            }
          } catch (error) {
            return { success: false, message: error.message };
          }
        }
      },
      {
        name: 'Extension Source Files',
        test: () => {
          try {
            const srcPath = path.join(this.projectRoot, 'packages/vscode-extension/src');
            if (fs.existsSync(srcPath)) {
              const files = fs.readdirSync(srcPath);
              const tsFiles = files.filter(f => f.endsWith('.ts'));
              return { 
                success: tsFiles.length > 0, 
                message: `Found ${tsFiles.length} TypeScript source files` 
              };
            } else {
              return { success: false, message: 'VSCode extension src directory not found' };
            }
          } catch (error) {
            return { success: false, message: error.message };
          }
        }
      },
      {
        name: 'Extension Build Output',
        test: () => {
          try {
            const distPath = path.join(this.projectRoot, 'packages/vscode-extension/dist');
            if (fs.existsSync(distPath)) {
              const files = fs.readdirSync(distPath);
              const jsFiles = files.filter(f => f.endsWith('.js'));
              return { 
                success: jsFiles.length > 0, 
                message: `Found ${jsFiles.length} compiled extension files` 
              };
            } else {
              return { success: false, message: 'VSCode extension dist directory not found' };
            }
          } catch (error) {
            return { success: false, message: error.message };
          }
        }
      }
    ];

    for (const test of tests) {
      const result = test.test();
      this.recordTestResult('vscode', test.name, result);
    }
  }

  /**
   * Test Cursor AI Extension
   */
  async testCursorAIExtension() {
    console.log(chalk.yellow('🧪 Testing Cursor AI Extension...'));
    
    const tests = [
      {
        name: 'Extension Package.json',
        test: () => {
          try {
            const packageJsonPath = path.join(this.projectRoot, 'packages/cursor-extension/package.json');
            if (fs.existsSync(packageJsonPath)) {
              const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
              const hasExtensionFields = packageJson.contributes && packageJson.engines;
              return { 
                success: hasExtensionFields, 
                message: 'Cursor AI extension package.json is valid' 
              };
            } else {
              return { success: false, message: 'Cursor AI extension package.json not found' };
            }
          } catch (error) {
            return { success: false, message: error.message };
          }
        }
      },
      {
        name: 'Extension Source Files',
        test: () => {
          try {
            const srcPath = path.join(this.projectRoot, 'packages/cursor-extension/src');
            if (fs.existsSync(srcPath)) {
              const files = fs.readdirSync(srcPath);
              const tsFiles = files.filter(f => f.endsWith('.ts'));
              return { 
                success: tsFiles.length > 0, 
                message: `Found ${tsFiles.length} TypeScript source files` 
              };
            } else {
              return { success: false, message: 'Cursor AI extension src directory not found' };
            }
          } catch (error) {
            return { success: false, message: error.message };
          }
        }
      },
      {
        name: 'Extension Build Output',
        test: () => {
          try {
            const distPath = path.join(this.projectRoot, 'packages/cursor-extension/dist');
            if (fs.existsSync(distPath)) {
              const files = fs.readdirSync(distPath);
              const jsFiles = files.filter(f => f.endsWith('.js'));
              return { 
                success: jsFiles.length > 0, 
                message: `Found ${jsFiles.length} compiled extension files` 
              };
            } else {
              return { success: false, message: 'Cursor AI extension dist directory not found' };
            }
          } catch (error) {
            return { success: false, message: error.message };
          }
        }
      }
    ];

    for (const test of tests) {
      const result = test.test();
      this.recordTestResult('cursor', test.name, result);
    }
  }

  /**
   * Test Web Interface
   */
  async testWebInterface() {
    console.log(chalk.yellow('🧪 Testing Web Interface...'));
    
    const tests = [
      {
        name: 'Web Interface Package.json',
        test: () => {
          try {
            const packageJsonPath = path.join(this.projectRoot, 'packages/web-interface/package.json');
            if (fs.existsSync(packageJsonPath)) {
              const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
              const hasWebFields = packageJson.main || packageJson.scripts;
              return { 
                success: hasWebFields, 
                message: 'Web interface package.json is valid' 
              };
            } else {
              return { success: false, message: 'Web interface package.json not found' };
            }
          } catch (error) {
            return { success: false, message: error.message };
          }
        }
      },
      {
        name: 'Web Interface Files',
        test: () => {
          try {
            const webPath = path.join(this.projectRoot, 'packages/web-interface');
            const files = fs.readdirSync(webPath);
            const hasServerFile = files.some(f => f.includes('server') || f.includes('index'));
            return { 
              success: hasServerFile, 
              message: `Found web interface files: ${files.join(', ')}` 
            };
          } catch (error) {
            return { success: false, message: error.message };
          }
        }
      },
      {
        name: 'Web Interface Dependencies',
        test: () => {
          try {
            const packageJsonPath = path.join(this.projectRoot, 'packages/web-interface/package.json');
            if (fs.existsSync(packageJsonPath)) {
              const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
              const hasDependencies = packageJson.dependencies && Object.keys(packageJson.dependencies).length > 0;
              return { 
                success: hasDependencies, 
                message: `Web interface has ${Object.keys(packageJson.dependencies || {}).length} dependencies` 
              };
            } else {
              return { success: false, message: 'Web interface package.json not found' };
            }
          } catch (error) {
            return { success: false, message: error.message };
          }
        }
      }
    ];

    for (const test of tests) {
      const result = test.test();
      this.recordTestResult('web', test.name, result);
    }
  }

  /**
   * Record test result
   */
  recordTestResult(category, testName, result) {
    if (result.success) {
      this.testResults[category].passed++;
      console.log(chalk.green(`  ✅ ${testName}: ${result.message}`));
    } else {
      this.testResults[category].failed++;
      console.log(chalk.red(`  ❌ ${testName}: ${result.message}`));
    }
    
    this.testResults[category].tests.push({
      name: testName,
      success: result.success,
      message: result.message
    });
  }

  /**
   * Generate comprehensive test report
   */
  generateTestReport() {
    console.log(chalk.blue.bold('\n📊 Test Results Summary'));
    console.log(chalk.gray('========================\n'));

    let totalPassed = 0;
    let totalFailed = 0;

    Object.entries(this.testResults).forEach(([category, results]) => {
      const categoryName = category.charAt(0).toUpperCase() + category.slice(1);
      const total = results.passed + results.failed;
      const percentage = total > 0 ? ((results.passed / total) * 100).toFixed(1) : 0;
      
      console.log(chalk.bold(`${categoryName} Interface:`));
      console.log(`  Passed: ${chalk.green(results.passed)} | Failed: ${chalk.red(results.failed)} | Total: ${total} | Success Rate: ${chalk.cyan(percentage)}%`);
      
      if (results.failed > 0) {
        console.log(chalk.red('  Failed Tests:'));
        results.tests.filter(t => !t.success).forEach(test => {
          console.log(chalk.red(`    - ${test.name}: ${test.message}`));
        });
      }
      
      console.log('');
      
      totalPassed += results.passed;
      totalFailed += results.failed;
    });

    const overallTotal = totalPassed + totalFailed;
    const overallPercentage = overallTotal > 0 ? ((totalPassed / overallTotal) * 100).toFixed(1) : 0;

    console.log(chalk.bold('Overall Results:'));
    console.log(`  Total Passed: ${chalk.green(totalPassed)}`);
    console.log(`  Total Failed: ${chalk.red(totalFailed)}`);
    console.log(`  Overall Success Rate: ${chalk.cyan(overallPercentage)}%`);

    if (overallPercentage >= 80) {
      console.log(chalk.green('\n🎉 Alex AI is ready for deployment!'));
    } else if (overallPercentage >= 60) {
      console.log(chalk.yellow('\n⚠️  Alex AI needs some fixes before deployment.'));
    } else {
      console.log(chalk.red('\n❌ Alex AI needs significant fixes before deployment.'));
    }

    // Save detailed report
    this.saveDetailedReport();
  }

  /**
   * Save detailed test report to file
   */
  saveDetailedReport() {
    const reportPath = path.join(this.projectRoot, 'test-results.json');
    const report = {
      timestamp: new Date().toISOString(),
      summary: {
        totalPassed: Object.values(this.testResults).reduce((sum, r) => sum + r.passed, 0),
        totalFailed: Object.values(this.testResults).reduce((sum, r) => sum + r.failed, 0)
      },
      results: this.testResults
    };

    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
    console.log(chalk.gray(`\n📄 Detailed report saved to: ${reportPath}`));
  }
}

// Run the test suite
if (require.main === module) {
  const testSuite = new AlexAITestSuite();
  testSuite.runAllTests().catch(console.error);
}

module.exports = AlexAITestSuite;


