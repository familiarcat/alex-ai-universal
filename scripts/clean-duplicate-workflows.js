#!/usr/bin/env node
/**
 * 🧹 Clean Duplicate Workflows
 * 
 * Identifies and removes duplicate workflows, keeping the most recent one
 */

const { loadCrewCredentials } = require('./utils/load-crew-credentials');
const axios = require('axios');

const creds = loadCrewCredentials();
if (!creds.n8n.apiKey) {
  console.error('❌ N8N API key not found');
  process.exit(1);
}

const api = axios.create({
  baseURL: creds.n8n.baseUrl,
  headers: {
    'X-N8N-API-KEY': creds.n8n.apiKey,
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

async function main() {
  console.log('🧹 Cleaning Duplicate Workflows\n');
  
  // Fetch all workflows
  const { data } = await api.get('/api/v1/workflows');
  const workflows = Array.isArray(data?.data) ? data.data : data;
  
  console.log(`📋 Found ${workflows.length} total workflows\n`);
  
  // Group by name
  const workflowsByName = {};
  workflows.forEach(wf => {
    const name = wf.name;
    if (!workflowsByName[name]) {
      workflowsByName[name] = [];
    }
    workflowsByName[name].push(wf);
  });
  
  // Find duplicates
  const duplicates = [];
  Object.entries(workflowsByName).forEach(([name, wfs]) => {
    if (wfs.length > 1) {
      // Sort by updatedAt (most recent first) or createdAt
      wfs.sort((a, b) => {
        const aTime = new Date(a.updatedAt || a.createdAt || 0);
        const bTime = new Date(b.updatedAt || b.createdAt || 0);
        return bTime - aTime;
      });
      
      // Keep the first (most recent), mark others for deletion
      duplicates.push({
        name,
        keep: wfs[0],
        remove: wfs.slice(1)
      });
    }
  });
  
  if (duplicates.length === 0) {
    console.log('✅ No duplicate workflows found!\n');
    return;
  }
  
  console.log(`🔍 Found ${duplicates.length} workflows with duplicates:\n`);
  
  let deleted = 0;
  let failed = 0;
  
  for (const dup of duplicates) {
    console.log(`📦 ${dup.name}:`);
    console.log(`   ✅ Keeping: ${dup.keep.id} (${dup.keep.active ? 'active' : 'inactive'})`);
    
    for (const wf of dup.remove) {
      try {
        // Deactivate first if active
        if (wf.active) {
          await api.post(`/api/v1/workflows/${wf.id}/deactivate`);
        }
        
        // Delete workflow
        await api.delete(`/api/v1/workflows/${wf.id}`);
        console.log(`   🗑️  Deleted: ${wf.id}`);
        deleted++;
      } catch (error) {
        console.log(`   ❌ Failed to delete ${wf.id}: ${error.message}`);
        failed++;
      }
    }
    console.log('');
  }
  
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(`\n📊 Cleanup Summary:`);
  console.log(`   🗑️  Deleted: ${deleted} duplicate workflows`);
  console.log(`   ❌ Failed: ${failed}`);
  console.log(`   ✅ Kept: ${duplicates.length} unique workflows\n`);
}

main().catch(error => {
  console.error('\n❌ Error:', error.message);
  process.exit(1);
});

