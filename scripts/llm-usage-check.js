#!/usr/bin/env node
/**
 * LLM Usage Check
 * - Probes supported providers and prints rate-limit/usage headers if available.
 * - Does NOT print full secrets. Uses presence of env vars to determine which to probe.
 */

const https = require('https');

function request(url, { method = 'GET', headers = {} } = {}) {
  return new Promise((resolve, reject) => {
    const u = new URL(url);
    const opts = {
      method,
      hostname: u.hostname,
      path: u.pathname + u.search,
      headers,
      port: u.port || 443,
    };
    const req = https.request(opts, (res) => {
      let body = '';
      res.on('data', (c) => (body += c));
      res.on('end', () => resolve({ status: res.statusCode, headers: res.headers, body }));
    });
    req.on('error', reject);
    req.end();
  });
}

function maskKey(key) {
  if (!key) return '';
  return key.slice(0, 6) + '…' + key.slice(-4);
}

async function checkOpenRouter() {
  const key = process.env.OPENROUTER_API_KEY || '';
  if (!key) return null;
  try {
    const r = await request('https://openrouter.ai/api/v1/models', {
      headers: { Authorization: `Bearer ${key}` },
    });
    const h = r.headers || {};
    return {
      provider: 'openrouter',
      configured: true,
      keyPreview: maskKey(key),
      remainingRequests: Number(h['x-ratelimit-remaining-requests'] || h['x-ratelimit-remaining'] || NaN),
      remainingTokens: Number(h['x-ratelimit-remaining-tokens'] || NaN),
      resetSeconds: Number(h['x-ratelimit-reset-requests'] || h['x-ratelimit-reset'] || NaN),
      status: r.status,
    };
  } catch (e) {
    return { provider: 'openrouter', configured: true, error: e.message };
  }
}

async function checkOpenAI() {
  const key = process.env.OPENAI_API_KEY || '';
  if (!key) return null;
  try {
    const r = await request('https://api.openai.com/v1/models', {
      headers: { Authorization: `Bearer ${key}` },
    });
    const h = r.headers || {};
    return {
      provider: 'openai',
      configured: true,
      keyPreview: maskKey(key),
      remainingRequests: Number(h['x-ratelimit-remaining-requests'] || NaN),
      remainingTokens: Number(h['x-ratelimit-remaining-tokens'] || NaN),
      resetSeconds: Number(h['x-ratelimit-reset-requests'] || NaN),
      status: r.status,
      note: 'OpenAI may not include rate headers on /models; values can be NaN.',
    };
  } catch (e) {
    return { provider: 'openai', configured: true, error: e.message };
  }
}

async function checkAnthropic() {
  const key = process.env.ANTHROPIC_API_KEY || '';
  if (!key) return null;
  try {
    const r = await request('https://api.anthropic.com/v1/models', {
      headers: {
        'x-api-key': key,
        'anthropic-version': '2023-06-01',
      },
    });
    const h = r.headers || {};
    return {
      provider: 'anthropic',
      configured: true,
      keyPreview: maskKey(key),
      remainingRequests: Number(h['anthropic-ratelimit-requests-remaining'] || NaN),
      remainingTokens: Number(h['anthropic-ratelimit-input-tokens-remaining'] || NaN),
      resetSeconds: Number(h['anthropic-ratelimit-requests-reset'] || NaN),
      status: r.status,
    };
  } catch (e) {
    return { provider: 'anthropic', configured: true, error: e.message };
  }
}

(async () => {
  const checks = await Promise.all([checkOpenRouter(), checkOpenAI(), checkAnthropic()]);
  const results = checks.filter(Boolean);
  if (!results.length) {
    console.log('No LLM providers configured in env.');
    process.exit(0);
  }

  // Determine which is closest to limit (fewest remaining requests)
  const ranked = results.slice().sort((a, b) => {
    const ra = isNaN(a.remainingRequests) ? Infinity : a.remainingRequests;
    const rb = isNaN(b.remainingRequests) ? Infinity : b.remainingRequests;
    return ra - rb;
  });

  const nearest = ranked[0];
  console.log(JSON.stringify({ providers: results, nearestLimit: nearest }, null, 2));
})();


