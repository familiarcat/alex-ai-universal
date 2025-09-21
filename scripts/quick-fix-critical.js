#!/usr/bin/env node

/**
 * Alex AI Quick Fix Critical Issues
 * 
 * Immediate fixes for critical issues preventing basic functionality
 */

const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');
const chalk = require('chalk');

class QuickFixCritical {
  constructor() {
    this.projectRoot = process.cwd();
    this.fixes = [];
  }

  async runQuickFixes() {
    console.log(chalk.blue.bold('\n🚨 Alex AI Quick Fix Critical Issues'));
    console.log(chalk.gray('=====================================\n'));

    try {
      // Fix 1: Remove workspace references
      await this.fixWorkspaceReferences();
      
      // Fix 2: Create missing package.json files
      await this.createMissingPackageJsonFiles();
      
      // Fix 3: Fix package.json structure
      await this.fixPackageJsonStructure();
      
      // Fix 4: Install dependencies
      await this.installDependencies();
      
      // Fix 5: Build core packages
      await this.buildCorePackages();
      
      // Fix 6: Test basic functionality
      await this.testBasicFunctionality();

      this.generateReport();
      
    } catch (error) {
      console.error(chalk.red('❌ Quick fix failed:'), error.message);
      process.exit(1);
    }
  }

  async fixWorkspaceReferences() {
    console.log(chalk.yellow('🔧 Fix 1: Removing workspace references...'));
    
    const packages = ['core', 'cli', 'vscode-extension', 'cursor-extension', 'universal-extension', 'web-interface'];
    
    for (const pkg of packages) {
      const packagePath = path.join(this.projectRoot, 'packages', pkg, 'package.json');
      
      if (fs.existsSync(packagePath)) {
        try {
          const packageJson = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
          let modified = false;
          
          // Fix dependencies
          if (packageJson.dependencies) {
            Object.keys(packageJson.dependencies).forEach(dep => {
              if (packageJson.dependencies[dep].startsWith('workspace:')) {
                packageJson.dependencies[dep] = 'file:../' + dep.replace('@alex-ai/', '');
                modified = true;
              }
            });
          }
          
          // Fix devDependencies
          if (packageJson.devDependencies) {
            Object.keys(packageJson.devDependencies).forEach(dep => {
              if (packageJson.devDependencies[dep].startsWith('workspace:')) {
                packageJson.devDependencies[dep] = 'file:../' + dep.replace('@alex-ai/', '');
                modified = true;
              }
            });
          }
          
          if (modified) {
            fs.writeFileSync(packagePath, JSON.stringify(packageJson, null, 2));
            this.fixes.push(`Fixed workspace references in ${pkg}`);
            console.log(chalk.green(`  ✅ Fixed workspace references in ${pkg}`));
          }
          
        } catch (error) {
          console.log(chalk.red(`  ❌ Failed to fix ${pkg}: ${error.message}`));
        }
      }
    }
  }

  async createMissingPackageJsonFiles() {
    console.log(chalk.yellow('🔧 Fix 2: Creating missing package.json files...'));
    
    const packages = [
      {
        name: 'core',
        description: 'Alex AI Core Library',
        main: 'dist/index.js',
        dependencies: {}
      },
      {
        name: 'cli',
        description: 'Alex AI CLI Interface',
        main: 'dist/simple-cli.js',
        dependencies: {
          '@alex-ai/core': 'file:../core'
        }
      },
      {
        name: 'vscode-extension',
        description: 'Alex AI VSCode Extension',
        main: 'dist/extension.js',
        dependencies: {
          '@alex-ai/core': 'file:../core'
        },
        engines: { vscode: '^1.60.0' },
        contributes: { commands: [], menus: {}, views: {} }
      },
      {
        name: 'cursor-extension',
        description: 'Alex AI Cursor Extension',
        main: 'dist/extension.js',
        dependencies: {
          '@alex-ai/core': 'file:../core'
        },
        engines: { vscode: '^1.60.0' },
        contributes: { commands: [], menus: {}, views: {} }
      },
      {
        name: 'universal-extension',
        description: 'Alex AI Universal Extension',
        main: 'dist/extension.js',
        dependencies: {
          '@alex-ai/core': 'file:../core'
        },
        engines: { vscode: '^1.60.0' },
        contributes: { commands: [], menus: {}, views: {} }
      },
      {
        name: 'web-interface',
        description: 'Alex AI Web Interface',
        main: 'server.js',
        dependencies: {
          'express': '^4.18.0',
          'cors': '^2.8.5',
          'helmet': '^6.0.0'
        }
      }
    ];

    for (const pkg of packages) {
      const packagePath = path.join(this.projectRoot, 'packages', pkg.name, 'package.json');
      
      if (!fs.existsSync(packagePath)) {
        const packageJson = {
          name: `@alex-ai/${pkg.name}`,
          version: '1.0.0',
          description: pkg.description,
          main: pkg.main,
          scripts: {
            build: 'tsc',
            test: 'echo "No tests specified"',
            clean: 'rm -rf dist'
          },
          keywords: ['alex-ai', pkg.name],
          author: 'Alex AI Team',
          license: 'MIT',
          dependencies: pkg.dependencies || {},
          devDependencies: {
            typescript: '^5.0.0',
            '@types/node': '^20.0.0'
          }
        };

        // Add extension-specific fields
        if (pkg.engines) packageJson.engines = pkg.engines;
        if (pkg.contributes) packageJson.contributes = pkg.contributes;

        fs.writeFileSync(packagePath, JSON.stringify(packageJson, null, 2));
        this.fixes.push(`Created package.json for ${pkg.name}`);
        console.log(chalk.green(`  ✅ Created package.json for ${pkg.name}`));
      }
    }
  }

  async fixPackageJsonStructure() {
    console.log(chalk.yellow('🔧 Fix 3: Fixing package.json structure...'));
    
    const packages = ['core', 'cli', 'vscode-extension', 'cursor-extension', 'universal-extension', 'web-interface'];
    
    for (const pkg of packages) {
      const packagePath = path.join(this.projectRoot, 'packages', pkg, 'package.json');
      
      if (fs.existsSync(packagePath)) {
        try {
          const packageJson = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
          let modified = false;
          
          // Ensure required fields
          if (!packageJson.name) {
            packageJson.name = `@alex-ai/${pkg}`;
            modified = true;
          }
          if (!packageJson.version) {
            packageJson.version = '1.0.0';
            modified = true;
          }
          if (!packageJson.description) {
            packageJson.description = `Alex AI ${pkg} package`;
            modified = true;
          }
          if (!packageJson.main) {
            packageJson.main = pkg === 'cli' ? 'dist/simple-cli.js' : 'dist/index.js';
            modified = true;
          }
          
          // Ensure scripts
          if (!packageJson.scripts) {
            packageJson.scripts = {};
          }
          if (!packageJson.scripts.build) {
            packageJson.scripts.build = 'tsc';
            modified = true;
          }
          if (!packageJson.scripts.test) {
            packageJson.scripts.test = 'echo "No tests specified"';
            modified = true;
          }
          if (!packageJson.scripts.clean) {
            packageJson.scripts.clean = 'rm -rf dist';
            modified = true;
          }
          
          // Ensure devDependencies
          if (!packageJson.devDependencies) {
            packageJson.devDependencies = {};
          }
          if (!packageJson.devDependencies.typescript) {
            packageJson.devDependencies.typescript = '^5.0.0';
            modified = true;
          }
          if (!packageJson.devDependencies['@types/node']) {
            packageJson.devDependencies['@types/node'] = '^20.0.0';
            modified = true;
          }
          
          if (modified) {
            fs.writeFileSync(packagePath, JSON.stringify(packageJson, null, 2));
            this.fixes.push(`Fixed package.json structure for ${pkg}`);
            console.log(chalk.green(`  ✅ Fixed package.json structure for ${pkg}`));
          }
          
        } catch (error) {
          console.log(chalk.red(`  ❌ Failed to fix ${pkg}: ${error.message}`));
        }
      }
    }
  }

  async installDependencies() {
    console.log(chalk.yellow('🔧 Fix 4: Installing dependencies...'));
    
    try {
      await this.runCommand('npm', ['install'], this.projectRoot);
      this.fixes.push('Installed root dependencies');
      console.log(chalk.green('  ✅ Installed root dependencies'));
    } catch (error) {
      console.log(chalk.red(`  ❌ Failed to install dependencies: ${error.message}`));
    }
  }

  async buildCorePackages() {
    console.log(chalk.yellow('🔧 Fix 5: Building core packages...'));
    
    const corePackages = ['core', 'cli'];
    
    for (const pkg of corePackages) {
      const packagePath = path.join(this.projectRoot, 'packages', pkg);
      
      try {
        // Install package dependencies
        await this.runCommand('npm', ['install'], packagePath);
        
        // Build package
        await this.runCommand('npm', ['run', 'build'], packagePath);
        
        this.fixes.push(`Built ${pkg} package`);
        console.log(chalk.green(`  ✅ Built ${pkg} package`));
      } catch (error) {
        console.log(chalk.red(`  ❌ Failed to build ${pkg}: ${error.message}`));
      }
    }
  }

  async testBasicFunctionality() {
    console.log(chalk.yellow('🔧 Fix 6: Testing basic functionality...'));
    
    // Test CLI help command
    const cliPath = path.join(this.projectRoot, 'packages/cli/dist/simple-cli.js');
    
    if (fs.existsSync(cliPath)) {
      try {
        await this.runCommand('node', [cliPath, 'help'], this.projectRoot);
        this.fixes.push('CLI help command working');
        console.log(chalk.green('  ✅ CLI help command working'));
      } catch (error) {
        console.log(chalk.red(`  ❌ CLI help command failed: ${error.message}`));
      }
    } else {
      console.log(chalk.red('  ❌ CLI binary not found'));
    }
  }

  async runCommand(command, args, cwd) {
    return new Promise((resolve, reject) => {
      const process = spawn(command, args, {
        cwd,
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
          resolve(output);
        } else {
          reject(new Error(error || 'Command failed'));
        }
      });

      process.on('error', (err) => {
        reject(err);
      });
    });
  }

  generateReport() {
    console.log(chalk.blue.bold('\n📊 Quick Fix Report'));
    console.log(chalk.gray('==================\n'));

    console.log(`Fixes Applied: ${chalk.green(this.fixes.length)}`);
    
    if (this.fixes.length > 0) {
      console.log(chalk.cyan('\nApplied Fixes:'));
      this.fixes.forEach((fix, index) => {
        console.log(`  ${index + 1}. ${fix}`);
      });
    }

    console.log(chalk.green('\n🎉 Quick fixes completed!'));
    console.log(chalk.yellow('Next steps:'));
    console.log('  1. Test the system: npx alexi help');
    console.log('  2. Run comprehensive tests: cd test-harness && node run-all-tests.js');
    console.log('  3. Address any remaining issues');
  }
}

// Run quick fixes
if (require.main === module) {
  const quickFix = new QuickFixCritical();
  quickFix.runQuickFixes().catch(console.error);
}

module.exports = QuickFixCritical;




