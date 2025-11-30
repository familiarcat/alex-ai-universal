#!/usr/bin/env node

/**
 * 🤖 Ensure RAG Webhook Active (With UI Fallback)
 * 
 * Comprehensive automation that:
 * 1. Tries API activation first (fast)
 * 2. Falls back to UI automation if API fails (reliable)
 * 3. Verifies webhook registration
 * 4. Provides clear status
 */

const https = require('https');
const { loadCrewCredentials } = require('./utils/load-crew-credentials');
const { retryWithBackoff, formatErrorMessage } = require('./utils/test-helpers');

const creds = loadCrewCredentials();
const N8N_URL = creds.n8n.baseUrl || 'https://n8n.pbradygeorgen.com';
const N8N_API_KEY = creds.n8n.apiKey;
const WORKFLOW_ID = 'c0HYTqTFtktCE3Fk';
const WEBHOOK_PATH = 'ingest-knowledge';

console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('🤖 ENSURE RAG WEBHOOK ACTIVE (WITH UI FALLBACK)');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
console.log('📋 Strategy: Try API first, fallback to UI automation\n');

function makeApiRequest(method, path, data = null) {
  return new Promise((resolve, reject) => {
    const url = new URL(path, N8N_URL);
    const options = {
      hostname: url.hostname,
      port: 443,
      path: url.pathname,
      method: method,
      headers: {
        'X-N8N-API-KEY': N8N_API_KEY,
        'Content-Type': 'application/json',
      },
      timeout: 15000
    };

    const req = https.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => { body += chunk; });
      res.on('end', () => {
        try {
          const json = JSON.parse(body);
          resolve({ status: res.statusCode, data: json, body: body });
        } catch (e) {
          resolve({ status: res.statusCode, data: body, body: body });
        }
      });
    });

    req.on('error', reject);
    req.on('timeout', () => {
      req.destroy();
      reject(new Error('Request timeout'));
    });

    if (data) {
      req.write(JSON.stringify(data));
    }
    req.end();
  });
}

async function testWebhook(webhookPath) {
  return new Promise((resolve) => {
    const url = new URL(`/webhook/${webhookPath}`, N8N_URL);
    const req = https.request({
      hostname: url.hostname,
      port: 443,
      path: url.pathname,
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      timeout: 10000
    }, (res) => {
      let body = '';
      res.on('data', (chunk) => { body += chunk; });
      res.on('end', () => {
        resolve({
          status: res.statusCode,
          registered: res.statusCode !== 404,
          body: body
        });
      });
    });

    req.on('error', () => resolve({ status: 0, registered: false }));
    req.on('timeout', () => {
      req.destroy();
      resolve({ status: 0, registered: false });
    });

    req.write(JSON.stringify({ test: true, timestamp: Date.now() }));
    req.end();
  });
}

async function tryApiActivation() {
  console.log('📡 Attempting API activation...');
  try {
    // Get workflow status
    const workflowResponse = await makeApiRequest('GET', `/api/v1/workflows/${WORKFLOW_ID}`);
    const workflow = workflowResponse.data.data || workflowResponse.data;

    // Deactivate
    if (workflow.active) {
      await makeApiRequest('POST', `/api/v1/workflows/${WORKFLOW_ID}/deactivate`);
      await new Promise(resolve => setTimeout(resolve, 5000));
    }

    // Activate
    await makeApiRequest('POST', `/api/v1/workflows/${WORKFLOW_ID}/activate`);
    console.log('   ✅ API activation sent\n');

    // Wait and test
    console.log('   ⏳ Waiting 60 seconds for webhook registration...');
    await new Promise(resolve => setTimeout(resolve, 60000));

    const test = await testWebhook(WEBHOOK_PATH);
    return test.registered;
  } catch (error) {
    console.log(`   ❌ API activation failed: ${error.message}\n`);
    return false;
  }
}

async function tryUIAutomation() {
  console.log('🖥️  Attempting UI automation (Puppeteer)...');
  
  const N8N_EMAIL = process.env.N8N_EMAIL || process.env.N8N_USER_EMAIL;
  const N8N_PASSWORD = process.env.N8N_PASSWORD || process.env.N8N_USER_PASSWORD;

  if (!N8N_EMAIL || !N8N_PASSWORD) {
    console.log('   ⚠️  UI credentials not found (N8N_EMAIL, N8N_PASSWORD)\n');
    console.log('   💡 Add to ~/.zshrc:');
    console.log('      export N8N_EMAIL="your-email@example.com"');
    console.log('      export N8N_PASSWORD="your-password"\n');
    return false;
  }

  try {
    const puppeteer = require('puppeteer');
    const browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    const page = await browser.newPage();
    await page.setViewport({ width: 1920, height: 1080 });

    // Login
    console.log('   🔐 Checking authentication...');
    await page.goto(N8N_URL, { waitUntil: 'networkidle0', timeout: 60000 });
    await new Promise(resolve => setTimeout(resolve, 5000));

    // Check if already logged in or needs login
    const needsLogin = await page.evaluate(() => {
      const emailInput = document.querySelector('input[type="email"]') || 
                        document.querySelector('input[name="email"]') ||
                        document.querySelector('#email');
      return emailInput !== null;
    });

    if (needsLogin) {
      console.log('   🔑 Logging in...');
      // Try multiple selectors for email input
      const emailSelectors = [
        'input[type="email"]',
        'input[name="email"]',
        '#email',
        'input[placeholder*="email" i]'
      ];
      
      let emailInput = null;
      for (const selector of emailSelectors) {
        try {
          emailInput = await page.$(selector);
          if (emailInput) break;
        } catch (e) {
          // Continue
        }
      }

      if (emailInput) {
        await emailInput.type(N8N_EMAIL, { delay: 50 });
      } else {
        throw new Error('Could not find email input field');
      }

      // Try multiple selectors for password input
      const passwordSelectors = [
        'input[type="password"]',
        'input[name="password"]',
        '#password',
        'input[placeholder*="password" i]'
      ];
      
      let passwordInput = null;
      for (const selector of passwordSelectors) {
        try {
          passwordInput = await page.$(selector);
          if (passwordInput) break;
        } catch (e) {
          // Continue
        }
      }

      if (passwordInput) {
        await passwordInput.type(N8N_PASSWORD, { delay: 50 });
      } else {
        throw new Error('Could not find password input field');
      }

      // Try multiple selectors for submit button
      const submitSelectors = [
        'button[type="submit"]',
        'button:has-text("Sign in")',
        'button:has-text("Login")',
        'button:has-text("Log in")',
        'form button',
        'button.btn-primary',
        'button.primary'
      ];

      let submitted = false;
      for (const selector of submitSelectors) {
        try {
          const button = await page.$(selector);
          if (button) {
            await Promise.all([
              button.click(),
              page.waitForNavigation({ waitUntil: 'networkidle0', timeout: 30000 }).catch(() => {})
            ]);
            submitted = true;
            break;
          }
        } catch (e) {
          // Continue
        }
      }

      if (!submitted) {
        // Try clicking any button in a form
        await page.evaluate(() => {
          const form = document.querySelector('form');
          if (form) {
            const button = form.querySelector('button');
            if (button) button.click();
          }
        });
      }

      await new Promise(resolve => setTimeout(resolve, 5000));
      console.log('   ✅ Login attempt complete\n');
    } else {
      console.log('   ✅ Already authenticated\n');
    }

    // Navigate to workflow
    console.log('   📋 Navigating to workflow...');
    await page.goto(`${N8N_URL}/workflow/${WORKFLOW_ID}`, { waitUntil: 'networkidle0', timeout: 60000 });
    await new Promise(resolve => setTimeout(resolve, 5000));

    // Toggle OFF
    console.log('   📴 Toggling OFF...');
    await page.evaluate(() => {
      const selectors = [
        'button[data-test-id="workflow-activate-switch"]',
        'button[aria-label*="Deactivate"]',
        '.workflow-activator button',
        'button.workflow-activate-toggle'
      ];
      for (const selector of selectors) {
        const button = document.querySelector(selector);
        if (button && button.getAttribute('aria-label')?.includes('Deactivate')) {
          button.click();
          return true;
        }
      }
      return false;
    });
    await new Promise(resolve => setTimeout(resolve, 5000));

    // Toggle ON
    console.log('   📡 Toggling ON...');
    await page.evaluate(() => {
      const selectors = [
        'button[data-test-id="workflow-activate-switch"]',
        'button[aria-label*="Activate"]',
        '.workflow-activator button',
        'button.workflow-activate-toggle'
      ];
      for (const selector of selectors) {
        const button = document.querySelector(selector);
        if (button) {
          button.click();
          return true;
        }
      }
      return false;
    });

    await browser.close();
    console.log('   ✅ UI toggle complete\n');

    // Wait for webhook registration
    console.log('   ⏳ Waiting 60 seconds for webhook registration...');
    await new Promise(resolve => setTimeout(resolve, 60000));

    const test = await testWebhook(WEBHOOK_PATH);
    return test.registered;
  } catch (error) {
    console.log(`   ❌ UI automation failed: ${error.message}\n`);
    return false;
  }
}

async function main() {
  // Test current status
  console.log('🔍 Checking current webhook status...');
  const initialTest = await testWebhook(WEBHOOK_PATH);
  console.log(`   Status: ${initialTest.status} (${initialTest.registered ? '✅ Registered' : '❌ Not Registered'})\n`);

  if (initialTest.registered) {
    console.log('✅ Webhook is already registered! No action needed.\n');
    process.exit(0);
  }

  // Try API first
  const apiSuccess = await tryApiActivation();
  if (apiSuccess) {
    console.log('🎉 SUCCESS: API activation registered webhook!\n');
    process.exit(0);
  }

  // Fallback to UI automation
  console.log('⚠️  API activation did not register webhook. Trying UI automation...\n');
  const uiSuccess = await tryUIAutomation();
  if (uiSuccess) {
    console.log('🎉 SUCCESS: UI automation registered webhook!\n');
    process.exit(0);
  }

  // Final status
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('📊 FINAL STATUS');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  const finalTest = await testWebhook(WEBHOOK_PATH);
  if (finalTest.registered) {
    console.log('✅ SUCCESS: Webhook is now registered!\n');
    process.exit(0);
  }

  console.log('❌ Both API and UI automation failed.\n');
  console.log('💡 Manual intervention required:');
  console.log('   1. Visit: https://n8n.pbradygeorgen.com');
  console.log('   2. Open workflow: "Alex AI Knowledge Base RAG Ingestion"');
  console.log('   3. Toggle activation switch (top-right)');
  console.log('   4. Wait 60 seconds\n');

  process.exit(1);
}

main().catch(error => {
  console.error('\n❌ Script failed:', error.message);
  process.exit(1);
});

