#!/usr/bin/env node

/**
 * Headless UI activator for n8n workflows.
 * Requires env: N8N_URL, N8N_UI_EMAIL, N8N_UI_PASSWORD
 */

const process = require('process');

async function main() {
  const workflowId = process.argv[2];
  if (!workflowId) {
    console.error('Usage: node scripts/n8n-activate-via-ui.js <workflowId>');
    process.exit(1);
  }
  const baseUrl = process.env.N8N_URL || process.env.N8N_BASE_URL || 'https://n8n.pbradygeorgen.com';
  const email = process.env.N8N_UI_EMAIL;
  const password = process.env.N8N_UI_PASSWORD;

  if (!email || !password) {
    console.error('❌ Missing N8N_UI_EMAIL or N8N_UI_PASSWORD in environment.');
    process.exit(2);
  }

  let puppeteer;
  try {
    puppeteer = require('puppeteer');
  } catch (e) {
    console.error('❌ Puppeteer not installed. Run: npm i -D puppeteer');
    process.exit(3);
  }

  const workflowUrl = `${baseUrl}/workflow/${workflowId}`;
  const loginUrl = `${baseUrl}/signin`;

  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  const page = await browser.newPage();
  page.setDefaultTimeout(30000);

  try {
    await page.goto(loginUrl, { waitUntil: 'networkidle2' });

    // If already logged in, n8n may redirect; try to detect email input
    const emailSelector = 'input[type="email"], input[name="email"]';
    const passSelector = 'input[type="password"], input[name="password"]';
    const submitSelector = 'button[type="submit"], button';

    const hasEmail = await page.$(emailSelector);
    if (hasEmail) {
      await page.type(emailSelector, email, { delay: 10 });
      await page.type(passSelector, password, { delay: 10 });
      await page.click(submitSelector);
      await page.waitForNavigation({ waitUntil: 'networkidle2' });
    }

    await page.goto(workflowUrl, { waitUntil: 'networkidle2' });

    // Toggle activation button (selector may vary by version)
    // Try common selectors/text
    const toggleSelectors = [
      'button[aria-label="Activate"]',
      'button:has-text("Activate")',
      'button[data-test-id="workflow-activate"]',
    ];

    let clicked = false;
    for (const sel of toggleSelectors) {
      const el = await page.$(sel);
      if (el) {
        await el.click();
        clicked = true;
        break;
      }
    }

    if (!clicked) {
      // Try toggler in header: active switch
      const switchSelector = 'div[role="switch"], .el-switch, .toggle-switch';
      const sw = await page.$(switchSelector);
      if (sw) {
        await sw.click();
        clicked = true;
      }
    }

    if (!clicked) {
      throw new Error('Activation control not found');
    }

    // Wait briefly for save
    await page.waitForTimeout(2000);
    console.log('✅ Workflow activation toggled via UI');
  } finally {
    await browser.close();
  }
}

if (require.main === module) {
  main().catch(err => {
    console.error('❌ UI activation failed:', err.message);
    process.exit(1);
  });
}

module.exports = {};


