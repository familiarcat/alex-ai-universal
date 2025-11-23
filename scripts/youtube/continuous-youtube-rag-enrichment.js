#!/usr/bin/env node

/**
 * 🎬 Continuous YouTube RAG Enrichment
 * 
 * Automates the process of enriching YouTube videos and integrating them
 * into the communal RAG memory system. Can process single videos, playlists,
 * or lists of URLs to continuously build our knowledge base.
 * 
 * This creates a growing communal memory that enhances all crew operations.
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const { getMCPMemoryStorage } = require('../utils/mcp-memory-storage');

console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('🎬 Continuous YouTube RAG Enrichment');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

const mcpMemory = getMCPMemoryStorage();
try {
  mcpMemory.initialize();
} catch (error) {
  console.error('❌ Failed to initialize MCP memory storage:', error.message);
  process.exit(1);
}

// Configuration
const config = {
  enrichScript: path.join(__dirname, 'enrich-youtube-to-rag.js'),
  integrationScript: path.join(__dirname, '..', 'crew', 'coordination', 'crew-identity-theories-integration.js'),
  autoIntegrate: process.argv.includes('--integrate') || process.argv.includes('-i'),
  // Frame capture is opt-in - default to 0 (CC captions only)
  frames: process.argv.find(arg => arg.startsWith('--frames='))?.split('=')[1] || '0',
  batchSize: parseInt(process.argv.find(arg => arg.startsWith('--batch='))?.split('=')[1] || '5', 10),
  delay: parseInt(process.argv.find(arg => arg.startsWith('--delay='))?.split('=')[1] || '2000', 10)
};

// Process single video
async function enrichVideo(url, index = 0, total = 1) {
  console.log(`\n${'='.repeat(70)}`);
  console.log(`📹 Processing Video ${index + 1}/${total}: ${url}`);
  console.log(`${'='.repeat(70)}\n`);
  
  const payloadPath = path.join(process.cwd(), `youtube-rag-${Date.now()}-${index}.json`);
  
  try {
    // Step 1: Enrich video
    console.log('📥 Step 1: Enriching video...');
    const enrichArgs = [
      config.enrichScript,
      url,
      payloadPath,
      '--store' // Auto-store in MCP RAG
    ];
    
    // Only add --frames flag if explicitly requested (non-zero)
    if (config.frames && config.frames !== '0') {
      enrichArgs.push(`--frames=${config.frames}`);
    }
    
    execSync(`node ${enrichArgs.map(a => `"${a}"`).join(' ')}`, {
      stdio: 'inherit',
      cwd: path.dirname(config.enrichScript)
    });
    
    console.log('✅ Video enriched and stored in MCP RAG\n');
    
    // Step 2: Integrate with crew (optional)
    if (config.autoIntegrate) {
      console.log('🖖 Step 2: Integrating with crew identity system...');
      
      try {
        execSync(`node "${config.integrationScript}" "${payloadPath}"`, {
          stdio: 'inherit',
          cwd: path.dirname(config.integrationScript)
        });
        
        console.log('✅ Crew identity integration complete\n');
      } catch (error) {
        console.log(`⚠️  Crew integration failed (continuing): ${error.message}\n`);
      }
    }
    
    return { success: true, url, payloadPath };
  } catch (error) {
    console.error(`❌ Failed to process ${url}: ${error.message}\n`);
    return { success: false, url, error: error.message };
  }
}

// Process multiple videos
async function enrichVideos(urls) {
  console.log(`\n🎯 Processing ${urls.length} video(s)...\n`);
  console.log(`Configuration:`);
  console.log(`   • Auto-integrate: ${config.autoIntegrate ? 'Yes' : 'No'}`);
  console.log(`   • Frames: ${config.frames}`);
  console.log(`   • Batch size: ${config.batchSize}`);
  console.log(`   • Delay between videos: ${config.delay}ms\n`);
  
  const results = [];
  
  for (let i = 0; i < urls.length; i++) {
    const result = await enrichVideo(urls[i], i, urls.length);
    results.push(result);
    
    // Delay between videos (except last one)
    if (i < urls.length - 1) {
      console.log(`⏳ Waiting ${config.delay}ms before next video...\n`);
      await new Promise(resolve => setTimeout(resolve, config.delay));
    }
  }
  
  return results;
}

// Load URLs from file
function loadUrlsFromFile(filePath) {
  if (!fs.existsSync(filePath)) {
    throw new Error(`File not found: ${filePath}`);
  }
  
  const content = fs.readFileSync(filePath, 'utf8');
  const urls = content
    .split('\n')
    .map(line => line.trim())
    .filter(line => line && !line.startsWith('#') && (line.includes('youtube.com') || line.includes('youtu.be')));
  
  return urls;
}

// Query RAG to see what we have
async function showRAGStats() {
  console.log('\n📊 Current RAG Memory Statistics:\n');
  
  try {
    // Query for YouTube videos
    const videoResults = await mcpMemory.queryMemories({
      query: 'youtube video',
      limit: 100
    });
    
    // Query for crew integrations
    const integrationResults = await mcpMemory.queryMemories({
      query: 'crew identity integration',
      limit: 100
    });
    
    console.log(`   📹 YouTube Videos: ${videoResults?.results?.length || 0}`);
    console.log(`   🖖 Crew Integrations: ${integrationResults?.results?.length || 0}`);
    console.log(`   💾 Total RAG Documents: ${(videoResults?.results?.length || 0) + (integrationResults?.results?.length || 0)}`);
    console.log('');
  } catch (error) {
    console.log(`   ⚠️  Could not query RAG stats: ${error.message}\n`);
  }
}

// Main execution
async function main() {
  const args = process.argv.slice(2).filter(arg => !arg.startsWith('--'));
  
  if (args.length === 0) {
    console.log('Usage:');
    console.log('  node scripts/youtube/continuous-youtube-rag-enrichment.js <url1> [url2] [url3] ...');
    console.log('  node scripts/youtube/continuous-youtube-rag-enrichment.js --file <urls.txt>');
    console.log('');
    console.log('Options:');
    console.log('  --integrate, -i          Auto-integrate with crew identity system');
    console.log('  --frames=N               Opt-in frame capture (default: 0, CC captions only)');
    console.log('  --batch=N                Batch size for processing (default: 5)');
    console.log('  --delay=N                Delay between videos in ms (default: 2000)');
    console.log('  --stats                  Show current RAG statistics');
    console.log('');
    console.log('Examples:');
    console.log('  # Single video');
    console.log('  node scripts/youtube/continuous-youtube-rag-enrichment.js https://youtube.com/watch?v=...');
    console.log('');
    console.log('  # Multiple videos with crew integration');
    console.log('  node scripts/youtube/continuous-youtube-rag-enrichment.js --integrate <url1> <url2> <url3>');
    console.log('');
    console.log('  # From file');
    console.log('  node scripts/youtube/continuous-youtube-rag-enrichment.js --file youtube-urls.txt --integrate');
    console.log('');
    process.exit(0);
  }
  
  // Show stats if requested
  if (process.argv.includes('--stats')) {
    await showRAGStats();
    if (args.length === 0 || (args.length === 1 && args[0] === '--file')) {
      process.exit(0);
    }
  }
  
  let urls = [];
  
  // Load from file or use command line args
  const fileIndex = process.argv.indexOf('--file');
  if (fileIndex !== -1 && process.argv[fileIndex + 1]) {
    const filePath = process.argv[fileIndex + 1];
    urls = loadUrlsFromFile(filePath);
    console.log(`📄 Loaded ${urls.length} URL(s) from ${filePath}\n`);
  } else {
    urls = args.filter(arg => arg.includes('youtube.com') || arg.includes('youtu.be'));
  }
  
  if (urls.length === 0) {
    console.error('❌ No YouTube URLs found');
    process.exit(1);
  }
  
  // Process videos
  const results = await enrichVideos(urls);
  
  // Summary
  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('📊 PROCESSING SUMMARY');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
  
  const successful = results.filter(r => r.success).length;
  const failed = results.filter(r => !r.success).length;
  
  console.log(`✅ Successful: ${successful}/${results.length}`);
  console.log(`❌ Failed: ${failed}/${results.length}\n`);
  
  if (successful > 0) {
    console.log('✅ Successfully processed videos:');
    results.filter(r => r.success).forEach((r, i) => {
      console.log(`   ${i + 1}. ${r.url}`);
    });
    console.log('');
  }
  
  if (failed > 0) {
    console.log('❌ Failed videos:');
    results.filter(r => !r.success).forEach((r, i) => {
      console.log(`   ${i + 1}. ${r.url} - ${r.error}`);
    });
    console.log('');
  }
  
  // Show updated stats
  await showRAGStats();
  
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('🎉 Continuous enrichment complete!');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
  
  console.log('💡 Your communal RAG memory has been enhanced!');
  console.log('   All videos are now searchable and can inform crew operations.\n');
}

main().catch(console.error);

