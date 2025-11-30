/**
 * Settings Retrieve API - DDD-Compliant Settings Retrieval
 * 
 * PROPER DDD ARCHITECTURE:
 * Client → Next.js API (Controller) → MCP (Primary) → n8n (Fallback) → Supabase (Data)
 * 
 * Client Layer: Only knows about /api/settings/retrieve (black box)
 * Controller Layer: Handles MCP → n8n → Supabase fallback chain
 * Data Layer: Supabase (single source of truth)
 * 
 * Crew: Data (Architecture) + La Forge (Implementation) + O'Brien (Pragmatic)
 * Updated: 2025-11-27 - Fixed DDD violation: Client no longer aware of n8n/MCP
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Controller layer configuration (NOT exposed to client)
const MCP_BASE_URL = process.env.MCP_URL || process.env.NEXT_PUBLIC_MCP_URL || 'https://mcp.pbradygeorgen.com';
const MCP_API_KEY = process.env.MCP_API_KEY;
const N8N_URL = process.env.N8N_URL || process.env.NEXT_PUBLIC_N8N_URL || 'https://n8n.pbradygeorgen.com';
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL) {
  throw new Error('Supabase URL not configured');
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const userId = searchParams.get('userId') || 'default';

    // PROPER DDD: Controller layer handles fallback chain
    // Client is unaware of MCP, n8n, or Supabase - this is a black box
    
    // PRIMARY: Try MCP server (mcp.pbradygeorgen.com)
    if (MCP_API_KEY) {
      try {
        const mcpResponse = await fetch(`${MCP_BASE_URL}/api/settings/retrieve?userId=${userId}`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${MCP_API_KEY}`,
            'X-Source': 'alex-ai-dashboard-api',
            'Cache-Control': 'no-cache'
          },
          signal: AbortSignal.timeout(5000),
          cache: 'no-store'
        });

        if (mcpResponse.ok) {
          const mcpData = await mcpResponse.json();
          if (mcpData.success && mcpData.globalTheme) {
            // MCP returned valid settings
            return NextResponse.json({
              success: true,
              globalTheme: mcpData.globalTheme,
              preferences: mcpData.preferences || {}
              // Client doesn't need to know source
            });
          }
        }
      } catch (mcpError: any) {
        // MCP server unavailable or network error
        console.warn('⚠️  MCP server unavailable, trying n8n fallback:', mcpError.message);
      }
    }

    // FALLBACK 1: Try n8n webhook (controller layer)
    try {
      const response = await fetch(`${N8N_URL}/webhook/settings-retrieve?userId=${userId}`, {
        method: 'GET',
        headers: {
          'X-Source': 'alex-ai-dashboard-api',
          'Cache-Control': 'no-cache'
        },
        signal: AbortSignal.timeout(5000),
        cache: 'no-store'
      });

      if (response.ok) {
        const data = await response.json();
        if (data.globalTheme) {
          return NextResponse.json({
            success: true,
            globalTheme: data.globalTheme,
            preferences: data.preferences || {}
            // Client doesn't need to know source
          });
        }
      }
    } catch (n8nError: any) {
      // n8n failed, try Supabase direct fallback
      console.warn('⚠️  n8n webhook failed, trying Supabase direct fallback:', n8nError.message);
    }

    // FALLBACK 2: Try Supabase direct (data layer - last resort)
    if (SUPABASE_SERVICE_KEY) {
      try {
        const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);
        
        const { data, error } = await supabase
          .from('user_settings')
          .select('global_theme, preferences')
          .eq('user_id', userId)
          .single();

        if (!error && data) {
          return NextResponse.json({
            success: true,
            globalTheme: data.global_theme || null, // Return null if not set (not 'midnight' default)
            preferences: data.preferences || {}
            // Client doesn't need to know source
          });
        }
      } catch (supabaseError: any) {
        // Supabase failed - all layers exhausted
        console.warn('⚠️  Supabase direct fallback failed:', supabaseError.message);
      }
    }

    // No settings found in any layer - return null to indicate no saved settings
    // This allows client to use localStorage theme instead of forcing 'midnight'
    return NextResponse.json({
      success: true,
      globalTheme: null, // Explicitly null to indicate no saved theme
      preferences: {}
      // Client doesn't need to know which layers were tried
    });
  } catch (error: any) {
    console.error('Settings retrieve error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to retrieve settings' },
      { status: 500 }
    );
  }
}

