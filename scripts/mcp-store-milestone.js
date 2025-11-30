#!/usr/bin/env node
/**
 * 🖖 MCP-First Milestone Storage
 * 
 * Stores milestone data via MCP server (primary) with n8n fallback
 * Architecture: MCP (mcp.pbradygeorgen.com) → n8n (n8n.pbradygeorgen.com) → Direct Supabase (emergency)
 * 
 * Usage:
 *   node scripts/mcp-store-milestone.js --summary "Milestone Title" --features "Feature 1; Feature 2" --tags "milestone,git"
 */

const https = require('https');
const path = require('path');

// Load credentials
function loadCredentials() {
  try {
    const zshrcPath = path.join(process.env.HOME, '.zshrc');
    const zshrcContent = require('fs').readFileSync(zshrcPath, 'utf8');
    
    const mcpUrlMatch = zshrcContent.match(/export MCP.*URL=['"]?([^'"\n]+)['"]?/i);
    const n8nUrlMatch = zshrcContent.match(/export N8N.*URL=['"]?([^'"\n]+)['"]?/i);
    
    return {
      mcpUrl: mcpUrlMatch ? mcpUrlMatch[1].replace(/\/$/, '') : 'https://mcp.pbradygeorgen.com',
      n8nUrl: n8nUrlMatch ? n8nUrlMatch[1].replace(/\/$/, '') : 'https://n8n.pbradygeorgen.com'
    };
  } catch (error) {
    return {
      mcpUrl: 'https://mcp.pbradygeorgen.com',
      n8nUrl: 'https://n8n.pbradygeorgen.com'
    };
  }
}

function arg(name, def = '') {
  const i = process.argv.indexOf(`--${name}`);
  return i > -1 && process.argv[i + 1] && !process.argv[i + 1].startsWith('--') 
    ? process.argv[i + 1] 
    : def;
}

/**
 * Call MCP server endpoint (PRIMARY)
 */
function callMCP(mcpUrl, endpoint, payload) {
  return new Promise((resolve, reject) => {
    const url = new URL(`${mcpUrl}/${endpoint}`);
    const body = JSON.stringify(payload);
    
    const options = {
      hostname: url.hostname,
      port: url.port || 443,
      path: url.pathname,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(body)
      },
      timeout: 15000
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          try {
            resolve(JSON.parse(data));
          } catch (e) {
            resolve({ success: true, data });
          }
        } else {
          reject(new Error(`MCP error: ${res.statusCode} ${res.statusText}`));
        }
      });
    });

    req.on('error', reject);
    req.on('timeout', () => {
      req.destroy();
      reject(new Error('MCP request timeout'));
    });

    req.write(body);
    req.end();
  });
}

/**
 * Call n8n webhook (FALLBACK)
 */
function callN8N(n8nUrl, webhook, payload) {
  return new Promise((resolve, reject) => {
    const url = new URL(`${n8nUrl}/webhook/${webhook}`);
    const body = JSON.stringify(payload);
    
    const options = {
      hostname: url.hostname,
      port: url.port || 443,
      path: url.pathname,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(body)
      },
      timeout: 15000
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          try {
            resolve(JSON.parse(data));
          } catch (e) {
            resolve({ success: true, data });
          }
        } else {
          reject(new Error(`n8n error: ${res.statusCode} ${res.statusText}`));
        }
      });
    });

    req.on('error', reject);
    req.on('timeout', () => {
      req.destroy();
      reject(new Error('n8n request timeout'));
    });

    req.write(body);
    req.end();
  });
}

async function main() {
  const summary = arg('summary', '');
  const features = arg('features', '').split(/[;,]/).map(s => s.trim()).filter(Boolean);
  const tags = (arg('tags', 'milestone,git')).split(',').map(s => s.trim()).filter(Boolean);
  
  if (!summary) {
    console.log('⚠️  No summary provided');
    process.exit(0);
  }

  const { mcpUrl, n8nUrl } = loadCredentials();
  
  const payload = {
    summary,
    features,
    tags,
    timestamp: new Date().toISOString(),
    source: 'milestone-push-automation'
  };

  // Try MCP first (PRIMARY)
  console.log(`📡 Attempting MCP storage (primary): ${mcpUrl}/api/milestone/store`);
  try {
    const result = await callMCP(mcpUrl, 'api/milestone/store', payload);
    console.log('✅ Milestone stored via MCP (primary)');
    if (result.message) console.log(`   ${result.message}`);
    process.exit(0);
  } catch (mcpError) {
    console.warn(`⚠️  MCP storage failed: ${mcpError.message}`);
    console.log(`🔄 Falling back to n8n: ${n8nUrl}/webhook/knowledge-ingest`);
    
    // Fallback to n8n
    try {
      const n8nPayload = {
        body: {
          content: `Milestone: ${summary}\n\nFeatures:\n${features.map(f => `- ${f}`).join('\n')}`,
          title: summary,
          category: 'milestone',
          tags,
          metadata: {
            features,
            source: 'milestone-push-automation',
            mcp_failed: true
          }
        }
      };
      
      const result = await callN8N(n8nUrl, 'knowledge-ingest', n8nPayload);
      console.log('✅ Milestone stored via n8n (fallback)');
      if (result.message) console.log(`   ${result.message}`);
      process.exit(0);
    } catch (n8nError) {
      console.error(`❌ Both MCP and n8n failed:`);
      console.error(`   MCP: ${mcpError.message}`);
      console.error(`   n8n: ${n8nError.message}`);
      console.error(`\n💡 Check:`);
      console.error(`   1. MCP server: ${mcpUrl}/healthz`);
      console.error(`   2. n8n server: ${n8nUrl}/healthz`);
      console.error(`   3. Network connectivity`);
      process.exit(1);
    }
  }
}

main().catch(err => {
  console.error('❌ Fatal error:', err.message);
  process.exit(1);
});

