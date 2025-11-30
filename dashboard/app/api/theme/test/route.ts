/**
 * Theme Testing Harness API
 * 
 * Comprehensive theme testing and validation endpoint
 * 
 * Crew: Troi (UX) + Data (Analytics) + La Forge (Implementation)
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;

// All available themes
const THEMES = [
  'midnight', 'mochaEarth', 'oceanBlue', 'forestGreen',
  'sunsetOrange', 'lavenderPurple', 'roseGold', 'slateGray',
  'cyberpunk', 'offworld', 'gradientFusion', 'monochromeBlue'
];

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const action = searchParams.get('action') || 'test';
    const theme = searchParams.get('theme');

    if (action === 'list') {
      return NextResponse.json({
        success: true,
        themes: THEMES,
        count: THEMES.length
      });
    }

    if (action === 'test' && theme) {
      return await testTheme(theme);
    }

    if (action === 'test-all') {
      return await testAllThemes();
    }

    if (action === 'verify-settings') {
      return await verifySettingsTable();
    }

    return NextResponse.json({
      success: false,
      error: 'Invalid action. Use: list, test, test-all, or verify-settings'
    }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, theme, userId = 'default' } = body;

    if (action === 'set-theme' && theme) {
      return await setTheme(theme, userId);
    }

    if (action === 'test-cycle') {
      return await testThemeCycle();
    }

    return NextResponse.json({
      success: false,
      error: 'Invalid action. Use: set-theme or test-cycle'
    }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 500 });
  }
}

async function testTheme(theme: string) {
  const results = {
    theme,
    timestamp: new Date().toISOString(),
    tests: {
      themeExists: THEMES.includes(theme),
      canStore: false,
      canRetrieve: false,
      persistence: false,
      errors: [] as string[]
    }
  };

  if (!results.tests.themeExists) {
    results.tests.errors.push(`Theme '${theme}' is not in the available themes list`);
    return NextResponse.json({ success: false, results });
  }

  // Test storing theme
  try {
    const storeResponse = await fetch(`${request.url.split('/api')[0]}/api/settings/store`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId: 'test-user',
        globalTheme: theme,
        preferences: { test: true }
      })
    });

    results.tests.canStore = storeResponse.ok;
    if (!storeResponse.ok) {
      const errorData = await storeResponse.json().catch(() => ({}));
      results.tests.errors.push(`Store failed: ${errorData.error || storeResponse.statusText}`);
    }
  } catch (error: any) {
    results.tests.errors.push(`Store error: ${error.message}`);
  }

  // Test retrieving theme
  try {
    const retrieveResponse = await fetch(`${request.url.split('/api')[0]}/api/settings/retrieve?userId=test-user`, {
      method: 'GET',
      headers: { 'Cache-Control': 'no-cache' },
      cache: 'no-store'
    });

    if (retrieveResponse.ok) {
      const data = await retrieveResponse.json();
      results.tests.canRetrieve = true;
      results.tests.persistence = data.globalTheme === theme;
      if (!results.tests.persistence) {
        results.tests.errors.push(`Persistence failed: expected '${theme}', got '${data.globalTheme}'`);
      }
    } else {
      results.tests.errors.push(`Retrieve failed: ${retrieveResponse.statusText}`);
    }
  } catch (error: any) {
    results.tests.errors.push(`Retrieve error: ${error.message}`);
  }

  return NextResponse.json({
    success: results.tests.canStore && results.tests.canRetrieve && results.tests.persistence,
    results
  });
}

async function testAllThemes() {
  const allResults = [];
  
  for (const theme of THEMES) {
    const testResult = await testTheme(theme);
    const resultData = await testResult.json();
    allResults.push(resultData.results);
  }

  const passed = allResults.filter(r => r.tests.canStore && r.tests.canRetrieve && r.tests.persistence).length;
  const failed = allResults.length - passed;

  return NextResponse.json({
    success: failed === 0,
    summary: {
      total: allResults.length,
      passed,
      failed,
      passRate: `${((passed / allResults.length) * 100).toFixed(1)}%`
    },
    results: allResults
  });
}

async function verifySettingsTable() {
  if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
    return NextResponse.json({
      success: false,
      error: 'Supabase credentials not configured'
    }, { status: 500 });
  }

  try {
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);
    
    // Check if table exists
    const { data, error } = await supabase
      .from('user_settings')
      .select('user_id, global_theme, created_at')
      .limit(1);

    if (error) {
      if (error.code === '42P01') {
        return NextResponse.json({
          success: false,
          error: 'Table does not exist',
          hint: 'Run migration: supabase/migrations/002_create_user_settings_table.sql'
        });
      }
      throw error;
    }

    return NextResponse.json({
      success: true,
      tableExists: true,
      sampleData: data,
      message: 'Table is accessible and working'
    });
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: error.message,
      code: error.code
    }, { status: 500 });
  }
}

async function setTheme(theme: string, userId: string) {
  const response = await fetch(`${request.url.split('/api')[0]}/api/settings/store`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      userId,
      globalTheme: theme,
      preferences: {}
    })
  });

  const data = await response.json();
  
  return NextResponse.json({
    success: response.ok && data.success,
    theme,
    userId,
    response: data
  });
}

async function testThemeCycle() {
  const cycleResults = [];
  const testUserId = `test-cycle-${Date.now()}`;

  for (const theme of THEMES.slice(0, 3)) { // Test first 3 themes
    // Set theme
    const setResult = await setTheme(theme, testUserId);
    const setData = await setResult.json();
    
    // Wait a bit
    await new Promise(resolve => setTimeout(resolve, 100));
    
    // Retrieve theme
    const retrieveResponse = await fetch(`${request.url.split('/api')[0]}/api/settings/retrieve?userId=${testUserId}`, {
      method: 'GET',
      cache: 'no-store'
    });
    const retrieveData = await retrieveResponse.json();
    
    cycleResults.push({
      theme,
      set: setData.success,
      retrieve: retrieveData.success && retrieveData.globalTheme === theme,
      persisted: retrieveData.globalTheme === theme
    });
  }

  const allPassed = cycleResults.every(r => r.set && r.retrieve && r.persisted);

  return NextResponse.json({
    success: allPassed,
    cycleResults,
    summary: {
      total: cycleResults.length,
      passed: cycleResults.filter(r => r.set && r.retrieve && r.persisted).length
    }
  });
}

