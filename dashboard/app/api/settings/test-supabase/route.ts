/**
 * Test Supabase Connection for Settings
 * 
 * Helps diagnose Supabase-specific issues
 * 
 * Crew: Data (Diagnostics) + La Forge (Infrastructure)
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function GET(request: NextRequest) {
  const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
  const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
    return NextResponse.json({
      error: 'Supabase not configured',
      hasUrl: !!SUPABASE_URL,
      hasServiceKey: !!SUPABASE_SERVICE_KEY
    }, { status: 400 });
  }

  try {
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);
    
    // Test 1: Check if table exists
    const { data: tableCheck, error: tableError } = await supabase
      .from('user_settings')
      .select('user_id')
      .limit(1);

    // Test 2: Try to read existing settings
    const { data: readData, error: readError } = await supabase
      .from('user_settings')
      .select('user_id, global_theme, preferences')
      .eq('user_id', 'default')
      .single();

    // Test 3: Try to upsert (this is what actually fails)
    const { data: upsertData, error: upsertError } = await supabase
      .from('user_settings')
      .upsert({
        user_id: 'test-diagnostic',
        global_theme: 'test',
        preferences: {},
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'user_id'
      });

    return NextResponse.json({
      success: true,
      tests: {
        tableExists: !tableError,
        tableError: tableError ? {
          code: tableError.code,
          message: tableError.message,
          details: tableError.details,
          hint: tableError.hint
        } : null,
        canRead: !readError,
        readError: readError ? {
          code: readError.code,
          message: readError.message,
          details: readError.details,
          hint: readError.hint
        } : null,
        canUpsert: !upsertError,
        upsertError: upsertError ? {
          code: upsertError.code,
          message: upsertError.message,
          details: upsertError.details,
          hint: upsertError.hint
        } : null
      },
      existingSettings: readData,
      testUpsert: upsertData
    });
  } catch (error: any) {
    return NextResponse.json({
      error: 'Supabase test failed',
      message: error.message,
      stack: error.stack
    }, { status: 500 });
  }
}

