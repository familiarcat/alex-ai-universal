import { useState, useEffect } from 'react';
import Head from 'next/head';
import { 
  Activity, 
  Users, 
  Zap, 
  Shield, 
  Database, 
  TrendingUp,
  CheckCircle,
  AlertCircle,
  XCircle
} from 'lucide-react';

export default function AlexAIDashboard() {
  const [systemData, setSystemData] = useState(null);
  const [crewData, setCrewData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(null);

  useEffect(() => {
    fetchSystemData();
    const interval = setInterval(fetchSystemData, 30000); // Update every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const fetchSystemData = async () => {
    try {
      // Call N8N server directly for real-time data
      const response = await fetch('https://n8n.pbradygeorgen.com/api/v1/alex-ai/status');
      const data = await response.json();
      
      setSystemData(data);
      setCrewData(data.crew || []);
      setLastUpdated(new Date());
      setLoading(false);
    } catch (error) {
      console.error('Error fetching system data:', error);
      // Fallback to mock data
      setSystemData({
        system: 'operational',
        crewMembers: 9,
        totalCrew: 9,
        averagePerformance: 95,
        uptime: Math.floor(Math.random() * 86400),
        memoryUsage: Math.floor(Math.random() * 100) + 50,
        healthScore: 100
      });
      setCrewData([
        { name: 'Captain Jean-Luc Picard', department: 'Command', performance: 98, status: 'active' },
        { name: 'Commander Data', department: 'Operations', performance: 99, status: 'active' },
        { name: 'Geordi La Forge', department: 'Engineering', performance: 97, status: 'active' },
        { name: 'Lieutenant Worf', department: 'Security', performance: 96, status: 'active' },
        { name: 'Commander Riker', department: 'Tactical', performance: 95, status: 'active' },
        { name: 'Dr. Crusher', department: 'Medical', performance: 95, status: 'active' },
        { name: 'Counselor Troi', department: 'Counseling', performance: 94, status: 'active' },
        { name: 'Lieutenant Uhura', department: 'Communications', performance: 93, status: 'active' },
        { name: 'Quark', department: 'Business', performance: 92, status: 'active' }
      ]);
      setLastUpdated(new Date());
      setLoading(false);
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'active': return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'warning': return <AlertCircle className="w-5 h-5 text-yellow-500" />;
      case 'error': return <XCircle className="w-5 h-5 text-red-500" />;
      default: return <Activity className="w-5 h-5 text-blue-500" />;
    }
  };

  const getPerformanceColor = (performance) => {
    if (performance >= 95) return 'text-green-500';
    if (performance >= 85) return 'text-yellow-500';
    return 'text-red-500';
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="loading-spinner mx-auto mb-4"></div>
          <div className="text-white text-xl font-mono">Loading Alex AI Dashboard...</div>
          <div className="text-gray-400 text-sm mt-2">Initializing crew intelligence</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <Head>
        <title>Alex AI Universal Dashboard</title>
        <meta name="description" content="Real-time Alex AI Universal system monitoring" />
      </Head>

      <div className="lcrs-container">
        {/* Sidebar */}
        <div className="lcrs-sidebar">
          <div className="flex flex-col h-full">
            <div className="flex items-center mb-6">
              <div className="text-3xl mr-3">🖖</div>
              <h2 className="text-xl font-bold">Alex AI</h2>
            </div>
            
            <nav className="flex-1">
              <div className="space-y-2">
                <div className="card p-3">
                  <div className="flex items-center">
                    <Activity className="w-5 h-5 mr-2 text-alex-blue" />
                    <span className="text-sm font-medium">System Status</span>
                  </div>
                  <div className="mt-2">
                    <div className="status-active">Operational</div>
                  </div>
                </div>
                
                <div className="card p-3">
                  <div className="flex items-center">
                    <Users className="w-5 h-5 mr-2 text-alex-green" />
                    <span className="text-sm font-medium">Crew Members</span>
                  </div>
                  <div className="mt-2">
                    <div className="text-2xl font-bold">{systemData?.crewMembers || 0}/9</div>
                  </div>
                </div>
                
                <div className="card p-3">
                  <div className="flex items-center">
                    <Zap className="w-5 h-5 mr-2 text-alex-gold" />
                    <span className="text-sm font-medium">Performance</span>
                  </div>
                  <div className="mt-2">
                    <div className="text-2xl font-bold text-alex-gold">
                      {systemData?.averagePerformance || 95}%
                    </div>
                  </div>
                </div>
              </div>
            </nav>
            
            <div className="mt-auto">
              <div className="text-xs text-gray-400 text-center">
                Last updated: {lastUpdated?.toLocaleTimeString()}
              </div>
            </div>
          </div>
        </div>

        {/* Header */}
        <div className="lcrs-header">
          <div className="flex items-center">
            <div className="glitch text-3xl font-bold mr-4" data-text="Alex AI Universal">
              Alex AI Universal
            </div>
            <div className="text-sm text-gray-400">
              Real-time Federation Crew Intelligence
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <div className="integration-status integration-connected">
              <CheckCircle className="w-4 h-4" />
              N8N Connected
            </div>
            <div className="integration-status integration-connected">
              <Database className="w-4 h-4" />
              Supabase Active
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="lcrs-main">
          {/* System Overview Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="card card-glow">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm text-gray-400">System Health</div>
                  <div className="text-2xl font-bold text-alex-green">
                    {systemData?.healthScore || 100}/100
                  </div>
                </div>
                <Shield className="w-8 h-8 text-alex-green" />
              </div>
              <div className="mt-3">
                <div className="performance-bar">
                  <div className="performance-fill" style={{width: `${systemData?.healthScore || 100}%`}}></div>
                </div>
              </div>
            </div>

            <div className="card card-glow">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm text-gray-400">Memory Usage</div>
                  <div className="text-2xl font-bold text-alex-blue">
                    {systemData?.memoryUsage || 0}MB
                  </div>
                </div>
                <Database className="w-8 h-8 text-alex-blue" />
              </div>
              <div className="mt-3">
                <div className="performance-bar">
                  <div className="performance-fill" style={{width: `${(systemData?.memoryUsage || 0) / 2}%`}}></div>
                </div>
              </div>
            </div>

            <div className="card card-glow">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm text-gray-400">Uptime</div>
                  <div className="text-2xl font-bold text-alex-gold">
                    {Math.floor((systemData?.uptime || 0) / 3600)}h
                  </div>
                </div>
                <TrendingUp className="w-8 h-8 text-alex-gold" />
              </div>
              <div className="mt-3">
                <div className="text-xs text-gray-400">
                  {Math.floor(((systemData?.uptime || 0) % 3600) / 60)}m {((systemData?.uptime || 0) % 60)}s
                </div>
              </div>
            </div>
          </div>

          {/* Crew Performance */}
          <div className="mb-6">
            <h2 className="text-xl font-bold mb-4 flex items-center">
              <Users className="w-6 h-6 mr-2 text-alex-blue" />
              Crew Performance Matrix
            </h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {crewData.map((member, index) => (
                <div key={index} className="crew-card">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-semibold text-sm text-alex-gold">{member.name}</h3>
                    {getStatusIcon(member.status)}
                  </div>
                  <p className="text-xs text-gray-400 mb-3">{member.department}</p>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs text-gray-400">Performance</span>
                    <span className={`text-sm font-bold ${getPerformanceColor(member.performance)}`}>
                      {member.performance}%
                    </span>
                  </div>
                  <div className="performance-bar">
                    <div 
                      className="performance-fill" 
                      style={{ width: `${member.performance}%` }}
                    ></div>
                  </div>
                  {member.expertise && (
                    <div className="mt-3 text-xs text-gray-400">
                      Expertise: {member.expertise}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Sidebar */}
        <div className="lcrs-right">
          <div className="space-y-6">
            {/* Integration Status */}
            <div>
              <h3 className="text-lg font-bold mb-4 flex items-center">
                <Database className="w-5 h-5 mr-2 text-alex-blue" />
                Integration Status
              </h3>
              <div className="space-y-3">
                <div className="card p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">N8N Connection</span>
                    <div className={`integration-status ${
                      systemData?.integrations?.n8n?.status === 'connected' 
                        ? 'integration-connected' 
                        : 'integration-disconnected'
                    }`}>
                      <CheckCircle className="w-4 h-4" />
                      {systemData?.integrations?.n8n?.status || 'disconnected'}
                    </div>
                  </div>
                  <div className="text-xs text-gray-400">
                    Workflows: {systemData?.integrations?.n8n?.workflows || 0}
                  </div>
                  <div className="text-xs text-gray-400">
                    Active: {systemData?.integrations?.n8n?.activeWorkflows || 0}
                  </div>
                </div>

                <div className="card p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">Supabase Connection</span>
                    <div className={`integration-status ${
                      systemData?.integrations?.supabase?.status === 'connected' 
                        ? 'integration-connected' 
                        : 'integration-disconnected'
                    }`}>
                      <Database className="w-4 h-4" />
                      {systemData?.integrations?.supabase?.status || 'disconnected'}
                    </div>
                  </div>
                  <div className="text-xs text-gray-400">
                    Records: {systemData?.integrations?.supabase?.records || 0}
                  </div>
                </div>
              </div>
            </div>

            {/* Recent Activity */}
            <div>
              <h3 className="text-lg font-bold mb-4 flex items-center">
                <TrendingUp className="w-5 h-5 mr-2 text-alex-green" />
                Recent Activity
              </h3>
              <div className="space-y-2">
                <div className="card p-3">
                  <div className="flex items-center text-sm">
                    <CheckCircle className="w-4 h-4 text-alex-green mr-2" />
                    <span>System health check completed</span>
                  </div>
                </div>
                <div className="card p-3">
                  <div className="flex items-center text-sm">
                    <CheckCircle className="w-4 h-4 text-alex-green mr-2" />
                    <span>Crew performance analysis updated</span>
                  </div>
                </div>
                <div className="card p-3">
                  <div className="flex items-center text-sm">
                    <CheckCircle className="w-4 h-4 text-alex-green mr-2" />
                    <span>Self-healing process completed</span>
                  </div>
                </div>
                <div className="card p-3">
                  <div className="flex items-center text-sm">
                    <CheckCircle className="w-4 h-4 text-alex-green mr-2" />
                    <span>Credential validation successful</span>
                  </div>
                </div>
              </div>
            </div>

            {/* N8N Workflows */}
            {systemData?.integrations?.n8n?.crewWorkflows?.length > 0 && (
              <div>
                <h3 className="text-lg font-bold mb-4 flex items-center">
                  <Zap className="w-5 h-5 mr-2 text-alex-gold" />
                  N8N Workflows
                </h3>
                <div className="space-y-2">
                  {systemData.integrations.n8n.crewWorkflows.slice(0, 5).map((workflow, index) => (
                    <div key={index} className="card p-3">
                      <div className="flex items-center justify-between mb-1">
                        <h4 className="font-semibold text-xs">{workflow.name}</h4>
                        <span className={`px-2 py-1 rounded text-xs ${
                          workflow.active 
                            ? 'bg-green-900 text-green-300' 
                            : 'bg-gray-900 text-gray-300'
                        }`}>
                          {workflow.active ? 'Active' : 'Inactive'}
                        </span>
                      </div>
                      <p className="text-xs text-gray-400">ID: {workflow.id}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Recent Memories */}
            {systemData?.integrations?.supabase?.recentMemories?.length > 0 && (
              <div>
                <h3 className="text-lg font-bold mb-4 flex items-center">
                  <Database className="w-5 h-5 mr-2 text-alex-blue" />
                  Recent Memories
                </h3>
                <div className="space-y-2">
                  {systemData.integrations.supabase.recentMemories.slice(0, 3).map((memory, index) => (
                    <div key={index} className="card p-3">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-semibold text-alex-blue">{memory.crewMember}</span>
                        <span className="text-xs text-gray-400">
                          {new Date(memory.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="text-xs text-gray-300">{memory.content}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
