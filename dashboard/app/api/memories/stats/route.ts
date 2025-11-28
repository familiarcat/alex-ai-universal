/**
 * Memories Stats API
 * 
 * GET /api/memories/stats
 * 
 * Returns statistics about crew memories
 * Falls back to mock data if Supabase unavailable
 * 
 * Leadership: Commander Data (Analytics) + Geordi La Forge (Infrastructure)
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
      
      let data = null;
      let error = null;
      try {
        const result = await supabase
          .from('crew_memories')
          .select('crew_member, id')
          .limit(1000);
        data = result.data;
        error = result.error;
      } catch (e) {
        // Table doesn't exist or query failed - use mock data
        data = null;
        error = { message: 'Table not found' };
      }

      if (!error && data) {
        // Aggregate stats by crew member
        const statsByCrew: Record<string, number> = {};
        data.forEach((m: any) => {
          const crew = m.crew_member || 'Unknown';
          statsByCrew[crew] = (statsByCrew[crew] || 0) + 1;
        });

        return NextResponse.json({
          success: true,
          total_memories: data.length,
          by_crew: statsByCrew,
          last_updated: new Date().toISOString()
        });
      }
    }

    // Fallback to mock data
    const mockStats = {
      total_memories: 15632,
      by_crew: {
        'Data': 2341,
        'La Forge': 2234,
        'Troi': 2098,
        'Riker': 1987,
        'Picard': 1856,
        'Worf': 1723,
        'Crusher': 1645,
        'Uhura': 1548
      },
      last_updated: new Date().toISOString(),
      fallback: true
    };

    return NextResponse.json({
      success: true,
      ...mockStats,
      message: 'Using mock data - Supabase table may not exist yet'
    });
  } catch (error: any) {
    console.error('Memories stats API error:', error);
    return NextResponse.json({
      success: false,
      error: error.message || 'Failed to fetch memory stats',
      total_memories: 0,
      by_crew: {}
    }, { status: 500 });
  }
}

