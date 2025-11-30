import { NextRequest, NextResponse } from 'next/server';
import { verifySignature } from '../../../../lib/hmac';
import { executeCrewWorkflow, checkControllerHealth } from '../../../../lib/mcp-n8n-controller-service';

// Use CommonJS helper to interop with lib/n8n-client.js
// eslint-disable-next-line @typescript-eslint/no-var-requires
const { triggerWebhookWithHeaders, testN8nConnection } = require('../../../../lib/n8n-client');

type EngagePayload = {
  message: string;
  platform?: string; // e.g., 'cursor'
  sessionId?: string;
  editor?: {
    filePath?: string;
    selection?: { start: number; end: number };
    languageId?: string;
  };
  metadata?: Record<string, unknown>;
};

export async function POST(req: NextRequest) {
  // Optional security headers (same as /api/events)
  const crewKey = process.env.CREW_KEY || '';
  const secret = process.env.CREW_HMAC_SECRET || '';
  const tsHeader = req.headers.get('x-timestamp');
  const sigHeader = req.headers.get('x-signature');
  const xKey = req.headers.get('x-crew-key') || '';

  const bodyText = await req.text();
  let payload: EngagePayload;
  try {
    payload = JSON.parse(bodyText || '{}');
  } catch {
    return NextResponse.json({ error: 'invalid json' }, { status: 400 });
  }

  // If keys are configured, enforce HMAC + key
  if (crewKey && secret) {
    const ts = Number(tsHeader || '0');
    const sig = String(sigHeader || '');
    if (xKey !== crewKey || !verifySignature({ body: bodyText, signature: sig, secret, timestamp: ts })) {
      return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
    }
  }

  // Quick health check (non-fatal) - Check both n8n and controller
  const n8nHealth = await testN8nConnection();
  const controllerHealth = await checkControllerHealth().catch(() => ({ mcp: false, n8n: false }));

  try {
    // Use MCP-N8N Controller for intelligent routing (MCP first, n8n fallback)
    const result = await executeCrewWorkflow({
      workflow: 'constructor-event',
      tool: 'crew_engagement',
      parameters: {
        type: 'cursor-engage',
        message: payload.message,
        platform: payload.platform || 'cursor',
        sessionId: payload.sessionId || '',
        editor: payload.editor || {},
        metadata: payload.metadata || {},
        timestamp: new Date().toISOString(),
      },
      context: {
        source: 'dashboard-api',
        headers: crewKey && secret ? {
          'X-Crew-Key': crewKey,
          'X-Timestamp': String(Date.now()),
          'X-Signature': (() => {
            // eslint-disable-next-line @typescript-eslint/no-var-requires
            const { signBody } = require('../../../../lib/hmac');
            return signBody(JSON.stringify(payload) + String(Date.now()), secret);
          })()
        } : {}
      }
    });

    if (!result.success) {
      // Fallback to direct n8n if controller fails
      const headers: Record<string, string> = {};
      if (crewKey && secret) {
        const ts = Date.now();
        // eslint-disable-next-line @typescript-eslint/no-var-requires
        const { signBody } = require('../../../../lib/hmac');
        headers['X-Crew-Key'] = crewKey;
        headers['X-Timestamp'] = String(ts);
        headers['X-Signature'] = signBody(JSON.stringify(payload) + String(ts), secret);
      }

      const fallbackResult = await triggerWebhookWithHeaders('constructor-event', {
        type: 'cursor-engage',
        message: payload.message,
        platform: payload.platform || 'cursor',
        sessionId: payload.sessionId || '',
        editor: payload.editor || {},
        metadata: payload.metadata || {},
        timestamp: new Date().toISOString(),
      }, headers);

      return NextResponse.json({ 
        ok: true, 
        method: 'n8n-fallback',
        controller: controllerHealth,
        n8n: n8nHealth, 
        result: fallbackResult 
      });
    }

    return NextResponse.json({ 
      ok: true, 
      method: result.method,
      controller: controllerHealth,
      n8n: n8nHealth, 
      result: result.data 
    });
  } catch (err: any) {
    return NextResponse.json({ 
      ok: false, 
      controller: controllerHealth,
      n8n: n8nHealth, 
      error: err?.message || 'execution failed' 
    }, { status: 502 });
  }
}


