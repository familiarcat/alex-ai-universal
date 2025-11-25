#!/usr/bin/env node

/**
 * 🖖 Test MCP Integration
 * 
 * Tests connectivity to MCP server and verifies all endpoints
 * 
 * Reviewed by: Lieutenant Commander La Forge (Infrastructure)
 */

const https = require('https');
const http = require('http');
const fs = require('fs');
const path = require('path');

// Load credentials
function loadCredentials() {
  let mcpUrl = process.env.MCP_URL || process.env.NEXT_PUBLIC_MCP_URL || 'https://mcp.pbradygeorgen.com';
  let mcpApiKey = process.env.MCP_API_KEY || process.env.N8N_API_KEY;
  
  // Try ~/.zshrc if not in environment
  if (!mcpApiKey) {
    try {
      const zshrcPath = path.join(process.env.HOME, '.zshrc');
      const zshrcContent = fs.readFileSync(zshrcPath, 'utf8');
      
      mcpUrl = mcpUrl || 
        zshrcContent.match(/export MCP_URL=["']?([^"'\n]+)["']?/)?.[1] ||
        zshrcContent.match(/export NEXT_PUBLIC_MCP_URL=["']?([^"'\n]+)["']?/)?.[1] ||
        'https://mcp.pbradygeorgen.com';
      
      mcpApiKey = mcpApiKey ||
        zshrcContent.match(/export MCP_API_KEY=["']?([^"'\n]+)["']?/)?.[1] ||
        zshrcContent.match(/export N8N_API_KEY=["']?([^"'\n]+)["']?/)?.[1];
    } catch (error) {
      // ~/.zshrc not found
    }
  }
  
  if (!mcpApiKey) {
    throw new Error('MCP_API_KEY or N8N_API_KEY not found. Please set in environment or ~/.zshrc');
  }
  
  return { mcpUrl, mcpApiKey };
}

async function testMCPEndpoint(endpoint, payload = {}) {
  return new Promise((resolve, reject) => {
    const { mcpUrl, mcpApiKey } = loadCredentials();
    const url = new URL(`${endpoint}`, mcpUrl);
    const isHttps = url.protocol === 'https:';
    const client = isHttps ? https : http;
    
    const options = {
      hostname: url.hostname,
      port: url.port || (isHttps ? 443 : 80),
      path: url.pathname,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-MCP-API-KEY': mcpApiKey,
      },
    };
    
    const req = client.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          resolve({
            endpoint,
            status: res.statusCode,
            success: res.statusCode >= 200 && res.statusCode < 300,
            data: json,
          });
        } catch (e) {
          resolve({
            endpoint,
            status: res.statusCode,
            success: res.statusCode >= 200 && res.statusCode < 300,
            data: { raw: data },
          });
        }
      });
    });
    
    req.on('error', reject);
    req.write(JSON.stringify(payload));
    req.end();
  });
}

async function testMCPIntegration() {
  console.log('\n🖖 Testing MCP Integration');
  console.log('═'.repeat(60) + '\n');
  
  try {
    const { mcpUrl } = loadCredentials();
    console.log(`📡 MCP Server: ${mcpUrl}\n`);
    
    // Test health check first
    console.log('🏥 Testing health check...');
    try {
      const healthUrl = new URL('/healthz', mcpUrl);
      const isHttps = healthUrl.protocol === 'https:';
      const client = isHttps ? https : http;
      
      await new Promise((resolve, reject) => {
        const req = client.request({
          hostname: healthUrl.hostname,
          port: healthUrl.port || (isHttps ? 443 : 80),
          path: healthUrl.pathname,
          method: 'GET',
        }, (res) => {
          let data = '';
          res.on('data', (chunk) => data += chunk);
          res.on('end', () => {
            if (res.statusCode === 200) {
              console.log('   ✅ MCP server is healthy\n');
              resolve(true);
            } else {
              console.log(`   ⚠️  Health check returned ${res.statusCode}\n`);
              resolve(false);
            }
          });
        });
        req.on('error', reject);
        req.end();
      });
    } catch (error) {
      console.log(`   ❌ Health check failed: ${error.message}\n`);
      console.log('   ⚠️  MCP server may not be accessible\n');
    }
    
    // Test endpoints
    const endpoints = [
      { name: 'knowledge/query', payload: { action: 'query', limit: 10 } },
      { name: 'crew/stats', payload: { action: 'get_stats', limit: 10 } },
      { name: 'learning/metrics', payload: { action: 'get_metrics', limit: 10 } },
      { name: 'project/recommendations', payload: { action: 'get_recommendations', limit: 5 } },
      { name: 'security/assessment', payload: { action: 'get_assessment' } },
      { name: 'cost/optimization', payload: { action: 'get_cost_data' } },
      { name: 'ux/analytics', payload: { action: 'get_ux_data' } },
      { name: 'ai/impact', payload: { action: 'get_assessment' } },
      { name: 'process/documentation', payload: { action: 'get_processes' } },
      { name: 'data/sources', payload: { action: 'get_data_sources' } },
      { name: 'documentation', payload: { action: 'get_documentation', limit: 10 } },
    ];
    
    console.log('🧪 Testing MCP endpoints...\n');
    const results = [];
    
    for (const endpoint of endpoints) {
      try {
        const result = await testMCPEndpoint(endpoint.name, endpoint.payload);
        results.push(result);
        
        const status = result.success ? '✅' : '❌';
        console.log(`${status} ${endpoint.name}: ${result.status} ${result.success ? 'OK' : 'FAILED'}`);
        
        if (!result.success) {
          console.log(`   Error: ${JSON.stringify(result.data.error || result.data)}`);
        }
      } catch (error) {
        results.push({
          endpoint: endpoint.name,
          status: 0,
          success: false,
          error: error.message,
        });
        console.log(`❌ ${endpoint.name}: ERROR - ${error.message}`);
      }
    }
    
    // Summary
    console.log('\n' + '═'.repeat(60));
    console.log('📊 Test Summary:');
    console.log('═'.repeat(60));
    
    const successful = results.filter(r => r.success).length;
    const failed = results.filter(r => !r.success).length;
    
    console.log(`   Total Endpoints: ${results.length}`);
    console.log(`   ✅ Successful: ${successful}`);
    console.log(`   ❌ Failed: ${failed}`);
    console.log(`   Success Rate: ${((successful / results.length) * 100).toFixed(1)}%\n`);
    
    if (failed > 0) {
      console.log('⚠️  Failed Endpoints:');
      results.filter(r => !r.success).forEach(r => {
        console.log(`   - ${r.endpoint}: ${r.error || r.data?.error || 'Unknown error'}`);
      });
      console.log('');
    }
    
    if (successful === results.length) {
      console.log('✅ All MCP endpoints are operational!\n');
    } else if (successful > 0) {
      console.log('⚠️  Some endpoints failed. Check MCP server logs.\n');
    } else {
      console.log('❌ All endpoints failed. MCP server may be down or misconfigured.\n');
    }
    
  } catch (error) {
    console.error('\n❌ Test failed:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

testMCPIntegration().catch(console.error);

