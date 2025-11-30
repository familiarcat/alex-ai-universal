"use strict";

const { Octokit } = require('@octokit/rest');
const https = require('node:https');

const ALEX_API_URL = process.env.ALEX_API_URL || '';
const ALEX_API_KEY = process.env.ALEX_API_KEY || '';
const GITHUB_TOKEN = process.env.GITHUB_TOKEN || process.env.GH_TOKEN || '';

async function fetchJson(url, options) {
  return new Promise((resolve, reject) => {
    const req = https.request(url, { method: options.method || 'GET', headers: options.headers || {} }, res => {
      const chunks = [];
      res.on('data', c => chunks.push(c));
      res.on('end', () => {
        const body = Buffer.concat(chunks).toString('utf8');
        try { resolve({ status: res.statusCode, json: JSON.parse(body || '{}') }); }
        catch { resolve({ status: res.statusCode, json: {} }); }
      });
    });
    req.on('error', reject);
    if (options.body) req.write(options.body);
    req.end();
  });
}

async function fetchAlex(body) {
  if (!ALEX_API_URL || !ALEX_API_KEY) {
    console.log('[dry-run] Missing ALEX_API_URL or ALEX_API_KEY');
    return { labels: [], milestone: null, dryRun: true };
  }
  const { status, json } = await fetchJson(ALEX_API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${ALEX_API_KEY}` },
    body: JSON.stringify(body)
  });
  if (status < 200 || status >= 300) throw new Error(`Alex API ${status}`);
  return json;
}

async function ensureMilestone(octokit, owner, repo, title) {
  const list = await octokit.issues.listMilestones({ owner, repo, state: 'open' });
  let ms = list.data.find(m => m.title === title);
  if (!ms) {
    const created = await octokit.issues.createMilestone({ owner, repo, title });
    ms = created.data;
  }
  return ms.number;
}

async function triageItem(octokit, owner, repo, num, isPR) {
  const item = isPR
    ? (await octokit.pulls.get({ owner, repo, pull_number: num })).data
    : (await octokit.issues.get({ owner, repo, issue_number: num })).data;

  const payload = {
    eventName: 'manual_triage',
    repo: { owner, repo },
    issue: isPR ? undefined : {
      number: item.number,
      title: item.title,
      body: item.body || '',
      labels: (item.labels || []).map(l => typeof l === 'string' ? l : l.name),
      state: item.state,
      isPullRequest: false
    },
    pull_request: isPR ? {
      number: item.number,
      title: item.title,
      body: item.body || '',
      labels: (item.labels || []).map(l => typeof l === 'string' ? l : l.name),
      state: item.state,
      draft: !!item.draft
    } : undefined
  };

  const alex = await fetchAlex(payload);
  if (alex.labels?.length) {
    await octokit.issues.addLabels({ owner, repo, issue_number: num, labels: alex.labels });
  }
  if (alex.milestone && typeof alex.milestone === 'string') {
    const msNum = await ensureMilestone(octokit, owner, repo, alex.milestone);
    await octokit.issues.update({ owner, repo, issue_number: num, milestone: msNum });
  }
}

async function main() {
  const octokit = new Octokit({ auth: GITHUB_TOKEN || undefined });
  const repoSlug = process.env.GITHUB_REPOSITORY || '';
  let owner = process.env.GITHUB_OWNER || '';
  let repo = process.env.GITHUB_REPO || '';
  if (repoSlug && (!owner || !repo)) {
    const [o, r] = repoSlug.split('/');
    owner = owner || o;
    repo = repo || r;
  }
  if (!owner || !repo) {
    // Attempt to infer from remote
    console.error('Set GITHUB_REPOSITORY="owner/repo" or GITHUB_OWNER/GITHUB_REPO.');
    process.exit(2);
  }

  const args = process.argv.slice(2);
  const idx = args.indexOf('--item');
  const doAll = args.includes('--all');
  if (idx >= 0 && args[idx + 1]) {
    const num = parseInt(args[idx + 1], 10);
    const pr = await octokit.pulls.get({ owner, repo, pull_number: num }).catch(() => null);
    await triageItem(octokit, owner, repo, num, !!pr);
    console.log(`Triaged #${num}`);
    return;
  }
  if (doAll) {
    const issues = await octokit.paginate(octokit.issues.listForRepo, { owner, repo, state: 'open' });
    for (const it of issues) {
      const isPR = !!it.pull_request;
      await triageItem(octokit, owner, repo, it.number, isPR);
      console.log(`Triaged #${it.number}`);
    }
    return;
  }
  console.log('Usage: alex-ai triage --item <number> | --all');
  process.exit(1);
}

main().catch((e) => { console.error(e.message || String(e)); process.exit(1); });


