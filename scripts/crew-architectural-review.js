#!/usr/bin/env node

/**
 * 🖖 Crew Architectural Review: Complete System Structure Analysis
 * 
 * Mission: Review entire codebase structure and provide DDD-based recommendations
 * for optimal system architecture across IDE extensions and dashboard systems
 * 
 * Crew Coordination:
 * - 🎖️ Picard: Strategic leadership and mission synthesis
 * - ⚡ Riker: Tactical organization and team coordination
 * - 🤖 Data: Technical architecture analysis
 * - 🔧 La Forge: Infrastructure and build system review
 * - ⚔️ Worf: Security and isolation analysis
 * - 💭 Troi: User experience and system usability
 * - 💊 Crusher: System health and dependency analysis
 * - 📻 Uhura: Communication and integration points
 * - 💰 Quark: Cost-benefit and optimization
 * - 🛠️ O'Brien: Pragmatic solutions and anti-over-engineering
 * 
 * Uses OpenRouter MCP for AI-powered analysis
 */

const fs = require('fs');
const path = require('path');
const https = require('https');

const PROJECT_ROOT = path.resolve(__dirname, '..');

// Extract credentials from ~/.zshrc
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
 * Scan codebase structure
 */
function scanCodebaseStructure() {
  const structure = {
    packages: [],
    dashboard: null,
    extensions: [],
    buildOutputs: [],
    configs: [],
    scripts: []
  };

  function scanDirectory(dir, depth = 0, maxDepth = 3) {
    if (depth > maxDepth) return;
    if (dir.includes('node_modules') || dir.includes('.git') || dir.includes('dist') && depth > 1) return;

    try {
      const entries = fs.readdirSync(dir, { withFileTypes: true });
      
      for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);
        const relativePath = path.relative(PROJECT_ROOT, fullPath);
        
        if (entry.isDirectory()) {
          if (relativePath.startsWith('packages/')) {
            structure.packages.push(relativePath);
          } else if (relativePath === 'dashboard') {
            structure.dashboard = {
              path: relativePath,
              hasNextConfig: fs.existsSync(path.join(fullPath, 'next.config.js')),
              hasDist: fs.existsSync(path.join(fullPath, '.next')) || fs.existsSync(path.join(fullPath, 'dist')),
              distPaths: []
            };
          } else if (relativePath.includes('extension')) {
            structure.extensions.push(relativePath);
          }
          
          if (entry.name === 'dist' || entry.name === '.next' || entry.name.endsWith('-dist')) {
            structure.buildOutputs.push(relativePath);
          }
          
          scanDirectory(fullPath, depth + 1, maxDepth);
        } else if (entry.isFile()) {
          if (entry.name === 'package.json' || entry.name === 'tsconfig.json' || entry.name === 'webpack.config.js') {
            structure.configs.push(relativePath);
          } else if (entry.name.endsWith('.sh') || (entry.name.endsWith('.js') && relativePath.startsWith('scripts/'))) {
            structure.scripts.push(relativePath);
          }
        }
      }
    } catch (error) {
      // Skip directories we can't read
    }
  }

  scanDirectory(PROJECT_ROOT);
  return structure;
}

/**
 * Analyze DDD boundaries
 */
function analyzeDDDBoundaries(structure) {
  const boundaries = {
    presentation: [], // UI layers
    application: [], // Controllers, services
    domain: [], // Business logic
    infrastructure: [] // Data access, external services
  };

  // Categorize based on path patterns
  structure.packages.forEach(pkg => {
    if (pkg.includes('dashboard') || pkg.includes('web-interface')) {
      boundaries.presentation.push(pkg);
    } else if (pkg.includes('extension') || pkg.includes('cli')) {
      boundaries.presentation.push(pkg);
    } else if (pkg.includes('core') || pkg.includes('universal')) {
      boundaries.domain.push(pkg);
    } else if (pkg.includes('integration') || pkg.includes('mcp')) {
      boundaries.infrastructure.push(pkg);
    }
  });

  return boundaries;
}

/**
 * Query OpenRouter for AI analysis
 */
async function queryOpenRouter(crewMember, prompt, systemPrompt) {
  if (!OPENROUTER_API_KEY) {
    return {
      content: `[Simulated ${crewMember} Analysis - OpenRouter API key not configured]\n\n${prompt}`,
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
    max_tokens: 3000
  });

  return new Promise((resolve, reject) => {
    const options = {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'https://alex-ai-universal.pbradygeorgen.com',
        'X-Title': 'Alex AI Crew Architectural Review'
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
 * 🤖 Data's Technical Architecture Analysis
 */
async function dataArchitectureAnalysis(structure, boundaries) {
  log('\n🤖 DATA\'S TECHNICAL ARCHITECTURE ANALYSIS', 'cyan');
  log('═══════════════════════════════════════════════════════════\n', 'cyan');

  const systemPrompt = `You are Commander Data, an android officer on the USS Enterprise. You provide precise, logical, and comprehensive technical analysis. You analyze system architecture, identify patterns, and recommend solutions based on technical merit and system requirements.`;

  const prompt = `Analyze the technical architecture of this codebase and provide recommendations for DDD (Domain-Driven Design) structure.

Current Structure:
${JSON.stringify(structure, null, 2)}

DDD Boundaries Identified:
${JSON.stringify(boundaries, null, 2)}

Key Issues:
1. Output directory isolation problems between IDE extensions and dashboard
2. Need for unified DDD philosophy across IDE extensions and dashboard (UI -> Controller -> Supabase)
3. Build system conflicts and output directory management

Provide:
1. Current architecture assessment
2. DDD boundary violations or improvements
3. Output directory isolation strategy
4. Integration patterns between IDE extensions and dashboard system
5. Technical recommendations for optimal structure
6. Code organization patterns
7. Dependency management strategy
8. Build system coordination`;

  try {
    const result = await queryOpenRouter('Data', prompt, systemPrompt);
    log(result.content, 'cyan');
    return result;
  } catch (error) {
    log(`Error in Data analysis: ${error.message}`, 'red');
    return { content: 'Analysis unavailable', usage: { input_tokens: 0, output_tokens: 0 } };
  }
}

/**
 * 🔧 La Forge's Infrastructure Analysis
 */
async function laForgeInfrastructureAnalysis(structure) {
  log('\n🔧 LA FORGE\'S INFRASTRUCTURE ANALYSIS', 'green');
  log('═══════════════════════════════════════════════════════════\n', 'cyan');

  const systemPrompt = `You are Lieutenant Commander Geordi La Forge, Chief Engineer of the USS Enterprise. You specialize in infrastructure, system reliability, build systems, and engineering solutions. You ensure systems are maintainable, scalable, and performant.`;

  const prompt = `Analyze the infrastructure and build system structure of this codebase.

Current Structure:
${JSON.stringify(structure, null, 2)}

Build Outputs Found:
${structure.buildOutputs.join('\n')}

Key Issues:
1. Output directory conflicts between projects
2. Build system coordination
3. Dependency management across packages

Provide:
1. Build output isolation strategy
2. Build system coordination approach
3. Dependency management recommendations
4. Infrastructure optimization
5. Build artifact organization
6. CI/CD considerations
7. Development vs production builds
8. Infrastructure recommendations`;

  try {
    const result = await queryOpenRouter('La Forge', prompt, systemPrompt);
    log(result.content, 'green');
    return result;
  } catch (error) {
    log(`Error in La Forge analysis: ${error.message}`, 'red');
    return { content: 'Analysis unavailable', usage: { input_tokens: 0, output_tokens: 0 } };
  }
}

/**
 * ⚔️ Worf's Security & Isolation Analysis
 */
async function worfSecurityAnalysis(structure, boundaries) {
  log('\n⚔️ WORF\'S SECURITY & ISOLATION ANALYSIS', 'red');
  log('═══════════════════════════════════════════════════════════\n', 'cyan');

  const systemPrompt = `You are Lieutenant Worf, Security Officer of the USS Enterprise. You are vigilant about security, isolation, boundaries, and threat assessment. You assess risks and recommend security measures.`;

  const prompt = `Analyze the security and isolation aspects of this codebase structure.

Current Structure:
${JSON.stringify(structure, null, 2)}

DDD Boundaries:
${JSON.stringify(boundaries, null, 2)}

Key Concerns:
1. Output directory isolation (prevent cross-contamination)
2. Security boundaries between IDE extensions and dashboard
3. Data flow security (UI -> Controller -> Supabase)
4. Build artifact security

Provide:
1. Security boundary assessment
2. Isolation requirements
3. Output directory security
4. Data flow security analysis
5. Build artifact security
6. Access control recommendations
7. Threat assessment
8. Security recommendations`;

  try {
    const result = await queryOpenRouter('Worf', prompt, systemPrompt);
    log(result.content, 'red');
    return result;
  } catch (error) {
    log(`Error in Worf analysis: ${error.message}`, 'red');
    return { content: 'Analysis unavailable', usage: { input_tokens: 0, output_tokens: 0 } };
  }
}

/**
 * ⚡ Riker's Tactical Organization
 */
async function rikerTacticalOrganization(structure) {
  log('\n⚡ RIKER\'S TACTICAL ORGANIZATION', 'blue');
  log('═══════════════════════════════════════════════════════════\n', 'cyan');

  const systemPrompt = `You are Commander William Riker, First Officer of the USS Enterprise. You excel at tactical planning, resource coordination, and executing complex missions. You organize teams efficiently and create actionable plans.`;

  const prompt = `Create a tactical reorganization plan for this codebase structure.

Current Structure:
${JSON.stringify(structure, null, 2)}

Key Issues:
1. Output directory conflicts
2. Need for unified DDD structure
3. Integration between IDE extensions and dashboard

Provide:
1. Tactical reorganization plan
2. Phased migration approach
3. Team coordination strategy
4. Resource requirements
5. Timeline estimate
6. Risk mitigation
7. Rollback procedures
8. Execution plan`;

  try {
    const result = await queryOpenRouter('Riker', prompt, systemPrompt);
    log(result.content, 'blue');
    return result;
  } catch (error) {
    log(`Error in Riker analysis: ${error.message}`, 'red');
    return { content: 'Analysis unavailable', usage: { input_tokens: 0, output_tokens: 0 } };
  }
}

/**
 * 💰 Quark's Cost-Benefit Analysis
 */
async function quarkCostBenefit(structure) {
  log('\n💰 QUARK\'S COST-BENEFIT ANALYSIS', 'magenta');
  log('═══════════════════════════════════════════════════════════\n', 'cyan');

  const systemPrompt = `You are Quark, Business Operations Specialist from Deep Space 9. You analyze every technical decision through the lens of business value and ROI. You ask 'What's the cost?' and 'What's the return?'.`;

  const prompt = `Analyze the cost-benefit of reorganizing this codebase structure.

Current Structure:
${JSON.stringify(structure, null, 2)}

Key Changes Needed:
1. Output directory isolation
2. DDD structure implementation
3. System integration improvements

Provide:
1. Reorganization cost estimate
2. Maintenance cost comparison
3. Developer productivity impact
4. ROI analysis
5. Cost savings opportunities
6. Risk costs
7. Recommendation with business rationale`;

  try {
    const result = await queryOpenRouter('Quark', prompt, systemPrompt);
    log(result.content, 'yellow');
    return result;
  } catch (error) {
    log(`Error in Quark analysis: ${error.message}`, 'red');
    return { content: 'Analysis unavailable', usage: { input_tokens: 0, output_tokens: 0 } };
  }
}

/**
 * 🛠️ O'Brien's Pragmatic Solutions
 */
async function obrienPragmaticSolutions(structure) {
  log('\n🛠️  O\'BRIEN\'S PRAGMATIC SOLUTIONS', 'yellow');
  log('═══════════════════════════════════════════════════════════\n', 'cyan');

  const systemPrompt = `You are Chief Miles O'Brien, Chief of Operations. You provide pragmatic, no-nonsense solutions. You focus on what works, avoid over-engineering, and get things done efficiently.`;

  const prompt = `Provide pragmatic solutions for this codebase structure reorganization.

Current Structure:
${JSON.stringify(structure, null, 2)}

Key Issues:
1. Output directory conflicts
2. Need for DDD structure
3. System integration

Provide:
1. Simplest viable solution
2. Quick wins
3. Incremental approach
4. Anti-over-engineering recommendations
5. Practical constraints
6. Minimal viable reorganization
7. Step-by-step implementation
8. Pragmatic recommendation`;

  try {
    const result = await queryOpenRouter('O\'Brien', prompt, systemPrompt);
    log(result.content, 'yellow');
    return result;
  } catch (error) {
    log(`Error in O'Brien analysis: ${error.message}`, 'red');
    return { content: 'Analysis unavailable', usage: { input_tokens: 0, output_tokens: 0 } };
  }
}

/**
 * 📻 Uhura's Integration Analysis
 */
async function uhuraIntegrationAnalysis(structure, boundaries) {
  log('\n📻 UHURA\'S INTEGRATION ANALYSIS', 'cyan');
  log('═══════════════════════════════════════════════════════════\n', 'cyan');

  const systemPrompt = `You are Lieutenant Uhura, Communications Officer of the USS Enterprise. You specialize in communication systems, integration points, and ensuring all systems can communicate effectively.`;

  const prompt = `Analyze the integration points between IDE extensions and dashboard system.

Current Structure:
${JSON.stringify(structure, null, 2)}

DDD Boundaries:
${JSON.stringify(boundaries, null, 2)}

Integration Flow:
UI (Dashboard/Extensions) -> Controller (n8n/MCP) -> Supabase

Provide:
1. Integration point analysis
2. Communication patterns
3. Data flow optimization
4. API design recommendations
5. Integration testing strategy
6. Service boundaries
7. Protocol recommendations
8. Integration architecture`;

  try {
    const result = await queryOpenRouter('Uhura', prompt, systemPrompt);
    log(result.content, 'cyan');
    return result;
  } catch (error) {
    log(`Error in Uhura analysis: ${error.message}`, 'red');
    return { content: 'Analysis unavailable', usage: { input_tokens: 0, output_tokens: 0 } };
  }
}

/**
 * 💊 Crusher's Health Analysis
 */
async function crusherHealthAnalysis(structure) {
  log('\n💊 CRUSHER\'S SYSTEM HEALTH ANALYSIS', 'green');
  log('═══════════════════════════════════════════════════════════\n', 'cyan');

  const systemPrompt = `You are Dr. Beverly Crusher, Chief Medical Officer of the USS Enterprise. You assess system health, diagnose issues, evaluate risks, and recommend preventive measures.`;

  const prompt = `Assess the health of this codebase structure and identify risks.

Current Structure:
${JSON.stringify(structure, null, 2)}

Key Concerns:
1. Output directory conflicts
2. Dependency management
3. Build system coordination
4. System integration health

Provide:
1. Health assessment
2. Risk identification
3. Dependency health
4. Build system health
5. Integration health
6. Preventive measures
7. Monitoring recommendations
8. Health recommendations`;

  try {
    const result = await queryOpenRouter('Crusher', prompt, systemPrompt);
    log(result.content, 'green');
    return result;
  } catch (error) {
    log(`Error in Crusher analysis: ${error.message}`, 'red');
    return { content: 'Analysis unavailable', usage: { input_tokens: 0, output_tokens: 0 } };
  }
}

/**
 * 💭 Troi's UX & Developer Experience Analysis
 */
async function troiUXAnalysis(structure) {
  log('\n💭 TROI\'S UX & DEVELOPER EXPERIENCE ANALYSIS', 'magenta');
  log('═══════════════════════════════════════════════════════════\n', 'cyan');

  const systemPrompt = `You are Counselor Deanna Troi, Ship's Counselor of the USS Enterprise. You understand user psychology, emotional needs, and user experience. You assess how changes affect users and developers.`;

  const prompt = `Analyze the developer experience and usability of this codebase structure.

Current Structure:
${JSON.stringify(structure, null, 2)}

Key Concerns:
1. Developer confusion from output directory conflicts
2. Build system complexity
3. Navigation and discovery
4. Onboarding experience

Provide:
1. Developer experience assessment
2. Usability issues
3. Navigation improvements
4. Onboarding recommendations
5. Documentation needs
6. Tooling improvements
7. Workflow optimization
8. UX recommendations`;

  try {
    const result = await queryOpenRouter('Troi', prompt, systemPrompt);
    log(result.content, 'magenta');
    return result;
  } catch (error) {
    log(`Error in Troi analysis: ${error.message}`, 'red');
    return { content: 'Analysis unavailable', usage: { input_tokens: 0, output_tokens: 0 } };
  }
}

/**
 * 🎖️ Picard's Strategic Synthesis
 */
async function picardSynthesis(analyses, structure, boundaries) {
  log('\n🎖️  PICARD\'S STRATEGIC SYNTHESIS', 'bright');
  log('═══════════════════════════════════════════════════════════\n', 'cyan');

  const systemPrompt = `You are Captain Jean-Luc Picard, Commanding Officer of the USS Enterprise. You synthesize multiple perspectives, make strategic decisions, and provide clear, decisive leadership. You consider all factors to make the best decision for the mission.`;

  const summary = analyses.map((a, i) => 
    `Crew Member ${i + 1} Analysis:\n${a.content.substring(0, 800)}...`
  ).join('\n\n');

  const prompt = `Synthesize the crew's analyses and provide strategic recommendations for codebase reorganization.

Current Structure:
${JSON.stringify(structure, null, 2)}

DDD Boundaries:
${JSON.stringify(boundaries, null, 2)}

Crew Analyses:
${summary}

Mission: Reorganize codebase structure with:
1. Output directory isolation
2. Unified DDD philosophy
3. Integration between IDE extensions and dashboard (UI -> Controller -> Supabase)

Provide:
1. Strategic decision and approach
2. Rationale synthesizing all perspectives
3. Implementation command
4. Priority recommendations
5. Long-term architectural vision
6. Risk assessment
7. Success metrics
8. Final recommendation`;

  try {
    const result = await queryOpenRouter('Picard', prompt, systemPrompt);
    log(result.content, 'bright');
    return result;
  } catch (error) {
    log(`Error in Picard synthesis: ${error.message}`, 'red');
    return { content: 'Synthesis unavailable', usage: { input_tokens: 0, output_tokens: 0 } };
  }
}

/**
 * Store in RAG system
 */
async function storeInRAG(report) {
  if (!N8N_URL) {
    log('\n⚠️  N8N URL not configured - skipping RAG storage', 'yellow');
    return;
  }

  try {
    const webhookUrl = `${N8N_URL}/webhook/knowledge-ingest`;
    const payload = JSON.stringify({
      event_type: 'crew_architectural_review',
      crew_member: 'full_crew',
      analysis_type: 'system_structure_review',
      content: JSON.stringify(report),
      timestamp: new Date().toISOString(),
      metadata: {
        participants: ['picard', 'riker', 'data', 'laForge', 'worf', 'troi', 'crusher', 'uhura', 'quark', 'obrien'],
        topic: 'Complete System Structure Review - DDD Architecture'
      }
    });

    const options = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(payload)
      }
    };

    return new Promise((resolve, reject) => {
      const url = new URL(webhookUrl);
      const req = https.request(url, options, (res) => {
        let data = '';
        res.on('data', (chunk) => { data += chunk; });
        res.on('end', () => {
          if (res.statusCode >= 200 && res.statusCode < 300) {
            log('\n✅ Review stored in RAG system', 'green');
            resolve(data);
          } else {
            log(`\n⚠️  RAG storage returned status ${res.statusCode}`, 'yellow');
            resolve(data);
          }
        });
      });

      req.on('error', (error) => {
        log(`\n⚠️  RAG storage error: ${error.message}`, 'yellow');
        resolve(); // Don't fail the whole process
      });

      req.write(payload);
      req.end();
    });
  } catch (error) {
    log(`\n⚠️  RAG storage error: ${error.message}`, 'yellow');
  }
}

/**
 * Main execution
 */
async function main() {
  log('🖖 CREW ARCHITECTURAL REVIEW: COMPLETE SYSTEM STRUCTURE', 'bright');
  log('═══════════════════════════════════════════════════════════\n', 'cyan');
  log('Mission: Review entire codebase structure and provide DDD-based recommendations', 'cyan');
  log('Focus: Output directory isolation, IDE extensions, Dashboard integration\n', 'cyan');

  // Scan codebase
  log('📊 Scanning codebase structure...\n', 'cyan');
  const structure = scanCodebaseStructure();
  const boundaries = analyzeDDDBoundaries(structure);

  log('Found:', 'yellow');
  log(`  - Packages: ${structure.packages.length}`, 'cyan');
  log(`  - Extensions: ${structure.extensions.length}`, 'cyan');
  log(`  - Build outputs: ${structure.buildOutputs.length}`, 'cyan');
  log(`  - Config files: ${structure.configs.length}`, 'cyan');
  log('');

  const analyses = {
    data: null,
    laForge: null,
    worf: null,
    riker: null,
    quark: null,
    obrien: null,
    uhura: null,
    crusher: null,
    troi: null,
    picard: null
  };

  // Execute analyses in parallel where possible
  log('🔄 Running crew analyses...\n', 'cyan');

  // Data, La Forge, Worf, Uhura, Crusher, Troi in parallel
  const [
    dataResult,
    laForgeResult,
    worfResult,
    uhuraResult,
    crusherResult,
    troiResult
  ] = await Promise.all([
    dataArchitectureAnalysis(structure, boundaries),
    laForgeInfrastructureAnalysis(structure),
    worfSecurityAnalysis(structure, boundaries),
    uhuraIntegrationAnalysis(structure, boundaries),
    crusherHealthAnalysis(structure),
    troiUXAnalysis(structure)
  ]);

  analyses.data = dataResult;
  analyses.laForge = laForgeResult;
  analyses.worf = worfResult;
  analyses.uhura = uhuraResult;
  analyses.crusher = crusherResult;
  analyses.troi = troiResult;

  // Riker, Quark, O'Brien sequentially (they build on each other)
  analyses.riker = await rikerTacticalOrganization(structure);
  analyses.quark = await quarkCostBenefit(structure);
  analyses.obrien = await obrienPragmaticSolutions(structure);

  // Picard synthesis
  const allAnalyses = [
    analyses.data,
    analyses.laForge,
    analyses.worf,
    analyses.riker,
    analyses.quark,
    analyses.obrien,
    analyses.uhura,
    analyses.crusher,
    analyses.troi
  ];
  analyses.picard = await picardSynthesis(allAnalyses, structure, boundaries);

  // Save report
  const outputDir = path.join(PROJECT_ROOT, 'docs', 'crew-coordination');
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const outputFile = path.join(outputDir, `architectural-review-${timestamp}.json`);

  const report = {
    timestamp: new Date().toISOString(),
    mission: 'Complete System Structure Review - DDD Architecture',
    structure,
    boundaries,
    crew: {
      data: { analysis: analyses.data.content, usage: analyses.data.usage },
      laForge: { analysis: analyses.laForge.content, usage: analyses.laForge.usage },
      worf: { analysis: analyses.worf.content, usage: analyses.worf.usage },
      riker: { analysis: analyses.riker.content, usage: analyses.riker.usage },
      quark: { analysis: analyses.quark.content, usage: analyses.quark.usage },
      obrien: { analysis: analyses.obrien.content, usage: analyses.obrien.usage },
      uhura: { analysis: analyses.uhura.content, usage: analyses.uhura.usage },
      crusher: { analysis: analyses.crusher.content, usage: analyses.crusher.usage },
      troi: { analysis: analyses.troi.content, usage: analyses.troi.usage },
      picard: { decision: analyses.picard.content, usage: analyses.picard.usage }
    },
    totalTokens: Object.values(analyses).reduce((sum, a) => 
      sum + (a.usage?.input_tokens || 0) + (a.usage?.output_tokens || 0), 0
    )
  };

  fs.writeFileSync(outputFile, JSON.stringify(report, null, 2));
  log(`\n💾 Full review saved to: ${outputFile}`, 'green');

  // Store in RAG
  await storeInRAG(report);

  log('\n✅ Mission Complete!', 'green');
  log('═══════════════════════════════════════════════════════════\n', 'cyan');
}

if (require.main === module) {
  main().catch((error) => {
    log(`\n❌ Error: ${error.message}`, 'red');
    process.exit(1);
  });
}

module.exports = { main };

