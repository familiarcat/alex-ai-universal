/**
 * LCARS Hallucination Monitor Component
 * 
 * Dr. Crusher's Medical Interface for Real-Time Hallucination Monitoring
 * Integrated into the LCARS Ship's Computer System
 */

import React, { useState, useEffect } from 'react';
import LCARSHallucinationMonitoringSystem, { 
  HallucinationEvent, 
  SystemVitalSigns, 
  SystemHealthStatus,
  HallucinationSeverity,
  HallucinationType
} from '../lib/lcars-hallucination-monitoring-system';

interface LCARSHallucinationMonitorProps {
  className?: string;
  autoRefresh?: boolean;
  refreshInterval?: number;
}

const LCARSHallucinationMonitor: React.FC<LCARSHallucinationMonitorProps> = ({
  className = '',
  autoRefresh = true,
  refreshInterval = 30000
}) => {
  const [monitoringSystem] = useState(() => new LCARSHallucinationMonitoringSystem());
  const [vitalSigns, setVitalSigns] = useState<SystemVitalSigns | null>(null);
  const [healthStatus, setHealthStatus] = useState<SystemHealthStatus>(SystemHealthStatus.OPTIMAL);
  const [hallucinationHistory, setHallucinationHistory] = useState<HallucinationEvent[]>([]);
  const [isMonitoring, setIsMonitoring] = useState(false);

  useEffect(() => {
    // Initialize monitoring
    const initializeMonitoring = async () => {
      setIsMonitoring(true);
      
      // Get initial vital signs
      const initialVitalSigns = monitoringSystem.getSystemVitalSigns();
      setVitalSigns(initialVitalSigns);
      setHealthStatus(monitoringSystem.getHealthStatus());
      setHallucinationHistory(monitoringSystem.getHallucinationHistory());

      // Set up event listeners
      monitoringSystem.on('healthUpdate', (newVitalSigns) => {
        setVitalSigns(newVitalSigns);
        setHealthStatus(monitoringSystem.getHealthStatus());
      });

      monitoringSystem.on('hallucinationDetected', (event) => {
        setHallucinationHistory(monitoringSystem.getHallucinationHistory());
      });

      monitoringSystem.on('hallucinationResolved', (event) => {
        setHallucinationHistory(monitoringSystem.getHallucinationHistory());
      });

      if (autoRefresh) {
        const interval = setInterval(() => {
          setVitalSigns(monitoringSystem.getSystemVitalSigns());
          setHealthStatus(monitoringSystem.getHealthStatus());
          setHallucinationHistory(monitoringSystem.getHallucinationHistory());
        }, refreshInterval);

        return () => clearInterval(interval);
      }
    };

    initializeMonitoring();
  }, [monitoringSystem, autoRefresh, refreshInterval]);

  const getHealthStatusColor = (status: SystemHealthStatus): string => {
    switch (status) {
      case SystemHealthStatus.OPTIMAL:
        return 'text-green-400';
      case SystemHealthStatus.STABLE:
        return 'text-blue-400';
      case SystemHealthStatus.DEGRADED:
        return 'text-yellow-400';
      case SystemHealthStatus.CRITICAL:
        return 'text-orange-400';
      case SystemHealthStatus.EMERGENCY:
        return 'text-red-400';
      default:
        return 'text-gray-400';
    }
  };

  const getSeverityColor = (severity: HallucinationSeverity): string => {
    switch (severity) {
      case HallucinationSeverity.MINOR:
        return 'text-green-300';
      case HallucinationSeverity.MODERATE:
        return 'text-yellow-300';
      case HallucinationSeverity.MAJOR:
        return 'text-orange-300';
      case HallucinationSeverity.CRITICAL:
        return 'text-red-300';
      default:
        return 'text-gray-300';
    }
  };

  const getTypeIcon = (type: HallucinationType): string => {
    switch (type) {
      case HallucinationType.EXECUTION_BLOCKER:
        return '⚠️';
      case HallucinationType.DATA_INCONSISTENCY:
        return '🔄';
      case HallucinationType.LOGICAL_CONTRADICTION:
        return '❌';
      case HallucinationType.TOOL_INTERFACE_FAILURE:
        return '🔌';
      case HallucinationType.INFORMATION_GAP:
        return '❓';
      case HallucinationType.RESPONSE_DELAY:
        return '⏱️';
      default:
        return '🔍';
    }
  };

  const formatTimestamp = (timestamp: Date): string => {
    return new Intl.DateTimeFormat('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false
    }).format(timestamp);
  };

  const formatDuration = (milliseconds: number): string => {
    if (milliseconds < 1000) return `${milliseconds}ms`;
    if (milliseconds < 60000) return `${Math.round(milliseconds / 1000)}s`;
    return `${Math.round(milliseconds / 60000)}m`;
  };

  return (
    <div className={`lcars-hallucination-monitor ${className}`}>
      {/* LCARS Header */}
      <div className="lcars-header bg-gray-900 border border-blue-400 p-4 mb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-3 h-3 bg-blue-400 rounded-full animate-pulse"></div>
            <h2 className="text-blue-400 text-lg font-mono">LCARS HALLUCINATION MONITOR</h2>
          </div>
          <div className="flex items-center space-x-2">
            <div className={`w-2 h-2 rounded-full ${isMonitoring ? 'bg-green-400' : 'bg-red-400'}`}></div>
            <span className="text-green-400 text-sm font-mono">MONITORING</span>
          </div>
        </div>
      </div>

      {/* Dr. Crusher's Medical Status Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
        {/* System Health Status */}
        <div className="lcars-panel bg-gray-900 border border-blue-400 p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-blue-400 text-sm font-mono">SYSTEM HEALTH STATUS</h3>
            <div className="flex items-center space-x-2">
              <span className="text-xs text-gray-400 font-mono">Dr. Crusher</span>
              <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
            </div>
          </div>
          
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-gray-300 text-sm">Status:</span>
              <span className={`font-mono text-sm ${getHealthStatusColor(healthStatus)}`}>
                {healthStatus.toUpperCase()}
              </span>
            </div>
            
            {vitalSigns && (
              <>
                <div className="flex justify-between items-center">
                  <span className="text-gray-300 text-sm">Reliability:</span>
                  <span className="text-green-400 font-mono text-sm">
                    {vitalSigns.systemReliability.toFixed(1)}%
                  </span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-gray-300 text-sm">Mission Success:</span>
                  <span className="text-green-400 font-mono text-sm">
                    {vitalSigns.missionSuccessRate.toFixed(1)}%
                  </span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-gray-300 text-sm">Crew Collaboration:</span>
                  <span className="text-blue-400 font-mono text-sm">
                    {vitalSigns.crewCollaborationScore.toFixed(1)}%
                  </span>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Vital Signs Panel */}
        <div className="lcars-panel bg-gray-900 border border-blue-400 p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-blue-400 text-sm font-mono">VITAL SIGNS</h3>
            <div className="flex items-center space-x-2">
              <span className="text-xs text-gray-400 font-mono">Medical</span>
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
            </div>
          </div>
          
          {vitalSigns && (
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-gray-300 text-sm">Hallucination Rate:</span>
                <span className="text-yellow-400 font-mono text-sm">
                  {vitalSigns.hallucinationRate}/hr
                </span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-gray-300 text-sm">Avg Resolution:</span>
                <span className="text-blue-400 font-mono text-sm">
                  {formatDuration(vitalSigns.averageResolutionTime)}
                </span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-gray-300 text-sm">Last Update:</span>
                <span className="text-gray-400 font-mono text-xs">
                  {formatTimestamp(vitalSigns.timestamp)}
                </span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Hallucination History */}
      <div className="lcars-panel bg-gray-900 border border-blue-400 p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-blue-400 text-sm font-mono">HALLUCINATION HISTORY</h3>
          <div className="flex items-center space-x-2">
            <span className="text-xs text-gray-400 font-mono">Recent Events</span>
            <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
          </div>
        </div>
        
        {hallucinationHistory.length === 0 ? (
          <div className="text-center py-8">
            <div className="text-green-400 text-4xl mb-2">✅</div>
            <p className="text-gray-400 font-mono text-sm">No hallucination events detected</p>
            <p className="text-gray-500 font-mono text-xs mt-1">System operating normally</p>
          </div>
        ) : (
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {hallucinationHistory.slice(0, 10).map((event) => (
              <div key={event.id} className="bg-gray-800 border border-gray-600 p-3 rounded">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    <span className="text-lg">{getTypeIcon(event.type)}</span>
                    <span className="text-blue-400 font-mono text-sm">
                      {event.type.replace('_', ' ').toUpperCase()}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className={`font-mono text-xs ${getSeverityColor(event.severity)}`}>
                      {event.severity.toUpperCase()}
                    </span>
                    <span className="text-gray-400 font-mono text-xs">
                      {formatTimestamp(event.timestamp)}
                    </span>
                  </div>
                </div>
                
                <div className="text-gray-300 text-sm mb-2">
                  {event.description}
                </div>
                
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center space-x-4">
                    <span className="text-gray-400">
                      Crew Analysis: {event.crewAnalysis.length}
                    </span>
                    <span className="text-gray-400">
                      Resolutions: {event.resolution.length}
                    </span>
                  </div>
                  <span className={`font-mono ${
                    event.status === 'resolved' ? 'text-green-400' : 
                    event.status === 'resolving' ? 'text-yellow-400' :
                    event.status === 'analyzing' ? 'text-blue-400' :
                    'text-red-400'
                  }`}>
                    {event.status.toUpperCase()}
                  </span>
                </div>
                
                {event.crewAnalysis.length > 0 && (
                  <div className="mt-2 pt-2 border-t border-gray-600">
                    <div className="text-xs text-gray-400 mb-1">Crew Analysis:</div>
                    <div className="space-y-1">
                      {event.crewAnalysis.slice(0, 2).map((analysis, index) => (
                        <div key={index} className="text-xs text-gray-300">
                          <span className="text-blue-400 font-mono">{analysis.crewMember}:</span>
                          <span className="ml-2">{analysis.assessment.substring(0, 100)}...</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Dr. Crusher's Medical Report Button */}
      <div className="mt-4 text-center">
        <button
          onClick={() => {
            const report = monitoringSystem.generateMedicalReport();
            console.log(report);
            alert('Medical report generated - check console for full report');
          }}
          className="lcars-button bg-blue-600 hover:bg-blue-500 text-white px-6 py-2 rounded font-mono text-sm transition-colors duration-200"
        >
          🏥 GENERATE MEDICAL REPORT
        </button>
      </div>
    </div>
  );
};

export default LCARSHallucinationMonitor;

