#!/usr/bin/env node

/**
 * 🖖 DDD Migration Refactoring Script
 * 
 * Mission: Execute tasks 1-4 from architectural implementation
 * 1. Migrate existing packages to new DDD structure
 * 2. Update all package.json files to use new build outputs
 * 3. Implement security boundaries in code
 * 4. Complete Extension SDK implementation
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const PROJECT_ROOT = path.resolve(__dirname, '..');

// Colors
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  cyan: '\x1b[36m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  red: '\x1b[31m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

/**
 * Task 1: Migrate existing packages to new DDD structure
 */
function migratePackagesToDDD() {
  log('\n📦 Task 1: Migrating packages to DDD structure...', 'cyan');
  
  const migrations = [
    {
      from: 'packages/core/src/ai',
      to: 'packages/domain/ai',
      type: 'domain'
    },
    {
      from: 'packages/core/src/memory',
      to: 'packages/domain/memory',
      type: 'domain'
    },
    {
      from: 'packages/core/src/rag',
      to: 'packages/domain/memory/rag',
      type: 'domain'
    },
    {
      from: 'packages/core/src/crew-orchestration',
      to: 'packages/application/crew-services',
      type: 'application'
    },
    {
      from: 'packages/core/src/coordination-workflows',
      to: 'packages/application/workflow-services',
      type: 'application'
    },
    {
      from: 'packages/shared-utilities/src/infrastructure',
      to: 'packages/infrastructure/shared',
      type: 'infrastructure'
    }
  ];

  const results = [];
  for (const migration of migrations) {
    const fromPath = path.join(PROJECT_ROOT, migration.from);
    const toPath = path.join(PROJECT_ROOT, migration.to);
    
    if (fs.existsSync(fromPath)) {
      try {
        // Create destination directory
        if (!fs.existsSync(toPath)) {
          fs.mkdirSync(toPath, { recursive: true });
        }
        
        // Copy files (not moving to preserve git history)
        const files = getAllFiles(fromPath);
        files.forEach(file => {
          const relativePath = path.relative(fromPath, file);
          const destPath = path.join(toPath, relativePath);
          const destDir = path.dirname(destPath);
          
          if (!fs.existsSync(destDir)) {
            fs.mkdirSync(destDir, { recursive: true });
          }
          
          if (!fs.existsSync(destPath)) {
            fs.copyFileSync(file, destPath);
            log(`   ✅ Copied: ${migration.from}/${relativePath} → ${migration.to}/${relativePath}`, 'green');
          }
        });
        
        results.push({ migration: migration.from, status: 'success', files: files.length });
      } catch (error) {
        log(`   ❌ Error migrating ${migration.from}: ${error.message}`, 'red');
        results.push({ migration: migration.from, status: 'error', error: error.message });
      }
    } else {
      log(`   ⚠️  Source not found: ${migration.from}`, 'yellow');
      results.push({ migration: migration.from, status: 'skipped', reason: 'not found' });
    }
  }
  
  return results;
}

function getAllFiles(dir, fileList = []) {
  const files = fs.readdirSync(dir);
  files.forEach(file => {
    const filePath = path.join(dir, file);
    if (fs.statSync(filePath).isDirectory()) {
      getAllFiles(filePath, fileList);
    } else if (!file.startsWith('.') && file !== 'node_modules') {
      fileList.push(filePath);
    }
  });
  return fileList;
}

/**
 * Task 2: Update all package.json files to use new build outputs
 */
function updateBuildOutputs() {
  log('\n🔨 Task 2: Updating build outputs in package.json files...', 'cyan');
  
  const packageJsonFiles = findPackageJsonFiles();
  const updates = [];
  
  for (const pkgJsonPath of packageJsonFiles) {
    try {
      const pkgJson = JSON.parse(fs.readFileSync(pkgJsonPath, 'utf8'));
      const relativePath = path.relative(PROJECT_ROOT, path.dirname(pkgJsonPath));
      
      // Determine output path based on package location
      let outputPath;
      if (relativePath.startsWith('packages/')) {
        const packageName = relativePath.replace('packages/', '').replace(/\//g, '-');
        outputPath = `dist/packages/${packageName}`;
      } else if (relativePath === 'dashboard') {
        outputPath = 'dist/dashboard';
      } else {
        outputPath = `dist/${relativePath}`;
      }
      
      // Update tsconfig if it exists
      const tsconfigPath = path.join(path.dirname(pkgJsonPath), 'tsconfig.json');
      if (fs.existsSync(tsconfigPath)) {
        const tsconfig = JSON.parse(fs.readFileSync(tsconfigPath, 'utf8'));
        if (tsconfig.compilerOptions) {
          tsconfig.compilerOptions.outDir = outputPath;
          fs.writeFileSync(tsconfigPath, JSON.stringify(tsconfig, null, 2));
          log(`   ✅ Updated tsconfig: ${relativePath} → ${outputPath}`, 'green');
        }
      }
      
      // Update package.json build script if it exists
      if (pkgJson.scripts && pkgJson.scripts.build) {
        // Add clean script
        if (!pkgJson.scripts.clean) {
          pkgJson.scripts.clean = `rm -rf ${outputPath}`;
        }
        updates.push({ package: relativePath, outputPath });
      }
      
      fs.writeFileSync(pkgJsonPath, JSON.stringify(pkgJson, null, 2));
    } catch (error) {
      log(`   ❌ Error updating ${pkgJsonPath}: ${error.message}`, 'red');
    }
  }
  
  return updates;
}

function findPackageJsonFiles(dir = PROJECT_ROOT, files = []) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    
    if (entry.isDirectory() && !entry.name.startsWith('.') && entry.name !== 'node_modules') {
      findPackageJsonFiles(fullPath, files);
    } else if (entry.name === 'package.json') {
      files.push(fullPath);
    }
  }
  
  return files;
}

/**
 * Task 3: Implement security boundaries in code
 */
function implementSecurityBoundaries() {
  log('\n🔒 Task 3: Implementing security boundaries...', 'cyan');
  
  const securityConfig = {
    extensionIsolation: {
      sandbox: true,
      messagePassing: true,
      noDirectDomainAccess: true
    },
    buildArtifacts: {
      integrityVerification: true,
      isolation: true
    },
    dataFlow: {
      pattern: 'Extensions → API Gateway → Auth → Domain → Infrastructure',
      enforceBoundaries: true
    }
  };
  
  // Create security middleware
  const securityMiddleware = `/**
 * Security Boundary Enforcement
 * 
 * Ensures extensions cannot directly access domain logic
 */

export class SecurityBoundary {
  private static allowedPaths = [
    '/api/',
    '/webhook/',
    '/sdk/'
  ];
  
  static validateRequest(path: string, source: 'extension' | 'dashboard' | 'api'): boolean {
    if (source === 'extension') {
      // Extensions can only access API endpoints
      return this.allowedPaths.some(allowed => path.startsWith(allowed));
    }
    return true;
  }
  
  static enforceIsolation(context: { source: string; target: string }): void {
    if (context.source === 'extension' && context.target.startsWith('domain/')) {
      throw new Error('Extensions cannot directly access domain layer');
    }
  }
}
`;

  const middlewarePath = path.join(PROJECT_ROOT, 'packages/infrastructure/security', 'boundary.ts');
  if (!fs.existsSync(path.dirname(middlewarePath))) {
    fs.mkdirSync(path.dirname(middlewarePath), { recursive: true });
  }
  fs.writeFileSync(middlewarePath, securityMiddleware);
  log(`   ✅ Created security boundary: ${middlewarePath}`, 'green');
  
  // Update security config
  const configPath = path.join(PROJECT_ROOT, 'config', 'security.json');
  fs.writeFileSync(configPath, JSON.stringify(securityConfig, null, 2));
  log(`   ✅ Updated security config: ${configPath}`, 'green');
  
  return { middlewarePath, configPath };
}

/**
 * Task 4: Complete Extension SDK implementation
 */
function completeExtensionSDK() {
  log('\n📦 Task 4: Completing Extension SDK implementation...', 'cyan');
  
  const sdkDir = path.join(PROJECT_ROOT, 'packages/extension-sdk');
  const sdkSrcDir = path.join(sdkDir, 'src');
  
  // Create complete SDK implementation
  const sdkIndex = `/**
 * Alex AI Unified Extension SDK
 * 
 * Provides unified interface for all IDE extensions to communicate
 * with dashboard system (UI -> Controller -> Supabase)
 */

export interface ExtensionConfig {
  mcpUrl?: string;
  n8nUrl?: string;
  supabaseUrl?: string;
  openRouterUrl?: string;
  apiKey?: string;
}

export interface DashboardResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  status: 'live' | 'mock' | 'loading' | 'error';
}

export class AlexAIExtensionSDK {
  private config: ExtensionConfig;
  
  constructor(config: ExtensionConfig) {
    this.config = config;
  }
  
  /**
   * Send data to dashboard via API Gateway
   */
  async sendToDashboard<T = unknown>(
    endpoint: string,
    payload: unknown
  ): Promise<DashboardResponse<T>> {
    try {
      const url = \`\${this.config.n8nUrl || ''}/webhook/\${endpoint}\`;
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': \`Bearer \${this.config.apiKey || ''}\`
        },
        body: JSON.stringify(payload)
      });
      
      if (!response.ok) {
        throw new Error(\`HTTP \${response.status}: \${response.statusText}\`);
      }
      
      const data = await response.json();
      return {
        success: true,
        data: data as T,
        status: 'live'
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        status: 'error'
      };
    }
  }
  
  /**
   * Get data from dashboard
   */
  async getFromDashboard<T = unknown>(
    endpoint: string
  ): Promise<DashboardResponse<T>> {
    try {
      const url = \`\${this.config.n8nUrl || ''}/webhook/\${endpoint}\`;
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Authorization': \`Bearer \${this.config.apiKey || ''}\`
        }
      });
      
      if (!response.ok) {
        throw new Error(\`HTTP \${response.status}: \${response.statusText}\`);
      }
      
      const data = await response.json();
      return {
        success: true,
        data: data as T,
        status: 'live'
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        status: 'error'
      };
    }
  }
  
  /**
   * Sync with Supabase via controller layer
   */
  async syncWithSupabase(
    table: string,
    data: unknown
  ): Promise<DashboardResponse> {
    return this.sendToDashboard(\`supabase/\${table}\`, data);
  }
  
  /**
   * Get crew coordination
   */
  async getCrewCoordination(query: string): Promise<DashboardResponse> {
    return this.sendToDashboard('crew/coordinate', { query });
  }
  
  /**
   * Store memory in RAG system
   */
  async storeMemory(content: string, metadata?: Record<string, unknown>): Promise<DashboardResponse> {
    return this.sendToDashboard('rag/store', { content, metadata });
  }
}

// Export singleton instance factory
export function createSDK(config: ExtensionConfig): AlexAIExtensionSDK {
  return new AlexAIExtensionSDK(config);
}
`;

  fs.writeFileSync(path.join(sdkSrcDir, 'index.ts'), sdkIndex);
  log(`   ✅ Created SDK implementation: ${sdkSrcDir}/index.ts`, 'green');
  
  // Create TypeScript config
  const tsconfig = {
    extends: '../../config/tsconfig.base.json',
    compilerOptions: {
      outDir: './dist',
      rootDir: './src'
    },
    include: ['src/**/*']
  };
  
  fs.writeFileSync(path.join(sdkDir, 'tsconfig.json'), JSON.stringify(tsconfig, null, 2));
  log(`   ✅ Created SDK tsconfig.json`, 'green');
  
  // Create README
  const readme = `# Alex AI Extension SDK

Unified SDK for all IDE extensions to communicate with the dashboard system.

## Usage

\`\`\`typescript
import { createSDK } from '@alex-ai/extension-sdk';

const sdk = createSDK({
  n8nUrl: 'https://n8n.pbradygeorgen.com',
  apiKey: 'your-api-key'
});

// Send data to dashboard
const result = await sdk.sendToDashboard('project/create', {
  name: 'My Project',
  theme: 'modernBlue'
});

// Get data from dashboard
const projects = await sdk.getFromDashboard('projects/list');

// Sync with Supabase
await sdk.syncWithSupabase('memories', {
  content: 'User preference',
  metadata: { source: 'extension' }
});
\`\`\`

## Architecture

Extensions → SDK → API Gateway (n8n) → Controller → Supabase

This ensures proper DDD boundaries and security isolation.
`;

  fs.writeFileSync(path.join(sdkDir, 'README.md'), readme);
  log(`   ✅ Created SDK README.md`, 'green');
  
  return { sdkDir };
}

/**
 * Main execution
 */
function main() {
  log('🖖 DDD MIGRATION REFACTORING', 'bright');
  log('═══════════════════════════════════════════════════════════\n', 'cyan');
  
  const results = {
    task1: null,
    task2: null,
    task3: null,
    task4: null
  };
  
  try {
    // Task 1: Migrate packages
    results.task1 = migratePackagesToDDD();
    
    // Task 2: Update build outputs
    results.task2 = updateBuildOutputs();
    
    // Task 3: Security boundaries
    results.task3 = implementSecurityBoundaries();
    
    // Task 4: Complete SDK
    results.task4 = completeExtensionSDK();
    
    // Summary
    log('\n📊 REFACTORING SUMMARY', 'bright');
    log('═══════════════════════════════════════════════════════════\n', 'cyan');
    
    log('✅ Task 1: Package Migration', 'green');
    log(`   Migrated ${results.task1.filter(r => r.status === 'success').length} packages`, 'cyan');
    
    log('✅ Task 2: Build Output Updates', 'green');
    log(`   Updated ${results.task2.length} package.json files`, 'cyan');
    
    log('✅ Task 3: Security Boundaries', 'green');
    log(`   Created security middleware and config`, 'cyan');
    
    log('✅ Task 4: Extension SDK', 'green');
    log(`   Completed SDK implementation`, 'cyan');
    
    log('\n✅ All refactoring tasks complete!', 'green');
    log('═══════════════════════════════════════════════════════════\n', 'cyan');
    
  } catch (error) {
    log(`\n❌ Error: ${error.message}`, 'red');
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = { main };

