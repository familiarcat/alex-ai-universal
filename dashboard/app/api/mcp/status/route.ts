import { NextRequest, NextResponse } from 'next/server';
import { withSecurity, isAdmin, sanitizeError } from '@/lib/security/api-security';
import { checkMCPHealth, getCredentialStatus } from '@/lib/mcp';

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

// MCP configuration (now loaded via universal credential loader)
// Legacy fallback for backward compatibility
const MCP_BASE_URL = process.env.NEXT_PUBLIC_MCP_URL || 'https://mcp.pbradygeorgen.com';
const MCP_API_KEY = process.env.MCP_API_KEY || process.env.N8N_API_KEY;

async function getStatusHandler(request: NextRequest) {
  // TEAM ALPHA FIX: Prioritize Accept: application/json to prevent redirect loops
  // Crew: Data (Architecture) + Worf (Security) + O'Brien (Implementation)
  // 
  // Strategy: Check for explicit JSON request FIRST, before browser detection
  // This ensures fetch() requests with Accept: application/json always get JSON responses
  const acceptHeader = request.headers.get('accept') || '';
  const userAgent = request.headers.get('user-agent') || '';
  
  // PRIORITY 1: If explicitly requesting JSON, always return JSON (no redirect)
  // This handles fetch() requests, API clients, and programmatic access
  const explicitlyRequestsJson = acceptHeader.includes('application/json');
  
  if (explicitlyRequestsJson) {
    // Explicit JSON request - skip browser detection, proceed to JSON response
    // This prevents redirect loops when frontend fetch() includes Accept: application/json
  } else {
    // PRIORITY 2: Browser navigation detection (only if NOT requesting JSON)
    // Browsers navigating directly send "text/html" in Accept header
    // Only redirect if:
    // 1. Accept header includes text/html AND
    // 2. It's not a known API client
    const isBrowserNavigation = 
      acceptHeader.includes('text/html') &&
      userAgent && 
      !userAgent.includes('curl') && 
      !userAgent.includes('Postman') && 
      !userAgent.includes('insomnia') &&
      !userAgent.includes('httpie') &&
      !userAgent.includes('wget');
    
    // If browser navigation request, redirect to UI page immediately (no status checking needed)
    if (isBrowserNavigation) {
      const baseUrl = request.nextUrl.origin;
      return NextResponse.redirect(new URL('/mcp/status', baseUrl), 302);
    }
  }
  
  // Continue with JSON response for API requests (programmatic access)
  try {
    // Use universal MCP health check (efficient, secure, cached)
    const health = await checkMCPHealth();
    
    const localMcpOperational = health.supabase.operational;
    const remoteMcpOperational = health.remoteMCP?.operational || false;
    const n8nOperational = health.n8n.operational;
    const openRouterOperational = health.openRouter.operational;

  // SECURITY: Check if request is from admin
  const isAdminRequest = isAdmin(request);
  
  // Get credential status (for diagnostics, never exposes values)
  const credentialStatus = getCredentialStatus();
  
  // Build public response with service statuses (safe to expose - just operational/offline)
  const publicResponse = {
    success: true,
    status: remoteMcpOperational || localMcpOperational ? 'operational' : 'offline',
    services: {
      remoteMCP: remoteMcpOperational,
      localMCP: localMcpOperational,
      n8n: n8nOperational,
      openRouter: openRouterOperational
    },
    timestamp: new Date().toISOString()
  };
  
  // If not admin, return public response with service statuses (no diagnostics)
  if (!isAdminRequest) {
    return NextResponse.json(publicResponse);
  }
  
  // Admin-only: Full diagnostics (sanitized)
  const diagnostics = {
    credentialsLoaded: credentialStatus.loaded,
    supabaseConfigured: credentialStatus.hasSupabase,
    supabaseConnected: localMcpOperational,
    supabaseError: !credentialStatus.hasSupabase
      ? 'Configuration missing'
      : !localMcpOperational
        ? health.supabase.error || 'Connection failed'
        : undefined,
    remoteMcpConfigured: credentialStatus.hasRemoteMCP,
    remoteMcpReachable: remoteMcpOperational,
    remoteMcpError: !credentialStatus.hasRemoteMCP
      ? 'Configuration missing'
      : !remoteMcpOperational
        ? health.remoteMCP?.error || 'Service unreachable'
        : undefined,
    n8nConfigured: credentialStatus.hasN8n,
    n8nReachable: n8nOperational,
    n8nError: !credentialStatus.hasN8n
      ? 'Configuration missing'
      : !n8nOperational
        ? health.n8n.error || 'Service unreachable'
        : undefined,
    openRouterConfigured: credentialStatus.hasOpenRouter,
    openRouterReachable: openRouterOperational,
    openRouterError: !credentialStatus.hasOpenRouter
      ? 'Configuration missing'
      : !openRouterOperational
        ? health.openRouter.error || 'Service unreachable'
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

