import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

/**
 * Lounge Latest API
 * - Strictly proxies to n8n (no direct Supabase access from UI)
 * - Reads webhook from env (N8N_LOUNGE_LATEST_WEBHOOK or N8N_URL + /webhook/lounge-latest)
 */

function buildWebhookUrl(): string | null {
  const explicit = process.env.NEXT_PUBLIC_N8N_LOUNGE_LATEST_WEBHOOK || process.env.N8N_LOUNGE_LATEST_WEBHOOK;
  const base = process.env.NEXT_PUBLIC_N8N_URL || process.env.N8N_URL;

  if (explicit) {
    if (/^https?:\/\//i.test(explicit)) return explicit;
    if (explicit.startsWith('/')) {
      if (!base) return null;
      return `${base.replace(/\/$/, '')}${explicit}`;
    }
  }

  if (!base) return null;
  return `${base.replace(/\/$/, '')}/webhook/lounge-latest`;
}

export async function GET() {
  try {
    const primary = buildWebhookUrl();
    const base = process.env.NEXT_PUBLIC_N8N_URL || process.env.N8N_URL || '';
    if (!primary && !base) {
      return NextResponse.json({ error: 'N8N not configured' }, { status: 500 });
    }

    const baseNorm = base ? base.replace(/\/$/, '') : '';
    const candidates = Array.from(new Set([
      primary,
      baseNorm ? `${baseNorm}/webhook/lounge-latest` : null,
      baseNorm ? `${baseNorm}/webhook/lounge-latest/` : null,
      baseNorm ? `${baseNorm}/n8n/webhook/lounge-latest` : null,
      baseNorm ? `${baseNorm}/n8n/webhook/lounge-latest/` : null,
      baseNorm ? `${baseNorm}/webhook-test/lounge-latest` : null,
      baseNorm ? `${baseNorm}/webhook-test/lounge-latest/` : null,
      baseNorm ? `${baseNorm}/n8n/webhook-test/lounge-latest` : null,
      baseNorm ? `${baseNorm}/n8n/webhook-test/lounge-latest/` : null,
    ].filter(Boolean) as string[]));

    let data: any = null;
    let lastError: { status?: number; body?: string } | null = null;

    for (const url of candidates) {
      try {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 8000);
        const res = await fetch(url, { method: 'GET', signal: controller.signal, headers: { 'Accept': 'application/json' } });
        clearTimeout(timeout);
        if (!res.ok) {
          lastError = { status: res.status, body: await res.text().catch(() => '') };
          continue;
        }
        data = await res.json().catch(() => null);
        if (data) {
          break;
        }
      } catch (e) {
        // try next candidate
        continue;
      }
    }
    if (!data) {
      // Dev fallback: synthesize from local crew-memories if available
      try {
        const cwd = process.cwd();
        const roots = Array.from(new Set([
          cwd,
          path.resolve(cwd, '..'),
          path.resolve(cwd, '..', '..')
        ]));
        const candidates: string[] = [];
        for (const root of roots) {
          candidates.push(path.join(root, 'crew-memories', 'active'));
          candidates.push(path.join(root, 'crew-memories'));
        }
        const seen = new Set<string>();
        const crew: any[] = [];
        for (const dir of candidates) {
          if (!fs.existsSync(dir)) continue;
          const files = fs.readdirSync(dir).filter(f => f.endsWith('.json'));
          for (const file of files) {
            const filePath = path.join(dir, file);
            try {
              const json = JSON.parse(fs.readFileSync(filePath, 'utf8'));
              const member = json.crew_member || json.member || json.name || path.basename(file, '.json');
              if (seen.has(member)) continue;
              seen.add(member);
              crew.push({
                crew_member: String(member || ''),
                title: String(json.title || json.topic || 'Latest Briefing'),
                summary: String(json.summary || json.brief || ''),
                key_findings: Array.isArray(json.key_findings) ? json.key_findings.map(String) : [],
                conclusions: Array.isArray(json.conclusions) ? json.conclusions.map(String) : [],
                recommendations: Array.isArray(json.recommendations) ? json.recommendations.map(String) : [],
                timestamp: String(json.timestamp || json.date || '')
              });
            } catch {}
          }
        }
        return NextResponse.json({ crew }, { status: 200 });
      } catch {}
      // Last resort: render with empty crew
      return NextResponse.json({ crew: [] }, { status: 200 });
    }

    // Minimal shape validation/sanitization
    // Expecting: { crew: [{ crew_member, title, summary, key_findings, conclusions, recommendations, timestamp }] }
    const crew = Array.isArray((data as any).crew) ? (data as any).crew : [];
    const safe = crew.map((m: any) => ({
      crew_member: String(m.crew_member || ''),
      title: String(m.title || ''),
      summary: String(m.summary || ''),
      key_findings: Array.isArray(m.key_findings) ? m.key_findings.map(String) : [],
      conclusions: Array.isArray(m.conclusions) ? m.conclusions.map(String) : [],
      recommendations: Array.isArray(m.recommendations) ? m.recommendations.map(String) : [],
      timestamp: String(m.timestamp || '')
    }));

    return NextResponse.json({ crew: safe }, { status: 200 });
  } catch (err: any) {
    const message = err?.name === 'AbortError' ? 'Upstream timeout' : (err?.message || 'Unknown error');
    return NextResponse.json({ error: message }, { status: 500 });
  }
}


