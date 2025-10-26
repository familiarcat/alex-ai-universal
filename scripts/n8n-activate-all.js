#!/usr/bin/env node

/**
 * Activate all n8n workflows on a target instance.
 *
 * Usage (run locally):
 *   export N8N_URL="https://n8n.pbradygeorgen.com"
 *   export N8N_API_KEY="<your_api_key>"
 *   node scripts/n8n-activate-all.js
 */

const { N8NClient } = require('./n8n-cli-tools.js');

function getEnv(name, required = false) {
  const v = process.env[name];
  if (required && (!v || !v.trim())) {
    console.error(`❌ Missing required env: ${name}`);
    process.exit(1);
  }
  return v;
}

async function main() {
  const baseUrl = getEnv('N8N_URL', true);
  const apiKey = getEnv('N8N_API_KEY', true);

  const client = new N8NClient(baseUrl, apiKey);

  const results = { total: 0, alreadyActive: 0, toActivate: 0, activated: 0, failed: 0, failures: [] };

  try {
    const listResp = await client.listWorkflows();
    const workflows = listResp.data || listResp || [];
    results.total = workflows.length;

    // Only act on inactive workflows to keep the operation idempotent
    const targets = workflows.filter(w => !w.active);
    results.alreadyActive = results.total - targets.length;
    results.toActivate = targets.length;

    for (const w of targets) {
      const id = w.id || w.data?.id;
      const name = w.name || w.data?.name || id;
      if (!id) continue;

      try {
        const full = await client.getWorkflow(id);
        // Ensure full shape for update activation (works across n8n versions)
        const activationData = {
          name: full.name,
          nodes: full.nodes,
          connections: full.connections,
          settings: full.settings || {},
          staticData: full.staticData || null,
          active: true,
        };

        await client.updateWorkflow(id, activationData);
        console.log(`✅ Activated: ${name} (${id})`);
        results.activated += 1;

        // Throttle to avoid load spikes / rate limiting
        await new Promise(r => setTimeout(r, 200));
      } catch (e) {
        results.failed += 1;
        const msg = (e && e.message) ? e.message : String(e);
        console.warn(`⚠️  Failed to activate ${name} (${id}): ${msg}`);
        results.failures.push({ id, name, error: msg });

        // If community node missing, stop early to avoid looping on all
        if (/Unrecognized node type/i.test(msg)) {
          console.warn('\n⛔ Detected missing community node. Stopping early to avoid repeated failures.');
          break;
        }
      }
    }

    console.log('\n📊 Activation Summary');
    console.log(`   Total:         ${results.total}`);
    console.log(`   Already active:${results.alreadyActive}`);
    console.log(`   To activate:   ${results.toActivate}`);
    console.log(`   Activated:     ${results.activated}`);
    console.log(`   Failed:        ${results.failed}`);

    // Heuristic: surface missing node packages quickly
    const missingNodeErrors = results.failures
      .map(f => f.error)
      .filter(m => /Unrecognized node type/i.test(m));
    if (missingNodeErrors.length) {
      console.log('\n🔎 Some workflows reference community nodes not installed.');
      console.log('   Example message:');
      console.log(`   ${missingNodeErrors[0]}`);
      console.log('\n💡 On the server, add required packages to N8N_COMMUNITY_PACKAGES and restart, e.g.:');
      console.log("   echo 'N8N_COMMUNITY_PACKAGES=@n8n/n8n-nodes-langchain' | sudo tee -a /opt/n8n/.env");
      console.log('   sudo systemctl restart n8n');
      console.log('   Then re-run: node scripts/n8n-activate-all.js');
    }

    if (results.failed > 0) {
      process.exitCode = 2;
    }
  } catch (err) {
    console.error('❌ Activation run failed:', err?.message || err);
    process.exit(1);
  }
}

main();


