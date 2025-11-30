#!/usr/bin/env node
'use strict';

/**
 * n8n-ui-snapshot.js
 * ------------------------------------------------------------
 * Captures a baseline set of screenshots of the current n8n UI.
 *
 * Flow:
 *   1. Fetch crew workflows via REST API (same credentials as other scripts).
 *   2. Launch Puppeteer headless Chromium, log into n8n.pbradygeorgen.com.
 *   3. Capture screenshots for:
 *        - Landing page after login
 *        - Workflows list
 *        - Each crew workflow editor (limited count configurable)
 *   4. Save images + metadata in reports/n8n-ui-snapshots/<timestamp>/
 *
 * These captures allow the crew to inspect DOM changes and update
 * automation selectors before attempting to toggle webhooks.
 */

const fs = require('node:fs');
const path = require('node:path');
const puppeteer = require('puppeteer');
const axios = require('axios');
const { loadCrewCredentials } = require('./utils/load-crew-credentials');

const OUTPUT_ROOT = path.join(process.cwd(), 'reports', 'n8n-ui-snapshots');
const MAX_WORKFLOWS = Number(process.env.N8N_UI_SNAPSHOT_COUNT || 10);
const NAVIGATION_TIMEOUT = Number(process.env.N8N_UI_NAVIGATION_TIMEOUT_MS || 90000);
const WAIT_AFTER_NAV_MS = Number(process.env.N8N_UI_WAIT_AFTER_NAV_MS || 8000);

async function ensureDirectory(dirPath) {
  await fs.promises.mkdir(dirPath, { recursive: true });
}

function logStep(message) {
  console.log(`\u001b[34m${message}\u001b[0m`);
}

function logSuccess(message) {
  console.log(`\u001b[32m${message}\u001b[0m`);
}

function logWarn(message) {
  console.log(`\u001b[33m${message}\u001b[0m`);
}

async function fetchCrewWorkflows(baseUrl, apiKey) {
  const response = await axios.get(`${baseUrl}/api/v1/workflows`, {
    headers: { 'X-N8N-API-KEY': apiKey },
    timeout: 30000,
  });

  const workflows = response.data?.data || [];
  return workflows.filter((wf) =>
    ['CREW -', 'COORDINATION -', 'SYSTEM -'].some((prefix) => (wf.name || '').startsWith(prefix))
  );
}

async function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function waitForAppReady(page) {
  await page.waitForFunction(
    () => document.readyState === 'complete' || document.readyState === 'interactive',
    { timeout: NAVIGATION_TIMEOUT }
  );
  await sleep(WAIT_AFTER_NAV_MS);
}

async function loginIfNeeded(page, email, password) {
  const url = page.url();
  if (!url.includes('/signin') && !url.includes('/login')) {
    return;
  }

  if (!email || !password) {
    throw new Error('Login required but N8N_EMAIL or N8N_PASSWORD not set in environment');
  }

  await page.type('input[type="email"]', email, { delay: 50 });
  await page.type('input[type="password"]', password, { delay: 35 });
      await Promise.all([
        page.click('button[type="submit"]'),
        page.waitForNavigation({ waitUntil: 'networkidle0', timeout: NAVIGATION_TIMEOUT }),
      ]);
  await waitForAppReady(page);
}

async function captureScreenshot(page, filePath) {
  await ensureDirectory(path.dirname(filePath));
  await page.screenshot({
    path: filePath,
    fullPage: true,
  });
}

async function main() {
  const creds = loadCrewCredentials();
  const baseUrl = creds.n8n?.baseUrl || 'https://n8n.pbradygeorgen.com';
  const apiKey = creds.n8n?.apiKey;
  const email = creds.n8n?.email;
  const password = creds.n8n?.password;

  if (!apiKey) {
    console.error('❌ Missing N8N_OWNER_API_KEY or N8N_API_KEY in environment.');
    process.exit(1);
  }

  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const outputDir = path.join(OUTPUT_ROOT, timestamp);
  await ensureDirectory(outputDir);

  logStep(`📂 Snapshot output directory: ${outputDir}`);

  logStep('🔍 Fetching crew workflows...');
  const crewWorkflows = await fetchCrewWorkflows(baseUrl, apiKey);
  logSuccess(`✅ Found ${crewWorkflows.length} crew/system workflows`);

  const workflowsToCapture = crewWorkflows.slice(0, MAX_WORKFLOWS);
  if (crewWorkflows.length > MAX_WORKFLOWS) {
    logWarn(`⚠️  Limiting captures to first ${MAX_WORKFLOWS} workflows. Override with N8N_UI_SNAPSHOT_COUNT.`);
  }

  logStep('🌐 Launching headless browser...');
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
    defaultViewport: { width: 1600, height: 900 },
  });

  const page = await browser.newPage();
  page.setDefaultNavigationTimeout(NAVIGATION_TIMEOUT);

  try {
    // Landing page
    logStep(`🔗 Navigating to ${baseUrl} ...`);
    await page.goto(baseUrl, { waitUntil: 'domcontentloaded' });
    await waitForAppReady(page);
    await loginIfNeeded(page, email, password);

    const landingPath = path.join(outputDir, 'landing.png');
    await captureScreenshot(page, landingPath);
    logSuccess(`📸 Landing page captured -> ${landingPath}`);

    // Workflows list
    const workflowsUrl = `${baseUrl}/workflows`;
    logStep(`🔗 Navigating to workflows list: ${workflowsUrl}`);
    await page.goto(workflowsUrl, { waitUntil: 'domcontentloaded' });
    await waitForAppReady(page);
    const listPath = path.join(outputDir, 'workflows-list.png');
    await captureScreenshot(page, listPath);
    logSuccess(`📸 Workflows list captured -> ${listPath}`);

    const metadata = [];

    // Individual workflows
    for (const wf of workflowsToCapture) {
      const workflowUrl = `${baseUrl}/workflow/${wf.id}`;
      logStep(`🔗 Navigating to workflow: ${wf.name} (${wf.id})`);
      await page.goto(workflowUrl, { waitUntil: 'domcontentloaded' });
      await waitForAppReady(page);

      const safeName = wf.name.replace(/[^\w\d-]+/g, '_').slice(0, 120);
      const filename = `${safeName || wf.id}.png`;
      const filePath = path.join(outputDir, 'workflows', filename);
      await captureScreenshot(page, filePath);
      logSuccess(`📸 Captured workflow -> ${filePath}`);

      const active = await page.evaluate(() => {
        const toggle = document.querySelector('[data-test-id="workflow-activate-switch"]');
        if (!toggle) return null;
        const ariaPressed = toggle.getAttribute('aria-pressed');
        return ariaPressed === 'true';
      });

      metadata.push({
        id: wf.id,
        name: wf.name,
        active: wf.active,
        detectedActiveState: active,
        screenshot: path.relative(process.cwd(), filePath),
        url: workflowUrl,
      });
    }

    // Save metadata JSON
    const metaPath = path.join(outputDir, 'metadata.json');
    await fs.promises.writeFile(metaPath, JSON.stringify({ timestamp, workflows: metadata }, null, 2));
    logSuccess(`📝 Metadata written -> ${metaPath}`);

  } catch (error) {
    console.error(`❌ Capture failed: ${error.message}`);
    console.error(error);
    process.exitCode = 1;
  } finally {
    await browser.close();
    logStep('🌐 Browser closed');
  }
}

if (require.main === module) {
  main().catch((error) => {
    console.error(`❌ Unexpected error: ${error.message}`);
    process.exit(1);
  });
}


