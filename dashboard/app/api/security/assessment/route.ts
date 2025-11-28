/**
 * Security Assessment API
 * 
 * GET /api/security/assessment
 * 
 * Returns security assessment data from Supabase
 * Falls back to mock data if Supabase unavailable
 * 
 * Leadership: Lieutenant Worf (Security) + Geordi La Forge (Infrastructure)
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
      
      // Query security audits (if table exists)
      let data = null;
      let error = null;
      try {
        const result = await supabase
          .from('security_audits')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(10)
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
            overallScore: data.score || 85,
            vulnerabilities: data.vulnerabilities || [],
            compliance: data.compliance || { gdpr: true, hipaa: false, soc2: true },
            lastScan: data.created_at || new Date().toISOString(),
            nextScan: data.next_scan || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
          }
        });
      }
    }

    // Fallback to mock data if Supabase unavailable
    const mockData = {
      overallScore: Math.floor(Math.random() * 20) + 80,
      vulnerabilities: [
        { id: 'vuln-1', severity: 'low', title: 'Mock vulnerability 1', status: 'resolved' },
        { id: 'vuln-2', severity: 'medium', title: 'Mock vulnerability 2', status: 'in-progress' }
      ],
      compliance: {
        gdpr: true,
        hipaa: false,
        soc2: true
      },
      lastScan: new Date().toISOString(),
      nextScan: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
    };

    return NextResponse.json({
      success: true,
      data: mockData,
      fallback: true,
      message: 'Using mock data - Supabase table may not exist yet'
    });
  } catch (error: any) {
    console.error('Security assessment API error:', error);
    return NextResponse.json({
      success: false,
      error: error.message || 'Failed to fetch security assessment',
      data: null
    }, { status: 500 });
  }
}

