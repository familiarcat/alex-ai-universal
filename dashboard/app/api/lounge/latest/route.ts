import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

/**
 * Lounge Latest API
 * - Strictly proxies to n8n (no direct Supabase access from UI)
 * - Reads webhook from env (N8N_LOUNGE_LATEST_WEBHOOK or N8N_URL + /webhook/lounge-latest)
 */

function buildWebhookUrl(): string {
  const explicit = process.env.NEXT_PUBLIC_N8N_LOUNGE_LATEST_WEBHOOK || process.env.N8N_LOUNGE_LATEST_WEBHOOK;
  const base = process.env.NEXT_PUBLIC_N8N_URL || process.env.N8N_URL || 'https://n8n.pbradygeorgen.com';

  if (explicit) {
    if (/^https?:\/\//i.test(explicit)) return explicit;
    if (explicit.startsWith('/')) {
      return `${base.replace(/\/$/, '')}${explicit}`;
    }
  }

  return `${base.replace(/\/$/, '')}/webhook/lounge-latest`;
}

export async function GET() {
  try {
    const primary = buildWebhookUrl();
    const base = process.env.NEXT_PUBLIC_N8N_URL || process.env.N8N_URL || 'https://n8n.pbradygeorgen.com';
    const baseNorm = base.replace(/\/$/, '');
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

    const sharedHeaders: Record<string, string> = {};
    const signingSecret = process.env.N8N_WEBHOOK_SECRET || process.env.N8N_CONTROLLER_TOKEN;
    if (signingSecret) {
      // simple shared-secret header; workflow should validate
      sharedHeaders['x-controller-token'] = signingSecret;
    }

    for (const url of candidates) {
      try {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 8000);
        const res = await fetch(url, { method: 'GET', signal: controller.signal, headers: { 'Accept': 'application/json', ...sharedHeaders } });
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

        const aliasToSlug: Record<string, string> = {
          // Geordi variants
          'geordi': 'la-forge',
          'geordi la forge': 'la-forge',
          'lt. cmdr. geordi': 'la-forge',
          'lieutenant commander geordi la forge': 'la-forge',
          'la forge': 'la-forge',
          // Common others (defensive)
          'picard': 'picard',
          'captain jean-luc picard': 'picard',
          'data': 'data',
          'commander data': 'data',
          'worf': 'worf',
          'deanna troi': 'troi',
          't roi': 'troi',
          'crusher': 'crusher',
          'beverly crusher': 'crusher',
          'riker': 'riker',
          'william riker': 'riker',
          'uhura': 'uhura'
        };

        const toSlug = (name: string): string => {
          const raw = String(name || '').trim().toLowerCase();
          if (!raw) return '';
          const mapped = aliasToSlug[raw] || raw;
          return mapped
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/^-+|-+$/g, '');
        };
        for (const dir of candidates) {
          if (!fs.existsSync(dir)) continue;
          const files = fs.readdirSync(dir).filter(f => f.endsWith('.json'));
          for (const file of files) {
            const filePath = path.join(dir, file);
            try {
              const json = JSON.parse(fs.readFileSync(filePath, 'utf8'));
              const member = json.crew_member || json.member || json.name || path.basename(file, '.json');
              const slug = toSlug(member);
              if (seen.has(slug)) continue;
              seen.add(slug);
              crew.push({
                crew_member: String(member || ''),
                agent_id: slug,
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


