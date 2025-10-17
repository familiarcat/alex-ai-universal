#!/usr/bin/env node

/**
 * Enrich a YouTube video into Supabase RAG payload and ingest via N8N webhook.
 * - Fetch oEmbed metadata
 * - Best-effort description (from watch page)
 * - Best-effort transcript via timedtext XML (if available)
 * - Optional: Top comments via Puppeteer (fallback if puppeteer not available)
 *
 * Usage:
 *   node scripts/enrich-youtube-to-rag.js <youtube_url> [output_json]
 *
 * Output:
 *   Writes payload JSON (default: youtube-rag-payload.json) and logs next steps.
 */

const https = require('https');
const http = require('http');
const fs = require('fs');
const path = require('path');

function httpGet(urlStr) {
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
        }
      }, (res) => {
        let data = '';
        res.on('data', (chunk) => (data += chunk));
        res.on('end', () => resolve({ status: res.statusCode || 0, body: data }));
      });
      req.on('error', reject);
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

async function main() {
  const youtubeUrl = process.argv[2];
  const outputPath = process.argv[3] || path.join(process.cwd(), 'youtube-rag-payload.json');
  if (!youtubeUrl) {
    console.error('Usage: node scripts/enrich-youtube-to-rag.js <youtube_url> [output_json]');
    process.exit(1);
  }

  const videoId = extractVideoId(youtubeUrl);
  const oembed = await fetchOEmbed(youtubeUrl);
  const description = await fetchDescriptionFromWatch(videoId);
  const transcript = await fetchTranscript(videoId);
  const comments = await fetchTopCommentsWithPuppeteer(youtubeUrl, 20);

  const title = (oembed && oembed.title) || 'YouTube Video';
  const author = (oembed && oembed.author_name) || '';
  const thumb = (oembed && oembed.thumbnail_url) || '';

  const documents = [];

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
    });
  }

  if (comments && comments.length > 0) {
    const topCommentsJoined = comments.map((c, i) => `#${i + 1} ${c.author} (${c.likes || '0'} likes):\n${c.text}`).join('\n\n');
    documents.push({
      doc_type: 'comments',
      audience: 'all',
      category: 'ai-best-practices',
      title: `${title} (Top Comments)`,
      summary: topCommentsJoined.slice(0, 300),
      content: topCommentsJoined.slice(0, 8000),
      keywords: ['youtube','comments','ai','agentic'],
      source_type: 'youtube',
      source_url: youtubeUrl,
      is_current: true
    });
  }

  fs.writeFileSync(outputPath, JSON.stringify({ documents }, null, 2));
  console.log(`✅ Created payload: ${outputPath}`);
  console.log('Next: Ingest via N8N:');
  console.log(`  node scripts/n8n-cli-tools.js ingest ${path.basename(outputPath)}`);
}

if (require.main === module) {
  main().catch((e) => {
    console.error('❌ Enrichment failed:', e.message);
    process.exit(1);
  });
}


