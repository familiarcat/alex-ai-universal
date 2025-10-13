/**
 * LCARS Hallucination Monitor API
 * 
 * Dr. Crusher's Medical Interface API for Real-Time Hallucination Monitoring
 * Integrated into the LCARS Ship's Computer System
 */

import { NextRequest, NextResponse } from 'next/server';
import LCARSHallucinationMonitoringSystem, { 
  HallucinationType, 
  HallucinationSeverity 
} from '../../../../lib/lcars-hallucination-monitoring-system';

// Global instance of the monitoring system (singleton pattern)
let monitoringSystem: LCARSHallucinationMonitoringSystem | null = null;

function getMonitoringSystem(): LCARSHallucinationMonitoringSystem {
  if (!monitoringSystem) {
    monitoringSystem = new LCARSHallucinationMonitoringSystem();
    
    // Set up event listeners for real-time updates
    monitoringSystem.on('hallucinationDetected', (event) => {
      console.log(`🖖 Dr. Crusher: Hallucination detected - ${event.type} (${event.severity})`);
    });
    
    monitoringSystem.on('hallucinationResolved', (event) => {
      console.log(`✅ Dr. Crusher: Hallucination resolved - ${event.type}`);
    });
    
    monitoringSystem.on('healthUpdate', (vitalSigns) => {
      console.log(`🏥 Dr. Crusher: System health update - Reliability: ${vitalSigns.systemReliability}%`);
    });
  }
  
  return monitoringSystem;
}

/**
 * GET /api/lcars/hallucination-monitor
 * Get current system health status and vital signs
 */
export async function GET(request: NextRequest) {
  try {
    const system = getMonitoringSystem();
    
    const healthStatus = system.getHealthStatus();
    const vitalSigns = system.getSystemVitalSigns();
    const hallucinationHistory = system.getHallucinationHistory();
    
    return NextResponse.json({
      success: true,
      data: {
        healthStatus,
        vitalSigns,
        hallucinationHistory: hallucinationHistory.slice(0, 20), // Last 20 events
        timestamp: new Date().toISOString(),
        crew: 'Dr. Beverly Crusher - Chief Medical Officer'
      }
    });
  } catch (error) {
    console.error('LCARS Hallucination Monitor API Error:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to retrieve system health status',
      crew: 'Dr. Beverly Crusher - Chief Medical Officer'
    }, { status: 500 });
  }
}

/**
 * POST /api/lcars/hallucination-monitor
 * Report a new hallucination event for analysis
 */
export async function POST(request: NextRequest) {
  try {
    const system = getMonitoringSystem();
    const body = await request.json();
    
    const {
      type,
      description,
      symptoms = [],
      affectedComponents = []
    } = body;
    
    // Validate required fields
    if (!type || !description) {
      return NextResponse.json({
        success: false,
        error: 'Missing required fields: type and description',
        crew: 'Dr. Beverly Crusher - Chief Medical Officer'
      }, { status: 400 });
    }
    
    // Validate hallucination type
    if (!Object.values(HallucinationType).includes(type)) {
      return NextResponse.json({
        success: false,
        error: `Invalid hallucination type. Valid types: ${Object.values(HallucinationType).join(', ')}`,
        crew: 'Dr. Beverly Crusher - Chief Medical Officer'
      }, { status: 400 });
    }
    
    // Dr. Crusher's medical assessment
    const eventId = await system.detectHallucination(
      type,
      description,
      symptoms,
      affectedComponents
    );
    
    return NextResponse.json({
      success: true,
      data: {
        eventId,
        message: 'Hallucination event reported to Dr. Crusher for medical assessment',
        status: 'analyzing',
        crew: 'Dr. Beverly Crusher - Chief Medical Officer'
      }
    });
  } catch (error) {
    console.error('LCARS Hallucination Monitor API Error:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to report hallucination event',
      crew: 'Dr. Beverly Crusher - Chief Medical Officer'
    }, { status: 500 });
  }
}

/**
 * PUT /api/lcars/hallucination-monitor
 * Update hallucination event status or add resolution attempt
 */
export async function PUT(request: NextRequest) {
  try {
    const system = getMonitoringSystem();
    const body = await request.json();
    
    const {
      eventId,
      action,
      data
    } = body;
    
    if (!eventId || !action) {
      return NextResponse.json({
        success: false,
        error: 'Missing required fields: eventId and action',
        crew: 'Dr. Beverly Crusher - Chief Medical Officer'
      }, { status: 400 });
    }
    
    // Get current hallucination history
    const hallucinationHistory = system.getHallucinationHistory();
    const event = hallucinationHistory.find(e => e.id === eventId);
    
    if (!event) {
      return NextResponse.json({
        success: false,
        error: 'Hallucination event not found',
        crew: 'Dr. Beverly Crusher - Chief Medical Officer'
      }, { status: 404 });
    }
    
    // Handle different actions
    switch (action) {
      case 'resolve':
        // Mark event as resolved
        event.status = 'resolved';
        return NextResponse.json({
          success: true,
          data: {
            message: 'Hallucination event marked as resolved by Dr. Crusher',
            eventId,
            status: 'resolved',
            crew: 'Dr. Beverly Crusher - Chief Medical Officer'
          }
        });
        
      case 'update_status':
        const { status } = data;
        if (!status) {
          return NextResponse.json({
            success: false,
            error: 'Status is required for update_status action',
            crew: 'Dr. Beverly Crusher - Chief Medical Officer'
          }, { status: 400 });
        }
        
        event.status = status;
        return NextResponse.json({
          success: true,
          data: {
            message: 'Hallucination event status updated',
            eventId,
            status,
            crew: 'Dr. Beverly Crusher - Chief Medical Officer'
          }
        });
        
      default:
        return NextResponse.json({
          success: false,
          error: `Unknown action: ${action}`,
          crew: 'Dr. Beverly Crusher - Chief Medical Officer'
        }, { status: 400 });
    }
  } catch (error) {
    console.error('LCARS Hallucination Monitor API Error:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to update hallucination event',
      crew: 'Dr. Beverly Crusher - Chief Medical Officer'
    }, { status: 500 });
  }
}

/**
 * DELETE /api/lcars/hallucination-monitor
 * Clear hallucination history (admin only)
 */
export async function DELETE(request: NextRequest) {
  try {
    // This would typically require admin authentication
    const system = getMonitoringSystem();
    
    // Clear the hallucination history
    // Note: In a real implementation, you'd want to archive rather than delete
    system['hallucinationEvents'].clear();
    
    return NextResponse.json({
      success: true,
      data: {
        message: 'Hallucination history cleared by Dr. Crusher',
        crew: 'Dr. Beverly Crusher - Chief Medical Officer'
      }
    });
  } catch (error) {
    console.error('LCARS Hallucination Monitor API Error:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to clear hallucination history',
      crew: 'Dr. Beverly Crusher - Chief Medical Officer'
    }, { status: 500 });
  }
}

/**
 * GET /api/lcars/hallucination-monitor/medical-report
 * Generate Dr. Crusher's medical report
 */
export async function GET_MedicalReport(request: NextRequest) {
  try {
    const system = getMonitoringSystem();
    const report = system.generateMedicalReport();
    
    return NextResponse.json({
      success: true,
      data: {
        report,
        timestamp: new Date().toISOString(),
        crew: 'Dr. Beverly Crusher - Chief Medical Officer'
      }
    });
  } catch (error) {
    console.error('LCARS Medical Report API Error:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to generate medical report',
      crew: 'Dr. Beverly Crusher - Chief Medical Officer'
    }, { status: 500 });
  }
}

/**
 * GET /api/lcars/hallucination-monitor/health-check
 * Quick health check endpoint
 */
export async function GET_HealthCheck(request: NextRequest) {
  try {
    const system = getMonitoringSystem();
    const vitalSigns = system.getSystemVitalSigns();
    const healthStatus = system.getHealthStatus();
    
    return NextResponse.json({
      success: true,
      data: {
        status: 'healthy',
        healthStatus,
        systemReliability: vitalSigns.systemReliability,
        missionSuccessRate: vitalSigns.missionSuccessRate,
        timestamp: new Date().toISOString(),
        crew: 'Dr. Beverly Crusher - Chief Medical Officer'
      }
    });
  } catch (error) {
    console.error('LCARS Health Check API Error:', error);
    return NextResponse.json({
      success: false,
      error: 'Health check failed',
      crew: 'Dr. Beverly Crusher - Chief Medical Officer'
    }, { status: 500 });
  }
}

