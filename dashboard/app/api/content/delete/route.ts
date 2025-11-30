/**
 * Content Delete API - DDD-Compliant
 * 
 * Client → Next.js API (Controller) → MCP → n8n → Supabase
 */

import { NextRequest, NextResponse } from 'next/server';

const MCP_BASE_URL = process.env.MCP_URL || process.env.NEXT_PUBLIC_MCP_URL || 'https://mcp.pbradygeorgen.com';
const MCP_API_KEY = process.env.MCP_API_KEY;
const N8N_URL = process.env.N8N_URL || process.env.NEXT_PUBLIC_N8N_URL || 'https://n8n.pbradygeorgen.com';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { projectId } = body;

    if (!projectId) {
      return NextResponse.json(
        { success: false, error: 'projectId is required' },
        { status: 400 }
      );
    }

    // PRIMARY: Try MCP server
    if (MCP_API_KEY) {
      try {
        const mcpResponse = await fetch(`${MCP_BASE_URL}/api/content/delete`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${MCP_API_KEY}`,
            'X-Source': 'alex-ai-dashboard-api'
          },
          body: JSON.stringify(body),
          signal: AbortSignal.timeout(5000)
        });

        if (mcpResponse.ok) {
          return NextResponse.json({ success: true });
        }
      } catch (mcpError) {
        // Continue to fallback
      }
    }

    // FALLBACK: Try n8n
    try {
      const n8nResponse = await fetch(`${N8N_URL}/webhook/project-content-delete`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Source': 'alex-ai-dashboard-api'
        },
        body: JSON.stringify(body),
        signal: AbortSignal.timeout(5000)
      });

      if (n8nResponse.ok) {
        return NextResponse.json({ success: true });
      }
    } catch (n8nError) {
      // All layers failed
    }

    return NextResponse.json(
      { success: false, error: 'Failed to delete content' },
      { status: 500 }
    );
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

