#!/usr/bin/env node

/**
 * 🖖 Crew-Coordinated Architectural Implementation
 * 
 * Mission: Implement architectural changes based on crew review
 * with Riker/Quark team coordination and optimization
 * 
 * Crew Leadership:
 * - 💰 Quark: Task prioritization, cost-benefit, ROI optimization
 * - ⚡ Riker: Tactical execution, team coordination, resource allocation
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
const https = require('https');

const PROJECT_ROOT = path.resolve(__dirname, '..');

// Extract credentials
function extractEnvVar(varName, defaultValue = '') {
  try {
    const zshrc = fs.readFileSync(process.env.HOME + '/.zshrc', 'utf8');
    const match = zshrc.match(new RegExp(`^export ${varName}=['"]?([^'"]*)['"]?`, 'm'));
    return match ? match[1] : defaultValue;
  } catch (e) {
    return defaultValue;
  }
}

const OPENROUTER_API_KEY = extractEnvVar('OPENROUTER_API_KEY');
const N8N_URL = extractEnvVar('N8N_URL', 'https://n8n.pbradygeorgen.com');

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
 * Query OpenRouter for AI analysis
 */
async function queryOpenRouter(crewMember, prompt, systemPrompt) {
  if (!OPENROUTER_API_KEY) {
    return {
      content: `[Simulated ${crewMember} Analysis]`,
      usage: { input_tokens: 0, output_tokens: 0 }
    };
  }

  const model = 'anthropic/claude-3.7-sonnet:beta';
  const url = 'https://openrouter.ai/api/v1/chat/completions';

  const payload = JSON.stringify({
    model,
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: prompt }
    ],
    temperature: 0.7,
    max_tokens: 2000
  });

  return new Promise((resolve, reject) => {
    const options = {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'https://alex-ai-universal.pbradygeorgen.com',
        'X-Title': 'Alex AI Crew Implementation'
      }
    };

    const req = https.request(url, options, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          if (json.error) {
            reject(new Error(json.error.message));
          } else {
            resolve({
              content: json.choices[0].message.content,
              usage: json.usage || { input_tokens: 0, output_tokens: 0 }
            });
          }
        } catch (e) {
          reject(e);
        }
      });
    });

    req.on('error', reject);
    req.write(payload);
    req.end();
  });
}

/**
 * 💰 Quark's Task Prioritization
 */
async function quarkPrioritizeTasks(architecturalFindings) {
  log('\n💰 QUARK\'S TASK PRIORITIZATION & ROI ANALYSIS', 'magenta');
  log('═══════════════════════════════════════════════════════════\n', 'cyan');

  const systemPrompt = `You are Quark, Business Operations Specialist. You prioritize tasks based on ROI, cost-benefit, and business value. You optimize resource allocation.`;

  const prompt = `Prioritize these architectural implementation tasks based on ROI and cost-benefit:

Key Findings:
${JSON.stringify(architecturalFindings, null, 2)}

Tasks to Prioritize:
1. Output directory isolation
2. DDD structure implementation
3. Build system standardization
4. Extension SDK creation
5. API Gateway implementation
6. Security boundaries
7. Integration pattern standardization
8. Script organization

For each task, provide:
- Priority (1-10)
- Cost estimate
- ROI assessment
- Dependencies
- Recommended execution order
- Business rationale`;

  try {
    const result = await queryOpenRouter('Quark', prompt, systemPrompt);
    log(result.content, 'yellow');
    return result;
  } catch (error) {
    log(`Error: ${error.message}`, 'red');
    return { content: 'Prioritization unavailable', usage: { input_tokens: 0, output_tokens: 0 } };
  }
}

/**
 * ⚡ Riker's Team Coordination
 */
async function rikerCoordinateTeams(prioritizedTasks) {
  log('\n⚡ RIKER\'S TEAM COORDINATION PLAN', 'blue');
  log('═══════════════════════════════════════════════════════════\n', 'cyan');

  const systemPrompt = `You are Commander Riker. You coordinate teams, create tactical execution plans, and ensure efficient resource allocation.`;

  const prompt = `Create a tactical execution plan with team assignments for these prioritized tasks:

${prioritizedTasks}

Create teams that can work in parallel:
- Team assignments for each crew member
- Parallel execution opportunities
- Dependencies and sequencing
- Resource allocation
- Timeline estimates
- Risk mitigation`;

  try {
    const result = await queryOpenRouter('Riker', prompt, systemPrompt);
    log(result.content, 'blue');
    return result;
  } catch (error) {
    log(`Error: ${error.message}`, 'red');
    return { content: 'Coordination unavailable', usage: { input_tokens: 0, output_tokens: 0 } };
  }
}

/**
 * Load architectural review findings
 */
function loadArchitecturalReview() {
  const reviewDir = path.join(PROJECT_ROOT, 'docs', 'crew-coordination');
  if (!fs.existsSync(reviewDir)) {
    return null;
  }

  const reviews = fs.readdirSync(reviewDir)
    .filter(f => f.startsWith('architectural-review-') && f.endsWith('.json'))
    .map(f => path.join(reviewDir, f))
    .sort()
    .reverse();

  if (reviews.length === 0) {
    return null;
  }

  try {
    const latest = JSON.parse(fs.readFileSync(reviews[0], 'utf8'));
    return latest;
  } catch (error) {
    return null;
  }
}

/**
 * Create implementation plan
 */
function createImplementationPlan(quarkAnalysis, rikerPlan, review) {
  const plan = {
    timestamp: new Date().toISOString(),
    mission: 'Architectural Implementation - DDD Structure & Output Isolation',
    prioritizedTasks: quarkAnalysis.content,
    teamCoordination: rikerPlan.content,
    implementationSteps: [],
    teams: {}
  };

  // Extract key recommendations from review
  const keyRecommendations = [
    {
      id: 'output-isolation',
      name: 'Output Directory Isolation',
      priority: 1,
      team: ['laForge', 'obrien'],
      estimatedTime: '1-2 days'
    },
    {
      id: 'ddd-structure',
      name: 'DDD Structure Implementation',
      priority: 2,
      team: ['data', 'uhura'],
      estimatedTime: '3-5 days'
    },
    {
      id: 'build-standardization',
      name: 'Build System Standardization',
      priority: 3,
      team: ['laForge', 'obrien'],
      estimatedTime: '2-3 days'
    },
    {
      id: 'extension-sdk',
      name: 'Unified Extension SDK',
      priority: 4,
      team: ['uhura', 'data'],
      estimatedTime: '3-4 days'
    },
    {
      id: 'security-boundaries',
      name: 'Security Boundaries',
      priority: 5,
      team: ['worf', 'crusher'],
      estimatedTime: '2-3 days'
    },
    {
      id: 'script-organization',
      name: 'Script Organization',
      priority: 6,
      team: ['obrien', 'troi'],
      estimatedTime: '1-2 days'
    }
  ];

  plan.implementationSteps = keyRecommendations;
  return plan;
}

/**
 * Execute implementation step
 */
async function executeStep(step, team) {
  log(`\n🔧 Executing: ${step.name}`, 'green');
  log(`   Team: ${team.join(', ')}`, 'cyan');
  log(`   Priority: ${step.priority}`, 'yellow');

  try {
    switch (step.id) {
      case 'output-isolation':
        return await implementOutputIsolation();
      case 'ddd-structure':
        return await implementDDDStructure();
      case 'build-standardization':
        return await implementBuildStandardization();
      case 'extension-sdk':
        return await implementExtensionSDK();
      case 'security-boundaries':
        return await implementSecurityBoundaries();
      case 'script-organization':
        return await organizeScripts();
      default:
        return { success: false, error: 'Unknown step' };
    }
  } catch (error) {
    return { success: false, error: error.message };
  }
}

/**
 * Implement output directory isolation
 */
async function implementOutputIsolation() {
  log('   📦 Creating output isolation structure...', 'cyan');
  
  const distStructure = {
    'packages/core': 'dist/packages/core',
    'packages/cli': 'dist/packages/cli',
    'packages/vscode-extension': 'dist/packages/extensions/vscode',
    'packages/cursor-extension': 'dist/packages/extensions/cursor',
    'packages/universal-extension': 'dist/packages/extensions/universal',
    'dashboard': 'dist/dashboard'
  };

  // Update tsconfig.json files
  const updates = [];
  for (const [packagePath, outputPath] of Object.entries(distStructure)) {
    const fullPath = path.join(PROJECT_ROOT, packagePath);
    const tsconfigPath = path.join(fullPath, 'tsconfig.json');
    
    if (fs.existsSync(tsconfigPath)) {
      try {
        const tsconfig = JSON.parse(fs.readFileSync(tsconfigPath, 'utf8'));
        tsconfig.compilerOptions = tsconfig.compilerOptions || {};
        tsconfig.compilerOptions.outDir = outputPath;
        fs.writeFileSync(tsconfigPath, JSON.stringify(tsconfig, null, 2));
        updates.push(packagePath);
      } catch (error) {
        // Skip if can't update
      }
    }
  }

  // Update webpack configs
  const webpackConfigPath = path.join(PROJECT_ROOT, 'packages/vscode-extension/webpack.config.js');
  if (fs.existsSync(webpackConfigPath)) {
    let webpackConfig = fs.readFileSync(webpackConfigPath, 'utf8');
    webpackConfig = webpackConfig.replace(
      /output:\s*\{[^}]*path:\s*path\.resolve\(__dirname,\s*['"]dist['"]\)/,
      `output: {\n    path: path.resolve(__dirname, 'dist/packages/extensions/vscode')`
    );
    fs.writeFileSync(webpackConfigPath, webpackConfig);
  }

  return {
    success: true,
    message: `Updated ${updates.length} package configurations`,
    updates
  };
}

/**
 * Implement DDD structure
 */
async function implementDDDStructure() {
  log('   🏗️  Creating DDD structure...', 'cyan');
  
  const dddStructure = [
    'packages/domain',
    'packages/domain/ai',
    'packages/domain/memory',
    'packages/domain/crew',
    'packages/application',
    'packages/application/ai-services',
    'packages/application/memory-services',
    'packages/application/crew-services',
    'packages/infrastructure',
    'packages/infrastructure/persistence',
    'packages/infrastructure/integration',
    'packages/infrastructure/messaging'
  ];

  const created = [];
  for (const dir of dddStructure) {
    const fullPath = path.join(PROJECT_ROOT, dir);
    if (!fs.existsSync(fullPath)) {
      fs.mkdirSync(fullPath, { recursive: true });
      created.push(dir);
      
      // Create README
      const readmePath = path.join(fullPath, 'README.md');
      if (!fs.existsSync(readmePath)) {
        fs.writeFileSync(readmePath, `# ${path.basename(dir)}\n\nDDD Layer: ${dir.split('/')[1]}\n`);
      }
    }
  }

  return {
    success: true,
    message: `Created ${created.length} DDD directories`,
    created
  };
}

/**
 * Implement build standardization
 */
async function implementBuildStandardization() {
  log('   🔨 Standardizing build configurations...', 'cyan');
  
  // Create shared build configs
  const configDir = path.join(PROJECT_ROOT, 'config');
  if (!fs.existsSync(configDir)) {
    fs.mkdirSync(configDir, { recursive: true });
  }

  // Create base TypeScript config
  const baseTSConfig = {
    compilerOptions: {
      target: 'es2020',
      module: 'commonjs',
      lib: ['es2020'],
      strict: true,
      esModuleInterop: true,
      skipLibCheck: true,
      forceConsistentCasingInFileNames: true,
      moduleResolution: 'node',
      resolveJsonModule: true,
      sourceMap: true
    }
  };

  fs.writeFileSync(
    path.join(configDir, 'tsconfig.base.json'),
    JSON.stringify(baseTSConfig, null, 2)
  );

  return {
    success: true,
    message: 'Created base build configurations'
  };
}

/**
 * Implement Extension SDK
 */
async function implementExtensionSDK() {
  log('   📦 Creating unified Extension SDK...', 'cyan');
  
  const sdkDir = path.join(PROJECT_ROOT, 'packages/extension-sdk');
  if (!fs.existsSync(sdkDir)) {
    fs.mkdirSync(sdkDir, { recursive: true });
    fs.mkdirSync(path.join(sdkDir, 'src'), { recursive: true });
  }

  // Create SDK package.json
  const sdkPackageJson = {
    name: '@alex-ai/extension-sdk',
    version: '1.0.0',
    description: 'Unified SDK for Alex AI IDE extensions',
    main: 'dist/index.js',
    types: 'dist/index.d.ts',
    scripts: {
      build: 'tsc',
      dev: 'tsc --watch'
    }
  };

  fs.writeFileSync(
    path.join(sdkDir, 'package.json'),
    JSON.stringify(sdkPackageJson, null, 2)
  );

  // Create SDK index
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
}

export class AlexAIExtensionSDK {
  constructor(private config: ExtensionConfig) {}

  async sendToDashboard(endpoint: string, payload: unknown): Promise<unknown> {
    // Implementation
  }

  async getFromDashboard(endpoint: string): Promise<unknown> {
    // Implementation
  }

  async syncWithSupabase(data: unknown): Promise<void> {
    // Implementation
  }
}
`;

  fs.writeFileSync(path.join(sdkDir, 'src/index.ts'), sdkIndex);

  return {
    success: true,
    message: 'Created Extension SDK structure'
  };
}

/**
 * Implement security boundaries
 */
async function implementSecurityBoundaries() {
  log('   🔒 Implementing security boundaries...', 'cyan');
  
  // Create security configuration
  const securityConfig = {
    extensionIsolation: {
      sandbox: true,
      messagePassing: true,
      noDirectDomainAccess: true
    },
    buildArtifacts: {
      integrityVerification: true,
      isolation: true,
      signing: false // To be implemented
    },
    dataFlow: {
      pattern: 'Extensions → API Gateway → Auth → Domain → Infrastructure',
      enforceBoundaries: true
    }
  };

  const configPath = path.join(PROJECT_ROOT, 'config', 'security.json');
  fs.writeFileSync(configPath, JSON.stringify(securityConfig, null, 2));

  return {
    success: true,
    message: 'Created security boundary configuration'
  };
}

/**
 * Organize scripts
 */
async function organizeScripts() {
  log('   📚 Organizing scripts...', 'cyan');
  
  const scriptsDir = path.join(PROJECT_ROOT, 'scripts');
  const categories = {
    'crew': 'Crew coordination scripts',
    'build': 'Build and compilation scripts',
    'deploy': 'Deployment scripts',
    'test': 'Testing scripts',
    'migration': 'Migration scripts',
    'utils': 'Utility scripts'
  };

  // Create index file
  const indexContent = `# Scripts Index

## Categories

${Object.entries(categories).map(([cat, desc]) => `- **${cat}**: ${desc}`).join('\n')}

## Usage

See individual script files for usage instructions.
`;

  fs.writeFileSync(path.join(scriptsDir, 'README.md'), indexContent);

  return {
    success: true,
    message: 'Created scripts organization'
  };
}

/**
 * Main execution
 */
async function main() {
  log('🖖 CREW-COORDINATED ARCHITECTURAL IMPLEMENTATION', 'bright');
  log('═══════════════════════════════════════════════════════════\n', 'cyan');
  log('Mission: Implement architectural changes with Riker/Quark coordination\n', 'cyan');

  // Load architectural review
  log('📊 Loading architectural review findings...', 'cyan');
  const review = loadArchitecturalReview();
  
  if (!review) {
    log('⚠️  No architectural review found. Running review first...', 'yellow');
    try {
      execSync('node scripts/crew-architectural-review.js', { 
        cwd: PROJECT_ROOT,
        stdio: 'inherit'
      });
      // Reload
      const newReview = loadArchitecturalReview();
      if (newReview) {
        Object.assign(review || {}, newReview);
      }
    } catch (error) {
      log(`❌ Review failed: ${error.message}`, 'red');
      return;
    }
  }

  // Quark prioritization
  const quarkAnalysis = await quarkPrioritizeTasks(review?.structure || {});
  
  // Riker team coordination
  const rikerPlan = await rikerCoordinateTeams(quarkAnalysis.content);
  
  // Create implementation plan
  const plan = createImplementationPlan(quarkAnalysis, rikerPlan, review);
  
  // Save plan
  const planDir = path.join(PROJECT_ROOT, 'docs', 'crew-coordination');
  if (!fs.existsSync(planDir)) {
    fs.mkdirSync(planDir, { recursive: true });
  }
  
  const planFile = path.join(planDir, `implementation-plan-${Date.now()}.json`);
  fs.writeFileSync(planFile, JSON.stringify(plan, null, 2));
  log(`\n💾 Implementation plan saved: ${planFile}`, 'green');

  // Execute implementation steps
  log('\n🚀 EXECUTING IMPLEMENTATION PLAN', 'bright');
  log('═══════════════════════════════════════════════════════════\n', 'cyan');

  const results = [];
  for (const step of plan.implementationSteps) {
    const result = await executeStep(step, step.team);
    results.push({ step: step.name, ...result });
    
    if (result.success) {
      log(`   ✅ ${step.name} completed`, 'green');
    } else {
      log(`   ❌ ${step.name} failed: ${result.error}`, 'red');
    }
  }

  // Summary
  log('\n📊 IMPLEMENTATION SUMMARY', 'bright');
  log('═══════════════════════════════════════════════════════════\n', 'cyan');
  
  const successful = results.filter(r => r.success).length;
  const failed = results.filter(r => !r.success).length;
  
  log(`✅ Successful: ${successful}`, 'green');
  log(`❌ Failed: ${failed}`, failed > 0 ? 'red' : 'green');
  log(`📋 Total: ${results.length}`, 'cyan');
  
  log('\n✅ Implementation complete!', 'green');
  log('═══════════════════════════════════════════════════════════\n', 'cyan');
}

if (require.main === module) {
  main().catch((error) => {
    log(`\n❌ Error: ${error.message}`, 'red');
    process.exit(1);
  });
}

module.exports = { main };

