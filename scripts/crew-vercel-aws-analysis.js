#!/usr/bin/env node

/**
 * 🖖 Crew Cost-Benefit Analysis: Vercel vs AWS DDD Systems
 * 
 * Mission: Determine most profitable deployment strategy
 * 
 * Crew Coordination:
 * - ⚡ Riker (Tactical Organization & Execution)
 * - 💰 Quark (Business Optimization & Cost Analysis)
 * - 🤖 Data (Technical Analysis & Feature Comparison)
 * - 🔧 La Forge (Infrastructure & Performance)
 * - 🎖️ Picard (Strategic Decision)
 * 
 * Uses OpenRouter MCP for AI-powered analysis
 */

const fs = require('fs');
const path = require('path');
const https = require('https');

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
const SUPABASE_URL = extractEnvVar('SUPABASE_URL');
const MCP_URL = extractEnvVar('MCP_URL', 'https://mcp.pbradygeorgen.com');

// Colors for terminal output
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
        'X-Title': 'Alex AI Crew Analysis'
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
async function quarkCostAnalysis() {
  log('\n💰 QUARK\'S COST-BENEFIT ANALYSIS', 'magenta');
  log('═══════════════════════════════════════════════════════════\n', 'cyan');

  const systemPrompt = `You are Quark, Business Operations Specialist from Deep Space 9. You analyze every technical decision through the lens of business value and ROI. You ask 'What's the cost?' and 'What's the return?' You're skilled at identifying waste, optimizing budgets, and finding the most cost-effective solutions. You reference the Ferengi Rules of Acquisition when relevant.`;

  const prompt = `Analyze the cost-benefit of Vercel vs AWS for our Alex AI Dashboard deployment.

Current Setup:
- n8n Controller: ${N8N_URL}
- MCP Server: ${MCP_URL}
- Supabase Database: ${SUPABASE_URL ? 'Configured' : 'Not configured'}
- AWS Credentials: Available in ~/.zshrc

Vercel Features:
- Free tier: 100GB bandwidth, unlimited requests
- Automatic HTTPS, global CDN
- Zero configuration deployment
- Serverless functions
- Edge network

AWS Features (S3 + CloudFront + Route 53):
- S3: $0.023/GB storage, $0.005/1000 requests
- CloudFront: $0.085/GB transfer, $0.01/10,000 requests
- Route 53: $0.50/hosted zone, $0.40/million queries
- Requires manual SSL certificate setup
- Requires DNS configuration

Provide:
1. Monthly cost comparison (current usage estimate: 10GB storage, 1M requests/month)
2. ROI analysis for each option
3. Hidden costs and gotchas
4. Scaling cost projections (10x, 100x growth)
5. Recommendation with business rationale
6. Reference Rules of Acquisition if relevant`;

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
 * ⚡ Riker's Tactical Organization & Execution Plan
 */
async function rikerTacticalPlan(quarkAnalysis) {
  log('\n⚡ RIKER\'S TACTICAL EXECUTION PLAN', 'blue');
  log('═══════════════════════════════════════════════════════════\n', 'cyan');

  const systemPrompt = `You are Commander William Riker, First Officer of the USS Enterprise. You excel at tactical planning, resource coordination, and executing complex missions. You organize teams efficiently, break down large tasks into actionable steps, and ensure all crew members work together effectively. You're practical, decisive, and focused on getting results.`;

  const prompt = `Based on Quark's cost analysis, create a tactical execution plan for deploying our Alex AI Dashboard.

Current Architecture:
- DDD Flow: Client => n8n => MCP => Supabase
- Dashboard: Next.js application
- Already deployed to Vercel (test deployment)
- AWS credentials available in ~/.zshrc

Options to evaluate:
1. Vercel-only deployment
2. AWS-only deployment (S3 + CloudFront)
3. Hybrid: Vercel for dashboard, AWS for specific services
4. Multi-tier: Vercel for dev/staging, AWS for production

Provide:
1. Recommended deployment strategy
2. Step-by-step execution plan
3. Risk mitigation strategies
4. Rollback procedures
5. Team coordination approach
6. Timeline and resource requirements`;

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
 * 🤖 Data's Technical Feature Comparison
 */
async function dataTechnicalAnalysis() {
  log('\n🤖 DATA\'S TECHNICAL FEATURE COMPARISON', 'cyan');
  log('═══════════════════════════════════════════════════════════\n', 'cyan');

  const systemPrompt = `You are Commander Data, an android officer on the USS Enterprise. You provide precise, logical, and comprehensive technical analysis. You compare features objectively, identify technical trade-offs, and recommend solutions based on technical merit and system requirements.`;

  const prompt = `Perform a technical feature comparison between Vercel and AWS for our Next.js dashboard deployment.

Technical Requirements:
- Next.js 16 with App Router
- API routes for DDD integration (n8n, MCP, Supabase)
- Static asset optimization
- Server-side rendering (SSR)
- Edge functions for performance
- Global CDN distribution
- Environment variable management
- Build optimization

Compare:
1. Performance metrics (TTFB, FCP, LCP)
2. Deployment speed and automation
3. Developer experience
4. Integration capabilities (n8n, MCP, Supabase)
5. Scalability and limits
6. Security features
7. Monitoring and observability
8. Technical limitations and constraints

Provide objective technical recommendation with data-driven rationale.`;

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
async function laForgeInfrastructureAnalysis() {
  log('\n🔧 LA FORGE\'S INFRASTRUCTURE ANALYSIS', 'green');
  log('═══════════════════════════════════════════════════════════\n', 'cyan');

  const systemPrompt = `You are Lieutenant Commander Geordi La Forge, Chief Engineer of the USS Enterprise. You specialize in infrastructure, system reliability, and engineering solutions. You ensure systems are maintainable, scalable, and performant. You think about long-term infrastructure health and operational efficiency.`;

  const prompt = `Analyze the infrastructure implications of Vercel vs AWS for our DDD architecture.

Current Infrastructure:
- n8n Controller: ${N8N_URL}
- MCP Server: ${MCP_URL}
- Supabase Database: ${SUPABASE_URL ? 'Configured' : 'Not configured'}
- DDD Flow: Client => n8n => MCP => Supabase

Infrastructure Considerations:
1. Network latency between services
2. Integration complexity
3. Maintenance overhead
4. Monitoring and alerting
5. Backup and disaster recovery
6. Infrastructure as code (IaC)
7. Multi-region deployment
8. Operational complexity

Evaluate:
- Which platform better integrates with our DDD architecture?
- Infrastructure maintenance requirements
- Operational efficiency
- Long-term scalability
- Infrastructure health and reliability

Provide infrastructure-focused recommendation.`;

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
 * 🎖️ Picard's Strategic Synthesis
 */
async function picardStrategicSynthesis(analyses) {
  log('\n🎖️  PICARD\'S STRATEGIC SYNTHESIS', 'bright');
  log('═══════════════════════════════════════════════════════════\n', 'cyan');

  const systemPrompt = `You are Captain Jean-Luc Picard, Commanding Officer of the USS Enterprise. You synthesize multiple perspectives, make strategic decisions, and provide clear, decisive leadership. You consider all factors - technical, business, tactical, and infrastructure - to make the best decision for the mission.`;

  const summary = analyses.map((a, i) => 
    `Crew Member ${i + 1} Analysis:\n${a.content.substring(0, 500)}...`
  ).join('\n\n');

  const prompt = `Synthesize the crew's analyses and make a strategic decision:

${summary}

Mission: Determine the most profitable and effective deployment strategy for Alex AI Dashboard.

Consider:
1. Cost-effectiveness (Quark's analysis)
2. Tactical execution (Riker's plan)
3. Technical merit (Data's comparison)
4. Infrastructure health (La Forge's assessment)

Provide:
1. Final strategic decision
2. Rationale synthesizing all perspectives
3. Implementation command
4. Risk assessment
5. Long-term strategic vision

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
 * Store analysis in RAG system via n8n
 */
async function storeInRAG(analysis) {
  if (!N8N_URL) {
    log('\n⚠️  N8N URL not configured - skipping RAG storage', 'yellow');
    return;
  }

  try {
    const webhookUrl = `${N8N_URL}/webhook/knowledge-ingest`;
    const payload = JSON.stringify({
      event_type: 'crew_analysis',
      crew_member: 'coordinated_team',
      analysis_type: 'vercel_aws_cost_benefit',
      content: JSON.stringify(analysis),
      timestamp: new Date().toISOString(),
      metadata: {
        participants: ['riker', 'quark', 'data', 'la_forge', 'picard'],
        topic: 'Vercel vs AWS Deployment Strategy'
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
            log('\n✅ Analysis stored in RAG system', 'green');
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
  log('🖖 CREW COST-BENEFIT ANALYSIS: VERCEL VS AWS', 'bright');
  log('═══════════════════════════════════════════════════════════\n', 'cyan');
  log('Mission: Determine most profitable deployment strategy\n', 'cyan');
  log('Crew Coordination:', 'bright');
  log('  ⚡ Riker - Tactical Organization', 'blue');
  log('  💰 Quark - Business Optimization', 'magenta');
  log('  🤖 Data - Technical Analysis', 'cyan');
  log('  🔧 La Forge - Infrastructure', 'green');
  log('  🎖️  Picard - Strategic Decision\n', 'bright');

  const analyses = {
    quark: null,
    riker: null,
    data: null,
    laForge: null,
    picard: null
  };

  // Execute analyses in parallel where possible
  log('📊 Executing crew analyses...\n', 'cyan');

  // Quark first (cost analysis)
  analyses.quark = await quarkCostAnalysis();

  // Data and La Forge in parallel
  log('\n🔄 Running parallel analyses...\n', 'cyan');
  const [dataResult, laForgeResult] = await Promise.all([
    dataTechnicalAnalysis(),
    laForgeInfrastructureAnalysis()
  ]);
  analyses.data = dataResult;
  analyses.laForge = laForgeResult;

  // Riker (tactical plan based on Quark's analysis)
  analyses.riker = await rikerTacticalPlan(analyses.quark);

  // Picard (strategic synthesis)
  const allAnalyses = [analyses.quark, analyses.riker, analyses.data, analyses.laForge];
  analyses.picard = await picardStrategicSynthesis(allAnalyses);

  // Save to file
  const outputDir = path.join(__dirname, '..', 'docs', 'crew-coordination');
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const outputFile = path.join(outputDir, `vercel-aws-analysis-${timestamp}.json`);

  const report = {
    timestamp: new Date().toISOString(),
    mission: 'Vercel vs AWS Cost-Benefit Analysis',
    crew: {
      riker: { analysis: analyses.riker.content, usage: analyses.riker.usage },
      quark: { analysis: analyses.quark.content, usage: analyses.quark.usage },
      data: { analysis: analyses.data.content, usage: analyses.data.usage },
      laForge: { analysis: analyses.laForge.content, usage: analyses.laForge.usage },
      picard: { decision: analyses.picard.content, usage: analyses.picard.usage }
    },
    totalTokens: Object.values(analyses).reduce((sum, a) => 
      sum + (a.usage?.input_tokens || 0) + (a.usage?.output_tokens || 0), 0
    )
  };

  fs.writeFileSync(outputFile, JSON.stringify(report, null, 2));
  log(`\n💾 Full analysis saved to: ${outputFile}`, 'green');

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

module.exports = { main, quarkCostAnalysis, rikerTacticalPlan, dataTechnicalAnalysis, laForgeInfrastructureAnalysis, picardStrategicSynthesis };

