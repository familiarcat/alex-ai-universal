#!/usr/bin/env node

/**
 * Store Retry Limits Pattern in RAG
 * 
 * Ingests the anti-pattern and solution into the RAG knowledge base
 * via n8n webhook for future reference
 * 
 * Crew: All 10 crew members
 */

const fs = require('fs');
const path = require('path');
const https = require('https');

const RAG_PATTERN_FILE = path.join(__dirname, '..', 'rag-knowledge-base', 'anti-pattern-infinite-retry-loops.json');
const N8N_WEBHOOK_URL = process.env.N8N_URL || 'https://n8n.pbradygeorgen.com';
const WEBHOOK_PATH = '/webhook/knowledge-ingest';

function post(urlString, json) {
  const data = Buffer.from(JSON.stringify(json));
  return new Promise((resolve, reject) => {
    const TIMEOUT_MS = 10000; // 10 second timeout
    let req;
    const timeout = setTimeout(() => {
      if (req) req.destroy();
      reject(new Error(`Request timeout after ${TIMEOUT_MS}ms`));
    }, TIMEOUT_MS);

    req = https.request(
      urlString,
      {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json', 
          'Content-Length': data.length,
          'X-Source': 'alex-ai-rag-ingestion'
        },
        timeout: TIMEOUT_MS,
      },
      (res) => {
        let body = '';
        res.on('data', (c) => (body += c));
        res.on('end', () => {
          clearTimeout(timeout);
          resolve({ status: res.statusCode, body });
        });
      },
    );
    req.on('error', (err) => {
      clearTimeout(timeout);
      reject(err);
    });
    req.on('timeout', () => {
      req.destroy();
      clearTimeout(timeout);
      reject(new Error(`Request timeout after ${TIMEOUT_MS}ms`));
    });
    req.write(data);
    req.end();
  });
}

async function storePatternInRAG() {
  try {
    // Read the pattern file
    const patternData = JSON.parse(fs.readFileSync(RAG_PATTERN_FILE, 'utf8'));

    console.log('🖖 Storing Retry Limits Pattern in RAG...');
    console.log(`   Pattern: ${patternData.title}`);
    console.log(`   Category: ${patternData.category}`);
    console.log(`   Priority: ${patternData.priority}`);

    // Prepare payload for n8n webhook (match existing format)
    const payload = {
      type: 'anti-pattern',
      title: patternData.title,
      category: patternData.category,
      priority: patternData.priority,
      content: patternData.content,
      tags: patternData.tags,
      crew_member: patternData.crew_member,
      date: patternData.date,
      session: patternData.session,
      source_file: patternData.source_file,
      related_files: patternData.related_files,
      examples: patternData.examples,
      checklist: patternData.checklist,
      anti_hallucination_score: patternData.anti_hallucination_score,
      word_count: patternData.word_count,
      char_count: patternData.char_count
    };

    // Send to n8n webhook
    const url = `${N8N_WEBHOOK_URL}${WEBHOOK_PATH}`;
    const result = await post(url, payload);

    if (result.status === 200 || result.status === 201) {
      let responseData;
      try {
        responseData = JSON.parse(result.body);
      } catch (e) {
        responseData = { body: result.body };
      }
      console.log('✅ Pattern stored in RAG successfully!');
      console.log(`   Status: ${result.status}`);
      if (responseData.memory_id) {
        console.log(`   Memory ID: ${responseData.memory_id}`);
      }
      return true;
    } else {
      console.error('❌ Failed to store pattern in RAG:');
      console.error(`   Status: ${result.status}`);
      console.error(`   Response: ${result.body}`);
      return false;
    }
  } catch (error) {
    console.error('❌ Error storing pattern in RAG:');
    console.error(`   ${error.message}`);
    console.error('\n💡 Pattern file is ready for manual ingestion:');
    console.error(`   ${RAG_PATTERN_FILE}`);
    console.error('\n💡 You can also use the existing RAG ingestion script:');
    console.error(`   npm run rag:ingest ${RAG_PATTERN_FILE}`);
    return false;
  }
}

// Run if called directly
if (require.main === module) {
  storePatternInRAG()
    .then(success => {
      process.exit(success ? 0 : 1);
    })
    .catch(error => {
      console.error('Fatal error:', error);
      process.exit(1);
    });
}

module.exports = { storePatternInRAG };

