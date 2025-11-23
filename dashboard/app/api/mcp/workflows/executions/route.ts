import { NextResponse } from 'next/server';
import { getUnifiedServiceAccessor } from '@/scripts/utils/unified-service-accessor';

/**
 * Execution History API
 * 
 * Provides execution history and monitoring data
 */

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const workflowId = searchParams.get('workflowId');
    const limit = parseInt(searchParams.get('limit') || '50');

    const services = getUnifiedServiceAccessor();
    services.initialize();

    // Get execution history from MCP monitoring service
    try {
      const monitoring = services.getMonitoringStats();
      
      // For now, return mock data structure
      // TODO: Integrate with actual MCP monitoring service
      const executions = [
        // Mock execution data
        {
          id: 'exec-1',
          workflowId: workflowId || 'workflow-1',
          workflowName: 'Sample Workflow',
          status: 'success',
          startTime: new Date(Date.now() - 3600000).toISOString(),
          endTime: new Date(Date.now() - 3590000).toISOString(),
          duration: 10000,
          logs: ['Workflow started', 'Node 1 executed', 'Node 2 executed', 'Workflow completed'],
          errors: []
        }
      ];

      return NextResponse.json({
        success: true,
        executions: executions.filter(e => !workflowId || e.workflowId === workflowId).slice(0, limit),
        total: executions.length
      });
    } catch (error) {
      // If monitoring service not available, return empty
      return NextResponse.json({
        success: true,
        executions: [],
        total: 0,
        message: 'Monitoring service not available'
      });
    }
  } catch (error: any) {
    console.error('Error in executions GET:', error);
    return NextResponse.json({
      success: false,
      error: error.message || 'Failed to load executions'
    }, { status: 500 });
  }
}

