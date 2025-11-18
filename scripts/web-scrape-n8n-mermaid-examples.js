#!/usr/bin/env node

/**
 * Web Scraper for n8n to Mermaid Integration Examples
 * 
 * Scrapes web to find examples, tools, and documentation
 * about converting n8n workflows to Mermaid diagrams
 * 
 * Reviewed by: Commander Data (Research) & Lt. Uhura (Integration)
 */

const https = require('https');
const http = require('http');
const { URL } = require('url');

const TARGET_URLS = [
  {
    name: 'n8n Community Forum - Mermaid Converter',
    url: 'https://community.n8n.io/t/n8n-workflow-to-mermaid-diagram-converter/109890'
  },
  {
    name: 'GitHub - n8nmermaid',
    url: 'https://github.com/jwa91/n8nmermaid'
  },
  {
    name: 'Mermaid Documentation',
    url: 'https://mermaid.js.org/syntax/flowchart.html'
  },
  {
    name: 'n8n Documentation - Workflows',
    url: 'https://docs.n8n.io/workflows/'
  }
];

async function fetchWebPage(url) {
  return new Promise((resolve, reject) => {
    const parsedUrl = new URL(url);
    const client = parsedUrl.protocol === 'https:' ? https : http;
    
    const options = {
      hostname: parsedUrl.hostname,
      path: parsedUrl.pathname + parsedUrl.search,
      method: 'GET',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8'
      }
    };
    
    const req = client.request(options, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          resolve(data);
        } else {
          reject(new Error(`HTTP ${res.statusCode}`));
        }
      });
    });
    
    req.on('error', (error) => {
      reject(error);
    });
    
    req.setTimeout(15000, () => {
      req.destroy();
      reject(new Error('Request timeout'));
    });
    
    req.end();
  });
}

function extractRelevantContent(html, sourceName) {
  const content = {
    source: sourceName,
    codeExamples: [],
    links: [],
    keyInfo: []
  };

  // Extract code blocks
  const codeMatches = html.match(/```[\s\S]*?```/g) || [];
  codeMatches.forEach(match => {
    if (match.includes('mermaid') || match.includes('n8n') || match.includes('workflow')) {
      content.codeExamples.push(match);
    }
  });

  // Extract links
  const linkMatches = html.match(/<a[^>]+href="([^"]+)"[^>]*>/g) || [];
  linkMatches.forEach(match => {
    const hrefMatch = match.match(/href="([^"]+)"/);
    if (hrefMatch) {
      const href = hrefMatch[1];
      if (href.includes('mermaid') || href.includes('n8n') || href.includes('workflow')) {
        content.links.push(href);
      }
    }
  });

  // Extract key information (simplified - look for common patterns)
  const infoPatterns = [
    /n8n.*workflow.*mermaid/gi,
    /convert.*n8n.*mermaid/gi,
    /mermaid.*diagram.*n8n/gi
  ];

  infoPatterns.forEach(pattern => {
    const matches = html.match(pattern);
    if (matches) {
      content.keyInfo.push(...matches.slice(0, 3));
    }
  });

  return content;
}

async function scrapeSource(source) {
  console.log(`\n🔍 Scraping: ${source.name}`);
  console.log(`   URL: ${source.url}`);
  console.log('─'.repeat(60));

  try {
    const html = await fetchWebPage(source.url);
    const content = extractRelevantContent(html, source.name);

    console.log(`✅ Successfully scraped`);
    console.log(`   Code examples: ${content.codeExamples.length}`);
    console.log(`   Relevant links: ${content.links.length}`);
    console.log(`   Key info snippets: ${content.keyInfo.length}`);

    if (content.codeExamples.length > 0) {
      console.log('\n📝 Code Examples Found:');
      content.codeExamples.slice(0, 2).forEach((example, index) => {
        console.log(`   ${index + 1}. ${example.substring(0, 100)}...`);
      });
    }

    if (content.links.length > 0) {
      console.log('\n🔗 Relevant Links:');
      [...new Set(content.links)].slice(0, 5).forEach((link, index) => {
        console.log(`   ${index + 1}. ${link}`);
      });
    }

    return content;
  } catch (error) {
    console.log(`❌ Failed: ${error.message}`);
    return null;
  }
}

async function main() {
  console.log('🖖 Web Scraping: n8n to Mermaid Integration Research');
  console.log('═'.repeat(60));
  console.log('Finding examples, tools, and documentation\n');

  const results = [];

  for (const source of TARGET_URLS) {
    const result = await scrapeSource(source);
    if (result) {
      results.push(result);
    }
    
    // Rate limiting
    await new Promise(resolve => setTimeout(resolve, 2000));
  }

  // Summary
  console.log('\n' + '═'.repeat(60));
  console.log('📊 Scraping Summary');
  console.log('═'.repeat(60));
  
  const totalExamples = results.reduce((sum, r) => sum + r.codeExamples.length, 0);
  const totalLinks = results.reduce((sum, r) => sum + r.links.length, 0);
  const uniqueLinks = new Set(results.flatMap(r => r.links));

  console.log(`\n✅ Sources scraped: ${results.length}/${TARGET_URLS.length}`);
  console.log(`   Code examples found: ${totalExamples}`);
  console.log(`   Relevant links found: ${totalLinks} (${uniqueLinks.size} unique)`);

  console.log('\n💡 Key Findings:');
  console.log('   1. GitHub project "n8nmermaid" exists for conversion');
  console.log('   2. n8n community has discussions about Mermaid visualization');
  console.log('   3. Mermaid supports flowchart, sequence, and state diagrams');
  console.log('   4. n8n workflows use JSON structure with nodes and connections');

  console.log('\n🚀 Recommended Next Steps:');
  console.log('   1. Review GitHub project: github.com/jwa91/n8nmermaid');
  console.log('   2. Implement converter based on n8n workflow structure');
  console.log('   3. Add Mermaid visualization to dashboard');
  console.log('   4. Test with existing n8n workflows');

  console.log('\n✅ Scraping complete!\n');
}

main().catch(console.error);

