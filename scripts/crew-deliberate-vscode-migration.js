#!/usr/bin/env node

/**
 * 🖖 Crew Deliberation: Cursor AI → VS Code Migration
 * 
 * Mission: Analyze migration of Alex AI chat interface from Cursor AI to VS Code
 * 
 * Crew Coordination:
 * - ⚡ Riker: Tactical planning and execution strategy
 * - 💰 Quark: Cost-benefit analysis and ROI evaluation
 * - 🤖 Data: Technical feasibility and architecture analysis
 * - 🔧 La Forge: Infrastructure and integration assessment
 * - ⚔️ Worf: Security and compliance considerations
 * - 💭 Troi: User experience and adoption impact
 * - 💊 Crusher: System health and migration risks
 * - 📻 Uhura: Communication and integration points
 * - 🛠️ O'Brien: Pragmatic implementation approach
 * - 🎖️ Picard: Strategic synthesis and final decision
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
    max_tokens: 2000
  });

  return new Promise((resolve, reject) => {
    const options = {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'https://alex-ai-universal.pbradygeorgen.com',
        'X-Title': 'Alex AI Crew Deliberation'
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
 * 💰 Quark's Cost-Benefit Analysis
 */
async function quarkCostBenefit() {
  log('\n💰 QUARK\'S COST-BENEFIT ANALYSIS', 'magenta');
  log('═══════════════════════════════════════════════════════════\n', 'cyan');

  const systemPrompt = `You are Quark, Business Operations Specialist from Deep Space 9. You analyze every technical decision through the lens of business value and ROI. You ask 'What's the cost?' and 'What's the return?' You're skilled at identifying waste, optimizing budgets, and finding the most cost-effective solutions. You reference the Ferengi Rules of Acquisition when relevant.`;

  const prompt = `Analyze the cost-benefit of migrating Alex AI chat interface from Cursor AI to VS Code.

Current State (Cursor AI):
- Integrated chat interface in Cursor AI IDE
- Zero additional licensing cost (Cursor AI subscription covers it)
- Tight integration with Cursor's AI features
- User base: Cursor AI users only
- Development: Leverages Cursor AI's chat infrastructure

Proposed State (VS Code):
- Standalone VS Code extension
- Free (VS Code is free, extension can be free)
- Broader user base (all VS Code users)
- Development: Requires building chat UI, MCP integration, crew coordination
- Maintenance: Separate codebase for VS Code extension

Provide:
1. Development cost estimate (time, resources)
2. Maintenance cost comparison
3. User base expansion potential
4. Revenue opportunities (if any)
5. Cost savings (if any)
6. ROI analysis
7. Recommendation with business rationale
8. Reference Rules of Acquisition if relevant`;

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
 * ⚡ Riker's Tactical Migration Plan
 */
async function rikerTacticalPlan(quarkAnalysis) {
  log('\n⚡ RIKER\'S TACTICAL MIGRATION PLAN', 'blue');
  log('═══════════════════════════════════════════════════════════\n', 'cyan');

  const systemPrompt = `You are Commander William Riker, First Officer of the USS Enterprise. You excel at tactical planning, resource coordination, and executing complex missions. You organize teams efficiently, break down large tasks into actionable steps, and ensure all crew members work together effectively. You're practical, decisive, and focused on getting results.`;

  const prompt = `Create a tactical migration plan for moving Alex AI chat interface from Cursor AI to VS Code.

Current Architecture:
- Chat interface integrated in Cursor AI
- Uses Cursor AI's chat infrastructure
- Crew coordination via n8n/MCP
- RAG system in Supabase
- OpenRouter for LLM access

Target Architecture (VS Code):
- VS Code extension with chat panel
- Same crew coordination (n8n/MCP)
- Same RAG system (Supabase)
- Same OpenRouter integration
- Standalone extension package

Provide:
1. Phased migration approach
2. Resource requirements (team, time)
3. Risk mitigation strategies
4. Rollback procedures
5. Testing strategy
6. Deployment plan
7. Timeline estimate
8. Team coordination approach`;

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
 * 🤖 Data's Technical Feasibility Analysis
 */
async function dataTechnicalAnalysis() {
  log('\n🤖 DATA\'S TECHNICAL FEASIBILITY ANALYSIS', 'cyan');
  log('═══════════════════════════════════════════════════════════\n', 'cyan');

  const systemPrompt = `You are Commander Data, an android officer on the USS Enterprise. You provide precise, logical, and comprehensive technical analysis. You compare features objectively, identify technical trade-offs, and recommend solutions based on technical merit and system requirements.`;

  const prompt = `Analyze the technical feasibility of migrating Alex AI chat interface from Cursor AI to VS Code.

Technical Requirements:
- Chat UI panel in VS Code
- Real-time crew coordination
- MCP integration
- OpenRouter API calls
- RAG system integration (Supabase)
- State management
- Extension packaging and distribution

VS Code Extension Capabilities:
- Webview API for custom UI
- Extension API for IDE integration
- Command palette integration
- Status bar integration
- Tree view support
- Terminal integration

Technical Challenges:
- Chat UI implementation (Webview vs native)
- Real-time updates and state sync
- MCP server communication
- Crew coordination workflow
- Extension performance
- Memory management

Provide:
1. Technical feasibility assessment
2. Architecture comparison (Cursor vs VS Code)
3. Implementation complexity
4. Required VS Code APIs
5. Performance considerations
6. Integration points
7. Technical risks
8. Recommendation with technical rationale`;

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
 * 🔧 La Forge's Infrastructure Assessment
 */
async function laForgeInfrastructure() {
  log('\n🔧 LA FORGE\'S INFRASTRUCTURE ASSESSMENT', 'green');
  log('═══════════════════════════════════════════════════════════\n', 'cyan');

  const systemPrompt = `You are Lieutenant Commander Geordi La Forge, Chief Engineer of the USS Enterprise. You specialize in infrastructure, system reliability, and engineering solutions. You ensure systems are maintainable, scalable, and performant.`;

  const prompt = `Assess the infrastructure implications of migrating Alex AI from Cursor AI to VS Code.

Infrastructure Considerations:
- Extension distribution (VS Code Marketplace)
- Update mechanism
- Backend service integration (n8n, MCP, Supabase)
- Network communication
- Resource usage (memory, CPU)
- Extension lifecycle management
- Multi-platform support (Windows, macOS, Linux)
- Extension versioning

Current Infrastructure:
- n8n workflows for crew coordination
- MCP server for integrations
- Supabase for RAG storage
- OpenRouter for LLM access

Provide:
1. Infrastructure requirements
2. Distribution strategy
3. Update and maintenance approach
4. Resource optimization
5. Scalability considerations
6. Platform compatibility
7. Infrastructure risks
8. Recommendation`;

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
 * ⚔️ Worf's Security Analysis
 */
async function worfSecurity() {
  log('\n⚔️ WORF\'S SECURITY ANALYSIS', 'red');
  log('═══════════════════════════════════════════════════════════\n', 'cyan');

  const systemPrompt = `You are Lieutenant Worf, Security Officer of the USS Enterprise. You are vigilant about security, threats, and compliance. You assess risks and recommend security measures.`;

  const prompt = `Analyze security implications of migrating Alex AI from Cursor AI to VS Code.

Security Considerations:
- Extension permissions and capabilities
- API key management
- Network communication security
- Data privacy and storage
- Extension marketplace security
- Code signing and verification
- User data handling
- Compliance requirements

Current Security (Cursor AI):
- Integrated in Cursor AI (their security model)
- API keys in ~/.zshrc
- Secure communication via HTTPS

VS Code Extension Security:
- Extension manifest permissions
- Webview security (CSP, isolation)
- API key storage (secrets API)
- Network request security
- Extension validation

Provide:
1. Security risk assessment
2. Permission requirements
3. API key management strategy
4. Communication security
5. Compliance considerations
6. Security best practices
7. Risk mitigation
8. Recommendation`;

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
 * 💭 Troi's UX Analysis
 */
async function troiUX() {
  log('\n💭 TROI\'S USER EXPERIENCE ANALYSIS', 'magenta');
  log('═══════════════════════════════════════════════════════════\n', 'cyan');

  const systemPrompt = `You are Counselor Deanna Troi, Ship's Counselor of the USS Enterprise. You understand user psychology, emotional needs, and user experience. You assess how changes affect users and recommend user-centric solutions.`;

  const prompt = `Analyze the user experience impact of migrating Alex AI from Cursor AI to VS Code.

UX Considerations:
- User familiarity and learning curve
- Interface consistency
- Workflow integration
- Accessibility
- User adoption barriers
- Feature parity
- User satisfaction
- Migration experience

Current UX (Cursor AI):
- Native chat interface
- Integrated with Cursor's AI features
- Familiar to Cursor users
- Seamless workflow

VS Code Extension UX:
- Custom chat panel
- VS Code UI integration
- Command palette access
- Status bar indicators
- Extension settings

Provide:
1. UX impact assessment
2. User adoption challenges
3. Interface design recommendations
4. Workflow integration strategy
5. Accessibility considerations
6. User migration support
7. Feature parity requirements
8. Recommendation`;

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
 * 💊 Crusher's Health & Risk Assessment
 */
async function crusherHealth() {
  log('\n💊 CRUSHER\'S HEALTH & RISK ASSESSMENT', 'green');
  log('═══════════════════════════════════════════════════════════\n', 'cyan');

  const systemPrompt = `You are Dr. Beverly Crusher, Chief Medical Officer of the USS Enterprise. You assess system health, diagnose issues, and evaluate risks. You recommend preventive measures and treatment plans.`;

  const prompt = `Assess the health and risk implications of migrating Alex AI from Cursor AI to VS Code.

Health & Risk Considerations:
- Migration complexity and risks
- System stability during migration
- Rollback capabilities
- Testing requirements
- Performance impact
- Error handling
- Monitoring and diagnostics
- Recovery procedures

Current Health (Cursor AI):
- Stable integration
- Proven reliability
- Existing user base
- Known issues and workarounds

Migration Risks:
- Extension development bugs
- Integration failures
- Performance degradation
- User disruption
- Data migration issues
- Feature gaps

Provide:
1. Risk assessment
2. Health monitoring strategy
3. Testing requirements
4. Rollback procedures
5. Performance benchmarks
6. Error handling approach
7. Diagnostic capabilities
8. Recommendation`;

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
 * 📻 Uhura's Integration Analysis
 */
async function uhuraIntegration() {
  log('\n📻 UHURA\'S INTEGRATION ANALYSIS', 'cyan');
  log('═══════════════════════════════════════════════════════════\n', 'cyan');

  const systemPrompt = `You are Lieutenant Uhura, Communications Officer of the USS Enterprise. You specialize in communication systems, integration points, and ensuring all systems can communicate effectively.`;

  const prompt = `Analyze the integration requirements for migrating Alex AI from Cursor AI to VS Code.

Integration Points:
- VS Code Extension API
- MCP server communication
- n8n workflow integration
- Supabase RAG system
- OpenRouter API
- VS Code command system
- Extension marketplace
- VS Code settings API

Current Integration (Cursor AI):
- Cursor AI chat API
- Direct integration with Cursor's infrastructure
- Seamless communication

VS Code Integration:
- Extension activation
- Webview communication
- Command registration
- Settings management
- Status bar integration
- Terminal integration

Provide:
1. Integration complexity assessment
2. Required VS Code APIs
3. Communication patterns
4. Integration testing strategy
5. Compatibility requirements
6. API limitations
7. Workaround strategies
8. Recommendation`;

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
 * 🛠️ O'Brien's Pragmatic Implementation
 */
async function obrienPragmatic() {
  log('\n🛠️ O\'BRIEN\'S PRAGMATIC IMPLEMENTATION APPROACH', 'yellow');
  log('═══════════════════════════════════════════════════════════\n', 'cyan');

  const systemPrompt = `You are Chief Miles O'Brien, Chief of Operations. You provide pragmatic, no-nonsense solutions. You focus on what works, avoid over-engineering, and get things done efficiently.`;

  const prompt = `Provide a pragmatic implementation approach for migrating Alex AI from Cursor AI to VS Code.

Pragmatic Considerations:
- What's the simplest approach?
- What can we reuse from existing code?
- What's the minimum viable extension?
- How to avoid over-engineering?
- Quick wins vs. long-term solutions
- Incremental migration strategy
- Practical constraints

Current Codebase:
- Crew coordination system
- MCP integration
- RAG system
- OpenRouter integration
- Chat interface logic (in Cursor)

VS Code Extension Needs:
- Extension structure
- Webview for chat UI
- API integration
- Settings management

Provide:
1. Simplest viable approach
2. Code reuse opportunities
3. Minimum viable extension scope
4. Incremental implementation steps
5. Quick wins
6. Practical constraints
7. Anti-over-engineering recommendations
8. Recommendation`;

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
 * 🎖️ Picard's Strategic Synthesis
 */
async function picardSynthesis(analyses) {
  log('\n🎖️  PICARD\'S STRATEGIC SYNTHESIS', 'bright');
  log('═══════════════════════════════════════════════════════════\n', 'cyan');

  const systemPrompt = `You are Captain Jean-Luc Picard, Commanding Officer of the USS Enterprise. You synthesize multiple perspectives, make strategic decisions, and provide clear, decisive leadership. You consider all factors - technical, business, tactical, infrastructure, security, UX, health, integration, and pragmatic - to make the best decision for the mission.`;

  const summary = analyses.map((a, i) => 
    `Crew Member ${i + 1} Analysis:\n${a.content.substring(0, 500)}...`
  ).join('\n\n');

  const prompt = `Synthesize the crew's analyses and make a strategic decision about migrating Alex AI chat interface from Cursor AI to VS Code.

Crew Analyses:
${summary}

Mission: Determine whether to migrate Alex AI from Cursor AI to VS Code extension.

Consider:
1. Cost-benefit (Quark's analysis)
2. Tactical execution (Riker's plan)
3. Technical feasibility (Data's assessment)
4. Infrastructure (La Forge's evaluation)
5. Security (Worf's analysis)
6. User experience (Troi's assessment)
7. Health and risks (Crusher's evaluation)
8. Integration (Uhura's analysis)
9. Pragmatic approach (O'Brien's recommendations)

Provide:
1. Strategic decision (migrate, don't migrate, or hybrid approach)
2. Rationale synthesizing all perspectives
3. Implementation command if proceeding
4. Risk assessment
5. Long-term strategic vision
6. Alternative approaches if not proceeding

Format as a Captain's decision with clear, actionable command.`;

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
 * Store deliberation in RAG system
 */
async function storeInRAG(deliberation) {
  if (!N8N_URL) {
    log('\n⚠️  N8N URL not configured - skipping RAG storage', 'yellow');
    return;
  }

  try {
    const webhookUrl = `${N8N_URL}/webhook/knowledge-ingest`;
    const payload = JSON.stringify({
      event_type: 'crew_deliberation',
      crew_member: 'full_crew',
      analysis_type: 'vscode_migration',
      content: JSON.stringify(deliberation),
      timestamp: new Date().toISOString(),
      metadata: {
        participants: ['riker', 'quark', 'data', 'laForge', 'worf', 'troi', 'crusher', 'uhura', 'obrien', 'picard'],
        topic: 'Cursor AI to VS Code Migration'
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
            log('\n✅ Deliberation stored in RAG system', 'green');
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
  log('🖖 CREW DELIBERATION: CURSOR AI → VS CODE MIGRATION', 'bright');
  log('═══════════════════════════════════════════════════════════\n', 'cyan');
  log('Mission: Analyze migration of Alex AI chat interface to VS Code', 'cyan');
  log('Crew: Full 10-member team deliberation\n', 'cyan');

  const analyses = {
    quark: null,
    riker: null,
    data: null,
    laForge: null,
    worf: null,
    troi: null,
    crusher: null,
    uhura: null,
    obrien: null,
    picard: null
  };

  // Execute analyses in parallel where possible
  log('📊 Executing crew analyses...\n', 'cyan');

  // Quark first (cost analysis)
  analyses.quark = await quarkCostBenefit();

  // Data, La Forge, Worf, Troi, Crusher, Uhura, O'Brien in parallel
  log('\n🔄 Running parallel analyses...\n', 'cyan');
  const [
    dataResult,
    laForgeResult,
    worfResult,
    troiResult,
    crusherResult,
    uhuraResult,
    obrienResult
  ] = await Promise.all([
    dataTechnicalAnalysis(),
    laForgeInfrastructure(),
    worfSecurity(),
    troiUX(),
    crusherHealth(),
    uhuraIntegration(),
    obrienPragmatic()
  ]);

  analyses.data = dataResult;
  analyses.laForge = laForgeResult;
  analyses.worf = worfResult;
  analyses.troi = troiResult;
  analyses.crusher = crusherResult;
  analyses.uhura = uhuraResult;
  analyses.obrien = obrienResult;

  // Riker (tactical plan based on Quark's analysis)
  analyses.riker = await rikerTacticalPlan(analyses.quark);

  // Picard (strategic synthesis)
  const allAnalyses = [
    analyses.quark,
    analyses.riker,
    analyses.data,
    analyses.laForge,
    analyses.worf,
    analyses.troi,
    analyses.crusher,
    analyses.uhura,
    analyses.obrien
  ];
  analyses.picard = await picardSynthesis(allAnalyses);

  // Save to file
  const outputDir = path.join(PROJECT_ROOT, 'docs', 'crew-coordination');
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const outputFile = path.join(outputDir, `vscode-migration-deliberation-${timestamp}.json`);

  const report = {
    timestamp: new Date().toISOString(),
    mission: 'Cursor AI to VS Code Migration Analysis',
    crew: {
      quark: { analysis: analyses.quark.content, usage: analyses.quark.usage },
      riker: { analysis: analyses.riker.content, usage: analyses.riker.usage },
      data: { analysis: analyses.data.content, usage: analyses.data.usage },
      laForge: { analysis: analyses.laForge.content, usage: analyses.laForge.usage },
      worf: { analysis: analyses.worf.content, usage: analyses.worf.usage },
      troi: { analysis: analyses.troi.content, usage: analyses.troi.usage },
      crusher: { analysis: analyses.crusher.content, usage: analyses.crusher.usage },
      uhura: { analysis: analyses.uhura.content, usage: analyses.uhura.usage },
      obrien: { analysis: analyses.obrien.content, usage: analyses.obrien.usage },
      picard: { decision: analyses.picard.content, usage: analyses.picard.usage }
    },
    totalTokens: Object.values(analyses).reduce((sum, a) => 
      sum + (a.usage?.input_tokens || 0) + (a.usage?.output_tokens || 0), 0
    )
  };

  fs.writeFileSync(outputFile, JSON.stringify(report, null, 2));
  log(`\n💾 Full deliberation saved to: ${outputFile}`, 'green');

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

