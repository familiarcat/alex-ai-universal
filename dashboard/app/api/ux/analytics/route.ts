/**
 * UX Analytics API
 * 
 * GET /api/ux/analytics
 * 
 * Returns UX analytics data from Supabase
 * Falls back to mock data if Supabase unavailable
 * 
 * Leadership: Counselor Troi (User Experience) + Geordi La Forge (Infrastructure)
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
      
      // Query UX metrics (if table exists)
      const { data, error } = await supabase
        .from('ux_metrics')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(1)
        .single()
        .catch(() => ({ data: null, error: null }));

      if (!error && data) {
        return NextResponse.json({
          success: true,
          data: {
            userSatisfaction: data.user_satisfaction || 85,
            metrics: data.metrics || {},
            feedback: data.feedback || []
          }
        });
      }
    }

    // Fallback to mock data
    const mockData = {
      userSatisfaction: Math.floor(Math.random() * 20) + 80,
      metrics: {
        pageLoadTime: Math.floor(Math.random() * 500) + 500,
        bounceRate: Math.floor(Math.random() * 20) + 10,
        conversionRate: Math.floor(Math.random() * 10) + 5
      },
      feedback: [
        { id: 'fb-1', rating: 5, comment: 'Mock positive feedback', date: new Date().toISOString() },
        { id: 'fb-2', rating: 4, comment: 'Mock constructive feedback', date: new Date().toISOString() }
      ]
    };

    return NextResponse.json({
      success: true,
      data: mockData,
      fallback: true,
      message: 'Using mock data - Supabase table may not exist yet'
    });
  } catch (error: any) {
    console.error('UX analytics API error:', error);
    return NextResponse.json({
      success: false,
      error: error.message || 'Failed to fetch UX analytics',
      data: null
    }, { status: 500 });
  }
}

