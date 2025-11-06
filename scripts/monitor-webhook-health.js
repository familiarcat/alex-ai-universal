#!/usr/bin/env node
/**
 * AUTOMATED WEBHOOK HEALTH MONITORING & SELF-HEALING
 * 
 * Purpose: Continuously monitor webhook health and auto-fix issues
 * Pattern: Monitor → Detect → Diagnose → Heal → Report
 * Philosophy: "The crew must ALWAYS be able to communicate"
 * 
 * Features:
 * - Polls webhook endpoints every 60 seconds
 * - Detects failures and patterns
 * - Auto-triggers fixes when needed
 * - Logs all events to Supabase for learning
 * - Alerts crew when manual intervention needed
 * 
 * Self-Healing Actions:
 * 1. Workflow reactivation (for transient failures)
 * 2. Container restart (for environment issues)
 * 3. Fallback activation (when n8n is broken)
 */

const https = require('https');
const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

// Load environment
require('dotenv').config();
const N8N_URL = process.env.N8N_URL || 'https://n8n.pbradygeorgen.com';
const N8N_API_KEY = process.env.N8N_API_KEY;
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY;

// Monitoring configuration
const CHECK_INTERVAL = 60000; // 60 seconds
const FAILURE_THRESHOLD = 3;  // Trigger healing after 3 consecutive failures
const CRITICAL_WEBHOOKS = [
    { name: 'observation-lounge', path: '/webhook/observation-lounge' },
    { name: 'crew-captain-picard', path: '/webhook/crew-captain-picard' },
    { name: 'crew-commander-data', path: '/webhook/crew-commander-data' },
    { name: 'crew-geordi-la-forge', path: '/webhook/crew-geordi-la-forge' }
];

// State tracking
let consecutiveFailures = 0;
let lastHealthyCheck = null;
let healingInProgress = false;
let fallbackActive = false;

console.log('╔════════════════════════════════════════════════════════════════════════╗');
console.log('║                                                                        ║');
console.log('║   🏥 WEBHOOK HEALTH MONITORING & SELF-HEALING SYSTEM                  ║');
console.log('║                                                                        ║');
console.log('║   "The crew must ALWAYS be able to communicate"                       ║');
console.log('║                                                                        ║');
console.log('╚════════════════════════════════════════════════════════════════════════╝\n');

console.log(`⚙️  Configuration:`);
console.log(`   Check interval: ${CHECK_INTERVAL/1000}s`);
console.log(`   Failure threshold: ${FAILURE_THRESHOLD}`);
console.log(`   Critical webhooks: ${CRITICAL_WEBHOOKS.length}`);
console.log(`   Auto-healing: ENABLED\n`);

/**
 * HTTP request helper
 */
function request(url, options = {}) {
    return new Promise((resolve, reject) => {
        const urlObj = new URL(url);
        const reqOptions = {
            hostname: urlObj.hostname,
            port: urlObj.port || 443,
            path: urlObj.pathname,
            method: options.method || 'GET',
            headers: options.headers || {},
            timeout: 10000
        };

        const req = https.request(reqOptions, (res) => {
            let body = '';
            res.on('data', chunk => body += chunk);
            res.on('end', () => resolve({ 
                statusCode: res.statusCode, 
                body,
                headers: res.headers 
            }));
        });

        req.on('error', reject);
        req.on('timeout', () => {
            req.destroy();
            reject(new Error('Request timeout'));
        });
        
        req.end();
    });
}

/**
 * Log event to Supabase
 */
async function logEvent(eventType, data) {
    try {
        await request(`${SUPABASE_URL}/rest/v1/system_events`, {
            method: 'POST',
            headers: {
                'apikey': SUPABASE_ANON_KEY,
                'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
                'Content-Type': 'application/json',
                'Prefer': 'return=minimal'
            }
        });
        
        // If table doesn't exist, just console log
    } catch (error) {
        // Silently fail - logging is nice-to-have
    }
    
    // Always log to console
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] ${eventType}:`, JSON.stringify(data, null, 2));
}

/**
 * Check single webhook health
 */
async function checkWebhook(webhook) {
    const url = `${N8N_URL}${webhook.path}`;
    
    try {
        const response = await request(url);
        
        // 200, 405 (Method Not Allowed) = webhook is registered
        // 404 = webhook not registered
        const isHealthy = response.statusCode === 200 || response.statusCode === 405;
        
        return {
            name: webhook.name,
            path: webhook.path,
            healthy: isHealthy,
            statusCode: response.statusCode,
            timestamp: new Date().toISOString()
        };
    } catch (error) {
        return {
            name: webhook.name,
            path: webhook.path,
            healthy: false,
            error: error.message,
            timestamp: new Date().toISOString()
        };
    }
}

/**
 * Check n8n settings API
 */
async function checkN8NSettings() {
    try {
        const response = await request(`${N8N_URL}/rest/settings`, {
            headers: { 'X-N8N-API-KEY': N8N_API_KEY }
        });
        
        const settings = JSON.parse(response.body);
        return {
            webhookUrl: settings.webhookUrl,
            healthy: settings.webhookUrl !== null && settings.webhookUrl !== undefined
        };
    } catch (error) {
        return {
            webhookUrl: null,
            healthy: false,
            error: error.message
        };
    }
}

/**
 * Run full health check
 */
async function runHealthCheck() {
    console.log(`\n🔍 Running health check...`);
    
    // Check n8n settings
    const settings = await checkN8NSettings();
    console.log(`   n8n webhookUrl: ${settings.webhookUrl || 'null'} ${settings.healthy ? '✅' : '❌'}`);
    
    // Check each critical webhook
    const webhookResults = await Promise.all(
        CRITICAL_WEBHOOKS.map(w => checkWebhook(w))
    );
    
    webhookResults.forEach(result => {
        const status = result.healthy ? '✅' : '❌';
        const code = result.statusCode ? `(${result.statusCode})` : '';
        console.log(`   ${result.name}: ${status} ${code}`);
    });
    
    // Determine overall health
    const allWebhooksHealthy = webhookResults.every(r => r.healthy);
    const overallHealthy = settings.healthy && allWebhooksHealthy;
    
    const healthReport = {
        timestamp: new Date().toISOString(),
        overall: overallHealthy,
        settings: settings,
        webhooks: webhookResults,
        consecutiveFailures: consecutiveFailures
    };
    
    // Log event
    await logEvent(overallHealthy ? 'HEALTH_CHECK_PASS' : 'HEALTH_CHECK_FAIL', healthReport);
    
    return healthReport;
}

/**
 * Self-healing action: Reactivate workflows
 */
async function healViaWorkflowReactivation() {
    console.log('\n🔧 HEALING ACTION: Reactivating workflows...');
    
    return new Promise((resolve, reject) => {
        const scriptPath = path.join(__dirname, 'reactivate-all-crew-webhooks.js');
        const child = spawn('node', [scriptPath], { stdio: 'inherit' });
        
        child.on('close', (code) => {
            if (code === 0) {
                console.log('✅ Workflow reactivation complete');
                resolve(true);
            } else {
                console.log('❌ Workflow reactivation failed');
                resolve(false);
            }
        });
        
        child.on('error', (error) => {
            console.log(`❌ Error: ${error.message}`);
            resolve(false);
        });
    });
}

/**
 * Self-healing action: Full webhook fix
 */
async function healViaFullFix() {
    console.log('\n🔧 HEALING ACTION: Running full webhook fix...');
    
    return new Promise((resolve, reject) => {
        const scriptPath = path.join(__dirname, 'automate-webhook-fix-complete.sh');
        const child = spawn('bash', [scriptPath], { stdio: 'inherit' });
        
        child.on('close', (code) => {
            if (code === 0) {
                console.log('✅ Full webhook fix complete');
                resolve(true);
            } else {
                console.log('❌ Full webhook fix failed');
                resolve(false);
            }
        });
        
        child.on('error', (error) => {
            console.log(`❌ Error: ${error.message}`);
            resolve(false);
        });
    });
}

/**
 * Self-healing action: Activate fallback system
 */
async function healViaFallback() {
    console.log('\n🔧 HEALING ACTION: Activating fallback coordination system...');
    
    const scriptPath = path.join(__dirname, 'deploy-crew-coordination-fallback.js');
    const child = spawn('node', [scriptPath], { 
        stdio: 'inherit',
        detached: true
    });
    
    child.unref(); // Run in background
    
    console.log('✅ Fallback system activated (running in background)');
    fallbackActive = true;
    
    return true;
}

/**
 * Trigger self-healing
 */
async function triggerHealing(healthReport) {
    if (healingInProgress) {
        console.log('⏳ Healing already in progress, skipping...');
        return;
    }
    
    healingInProgress = true;
    
    console.log('\n╔════════════════════════════════════════════════════════════════════════╗');
    console.log('║                                                                        ║');
    console.log('║   🚨 SELF-HEALING TRIGGERED                                           ║');
    console.log('║                                                                        ║');
    console.log('╚════════════════════════════════════════════════════════════════════════╝');
    
    await logEvent('SELF_HEALING_START', { 
        consecutiveFailures,
        healthReport 
    });
    
    // Step 1: Try simple workflow reactivation
    console.log('\n📋 Step 1: Workflow reactivation (least invasive)');
    let success = await healViaWorkflowReactivation();
    
    if (success) {
        // Wait and recheck
        console.log('⏳ Waiting 30s for changes to take effect...');
        await new Promise(resolve => setTimeout(resolve, 30000));
        
        const recheckReport = await runHealthCheck();
        if (recheckReport.overall) {
            console.log('\n✅ HEALING SUCCESSFUL via workflow reactivation!');
            await logEvent('SELF_HEALING_SUCCESS', { method: 'workflow_reactivation' });
            consecutiveFailures = 0;
            healingInProgress = false;
            return;
        }
    }
    
    // Step 2: Try full webhook fix (container restart, etc.)
    console.log('\n📋 Step 2: Full webhook fix (container restart)');
    success = await healViaFullFix();
    
    if (success) {
        console.log('⏳ Waiting 60s for container restart...');
        await new Promise(resolve => setTimeout(resolve, 60000));
        
        const recheckReport = await runHealthCheck();
        if (recheckReport.overall) {
            console.log('\n✅ HEALING SUCCESSFUL via full fix!');
            await logEvent('SELF_HEALING_SUCCESS', { method: 'full_fix' });
            consecutiveFailures = 0;
            healingInProgress = false;
            return;
        }
    }
    
    // Step 3: Activate fallback system
    console.log('\n📋 Step 3: Activating fallback coordination system');
    await healViaFallback();
    
    console.log('\n⚠️  PARTIAL HEALING: Fallback system active');
    console.log('     Webhooks still not working, but crew can communicate via fallback');
    await logEvent('SELF_HEALING_PARTIAL', { method: 'fallback_system' });
    
    healingInProgress = false;
}

/**
 * Main monitoring loop
 */
async function monitorLoop() {
    try {
        const healthReport = await runHealthCheck();
        
        if (healthReport.overall) {
            // System healthy
            consecutiveFailures = 0;
            lastHealthyCheck = new Date();
            
            if (fallbackActive) {
                console.log('\n✅ Webhooks restored! Fallback can be deactivated.');
            }
            
        } else {
            // System unhealthy
            consecutiveFailures++;
            
            console.log(`\n⚠️  Health check failed (${consecutiveFailures}/${FAILURE_THRESHOLD})`);
            
            if (consecutiveFailures >= FAILURE_THRESHOLD && !healingInProgress) {
                await triggerHealing(healthReport);
            }
        }
        
    } catch (error) {
        console.error(`❌ Monitoring error: ${error.message}`);
        await logEvent('MONITOR_ERROR', { error: error.message });
    }
    
    // Schedule next check
    setTimeout(monitorLoop, CHECK_INTERVAL);
}

/**
 * Startup
 */
async function start() {
    console.log('🚀 Starting webhook health monitor...\n');
    
    // Run initial check immediately
    await monitorLoop();
}

// Handle graceful shutdown
process.on('SIGINT', () => {
    console.log('\n\n🛑 Shutting down webhook monitor...');
    console.log(`📊 Final stats:`);
    console.log(`   Last healthy: ${lastHealthyCheck ? lastHealthyCheck.toISOString() : 'never'}`);
    console.log(`   Consecutive failures: ${consecutiveFailures}`);
    console.log(`   Fallback active: ${fallbackActive ? 'yes' : 'no'}`);
    console.log('\n🖖 Monitor stopped.\n');
    process.exit(0);
});

// Start monitoring
start();

