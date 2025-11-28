/**
 * Sync Status API
 * 
 * GET /api/sync/status
 * 
 * Returns cross-server sync status
 * Falls back to mock data if Supabase unavailable
 * 
 * Leadership: Lieutenant Uhura (Communications) + Geordi La Forge (Infrastructure)
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;

export async function GET(request: NextRequest) {
  try {
    // Try to fetch from Supabase
    if (SUPABASE_URL && SUPABASE_SERVICE_KEY) {
      const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);
      
      // Query sync status (if table exists)
      const { data, error } = await supabase
        .from('sync_status')
        .select('*')
        .order('last_sync', { ascending: false })
        .limit(1)
        .single()
        .catch(() => ({ data: null, error: null }));

      if (!error && data) {
        return NextResponse.json({
          success: true,
          data: {
            enabled: data.enabled || true,
            lastSync: data.last_sync || new Date().toISOString(),
            nextSync: data.next_sync || new Date(Date.now() + 60 * 60 * 1000).toISOString(),
            servers: data.servers || [],
            status: data.status || 'active'
          }
        });
      }
    }

    // Fallback to mock data
    const mockData = {
      enabled: true,
      lastSync: new Date().toISOString(),
      nextSync: new Date(Date.now() + 60 * 60 * 1000).toISOString(),
      servers: [
        { id: 'server-1', name: 'Primary', status: 'synced', lastSync: new Date().toISOString() },
        { id: 'server-2', name: 'Secondary', status: 'synced', lastSync: new Date().toISOString() }
      ],
      status: 'active'
    };

    return NextResponse.json({
      success: true,
      data: mockData,
      fallback: true,
      message: 'Using mock data - Supabase table may not exist yet'
    });
  } catch (error: any) {
    console.error('Sync status API error:', error);
    return NextResponse.json({
      success: false,
      error: error.message || 'Failed to fetch sync status',
      data: null
    }, { status: 500 });
  }
}

