#!/usr/bin/env node

/**
 * 🖖 Crew Review: Build System Structure for VS Code Extension
 * 
 * Mission: Review system structure and identify build configurations
 * that can be utilized for VS Code extension E2E
 * 
 * Crew Coordination:
 * - 🔧 La Forge: Infrastructure and build system analysis
 * - 🤖 Data: Technical architecture review
 * - ⚡ Riker: Tactical build strategy
 * - 🛠️ O'Brien: Pragmatic build approach
 * - 🎖️ Picard: Strategic synthesis
 */

const fs = require('fs');
const path = require('path');

const PROJECT_ROOT = path.resolve(__dirname, '..');

// Colors
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  cyan: '\x1b[36m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  red: '\x1b[31m',
  magenta: '\x1b[35m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

/**
 * Find all build configuration files
 */
function findBuildConfigs() {
  const configs = {
    webpack: [],
    nextjs: [],
    typescript: [],
    packageJson: [],
    other: []
  };

  function scanDirectory(dir, depth = 0) {
    if (depth > 5) return; // Limit depth
    if (dir.includes('node_modules') || dir.includes('dist') || dir.includes('.git')) return;

    try {
      const entries = fs.readdirSync(dir, { withFileTypes: true });
      
      for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);
        
        if (entry.isDirectory()) {
          scanDirectory(fullPath, depth + 1);
        } else if (entry.isFile()) {
          const name = entry.name.toLowerCase();
          
          if (name.includes('webpack') && (name.endsWith('.js') || name.endsWith('.config.js'))) {
            configs.webpack.push(fullPath);
          } else if (name === 'next.config.js' || name === 'next.config.ts') {
            configs.nextjs.push(fullPath);
          } else if (name === 'tsconfig.json') {
            configs.typescript.push(fullPath);
          } else if (name === 'package.json') {
            configs.packageJson.push(fullPath);
          } else if (name.includes('build') && (name.endsWith('.js') || name.endsWith('.json'))) {
            configs.other.push(fullPath);
          }
        }
      }
    } catch (error) {
      // Skip directories we can't read
    }
  }

  scanDirectory(PROJECT_ROOT);
  return configs;
}

/**
 * Analyze package.json for build scripts
 */
function analyzePackageJson(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const pkg = JSON.parse(content);
    
    return {
      path: filePath,
      name: pkg.name,
      scripts: pkg.scripts || {},
      dependencies: Object.keys(pkg.dependencies || {}),
      devDependencies: Object.keys(pkg.devDependencies || {}),
      hasWebpack: !!(pkg.dependencies?.webpack || pkg.devDependencies?.webpack),
      hasTypeScript: !!(pkg.dependencies?.typescript || pkg.devDependencies?.typescript),
      hasNextJS: !!(pkg.dependencies?.next || pkg.devDependencies?.next)
    };
  } catch (error) {
    return null;
  }
}

/**
 * Analyze TypeScript config
 */
function analyzeTSConfig(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const config = JSON.parse(content);
    
    return {
      path: filePath,
      compilerOptions: config.compilerOptions || {},
      include: config.include || [],
      exclude: config.exclude || []
    };
  } catch (error) {
    return null;
  }
}

/**
 * Main analysis
 */
function main() {
  log('🖖 CREW REVIEW: BUILD SYSTEM STRUCTURE', 'bright');
  log('═══════════════════════════════════════════════════════════\n', 'cyan');
  log('Mission: Review system structure for VS Code extension build configuration\n', 'cyan');

  log('🔧 LA FORGE: Scanning for build configurations...\n', 'green');
  
  const configs = findBuildConfigs();
  
  log(`Found configurations:`, 'cyan');
  log(`  - Webpack: ${configs.webpack.length}`, 'yellow');
  log(`  - Next.js: ${configs.nextjs.length}`, 'yellow');
  log(`  - TypeScript: ${configs.typescript.length}`, 'yellow');
  log(`  - Package.json: ${configs.packageJson.length}`, 'yellow');
  log(`  - Other build files: ${configs.other.length}`, 'yellow');
  log('');

  // Analyze VS Code extension package.json
  log('🤖 DATA: Analyzing VS Code extension build setup...\n', 'cyan');
  
  const vscodeExtensionPkg = configs.packageJson.find(p => p.includes('vscode-extension'));
  if (vscodeExtensionPkg) {
    const analysis = analyzePackageJson(vscodeExtensionPkg);
    if (analysis) {
      log(`Package: ${analysis.name}`, 'yellow');
      log(`Build scripts:`, 'yellow');
      Object.entries(analysis.scripts).forEach(([key, value]) => {
        if (key.includes('build') || key.includes('compile')) {
          log(`  - ${key}: ${value}`, 'cyan');
        }
      });
      log(`Has TypeScript: ${analysis.hasTypeScript ? '✅' : '❌'}`, analysis.hasTypeScript ? 'green' : 'red');
      log(`Has Webpack: ${analysis.hasWebpack ? '✅' : '❌'}`, analysis.hasWebpack ? 'green' : 'red');
      log('');
    }
  }

  // Check for shared build configurations
  log('⚡ RIKER: Identifying reusable build configurations...\n', 'blue');
  
  const rootPkg = analyzePackageJson(path.join(PROJECT_ROOT, 'package.json'));
  if (rootPkg) {
    log('Root package.json build tools:', 'yellow');
    if (rootPkg.hasWebpack) {
      log('  ✅ Webpack available at root', 'green');
    }
    if (rootPkg.hasTypeScript) {
      log('  ✅ TypeScript available at root', 'green');
    }
    if (rootPkg.hasNextJS) {
      log('  ✅ Next.js available (can reference build config)', 'green');
    }
    log('');
  }

  // Check Next.js config for build patterns
  if (configs.nextjs.length > 0) {
    log('📋 Next.js build configuration found:', 'yellow');
    configs.nextjs.forEach(config => {
      log(`  - ${path.relative(PROJECT_ROOT, config)}`, 'cyan');
    });
    log('');
  }

  // Check TypeScript configs
  log('📋 TypeScript configurations:', 'yellow');
  const vscodeTSConfig = configs.typescript.find(t => t.includes('vscode-extension'));
  if (vscodeTSConfig) {
    const tsAnalysis = analyzeTSConfig(vscodeTSConfig);
    if (tsAnalysis) {
      log(`  VS Code Extension TSConfig:`, 'cyan');
      log(`    - outDir: ${tsAnalysis.compilerOptions.outDir || 'not set'}`, 'yellow');
      log(`    - rootDir: ${tsAnalysis.compilerOptions.rootDir || 'not set'}`, 'yellow');
      log(`    - module: ${tsAnalysis.compilerOptions.module || 'not set'}`, 'yellow');
    }
  }
  log('');

  // Recommendations
  log('🛠️  O\'BRIEN: Pragmatic build recommendations...\n', 'yellow');
  
  const recommendations = [];
  
  if (!configs.webpack.length && !rootPkg?.hasWebpack) {
    recommendations.push({
      type: 'info',
      message: 'No webpack found. Consider using TypeScript compiler directly or adding webpack for bundling.'
    });
  }
  
  if (vscodeExtensionPkg) {
    const vscodePkg = analyzePackageJson(vscodeExtensionPkg);
    if (vscodePkg && !vscodePkg.hasWebpack) {
      recommendations.push({
        type: 'suggestion',
        message: 'VS Code extension could benefit from webpack for bundling dependencies and optimizing output.'
      });
    }
  }

  if (configs.nextjs.length > 0) {
    recommendations.push({
      type: 'opportunity',
      message: 'Next.js build configuration exists - can reference patterns for webpack setup.'
    });
  }

  recommendations.forEach(rec => {
    const icon = rec.type === 'suggestion' ? '💡' : rec.type === 'opportunity' ? '🎯' : 'ℹ️';
    log(`${icon} ${rec.message}`, 'cyan');
  });
  log('');

  // Strategic synthesis
  log('🎖️  PICARD: Strategic build approach...\n', 'bright');
  
  log('Recommended build strategy for VS Code extension:', 'yellow');
  log('1. Use TypeScript compiler (tsc) for type checking and basic compilation', 'cyan');
  log('2. Consider webpack for:', 'cyan');
  log('   - Bundling dependencies', 'yellow');
  log('   - Code splitting (if needed)', 'yellow');
  log('   - Tree shaking', 'yellow');
  log('   - Minification for production', 'yellow');
  log('3. Reference Next.js webpack config patterns if available', 'cyan');
  log('4. Use existing TypeScript config as base', 'cyan');
  log('');

  // Save report
  const report = {
    timestamp: new Date().toISOString(),
    configs: {
      webpack: configs.webpack.map(c => path.relative(PROJECT_ROOT, c)),
      nextjs: configs.nextjs.map(c => path.relative(PROJECT_ROOT, c)),
      typescript: configs.typescript.map(c => path.relative(PROJECT_ROOT, c))
    },
    vscodeExtension: {
      packageJson: vscodeExtensionPkg ? path.relative(PROJECT_ROOT, vscodeExtensionPkg) : null,
      tsConfig: vscodeTSConfig ? path.relative(PROJECT_ROOT, vscodeTSConfig) : null,
      analysis: vscodeExtensionPkg ? analyzePackageJson(vscodeExtensionPkg) : null
    },
    recommendations
  };

  const reportPath = path.join(PROJECT_ROOT, 'docs', 'crew-coordination', `build-system-review-${Date.now()}.json`);
  const reportDir = path.dirname(reportPath);
  if (!fs.existsSync(reportDir)) {
    fs.mkdirSync(reportDir, { recursive: true });
  }
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
  
  log(`💾 Report saved to: ${path.relative(PROJECT_ROOT, reportPath)}`, 'green');
  log('\n✅ Mission Complete!', 'green');
  log('═══════════════════════════════════════════════════════════\n', 'cyan');
}

if (require.main === module) {
  main();
}

module.exports = { main };

