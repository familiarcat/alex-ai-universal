#!/usr/bin/env node
/**
 * Check N8N Crew Workflow Status
 * 
 * Checks which crew workflows are imported and activated in N8N
 */

const axios = require('axios');
const path = require('path');
const fs = require('fs');

console.log('🔍 Checking N8N Crew Workflow Status...\n');

// Load credentials
const creds = require('./utils/load-crew-credentials.js');
const credentials = creds.loadCrewCredentials();

if (!credentials.n8n?.baseUrl || !credentials.n8n?.apiKey) {
  console.error('❌ N8N credentials not found');
  process.exit(1);
}

const n8nBaseUrl = credentials.n8n.baseUrl.replace(/\/$/, '');
const apiKey = credentials.n8n.apiKey;

// Crew workflow files
const workflowDir = path.resolve(__dirname, '..', 'n8n-workflows', 'crew-workflows');
const workflowFiles = fs.existsSync(workflowDir)
  ? fs.readdirSync(workflowDir).filter(f => f.endsWith('.json') && f.startsWith('crew-'))
  : [];

console.log(`📁 Found ${workflowFiles.length} crew workflow files\n`);

// Expected crew members
const expectedCrew = [
  'captain-jean-luc-picard',
  'commander-data',
  'lieutenant-commander-geordi-la-forge',
  'commander-william-riker',
  'counselor-deanna-troi',
  'dr-beverly-crusher',
  'lieutenant-uhura',
  'lieutenant-worf',
  'chief-miles-obrien',
  'quark'
];

async function fetchAllWorkflows() {
  try {
    const response = await axios.get(`${n8nBaseUrl}/api/v1/workflows`, {
      headers: {
        'X-N8N-API-KEY': apiKey
      },
      timeout: 10000
    });
    
    return response.data?.data || response.data || [];
  } catch (error) {
    if (error.response) {
      console.error(`❌ API Error: ${error.response.status} - ${error.response.statusText}`);
      if (error.response.data) {
        console.error(`   Message: ${JSON.stringify(error.response.data)}`);
      }
    } else {
      console.error(`❌ Connection Error: ${error.message}`);
    }
    return null;
  }
}

async function checkWorkflowStatus() {
  console.log('🔗 Connecting to N8N...');
  console.log(`   URL: ${n8nBaseUrl}\n`);
  
  const workflows = await fetchAllWorkflows();
  
  if (!workflows) {
    console.log('❌ Failed to fetch workflows from N8N');
    console.log('\n💡 Possible issues:');
    console.log('   - N8N instance not accessible');
    console.log('   - API key invalid or expired');
    console.log('   - Network connectivity issue');
    return;
  }
  
  console.log(`✅ Connected to N8N`);
  console.log(`📊 Found ${workflows.length} total workflows in N8N\n`);
  
  // Match crew workflows
  const crewWorkflows = [];
  const activeWorkflows = [];
  const inactiveWorkflows = [];
  
  for (const workflow of workflows) {
    // Check if it's a crew workflow
    const isCrewWorkflow = workflow.name?.toLowerCase().includes('crew') ||
                          expectedCrew.some(crew => workflow.name?.toLowerCase().includes(crew));
    
    if (isCrewWorkflow) {
      crewWorkflows.push(workflow);
      if (workflow.active) {
        activeWorkflows.push(workflow);
      } else {
        inactiveWorkflows.push(workflow);
      }
    }
  }
  
  console.log('📋 Crew Workflow Status:');
  console.log('='.repeat(60));
  console.log(`   Total Crew Workflows in N8N: ${crewWorkflows.length}`);
  console.log(`   ✅ Active: ${activeWorkflows.length}`);
  console.log(`   ⏸️  Inactive: ${inactiveWorkflows.length}`);
  console.log(`   📁 Workflow Files: ${workflowFiles.length}\n`);
  
  if (crewWorkflows.length > 0) {
    console.log('📝 Active Crew Workflows:');
    activeWorkflows.forEach(wf => {
      console.log(`   ✅ ${wf.name} (ID: ${wf.id})`);
      if (wf.nodes) {
        const webhookNodes = wf.nodes.filter(n => n.type === 'n8n-nodes-base.webhook');
        if (webhookNodes.length > 0) {
          webhookNodes.forEach(wh => {
            const path = wh.parameters?.path || 'N/A';
            console.log(`      Webhook: ${n8nBaseUrl}/webhook/${path}`);
          });
        }
      }
    });
    console.log('');
    
    if (inactiveWorkflows.length > 0) {
      console.log('⏸️  Inactive Crew Workflows:');
      inactiveWorkflows.forEach(wf => {
        console.log(`   ⏸️  ${wf.name} (ID: ${wf.id})`);
      });
      console.log('');
    }
  } else {
    console.log('⚠️  No crew workflows found in N8N');
    console.log('   This means workflows need to be imported.\n');
  }
  
  // Compare with files
  console.log('📊 Comparison:');
  console.log('='.repeat(60));
  console.log(`   Workflow Files: ${workflowFiles.length}`);
  console.log(`   Workflows in N8N: ${crewWorkflows.length}`);
  
  if (workflowFiles.length > crewWorkflows.length) {
    console.log(`   ⚠️  ${workflowFiles.length - crewWorkflows.length} workflow files not imported to N8N`);
    console.log('\n💡 To import workflows:');
    console.log('   1. Go to N8N Dashboard');
    console.log('   2. Import workflow from file');
    console.log('   3. Activate workflow');
  }
  
  if (inactiveWorkflows.length > 0) {
    console.log(`\n💡 To activate ${inactiveWorkflows.length} inactive workflows:`);
    console.log('   1. Go to N8N Dashboard');
    console.log('   2. Find each workflow');
    console.log('   3. Toggle activation switch');
    console.log('\n   OR use script:');
    console.log('      node scripts/activate-all-n8n-workflows.js');
  }
  
  console.log('\n✅ Status check complete!');
}

checkWorkflowStatus().catch(error => {
  console.error('\n❌ Error checking workflow status:', error.message);
  process.exit(1);
});

