#!/usr/bin/env node

// Test script to verify N8N and Supabase connections
const https = require('https');

console.log('🔍 TESTING N8N & SUPABASE CONNECTIONS');
console.log('=====================================');
console.log('');

// Test N8N Connection
console.log('📡 Testing N8N Connection...');
const n8nOptions = {
  hostname: 'n8n.pbradygeorgen.com',
  port: 443,
  path: '/api/v1/workflows',
  method: 'GET',
  headers: {
    'X-N8N-API-KEY': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI1ZTA3ZGJlZi0yZDJmLTQ2YjUtYWQ3ZC0yYjIzZTk2ZWE1NjYiLCJpc3MiOiJuOG4iLCJhdWQiOiJwdWJsaWMtYXBpIiwiaWF0IjoxNzU4NjgxMzY5fQ._vFzyUok70PS3wI0bTSpB9QDxzLGHM3Ou9n4XvZF0aA',
    'Content-Type': 'application/json'
  }
};

const n8nReq = https.request(n8nOptions, (res) => {
  let data = '';
  res.on('data', (chunk) => {
    data += chunk;
  });
  res.on('end', () => {
    try {
      const response = JSON.parse(data);
      console.log(`✅ N8N: Connected (${response.data?.length || 0} workflows)`);
    } catch (e) {
      console.log('❌ N8N: Connection failed');
    }
  });
});

n8nReq.on('error', (error) => {
  console.log('❌ N8N: Connection error');
});

n8nReq.end();

// Test Supabase Connection
console.log('📡 Testing Supabase Connection...');
const supabaseOptions = {
  hostname: 'rpkkkbufdwxmjaerbhbn.supabase.co',
  port: 443,
  path: '/rest/v1/agent_memories?select=*&limit=5',
  method: 'GET',
  headers: {
    'apikey': 'sb_secret_TCaP5QXq4PHTtsjxcU1l1Q_XB5nRLJg',
    'Authorization': 'Bearer sb_secret_TCaP5QXq4PHTtsjxcU1l1Q_XB5nRLJg',
    'Content-Type': 'application/json'
  }
};

const supabaseReq = https.request(supabaseOptions, (res) => {
  let data = '';
  res.on('data', (chunk) => {
    data += chunk;
  });
  res.on('end', () => {
    try {
      const response = JSON.parse(data);
      if (response.code === '42P01') {
        console.log('✅ Supabase: Connected (table needs to be created)');
      } else {
        console.log(`✅ Supabase: Connected (${response.length || 0} records)`);
      }
    } catch (e) {
      console.log('❌ Supabase: Connection failed');
    }
  });
});

supabaseReq.on('error', (error) => {
  console.log('❌ Supabase: Connection error');
});

supabaseReq.end();

console.log('');
console.log('🎯 CONNECTION TEST COMPLETE');
console.log('===========================');
