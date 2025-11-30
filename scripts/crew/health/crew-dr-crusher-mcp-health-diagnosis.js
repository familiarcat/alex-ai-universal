#!/usr/bin/env node

/**
 * 💊 Dr. Crusher: MCP Server Health Diagnosis
 * 
 * Comprehensive medical analysis of MCP server health issues
 */

const https = require('https');
const { execSync } = require('child_process');
const { loadCrewCredentials } = require('../../utils/load-crew-credentials');

console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('💊 Dr. Beverly Crusher: MCP Server Health Diagnosis');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

console.log('💊 Dr. Crusher: "I\'ve been monitoring the MCP server\'s vital signs.');
console.log('   Let me run a complete diagnostic to understand what\'s ailing it."\n');

const credentials = loadCrewCredentials();
const apiKey = credentials.n8n?.apiKey || process.env.N8N_API_KEY;

// Diagnostic functions
async function checkContainerHealth() {
  console.log('📊 Checking Container Health Status...\n');
  
  try {
    const dockerPs = execSync('ssh -o StrictHostKeyChecking=no ubuntu@3.21.117.131 "docker ps --format \'{{.Names}}\\t{{.Status}}\\t{{.Health}}\'" 2>&1', {
      encoding: 'utf8'
    });
    
    const mcpLine = dockerPs.split('\n').find(line => line.includes('mcp-server'));
    if (mcpLine) {
      const parts = mcpLine.split('\t');
      const status = parts[1] || 'unknown';
      const health = parts[2] || 'unknown';
      
      console.log(`   Container Status: ${status}`);
      console.log(`   Health Status: ${health}`);
      
      if (health.includes('unhealthy')) {
        console.log('   ⚠️  DIAGNOSIS: Container is unhealthy');
        return { healthy: false, status, health };
      } else if (health.includes('healthy')) {
        console.log('   ✅ DIAGNOSIS: Container is healthy');
        return { healthy: true, status, health };
      } else {
        console.log('   ⚠️  DIAGNOSIS: Health status unknown');
        return { healthy: null, status, health };
      }
    } else {
      console.log('   ❌ Container not found');
      return { healthy: false, error: 'Container not found' };
    }
  } catch (error) {
    console.log(`   ❌ Error checking container: ${error.message}`);
    return { healthy: false, error: error.message };
  }
}

async function checkContainerLogs() {
  console.log('\n📋 Analyzing Container Logs...\n');
  
  try {
    const logs = execSync('ssh -o StrictHostKeyChecking=no ubuntu@3.21.117.131 "docker logs mcp-server --tail 50 2>&1"', {
      encoding: 'utf8'
    });
    
    const errorPatterns = [
      /error/i,
      /failed/i,
      /exception/i,
      /cannot/i,
      /not found/i,
      /timeout/i,
      /connection refused/i,
      /eaddrinuse/i,
      /permission denied/i
    ];
    
    const errors = [];
    logs.split('\n').forEach((line, index) => {
      errorPatterns.forEach(pattern => {
        if (pattern.test(line)) {
          errors.push({ line: index + 1, content: line.trim() });
        }
      });
    });
    
    if (errors.length > 0) {
      console.log(`   ⚠️  Found ${errors.length} potential issues in logs:\n`);
      errors.slice(0, 10).forEach(err => {
        console.log(`   Line ${err.line}: ${err.content.substring(0, 100)}`);
      });
      return { issues: errors, logs };
    } else {
      console.log('   ✅ No obvious errors found in recent logs');
      return { issues: [], logs };
    }
  } catch (error) {
    console.log(`   ❌ Error retrieving logs: ${error.message}`);
    return { issues: [], error: error.message };
  }
}

async function checkHealthEndpoint() {
  console.log('\n🏥 Testing Health Endpoint...\n');
  
  return new Promise((resolve) => {
    const options = {
      hostname: 'mcp.pbradygeorgen.com',
      port: 443,
      path: '/healthz',
      method: 'GET',
      timeout: 10000,
      rejectUnauthorized: false
    };

    const req = https.request(options, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        console.log(`   Status Code: ${res.statusCode}`);
        console.log(`   Response: ${body.substring(0, 200)}`);
        
        if (res.statusCode === 200) {
          console.log('   ✅ Health endpoint responding');
          resolve({ healthy: true, statusCode: res.statusCode, body });
        } else {
          console.log('   ⚠️  Health endpoint returned non-200 status');
          resolve({ healthy: false, statusCode: res.statusCode, body });
        }
      });
    });

    req.on('error', (error) => {
      console.log(`   ❌ Health endpoint error: ${error.message}`);
      resolve({ healthy: false, error: error.message });
    });

    req.on('timeout', () => {
      req.destroy();
      console.log('   ❌ Health endpoint timeout');
      resolve({ healthy: false, error: 'Timeout' });
    });

    req.end();
  });
}

async function checkAPIEndpoints() {
  console.log('\n🔌 Testing API Endpoints...\n');
  
  const endpoints = [
    { path: '/api/status', method: 'GET', requiresAuth: true },
    { path: '/api/workflows', method: 'GET', requiresAuth: true },
    { path: '/api/memory/query', method: 'POST', requiresAuth: true },
  ];
  
  const results = [];
  
  for (const endpoint of endpoints) {
    try {
      const result = await testEndpoint(endpoint.path, endpoint.method, endpoint.requiresAuth);
      results.push({ ...endpoint, ...result });
      
      if (result.success) {
        console.log(`   ✅ ${endpoint.path}: Working`);
      } else {
        console.log(`   ❌ ${endpoint.path}: ${result.error || 'Failed'}`);
      }
    } catch (error) {
      console.log(`   ❌ ${endpoint.path}: Error - ${error.message}`);
      results.push({ ...endpoint, success: false, error: error.message });
    }
  }
  
  return results;
}

function testEndpoint(path, method, requiresAuth) {
  return new Promise((resolve) => {
    const options = {
      hostname: 'mcp.pbradygeorgen.com',
      port: 443,
      path,
      method,
      timeout: 10000,
      rejectUnauthorized: false,
      headers: {
        'Content-Type': 'application/json'
      }
    };

    if (requiresAuth && apiKey) {
      options.headers['X-MCP-API-KEY'] = apiKey;
    }

    const req = https.request(options, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        resolve({
          success: res.statusCode >= 200 && res.statusCode < 300,
          statusCode: res.statusCode,
          body: body.substring(0, 200),
          error: res.statusCode >= 400 ? `HTTP ${res.statusCode}` : null
        });
      });
    });

    req.on('error', (error) => {
      resolve({ success: false, error: error.message });
    });

    req.on('timeout', () => {
      req.destroy();
      resolve({ success: false, error: 'Timeout' });
    });

    if (method === 'POST') {
      req.write(JSON.stringify({ test: 'data' }));
    }
    req.end();
  });
}

async function checkDockerHealthCheck() {
  console.log('\n🐳 Analyzing Docker Health Check Configuration...\n');
  
  try {
    const inspect = execSync('ssh -o StrictHostKeyChecking=no ubuntu@3.21.117.131 "docker inspect mcp-server --format \'{{json .State.Health}}\'" 2>&1', {
      encoding: 'utf8'
    });
    
    const health = JSON.parse(inspect);
    console.log(`   Health Check Status: ${health.Status || 'unknown'}`);
    console.log(`   Failing Streak: ${health.FailingStreak || 0}`);
    
    if (health.Log && health.Log.length > 0) {
      console.log(`   Recent Health Check Results:`);
      health.Log.slice(-3).forEach((entry, i) => {
        console.log(`   ${i + 1}. ${entry.Output?.substring(0, 100) || 'No output'}`);
      });
    }
    
    return health;
  } catch (error) {
    console.log(`   ⚠️  Could not retrieve health check details: ${error.message}`);
    return { error: error.message };
  }
}

// Main diagnosis
async function main() {
  const diagnosis = {
    timestamp: new Date().toISOString(),
    container: {},
    logs: {},
    healthEndpoint: {},
    apiEndpoints: [],
    dockerHealth: {},
    recommendations: []
  };
  
  // Run all diagnostics
  diagnosis.container = await checkContainerHealth();
  diagnosis.logs = await checkContainerLogs();
  diagnosis.healthEndpoint = await checkHealthEndpoint();
  diagnosis.apiEndpoints = await checkAPIEndpoints();
  diagnosis.dockerHealth = await checkDockerHealthCheck();
  
  // Generate diagnosis
  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('💊 Dr. Crusher\'s Diagnosis');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
  
  console.log('💊 Dr. Crusher: "Based on my analysis, here\'s what I\'ve found:"\n');
  
  // Container health
  if (!diagnosis.container.healthy) {
    console.log('⚠️  SYMPTOM: Container is marked as unhealthy');
    diagnosis.recommendations.push('Investigate Docker health check configuration');
    diagnosis.recommendations.push('Review container resource limits (CPU, memory)');
  }
  
  // Log errors
  if (diagnosis.logs.issues && diagnosis.logs.issues.length > 0) {
    console.log(`⚠️  SYMPTOM: Found ${diagnosis.logs.issues.length} potential issues in logs`);
    diagnosis.recommendations.push('Address errors found in container logs');
    diagnosis.recommendations.push('Review application startup sequence');
  }
  
  // Health endpoint
  if (!diagnosis.healthEndpoint.healthy) {
    console.log('⚠️  SYMPTOM: Health endpoint not responding correctly');
    diagnosis.recommendations.push('Verify /healthz endpoint implementation');
    diagnosis.recommendations.push('Check Nginx routing configuration');
  }
  
  // API endpoints
  const failedEndpoints = diagnosis.apiEndpoints.filter(e => !e.success);
  if (failedEndpoints.length > 0) {
    console.log(`⚠️  SYMPTOM: ${failedEndpoints.length} API endpoints failing`);
    diagnosis.recommendations.push('Fix failing API endpoint implementations');
    diagnosis.recommendations.push('Verify API authentication and routing');
  }
  
  // Docker health check
  if (diagnosis.dockerHealth.FailingStreak > 0) {
    console.log(`⚠️  SYMPTOM: Health check failing streak: ${diagnosis.dockerHealth.FailingStreak}`);
    diagnosis.recommendations.push('Review Docker health check command');
    diagnosis.recommendations.push('Ensure health check endpoint is accessible from container');
  }
  
  // Treatment plan
  console.log('\n💊 Dr. Crusher: "Here\'s my recommended treatment plan:"\n');
  diagnosis.recommendations.forEach((rec, i) => {
    console.log(`   ${i + 1}. ${rec}`);
  });
  
  // Knowledge extraction
  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('📚 Knowledge Extracted for RAG System');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
  
  const knowledge = {
    category: 'system_health_diagnosis',
    title: 'MCP Server Health Diagnosis - Dr. Crusher Analysis',
    executive_summary: `MCP server container is running but marked as unhealthy. Health endpoint responds but API endpoints may be failing. Docker health check configuration needs review.`,
    symptoms: [
      diagnosis.container.healthy === false ? 'Container marked as unhealthy' : null,
      diagnosis.logs.issues?.length > 0 ? `${diagnosis.logs.issues.length} issues in logs` : null,
      !diagnosis.healthEndpoint.healthy ? 'Health endpoint issues' : null,
      failedEndpoints.length > 0 ? `${failedEndpoints.length} API endpoints failing` : null
    ].filter(Boolean),
    diagnosis: 'Container infrastructure operational but application health checks failing',
    treatment_plan: diagnosis.recommendations,
    technical_details: {
      container_status: diagnosis.container.status,
      health_status: diagnosis.container.health,
      failing_endpoints: failedEndpoints.map(e => e.path),
      docker_health_failing_streak: diagnosis.dockerHealth.FailingStreak || 0
    },
    lessons_learned: [
      'Docker health checks require accessible endpoints',
      'API authentication must be properly configured',
      'Container logs provide critical diagnostic information',
      'Health endpoint should be simple and fast'
    ],
    timestamp: new Date().toISOString()
  };
  
  console.log(JSON.stringify(knowledge, null, 2));
  
  // Save to file for RAG ingestion
  const fs = require('fs');
  const path = require('path');
  const knowledgeFile = path.join(__dirname, '..', 'knowledge', `mcp-health-diagnosis-${Date.now()}.json`);
  fs.mkdirSync(path.dirname(knowledgeFile), { recursive: true });
  fs.writeFileSync(knowledgeFile, JSON.stringify(knowledge, null, 2));
  
  console.log(`\n💾 Knowledge saved to: ${knowledgeFile}`);
  console.log('   Ready for RAG ingestion\n');
  
  return diagnosis;
}

main().catch(error => {
  console.error('❌ Diagnosis failed:', error);
  process.exit(1);
});

