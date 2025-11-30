import { NextResponse } from 'next/server';

function adviceWebhook(): string {
  const explicit = process.env.N8N_CREW_ADVICE_WEBHOOK || process.env.NEXT_PUBLIC_N8N_CREW_ADVICE_WEBHOOK;
  const base = process.env.N8N_URL || process.env.NEXT_PUBLIC_N8N_URL || 'https://n8n.pbradygeorgen.com';
  if (explicit) {
    if (/^https?:\/\//i.test(explicit)) return explicit;
    if (explicit.startsWith('/')) return `${base.replace(/\/$/, '')}${explicit}`;
  }
  return `${base.replace(/\/$/, '')}/webhook/crew-advice`;
}

export async function POST(req: Request) {
  try {
    const url = adviceWebhook();
    const input = await req.json().catch(() => ({ question: '' }));
    const res = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ question: String(input.question || '') }) });
    if (!res.ok) {
      return NextResponse.json({ answers: [], error: `n8n ${res.status}` }, { status: 200 });
    }
    const data = await res.json().catch(() => ({ answers: [] }));
    const answers = Array.isArray((data || {}).answers) ? (data || {}).answers : [];
    return NextResponse.json({ answers }, { status: 200 });
  } catch (e: any) {
    return NextResponse.json({ answers: [], error: e?.message || 'failed' }, { status: 200 });
  }
}


