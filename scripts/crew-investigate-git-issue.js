#!/usr/bin/env node

/**
 * 🖖 Crew Multimodal Investigation: Git Integration Problem
 * 
 * Mission: Investigate git repository corruption preventing milestone pushes
 * This is CRITICAL for CI/CD and cross-IDE support
 * 
 * Crew Coordination:
 * - 🤖 Data: Technical analysis of git corruption
 * - 🔧 La Forge: Infrastructure and repository health
 * - ⚔️ Worf: Security implications and integrity
 * - ⚡ Riker: Tactical recovery plan
 * - 💊 Crusher: Health diagnosis and treatment
 * - 📻 Uhura: Communication and integration points
 * - 💰 Quark: Cost-benefit of recovery options
 * - 🛠️ O'Brien: Pragmatic solutions
 * - 💭 Troi: Developer experience impact
 * - 🎖️ Picard: Strategic decision
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
 * Gather git diagnostic information
 */
function gatherGitDiagnostics() {
  const diagnostics = {
    repository: {},
    corruption: {},
    refs: {},
    objects: {},
    remote: {},
    errors: []
  };

  // Check if git repo
  try {
    diagnostics.repository.root = execSync('git rev-parse --show-toplevel', { 
      cwd: PROJECT_ROOT, 
      encoding: 'utf8',
      stdio: 'pipe'
    }).trim();
    diagnostics.repository.isValid = true;
  } catch (error) {
    diagnostics.repository.isValid = false;
    diagnostics.errors.push('Not a valid git repository');
    return diagnostics;
  }

  // Check current branch
  try {
    diagnostics.repository.branch = execSync('git rev-parse --abbrev-ref HEAD', {
      cwd: PROJECT_ROOT,
      encoding: 'utf8',
      stdio: 'pipe'
    }).trim();
  } catch (error) {
    diagnostics.repository.branch = 'unknown';
    diagnostics.errors.push(`Cannot determine branch: ${error.message}`);
  }

  // Check HEAD commit
  try {
    diagnostics.repository.head = execSync('git rev-parse HEAD', {
      cwd: PROJECT_ROOT,
      encoding: 'utf8',
      stdio: 'pipe'
    }).trim();
  } catch (error) {
    diagnostics.repository.head = 'corrupted';
    diagnostics.errors.push(`Cannot read HEAD: ${error.message}`);
  }

  // Check remote
  try {
    diagnostics.remote.url = execSync('git remote get-url origin', {
      cwd: PROJECT_ROOT,
      encoding: 'utf8',
      stdio: 'pipe'
    }).trim();
    diagnostics.remote.exists = true;
  } catch (error) {
    diagnostics.remote.exists = false;
    diagnostics.errors.push('No remote configured');
  }

  // Check for broken refs
  try {
    const brokenRefs = execSync('find .git/refs -type f -name "* 2" -o -name "* 3" -o -name "* 4" -o -name "* 5"', {
      cwd: PROJECT_ROOT,
      encoding: 'utf8',
      stdio: 'pipe'
    }).trim().split('\n').filter(r => r);
    diagnostics.refs.broken = brokenRefs;
  } catch (error) {
    diagnostics.refs.broken = [];
  }

  // Check git fsck (with timeout)
  try {
    const fsckOutput = execSync('timeout 10 git fsck --full --no-progress 2>&1 || git fsck --full --no-progress 2>&1 | head -50', {
      cwd: PROJECT_ROOT,
      encoding: 'utf8',
      stdio: 'pipe',
      timeout: 10000
    });
    const errors = fsckOutput.split('\n').filter(line => 
      line.includes('error:') || line.includes('fatal:') || line.includes('dangling')
    );
    diagnostics.corruption.fsckErrors = errors.slice(0, 20); // Limit to 20 errors
    diagnostics.corruption.hasErrors = errors.length > 0;
  } catch (error) {
    diagnostics.corruption.fsckErrors = [error.message];
    diagnostics.corruption.hasErrors = true;
  }

  // Check for corrupted objects
  try {
    const corruptedObjects = execSync('git fsck --full --no-progress 2>&1 | grep "error:" | grep -o "[a-f0-9]\\{40\\}"', {
      cwd: PROJECT_ROOT,
      encoding: 'utf8',
      stdio: 'pipe'
    }).trim().split('\n').filter(o => o);
    diagnostics.objects.corrupted = corruptedObjects;
  } catch (error) {
    diagnostics.objects.corrupted = [];
  }

  // Check pack files
  try {
    const packDir = path.join(PROJECT_ROOT, '.git', 'objects', 'pack');
    if (fs.existsSync(packDir)) {
      const packs = fs.readdirSync(packDir).filter(f => f.endsWith('.pack') || f.endsWith('.idx'));
      diagnostics.objects.packFiles = packs;
    } else {
      diagnostics.objects.packFiles = [];
    }
  } catch (error) {
    diagnostics.objects.packFiles = [];
  }

  // Try to get remote main commit
  try {
    diagnostics.remote.mainCommit = execSync('git log origin/main --oneline -1 2>&1', {
      cwd: PROJECT_ROOT,
      encoding: 'utf8',
      stdio: 'pipe'
    }).trim();
  } catch (error) {
    diagnostics.remote.mainCommit = 'unavailable';
  }

  return diagnostics;
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
    max_tokens: 2500
  });

  return new Promise((resolve, reject) => {
    const options = {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'https://alex-ai-universal.pbradygeorgen.com',
        'X-Title': 'Alex AI Crew Git Investigation'
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
 * 🤖 Data's Technical Analysis
 */
async function dataTechnicalAnalysis(diagnostics) {
  log('\n🤖 DATA\'S TECHNICAL ANALYSIS', 'cyan');
  log('═══════════════════════════════════════════════════════════\n', 'cyan');

  const systemPrompt = `You are Commander Data, an android officer. You provide precise, logical, comprehensive technical analysis. You analyze system problems, identify root causes, and recommend solutions based on technical merit.`;

  const prompt = `Analyze this git repository corruption issue and provide technical diagnosis:

Git Diagnostics:
${JSON.stringify(diagnostics, null, 2)}

Key Issues:
- Corrupted tree object: 92eef57f59175dd7ec557d7ced2d6a63efc478d7
- Invalid object: 33a1a85fa521d612e4c23595ef81607b13ba8686
- Broken refs with invalid names
- Cannot read HEAD reference
- Milestone push failing

Provide:
1. Root cause analysis
2. Technical diagnosis
3. Data integrity assessment
4. Recovery options with technical details
5. Risk assessment for each option
6. Recommended technical solution`;

  try {
    const result = await queryOpenRouter('Data', prompt, systemPrompt);
    log(result.content, 'cyan');
    return result;
  } catch (error) {
    log(`Error: ${error.message}`, 'red');
    return { content: 'Analysis unavailable', usage: { input_tokens: 0, output_tokens: 0 } };
  }
}

/**
 * 🔧 La Forge's Infrastructure Analysis
 */
async function laForgeInfrastructureAnalysis(diagnostics) {
  log('\n🔧 LA FORGE\'S INFRASTRUCTURE ANALYSIS', 'green');
  log('═══════════════════════════════════════════════════════════\n', 'cyan');

  const systemPrompt = `You are Lieutenant Commander Geordi La Forge, Chief Engineer. You specialize in infrastructure, system reliability, and engineering solutions. You ensure systems are maintainable and recoverable.`;

  const prompt = `Analyze the infrastructure implications of this git repository corruption:

Diagnostics:
${JSON.stringify(diagnostics, null, 2)}

Infrastructure Concerns:
- Repository health
- CI/CD impact
- Backup and recovery
- Prevention strategies

Provide:
1. Infrastructure health assessment
2. CI/CD pipeline impact
3. Recovery infrastructure requirements
4. Prevention mechanisms
5. Monitoring recommendations
6. Infrastructure recovery plan`;

  try {
    const result = await queryOpenRouter('La Forge', prompt, systemPrompt);
    log(result.content, 'green');
    return result;
  } catch (error) {
    log(`Error: ${error.message}`, 'red');
    return { content: 'Analysis unavailable', usage: { input_tokens: 0, output_tokens: 0 } };
  }
}

/**
 * ⚔️ Worf's Security Analysis
 */
async function worfSecurityAnalysis(diagnostics) {
  log('\n⚔️ WORF\'S SECURITY ANALYSIS', 'red');
  log('═══════════════════════════════════════════════════════════\n', 'cyan');

  const systemPrompt = `You are Lieutenant Worf, Security Officer. You assess security implications, integrity threats, and recommend security measures.`;

  const prompt = `Analyze security and integrity implications of git repository corruption:

Diagnostics:
${JSON.stringify(diagnostics, null, 2)}

Security Concerns:
- Data integrity
- Authentication/authorization
- Repository tampering
- CI/CD security

Provide:
1. Security threat assessment
2. Integrity violation analysis
3. Authentication impact
4. CI/CD security implications
5. Security recovery measures
6. Prevention strategies`;

  try {
    const result = await queryOpenRouter('Worf', prompt, systemPrompt);
    log(result.content, 'red');
    return result;
  } catch (error) {
    log(`Error: ${error.message}`, 'red');
    return { content: 'Analysis unavailable', usage: { input_tokens: 0, output_tokens: 0 } };
  }
}

/**
 * ⚡ Riker's Tactical Recovery Plan
 */
async function rikerTacticalPlan(diagnostics, analyses) {
  log('\n⚡ RIKER\'S TACTICAL RECOVERY PLAN', 'blue');
  log('═══════════════════════════════════════════════════════════\n', 'cyan');

  const systemPrompt = `You are Commander Riker. You create tactical execution plans, coordinate teams, and ensure efficient resource allocation.`;

  const summary = analyses.map((a, i) => 
    `Analysis ${i + 1}:\n${a.content.substring(0, 500)}...`
  ).join('\n\n');

  const prompt = `Create a tactical recovery plan for git repository corruption:

Diagnostics:
${JSON.stringify(diagnostics, null, 2)}

Crew Analyses:
${summary}

Provide:
1. Step-by-step recovery plan
2. Resource requirements
3. Timeline estimate
4. Risk mitigation
5. Rollback procedures
6. Execution sequence
7. Success criteria`;

  try {
    const result = await queryOpenRouter('Riker', prompt, systemPrompt);
    log(result.content, 'blue');
    return result;
  } catch (error) {
    log(`Error: ${error.message}`, 'red');
    return { content: 'Plan unavailable', usage: { input_tokens: 0, output_tokens: 0 } };
  }
}

/**
 * 💊 Crusher's Health Diagnosis
 */
async function crusherHealthDiagnosis(diagnostics) {
  log('\n💊 CRUSHER\'S HEALTH DIAGNOSIS', 'green');
  log('═══════════════════════════════════════════════════════════\n', 'cyan');

  const systemPrompt = `You are Dr. Beverly Crusher, Chief Medical Officer. You assess system health, diagnose issues, evaluate risks, and recommend treatment.`;

  const prompt = `Diagnose the health of this git repository:

Diagnostics:
${JSON.stringify(diagnostics, null, 2)}

Provide:
1. Health assessment
2. Severity diagnosis
3. Treatment options
4. Recovery prognosis
5. Preventive care
6. Health monitoring recommendations`;

  try {
    const result = await queryOpenRouter('Crusher', prompt, systemPrompt);
    log(result.content, 'green');
    return result;
  } catch (error) {
    log(`Error: ${error.message}`, 'red');
    return { content: 'Diagnosis unavailable', usage: { input_tokens: 0, output_tokens: 0 } };
  }
}

/**
 * 💰 Quark's Cost-Benefit Analysis
 */
async function quarkCostBenefit(diagnostics) {
  log('\n💰 QUARK\'S COST-BENEFIT ANALYSIS', 'yellow');
  log('═══════════════════════════════════════════════════════════\n', 'cyan');

  const systemPrompt = `You are Quark, Business Operations Specialist. You analyze every decision through ROI and cost-benefit.`;

  const prompt = `Analyze recovery options for git corruption:

Diagnostics:
${JSON.stringify(diagnostics, null, 2)}

Recovery Options:
1. Repair existing repository
2. Re-clone from remote
3. Create new branch from known good commit
4. Full repository reset

Provide:
1. Cost estimate for each option
2. Time investment
3. Risk costs
4. ROI analysis
5. Business impact
6. Recommended option with rationale`;

  try {
    const result = await queryOpenRouter('Quark', prompt, systemPrompt);
    log(result.content, 'yellow');
    return result;
  } catch (error) {
    log(`Error: ${error.message}`, 'red');
    return { content: 'Analysis unavailable', usage: { input_tokens: 0, output_tokens: 0 } };
  }
}

/**
 * 🛠️ O'Brien's Pragmatic Solution
 */
async function obrienPragmaticSolution(diagnostics) {
  log('\n🛠️  O\'BRIEN\'S PRAGMATIC SOLUTION', 'yellow');
  log('═══════════════════════════════════════════════════════════\n', 'cyan');

  const systemPrompt = `You are Chief Miles O'Brien. You provide pragmatic, no-nonsense solutions. Focus on what works, avoid over-engineering.`;

  const prompt = `Provide the simplest, most effective solution for git corruption:

Diagnostics:
${JSON.stringify(diagnostics, null, 2)}

Provide:
1. Simplest viable solution
2. Step-by-step commands
3. Quick wins
4. Anti-over-engineering approach
5. Practical implementation`;

  try {
    const result = await queryOpenRouter('O\'Brien', prompt, systemPrompt);
    log(result.content, 'yellow');
    return result;
  } catch (error) {
    log(`Error: ${error.message}`, 'red');
    return { content: 'Solution unavailable', usage: { input_tokens: 0, output_tokens: 0 } };
  }
}

/**
 * 🎖️ Picard's Strategic Decision
 */
async function picardStrategicDecision(diagnostics, allAnalyses) {
  log('\n🎖️  PICARD\'S STRATEGIC DECISION', 'bright');
  log('═══════════════════════════════════════════════════════════\n', 'cyan');

  const systemPrompt = `You are Captain Jean-Luc Picard. You synthesize multiple perspectives and make strategic decisions.`;

  const summary = allAnalyses.map((a, i) => 
    `Crew Member ${i + 1}:\n${a.content.substring(0, 400)}...`
  ).join('\n\n');

  const prompt = `Synthesize crew analyses and make strategic decision for git recovery:

Diagnostics:
${JSON.stringify(diagnostics, null, 2)}

Crew Analyses:
${summary}

Provide:
1. Strategic decision
2. Rationale synthesizing all perspectives
3. Implementation command
4. Risk assessment
5. Success metrics
6. Final recommendation`;

  try {
    const result = await queryOpenRouter('Picard', prompt, systemPrompt);
    log(result.content, 'bright');
    return result;
  } catch (error) {
    log(`Error: ${error.message}`, 'red');
    return { content: 'Decision unavailable', usage: { input_tokens: 0, output_tokens: 0 } };
  }
}

/**
 * Main execution
 */
async function main() {
  log('🖖 CREW MULTIMODAL INVESTIGATION: GIT INTEGRATION PROBLEM', 'bright');
  log('═══════════════════════════════════════════════════════════\n', 'cyan');
  log('Mission: Investigate git corruption preventing milestone pushes', 'cyan');
  log('Critical: CI/CD and cross-IDE support depend on this\n', 'cyan');

  // Gather diagnostics
  log('📊 Gathering git diagnostics...', 'cyan');
  const diagnostics = gatherGitDiagnostics();
  log(`   Repository: ${diagnostics.repository.isValid ? 'Valid' : 'Invalid'}`, 
      diagnostics.repository.isValid ? 'green' : 'red');
  log(`   Branch: ${diagnostics.repository.branch || 'unknown'}`, 'cyan');
  log(`   Errors: ${diagnostics.errors.length}`, diagnostics.errors.length > 0 ? 'red' : 'green');
  log('');

  // Run analyses in parallel
  log('🔄 Running crew analyses...\n', 'cyan');

  const [
    dataResult,
    laForgeResult,
    worfResult,
    crusherResult,
    quarkResult,
    obrienResult
  ] = await Promise.all([
    dataTechnicalAnalysis(diagnostics),
    laForgeInfrastructureAnalysis(diagnostics),
    worfSecurityAnalysis(diagnostics),
    crusherHealthDiagnosis(diagnostics),
    quarkCostBenefit(diagnostics),
    obrienPragmaticSolution(diagnostics)
  ]);

  // Riker creates tactical plan
  const rikerResult = await rikerTacticalPlan(diagnostics, [
    dataResult,
    laForgeResult,
    worfResult
  ]);

  // Picard makes strategic decision
  const picardResult = await picardStrategicDecision(diagnostics, [
    dataResult,
    laForgeResult,
    worfResult,
    rikerResult,
    crusherResult,
    quarkResult,
    obrienResult
  ]);

  // Save report
  const report = {
    timestamp: new Date().toISOString(),
    mission: 'Git Integration Problem Investigation',
    diagnostics,
    crew: {
      data: { analysis: dataResult.content, usage: dataResult.usage },
      laForge: { analysis: laForgeResult.content, usage: laForgeResult.usage },
      worf: { analysis: worfResult.content, usage: worfResult.usage },
      riker: { plan: rikerResult.content, usage: rikerResult.usage },
      crusher: { diagnosis: crusherResult.content, usage: crusherResult.usage },
      quark: { analysis: quarkResult.content, usage: quarkResult.usage },
      obrien: { solution: obrienResult.content, usage: obrienResult.usage },
      picard: { decision: picardResult.content, usage: picardResult.usage }
    },
    totalTokens: [
      dataResult, laForgeResult, worfResult, rikerResult,
      crusherResult, quarkResult, obrienResult, picardResult
    ].reduce((sum, r) => sum + (r.usage?.input_tokens || 0) + (r.usage?.output_tokens || 0), 0)
  };

  const reportDir = path.join(PROJECT_ROOT, 'docs', 'crew-coordination');
  if (!fs.existsSync(reportDir)) {
    fs.mkdirSync(reportDir, { recursive: true });
  }

  const reportFile = path.join(reportDir, `git-investigation-${Date.now()}.json`);
  fs.writeFileSync(reportFile, JSON.stringify(report, null, 2));
  log(`\n💾 Full investigation saved: ${reportFile}`, 'green');

  log('\n✅ Investigation Complete!', 'green');
  log('═══════════════════════════════════════════════════════════\n', 'cyan');
}

if (require.main === module) {
  main().catch((error) => {
    log(`\n❌ Error: ${error.message}`, 'red');
    process.exit(1);
  });
}

module.exports = { main };

