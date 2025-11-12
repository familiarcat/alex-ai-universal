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
const fs = require('node:fs');
const path = require('node:path');

// Helper for delays
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Configuration
const N8N_URL = process.env.N8N_URL || 'https://n8n.pbradygeorgen.com';
const N8N_API_KEY = process.env.N8N_API_KEY;
const N8N_EMAIL = process.env.N8N_EMAIL || process.env.N8N_USER_EMAIL;
const N8N_PASSWORD = process.env.N8N_PASSWORD || process.env.N8N_USER_PASSWORD;

// Tunable delay configuration (all values in milliseconds)
const GLOBAL_NAVIGATION_DELAY = Number(process.env.N8N_UI_GLOBAL_NAVIGATION_DELAY_MS || 15000);
const BETWEEN_PAGE_SLEEP = Number(process.env.N8N_UI_BETWEEN_PAGE_SLEEP_MS || 12000);
const BETWEEN_WORKFLOW_DELAY = Number(process.env.N8N_UI_BETWEEN_WORKFLOW_DELAY_MS || 18000);
const BETWEEN_TOGGLE_DELAY = Number(process.env.N8N_UI_BETWEEN_TOGGLE_DELAY_MS || 6000);
const POST_TOGGLE_PROPAGATION_DELAY = Number(process.env.N8N_UI_POST_TOGGLE_PROPAGATION_DELAY_MS || 15000);
const INITIAL_LOAD_WAIT = Number(process.env.N8N_UI_INITIAL_LOAD_WAIT_MS || 12000);
const MAX_NAV_ATTEMPTS = Number(process.env.N8N_UI_MAX_NAV_ATTEMPTS || 5);
const OUTPUT_ROOT = path.join(process.cwd(), 'reports', 'n8n-toggle-runs');

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

async function ensureDirectory(dirPath) {
  await fs.promises.mkdir(dirPath, { recursive: true });
}

async function isLoginScreen(page) {
  return page.evaluate(() => {
    const form = document.querySelector('form');
    if (!form) return false;
    const emailInput = form.querySelector('input[type="email"]');
    const passwordInput = form.querySelector('input[type="password"]');
    const submitButton = form.querySelector('button[type="submit"]');
    if (!emailInput || !passwordInput || !submitButton) return false;
    const buttonText = submitButton.textContent || '';
    return /sign\s*in/i.test(buttonText.trim());
  });
}

async function ensureAuthenticated(page) {
  const loginDetected = await isLoginScreen(page);
  if (!loginDetected) {
    return false;
  }

  if (!N8N_EMAIL || !N8N_PASSWORD) {
    throw new Error('Login required but N8N_EMAIL or N8N_PASSWORD not set');
  }

  log.info('   🔐 Logging into n8n UI...');
  await page.type('input[type="email"]', N8N_EMAIL, { delay: 40 });
  await page.type('input[type="password"]', N8N_PASSWORD, { delay: 35 });

  await Promise.all([
    page.click('button[type="submit"]'),
    page.waitForNavigation({ waitUntil: 'networkidle0', timeout: 60000 }).catch(() => {}),
  ]);

  await sleep(INITIAL_LOAD_WAIT);
  return true;
}

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
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const outputDir = path.join(OUTPUT_ROOT, timestamp);
  const screenshotDir = path.join(outputDir, 'screenshots');
  const summary = {
    timestamp: new Date().toISOString(),
    baseUrl: N8N_URL,
    runDirectory: path.relative(process.cwd(), outputDir),
    workflows: [],
    errors: [],
    webhookTests: [],
  };
  await ensureDirectory(screenshotDir);
  
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

    const maxWorkflowsEnv = process.env.N8N_UI_MAX_WORKFLOWS
      ? Number(process.env.N8N_UI_MAX_WORKFLOWS)
      : null;
    const workflowsToProcess = Number.isFinite(maxWorkflowsEnv) && maxWorkflowsEnv > 0
      ? crewWorkflows.slice(0, maxWorkflowsEnv)
      : crewWorkflows;

    log.success(`✅ Found ${crewWorkflows.length} crew/coordination workflows (processing ${workflowsToProcess.length})\n`);
    summary.discoveredWorkflows = crewWorkflows.length;
    summary.processedWorkflows = workflowsToProcess.length;

    if (workflowsToProcess.length === 0) {
      log.warn('⚠️  No crew workflows to toggle');
      return;
    }

    // Display workflows
    log.info('📊 Workflows to toggle:');
    workflowsToProcess.forEach((w, i) => {
      const status = w.active ? '🟢' : '⚫';
      console.log(`   ${i + 1}. ${status} ${w.name}`);
    });
    console.log('');

    // Step 2: Launch browser
    log.info('🌐 Step 2: Launching browser...');
    browser = await puppeteer.launch({
      headless: true, // Set to false to see the browser in action
      slowMo: Number(process.env.N8N_UI_SLOWMO_MS || 250),
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
    await page.setUserAgent(
      process.env.N8N_UI_USER_AGENT ||
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/118.0.0.0 Safari/537.36'
    );
    await page.setRequestInterception(true);
    page.on('request', (request) => {
      const resourceType = request.resourceType();
      if (['image', 'stylesheet', 'font', 'media'].includes(resourceType)) {
        request.abort();
      } else {
        request.continue();
      }
    });

    // Set a reasonable timeout
    page.setDefaultTimeout(90000);
    page.setDefaultNavigationTimeout(90000);

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
    
    while (navigationAttempts < MAX_NAV_ATTEMPTS) {
      try {
        await page.goto(N8N_URL, { 
          waitUntil: 'networkidle0', 
          timeout: 60000 
        });
        log.info('   ✅ Navigation successful');
        break;
      } catch (error) {
        navigationAttempts++;
        if (navigationAttempts >= MAX_NAV_ATTEMPTS) {
          throw new Error(`Failed to navigate after ${MAX_NAV_ATTEMPTS} attempts: ${error.message}`);
        }
        const retryWait = GLOBAL_NAVIGATION_DELAY + navigationAttempts * 2000;
        log.warn(`   ⚠️  Navigation attempt ${navigationAttempts} failed, retrying in ${retryWait / 1000}s...`);
        await sleep(retryWait);
      }
    }
    
    // Wait for page to settle (longer delay to avoid rate limiting)
    log.info(`   ⏳ Waiting ${INITIAL_LOAD_WAIT / 1000}s for page to fully load...`);
    await sleep(INITIAL_LOAD_WAIT);

    const initialScreenshot = path.join(screenshotDir, 'initial-load.png');
    await page.screenshot({ path: initialScreenshot, fullPage: true });
    log.info(`   📸 Screenshot saved: ${initialScreenshot}`);

    let loginAttempted = false;
    try {
      loginAttempted = await ensureAuthenticated(page);
    } catch (loginError) {
        await browser.close();
      throw loginError;
      }

    if (loginAttempted) {
      log.success('   ✅ Login completed');
      await sleep(2000);
      const postLoginShot = path.join(screenshotDir, 'after-login.png');
      await page.screenshot({ path: postLoginShot, fullPage: true });
      log.info(`   📸 Screenshot saved: ${postLoginShot}`);
    } else {
      log.info('   ✅ Session already authenticated');
    }

    const currentUrl = page.url();
    log.info(`   Current URL: ${currentUrl}\n`);

    if (await isLoginScreen(page)) {
      throw new Error('Login screen still visible after authentication attempt. Check credentials.');
    }

    // Step 4: Toggle each workflow
    log.info('🔄 Step 4: Toggling workflows via UI...\n');

    const results = {
      success: 0,
      failed: 0,
      total: workflowsToProcess.length
    };

    for (let i = 0; i < workflowsToProcess.length; i++) {
      const workflow = workflowsToProcess[i];
      const workflowSummary = {
        id: workflow.id,
        name: workflow.name,
        toggledOff: false,
        toggledOn: false,
        errors: [],
        screenshots: {},
        status: 'pending',
      };
      summary.workflows.push(workflowSummary);
      
      try {
        log.info(`   🔄 Processing [${i + 1}/${crewWorkflows.length}]: ${workflow.name}`);
        
        // O'Brien's Rate Limiting: Wait between operations
        if (i > 0) {
          log.info(`      ⏳ Rate limiting: waiting ${BETWEEN_PAGE_SLEEP / 1000}s before next workflow...`);
          await sleep(BETWEEN_PAGE_SLEEP);
        }
        
        // Navigate to workflow with retry logic
        const workflowUrl = `${N8N_URL}/workflow/${workflow.id}`;
        log.info(`      🔗 Navigating to workflow...`);
        
        let navAttempts = 0;
        
        while (navAttempts < MAX_NAV_ATTEMPTS) {
          try {
            await page.goto(workflowUrl, { 
              waitUntil: 'networkidle0', 
              timeout: 60000 
            });
            if (await ensureAuthenticated(page)) {
              log.info('      🔐 Session refreshed; reloading workflow after login...');
              await page.goto(workflowUrl, { waitUntil: 'networkidle0', timeout: 60000 });
            }
            if (await isLoginScreen(page)) {
              throw new Error('Login screen still visible; unable to access workflow editor');
            }
            break;
          } catch (error) {
            navAttempts++;
            if (navAttempts >= MAX_NAV_ATTEMPTS) {
              throw new Error(`Failed to load workflow after ${MAX_NAV_ATTEMPTS} attempts`);
            }
            const retryDelay = GLOBAL_NAVIGATION_DELAY + navAttempts * 5000;
            log.warn(`      ⚠️  Navigation failed, retrying in ${retryDelay / 1000}s... (${navAttempts}/${MAX_NAV_ATTEMPTS})`);
            await sleep(retryDelay);
          }
        }
        
        // Wait for workflow editor to fully load
        log.info(`      ⏳ Waiting ${BETWEEN_PAGE_SLEEP / 1000}s for workflow editor to load...`);
        await sleep(BETWEEN_PAGE_SLEEP);
        const workflowShotName = `${workflow.name.replace(/[^\w\d-]+/g, '_').slice(0, 120) || workflow.id}.png`;
        const workflowShotPath = path.join(screenshotDir, workflowShotName);
        await page.screenshot({ path: workflowShotPath, fullPage: true });
        workflowSummary.screenshots.editor = path.relative(process.cwd(), workflowShotPath);

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
          workflowSummary.toggledOff = true;
          await sleep(BETWEEN_TOGGLE_DELAY); // Longer delay for state change
          log.info(`      ✅ Deactivated`);
        }

        log.info(`      🟢 Toggling ON...`);
        await page.click(toggleSelector);
        workflowSummary.toggledOn = true;
        await sleep(POST_TOGGLE_PROPAGATION_DELAY); // Longer delay for webhook registration
        log.info(`      ✅ Activated`);

        log.success(`      ✅ ${workflow.name} - toggled successfully\n`);
        results.success++;
        workflowSummary.status = 'success';

      } catch (error) {
        log.error(`      ❌ ${workflow.name} - failed: ${error.message}`);
        results.failed++;
        workflowSummary.status = 'failed';
        workflowSummary.errors.push(error.message);
        
        // Take screenshot of failure
        const failureShotPath = path.join(screenshotDir, `${workflow.id}-failed.png`);
        try {
          await page.screenshot({ path: failureShotPath, fullPage: true });
          workflowSummary.screenshots.failure = path.relative(process.cwd(), failureShotPath);
          log.info(`      📸 Error screenshot: ${failureShotPath}`);
        } catch (screenshotError) {
          log.warn(`      ⚠️  Could not save screenshot: ${screenshotError.message}`);
          workflowSummary.errors.push(`Screenshot failed: ${screenshotError.message}`);
        }
        
        log.info(''); // Blank line for readability
      }

      // O'Brien's Rate Limiting: Delay between workflows
      if (i < workflowsToProcess.length - 1) {
        log.info(`   ⏳ Waiting ${BETWEEN_WORKFLOW_DELAY / 1000}s before next workflow (rate limiting)...\n`);
        await sleep(BETWEEN_WORKFLOW_DELAY);
      }
    }

    console.log('');
    log.success(`✅ Toggling complete: ${results.success}/${results.total} successful\n`);

    // Step 5: Wait for webhook registration
    log.info('⏳ Step 5: Waiting 10 seconds for webhook registration to propagate...');
    await sleep(10000);

    // Step 6: Test webhooks
    log.info('🧪 Step 6: Testing webhook registration...\n');
    
    const webhookChecks = [
      { name: 'Captain Picard', path: '/webhook/crew-captain-jean-luc-picard' },
      { name: 'Commander Data', path: '/webhook/crew-commander-data' },
      { name: 'Geordi La Forge', path: '/webhook/crew-geordi-la-forge' },
      { name: 'Observation Lounge', path: '/webhook/observation-lounge' },
    ];

    const webhookResults = { working: 0, notWorking: 0 };

    for (const test of webhookChecks) {
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
          summary.webhookTests.push({
            name: test.name,
            path: test.path,
            status: 'working',
            httpStatus: response.status,
          });
        } else if (response.status === 404) {
          console.log(`   ❌ ${test.name.padEnd(20)} NOT REGISTERED (HTTP 404)`);
          webhookResults.notWorking++;
          summary.webhookTests.push({
            name: test.name,
            path: test.path,
            status: 'not_registered',
            httpStatus: response.status,
          });
        } else {
          console.log(`   ⚠️  ${test.name.padEnd(20)} UNKNOWN (HTTP ${response.status})`);
          summary.webhookTests.push({
            name: test.name,
            path: test.path,
            status: 'unknown',
            httpStatus: response.status,
          });
        }
      } catch (error) {
        if (error.response && error.response.status === 404) {
          console.log(`   ❌ ${test.name.padEnd(20)} NOT REGISTERED (HTTP 404)`);
          webhookResults.notWorking++;
          summary.webhookTests.push({
            name: test.name,
            path: test.path,
            status: 'not_registered',
            httpStatus: 404,
            error: error.message,
          });
        } else {
          console.log(`   ⚠️  ${test.name.padEnd(20)} ERROR: ${error.message}`);
          summary.webhookTests.push({
            name: test.name,
            path: test.path,
            status: 'error',
            httpStatus: error.response?.status,
            error: error.message,
          });
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
    console.log(`Webhooks Working: ${webhookResults.working}/${webhookChecks.length}`);
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
        log.info(`   Check screenshots in ${screenshotDir} for details`);
      }
      
      if (webhookResults.notWorking > 0) {
        log.warn(`⚠️  ${webhookResults.notWorking} webhook(s) still not working`);
        log.info('   Try: npm run n8n:restart && npm run n8n:toggle-ui');
      }
    }

    summary.results = results;
    summary.webhookResults = webhookResults;
    summary.durationSeconds = Number(duration);

    const summaryPath = path.join(outputDir, 'summary.json');
    summary.summaryFile = path.relative(process.cwd(), summaryPath);
    await fs.promises.writeFile(summaryPath, JSON.stringify(summary, null, 2), 'utf8');
    log.success(`📝 Summary saved -> ${summaryPath}\n`);
    console.log(JSON.stringify(summary, null, 2));

  } catch (error) {
    log.error(`\n❌ Fatal error: ${error.message}`);
    console.error(error.stack);
    summary.errors.push(error.message);
    
    if (browser) {
      await browser.close();
    }
    try {
      const summaryPath = path.join(outputDir, 'summary.json');
      summary.summaryFile = path.relative(process.cwd(), summaryPath);
      await fs.promises.writeFile(summaryPath, JSON.stringify(summary, null, 2), 'utf8');
      log.warn(`⚠️  Partial summary saved -> ${summaryPath}`);
      console.log(JSON.stringify(summary, null, 2));
    } catch (_) {
      // ignore
    }
    
    process.exit(1);
  }
}

// Run
main().catch(error => {
  console.error(`Fatal error: ${error.message}`);
  process.exit(1);
});

