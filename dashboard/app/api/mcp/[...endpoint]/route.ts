/**
 * 🖖 MCP Proxy API Route
 * 
 * Proxies requests to MCP server (mcp.pbradygeorgen.com)
 * Keeps API key server-side for security
 * 
 * DDD Architecture: Client → Next.js API → MCP Server → Supabase
 * 
 * Reviewed by: Lieutenant Worf (Security) & Commander Data (Implementation)
 */

import { NextRequest, NextResponse } from 'next/server';

const MCP_BASE_URL = process.env.NEXT_PUBLIC_MCP_URL || 'https://mcp.pbradygeorgen.com';
const MCP_API_KEY = process.env.MCP_API_KEY || process.env.N8N_API_KEY; // Reuse n8n key

export async function POST(
  request: NextRequest,
  { params }: { params: { endpoint: string[] } }
) {
  try {
    const endpoint = params.endpoint.join('/');
    const body = await request.json();

    if (!MCP_API_KEY) {
      console.error('⚠️  MCP_API_KEY not configured');
      return NextResponse.json(
        { 
          success: false, 
          error: 'MCP server not configured',
          fallback: true 
        },
        { status: 500 }
      );
    }

    // Proxy request to MCP server
    const mcpUrl = `${MCP_BASE_URL}/${endpoint}`;
    const requestId = body.requestId || `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const response = await fetch(mcpUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-MCP-API-KEY': MCP_API_KEY,
        'X-Request-ID': requestId,
      },
      body: JSON.stringify({
        ...body,
        requestId,
      }),
      signal: AbortSignal.timeout(30000), // Increased from 10s to 30s per crew optimization
    });

    if (!response.ok) {
      // If MCP fails, return error (fallback handled by UnifiedDataService)
      const errorText = await response.text();
      console.warn(`⚠️  MCP endpoint ${endpoint} failed: ${response.status} ${errorText}`);
      
      return NextResponse.json(
        { 
          success: false, 
          error: `MCP server error: ${response.status}`,
          mcpFailed: true 
        },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error: any) {
    console.error(`❌ MCP proxy error for ${params.endpoint.join('/')}:`, error);
    
    return NextResponse.json(
      { 
        success: false, 
        error: error.message || 'MCP proxy error',
        mcpFailed: true 
      },
      { status: 500 }
    );
  }
}

