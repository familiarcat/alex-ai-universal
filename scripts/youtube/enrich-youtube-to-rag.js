#!/usr/bin/env node

/**
 * Enrich a YouTube video into MCP RAG format and optionally store via MCP memory storage.
 * - Fetch oEmbed metadata
 * - Best-effort description (from watch page)
 * - Best-effort transcript via timedtext XML (if available)
 * - Optional: Top comments via Puppeteer (fallback if puppeteer not available)
 * - Optional: Frame capture via yt-dlp + ffmpeg
 *
 * Usage:
 *   node scripts/enrich-youtube-to-rag.js <youtube_url> [output_json] [--store] [--frames=N] [--no-frames]
 *
 * Output:
 *   Creates MCP-formatted payload (default: youtube-rag-payload.json)
 *   If --store flag is provided, directly stores to RAG via MCP memory storage
 */

const https = require('https');
const http = require('http');
const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');

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
          'User-Agent': 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120 Safari/537.36'
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

function extractVideoId(youtubeUrl) {
  try {
    const u = new URL(youtubeUrl);
    if (u.hostname.includes('youtube.com')) {
      return u.searchParams.get('v');
    }
    if (u.hostname.includes('youtu.be')) {
      return u.pathname.slice(1);
    }
  } catch (_) {}
  return null;
}

async function fetchOEmbed(youtubeUrl) {
  const oembedUrl = `https://www.youtube.com/oembed?url=${encodeURIComponent(youtubeUrl)}&format=json`;
  const res = await httpGet(oembedUrl);
  if (res.status >= 200 && res.status < 300) {
    try { return JSON.parse(res.body); } catch { return null; }
  }
  return null;
}

function decodeHtmlEntities(str) {
  return str
    .replace(/&#39;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>');
}

async function fetchDescriptionFromWatch(videoId) {
  if (!videoId) return '';
  const url = `https://www.youtube.com/watch?v=${videoId}&gl=US&hl=en`;
  const res = await httpGet(url);
  if (res.status < 200 || res.status >= 300) return '';
  // Try to extract shortDescription JSON field
  const m = res.body.match(/"shortDescription":"([\s\S]*?)"/);
  if (m && m[1]) {
    const raw = m[1]
      .replace(/\\n/g, '\n')
      .replace(/\\"/g, '"');
    return decodeHtmlEntities(raw);
  }
  return '';
}

async function fetchTranscript(videoId) {
  if (!videoId) return '';
  const candidates = [
    `https://www.youtube.com/api/timedtext?lang=en&v=${videoId}`,
    `https://www.youtube.com/api/timedtext?lang=en-US&v=${videoId}`,
    `https://www.youtube.com/api/timedtext?lang=en-GB&v=${videoId}`
  ];
  for (const url of candidates) {
    try {
      const res = await httpGet(url);
      if (res.status >= 200 && res.status < 300 && res.body.includes('<text')) {
        const lines = Array.from(res.body.matchAll(/<text[^>]*>([\s\S]*?)<\/text>/g)).map(m => m[1]);
        const text = lines
          .map(t => decodeHtmlEntities(t.replace(/\n/g, ' ').replace(/<[^>]+>/g, ' ')))
          .join(' ')
          .replace(/\s+/g, ' ')
          .trim();
        if (text.length > 0) return text;
      }
    } catch (_) {}
  }
  return '';
}

async function fetchTopCommentsWithPuppeteer(youtubeUrl, maxComments = 20) {
  try {
    const puppeteer = require('puppeteer');
    const browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox','--disable-setuid-sandbox','--disable-dev-shm-usage']
    });
    const page = await browser.newPage();
    await page.goto(youtubeUrl, { waitUntil: 'networkidle2', timeout: 60000 });
    await page.waitForSelector('ytd-comments#comments', { timeout: 30000 }).catch(() => {});

    // Scroll to load comments
    for (let i = 0; i < 8; i++) {
      await page.evaluate(() => window.scrollBy(0, window.innerHeight));
      await page.waitForTimeout(800);
    }

    const comments = await page.evaluate((limit) => {
      const items = Array.from(document.querySelectorAll('ytd-comment-thread-renderer'));
      return items.slice(0, limit).map((el) => {
        const textEl = el.querySelector('#content-text');
        const authorEl = el.querySelector('#author-text');
        const published = el.querySelector('a[href^="#"]')?.textContent || '';
        const likes = el.querySelector('#vote-count-middle')?.textContent?.trim() || '';
        return {
          author: authorEl?.textContent?.trim() || '',
          text: textEl?.textContent?.trim() || '',
          published,
          likes
        };
      }).filter(c => c.text);
    }, maxComments);

    await browser.close();
    return comments;
  } catch (_) {
    return [];
  }
}

function getFlag(name, def = undefined) {
  const idx = process.argv.findIndex(a => a === `--${name}` || a.startsWith(`--${name}=`));
  if (idx === -1) return def;
  const val = process.argv[idx].includes('=') ? process.argv[idx].split('=')[1] : process.argv[idx + 1];
  return val === undefined ? def : val;
}

async function main() {
  const youtubeUrl = process.argv[2];
  const outputPath = process.argv[3] || path.join(process.cwd(), 'youtube-rag-payload.json');
  // Frame capture is opt-in only - default to false (use CC captions only)
  const captureFrames = Boolean(getFlag('frames', undefined) !== undefined || getFlag('capture-frames', undefined) !== undefined);
  const framesCount = captureFrames ? (parseInt(getFlag('frames', '8'), 10) || 8) : 0;
  if (!youtubeUrl) {
    console.error('Usage: node scripts/enrich-youtube-to-rag.js <youtube_url> [output_json] [--store] [--frames=N]');
    console.error('  Default: CC captions/transcripts only (no frame capture)');
    console.error('  --frames=N: Opt-in frame capture (e.g., --frames=8)');
    process.exit(1);
  }

  const videoId = extractVideoId(youtubeUrl);
  
  // Fast mode: Skip slow operations by default (CC captions only)
  const fastMode = !process.argv.includes('--full');
  if (fastMode) {
    console.log('⚡ Fast mode: CC captions only (use --full for description & comments)');
  }
  
  console.log('📥 Fetching video metadata...');
  const oembed = await Promise.race([
    fetchOEmbed(youtubeUrl),
    new Promise((_, reject) => setTimeout(() => reject(new Error('OEmbed timeout')), 10000))
  ]).catch(() => null);
  
  console.log('📝 Fetching CC captions...');
  const transcript = await Promise.race([
    fetchTranscript(videoId),
    new Promise((_, reject) => setTimeout(() => reject(new Error('Transcript timeout')), 30000))
  ]).catch(() => '');
  
  // Skip slow operations in fast mode
  let description = '';
  let comments = [];
  if (!fastMode) {
    console.log('📄 Fetching description...');
    description = await Promise.race([
      fetchDescriptionFromWatch(videoId),
      new Promise((_, reject) => setTimeout(() => reject(new Error('Description timeout')), 15000))
    ]).catch(() => '');
    
    console.log('💬 Fetching comments...');
    comments = await Promise.race([
      fetchTopCommentsWithPuppeteer(youtubeUrl, 20),
      new Promise((_, reject) => setTimeout(() => reject(new Error('Comments timeout')), 30000))
    ]).catch(() => []);
  }

  const title = (oembed && oembed.title) || 'YouTube Video';
  const author = (oembed && oembed.author_name) || '';
  const thumb = (oembed && oembed.thumbnail_url) || '';

  // Legacy format (for backward compatibility)
  const documents = [];
  
  // MCP format documents (for direct storage)
  const transcriptDocs = [];

  documents.push({
    doc_type: 'video',
    audience: 'all',
    category: 'ai-best-practices',
    title: title,
    summary: description ? description.slice(0, 400) : 'YouTube video metadata',
    content: [
      `Title: ${title}`,
      author ? `Author: ${author}` : '',
      thumb ? `Thumbnail: ${thumb}` : '',
      description ? `Description:\n${description}` : ''
    ].filter(Boolean).join('\n\n'),
    keywords: ['youtube','ai','agentic','best-practices'],
    source_type: 'youtube',
    source_url: youtubeUrl,
    is_current: true
  });

  if (transcript && transcript.length > 0) {
    // Split transcript into ~1500 char chunks
    const chunks = [];
    for (let i = 0; i < transcript.length; i += 1500) {
      chunks.push(transcript.slice(i, i + 1500));
    }
    chunks.forEach((chunk, idx) => {
      // Legacy format
      documents.push({
        doc_type: 'transcript',
        audience: 'all',
        category: 'ai-best-practices',
        title: `${title} (Transcript ${idx + 1}/${chunks.length})`,
        summary: chunk.slice(0, 300),
        content: chunk,
        keywords: ['youtube','transcript','ai','agentic'],
        source_type: 'youtube',
        source_url: youtubeUrl,
        is_current: true
      });
      
      // MCP format
      transcriptDocs.push({
        session_id: `youtube-${videoId}-transcript-${idx + 1}`,
        category: 'youtube_transcript',
        title: `${title} (Transcript ${idx + 1}/${chunks.length})`,
        content: chunk,
        tags: ['youtube', 'transcript', 'video'],
        source_url: youtubeUrl,
        metadata: {
          videoId,
          chunkIndex: idx + 1,
          totalChunks: chunks.length
        }
      });
    });
  }

  const commentsDoc = comments && comments.length > 0 ? {
    // Legacy format
    doc_type: 'comments',
    audience: 'all',
    category: 'ai-best-practices',
    title: `${title} (Top Comments)`,
    summary: '',
    content: '',
    keywords: ['youtube','comments','ai','agentic'],
    source_type: 'youtube',
    source_url: youtubeUrl,
    is_current: true
  } : null;
  
  if (comments && comments.length > 0) {
    const topCommentsJoined = comments.map((c, i) => `#${i + 1} ${c.author} (${c.likes || '0'} likes):\n${c.text}`).join('\n\n');
    commentsDoc.summary = topCommentsJoined.slice(0, 300);
    commentsDoc.content = topCommentsJoined.slice(0, 8000);
    documents.push(commentsDoc);
  }

  // Optional: capture key frames using helper script (yt-dlp + ffmpeg)
  // Only if explicitly requested via --frames or --capture-frames flag
  if (captureFrames && framesCount > 0) {
    try {
        const scriptPath = path.join(process.cwd(), 'scripts', 'youtube', 'youtube-capture-frames.sh');
      if (fs.existsSync(scriptPath)) {
        const stdout = execFileSync('bash', [scriptPath, youtubeUrl, String(framesCount)], { encoding: 'utf8' });
        const lines = String(stdout || '').trim().split(/\r?\n/);
        const outDir = lines[lines.length - 1];
        if (outDir && fs.existsSync(outDir)) {
          const files = fs.readdirSync(outDir)
            .filter(f => f.match(/^frame-\d+\.jpg$/))
            .map(f => path.join(outDir, f))
            .sort();
          if (files.length) {
            documents.push({
              doc_type: 'frames',
              audience: 'all',
              category: 'ai-best-practices',
              title: `${title} (Key Frames)`,
              summary: `Extracted ${files.length} frames for visual context`,
              content: files.map(f => `Frame: ${f}`).join('\n'),
              assets: files,
              keywords: ['youtube','frames','screenshots','context'],
              source_type: 'youtube',
              source_url: youtubeUrl,
              is_current: true,
            });
          }
        }
      }
    } catch (e) {
      console.error('Frame capture skipped:', e.message);
    }
  }

  // Build full content for MCP format (combine all extracted content)
  const transcriptText = transcriptDocs.length > 0 ? transcriptDocs.map(d => d.content).join('\n\n') : '';
  const commentsText = commentsDoc ? commentsDoc.content : '';
  
  const fullContent = [
    `Title: ${title}`,
    author ? `Author: ${author}` : '',
    thumb ? `Thumbnail: ${thumb}` : '',
    description ? `Description:\n${description}` : '',
    transcriptText ? `\n\n--- TRANSCRIPT ---\n${transcriptText}` : '',
    commentsText ? `\n\n--- TOP COMMENTS ---\n${commentsText}` : ''
  ].filter(Boolean).join('\n\n');

  // Build full content for MCP format (combine all extracted content)
  const transcriptTextForMCP = transcriptDocs.length > 0 ? transcriptDocs.map(d => d.content).join('\n\n') : '';
  const commentsTextForMCP = commentsDoc ? commentsDoc.content : '';
  
  const fullContentForMCP = [
    `Title: ${title}`,
    author ? `Author: ${author}` : '',
    thumb ? `Thumbnail: ${thumb}` : '',
    description ? `Description:\n${description}` : '',
    transcriptTextForMCP ? `\n\n--- TRANSCRIPT ---\n${transcriptTextForMCP}` : '',
    commentsTextForMCP ? `\n\n--- TOP COMMENTS ---\n${commentsTextForMCP}` : ''
  ].filter(Boolean).join('\n\n');

  // Convert to MCP format (single comprehensive document)
  const mcpPayload = {
    session_id: `youtube-${videoId}-${Date.now()}`,
    category: 'youtube_video',
    title: title,
    content: fullContentForMCP,
    tags: ['youtube', 'video', 'rag', 'enriched'],
    metadata: {
      videoId,
      author,
      thumbnail: thumb,
      source_url: youtubeUrl,
      transcriptChunks: transcriptDocs.length,
      hasComments: !!commentsDoc,
      frameCount: documents.filter(d => d.doc_type === 'frames').length,
      enrichedAt: new Date().toISOString()
    }
  };

  // Optionally store directly via MCP
  const shouldStore = process.argv.includes('--store');
  if (shouldStore) {
    try {
      const { getMCPMemoryStorage } = require('../utils/mcp-memory-storage');
      const mcpMemory = getMCPMemoryStorage();
      mcpMemory.initialize();
      
      console.log('💾 Storing directly in MCP RAG system...');
      const result = await mcpMemory.storeMemory({
        sessionId: mcpPayload.session_id,
        category: mcpPayload.category,
        title: mcpPayload.title,
        content: mcpPayload.content,
        tags: mcpPayload.tags,
        crewMember: 'data',
        metadata: mcpPayload.metadata
      });
      
      if (result && result.success) {
        console.log(`✅ Stored in RAG! Session ID: ${result.result?.[0]?.session_id || mcpPayload.session_id}`);
      }
    } catch (error) {
      console.error('⚠️  MCP storage failed:', error.message);
      console.log('   Saving payload for manual storage...');
    }
  }

  // Save payload in both formats for compatibility
  fs.writeFileSync(outputPath, JSON.stringify({ documents }, null, 2));
  
  const mcpOutputPath = outputPath.replace('.json', '-mcp.json');
  fs.writeFileSync(mcpOutputPath, JSON.stringify(mcpPayload, null, 2));
  
  console.log(`✅ Created payloads:`);
  console.log(`   Legacy format: ${outputPath}`);
  console.log(`   MCP format: ${mcpOutputPath}`);
  
  if (!shouldStore) {
    console.log('\n💡 To store directly in MCP RAG:');
    console.log(`   node scripts/enrich-youtube-to-rag.js "${youtubeUrl}" ${path.basename(outputPath)} --store`);
    console.log('\n💡 Or use crew analysis:');
    console.log(`   node scripts/crew-youtube-analysis-to-rag.js ${path.basename(outputPath)}`);
  }
}

if (require.main === module) {
  main().catch((e) => {
    console.error('❌ Enrichment failed:', e.message);
    process.exit(1);
  });
}
