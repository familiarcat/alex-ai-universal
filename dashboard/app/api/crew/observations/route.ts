import { NextResponse } from 'next/server';
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


