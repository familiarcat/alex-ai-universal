/**
 * MCP System Status API - Admin Endpoint
 * 
 * SECURITY: Full diagnostics endpoint (admin only)
 * Requires authentication via X-Admin-Key header
 * 
 * DDD Architecture:
 * - Data Layer: Supabase (local MCP), Remote MCP Server, OpenRouter API
 * - Controller Layer: This API route (status aggregation)
 * - Client Layer: Dashboard UI (consumes this API)
 * 
 * Crew: Lieutenant Worf (Security) + Dr. Crusher (System Health)
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { withSecurity, sanitizeError } from '@/lib/security/api-security';

const MCP_BASE_URL = process.env.NEXT_PUBLIC_MCP_URL || 'https://mcp.pbradygeorgen.com';
const MCP_API_KEY = process.env.MCP_API_KEY || process.env.N8N_API_KEY;

async function getAdminStatusHandler(request: NextRequest) {
  try {
    // Check remote MCP health
    let remoteMcpOperational = false;
    let localMcpOperational = false;
    let n8nOperational = false;
    
    // Check live Supabase first (hosted on pbradygeorgen.com - this is our primary system)
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;
    
    if (supabaseUrl && supabaseKey) {
      try {
        const supabase = createClient(supabaseUrl, supabaseKey);
        const { data, error } = await supabase
          .from('knowledge_base')
          .select('id')
          .limit(1);
        
        localMcpOperational = !error;
        
        if (error) {
          console.warn('Local MCP (Supabase) query error:', error.message);
        }
      } catch (error: any) {
        localMcpOperational = false;
        console.warn('Local MCP (Supabase) connection failed:', error.message);
      }
    } else {
      localMcpOperational = false;
      console.warn('Supabase credentials not configured');
    }
    
    // Check remote MCP server
    if (MCP_BASE_URL && !localMcpOperational) {
      try {
        const healthUrl = `${MCP_BASE_URL}/health`;
        const response = await fetch(healthUrl, {
          method: 'GET',
          headers: MCP_API_KEY ? {
            'X-MCP-API-KEY': MCP_API_KEY,
          } : {},
          signal: AbortSignal.timeout(3000),
        });
        remoteMcpOperational = response.ok;
      } catch (error: any) {
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
      }
    }

    // Check OpenRouter health
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
        const isTimeout = error.name === 'TimeoutError' || error.name === 'AbortError' || 
                         error.message?.includes('timeout');
        if (!isTimeout) {
          console.warn('OpenRouter health check failed:', error.message);
        }
      }
    }

    // Admin-only: Full diagnostics with detailed error messages
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
      error: sanitizeError(error, true), // Admin can see full error
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}

// SECURITY: Admin-only endpoint with authentication and rate limiting
export const GET = withSecurity(getAdminStatusHandler, {
  rateLimit: {
    maxRequests: 20, // 20 requests per minute for admins
    windowMs: 60000
  },
  requireAdmin: true, // Admin authentication required
  sanitizeErrors: false // Admins can see full error details
});



