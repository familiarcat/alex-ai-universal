#!/usr/bin/env node
/**
 * Fetch all crew workflows from n8n and analyze their structure
 */

const https = require('https');
const fs = require('fs');
const path = require('path');

function env(key, fallback = '') {
  return process.env[key] || fallback;
}

function requestJSON(method, urlString, apiKey) {
  const url = new URL(urlString);
  const options = {
    hostname: url.hostname,
    port: url.port || 443,
    path: url.pathname + (url.search || ''),
    method,
    headers: {
      'X-N8N-API-KEY': apiKey,
      'Content-Type': 'application/json'
    }
  };
  
  return new Promise((resolve, reject) => {
    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', (c) => (data += c));
      res.on('end', () => {
        try {
          const json = data ? JSON.parse(data) : null;
          resolve({ status: res.statusCode, data: json });
        } catch {
          resolve({ status: res.statusCode, data });
        }
      });
    });
    req.on('error', reject);
    req.end();
  });
}

async function main() {
  const N8N_URL = env('N8N_URL', 'https://n8n.pbradygeorgen.com');
  const N8N_API_KEY = env('N8N_API_KEY');
  
  if (!N8N_API_KEY) {
    console.error('❌ N8N_API_KEY not found');
    process.exit(1);
  }
  
  console.log('');
  console.log('🖖 CREW ROSTER SYNC FROM N8N');
  console.log('═══════════════════════════════════════');
  console.log('');
  
  const listResp = await requestJSON('GET', `${N8N_URL}/api/v1/workflows`, N8N_API_KEY);
  const workflows = Array.isArray(listResp.data) ? listResp.data : (listResp.data?.data || []);
  
  // Filter for CREW workflows
  const crewWorkflows = workflows.filter(w => 
    w.name && (w.name.startsWith('CREW -') || w.name.includes('Crew -'))
  );
  
  console.log(`Found ${workflows.length} total workflows`);
  console.log(`Found ${crewWorkflows.length} crew member workflows`);
  console.log('');
  
  const crewData = [];
  
  for (const wf of crewWorkflows) {
    console.log(`📋 ${wf.name}`);
    console.log(`   ID: ${wf.id}`);
    console.log(`   Active: ${wf.active ? '✅' : '❌'}`);
    console.log(`   Nodes: ${wf.nodes?.length || 0}`);
    console.log(`   Updated: ${wf.updatedAt?.slice(0, 10) || 'unknown'}`);
    console.log('');
    
    crewData.push({
      id: wf.id,
      name: wf.name,
      active: wf.active,
      nodes: wf.nodes?.length || 0,
      updatedAt: wf.updatedAt,
      tags: wf.tags || []
    });
  }
  
  // Save to file for analysis
  const outputPath = path.join(__dirname, '..', 'crew-analysis.json');
  fs.writeFileSync(outputPath, JSON.stringify({ crews: crewData, total: crewData.length }, null, 2));
  
  console.log('═══════════════════════════════════════');
  console.log(`✅ Analysis saved to: crew-analysis.json`);
  console.log(`   Total crew members found: ${crewData.length}`);
  console.log('');
}

main();
