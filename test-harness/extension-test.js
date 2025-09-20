#!/usr/bin/env node

/**
 * Alex AI Extension Test Harness
 * 
 * Comprehensive testing for VSCode and Cursor AI extensions
 */

const fs = require('fs');
const path = require('path');
const chalk = require('chalk');

class AlexAIExtensionTest {
  constructor() {
    this.projectRoot = process.cwd();
    this.testResults = [];
  }

  async runAllTests() {
    console.log(chalk.blue.bold('\n🧪 Alex AI Extension Test Harness'));
    console.log(chalk.gray('====================================\n'));

    await this.testVSCodeExtension();
    await this.testCursorAIExtension();
    await this.testUniversalExtension();

    this.generateReport();
  }

  async testVSCodeExtension() {
    console.log(chalk.yellow('🧪 Testing VSCode Extension...'));

    const tests = [
      {
        name: 'Package.json Structure',
        test: () => this.testPackageJsonStructure('vscode-extension')
      },
      {
        name: 'Extension Manifest',
        test: () => this.testExtensionManifest('vscode-extension')
      },
      {
        name: 'Source Files',
        test: () => this.testSourceFiles('vscode-extension')
      },
      {
        name: 'Build Output',
        test: () => this.testBuildOutput('vscode-extension')
      },
      {
        name: 'Dependencies',
        test: () => this.testDependencies('vscode-extension')
      }
    ];

    for (const test of tests) {
      const result = await test.test();
      this.recordTest(`VSCode: ${test.name}`, result.success, result.message);
    }
  }

  async testCursorAIExtension() {
    console.log(chalk.yellow('🧪 Testing Cursor AI Extension...'));

    const tests = [
      {
        name: 'Package.json Structure',
        test: () => this.testPackageJsonStructure('cursor-extension')
      },
      {
        name: 'Extension Manifest',
        test: () => this.testExtensionManifest('cursor-extension')
      },
      {
        name: 'Source Files',
        test: () => this.testSourceFiles('cursor-extension')
      },
      {
        name: 'Build Output',
        test: () => this.testBuildOutput('cursor-extension')
      },
      {
        name: 'Dependencies',
        test: () => this.testDependencies('cursor-extension')
      }
    ];

    for (const test of tests) {
      const result = await test.test();
      this.recordTest(`Cursor: ${test.name}`, result.success, result.message);
    }
  }

  async testUniversalExtension() {
    console.log(chalk.yellow('🧪 Testing Universal Extension...'));

    const tests = [
      {
        name: 'Package.json Structure',
        test: () => this.testPackageJsonStructure('universal-extension')
      },
      {
        name: 'Extension Manifest',
        test: () => this.testExtensionManifest('universal-extension')
      },
      {
        name: 'Source Files',
        test: () => this.testSourceFiles('universal-extension')
      },
      {
        name: 'Build Output',
        test: () => this.testBuildOutput('universal-extension')
      },
      {
        name: 'Dependencies',
        test: () => this.testDependencies('universal-extension')
      }
    ];

    for (const test of tests) {
      const result = await test.test();
      this.recordTest(`Universal: ${test.name}`, result.success, result.message);
    }
  }

  testPackageJsonStructure(extensionName) {
    try {
      const packageJsonPath = path.join(this.projectRoot, 'packages', extensionName, 'package.json');
      
      if (!fs.existsSync(packageJsonPath)) {
        return { success: false, message: 'Package.json not found' };
      }

      const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
      
      const requiredFields = ['name', 'version', 'description', 'main'];
      const missingFields = requiredFields.filter(field => !packageJson[field]);
      
      if (missingFields.length > 0) {
        return { success: false, message: `Missing required fields: ${missingFields.join(', ')}` };
      }

      return { success: true, message: 'Package.json structure is valid' };
    } catch (error) {
      return { success: false, message: `Package.json parse error: ${error.message}` };
    }
  }

  testExtensionManifest(extensionName) {
    try {
      const packageJsonPath = path.join(this.projectRoot, 'packages', extensionName, 'package.json');
      
      if (!fs.existsSync(packageJsonPath)) {
        return { success: false, message: 'Package.json not found' };
      }

      const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
      
      // Check for extension-specific fields
      const hasEngines = packageJson.engines && packageJson.engines.vscode;
      const hasContributes = packageJson.contributes;
      const hasActivationEvents = packageJson.activationEvents;
      
      if (!hasEngines) {
        return { success: false, message: 'Missing VSCode engine specification' };
      }

      if (!hasContributes) {
        return { success: false, message: 'Missing contributes section' };
      }

      return { success: true, message: 'Extension manifest is valid' };
    } catch (error) {
      return { success: false, message: `Extension manifest error: ${error.message}` };
    }
  }

  testSourceFiles(extensionName) {
    try {
      const srcPath = path.join(this.projectRoot, 'packages', extensionName, 'src');
      
      if (!fs.existsSync(srcPath)) {
        return { success: false, message: 'Source directory not found' };
      }

      const files = fs.readdirSync(srcPath);
      const tsFiles = files.filter(f => f.endsWith('.ts'));
      const jsFiles = files.filter(f => f.endsWith('.js'));
      
      if (tsFiles.length === 0 && jsFiles.length === 0) {
        return { success: false, message: 'No source files found' };
      }

      return { success: true, message: `Found ${tsFiles.length} TS files and ${jsFiles.length} JS files` };
    } catch (error) {
      return { success: false, message: `Source files error: ${error.message}` };
    }
  }

  testBuildOutput(extensionName) {
    try {
      const distPath = path.join(this.projectRoot, 'packages', extensionName, 'dist');
      
      if (!fs.existsSync(distPath)) {
        return { success: false, message: 'Build output directory not found' };
      }

      const files = fs.readdirSync(distPath);
      const jsFiles = files.filter(f => f.endsWith('.js'));
      const mapFiles = files.filter(f => f.endsWith('.js.map'));
      
      if (jsFiles.length === 0) {
        return { success: false, message: 'No compiled JavaScript files found' };
      }

      return { success: true, message: `Found ${jsFiles.length} JS files and ${mapFiles.length} source maps` };
    } catch (error) {
      return { success: false, message: `Build output error: ${error.message}` };
    }
  }

  testDependencies(extensionName) {
    try {
      const packageJsonPath = path.join(this.projectRoot, 'packages', extensionName, 'package.json');
      
      if (!fs.existsSync(packageJsonPath)) {
        return { success: false, message: 'Package.json not found' };
      }

      const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
      
      const dependencies = packageJson.dependencies || {};
      const devDependencies = packageJson.devDependencies || {};
      
      const totalDeps = Object.keys(dependencies).length + Object.keys(devDependencies).length;
      
      if (totalDeps === 0) {
        return { success: false, message: 'No dependencies found' };
      }

      return { success: true, message: `Found ${totalDeps} total dependencies` };
    } catch (error) {
      return { success: false, message: `Dependencies error: ${error.message}` };
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

    console.log(chalk.blue.bold('\n📊 Extension Test Results'));
    console.log(chalk.gray('========================\n'));
    console.log(`Passed: ${chalk.green(passed)} | Failed: ${chalk.red(failed)} | Total: ${total} | Success Rate: ${chalk.cyan(percentage)}%`);

    if (failed > 0) {
      console.log(chalk.red('\nFailed Tests:'));
      this.testResults.filter(t => !t.success).forEach(test => {
        console.log(chalk.red(`  - ${test.name}: ${test.message}`));
      });
    }

    // Save results
    const reportPath = path.join(this.projectRoot, 'extension-test-results.json');
    fs.writeFileSync(reportPath, JSON.stringify({
      timestamp: new Date().toISOString(),
      summary: { passed, failed, total, percentage },
      results: this.testResults
    }, null, 2));

    console.log(chalk.gray(`\n📄 Detailed report saved to: ${reportPath}`));
  }
}

// Run extension tests
if (require.main === module) {
  const extensionTest = new AlexAIExtensionTest();
  extensionTest.runAllTests().catch(console.error);
}

module.exports = AlexAIExtensionTest;
