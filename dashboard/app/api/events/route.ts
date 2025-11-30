import { NextRequest, NextResponse } from 'next/server';
import { ConstructorEventSchema } from '../../../../types/constructor';
import { verifySignature } from '../../../lib/hmac';
import { triggerWebhookWithHeaders } from '../../../lib/n8n-client';

export async function POST(req: NextRequest) {
  const crewKey = process.env.CREW_KEY || '';
  const secret = process.env.CREW_HMAC_SECRET || '';
  const tsHeader = req.headers.get('x-timestamp');
  const sigHeader = req.headers.get('x-signature');
  if (!crewKey || !secret) return NextResponse.json({ error: 'not configured' }, { status: 500 });

  const body = await req.text();
  const xKey = req.headers.get('x-crew-key') || '';
  const ts = Number(tsHeader || '0');
  const sig = String(sigHeader || '');

  if (xKey !== crewKey || !verifySignature({ body, signature: sig, secret, timestamp: ts })) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  }

  let parsed;
  try {
    parsed = ConstructorEventSchema.parse(JSON.parse(body));
  } catch (e) {
    return NextResponse.json({ error: 'invalid payload' }, { status: 400 });
  }

  // Forward to n8n constructor-event webhook with the same security headers
  try {
    const res = await triggerWebhookWithHeaders('constructor-event', parsed, {
      'X-Crew-Key': crewKey,
      'X-Signature': sig,
      'X-Timestamp': String(ts),
    });
    return NextResponse.json({ ok: true, result: res });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || 'forward failed' }, { status: 502 });
  }
}


