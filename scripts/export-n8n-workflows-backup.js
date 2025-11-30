#!/usr/bin/env node

/**
 * 🖖 Export N8N Workflows Backup
 * 
 * Export all n8n workflow definitions before decommission.
 */

const https = require('https');
const fs = require('fs');
const path = require('path');
const { loadCrewCredentials } = require('./utils/load-crew-credentials');

async function exportWorkflows() {
  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('📦 EXPORTING N8N WORKFLOWS BACKUP');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  const { n8n } = loadCrewCredentials();
  const baseUrl = n8n.baseUrl;
  const apiKey = n8n.apiKey;

  if (!apiKey) {
    console.error('❌ N8N API key not found\n');
    process.exit(1);
  }

  // Fetch all workflows
  const workflows = await new Promise((resolve, reject) => {
    const url = new URL('/api/v1/workflows', baseUrl);
    const options = {
      hostname: url.hostname,
      port: url.port || 443,
      path: url.pathname,
      method: 'GET',
      headers: {
        'X-N8N-API-KEY': apiKey,
        'Content-Type': 'application/json'
      },
      timeout: 30000
    };

    const req = https.request(options, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        if (res.statusCode === 200) {
          try {
            const data = JSON.parse(body);
            resolve(data.data || data);
          } catch (e) {
            reject(new Error(`Parse error: ${e.message}`));
          }
        } else {
          reject(new Error(`HTTP ${res.statusCode}: ${body}`));
        }
      });
    });

    req.on('error', reject);
    req.on('timeout', () => {
      req.destroy();
      reject(new Error('Request timeout'));
    });

    req.end();
  });

  console.log(`📋 Found ${workflows.length} workflows\n`);

  // Create backup directory
  const backupDir = path.join(process.cwd(), 'n8n-backups', `export-${Date.now()}`);
  fs.mkdirSync(backupDir, { recursive: true });

  console.log(`💾 Exporting to: ${backupDir}\n`);

  // Export each workflow
  let exported = 0;
  for (const workflow of workflows) {
    const filename = `${workflow.id}-${workflow.name.replace(/[^a-z0-9]/gi, '_')}.json`;
    const filepath = path.join(backupDir, filename);

    fs.writeFileSync(filepath, JSON.stringify(workflow, null, 2));
    exported++;
    console.log(`   ✅ ${workflow.name}`);
  }

  // Create summary
  const summary = {
    exportDate: new Date().toISOString(),
    totalWorkflows: workflows.length,
    exported: exported,
    workflows: workflows.map(w => ({
      id: w.id,
      name: w.name,
      active: w.active
    }))
  };

  fs.writeFileSync(
    path.join(backupDir, 'export-summary.json'),
    JSON.stringify(summary, null, 2)
  );

  console.log(`\n✅ Exported ${exported} workflows\n`);
  console.log(`📄 Summary: ${path.join(backupDir, 'export-summary.json')}\n`);
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
}

exportWorkflows().catch(error => {
  console.error('❌ Export failed:', error.message);
  process.exit(1);
});

