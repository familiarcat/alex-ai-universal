#!/usr/bin/env node
/**
 * 🖖 Dashboard E2E Integration Test
 * 
 * Tests end-to-end browser client integration with MCP-N8N controller system
 */

const https = require('https');
const http = require('http');

const DASHBOARD_URL = process.env.DASHBOARD_URL || 'http://localhost:3000';
const TIMEOUT = 10000;

console.log('🧪 Dashboard E2E Integration Test\n');
console.log('═══════════════════════════════════════════════════════════\n');
console.log(`📊 Testing: ${DASHBOARD_URL}\n`);

const results = {
  passed: 0,
  failed: 0,
  tests: []
};

function makeRequest(url, options = {}) {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(url);
    const protocol = urlObj.protocol === 'https:' ? https : http;
    
    const reqOptions = {
      hostname: urlObj.hostname,
      port: urlObj.port || (urlObj.protocol === 'https:' ? 443 : 80),
      path: urlObj.pathname + urlObj.search,
      method: options.method || 'GET',
      headers: options.headers || {},
      timeout: TIMEOUT,
    };

    const req = protocol.request(reqOptions, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        try {
          const parsed = data ? JSON.parse(data) : {};
          resolve({
            success: res.statusCode >= 200 && res.statusCode < 300,
            statusCode: res.statusCode,
            data: parsed,
            raw: data
          });
        } catch (error) {
          resolve({
            success: res.statusCode >= 200 && res.statusCode < 300,
            statusCode: res.statusCode,
            data: data,
            raw: data
          });
        }
      });
    });

    req.on('error', reject);
    req.on('timeout', () => {
      req.destroy();
      reject(new Error('Request timeout'));
    });

    if (options.body) {
      req.write(JSON.stringify(options.body));
    }
    req.end();
  });
}

async function test(name, testFn) {
  try {
    process.stdout.write(`🔍 Test: ${name}... `);
    const result = await testFn();
    if (result.success) {
      console.log(`✅ PASSED`);
      results.passed++;
      results.tests.push({ name, status: 'passed', result });
      return true;
    } else {
      console.log(`❌ FAILED: ${result.error || 'Unknown error'}`);
      results.failed++;
      results.tests.push({ name, status: 'failed', result });
      return false;
    }
  } catch (error) {
    console.log(`❌ FAILED: ${error.message}`);
    results.failed++;
    results.tests.push({ name, status: 'failed', error: error.message });
    return false;
  }
}

async function runTests() {
  // Test 1: Dashboard Health
  await test('Dashboard Health Endpoint', async () => {
    const response = await makeRequest(`${DASHBOARD_URL}/api/health`);
    return {
      success: response.success,
      error: response.success ? null : `Status: ${response.statusCode}`
    };
  });

  // Test 2: Controller Health
  await test('Controller Health Endpoint', async () => {
    const response = await makeRequest(`${DASHBOARD_URL}/api/controller?action=health`);
    return {
      success: response.success && response.data.success !== false,
      error: response.success ? null : `Status: ${response.statusCode}`
    };
  });

  // Test 3: Controller Tools List
  await test('Controller Tools List', async () => {
    const response = await makeRequest(`${DASHBOARD_URL}/api/controller?action=tools`);
    return {
      success: response.success,
      error: response.success ? null : `Status: ${response.statusCode}`
    };
  });

  // Test 4: MCP Status
  await test('MCP Status Endpoint', async () => {
    const response = await makeRequest(`${DASHBOARD_URL}/api/mcp/status`);
    return {
      success: response.success,
      error: response.success ? null : `Status: ${response.statusCode}`
    };
  });

  // Test 5: Dashboard Root
  await test('Dashboard Root Page', async () => {
    const response = await makeRequest(`${DASHBOARD_URL}/`);
    return {
      success: response.statusCode === 200 || response.statusCode === 304,
      error: (response.statusCode === 200 || response.statusCode === 304) ? null : `Status: ${response.statusCode}`
    };
  });

  // Summary
  console.log('\n═══════════════════════════════════════════════════════════');
  console.log('📊 Test Summary');
  console.log('═══════════════════════════════════════════════════════════\n');
  console.log(`✅ Passed: ${results.passed}`);
  console.log(`❌ Failed: ${results.failed}`);
  console.log(`📊 Total: ${results.passed + results.failed}\n`);

  if (results.failed === 0) {
    console.log('🎉 All tests passed! Dashboard E2E integration is working.\n');
    console.log(`🌐 Dashboard available at: ${DASHBOARD_URL}\n`);
    process.exit(0);
  } else {
    console.log('⚠️  Some tests failed. Check the output above for details.\n');
    console.log(`💡 Dashboard may still be starting. Check: ${DASHBOARD_URL}\n`);
    process.exit(1);
  }
}

runTests().catch(error => {
  console.error('❌ Test execution failed:', error);
  process.exit(1);
});
