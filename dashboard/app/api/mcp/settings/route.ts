import { NextResponse } from 'next/server';
import { getUnifiedServiceAccessor } from '@/scripts/utils/unified-service-accessor';

/**
 * System Settings API
 * 
 * Handles system-wide settings and configuration
 */

// GET - Load settings
export async function GET() {
  try {
    // TODO: Load from persistent storage (Supabase or local storage)
    // For now, return default settings
    return NextResponse.json({
      success: true,
      settings: {
        mcp: {
          serverUrl: process.env.MCP_SERVER_URL || 'https://mcp.pbradygeorgen.com',
          apiKey: '',
          enabled: true
        },
        openRouter: {
          apiKey: '',
          defaultModel: 'anthropic/claude-3.5-sonnet',
          costOptimization: true
        },
        crew: {
          defaultCrew: [],
          autoSelect: true
        },
        notifications: {
          email: false,
          errors: true,
          executions: false
        },
        theme: {
          current: 'default',
          customColors: {}
        }
      }
    });
  } catch (error: any) {
    console.error('Error loading settings:', error);
    return NextResponse.json({
      success: false,
      error: error.message || 'Failed to load settings'
    }, { status: 500 });
  }
}

// POST - Save settings
export async function POST(request: Request) {
  try {
    const { settings } = await request.json();

    if (!settings) {
      return NextResponse.json({
        success: false,
        error: 'Settings data is required'
      }, { status: 400 });
    }

    // TODO: Save to persistent storage (Supabase)
    // For now, just return success
    return NextResponse.json({
      success: true,
      message: 'Settings saved successfully',
      settings
    });
  } catch (error: any) {
    console.error('Error saving settings:', error);
    return NextResponse.json({
      success: false,
      error: error.message || 'Failed to save settings'
    }, { status: 500 });
  }
}

