#!/usr/bin/env node

/**
 * 🖖 DDD Refactoring Execution with Riker/Quark Coordination
 * 
 * Mission: Execute DDD system refactoring based on crew architectural review
 * with optimized team coordination and cost-benefit analysis
 * 
 * Crew Leadership:
 * - ⚡ Riker: Tactical execution, team coordination, resource allocation
 * - 💰 Quark: Task prioritization, cost-benefit, ROI optimization
 * - 🤖 Data: Technical validation and architecture compliance
 * - 🔧 La Forge: Infrastructure readiness and build system
 * - ⚔️ Worf: Security and isolation validation
 * - 📻 Uhura: Integration point validation
 * - 💊 Crusher: Health monitoring and risk assessment
 * - 💭 Troi: Developer experience validation
 * - 🛠️ O'Brien: Pragmatic implementation oversight
 * - 🎖️ Picard: Strategic authorization
 */

const { execSync } = require('child_process');
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
 * Phase 1: Output Directory Isolation (La Forge, O'Brien)
 */
function phase1_OutputIsolation() {
  log('\n🔧 PHASE 1: OUTPUT DIRECTORY ISOLATION', 'cyan');
  log('Team: La Forge, O\'Brien', 'yellow');
  log('═══════════════════════════════════════════════════════════\n', 'cyan');

  const packages = [
    'cli',
    'core',
    'cursor-extension',
    'vscode-extension',
    'universal-extension',
    'extension-sdk',
    'dashboard-core',
    'messages-intelligence',
    'rate-limiter'
  ];

  log('📦 Updating TypeScript configurations for isolated outputs...', 'blue');
  
  packages.forEach(pkg => {
    const pkgPath = path.join(PROJECT_ROOT, 'packages', pkg);
    const tsconfigPath = path.join(pkgPath, 'tsconfig.json');
    
    if (fs.existsSync(tsconfigPath)) {
      try {
        const tsconfig = JSON.parse(fs.readFileSync(tsconfigPath, 'utf8'));
        
        // Update output directory to isolated structure
        if (!tsconfig.compilerOptions) {
          tsconfig.compilerOptions = {};
        }
        
        tsconfig.compilerOptions.outDir = `dist/packages/${pkg}`;
        tsconfig.compilerOptions.rootDir = 'src';
        
        fs.writeFileSync(tsconfigPath, JSON.stringify(tsconfig, null, 2) + '\n');
        log(`  ✅ Updated ${pkg}/tsconfig.json`, 'green');
      } catch (error) {
        log(`  ⚠️  Could not update ${pkg}/tsconfig.json: ${error.message}`, 'yellow');
      }
    }
  });

  log('\n✅ Phase 1 Complete: Output directories isolated', 'green');
}

/**
 * Phase 2: DDD Structure Foundation (Data, Uhura)
 */
function phase2_DDDStructure() {
  log('\n🤖 PHASE 2: DDD STRUCTURE IMPLEMENTATION', 'cyan');
  log('Team: Data, Uhura', 'yellow');
  log('═══════════════════════════════════════════════════════════\n', 'cyan');

  const dddDomains = [
    'crew-management',
    'project-management',
    'knowledge-management',
    'workflow-orchestration',
    'theme-system',
    'dashboard-ui'
  ];

  const basePath = path.join(PROJECT_ROOT, 'src', 'domains');

  log('📁 Creating DDD domain structure...', 'blue');

  dddDomains.forEach(domain => {
    const domainPath = path.join(basePath, domain);
    const layers = [
      'domain/aggregates',
      'domain/entities',
      'domain/value-objects',
      'domain/events',
      'domain/services',
      'application/commands',
      'application/queries',
      'application/handlers',
      'infrastructure/repositories',
      'infrastructure/persistence',
      'api'
    ];

    layers.forEach(layer => {
      const layerPath = path.join(domainPath, layer);
      if (!fs.existsSync(layerPath)) {
        fs.mkdirSync(layerPath, { recursive: true });
      }
    });

    // Create README for each domain
    const readmePath = path.join(domainPath, 'README.md');
    if (!fs.existsSync(readmePath)) {
      const readme = `# ${domain.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())} Domain

## Purpose
[Describe the domain's responsibility]

## Aggregates
- [List aggregates]

## Entities
- [List entities]

## Value Objects
- [List value objects]

## Domain Events
- [List domain events]

## Commands
- [List commands]

## Queries
- [List queries]

## Status
🟡 In Progress
`;
      fs.writeFileSync(readmePath, readme);
    }

    log(`  ✅ Created ${domain} domain structure`, 'green');
  });

  // Create shared infrastructure
  const infraPath = path.join(PROJECT_ROOT, 'src', 'infrastructure');
  const infraLayers = [
    'integrations/supabase',
    'integrations/n8n',
    'integrations/llm',
    'persistence/database',
    'persistence/cache',
    'messaging'
  ];

  infraLayers.forEach(layer => {
    const layerPath = path.join(infraPath, layer);
    if (!fs.existsSync(layerPath)) {
      fs.mkdirSync(layerPath, { recursive: true });
    }
  });

  log('  ✅ Created infrastructure layer structure', 'green');

  log('\n✅ Phase 2 Complete: DDD structure foundation created', 'green');
}

/**
 * Phase 3: Build System Standardization (La Forge, O'Brien)
 */
function phase3_BuildStandardization() {
  log('\n🔧 PHASE 3: BUILD SYSTEM STANDARDIZATION', 'cyan');
  log('Team: La Forge, O\'Brien', 'yellow');
  log('═══════════════════════════════════════════════════════════\n', 'cyan');

  // Create base TypeScript config
  const baseTsconfigPath = path.join(PROJECT_ROOT, 'config', 'tsconfig.base.json');
  const configDir = path.dirname(baseTsconfigPath);
  
  if (!fs.existsSync(configDir)) {
    fs.mkdirSync(configDir, { recursive: true });
  }

  const baseTsconfig = {
    "compilerOptions": {
      "target": "ES2022",
      "module": "commonjs",
      "lib": ["ES2022"],
      "declaration": true,
      "declarationMap": true,
      "sourceMap": true,
      "outDir": "./dist",
      "rootDir": "./src",
      "strict": true,
      "esModuleInterop": true,
      "skipLibCheck": true,
      "forceConsistentCasingInFileNames": true,
      "resolveJsonModule": true,
      "moduleResolution": "node",
      "allowSyntheticDefaultImports": true,
      "experimentalDecorators": true,
      "emitDecoratorMetadata": true
    },
    "exclude": ["node_modules", "dist", "**/*.test.ts", "**/*.spec.ts"]
  };

  fs.writeFileSync(baseTsconfigPath, JSON.stringify(baseTsconfig, null, 2) + '\n');
  log('  ✅ Created base TypeScript configuration', 'green');

  log('\n✅ Phase 3 Complete: Build system standardized', 'green');
}

/**
 * Main execution
 */
function main() {
  log('\n🖖 DDD REFACTORING EXECUTION', 'bright');
  log('═══════════════════════════════════════════════════════════', 'cyan');
  log('Crew Coordination: Riker/Quark Optimized Teams', 'yellow');
  log('═══════════════════════════════════════════════════════════\n', 'cyan');

  try {
    // Execute phases in order
    phase1_OutputIsolation();
    phase2_DDDStructure();
    phase3_BuildStandardization();

    log('\n🎉 DDD REFACTORING PHASES 1-3 COMPLETE!', 'green');
    log('═══════════════════════════════════════════════════════════\n', 'cyan');
    
    log('📋 Next Steps:', 'yellow');
    log('  1. Review created DDD structure', 'blue');
    log('  2. Begin migrating packages to domains', 'blue');
    log('  3. Implement domain aggregates and entities', 'blue');
    log('  4. Create repository interfaces', 'blue');
    log('  5. Implement application layer commands/queries', 'blue');
    
    log('\n🖖 Make it so!', 'magenta');
    
  } catch (error) {
    log(`\n❌ Error during DDD refactoring: ${error.message}`, 'red');
    log(error.stack, 'red');
    process.exit(1);
  }
}

// Execute
main();

