/**
 * Cost Optimization API
 * 
 * GET /api/cost/optimization
 * 
 * Returns cost optimization data from Supabase
 * Falls back to mock data if Supabase unavailable
 * 
 * Leadership: Quark (Business Intelligence) + Geordi La Forge (Infrastructure)
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
      
      // Query cost data (if table exists)
      let data = null;
      let error = null;
      try {
        const result = await supabase
          .from('cost_metrics')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(1)
          .single();
        data = result.data;
        error = result.error;
      } catch (e) {
        // Table doesn't exist or query failed - use mock data
        data = null;
        error = { message: 'Table not found' };
      }

      if (!error && data) {
        return NextResponse.json({
          success: true,
          data: {
            monthlyCost: data.monthly_cost || 200,
            savings: data.savings || 50,
            recommendations: data.recommendations || [],
            trends: data.trends || []
          }
        });
      }
    }

    // Fallback to mock data
    const mockData = {
      monthlyCost: Math.floor(Math.random() * 500) + 100,
      savings: Math.floor(Math.random() * 100) + 50,
      recommendations: [
        { id: 'rec-1', title: 'Optimize API calls', savings: 25, priority: 'high' },
        { id: 'rec-2', title: 'Cache frequently accessed data', savings: 15, priority: 'medium' }
      ],
      trends: Array.from({ length: 12 }, (_, i) => ({
        month: new Date(2024, i, 1).toLocaleDateString('en-US', { month: 'short' }),
        cost: Math.floor(Math.random() * 200) + 100
      }))
    };

    return NextResponse.json({
      success: true,
      data: mockData,
      fallback: true,
      message: 'Using mock data - Supabase table may not exist yet'
    });
  } catch (error: any) {
    console.error('Cost optimization API error:', error);
    return NextResponse.json({
      success: false,
      error: error.message || 'Failed to fetch cost optimization data',
      data: null
    }, { status: 500 });
  }
}

