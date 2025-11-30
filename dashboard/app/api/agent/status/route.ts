import { NextResponse } from 'next/server';

// eslint-disable-next-line @typescript-eslint/no-var-requires
const { testN8nConnection, listWorkflows } = require('../../../../lib/n8n-client');

export async function GET() {
  const health = await testN8nConnection();
  try {
    const workflows = await listWorkflows().catch(() => []);
    return NextResponse.json({ ok: true, n8n: health, workflows: Array.isArray(workflows) ? workflows.slice(0, 10) : [] });
  } catch (err: any) {
    return NextResponse.json({ ok: false, n8n: health, error: err?.message || 'status failed' }, { status: 500 });
  }
}


