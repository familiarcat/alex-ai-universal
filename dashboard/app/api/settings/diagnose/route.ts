/**
 * Settings API Diagnostic Endpoint
 * 
 * Helps diagnose configuration issues with settings storage
 * 
 * Crew: Data (Diagnostics) + La Forge (Infrastructure)
 */

import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const MCP_BASE_URL = process.env.MCP_URL || process.env.NEXT_PUBLIC_MCP_URL || 'https://mcp.pbradygeorgen.com';
  const MCP_API_KEY = process.env.MCP_API_KEY;
  const N8N_URL = process.env.N8N_URL || process.env.NEXT_PUBLIC_N8N_URL || 'https://n8n.pbradygeorgen.com';
  const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
  const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;

  const diagnostics = {
    timestamp: new Date().toISOString(),
    configuration: {
      mcp: {
        url: MCP_BASE_URL,
        hasApiKey: !!MCP_API_KEY,
        apiKeyLength: MCP_API_KEY ? MCP_API_KEY.length : 0,
        status: MCP_API_KEY ? 'configured' : 'missing'
      },
      n8n: {
        url: N8N_URL,
        status: 'configured'
      },
      supabase: {
        url: SUPABASE_URL || 'not configured',
        hasServiceKey: !!SUPABASE_SERVICE_KEY,
        serviceKeyLength: SUPABASE_SERVICE_KEY ? SUPABASE_SERVICE_KEY.length : 0,
        status: SUPABASE_SERVICE_KEY ? 'configured' : 'missing'
      }
    },
    recommendations: [] as string[]
  };

  // Add recommendations
  if (!MCP_API_KEY) {
    diagnostics.recommendations.push('MCP_API_KEY not configured - MCP layer will be skipped');
  }
  if (!SUPABASE_SERVICE_KEY) {
    diagnostics.recommendations.push('SUPABASE_SERVICE_KEY not configured - Supabase direct fallback will fail');
    diagnostics.recommendations.push('Settings will only work if n8n webhook is accessible');
  }
  if (!SUPABASE_URL) {
    diagnostics.recommendations.push('SUPABASE_URL not configured - Supabase operations will fail');
  }

  // Test connectivity (non-blocking)
  const connectivityTests = {
    mcp: 'not tested',
    n8n: 'not tested',
    supabase: 'not tested'
  };

  // Test n8n (quick test)
  try {
    const n8nTest = await fetch(`${N8N_URL}/healthz`, {
      method: 'GET',
      signal: AbortSignal.timeout(2000)
    });
    connectivityTests.n8n = n8nTest.ok ? 'accessible' : `error: ${n8nTest.status}`;
  } catch (error: any) {
    connectivityTests.n8n = `unreachable: ${error.message}`;
  }

  return NextResponse.json({
    ...diagnostics,
    connectivity: connectivityTests
  });
}

