import { NextRequest, NextResponse } from 'next/server';
import path from 'path';
import { execFile } from 'child_process';

function run(cmd: string, args: string[], cwd: string): Promise<{ code: number; stdout: string; stderr: string }>{
  return new Promise((resolve) => {
    const child = execFile(cmd, args, { cwd }, (error, stdout, stderr) => {
      resolve({ code: error ? (error as any).code || 1 : 0, stdout: stdout?.toString() || '', stderr: stderr?.toString() || '' });
    });
  });
}

export async function POST(req: NextRequest) {
  const authKey = process.env.CREW_OBS_KEY || process.env.CREW_KEY || '';
  const provided = req.headers.get('x-crew-key') || (req.headers.get('authorization') || '').replace(/^Bearer\s+/i, '');
  if (!authKey || provided !== authKey) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  }

  const body = await req.json().catch(() => ({} as any));
  const url: string = String(body.url || '').trim();
  const frames = Number.isFinite(body.frames) ? Number(body.frames) : undefined;
  if (!url || !(url.startsWith('http://') || url.startsWith('https://'))) {
    return NextResponse.json({ error: 'invalid url' }, { status: 400 });
  }
  if (!/youtube\.com|youtu\.be/.test(url)) {
    return NextResponse.json({ error: 'only youtube supported' }, { status: 400 });
  }

  const repoRoot = path.resolve(process.cwd(), '..');
  const payloadPath = path.join(repoRoot, 'youtube-rag-payload.json');
  const enrichScript = path.join(repoRoot, 'scripts', 'enrich-youtube-to-rag.js');
  const cliScript = path.join(repoRoot, 'scripts', 'n8n-cli-tools.js');

  // 1) Enrich (optionally capture frames)
  const enrichArgs = [enrichScript, url, payloadPath];
  if (typeof frames === 'number') enrichArgs.push(`--frames=${frames}`);
  const e1 = await run('node', enrichArgs, repoRoot);
  if (e1.code !== 0) {
    return NextResponse.json({ error: 'enrich_failed', details: e1.stderr || e1.stdout }, { status: 500 });
  }

  // 2) Ingest via n8n CLI tools
  const e2 = await run('node', [cliScript, 'ingest', payloadPath], repoRoot);
  if (e2.code !== 0) {
    return NextResponse.json({ error: 'ingest_failed', details: e2.stderr || e2.stdout }, { status: 502 });
  }

  // 3) Optional summarizer can be triggered client-side; we return ok
  return NextResponse.json({ ok: true, payload: path.basename(payloadPath) });
}


