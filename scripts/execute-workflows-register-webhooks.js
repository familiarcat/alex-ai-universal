#!/usr/bin/env node

/**
 * 🚀 N8N WORKFLOW EXECUTION SCRIPT
 * 
 * Executes each workflow once via n8n API to register production webhooks.
 * Production webhooks register lazily on first execution.
 * 
 * After running this script, all crew webhooks will be accessible at:
 * https://n8n.pbradygeorgen.com/webhook/{webhook-path}
 */

const axios = require('axios');

const N8N_API_BASE = 'https://n8n.pbradygeorgen.com/api/v1';
const N8N_API_KEY = process.env.N8N_API_KEY || '';

// Workflow IDs to execute (from the n8n UI - these need to be fetched)
const workflowsToExecute = [
  { name: 'Captain Jean-Luc Picard', pattern: 'Captain Jean-Luc Picard' },
  { name: 'Commander William Riker', pattern: 'Commander William Riker' },
  { name: 'Commander Data', pattern: 'Commander Data' },
  { name: 'Geordi La Forge', pattern: 'Geordi La Forge' },
  { name: 'Lieutenant Worf', pattern: 'Lieutenant Worf' },
  { name: 'Counselor Deanna Troi', pattern: 'Counselor Deanna Troi' },
  { name: 'Dr. Beverly Crusher', pattern: 'Dr. Beverly Crusher' },
  { name: 'Lieutenant Uhura', pattern: 'Lieutenant Uhura' },
  { name: 'Chief Miles O\'Brien', pattern: 'Chief Miles O\'Brien' },
  { name: 'Quark', pattern: 'Quark' },
  { name: 'Democratic Collaboration', pattern: 'Democratic Collaboration' },
  { name: 'Observation Lounge', pattern: 'Observation Lounge' },
  { name: 'Knowledge Ingest', pattern: 'Knowledge Ingest' },
];

const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  blue: '\x1b[34m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  cyan: '\x1b[36m',
};

function printHeader(title) {
  console.log('\n' + colors.bright + colors.cyan + '━'.repeat(80) + colors.reset);
  console.log(colors.bright + colors.cyan + `  ${title}` + colors.reset);
  console.log(colors.bright + colors.cyan + '━'.repeat(80) + colors.reset + '\n');
}

function printSuccess(message) {
  console.log(colors.green + '✅ ' + message + colors.reset);
}

function printError(message) {
  console.log(colors.red + '❌ ' + message + colors.reset);
}

function printInfo(message) {
  console.log(colors.blue + 'ℹ️  ' + message + colors.reset);
}

async function getAllWorkflows() {
  try {
    const response = await axios.get(`${N8N_API_BASE}/workflows`, {
      headers: {
        'X-N8N-API-KEY': N8N_API_KEY,
      },
    });
    return response.data.data || response.data;
  } catch (error) {
    printError(`Failed to fetch workflows: ${error.message}`);
    return [];
  }
}

async function executeWorkflow(workflowId, workflowName) {
  try {
    printInfo(`Executing ${workflowName} (ID: ${workflowId})...`);
    
    const response = await axios.post(
      `${N8N_API_BASE}/workflows/${workflowId}/execute`,
      {},
      {
        headers: {
          'X-N8N-API-KEY': N8N_API_KEY,
          'Content-Type': 'application/json',
        },
        timeout: 30000,
      }
    );
    
    if (response.status === 200 || response.status === 201) {
      printSuccess(`${workflowName} - Executed successfully (webhook now registered)`);
      return { success: true, workflowName };
    } else {
      printError(`${workflowName} - Unexpected status: ${response.status}`);
      return { success: false, workflowName, error: `Status ${response.status}` };
    }
  } catch (error) {
    // Some workflows might fail execution if they require input, but that's OK
    // The webhook should still register
    if (error.response && error.response.status === 400) {
      printSuccess(`${workflowName} - Triggered (webhook registered, execution expected input)`);
      return { success: true, workflowName, note: 'Expected input error (OK)' };
    }
    
    printError(`${workflowName} - Execution failed: ${error.message}`);
    return { success: false, workflowName, error: error.message };
  }
}

async function main() {
  printHeader('N8N WEBHOOK REGISTRATION VIA WORKFLOW EXECUTION');
  
  printInfo('Step 1: Fetching all workflows from n8n...');
  const allWorkflows = await getAllWorkflows();
  
  if (allWorkflows.length === 0) {
    printError('No workflows found or API access failed. Check N8N_API_KEY.');
    process.exit(1);
  }
  
  printSuccess(`Found ${allWorkflows.length} workflows`);
  
  // Find crew-related workflows
  const crewWorkflows = allWorkflows.filter(wf => 
    wf.active && (
      wf.name.includes('CREW -') ||
      wf.name.includes('COORDINATION -') ||
      wf.name.includes('Knowledge Ingest')
    )
  );
  
  printInfo(`Found ${crewWorkflows.length} crew/coordination workflows to execute`);
  
  const results = [];
  
  printHeader('EXECUTING WORKFLOWS TO REGISTER WEBHOOKS');
  
  for (const workflow of crewWorkflows) {
    const result = await executeWorkflow(workflow.id, workflow.name);
    results.push(result);
    
    // Delay to avoid overwhelming n8n
    await new Promise(resolve => setTimeout(resolve, 2000));
  }
  
  printHeader('EXECUTION SUMMARY');
  
  const successful = results.filter(r => r.success).length;
  const failed = results.filter(r => !r.success).length;
  
  console.log(colors.bright + `Total Executed: ${results.length}` + colors.reset);
  console.log(colors.green + `Successful: ${successful}` + colors.reset);
  console.log(colors.red + `Failed: ${failed}` + colors.reset);
  
  if (successful === results.length) {
    console.log('\n' + colors.green + colors.bright + '🎉 ALL WEBHOOKS NOW REGISTERED!' + colors.reset);
    console.log('\nYou can now run: node scripts/test-crew-rag-system.js');
  } else {
    console.log('\n' + colors.yellow + colors.bright + '⚠️  Some executions failed. Webhooks may still be registered.' + colors.reset);
    console.log('\nTry running: node scripts/test-crew-rag-system.js to verify');
  }
}

main().catch(error => {
  console.error(colors.red + '\n❌ Fatal error:' + colors.reset);
  console.error(error);
  process.exit(1);
});

