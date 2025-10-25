import { NextRequest, NextResponse } from 'next/server';
import path from 'path';
import { execFile } from 'child_process';

function run(cmd: string, args: string[], cwd: string): Promise<{ code: number; stdout: string; stderr: string }>{
  return new Promise((resolve) => {
    execFile(cmd, args, { cwd }, (error, stdout, stderr) => {
      resolve({ code: error ? (error as any).code || 1 : 0, stdout: String(stdout || ''), stderr: String(stderr || '') });
    });
  });
}

function extractYoutubeUrls(text: string): string[] {
  const urls = new Set<string>();
  const regex = /(https?:\/\/[^\s]+)/g; // coarse URL matcher
  let m: RegExpExecArray | null;
  while ((m = regex.exec(text)) !== null) {
    const u = m[1];
    if (/youtube\.com|youtu\.be/.test(u)) urls.add(u.replace(/[)\]\.,]+$/, ''));
  }
  return Array.from(urls);
}

export async function POST(req: NextRequest) {
  const authKey = process.env.CREW_OBS_KEY || process.env.CREW_KEY || '';
  const provided = req.headers.get('x-crew-key') || (req.headers.get('authorization') || '').replace(/^Bearer\s+/i, '');
  if (!authKey || provided !== authKey) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  }

  const body = await req.json().catch(() => ({} as any));
  const frames = Number.isFinite(body.frames) ? Number(body.frames) : 2;
  let urls: string[] = Array.isArray(body.urls) ? body.urls : [];
  if ((!urls || urls.length === 0) && typeof body.text === 'string') {
    urls = extractYoutubeUrls(body.text);
  }

  urls = (urls || []).map(String).filter(u => /^(https?:\/\/)/.test(u) && /(youtube\.com|youtu\.be)/.test(u));
  if (urls.length === 0) return NextResponse.json({ error: 'no_urls' }, { status: 400 });

  const repoRoot = path.resolve(process.cwd(), '..');
  const enrichScript = path.join(repoRoot, 'scripts', 'enrich-youtube-to-rag.js');
  const cliScript = path.join(repoRoot, 'scripts', 'n8n-cli-tools.js');

  const results: Array<{ url: string; ok: boolean; detail?: string }> = [];
  for (let i = 0; i < urls.length; i++) {
    const url = urls[i];
    const out = path.join(repoRoot, `youtube-rag-${Date.now()}-${i}.json`);
    const e1 = await run('node', [enrichScript, url, out, `--frames=${frames}`], repoRoot);
    if (e1.code !== 0) {
      results.push({ url, ok: false, detail: e1.stderr || e1.stdout });
      continue;
    }
    const e2 = await run('node', [cliScript, 'ingest', out], repoRoot);
    if (e2.code !== 0) {
      results.push({ url, ok: false, detail: e2.stderr || e2.stdout });
      continue;
    }
    results.push({ url, ok: true });
  }

  const okCount = results.filter(r => r.ok).length;
  return NextResponse.json({ ok: okCount === results.length, processed: results.length, succeeded: okCount, results });
}


