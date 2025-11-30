#!/usr/bin/env node

/**
 * 🖖 Crew-Coordinated Webhook Registration Solution
 * 
 * Coordinates all crew members to investigate and solve the
 * n8n webhook registration issue from multiple perspectives.
 */

const https = require('https');
const { execSync } = require('child_process');
const { loadCrewCredentials } = require('./utils/load-crew-credentials');

const creds = loadCrewCredentials();
const N8N_URL = creds.n8n.baseUrl || 'https://n8n.pbradygeorgen.com';
const N8N_API_KEY = creds.n8n.apiKey;
const WORKFLOW_ID = 'c0HYTqTFtktCE3Fk';
const WEBHOOK_PATH = 'ingest-knowledge';

const INSTANCE_ID = 'i-0afdf313f61f22df0';
const AVAILABILITY_ZONE = 'us-east-2b';
const REGION = 'us-east-2';
const SSH_USER = 'ubuntu';

console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('🖖 CREW-COORDINATED WEBHOOK REGISTRATION SOLUTION');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

const CREW_REPORT = {
  timestamp: new Date().toISOString(),
  crewAnalysis: {},
  findings: [],
  recommendations: [],
  solutions: [],
};

// Utility: Make API request
function makeApiRequest(method, path, data = null) {
  return new Promise((resolve, reject) => {
    const url = new URL(path, N8N_URL);
    const options = {
      hostname: url.hostname,
      port: 443,
      path: url.pathname,
      method: method,
      headers: {
        'X-N8N-API-KEY': N8N_API_KEY,
        'Content-Type': 'application/json',
      },
      timeout: 15000
    };

    const req = https.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => { body += chunk; });
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, data: JSON.parse(body), body: body });
        } catch (e) {
          resolve({ status: res.statusCode, data: body, body: body });
        }
      });
    });

    req.on('error', reject);
    req.on('timeout', () => {
      req.destroy();
      reject(new Error('Request timeout'));
    });

    if (data) {
      req.write(JSON.stringify(data));
    }
    req.end();
  });
}

// Utility: Execute on EC2
async function executeOnEC2(command) {
  const publicIP = execSync(
    `aws ec2 describe-instances --instance-ids ${INSTANCE_ID} --region ${REGION} --query 'Reservations[0].Instances[0].PublicIpAddress' --output text`,
    { encoding: 'utf8', stdio: 'pipe' }
  ).trim();

  const tempKeyPath = `${process.env.HOME}/.ssh/ec2-instance-connect-temp`;

  execSync(
    `aws ec2-instance-connect send-ssh-public-key --instance-id ${INSTANCE_ID} --availability-zone ${AVAILABILITY_ZONE} --instance-os-user ${SSH_USER} --ssh-public-key file://${tempKeyPath}.pub --region ${REGION}`,
    { stdio: 'pipe' }
  );

  await new Promise(resolve => setTimeout(resolve, 2000));

  try {
    const result = execSync(
      `ssh -i "${tempKeyPath}" -o StrictHostKeyChecking=no -o ConnectTimeout=10 ${SSH_USER}@${publicIP} "${command.replace(/"/g, '\\"')}"`,
      { encoding: 'utf8', stdio: 'pipe', timeout: 30000 }
    ).trim();
    return { success: true, output: result };
  } catch (error) {
    return { success: false, error: error.message, output: error.stdout?.toString() || '' };
  }
}

// 🎖️ Captain Picard: Strategic Overview
async function captainPicardReport() {
  console.log('🎖️  CAPTAIN PICARD: Strategic Overview');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  const analysis = {
    mission: 'Restore RAG webhook registration to enable knowledge ingestion',
    currentState: 'All 47 workflows unable to register webhooks',
    impact: 'CRITICAL - RAG system non-functional',
    priority: 'HIGHEST',
    crewDeployment: 'Full crew coordination required',
  };

  console.log('📋 Mission Status:');
  console.log(`   Mission: ${analysis.mission}`);
  console.log(`   Current State: ${analysis.currentState}`);
  console.log(`   Impact: ${analysis.impact}`);
  console.log(`   Priority: ${analysis.priority}\n`);

  console.log('👥 Crew Deployment:');
  console.log('   • Commander Data: Technical analysis');
  console.log('   • Lieutenant Commander La Forge: Infrastructure investigation');
  console.log('   • Chief O\'Brien: Pragmatic solutions');
  console.log('   • Lieutenant Worf: Security & validation');
  console.log('   • Commander Riker: Tactical execution\n');

  CREW_REPORT.crewAnalysis.picard = analysis;
  CREW_REPORT.findings.push('Strategic: Full crew coordination required for systemic issue');
}

// 🤖 Commander Data: Technical Analysis
async function commanderDataReport() {
  console.log('🤖 COMMANDER DATA: Technical Analysis');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  const analysis = {
    n8nVersion: null,
    workflowStatus: null,
    webhookConfiguration: null,
    databaseState: null,
    logAnalysis: null,
  };

  // Check n8n version
  console.log('📊 Checking n8n version...');
  const versionResult = await executeOnEC2('docker exec n8n n8n --version 2>&1');
  if (versionResult.success) {
    analysis.n8nVersion = versionResult.output.trim();
    console.log(`   Version: ${analysis.n8nVersion}\n`);
  } else {
    console.log(`   ⚠️  Could not get version: ${versionResult.error}\n`);
  }

  // Check workflow status
  console.log('📋 Checking workflow status...');
  try {
    const workflowResponse = await makeApiRequest('GET', `/api/v1/workflows/${WORKFLOW_ID}`);
    const workflow = workflowResponse.data.data || workflowResponse.data;
    analysis.workflowStatus = {
      name: workflow.name,
      active: workflow.active,
      updatedAt: workflow.updatedAt,
    };
    console.log(`   Workflow: ${workflow.name}`);
    console.log(`   Active: ${workflow.active}`);
    console.log(`   Updated: ${workflow.updatedAt}\n`);

    // Check webhook node configuration
    const webhookNode = (workflow.nodes || []).find(n => n.type && n.type.includes('webhook'));
    if (webhookNode) {
      analysis.webhookConfiguration = {
        nodeId: webhookNode.id,
        nodeName: webhookNode.name,
        path: webhookNode.parameters?.path || webhookNode.parameters?.options?.path,
        method: webhookNode.parameters?.httpMethod || webhookNode.parameters?.method,
        disabled: webhookNode.disabled || false,
      };
      console.log('   Webhook Node Configuration:');
      console.log(`      Path: ${analysis.webhookConfiguration.path}`);
      console.log(`      Method: ${analysis.webhookConfiguration.method}`);
      console.log(`      Disabled: ${analysis.webhookConfiguration.disabled}\n`);
    }
  } catch (error) {
    console.log(`   ❌ Error: ${error.message}\n`);
  }

  // Check database state
  console.log('🗄️  Checking database state...');
  const dbResult = await executeOnEC2(
    `sudo sqlite3 /home/ubuntu/.n8n/database.sqlite "SELECT COUNT(*) FROM webhook_entity WHERE workflowId = '${WORKFLOW_ID}';" 2>&1`
  );
  if (dbResult.success) {
    const count = parseInt(dbResult.output) || 0;
    analysis.databaseState = { webhookEntries: count };
    console.log(`   Webhook entries for workflow: ${count}\n`);
    if (count === 0) {
      CREW_REPORT.findings.push('Database: No webhook entry exists for workflow');
    }
  }

  // Analyze logs
  console.log('📜 Analyzing n8n logs...');
  const logResult = await executeOnEC2(
    'docker logs n8n 2>&1 | grep -i "webhook.*undefined\\|webhook.*register\\|webhook.*error" | tail -10'
  );
  if (logResult.success && logResult.output) {
    const undefinedCount = (logResult.output.match(/undefined/g) || []).length;
    analysis.logAnalysis = {
      undefinedErrors: undefinedCount,
      hasRegistrationErrors: logResult.output.includes('register'),
    };
    console.log(`   "undefined" errors: ${undefinedCount}`);
    console.log(`   Registration errors: ${analysis.logAnalysis.hasRegistrationErrors ? 'Yes' : 'No'}\n`);
    
    if (undefinedCount > 0) {
      CREW_REPORT.findings.push(`Logs: ${undefinedCount} "undefined" webhook path errors detected`);
    }
  }

  CREW_REPORT.crewAnalysis.data = analysis;
  CREW_REPORT.recommendations.push('Technical: Investigate "undefined" webhook path errors in logs');
}

// 🔧 Lieutenant Commander La Forge: Infrastructure Investigation
async function laForgeReport() {
  console.log('🔧 LIEUTENANT COMMANDER LA FORGE: Infrastructure Investigation');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  const analysis = {
    containerStatus: null,
    environmentVariables: null,
    networkConfiguration: null,
    dockerConfiguration: null,
  };

  // Check container status
  console.log('🐳 Checking container status...');
  const containerResult = await executeOnEC2(
    'docker ps --filter name=n8n --format "{{.Status}}" 2>&1'
  );
  if (containerResult.success) {
    analysis.containerStatus = containerResult.output.trim();
    console.log(`   Status: ${analysis.containerStatus}\n`);
  }

  // Check environment variables
  console.log('🔧 Checking environment variables...');
  const envResult = await executeOnEC2(
    'docker exec n8n env | grep -E "WEBHOOK|N8N_" | sort'
  );
  if (envResult.success) {
    const envVars = envResult.output.split('\n').filter(l => l.trim());
    analysis.environmentVariables = {};
    envVars.forEach(line => {
      const [key, ...valueParts] = line.split('=');
      analysis.environmentVariables[key] = valueParts.join('=');
    });
    
    console.log('   Key Variables:');
    console.log(`      WEBHOOK_URL: ${analysis.environmentVariables.WEBHOOK_URL || 'NOT SET'}`);
    console.log(`      N8N_HOST: ${analysis.environmentVariables.N8N_HOST || 'NOT SET'}`);
    console.log(`      N8N_PROTOCOL: ${analysis.environmentVariables.N8N_PROTOCOL || 'NOT SET'}`);
    
    const hasDeprecated = Object.keys(analysis.environmentVariables).some(k => 
      k.includes('SKIP_WEBHOOK_DEREGISTRATION')
    );
    console.log(`      Deprecated vars: ${hasDeprecated ? 'FOUND' : 'REMOVED ✅'}\n`);
    
    if (!analysis.environmentVariables.WEBHOOK_URL) {
      CREW_REPORT.findings.push('Infrastructure: WEBHOOK_URL not set in container');
    }
  }

  // Check docker-compose.yml
  console.log('📄 Checking docker-compose.yml...');
  const composeResult = await executeOnEC2(
    'cat /opt/n8n/docker-compose.yml 2>&1 | grep -E "WEBHOOK_URL|N8N_SKIP" || echo "not found"'
  );
  if (composeResult.success) {
    analysis.dockerConfiguration = {
      hasWebhookUrl: composeResult.output.includes('WEBHOOK_URL'),
      hasDeprecated: composeResult.output.includes('SKIP_WEBHOOK_DEREGISTRATION'),
    };
    console.log(`   WEBHOOK_URL in compose: ${analysis.dockerConfiguration.hasWebhookUrl ? 'Yes ✅' : 'No ❌'}`);
    console.log(`   Deprecated vars: ${analysis.dockerConfiguration.hasDeprecated ? 'Found ❌' : 'Removed ✅'}\n`);
  }

  CREW_REPORT.crewAnalysis.laForge = analysis;
}

// 🛠️ Chief O'Brien: Pragmatic Solutions
async function obrienReport() {
  console.log('🛠️  CHIEF O\'BRIEN: Pragmatic Solutions');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  const solutions = [];

  console.log('💡 Immediate Solutions:\n');

  // Solution 1: Check n8n version compatibility
  console.log('1️⃣  Version Compatibility Check');
  solutions.push({
    id: 'version-check',
    title: 'Check n8n Version Compatibility',
    description: 'n8n 1.120.4 may have webhook registration bugs',
    action: 'Check n8n GitHub issues and release notes',
    priority: 'HIGH',
  });
  console.log('   • Check n8n GitHub for known webhook bugs in 1.120.4');
  console.log('   • Consider upgrading to latest version');
  console.log('   • Or downgrading to known working version (1.100.0)\n');

  // Solution 2: Fix "undefined" webhook paths
  console.log('2️⃣  Fix "undefined" Webhook Paths');
  solutions.push({
    id: 'fix-undefined-paths',
    title: 'Fix Undefined Webhook Paths',
    description: 'Logs show many "POST undefined" errors',
    action: 'Verify webhook node configuration in workflows',
    priority: 'HIGH',
  });
  console.log('   • Review webhook node configurations');
  console.log('   • Ensure all webhook paths are properly set');
  console.log('   • Check for workflow configuration issues\n');

  // Solution 3: Force webhook registration via database
  console.log('3️⃣  Database-Level Webhook Registration');
  solutions.push({
    id: 'database-registration',
    title: 'Database-Level Webhook Registration',
    description: 'Manually insert webhook entry into database',
    action: 'Create webhook entry directly in database',
    priority: 'MEDIUM',
  });
  console.log('   • Manually insert webhook entry into webhook_entity table');
  console.log('   • Restart n8n to load from database');
  console.log('   • Verify webhook registration\n');

  // Solution 4: Alternative architecture
  console.log('4️⃣  Alternative Architecture');
  solutions.push({
    id: 'alternative-architecture',
    title: 'Alternative Architecture',
    description: 'Bypass webhook registration issue',
    action: 'Use HTTP Request node or direct Supabase integration',
    priority: 'LOW',
  });
  console.log('   • Replace webhook triggers with scheduled HTTP requests');
  console.log('   • Use direct Supabase integration');
  console.log('   • Implement poll-based architecture\n');

  CREW_REPORT.crewAnalysis.obrien = { solutions };
  CREW_REPORT.solutions.push(...solutions);
}

// ⚔️ Lieutenant Worf: Security & Validation
async function worfReport() {
  console.log('⚔️  LIEUTENANT WORF: Security & Validation');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  const analysis = {
    apiKeySecurity: null,
    networkSecurity: null,
    dataIntegrity: null,
  };

  // API Key validation
  console.log('🔑 API Key Security:');
  if (N8N_API_KEY) {
    const keyLength = N8N_API_KEY.length;
    analysis.apiKeySecurity = {
      present: true,
      length: keyLength,
      format: keyLength > 50 ? 'JWT (likely)' : 'Unknown',
    };
    console.log(`   ✅ API key present (${keyLength} chars)`);
    console.log(`   Format: ${analysis.apiKeySecurity.format}\n`);
  } else {
    console.log('   ❌ API key not found\n');
  }

  // Network security
  console.log('🌐 Network Security:');
  analysis.networkSecurity = {
    protocol: N8N_URL.startsWith('https') ? 'HTTPS ✅' : 'HTTP ⚠️',
    domain: new URL(N8N_URL).hostname,
  };
  console.log(`   Protocol: ${analysis.networkSecurity.protocol}`);
  console.log(`   Domain: ${analysis.networkSecurity.domain}\n`);

  // Data integrity
  console.log('🛡️  Data Integrity:');
  console.log('   • Database backups: Recommended before manual changes');
  console.log('   • Configuration backups: Created during fix\n');

  CREW_REPORT.crewAnalysis.worf = analysis;
}

// ⚡ Commander Riker: Tactical Execution Plan
async function rikerReport() {
  console.log('⚡ COMMANDER RIKER: Tactical Execution Plan');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  const executionPlan = {
    phase1: {
      title: 'Immediate Investigation',
      steps: [
        'Check n8n GitHub issues for webhook registration bugs',
        'Review n8n release notes for version 1.120.4',
        'Analyze "undefined" webhook path errors in detail',
      ],
      estimatedTime: '30 minutes',
    },
    phase2: {
      title: 'Version Upgrade/Downgrade',
      steps: [
        'Backup current n8n database and workflows',
        'Test n8n version upgrade in staging (if available)',
        'Or downgrade to known working version (1.100.0)',
        'Verify webhook registration after version change',
      ],
      estimatedTime: '1-2 hours',
    },
    phase3: {
      title: 'Alternative Solutions (if version change fails)',
      steps: [
        'Implement HTTP Request node architecture',
        'Set up direct Supabase integration',
        'Create poll-based workflow triggers',
      ],
      estimatedTime: '2-3 hours',
    },
  };

  console.log('📋 Execution Plan:\n');

  console.log('Phase 1: Immediate Investigation');
  executionPlan.phase1.steps.forEach((step, i) => {
    console.log(`   ${i + 1}. ${step}`);
  });
  console.log(`   Estimated Time: ${executionPlan.phase1.estimatedTime}\n`);

  console.log('Phase 2: Version Upgrade/Downgrade');
  executionPlan.phase2.steps.forEach((step, i) => {
    console.log(`   ${i + 1}. ${step}`);
  });
  console.log(`   Estimated Time: ${executionPlan.phase2.estimatedTime}\n`);

  console.log('Phase 3: Alternative Solutions');
  executionPlan.phase3.steps.forEach((step, i) => {
    console.log(`   ${i + 1}. ${step}`);
  });
  console.log(`   Estimated Time: ${executionPlan.phase3.estimatedTime}\n`);

  CREW_REPORT.crewAnalysis.riker = executionPlan;
}

// Main execution
async function main() {
  await captainPicardReport();
  await commanderDataReport();
  await laForgeReport();
  await obrienReport();
  await worfReport();
  await rikerReport();

  // Final summary
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('📊 CREW COORDINATION SUMMARY');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  console.log('🔍 Key Findings:');
  CREW_REPORT.findings.forEach((finding, i) => {
    console.log(`   ${i + 1}. ${finding}`);
  });
  console.log('');

  console.log('💡 Recommendations:');
  CREW_REPORT.recommendations.forEach((rec, i) => {
    console.log(`   ${i + 1}. ${rec}`);
  });
  console.log('');

  console.log('🚀 Recommended Solutions:');
  CREW_REPORT.solutions.slice(0, 3).forEach((sol, i) => {
    console.log(`   ${i + 1}. [${sol.priority}] ${sol.title}`);
    console.log(`      ${sol.description}`);
  });
  console.log('');

  // Save report
  const fs = require('fs');
  const path = require('path');
  const reportPath = path.join(process.cwd(), '.backup-ec2-emergency', `crew-webhook-analysis-${Date.now()}.json`);
  fs.mkdirSync(path.dirname(reportPath), { recursive: true });
  fs.writeFileSync(reportPath, JSON.stringify(CREW_REPORT, null, 2));
  console.log(`💾 Full crew report saved to: ${reportPath}\n`);

  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
}

main().catch(error => {
  console.error('\n❌ Crew coordination failed:', error.message);
  process.exit(1);
});

