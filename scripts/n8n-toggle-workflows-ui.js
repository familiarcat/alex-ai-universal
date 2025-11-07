#!/usr/bin/env node
/**
 * N8N WORKFLOW TOGGLE VIA PUPPETEER UI AUTOMATION
 * 
 * Purpose: Automate workflow toggling through n8n UI to force webhook registration
 * Why: n8n API has validation issues; UI toggling is the most reliable method
 * Use Cases:
 *   - After adding/updating workflows
 *   - When webhooks show 404 errors
 *   - After n8n container restart
 * 
 * Philosophy: "When the API fails and SSH can't help, automate the UI" - Commander Data
 * 
 * O'Brien's Update: Added intelligent delays and retry logic to avoid rate limiting
 */

const puppeteer = require('puppeteer');
const axios = require('axios');

// Helper for delays
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Configuration
const N8N_URL = process.env.N8N_URL || 'https://n8n.pbradygeorgen.com';
const N8N_API_KEY = process.env.N8N_API_KEY;
const N8N_EMAIL = process.env.N8N_EMAIL || process.env.N8N_USER_EMAIL;
const N8N_PASSWORD = process.env.N8N_PASSWORD || process.env.N8N_USER_PASSWORD;

// Colors
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

const log = {
  info: (msg) => console.log(`${colors.blue}${msg}${colors.reset}`),
  success: (msg) => console.log(`${colors.green}${msg}${colors.reset}`),
  warn: (msg) => console.log(`${colors.yellow}${msg}${colors.reset}`),
  error: (msg) => console.log(`${colors.red}${msg}${colors.reset}`),
  cyan: (msg) => console.log(`${colors.cyan}${msg}${colors.reset}`),
};

// Banner
log.cyan(`
╔════════════════════════════════════════════════════════════════════════╗
║                                                                        ║
║   🎭 N8N WORKFLOW TOGGLE VIA UI AUTOMATION                            ║
║                                                                        ║
║   "When all else fails, control the human interface" - Data           ║
║                                                                        ║
╚════════════════════════════════════════════════════════════════════════╝
`);

// Validation
if (!N8N_API_KEY) {
  log.error('❌ N8N_API_KEY environment variable not set');
  process.exit(1);
}

/**
 * Main execution
 */
async function main() {
  const startTime = Date.now();
  let browser;
  
  try {
    log.info('📋 Configuration:');
    console.log(`   N8N URL: ${N8N_URL}`);
    console.log(`   API Key: ${N8N_API_KEY.substring(0, 20)}...`);
    console.log(`   Auth Method: ${N8N_EMAIL ? 'Email/Password' : 'API Key'}`);
    console.log('');

    // Step 1: Fetch workflow list via API
    log.info('🔍 Step 1: Fetching crew workflows from API...');
    const response = await axios.get(`${N8N_URL}/api/v1/workflows`, {
      headers: { 'X-N8N-API-KEY': N8N_API_KEY }
    });

    const crewWorkflows = response.data.data.filter(w => 
      w.name.includes('CREW') || w.name.includes('COORDINATION')
    );

    log.success(`✅ Found ${crewWorkflows.length} crew/coordination workflows\n`);

    if (crewWorkflows.length === 0) {
      log.warn('⚠️  No crew workflows to toggle');
      return;
    }

    // Display workflows
    log.info('📊 Workflows to toggle:');
    crewWorkflows.forEach((w, i) => {
      const status = w.active ? '🟢' : '⚫';
      console.log(`   ${i + 1}. ${status} ${w.name}`);
    });
    console.log('');

    // Step 2: Launch browser
    log.info('🌐 Step 2: Launching browser...');
    browser = await puppeteer.launch({
      headless: true, // Set to false to see the browser in action
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-accelerated-2d-canvas',
        '--disable-gpu'
      ],
      defaultViewport: {
        width: 1920,
        height: 1080
      }
    });

    const page = await browser.newPage();
    
    // Set a reasonable timeout
    page.setDefaultTimeout(30000);

    // Enable console logging from the page
    page.on('console', msg => {
      if (msg.type() === 'error') {
        console.log(`      [Browser Error] ${msg.text()}`);
      }
    });

    log.success('✅ Browser launched\n');

    // Step 3: Navigate to n8n with retry logic
    log.info(`🔗 Step 3: Navigating to ${N8N_URL}...`);
    let navigationAttempts = 0;
    const maxNavigationAttempts = 3;
    
    while (navigationAttempts < maxNavigationAttempts) {
      try {
        await page.goto(N8N_URL, { 
          waitUntil: 'networkidle0', 
          timeout: 60000 
        });
        log.info('   ✅ Navigation successful');
        break;
      } catch (error) {
        navigationAttempts++;
        if (navigationAttempts >= maxNavigationAttempts) {
          throw new Error(`Failed to navigate after ${maxNavigationAttempts} attempts: ${error.message}`);
        }
        log.warn(`   ⚠️  Navigation attempt ${navigationAttempts} failed, retrying in 10s...`);
        await sleep(10000);
      }
    }
    
    // Wait for page to settle (longer delay to avoid rate limiting)
    log.info('   ⏳ Waiting for page to fully load...');
    await sleep(5000);

    // Take a screenshot for debugging
    await page.screenshot({ path: '/tmp/n8n-initial-load.png' });
    log.info('   📸 Screenshot saved: /tmp/n8n-initial-load.png');

    // Check if we need to login
    const currentUrl = page.url();
    log.info(`   Current URL: ${currentUrl}`);

    if (currentUrl.includes('/signin') || currentUrl.includes('/login')) {
      log.info('   🔐 Login required...');
      
      if (!N8N_EMAIL || !N8N_PASSWORD) {
        log.error('❌ Login required but N8N_EMAIL or N8N_PASSWORD not set');
        log.info('   Set them in ~/.zshrc:');
        log.info('   export N8N_EMAIL="your-email@example.com"');
        log.info('   export N8N_PASSWORD="your-password"');
        await browser.close();
        process.exit(1);
      }

      // Login
      await page.type('input[type="email"]', N8N_EMAIL);
      await page.type('input[type="password"]', N8N_PASSWORD);
      await page.click('button[type="submit"]');
      await page.waitForNavigation({ waitUntil: 'networkidle2', timeout: 15000 });
      log.success('   ✅ Logged in');
    } else {
      log.info('   ✅ Already authenticated or no auth required');
    }

    await sleep(2000);
    await page.screenshot({ path: '/tmp/n8n-after-auth.png' });
    log.info('   📸 Screenshot saved: /tmp/n8n-after-auth.png\n');

    // Step 4: Toggle each workflow
    log.info('🔄 Step 4: Toggling workflows via UI...\n');

    const results = {
      success: 0,
      failed: 0,
      total: crewWorkflows.length
    };

    for (let i = 0; i < crewWorkflows.length; i++) {
      const workflow = crewWorkflows[i];
      
      try {
        log.info(`   🔄 Processing [${i + 1}/${crewWorkflows.length}]: ${workflow.name}`);
        
        // O'Brien's Rate Limiting: Wait between operations
        if (i > 0) {
          log.info(`      ⏳ Rate limiting: waiting 5 seconds before next workflow...`);
          await sleep(5000);
        }
        
        // Navigate to workflow with retry logic
        const workflowUrl = `${N8N_URL}/workflow/${workflow.id}`;
        log.info(`      🔗 Navigating to workflow...`);
        
        let navAttempts = 0;
        const maxNavAttempts = 3;
        
        while (navAttempts < maxNavAttempts) {
          try {
            await page.goto(workflowUrl, { 
              waitUntil: 'networkidle0', 
              timeout: 60000 
            });
            break;
          } catch (error) {
            navAttempts++;
            if (navAttempts >= maxNavAttempts) {
              throw new Error(`Failed to load workflow after ${maxNavAttempts} attempts`);
            }
            log.warn(`      ⚠️  Navigation failed, retrying in 10s... (${navAttempts}/${maxNavAttempts})`);
            await sleep(10000);
          }
        }
        
        // Wait for workflow editor to fully load
        log.info(`      ⏳ Waiting for workflow editor to load...`);
        await sleep(5000);

        // Find the active toggle switch
        // N8N typically uses a switch/toggle button in the top-right
        const toggleSelector = 'button[data-test-id="workflow-activate-switch"], button[aria-label="Workflow Active"], .workflow-activator button, button.workflow-activate-toggle';
        
        try {
          await page.waitForSelector(toggleSelector, { timeout: 10000 });
        } catch (e) {
          log.warn(`      ⚠️  Could not find toggle button, trying alternative selectors...`);
          
          // Try to find ANY button that looks like a toggle
          const buttons = await page.$$('button');
          let foundToggle = false;
          
          for (const button of buttons) {
            const text = await page.evaluate(el => el.textContent, button);
            const ariaLabel = await page.evaluate(el => el.getAttribute('aria-label'), button);
            
            if (text.includes('Active') || text.includes('Inactive') || 
                ariaLabel?.includes('Active') || ariaLabel?.includes('Inactive')) {
              await button.click();
              await sleep(1000);
              await button.click();
              await sleep(1000);
              foundToggle = true;
              break;
            }
          }
          
          if (!foundToggle) {
            throw new Error('Could not find workflow toggle button');
          }
        }

        // If we found the toggle, click it twice (OFF then ON)
        if (workflow.active) {
          log.info(`      ⚫ Toggling OFF...`);
          await page.click(toggleSelector);
          await sleep(3000); // Longer delay for state change
          log.info(`      ✅ Deactivated`);
        }

        log.info(`      🟢 Toggling ON...`);
        await page.click(toggleSelector);
        await sleep(3000); // Longer delay for webhook registration
        log.info(`      ✅ Activated`);

        log.success(`      ✅ ${workflow.name} - toggled successfully\n`);
        results.success++;

      } catch (error) {
        log.error(`      ❌ ${workflow.name} - failed: ${error.message}`);
        results.failed++;
        
        // Take screenshot of failure
        const screenshotPath = `/tmp/n8n-toggle-failed-${workflow.id}.png`;
        try {
          await page.screenshot({ path: screenshotPath });
          log.info(`      📸 Error screenshot: ${screenshotPath}`);
        } catch (screenshotError) {
          log.warn(`      ⚠️  Could not save screenshot: ${screenshotError.message}`);
        }
        
        log.info(''); // Blank line for readability
      }

      // O'Brien's Rate Limiting: Delay between workflows
      if (i < crewWorkflows.length - 1) {
        log.info(`   ⏳ Waiting 8 seconds before next workflow (rate limiting)...\n`);
        await sleep(8000);
      }
    }

    console.log('');
    log.success(`✅ Toggling complete: ${results.success}/${results.total} successful\n`);

    // Step 5: Wait for webhook registration
    log.info('⏳ Step 5: Waiting 10 seconds for webhook registration to propagate...');
    await sleep(10000);

    // Step 6: Test webhooks
    log.info('🧪 Step 6: Testing webhook registration...\n');
    
    const webhookTests = [
      { name: 'Captain Picard', path: '/webhook/crew-captain-jean-luc-picard' },
      { name: 'Commander Data', path: '/webhook/crew-commander-data' },
      { name: 'Geordi La Forge', path: '/webhook/crew-geordi-la-forge' },
      { name: 'Observation Lounge', path: '/webhook/observation-lounge' },
    ];

    const webhookResults = { working: 0, notWorking: 0 };

    for (const test of webhookTests) {
      try {
        // Use axios directly (not through rate limiter) for testing
        // Rate limiter is for n8n API, webhooks are different endpoints
        const response = await axios.post(
          `${N8N_URL}${test.path}`,
          { query: 'health check', test: true },
          { 
            headers: { 'Content-Type': 'application/json' },
            timeout: 10000,
            validateStatus: (status) => status < 500
          }
        );

        if (response.status === 200 || response.status === 201) {
          console.log(`   ✅ ${test.name.padEnd(20)} WORKING (HTTP ${response.status})`);
          webhookResults.working++;
        } else if (response.status === 404) {
          console.log(`   ❌ ${test.name.padEnd(20)} NOT REGISTERED (HTTP 404)`);
          webhookResults.notWorking++;
        } else {
          console.log(`   ⚠️  ${test.name.padEnd(20)} UNKNOWN (HTTP ${response.status})`);
        }
      } catch (error) {
        if (error.response && error.response.status === 404) {
          console.log(`   ❌ ${test.name.padEnd(20)} NOT REGISTERED (HTTP 404)`);
          webhookResults.notWorking++;
        } else {
          console.log(`   ⚠️  ${test.name.padEnd(20)} ERROR: ${error.message}`);
        }
      }
      
      // Small delay between webhook tests
      await sleep(1000);
    }

    console.log('');

    // Close browser
    await browser.close();
    log.info('🌐 Browser closed\n');

    // Summary
    const duration = ((Date.now() - startTime) / 1000).toFixed(1);
    const allSuccess = results.failed === 0 && webhookResults.notWorking === 0;

    log.cyan(`
╔════════════════════════════════════════════════════════════════════════╗
║                                                                        ║
║   ${allSuccess ? '✅ SUCCESS! ALL WORKFLOWS TOGGLED & WEBHOOKS REGISTERED' : '⚠️  WORKFLOW TOGGLE COMPLETE WITH WARNINGS'}        ║
║                                                                        ║
╚════════════════════════════════════════════════════════════════════════╝
`);

    console.log(`Workflows Toggled: ${results.success}/${results.total}`);
    console.log(`Webhooks Working: ${webhookResults.working}/${webhookTests.length}`);
    console.log(`Duration: ${duration}s`);
    console.log('');

    if (allSuccess) {
      log.success('🎉 All workflows and webhooks are operational!');
      log.info('');
      log.info('Next steps:');
      log.info('   1. Test all crew webhooks: npm run rag:verify');
      log.info('   2. Monitor webhook health: node scripts/monitor-webhook-health.js');
    } else {
      if (results.failed > 0) {
        log.warn(`⚠️  ${results.failed} workflow(s) failed to toggle`);
        log.info('   Check screenshots in /tmp/ for details');
      }
      
      if (webhookResults.notWorking > 0) {
        log.warn(`⚠️  ${webhookResults.notWorking} webhook(s) still not working`);
        log.info('   Try: npm run n8n:restart && npm run n8n:toggle-ui');
      }
    }

  } catch (error) {
    log.error(`\n❌ Fatal error: ${error.message}`);
    console.error(error.stack);
    
    if (browser) {
      await browser.close();
    }
    
    process.exit(1);
  }
}

// Run
main().catch(error => {
  console.error(`Fatal error: ${error.message}`);
  process.exit(1);
});

