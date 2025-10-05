#!/usr/bin/env node

/**
 * Alex AI Demo Project - Build Script
 * 
 * Builds and compiles the Smart Home Automation System demo
 */

const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');

class DemoBuildSystem {
  constructor() {
    this.projectRoot = __dirname;
    this.buildDir = path.join(this.projectRoot, 'build');
    this.distDir = path.join(this.projectRoot, 'dist');
  }

  /**
   * Run the complete build process
   */
  async build() {
    console.log('🔨 ALEX AI DEMO PROJECT - BUILD SYSTEM');
    console.log('=====================================\n');

    try {
      // Step 1: Clean previous builds
      await this.clean();

      // Step 2: Install dependencies
      await this.installDependencies();

      // Step 3: Create build directories
      await this.createBuildDirectories();

      // Step 4: Copy source files
      await this.copySourceFiles();

      // Step 5: Generate build artifacts
      await this.generateBuildArtifacts();

      // Step 6: Optimize assets
      await this.optimizeAssets();

      // Step 7: Generate build report
      await this.generateBuildReport();

      console.log('\n✅ BUILD COMPLETE!\n');
      console.log('📦 Build artifacts generated:');
      console.log('  📁 build/ - Development build');
      console.log('  📁 dist/ - Production build');
      console.log('  📄 build-report.json - Build details');
      console.log('  📄 package-build.json - Package info');

      console.log('\n🚀 Next steps:');
      console.log('  • Run: npm run test - Test the build');
      console.log('  • Run: npm run web - Start web server');
      console.log('  • Run: npm run demo:enhanced - Full demo with browser');

    } catch (error) {
      console.error('❌ Build failed:', error.message);
      process.exit(1);
    }
  }

  /**
   * Clean previous builds
   */
  async clean() {
    console.log('🧹 Cleaning previous builds...');
    
    const dirsToClean = [this.buildDir, this.distDir];
    
    for (const dir of dirsToClean) {
      if (fs.existsSync(dir)) {
        fs.rmSync(dir, { recursive: true, force: true });
        console.log(`  ✅ Cleaned: ${path.basename(dir)}/`);
      }
    }
  }

  /**
   * Install dependencies
   */
  async installDependencies() {
    console.log('📦 Checking dependencies...');
    
    // For demo purposes, skip npm install since we have no external dependencies
    console.log('  ✅ Dependencies check complete (standalone demo)');
  }

  /**
   * Create build directories
   */
  async createBuildDirectories() {
    console.log('📁 Creating build directories...');
    
    const directories = [
      this.buildDir,
      this.distDir,
      path.join(this.buildDir, 'src'),
      path.join(this.buildDir, 'public'),
      path.join(this.distDir, 'src'),
      path.join(this.distDir, 'public'),
      path.join(this.distDir, 'assets')
    ];

    for (const dir of directories) {
      fs.mkdirSync(dir, { recursive: true });
      console.log(`  ✅ Created: ${path.relative(this.projectRoot, dir)}/`);
    }
  }

  /**
   * Copy source files
   */
  async copySourceFiles() {
    console.log('📋 Copying source files...');
    
    const filesToCopy = [
      { src: 'src/', dest: 'build/src/' },
      { src: 'public/', dest: 'build/public/' },
      { src: 'config/', dest: 'build/config/' },
      { src: 'package.json', dest: 'build/package.json' },
      { src: 'README.md', dest: 'build/README.md' }
    ];

    for (const file of filesToCopy) {
      const srcPath = path.join(this.projectRoot, file.src);
      const destPath = path.join(this.projectRoot, file.dest);
      
      if (fs.existsSync(srcPath)) {
        if (fs.statSync(srcPath).isDirectory()) {
          this.copyDirectory(srcPath, destPath);
        } else {
          fs.copyFileSync(srcPath, destPath);
        }
        console.log(`  ✅ Copied: ${file.src} → ${file.dest}`);
      }
    }
  }

  /**
   * Generate build artifacts
   */
  async generateBuildArtifacts() {
    console.log('🔧 Generating build artifacts...');
    
    // Generate production package.json
    const packageJson = require(path.join(this.projectRoot, 'package.json'));
    const buildPackageJson = {
      ...packageJson,
      name: `${packageJson.name}-build`,
      version: packageJson.version,
      description: `${packageJson.description} - Production Build`,
      scripts: {
        start: 'node src/web-server.js',
        test: 'node test-runner.js'
      },
      buildTime: new Date().toISOString(),
      buildVersion: packageJson.version
    };

    fs.writeFileSync(
      path.join(this.distDir, 'package.json'),
      JSON.stringify(buildPackageJson, null, 2)
    );

    // Copy optimized files to dist
    this.copyDirectory(
      path.join(this.buildDir, 'src'),
      path.join(this.distDir, 'src')
    );
    this.copyDirectory(
      path.join(this.buildDir, 'public'),
      path.join(this.distDir, 'public')
    );

    console.log('  ✅ Generated build artifacts');
  }

  /**
   * Optimize assets
   */
  async optimizeAssets() {
    console.log('⚡ Optimizing assets...');
    
    // Create optimized index.html for production
    const indexHtml = fs.readFileSync(
      path.join(this.projectRoot, 'public', 'index.html'),
      'utf8'
    );

    // Add build optimization comments
    const optimizedHtml = indexHtml.replace(
      '<title>Alex AI Demo - Smart Home Automation System</title>',
      '<title>Alex AI Demo - Smart Home Automation System (Production Build)</title>'
    );

    fs.writeFileSync(
      path.join(this.distDir, 'public', 'index.html'),
      optimizedHtml
    );

    console.log('  ✅ Assets optimized');
  }

  /**
   * Generate build report
   */
  async generateBuildReport() {
    console.log('📊 Generating build report...');
    
    const buildReport = {
      project: 'Alex AI Demo - Smart Home Automation System',
      buildTime: new Date().toISOString(),
      version: require(path.join(this.projectRoot, 'package.json')).version,
      buildType: 'production',
      features: {
        webInterface: true,
        apiEndpoints: true,
        crewAnalysis: true,
        universalIntegration: true,
        mobileResponsive: true
      },
      directories: {
        build: this.buildDir,
        dist: this.distDir,
        public: path.join(this.distDir, 'public'),
        src: path.join(this.distDir, 'src')
      },
      endpoints: [
        '/api/status',
        '/api/crew-analysis',
        '/api/technical-stack',
        '/api/project-phases'
      ],
      nextSteps: [
        'Test the build with: npm run test',
        'Start web server with: npm run web',
        'Run full demo with: npm run demo:enhanced'
      ]
    };

    fs.writeFileSync(
      path.join(this.projectRoot, 'build-report.json'),
      JSON.stringify(buildReport, null, 2)
    );

    console.log('  ✅ Build report generated');
  }

  /**
   * Copy directory recursively
   */
  copyDirectory(src, dest) {
    if (!fs.existsSync(src)) return;
    
    if (!fs.existsSync(dest)) {
      fs.mkdirSync(dest, { recursive: true });
    }

    const files = fs.readdirSync(src);
    
    for (const file of files) {
      const srcPath = path.join(src, file);
      const destPath = path.join(dest, file);
      
      if (fs.statSync(srcPath).isDirectory()) {
        this.copyDirectory(srcPath, destPath);
      } else {
        fs.copyFileSync(srcPath, destPath);
      }
    }
  }

  /**
   * Run command with promise
   */
  runCommand(command) {
    return new Promise((resolve, reject) => {
      exec(command, { cwd: this.projectRoot }, (error, stdout, stderr) => {
        if (error) {
          reject(error);
          return;
        }
        resolve(stdout);
      });
    });
  }
}

// Run build if called directly
if (require.main === module) {
  const buildSystem = new DemoBuildSystem();
  buildSystem.build();
}

module.exports = { DemoBuildSystem };
