#!/usr/bin/env node

/**
 * 🔄 Pipeline: Activate Workflows & Push Milestone
 * 
 * Complete automation pipeline that:
 * 1. Checks webhook status
 * 2. Discovers correct workflow IDs
 * 3. Attempts API activation (with fallback)
 * 4. Verifies webhook registration
 * 5. Pushes milestone to Supabase via n8n
 * 6. Verifies milestone storage
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const https = require('https');

const PIPELINE_STEPS = [
  { name: 'Check Webhook Status', script: 'check-all-n8n-webhooks.js', required: true },
  { name: 'List All Workflows', script: 'list-all-n8n-workflows.js', required: true },
  { name: 'Fix WEBHOOK_URL on EC2', script: 'fix-n8n-webhooks-automated.sh', required: false, shell: true },
  { name: 'Wait for n8n Restart', script: null, custom: 'waitForN8nRestart', required: false },
  { name: 'Activate Workflows', script: 'automate-activate-all-inactive-workflows.js', required: false },
  { name: 'Enhanced Workflow Activation', script: 'pipeline-enhanced-activate-workflow.js', required: false },
  { name: 'Verify Knowledge Ingest', script: null, custom: 'verifyKnowledgeIngest', required: true },
  { name: 'Push Milestone', script: 'push-milestone-to-rag.js', required: true, args: ['MILESTONE_2025-11-19_OBSERVATION_LOUNGE_STATUS_BRIEFING.md'] },
  { name: 'Verify Milestone Storage', script: null, custom: 'verifyMilestoneStorage', required: false }
];

// Load credentials
function loadCredentials() {
  try {
    const zshrcPath = path.join(process.env.HOME, '.zshrc');
    const zshrcContent = fs.readFileSync(zshrcPath, 'utf8');
    
    const n8nUrlMatch = zshrcContent.match(/export\s+N8N_URL=['"]([^'"]+)['"]/);
    const n8nOwnerKeyMatch = zshrcContent.match(/export\s+N8N_OWNER_API_KEY=['"]([^'"]+)['"]/);
    
    return {
      n8nUrl: n8nUrlMatch ? n8nUrlMatch[1] : 'https://n8n.pbradygeorgen.com',
      n8nApiKey: n8nOwnerKeyMatch ? n8nOwnerKeyMatch[1] : null
    };
  } catch (error) {
    return { n8nUrl: 'https://n8n.pbradygeorgen.com', n8nApiKey: null };
  }
}

// Verify Knowledge Ingest webhook is active
function verifyKnowledgeIngest(credentials) {
  return new Promise((resolve) => {
    const url = new URL('/webhook/knowledge-ingest', credentials.n8nUrl);
    
    const options = {
      hostname: url.hostname,
      port: 443,
      path: url.pathname,
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      timeout: 5000
    };
    
    const req = https.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => { body += chunk; });
      res.on('end', () => {
        const isActive = res.statusCode !== 404;
        resolve({ 
          success: isActive, 
          statusCode: res.statusCode,
          message: isActive ? 'Webhook is active' : 'Webhook not registered (404)'
        });
      });
    });
    
    req.on('error', () => resolve({ success: false, message: 'Connection error' }));
    req.on('timeout', () => {
      req.destroy();
      resolve({ success: false, message: 'Timeout' });
    });
    
    req.write(JSON.stringify({ test: 'connectivity' }));
    req.end();
  });
}

// Verify milestone was stored (check Supabase or n8n execution logs)
function verifyMilestoneStorage() {
  // Check if milestone push succeeded by looking at pending pushes
  const pendingDir = path.join(__dirname, '..', '.backup-ec2-emergency', 'pending-rag-pushes');
  const files = fs.existsSync(pendingDir) ? fs.readdirSync(pendingDir) : [];
  
  // If there are recent files, check if they're old (meaning push might have succeeded)
  const recentFiles = files.filter(f => {
    const filePath = path.join(pendingDir, f);
    const stats = fs.statSync(filePath);
    const age = Date.now() - stats.mtimeMs;
    return age < 60000; // Less than 1 minute old
  });
  
  return {
    success: recentFiles.length === 0,
    message: recentFiles.length > 0 
      ? `${recentFiles.length} pending push(es) found` 
      : 'No pending pushes (likely succeeded)'
  };
}

// Execute a pipeline step
async function executeStep(step, stepNumber, totalSteps, credentials) {
  console.log(`\n[${stepNumber}/${totalSteps}] ${step.name}`);
  console.log('─'.repeat(70));
  
  try {
    if (step.custom) {
      // Custom step logic
      if (step.custom === 'verifyKnowledgeIngest') {
        const result = await verifyKnowledgeIngest(credentials);
        if (result.success) {
          console.log(`✅ ${result.message} (HTTP ${result.statusCode})`);
          return { success: true, step: step.name };
        } else {
          console.log(`⚠️  ${result.message}`);
          if (step.required) {
            console.log('   This step is required. Pipeline may fail.');
          }
          return { success: false, step: step.name, canContinue: !step.required };
        }
      } else if (step.custom === 'verifyMilestoneStorage') {
        const result = verifyMilestoneStorage();
        if (result.success) {
          console.log(`✅ ${result.message}`);
        } else {
          console.log(`⚠️  ${result.message}`);
        }
        return { success: result.success, step: step.name };
      } else if (step.custom === 'waitForN8nRestart') {
        console.log('⏳ Waiting 15 seconds for n8n to fully restart...');
        await new Promise(resolve => setTimeout(resolve, 15000));
        console.log('✅ Wait complete');
        return { success: true, step: step.name };
      }
    } else {
      // Execute script
      const scriptPath = path.join(__dirname, step.script);
      if (!fs.existsSync(scriptPath)) {
        console.log(`❌ Script not found: ${step.script}`);
        return { success: false, step: step.name, canContinue: !step.required };
      }
      
      const args = step.args || [];
      let command;
      
      if (step.shell) {
        // Shell script execution
        command = `bash "${scriptPath}" ${args.map(a => `"${a}"`).join(' ')}`;
      } else {
        // Node script execution
        command = `node "${scriptPath}" ${args.map(a => `"${a}"`).join(' ')}`;
      }
      
      try {
        const output = execSync(command, { 
          encoding: 'utf8',
          stdio: 'pipe',
          cwd: path.join(__dirname, '..')
        });
        
        // Check output for success indicators
        const hasError = output.includes('❌') || output.includes('ERROR') || output.includes('Failed');
        const hasSuccess = output.includes('✅') || output.includes('Success') || output.includes('ACTIVE');
        
        if (hasError && !hasSuccess) {
          console.log('⚠️  Script completed with warnings/errors');
          console.log(output.substring(0, 500));
          return { success: false, step: step.name, canContinue: !step.required };
        } else {
          console.log('✅ Script executed successfully');
          // Show last few lines of output
          const lines = output.split('\n').filter(l => l.trim());
          const lastLines = lines.slice(-5);
          lastLines.forEach(line => {
            if (line.includes('✅') || line.includes('Status') || line.includes('HTTP')) {
              console.log(`   ${line}`);
            }
          });
          return { success: true, step: step.name };
        }
      } catch (error) {
        console.log(`⚠️  Script execution had issues: ${error.message}`);
        if (step.required) {
          console.log('   This step is required. Pipeline may fail.');
        }
        return { success: false, step: step.name, canContinue: !step.required };
      }
    }
  } catch (error) {
    console.log(`❌ Step failed: ${error.message}`);
    return { success: false, step: step.name, canContinue: !step.required };
  }
}

// Main pipeline execution
async function main() {
  console.log('🔄 Pipeline: Activate Workflows & Push Milestone');
  console.log('═══════════════════════════════════════════════════════════════\n');
  console.log('This pipeline will:');
  console.log('1. Check current webhook status');
  console.log('2. Discover correct workflow IDs');
  console.log('3. Attempt to activate workflows via API');
  console.log('4. Verify Knowledge Ingest webhook is active');
  console.log('5. Push milestone to Supabase via n8n');
  console.log('6. Verify milestone storage\n');
  
  const credentials = loadCredentials();
  const results = [];
  let pipelineSuccess = true;
  
  // Execute each step
  for (let i = 0; i < PIPELINE_STEPS.length; i++) {
    const step = PIPELINE_STEPS[i];
    const result = await executeStep(step, i + 1, PIPELINE_STEPS.length, credentials);
    results.push(result);
    
    // If required step failed, mark pipeline as failed but continue
    if (!result.success && step.required) {
      pipelineSuccess = false;
      console.log(`\n⚠️  Required step failed, but continuing pipeline...`);
    }
    
    // Small delay between steps
    if (i < PIPELINE_STEPS.length - 1) {
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }
  
  // Final summary
  console.log('\n' + '═'.repeat(70));
  console.log('📊 PIPELINE SUMMARY');
  console.log('═'.repeat(70) + '\n');
  
  const successful = results.filter(r => r.success).length;
  const failed = results.filter(r => !r.success).length;
  
  console.log(`Total Steps: ${results.length}`);
  console.log(`✅ Successful: ${successful}`);
  console.log(`❌ Failed: ${failed}\n`);
  
  console.log('Step Results:');
  results.forEach((r, i) => {
    const step = PIPELINE_STEPS[i];
    const icon = r.success ? '✅' : '❌';
    const required = step.required ? ' (Required)' : '';
    console.log(`   ${icon} ${step.name}${required}`);
  });
  
  // Final status
  console.log('\n' + '═'.repeat(70));
  if (pipelineSuccess && successful === results.length) {
    console.log('🎉 PIPELINE COMPLETE - All steps successful!');
    console.log('✅ Milestone should now be in Supabase vector database');
  } else if (pipelineSuccess) {
    console.log('⚠️  PIPELINE COMPLETE - Some optional steps had issues');
    console.log('✅ Core functionality completed');
  } else {
    console.log('❌ PIPELINE INCOMPLETE - Some required steps failed');
    console.log('💡 Check the output above for details');
    
    // Check if Knowledge Ingest is the issue
    const knowledgeIngestStep = results.find((r, i) => 
      PIPELINE_STEPS[i].custom === 'verifyKnowledgeIngest'
    );
    
    if (knowledgeIngestStep && !knowledgeIngestStep.success) {
      console.log('\n🔧 RECOMMENDED FIX:');
      console.log('   The Knowledge Ingest webhook is not registered.');
      console.log('   Please toggle the workflow in n8n UI:');
      console.log('   1. Visit: https://n8n.pbradygeorgen.com');
      console.log('   2. Find: "Knowledge Ingest (Crew Memories => Supabase RAG)"');
      console.log('   3. Toggle: OFF → wait 2s → ON');
      console.log('   4. Re-run this pipeline\n');
    }
  }
  
  // Save pipeline results
  const resultsPath = path.join(__dirname, '..', '.backup-ec2-emergency', 'pipeline-results.json');
  fs.writeFileSync(resultsPath, JSON.stringify({
    timestamp: new Date().toISOString(),
    pipelineSuccess,
    summary: { total: results.length, successful, failed },
    results: results.map((r, i) => ({
      step: PIPELINE_STEPS[i].name,
      success: r.success,
      canContinue: r.canContinue !== false
    }))
  }, null, 2));
  
  console.log(`📄 Pipeline results saved to: ${resultsPath}\n`);
  
  process.exit(pipelineSuccess ? 0 : 1);
}

main().catch(error => {
  console.error('❌ Pipeline failed:', error);
  process.exit(1);
});

