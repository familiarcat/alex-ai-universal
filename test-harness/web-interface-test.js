#!/usr/bin/env node

/**
 * Alex AI Web Interface Test Harness
 * 
 * Comprehensive testing for web interface functionality
 */

const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');
const chalk = require('chalk');

class AlexAIWebInterfaceTest {
  constructor() {
    this.projectRoot = process.cwd();
    this.testResults = [];
    this.serverProcess = null;
  }

  async runAllTests() {
    console.log(chalk.blue.bold('\n🧪 Alex AI Web Interface Test Harness'));
    console.log(chalk.gray('=======================================\n'));

    await this.testWebInterfaceStructure();
    await this.testWebInterfaceDependencies();
    await this.testWebInterfaceFiles();
    await this.testWebInterfaceServer();
    await this.testWebInterfaceAPI();

    this.generateReport();
  }

  async testWebInterfaceStructure() {
    console.log(chalk.yellow('🧪 Testing Web Interface Structure...'));

    const tests = [
      {
        name: 'Package.json Exists',
        test: () => {
          const packageJsonPath = path.join(this.projectRoot, 'packages/web-interface/package.json');
          return {
            success: fs.existsSync(packageJsonPath),
            message: fs.existsSync(packageJsonPath) ? 'Package.json found' : 'Package.json not found'
          };
        }
      },
      {
        name: 'Package.json Structure',
        test: () => {
          try {
            const packageJsonPath = path.join(this.projectRoot, 'packages/web-interface/package.json');
            const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
            
            const requiredFields = ['name', 'version', 'description'];
            const missingFields = requiredFields.filter(field => !packageJson[field]);
            
            return {
              success: missingFields.length === 0,
              message: missingFields.length === 0 ? 'Package.json structure is valid' : `Missing fields: ${missingFields.join(', ')}`
            };
          } catch (error) {
            return { success: false, message: `Package.json parse error: ${error.message}` };
          }
        }
      },
      {
        name: 'Main Entry Point',
        test: () => {
          const packageJsonPath = path.join(this.projectRoot, 'packages/web-interface/package.json');
          const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
          const mainFile = packageJson.main || 'index.js';
          const mainPath = path.join(this.projectRoot, 'packages/web-interface', mainFile);
          
          return {
            success: fs.existsSync(mainPath),
            message: fs.existsSync(mainPath) ? `Main entry point found: ${mainFile}` : `Main entry point not found: ${mainFile}`
          };
        }
      }
    ];

    for (const test of tests) {
      const result = test.test();
      this.recordTest(`Structure: ${test.name}`, result.success, result.message);
    }
  }

  async testWebInterfaceDependencies() {
    console.log(chalk.yellow('🧪 Testing Web Interface Dependencies...'));

    const tests = [
      {
        name: 'Dependencies Count',
        test: () => {
          try {
            const packageJsonPath = path.join(this.projectRoot, 'packages/web-interface/package.json');
            const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
            
            const dependencies = packageJson.dependencies || {};
            const devDependencies = packageJson.devDependencies || {};
            const totalDeps = Object.keys(dependencies).length + Object.keys(devDependencies).length;
            
            return {
              success: totalDeps > 0,
              message: `Found ${totalDeps} total dependencies (${Object.keys(dependencies).length} runtime, ${Object.keys(devDependencies).length} dev)`
            };
          } catch (error) {
            return { success: false, message: `Dependencies error: ${error.message}` };
          }
        }
      },
      {
        name: 'Required Dependencies',
        test: () => {
          try {
            const packageJsonPath = path.join(this.projectRoot, 'packages/web-interface/package.json');
            const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
            
            const dependencies = packageJson.dependencies || {};
            const requiredDeps = ['express', 'cors', 'helmet'];
            const missingDeps = requiredDeps.filter(dep => !dependencies[dep]);
            
            return {
              success: missingDeps.length === 0,
              message: missingDeps.length === 0 ? 'All required dependencies present' : `Missing dependencies: ${missingDeps.join(', ')}`
            };
          } catch (error) {
            return { success: false, message: `Required dependencies error: ${error.message}` };
          }
        }
      }
    ];

    for (const test of tests) {
      const result = test.test();
      this.recordTest(`Dependencies: ${test.name}`, result.success, result.message);
    }
  }

  async testWebInterfaceFiles() {
    console.log(chalk.yellow('🧪 Testing Web Interface Files...'));

    const tests = [
      {
        name: 'Source Files',
        test: () => {
          const webPath = path.join(this.projectRoot, 'packages/web-interface');
          const files = fs.readdirSync(webPath);
          const sourceFiles = files.filter(f => f.endsWith('.js') || f.endsWith('.ts') || f.endsWith('.html'));
          
          return {
            success: sourceFiles.length > 0,
            message: `Found ${sourceFiles.length} source files: ${sourceFiles.join(', ')}`
          };
        }
      },
      {
        name: 'Server File',
        test: () => {
          const webPath = path.join(this.projectRoot, 'packages/web-interface');
          const files = fs.readdirSync(webPath);
          const serverFiles = files.filter(f => f.includes('server') || f.includes('index'));
          
          return {
            success: serverFiles.length > 0,
            message: serverFiles.length > 0 ? `Server files found: ${serverFiles.join(', ')}` : 'No server files found'
          };
        }
      },
      {
        name: 'Static Assets',
        test: () => {
          const webPath = path.join(this.projectRoot, 'packages/web-interface');
          const files = fs.readdirSync(webPath);
          const assetFiles = files.filter(f => f.endsWith('.css') || f.endsWith('.html') || f.endsWith('.json'));
          
          return {
            success: true, // Not required, but good to have
            message: `Found ${assetFiles.length} asset files: ${assetFiles.join(', ')}`
          };
        }
      }
    ];

    for (const test of tests) {
      const result = test.test();
      this.recordTest(`Files: ${test.name}`, result.success, result.message);
    }
  }

  async testWebInterfaceServer() {
    console.log(chalk.yellow('🧪 Testing Web Interface Server...'));

    const tests = [
      {
        name: 'Server File Syntax',
        test: () => {
          try {
            const webPath = path.join(this.projectRoot, 'packages/web-interface');
            const files = fs.readdirSync(webPath);
            const serverFiles = files.filter(f => f.endsWith('.js') && (f.includes('server') || f.includes('index')));
            
            if (serverFiles.length === 0) {
              return { success: false, message: 'No server files found' };
            }

            const serverFile = serverFiles[0];
            const serverPath = path.join(webPath, serverFile);
            const content = fs.readFileSync(serverPath, 'utf8');
            
            // Basic syntax check
            if (content.includes('require') || content.includes('import')) {
              return { success: true, message: `Server file syntax looks valid: ${serverFile}` };
            } else {
              return { success: false, message: `Server file may be empty or invalid: ${serverFile}` };
            }
          } catch (error) {
            return { success: false, message: `Server file error: ${error.message}` };
          }
        }
      },
      {
        name: 'Express Usage',
        test: () => {
          try {
            const webPath = path.join(this.projectRoot, 'packages/web-interface');
            const files = fs.readdirSync(webPath);
            const serverFiles = files.filter(f => f.endsWith('.js') && (f.includes('server') || f.includes('index')));
            
            if (serverFiles.length === 0) {
              return { success: false, message: 'No server files found' };
            }

            const serverFile = serverFiles[0];
            const serverPath = path.join(webPath, serverFile);
            const content = fs.readFileSync(serverPath, 'utf8');
            
            const hasExpress = content.includes('express') || content.includes('Express');
            const hasListen = content.includes('listen') || content.includes('Listen');
            
            return {
              success: hasExpress && hasListen,
              message: hasExpress && hasListen ? 'Express server setup found' : 'Express server setup incomplete'
            };
          } catch (error) {
            return { success: false, message: `Express usage error: ${error.message}` };
          }
        }
      }
    ];

    for (const test of tests) {
      const result = test.test();
      this.recordTest(`Server: ${test.name}`, result.success, result.message);
    }
  }

  async testWebInterfaceAPI() {
    console.log(chalk.yellow('🧪 Testing Web Interface API...'));

    const tests = [
      {
        name: 'API Routes',
        test: () => {
          try {
            const webPath = path.join(this.projectRoot, 'packages/web-interface');
            const files = fs.readdirSync(webPath);
            const serverFiles = files.filter(f => f.endsWith('.js') && (f.includes('server') || f.includes('index')));
            
            if (serverFiles.length === 0) {
              return { success: false, message: 'No server files found' };
            }

            const serverFile = serverFiles[0];
            const serverPath = path.join(webPath, serverFile);
            const content = fs.readFileSync(serverPath, 'utf8');
            
            const hasRoutes = content.includes('app.get') || content.includes('app.post') || content.includes('app.use');
            const hasAPI = content.includes('/api') || content.includes('api');
            
            return {
              success: hasRoutes,
              message: hasRoutes ? 'API routes found' : 'No API routes found'
            };
          } catch (error) {
            return { success: false, message: `API routes error: ${error.message}` };
          }
        }
      },
      {
        name: 'CORS Configuration',
        test: () => {
          try {
            const webPath = path.join(this.projectRoot, 'packages/web-interface');
            const files = fs.readdirSync(webPath);
            const serverFiles = files.filter(f => f.endsWith('.js') && (f.includes('server') || f.includes('index')));
            
            if (serverFiles.length === 0) {
              return { success: false, message: 'No server files found' };
            }

            const serverFile = serverFiles[0];
            const serverPath = path.join(webPath, serverFile);
            const content = fs.readFileSync(serverPath, 'utf8');
            
            const hasCORS = content.includes('cors') || content.includes('CORS');
            
            return {
              success: hasCORS,
              message: hasCORS ? 'CORS configuration found' : 'No CORS configuration found'
            };
          } catch (error) {
            return { success: false, message: `CORS configuration error: ${error.message}` };
          }
        }
      }
    ];

    for (const test of tests) {
      const result = test.test();
      this.recordTest(`API: ${test.name}`, result.success, result.message);
    }
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

    console.log(chalk.blue.bold('\n📊 Web Interface Test Results'));
    console.log(chalk.gray('============================\n'));
    console.log(`Passed: ${chalk.green(passed)} | Failed: ${chalk.red(failed)} | Total: ${total} | Success Rate: ${chalk.cyan(percentage)}%`);

    if (failed > 0) {
      console.log(chalk.red('\nFailed Tests:'));
      this.testResults.filter(t => !t.success).forEach(test => {
        console.log(chalk.red(`  - ${test.name}: ${test.message}`));
      });
    }

    // Save results
    const reportPath = path.join(this.projectRoot, 'web-interface-test-results.json');
    fs.writeFileSync(reportPath, JSON.stringify({
      timestamp: new Date().toISOString(),
      summary: { passed, failed, total, percentage },
      results: this.testResults
    }, null, 2));

    console.log(chalk.gray(`\n📄 Detailed report saved to: ${reportPath}`));
  }
}

// Run web interface tests
if (require.main === module) {
  const webTest = new AlexAIWebInterfaceTest();
  webTest.runAllTests().catch(console.error);
}

module.exports = AlexAIWebInterfaceTest;
