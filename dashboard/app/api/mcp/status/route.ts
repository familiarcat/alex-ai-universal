import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { withSecurity, isAdmin, sanitizeError } from '@/lib/security/api-security';

/**
 * MCP System Status API
 * 
 * SECURITY: This endpoint exposes system information
 * - Public endpoint: Minimal status only (operational/offline)
 * - Admin endpoint: Full diagnostics (requires authentication)
 * 
 * UX ENHANCEMENT: Detects browser requests and redirects to UI page
 * - Browser requests (Accept: text/html) → Redirect to /mcp/status UI
 * - API requests (Accept: application/json) → Return JSON
 * 
 * DDD Architecture:
 * - Data Layer: Supabase (local MCP), Remote MCP Server, OpenRouter API
 * - Controller Layer: This API route (status aggregation)
 * - Client Layer: Dashboard UI (consumes this API)
 * 
 * Crew: Counselor Troi (UX) + Commander Data (Architecture) + Lieutenant Worf (Security)
 */

const MCP_BASE_URL = process.env.NEXT_PUBLIC_MCP_URL || 'https://mcp.pbradygeorgen.com';
const MCP_API_KEY = process.env.MCP_API_KEY || process.env.N8N_API_KEY;

async function getStatusHandler(request: NextRequest) {
  // UX ENHANCEMENT: Detect browser requests and redirect to UI page
  // Crew: Troi (UX) + Data (Architecture) + O'Brien (Pragmatic)
  // This must happen FIRST before any status checking to avoid unnecessary work
  const acceptHeader = request.headers.get('accept') || '';
  const userAgent = request.headers.get('user-agent') || '';
  
  // Check if this is a browser request (not an API client)
  // Browsers send "text/html" in Accept header, API clients send "application/json" or nothing
  const isBrowserRequest = 
    acceptHeader.includes('text/html') || 
    (acceptHeader.includes('*/*') && userAgent && 
     !userAgent.includes('curl') && 
     !userAgent.includes('Postman') && 
     !userAgent.includes('insomnia') &&
     !userAgent.includes('httpie') &&
     !userAgent.includes('wget'));
  
  // If browser request, redirect to UI page immediately (no status checking needed)
  if (isBrowserRequest) {
    const baseUrl = request.nextUrl.origin;
    return NextResponse.redirect(new URL('/mcp/status', baseUrl), 302);
  }
  
  // Continue with JSON response for API requests (programmatic access)
  try {
    // Check remote MCP health
    let remoteMcpOperational = false;
    let localMcpOperational = false;
    let n8nOperational = false;
    
    // Check live Supabase first (hosted on pbradygeorgen.com - this is our primary system)
    // DDD: Data Layer - Live Supabase is the source of truth
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

  // SECURITY: Check if request is from admin
  const isAdminRequest = isAdmin(request);
  
  // Build minimal public response (no sensitive information)
  const publicResponse = {
    success: true,
    status: remoteMcpOperational || localMcpOperational ? 'operational' : 'offline',
    timestamp: new Date().toISOString()
  };
  
  // If not admin, return minimal response only
  if (!isAdminRequest) {
    return NextResponse.json(publicResponse);
  }
  
  // Admin-only: Full diagnostics (sanitized)
  const diagnostics = {
    supabaseConfigured: !!(supabaseUrl && supabaseKey),
    supabaseConnected: localMcpOperational,
    supabaseError: !supabaseUrl || !supabaseKey 
      ? 'Configuration missing'
      : !localMcpOperational
        ? 'Connection failed'
        : undefined,
    remoteMcpConfigured: !!(MCP_BASE_URL && MCP_API_KEY),
    remoteMcpReachable: remoteMcpOperational,
    remoteMcpError: !MCP_BASE_URL || !MCP_API_KEY
      ? 'Configuration missing'
      : !remoteMcpOperational
        ? 'Service unreachable'
        : undefined,
    n8nConfigured: !!n8nUrl,
    n8nReachable: n8nOperational,
    n8nError: !n8nUrl
      ? 'Configuration missing'
      : !n8nOperational
        ? 'Service unreachable'
        : undefined,
    openRouterConfigured: !!openRouterApiKey,
    openRouterReachable: openRouterOperational,
    openRouterError: !openRouterApiKey
      ? 'Configuration missing'
      : !openRouterOperational
        ? 'Service unreachable'
        : undefined
  };

  // Admin response with sanitized information (no endpoint URLs, generic errors)
  return NextResponse.json({
    success: true,
    status: remoteMcpOperational || localMcpOperational ? 'operational' : 'offline',
    services: {
      remoteMCP: remoteMcpOperational,
      localMCP: localMcpOperational,
      n8n: n8nOperational,
      openRouter: openRouterOperational
    },
    // SECURITY: Don't expose endpoint URLs in response
    diagnostics,
    timestamp: new Date().toISOString()
  });
  } catch (error: any) {
    console.error('Error getting MCP status:', error);
    const isAdminRequest = isAdmin(request);
    return NextResponse.json({
      success: false,
      status: 'error',
      error: sanitizeError(error, isAdminRequest),
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}

// SECURITY: Apply rate limiting and authentication
export const GET = withSecurity(getStatusHandler, {
  rateLimit: {
    maxRequests: 10, // 10 requests per minute
    windowMs: 60000  // 1 minute window
  },
  requireAuth: false, // Public endpoint (minimal info)
  sanitizeErrors: true
});

