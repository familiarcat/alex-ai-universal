import { NextResponse } from 'next/server';
import { getUnifiedServiceAccessor } from '@/scripts/utils/unified-service-accessor';

/**
 * MCP System Status API
 * 
 * Returns overall system health and status
 */

export async function GET() {
  try {
    const services = getUnifiedServiceAccessor();
    services.initialize();

    // Get status from unified service accessor
    const status = await services.getStatus();

    return NextResponse.json({
      success: true,
      status: status.remoteMcpOperational || status.localMcpOperational ? 'operational' : 'offline',
      services: {
        remoteMCP: status.remoteMcpOperational,
        localMCP: status.localMcpOperational,
        n8n: status.n8nOperational
      },
      timestamp: new Date().toISOString()
    });
  } catch (error: any) {
    console.error('Error getting MCP status:', error);
    return NextResponse.json({
      success: false,
      status: 'error',
      error: error.message || 'Failed to get system status',
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}

