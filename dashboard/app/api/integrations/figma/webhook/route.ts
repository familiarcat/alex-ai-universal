import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { spawn } from 'child_process';

function safeEqual(a: string, b: string): boolean {
  try {
    const ba = Buffer.from(a, 'hex');
    const bb = Buffer.from(b, 'hex');
    if (ba.length !== bb.length) return false;
    return crypto.timingSafeEqual(ba, bb);
  } catch {
    return false;
  }
}

function getThemeIdFromEnvByFileKey(fileKey: string): string | null {
  const prefix = 'FIGMA_FILE_KEY_';
  for (const [key, value] of Object.entries(process.env)) {
    if (!key.startsWith(prefix)) continue;
    if (!value) continue;
    if (value === fileKey) {
      const suffix = key.substring(prefix.length);
      return suffix.toLowerCase().replace(/_/g, '-');
    }
  }
  return null;
}

export async function POST(request: NextRequest) {
  const secret = process.env.FIGMA_WEBHOOK_SECRET || '';
  const raw = await request.text();

  // Optional signature verification (best effort; supports common header variants)
  if (secret) {
    const provided =
      request.headers.get('x-figma-signature') ||
      request.headers.get('x-hub-signature-256') ||
      '';

    const cleaned = provided.startsWith('sha256=') ? provided.slice(7) : provided;
    const computed = crypto.createHmac('sha256', secret).update(raw).digest('hex');
    if (!safeEqual(computed, cleaned)) {
      return NextResponse.json({ ok: false, error: 'invalid signature' }, { status: 401 });
    }
  }

  let payload: any = null;
  try {
    payload = JSON.parse(raw);
  } catch {
    return NextResponse.json({ ok: false, error: 'bad json' }, { status: 400 });
  }

  const fileKey: string = payload?.file_key || payload?.fileKey || '';
  if (!fileKey) {
    return NextResponse.json({ ok: false, error: 'missing file_key' }, { status: 400 });
  }

  const themeId = getThemeIdFromEnvByFileKey(fileKey);

  // If no explicit mapping is configured, fall back to syncing all configured themes.
  // This supports a single .fig housing all themes to avoid configuration dead-ends.
  if (!themeId) {
    try {
      const child = spawn('bash', ['scripts/figma-sync-all.sh'], {
        cwd: process.cwd(),
        env: { ...process.env },
        stdio: 'ignore'
      });
      child.unref();
      return NextResponse.json({ ok: true, accepted: true, mode: 'sync-all' });
    } catch (e: any) {
      return NextResponse.json({ ok: false, error: e?.message || 'spawn failed' }, { status: 500 });
    }
  }

  // Trigger background sync for the mapped theme only
  try {
    const child = spawn('node', ['scripts/figma-token-sync.js', themeId], {
      cwd: process.cwd(),
      env: { ...process.env, FIGMA_FILE_KEY: fileKey },
      stdio: 'ignore'
    });
    child.unref();
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e?.message || 'spawn failed' }, { status: 500 });
  }

  return NextResponse.json({ ok: true, accepted: true, theme: themeId });
}


