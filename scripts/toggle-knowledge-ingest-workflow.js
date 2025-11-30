#!/usr/bin/env node

/**
 * Toggle Knowledge Ingest Workflow via UI
 * 
 * Bypasses session/auth issues by logging in fresh
 * Targets only the "Knowledge Ingest" workflow
 */

const puppeteer = require('puppeteer');
const https = require('https');

const N8N_URL = process.env.N8N_URL || 'https://n8n.pbradygeorgen.com';
const N8N_EMAIL = process.env.N8N_EMAIL || process.env.N8N_USER_EMAIL;
const N8N_PASSWORD = process.env.N8N_PASSWORD || process.env.N8N_USER_PASSWORD;
const WORKFLOW_NAME = 'Knowledge Ingest (Crew Memories → Supabase RAG)';

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

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
      resolve({ status: res.statusCode, registered: res.statusCode !== 404 });
    });
    req.on('error', () => resolve({ status: 0, registered: false }));
    req.write(JSON.stringify({ test: true }));
    req.end();
  });
}

async function main() {
  console.log('\n🎯 Toggle Knowledge Ingest Workflow via UI\n');
  
  if (!N8N_EMAIL || !N8N_PASSWORD) {
    console.error('❌ N8N_EMAIL and N8N_PASSWORD required');
    console.log('\nAdd to ~/.zshrc:');
    console.log('export N8N_EMAIL="your-email@example.com"');
    console.log('export N8N_PASSWORD="your-password"');
    process.exit(1);
  }
  
  // Test webhook before
  console.log('🔍 Testing webhook before toggle...');
  const beforeTest = await testWebhook();
  console.log(`   Status: ${beforeTest.registered ? '✅ Registered' : '❌ Not registered'}\n`);
  
  console.log('🚀 Launching browser...');
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  const page = await browser.newPage();
  await page.setViewport({ width: 1920, height: 1080 });
  
  try {
    console.log(`🔗 Navigating to ${N8N_URL}...`);
    await page.goto(N8N_URL, { waitUntil: 'networkidle0', timeout: 60000 });
    await sleep(3000);
    
    // Check if login needed
    const needsLogin = await page.evaluate(() => {
      return document.querySelector('input[type="email"]') !== null;
    });
    
    if (needsLogin) {
      console.log('🔐 Logging in...');
      await page.type('input[type="email"]', N8N_EMAIL, { delay: 50 });
      await page.type('input[type="password"]', N8N_PASSWORD, { delay: 50 });
      await Promise.all([
        page.click('button[type="submit"]'),
        page.waitForNavigation({ waitUntil: 'networkidle0', timeout: 30000 })
      ]);
      await sleep(3000);
      console.log('✅ Logged in\n');
    } else {
      console.log('✅ Already authenticated\n');
    }
    
    // Navigate to workflows
    console.log('📋 Navigating to workflows...');
    await page.goto(`${N8N_URL}/home/workflows`, { waitUntil: 'networkidle0', timeout: 60000 });
    await sleep(5000);
    
    // Search for workflow
    console.log(`🔍 Searching for "${WORKFLOW_NAME}"...`);
    const searchInput = await page.$('input[placeholder*="Search"], input[type="search"]');
    if (searchInput) {
      await searchInput.click({ clickCount: 3 });
      await searchInput.type('Knowledge Ingest', { delay: 50 });
      await sleep(2000);
    }
    
    // Find workflow toggle
    console.log('🔄 Finding workflow toggle...');
    await sleep(3000);
    
    // Try to find the toggle button for this specific workflow
    const toggleFound = await page.evaluate((workflowName) => {
      // Find all workflow cards
      const cards = Array.from(document.querySelectorAll('[class*="workflow"], [class*="card"]'));
      
      for (const card of cards) {
        const text = card.textContent || '';
        if (text.includes(workflowName) || text.includes('Knowledge Ingest')) {
          // Find toggle within this card
          const toggle = card.querySelector('button[aria-label*="Activate"], button[aria-label*="Deactivate"], [class*="toggle"], [class*="switch"]');
          if (toggle) {
            toggle.scrollIntoView({ behavior: 'smooth', block: 'center' });
            return true;
          }
        }
      }
      return false;
    }, WORKFLOW_NAME);
    
    if (!toggleFound) {
      throw new Error('Could not find workflow toggle');
    }
    
    await sleep(2000);
    
    // Toggle OFF
    console.log('   Step 1: Toggling OFF...');
    await page.evaluate(() => {
      const cards = Array.from(document.querySelectorAll('[class*="workflow"], [class*="card"]'));
      for (const card of cards) {
        const text = card.textContent || '';
        if (text.includes('Knowledge Ingest')) {
          const toggle = card.querySelector('button[aria-label*="Activate"], button[aria-label*="Deactivate"], [class*="toggle"], [class*="switch"]');
          if (toggle && toggle.getAttribute('aria-label')?.includes('Deactivate')) {
            toggle.click();
            return true;
          }
        }
      }
      return false;
    });
    
    await sleep(5000);
    
    // Toggle ON
    console.log('   Step 2: Toggling ON...');
    await page.evaluate(() => {
      const cards = Array.from(document.querySelectorAll('[class*="workflow"], [class*="card"]'));
      for (const card of cards) {
        const text = card.textContent || '';
        if (text.includes('Knowledge Ingest')) {
          const toggle = card.querySelector('button[aria-label*="Activate"], button[aria-label*="Deactivate"], [class*="toggle"], [class*="switch"]');
          if (toggle && toggle.getAttribute('aria-label')?.includes('Activate')) {
            toggle.click();
            return true;
          }
        }
      }
      return false;
    });
    
    console.log('✅ Toggle complete\n');
    await sleep(30000); // Wait for webhook registration
    
    // Test webhook after
    console.log('🔍 Testing webhook after toggle...');
    const afterTest = await testWebhook();
    console.log(`   Status: ${afterTest.registered ? '✅ Registered' : '❌ Still not registered'}\n`);
    
    if (afterTest.registered) {
      console.log('🎉 SUCCESS! Webhook is now registered!\n');
    } else {
      console.log('⚠️  Webhook still not registered. May need more time or manual intervention.\n');
    }
    
  } catch (error) {
    console.error(`\n❌ Error: ${error.message}`);
    await page.screenshot({ path: '/tmp/n8n-toggle-error.png', fullPage: true });
    console.log('   Screenshot saved: /tmp/n8n-toggle-error.png\n');
  } finally {
    await browser.close();
  }
}

main().catch(error => {
  console.error('❌ Script failed:', error.message);
  process.exit(1);
});

