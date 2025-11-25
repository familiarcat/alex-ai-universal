import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

/**
 * MCP System Status API
 * 
 * DDD Architecture:
 * - Data Layer: Supabase (local MCP), Remote MCP Server, OpenRouter API
 * - Controller Layer: This API route (status aggregation)
 * - Client Layer: Dashboard UI (consumes this API)
 * 
 * Returns overall system health and status from source of truth
 */

const MCP_BASE_URL = process.env.NEXT_PUBLIC_MCP_URL || 'https://mcp.pbradygeorgen.com';
const MCP_API_KEY = process.env.MCP_API_KEY || process.env.N8N_API_KEY;

export async function GET() {
  try {
    // Check remote MCP health
    let remoteMcpOperational = false;
    let localMcpOperational = false;
    let n8nOperational = false;
    
    // Check local MCP first (via Supabase direct connection - this is our primary system)
    // DDD: Data Layer - Supabase is the source of truth for local MCP
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;
    
    if (supabaseUrl && supabaseKey) {
      try {
        // Use Supabase client library for more reliable connection check
        const supabase = createClient(supabaseUrl, supabaseKey);
        // Test connection by querying knowledge_base table (MCP's primary table)
        const { data, error } = await supabase
          .from('knowledge_base')
          .select('id')
          .limit(1);
        
        // If we can query (even if empty), Supabase is operational
        localMcpOperational = !error;
        
        if (error) {
          console.warn('Local MCP (Supabase) query error:', error.message);
        }
      } catch (error: any) {
        // Local MCP (Supabase) not available or not configured
        localMcpOperational = false;
        console.warn('Local MCP (Supabase) connection failed:', error.message);
      }
    } else {
      localMcpOperational = false;
      console.warn('Supabase credentials not configured (NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY missing)');
    }
    
    // Check remote MCP server (optional - for future remote MCP server)
    if (MCP_BASE_URL && !localMcpOperational) {
      try {
        const healthUrl = `${MCP_BASE_URL}/health`;
        const response = await fetch(healthUrl, {
          method: 'GET',
          headers: MCP_API_KEY ? {
            'X-MCP-API-KEY': MCP_API_KEY,
          } : {},
          signal: AbortSignal.timeout(3000), // 3 second timeout
        });
        remoteMcpOperational = response.ok;
      } catch (error: any) {
        // If health endpoint doesn't exist, try a simple endpoint
        try {
          const testUrl = `${MCP_BASE_URL}/api/status`;
          const response = await fetch(testUrl, {
            method: 'GET',
            headers: MCP_API_KEY ? {
              'X-MCP-API-KEY': MCP_API_KEY,
            } : {},
            signal: AbortSignal.timeout(3000),
          });
          remoteMcpOperational = response.ok;
        } catch (testError: any) {
          remoteMcpOperational = false;
          // Remote MCP server not available - this is OK, we use local MCP
          // Silently handle timeout errors (expected behavior)
        }
      }
    }
    
    // Check n8n health
    const n8nUrl = process.env.N8N_URL || process.env.NEXT_PUBLIC_N8N_URL || 'https://n8n.pbradygeorgen.com';
    if (n8nUrl) {
      try {
        const response = await fetch(`${n8nUrl}/healthz`, {
          method: 'GET',
          signal: AbortSignal.timeout(5000),
        });
        n8nOperational = response.ok;
      } catch (error: any) {
        n8nOperational = false;
        // Silently handle timeout errors (expected behavior for health checks)
      }
    }

    // Check OpenRouter health (DDD: Source of Truth)
    let openRouterOperational = false;
    const openRouterApiKey = process.env.OPENROUTER_API_KEY;
    if (openRouterApiKey) {
      try {
        const response = await fetch('https://openrouter.ai/api/v1/models', {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${openRouterApiKey}`,
            'Content-Type': 'application/json',
          },
          signal: AbortSignal.timeout(5000),
        });
        openRouterOperational = response.ok;
      } catch (error: any) {
        openRouterOperational = false;
        // Silently handle timeout errors (expected behavior for health checks)
        const isTimeout = error.name === 'TimeoutError' || error.name === 'AbortError' || 
                         error.message?.includes('timeout');
        if (!isTimeout) {
          console.warn('OpenRouter health check failed:', error.message);
        }
      }
    } else {
      console.warn('OpenRouter API key not configured');
    }

    // Build diagnostics information
    const diagnostics = {
      supabaseConfigured: !!(supabaseUrl && supabaseKey),
      supabaseConnected: localMcpOperational,
      supabaseError: !supabaseUrl || !supabaseKey 
        ? 'Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY'
        : !localMcpOperational
          ? 'Supabase connection failed - check credentials and network'
          : undefined,
      remoteMcpConfigured: !!(MCP_BASE_URL && MCP_API_KEY),
      remoteMcpReachable: remoteMcpOperational,
      remoteMcpError: !MCP_BASE_URL || !MCP_API_KEY
        ? 'Missing NEXT_PUBLIC_MCP_URL or MCP_API_KEY'
        : !remoteMcpOperational
          ? 'Remote MCP server unreachable - check URL and API key'
          : undefined,
      n8nConfigured: !!n8nUrl,
      n8nReachable: n8nOperational,
      n8nError: !n8nUrl
        ? 'Missing NEXT_PUBLIC_N8N_URL'
        : !n8nOperational
          ? 'n8n server unreachable - check URL and network'
          : undefined,
      openRouterConfigured: !!openRouterApiKey,
      openRouterReachable: openRouterOperational,
      openRouterError: !openRouterApiKey
        ? 'Missing OPENROUTER_API_KEY'
        : !openRouterOperational
          ? 'OpenRouter API unreachable - check API key and network'
          : undefined
    };

    return NextResponse.json({
      success: true,
      status: remoteMcpOperational || localMcpOperational ? 'operational' : 'offline',
      services: {
        remoteMCP: remoteMcpOperational,
        localMCP: localMcpOperational,
        n8n: n8nOperational,
        openRouter: openRouterOperational
      },
      endpoints: {
        mcp: MCP_BASE_URL,
        n8n: n8nUrl,
        openRouter: 'https://openrouter.ai'
      },
      diagnostics,
      timestamp: new Date().toISOString()
    });
  } catch (error: any) {
    console.error('Error getting MCP status:', error);
    return NextResponse.json({
      success: false,
      status: 'error',
      error: error.message || 'Failed to get system status',
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}

