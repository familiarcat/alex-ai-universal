#!/usr/bin/env node

/**
 * Upsert transformed crew memories into Supabase once the new schema is ready.
 * Reads reports/crew-memory-transformed.json and performs chunked UPSERTs.
 */

'use strict';

const fs = require('fs');
const path = require('path');
const axios = require('axios');
const { loadCrewCredentials } = require('./utils/load-crew-credentials');

const PAYLOAD_PATH = path.join(__dirname, '..', 'reports', 'crew-memory-transformed.json');
const CHUNK_SIZE = 50;

(async () => {
  console.log('🚀 Upserting transformed crew memories...');
  if (!fs.existsSync(PAYLOAD_PATH)) {
    console.error('❌ Missing payload file:', PAYLOAD_PATH);
    process.exit(1);
  }

  const payload = JSON.parse(fs.readFileSync(PAYLOAD_PATH, 'utf8'));
  if (!Array.isArray(payload) || payload.length === 0) {
    console.error('❌ Payload empty or invalid');
    process.exit(1);
  }

  const credentials = loadCrewCredentials();
  if (!credentials.supabase.url || !credentials.supabase.key) {
    console.error('❌ Supabase credentials not available.');
    process.exit(1);
  }

  const base = credentials.supabase.url.replace(/\/$/, '');
  const headers = {
    apikey: credentials.supabase.key,
    Authorization: `Bearer ${credentials.supabase.key}`,
    'Content-Type': 'application/json',
    Prefer: 'resolution=merge-duplicates'
  };

  const chunks = [];
  for (let i = 0; i < payload.length; i += CHUNK_SIZE) {
    chunks.push(payload.slice(i, i + CHUNK_SIZE));
  }

  for (const [index, chunk] of chunks.entries()) {
    try {
      const { status } = await axios.post(`${base}/rest/v1/crew_memories`, chunk, { headers, timeout: 20000 });
      console.log(`   • Chunk ${index + 1}/${chunks.length} upserted (HTTP ${status})`);
    } catch (error) {
      console.error(`   ❌ Chunk ${index + 1} failed:`, error.response?.data || error.message);
      process.exit(1);
    }
  }

  console.log('✅ All transformed memories upserted successfully.');
})();
