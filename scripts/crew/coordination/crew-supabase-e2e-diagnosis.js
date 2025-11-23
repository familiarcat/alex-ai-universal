#!/usr/bin/env node

/**
 * 🖖 Crew-Coordinated Supabase E2E Integration Diagnosis
 * 
 * Comprehensive analysis of all integration points to identify blocking issues.
 * Each crew member analyzes their area of expertise and reports findings.
 */

const https = require('https');
const { loadCrewCredentials } = require('./utils/load-crew-credentials');

const creds = loadCrewCredentials();
const N8N_URL = creds.n8n.baseUrl || 'https://n8n.pbradygeorgen.com';
const N8N_API_KEY = creds.n8n.apiKey;
const SUPABASE_URL = creds.supabase.url;

console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('🖖 CREW-COORDINATED SUPABASE E2E INTEGRATION DIAGNOSIS');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

// Make HTTPS request
function makeRequest(method, path, data = null, headers = {}) {
  return new Promise((resolve, reject) => {
    const url = new URL(path, N8N_URL);
    const options = {
      hostname: url.hostname,
      port: url.port || 443,
      path: url.pathname + url.search,
      method: method,
      headers: {
        'Content-Type': 'application/json',
        ...headers
      },
      timeout: 10000
    };

    const req = https.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => { body += chunk; });
      res.on('end', () => {
        try {
          const json = JSON.parse(body);
          resolve({ status: res.statusCode, data: json, body: body });
        } catch (e) {
          resolve({ status: res.statusCode, data: null, body: body });
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

// Test results storage
const diagnosis = {
  timestamp: new Date().toISOString(),
  crewReports: {},
  blockingIssues: [],
  recommendations: []
};

// ============================================================================
// COMMANDER DATA: Technical Analysis
// ============================================================================
async function dataAnalysis() {
  console.log('🤖 COMMANDER DATA: Technical Analysis');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  const report = {
    n8nConnectivity: null,
    n8nSettings: null,
    knowledgeIngestWorkflow: null,
    webhookRegistration: null,
    supabaseConnectivity: null,
    issues: []
  };

  // Test 1: n8n API Connectivity
  console.log('📡 Testing n8n API connectivity...');
  try {
    const response = await makeRequest('GET', '/api/v1/workflows?limit=1', null, {
      'X-N8N-API-KEY': N8N_API_KEY
    });
    
    if (response.status === 200) {
      report.n8nConnectivity = { status: '✅ PASS', details: 'n8n API is reachable and authenticated' };
      console.log('   ✅ n8n API is reachable and authenticated\n');
    } else if (response.status === 401 || response.status === 403) {
      report.n8nConnectivity = { status: '❌ FAIL', details: 'API unauthorized - check API key' };
      report.issues.push('API_KEY_UNAUTHORIZED');
      console.log('   ❌ API unauthorized - check API key\n');
    } else {
      report.n8nConnectivity = { status: '⚠️  WARN', details: `Unexpected status: ${response.status}` };
      console.log(`   ⚠️  Unexpected status: ${response.status}\n`);
    }
  } catch (error) {
    report.n8nConnectivity = { status: '❌ FAIL', details: error.message };
    report.issues.push('N8N_CONNECTIVITY_FAILED');
    console.log(`   ❌ Connection failed: ${error.message}\n`);
  }

  // Test 2: n8n Settings (WEBHOOK_URL)
  console.log('🔧 Checking n8n settings (WEBHOOK_URL)...');
  try {
    const response = await makeRequest('GET', '/rest/settings', null, {
      'X-N8N-API-KEY': N8N_API_KEY
    });
    
    if (response.status === 200 && response.data) {
      const webhookUrl = response.data.webhookUrl;
      if (webhookUrl && webhookUrl !== null) {
        report.n8nSettings = { 
          status: '✅ PASS', 
          details: `WEBHOOK_URL is set: ${webhookUrl}`,
          webhookUrl: webhookUrl
        };
        console.log(`   ✅ WEBHOOK_URL is set: ${webhookUrl}\n`);
      } else {
        report.n8nSettings = { 
          status: '❌ FAIL', 
          details: 'WEBHOOK_URL is null - webhooks will not register',
          webhookUrl: null
        };
        report.issues.push('WEBHOOK_URL_NULL');
        console.log('   ❌ WEBHOOK_URL is null - this is the PRIMARY BLOCKER\n');
      }
    } else {
      report.n8nSettings = { status: '⚠️  WARN', details: 'Could not retrieve settings' };
      console.log('   ⚠️  Could not retrieve settings\n');
    }
  } catch (error) {
    report.n8nSettings = { status: '❌ FAIL', details: error.message };
    report.issues.push('SETTINGS_API_FAILED');
    console.log(`   ❌ Settings check failed: ${error.message}\n`);
  }

  // Test 3: Knowledge Ingest Workflow
  console.log('📚 Checking Knowledge Ingest workflow...');
  try {
    const response = await makeRequest('GET', '/api/v1/workflows', null, {
      'X-N8N-API-KEY': N8N_API_KEY
    });
    
    if (response.status === 200) {
      const workflows = response.data?.data || response.data || [];
      const knowledgeIngest = workflows.find(w => 
        w.name.toLowerCase().includes('knowledge ingest') ||
        w.name.toLowerCase().includes('knowledge-ingest')
      );
      
      if (knowledgeIngest) {
        report.knowledgeIngestWorkflow = {
          status: knowledgeIngest.active ? '✅ PASS' : '⚠️  WARN',
          details: `Workflow found: ${knowledgeIngest.name}`,
          id: knowledgeIngest.id,
          active: knowledgeIngest.active
        };
        console.log(`   ✅ Workflow found: ${knowledgeIngest.name}`);
        console.log(`   ${knowledgeIngest.active ? '✅' : '⚠️ '} Active: ${knowledgeIngest.active}\n`);
        
        if (!knowledgeIngest.active) {
          report.issues.push('KNOWLEDGE_INGEST_INACTIVE');
        }
      } else {
        report.knowledgeIngestWorkflow = { status: '❌ FAIL', details: 'Knowledge Ingest workflow not found' };
        report.issues.push('KNOWLEDGE_INGEST_NOT_FOUND');
        console.log('   ❌ Knowledge Ingest workflow not found\n');
      }
    }
  } catch (error) {
    report.knowledgeIngestWorkflow = { status: '❌ FAIL', details: error.message };
    console.log(`   ❌ Workflow check failed: ${error.message}\n`);
  }

  // Test 4: Webhook Registration
  console.log('🔗 Testing webhook registration...');
  try {
    const response = await makeRequest('POST', '/webhook/knowledge-ingest', { test: true });
    
    if (response.status === 404) {
      report.webhookRegistration = { 
        status: '❌ FAIL', 
        details: 'Webhook not registered (404) - workflow may be inactive or WEBHOOK_URL not set',
        statusCode: 404
      };
      report.issues.push('WEBHOOK_NOT_REGISTERED');
      console.log('   ❌ Webhook not registered (404)\n');
    } else if (response.status === 401 || response.status === 405 || response.status === 200) {
      report.webhookRegistration = { 
        status: '✅ PASS', 
        details: `Webhook is registered (Status: ${response.status})`,
        statusCode: response.status
      };
      console.log(`   ✅ Webhook is registered (Status: ${response.status})\n`);
    } else {
      report.webhookRegistration = { 
        status: '⚠️  WARN', 
        details: `Unexpected status: ${response.status}`,
        statusCode: response.status
      };
      console.log(`   ⚠️  Unexpected status: ${response.status}\n`);
    }
  } catch (error) {
    report.webhookRegistration = { status: '❌ FAIL', details: error.message };
    report.issues.push('WEBHOOK_TEST_FAILED');
    console.log(`   ❌ Webhook test failed: ${error.message}\n`);
  }

  // Test 5: Supabase Connectivity (if URL available)
  if (SUPABASE_URL) {
    console.log('🗄️  Testing Supabase connectivity...');
    try {
      const url = new URL(SUPABASE_URL);
      const healthUrl = `${url.protocol}//${url.host}/rest/v1/`;
      const response = await makeRequest('GET', healthUrl.replace(N8N_URL, ''), null, {
        'apikey': creds.supabase.key || ''
      });
      
      report.supabaseConnectivity = { 
        status: response.status === 200 ? '✅ PASS' : '⚠️  WARN',
        details: `Supabase API responded with status ${response.status}`
      };
      console.log(`   ${response.status === 200 ? '✅' : '⚠️ '} Supabase API status: ${response.status}\n`);
    } catch (error) {
      report.supabaseConnectivity = { status: '⚠️  WARN', details: 'Supabase URL not configured or unreachable' };
      console.log('   ⚠️  Supabase connectivity test skipped (URL not configured)\n');
    }
  } else {
    report.supabaseConnectivity = { status: '⚠️  WARN', details: 'Supabase URL not configured' };
    console.log('   ⚠️  Supabase URL not configured\n');
  }

  diagnosis.crewReports.data = report;
  return report;
}

// ============================================================================
// LIEUTENANT COMMANDER LA FORGE: Infrastructure Analysis
// ============================================================================
function laForgeAnalysis(dataReport) {
  console.log('🔧 LIEUTENANT COMMANDER LA FORGE: Infrastructure Analysis');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  const report = {
    webhookUrlIssue: null,
    environmentVariables: null,
    containerConfiguration: null,
    recommendations: []
  };

  // Analyze WEBHOOK_URL issue
  if (dataReport.n8nSettings?.webhookUrl === null) {
    report.webhookUrlIssue = {
      status: '❌ CRITICAL',
      details: 'WEBHOOK_URL is null in n8n settings despite environment variable being set',
      rootCause: 'n8n is not reading WEBHOOK_URL environment variable correctly',
      impact: 'All webhooks fail to register, blocking E2E integration'
    };
    console.log('❌ CRITICAL: WEBHOOK_URL Issue Detected');
    console.log('   Root Cause: n8n is not reading WEBHOOK_URL environment variable');
    console.log('   Impact: All webhooks fail to register\n');
    
    report.recommendations.push({
      priority: 'CRITICAL',
      action: 'Set WEBHOOK_URL in n8n UI Settings (Environments section)',
      reason: 'UI setting may override environment variable'
    });
    
    report.recommendations.push({
      priority: 'HIGH',
      action: 'Verify Docker container has WEBHOOK_URL in environment',
      reason: 'Container may not be passing env var correctly'
    });
    
    report.recommendations.push({
      priority: 'MEDIUM',
      action: 'Restart n8n container after setting WEBHOOK_URL',
      reason: 'n8n may need restart to pick up environment variable changes'
    });
  } else if (dataReport.n8nSettings?.webhookUrl) {
    report.webhookUrlIssue = {
      status: '✅ PASS',
      details: `WEBHOOK_URL is correctly set: ${dataReport.n8nSettings.webhookUrl}`
    };
    console.log(`✅ WEBHOOK_URL is correctly configured: ${dataReport.n8nSettings.webhookUrl}\n`);
  }

  // Environment variable analysis
  report.environmentVariables = {
    n8nBaseUrl: N8N_URL ? '✅ Set' : '❌ Missing',
    n8nApiKey: N8N_API_KEY ? '✅ Set' : '❌ Missing',
    supabaseUrl: SUPABASE_URL ? '✅ Set' : '⚠️  Optional',
    details: 'Credentials loaded from ~/.zshrc'
  };
  console.log('📋 Environment Variables:');
  console.log(`   N8N_URL: ${N8N_URL ? '✅ Set' : '❌ Missing'}`);
  console.log(`   N8N_API_KEY: ${N8N_API_KEY ? '✅ Set' : '❌ Missing'}`);
  console.log(`   SUPABASE_URL: ${SUPABASE_URL ? '✅ Set' : '⚠️  Optional'}\n`);

  diagnosis.crewReports.laForge = report;
  return report;
}

// ============================================================================
// CHIEF O'BRIEN: Pragmatic Solutions
// ============================================================================
function obrienAnalysis(dataReport, laForgeReport) {
  console.log('🛠️  CHIEF O\'BRIEN: Pragmatic Solutions');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  const report = {
    immediateActions: [],
    workarounds: [],
    longTermSolutions: []
  };

  // Identify blocking issues
  if (dataReport.issues.includes('WEBHOOK_URL_NULL')) {
    report.immediateActions.push({
      action: 'Set WEBHOOK_URL in n8n UI',
      steps: [
        '1. Visit https://n8n.pbradygeorgen.com',
        '2. Go to Settings → Environments',
        '3. Add WEBHOOK_URL=https://n8n.pbradygeorgen.com',
        '4. Save and restart n8n container'
      ],
      expectedResult: 'Webhooks will register after restart'
    });
    
    report.workarounds.push({
      action: 'Use n8n API to set webhook URL',
      steps: [
        '1. Use n8n API to update settings',
        '2. Or use Terraform/Docker to ensure WEBHOOK_URL is set at container startup'
      ],
      note: 'May require n8n version that supports API-based settings'
    });
  }

  if (dataReport.issues.includes('WEBHOOK_NOT_REGISTERED')) {
    report.immediateActions.push({
      action: 'Force webhook re-registration',
      steps: [
        '1. Deactivate Knowledge Ingest workflow',
        '2. Wait 2 seconds',
        '3. Reactivate workflow',
        '4. Wait 5 seconds for webhook registration',
        '5. Test webhook endpoint'
      ],
      script: 'node scripts/force-webhook-reregistration.js'
    });
  }

  if (dataReport.issues.includes('KNOWLEDGE_INGEST_INACTIVE')) {
    report.immediateActions.push({
      action: 'Activate Knowledge Ingest workflow',
      steps: [
        '1. Visit n8n UI',
        '2. Find Knowledge Ingest workflow',
        '3. Toggle activation switch',
        '4. Wait for webhook registration'
      ],
      script: 'node scripts/activate-knowledge-ingest-workflow.js'
    });
  }

  report.longTermSolutions.push({
    solution: 'Automate WEBHOOK_URL configuration in Terraform',
    benefit: 'Ensures WEBHOOK_URL is always set on new deployments',
    file: 'terraform/n8n-infrastructure/user-data.sh'
  });

  console.log('💡 Immediate Actions:');
  report.immediateActions.forEach((action, i) => {
    console.log(`   ${i + 1}. ${action.action}`);
  });
  console.log('');

  diagnosis.crewReports.obrien = report;
  return report;
}

// ============================================================================
// LIEUTENANT WORF: Security & Validation
// ============================================================================
function worfAnalysis(dataReport) {
  console.log('🛡️  LIEUTENANT WORF: Security & Validation');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  const report = {
    apiKeySecurity: null,
    webhookSecurity: null,
    recommendations: []
  };

  // API Key validation
  if (N8N_API_KEY) {
    const keyLength = N8N_API_KEY.length;
    report.apiKeySecurity = {
      status: keyLength > 50 ? '✅ PASS' : '⚠️  WARN',
      details: `API key length: ${keyLength} characters`,
      recommendation: keyLength < 50 ? 'API key may be invalid or truncated' : 'API key format appears valid'
    };
    console.log(`🔑 API Key Security: ${keyLength > 50 ? '✅' : '⚠️ '} Key length: ${keyLength} chars\n`);
  } else {
    report.apiKeySecurity = {
      status: '❌ FAIL',
      details: 'API key not found'
    };
    console.log('❌ API key not found\n');
  }

  // Webhook security (if registered)
  if (dataReport.webhookRegistration?.statusCode && dataReport.webhookRegistration.statusCode !== 404) {
    report.webhookSecurity = {
      status: '⚠️  REVIEW',
      details: 'Webhooks are accessible - consider adding HMAC authentication',
      recommendation: 'Implement webhook HMAC signing for production'
    };
    console.log('⚠️  Webhook Security: Consider adding HMAC authentication\n');
  }

  diagnosis.crewReports.worf = report;
  return report;
}

// ============================================================================
// COMMANDER RIKER: Tactical Execution Plan
// ============================================================================
function rikerAnalysis(dataReport, laForgeReport, obrienReport) {
  console.log('⚡ COMMANDER RIKER: Tactical Execution Plan');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  const report = {
    priority: 'HIGH',
    executionSteps: [],
    estimatedTime: '5-10 minutes',
    successCriteria: []
  };

  // Build execution plan based on findings
  if (dataReport.issues.includes('WEBHOOK_URL_NULL')) {
    report.executionSteps.push({
      step: 1,
      action: 'Set WEBHOOK_URL in n8n UI Settings',
      command: 'Manual: Visit n8n UI → Settings → Environments',
      critical: true
    });
    
    report.executionSteps.push({
      step: 2,
      action: 'Restart n8n container',
      command: 'docker restart n8n (on EC2)',
      critical: true
    });
  }

  if (dataReport.issues.includes('WEBHOOK_NOT_REGISTERED') || dataReport.issues.includes('KNOWLEDGE_INGEST_INACTIVE')) {
    report.executionSteps.push({
      step: report.executionSteps.length + 1,
      action: 'Activate and register webhooks',
      command: 'node scripts/crew-automated-webhook-registration.js',
      critical: true
    });
  }

  report.successCriteria.push('WEBHOOK_URL is set in n8n settings (not null)');
  report.successCriteria.push('Knowledge Ingest workflow is active');
  report.successCriteria.push('Webhook /webhook/knowledge-ingest returns 200/401/405 (not 404)');
  report.successCriteria.push('RAG push to Supabase succeeds');

  console.log('📋 Execution Plan:');
  report.executionSteps.forEach(step => {
    console.log(`   ${step.step}. ${step.action} ${step.critical ? '(CRITICAL)' : ''}`);
    if (step.command) {
      console.log(`      Command: ${step.command}`);
    }
  });
  console.log('');

  diagnosis.crewReports.riker = report;
  return report;
}

// ============================================================================
// FINAL SUMMARY
// ============================================================================
function printSummary() {
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('📊 DIAGNOSIS SUMMARY');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  // Collect all blocking issues
  const allIssues = [];
  if (diagnosis.crewReports.data) {
    allIssues.push(...diagnosis.crewReports.data.issues);
  }

  // Identify primary blocker
  let primaryBlocker = null;
  if (allIssues.includes('WEBHOOK_URL_NULL')) {
    primaryBlocker = {
      issue: 'WEBHOOK_URL is null in n8n settings',
      impact: 'CRITICAL - All webhooks fail to register',
      solution: 'Set WEBHOOK_URL in n8n UI Settings → Environments'
    };
  } else if (allIssues.includes('WEBHOOK_NOT_REGISTERED')) {
    primaryBlocker = {
      issue: 'Webhook not registered (404)',
      impact: 'HIGH - RAG push fails',
      solution: 'Force webhook re-registration via deactivate/reactivate'
    };
  } else if (allIssues.includes('KNOWLEDGE_INGEST_INACTIVE')) {
    primaryBlocker = {
      issue: 'Knowledge Ingest workflow is inactive',
      impact: 'HIGH - RAG push fails',
      solution: 'Activate workflow in n8n UI or via API'
    };
  }

  if (primaryBlocker) {
    console.log('🚨 PRIMARY BLOCKER:');
    console.log(`   Issue: ${primaryBlocker.issue}`);
    console.log(`   Impact: ${primaryBlocker.impact}`);
    console.log(`   Solution: ${primaryBlocker.solution}\n`);
    diagnosis.blockingIssues.push(primaryBlocker);
  }

  console.log('📋 All Issues Found:');
  allIssues.forEach((issue, i) => {
    console.log(`   ${i + 1}. ${issue}`);
  });
  console.log('');

  if (diagnosis.crewReports.riker) {
    console.log('⚡ Recommended Next Steps:');
    diagnosis.crewReports.riker.executionSteps.forEach(step => {
      console.log(`   ${step.step}. ${step.action}`);
    });
    console.log('');
  }

  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
}

// ============================================================================
// MAIN EXECUTION
// ============================================================================
async function main() {
  if (!N8N_API_KEY) {
    console.error('❌ N8N API key not found. Set N8N_OWNER_API_KEY or N8N_API_KEY in ~/.zshrc');
    process.exit(1);
  }

  // Run crew analysis
  const dataReport = await dataAnalysis();
  const laForgeReport = laForgeAnalysis(dataReport);
  const obrienReport = obrienAnalysis(dataReport, laForgeReport);
  const worfReport = worfAnalysis(dataReport);
  const rikerReport = rikerAnalysis(dataReport, laForgeReport, obrienReport);

  // Print summary
  printSummary();

  // Save diagnosis to file
  const fs = require('fs');
  const path = require('path');
  const reportPath = path.join(process.cwd(), '.backup-ec2-emergency', `supabase-e2e-diagnosis-${Date.now()}.json`);
  fs.mkdirSync(path.dirname(reportPath), { recursive: true });
  fs.writeFileSync(reportPath, JSON.stringify(diagnosis, null, 2));
  console.log(`💾 Full diagnosis report saved to: ${reportPath}\n`);
}

main().catch(error => {
  console.error('\n❌ Diagnosis failed:', error.message);
  console.error(error.stack);
  process.exit(1);
});

