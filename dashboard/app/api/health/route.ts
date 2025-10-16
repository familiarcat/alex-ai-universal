import { NextResponse } from 'next/server';

export async function GET() {
  // Minimal synthetic health; in future, aggregate n8n, DB, and API checks.
  return NextResponse.json({ status: 'green', message: 'Observation nominal. Warp ready.' });
}



