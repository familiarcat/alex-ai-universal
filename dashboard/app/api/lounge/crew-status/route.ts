import { NextResponse } from 'next/server';

function buildWebhookUrl(): string {
  const explicit = process.env.NEXT_PUBLIC_N8N_CREW_STATUS_WEBHOOK || process.env.N8N_CREW_STATUS_WEBHOOK;
  const base = process.env.NEXT_PUBLIC_N8N_URL || process.env.N8N_URL || 'https://n8n.pbradygeorgen.com';
  if (explicit) {
    if (/^https?:\/\//i.test(explicit)) return explicit;
    if (explicit.startsWith('/')) return `${base.replace(/\/$/, '')}${explicit}`;
  }
  return `${base.replace(/\/$/, '')}/webhook/crew-status`;
}

export async function GET() {
  try {
    const url = buildWebhookUrl();

    // Try POST for richer payload; fallback to GET
    let data: any = null;
    try {
      const res = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ mode: 'status' }) });
      if (res.ok) data = await res.json().catch(() => null);
    } catch {}

    if (!data) {
      try {
        const res = await fetch(url, { method: 'GET', headers: { 'Accept': 'application/json' } });
        if (res.ok) data = await res.json().catch(() => null);
      } catch {}
    }

    const crewRaw: any[] = Array.isArray((data || {}).crew) ? (data || {}).crew : [];
    const normalize = (name: string) => name.trim();
    const crew = crewRaw.map(m => ({
      crew_member: normalize(String(m.crew_member || '')),
      status: String(m.status || ''),
      history: String(m.history || ''),
      suggestions: Array.isArray(m.suggestions) ? m.suggestions.map(String) : [],
      timestamp: String(m.timestamp || ''),
    }));

    return NextResponse.json({ crew }, { status: 200 });
  } catch (e: any) {
    return NextResponse.json({ crew: [], error: e?.message || 'failed' }, { status: 200 });
  }
}


