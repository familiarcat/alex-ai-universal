/**
 * Memories Retrieve API
 * 
 * GET /api/memories/retrieve
 * 
 * Retrieves memories for a specific agent
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
    const searchParams = request.nextUrl.searchParams;
    const agentName = searchParams.get('agent_name') || 'Data';
    const limit = Math.min(parseInt(searchParams.get('limit') || '10'), 100);

    // Try to fetch from Supabase
    if (SUPABASE_URL && SUPABASE_SERVICE_KEY) {
      const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);
      
      let data = null;
      let error = null;
      try {
        const result = await supabase
          .from('crew_memories')
          .select('*')
          .eq('crew_member', agentName)
          .order('created_at', { ascending: false })
          .limit(limit);
        data = result.data;
        error = result.error;
      } catch (e) {
        // Table doesn't exist or query failed - use mock data
        data = null;
        error = { message: 'Table not found' };
      }

      if (!error && data && data.length > 0) {
        return NextResponse.json({
          success: true,
          agent_name: agentName,
          total_memories: data.length,
          memories: data.map((m: any) => ({
            id: m.id,
            content: m.content,
            crew_member: m.crew_member,
            timestamp: m.created_at || m.timestamp,
            importance: m.importance || 'medium'
          }))
        });
      }
    }

    // Fallback to mock data
    const mockMemories = Array.from({ length: Math.min(limit, 5) }, (_, i) => ({
      id: `mock-${i + 1}`,
      content: `Mock memory ${i + 1} for ${agentName}`,
      crew_member: agentName,
      timestamp: new Date(Date.now() - i * 24 * 60 * 60 * 1000).toISOString(),
      importance: i === 0 ? 'high' : 'medium'
    }));

    return NextResponse.json({
      success: true,
      agent_name: agentName,
      total_memories: mockMemories.length,
      memories: mockMemories,
      fallback: true,
      message: 'Using mock data - Supabase table may not exist yet'
    });
  } catch (error: any) {
    console.error('Memories retrieve API error:', error);
    return NextResponse.json({
      success: false,
      error: error.message || 'Failed to retrieve memories',
      memories: []
    }, { status: 500 });
  }
}

