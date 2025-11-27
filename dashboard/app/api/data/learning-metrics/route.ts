/**
 * Learning Metrics API - DDD-Compliant
 * 
 * Client → Next.js API (Controller) → MCP → n8n → Supabase
 * 
 * Crew: Data (Architecture) + La Forge (Implementation)
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const MCP_BASE_URL = process.env.MCP_URL || process.env.NEXT_PUBLIC_MCP_URL || 'https://mcp.pbradygeorgen.com';
const MCP_API_KEY = process.env.MCP_API_KEY;
const N8N_URL = process.env.N8N_URL || process.env.NEXT_PUBLIC_N8N_URL || 'https://n8n.pbradygeorgen.com';
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;

export async function GET(request: NextRequest) {
  try {
    // PRIMARY: Try MCP server
    if (MCP_API_KEY) {
      try {
        const mcpResponse = await fetch(`${MCP_BASE_URL}/api/data/learning-metrics`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${MCP_API_KEY}`,
            'X-Source': 'alex-ai-dashboard-api'
          },
          signal: AbortSignal.timeout(5000)
        });

        if (mcpResponse.ok) {
          const data = await mcpResponse.json();
          return NextResponse.json({ success: true, data });
        }
      } catch (mcpError) {
        // Continue to fallback
      }
    }

    // FALLBACK 1: Try n8n
    try {
      const n8nResponse = await fetch(`${N8N_URL}/webhook/learning-metrics`, {
        method: 'GET',
        headers: { 'X-Source': 'alex-ai-dashboard-api' },
        signal: AbortSignal.timeout(5000)
      });

      if (n8nResponse.ok) {
        const data = await n8nResponse.json();
        return NextResponse.json({ success: true, data });
      }
    } catch (n8nError) {
      // Continue to fallback
    }

    // FALLBACK 2: Try Supabase direct
    if (SUPABASE_URL && SUPABASE_SERVICE_KEY) {
      try {
        const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);
        const { data, error } = await supabase
          .from('alex_ai_learning_metrics')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(1)
          .single();

        if (!error && data) {
          return NextResponse.json({ success: true, data });
        }
      } catch (supabaseError) {
        // All layers failed
      }
    }

    return NextResponse.json({ success: false, data: null }, { status: 404 });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

