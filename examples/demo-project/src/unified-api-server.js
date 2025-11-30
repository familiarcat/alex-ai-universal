#!/usr/bin/env node

/**
 * Unified API Server for Demo Project Integration
 * Provides API endpoints for Next.js unified dashboard
 */

const http = require('http');
const url = require('url');
const { WebSocketServer } = require('ws');

class UnifiedAPIServer {
  constructor(port = 3001) {
    this.port = port;
    this.server = null;
    this.wss = null;
    this.clients = new Set();
    
    // Crew members data
    this.crewMembers = [
      {
        id: 'picard',
        name: 'Captain Jean-Luc Picard',
        role: 'Strategic Commander',
        status: 'active',
        component: 'Unified Dashboard',
        expertise: ['Strategic Leadership', 'System Integration', 'Decision Making']
      },
      {
        id: 'riker',
        name: 'Commander William Riker',
        role: 'First Officer',
        status: 'active',
        component: 'Operations Control',
        expertise: ['Tactical Operations', 'Workflow Management', 'Execution']
      },
      {
        id: 'data',
        name: 'Commander Data',
        role: 'Operations Officer',
        status: 'active',
        component: 'Data Processing',
        expertise: ['Analytics', 'Logic', 'Data Processing', 'AI/ML']
      },
      {
        id: 'laforge',
        name: 'Lieutenant Commander Geordi La Forge',
        role: 'Chief Engineer',
        status: 'active',
        component: 'System Architecture',
        expertise: ['Infrastructure', 'System Integration', 'Technical Solutions']
      },
      {
        id: 'worf',
        name: 'Lieutenant Worf',
        role: 'Security Officer',
        status: 'active',
        component: 'Security Monitor',
        expertise: ['Security Protocols', 'Threat Assessment', 'Compliance']
      },
      {
        id: 'troi',
        name: 'Counselor Deanna Troi',
        role: 'Ship\'s Counselor',
        status: 'active',
        component: 'User Experience',
        expertise: ['User Experience', 'Communication', 'Team Dynamics']
      },
      {
        id: 'crusher',
        name: 'Dr. Beverly Crusher',
        role: 'Chief Medical Officer',
        status: 'active',
        component: 'System Health',
        expertise: ['System Health', 'Diagnostics', 'Wellness']
      },
      {
        id: 'uhura',
        name: 'Lieutenant Uhura',
        role: 'Communications Officer',
        status: 'active',
        component: 'Communication Hub',
        expertise: ['Communication Protocols', 'Synchronization', 'Integration']
      },
      {
        id: 'quark',
        name: 'Quark',
        role: 'Business Operations',
        status: 'active',
        component: 'Resource Management',
        expertise: ['Cost Optimization', 'Efficiency Analysis', 'Business Metrics']
      }
    ];

    this.systemStatus = {
      server: 'online',
      connections: 0,
      lastUpdate: new Date().toISOString()
    };

    this.config = {
      theme: 'star-trek',
      title: '🖖 Alex AI Universal',
      subtitle: 'Unified Dashboard Integration',
      description: 'Advanced control panel with crew intelligence monitoring and real-time synchronization.'
    };
  }

  start() {
    this.server = http.createServer((req, res) => {
      this.handleRequest(req, res);
    });

    // WebSocket server for real-time updates
    this.wss = new WebSocketServer({ server: this.server });

    this.wss.on('connection', (ws) => {
      console.log('🖖 Unified API WebSocket client connected');
      this.clients.add(ws);
      this.systemStatus.connections = this.clients.size;

      ws.on('close', () => {
        console.log('Unified API WebSocket client disconnected');
        this.clients.delete(ws);
        this.systemStatus.connections = this.clients.size;
      });

      ws.on('error', (error) => {
        console.error('WebSocket error:', error);
        this.clients.delete(ws);
        this.systemStatus.connections = this.clients.size;
      });

      // Send initial data
      ws.send(JSON.stringify({
        type: 'dashboard-update',
        payload: {
          crewMembers: this.crewMembers,
          systemStatus: this.systemStatus,
          theme: this.config.theme,
          config: this.config
        }
      }));
    });

    this.server.listen(this.port, () => {
      console.log(`🖖 Unified API Server running on http://localhost:${this.port}`);
      console.log(`📡 WebSocket server ready for real-time updates`);
      console.log(`🎛️ Dashboard API: http://localhost:${this.port}/api/dashboard`);
      console.log(`👥 Crew Status API: http://localhost:${this.port}/api/crew-status`);
      console.log(`🏥 Health API: http://localhost:${this.port}/api/health`);
      console.log(`🌐 Live Preview: http://localhost:${this.port}/live`);
    });

    // Send periodic updates
    setInterval(() => {
      this.broadcastUpdate();
    }, 5000);
  }

  handleRequest(req, res) {
    const parsedUrl = url.parse(req.url, true);
    const path = parsedUrl.pathname;
    const method = req.method;

    // Set CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    if (method === 'OPTIONS') {
      res.writeHead(200);
      res.end();
      return;
    }

    // API Routes
    if (path === '/api/dashboard') {
      this.handleDashboardAPI(req, res);
    } else if (path === '/api/crew-status') {
      this.handleCrewStatusAPI(req, res);
    } else if (path === '/api/health') {
      this.handleHealthAPI(req, res);
    } else if (path === '/api/config') {
      this.handleConfigAPI(req, res);
    } else if (path === '/api/actions') {
      this.handleActionsAPI(req, res);
    } else if (path === '/live') {
      this.handleLivePreview(req, res);
    } else {
      this.handle404(req, res);
    }
  }

  handleDashboardAPI(req, res) {
    if (req.method !== 'GET') {
      res.writeHead(405, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Method not allowed' }));
      return;
    }

    const data = {
      crewMembers: this.crewMembers,
      systemStatus: this.systemStatus,
      theme: this.config.theme,
      config: this.config
    };

    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(data));
  }

  handleCrewStatusAPI(req, res) {
    if (req.method !== 'GET') {
      res.writeHead(405, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Method not allowed' }));
      return;
    }

    const crewStatus = this.crewMembers.map(member => ({
      id: member.id,
      name: member.name,
      role: member.role,
      status: member.status,
      lastActivity: new Date().toISOString(),
      component: member.component
    }));

    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ crewStatus, timestamp: new Date().toISOString() }));
  }

  handleHealthAPI(req, res) {
    if (req.method !== 'GET') {
      res.writeHead(405, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Method not allowed' }));
      return;
    }

    const health = {
      status: 'healthy',
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      connections: this.systemStatus.connections,
      timestamp: new Date().toISOString()
    };

    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(health));
  }

  handleConfigAPI(req, res) {
    if (req.method !== 'POST') {
      res.writeHead(405, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Method not allowed' }));
      return;
    }

    let body = '';
    req.on('data', chunk => {
      body += chunk.toString();
    });

    req.on('end', () => {
      try {
        const newConfig = JSON.parse(body);
        this.config = { ...this.config, ...newConfig };
        
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: true, config: this.config }));
        
        // Broadcast config update
        this.broadcastUpdate();
      } catch (error) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Invalid JSON' }));
      }
    });
  }

  handleActionsAPI(req, res) {
    if (req.method !== 'POST') {
      res.writeHead(405, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Method not allowed' }));
      return;
    }

    let body = '';
    req.on('data', chunk => {
      body += chunk.toString();
    });

    req.on('end', () => {
      try {
        const action = JSON.parse(body);
        
        // Handle different actions
        switch (action.type) {
          case 'crew-status-update':
            this.updateCrewStatus(action.data);
            break;
          case 'system-restart':
            this.restartSystem();
            break;
          case 'theme-change':
            this.changeTheme(action.theme);
            break;
          default:
            res.writeHead(400, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: 'Unknown action type' }));
            return;
        }
        
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: true, message: 'Action executed' }));
        
        // Broadcast update
        this.broadcastUpdate();
      } catch (error) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Invalid JSON' }));
      }
    });
  }

  handleLivePreview(req, res) {
    const html = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>🖖 Alex AI Live Frontend</title>
    <style>
        body {
            margin: 0;
            padding: 20px;
            background: linear-gradient(135deg, #2f2e8a 0%, #4c4c9d 100%);
            color: white;
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            min-height: 100vh;
        }
        .container {
            max-width: 1200px;
            margin: 0 auto;
        }
        .header {
            text-align: center;
            margin-bottom: 40px;
        }
        .status-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 20px;
            margin-bottom: 40px;
        }
        .status-card {
            background: rgba(255, 255, 255, 0.1);
            backdrop-filter: blur(10px);
            border: 1px solid rgba(255, 255, 255, 0.2);
            border-radius: 12px;
            padding: 20px;
            text-align: center;
        }
        .crew-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
            gap: 15px;
        }
        .crew-member {
            background: rgba(255, 255, 255, 0.05);
            border: 1px solid rgba(255, 255, 255, 0.1);
            border-radius: 8px;
            padding: 15px;
            text-align: center;
        }
        .status-indicator {
            width: 10px;
            height: 10px;
            border-radius: 50%;
            background: #00ff88;
            margin: 0 auto 10px;
            animation: pulse 2s infinite;
        }
        @keyframes pulse {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.5; }
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🖖 Alex AI Live Frontend</h1>
            <p>Enhanced Interactive Dashboard - Unified Integration</p>
            <div style="background: #00ff88; color: #000; padding: 10px 20px; border-radius: 8px; display: inline-block; margin-top: 10px;">
                <strong>UNIFIED SYSTEM ACTIVE</strong>
            </div>
        </div>

        <div class="status-grid">
            <div class="status-card">
                <div class="status-indicator"></div>
                <h3>System Status</h3>
                <p>Online & Connected</p>
            </div>
            <div class="status-card">
                <h3>Active Connections</h3>
                <p>${this.systemStatus.connections}</p>
            </div>
            <div class="status-card">
                <h3>Crew Members</h3>
                <p>${this.crewMembers.length}</p>
            </div>
            <div class="status-card">
                <h3>Last Update</h3>
                <p>${new Date().toLocaleTimeString()}</p>
            </div>
        </div>

        <div class="status-card">
            <h3>👥 Crew Status</h3>
            <div class="crew-grid">
                ${this.crewMembers.map(member => `
                    <div class="crew-member">
                        <div class="status-indicator"></div>
                        <strong>${member.name}</strong><br>
                        <small>${member.role}</small>
                    </div>
                `).join('')}
            </div>
        </div>
    </div>

    <script>
        // Auto-refresh every 5 seconds
        setTimeout(() => {
            window.location.reload();
        }, 5000);
    </script>
</body>
</html>`;

    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.end(html);
  }

  handle404(req, res) {
    res.writeHead(404, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Not found' }));
  }

  updateCrewStatus(data) {
    const member = this.crewMembers.find(m => m.id === data.id);
    if (member) {
      member.status = data.status;
      member.lastActivity = new Date().toISOString();
    }
  }

  changeTheme(theme) {
    this.config.theme = theme;
  }

  restartSystem() {
    console.log('🔄 System restart requested');
    // In a real implementation, this would restart the system
  }

  broadcastUpdate() {
    const data = {
      type: 'dashboard-update',
      payload: {
        crewMembers: this.crewMembers,
        systemStatus: this.systemStatus,
        theme: this.config.theme,
        config: this.config
      }
    };

    this.clients.forEach(client => {
      if (client.readyState === client.OPEN) {
        client.send(JSON.stringify(data));
      }
    });
  }

  stop() {
    if (this.server) {
      this.server.close();
      console.log('🖖 Unified API Server stopped');
    }
  }
}

// Start server if run directly
if (require.main === module) {
  const server = new UnifiedAPIServer();
  server.start();

  // Graceful shutdown
  process.on('SIGINT', () => {
    console.log('\n🖖 Shutting down Unified API Server...');
    server.stop();
    process.exit(0);
  });
}

module.exports = UnifiedAPIServer;


