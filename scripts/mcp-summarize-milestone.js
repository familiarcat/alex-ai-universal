#!/usr/bin/env node
/**
 * 🖖 MCP Milestone Summarization
 * 
 * Summarize milestone scope and intent using MCP/OpenRouter instead of n8n.
 * This completes the migration away from n8n webhooks.
 * 
 * Usage:
 *   node scripts/mcp-summarize-milestone.js --summary "Milestone Title" --features "Feature 1; Feature 2"
 */

const https = require('https');

function arg(name, def = '') {
  const i = process.argv.indexOf(`--${name}`);
  return i > -1 && process.argv[i + 1] && !process.argv[i + 1].startsWith('--') ? process.argv[i + 1] : def;
}

function loadCredentials() {
  const { getCredential } = require('./utils/secure-credential-loader');
  return getCredential('OPENROUTER_API_KEY');
}

async function callOpenRouter(prompt, systemPrompt) {
  const apiKey = loadCredentials();
  if (!apiKey) {
    console.log('SUMMARY_SKIPPED No OPENROUTER_API_KEY set');
    return null;
  }

  const body = JSON.stringify({
    model: 'anthropic/claude-3.5-sonnet', // Cost-effective for summarization
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: prompt }
    ],
    max_tokens: 500,
    temperature: 0.7
  });

  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'openrouter.ai',
      port: 443,
      path: '/api/v1/chat/completions',
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(body),
        'HTTP-Referer': 'https://alex-ai-universal.local',
        'X-Title': 'Alex AI Milestone Summarization'
      },
      timeout: 30000
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          try {
            const json = JSON.parse(data);
            const content = json.choices?.[0]?.message?.content || '';
            resolve(content);
          } catch (e) {
            reject(new Error(`Failed to parse response: ${e.message}`));
          }
        } else {
          reject(new Error(`HTTP ${res.statusCode}: ${data}`));
        }
      });
    });

    req.on('error', reject);
    req.on('timeout', () => {
      req.destroy();
      reject(new Error('Request timeout'));
    });

    req.write(body);
    req.end();
  });
}

async function main() {
  const summary = arg('summary', 'Milestone');
  const features = arg('features', '').split(/[;,]/).map(s => s.trim()).filter(Boolean);

  if (!summary) {
    console.log('SUMMARY_SKIPPED No summary provided');
    return;
  }

  const systemPrompt = `You are an AI assistant helping to summarize technical milestones for non-technical stakeholders. 
Provide clear, concise summaries in 2-3 sentences that explain the scope and business value.`;

  const prompt = `Summarize this milestone for non-technical stakeholders:

Title: ${summary}
${features.length > 0 ? `Features:\n${features.map(f => `- ${f}`).join('\n')}` : ''}

Provide a 2-3 sentence summary that explains what was accomplished and why it matters.`;

  try {
    const result = await callOpenRouter(prompt, systemPrompt);
    if (result) {
      console.log('SUMMARY_OK');
      console.log(result.trim());
    }
  } catch (error) {
    console.log(`SUMMARY_FAILED ${error.message}`);
    // Don't exit with error - this is non-blocking
    process.exit(0);
  }
}

main().catch(err => {
  console.log(`SUMMARY_FAILED ${err.message || err}`);
  process.exit(0);
});

