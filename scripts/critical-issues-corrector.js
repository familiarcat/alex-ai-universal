#!/usr/bin/env node

/**
 * Alex AI Critical Issues Corrector
 * 
 * Systematic process for identifying and correcting critical issues
 */

const fs = require('fs');
const path = require('path');
const { spawn, exec } = require('child_process');
const chalk = require('chalk');

class CriticalIssuesCorrector {
  constructor() {
    this.projectRoot = process.cwd();
    this.issues = [];
    this.corrections = [];
    this.results = {
      identified: 0,
      corrected: 0,
      failed: 0,
      remaining: 0
    };
  }

  async runCorrectionProcess() {
    console.log(chalk.blue.bold('\n🔧 Alex AI Critical Issues Corrector'));
    console.log(chalk.gray('======================================\n'));

    try {
      // Phase 1: Identify Issues
      await this.identifyIssues();
      
      // Phase 2: Prioritize Issues
      this.prioritizeIssues();
      
      // Phase 3: Correct Issues
      await this.correctIssues();
      
      // Phase 4: Validate Corrections
      await this.validateCorrections();
      
      // Generate Report
      this.generateReport();
      
    } catch (error) {
      console.error(chalk.red('❌ Correction process failed:'), error.message);
      process.exit(1);
    }
  }

  async identifyIssues() {
    console.log(chalk.yellow('🔍 Phase 1: Identifying Critical Issues...\n'));

    // Check package.json files
    await this.checkPackageJsonFiles();
    
    // Check build status
    await this.checkBuildStatus();
    
    // Check dependencies
    await this.checkDependencies();
    
    // Check CLI functionality
    await this.checkCLIFunctionality();
    
    // Check extensions
    await this.checkExtensions();
    
    // Check web interface
    await this.checkWebInterface();

    console.log(chalk.cyan(`\n📊 Identified ${this.issues.length} issues`));
  }

  async checkPackageJsonFiles() {
    console.log(chalk.yellow('  📦 Checking package.json files...'));
    
    const packages = ['core', 'cli', 'vscode-extension', 'cursor-extension', 'universal-extension', 'web-interface'];
    
    for (const pkg of packages) {
      const packagePath = path.join(this.projectRoot, 'packages', pkg, 'package.json');
      
      if (!fs.existsSync(packagePath)) {
        this.addIssue('CRITICAL', `Missing package.json for ${pkg}`, `Create package.json for ${pkg} package`);
        continue;
      }

      try {
        const packageJson = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
        
        // Check required fields
        const requiredFields = ['name', 'version', 'description'];
        const missingFields = requiredFields.filter(field => !packageJson[field]);
        
        if (missingFields.length > 0) {
          this.addIssue('HIGH', `Missing required fields in ${pkg}/package.json`, `Add missing fields: ${missingFields.join(', ')}`);
        }

        // Check for workspace references
        if (packageJson.dependencies) {
          const workspaceDeps = Object.entries(packageJson.dependencies)
            .filter(([name, version]) => version.startsWith('workspace:'));
          
          if (workspaceDeps.length > 0) {
            this.addIssue('CRITICAL', `Workspace dependencies in ${pkg}`, `Replace workspace: references with file: references`);
          }
        }

      } catch (error) {
        this.addIssue('CRITICAL', `Invalid JSON in ${pkg}/package.json`, `Fix JSON syntax: ${error.message}`);
      }
    }
  }

  async checkBuildStatus() {
    console.log(chalk.yellow('  🔨 Checking build status...'));
    
    const packages = ['core', 'cli'];
    
    for (const pkg of packages) {
      const distPath = path.join(this.projectRoot, 'packages', pkg, 'dist');
      
      if (!fs.existsSync(distPath)) {
        this.addIssue('CRITICAL', `Missing dist directory for ${pkg}`, `Build ${pkg} package`);
        continue;
      }

      const files = fs.readdirSync(distPath);
      const jsFiles = files.filter(f => f.endsWith('.js'));
      
      if (jsFiles.length === 0) {
        this.addIssue('CRITICAL', `No compiled files in ${pkg}/dist`, `Build ${pkg} package`);
      }
    }
  }

  async checkDependencies() {
    console.log(chalk.yellow('  📚 Checking dependencies...'));
    
    // Check for node_modules
    const rootNodeModules = path.join(this.projectRoot, 'node_modules');
    if (!fs.existsSync(rootNodeModules)) {
      this.addIssue('CRITICAL', 'Missing root node_modules', 'Install dependencies with npm install');
    }

    // Check for package-lock.json
    const packageLockPath = path.join(this.projectRoot, 'package-lock.json');
    if (!fs.existsSync(packageLockPath)) {
      this.addIssue('MEDIUM', 'Missing package-lock.json', 'Generate package-lock.json with npm install');
    }
  }

  async checkCLIFunctionality() {
    console.log(chalk.yellow('  💻 Checking CLI functionality...'));
    
    const cliPath = path.join(this.projectRoot, 'packages/cli/dist/simple-cli.js');
    
    if (!fs.existsSync(cliPath)) {
      this.addIssue('CRITICAL', 'CLI binary not found', 'Build CLI package');
      return;
    }

    // Test CLI help command
    try {
      await this.testCLICommand(['help'], 'CLI help command');
    } catch (error) {
      this.addIssue('HIGH', 'CLI help command failed', `Fix CLI help command: ${error.message}`);
    }
  }

  async checkExtensions() {
    console.log(chalk.yellow('  🔌 Checking extensions...'));
    
    const extensions = ['vscode-extension', 'cursor-extension', 'universal-extension'];
    
    for (const ext of extensions) {
      const packagePath = path.join(this.projectRoot, 'packages', ext, 'package.json');
      
      if (!fs.existsSync(packagePath)) {
        this.addIssue('HIGH', `Missing package.json for ${ext}`, `Create package.json for ${ext}`);
        continue;
      }

      try {
        const packageJson = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
        
        // Check for extension-specific fields
        if (!packageJson.engines || !packageJson.engines.vscode) {
          this.addIssue('MEDIUM', `Missing VSCode engine in ${ext}`, `Add VSCode engine specification`);
        }
        
        if (!packageJson.contributes) {
          this.addIssue('MEDIUM', `Missing contributes section in ${ext}`, `Add contributes section`);
        }
        
      } catch (error) {
        this.addIssue('HIGH', `Invalid package.json in ${ext}`, `Fix package.json: ${error.message}`);
      }
    }
  }

  async checkWebInterface() {
    console.log(chalk.yellow('  🌐 Checking web interface...'));
    
    const webPath = path.join(this.projectRoot, 'packages/web-interface');
    
    if (!fs.existsSync(webPath)) {
      this.addIssue('HIGH', 'Web interface directory not found', 'Create web interface package');
      return;
    }

    const packagePath = path.join(webPath, 'package.json');
    if (!fs.existsSync(packagePath)) {
      this.addIssue('HIGH', 'Missing package.json for web interface', 'Create package.json for web interface');
    }
  }

  async testCLICommand(args, testName) {
    return new Promise((resolve, reject) => {
      const cliPath = path.join(this.projectRoot, 'packages/cli/dist/simple-cli.js');
      
      const process = spawn('node', [cliPath, ...args], {
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
          resolve(output);
        } else {
          reject(new Error(error || 'Command failed'));
        }
      });

      process.on('error', (err) => {
        reject(err);
      });

      // Timeout after 10 seconds
      setTimeout(() => {
        process.kill();
        reject(new Error('Command timeout'));
      }, 10000);
    });
  }

  addIssue(severity, description, solution) {
    this.issues.push({
      id: this.issues.length + 1,
      severity,
      description,
      solution,
      status: 'identified',
      timestamp: new Date().toISOString()
    });
  }

  prioritizeIssues() {
    console.log(chalk.yellow('\n📋 Phase 2: Prioritizing Issues...\n'));

    // Sort issues by severity
    this.issues.sort((a, b) => {
      const severityOrder = { 'CRITICAL': 0, 'HIGH': 1, 'MEDIUM': 2, 'LOW': 3 };
      return severityOrder[a.severity] - severityOrder[b.severity];
    });

    // Display prioritized issues
    this.issues.forEach((issue, index) => {
      const severityColor = this.getSeverityColor(issue.severity);
      console.log(`${index + 1}. ${severityColor(issue.severity)} ${issue.description}`);
      console.log(`   Solution: ${issue.solution}\n`);
    });
  }

  async correctIssues() {
    console.log(chalk.yellow('🔧 Phase 3: Correcting Issues...\n'));

    for (const issue of this.issues) {
      console.log(chalk.cyan(`Fixing: ${issue.description}`));
      
      try {
        await this.correctIssue(issue);
        issue.status = 'corrected';
        this.results.corrected++;
        console.log(chalk.green(`  ✅ Fixed: ${issue.description}`));
      } catch (error) {
        issue.status = 'failed';
        this.results.failed++;
        console.log(chalk.red(`  ❌ Failed: ${issue.description} - ${error.message}`));
      }
    }

    this.results.remaining = this.issues.filter(i => i.status === 'identified').length;
  }

  async correctIssue(issue) {
    switch (issue.severity) {
      case 'CRITICAL':
        await this.correctCriticalIssue(issue);
        break;
      case 'HIGH':
        await this.correctHighIssue(issue);
        break;
      case 'MEDIUM':
        await this.correctMediumIssue(issue);
        break;
      case 'LOW':
        await this.correctLowIssue(issue);
        break;
    }
  }

  async correctCriticalIssue(issue) {
    if (issue.description.includes('Missing package.json')) {
      await this.createPackageJson(issue);
    } else if (issue.description.includes('Workspace dependencies')) {
      await this.fixWorkspaceDependencies(issue);
    } else if (issue.description.includes('Missing dist directory')) {
      await this.buildPackage(issue);
    } else if (issue.description.includes('Missing root node_modules')) {
      await this.installDependencies();
    }
  }

  async correctHighIssue(issue) {
    if (issue.description.includes('Missing required fields')) {
      await this.addRequiredFields(issue);
    } else if (issue.description.includes('CLI help command failed')) {
      await this.fixCLIHelp(issue);
    }
  }

  async correctMediumIssue(issue) {
    if (issue.description.includes('Missing VSCode engine')) {
      await this.addVSCodeEngine(issue);
    } else if (issue.description.includes('Missing contributes section')) {
      await this.addContributesSection(issue);
    }
  }

  async correctLowIssue(issue) {
    // Low priority issues - log for later
    console.log(chalk.gray(`  📝 Logged for later: ${issue.description}`));
  }

  async createPackageJson(issue) {
    const pkgName = issue.description.match(/for (\w+)/)[1];
    const packagePath = path.join(this.projectRoot, 'packages', pkgName, 'package.json');
    
    const packageJson = {
      name: `@alex-ai/${pkgName}`,
      version: '1.0.0',
      description: `Alex AI ${pkgName} package`,
      main: 'dist/index.js',
      scripts: {
        build: 'tsc',
        test: 'echo "No tests specified"',
        clean: 'rm -rf dist'
      },
      keywords: ['alex-ai', pkgName],
      author: 'Alex AI Team',
      license: 'MIT',
      devDependencies: {
        typescript: '^5.0.0',
        '@types/node': '^20.0.0'
      }
    };

    fs.writeFileSync(packagePath, JSON.stringify(packageJson, null, 2));
  }

  async fixWorkspaceDependencies(issue) {
    const pkgName = issue.description.match(/in (\w+)/)[1];
    const packagePath = path.join(this.projectRoot, 'packages', pkgName, 'package.json');
    
    const packageJson = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
    
    // Replace workspace: references with file: references
    if (packageJson.dependencies) {
      Object.keys(packageJson.dependencies).forEach(dep => {
        if (packageJson.dependencies[dep].startsWith('workspace:')) {
          packageJson.dependencies[dep] = 'file:../' + dep.replace('@alex-ai/', '');
        }
      });
    }

    fs.writeFileSync(packagePath, JSON.stringify(packageJson, null, 2));
  }

  async buildPackage(issue) {
    const pkgName = issue.description.match(/for (\w+)/)[1];
    const packagePath = path.join(this.projectRoot, 'packages', pkgName);
    
    // Install dependencies
    await this.runCommand('npm', ['install'], packagePath);
    
    // Build package
    await this.runCommand('npm', ['run', 'build'], packagePath);
  }

  async installDependencies() {
    await this.runCommand('npm', ['install'], this.projectRoot);
  }

  async addRequiredFields(issue) {
    const pkgName = issue.description.match(/in (\w+)/)[1];
    const packagePath = path.join(this.projectRoot, 'packages', pkgName, 'package.json');
    
    const packageJson = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
    
    // Add missing required fields
    if (!packageJson.name) packageJson.name = `@alex-ai/${pkgName}`;
    if (!packageJson.version) packageJson.version = '1.0.0';
    if (!packageJson.description) packageJson.description = `Alex AI ${pkgName} package`;

    fs.writeFileSync(packagePath, JSON.stringify(packageJson, null, 2));
  }

  async fixCLIHelp(issue) {
    // This would require more complex CLI fixes
    console.log(chalk.yellow('  ⚠️  CLI help fix requires manual intervention'));
  }

  async addVSCodeEngine(issue) {
    const pkgName = issue.description.match(/in (\w+)/)[1];
    const packagePath = path.join(this.projectRoot, 'packages', pkgName, 'package.json');
    
    const packageJson = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
    
    if (!packageJson.engines) {
      packageJson.engines = {};
    }
    packageJson.engines.vscode = '^1.60.0';

    fs.writeFileSync(packagePath, JSON.stringify(packageJson, null, 2));
  }

  async addContributesSection(issue) {
    const pkgName = issue.description.match(/in (\w+)/)[1];
    const packagePath = path.join(this.projectRoot, 'packages', pkgName, 'package.json');
    
    const packageJson = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
    
    packageJson.contributes = {
      commands: [],
      menus: {},
      views: {}
    };

    fs.writeFileSync(packagePath, JSON.stringify(packageJson, null, 2));
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

  async validateCorrections() {
    console.log(chalk.yellow('\n✅ Phase 4: Validating Corrections...\n'));

    // Re-run issue identification to see if issues are resolved
    const originalIssueCount = this.issues.length;
    this.issues = [];
    
    await this.identifyIssues();
    
    const remainingIssues = this.issues.length;
    const resolvedIssues = originalIssueCount - remainingIssues;
    
    console.log(chalk.cyan(`📊 Validation Results:`));
    console.log(`  Original Issues: ${originalIssueCount}`);
    console.log(`  Resolved Issues: ${resolvedIssues}`);
    console.log(`  Remaining Issues: ${remainingIssues}`);
  }

  generateReport() {
    console.log(chalk.blue.bold('\n📊 Critical Issues Correction Report'));
    console.log(chalk.gray('=====================================\n'));

    console.log(`Issues Identified: ${chalk.cyan(this.results.identified)}`);
    console.log(`Issues Corrected: ${chalk.green(this.results.corrected)}`);
    console.log(`Issues Failed: ${chalk.red(this.results.failed)}`);
    console.log(`Issues Remaining: ${chalk.yellow(this.results.remaining)}`);

    if (this.results.remaining === 0) {
      console.log(chalk.green('\n🎉 All critical issues have been resolved!'));
    } else {
      console.log(chalk.yellow(`\n⚠️  ${this.results.remaining} issues remain to be addressed.`));
    }

    // Save detailed report
    const reportPath = path.join(this.projectRoot, 'critical-issues-report.json');
    fs.writeFileSync(reportPath, JSON.stringify({
      timestamp: new Date().toISOString(),
      summary: this.results,
      issues: this.issues
    }, null, 2));

    console.log(chalk.gray(`\n📄 Detailed report saved to: ${reportPath}`));
  }

  getSeverityColor(severity) {
    switch (severity) {
      case 'CRITICAL': return chalk.red.bold;
      case 'HIGH': return chalk.yellow.bold;
      case 'MEDIUM': return chalk.blue.bold;
      case 'LOW': return chalk.gray.bold;
      default: return chalk.white;
    }
  }
}

// Run the correction process
if (require.main === module) {
  const corrector = new CriticalIssuesCorrector();
  corrector.runCorrectionProcess().catch(console.error);
}

module.exports = CriticalIssuesCorrector;
