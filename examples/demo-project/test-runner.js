#!/usr/bin/env node
/**
 * Alex AI Demo Project - Test Runner
 */

const { DemoWebServer } = require('./src/web-server');

async function runTests() {
  console.log('🧪 Running Alex AI Demo Tests...');
  
  const webServer = new DemoWebServer(3001);
  
  try {
    await webServer.start();
    console.log('✅ Web server test passed');
    
    // Test API endpoints
    const http = require('http');
    
    const testEndpoint = async (path) => {
      return new Promise((resolve, reject) => {
        const req = http.get(`http://localhost:3001/api${path}`, (res) => {
          let data = '';
          res.on('data', chunk => data += chunk);
          res.on('end', () => {
            try {
              JSON.parse(data);
              resolve(true);
            } catch (e) {
              reject(e);
            }
          });
        });
        req.on('error', reject);
      });
    };
    
    await testEndpoint('/status');
    console.log('✅ API status endpoint test passed');
    
    await testEndpoint('/crew-analysis');
    console.log('✅ API crew analysis endpoint test passed');
    
    await testEndpoint('/technical-stack');
    console.log('✅ API technical stack endpoint test passed');
    
    await testEndpoint('/project-phases');
    console.log('✅ API project phases endpoint test passed');
    
    console.log('🎉 All tests passed!');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  } finally {
    await webServer.stop();
  }
}

runTests();
