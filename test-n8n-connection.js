#!/usr/bin/env node
/**
 * N8N Connection Test - Self-Healing Version
 * Tests N8N connectivity and diagnoses issues
 */

const https = require('https');
const http = require('http');

class N8NConnectionTester {
  constructor() {
    this.n8nUrl = process.env.N8N_BASE_URL || 'https://n8n.pbradygeorgen.com';
    this.apiKey = process.env.N8N_API_KEY;
    this.supabaseUrl = process.env.SUPABASE_URL;
    this.supabaseKey = process.env.SUPABASE_ANON_KEY;
  }

  async testN8NConnection() {
    console.log('🔗 Testing N8N Connection...');
    console.log(`   URL: ${this.n8nUrl}`);
    console.log(`   API Key: ${this.apiKey ? 'Present' : 'Missing'}`);
    
    if (!this.apiKey) {
      console.log('❌ N8N API key not found in environment');
      return false;
    }

    try {
      const response = await this.makeRequest(`${this.n8nUrl}/api/v1/workflows`, {
        'X-N8N-API-KEY': this.apiKey,
        'Content-Type': 'application/json'
      });

      if (response.statusCode === 200) {
        console.log('✅ N8N connection successful');
        return true;
      } else if (response.statusCode === 401) {
        console.log('❌ N8N authentication failed (401) - API key may be expired');
        return false;
      } else {
        console.log(`❌ N8N connection failed with status: ${response.statusCode}`);
        return false;
      }
    } catch (error) {
      console.log(`❌ N8N connection error: ${error.message}`);
      return false;
    }
  }

  async testSupabaseConnection() {
    console.log('\n🗄️  Testing Supabase Connection...');
    console.log(`   URL: ${this.supabaseUrl}`);
    console.log(`   Key: ${this.supabaseKey ? 'Present' : 'Missing'}`);
    
    if (!this.supabaseUrl || !this.supabaseKey) {
      console.log('❌ Supabase credentials not found in environment');
      return false;
    }

    try {
      const response = await this.makeRequest(`${this.supabaseUrl}/rest/v1/`, {
        'apikey': this.supabaseKey,
        'Authorization': `Bearer ${this.supabaseKey}`,
        'Content-Type': 'application/json'
      });

      if (response.statusCode === 200) {
        console.log('✅ Supabase connection successful');
        return true;
      } else if (response.statusCode === 401) {
        console.log('❌ Supabase authentication failed (401) - API key may be invalid');
        return false;
      } else {
        console.log(`❌ Supabase connection failed with status: ${response.statusCode}`);
        return false;
      }
    } catch (error) {
      console.log(`❌ Supabase connection error: ${error.message}`);
      return false;
    }
  }

  makeRequest(url, headers = {}) {
    return new Promise((resolve, reject) => {
      const urlObj = new URL(url);
      const options = {
        hostname: urlObj.hostname,
        port: urlObj.port || (urlObj.protocol === 'https:' ? 443 : 80),
        path: urlObj.pathname + urlObj.search,
        method: 'GET',
        headers: headers
      };

      const client = urlObj.protocol === 'https:' ? https : http;
      
      const req = client.request(options, (res) => {
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => {
          resolve({
            statusCode: res.statusCode,
            headers: res.headers,
            data: data
          });
        });
      });

      req.on('error', reject);
      req.setTimeout(10000, () => {
        req.destroy();
        reject(new Error('Request timeout'));
      });
      
      req.end();
    });
  }

  async runDiagnostics() {
    console.log('🖖 Alex AI N8N Integration Diagnostics');
    console.log('=======================================');
    
    const n8nStatus = await this.testN8NConnection();
    const supabaseStatus = await this.testSupabaseConnection();
    
    console.log('\n📊 Diagnostic Summary:');
    console.log(`   N8N Integration: ${n8nStatus ? '✅ Working' : '❌ Failed'}`);
    console.log(`   Supabase Integration: ${supabaseStatus ? '✅ Working' : '❌ Failed'}`);
    
    if (!n8nStatus || !supabaseStatus) {
      console.log('\n🔧 Recommended Actions:');
      if (!n8nStatus) {
        console.log('   1. Check N8N API key validity');
        console.log('   2. Verify N8N server is running');
        console.log('   3. Update N8N credentials in ~/.zshrc');
      }
      if (!supabaseStatus) {
        console.log('   1. Check Supabase API key validity');
        console.log('   2. Verify Supabase project is active');
        console.log('   3. Update Supabase credentials in ~/.zshrc');
      }
    } else {
      console.log('\n🎉 All integrations are working correctly!');
    }
    
    return { n8n: n8nStatus, supabase: supabaseStatus };
  }
}

// Run diagnostics
const tester = new N8NConnectionTester();
tester.runDiagnostics().catch(console.error);
