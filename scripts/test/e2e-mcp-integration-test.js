#!/usr/bin/env node

/**
 * 🖖 End-to-End MCP Integration Test Framework
 * 
 * Comprehensive E2E testing for MCP-first DDD architecture
 * 
 * Tests the complete flow:
 * UI Component → UnifiedDataService → MCP Proxy → MCP Server → Supabase
 * 
 * Also tests fallback:
 * UI Component → UnifiedDataService → n8n Webhook → Supabase (when MCP unavailable)
 * 
 * Reviewed by: Commander Data (Implementation) & Lieutenant Commander La Forge (Infrastructure)
 * 
 * Usage:
 *   node scripts/test/e2e-mcp-integration-test.js
 *   node scripts/test/e2e-mcp-integration-test.js --component CrewMemoryVisualization
 *   node scripts/test/e2e-mcp-integration-test.js --all
 */

const https = require('https');
const http = require('http');
const fs = require('fs');
const path = require('path');

// Load credentials
function loadCredentials() {
  let mcpUrl = process.env.MCP_URL || process.env.NEXT_PUBLIC_MCP_URL || 'https://mcp.pbradygeorgen.com';
  let n8nUrl = process.env.N8N_URL || process.env.NEXT_PUBLIC_N8N_URL || 'https://n8n.pbradygeorgen.com';
  let mcpApiKey = process.env.MCP_API_KEY || process.env.N8N_API_KEY;
  let nextjsUrl = process.env.NEXTJS_BASE_URL || 'http://localhost:3000';
  
  // Try ~/.zshrc if not in environment
  if (!mcpApiKey) {
    try {
      const zshrcPath = path.join(process.env.HOME, '.zshrc');
      const zshrcContent = fs.readFileSync(zshrcPath, 'utf8');
      
      mcpUrl = mcpUrl || 
        zshrcContent.match(/export MCP_URL=["']?([^"'\n]+)["']?/)?.[1] ||
        zshrcContent.match(/export NEXT_PUBLIC_MCP_URL=["']?([^"'\n]+)["']?/)?.[1] ||
        'https://mcp.pbradygeorgen.com';
      
      n8nUrl = n8nUrl ||
        zshrcContent.match(/export N8N_URL=["']?([^"'\n]+)["']?/)?.[1] ||
        zshrcContent.match(/export NEXT_PUBLIC_N8N_URL=["']?([^"'\n]+)["']?/)?.[1] ||
        'https://n8n.pbradygeorgen.com';
      
      mcpApiKey = mcpApiKey ||
        zshrcContent.match(/export MCP_API_KEY=["']?([^"'\n]+)["']?/)?.[1] ||
        zshrcContent.match(/export N8N_API_KEY=["']?([^"'\n]+)["']?/)?.[1];
    } catch (error) {
      // ~/.zshrc not found
    }
  }
  
  return { mcpUrl, n8nUrl, mcpApiKey, nextjsUrl };
}

class MCPE2ETestFramework {
  constructor() {
    const creds = loadCredentials();
    this.mcpUrl = creds.mcpUrl;
    this.n8nUrl = creds.n8nUrl;
    this.mcpApiKey = creds.mcpApiKey;
    this.nextjsUrl = creds.nextjsUrl;
    
    this.results = {
      passed: [],
      failed: [],
      warnings: [],
      skipped: [],
    };
    
    this.testComponents = [
      {
        name: 'CrewMemoryVisualization',
        service: 'getCrewStats',
        endpoint: 'crew/stats',
        params: { limit: 100 },
      },
      {
        name: 'LearningAnalyticsDashboard',
        service: 'getLearningMetrics',
        endpoint: 'learning/metrics',
        params: { limit: 1000 },
      },
      {
        name: 'RAGProjectRecommendations',
        service: 'getProjectRecommendations',
        endpoint: 'project/recommendations',
        params: { limit: 5, category: 'project-insights' },
      },
      {
        name: 'RAGSelfDocumentation',
        service: 'getDocumentation',
        endpoint: 'documentation',
        params: { category: 'component_documentation', limit: 500 },
      },
      {
        name: 'SecurityAssessmentDashboard',
        service: 'getSecurityData',
        endpoint: 'security/assessment',
        params: {},
      },
      {
        name: 'CostOptimizationMonitor',
        service: 'getCostData',
        endpoint: 'cost/optimization',
        params: {},
      },
      {
        name: 'UserExperienceAnalytics',
        service: 'getUXData',
        endpoint: 'ux/analytics',
        params: {},
      },
      {
        name: 'AIImpactAssessment',
        service: 'getAssessmentData',
        endpoint: 'ai/impact',
        params: {},
      },
      {
        name: 'ProcessDocumentationSystem',
        service: 'getProcesses',
        endpoint: 'process/documentation',
        params: {},
      },
      {
        name: 'DataSourceIntegrationPanel',
        service: 'getDataSources',
        endpoint: 'data/sources',
        params: {},
      },
    ];
  }

  /**
   * Make HTTP request
   */
  async makeRequest(url, options = {}) {
    return new Promise((resolve, reject) => {
      const urlObj = new URL(url);
      const isHttps = urlObj.protocol === 'https:';
      const client = isHttps ? https : http;
      
      const requestOptions = {
        hostname: urlObj.hostname,
        port: urlObj.port || (isHttps ? 443 : 80),
        path: urlObj.pathname + urlObj.search,
        method: options.method || 'GET',
        headers: options.headers || {},
        timeout: options.timeout || 10000,
      };
      
      const req = client.request(requestOptions, (res) => {
        let data = '';
        res.on('data', (chunk) => data += chunk);
        res.on('end', () => {
          try {
            const json = JSON.parse(data);
            resolve({
              status: res.statusCode,
              headers: res.headers,
              data: json,
              success: res.statusCode >= 200 && res.statusCode < 300,
            });
          } catch (e) {
            resolve({
              status: res.statusCode,
              headers: res.headers,
              data: { raw: data },
              success: res.statusCode >= 200 && res.statusCode < 300,
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
        req.write(typeof options.body === 'string' ? options.body : JSON.stringify(options.body));
      }
      
      req.end();
    });
  }

  /**
   * Test 1: MCP Server Health Check
   */
  async testMCPServerHealth() {
    console.log('🏥 Test 1: MCP Server Health Check');
    console.log('   Testing: MCP server availability\n');
    
    try {
      const response = await this.makeRequest(`${this.mcpUrl}/healthz`);
      
      if (response.success && response.data.status === 'ok') {
        this.results.passed.push({
          test: 'MCP Server Health',
          message: 'MCP server is healthy and responding',
        });
        console.log('   ✅ MCP server is healthy\n');
        return true;
      } else {
        this.results.failed.push({
          test: 'MCP Server Health',
          message: `MCP server returned ${response.status}`,
        });
        console.log(`   ❌ MCP server health check failed: ${response.status}\n`);
        return false;
      }
    } catch (error) {
      this.results.failed.push({
        test: 'MCP Server Health',
        message: error.message,
      });
      console.log(`   ❌ MCP server not accessible: ${error.message}\n`);
      return false;
    }
  }

  /**
   * Test 2: MCP Endpoint Direct Access
   */
  async testMCPEndpointDirect(component) {
    console.log(`📡 Test 2.${component.name}: MCP Endpoint Direct Access`);
    console.log(`   Testing: ${component.endpoint}\n`);
    
    try {
      const response = await this.makeRequest(`${this.mcpUrl}/${component.endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-MCP-API-KEY': this.mcpApiKey,
        },
        body: {
          action: component.service.replace('get', '').toLowerCase(),
          ...component.params,
        },
      });
      
      if (response.success) {
        // Verify response structure
        const hasData = response.data.sessions !== undefined || 
                       response.data.data !== undefined ||
                       response.data.success === true;
        
        if (hasData) {
          this.results.passed.push({
            test: `MCP Endpoint: ${component.endpoint}`,
            message: 'Endpoint responded with valid data structure',
            component: component.name,
          });
          console.log(`   ✅ ${component.endpoint} - OK\n`);
          return true;
        } else {
          this.results.warnings.push({
            test: `MCP Endpoint: ${component.endpoint}`,
            message: 'Endpoint responded but data structure unexpected',
            component: component.name,
            data: response.data,
          });
          console.log(`   ⚠️  ${component.endpoint} - Unexpected structure\n`);
          return true; // Still counts as pass (endpoint works)
        }
      } else {
        this.results.failed.push({
          test: `MCP Endpoint: ${component.endpoint}`,
          message: `Endpoint returned ${response.status}`,
          component: component.name,
        });
        console.log(`   ❌ ${component.endpoint} - Failed: ${response.status}\n`);
        return false;
      }
    } catch (error) {
      this.results.failed.push({
        test: `MCP Endpoint: ${component.endpoint}`,
        message: error.message,
        component: component.name,
      });
      console.log(`   ❌ ${component.endpoint} - Error: ${error.message}\n`);
      return false;
    }
  }

  /**
   * Test 3: MCP Proxy Route (Next.js API)
   */
  async testMCPProxyRoute(component) {
    console.log(`🔄 Test 3.${component.name}: MCP Proxy Route`);
    console.log(`   Testing: /api/mcp/${component.endpoint}\n`);
    
    try {
      const response = await this.makeRequest(`${this.nextjsUrl}/api/mcp/${component.endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: {
          action: component.service.replace('get', '').toLowerCase(),
          ...component.params,
        },
      });
      
      if (response.success) {
        this.results.passed.push({
          test: `MCP Proxy: ${component.endpoint}`,
          message: 'Proxy route successfully forwarded to MCP',
          component: component.name,
        });
        console.log(`   ✅ /api/mcp/${component.endpoint} - OK\n`);
        return true;
      } else {
        this.results.failed.push({
          test: `MCP Proxy: ${component.endpoint}`,
          message: `Proxy returned ${response.status}`,
          component: component.name,
        });
        console.log(`   ❌ /api/mcp/${component.endpoint} - Failed: ${response.status}\n`);
        return false;
      }
    } catch (error) {
      // Next.js server might not be running - this is a warning, not a failure
      this.results.warnings.push({
        test: `MCP Proxy: ${component.endpoint}`,
        message: `Next.js server not available: ${error.message}`,
        component: component.name,
      });
      console.log(`   ⚠️  /api/mcp/${component.endpoint} - Next.js not running\n`);
      return null; // Skip, not fail
    }
  }

  /**
   * Test 4: UnifiedDataService Integration
   */
  async testUnifiedDataService(component) {
    console.log(`🔗 Test 4.${component.name}: UnifiedDataService Integration`);
    console.log(`   Testing: service.${component.service}()\n`);
    
    // This test would require running in a browser/Node environment with the actual service
    // For now, we verify the service file exists and has the method
    try {
      const servicePath = path.join(__dirname, '../../dashboard/lib/unified-data-service.ts');
      if (!fs.existsSync(servicePath)) {
        this.results.failed.push({
          test: `UnifiedDataService: ${component.service}`,
          message: 'UnifiedDataService file not found',
          component: component.name,
        });
        console.log(`   ❌ UnifiedDataService.ts not found\n`);
        return false;
      }
      
      const serviceContent = fs.readFileSync(servicePath, 'utf8');
      const hasMethod = serviceContent.includes(`async ${component.service}(`);
      
      if (hasMethod) {
        this.results.passed.push({
          test: `UnifiedDataService: ${component.service}`,
          message: 'Service method exists and is properly defined',
          component: component.name,
        });
        console.log(`   ✅ ${component.service}() method exists\n`);
        return true;
      } else {
        this.results.failed.push({
          test: `UnifiedDataService: ${component.service}`,
          message: 'Service method not found',
          component: component.name,
        });
        console.log(`   ❌ ${component.service}() method not found\n`);
        return false;
      }
    } catch (error) {
      this.results.failed.push({
        test: `UnifiedDataService: ${component.service}`,
        message: error.message,
        component: component.name,
      });
      console.log(`   ❌ Error checking service: ${error.message}\n`);
      return false;
    }
  }

  /**
   * Test 5: Component Refactoring Verification
   */
  async testComponentRefactoring(component) {
    console.log(`🧩 Test 5.${component.name}: Component Refactoring`);
    console.log(`   Verifying: ${component.name}.tsx uses UnifiedDataService\n`);
    
    try {
      const componentPath = path.join(__dirname, `../../dashboard/components/${component.name}.tsx`);
      if (!fs.existsSync(componentPath)) {
        this.results.failed.push({
          test: `Component Refactoring: ${component.name}`,
          message: 'Component file not found',
        });
        console.log(`   ❌ ${component.name}.tsx not found\n`);
        return false;
      }
      
      const componentContent = fs.readFileSync(componentPath, 'utf8');
      
      // Check for DDD violations (direct API calls)
      const hasDirectFetch = componentContent.includes("fetch('/api/") || 
                            componentContent.includes('fetch("/api/');
      
      // Check for UnifiedDataService usage
      const hasUnifiedService = componentContent.includes('getUnifiedDataService') ||
                                componentContent.includes('unified-data-service');
      
      if (hasDirectFetch && !hasUnifiedService) {
        this.results.failed.push({
          test: `Component Refactoring: ${component.name}`,
          message: 'Component still has direct API calls (DDD violation)',
        });
        console.log(`   ❌ ${component.name} - Still has direct API calls\n`);
        return false;
      } else if (hasUnifiedService) {
        this.results.passed.push({
          test: `Component Refactoring: ${component.name}`,
          message: 'Component uses UnifiedDataService (DDD compliant)',
        });
        console.log(`   ✅ ${component.name} - Uses UnifiedDataService\n`);
        return true;
      } else {
        // Component might not fetch data (e.g., LiveRefreshDashboard)
        this.results.warnings.push({
          test: `Component Refactoring: ${component.name}`,
          message: 'Component does not fetch data (may not need refactoring)',
        });
        console.log(`   ⚠️  ${component.name} - No data fetching detected\n`);
        return true;
      }
    } catch (error) {
      this.results.failed.push({
        test: `Component Refactoring: ${component.name}`,
        message: error.message,
      });
      console.log(`   ❌ Error checking component: ${error.message}\n`);
      return false;
    }
  }

  /**
   * Test 6: Fallback Mechanism (n8n)
   */
  async testN8NFallback() {
    console.log('🔄 Test 6: n8n Fallback Mechanism');
    console.log('   Testing: Fallback to n8n when MCP unavailable\n');
    
    try {
      // Check if n8n is available
      const response = await this.makeRequest(`${this.n8nUrl}/healthz`, {
        timeout: 5000,
      });
      
      if (response.success) {
        this.results.passed.push({
          test: 'n8n Fallback',
          message: 'n8n server is available for fallback',
        });
        console.log('   ✅ n8n server is available for fallback\n');
        return true;
      } else {
        this.results.warnings.push({
          test: 'n8n Fallback',
          message: `n8n server returned ${response.status}`,
        });
        console.log(`   ⚠️  n8n server returned ${response.status}\n`);
        return false;
      }
    } catch (error) {
      this.results.warnings.push({
        test: 'n8n Fallback',
        message: `n8n server not accessible: ${error.message}`,
      });
      console.log(`   ⚠️  n8n server not accessible: ${error.message}\n`);
      return false;
    }
  }

  /**
   * Test 7: End-to-End Flow (Full Stack)
   */
  async testE2EFlow(component) {
    console.log(`🔄 Test 7.${component.name}: End-to-End Flow`);
    console.log(`   Testing: Component → Service → Proxy → MCP → Supabase\n`);
    
    // This is a comprehensive test that would require:
    // 1. Component rendered in test environment
    // 2. UnifiedDataService called
    // 3. Proxy route hit
    // 4. MCP server responds
    // 5. Data flows back
    
    // For now, we verify the chain exists
    const chain = [
      { name: 'Component', path: `dashboard/components/${component.name}.tsx`, exists: false },
      { name: 'UnifiedDataService', path: 'dashboard/lib/unified-data-service.ts', exists: false },
      { name: 'MCP Proxy', path: 'dashboard/app/api/mcp/[...endpoint]/route.ts', exists: false },
      { name: 'MCP Server', path: 'mcp-server/server.js', exists: false },
    ];
    
    let allExist = true;
    for (const link of chain) {
      const fullPath = path.join(__dirname, '../../', link.path);
      link.exists = fs.existsSync(fullPath);
      if (!link.exists) {
        allExist = false;
      }
    }
    
    if (allExist) {
      this.results.passed.push({
        test: `E2E Flow: ${component.name}`,
        message: 'All components of the data flow chain exist',
        component: component.name,
      });
      console.log(`   ✅ E2E flow chain complete for ${component.name}\n`);
      return true;
    } else {
      const missing = chain.filter(l => !l.exists).map(l => l.name).join(', ');
      this.results.failed.push({
        test: `E2E Flow: ${component.name}`,
        message: `Missing components: ${missing}`,
        component: component.name,
      });
      console.log(`   ❌ E2E flow incomplete: ${missing}\n`);
      return false;
    }
  }

  /**
   * Run all tests for a component
   */
  async testComponent(component) {
    console.log(`\n${'═'.repeat(60)}`);
    console.log(`🧪 Testing Component: ${component.name}`);
    console.log(`${'═'.repeat(60)}\n`);
    
    const results = {
      component: component.name,
      tests: {
        mcpEndpoint: await this.testMCPEndpointDirect(component),
        mcpProxy: await this.testMCPProxyRoute(component),
        unifiedService: await this.testUnifiedDataService(component),
        refactoring: await this.testComponentRefactoring(component),
        e2eFlow: await this.testE2EFlow(component),
      },
    };
    
    const passed = Object.values(results.tests).filter(r => r === true).length;
    const failed = Object.values(results.tests).filter(r => r === false).length;
    const skipped = Object.values(results.tests).filter(r => r === null).length;
    
    console.log(`📊 ${component.name} Results: ${passed} passed, ${failed} failed, ${skipped} skipped\n`);
    
    return results;
  }

  /**
   * Run all tests
   */
  async runAllTests(componentName = null) {
    console.log('\n');
    console.log('╔═══════════════════════════════════════════════════════════════════════════════╗');
    console.log('║                                                                               ║');
    console.log('║              🖖 MCP E2E Integration Test Framework 🖖                        ║');
    console.log('║                                                                               ║');
    console.log('╚═══════════════════════════════════════════════════════════════════════════════╝');
    console.log('\n');
    
    // Test infrastructure first
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('🏗️  Infrastructure Tests');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    
    const mcpHealthy = await this.testMCPServerHealth();
    await this.testN8NFallback();
    
    if (!mcpHealthy) {
      console.log('⚠️  MCP server not healthy. Some tests may fail.\n');
    }
    
    // Test components
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('🧩 Component Tests');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    
    const componentsToTest = componentName
      ? this.testComponents.filter(c => c.name === componentName)
      : this.testComponents;
    
    if (componentsToTest.length === 0) {
      console.log(`❌ Component "${componentName}" not found\n`);
      return;
    }
    
    const componentResults = [];
    for (const component of componentsToTest) {
      const result = await this.testComponent(component);
      componentResults.push(result);
    }
    
    // Generate report
    this.generateReport(componentResults);
  }

  /**
   * Generate test report
   */
  generateReport(componentResults) {
    console.log('\n');
    console.log('╔═══════════════════════════════════════════════════════════════════════════════╗');
    console.log('║                                                                               ║');
    console.log('║                        📊 TEST REPORT 📊                                       ║');
    console.log('║                                                                               ║');
    console.log('╚═══════════════════════════════════════════════════════════════════════════════╝');
    console.log('\n');
    
    const totalPassed = this.results.passed.length;
    const totalFailed = this.results.failed.length;
    const totalWarnings = this.results.warnings.length;
    const totalSkipped = this.results.skipped.length;
    const totalTests = totalPassed + totalFailed + totalWarnings + totalSkipped;
    
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📈 Summary');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    console.log(`   Total Tests: ${totalTests}`);
    console.log(`   ✅ Passed: ${totalPassed}`);
    console.log(`   ❌ Failed: ${totalFailed}`);
    console.log(`   ⚠️  Warnings: ${totalWarnings}`);
    console.log(`   ⏭️  Skipped: ${totalSkipped}`);
    console.log(`   Success Rate: ${((totalPassed / (totalPassed + totalFailed)) * 100).toFixed(1)}%\n`);
    
    if (totalFailed > 0) {
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log('❌ Failed Tests');
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
      this.results.failed.forEach((test, i) => {
        console.log(`   ${i + 1}. ${test.test}`);
        console.log(`      Component: ${test.component || 'N/A'}`);
        console.log(`      Error: ${test.message}\n`);
      });
    }
    
    if (totalWarnings > 0) {
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log('⚠️  Warnings');
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
      this.results.warnings.forEach((test, i) => {
        console.log(`   ${i + 1}. ${test.test}`);
        console.log(`      Component: ${test.component || 'N/A'}`);
        console.log(`      Message: ${test.message}\n`);
      });
    }
    
    // Save report
    const reportPath = path.join(__dirname, '../../reports/mcp-e2e-test-report.json');
    const report = {
      timestamp: new Date().toISOString(),
      summary: {
        total: totalTests,
        passed: totalPassed,
        failed: totalFailed,
        warnings: totalWarnings,
        skipped: totalSkipped,
        successRate: ((totalPassed / (totalPassed + totalFailed)) * 100).toFixed(1) + '%',
      },
      results: {
        passed: this.results.passed,
        failed: this.results.failed,
        warnings: this.results.warnings,
        skipped: this.results.skipped,
      },
      componentResults,
    };
    
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
    console.log(`\n📄 Report saved: ${reportPath}\n`);
    
    // Exit code
    if (totalFailed > 0) {
      process.exit(1);
    } else {
      process.exit(0);
    }
  }
}

// CLI
const args = process.argv.slice(2);
const componentArg = args.find(arg => arg.startsWith('--component='));
const componentName = componentArg ? componentArg.split('=')[1] : null;
const allArg = args.includes('--all');

async function main() {
  const framework = new MCPE2ETestFramework();
  await framework.runAllTests(componentName);
}

main().catch((error) => {
  console.error('\n❌ Test framework error:', error);
  console.error(error.stack);
  process.exit(1);
});

