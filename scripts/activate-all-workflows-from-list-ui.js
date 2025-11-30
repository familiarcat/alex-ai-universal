#!/usr/bin/env node

/**
 * Activate All Workflows from List Page (UI Automation)
 * 
 * Simpler approach: Activates workflows directly from the workflows list
 * without opening each workflow individually
 * 
 * Chief O'Brien: "Simple solutions are usually the best solutions"
 */

const puppeteer = require('puppeteer');

const N8N_URL = process.env.N8N_URL || 'https://n8n.pbradygeorgen.com';
const N8N_EMAIL = process.env.N8N_EMAIL || process.env.N8N_USER_EMAIL;
const N8N_PASSWORD = process.env.N8N_PASSWORD || process.env.N8N_USER_PASSWORD;

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

async function main() {
  console.log('\n🖖 ACTIVATE ALL WORKFLOWS FROM LIST (UI AUTOMATION)\n');
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
      
      // Try multiple selectors for submit button
      const submitSelectors = [
        'button[type="submit"]',
        'button:has-text("Sign in")',
        'button:has-text("Log in")',
        'button:has-text("Login")',
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
        } catch (e) {
          // Try next selector
        }
      }
      
      if (!clicked) {
        // Fallback: press Enter on password field
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
    
    // Find all inactive workflow toggles and activate them
    console.log('🔄 Activating all inactive workflows...\n');
    
    // Wait for workflows list to load
    await sleep(3000);
    
    const result = await page.evaluate(async () => {
      const results = { activated: 0, alreadyActive: 0, errors: 0, found: 0 };
      
      // Strategy 1: Find all workflow cards/rows
      const workflowCards = Array.from(document.querySelectorAll('[class*="workflow"], [class*="card"], [class*="row"], article, section'));
      
      for (const card of workflowCards) {
        const cardText = card.textContent || '';
        // Skip if this doesn't look like a workflow card
        if (!cardText.includes('Last updated') && !cardText.includes('Created')) continue;
        
        results.found++;
        
        // Find toggle within this card - try multiple selectors
        let toggle = null;
        const toggleSelectors = [
          'button[aria-label*="Activate"]',
          'button[aria-label*="Deactivate"]',
          '[role="switch"]',
          '[class*="toggle"]',
          '[class*="switch"]'
        ];
        
        for (const selector of toggleSelectors) {
          toggle = card.querySelector(selector);
          if (toggle) break;
        }
        
        // If no toggle found, look for any button in the card and check its text
        if (!toggle) {
          const buttons = card.querySelectorAll('button');
          for (const btn of buttons) {
            const btnText = btn.textContent || '';
            const btnAria = btn.getAttribute('aria-label') || '';
            if (btnText.includes('Inactive') || btnText.includes('Active') || 
                btnAria.includes('Activate') || btnAria.includes('Deactivate')) {
              toggle = btn;
              break;
            }
          }
        }
        
        if (toggle) {
          const toggleText = toggle.textContent || '';
          const toggleAria = toggle.getAttribute('aria-label') || '';
          const isInactive = toggleText.includes('Inactive') || toggleAria.includes('Activate') || 
                            toggleAria.includes('Inactive');
          const isActive = toggleText.includes('Active') || toggleAria.includes('Deactivate') || 
                          toggleAria.includes('Active');
          
          if (isInactive) {
            try {
              toggle.scrollIntoView({ behavior: 'smooth', block: 'center' });
              await new Promise(resolve => setTimeout(resolve, 500));
              toggle.click();
              await new Promise(resolve => setTimeout(resolve, 1000));
              results.activated++;
            } catch (e) {
              results.errors++;
            }
          } else if (isActive) {
            results.alreadyActive++;
          }
        }
      }
      
      return results;
    });
    
    console.log(`   📊 Found ${result.found} workflow cards`);
    
    console.log(`   ✅ Activated: ${result.activated}`);
    console.log(`   ℹ️  Already active: ${result.alreadyActive}`);
    if (result.errors > 0) {
      console.log(`   ⚠️  Errors: ${result.errors}`);
    }
    
    console.log('\n⏳ Waiting 30 seconds for webhook registration...');
    await sleep(30000);
    
    console.log('\n✅ Activation complete!');
    console.log('   Webhooks should now be registered\n');
    
  } catch (error) {
    console.error(`\n❌ Error: ${error.message}`);
    await page.screenshot({ path: '/tmp/n8n-activate-error.png', fullPage: true });
    console.log('   Screenshot: /tmp/n8n-activate-error.png\n');
  } finally {
    await browser.close();
  }
}

main().catch(error => {
  console.error('❌ Script failed:', error.message);
  process.exit(1);
});

