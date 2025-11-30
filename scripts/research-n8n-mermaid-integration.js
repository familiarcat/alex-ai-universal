#!/usr/bin/env node

/**
 * Research n8n to Mermaid Visualization Integration
 * 
 * Scrapes web to find examples and documentation about converting
 * n8n workflows to Mermaid diagram format
 * 
 * Reviewed by: Commander Data (Research) & Lt. Uhura (Integration)
 */

const https = require('https');
const http = require('http');
const { URL } = require('url');

const SEARCH_QUERIES = [
  'n8n workflow to mermaid diagram',
  'n8n mermaid visualization',
  'n8n workflow structure json',
  'mermaid flowchart n8n',
  'n8n workflow diagram generator',
  'convert n8n to mermaid'
];

const RESEARCH_SOURCES = [
  {
    name: 'n8n Documentation',
    url: 'https://docs.n8n.io',
    search: '/search?q=mermaid'
  },
  {
    name: 'GitHub n8n',
    url: 'https://github.com/n8n-io/n8n',
    search: '/search?q=mermaid'
  },
  {
    name: 'Mermaid Documentation',
    url: 'https://mermaid.js.org',
    search: '/config/Tutorials.html'
  },
  {
    name: 'n8n Community Forum',
    url: 'https://community.n8n.io',
    search: '/search?q=mermaid'
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
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36'
      }
    };
    
    const req = client.request(options, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        if (res.statusCode === 200) {
          resolve(data);
        } else {
          reject(new Error(`HTTP ${res.statusCode}`));
        }
      });
    });
    
    req.on('error', (error) => {
      reject(error);
    });
    
    req.setTimeout(10000, () => {
      req.destroy();
      reject(new Error('Request timeout'));
    });
    
    req.end();
  });
}

async function searchWeb(query) {
  console.log(`\n🔍 Searching: "${query}"`);
  console.log('─'.repeat(60));
  
  // Try web search via DuckDuckGo or similar
  const searchUrl = `https://html.duckduckgo.com/html/?q=${encodeURIComponent(query)}`;
  
  try {
    const html = await fetchWebPage(searchUrl);
    
    // Extract potential links (simplified - in production use proper HTML parsing)
    const linkMatches = html.match(/<a[^>]+href="([^"]+)"[^>]*>/g) || [];
    const links = linkMatches
      .map(match => {
        const hrefMatch = match.match(/href="([^"]+)"/);
        return hrefMatch ? hrefMatch[1] : null;
      })
      .filter(link => link && (link.includes('n8n') || link.includes('mermaid')))
      .slice(0, 5);
    
    if (links.length > 0) {
      console.log(`✅ Found ${links.length} relevant links:`);
      links.forEach((link, index) => {
        console.log(`   ${index + 1}. ${link}`);
      });
      return links;
    } else {
      console.log('⚠️  No relevant links found');
      return [];
    }
  } catch (error) {
    console.log(`❌ Search failed: ${error.message}`);
    return [];
  }
}

async function analyzeN8NWorkflowStructure() {
  console.log('\n📊 Analyzing n8n Workflow Structure');
  console.log('═'.repeat(60));
  
  // Common n8n workflow structure
  const n8nWorkflowStructure = {
    name: 'Workflow name',
    nodes: [
      {
        id: 'node-id',
        type: 'n8n-nodes-base.trigger',
        typeVersion: 1,
        position: [250, 300],
        parameters: {},
        name: 'Node Name'
      }
    ],
    connections: {
      'Node Name': {
        main: [[{ node: 'Next Node', type: 'main', index: 0 }]]
      }
    },
    pinData: {},
    settings: {},
    staticData: null,
    tags: []
  };
  
  console.log('📋 n8n Workflow Structure:');
  console.log(JSON.stringify(n8nWorkflowStructure, null, 2));
  
  console.log('\n🔑 Key Components:');
  console.log('   • nodes: Array of workflow nodes');
  console.log('   • connections: Node connections/edges');
  console.log('   • position: [x, y] coordinates');
  console.log('   • type: Node type (trigger, action, etc.)');
  
  return n8nWorkflowStructure;
}

function generateMermaidExample() {
  console.log('\n📊 Mermaid Diagram Format');
  console.log('═'.repeat(60));
  
  const mermaidExample = `
graph TD
    A[Start Trigger] --> B[Process Data]
    B --> C{Decision}
    C -->|Yes| D[Action 1]
    C -->|No| E[Action 2]
    D --> F[End]
    E --> F
  `.trim();
  
  console.log('📋 Example Mermaid Flowchart:');
  console.log(mermaidExample);
  
  console.log('\n🔑 Key Mermaid Elements:');
  console.log('   • graph TD: Top-down flowchart');
  console.log('   • --> : Connection arrow');
  console.log('   • [] : Rectangular node');
  console.log('   • {} : Diamond (decision)');
  console.log('   • |label| : Edge label');
  
  return mermaidExample;
}

function createConversionStrategy() {
  console.log('\n🔄 n8n to Mermaid Conversion Strategy');
  console.log('═'.repeat(60));
  
  const strategy = {
    nodeMapping: {
      'trigger': 'Start node → [Trigger Name]',
      'action': 'Action node → [Action Name]',
      'condition': 'Condition node → {Condition}',
      'webhook': 'Webhook node → [Webhook Name]',
      'function': 'Function node → [Function Name]'
    },
    connectionMapping: {
      'main': 'Standard connection → -->',
      'error': 'Error connection → -.->|error|',
      'conditional': 'Conditional → -->|condition|'
    },
    positionHandling: {
      'usePositions': 'Use n8n position data for layout',
      'autoLayout': 'Use Mermaid auto-layout',
      'hierarchical': 'Convert to hierarchical structure'
    }
  };
  
  console.log('📋 Conversion Mapping:');
  console.log(JSON.stringify(strategy, null, 2));
  
  console.log('\n💡 Implementation Approach:');
  console.log('   1. Parse n8n workflow JSON');
  console.log('   2. Map nodes to Mermaid syntax');
  console.log('   3. Convert connections to edges');
  console.log('   4. Handle node types (trigger, action, condition)');
  console.log('   5. Generate Mermaid diagram code');
  
  return strategy;
}

async function main() {
  console.log('🖖 Research: n8n to Mermaid Visualization Integration');
  console.log('═'.repeat(60));
  console.log('Investigating workflow structure and conversion possibilities\n');
  
  try {
    // Step 1: Analyze n8n workflow structure
    const n8nStructure = await analyzeN8NWorkflowStructure();
    
    // Step 2: Generate Mermaid example
    const mermaidExample = generateMermaidExample();
    
    // Step 3: Create conversion strategy
    const strategy = createConversionStrategy();
    
    // Step 4: Search web for examples
    console.log('\n🌐 Web Research');
    console.log('═'.repeat(60));
    
    const allLinks = [];
    for (const query of SEARCH_QUERIES.slice(0, 3)) { // Limit to 3 queries
      const links = await searchWeb(query);
      allLinks.push(...links);
      await new Promise(resolve => setTimeout(resolve, 2000)); // Rate limiting
    }
    
    // Step 5: Summary
    console.log('\n' + '═'.repeat(60));
    console.log('📊 Research Summary');
    console.log('═'.repeat(60));
    
    console.log('\n✅ Analysis Complete:');
    console.log('   • n8n workflow structure: Analyzed');
    console.log('   • Mermaid format: Documented');
    console.log('   • Conversion strategy: Created');
    console.log(`   • Web resources found: ${new Set(allLinks).size} unique links`);
    
    console.log('\n💡 Key Findings:');
    console.log('   1. n8n workflows use JSON with nodes and connections');
    console.log('   2. Mermaid uses text-based diagram syntax');
    console.log('   3. Conversion requires mapping nodes → Mermaid elements');
    console.log('   4. Connections map directly to Mermaid edges');
    console.log('   5. Node types determine Mermaid shape (trigger, action, condition)');
    
    console.log('\n🚀 Next Steps:');
    console.log('   1. Create n8n workflow parser');
    console.log('   2. Build Mermaid generator');
    console.log('   3. Implement node type mapping');
    console.log('   4. Test with real n8n workflows');
    console.log('   5. Add to dashboard visualization');
    
    console.log('\n✅ Research complete!\n');
    
  } catch (error) {
    console.error('\n❌ Research failed:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

main().catch(console.error);

