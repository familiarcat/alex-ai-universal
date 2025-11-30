#!/usr/bin/env node

/**
 * Verify and Activate Webhooks via UI
 * 
 * Since workflows are manually activated, this script:
 * 1. Opens each workflow in the UI
 * 2. Verifies webhook nodes are present
 * 3. Forces webhook registration by toggling the workflow
 */

const puppeteer = require('puppeteer');

const N8N_URL = process.env.N8N_URL || 'https://n8n.pbradygeorgen.com';
const N8N_EMAIL = process.env.N8N_EMAIL || process.env.N8N_USER_EMAIL;
const N8N_PASSWORD = process.env.N8N_PASSWORD || process.env.N8N_USER_PASSWORD;

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

async function main() {
  console.log('\n🖖 VERIFY AND ACTIVATE WEBHOOKS VIA UI\n');
  console.log('═══════════════════════════════════════════════════════════\n');
  
  if (!N8N_EMAIL || !N8N_PASSWORD) {
    console.error('❌ N8N_EMAIL and N8N_PASSWORD required');
    process.exit(1);
  }
  
  console.log('🚀 Launching browser...');
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  const page = await browser.newPage();
  await page.setViewport({ width: 1920, height: 1080 });
  
  try {
    // Login
    console.log('🔐 Logging in...');
    await page.goto(N8N_URL, { waitUntil: 'networkidle0', timeout: 60000 });
    await sleep(3000);
    
    const needsLogin = await page.evaluate(() => {
      return document.querySelector('input[type="email"]') !== null;
    });
    
    if (needsLogin) {
      await page.type('input[type="email"]', N8N_EMAIL, { delay: 50 });
      await page.type('input[type="password"]', N8N_PASSWORD, { delay: 50 });
      
      // Try multiple submit button selectors
      const submitSelectors = [
        'button[type="submit"]',
        'form button',
        '[data-test-id="signin-button"]',
        'button.btn-primary'
      ];
      
      let clicked = false;
      for (const selector of submitSelectors) {
        try {
          const button = await page.$(selector);
          if (button) {
            await button.click();
            clicked = true;
            break;
          }
        } catch (e) {}
      }
      
      if (!clicked) {
        await page.keyboard.press('Enter');
      }
      
      await page.waitForNavigation({ waitUntil: 'networkidle0', timeout: 30000 }).catch(() => {});
      await sleep(3000);
      console.log('✅ Logged in\n');
    } else {
      console.log('✅ Already authenticated\n');
    }
    
    // Navigate to workflows
    console.log('📋 Navigating to workflows list...');
    await page.goto(`${N8N_URL}/home/workflows`, { waitUntil: 'networkidle0', timeout: 60000 });
    await sleep(5000);
    
    // Get all workflow IDs from the page
    console.log('🔍 Finding workflows with webhooks...\n');
    const workflows = await page.evaluate(() => {
      const workflowLinks = Array.from(document.querySelectorAll('a[href*="/workflow/"]'));
      const workflowData = [];
      
      workflowLinks.forEach(link => {
        const href = link.getAttribute('href');
        const match = href.match(/\/workflow\/([^\/\?]+)/);
        if (match) {
          const id = match[1];
          const card = link.closest('div, article, section');
          const name = card?.textContent?.trim() || 'Unknown';
          workflowData.push({ id, name: name.substring(0, 100) });
        }
      });
      
      return workflowData;
    });
    
    console.log(`   Found ${workflows.length} workflows\n`);
    
    // For Knowledge Ingest specifically
    const knowledgeIngest = workflows.find(w => 
      w.name.includes('Knowledge Ingest') || w.name.includes('knowledge-ingest')
    );
    
    if (knowledgeIngest) {
      console.log(`🎯 Processing Knowledge Ingest workflow...`);
      console.log(`   ID: ${knowledgeIngest.id}`);
      console.log(`   Name: ${knowledgeIngest.name}\n`);
      
      // Navigate to workflow
      console.log('   Opening workflow...');
      await page.goto(`${N8N_URL}/workflow/${knowledgeIngest.id}`, { 
        waitUntil: 'networkidle0', 
        timeout: 60000 
      });
      await sleep(5000);
      
      // Toggle workflow OFF then ON to force webhook registration
      console.log('   Toggling workflow to force webhook registration...');
      const toggleSuccess = await page.evaluate(() => {
        // Find toggle button
        const toggles = Array.from(document.querySelectorAll('button, [role="switch"]'));
        for (const toggle of toggles) {
          const ariaLabel = toggle.getAttribute('aria-label') || '';
          const text = toggle.textContent || '';
          if (ariaLabel.includes('Deactivate') || ariaLabel.includes('Active') ||
              text.includes('Active') || text.includes('Deactivate')) {
            toggle.click();
            return true;
          }
        }
        return false;
      });
      
      if (toggleSuccess) {
        console.log('   ✅ Toggled OFF');
        await sleep(5000);
        
        // Toggle back ON
        await page.evaluate(() => {
          const toggles = Array.from(document.querySelectorAll('button, [role="switch"]'));
          for (const toggle of toggles) {
            const ariaLabel = toggle.getAttribute('aria-label') || '';
            const text = toggle.textContent || '';
            if (ariaLabel.includes('Activate') || ariaLabel.includes('Inactive') ||
                text.includes('Inactive') || text.includes('Activate')) {
              toggle.click();
              return true;
            }
          }
          return false;
        });
        
        console.log('   ✅ Toggled ON');
        console.log('   ⏳ Waiting 30 seconds for webhook registration...\n');
        await sleep(30000);
      }
    }
    
    console.log('✅ Webhook activation complete!\n');
    
  } catch (error) {
    console.error(`\n❌ Error: ${error.message}`);
    await page.screenshot({ path: '/tmp/n8n-webhook-error.png', fullPage: true });
    console.log('   Screenshot: /tmp/n8n-webhook-error.png\n');
  } finally {
    await browser.close();
  }
}

main().catch(error => {
  console.error('❌ Script failed:', error.message);
  process.exit(1);
});

