#!/usr/bin/env node

(async () => {
  try {
    const { N8NClient } = require('./n8n-cli-tools.js');
    const baseUrl = (process.env.N8N_URL || process.env.N8N_BASE_URL || 'https://n8n.pbradygeorgen.com').replace(/\/$/, '');
    const apiKey = process.env.N8N_API_KEY || process.env.N8N_API_TOKEN;
    if (!apiKey) {
      console.error('Missing N8N_API_KEY');
      process.exit(1);
    }

    const client = new N8NClient(baseUrl, apiKey);
    const list = await client.listWorkflows();
    const arr = Array.isArray(list?.data) ? list.data : Array.isArray(list) ? list : [];

    let activatedCount = 0;
    for (const wf of arr) {
      if (!wf.active) {
        try {
          await client.activateWorkflow(wf.id);
          activatedCount++;
          console.log(`Activated: ${wf.name}`);
        } catch (e) {
          console.error(`Failed: ${wf.name} -> ${e.message || e}`);
        }
      }
    }

    console.log(`Total activated: ${activatedCount}`);
  } catch (err) {
    console.error(err?.message || String(err));
    process.exit(1);
  }
})();


