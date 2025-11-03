/**
 * Knowledge Query API - Fetch crew memories from Supabase RAG system
 * 
 * Direct Supabase fallback (n8n webhooks currently unavailable)
 * 
 * GET /api/knowledge/query - Query crew memories
 * POST /api/knowledge/query - Query with filters
 * 
 * Crew: Lt. Uhura (API integration), Chief O'Brien (fallback pattern)
 */

import { NextRequest, NextResponse } from 'next/server';

const SUPABASE_URL = process.env.SUPABASE_URL || 'https://rpkkkbufdwxmjaerbhbn.supabase.co';
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const category = searchParams.get('category') || null;
    const limit = parseInt(searchParams.get('limit') || '10');
    
    const sessions = await queryKnowledgeBase({ category, limit });
    
    return NextResponse.json({ 
      success: true, 
      sessions,
      count: sessions.length 
    });
  } catch (error: any) {
    console.error('Knowledge query error:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { category, limit = 10, search } = body;
    
    const sessions = await queryKnowledgeBase({ category, limit, search });
    
    return NextResponse.json({ 
      success: true, 
      sessions,
      count: sessions.length 
    });
  } catch (error: any) {
    console.error('Knowledge query error:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

async function queryKnowledgeBase(params: { 
  category?: string | null; 
  limit?: number; 
  search?: string;
}) {
  const { category, limit = 10, search } = params;
  
  // Build Supabase query
  let url = `${SUPABASE_URL}/rest/v1/knowledge_base?select=session_id,title,executive_summary,session_date,created_at,content,category&order=created_at.desc&limit=${limit}`;
  
  // Filter by category if provided
  if (category) {
    url += `&category=eq.${encodeURIComponent(category)}`;
  }
  
  // Full-text search if provided
  if (search) {
    url += `&or=(title.ilike.%${encodeURIComponent(search)}%,executive_summary.ilike.%${encodeURIComponent(search)}%)`;
  }
  
  // Only non-deleted
  url += '&deleted_at=is.null';
  
  const response = await fetch(url, {
    method: 'GET',
    headers: {
      'apikey': SUPABASE_SERVICE_KEY || '',
      'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
      'Content-Type': 'application/json'
    }
  });
  
  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Supabase query failed (${response.status}): ${error}`);
  }
  
  const sessions = await response.json();
  return sessions;
}

