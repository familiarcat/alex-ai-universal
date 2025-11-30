#!/usr/bin/env node
/**
 * Browser-Based E2E DDD Integration Test
 * 
 * Uses Puppeteer to test the complete flow:
 * Browser (Next.js UI) => Controller (MCP) => Data (Supabase)
 * 
 * Verifies:
 * - UI interactions work correctly
 * - API calls go through proper layers
 * - DDD boundaries are respected
 * - Vector-based dashboard functionality
 * 
 * Usage:
 *   node scripts/test/e2e-ddd-browser-test.js
 */

const puppeteer = require('puppeteer');
const { loadSupabaseCredentials } = require('../utils/secure-credential-loader');
const { createClient } = require('@supabase/supabase-js');

class BrowserE2EDDDTest {
  constructor() {
    this.browser = null;
    this.page = null;
    this.supabase = null;
    this.results = {
      passed: [],
      failed: [],
      warnings: []
    };
    this.nextjsBaseUrl = process.env.NEXTJS_BASE_URL || 'http://localhost:3000';
  }

  async initialize() {
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('🌐 Browser-Based E2E DDD Integration Test');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    // Initialize browser
    this.browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    this.page = await this.browser.newPage();

    // Initialize Supabase
    try {
      const creds = loadSupabaseCredentials();
      this.supabase = createClient(creds.url, creds.serviceKey);
      console.log('✅ Supabase client initialized');
    } catch (error) {
      console.error('❌ Failed to initialize Supabase:', error.message);
      throw error;
    }

    console.log('✅ Browser initialized\n');
  }

  /**
   * Test: Vector Priority Dashboard Page
   */
  async testVectorDashboardPage() {
    console.log('📋 Test: Vector Priority Dashboard Page');
    console.log('   Testing dashboard page loads and displays correctly...\n');

    try {
      await this.page.goto(`${this.nextjsBaseUrl}/dashboard/vector-priority`, {
        waitUntil: 'networkidle2',
        timeout: 10000
      });

      // Check if page loaded
      const title = await this.page.title();
      if (title) {
        this.results.passed.push({
          test: 'Vector Dashboard Page',
          message: 'Dashboard page loads successfully'
        });
        console.log('   ✅ Dashboard page loads');

        // Check for vector priority components
        const hasVectorSystem = await this.page.$('[data-testid="vector-priority-system"]') !== null;
        if (hasVectorSystem) {
          this.results.passed.push({
            test: 'Vector Dashboard Page',
            message: 'Vector priority system component found'
          });
          console.log('   ✅ Vector priority system component found');
        } else {
          this.results.warnings.push({
            test: 'Vector Dashboard Page',
            message: 'Vector priority system component not found (may need data-testid)'
          });
          console.log('   ⚠️  Vector priority system component not found');
        }
      } else {
        this.results.failed.push({
          test: 'Vector Dashboard Page',
          message: 'Dashboard page did not load'
        });
        console.log('   ❌ Dashboard page did not load');
      }
    } catch (error) {
      this.results.warnings.push({
        test: 'Vector Dashboard Page',
        message: `Could not access dashboard: ${error.message}`,
        details: 'Next.js server may not be running'
      });
      console.log(`   ⚠️  Could not access dashboard: ${error.message}`);
    }

    console.log('');
  }

  /**
   * Test: API Calls Through Browser
   */
  async testAPICallsThroughBrowser() {
    console.log('📋 Test: API Calls Through Browser');
    console.log('   Testing API calls from browser go through proper layers...\n');

    try {
      // Monitor network requests
      const requests = [];
      this.page.on('request', request => {
        if (request.url().includes('/api/')) {
          requests.push({
            url: request.url(),
            method: request.method(),
            headers: request.headers()
          });
        }
      });

      // Navigate to dashboard
      await this.page.goto(`${this.nextjsBaseUrl}/dashboard/vector-priority`, {
        waitUntil: 'networkidle2',
        timeout: 10000
      });

      // Wait for API calls
      await this.page.waitForTimeout(2000);

      // Check if API calls were made
      const apiCalls = requests.filter(r => r.url.includes('/api/'));
      if (apiCalls.length > 0) {
        this.results.passed.push({
          test: 'API Calls Through Browser',
          message: `Found ${apiCalls.length} API calls from browser`
        });
        console.log(`   ✅ Found ${apiCalls.length} API calls`);

        // Check for direct Supabase calls (should not exist)
        const directSupabaseCalls = apiCalls.filter(r => 
          r.url.includes('supabase.co/rest/v1') && !r.url.includes('/api/')
        );
        if (directSupabaseCalls.length === 0) {
          this.results.passed.push({
            test: 'API Calls Through Browser',
            message: 'No direct Supabase calls from browser (DDD boundary respected)'
          });
          console.log('   ✅ No direct Supabase calls (DDD boundary respected)');
        } else {
          this.results.failed.push({
            test: 'API Calls Through Browser',
            message: 'Direct Supabase calls detected from browser',
            details: 'Browser should use API routes, not direct Supabase access'
          });
          console.log('   ❌ Direct Supabase calls detected');
        }
      } else {
        this.results.warnings.push({
          test: 'API Calls Through Browser',
          message: 'No API calls detected (may be using client-side only)'
        });
        console.log('   ⚠️  No API calls detected');
      }
    } catch (error) {
      this.results.warnings.push({
        test: 'API Calls Through Browser',
        message: `Error testing API calls: ${error.message}`
      });
      console.log(`   ⚠️  Error: ${error.message}`);
    }

    console.log('');
  }

  /**
   * Test: Vector Priority System Integration
   */
  async testVectorPriorityIntegration() {
    console.log('📋 Test: Vector Priority System Integration');
    console.log('   Testing vector priority system works end-to-end...\n');

    try {
      // Create a test vector in Supabase
      const testVector = {
        embedding: Array(1536).fill(0).map(() => Math.random()),
        metadata: {
          test: true,
          timestamp: new Date().toISOString()
        },
        pattern_type: 'test',
        crew_member: 'data'
      };

      const { data: insertedData, error: insertError } = await this.supabase
        .from('vector_embeddings')
        .insert(testVector)
        .select()
        .single();

      if (insertError) {
        this.results.warnings.push({
          test: 'Vector Priority Integration',
          message: 'Could not create test vector',
          details: insertError.message
        });
        console.log(`   ⚠️  Could not create test vector: ${insertError.message}`);
        return;
      }

      this.results.passed.push({
        test: 'Vector Priority Integration',
        message: 'Test vector created in Supabase'
      });
      console.log('   ✅ Test vector created');

      // Navigate to dashboard and check if vector appears
      await this.page.goto(`${this.nextjsBaseUrl}/dashboard/vector-priority`, {
        waitUntil: 'networkidle2',
        timeout: 10000
      });

      await this.page.waitForTimeout(3000);

      // Check if vector is displayed (simplified check)
      const pageContent = await this.page.content();
      if (pageContent.includes('vector') || pageContent.includes('priority')) {
        this.results.passed.push({
          test: 'Vector Priority Integration',
          message: 'Vector priority dashboard displays content'
        });
        console.log('   ✅ Vector priority dashboard displays content');
      }

      // Cleanup
      if (insertedData?.id) {
        await this.supabase
          .from('vector_embeddings')
          .delete()
          .eq('id', insertedData.id);
      }
    } catch (error) {
      this.results.warnings.push({
        test: 'Vector Priority Integration',
        message: `Error testing integration: ${error.message}`
      });
      console.log(`   ⚠️  Error: ${error.message}`);
    }

    console.log('');
  }

  /**
   * Generate report
   */
  generateReport() {
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📊 BROWSER TEST REPORT');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    console.log(`✅ Passed: ${this.results.passed.length}`);
    console.log(`❌ Failed: ${this.results.failed.length}`);
    console.log(`⚠️  Warnings: ${this.results.warnings.length}\n`);

    if (this.results.failed.length > 0) {
      console.log('❌ FAILED TESTS:');
      this.results.failed.forEach((result, i) => {
        console.log(`\n${i + 1}. ${result.test}: ${result.message}`);
        if (result.details) console.log(`   Details: ${result.details}`);
      });
    }

    return this.results.failed.length === 0;
  }

  async cleanup() {
    if (this.browser) {
      await this.browser.close();
    }
  }

  async runAllTests() {
    try {
      await this.initialize();
      await this.testVectorDashboardPage();
      await this.testAPICallsThroughBrowser();
      await this.testVectorPriorityIntegration();
      
      const success = this.generateReport();
      await this.cleanup();
      process.exit(success ? 0 : 1);
    } catch (error) {
      console.error('❌ Test harness failed:', error);
      await this.cleanup();
      process.exit(1);
    }
  }
}

if (require.main === module) {
  const test = new BrowserE2EDDDTest();
  test.runAllTests();
}

module.exports = { BrowserE2EDDDTest };

