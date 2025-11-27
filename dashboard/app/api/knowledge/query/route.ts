/**
 * Knowledge Query API - Fetch crew memories from Supabase RAG system
 * 
 * SECURITY: Uses Supabase client library to prevent SQL injection
 * 
 * GET /api/knowledge/query - Query crew memories
 * POST /api/knowledge/query - Query with filters
 * 
 * Crew: Lt. Uhura (API integration), Chief O'Brien (fallback pattern)
 * Security Review: Lt. Worf (Security fixes)
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Use live Supabase instance from environment variables (hosted on pbradygeorgen.com infrastructure)
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
// SECURITY FIX: Require service key, no fallback to anon key
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL) {
  throw new Error('Supabase URL not configured. Please set NEXT_PUBLIC_SUPABASE_URL or SUPABASE_URL environment variable.');
}

if (!SUPABASE_SERVICE_KEY) {
  console.error('⚠️  SECURITY: SUPABASE_SERVICE_KEY not configured. Service key required for secure operations.');
  throw new Error('Supabase service key not configured. Please set SUPABASE_SERVICE_KEY or SUPABASE_SERVICE_ROLE_KEY environment variable.');
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const category = searchParams.get('category') || null;
    const limitRaw = searchParams.get('limit') || '10';
    
    // SECURITY FIX: Input validation
    const limit = Math.min(Math.max(parseInt(limitRaw) || 10, 1), 100); // Clamp between 1-100
    const categorySanitized = category ? String(category).trim().slice(0, 100) : null; // Limit length
    
    const sessions = await queryKnowledgeBase({ category: categorySanitized, limit });
    
    return NextResponse.json({ 
      success: true, 
      sessions,
      count: sessions.length 
    });
  } catch (error: any) {
    // SECURITY FIX: Don't expose internal error details
    console.error('Knowledge query error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to query knowledge base' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    // SECURITY FIX: Limit request body size (10KB max)
    const bodyText = await request.text();
    if (bodyText.length > 10 * 1024) {
      return NextResponse.json(
        { success: false, error: 'Request body too large' },
        { status: 413 }
      );
    }
    
    const body = JSON.parse(bodyText);
    const { category, limit: limitRaw = 10, search } = body;
    
    // SECURITY FIX: Input validation
    const limit = Math.min(Math.max(parseInt(String(limitRaw)) || 10, 1), 100); // Clamp between 1-100
    const categorySanitized = category ? String(category).trim().slice(0, 100) : null;
    const searchSanitized = search ? String(search).trim().slice(0, 200) : null; // Limit search length
    
    const sessions = await queryKnowledgeBase({ category: categorySanitized, limit, search: searchSanitized });
    
    return NextResponse.json({ 
      success: true, 
      sessions,
      count: sessions.length 
    });
  } catch (error: any) {
    // SECURITY FIX: Don't expose internal error details
    console.error('Knowledge query error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to query knowledge base' },
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
  
  // SECURITY FIX: Use Supabase client library instead of raw URL construction
  // This prevents SQL injection and ensures proper query sanitization
  const supabase = createClient(SUPABASE_URL!, SUPABASE_SERVICE_KEY!);
  
  // Build query using Supabase client (safe from injection)
  let query = supabase
    .from('knowledge_base')
    .select('session_id,title,executive_summary,session_date,created_at,content,category')
    .eq('deleted_at', null) // Only non-deleted
    .order('created_at', { ascending: false })
    .limit(limit);
  
  // Filter by category if provided (validated input)
  if (category) {
    query = query.eq('category', category);
  }
  
  // Full-text search if provided (using Supabase's safe ilike with parameterized search)
  if (search) {
    // SECURITY: Use Supabase's textSearch or filter with proper escaping
    // Escape special characters in search term
    const escapedSearch = search.replace(/[%_\\]/g, '\\$&');
    query = query.or(`title.ilike.%${escapedSearch}%,executive_summary.ilike.%${escapedSearch}%`);
  }
  
  const { data: sessions, error } = await query;
  
  if (error) {
    // SECURITY FIX: Don't expose Supabase error details
    console.error('Supabase query error:', error);
    throw new Error('Database query failed');
  }
  
  return sessions || [];
}

