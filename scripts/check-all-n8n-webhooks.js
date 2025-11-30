#!/usr/bin/env node

/**
 * 🔍 Check All N8N Webhooks Status
 * 
 * Tests all known webhooks to determine which are active/inactive
 * Provides comprehensive status report for workflow activation
 */

const https = require('https');

const N8N_BASE_URL = 'https://n8n.pbradygeorgen.com';

// All known webhooks from documentation and reports
const WEBHOOKS_TO_CHECK = [
  // Critical DDD Architecture Webhooks
  {
    name: 'Knowledge Ingest (RAG System)',
    path: '/webhook/knowledge-ingest',
    method: 'POST',
    category: 'Critical DDD',
    priority: 'P0',
    workflowId: '1FgRj1CLUMnSIpvY',
    description: 'Store crew memories in knowledge_base table'
  },
  {
    name: 'Observation Lounge',
    path: '/webhook/observation-lounge',
    method: 'POST',
    category: 'Critical DDD',
    priority: 'P0',
    workflowId: '6YQVP2lXuzWEMLJH',
    description: 'Crew coordination and findings'
  },
  {
    name: 'User Settings Store',
    path: '/webhook/settings-store',
    method: 'POST',
    category: 'Critical DDD',
    priority: 'P0',
    workflowId: 'xN7Lh0QbqJIukrha',
    description: 'Sync globalTheme from client to Supabase'
  },
  {
    name: 'User Settings Retrieve',
    path: '/webhook/settings-retrieve',
    method: 'GET',
    category: 'Critical DDD',
    priority: 'P0',
    workflowId: 'yPZwYv1VGm5pkTgE',
    description: 'Load globalTheme from Supabase'
  },
  {
    name: 'Project Content Store',
    path: '/webhook/project-content-store',
    method: 'POST',
    category: 'Critical DDD',
    priority: 'P0',
    workflowId: '2eoq8ycgL5M8dG7z',
    description: 'Save project edits to Supabase'
  },
  {
    name: 'Project Content Retrieve',
    path: '/webhook/project-content-retrieve',
    method: 'GET',
    category: 'Critical DDD',
    priority: 'P0',
    workflowId: 'NmxfBurDWPEQDqeE',
    description: 'Load project data from Supabase'
  },
  {
    name: 'Project Content Delete',
    path: '/webhook/project-content-delete',
    method: 'POST',
    category: 'Critical DDD',
    priority: 'P1',
    workflowId: 'bgfljtVeLVCSnfI5',
    description: 'Delete project from Supabase'
  },
  
  // Crew Member Webhooks
  {
    name: 'Captain Picard',
    path: '/webhook/crew-captain-jean-luc-picard',
    method: 'POST',
    category: 'Crew Member',
    priority: 'P1',
    description: 'Strategic leadership and mission continuity'
  },
  {
    name: 'Commander Data',
    path: '/webhook/crew-commander-data',
    method: 'POST',
    category: 'Crew Member',
    priority: 'P1',
    description: 'Technical analysis and system optimization'
  },
  {
    name: 'Commander Riker',
    path: '/webhook/crew-commander-william-riker',
    method: 'POST',
    category: 'Crew Member',
    priority: 'P1',
    workflowId: 'yn5snWtN7IKu19hD',
    description: 'Tactical operations and workflow management'
  },
  {
    name: 'Lieutenant Commander La Forge',
    path: '/webhook/crew-lieutenant-commander-geordi-la-forge',
    method: 'POST',
    category: 'Crew Member',
    priority: 'P1',
    workflowId: 'Bcu0ySPIXX27mSYH',
    description: 'Infrastructure health and engineering'
  },
  {
    name: 'Lieutenant Worf',
    path: '/webhook/crew-lieutenant-worf',
    method: 'POST',
    category: 'Crew Member',
    priority: 'P1',
    workflowId: 'aDQeEuI2ww6l02xM',
    description: 'Security analysis and threat assessment'
  },
  {
    name: 'Counselor Troi',
    path: '/webhook/crew-counselor-deanna-troi',
    method: 'POST',
    category: 'Crew Member',
    priority: 'P1',
    description: 'User experience and psychological assessment'
  },
  {
    name: 'Dr. Crusher',
    path: '/webhook/crew-dr-beverly-crusher',
    method: 'POST',
    category: 'Crew Member',
    priority: 'P1',
    description: 'System health and medical diagnosis'
  },
  {
    name: 'Lieutenant Uhura',
    path: '/webhook/crew-lieutenant-uhura',
    method: 'POST',
    category: 'Crew Member',
    priority: 'P1',
    workflowId: 'NaExwWejsSLVd5ai',
    description: 'Communication systems and network optimization'
  },
  {
    name: 'Chief O\'Brien',
    path: '/webhook/crew-chief-obrien',
    method: 'POST',
    category: 'Crew Member',
    priority: 'P1',
    workflowId: 'wkQnU1qlwixsdGZc',
    description: 'Pragmatic solutions and troubleshooting'
  },
  {
    name: 'Quark',
    path: '/webhook/crew-quark',
    method: 'POST',
    category: 'Crew Member',
    priority: 'P2',
    description: 'Business optimization and cost analysis'
  },
  
  // System Webhooks
  {
    name: 'OpenRouter Agent Coordination',
    path: '/webhook/082503f8-8939-40c4-9620-81e3eff05d82',
    method: 'POST',
    category: 'System',
    priority: 'P1',
    workflowId: '7QD25cMR5JKbM7nD',
    description: 'OpenRouter agent coordination'
  },
  {
    name: 'Mission Control',
    path: '/webhook/0283b7ab-c44c-47c2-925a-513054e1105f',
    method: 'POST',
    category: 'System',
    priority: 'P1',
    workflowId: 'NcBJBopp4bfQmz8g',
    description: 'Mission control system'
  },
  {
    name: 'Knowledge Query (RAG)',
    path: '/webhook/knowledge-query',
    method: 'POST',
    category: 'System',
    priority: 'P1',
    description: 'Query knowledge base via RAG'
  }
];

// Test a single webhook
function testWebhook(webhook) {
  return new Promise((resolve) => {
    const url = new URL(webhook.path, N8N_BASE_URL);
    const testPayload = webhook.method === 'POST' 
      ? JSON.stringify({ test: 'connectivity', timestamp: new Date().toISOString() })
      : null;
    
    const options = {
      hostname: url.hostname,
      port: url.port || 443,
      path: url.pathname + (url.search || ''),
      method: webhook.method,
      headers: {
        'Content-Type': 'application/json',
        ...(testPayload && { 'Content-Length': Buffer.byteLength(testPayload) })
      },
      timeout: 5000
    };
    
    const req = https.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => { body += chunk; });
      res.on('end', () => {
        const status = res.statusCode;
        let statusText = 'Unknown';
        let isActive = false;
        let errorMessage = null;
        
        if (status === 200 || status === 201) {
          statusText = '✅ ACTIVE';
          isActive = true;
        } else if (status === 404) {
          statusText = '❌ INACTIVE (404 - Not Registered)';
          try {
            const error = JSON.parse(body);
            errorMessage = error.message || error.hint || body.substring(0, 100);
          } catch {
            errorMessage = body.substring(0, 100);
          }
        } else if (status === 405) {
          statusText = '⚠️  WRONG METHOD';
          errorMessage = `Expected ${webhook.method}, got ${status}`;
        } else {
          statusText = `⚠️  HTTP ${status}`;
          errorMessage = body.substring(0, 100);
        }
        
        resolve({
          ...webhook,
          status,
          statusText,
          isActive,
          errorMessage,
          responseBody: body.substring(0, 200)
        });
      });
    });
    
    req.on('error', (error) => {
      resolve({
        ...webhook,
        status: 0,
        statusText: '❌ CONNECTION ERROR',
        isActive: false,
        errorMessage: error.message
      });
    });
    
    req.on('timeout', () => {
      req.destroy();
      resolve({
        ...webhook,
        status: 0,
        statusText: '❌ TIMEOUT',
        isActive: false,
        errorMessage: 'Request timeout after 5 seconds'
      });
    });
    
    if (testPayload) {
      req.write(testPayload);
    }
    req.end();
  });
}

// Main execution
async function main() {
  console.log('🔍 Checking All N8N Webhooks');
  console.log('═══════════════════════════════════════════════════════════════\n');
  console.log(`N8N Instance: ${N8N_BASE_URL}`);
  console.log(`Total Webhooks to Check: ${WEBHOOKS_TO_CHECK.length}\n`);
  console.log('Testing webhooks...\n');
  
  const results = [];
  
  // Test all webhooks
  for (const webhook of WEBHOOKS_TO_CHECK) {
    process.stdout.write(`Testing ${webhook.name}... `);
    const result = await testWebhook(webhook);
    results.push(result);
    console.log(result.statusText);
    
    // Small delay to avoid rate limiting
    await new Promise(resolve => setTimeout(resolve, 200));
  }
  
  // Generate report
  console.log('\n' + '═'.repeat(70));
  console.log('📊 WEBHOOK STATUS REPORT');
  console.log('═'.repeat(70) + '\n');
  
  // Group by category
  const byCategory = {};
  results.forEach(r => {
    if (!byCategory[r.category]) byCategory[r.category] = [];
    byCategory[r.category].push(r);
  });
  
  // Summary statistics
  const active = results.filter(r => r.isActive).length;
  const inactive = results.filter(r => !r.isActive).length;
  const criticalActive = results.filter(r => r.priority === 'P0' && r.isActive).length;
  const criticalInactive = results.filter(r => r.priority === 'P0' && !r.isActive).length;
  
  console.log('📈 SUMMARY');
  console.log('─'.repeat(70));
  console.log(`Total Webhooks: ${results.length}`);
  console.log(`✅ Active: ${active} (${Math.round(active/results.length*100)}%)`);
  console.log(`❌ Inactive: ${inactive} (${Math.round(inactive/results.length*100)}%)`);
  console.log(`\n🚨 Critical (P0) Webhooks:`);
  console.log(`   ✅ Active: ${criticalActive}`);
  console.log(`   ❌ Inactive: ${criticalInactive}`);
  
  // Critical DDD Webhooks
  console.log('\n' + '═'.repeat(70));
  console.log('🚨 CRITICAL DDD ARCHITECTURE WEBHOOKS (P0)');
  console.log('═'.repeat(70) + '\n');
  
  const critical = results.filter(r => r.priority === 'P0');
  critical.forEach(r => {
    console.log(`${r.statusText} ${r.name}`);
    console.log(`   Path: ${r.path} (${r.method})`);
    if (r.workflowId) console.log(`   Workflow ID: ${r.workflowId}`);
    if (r.errorMessage) console.log(`   Error: ${r.errorMessage}`);
    console.log('');
  });
  
  // Crew Member Webhooks
  console.log('═'.repeat(70));
  console.log('👥 CREW MEMBER WEBHOOKS');
  console.log('═'.repeat(70) + '\n');
  
  const crew = results.filter(r => r.category === 'Crew Member');
  crew.forEach(r => {
    console.log(`${r.statusText} ${r.name}`);
    if (r.workflowId) console.log(`   Workflow ID: ${r.workflowId}`);
    if (r.errorMessage) console.log(`   Error: ${r.errorMessage.substring(0, 80)}`);
    console.log('');
  });
  
  // System Webhooks
  console.log('═'.repeat(70));
  console.log('⚙️  SYSTEM WEBHOOKS');
  console.log('═'.repeat(70) + '\n');
  
  const system = results.filter(r => r.category === 'System');
  system.forEach(r => {
    console.log(`${r.statusText} ${r.name}`);
    if (r.workflowId) console.log(`   Workflow ID: ${r.workflowId}`);
    if (r.errorMessage) console.log(`   Error: ${r.errorMessage.substring(0, 80)}`);
    console.log('');
  });
  
  // Inactive webhooks summary
  const inactiveList = results.filter(r => !r.isActive);
  if (inactiveList.length > 0) {
    console.log('═'.repeat(70));
    console.log('❌ INACTIVE WEBHOOKS - ACTION REQUIRED');
    console.log('═'.repeat(70) + '\n');
    
    console.log('To activate these webhooks:');
    console.log('1. Visit: https://n8n.pbradygeorgen.com');
    console.log('2. Navigate to each workflow');
    console.log('3. Toggle the activation switch (top-right)');
    console.log('4. Wait for webhook registration\n');
    
    inactiveList.forEach(r => {
      console.log(`   ${r.name}`);
      console.log(`   Path: ${r.path}`);
      if (r.workflowId) console.log(`   Workflow ID: ${r.workflowId}`);
      console.log('');
    });
  }
  
  // Save detailed report
  const report = {
    timestamp: new Date().toISOString(),
    n8nBaseUrl: N8N_BASE_URL,
    summary: {
      total: results.length,
      active,
      inactive,
      criticalActive,
      criticalInactive
    },
    results: results.map(r => ({
      name: r.name,
      path: r.path,
      method: r.method,
      category: r.category,
      priority: r.priority,
      workflowId: r.workflowId,
      status: r.status,
      statusText: r.statusText,
      isActive: r.isActive,
      errorMessage: r.errorMessage
    }))
  };
  
  const fs = require('fs');
  const path = require('path');
  const reportPath = path.join(__dirname, '..', '.backup-ec2-emergency', 'n8n-webhook-status-report.json');
  const reportDir = path.dirname(reportPath);
  if (!fs.existsSync(reportDir)) {
    fs.mkdirSync(reportDir, { recursive: true });
  }
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
  
  console.log('═'.repeat(70));
  console.log('📄 Detailed report saved to:');
  console.log(`   ${reportPath}`);
  console.log('═'.repeat(70) + '\n');
}

main().catch(error => {
  console.error('❌ Script failed:', error);
  process.exit(1);
});

