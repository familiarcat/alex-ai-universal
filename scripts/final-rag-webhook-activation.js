#!/usr/bin/env node

/**
 * 🎯 Final RAG Webhook Activation
 * 
 * Last attempt using all methods:
 * 1. Verify workflow is active
 * 2. Check webhook node configuration
 * 3. Try UI automation with improved selectors
 * 4. Extended wait times
 * 5. Multiple verification attempts
 */

const https = require('https');
const puppeteer = require('puppeteer');
const { loadCrewCredentials } = require('./utils/load-crew-credentials');
const { retryWithBackoff } = require('./utils/test-helpers');

const creds = loadCrewCredentials();
const N8N_URL = creds.n8n.baseUrl || 'https://n8n.pbradygeorgen.com';
const N8N_API_KEY = creds.n8n.apiKey;
const WORKFLOW_ID = 'c0HYTqTFtktCE3Fk';
const WEBHOOK_PATH = 'ingest-knowledge';
const N8N_EMAIL = process.env.N8N_EMAIL || process.env.N8N_USER_EMAIL;
const N8N_PASSWORD = process.env.N8N_PASSWORD || process.env.N8N_USER_PASSWORD;

console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('🎯 FINAL RAG WEBHOOK ACTIVATION');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

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

async function uiToggleWorkflow() {
  if (!N8N_EMAIL || !N8N_PASSWORD) {
    throw new Error('N8N_EMAIL and N8N_PASSWORD required for UI automation');
  }

  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1920, height: 1080 });

  try {
    // Navigate and login
    console.log('🔐 Authenticating...');
    await page.goto(N8N_URL, { waitUntil: 'networkidle0', timeout: 60000 });
    await new Promise(resolve => setTimeout(resolve, 5000));

    const needsLogin = await page.evaluate(() => {
      return document.querySelector('input[type="email"]') !== null ||
             document.querySelector('input[name="email"]') !== null;
    });

    if (needsLogin) {
      await page.evaluate((email, password) => {
        const emailInput = document.querySelector('input[type="email"]') || 
                          document.querySelector('input[name="email"]');
        const passwordInput = document.querySelector('input[type="password"]') || 
                             document.querySelector('input[name="password"]');
        const submitButton = document.querySelector('button[type="submit"]') ||
                            document.querySelector('form button');

        if (emailInput) emailInput.value = email;
        if (passwordInput) passwordInput.value = password;
        if (submitButton) submitButton.click();
      }, N8N_EMAIL, N8N_PASSWORD);

      await new Promise(resolve => setTimeout(resolve, 5000));
    }

    // Navigate directly to workflow
    console.log('📋 Navigating to workflow...');
    await page.goto(`${N8N_URL}/workflow/${WORKFLOW_ID}`, { waitUntil: 'networkidle0', timeout: 60000 });
    await new Promise(resolve => setTimeout(resolve, 8000));

    // Find and toggle activation switch
    console.log('🔄 Toggling workflow activation...');
    
    const toggleSuccess = await page.evaluate(() => {
      // Try multiple selectors
      const selectors = [
        'button[data-test-id="workflow-activate-switch"]',
        'button[aria-label*="Activate"]',
        'button[aria-label*="Deactivate"]',
        '.workflow-activator button',
        'button.workflow-activate-toggle',
        '[class*="toggle"] button',
        '[class*="switch"] button'
      ];

      for (const selector of selectors) {
        const button = document.querySelector(selector);
        if (button) {
          // Toggle OFF first if active
          const isActive = button.getAttribute('aria-label')?.includes('Deactivate') ||
                          button.getAttribute('aria-pressed') === 'true';
          if (isActive) {
            button.click();
            return 'deactivated';
          }
          // Then toggle ON
          button.click();
          return 'toggled';
        }
      }

      // Fallback: find any toggle-like element
      const allButtons = Array.from(document.querySelectorAll('button'));
      for (const button of allButtons) {
        const ariaLabel = button.getAttribute('aria-label') || '';
        const text = button.textContent || '';
        if (ariaLabel.includes('Active') || ariaLabel.includes('Inactive') ||
            text.includes('Active') || text.includes('Inactive')) {
          button.click();
          return 'toggled';
        }
      }

      return null;
    });

    if (!toggleSuccess) {
      throw new Error('Could not find toggle button');
    }

    console.log(`   ✅ Toggle ${toggleSuccess}\n`);

    // Wait between toggle OFF and ON
    if (toggleSuccess === 'deactivated') {
      await new Promise(resolve => setTimeout(resolve, 5000));
      
      // Toggle ON
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
      console.log('   ✅ Toggled ON\n');
    }

    await browser.close();
    return true;
  } catch (error) {
    await browser.close();
    throw error;
  }
}

async function main() {
  // Step 1: Verify workflow status
  console.log('🔍 Step 1: Verifying workflow status...');
  const workflowResponse = await makeApiRequest('GET', `/api/v1/workflows/${WORKFLOW_ID}`);
  const workflow = workflowResponse.data.data || workflowResponse.data;
  console.log(`   Workflow: ${workflow.name}`);
  console.log(`   Active: ${workflow.active ? 'Yes' : 'No'}\n`);

  // Step 2: Test current webhook
  console.log('🧪 Step 2: Testing current webhook...');
  const initialTest = await testWebhook(WEBHOOK_PATH);
  console.log(`   Status: ${initialTest.status} (${initialTest.registered ? '✅ Registered' : '❌ Not Registered'})\n`);

  if (initialTest.registered) {
    console.log('✅ Webhook is already registered!\n');
    process.exit(0);
  }

  // Step 3: UI Toggle
  console.log('🔄 Step 3: Performing UI toggle...');
  try {
    await uiToggleWorkflow();
    console.log('✅ UI toggle complete\n');
  } catch (error) {
    console.log(`❌ UI toggle failed: ${error.message}\n`);
    process.exit(1);
  }

  // Step 4: Extended wait and multiple tests
  console.log('⏳ Step 4: Waiting for webhook registration (90 seconds)...');
  for (let i = 0; i < 18; i++) {
    await new Promise(resolve => setTimeout(resolve, 5000));
    process.stdout.write(`   ${i + 1}/18... `);
    
    const test = await testWebhook(WEBHOOK_PATH);
    if (test.registered) {
      console.log(`\n   ✅ Webhook registered! (Status: ${test.status})\n`);
      
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log('🎉 SUCCESS: RAG WEBHOOK IS NOW OPERATIONAL!');
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
      console.log(`Webhook URL: ${N8N_URL}/webhook/${WEBHOOK_PATH}`);
      console.log(`Status: ${test.status}\n`);
      console.log('✅ RAG ingestion is ready!\n');
      process.exit(0);
    }
  }
  console.log('\n');

  // Final test with retry
  console.log('🧪 Step 5: Final verification with retry logic...');
  const finalTest = await retryWithBackoff(
    () => testWebhook(WEBHOOK_PATH),
    {
      maxRetries: 5,
      initialDelay: 5000,
      retryableErrors: [404, 429, 500],
      onRetry: (attempt, maxRetries, delay) => {
        console.log(`   ⏳ Retry ${attempt}/${maxRetries} after ${delay/1000}s...`);
      }
    }
  );

  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('📊 FINAL STATUS');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  if (finalTest.registered) {
    console.log('✅ SUCCESS: Webhook is registered!');
    console.log(`   Status: ${finalTest.status}\n`);
    process.exit(0);
  }

  console.log('⚠️  Webhook still not registered after all attempts');
  console.log(`   Status: ${finalTest.status}\n`);
  console.log('💡 This may require manual verification in n8n UI.\n');
  console.log('📋 Next Steps:');
  console.log('   1. Visit: https://n8n.pbradygeorgen.com');
  console.log('   2. Check workflow executions for webhook registration');
  console.log('   3. Review n8n logs: docker logs n8n | grep -i webhook');
  console.log('   4. Verify webhook node is not disabled\n');

  process.exit(1);
}

main().catch(error => {
  console.error('\n❌ Script failed:', error.message);
  process.exit(1);
});

