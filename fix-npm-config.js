#!/usr/bin/env node

/**
 * Fix NPM Configuration for Chat Console Compatibility
 * 
 * Converts workspace references to file references for npm compatibility
 */

const fs = require('fs');
const path = require('path');

class NPMConfigFixer {
  constructor() {
    this.projectRoot = process.cwd();
    this.fixes = [];
  }

  async fixNPMConfiguration() {
    console.log('🔧 Fixing NPM Configuration for Chat Console Compatibility...\n');

    try {
      // Fix root package.json
      await this.fixRootPackageJson();
      
      // Fix all package package.json files
      await this.fixPackageJsonFiles();
      
      // Create .npmrc for better compatibility
      await this.createNPMRC();
      
      // Generate installation script
      await this.createInstallScript();
      
      this.generateReport();
      
    } catch (error) {
      console.error('❌ NPM configuration fix failed:', error.message);
      process.exit(1);
    }
  }

  async fixRootPackageJson() {
    console.log('📦 Fixing root package.json...');
    
    const packageJsonPath = path.join(this.projectRoot, 'package.json');
    
    if (fs.existsSync(packageJsonPath)) {
      const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
      
      // Convert workspace references to file references
      if (packageJson.dependencies) {
        Object.keys(packageJson.dependencies).forEach(dep => {
          if (packageJson.dependencies[dep].startsWith('workspace:')) {
            packageJson.dependencies[dep] = 'file:packages/' + dep.replace('@alex-ai/', '');
            this.fixes.push(`Fixed workspace reference: ${dep}`);
          }
        });
      }
      
      // Add npm-specific scripts
      packageJson.scripts = {
        ...packageJson.scripts,
        'install:all': 'npm install && npm run build:all',
        'build:all': 'npm run build:core && npm run build:cli',
        'build:core': 'cd packages/core && npm install && npm run build',
        'build:cli': 'cd packages/cli && npm install && npm run build',
        'test:all': 'cd test-harness && npm install && node run-all-tests.js',
        'quick-fix': 'node scripts/quick-fix-critical.js'
      };
      
      fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));
      this.fixes.push('Fixed root package.json');
      console.log('  ✅ Fixed root package.json');
    }
  }

  async fixPackageJsonFiles() {
    console.log('📦 Fixing package package.json files...');
    
    const packages = ['core', 'cli', 'vscode-extension', 'cursor-extension', 'universal-extension', 'web-interface'];
    
    for (const pkg of packages) {
      const packagePath = path.join(this.projectRoot, 'packages', pkg, 'package.json');
      
      if (fs.existsSync(packagePath)) {
        const packageJson = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
        let modified = false;
        
        // Convert workspace references to file references
        if (packageJson.dependencies) {
          Object.keys(packageJson.dependencies).forEach(dep => {
            if (packageJson.dependencies[dep].startsWith('workspace:')) {
              const targetPkg = dep.replace('@alex-ai/', '');
              packageJson.dependencies[dep] = 'file:../' + targetPkg;
              modified = true;
              this.fixes.push(`Fixed workspace reference in ${pkg}: ${dep}`);
            }
          });
        }
        
        // Ensure proper scripts
        if (!packageJson.scripts) {
          packageJson.scripts = {};
        }
        
        if (!packageJson.scripts.build) {
          packageJson.scripts.build = 'tsc';
          modified = true;
        }
        
        if (!packageJson.scripts.install) {
          packageJson.scripts.install = 'npm install';
          modified = true;
        }
        
        // Ensure proper devDependencies
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
          console.log(`  ✅ Fixed ${pkg}/package.json`);
        }
      }
    }
  }

  async createNPMRC() {
    console.log('📝 Creating .npmrc for better compatibility...');
    
    const npmrcContent = `# NPM Configuration for Alex AI Universal
# Optimized for chat console compatibility

# Use npm registry
registry=https://registry.npmjs.org/

# Enable strict SSL
strict-ssl=true

# Disable fund messages
fund=false

# Disable update notifier
update-notifier=false

# Enable audit
audit-level=moderate

# Use legacy peer deps for compatibility
legacy-peer-deps=true

# Disable package-lock for workspace compatibility
package-lock=false

# Use npm for workspace management
workspace-concurrency=1
`;

    fs.writeFileSync(path.join(this.projectRoot, '.npmrc'), npmrcContent);
    this.fixes.push('Created .npmrc for compatibility');
    console.log('  ✅ Created .npmrc');
  }

  async createInstallScript() {
    console.log('📝 Creating installation script...');
    
    const installScript = `#!/bin/bash

# Alex AI Universal - Chat Console Compatible Install
# Designed to work with npm and avoid chat console limitations

echo "🚀 Alex AI Universal - Chat Console Compatible Install"
echo "====================================================="

# Clean everything
echo "🧹 Cleaning artifacts..."
rm -rf node_modules
find packages -name "node_modules" -type d -exec rm -rf {} + 2>/dev/null || true
rm -f package-lock.json
find packages -name "package-lock.json" -delete 2>/dev/null || true

# Install root dependencies
echo "📦 Installing root dependencies..."
npm install --legacy-peer-deps

# Install and build core packages
echo "🔨 Installing and building core packages..."

# Core package
echo "  📦 Installing core package..."
cd packages/core
npm install --legacy-peer-deps
npm run build
cd ../..

# CLI package
echo "  📦 Installing CLI package..."
cd packages/cli
npm install --legacy-peer-deps
npm run build
cd ../..

# Install test harness dependencies
echo "📦 Installing test harness dependencies..."
cd test-harness
npm install chalk@4.1.2
cd ..

echo "✅ Installation complete!"
echo ""
echo "🧪 Testing installation..."
if [ -f "packages/cli/dist/simple-cli.js" ]; then
    echo "✅ CLI built successfully"
    echo "Test with: npx alexi help"
else
    echo "❌ CLI build failed"
fi

echo ""
echo "🎉 Alex AI Universal is ready!"
echo "Available commands:"
echo "  npx alexi help                    - Show CLI help"
echo "  npm run test:all                  - Run all tests"
echo "  npm run quick-fix                 - Run quick fixes"
`;

    fs.writeFileSync(path.join(this.projectRoot, 'install-chat-compatible.sh'), installScript);
    
    // Make it executable
    require('child_process').execSync('chmod +x install-chat-compatible.sh', { cwd: this.projectRoot });
    
    this.fixes.push('Created chat-compatible install script');
    console.log('  ✅ Created install-chat-compatible.sh');
  }

  generateReport() {
    console.log('\n📊 NPM Configuration Fix Report');
    console.log('================================\n');
    
    console.log(`Fixes Applied: ${this.fixes.length}`);
    
    if (this.fixes.length > 0) {
      console.log('\nApplied Fixes:');
      this.fixes.forEach((fix, index) => {
        console.log(`  ${index + 1}. ${fix}`);
      });
    }
    
    console.log('\n✅ NPM configuration fixed for chat console compatibility!');
    console.log('\nNext steps:');
    console.log('  1. Run: ./install-chat-compatible.sh');
    console.log('  2. Test: npx alexi help');
    console.log('  3. Run tests: npm run test:all');
  }
}

// Run the fixer
if (require.main === module) {
  const fixer = new NPMConfigFixer();
  fixer.fixNPMConfiguration().catch(console.error);
}

module.exports = NPMConfigFixer;



<<<<<<< HEAD

=======
>>>>>>> ab4898606e192fe0b56b73b7224a3746d57250d5
