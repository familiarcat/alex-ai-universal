#!/usr/bin/env node

/**
 * 🖖 Automated Migration & RAG Integration
 * 
 * Automates the complete E2E flow:
 * 1. Migrates old milestones folder (when safe)
 * 2. Integrates crew memories with milestones
 * 3. Optimizes RAG vectors
 * 4. Sends to Supabase via n8n/MCP controller
 * 5. Updates Next.js accessible endpoints
 * 
 * E2E Flow:
 * Next.js (view) → Controller (n8n/MCP) → Supabase (vector storage)
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const { checkMilestonesFolderStatus } = require('./check-milestones-folder-status');
const { integrateCrewMemoriesWithMilestones } = require('./crew-memory-milestone-integration');
const { optimizeRAGVectors } = require('./rag-vector-optimization');

async function automatedMigrationAndRAGIntegration() {
  console.log('🖖 Automated Migration & RAG Integration System\n');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
  
  const rootDir = process.cwd();
  
  // Step 1: Check milestones folder status
  console.log('📋 Step 1: Checking milestones folder status...\n');
  const status = checkMilestonesFolderStatus();
  
  if (status.canRetire) {
    console.log('✅ Safe to migrate old milestones folder\n');
    // Archive old folder (don't delete yet)
    const milestonesDir = path.join(rootDir, 'milestones');
    const archiveDir = path.join(rootDir, 'milestones-archived');
    
    if (fs.existsSync(milestonesDir) && !fs.existsSync(archiveDir)) {
      console.log('📦 Archiving old milestones folder...\n');
      fs.renameSync(milestonesDir, archiveDir);
      console.log('✅ Archived to milestones-archived/\n');
    }
  } else {
    console.log('⚠️  Keeping milestones folder active (not ready to migrate)\n');
  }
  
  // Step 2: Integrate crew memories with milestones
  console.log('🔗 Step 2: Integrating crew memories with milestones...\n');
  const integrationReport = await integrateCrewMemoriesWithMilestones();
  
  // Step 3: Optimize RAG vectors
  console.log('⚡ Step 3: Optimizing RAG vectors...\n');
  const { vectorRecords, supabasePayload, summary } = await optimizeRAGVectors();
  
  // Step 4: Send to Supabase via n8n/MCP
  console.log('📤 Step 4: Sending optimized vectors to Supabase...\n');
  await sendToSupabase(supabasePayload);
  
  // Step 5: Update Next.js accessible endpoints
  console.log('🌐 Step 5: Updating Next.js accessible endpoints...\n');
  await updateNextJSEndpoints(summary, integrationReport);
  
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
  console.log('✅ Automated migration and RAG integration complete!\n');
  
  return {
    status,
    integrationReport,
    vectorRecords,
    summary
  };
}

async function sendToSupabase(payload) {
  const rootDir = process.cwd();
  const n8nWebhookUrl = process.env.N8N_WEBHOOK_URL || 'https://n8n.pbradygeorgen.com/webhook/rag-vector-optimization';
  
  try {
    // Check if n8n webhook is available
    const https = require('https');
    const url = require('url');
    
    const parsedUrl = url.parse(n8nWebhookUrl);
    const postData = JSON.stringify(payload);
    
    const options = {
      hostname: parsedUrl.hostname,
      port: parsedUrl.port || 443,
      path: parsedUrl.path,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData)
      },
      timeout: 10000
    };
    
    return new Promise((resolve, reject) => {
      const req = https.request(options, (res) => {
        let data = '';
        res.on('data', (chunk) => { data += chunk; });
        res.on('end', () => {
          if (res.statusCode === 200 || res.statusCode === 201) {
            console.log('✅ Successfully sent to Supabase via n8n\n');
            resolve(JSON.parse(data));
          } else {
            console.warn(`⚠️  n8n returned status ${res.statusCode}, saving payload for manual processing\n`);
            // Save payload for manual processing
            const payloadPath = path.join(rootDir, 'reports/pending-rag-payload.json');
            fs.writeFileSync(payloadPath, JSON.stringify(payload, null, 2));
            resolve(null);
          }
        });
      });
      
      req.on('error', (error) => {
        console.warn(`⚠️  Could not send to n8n: ${error.message}\n`);
        // Save payload for manual processing
        const payloadPath = path.join(rootDir, 'reports/pending-rag-payload.json');
        fs.writeFileSync(payloadPath, JSON.stringify(payload, null, 2));
        resolve(null);
      });
      
      req.write(postData);
      req.end();
    });
  } catch (error) {
    console.warn(`⚠️  Error sending to Supabase: ${error.message}\n`);
    // Save payload for manual processing
    const payloadPath = path.join(rootDir, 'reports/pending-rag-payload.json');
    fs.writeFileSync(payloadPath, JSON.stringify(payload, null, 2));
    return null;
  }
}

async function updateNextJSEndpoints(summary, integrationReport) {
  const rootDir = process.cwd();
  // Check both possible dashboard locations
  let dashboardDir = path.join(rootDir, 'projects/dashboard');
  if (!fs.existsSync(dashboardDir)) {
    dashboardDir = path.join(rootDir, 'dashboard');
  }
  if (!fs.existsSync(dashboardDir)) {
    console.warn('⚠️  Dashboard directory not found, skipping Next.js endpoint updates\n');
    return;
  }
  const apiDir = path.join(dashboardDir, 'app/api/rag');
  
  // Create API directory if it doesn't exist
  if (!fs.existsSync(apiDir)) {
    fs.mkdirSync(apiDir, { recursive: true });
  }
  
  // Create optimized RAG endpoint
  const endpointPath = path.join(apiDir, 'optimized/route.ts');
  const endpointContent = `import { NextResponse } from 'next/server';

/**
 * 🖖 Optimized RAG Endpoint
 * 
 * Returns optimized RAG data for crew member access
 * E2E: Next.js → Controller (n8n/MCP) → Supabase
 */

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const crewMember = searchParams.get('crewMember');
    const category = searchParams.get('category');
    const limit = parseInt(searchParams.get('limit') || '10');
    
    // Query Supabase via MCP or n8n
    // This is a placeholder - actual implementation would call MCP server
    const response = await fetch(
      \`\${process.env.MCP_SERVER_URL || 'http://localhost:3001'}/api/rag/query\`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          crewMember,
          category,
          limit,
          optimized: true
        })
      }
    );
    
    if (!response.ok) {
      throw new Error('RAG query failed');
    }
    
    const data = await response.json();
    
    return NextResponse.json({
      success: true,
      data,
      summary: {
        totalRecords: data.length,
        crewMember,
        category
      }
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
`;
  
  fs.writeFileSync(endpointPath, endpointContent);
  console.log('✅ Created Next.js RAG endpoint: app/api/rag/optimized/route.ts\n');
  
  // Create crew memory summary endpoint
  const crewSummaryPath = path.join(apiDir, 'crew-summary/route.ts');
  const crewSummaryContent = `import { NextResponse } from 'next/server';

/**
 * 🖖 Crew Memory Summary Endpoint
 * 
 * Returns crew member memory summaries compared to milestones
 */

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const crewMember = searchParams.get('crewMember');
    
    // Load integration report
    const fs = require('fs');
    const path = require('path');
    const reportPath = path.join(process.cwd(), 'reports/crew-memory-milestone-integration.json');
    
    if (!fs.existsSync(reportPath)) {
      return NextResponse.json({
        success: false,
        error: 'Integration report not found'
      }, { status: 404 });
    }
    
    const report = JSON.parse(fs.readFileSync(reportPath, 'utf-8'));
    
    let crewSummary = report.crewSummaries;
    if (crewMember) {
      crewSummary = crewSummary.filter(cs => cs.crewMemberId === crewMember);
    }
    
    return NextResponse.json({
      success: true,
      data: crewSummary,
      timestamp: report.timestamp
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
`;
  
  fs.writeFileSync(crewSummaryPath, crewSummaryContent);
  console.log('✅ Created crew summary endpoint: app/api/rag/crew-summary/route.ts\n');
}

if (require.main === module) {
  automatedMigrationAndRAGIntegration().catch(console.error);
}

module.exports = { automatedMigrationAndRAGIntegration };

