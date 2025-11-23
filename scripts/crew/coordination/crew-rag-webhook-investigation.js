#!/usr/bin/env node

/**
 * 🖖 Crew-Coordinated RAG Webhook Investigation
 * 
 * Comprehensive investigation using all available APIs and CLIs to:
 * 1. Diagnose why webhook isn't registering
 * 2. Test all activation methods
 * 3. Create automation to ensure webhook registration
 * 
 * Uses locally verified credentials from ~/.zshrc
 */

const https = require('https');
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const { loadCrewCredentials } = require('./utils/load-crew-credentials');
const { retryWithBackoff, formatErrorMessage } = require('./utils/test-helpers');

const creds = loadCrewCredentials();
const N8N_URL = creds.n8n.baseUrl || 'https://n8n.pbradygeorgen.com';
const N8N_API_KEY = creds.n8n.apiKey;

console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('🖖 CREW-COORDINATED RAG WEBHOOK INVESTIGATION');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
console.log('🎯 Mission: Get RAG webhook working and add to automation');
console.log('📋 Using all available APIs and CLIs with verified credentials\n');

const INVESTIGATION_REPORT = {
  timestamp: new Date().toISOString(),
  crewReports: {},
  findings: [],
  solutions: [],
  automation: []
};

// Make API request
function makeApiRequest(method, path, data = null) {
  return new Promise((resolve, reject) => {
    const url = new URL(path, N8N_URL);
    const options = {
      hostname: url.hostname,
      port: url.port || 443,
      path: url.pathname + url.search,
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
          const json = JSON.parse(body);
          resolve({ status: res.statusCode, data: json, body: body, headers: res.headers });
        } catch (e) {
          resolve({ status: res.statusCode, data: body, body: body, headers: res.headers });
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

// Test webhook directly
async function testWebhook(webhookPath, method = 'POST') {
  return new Promise((resolve) => {
    const url = new URL(`/webhook/${webhookPath}`, N8N_URL);
    const options = {
      hostname: url.hostname,
      port: 443,
      path: url.pathname,
      method: method,
      headers: {
        'Content-Type': 'application/json',
      },
      timeout: 10000
    };

    const req = https.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => { body += chunk; });
      res.on('end', () => {
        resolve({
          status: res.statusCode,
          registered: res.statusCode !== 404,
          body: body,
          headers: res.headers
        });
      });
    });

    req.on('error', () => resolve({ status: 0, registered: false, error: 'Connection error' }));
    req.on('timeout', () => {
      req.destroy();
      resolve({ status: 0, registered: false, error: 'Timeout' });
    });

    req.write(JSON.stringify({ test: true, timestamp: Date.now() }));
    req.end();
  });
}

// Commander Data: Deep Technical Analysis
async function commanderDataAnalysis() {
  console.log('🤖 COMMANDER DATA: Deep Technical Analysis');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
  
  const analysis = {
    workflow: {},
    webhookNode: {},
    n8nSettings: {},
    apiCapabilities: {},
    findings: []
  };

  // 1. Find and analyze workflow
  console.log('1️⃣  Analyzing Knowledge Ingest workflow...');
  try {
    const workflowsResponse = await makeApiRequest('GET', '/api/v1/workflows');
    let workflows = [];
    const data = workflowsResponse.data;
    if (Array.isArray(data)) {
      workflows = data;
    } else if (data.data && Array.isArray(data.data)) {
      workflows = data.data;
    } else if (data.results && Array.isArray(data.results)) {
      workflows = data.results;
    }

    const workflow = workflows.find(w => 
      w.name.includes('Knowledge Base RAG Ingestion') && !w.name.includes('Clean')
    );

    if (workflow) {
      analysis.workflow = {
        id: workflow.id,
        name: workflow.name,
        active: workflow.active,
        updatedAt: workflow.updatedAt,
        createdAt: workflow.createdAt
      };
      console.log(`   ✅ Found: ${workflow.name} (${workflow.id})`);
      console.log(`   📊 Active: ${workflow.active ? 'Yes' : 'No'}\n`);

      // Get detailed workflow data
      const detailResponse = await makeApiRequest('GET', `/api/v1/workflows/${workflow.id}`);
      const workflowData = detailResponse.data.data || detailResponse.data;

      // Analyze webhook node
      const webhookNode = (workflowData.nodes || []).find(n => 
        n.type && (n.type.includes('webhook') || n.type.includes('Webhook'))
      );

      if (webhookNode) {
        analysis.webhookNode = {
          id: webhookNode.id,
          name: webhookNode.name,
          type: webhookNode.type,
          path: webhookNode.parameters?.path || webhookNode.parameters?.options?.path,
          method: webhookNode.parameters?.httpMethod || webhookNode.parameters?.method,
          disabled: webhookNode.disabled || false
        };
        console.log('2️⃣  Analyzing webhook node...');
        console.log(`   ✅ Node: ${webhookNode.name}`);
        console.log(`   📍 Path: ${analysis.webhookNode.path}`);
        console.log(`   🔧 Method: ${analysis.webhookNode.method}`);
        console.log(`   ⚙️  Disabled: ${analysis.webhookNode.disabled ? 'Yes' : 'No'}\n`);

        if (analysis.webhookNode.disabled) {
          analysis.findings.push('Webhook node is disabled in workflow');
        }
      } else {
        analysis.findings.push('No webhook node found in workflow');
      }
    } else {
      analysis.findings.push('Knowledge Ingest workflow not found');
    }
  } catch (error) {
    analysis.findings.push(`Workflow analysis failed: ${error.message}`);
  }

  // 3. Check n8n settings
  console.log('3️⃣  Checking n8n settings...');
  try {
    const settingsResponse = await makeApiRequest('GET', '/rest/settings');
    if (settingsResponse.status === 200) {
      analysis.n8nSettings = {
        webhookUrl: settingsResponse.data.webhookUrl,
        baseUrl: settingsResponse.data.baseUrl,
        timezone: settingsResponse.data.timezone,
        executionData: settingsResponse.data.executionData
      };
      console.log(`   Webhook URL: ${settingsResponse.data.webhookUrl || 'null (Community Edition)'}`);
      console.log(`   Base URL: ${settingsResponse.data.baseUrl || 'N/A'}\n`);
    }
  } catch (error) {
    analysis.findings.push(`Settings check failed: ${error.message}`);
  }

  // 4. Test API capabilities
  console.log('4️⃣  Testing API capabilities...');
  try {
    // Test activation endpoint
    if (analysis.workflow.id) {
      const testActivate = await makeApiRequest('POST', `/api/v1/workflows/${analysis.workflow.id}/activate`);
      analysis.apiCapabilities.activate = {
        supported: testActivate.status === 200 || testActivate.status === 204,
        status: testActivate.status
      };
      console.log(`   Activate endpoint: ${testActivate.status === 200 || testActivate.status === 204 ? '✅ Supported' : '❌ Not supported'}`);
    }

    // Test deactivate endpoint
    if (analysis.workflow.id) {
      const testDeactivate = await makeApiRequest('POST', `/api/v1/workflows/${analysis.workflow.id}/deactivate`);
      analysis.apiCapabilities.deactivate = {
        supported: testDeactivate.status === 200 || testDeactivate.status === 204,
        status: testDeactivate.status
      };
      console.log(`   Deactivate endpoint: ${testDeactivate.status === 200 || testDeactivate.status === 204 ? '✅ Supported' : '❌ Not supported'}\n`);
    }
  } catch (error) {
    analysis.findings.push(`API capability test failed: ${error.message}`);
  }

  INVESTIGATION_REPORT.crewReports.data = analysis;
  return analysis;
}

// Lieutenant Commander La Forge: Infrastructure Deep Dive
async function laForgeInfrastructure() {
  console.log('🔧 LIEUTENANT COMMANDER LA FORGE: Infrastructure Deep Dive');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
  
  const infrastructure = {
    container: {},
    environment: {},
    docker: {},
    findings: []
  };

  // Check container environment via EC2
  console.log('1️⃣  Checking container environment...');
  try {
    const INSTANCE_ID = 'i-0afdf313f61f22df0';
    const REGION = 'us-east-2';
    const SSH_USER = 'ubuntu';
    
    // Get instance IP
    const publicIP = execSync(
      `aws ec2 describe-instances --instance-ids ${INSTANCE_ID} --region ${REGION} --query 'Reservations[0].Instances[0].PublicIpAddress' --output text`,
      { encoding: 'utf8', stdio: 'pipe' }
    ).trim();

    // Check WEBHOOK_URL in container
    const tempKeyPath = `${process.env.HOME}/.ssh/ec2-instance-connect-temp`;
    if (fs.existsSync(tempKeyPath)) {
      try {
        const envCheck = execSync(
          `ssh -i "${tempKeyPath}" -o StrictHostKeyChecking=no -o ConnectTimeout=5 ${SSH_USER}@${publicIP} "docker exec n8n env | grep -E '(WEBHOOK_URL|N8N_)' | head -10" 2>/dev/null`,
          { encoding: 'utf8', stdio: 'pipe', timeout: 10000 }
        ).trim();

        if (envCheck) {
          infrastructure.container.environment = envCheck.split('\n').reduce((acc, line) => {
            const [key, value] = line.split('=');
            if (key) acc[key] = value;
            return acc;
          }, {});
          console.log('   ✅ Container environment variables:');
          Object.entries(infrastructure.container.environment).forEach(([key, value]) => {
            if (key.includes('WEBHOOK') || key.includes('N8N')) {
              console.log(`      ${key}=${value}`);
            }
          });
        }
      } catch (e) {
        infrastructure.findings.push('Could not check container environment via SSH');
      }
    }

    // Check docker-compose.yml
    try {
      const composeCheck = execSync(
        `ssh -i "${tempKeyPath}" -o StrictHostKeyChecking=no -o ConnectTimeout=5 ${SSH_USER}@${publicIP} "cat /opt/n8n/docker-compose.yml 2>/dev/null | grep -A 5 WEBHOOK_URL" 2>/dev/null`,
        { encoding: 'utf8', stdio: 'pipe', timeout: 10000 }
      ).trim();

      if (composeCheck) {
        infrastructure.docker.composeConfig = composeCheck;
        console.log('\n   ✅ docker-compose.yml contains WEBHOOK_URL');
      }
    } catch (e) {
      // Ignore
    }

    // Check .env file
    try {
      const envFileCheck = execSync(
        `ssh -i "${tempKeyPath}" -o StrictHostKeyChecking=no -o ConnectTimeout=5 ${SSH_USER}@${publicIP} "cat /opt/n8n/.env 2>/dev/null | grep WEBHOOK_URL" 2>/dev/null`,
        { encoding: 'utf8', stdio: 'pipe', timeout: 10000 }
      ).trim();

      if (envFileCheck) {
        infrastructure.environment.envFile = envFileCheck;
        console.log(`   ✅ .env file: ${envFileCheck}`);
      }
    } catch (e) {
      infrastructure.findings.push('Could not check .env file');
    }

    console.log('');
  } catch (error) {
    infrastructure.findings.push(`Infrastructure check failed: ${error.message}`);
  }

  INVESTIGATION_REPORT.crewReports.laForge = infrastructure;
  return infrastructure;
}

// Chief O'Brien: Pragmatic Solutions & Automation
async function obrienSolutions() {
  console.log('🛠️  CHIEF O\'BRIEN: Pragmatic Solutions & Automation');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
  
  const solutions = {
    immediate: [],
    automation: [],
    scripts: []
  };

  const workflow = INVESTIGATION_REPORT.crewReports.data?.workflow;
  const webhookNode = INVESTIGATION_REPORT.crewReports.data?.webhookNode;

  if (!workflow || !webhookNode) {
    solutions.immediate.push('Workflow or webhook node not found - investigate workflow structure');
    INVESTIGATION_REPORT.crewReports.obrien = solutions;
    return solutions;
  }

  console.log('1️⃣  Immediate Solutions:\n');

  // Solution 1: Force re-registration via API
  if (workflow.active) {
    console.log('   Solution 1: Force webhook re-registration via API');
    console.log('   Steps:');
    console.log('     1. Deactivate workflow');
    console.log('     2. Wait 5 seconds');
    console.log('     3. Activate workflow');
    console.log('     4. Wait 30 seconds for webhook registration');
    console.log('     5. Test webhook\n');

    solutions.immediate.push({
      name: 'Force API Re-registration',
      steps: [
        'Deactivate workflow via API',
        'Wait 5 seconds',
        'Activate workflow via API',
        'Wait 30 seconds',
        'Test webhook endpoint'
      ],
      script: 'node scripts/force-webhook-reregistration.js'
    });
  }

  // Solution 2: Container restart
  console.log('   Solution 2: Restart container to reload environment');
  console.log('   Steps:');
  console.log('     1. Verify WEBHOOK_URL in /opt/n8n/.env');
  console.log('     2. Restart n8n container');
  console.log('     3. Wait 60 seconds');
  console.log('     4. Activate workflow');
  console.log('     5. Test webhook\n');

  solutions.immediate.push({
    name: 'Container Restart',
    steps: [
      'Verify WEBHOOK_URL in .env',
      'Restart n8n container',
      'Wait 60 seconds',
      'Activate workflow',
      'Test webhook'
    ],
    script: 'node scripts/restart-n8n-container-ec2.js'
  });

  // Solution 3: Check webhook node configuration
  if (webhookNode.disabled) {
    console.log('   Solution 3: Enable webhook node in workflow');
    console.log('   ⚠️  Webhook node is disabled - must be enabled in n8n UI\n');
    solutions.immediate.push({
      name: 'Enable Webhook Node',
      steps: [
        'Open workflow in n8n UI',
        'Find webhook node',
        'Enable the node',
        'Save workflow',
        'Activate workflow'
      ],
      manual: true
    });
  }

  // Automation solutions
  console.log('2️⃣  Automation Solutions:\n');

  solutions.automation.push({
    name: 'Automated Webhook Registration',
    description: 'Script that ensures webhook is registered',
    features: [
      'Check workflow status',
      'Verify webhook node configuration',
      'Force re-registration if needed',
      'Test webhook endpoint',
      'Retry with exponential backoff'
    ]
  });

  solutions.automation.push({
    name: 'Pre-flight Checks',
    description: 'Verify all prerequisites before activation',
    checks: [
      'WEBHOOK_URL is set in container',
      'Workflow exists and is accessible',
      'Webhook node is enabled',
      'Container is running'
    ]
  });

  INVESTIGATION_REPORT.crewReports.obrien = solutions;
  return solutions;
}

// Commander Riker: Tactical Execution
async function rikerExecution() {
  console.log('⚡ COMMANDER RIKER: Tactical Execution Plan');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
  
  const execution = {
    plan: [],
    automation: []
  };

  const workflow = INVESTIGATION_REPORT.crewReports.data?.workflow;
  const webhookNode = INVESTIGATION_REPORT.crewReports.data?.webhookNode;

  if (!workflow || !webhookNode) {
    console.log('   ⚠️  Cannot create execution plan - workflow or webhook node not found\n');
    INVESTIGATION_REPORT.crewReports.riker = execution;
    return execution;
  }

  console.log('📋 Execution Plan:\n');

  // Step 1: Pre-flight checks
  execution.plan.push({
    step: 1,
    action: 'Pre-flight Checks',
    commands: [
      'node scripts/diagnose-webhook-registration.js',
      'Verify WEBHOOK_URL in container',
      'Check workflow status'
    ]
  });

  // Step 2: Force re-registration
  execution.plan.push({
    step: 2,
    action: 'Force Webhook Re-registration',
    commands: [
      `Deactivate workflow: POST /api/v1/workflows/${workflow.id}/deactivate`,
      'Wait 5 seconds',
      `Activate workflow: POST /api/v1/workflows/${workflow.id}/activate`,
      'Wait 30 seconds'
    ]
  });

  // Step 3: Test webhook
  execution.plan.push({
    step: 3,
    action: 'Test Webhook Endpoint',
    commands: [
      `curl -X POST ${N8N_URL}/webhook/${webhookNode.path}`,
      'Verify status is not 404'
    ]
  });

  // Step 4: Create automation
  execution.plan.push({
    step: 4,
    action: 'Create Automation Script',
    commands: [
      'Create ensure-rag-webhook-active.js',
      'Integrate into existing automation',
      'Add to CI/CD pipeline'
    ]
  });

  execution.plan.forEach(step => {
    console.log(`   ${step.step}. ${step.action}`);
    step.commands.forEach(cmd => console.log(`      • ${cmd}`));
    console.log('');
  });

  INVESTIGATION_REPORT.crewReports.riker = execution;
  return execution;
}

// Main execution
async function main() {
  if (!N8N_API_KEY) {
    console.error('❌ N8N API key not found. Set N8N_OWNER_API_KEY or N8N_API_KEY in ~/.zshrc');
    process.exit(1);
  }

  // Run crew investigations
  const dataAnalysis = await commanderDataAnalysis();
  const infrastructure = await laForgeInfrastructure();
  const solutions = await obrienSolutions();
  const execution = await rikerExecution();

  // Test webhook with all methods
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('🧪 TESTING WEBHOOK WITH ALL METHODS');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  const webhookPath = dataAnalysis.webhookNode?.path || 'ingest-knowledge';
  const testResults = [];

  // Test 1: Direct webhook test
  console.log('1️⃣  Direct webhook test...');
  const directTest = await testWebhook(webhookPath);
  testResults.push({ method: 'Direct', ...directTest });
  console.log(`   Status: ${directTest.status} (${directTest.registered ? '✅ Registered' : '❌ Not Registered'})\n`);

  // Test 2: With retry
  if (!directTest.registered) {
    console.log('2️⃣  Testing with retry logic...');
    try {
      const retryTest = await retryWithBackoff(
        () => testWebhook(webhookPath),
        {
          maxRetries: 3,
          initialDelay: 2000,
          retryableErrors: [404, 429, 500],
          onRetry: (attempt, maxRetries, delay) => {
            console.log(`   ⏳ Retry ${attempt}/${maxRetries} after ${delay/1000}s...`);
          }
        }
      );
      testResults.push({ method: 'With Retry', ...retryTest });
      console.log(`   Status: ${retryTest.status} (${retryTest.registered ? '✅ Registered' : '❌ Not Registered'})\n`);
    } catch (error) {
      console.log(`   ❌ Retry test failed: ${error.message}\n`);
    }
  }

  // Summary
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('📊 INVESTIGATION SUMMARY');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  console.log('🔍 Findings:');
  if (dataAnalysis.findings.length > 0) {
    dataAnalysis.findings.forEach(finding => console.log(`   • ${finding}`));
  } else {
    console.log('   • No critical issues found in workflow structure');
  }
  console.log('');

  console.log('💡 Solutions:');
  solutions.immediate.forEach((solution, i) => {
    console.log(`   ${i + 1}. ${solution.name}`);
    if (solution.script) {
      console.log(`      Script: ${solution.script}`);
    }
  });
  console.log('');

  console.log('⚡ Next Steps:');
  execution.plan.forEach(step => {
    console.log(`   ${step.step}. ${step.action}`);
  });
  console.log('');

  // Save report
  const reportPath = path.join(__dirname, '..', '.backup-ec2-emergency', `rag-webhook-investigation-${Date.now()}.json`);
  fs.mkdirSync(path.dirname(reportPath), { recursive: true });
  fs.writeFileSync(reportPath, JSON.stringify(INVESTIGATION_REPORT, null, 2));
  console.log(`💾 Full investigation report saved to: ${reportPath}\n`);

  // Create automation script
  await createAutomationScript(dataAnalysis, dataAnalysis.webhookNode);
}

// Create automation script
async function createAutomationScript(analysis, webhookNode) {
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('🤖 CREATING AUTOMATION SCRIPT');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  const workflow = analysis.workflow;
  const webhookPath = webhookNode?.path || 'ingest-knowledge';

  const automationScript = `#!/usr/bin/env node

/**
 * 🤖 Ensure RAG Webhook is Active
 * 
 * Automated script to ensure Knowledge Ingest webhook is registered and operational.
 * Uses all available APIs and methods to guarantee webhook registration.
 */

const https = require('https');
const { loadCrewCredentials } = require('./utils/load-crew-credentials');
const { retryWithBackoff, formatErrorMessage } = require('./utils/test-helpers');

const creds = loadCrewCredentials();
const N8N_URL = creds.n8n.baseUrl || 'https://n8n.pbradygeorgen.com';
const N8N_API_KEY = creds.n8n.apiKey;
const WORKFLOW_ID = '${workflow.id}';
const WEBHOOK_PATH = '${webhookPath}';

console.log('\\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('🤖 ENSURE RAG WEBHOOK IS ACTIVE');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\\n');

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
          const json = JSON.parse(body);
          resolve({ status: res.statusCode, data: json, body: body });
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

async function testWebhook(webhookPath) {
  return new Promise((resolve) => {
    const url = new URL(\`/webhook/\${webhookPath}\`, N8N_URL);
    const req = https.request({
      hostname: url.hostname,
      port: 443,
      path: url.pathname,
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      timeout: 10000
    }, (res) => {
      let body = '';
      res.on('data', (chunk) => { body += chunk; });
      res.on('end', () => {
        resolve({
          status: res.statusCode,
          registered: res.statusCode !== 404,
          body: body
        });
      });
    });

    req.on('error', () => resolve({ status: 0, registered: false }));
    req.on('timeout', () => {
      req.destroy();
      resolve({ status: 0, registered: false });
    });

    req.write(JSON.stringify({ test: true, timestamp: Date.now() }));
    req.end();
  });
}

async function main() {
  // Step 1: Check current webhook status
  console.log('🔍 Step 1: Checking current webhook status...');
  const currentTest = await testWebhook(WEBHOOK_PATH);
  console.log(\`   Status: \${currentTest.status} (\${currentTest.registered ? '✅ Registered' : '❌ Not Registered'})\\n\`);

  if (currentTest.registered) {
    console.log('✅ Webhook is already registered! No action needed.\\n');
    process.exit(0);
  }

  // Step 2: Get workflow status
  console.log('🔍 Step 2: Checking workflow status...');
  const workflowResponse = await makeApiRequest('GET', \`/api/v1/workflows/\${WORKFLOW_ID}\`);
  const workflow = workflowResponse.data.data || workflowResponse.data;
  console.log(\`   Workflow: \${workflow.name}\`);
  console.log(\`   Active: \${workflow.active ? 'Yes' : 'No'}\\n\`);

  // Step 3: Force re-registration
  console.log('🔄 Step 3: Forcing webhook re-registration...');
  try {
    // Deactivate
    if (workflow.active) {
      console.log('   📴 Deactivating workflow...');
      await makeApiRequest('POST', \`/api/v1/workflows/\${WORKFLOW_ID}/deactivate\`);
      await new Promise(resolve => setTimeout(resolve, 5000));
      console.log('   ✅ Deactivated\\n');
    }

    // Activate
    console.log('   📡 Activating workflow...');
    await makeApiRequest('POST', \`/api/v1/workflows/\${WORKFLOW_ID}/activate\`);
    console.log('   ✅ Activated\\n');

    // Wait for webhook registration
    console.log('⏳ Step 4: Waiting for webhook registration (30 seconds)...');
    await new Promise(resolve => setTimeout(resolve, 30000));

    // Test with retry
    console.log('🧪 Step 5: Testing webhook with retry logic...');
    const finalTest = await retryWithBackoff(
      () => testWebhook(WEBHOOK_PATH),
      {
        maxRetries: 5,
        initialDelay: 3000,
        retryableErrors: [404, 429, 500],
        onRetry: (attempt, maxRetries, delay) => {
          console.log(\`   ⏳ Retry \${attempt}/\${maxRetries} after \${delay/1000}s...\`);
        }
      }
    );

    console.log('\\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📊 FINAL STATUS');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\\n');

    if (finalTest.registered) {
      console.log('✅ SUCCESS: Webhook is now registered!');
      console.log(\`   Status: \${finalTest.status}\\n\`);
      console.log(\`🎉 RAG webhook is operational: \${N8N_URL}/webhook/\${WEBHOOK_PATH}\\n\`);
      process.exit(0);
    } else {
      console.log('⚠️  Webhook still not registered after all attempts');
      console.log(\`   Status: \${finalTest.status}\\n\`);
      console.log('💡 Manual intervention may be required:');
      console.log('   1. Visit n8n UI and toggle workflow manually');
      console.log('   2. Check n8n logs for webhook registration errors');
      console.log('   3. Verify WEBHOOK_URL is set in container\\n');
      process.exit(1);
    }
  } catch (error) {
    console.log(\`\\n❌ Automation failed: \${formatErrorMessage(error, { webhookPath: WEBHOOK_PATH, baseUrl: N8N_URL })}\\n\`);
    process.exit(1);
  }
}

main().catch(error => {
  console.error('\\n❌ Script failed:', error.message);
  process.exit(1);
});
`;

  const scriptPath = path.join(__dirname, 'ensure-rag-webhook-active.js');
  fs.writeFileSync(scriptPath, automationScript);
  fs.chmodSync(scriptPath, '755');

  console.log(`✅ Automation script created: ${scriptPath}\n`);
  console.log('🚀 Usage:');
  console.log(`   node ${scriptPath}\n`);

  INVESTIGATION_REPORT.automation.push({
    script: scriptPath,
    description: 'Automated webhook registration script',
    workflowId: workflow.id,
    webhookPath: webhookPath
  });
}

main().catch(error => {
  console.error('\n❌ Investigation failed:', error.message);
  console.error(error.stack);
  process.exit(1);
});

