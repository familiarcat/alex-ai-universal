#!/usr/bin/env node
/**
 * 🖖 Scrape OpenRouter Documentation to RAG
 * 
 * Scrapes OpenRouter API documentation and stores it in the RAG system
 * so the crew can dynamically learn how to get API keys and keep the system current.
 * 
 * Usage:
 *   node scripts/scrape-openrouter-docs-to-rag.js
 *   node scripts/scrape-openrouter-docs-to-rag.js --store  # Store directly to RAG
 */

const https = require('https');
const http = require('http');
const fs = require('fs');
const path = require('path');
const { getMCPMemoryStorage } = require('./utils/mcp-memory-storage');

// URLs to scrape
const OPENROUTER_DOCS = {
  apiKeys: 'https://openrouter.ai/docs/quick-start',
  authentication: 'https://openrouter.ai/docs/authentication',
  apiReference: 'https://openrouter.ai/docs/api-reference',
  models: 'https://openrouter.ai/docs/models',
};

function httpGet(urlStr, timeoutMs = 30000) {
  return new Promise((resolve, reject) => {
    try {
      const url = new URL(urlStr);
      const isHttps = url.protocol === 'https:';
      const client = isHttps ? https : http;
      
      const req = client.get({
        hostname: url.hostname,
        path: url.pathname + (url.search || ''),
        headers: {
          'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
          'Accept-Language': 'en-US,en;q=0.9',
        },
        timeout: timeoutMs
      }, (res) => {
        let data = '';
        res.on('data', (chunk) => (data += chunk));
        res.on('end', () => resolve({ status: res.statusCode || 0, body: data }));
      });
      
      req.on('error', reject);
      req.on('timeout', () => {
        req.destroy();
        reject(new Error(`Request timeout after ${timeoutMs}ms`));
      });
      
      req.setTimeout(timeoutMs);
    } catch (e) {
      reject(e);
    }
  });
}

function extractTextFromHTML(html) {
  // Remove script and style tags
  let text = html.replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '');
  text = text.replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '');
  
  // Extract main content (try to find article or main tag)
  const mainMatch = text.match(/<main[^>]*>([\s\S]*?)<\/main>/i) || 
                   text.match(/<article[^>]*>([\s\S]*?)<\/article>/i) ||
                   text.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
  
  if (mainMatch) {
    text = mainMatch[1];
  }
  
  // Remove HTML tags but preserve structure
  text = text.replace(/<h[1-6][^>]*>(.*?)<\/h[1-6]>/gi, '\n## $1\n');
  text = text.replace(/<p[^>]*>(.*?)<\/p>/gi, '$1\n\n');
  text = text.replace(/<li[^>]*>(.*?)<\/li>/gi, '- $1\n');
  text = text.replace(/<code[^>]*>(.*?)<\/code>/gi, '`$1`');
  text = text.replace(/<pre[^>]*>([\s\S]*?)<\/pre>/gi, '\n```\n$1\n```\n');
  text = text.replace(/<a[^>]*href=["']([^"']+)["'][^>]*>(.*?)<\/a>/gi, '[$2]($1)');
  
  // Remove remaining HTML tags
  text = text.replace(/<[^>]+>/g, '');
  
  // Decode HTML entities
  text = text
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'");
  
  // Clean up whitespace
  text = text.replace(/\n{3,}/g, '\n\n');
  text = text.replace(/[ \t]+/g, ' ');
  text = text.trim();
  
  return text;
}

function extractAPIKeyInstructions(content) {
  const apiKeyPatterns = [
    /(?:API[_\s]?key|api[_\s]?key|API[_\s]?Key)[\s\S]{0,500}?(?:get|create|generate|obtain|find|retrieve)[\s\S]{0,1000}/gi,
    /(?:Authorization|Bearer|X-API-Key)[\s\S]{0,500}?(?:sk-or|sk-)[\s\S]{0,200}/gi,
    /(?:dashboard|settings|account)[\s\S]{0,500}?(?:API|key|token)[\s\S]{0,500}/gi,
  ];
  
  const matches = [];
  apiKeyPatterns.forEach(pattern => {
    const found = content.match(pattern);
    if (found) {
      matches.push(...found);
    }
  });
  
  return matches.join('\n\n---\n\n');
}

async function scrapeOpenRouterDocs() {
  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('🖖 SCRAPING OPENROUTER DOCUMENTATION');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
  
  const scrapedDocs = {};
  
  for (const [name, url] of Object.entries(OPENROUTER_DOCS)) {
    try {
      console.log(`📄 Scraping: ${name} (${url})...`);
      const response = await httpGet(url);
      
      if (response.status >= 200 && response.status < 300) {
        const text = extractTextFromHTML(response.body);
        scrapedDocs[name] = {
          url,
          content: text,
          scrapedAt: new Date().toISOString(),
          length: text.length,
        };
        console.log(`   ✅ Scraped ${text.length} characters`);
      } else {
        console.log(`   ⚠️  HTTP ${response.status}`);
        scrapedDocs[name] = {
          url,
          content: `Failed to scrape: HTTP ${response.status}`,
          scrapedAt: new Date().toISOString(),
          error: true,
        };
      }
    } catch (error) {
      console.log(`   ❌ Error: ${error.message}`);
      scrapedDocs[name] = {
        url,
        content: `Error scraping: ${error.message}`,
        scrapedAt: new Date().toISOString(),
        error: true,
      };
    }
  }
  
  return scrapedDocs;
}

function createRAGPayload(scrapedDocs) {
  // Combine all documentation
  const fullContent = Object.entries(scrapedDocs)
    .map(([name, doc]) => {
      return `# ${name.replace(/_/g, ' ').toUpperCase()}\n\n**Source:** ${doc.url}\n**Scraped:** ${doc.scrapedAt}\n\n${doc.content}`;
    })
    .join('\n\n---\n\n');
  
  // Extract API key instructions
  const apiKeyInstructions = extractAPIKeyInstructions(fullContent);
  
  const payload = {
    title: 'OpenRouter API Documentation - Complete Reference',
    content: fullContent,
    summary: `Complete OpenRouter API documentation including authentication, API keys, models, and API reference. Scraped on ${new Date().toISOString()}.`,
    category: 'documentation',
    tags: ['openrouter', 'api', 'documentation', 'authentication', 'api-keys', 'llm', 'mcp'],
    metadata: {
      source: 'openrouter-ai-docs',
      urls: Object.values(scrapedDocs).map(d => d.url),
      scrapedAt: new Date().toISOString(),
      totalPages: Object.keys(scrapedDocs).length,
      apiKeyInstructions: apiKeyInstructions.substring(0, 2000), // Limit size
    },
  };
  
  return payload;
}

async function storeToRAG(payload) {
  try {
    const storage = getMCPMemoryStorage();
    storage.initialize();
    
    console.log('\n💾 Storing to RAG via MCP system...\n');
    
    const result = await storage.storeMemory({
      title: payload.title,
      content: payload.content,
      category: payload.category,
      tags: payload.tags,
      sessionId: `openrouter-docs-${Date.now()}`,
      metadata: payload.metadata,
    });
    
    if (result.success) {
      console.log('✅ Documentation stored in RAG system!');
      if (result.cached) {
        console.log('   (Using cached context - avoided duplicate)');
      }
      return true;
    } else {
      console.log('❌ Failed to store in RAG');
      return false;
    }
  } catch (error) {
    console.error(`❌ Error storing to RAG: ${error.message}`);
    return false;
  }
}

async function main() {
  const shouldStore = process.argv.includes('--store');
  
  try {
    // Scrape documentation
    const scrapedDocs = await scrapeOpenRouterDocs();
    
    // Create RAG payload
    const payload = createRAGPayload(scrapedDocs);
    
    // Save to file
    const outputFile = path.join(process.cwd(), 'openrouter-docs-rag-payload.json');
    fs.writeFileSync(outputFile, JSON.stringify(payload, null, 2));
    console.log(`\n💾 Saved payload to: ${outputFile}`);
    
    // Store to RAG if requested
    if (shouldStore) {
      await storeToRAG(payload);
    } else {
      console.log('\n💡 To store in RAG, run with --store flag:');
      console.log(`   node scripts/scrape-openrouter-docs-to-rag.js --store`);
    }
    
    // Show API key instructions if found
    if (payload.metadata.apiKeyInstructions) {
      console.log('\n🔑 API Key Instructions Found:');
      console.log('─'.repeat(60));
      console.log(payload.metadata.apiKeyInstructions.substring(0, 500));
      console.log('─'.repeat(60));
      console.log('\n💡 Full instructions stored in RAG payload');
    }
    
    console.log('\n✅ Scraping complete!\n');
    
  } catch (error) {
    console.error(`\n❌ Error: ${error.message}\n`);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = { scrapeOpenRouterDocs, createRAGPayload };

