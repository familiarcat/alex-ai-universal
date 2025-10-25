import { NextRequest, NextResponse } from 'next/server';
import { revalidateTag } from 'next/cache';

export async function POST(req: NextRequest) {
  const adminKey = process.env.REVALIDATE_KEY || '';
  if (!adminKey) return NextResponse.json({ error: 'not configured' }, { status: 500 });
  const auth = req.headers.get('authorization') || '';
  if (auth !== `Bearer ${adminKey}`) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });

  const { tags } = await req.json().catch(() => ({ tags: [] as string[] }));
  if (!Array.isArray(tags) || tags.length === 0) return NextResponse.json({ error: 'no tags' }, { status: 400 });

  for (const t of tags) revalidateTag(String(t));
  return NextResponse.json({ ok: true, revalidated: tags.length });
}


