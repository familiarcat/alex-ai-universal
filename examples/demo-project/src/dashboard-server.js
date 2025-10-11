/**
 * Alex AI Configuration Dashboard Server
 * 
 * Real-time dashboard for configuring and manipulating website elements
 * with crew-driven intelligence and validation.
 */

const http = require('http');
const fs = require('fs');
const path = require('path');
const { WebSocketServer } = require('ws');

class AlexAIDashboardServer {
  constructor(port = 3001) {
    this.port = port;
    this.server = null;
    this.wss = null;
    this.connectedClients = new Set();
    this.configurationStore = new Map();
    this.crewMembers = new Map();
    
    this.initializeCrewMembers();
  }

  /**
   * Initialize crew members
   */
  initializeCrewMembers() {
    const crewData = [
      {
        id: 'picard',
        name: 'Captain Jean-Luc Picard',
        role: 'Strategic Commander',
        expertise: ['strategic_planning', 'mission_coordination', 'decision_making'],
        validationAreas: ['content', 'design', 'layout'],
        avatar: '🖖'
      },
      {
        id: 'riker',
        name: 'Commander William Riker',
        role: 'First Officer',
        expertise: ['tactical_operations', 'workflow_management', 'execution'],
        validationAreas: ['layout', 'component', 'performance'],
        avatar: '👤'
      },
      {
        id: 'data',
        name: 'Commander Data',
        role: 'Operations Officer',
        expertise: ['technical_architecture', 'ai_ml_integration', 'data_processing'],
        validationAreas: ['component', 'performance', 'security'],
        avatar: '🤖'
      },
      {
        id: 'laforge',
        name: 'Lieutenant Commander Geordi La Forge',
        role: 'Chief Engineer',
        expertise: ['engineering_solutions', 'infrastructure', 'system_integration'],
        validationAreas: ['component', 'performance', 'security'],
        avatar: '🔧'
      },
      {
        id: 'worf',
        name: 'Lieutenant Worf',
        role: 'Security Officer',
        expertise: ['security_protocols', 'threat_assessment', 'compliance'],
        validationAreas: ['security', 'performance'],
        avatar: '🛡️'
      },
      {
        id: 'troi',
        name: 'Counselor Deanna Troi',
        role: 'Ship\'s Counselor',
        expertise: ['user_experience', 'communication', 'team_dynamics'],
        validationAreas: ['content', 'design', 'layout'],
        avatar: '💭'
      },
      {
        id: 'crusher',
        name: 'Dr. Beverly Crusher',
        role: 'Chief Medical Officer',
        expertise: ['system_health', 'diagnostics', 'performance_monitoring'],
        validationAreas: ['performance', 'security'],
        avatar: '🏥'
      },
      {
        id: 'uhura',
        name: 'Lieutenant Uhura',
        role: 'Communications Officer',
        expertise: ['communication_protocols', 'synchronization', 'integration'],
        validationAreas: ['content', 'component'],
        avatar: '📡'
      },
      {
        id: 'quark',
        name: 'Quark',
        role: 'Business Operations',
        expertise: ['cost_optimization', 'efficiency_analysis', 'business_metrics'],
        validationAreas: ['content', 'performance'],
        avatar: '💰'
      }
    ];

    crewData.forEach(member => {
      this.crewMembers.set(member.id, member);
    });

    console.log(`👥 ${this.crewMembers.size} crew members initialized for dashboard`);
  }

  /**
   * Start the dashboard server
   */
  start() {
    return new Promise((resolve, reject) => {
      try {
        // Create HTTP server
        this.server = http.createServer((req, res) => {
          this.handleRequest(req, res);
        });

        // Create WebSocket server
        this.wss = new WebSocketServer({ server: this.server });

        // Handle WebSocket connections
        this.wss.on('connection', (ws) => {
          console.log('📡 New dashboard client connected');
          this.connectedClients.add(ws);

          ws.on('message', (data) => {
            this.handleWebSocketMessage(ws, data);
          });

          ws.on('close', () => {
            console.log('📡 Dashboard client disconnected');
            this.connectedClients.delete(ws);
          });

          // Send initial dashboard data
          ws.send(JSON.stringify({
            type: 'dashboard_initialized',
            data: this.getDashboardData()
          }));
        });

        // Start server
        this.server.listen(this.port, (err) => {
          if (err) {
            reject(err);
            return;
          }
          
          console.log(`🖖 Alex AI Configuration Dashboard running on http://localhost:${this.port}`);
          console.log(`📡 WebSocket server ready for real-time communication`);
          resolve();
        });

      } catch (error) {
        reject(error);
      }
    });
  }

  /**
   * Handle HTTP requests
   */
  handleRequest(req, res) {
    const url = new URL(req.url, `http://${req.headers.host}`);
    const pathname = url.pathname;

    // CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    if (req.method === 'OPTIONS') {
      res.writeHead(200);
      res.end();
      return;
    }

    // Route handling
    if (pathname === '/') {
      this.serveDashboard(res);
    } else if (pathname === '/api/dashboard') {
      this.getDashboardData(req, res);
    } else if (pathname === '/api/crew') {
      this.getCrewData(req, res);
    } else if (pathname === '/api/configurations') {
      this.getConfigurations(req, res);
    } else if (pathname === '/api/update' && req.method === 'POST') {
      this.handleConfigurationUpdate(req, res);
    } else if (pathname.startsWith('/static/')) {
      this.serveStaticFile(pathname, res);
    } else {
      res.writeHead(404, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Not found' }));
    }
  }

  /**
   * Serve dashboard HTML
   */
  serveDashboard(res) {
    const dashboardHTML = this.generateDashboardHTML();
    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.end(dashboardHTML);
  }

  /**
   * Generate dashboard HTML
   */
  generateDashboardHTML() {
    return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>🖖 Alex AI Configuration Dashboard</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background: linear-gradient(135deg, #0c1445 0%, #1a237e 50%, #283593 100%);
            color: white;
            min-height: 100vh;
            line-height: 1.6;
        }

        .dashboard-container {
            max-width: 1400px;
            margin: 0 auto;
            padding: 20px;
        }

        .dashboard-header {
            text-align: center;
            margin-bottom: 30px;
            padding: 20px;
            background: rgba(255, 255, 255, 0.1);
            border-radius: 15px;
            backdrop-filter: blur(10px);
        }

        .dashboard-title {
            font-size: 2.5rem;
            font-weight: bold;
            margin-bottom: 10px;
            text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.3);
        }

        .dashboard-subtitle {
            font-size: 1.2rem;
            opacity: 0.9;
        }

        .dashboard-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 20px;
            margin-bottom: 30px;
        }

        .dashboard-panel {
            background: rgba(255, 255, 255, 0.1);
            border-radius: 15px;
            padding: 25px;
            backdrop-filter: blur(10px);
            border: 1px solid rgba(255, 255, 255, 0.2);
        }

        .panel-title {
            font-size: 1.5rem;
            font-weight: bold;
            margin-bottom: 20px;
            display: flex;
            align-items: center;
            gap: 10px;
        }

        .crew-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
            gap: 15px;
            margin-bottom: 20px;
        }

        .crew-member {
            background: rgba(255, 255, 255, 0.1);
            border-radius: 10px;
            padding: 15px;
            border: 1px solid rgba(255, 255, 255, 0.2);
        }

        .crew-header {
            display: flex;
            align-items: center;
            gap: 10px;
            margin-bottom: 10px;
        }

        .crew-avatar {
            font-size: 1.5rem;
        }

        .crew-name {
            font-weight: bold;
            font-size: 1.1rem;
        }

        .crew-role {
            font-size: 0.9rem;
            opacity: 0.8;
            margin-bottom: 8px;
        }

        .crew-expertise {
            font-size: 0.85rem;
            opacity: 0.9;
        }

        .control-panel {
            grid-column: 1 / -1;
        }

        .control-section {
            margin-bottom: 25px;
        }

        .control-section h3 {
            margin-bottom: 15px;
            font-size: 1.3rem;
        }

        .control-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 15px;
        }

        .control-item {
            background: rgba(255, 255, 255, 0.1);
            border-radius: 8px;
            padding: 15px;
            border: 1px solid rgba(255, 255, 255, 0.2);
        }

        .control-item label {
            display: block;
            margin-bottom: 8px;
            font-weight: bold;
        }

        .control-item input, .control-item select, .control-item textarea {
            width: 100%;
            padding: 8px;
            border: none;
            border-radius: 5px;
            background: rgba(255, 255, 255, 0.9);
            color: #333;
        }

        .control-item textarea {
            min-height: 80px;
            resize: vertical;
        }

        .btn {
            background: linear-gradient(45deg, #ff6b6b, #ee5a24);
            color: white;
            border: none;
            padding: 12px 24px;
            border-radius: 8px;
            cursor: pointer;
            font-weight: bold;
            transition: all 0.3s ease;
        }

        .btn:hover {
            transform: translateY(-2px);
            box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3);
        }

        .status-indicator {
            display: inline-block;
            width: 12px;
            height: 12px;
            border-radius: 50%;
            margin-right: 8px;
        }

        .status-active {
            background: #4CAF50;
            box-shadow: 0 0 10px rgba(76, 175, 80, 0.5);
        }

        .status-inactive {
            background: #f44336;
        }

        .real-time-preview {
            background: rgba(255, 255, 255, 0.1);
            border-radius: 15px;
            padding: 25px;
            backdrop-filter: blur(10px);
            border: 1px solid rgba(255, 255, 255, 0.2);
        }

        .preview-frame {
            width: 100%;
            height: 400px;
            border: 2px solid rgba(255, 255, 255, 0.3);
            border-radius: 10px;
            background: white;
        }

        .connection-status {
            position: fixed;
            top: 20px;
            right: 20px;
            background: rgba(0, 0, 0, 0.8);
            padding: 10px 15px;
            border-radius: 8px;
            font-size: 0.9rem;
        }

        .log-container {
            background: rgba(0, 0, 0, 0.3);
            border-radius: 8px;
            padding: 15px;
            max-height: 200px;
            overflow-y: auto;
            font-family: 'Courier New', monospace;
            font-size: 0.85rem;
        }

        .log-entry {
            margin-bottom: 5px;
            padding: 2px 0;
        }

        .log-success { color: #4CAF50; }
        .log-warning { color: #ff9800; }
        .log-error { color: #f44336; }
        .log-info { color: #2196F3; }
    </style>
</head>
<body>
    <div class="connection-status">
        <span class="status-indicator" id="connectionStatus"></span>
        <span id="connectionText">Connecting...</span>
    </div>

    <div class="dashboard-container">
        <div class="dashboard-header">
            <div class="dashboard-title">🖖 Alex AI Configuration Dashboard</div>
            <div class="dashboard-subtitle">Real-time Website Manipulation with Crew Intelligence</div>
        </div>

        <div class="dashboard-grid">
            <div class="dashboard-panel">
                <div class="panel-title">
                    👥 Crew Status
                </div>
                <div class="crew-grid" id="crewGrid">
                    <!-- Crew members will be populated here -->
                </div>
            </div>

            <div class="dashboard-panel">
                <div class="panel-title">
                    📊 System Status
                </div>
                <div id="systemStatus">
                    <p><span class="status-indicator status-active"></span>Dashboard: Active</p>
                    <p><span class="status-indicator status-active"></span>WebSocket: Connected</p>
                    <p><span class="status-indicator status-active"></span>Real-time Updates: Enabled</p>
                    <p><span class="status-indicator status-active"></span>Crew Validation: Active</p>
                </div>
            </div>
        </div>

        <div class="dashboard-panel control-panel">
            <div class="panel-title">
                🎛️ Real-time Configuration Controls
            </div>

            <div class="control-section">
                <h3>🎨 Content Management</h3>
                <div class="control-grid">
                    <div class="control-item">
                        <label>Page Title</label>
                        <input type="text" id="pageTitle" placeholder="Enter page title">
                        <button class="btn" onclick="updateContent('title', 'pageTitle')">Update Title</button>
                    </div>
                    <div class="control-item">
                        <label>Main Heading</label>
                        <input type="text" id="mainHeading" placeholder="Enter main heading">
                        <button class="btn" onclick="updateContent('heading', 'mainHeading')">Update Heading</button>
                    </div>
                    <div class="control-item">
                        <label>Description</label>
                        <textarea id="description" placeholder="Enter description"></textarea>
                        <button class="btn" onclick="updateContent('description', 'description')">Update Description</button>
                    </div>
                </div>
            </div>

            <div class="control-section">
                <h3>🎨 Design Controls</h3>
                <div class="control-grid">
                    <div class="control-item">
                        <label>Background Color</label>
                        <input type="color" id="bgColor" value="#1e3c72">
                        <button class="btn" onclick="updateDesign('background', 'bgColor')">Update Background</button>
                    </div>
                    <div class="control-item">
                        <label>Text Color</label>
                        <input type="color" id="textColor" value="#ffffff">
                        <button class="btn" onclick="updateDesign('textColor', 'textColor')">Update Text</button>
                    </div>
                    <div class="control-item">
                        <label>Theme</label>
                        <select id="theme">
                            <option value="star-trek">Star Trek</option>
                            <option value="modern">Modern</option>
                            <option value="minimal">Minimal</option>
                            <option value="corporate">Corporate</option>
                        </select>
                        <button class="btn" onclick="updateDesign('theme', 'theme')">Apply Theme</button>
                    </div>
                </div>
            </div>

            <div class="control-section">
                <h3>🔧 Layout Controls</h3>
                <div class="control-grid">
                    <div class="control-item">
                        <label>Layout Style</label>
                        <select id="layout">
                            <option value="grid">Grid</option>
                            <option value="flex">Flexbox</option>
                            <option value="block">Block</option>
                        </select>
                        <button class="btn" onclick="updateLayout('style', 'layout')">Update Layout</button>
                    </div>
                    <div class="control-item">
                        <label>Component Visibility</label>
                        <select id="visibility">
                            <option value="show-all">Show All</option>
                            <option value="hide-sidebar">Hide Sidebar</option>
                            <option value="hide-footer">Hide Footer</option>
                        </select>
                        <button class="btn" onclick="updateLayout('visibility', 'visibility')">Update Visibility</button>
                    </div>
                </div>
            </div>
        </div>

        <div class="dashboard-panel real-time-preview">
            <div class="panel-title">
                🌐 Real-time Website Preview
            </div>
            <iframe id="websitePreview" class="preview-frame" src="http://localhost:3000"></iframe>
        </div>

        <div class="dashboard-panel">
            <div class="panel-title">
                📋 Activity Log
            </div>
            <div class="log-container" id="activityLog">
                <!-- Activity log entries will appear here -->
            </div>
        </div>
    </div>

    <script>
        let ws;
        let isConnected = false;

        // Initialize dashboard
        document.addEventListener('DOMContentLoaded', function() {
            initializeDashboard();
            connectWebSocket();
            loadCrewMembers();
        });

        // Initialize dashboard
        function initializeDashboard() {
            logActivity('🖖 Alex AI Configuration Dashboard initialized', 'info');
        }

        // Connect to WebSocket
        function connectWebSocket() {
            ws = new WebSocket('ws://localhost:3001');
            
            ws.onopen = function() {
                isConnected = true;
                updateConnectionStatus(true);
                logActivity('📡 Connected to real-time server', 'success');
            };

            ws.onmessage = function(event) {
                const data = JSON.parse(event.data);
                handleWebSocketMessage(data);
            };

            ws.onclose = function() {
                isConnected = false;
                updateConnectionStatus(false);
                logActivity('📡 Connection lost', 'warning');
                
                // Attempt to reconnect
                setTimeout(connectWebSocket, 3000);
            };

            ws.onerror = function(error) {
                logActivity('📡 WebSocket error: ' + error, 'error');
            };
        }

        // Update connection status
        function updateConnectionStatus(connected) {
            const statusIndicator = document.getElementById('connectionStatus');
            const statusText = document.getElementById('connectionText');
            
            if (connected) {
                statusIndicator.className = 'status-indicator status-active';
                statusText.textContent = 'Connected';
            } else {
                statusIndicator.className = 'status-indicator status-inactive';
                statusText.textContent = 'Disconnected';
            }
        }

        // Handle WebSocket messages
        function handleWebSocketMessage(data) {
            switch(data.type) {
                case 'dashboard_initialized':
                    logActivity('🎯 Dashboard data received', 'success');
                    break;
                case 'configuration_updated':
                    logActivity('🔧 Configuration updated: ' + data.data.type, 'success');
                    refreshWebsitePreview();
                    break;
                case 'crew_validation':
                    logActivity('👥 Crew validation: ' + data.data.crewMember, 'info');
                    break;
                default:
                    logActivity('📡 Received: ' + data.type, 'info');
            }
        }

        // Load crew members
        async function loadCrewMembers() {
            try {
                const response = await fetch('/api/crew');
                const crewData = await response.json();
                
                const crewGrid = document.getElementById('crewGrid');
                crewGrid.innerHTML = '';
                
                crewData.forEach(member => {
                    const crewElement = document.createElement('div');
                    crewElement.className = 'crew-member';
                    crewElement.innerHTML = \`
                        <div class="crew-header">
                            <span class="crew-avatar">\${member.avatar}</span>
                            <span class="crew-name">\${member.name}</span>
                        </div>
                        <div class="crew-role">\${member.role}</div>
                        <div class="crew-expertise">Expertise: \${member.expertise.join(', ')}</div>
                    \`;
                    crewGrid.appendChild(crewElement);
                });
                
                logActivity(\`👥 Loaded \${crewData.length} crew members\`, 'success');
            } catch (error) {
                logActivity('❌ Failed to load crew members: ' + error, 'error');
            }
        }

        // Update content
        function updateContent(type, elementId) {
            const element = document.getElementById(elementId);
            const value = element.value;
            
            if (!value.trim()) {
                logActivity('⚠️ Please enter a value for ' + type, 'warning');
                return;
            }

            const update = {
                type: 'content',
                target: type,
                changes: { value: value },
                timestamp: new Date().toISOString()
            };

            sendConfigurationUpdate(update);
        }

        // Update design
        function updateDesign(type, elementId) {
            const element = document.getElementById(elementId);
            const value = element.value;
            
            const update = {
                type: 'design',
                target: type,
                changes: { value: value },
                timestamp: new Date().toISOString()
            };

            sendConfigurationUpdate(update);
        }

        // Update layout
        function updateLayout(type, elementId) {
            const element = document.getElementById(elementId);
            const value = element.value;
            
            const update = {
                type: 'layout',
                target: type,
                changes: { value: value },
                timestamp: new Date().toISOString()
            };

            sendConfigurationUpdate(update);
        }

        // Send configuration update
        async function sendConfigurationUpdate(update) {
            try {
                const response = await fetch('/api/update', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(update)
                });

                if (response.ok) {
                    logActivity('✅ Configuration update sent: ' + update.type, 'success');
                    
                    // Send via WebSocket for real-time updates
                    if (ws && isConnected) {
                        ws.send(JSON.stringify({
                            type: 'configuration_update',
                            data: update
                        }));
                    }
                } else {
                    logActivity('❌ Failed to send configuration update', 'error');
                }
            } catch (error) {
                logActivity('❌ Error sending update: ' + error, 'error');
            }
        }

        // Refresh website preview
        function refreshWebsitePreview() {
            const preview = document.getElementById('websitePreview');
            preview.src = preview.src;
        }

        // Log activity
        function logActivity(message, type = 'info') {
            const logContainer = document.getElementById('activityLog');
            const logEntry = document.createElement('div');
            logEntry.className = 'log-entry log-' + type;
            logEntry.textContent = new Date().toLocaleTimeString() + ' - ' + message;
            
            logContainer.appendChild(logEntry);
            logContainer.scrollTop = logContainer.scrollHeight;
            
            // Keep only last 50 entries
            while (logContainer.children.length > 50) {
                logContainer.removeChild(logContainer.firstChild);
            }
        }
    </script>
</body>
</html>
    `;
  }

  /**
   * Get dashboard data
   */
  getDashboardData(req, res) {
    const data = {
      status: 'active',
      crewMembers: Array.from(this.crewMembers.values()),
      configurations: Array.from(this.configurationStore.values()),
      timestamp: new Date().toISOString()
    };

    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(data));
  }

  /**
   * Get crew data
   */
  getCrewData(req, res) {
    const crewData = Array.from(this.crewMembers.values());
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(crewData));
  }

  /**
   * Get configurations
   */
  getConfigurations(req, res) {
    const configurations = Array.from(this.configurationStore.values());
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(configurations));
  }

  /**
   * Handle configuration update
   */
  handleConfigurationUpdate(req, res) {
    let body = '';
    
    req.on('data', chunk => {
      body += chunk.toString();
    });
    
    req.on('end', () => {
      try {
        const update = JSON.parse(body);
        update.id = 'update_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
        update.source = 'dashboard';
        
        // Store configuration update
        this.configurationStore.set(update.id, update);
        
        // Broadcast to connected clients
        this.broadcastUpdate(update);
        
        console.log(`🔧 Configuration update received: ${update.type} for ${update.target}`);
        
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: true, updateId: update.id }));
        
      } catch (error) {
        console.error('❌ Error processing configuration update:', error);
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Invalid request' }));
      }
    });
  }

  /**
   * Handle WebSocket messages
   */
  handleWebSocketMessage(ws, data) {
    try {
      const message = JSON.parse(data);
      console.log('📡 Received WebSocket message:', message.type);
      
      // Handle different message types
      switch (message.type) {
        case 'configuration_update':
          this.handleRealTimeUpdate(message.data, ws);
          break;
        default:
          console.log('📡 Unknown message type:', message.type);
      }
    } catch (error) {
      console.error('❌ Error handling WebSocket message:', error);
    }
  }

  /**
   * Handle real-time update
   */
  handleRealTimeUpdate(update, ws) {
    console.log(`🔄 Processing real-time update: ${update.type}`);
    
    // Store the update
    this.configurationStore.set(update.id, update);
    
    // Broadcast to all connected clients
    this.broadcastUpdate(update);
    
    // Send confirmation back to sender
    ws.send(JSON.stringify({
      type: 'update_confirmed',
      updateId: update.id,
      timestamp: new Date().toISOString()
    }));
  }

  /**
   * Broadcast update to all connected clients
   */
  broadcastUpdate(update) {
    const message = JSON.stringify({
      type: 'configuration_updated',
      data: update
    });
    
    this.connectedClients.forEach(client => {
      if (client.readyState === 1) { // WebSocket.OPEN
        client.send(message);
      }
    });
    
    console.log(`📡 Broadcasted update to ${this.connectedClients.size} clients`);
  }

  /**
   * Serve static files
   */
  serveStaticFile(pathname, res) {
    const filePath = path.join(__dirname, pathname);
    
    fs.readFile(filePath, (err, data) => {
      if (err) {
        res.writeHead(404);
        res.end('File not found');
        return;
      }
      
      const ext = path.extname(filePath);
      const mimeTypes = {
        '.js': 'text/javascript',
        '.css': 'text/css',
        '.png': 'image/png',
        '.jpg': 'image/jpeg'
      };
      
      const contentType = mimeTypes[ext] || 'application/octet-stream';
      res.writeHead(200, { 'Content-Type': contentType });
      res.end(data);
    });
  }

  /**
   * Stop the server
   */
  stop() {
    return new Promise((resolve) => {
      if (this.wss) {
        this.wss.close();
      }
      
      if (this.server) {
        this.server.close(() => {
          console.log('🛑 Dashboard server stopped');
          resolve();
        });
      } else {
        resolve();
      }
    });
  }
}

// Export the class
module.exports = AlexAIDashboardServer;

// Start server if run directly
if (require.main === module) {
  const dashboard = new AlexAIDashboardServer(3001);
  
  dashboard.start().then(() => {
    console.log('✅ Alex AI Configuration Dashboard ready');
    console.log('🌐 Dashboard: http://localhost:3001');
    console.log('📡 WebSocket: ws://localhost:3001');
  }).catch(error => {
    console.error('❌ Failed to start dashboard:', error);
  });
}




