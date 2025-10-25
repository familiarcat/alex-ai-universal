import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET() {
  try {
    // Read consolidated memories from repo root
    const memoriesDir = path.resolve(process.cwd(), '..', 'crew-memories', 'active');
    const files = fs.readdirSync(memoriesDir).filter(f => f.endsWith('.json'));
    const items: Array<{ id: string; title?: string; summary?: string; date?: string; tags?: string[] }>= [];
    for (const f of files) {
      try {
        const raw = fs.readFileSync(path.join(memoriesDir, f), 'utf8');
        const json = JSON.parse(raw);
        items.push({
          id: f,
          title: json.title || json.name || f.replace(/\.json$/, ''),
          summary: json.summary || json.notes || json.findings || json.description,
          date: json.date || json.timestamp || undefined,
          tags: json.tags || json.topics || undefined
        });
      } catch {}
    }
    // Newer first by filename timestamp if present
    items.sort((a,b)=> (b.id.localeCompare(a.id)));
    return NextResponse.json({ items });
  } catch (e) {
    return NextResponse.json({ error: 'Failed to read crew observations' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const authKey = process.env.CREW_OBS_KEY || process.env.CREW_KEY || '';
    const provided = req.headers.get('x-crew-key') || (req.headers.get('authorization') || '').replace(/^Bearer\s+/i, '');
    if (!authKey || provided !== authKey) {
      return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
    }

    const body = await req.json().catch(() => ({}));
    const crew = String(body.crew || '').trim();
    const role = String(body.role || '').trim();
    const summary = String(body.summary || body.title || '').trim();
    const problems = Array.isArray(body.problems) ? body.problems.map((s: any)=> String(s)) : [];
    const suggestions = Array.isArray(body.suggestions) ? body.suggestions.map((s: any)=> String(s)) : [];
    const tags = Array.isArray(body.tags) ? body.tags.map((s: any)=> String(s)) : [];

    if (!crew || !summary) {
      return NextResponse.json({ error: 'crew and summary required' }, { status: 400 });
    }

    const ts = Date.now();
    const iso = new Date(ts).toISOString();
    const slug = summary.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '').slice(0, 60) || 'observation';

    const payload = {
      type: 'observation',
      crew,
      role: role || undefined,
      title: summary,
      summary,
      problems,
      suggestions,
      tags,
      timestamp: iso,
    };

    const memoriesDir = path.resolve(process.cwd(), '..', 'crew-memories', 'active');
    fs.mkdirSync(memoriesDir, { recursive: true });
    const filename = `observation-${ts}-${slug}.json`;
    fs.writeFileSync(path.join(memoriesDir, filename), JSON.stringify(payload, null, 2));

    return NextResponse.json({ ok: true, id: filename });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'failed to write' }, { status: 500 });
  }
}


