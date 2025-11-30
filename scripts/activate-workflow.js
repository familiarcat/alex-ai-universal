#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

function loadEnv() {
  const zshrcPath = path.join(process.env.HOME, '.zshrc');
  const zshrcContent = fs.readFileSync(zshrcPath, 'utf8');
  
  const n8nUrlMatch = zshrcContent.match(/export N8N_URL="([^"]+)"/);
  const n8nApiKeyMatch = zshrcContent.match(/export N8N_API_KEY="([^"]+)"/);
  
  return {
    n8nUrl: n8nUrlMatch[1],
    n8nApiKey: n8nApiKeyMatch[1]
  };
}

async function activateWorkflow(workflowId, env) {
  console.log(`🔄 Activating workflow ${workflowId}...`);
  
  const response = await fetch(`${env.n8nUrl}/api/v1/workflows/${workflowId}/activate`, {
    method: 'POST',
    headers: {
      'X-N8N-API-KEY': env.n8nApiKey
    }
  });
  
  if (!response.ok) {
    const error = await response.text();
    console.log(`❌ Activation failed: ${error}`);
    return false;
  }
  
  console.log(`✅ Workflow activated`);
  
  // Wait for webhook registration
  console.log(`⏳ Waiting 3 seconds for webhook registration...`);
  await new Promise(resolve => setTimeout(resolve, 3000));
  
  return true;
}

async function main() {
  const env = loadEnv();
  const workflowId = process.argv[2] || 'N6vrRsrIEWR7ZyTq';
  
  await activateWorkflow(workflowId, env);
}

main().catch(console.error);
