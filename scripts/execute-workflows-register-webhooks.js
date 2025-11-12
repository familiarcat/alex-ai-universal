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
const { loadCrewCredentials } = require('./utils/load-crew-credentials');

const creds = loadCrewCredentials();
const N8N_API_KEY = creds.n8n.apiKey || '';
if (!N8N_API_KEY) {
  console.error('❌ N8N API key not found. Set N8N_OWNER_API_KEY or N8N_API_KEY in your environment.');
  process.exit(1);
}

const apiClient = axios.create({
  baseURL: creds.n8n.baseUrl,
  headers: {
    'X-N8N-API-KEY': N8N_API_KEY,
    'Content-Type': 'application/json',
  },
  timeout: 30000,
  withCredentials: true,
});

let sessionCookie;
let sessionClient;

async function getSessionClient(force = false) {
  if (sessionClient && sessionCookie && !force) {
    return sessionClient;
  }

  const email = creds.n8n.email;
  const password = creds.n8n.password;

  if (!email || !password) {
    printError(
      'Owner session required for manual execution. Set N8N_EMAIL and N8N_PASSWORD in your environment.'
    );
    return null;
  }

  try {
    printInfo('Obtaining n8n owner session for manual workflow execution...');
    const response = await axios.post(
      `${creds.n8n.baseUrl}/rest/login`,
      {
        emailOrLdapLoginId: email,
        password,
      },
      {
        headers: { 'Content-Type': 'application/json' },
        timeout: 15000,
      }
    );

    const setCookie = response.headers['set-cookie'];
    const authCookie = Array.isArray(setCookie)
      ? setCookie.find((cookie) => cookie.startsWith('n8n-auth='))
      : setCookie;

    if (!authCookie) {
      printError('Session login succeeded but no n8n-auth cookie was returned.');
      return null;
    }

    sessionCookie = authCookie.split(';')[0];
    sessionClient = axios.create({
      baseURL: creds.n8n.baseUrl,
      headers: {
        'Content-Type': 'application/json',
        Cookie: sessionCookie,
      },
      timeout: 30000,
      withCredentials: true,
    });

    return sessionClient;
  } catch (error) {
    printError(`Failed to create owner session: ${error.message}`);
    return null;
  }
}

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
    const response = await apiClient.get('/api/v1/workflows');
    return response.data.data || response.data;
  } catch (error) {
    printError(`Failed to fetch workflows: ${error.message}`);
    return [];
  }
}

async function fetchWorkflow(workflowId, workflowName) {
  try {
    const response = await apiClient.get(`/api/v1/workflows/${workflowId}`);
    const data = response.data?.data || response.data;
    if (!data || !data.id) {
      printError(`${workflowName} - Unable to load workflow definition for manual run.`);
      return null;
    }
    return data;
  } catch (error) {
    printError(`${workflowName} - Failed to fetch workflow: ${error.message}`);
    return null;
  }
}

function sanitizeWorkflowData(workflow) {
  const {
    id,
    name,
    nodes,
    connections,
    settings,
    active,
    staticData,
    pinData,
    versionId,
    meta,
    tags,
  } = workflow;

  return {
    id,
    name,
    nodes,
    connections,
    settings: settings || {},
    active: active ?? false,
    staticData: staticData ?? null,
    pinData,
    versionId,
    meta,
    tags,
  };
}

function buildManualRunPayload(workflow) {
  return {
    workflowData: sanitizeWorkflowData(workflow),
    runData: {},
  };
}

async function executeWorkflow(workflowId, workflowName) {
  try {
    printInfo(`Executing ${workflowName} (ID: ${workflowId})...`);
    
    const workflow = await fetchWorkflow(workflowId, workflowName);
    if (!workflow) {
      return { success: false, workflowName, error: 'workflow-load-failed' };
    }

    const payload = buildManualRunPayload(workflow);
    const sessionAwareClient = await getSessionClient();
    if (!sessionAwareClient) {
      return { success: false, workflowName, error: 'session-login-failed' };
    }

    const response = await sessionAwareClient.post(
      `/rest/workflows/${workflowId}/run`,
      payload
    );
    
    if (response.status === 200 || response.status === 201) {
      const waiting = response.data?.waitingForWebhook;
      printInfo(
        `${workflowName} - Manual run response: ${JSON.stringify(response.data ?? {})}`
      );
      if (waiting) {
        printSuccess(`${workflowName} - Manual execution waiting for webhook (webhook registered)`);
      } else {
        printSuccess(`${workflowName} - Manual execution triggered (status ${response.status})`);
      }
      return { success: true, workflowName };
    }

      printError(`${workflowName} - Unexpected status: ${response.status}`);
      return { success: false, workflowName, error: `Status ${response.status}` };
  } catch (error) {
    printError(`${workflowName} - Execution failed: ${error.message}`);
    const status = error.response?.status;
    const details = error.response?.data;
    if (status) {
      printError(`${workflowName} - HTTP ${status} response: ${JSON.stringify(details)}`);
      if (status === 401 || status === 403) {
        sessionCookie = undefined;
        sessionClient = undefined;
      }
      return { success: false, workflowName, error: `HTTP_${status}` };
    }
    return { success: false, workflowName, error: error.message };
  }
}

async function main() {
  printHeader('N8N WEBHOOK REGISTRATION VIA WORKFLOW EXECUTION');
  
  printInfo('Step 1: Fetching all workflows from n8n...');
  const allWorkflows = await getAllWorkflows();
  
  if (allWorkflows.length === 0) {
    printError('No workflows found or API access failed. Verify N8N_OWNER_API_KEY / N8N_API_KEY credentials.');
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

