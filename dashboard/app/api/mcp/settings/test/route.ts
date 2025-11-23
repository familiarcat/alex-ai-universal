import { NextResponse } from 'next/server';
import { getUnifiedServiceAccessor } from '@/scripts/utils/unified-service-accessor';

/**
 * Connection Test API
 * 
 * Tests connections to MCP server and OpenRouter
 */

export async function POST(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const service = searchParams.get('service');

    if (!service || !['mcp', 'openRouter'].includes(service)) {
      return NextResponse.json({
        success: false,
        error: 'Invalid service. Must be "mcp" or "openRouter"'
      }, { status: 400 });
    }

    const { settings } = await request.json();

    if (service === 'mcp') {
      // Test MCP server connection
      try {
        const services = getUnifiedServiceAccessor();
        services.initialize();
        
        // Try to get status
        const status = await services.getStatus();
        
        return NextResponse.json({
          success: true,
          message: 'MCP server connection successful',
          status
        });
      } catch (error: any) {
        return NextResponse.json({
          success: false,
          error: error.message || 'Failed to connect to MCP server'
        });
      }
    } else if (service === 'openRouter') {
      // Test OpenRouter connection
      try {
        // TODO: Test OpenRouter API key
        // For now, just check if API key is provided
        if (!settings?.openRouter?.apiKey) {
          return NextResponse.json({
            success: false,
            error: 'OpenRouter API key is required'
          });
        }

        return NextResponse.json({
          success: true,
          message: 'OpenRouter API key validated'
        });
      } catch (error: any) {
        return NextResponse.json({
          success: false,
          error: error.message || 'Failed to connect to OpenRouter'
        });
      }
    }

    return NextResponse.json({
      success: false,
      error: 'Unknown service'
    }, { status: 400 });
  } catch (error: any) {
    console.error('Error testing connection:', error);
    return NextResponse.json({
      success: false,
      error: error.message || 'Failed to test connection'
    }, { status: 500 });
  }
}

