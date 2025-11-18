#!/usr/bin/env node
/**
 * Alex AI Universal Litmus Test System
 * 
 * End-to-end testing harness that:
 * 1. Executes natural language prompts in semantic format
 * 2. Tests entire system functionality
 * 3. Documents tests through the system
 * 4. Stores tests in memory for reuse
 * 5. Associates tests with functional roles
 * 6. Expands based on added features
 * 
 * This is the primary litmus test for Alex AI Universal system validation.
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const { loadCrewCredentials } = require('../utils/load-crew-credentials');

// Test definition structure
class LitmusTest {
  constructor(testDefinition) {
    this.id = testDefinition.id || `test-${Date.now()}`;
    this.name = testDefinition.name;
    this.description = testDefinition.description;
    this.naturalLanguagePrompt = testDefinition.naturalLanguagePrompt;
    this.expectedBehavior = testDefinition.expectedBehavior;
    this.functionalRole = testDefinition.functionalRole || 'system';
    this.testSteps = testDefinition.testSteps || [];
    this.verificationSteps = testDefinition.verificationSteps || [];
    this.memoryVerification = testDefinition.memoryVerification || {};
    this.tags = testDefinition.tags || [];
    this.priority = testDefinition.priority || 'high';
    this.version = testDefinition.version || '1.0.0';
  }

  /**
   * Execute the test and return results
   */
  async execute() {
    const results = {
      testId: this.id,
      testName: this.name,
      timestamp: new Date().toISOString(),
      status: 'running',
      steps: [],
      memoryVerified: false,
      functionalRoleVerified: false,
      errors: []
    };

    try {
      console.log(`\n🧪 Executing Litmus Test: ${this.name}`);
      console.log(`   Prompt: "${this.naturalLanguagePrompt}"`);
      console.log(`   Functional Role: ${this.functionalRole}\n`);

      // Execute each test step
      for (let i = 0; i < this.testSteps.length; i++) {
        const step = this.testSteps[i];
        console.log(`   Step ${i + 1}/${this.testSteps.length}: ${step.name}`);
        
        try {
          const stepResult = await this.executeStep(step);
          results.steps.push({
            stepNumber: i + 1,
            stepName: step.name,
            status: stepResult.success ? 'passed' : 'failed',
            output: stepResult.output,
            error: stepResult.error
          });

          if (!stepResult.success) {
            results.errors.push(`Step ${i + 1} failed: ${stepResult.error}`);
          }
        } catch (error) {
          results.steps.push({
            stepNumber: i + 1,
            stepName: step.name,
            status: 'error',
            error: error.message
          });
          results.errors.push(`Step ${i + 1} error: ${error.message}`);
        }
      }

      // Verify memory storage
      if (this.memoryVerification.enabled !== false) {
        console.log(`\n   Verifying memory storage...`);
        const memoryVerified = await this.verifyMemoryStorage();
        results.memoryVerified = memoryVerified;
        if (memoryVerified) {
          console.log(`   ✅ Memory storage verified`);
        } else {
          console.log(`   ⚠️  Memory storage verification failed`);
        }
      }

      // Verify functional role association
      console.log(`\n   Verifying functional role association...`);
      const roleVerified = await this.verifyFunctionalRole();
      results.functionalRoleVerified = roleVerified;
      if (roleVerified) {
        console.log(`   ✅ Functional role verified: ${this.functionalRole}`);
      } else {
        console.log(`   ⚠️  Functional role verification failed`);
      }

      // Determine overall status
      const allStepsPassed = results.steps.every(s => s.status === 'passed');
      results.status = (allStepsPassed && results.memoryVerified && results.functionalRoleVerified) 
        ? 'passed' 
        : 'failed';

      console.log(`\n   Test Status: ${results.status.toUpperCase()}`);
      
      return results;
    } catch (error) {
      results.status = 'error';
      results.errors.push(`Test execution error: ${error.message}`);
      return results;
    }
  }

  /**
   * Execute a single test step
   */
  async executeStep(step) {
    switch (step.type) {
      case 'cli_command':
        return await this.executeCLICommand(step.command, step.expectedOutput);
      
      case 'natural_language':
        return await this.executeNaturalLanguage(step.prompt, step.expectedBehavior);
      
      case 'file_check':
        return await this.checkFile(step.path, step.expectedContent);
      
      case 'api_call':
        return await this.executeAPICall(step.endpoint, step.method, step.expectedStatus);
      
      case 'memory_query':
        return await this.queryMemory(step.query, step.expectedResults);
      
      default:
        throw new Error(`Unknown step type: ${step.type}`);
    }
  }

  /**
   * Execute CLI command
   */
  async executeCLICommand(command, expectedOutput) {
    try {
      const output = execSync(command, { 
        encoding: 'utf8',
        cwd: process.cwd(),
        timeout: 30000
      });
      
      const success = !expectedOutput || output.includes(expectedOutput);
      return {
        success,
        output: output.substring(0, 500), // Limit output size
        error: success ? null : `Expected output not found: ${expectedOutput}`
      };
    } catch (error) {
      return {
        success: false,
        output: '',
        error: error.message
      };
    }
  }

  /**
   * Execute natural language prompt via Alex AI CLI
   */
  async executeNaturalLanguage(prompt, expectedBehavior) {
    try {
      // Route through Alex AI CLI chat interface
      const command = `npx alex-ai chat "${prompt}"`;
      const output = execSync(command, {
        encoding: 'utf8',
        cwd: process.cwd(),
        timeout: 60000,
        stdio: 'pipe'
      });

      // Check if expected behavior is present in output
      const success = !expectedBehavior || 
        output.toLowerCase().includes(expectedBehavior.toLowerCase()) ||
        this.checkSemanticMatch(output, expectedBehavior);

      return {
        success,
        output: output.substring(0, 1000), // Limit output size
        error: success ? null : `Expected behavior not found: ${expectedBehavior}`
      };
    } catch (error) {
      return {
        success: false,
        output: '',
        error: error.message
      };
    }
  }

  /**
   * Check semantic match between output and expected behavior
   */
  checkSemanticMatch(output, expectedBehavior) {
    // Simple keyword matching (can be enhanced with embeddings)
    const outputKeywords = this.extractKeywords(output.toLowerCase());
    const expectedKeywords = this.extractKeywords(expectedBehavior.toLowerCase());
    
    const matchCount = expectedKeywords.filter(kw => outputKeywords.includes(kw)).length;
    return matchCount >= expectedKeywords.length * 0.5; // 50% keyword match
  }

  /**
   * Extract keywords from text
   */
  extractKeywords(text) {
    const stopWords = new Set(['the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by']);
    return text.split(/\W+/)
      .filter(word => word.length > 3 && !stopWords.has(word))
      .slice(0, 10);
  }

  /**
   * Check file existence and content
   */
  async checkFile(filePath, expectedContent) {
    try {
      const fullPath = path.join(process.cwd(), filePath);
      if (!fs.existsSync(fullPath)) {
        return {
          success: false,
          output: '',
          error: `File not found: ${filePath}`
        };
      }

      const content = fs.readFileSync(fullPath, 'utf8');
      const success = !expectedContent || content.includes(expectedContent);
      
      return {
        success,
        output: content.substring(0, 500),
        error: success ? null : `Expected content not found in file`
      };
    } catch (error) {
      return {
        success: false,
        output: '',
        error: error.message
      };
    }
  }

  /**
   * Execute API call
   */
  async executeAPICall(endpoint, method = 'GET', expectedStatus = 200) {
    const https = require('https');
    const creds = loadCrewCredentials();
    
    return new Promise((resolve) => {
      const url = new URL(endpoint);
      const options = {
        hostname: url.hostname,
        port: url.port || 443,
        path: url.pathname + url.search,
        method: method,
        timeout: 10000
      };

      const req = https.request(options, (res) => {
        let body = '';
        res.on('data', (chunk) => { body += chunk; });
        res.on('end', () => {
          const success = res.statusCode === expectedStatus;
          resolve({
            success,
            output: body.substring(0, 500),
            error: success ? null : `Expected status ${expectedStatus}, got ${res.statusCode}`
          });
        });
      });

      req.on('error', (error) => {
        resolve({
          success: false,
          output: '',
          error: error.message
        });
      });

      req.on('timeout', () => {
        req.destroy();
        resolve({
          success: false,
          output: '',
          error: 'Request timeout'
        });
      });

      req.end();
    });
  }

  /**
   * Query memory system
   */
  async queryMemory(query, expectedResults) {
    // Query Supabase for memory entries related to this test
    const https = require('https');
    const creds = loadCrewCredentials();
    const SUPABASE_URL = creds.supabase?.url;
    const SUPABASE_KEY = creds.supabase?.key;

    if (!SUPABASE_URL || !SUPABASE_KEY) {
      return {
        success: false,
        output: '',
        error: 'Supabase credentials not found'
      };
    }

    return new Promise((resolve) => {
      const url = new URL(`${SUPABASE_URL}/rest/v1/alex_ai_memories`);
      url.searchParams.append('session_id', `eq.${this.id}`);
      url.searchParams.append('limit', '10');

      const options = {
        hostname: url.hostname,
        port: url.port || 443,
        path: url.pathname + url.search,
        method: 'GET',
        headers: {
          'apikey': SUPABASE_KEY,
          'Authorization': `Bearer ${SUPABASE_KEY}`
        },
        timeout: 10000
      };

      const req = https.request(options, (res) => {
        let body = '';
        res.on('data', (chunk) => { body += chunk; });
        res.on('end', () => {
          try {
            const data = JSON.parse(body);
            const found = Array.isArray(data) && data.length > 0;
            resolve({
              success: found,
              output: JSON.stringify(data).substring(0, 500),
              error: found ? null : 'No memory entries found'
            });
          } catch (e) {
            resolve({
              success: false,
              output: '',
              error: 'Failed to parse memory response'
            });
          }
        });
      });

      req.on('error', (error) => {
        resolve({
          success: false,
          output: '',
          error: error.message
        });
      });

      req.end();
    });
  }

  /**
   * Verify memory storage
   */
  async verifyMemoryStorage() {
    if (!this.memoryVerification.enabled) {
      return true; // Skip verification if disabled
    }

    // Store test execution as memory
    await this.storeTestMemory();
    
    // Query to verify it was stored
    const memoryResult = await this.queryMemory(this.id, {});
    return memoryResult.success;
  }

  /**
   * Store test execution in memory
   */
  async storeTestMemory() {
    const https = require('https');
    const creds = loadCrewCredentials();
    const N8N_BASE_URL = creds.n8n?.baseUrl || 'https://n8n.pbradygeorgen.com';

    const memoryPayload = {
      title: `Litmus Test: ${this.name}`,
      summary: `Test execution for: ${this.naturalLanguagePrompt}`,
      detailedAnalysis: JSON.stringify({
        testId: this.id,
        testName: this.name,
        naturalLanguagePrompt: this.naturalLanguagePrompt,
        functionalRole: this.functionalRole,
        expectedBehavior: this.expectedBehavior,
        tags: this.tags,
        version: this.version
      }, null, 2),
      crewMember: 'data',
      knowledgeType: 'testing',
      priority: this.priority,
      tags: ['litmus-test', 'testing', 'end-to-end', this.functionalRole, ...this.tags],
      sessionId: this.id,
      platform: 'test-harness',
      timestamp: new Date().toISOString(),
      vectorOptimization: {
        enabled: true,
        fragmentationEnabled: true,
        deduplicationEnabled: true
      }
    };

    return new Promise((resolve) => {
      const url = new URL(`${N8N_BASE_URL}/webhook/crew-memory-storage`);
      const data = JSON.stringify(memoryPayload);
      
      const options = {
        hostname: url.hostname,
        port: url.port || 443,
        path: url.pathname,
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(data)
        },
        timeout: 10000
      };

      const req = https.request(options, (res) => {
        let body = '';
        res.on('data', (chunk) => { body += chunk; });
        res.on('end', () => {
          resolve(res.statusCode >= 200 && res.statusCode < 300);
        });
      });

      req.on('error', () => resolve(false));
      req.on('timeout', () => {
        req.destroy();
        resolve(false);
      });

      req.write(data);
      req.end();
    });
  }

  /**
   * Verify functional role association
   */
  async verifyFunctionalRole() {
    // Check if test is associated with correct functional role in memory
    const memoryResult = await this.queryMemory(this.id, {});
    
    if (!memoryResult.success) {
      return false;
    }

    try {
      const memories = JSON.parse(memoryResult.output);
      return memories.some(m => 
        m.metadata?.functionalRole === this.functionalRole ||
        m.tags?.includes(this.functionalRole)
      );
    } catch (e) {
      return false;
    }
  }

  /**
   * Export test definition for reuse
   */
  toJSON() {
    return {
      id: this.id,
      name: this.name,
      description: this.description,
      naturalLanguagePrompt: this.naturalLanguagePrompt,
      expectedBehavior: this.expectedBehavior,
      functionalRole: this.functionalRole,
      testSteps: this.testSteps,
      verificationSteps: this.verificationSteps,
      memoryVerification: this.memoryVerification,
      tags: this.tags,
      priority: this.priority,
      version: this.version
    };
  }
}

module.exports = { LitmusTest };

