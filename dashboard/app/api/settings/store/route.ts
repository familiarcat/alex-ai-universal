/**
 * Settings Store API - DDD-Compliant Settings Persistence
 * 
 * PROPER DDD ARCHITECTURE:
 * Client → Next.js API (Controller) → MCP (Primary) → n8n (Fallback) → Supabase (Data)
 * 
 * Client Layer: Only knows about /api/settings/store (black box)
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

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId = 'default', globalTheme, preferences = {} } = body;

    // SECURITY: Input validation
    if (!globalTheme || typeof globalTheme !== 'string') {
      return NextResponse.json(
        { success: false, error: 'Invalid globalTheme' },
        { status: 400 }
      );
    }

    // PROPER DDD: Controller layer handles fallback chain
    // Client is unaware of MCP, n8n, or Supabase - this is a black box
    
    // PRIMARY: Try MCP server (mcp.pbradygeorgen.com)
    if (MCP_API_KEY) {
      try {
        console.log('🔄 Attempting MCP server for settings store:', { userId, globalTheme, mcpUrl: `${MCP_BASE_URL}/api/settings/store` });
        
        const mcpResponse = await fetch(`${MCP_BASE_URL}/api/settings/store`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${MCP_API_KEY}`,
            'X-Source': 'alex-ai-dashboard-api'
          },
          body: JSON.stringify({
            userId,
            globalTheme,
            preferences
          }),
          signal: AbortSignal.timeout(5000)
        });

        if (mcpResponse.ok) {
          const mcpData = await mcpResponse.json().catch(() => ({}));
          console.log('✅ Settings stored successfully via MCP:', { userId, globalTheme });
          return NextResponse.json({ success: true }); // Client doesn't need to know source
        } else {
          const errorText = await mcpResponse.text().catch(() => 'Unknown error');
          console.warn('⚠️  MCP server returned error, trying n8n fallback:', {
            status: mcpResponse.status,
            statusText: mcpResponse.statusText,
            body: errorText
          });
        }
      } catch (mcpError: any) {
        // MCP server unavailable or network error
        console.warn('⚠️  MCP server unavailable, trying n8n fallback:', {
          message: mcpError.message,
          name: mcpError.name
        });
      }
    } else {
      console.warn('⚠️  MCP_API_KEY not configured, skipping MCP and using n8n fallback');
    }

    // FALLBACK 1: Try n8n webhook (controller layer)
    try {
      console.log('🔄 Attempting n8n fallback for settings store:', { userId, globalTheme, n8nUrl: `${N8N_URL}/webhook/settings-store` });
      
      const response = await fetch(`${N8N_URL}/webhook/settings-store`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Source': 'alex-ai-dashboard-api'
        },
        body: JSON.stringify({
          userId,
          globalTheme,
          preferences
        }),
        signal: AbortSignal.timeout(5000)
      });

      if (response.ok) {
        const responseData = await response.json().catch(() => ({}));
        console.log('✅ Settings stored successfully via n8n:', { userId, globalTheme });
        return NextResponse.json({ success: true }); // Client doesn't need to know source
      } else {
        const errorText = await response.text().catch(() => 'Unknown error');
        console.warn('⚠️  n8n webhook returned error, trying Supabase direct fallback:', {
          status: response.status,
          statusText: response.statusText,
          body: errorText
        });
      }
    } catch (n8nError: any) {
      // Network error or timeout
      console.warn('⚠️  n8n webhook request failed, trying Supabase direct fallback:', {
        message: n8nError.message,
        name: n8nError.name
      });
    }

    // FALLBACK 2: Try Supabase direct (data layer - last resort)
    if (SUPABASE_SERVICE_KEY) {
      try {
        console.log('🔄 Attempting Supabase direct for settings store (fallback):', { userId, globalTheme });
        
        const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);
        
        const { data, error } = await supabase
          .from('user_settings')
          .upsert({
            user_id: userId,
            global_theme: globalTheme,
            preferences: preferences,
            updated_at: new Date().toISOString()
          }, {
            onConflict: 'user_id'
          });

        if (!error) {
          console.log('✅ Settings stored successfully in Supabase (direct fallback):', { userId, globalTheme });
          return NextResponse.json({ success: true }); // Client doesn't need to know source
        } else {
          // Log the actual Supabase error for debugging
          console.error('❌ Supabase upsert error:', {
            code: error.code,
            message: error.message,
            details: error.details,
            hint: error.hint
          });
        }
      } catch (supabaseError: any) {
        // Supabase client creation or network error
        console.error('❌ Supabase client error:', {
          message: supabaseError.message,
          stack: supabaseError.stack
        });
      }
    } else {
      console.warn('⚠️  SUPABASE_SERVICE_KEY not configured, cannot use Supabase direct fallback');
    }

    // All layers failed
    console.error('❌ All storage layers failed (MCP → n8n → Supabase):', {
      userId,
      globalTheme,
      hasMcpKey: !!MCP_API_KEY,
      hasSupabaseKey: !!SUPABASE_SERVICE_KEY,
      mcpUrl: MCP_BASE_URL,
      n8nUrl: N8N_URL,
      supabaseUrl: SUPABASE_URL
    });

    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to store settings'
        // Client doesn't need to know which layers failed - that's controller concern
      },
      { status: 500 }
    );
  } catch (error: any) {
    console.error('Settings store error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to store settings' },
      { status: 500 }
    );
  }
}

