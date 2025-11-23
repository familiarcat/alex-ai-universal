#!/usr/bin/env node

/**
 * 🖖 CREW-COORDINATED N8N WEBHOOK FIX
 * 
 * Full crew coordination to solve n8n webhook registration issues
 * 
 * Crew Members Involved:
 * - 🎖️ Captain Picard: Strategic oversight
 * - ⚡ Commander Riker: Tactical execution
 * - 🤖 Commander Data: Technical analysis
 * - 🔧 Lt. Cmdr. La Forge: Infrastructure troubleshooting
 * - ⚔️ Lt. Worf: Security validation
 * - 🛠️ Chief O'Brien: Pragmatic automation
 */

const puppeteer = require('puppeteer');
const https = require('https');
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const N8N_URL = process.env.N8N_URL || 'https://n8n.pbradygeorgen.com';
const N8N_EMAIL = process.env.N8N_EMAIL || process.env.N8N_USER_EMAIL;
const N8N_PASSWORD = process.env.N8N_PASSWORD || process.env.N8N_USER_PASSWORD;
const WORKFLOW_NAME = 'Knowledge Ingest (Crew Memories → Supabase RAG)';
const WORKFLOW_ID = 'Ffdgv5Zd8hGeHJGe';

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Colors for crew reports
const crew = {
  picard: (msg) => console.log(`\n🎖️  Captain Picard: ${msg}`),
  riker: (msg) => console.log(`⚡ Commander Riker: ${msg}`),
  data: (msg) => console.log(`🤖 Commander Data: ${msg}`),
  laforge: (msg) => console.log(`🔧 Lt. Cmdr. La Forge: ${msg}`),
  worf: (msg) => console.log(`⚔️  Lt. Worf: ${msg}`),
  obrien: (msg) => console.log(`🛠️  Chief O'Brien: ${msg}`),
};

function loadCredentialsFromZshrc() {
  try {
    const zshrcPath = path.join(process.env.HOME, '.zshrc');
    const content = fs.readFileSync(zshrcPath, 'utf8');
    
    const emailMatch = content.match(/export N8N_EMAIL=['"]?([^'"\n]+)['"]?/);
    const passwordMatch = content.match(/export N8N_PASSWORD=['"]?([^'"\n]+)['"]?/);
    
    return {
      email: emailMatch ? emailMatch[1] : null,
      password: passwordMatch ? passwordMatch[1] : null,
    };
  } catch (error) {
    return { email: null, password: null };
  }
}

async function testWebhook() {
  return new Promise((resolve) => {
    const req = https.request({
      hostname: 'n8n.pbradygeorgen.com',
      port: 443,
      path: '/webhook/knowledge-ingest',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      timeout: 5000
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
    req.on('error', () => resolve({ status: 0, registered: false, body: '' }));
    req.write(JSON.stringify({ test: true }));
    req.end();
  });
}

async function tryApiToggle() {
  crew.riker('Attempting API-based workflow toggle...');
  
  try {
    const apiKey = process.env.N8N_OWNER_API_KEY || process.env.N8N_API_KEY;
    if (!apiKey) {
      crew.riker('⚠️  No API key available, skipping API toggle');
      return false;
    }
    
    // Deactivate
    const deactivateRes = await new Promise((resolve) => {
      const req = https.request({
        hostname: 'n8n.pbradygeorgen.com',
        port: 443,
        path: `/api/v1/workflows/${WORKFLOW_ID}/deactivate`,
        method: 'POST',
        headers: { 'X-N8N-API-KEY': apiKey },
        timeout: 10000
      }, (res) => {
        let body = '';
        res.on('data', (chunk) => { body += chunk; });
        res.on('end', () => resolve({ status: res.statusCode, body }));
      });
      req.on('error', () => resolve({ status: 0, body: '' }));
      req.end();
    });
    
    if (deactivateRes.status === 200 || deactivateRes.status === 401) {
      await sleep(3000);
      
      // Activate
      const activateRes = await new Promise((resolve) => {
        const req = https.request({
          hostname: 'n8n.pbradygeorgen.com',
          port: 443,
          path: `/api/v1/workflows/${WORKFLOW_ID}/activate`,
          method: 'POST',
          headers: { 'X-N8N-API-KEY': apiKey },
          timeout: 10000
        }, (res) => {
          let body = '';
          res.on('data', (chunk) => { body += chunk; });
          res.on('end', () => resolve({ status: res.statusCode, body }));
        });
        req.on('error', () => resolve({ status: 0, body: '' }));
        req.end();
      });
      
      if (activateRes.status === 200) {
        crew.riker('✅ API toggle successful');
        await sleep(30000);
        return true;
      } else if (activateRes.status === 401) {
        crew.worf('⚠️  API key unauthorized - will use UI automation');
      }
    }
  } catch (error) {
    crew.data(`API toggle failed: ${error.message}`);
  }
  
  return false;
}

async function uiToggle(email, password) {
  crew.obrien('Launching UI automation (pragmatic solution)...');
  
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  const page = await browser.newPage();
  await page.setViewport({ width: 1920, height: 1080 });
  
  try {
    crew.laforge(`Navigating to ${N8N_URL}...`);
    await page.goto(N8N_URL, { waitUntil: 'networkidle0', timeout: 60000 });
    await sleep(3000);
    
    // Check if login needed
    const needsLogin = await page.evaluate(() => {
      return document.querySelector('input[type="email"]') !== null;
    });
    
    if (needsLogin) {
      crew.picard('🔐 Authentication required - logging in...');
      await page.type('input[type="email"]', email, { delay: 50 });
      await page.type('input[type="password"]', password, { delay: 50 });
      await Promise.all([
        page.click('button[type="submit"]'),
        page.waitForNavigation({ waitUntil: 'networkidle0', timeout: 30000 })
      ]);
      await sleep(3000);
      crew.picard('✅ Authentication successful');
    } else {
      crew.picard('✅ Already authenticated');
    }
    
    // Navigate to workflows
    crew.riker('📋 Navigating to workflows page...');
    await page.goto(`${N8N_URL}/home/workflows`, { waitUntil: 'networkidle0', timeout: 60000 });
    await sleep(5000);
    
    // Search for workflow
    crew.data(`🔍 Searching for "${WORKFLOW_NAME}"...`);
    try {
      const searchInput = await page.$('input[placeholder*="Search"], input[type="search"], input[aria-label*="Search"]');
      if (searchInput) {
        await searchInput.click({ clickCount: 3 });
        await searchInput.type('Knowledge Ingest', { delay: 50 });
        await sleep(3000);
      }
    } catch (e) {
      crew.data('⚠️  Search input not found, continuing...');
    }
    
    // Find and toggle workflow
    crew.obrien('🔄 Finding workflow toggle...');
    await sleep(3000);
    
    // Try multiple strategies to find the toggle
    const toggleSuccess = await page.evaluate((workflowName) => {
      // Strategy 1: Find by workflow name in card
      const cards = Array.from(document.querySelectorAll('div, article, section')).filter(el => {
        const text = el.textContent || '';
        return text.includes(workflowName) || (text.includes('Knowledge Ingest') && text.includes('Supabase'));
      });
      
      for (const card of cards) {
        // Look for toggle button
        const toggles = card.querySelectorAll('button, [role="switch"], [class*="toggle"], [class*="switch"]');
        for (const toggle of toggles) {
          const ariaLabel = toggle.getAttribute('aria-label') || '';
          const text = toggle.textContent || '';
          if (ariaLabel.includes('Activate') || ariaLabel.includes('Deactivate') || 
              ariaLabel.includes('Active') || ariaLabel.includes('Inactive') ||
              text.includes('Active') || text.includes('Inactive')) {
            toggle.scrollIntoView({ behavior: 'smooth', block: 'center' });
            return { found: true, element: 'toggle' };
          }
        }
      }
      
      // Strategy 2: Find by data attributes
      const dataToggle = document.querySelector('[data-test-id*="workflow"], [data-test-id*="toggle"], [data-test-id*="activate"]');
      if (dataToggle) {
        dataToggle.scrollIntoView({ behavior: 'smooth', block: 'center' });
        return { found: true, element: 'data-attr' };
      }
      
      return { found: false };
    }, WORKFLOW_NAME);
    
    if (!toggleSuccess.found) {
      throw new Error('Could not locate workflow toggle button');
    }
    
    await sleep(2000);
    
    // Toggle OFF
    crew.riker('   Step 1: Deactivating workflow...');
    const deactivated = await page.evaluate(() => {
      const cards = Array.from(document.querySelectorAll('div, article, section')).filter(el => {
        const text = el.textContent || '';
        return text.includes('Knowledge Ingest') && text.includes('Supabase');
      });
      
      for (const card of cards) {
        const toggles = card.querySelectorAll('button, [role="switch"]');
        for (const toggle of toggles) {
          const ariaLabel = toggle.getAttribute('aria-label') || '';
          if (ariaLabel.includes('Deactivate') || ariaLabel.includes('Active')) {
            toggle.click();
            return true;
          }
        }
      }
      return false;
    });
    
    if (deactivated) {
      crew.riker('   ✅ Deactivated');
      await sleep(5000);
    }
    
    // Toggle ON
    crew.riker('   Step 2: Activating workflow...');
    const activated = await page.evaluate(() => {
      const cards = Array.from(document.querySelectorAll('div, article, section')).filter(el => {
        const text = el.textContent || '';
        return text.includes('Knowledge Ingest') && text.includes('Supabase');
      });
      
      for (const card of cards) {
        const toggles = card.querySelectorAll('button, [role="switch"]');
        for (const toggle of toggles) {
          const ariaLabel = toggle.getAttribute('aria-label') || '';
          if (ariaLabel.includes('Activate') || ariaLabel.includes('Inactive')) {
            toggle.click();
            return true;
          }
        }
      }
      return false;
    });
    
    if (activated) {
      crew.riker('   ✅ Activated');
      crew.laforge('⏳ Waiting 30 seconds for webhook registration...');
      await sleep(30000);
      return true;
    } else {
      throw new Error('Could not activate workflow');
    }
    
  } catch (error) {
    crew.obrien(`❌ UI automation error: ${error.message}`);
    await page.screenshot({ path: '/tmp/n8n-toggle-error.png', fullPage: true });
    crew.data('   Screenshot saved: /tmp/n8n-toggle-error.png');
    throw error;
  } finally {
    await browser.close();
  }
}

async function main() {
  console.log('\n╔════════════════════════════════════════════════════════════════════════╗');
  console.log('║                                                                        ║');
  console.log('║   🖖 CREW-COORDINATED N8N WEBHOOK FIX                                  ║');
  console.log('║                                                                        ║');
  console.log('║   "Make it so" - Captain Picard                                       ║');
  console.log('╚════════════════════════════════════════════════════════════════════════╝\n');
  
  crew.picard('Mission: Register Knowledge Ingest webhook to enable milestone pushes');
  crew.data('Analyzing current state...\n');
  
  // Test webhook before
  const beforeTest = await testWebhook();
  crew.data(`Initial webhook status: ${beforeTest.registered ? '✅ Registered' : '❌ Not registered'}`);
  
  if (beforeTest.registered) {
    crew.picard('✅ Webhook is already registered! Mission accomplished.');
    return;
  }
  
  // Load credentials - TOP SECRET
  crew.worf('🔐 Validating credentials (CLASSIFIED - no logging)...');
  const creds = loadCredentialsFromZshrc();
  const email = N8N_EMAIL || creds.email;
  const password = N8N_PASSWORD || creds.password;
  
  if (!email || !password) {
    crew.worf('❌ N8N_EMAIL and N8N_PASSWORD required');
    console.log('\n📋 Add to ~/.zshrc:');
    console.log('export N8N_EMAIL="your-email@example.com"');
    console.log('export N8N_PASSWORD="your-password"');
    console.log('\nThen run: source ~/.zshrc');
    process.exit(1);
  }
  
  // Security: Only show partial email, never password
  const emailPreview = email.substring(0, 3) + '***@***';
  crew.worf(`✅ Credentials validated (${emailPreview} - password hidden)`);
  crew.picard('⚠️  SECURITY PROTOCOL: Credentials are CLASSIFIED - no logging or exposure');
  
  // Try API first (faster)
  crew.riker('Attempting API toggle (fastest method)...');
  const apiSuccess = await tryApiToggle();
  
  if (!apiSuccess) {
    // Fall back to UI automation
    crew.obrien('API toggle unavailable - using UI automation (pragmatic fallback)');
    await uiToggle(email, password);
  }
  
  // Test webhook after
  crew.laforge('🔍 Verifying webhook registration...');
  const afterTest = await testWebhook();
  
  if (afterTest.registered) {
    crew.picard('🎉 SUCCESS! Webhook is now registered!');
    crew.riker('✅ Mission accomplished - milestone push should now work');
    console.log('\n🚀 Next step: Run milestone push script\n');
  } else {
    crew.data(`⚠️  Webhook status: ${afterTest.status} - ${afterTest.body.substring(0, 100)}`);
    crew.obrien('Webhook still not registered. May need:');
    crew.obrien('  1. More time (n8n can take up to 2 minutes)');
    crew.obrien('  2. Manual toggle in UI');
    crew.obrien('  3. Check WEBHOOK_URL environment variable on EC2');
    console.log('\n');
  }
}

main().catch(error => {
  crew.picard(`❌ Mission failed: ${error.message}`);
  process.exit(1);
});

