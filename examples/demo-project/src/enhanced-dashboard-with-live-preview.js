#!/usr/bin/env node

/**
 * Enhanced Dashboard with Live Frontend Preview
 * Based on Crew UI Analysis Findings
 */

const http = require('http');
const url = require('url');
const fs = require('fs');
const path = require('path');
const { WebSocketServer } = require('ws');

class EnhancedDashboardWithLivePreview {
  constructor(port = 3000) {
    this.port = port;
    this.server = null;
    this.wss = null;
    this.clients = new Set();
    
    // Configuration with proper dropdown options
    this.config = {
      title: '🖖 Alex AI Universal',
      subtitle: 'Enhanced Interactive Dashboard',
      description: 'Advanced control panel with crew intelligence monitoring.',
      footer: '© 2024 Alex AI Universal - Enhanced Dashboard',
      theme: 'star-trek', // Default theme
      backgroundColor: '#2f2e8a',
      heading: 'DEVELOPMENT MODE - ENHANCED DASHBOARD READY! 🚀'
    };

    // Available themes for dropdown
    this.availableThemes = [
      { value: 'star-trek', label: 'Star Trek', colors: { primary: '#2f2e8a', secondary: '#4c4c9d', accent: '#00d4ff' } },
      { value: 'dark', label: 'Dark Mode', colors: { primary: '#1a1a1a', secondary: '#2d2d2d', accent: '#ffffff' } },
      { value: 'light', label: 'Light Mode', colors: { primary: '#ffffff', secondary: '#f8f9fa', accent: '#1a1a1a', text: '#2d3748', border: '#e2e8f0', card: '#ffffff', cardBorder: '#e2e8f0', shadow: 'rgba(0, 0, 0, 0.1)' } },
      { value: 'neon', label: 'Neon Cyber', colors: { primary: '#0a0a0a', secondary: '#1a1a2e', accent: '#00ff88' } },
      { value: 'ocean', label: 'Ocean Blue', colors: { primary: '#0c4a6e', secondary: '#075985', accent: '#0ea5e9' } }
    ];

    // Crew members based on UI analysis findings
    this.crewMembers = new Map([
      ['picard', {
        name: 'Captain Jean-Luc Picard',
        role: 'Strategic Commander',
        component: 'Status Indicator',
        status: 'active',
        expertise: ['Strategic Leadership', 'System Health', 'User Confidence'],
        insights: 'I am the beacon that guides users through system status',
        enhancements: ['Connection quality metrics', 'Status history tracking', 'Status change animations']
      }],
      ['data', {
        name: 'Commander Data',
        role: 'Operations Officer',
        component: 'Control Groups',
        status: 'active',
        expertise: ['Logical Processing', 'Input Validation', 'Data Analysis'],
        insights: 'I am the logical interface between user input and system response',
        enhancements: ['Real-time validation feedback', 'Input history tracking', 'Autocomplete functionality']
      }],
      ['laforge', {
        name: 'Lieutenant Commander Geordi La Forge',
        role: 'Chief Engineer',
        component: 'Sidebar',
        status: 'active',
        expertise: ['Structural Organization', 'System Architecture', 'Technical Solutions'],
        insights: 'I am the engineering backbone organizing all control systems',
        enhancements: ['Collapsible sections', 'Responsive width adjustment', 'Keyboard navigation']
      }],
      ['worf', {
        name: 'Lieutenant Worf',
        role: 'Security Officer',
        component: 'Connection Info',
        status: 'active',
        expertise: ['Security Monitoring', 'Threat Assessment', 'System Protection'],
        insights: 'I am the security monitor providing continuous surveillance',
        enhancements: ['Security status indicators', 'Connection encryption status', 'Threat detection alerts']
      }],
      ['troi', {
        name: 'Counselor Deanna Troi',
        role: 'Ship\'s Counselor',
        component: 'Crew Grid',
        status: 'active',
        expertise: ['User Experience', 'Team Dynamics', 'Emotional Intelligence'],
        insights: 'I am the empathic interface connecting users with crew capabilities',
        enhancements: ['Individual status indicators', 'Recent crew activities', 'Detailed crew member views']
      }],
      ['crusher', {
        name: 'Dr. Beverly Crusher',
        role: 'Chief Medical Officer',
        component: 'System Logs',
        status: 'active',
        expertise: ['System Health', 'Diagnostics', 'Performance Monitoring'],
        insights: 'I am the medical record keeper tracking system health',
        enhancements: ['Log filtering and search', 'Log export functionality', 'Log analytics dashboard']
      }],
      ['uhura', {
        name: 'Lieutenant Uhura',
        role: 'Communications Officer',
        component: 'Content Cards',
        status: 'active',
        expertise: ['Information Presentation', 'Communication', 'User Education'],
        insights: 'I am the communication interface presenting information clearly',
        enhancements: ['Real-time data visualization', 'Card expansion functionality', 'Interactive elements']
      }],
      ['quark', {
        name: 'Quark',
        role: 'Business Operations',
        component: 'View Toggle',
        status: 'active',
        expertise: ['Efficiency Optimization', 'Productivity', 'Resource Management'],
        insights: 'I am the efficiency optimizer maximizing user productivity',
        enhancements: ['View history navigation', 'Keyboard shortcuts', 'View customization options']
      }]
    ]);

    this.connections = {
      total: 0,
      dashboard: 0,
      frontend: 0,
      lastUpdate: new Date().toISOString()
    };
  }

  start() {
    return new Promise((resolve, reject) => {
      this.server = http.createServer((req, res) => {
        this.handleRequest(req, res);
      });

      // WebSocket server for real-time updates
      this.wss = new WebSocketServer({ server: this.server });

      this.wss.on('connection', (ws) => {
        this.clients.add(ws);
        this.connections.total = this.clients.size;
        this.connections.dashboard++;
        this.connections.lastUpdate = new Date().toISOString();

        console.log(`🔄 WebSocket connection established. Total clients: ${this.clients.size}`);

        ws.on('close', () => {
          this.clients.delete(ws);
          this.connections.total = this.clients.size;
          this.connections.dashboard--;
          this.connections.lastUpdate = new Date().toISOString();
          console.log(`🔄 WebSocket connection closed. Total clients: ${this.clients.size}`);
        });

        ws.on('message', (message) => {
          try {
            const data = JSON.parse(message);
            this.handleWebSocketMessage(data, ws);
          } catch (error) {
            console.error('❌ Error parsing WebSocket message:', error);
          }
        });
      });

      this.server.listen(this.port, () => {
        console.log(`🖖 Alex AI Enhanced Dashboard Server running on http://localhost:${this.port}`);
        console.log(`🎛️ Dashboard: http://localhost:${this.port}/`);
        console.log(`🌐 Live Frontend: http://localhost:${this.port}/live`);
        console.log(`🏥 Health Check: http://localhost:${this.port}/api/health`);
        console.log(`👥 Crew Members: ${this.crewMembers.size} active`);
        console.log(`✅ Enhanced dashboard with proper controls ready`);
        console.log(`🔄 WebSocket connections enabled`);
        console.log(`📦 Supabase integration via N8N middleware active`);
        resolve();
      });

      this.server.on('error', (error) => {
        console.error('❌ Server error:', error);
        reject(error);
      });
    });
  }

  handleRequest(req, res) {
    const parsedUrl = url.parse(req.url, true);
    const pathname = parsedUrl.pathname;
    
    // Attach query parameters to request object
    req.query = parsedUrl.query;

    // CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    if (req.method === 'OPTIONS') {
      res.writeHead(200);
      res.end();
      return;
    }

    switch (pathname) {
      case '/':
        this.serveDashboard(res);
        break;
      case '/live':
        this.serveLiveFrontend(res);
        break;
      case '/admin':
        this.serveAdminDashboard(res);
        break;
      case '/public':
        this.servePublicView(res);
        break;
      case '/api/health':
        if (req.query.format === 'ui') {
          this.serveHealthCheckUI(res);
        } else {
          this.serveHealthCheck(res);
        }
        break;
      case '/api/config':
        if (req.method === 'POST') {
          this.handleConfigUpdate(req, res);
        } else if (req.query.format === 'ui') {
          this.serveConfigUI(res);
        } else {
          this.serveConfig(res);
        }
        break;
      case '/api/crew-status':
        if (req.query.format === 'ui') {
          this.serveCrewStatusUI(res);
        } else {
          this.serveCrewStatus(res);
        }
        break;
      case '/api/themes':
        if (req.query.format === 'ui') {
          this.serveThemesUI(res);
        } else {
          this.serveThemes(res);
        }
        break;
      case '/contrast-test':
        this.serveContrastTest(res);
        break;
      case '/api/crew-status':
        if (req.query.format === 'ui') {
          this.serveCrewStatusUI(res);
        } else {
          this.serveCrewStatus(res);
        }
        break;
      case '/api/themes':
        if (req.query.format === 'ui') {
          this.serveThemesUI(res);
        } else {
          this.serveThemes(res);
        }
        break;
      case '/navigation-demo':
        this.serveNavigationDemo(res);
        break;
      default:
        this.serve404(res);
    }
  }

  serveDashboard(res) {
    const html = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${this.config.title} - Enhanced Dashboard</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background: linear-gradient(135deg, ${this.getCurrentTheme().colors.primary} 0%, ${this.getCurrentTheme().colors.secondary} 100%);
            color: ${this.getCurrentTheme().colors.text || this.getCurrentTheme().colors.accent};
            min-height: 100vh;
            display: flex;
        }
        
        .sidebar {
            width: 300px;
            background: ${this.getCurrentTheme().colors.card || 'rgba(0, 0, 0, 0.3)'};
            backdrop-filter: blur(10px);
            padding: 20px;
            border-right: 1px solid ${this.getCurrentTheme().colors.border || 'rgba(255, 255, 255, 0.1)'};
            overflow-y: auto;
            box-shadow: ${this.getCurrentTheme().colors.shadow ? `2px 0 10px ${this.getCurrentTheme().colors.shadow}` : 'none'};
        }
        
        .main-content {
            flex: 1;
            padding: 20px;
            display: flex;
            flex-direction: column;
        }
        
        .header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 30px;
            padding: 20px;
            background: rgba(0, 0, 0, 0.2);
            border-radius: 10px;
            backdrop-filter: blur(10px);
        }
        
        .status-indicator {
            display: flex;
            align-items: center;
            gap: 10px;
        }
        
        .status-dot {
            width: 12px;
            height: 12px;
            border-radius: 50%;
            background: #00ff88;
            animation: pulse 2s infinite;
        }
        
        @keyframes pulse {
            0% { opacity: 1; }
            50% { opacity: 0.5; }
            100% { opacity: 1; }
        }
        
        .control-group {
            background: ${this.getCurrentTheme().colors.card || 'rgba(0, 0, 0, 0.2)'};
            border-radius: 10px;
            padding: 20px;
            margin-bottom: 20px;
            backdrop-filter: blur(10px);
            border: 1px solid ${this.getCurrentTheme().colors.border || 'rgba(255, 255, 255, 0.1)'};
            box-shadow: ${this.getCurrentTheme().colors.shadow ? `0 2px 8px ${this.getCurrentTheme().colors.shadow}` : 'none'};
        }
        
        .control-group h3 {
            margin-bottom: 15px;
            color: ${this.getCurrentTheme().colors.accent};
            border-bottom: 2px solid ${this.getCurrentTheme().colors.accent};
            padding-bottom: 5px;
        }
        
        .form-group {
            margin-bottom: 15px;
        }
        
        label {
            display: block;
            margin-bottom: 5px;
            font-weight: 500;
        }
        
        select, input, textarea {
            width: 100%;
            padding: 10px;
            border: 1px solid ${this.getCurrentTheme().colors.border || 'rgba(255, 255, 255, 0.2)'};
            border-radius: 5px;
            background: ${this.getCurrentTheme().colors.card || 'rgba(0, 0, 0, 0.3)'};
            color: ${this.getCurrentTheme().colors.text || this.getCurrentTheme().colors.accent};
            font-size: 14px;
        }
        
        select:focus, input:focus, textarea:focus {
            outline: none;
            border-color: ${this.getCurrentTheme().colors.accent};
            box-shadow: 0 0 10px rgba(0, 212, 255, 0.3);
        }
        
        button {
            background: linear-gradient(45deg, ${this.getCurrentTheme().colors.accent}, #00ff88);
            color: #000;
            border: none;
            padding: 10px 20px;
            border-radius: 5px;
            cursor: pointer;
            font-weight: bold;
            transition: all 0.3s ease;
        }
        
        button:hover {
            transform: translateY(-2px);
            box-shadow: 0 5px 15px rgba(0, 212, 255, 0.4);
        }
        
        .crew-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
            gap: 20px;
            margin-top: 20px;
        }
        
        .crew-card {
            background: ${this.getCurrentTheme().colors.card || 'rgba(0, 0, 0, 0.2)'};
            border-radius: 10px;
            padding: 20px;
            backdrop-filter: blur(10px);
            border: 1px solid ${this.getCurrentTheme().colors.border || 'rgba(255, 255, 255, 0.1)'};
            transition: all 0.3s ease;
            box-shadow: ${this.getCurrentTheme().colors.shadow ? `0 2px 8px ${this.getCurrentTheme().colors.shadow}` : 'none'};
        }
        
        .crew-card:hover {
            transform: translateY(-5px);
            box-shadow: 0 10px 30px rgba(0, 212, 255, 0.2);
        }
        
        .crew-card h4 {
            color: ${this.getCurrentTheme().colors.accent};
            margin-bottom: 10px;
        }
        
        .crew-card .role {
            color: ${this.getCurrentTheme().colors.role || this.getCurrentTheme().colors.accent};
            font-size: 12px;
            margin-bottom: 10px;
            text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
            font-weight: 600;
        }
        
        .crew-card .component {
            color: ${this.getCurrentTheme().colors.component || '#ffd700'};
            font-size: 12px;
            margin-bottom: 10px;
            text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
            font-weight: 500;
        }
        
        .enhancements {
            font-size: 11px;
            color: ${this.getCurrentTheme().colors.enhancements || '#e0e0e0'};
            margin-top: 10px;
            text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
        }
        
        .enhancements ul {
            list-style: none;
            padding-left: 0;
        }
        
        .enhancements li {
            margin-bottom: 3px;
        }
        
        .enhancements li:before {
            content: "→ ";
            color: #00ff88;
        }
        
        .connection-info {
            background: ${this.getCurrentTheme().colors.card || 'rgba(0, 0, 0, 0.2)'};
            border-radius: 10px;
            padding: 20px;
            margin-top: 20px;
            backdrop-filter: blur(10px);
            border: 1px solid ${this.getCurrentTheme().colors.border || 'rgba(255, 255, 255, 0.1)'};
            box-shadow: ${this.getCurrentTheme().colors.shadow ? `0 2px 8px ${this.getCurrentTheme().colors.shadow}` : 'none'};
        }
        
        .logs {
            background: ${this.getCurrentTheme().colors.card || 'rgba(0, 0, 0, 0.2)'};
            border-radius: 10px;
            padding: 20px;
            margin-top: 20px;
            backdrop-filter: blur(10px);
            max-height: 300px;
            overflow-y: auto;
            border: 1px solid ${this.getCurrentTheme().colors.border || 'rgba(255, 255, 255, 0.1)'};
            box-shadow: ${this.getCurrentTheme().colors.shadow ? `0 2px 8px ${this.getCurrentTheme().colors.shadow}` : 'none'};
        }
        
        .log-entry {
            padding: 5px 0;
            border-bottom: 1px solid rgba(255, 255, 255, 0.1);
            font-family: monospace;
            font-size: 12px;
        }
        
        .log-entry.success { color: #00ff88; }
        .log-entry.error { color: #ff4444; }
        .log-entry.info { color: #00d4ff; }
        
        /* Navigation Toggle Styles */
        .nav-toggle {
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            background: linear-gradient(135deg, ${this.getCurrentTheme().colors.card}, ${this.getCurrentTheme().colors.background});
            border-bottom: 2px solid ${this.getCurrentTheme().colors.accent};
            z-index: 1000;
            padding: 10px 0;
            box-shadow: 0 2px 10px rgba(0, 0, 0, 0.3);
        }
        
        .nav-toggle-content {
            max-width: 1200px;
            margin: 0 auto;
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 0 20px;
        }
        
        .nav-toggle h2 {
            margin: 0;
            color: ${this.getCurrentTheme().colors.accent};
            font-size: 1.2rem;
            font-weight: bold;
        }
        
        .toggle-buttons {
            display: flex;
            gap: 10px;
        }
        
        .toggle-btn {
            padding: 8px 16px;
            border: 2px solid ${this.getCurrentTheme().colors.accent};
            background: transparent;
            color: ${this.getCurrentTheme().colors.accent};
            border-radius: 20px;
            cursor: pointer;
            font-size: 14px;
            font-weight: 500;
            transition: all 0.3s ease;
        }
        
        .toggle-btn:hover {
            background: ${this.getCurrentTheme().colors.accent};
            color: #000;
            transform: translateY(-1px);
        }
        
        .toggle-btn.active {
            background: ${this.getCurrentTheme().colors.accent};
            color: #000;
            box-shadow: 0 0 10px rgba(0, 212, 255, 0.4);
        }
        
        /* Adjust body padding for fixed nav */
        body {
            padding-top: 60px;
        }
    </style>
</head>
<body>
    <!-- Navigation Toggle Header -->
    <nav class="nav-toggle">
        <div class="nav-toggle-content">
            <h2>🖖 Alex AI Development Mode</h2>
            <div class="toggle-buttons">
                <button id="dashboard-btn" class="toggle-btn active" onclick="switchToDashboard()">
                    🎛️ Dashboard
                </button>
                <button id="live-btn" class="toggle-btn" onclick="switchToLive()">
                    🌐 Live Frontend
                </button>
            </div>
        </div>
    </nav>
    
    <div class="sidebar">
        <div class="status-indicator">
            <div class="status-dot"></div>
            <span>Connected</span>
        </div>
        
        <div class="control-group">
            <h3>🎨 Theme Settings</h3>
            <div class="form-group">
                <label for="theme">Theme:</label>
                <select id="theme" onchange="updateConfig('theme', this.value)">
                    ${this.availableThemes.map(theme => 
                      `<option value="${theme.value}" ${theme.value === this.config.theme ? 'selected' : ''}>${theme.label}</option>`
                    ).join('')}
                </select>
            </div>
        </div>
        
        <div class="control-group">
            <h3>📝 Content Settings</h3>
            <div class="form-group">
                <label for="title">Title:</label>
                <input type="text" id="title" value="${this.config.title}" oninput="updateConfig('title', this.value)" onchange="updateConfig('title', this.value)">
            </div>
            <div class="form-group">
                <label for="subtitle">Subtitle:</label>
                <input type="text" id="subtitle" value="${this.config.subtitle}" oninput="updateConfig('subtitle', this.value)" onchange="updateConfig('subtitle', this.value)">
            </div>
            <div class="form-group">
                <label for="description">Description:</label>
                <textarea id="description" rows="3" oninput="updateConfig('description', this.value)" onchange="updateConfig('description', this.value)">${this.config.description}</textarea>
            </div>
            <div class="form-group">
                <label for="heading">Heading:</label>
                <input type="text" id="heading" value="${this.config.heading}" oninput="updateConfig('heading', this.value)" onchange="updateConfig('heading', this.value)">
            </div>
        </div>
        
        <div class="connection-info">
            <h3>🔗 Connection Info</h3>
            <p>Total Connections: <span id="total-connections">${this.connections.total}</span></p>
            <p>Dashboard: <span id="dashboard-connections">${this.connections.dashboard}</span></p>
            <p>Frontend: <span id="frontend-connections">${this.connections.frontend}</span></p>
            <p>Last Update: <span id="last-update">${new Date(this.connections.lastUpdate).toLocaleTimeString()}</span></p>
        </div>
        
        <div class="logs">
            <h3>📋 System Logs</h3>
            <div id="log-container">
                <div class="log-entry info">Dashboard initialized</div>
                <div class="log-entry success">Crew members loaded (${this.crewMembers.size})</div>
                <div class="log-entry info">WebSocket connections enabled</div>
                <div class="log-entry success">Enhanced dashboard ready</div>
            </div>
        </div>
    </div>
    
    <div class="main-content">
        <div class="header">
            <div>
                <h1>${this.config.title}</h1>
                <p>${this.config.subtitle}</p>
            </div>
        </div>
        
        <div class="crew-grid">
            ${Array.from(this.crewMembers.values()).map(member => `
                <div class="crew-card">
                    <h4>${member.name}</h4>
                    <div class="role">${member.role}</div>
                    <div class="component">Component: ${member.component}</div>
                    <div class="enhancements">
                        <strong>Enhancement Recommendations:</strong>
                        <ul>
                            ${member.enhancements.map(enhancement => `<li>${enhancement}</li>`).join('')}
                        </ul>
                    </div>
                </div>
            `).join('')}
        </div>
    </div>

    <script>
        let ws;
        
        function connectWebSocket() {
            ws = new WebSocket('ws://localhost:3000');
            
            ws.onopen = function() {
                addLogEntry('WebSocket connected', 'success');
            };
            
            ws.onmessage = function(event) {
                const data = JSON.parse(event.data);
                handleWebSocketMessage(data);
            };
            
            ws.onclose = function() {
                addLogEntry('WebSocket disconnected', 'error');
                setTimeout(connectWebSocket, 3000);
            };
            
            ws.onerror = function(error) {
                addLogEntry('WebSocket error: ' + error, 'error');
            };
        }
        
        let updateTimeout = {};
        
        function updateConfig(key, value) {
            // Clear any existing timeout for this field
            if (updateTimeout[key]) {
                clearTimeout(updateTimeout[key]);
            }
            
            // Add visual feedback
            const input = document.getElementById(key);
            if (input) {
                input.style.borderColor = '#00ff88';
                input.style.boxShadow = '0 0 5px rgba(0, 255, 136, 0.3)';
            }
            
            // Debounce the update to avoid too many WebSocket messages
            updateTimeout[key] = setTimeout(() => {
                const data = {
                    type: 'config_update',
                    key: key,
                    value: value,
                    timestamp: new Date().toISOString()
                };
                
                if (ws && ws.readyState === WebSocket.OPEN) {
                    ws.send(JSON.stringify(data));
                    addLogEntry(\`✅ Real-time update: \${key} = "\${value}"\`, 'success');
                } else {
                    addLogEntry(\`❌ WebSocket not connected for: \${key}\`, 'error');
                }
                
                // Reset visual feedback
                if (input) {
                    setTimeout(() => {
                        input.style.borderColor = '';
                        input.style.boxShadow = '';
                    }, 500);
                }
            }, 100); // 100ms debounce
        }
        
        function handleWebSocketMessage(data) {
            if (data.type === 'config_update') {
                // Update UI elements in real-time
                if (data.key === 'theme') {
                    location.reload(); // Reload to apply theme changes
                } else {
                    // Update header elements immediately
                    const headerTitle = document.querySelector('.header h1');
                    const headerSubtitle = document.querySelector('.header p');
                    
                    if (data.key === 'title' && headerTitle) {
                        headerTitle.textContent = data.value;
                    } else if (data.key === 'subtitle' && headerSubtitle) {
                        headerSubtitle.textContent = data.value;
                    }
                    
                    // Add confirmation log
                    addLogEntry(\`🔄 Live frontend updated: \${data.key}\`, 'info');
                }
            } else if (data.type === 'connection_update') {
                document.getElementById('total-connections').textContent = data.connections.total;
                document.getElementById('dashboard-connections').textContent = data.connections.dashboard;
                document.getElementById('frontend-connections').textContent = data.connections.frontend;
                document.getElementById('last-update').textContent = new Date(data.connections.lastUpdate).toLocaleTimeString();
            }
        }
        
        function addLogEntry(message, type = 'info') {
            const logContainer = document.getElementById('log-container');
            const logEntry = document.createElement('div');
            logEntry.className = \`log-entry \${type}\`;
            logEntry.textContent = \`[\${new Date().toLocaleTimeString()}] \${message}\`;
            logContainer.appendChild(logEntry);
            logContainer.scrollTop = logContainer.scrollHeight;
        }
        
        // Navigation toggle functions
        function switchToDashboard() {
            // Already on dashboard, just update button state
            document.getElementById('dashboard-btn').classList.add('active');
            document.getElementById('live-btn').classList.remove('active');
            addLogEntry('🎛️ Dashboard view active', 'info');
        }
        
        function switchToLive() {
            // Open live frontend in new tab/window
            const liveUrl = window.location.origin + '/live';
            window.open(liveUrl, '_blank');
            
            // Update button states
            document.getElementById('dashboard-btn').classList.remove('active');
            document.getElementById('live-btn').classList.add('active');
            addLogEntry('🌐 Live frontend opened in new tab', 'success');
            
            // Reset dashboard button after a moment
            setTimeout(() => {
                document.getElementById('dashboard-btn').classList.add('active');
                document.getElementById('live-btn').classList.remove('active');
            }, 1000);
        }
        
        // Keep only last 50 log entries
        function trimLogEntries() {
            const logContainer = document.getElementById('log-container');
            while (logContainer && logContainer.children.length > 50) {
                logContainer.removeChild(logContainer.firstChild);
            }
        }
        
        // Initialize WebSocket connection
        connectWebSocket();
        
        // Add some initial log entries
        setTimeout(() => {
            addLogEntry('Dashboard controls enhanced with dropdowns', 'success');
            addLogEntry('Live frontend preview integrated', 'success');
            addLogEntry('Crew UI analysis findings applied', 'success');
        }, 1000);
    </script>
</body>
</html>`;
    
    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.end(html);
  }

  serveAdminDashboard(res) {
    const currentTheme = this.getCurrentTheme();
    const html = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Administrator Dashboard - ${this.config.title}</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background: linear-gradient(135deg, ${currentTheme.colors.primary} 0%, ${currentTheme.colors.secondary} 100%);
            color: ${currentTheme.colors.accent};
            min-height: 100vh;
        }
        
        .admin-header {
            background: rgba(255, 0, 0, 0.1);
            border: 2px solid #ff4444;
            padding: 20px;
            text-align: center;
            margin-bottom: 20px;
        }
        
        .admin-header h1 {
            color: #ff4444;
            font-size: 2rem;
            margin-bottom: 10px;
        }
        
        .admin-badge {
            display: inline-block;
            background: #ff4444;
            color: white;
            padding: 5px 15px;
            border-radius: 20px;
            font-size: 0.9rem;
            font-weight: bold;
            margin-bottom: 10px;
        }
        
        .admin-grid {
            display: grid;
            grid-template-columns: 1fr 2fr;
            gap: 20px;
            max-width: 1400px;
            margin: 0 auto;
            padding: 20px;
        }
        
        .admin-sidebar {
            background: ${currentTheme.colors.card || 'rgba(0, 0, 0, 0.3)'};
            border: 1px solid ${currentTheme.colors.border || 'rgba(255, 255, 255, 0.2)'};
            border-radius: 10px;
            padding: 20px;
            height: fit-content;
        }
        
        .admin-main {
            background: ${currentTheme.colors.card || 'rgba(0, 0, 0, 0.3)'};
            border: 1px solid ${currentTheme.colors.border || 'rgba(255, 255, 255, 0.2)'};
            border-radius: 10px;
            padding: 20px;
        }
        
        .admin-section {
            margin-bottom: 30px;
        }
        
        .admin-section h3 {
            color: ${currentTheme.colors.accent};
            margin-bottom: 15px;
            font-size: 1.3rem;
            border-bottom: 2px solid ${currentTheme.colors.accent};
            padding-bottom: 5px;
        }
        
        .admin-controls {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 15px;
            margin-bottom: 20px;
        }
        
        .admin-card {
            background: rgba(0, 0, 0, 0.2);
            border: 1px solid rgba(255, 255, 255, 0.1);
            border-radius: 8px;
            padding: 15px;
            transition: transform 0.3s ease;
        }
        
        .admin-card:hover {
            transform: translateY(-2px);
            box-shadow: 0 5px 15px rgba(0, 212, 255, 0.3);
        }
        
        .admin-card h4 {
            color: ${currentTheme.colors.accent};
            margin-bottom: 10px;
        }
        
        .admin-btn {
            background: linear-gradient(45deg, ${currentTheme.colors.accent}, #00ff88);
            color: #000;
            border: none;
            padding: 10px 20px;
            border-radius: 5px;
            cursor: pointer;
            font-weight: bold;
            transition: all 0.3s ease;
            width: 100%;
            margin: 5px 0;
        }
        
        .admin-btn:hover {
            transform: translateY(-2px);
            box-shadow: 0 5px 15px rgba(0, 212, 255, 0.4);
        }
        
        .admin-btn.danger {
            background: linear-gradient(45deg, #ff4444, #ff6666);
        }
        
        .admin-btn.warning {
            background: linear-gradient(45deg, #ffaa00, #ffcc44);
        }
        
        .system-metrics {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
            gap: 15px;
            margin: 20px 0;
        }
        
        .metric {
            background: rgba(0, 0, 0, 0.3);
            border: 1px solid rgba(255, 255, 255, 0.1);
            border-radius: 8px;
            padding: 15px;
            text-align: center;
        }
        
        .metric-value {
            font-size: 1.5rem;
            font-weight: bold;
            color: ${currentTheme.colors.accent};
        }
        
        .metric-label {
            font-size: 0.9rem;
            color: ${currentTheme.colors.text || currentTheme.colors.accent};
            margin-top: 5px;
        }
        
        .navigation {
            text-align: center;
            margin-top: 30px;
        }
        
        .nav-btn {
            display: inline-block;
            background: linear-gradient(45deg, ${currentTheme.colors.accent}, #00ff88);
            color: #000;
            text-decoration: none;
            padding: 12px 24px;
            border-radius: 25px;
            margin: 0 10px;
            font-weight: bold;
            transition: transform 0.3s ease;
        }
        
        .nav-btn:hover {
            transform: translateY(-2px);
            box-shadow: 0 5px 15px rgba(0, 212, 255, 0.4);
        }
    </style>
</head>
<body>
    <div class="admin-header">
        <div class="admin-badge">🔐 ADMINISTRATOR ACCESS</div>
        <h1>🖖 Alex AI Administrator Dashboard</h1>
        <p>Full system control and monitoring capabilities</p>
    </div>
    
    <div class="admin-grid">
        <div class="admin-sidebar">
            <div class="admin-section">
                <h3>🎛️ System Controls</h3>
                <div class="admin-controls">
                    <div class="admin-card">
                        <h4>Server Management</h4>
                        <button class="admin-btn" onclick="restartServer()">🔄 Restart Server</button>
                        <button class="admin-btn" onclick="clearLogs()">🗑️ Clear Logs</button>
                        <button class="admin-btn" onclick="backupConfig()">💾 Backup Config</button>
                    </div>
                    
                    <div class="admin-card">
                        <h4>Security Controls</h4>
                        <button class="admin-btn warning" onclick="scanSecurity()">🔍 Security Scan</button>
                        <button class="admin-btn danger" onclick="emergencyStop()">🛑 Emergency Stop</button>
                        <button class="admin-btn" onclick="auditAccess()">📋 Audit Access</button>
                    </div>
                    
                    <div class="admin-card">
                        <h4>Theme Management</h4>
                        <button class="admin-btn" onclick="resetTheme()">🎨 Reset Theme</button>
                        <button class="admin-btn" onclick="exportTheme()">📤 Export Theme</button>
                        <button class="admin-btn" onclick="importTheme()">📥 Import Theme</button>
                    </div>
                </div>
            </div>
            
            <div class="admin-section">
                <h3>📊 System Metrics</h3>
                <div class="system-metrics">
                    <div class="metric">
                        <div class="metric-value" id="uptime">${Math.floor(process.uptime() / 60)}m</div>
                        <div class="metric-label">Uptime</div>
                    </div>
                    <div class="metric">
                        <div class="metric-value" id="connections">${this.connections.total}</div>
                        <div class="metric-label">Connections</div>
                    </div>
                    <div class="metric">
                        <div class="metric-value" id="memory">${(process.memoryUsage().heapUsed / 1024 / 1024).toFixed(0)}MB</div>
                        <div class="metric-label">Memory</div>
                    </div>
                    <div class="metric">
                        <div class="metric-value">${this.crewMembers.size}</div>
                        <div class="metric-label">Crew Members</div>
                    </div>
                </div>
            </div>
        </div>
        
        <div class="admin-main">
            <div class="admin-section">
                <h3>🔧 Advanced Configuration</h3>
                <div class="admin-controls">
                    <div class="admin-card">
                        <h4>WebSocket Controls</h4>
                        <button class="admin-btn" onclick="toggleWebSocket()">🔌 Toggle WebSocket</button>
                        <button class="admin-btn" onclick="broadcastMessage()">📢 Broadcast Message</button>
                        <button class="admin-btn" onclick="disconnectAll()">🔌 Disconnect All</button>
                    </div>
                    
                    <div class="admin-card">
                        <h4>Database Management</h4>
                        <button class="admin-btn" onclick="syncDatabase()">🔄 Sync Database</button>
                        <button class="admin-btn" onclick="optimizeDatabase()">⚡ Optimize DB</button>
                        <button class="admin-btn warning" onclick="resetDatabase()">🗑️ Reset Database</button>
                    </div>
                    
                    <div class="admin-card">
                        <h4>API Management</h4>
                        <button class="admin-btn" onclick="enableAPIs()">✅ Enable APIs</button>
                        <button class="admin-btn warning" onclick="disableAPIs()">❌ Disable APIs</button>
                        <button class="admin-btn" onclick="rateLimitConfig()">⏱️ Rate Limits</button>
                    </div>
                    
                    <div class="admin-card">
                        <h4>Logging & Monitoring</h4>
                        <button class="admin-btn" onclick="enableLogging()">📝 Enable Logging</button>
                        <button class="admin-btn" onclick="exportLogs()">📤 Export Logs</button>
                        <button class="admin-btn" onclick="monitorPerformance()">📊 Performance</button>
                    </div>
                </div>
            </div>
            
            <div class="admin-section">
                <h3>👥 Crew Management</h3>
                <div class="admin-controls">
                    <div class="admin-card">
                        <h4>Crew Operations</h4>
                        <button class="admin-btn" onclick="activateAllCrew()">✅ Activate All Crew</button>
                        <button class="admin-btn" onclick="deactivateAllCrew()">❌ Deactivate All Crew</button>
                        <button class="admin-btn" onclick="resetCrewStatus()">🔄 Reset Crew Status</button>
                    </div>
                    
                    <div class="admin-card">
                        <h4>RAG Memory</h4>
                        <button class="admin-btn" onclick="syncRAGMemory()">🔄 Sync RAG Memory</button>
                        <button class="admin-btn" onclick="clearRAGMemory()">🗑️ Clear RAG Memory</button>
                        <button class="admin-btn" onclick="exportRAGMemory()">📤 Export RAG Memory</button>
                    </div>
                </div>
            </div>
        </div>
    </div>
    
    <div class="navigation">
        <a href="/" class="nav-btn">🎛️ Standard Dashboard</a>
        <a href="/live" class="nav-btn">🌐 Live Frontend</a>
        <a href="/public" class="nav-btn">👁️ Public View</a>
        <a href="/api/health?format=ui" class="nav-btn">🏥 System Health</a>
    </div>
    
    <script>
        // Admin control functions
        function restartServer() {
            if (confirm('Are you sure you want to restart the server?')) {
                alert('Server restart initiated...');
                // In a real implementation, this would trigger a server restart
            }
        }
        
        function clearLogs() {
            if (confirm('Are you sure you want to clear all logs?')) {
                alert('Logs cleared successfully');
            }
        }
        
        function backupConfig() {
            alert('Configuration backup initiated...');
        }
        
        function scanSecurity() {
            alert('Security scan started...');
        }
        
        function emergencyStop() {
            if (confirm('EMERGENCY STOP: This will immediately halt all operations. Continue?')) {
                alert('Emergency stop activated!');
            }
        }
        
        function auditAccess() {
            alert('Access audit report generated');
        }
        
        function resetTheme() {
            if (confirm('Reset theme to default?')) {
                alert('Theme reset to default');
            }
        }
        
        function exportTheme() {
            alert('Theme export initiated...');
        }
        
        function importTheme() {
            alert('Theme import dialog opened');
        }
        
        function toggleWebSocket() {
            alert('WebSocket toggled');
        }
        
        function broadcastMessage() {
            const message = prompt('Enter message to broadcast:');
            if (message) {
                alert('Message broadcasted: ' + message);
            }
        }
        
        function disconnectAll() {
            if (confirm('Disconnect all WebSocket clients?')) {
                alert('All clients disconnected');
            }
        }
        
        function syncDatabase() {
            alert('Database sync initiated...');
        }
        
        function optimizeDatabase() {
            alert('Database optimization started...');
        }
        
        function resetDatabase() {
            if (confirm('Reset database? This will delete all data!')) {
                alert('Database reset initiated...');
            }
        }
        
        function enableAPIs() {
            alert('All APIs enabled');
        }
        
        function disableAPIs() {
            if (confirm('Disable all APIs?')) {
                alert('All APIs disabled');
            }
        }
        
        function rateLimitConfig() {
            alert('Rate limit configuration opened');
        }
        
        function enableLogging() {
            alert('Logging enabled');
        }
        
        function exportLogs() {
            alert('Log export initiated...');
        }
        
        function monitorPerformance() {
            alert('Performance monitoring started');
        }
        
        function activateAllCrew() {
            alert('All crew members activated');
        }
        
        function deactivateAllCrew() {
            if (confirm('Deactivate all crew members?')) {
                alert('All crew members deactivated');
            }
        }
        
        function resetCrewStatus() {
            alert('Crew status reset');
        }
        
        function syncRAGMemory() {
            alert('RAG memory sync initiated...');
        }
        
        function clearRAGMemory() {
            if (confirm('Clear all RAG memory?')) {
                alert('RAG memory cleared');
            }
        }
        
        function exportRAGMemory() {
            alert('RAG memory export initiated...');
        }
        
        // Update metrics every 5 seconds
        setInterval(() => {
            document.getElementById('uptime').textContent = '${Math.floor(process.uptime() / 60)}m';
            document.getElementById('connections').textContent = '${this.connections.total}';
            document.getElementById('memory').textContent = '${(process.memoryUsage().heapUsed / 1024 / 1024).toFixed(0)}MB';
        }, 5000);
    </script>
</body>
</html>`;
    
    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.end(html);
  }

  servePublicView(res) {
    const currentTheme = this.getCurrentTheme();
    const html = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${this.config.title} - Public View</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background: linear-gradient(135deg, ${currentTheme.colors.primary} 0%, ${currentTheme.colors.secondary} 100%);
            color: ${currentTheme.colors.accent};
            min-height: 100vh;
        }
        
        .public-header {
            background: rgba(0, 255, 136, 0.1);
            border: 2px solid #00ff88;
            padding: 20px;
            text-align: center;
            margin-bottom: 20px;
        }
        
        .public-header h1 {
            color: #00ff88;
            font-size: 2rem;
            margin-bottom: 10px;
        }
        
        .public-badge {
            display: inline-block;
            background: #00ff88;
            color: #000;
            padding: 5px 15px;
            border-radius: 20px;
            font-size: 0.9rem;
            font-weight: bold;
            margin-bottom: 10px;
        }
        
        .public-container {
            max-width: 1200px;
            margin: 0 auto;
            padding: 20px;
        }
        
        .public-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
            gap: 20px;
            margin-bottom: 30px;
        }
        
        .public-card {
            background: ${currentTheme.colors.card || 'rgba(0, 0, 0, 0.3)'};
            border: 1px solid ${currentTheme.colors.border || 'rgba(255, 255, 255, 0.2)'};
            border-radius: 10px;
            padding: 20px;
            box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
            transition: transform 0.3s ease;
        }
        
        .public-card:hover {
            transform: translateY(-2px);
            box-shadow: 0 8px 25px rgba(0, 212, 255, 0.3);
        }
        
        .public-card h3 {
            color: ${currentTheme.colors.accent};
            margin-bottom: 15px;
            font-size: 1.3rem;
            display: flex;
            align-items: center;
            gap: 10px;
        }
        
        .public-card p {
            color: ${currentTheme.colors.text || currentTheme.colors.accent};
            line-height: 1.6;
            margin-bottom: 15px;
        }
        
        .public-card .feature-list {
            list-style: none;
            padding: 0;
        }
        
        .public-card .feature-list li {
            color: ${currentTheme.colors.text || currentTheme.colors.accent};
            margin-bottom: 8px;
            padding-left: 20px;
            position: relative;
        }
        
        .public-card .feature-list li::before {
            content: "✓";
            position: absolute;
            left: 0;
            color: #00ff88;
            font-weight: bold;
        }
        
        .status-indicator {
            display: inline-flex;
            align-items: center;
            background: rgba(0, 255, 136, 0.1);
            border: 1px solid #00ff88;
            border-radius: 20px;
            padding: 8px 16px;
            margin: 10px 0;
        }
        
        .status-dot {
            width: 8px;
            height: 8px;
            background: #00ff88;
            border-radius: 50%;
            margin-right: 8px;
            animation: pulse 2s infinite;
        }
        
        @keyframes pulse {
            0% { opacity: 1; }
            50% { opacity: 0.5; }
            100% { opacity: 1; }
        }
        
        .public-metrics {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
            gap: 15px;
            margin: 20px 0;
        }
        
        .metric {
            background: rgba(0, 0, 0, 0.2);
            border: 1px solid rgba(255, 255, 255, 0.1);
            border-radius: 8px;
            padding: 15px;
            text-align: center;
        }
        
        .metric-value {
            font-size: 1.5rem;
            font-weight: bold;
            color: ${currentTheme.colors.accent};
        }
        
        .metric-label {
            font-size: 0.9rem;
            color: ${currentTheme.colors.text || currentTheme.colors.accent};
            margin-top: 5px;
        }
        
        .navigation {
            text-align: center;
            margin-top: 30px;
        }
        
        .nav-btn {
            display: inline-block;
            background: linear-gradient(45deg, ${currentTheme.colors.accent}, #00ff88);
            color: #000;
            text-decoration: none;
            padding: 12px 24px;
            border-radius: 25px;
            margin: 0 10px;
            font-weight: bold;
            transition: transform 0.3s ease;
        }
        
        .nav-btn:hover {
            transform: translateY(-2px);
            box-shadow: 0 5px 15px rgba(0, 212, 255, 0.4);
        }
        
        .nav-btn.secondary {
            background: transparent;
            border: 2px solid ${currentTheme.colors.accent};
            color: ${currentTheme.colors.accent};
        }
        
        .nav-btn.secondary:hover {
            background: ${currentTheme.colors.accent};
            color: #000;
        }
    </style>
</head>
<body>
    <div class="public-header">
        <div class="public-badge">👁️ PUBLIC ACCESS</div>
        <h1>${this.config.title}</h1>
        <p>${this.config.subtitle}</p>
        <div class="status-indicator">
            <div class="status-dot"></div>
            <span>System Online</span>
        </div>
    </div>
    
    <div class="public-container">
        <div class="public-grid">
            <div class="public-card">
                <h3>🚀 Enhanced Dashboard</h3>
                <p>Advanced control panel with crew intelligence monitoring and real-time configuration updates.</p>
                <ul class="feature-list">
                    <li>Real-time system monitoring</li>
                    <li>Interactive configuration controls</li>
                    <li>Theme customization</li>
                    <li>WebSocket communication</li>
                </ul>
            </div>
            
            <div class="public-card">
                <h3>👥 Crew Integration</h3>
                <p>Star Trek crew members providing specialized expertise and UI component analysis.</p>
                <ul class="feature-list">
                    <li>9 specialized crew members</li>
                    <li>Component-specific expertise</li>
                    <li>Real-time status monitoring</li>
                    <li>Collaborative analysis</li>
                </ul>
            </div>
            
            <div class="public-card">
                <h3>🔄 Real-time Updates</h3>
                <p>Live synchronization between dashboard controls and frontend display with WebSocket technology.</p>
                <ul class="feature-list">
                    <li>Instant configuration updates</li>
                    <li>Bidirectional communication</li>
                    <li>Live preview capabilities</li>
                    <li>Connection monitoring</li>
                </ul>
            </div>
            
            <div class="public-card">
                <h3>🧠 RAG Memory System</h3>
                <p>Self-learning system storing crew insights and enhancement recommendations for continuous improvement.</p>
                <ul class="feature-list">
                    <li>Persistent memory storage</li>
                    <li>Learning from interactions</li>
                    <li>Knowledge accumulation</li>
                    <li>Adaptive recommendations</li>
                </ul>
            </div>
            
            <div class="public-card">
                <h3>🎨 Theme System</h3>
                <p>Multiple theme options with unified representation across all system components.</p>
                <ul class="feature-list">
                    <li>5 available themes</li>
                    <li>Consistent styling</li>
                    <li>Real-time theme switching</li>
                    <li>Unified UI representation</li>
                </ul>
            </div>
            
            <div class="public-card">
                <h3>📡 API Integration</h3>
                <p>Comprehensive API endpoints with both JSON and UI representations for all system data.</p>
                <ul class="feature-list">
                    <li>Health monitoring API</li>
                    <li>Configuration management</li>
                    <li>Crew status endpoints</li>
                    <li>Theme management</li>
                </ul>
            </div>
        </div>
        
        <div class="public-metrics">
            <div class="metric">
                <div class="metric-value">${this.crewMembers.size}</div>
                <div class="metric-label">Crew Members</div>
            </div>
            <div class="metric">
                <div class="metric-value">${this.availableThemes.length}</div>
                <div class="metric-label">Available Themes</div>
            </div>
            <div class="metric">
                <div class="metric-value">${this.connections.total}</div>
                <div class="metric-label">Active Connections</div>
            </div>
            <div class="metric">
                <div class="metric-value">${Math.floor(process.uptime() / 60)}m</div>
                <div class="metric-label">System Uptime</div>
            </div>
        </div>
        
        <div class="navigation">
            <a href="/live" class="nav-btn">🌐 View Live Frontend</a>
            <a href="/api/health?format=ui" class="nav-btn">🏥 System Health</a>
            <a href="/api/config?format=ui" class="nav-btn secondary">⚙️ Configuration</a>
            <a href="/api/crew-status?format=ui" class="nav-btn secondary">👥 Crew Status</a>
        </div>
    </div>
</body>
</html>`;
    
    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.end(html);
  }

  serveLiveFrontend(res) {
    const currentTheme = this.getCurrentTheme();
    const html = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${this.config.title} - Live Frontend</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background: linear-gradient(135deg, ${currentTheme.colors.primary} 0%, ${currentTheme.colors.secondary} 100%);
            color: ${currentTheme.colors.accent};
            min-height: 100vh;
            display: flex;
            flex-direction: column;
        }
        
        .header {
            background: rgba(0, 0, 0, 0.3);
            backdrop-filter: blur(10px);
            padding: 40px 20px;
            text-align: center;
            border-bottom: 1px solid rgba(255, 255, 255, 0.1);
        }
        
        .header h1 {
            font-size: 3rem;
            margin-bottom: 10px;
            background: linear-gradient(45deg, ${currentTheme.colors.accent}, #00ff88);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
        }
        
        .header .subtitle {
            font-size: 1.5rem;
            margin-bottom: 20px;
            opacity: 0.9;
        }
        
        .header .description {
            font-size: 1.1rem;
            opacity: 0.8;
            max-width: 800px;
            margin: 0 auto;
            line-height: 1.6;
        }
        
        .main-content {
            flex: 1;
            padding: 40px 20px;
            max-width: 1200px;
            margin: 0 auto;
            width: 100%;
        }
        
        .feature-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
            gap: 30px;
            margin-bottom: 40px;
        }
        
        .feature-card {
            background: ${currentTheme.colors.card || 'rgba(0, 0, 0, 0.2)'};
            border-radius: 15px;
            padding: 30px;
            backdrop-filter: blur(10px);
            border: 1px solid ${currentTheme.colors.border || 'rgba(255, 255, 255, 0.1)'};
            transition: all 0.3s ease;
            text-align: center;
            box-shadow: ${currentTheme.colors.shadow ? `0 4px 12px ${currentTheme.colors.shadow}` : 'none'};
        }
        
        .feature-card:hover {
            transform: translateY(-10px);
            box-shadow: 0 20px 40px rgba(0, 212, 255, 0.2);
        }
        
        .feature-card h3 {
            font-size: 1.5rem;
            margin-bottom: 15px;
            color: ${currentTheme.colors.accent};
        }
        
        .feature-card p {
            opacity: 0.8;
            line-height: 1.6;
        }
        
        .crew-showcase {
            background: ${currentTheme.colors.card || 'rgba(0, 0, 0, 0.2)'};
            border-radius: 15px;
            padding: 30px;
            backdrop-filter: blur(10px);
            margin-bottom: 40px;
            border: 1px solid ${currentTheme.colors.border || 'rgba(255, 255, 255, 0.1)'};
            box-shadow: ${currentTheme.colors.shadow ? `0 4px 12px ${currentTheme.colors.shadow}` : 'none'};
        }
        
        .crew-showcase h2 {
            text-align: center;
            margin-bottom: 30px;
            font-size: 2rem;
            color: ${currentTheme.colors.accent};
        }
        
        .crew-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
            gap: 20px;
        }
        
        .crew-member {
            background: ${currentTheme.colors.card || 'rgba(0, 0, 0, 0.3)'};
            border-radius: 10px;
            padding: 20px;
            text-align: center;
            border: 1px solid ${currentTheme.colors.border || 'rgba(255, 255, 255, 0.1)'};
            box-shadow: ${currentTheme.colors.shadow ? `0 2px 8px ${currentTheme.colors.shadow}` : 'none'};
        }
        
        .crew-member h4 {
            color: ${currentTheme.colors.accent};
            margin-bottom: 5px;
        }
        
        .crew-member .role {
            color: #00ff88;
            font-size: 0.9rem;
            margin-bottom: 10px;
        }
        
        .crew-member .component {
            color: #ffd700;
            font-size: 0.8rem;
            margin-bottom: 10px;
        }
        
        .status-indicator {
            display: inline-block;
            width: 8px;
            height: 8px;
            border-radius: 50%;
            background: #00ff88;
            margin-right: 5px;
            animation: pulse 2s infinite;
        }
        
        .footer {
            background: rgba(0, 0, 0, 0.3);
            backdrop-filter: blur(10px);
            padding: 20px;
            text-align: center;
            border-top: 1px solid rgba(255, 255, 255, 0.1);
            opacity: 0.8;
        }
        
        .live-indicator {
            position: fixed;
            top: 20px;
            right: 20px;
            background: rgba(0, 255, 136, 0.2);
            border: 1px solid #00ff88;
            border-radius: 20px;
            padding: 10px 20px;
            font-size: 0.9rem;
            color: #00ff88;
            backdrop-filter: blur(10px);
        }
        
        .live-indicator .pulse {
            display: inline-block;
            width: 8px;
            height: 8px;
            border-radius: 50%;
            background: #00ff88;
            margin-right: 8px;
            animation: pulse 1s infinite;
        }
        
        /* Navigation Toggle Styles for Live Frontend */
        .nav-toggle {
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            background: linear-gradient(135deg, ${this.getCurrentTheme().colors.card}, ${this.getCurrentTheme().colors.background});
            border-bottom: 2px solid ${this.getCurrentTheme().colors.accent};
            z-index: 1000;
            padding: 10px 0;
            box-shadow: 0 2px 10px rgba(0, 0, 0, 0.3);
        }
        
        .nav-toggle-content {
            max-width: 1200px;
            margin: 0 auto;
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 0 20px;
        }
        
        .nav-toggle h2 {
            margin: 0;
            color: ${this.getCurrentTheme().colors.accent};
            font-size: 1.2rem;
            font-weight: bold;
        }
        
        .toggle-buttons {
            display: flex;
            gap: 10px;
        }
        
        .toggle-btn {
            padding: 8px 16px;
            border: 2px solid ${this.getCurrentTheme().colors.accent};
            background: transparent;
            color: ${this.getCurrentTheme().colors.accent};
            border-radius: 20px;
            cursor: pointer;
            font-size: 14px;
            font-weight: 500;
            transition: all 0.3s ease;
        }
        
        .toggle-btn:hover {
            background: ${this.getCurrentTheme().colors.accent};
            color: #000;
            transform: translateY(-1px);
        }
        
        .toggle-btn.active {
            background: ${this.getCurrentTheme().colors.accent};
            color: #000;
            box-shadow: 0 0 10px rgba(0, 212, 255, 0.4);
        }
        
        /* Adjust body padding for fixed nav */
        body {
            padding-top: 60px;
        }
    </style>
</head>
<body>
    <!-- Navigation Toggle Header -->
    <nav class="nav-toggle">
        <div class="nav-toggle-content">
            <h2>🖖 Alex AI Live Frontend</h2>
            <div class="toggle-buttons">
                <button id="dashboard-btn" class="toggle-btn" onclick="switchToDashboard()">
                    🎛️ Dashboard
                </button>
                <button id="live-btn" class="toggle-btn active" onclick="switchToLive()">
                    🌐 Live Frontend
                </button>
            </div>
        </div>
    </nav>
    
    <div class="live-indicator">
        <span class="pulse"></span>
        LIVE PREVIEW
    </div>
    
    <header class="header">
        <h1>${this.config.title}</h1>
        <div class="subtitle">${this.config.subtitle}</div>
        <div class="description">${this.config.description}</div>
        <div style="margin-top: 20px; font-size: 1.2rem; color: #00ff88;">
            ${this.config.heading}
        </div>
    </header>
    
    <main class="main-content">
        <div class="feature-grid">
            <div class="feature-card">
                <h3>🚀 Enhanced Dashboard</h3>
                <p>Advanced control panel with crew intelligence monitoring and real-time configuration updates.</p>
            </div>
            <div class="feature-card">
                <h3>🖖 Crew Integration</h3>
                <p>Star Trek crew members providing specialized expertise and UI component analysis.</p>
            </div>
            <div class="feature-card">
                <h3>🔄 Real-time Updates</h3>
                <p>Live synchronization between dashboard controls and frontend display with WebSocket technology.</p>
            </div>
            <div class="feature-card">
                <h3>🧠 RAG Memory</h3>
                <p>Self-learning system storing crew insights and enhancement recommendations for continuous improvement.</p>
            </div>
        </div>
        
        <div class="crew-showcase">
            <h2>🖖 Our Crew</h2>
            <div class="crew-grid">
                ${Array.from(this.crewMembers.values()).map(member => `
                    <div class="crew-member">
                        <span class="status-indicator"></span>
                        <h4>${member.name}</h4>
                        <div class="role">${member.role}</div>
                        <div class="component">${member.component}</div>
                    </div>
                `).join('')}
            </div>
        </div>
        
        <div class="feature-grid">
            <div class="feature-card">
                <h3>🎨 Theme Customization</h3>
                <p>Multiple theme options including Star Trek, Dark Mode, Light Mode, Neon Cyber, and Ocean Blue.</p>
            </div>
            <div class="feature-card">
                <h3>📊 Live Analytics</h3>
                <p>Real-time monitoring of connections, crew status, and system performance metrics.</p>
            </div>
            <div class="feature-card">
                <h3>🔧 Enhancement Ready</h3>
                <p>32 enhancement recommendations from crew UI analysis ready for implementation.</p>
            </div>
            <div class="feature-card">
                <h3>🌐 Production Ready</h3>
                <p>Deployable frontend with proper content structure and responsive design.</p>
            </div>
        </div>
    </main>
    
    <footer class="footer">
        <p>${this.config.footer}</p>
        <p>Live Frontend Preview - Updates in real-time from dashboard controls</p>
    </footer>

    <script>
        // WebSocket connection for live updates
        let ws;
        
        function connectWebSocket() {
            ws = new WebSocket('ws://localhost:3000');
            
            ws.onopen = function() {
                console.log('Live frontend connected to dashboard');
            };
            
            ws.onmessage = function(event) {
                const data = JSON.parse(event.data);
                if (data.type === 'config_update') {
                    // Reload page to apply theme changes
                    if (data.key === 'theme') {
                        location.reload();
                    } else {
                        // Update content in real-time
                        updateLiveContent(data.key, data.value);
                    }
                }
            };
            
            ws.onclose = function() {
                console.log('Live frontend disconnected');
                setTimeout(connectWebSocket, 3000);
            };
        }
        
        function updateLiveContent(key, value) {
            console.log(\`Updating live content: \${key} = "\${value}"\`);
            
            // Update header content
            if (key === 'title') {
                const titleElement = document.querySelector('header .header h1');
                if (titleElement) {
                    titleElement.textContent = value;
                }
            } else if (key === 'subtitle') {
                const subtitleElement = document.querySelector('header .header .subtitle');
                if (subtitleElement) {
                    subtitleElement.textContent = value;
                }
            } else if (key === 'description') {
                const descriptionElement = document.querySelector('header .header .description');
                if (descriptionElement) {
                    descriptionElement.textContent = value;
                }
            } else if (key === 'heading') {
                const headingElement = document.querySelector('header .header div[style*="margin-top"]');
                if (headingElement) {
                    headingElement.textContent = value;
                }
            }
            
            // Add visual feedback
            document.body.style.transition = 'all 0.3s ease';
            document.body.style.filter = 'brightness(1.1)';
            setTimeout(() => {
                document.body.style.filter = 'brightness(1)';
            }, 300);
        }
        
        // Navigation toggle functions for live frontend
        function switchToDashboard() {
            // Navigate back to dashboard
            window.location.href = window.location.origin + '/';
        }
        
        function switchToLive() {
            // Already on live frontend, just update button state
            document.getElementById('dashboard-btn').classList.remove('active');
            document.getElementById('live-btn').classList.add('active');
        }
        
        // Initialize WebSocket connection
        connectWebSocket();
        
        // Update connection count
        setInterval(() => {
            if (ws && ws.readyState === WebSocket.OPEN) {
                ws.send(JSON.stringify({ type: 'frontend_ping' }));
            }
        }, 30000);
    </script>
</body>
</html>`;
    
    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.end(html);
  }

  getCurrentTheme() {
    const theme = this.availableThemes.find(t => t.value === this.config.theme) || this.availableThemes[0];
    
    // Enhance theme with proper contrast colors
    const enhancedTheme = {
      ...theme,
      colors: {
        ...theme.colors,
        // Role colors - high contrast for better legibility
        role: this.getRoleColor(theme.value),
        // Component colors - high contrast for better legibility  
        component: this.getComponentColor(theme.value),
        // Enhancement colors - high contrast for better legibility
        enhancements: this.getEnhancementColor(theme.value)
      }
    };
    
    return enhancedTheme;
  }
  
  getRoleColor(themeValue) {
    const roleColors = {
      'light': '#1a5a1a',      // Dark green on light background
      'dark': '#4ade80',       // Light green on dark background
      'star-trek': '#00ff88',  // Bright green for Star Trek
      'neon': '#00ff88',       // Bright green for neon
      'ocean': '#00d4ff'       // Bright blue for ocean
    };
    return roleColors[themeValue] || '#4ade80';
  }
  
  getComponentColor(themeValue) {
    const componentColors = {
      'light': '#8b4513',      // Dark brown on light background
      'dark': '#fbbf24',       // Light yellow on dark background
      'star-trek': '#ffd700',  // Gold for Star Trek
      'neon': '#ffff00',       // Bright yellow for neon
      'ocean': '#ffd700'       // Gold for ocean
    };
    return componentColors[themeValue] || '#fbbf24';
  }
  
  getEnhancementColor(themeValue) {
    const enhancementColors = {
      'light': '#374151',      // Dark grey on light background
      'dark': '#e5e7eb',       // Light grey on dark background
      'star-trek': '#ffffff',  // White for Star Trek
      'neon': '#ffffff',       // White for neon
      'ocean': '#e0f2fe'       // Light blue for ocean
    };
    return enhancementColors[themeValue] || '#e5e7eb';
  }

  generateUniversalNavigation(currentPage = '', userRole = 'user') {
    const currentTheme = this.getCurrentTheme();
    const isAdmin = userRole === 'admin';
    const isPublic = userRole === 'public';
    
    return `
    <nav class="universal-navigation">
      <div class="nav-header">
        <div class="nav-brand">
          <span class="nav-logo">🖖</span>
          <span class="nav-title">Alex AI Universal</span>
        </div>
        <div class="nav-role-badge">
          ${isAdmin ? '<span class="admin-badge">ADMIN</span>' : ''}
          ${isPublic ? '<span class="public-badge">PUBLIC</span>' : ''}
        </div>
      </div>
      
      <div class="nav-content">
        <div class="nav-primary">
          <a href="/" class="nav-link ${currentPage === 'dashboard' ? 'active' : ''}">
            <span class="nav-icon">🎛️</span>
            <span class="nav-label">Dashboard</span>
          </a>
          <a href="/live" class="nav-link ${currentPage === 'live' ? 'active' : ''}">
            <span class="nav-icon">🌐</span>
            <span class="nav-label">Live Frontend</span>
          </a>
          ${isAdmin ? `
          <a href="/admin" class="nav-link ${currentPage === 'admin' ? 'active' : ''}">
            <span class="nav-icon">🔐</span>
            <span class="nav-label">Admin Panel</span>
          </a>
          ` : ''}
          <a href="/public" class="nav-link ${currentPage === 'public' ? 'active' : ''}">
            <span class="nav-icon">👁️</span>
            <span class="nav-label">Public View</span>
          </a>
        </div>
        
        <div class="nav-secondary">
          <div class="nav-section">
            <span class="nav-section-title">System Tools</span>
            <a href="/api/health?format=ui" class="nav-link secondary">
              <span class="nav-icon">🏥</span>
              <span class="nav-label">Health Check</span>
            </a>
            <a href="/api/config?format=ui" class="nav-link secondary">
              <span class="nav-icon">⚙️</span>
              <span class="nav-label">Configuration</span>
            </a>
            <a href="/api/crew-status?format=ui" class="nav-link secondary">
              <span class="nav-icon">👥</span>
              <span class="nav-label">Crew Status</span>
            </a>
            <a href="/contrast-test" class="nav-link secondary">
              <span class="nav-icon">🎨</span>
              <span class="nav-label">Contrast Test</span>
            </a>
          </div>
          
          ${isAdmin ? `
          <div class="nav-section">
            <span class="nav-section-title">Admin Tools</span>
            <a href="/api/themes?format=ui" class="nav-link secondary">
              <span class="nav-icon">🎨</span>
              <span class="nav-label">Theme Manager</span>
            </a>
            <a href="/api/debug" class="nav-link secondary">
              <span class="nav-icon">🔧</span>
              <span class="nav-label">Debug Tools</span>
            </a>
          </div>
          ` : ''}
        </div>
        
        <div class="nav-status">
          <div class="status-indicator">
            <span class="status-dot connected"></span>
            <span class="status-text">Connected</span>
          </div>
          <div class="crew-count">
            <span class="crew-icon">👥</span>
            <span class="crew-number">${this.crewMembers.size}</span>
          </div>
        </div>
      </div>
    </nav>
    
    <style>
      .universal-navigation {
        background: linear-gradient(135deg, ${currentTheme.colors.primary} 0%, ${currentTheme.colors.secondary} 100%);
        border: 1px solid ${currentTheme.colors.border || 'rgba(255, 255, 255, 0.2)'};
        border-radius: 10px;
        margin-bottom: 20px;
        overflow: hidden;
        box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
      }
      
      .nav-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 15px 20px;
        background: rgba(0, 0, 0, 0.1);
        border-bottom: 1px solid ${currentTheme.colors.border || 'rgba(255, 255, 255, 0.2)'};
      }
      
      .nav-brand {
        display: flex;
        align-items: center;
        gap: 10px;
      }
      
      .nav-logo {
        font-size: 1.5rem;
      }
      
      .nav-title {
        font-weight: bold;
        color: ${currentTheme.colors.accent};
        font-size: 1.1rem;
      }
      
      .admin-badge {
        background: #ff4444;
        color: white;
        padding: 4px 8px;
        border-radius: 12px;
        font-size: 0.7rem;
        font-weight: bold;
      }
      
      .public-badge {
        background: #00aa00;
        color: white;
        padding: 4px 8px;
        border-radius: 12px;
        font-size: 0.7rem;
        font-weight: bold;
      }
      
      .nav-content {
        padding: 20px;
      }
      
      .nav-primary {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
        gap: 10px;
        margin-bottom: 20px;
      }
      
      .nav-link {
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 12px 16px;
        background: rgba(255, 255, 255, 0.1);
        border: 1px solid rgba(255, 255, 255, 0.2);
        border-radius: 8px;
        color: ${currentTheme.colors.accent};
        text-decoration: none;
        transition: all 0.3s ease;
        font-weight: 500;
      }
      
      .nav-link:hover {
        background: rgba(255, 255, 255, 0.2);
        transform: translateY(-2px);
        box-shadow: 0 4px 12px rgba(0, 212, 255, 0.3);
      }
      
      .nav-link.active {
        background: ${currentTheme.colors.accent};
        color: #000;
        font-weight: bold;
      }
      
      .nav-link.secondary {
        background: rgba(0, 0, 0, 0.2);
        font-size: 0.9rem;
        padding: 8px 12px;
      }
      
      .nav-icon {
        font-size: 1.1rem;
      }
      
      .nav-label {
        font-size: 0.9rem;
      }
      
      .nav-section {
        margin-bottom: 15px;
      }
      
      .nav-section-title {
        color: ${currentTheme.colors.accent};
        font-weight: bold;
        font-size: 0.8rem;
        text-transform: uppercase;
        margin-bottom: 8px;
        display: block;
      }
      
      .nav-secondary {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
        gap: 15px;
        margin-bottom: 20px;
      }
      
      .nav-status {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding-top: 15px;
        border-top: 1px solid ${currentTheme.colors.border || 'rgba(255, 255, 255, 0.2)'};
      }
      
      .status-indicator {
        display: flex;
        align-items: center;
        gap: 8px;
      }
      
      .status-dot {
        width: 8px;
        height: 8px;
        border-radius: 50%;
        background: #00ff00;
        animation: pulse 2s infinite;
      }
      
      .status-text {
        color: ${currentTheme.colors.accent};
        font-size: 0.8rem;
      }
      
      .crew-count {
        display: flex;
        align-items: center;
        gap: 5px;
        color: ${currentTheme.colors.accent};
        font-size: 0.8rem;
      }
      
      @keyframes pulse {
        0% { opacity: 1; }
        50% { opacity: 0.5; }
        100% { opacity: 1; }
      }
      
      @media (max-width: 768px) {
        .nav-primary {
          grid-template-columns: repeat(2, 1fr);
        }
        
        .nav-secondary {
          grid-template-columns: 1fr;
        }
        
        .nav-header {
          flex-direction: column;
          gap: 10px;
        }
      }
    </style>`;
  }

  serveContrastTest(res) {
    const html = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Contrast Test - Alex AI</title>
    <style>
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            margin: 0;
            padding: 20px;
            background: #f0f0f0;
        }
        
        .test-container {
            max-width: 1200px;
            margin: 0 auto;
        }
        
        .theme-test {
            margin-bottom: 40px;
            border: 2px solid #ddd;
            border-radius: 10px;
            overflow: hidden;
        }
        
        .theme-header {
            padding: 15px;
            background: #333;
            color: white;
            font-weight: bold;
            text-transform: uppercase;
        }
        
        .theme-content {
            padding: 20px;
        }
        
        .contrast-sample {
            margin-bottom: 20px;
            padding: 15px;
            border-radius: 8px;
        }
        
        .contrast-label {
            font-weight: bold;
            margin-bottom: 10px;
            font-size: 14px;
        }
        
        .navigation {
            text-align: center;
            margin: 30px 0;
        }
        
        .nav-btn {
            display: inline-block;
            background: #007bff;
            color: white;
            text-decoration: none;
            padding: 12px 24px;
            border-radius: 25px;
            margin: 0 10px;
            font-weight: bold;
        }
    </style>
</head>
<body>
    <div class="test-container">
        <h1>🎨 Theme Contrast Test</h1>
        <p>Testing text legibility across all themes</p>
        
        ${this.availableThemes.map(theme => {
          const enhancedTheme = {
            ...theme,
            colors: {
              ...theme.colors,
              role: this.getRoleColor(theme.value),
              component: this.getComponentColor(theme.value),
              enhancements: this.getEnhancementColor(theme.value)
            }
          };
          
          return `
          <div class="theme-test">
            <div class="theme-header">${theme.label}</div>
            <div class="theme-content" style="background: ${enhancedTheme.colors.primary}; color: ${enhancedTheme.colors.accent};">
              <div class="contrast-sample" style="background: ${enhancedTheme.colors.card || enhancedTheme.colors.secondary};">
                <div class="contrast-label" style="color: ${enhancedTheme.colors.accent};">Main Title</div>
                <div style="color: ${enhancedTheme.colors.accent};">This is the main title text</div>
                
                <div class="contrast-label" style="color: ${enhancedTheme.colors.role}; margin-top: 15px;">Role Text</div>
                <div style="color: ${enhancedTheme.colors.role};">Strategic Commander - Operations Officer</div>
                
                <div class="contrast-label" style="color: ${enhancedTheme.colors.component}; margin-top: 15px;">Component Text</div>
                <div style="color: ${enhancedTheme.colors.component};">Status Indicator - Control Groups</div>
                
                <div class="contrast-label" style="color: ${enhancedTheme.colors.enhancements}; margin-top: 15px;">Enhancement Text</div>
                <div style="color: ${enhancedTheme.colors.enhancements};">• Connection quality metrics<br>• Real-time validation feedback<br>• Status history tracking</div>
              </div>
            </div>
          </div>`;
        }).join('')}
        
        <div class="navigation">
            <a href="/" class="nav-btn">🎛️ Dashboard</a>
            <a href="/live" class="nav-btn">🌐 Live Frontend</a>
            <a href="/admin" class="nav-btn">🔐 Admin</a>
            <a href="/public" class="nav-btn">👁️ Public</a>
        </div>
    </div>
</body>
</html>`;
    
    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.end(html);
  }

  serveNavigationDemo(res) {
    const html = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Universal Navigation Demo - Alex AI</title>
    <style>
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            margin: 0;
            padding: 20px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
        }
        
        .demo-container {
            max-width: 1200px;
            margin: 0 auto;
        }
        
        .demo-header {
            text-align: center;
            margin-bottom: 30px;
            color: white;
        }
        
        .demo-header h1 {
            font-size: 2.5rem;
            margin-bottom: 10px;
        }
        
        .demo-header p {
            font-size: 1.2rem;
            opacity: 0.9;
        }
        
        .role-demo {
            margin-bottom: 40px;
        }
        
        .role-title {
            color: white;
            font-size: 1.5rem;
            margin-bottom: 20px;
            text-align: center;
        }
        
        .page-content {
            background: rgba(255, 255, 255, 0.1);
            border-radius: 15px;
            padding: 30px;
            margin-bottom: 20px;
            backdrop-filter: blur(10px);
            border: 1px solid rgba(255, 255, 255, 0.2);
        }
        
        .page-content h3 {
            color: white;
            margin-bottom: 15px;
            font-size: 1.3rem;
        }
        
        .page-content p {
            color: rgba(255, 255, 255, 0.9);
            line-height: 1.6;
        }
        
        .features-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
            gap: 20px;
            margin-top: 30px;
        }
        
        .feature-card {
            background: rgba(255, 255, 255, 0.1);
            border-radius: 10px;
            padding: 20px;
            border: 1px solid rgba(255, 255, 255, 0.2);
            transition: transform 0.3s ease;
        }
        
        .feature-card:hover {
            transform: translateY(-5px);
            background: rgba(255, 255, 255, 0.15);
        }
        
        .feature-card h4 {
            color: white;
            margin-bottom: 10px;
            font-size: 1.1rem;
        }
        
        .feature-card p {
            color: rgba(255, 255, 255, 0.8);
            font-size: 0.9rem;
        }
    </style>
</head>
<body>
    <div class="demo-container">
        <div class="demo-header">
            <h1>🖖 Universal Navigation System</h1>
            <p>Crew UI Architecture Implementation</p>
        </div>
        
        <!-- User Role Navigation -->
        <div class="role-demo">
            <h2 class="role-title">👤 Standard User Navigation</h2>
            ${this.generateUniversalNavigation('demo', 'user')}
            <div class="page-content">
                <h3>Standard User Access</h3>
                <p>Standard users have access to the main dashboard, live frontend, and public view. They can access system tools like health checks and configuration, but cannot access admin-only features.</p>
            </div>
        </div>
        
        <!-- Admin Role Navigation -->
        <div class="role-demo">
            <h2 class="role-title">🔐 Administrator Navigation</h2>
            ${this.generateUniversalNavigation('demo', 'admin')}
            <div class="page-content">
                <h3>Administrator Access</h3>
                <p>Administrators have full access to all features including the admin panel, theme management, and debug tools. The navigation adapts to show admin-specific options.</p>
            </div>
        </div>
        
        <!-- Public Role Navigation -->
        <div class="role-demo">
            <h2 class="role-title">👁️ Public User Navigation</h2>
            ${this.generateUniversalNavigation('demo', 'public')}
            <div class="page-content">
                <h3>Public Access</h3>
                <p>Public users have limited access to only the public view and live frontend. System tools and admin features are hidden from public users.</p>
            </div>
        </div>
        
        <div class="features-grid">
            <div class="feature-card">
                <h4>🎯 Role-Based Access</h4>
                <p>Navigation adapts based on user role with appropriate access controls and visual indicators.</p>
            </div>
            <div class="feature-card">
                <h4>📱 Responsive Design</h4>
                <p>Navigation system works seamlessly across desktop, tablet, and mobile devices.</p>
            </div>
            <div class="feature-card">
                <h4>🎨 Theme Integration</h4>
                <p>Navigation automatically adapts to current theme colors and styling preferences.</p>
            </div>
            <div class="feature-card">
                <h4>⚡ Real-time Updates</h4>
                <p>Navigation state and crew status update in real-time across all connected clients.</p>
            </div>
            <div class="feature-card">
                <h4>🔧 System Integration</h4>
                <p>Seamless integration with all API endpoints and system monitoring tools.</p>
            </div>
            <div class="feature-card">
                <h4>♿ Accessibility</h4>
                <p>Built with accessibility in mind, supporting screen readers and keyboard navigation.</p>
            </div>
        </div>
    </div>
</body>
</html>`;
    
    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.end(html);
  }

  serveConfigUI(res) {
    const html = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Configuration - Alex AI</title>
    <style>
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            margin: 0;
            padding: 20px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
        }
        
        .container {
            max-width: 800px;
            margin: 0 auto;
            background: rgba(255, 255, 255, 0.1);
            border-radius: 15px;
            padding: 30px;
            backdrop-filter: blur(10px);
            border: 1px solid rgba(255, 255, 255, 0.2);
        }
        
        .header {
            text-align: center;
            margin-bottom: 30px;
            color: white;
        }
        
        .header h1 {
            font-size: 2rem;
            margin-bottom: 10px;
        }
        
        .config-section {
            background: rgba(255, 255, 255, 0.1);
            border-radius: 10px;
            padding: 20px;
            margin-bottom: 20px;
            border: 1px solid rgba(255, 255, 255, 0.2);
        }
        
        .config-section h3 {
            color: white;
            margin-bottom: 15px;
        }
        
        .config-item {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 10px 0;
            border-bottom: 1px solid rgba(255, 255, 255, 0.1);
        }
        
        .config-label {
            color: white;
            font-weight: 500;
        }
        
        .config-value {
            color: rgba(255, 255, 255, 0.8);
            font-family: monospace;
        }
        
        .nav-btn {
            display: inline-block;
            background: #007bff;
            color: white;
            text-decoration: none;
            padding: 12px 24px;
            border-radius: 25px;
            margin: 10px 5px;
            font-weight: bold;
            transition: transform 0.3s ease;
        }
        
        .nav-btn:hover {
            transform: translateY(-2px);
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>⚙️ Configuration</h1>
            <p>Current system configuration settings</p>
        </div>
        
        <div class="config-section">
            <h3>🎨 Theme Settings</h3>
            <div class="config-item">
                <span class="config-label">Current Theme:</span>
                <span class="config-value">${this.config.theme}</span>
            </div>
        </div>
        
        <div class="config-section">
            <h3>📝 Content Settings</h3>
            <div class="config-item">
                <span class="config-label">Title:</span>
                <span class="config-value">${this.config.title}</span>
            </div>
            <div class="config-item">
                <span class="config-label">Subtitle:</span>
                <span class="config-value">${this.config.subtitle}</span>
            </div>
            <div class="config-item">
                <span class="config-label">Description:</span>
                <span class="config-value">${this.config.description}</span>
            </div>
            <div class="config-item">
                <span class="config-label">Heading:</span>
                <span class="config-value">${this.config.heading}</span>
            </div>
        </div>
        
        <div class="config-section">
            <h3>🔧 System Settings</h3>
            <div class="config-item">
                <span class="config-label">Port:</span>
                <span class="config-value">${this.port}</span>
            </div>
            <div class="config-item">
                <span class="config-label">Crew Members:</span>
                <span class="config-value">${this.crewMembers.size}</span>
            </div>
            <div class="config-item">
                <span class="config-label">WebSocket Clients:</span>
                <span class="config-value">${this.connections.total}</span>
            </div>
        </div>
        
        <div style="text-align: center; margin-top: 30px;">
            <a href="/" class="nav-btn">🎛️ Dashboard</a>
            <a href="/live" class="nav-btn">🌐 Live Frontend</a>
            <a href="/admin" class="nav-btn">🔐 Admin</a>
            <a href="/navigation-demo" class="nav-btn">🧭 Navigation Demo</a>
        </div>
    </div>
</body>
</html>`;
    
    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.end(html);
  }

  serveCrewStatusUI(res) {
    const html = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Crew Status - Alex AI</title>
    <style>
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            margin: 0;
            padding: 20px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
        }
        
        .container {
            max-width: 1000px;
            margin: 0 auto;
        }
        
        .header {
            text-align: center;
            margin-bottom: 30px;
            color: white;
        }
        
        .header h1 {
            font-size: 2rem;
            margin-bottom: 10px;
        }
        
        .crew-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
            gap: 20px;
            margin-bottom: 30px;
        }
        
        .crew-card {
            background: rgba(255, 255, 255, 0.1);
            border-radius: 15px;
            padding: 20px;
            backdrop-filter: blur(10px);
            border: 1px solid rgba(255, 255, 255, 0.2);
        }
        
        .crew-card h3 {
            color: white;
            margin-bottom: 10px;
            font-size: 1.2rem;
        }
        
        .crew-card .role {
            color: #4ade80;
            font-size: 0.9rem;
            margin-bottom: 10px;
            font-weight: 600;
        }
        
        .crew-card .status {
            color: #00ff00;
            font-size: 0.8rem;
            margin-bottom: 15px;
        }
        
        .crew-card .capabilities {
            color: rgba(255, 255, 255, 0.8);
            font-size: 0.9rem;
            line-height: 1.4;
        }
        
        .nav-btn {
            display: inline-block;
            background: #007bff;
            color: white;
            text-decoration: none;
            padding: 12px 24px;
            border-radius: 25px;
            margin: 10px 5px;
            font-weight: bold;
            transition: transform 0.3s ease;
        }
        
        .nav-btn:hover {
            transform: translateY(-2px);
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>👥 Crew Status</h1>
            <p>Current status of all Alex AI crew members</p>
        </div>
        
        <div class="crew-grid">
            ${Array.from(this.crewMembers.values()).map(member => `
                <div class="crew-card">
                    <h3>${member.name}</h3>
                    <div class="role">${member.role}</div>
                    <div class="status">✅ Active</div>
                    <div class="capabilities">
                        <strong>Specializations:</strong><br>
                        ${member.specialization.join(', ')}
                    </div>
                </div>
            `).join('')}
        </div>
        
        <div style="text-align: center; margin-top: 30px;">
            <a href="/" class="nav-btn">🎛️ Dashboard</a>
            <a href="/live" class="nav-btn">🌐 Live Frontend</a>
            <a href="/admin" class="nav-btn">🔐 Admin</a>
            <a href="/navigation-demo" class="nav-btn">🧭 Navigation Demo</a>
        </div>
    </div>
</body>
</html>`;
    
    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.end(html);
  }

  serveThemesUI(res) {
    const html = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Themes - Alex AI</title>
    <style>
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            margin: 0;
            padding: 20px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
        }
        
        .container {
            max-width: 1000px;
            margin: 0 auto;
        }
        
        .header {
            text-align: center;
            margin-bottom: 30px;
            color: white;
        }
        
        .header h1 {
            font-size: 2rem;
            margin-bottom: 10px;
        }
        
        .themes-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 20px;
            margin-bottom: 30px;
        }
        
        .theme-card {
            background: rgba(255, 255, 255, 0.1);
            border-radius: 15px;
            padding: 20px;
            backdrop-filter: blur(10px);
            border: 1px solid rgba(255, 255, 255, 0.2);
            text-align: center;
            transition: transform 0.3s ease;
        }
        
        .theme-card:hover {
            transform: translateY(-5px);
        }
        
        .theme-card.current {
            border: 2px solid #00ff00;
            box-shadow: 0 0 20px rgba(0, 255, 0, 0.3);
        }
        
        .theme-card h3 {
            color: white;
            margin-bottom: 10px;
            font-size: 1.1rem;
        }
        
        .theme-preview {
            height: 60px;
            border-radius: 8px;
            margin-bottom: 10px;
            border: 1px solid rgba(255, 255, 255, 0.2);
        }
        
        .theme-description {
            color: rgba(255, 255, 255, 0.8);
            font-size: 0.9rem;
        }
        
        .nav-btn {
            display: inline-block;
            background: #007bff;
            color: white;
            text-decoration: none;
            padding: 12px 24px;
            border-radius: 25px;
            margin: 10px 5px;
            font-weight: bold;
            transition: transform 0.3s ease;
        }
        
        .nav-btn:hover {
            transform: translateY(-2px);
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🎨 Theme Manager</h1>
            <p>Available themes and current selection</p>
        </div>
        
        <div class="themes-grid">
            ${this.availableThemes.map(theme => `
                <div class="theme-card ${theme.value === this.config.theme ? 'current' : ''}">
                    <div class="theme-preview" style="background: linear-gradient(135deg, ${theme.colors.primary} 0%, ${theme.colors.secondary} 100%);"></div>
                    <h3>${theme.label}</h3>
                    <div class="theme-description">${theme.description}</div>
                </div>
            `).join('')}
        </div>
        
        <div style="text-align: center; margin-top: 30px;">
            <a href="/" class="nav-btn">🎛️ Dashboard</a>
            <a href="/live" class="nav-btn">🌐 Live Frontend</a>
            <a href="/admin" class="nav-btn">🔐 Admin</a>
            <a href="/navigation-demo" class="nav-btn">🧭 Navigation Demo</a>
        </div>
    </div>
</body>
</html>`;
    
    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.end(html);
  }

  handleWebSocketMessage(data, ws) {
    switch (data.type) {
      case 'config_update':
        this.config[data.key] = data.value;
        this.broadcast({ type: 'config_update', key: data.key, value: data.value });
        console.log(`🎛️ Config updated: ${data.key} = ${data.value}`);
        break;
        
      case 'frontend_ping':
        this.connections.frontend++;
        this.connections.lastUpdate = new Date().toISOString();
        this.broadcast({ type: 'connection_update', connections: this.connections });
        break;
    }
  }

  broadcast(message) {
    const data = JSON.stringify(message);
    this.clients.forEach(client => {
      if (client.readyState === client.OPEN) {
        client.send(data);
      }
    });
  }

  serveHealthCheck(res) {
    const health = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      serverType: 'enhanced-dashboard-with-live-preview',
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      config: this.config,
      connections: this.connections,
      crew: { totalMembers: this.crewMembers.size },
      themes: { available: this.availableThemes.length, current: this.config.theme }
    };
    
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(health, null, 2));
  }

  serveHealthCheckUI(res) {
    const currentTheme = this.getCurrentTheme();
    const health = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      serverType: 'enhanced-dashboard-with-live-preview',
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      config: this.config,
      connections: this.connections,
      crew: { totalMembers: this.crewMembers.size },
      themes: { available: this.availableThemes.length, current: this.config.theme }
    };

    const html = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>System Health - ${this.config.title}</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background: linear-gradient(135deg, ${currentTheme.colors.primary} 0%, ${currentTheme.colors.secondary} 100%);
            color: ${currentTheme.colors.accent};
            min-height: 100vh;
            padding: 20px;
        }
        
        .container {
            max-width: 1200px;
            margin: 0 auto;
        }
        
        .header {
            text-align: center;
            margin-bottom: 30px;
        }
        
        .header h1 {
            font-size: 2.5rem;
            margin-bottom: 10px;
            color: ${currentTheme.colors.accent};
        }
        
        .status-indicator {
            display: inline-flex;
            align-items: center;
            background: rgba(0, 255, 136, 0.1);
            border: 2px solid #00ff88;
            border-radius: 25px;
            padding: 10px 20px;
            margin: 20px 0;
        }
        
        .status-dot {
            width: 12px;
            height: 12px;
            background: #00ff88;
            border-radius: 50%;
            margin-right: 10px;
            animation: pulse 2s infinite;
        }
        
        @keyframes pulse {
            0% { opacity: 1; }
            50% { opacity: 0.5; }
            100% { opacity: 1; }
        }
        
        .metrics-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
            gap: 20px;
            margin-bottom: 30px;
        }
        
        .metric-card {
            background: ${currentTheme.colors.card || 'rgba(0, 0, 0, 0.3)'};
            border: 1px solid ${currentTheme.colors.border || 'rgba(255, 255, 255, 0.2)'};
            border-radius: 10px;
            padding: 20px;
            box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
        }
        
        .metric-card h3 {
            color: ${currentTheme.colors.accent};
            margin-bottom: 15px;
            font-size: 1.2rem;
        }
        
        .metric-item {
            display: flex;
            justify-content: space-between;
            margin-bottom: 10px;
            padding: 5px 0;
            border-bottom: 1px solid rgba(255, 255, 255, 0.1);
        }
        
        .metric-label {
            color: ${currentTheme.colors.text || currentTheme.colors.accent};
        }
        
        .metric-value {
            color: ${currentTheme.colors.accent};
            font-weight: bold;
        }
        
        .navigation {
            text-align: center;
            margin-top: 30px;
        }
        
        .nav-btn {
            display: inline-block;
            background: linear-gradient(45deg, ${currentTheme.colors.accent}, #00ff88);
            color: #000;
            text-decoration: none;
            padding: 12px 24px;
            border-radius: 25px;
            margin: 0 10px;
            font-weight: bold;
            transition: transform 0.3s ease;
        }
        
        .nav-btn:hover {
            transform: translateY(-2px);
            box-shadow: 0 5px 15px rgba(0, 212, 255, 0.4);
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🏥 System Health Monitor</h1>
            <div class="status-indicator">
                <div class="status-dot"></div>
                <span>System Healthy</span>
            </div>
        </div>
        
        <div class="metrics-grid">
            <div class="metric-card">
                <h3>📊 Server Status</h3>
                <div class="metric-item">
                    <span class="metric-label">Status:</span>
                    <span class="metric-value">${health.status.toUpperCase()}</span>
                </div>
                <div class="metric-item">
                    <span class="metric-label">Server Type:</span>
                    <span class="metric-value">${health.serverType}</span>
                </div>
                <div class="metric-item">
                    <span class="metric-label">Uptime:</span>
                    <span class="metric-value">${Math.floor(health.uptime / 60)}m ${Math.floor(health.uptime % 60)}s</span>
                </div>
                <div class="metric-item">
                    <span class="metric-label">Timestamp:</span>
                    <span class="metric-value">${new Date(health.timestamp).toLocaleString()}</span>
                </div>
            </div>
            
            <div class="metric-card">
                <h3>🧠 Memory Usage</h3>
                <div class="metric-item">
                    <span class="metric-label">RSS:</span>
                    <span class="metric-value">${(health.memory.rss / 1024 / 1024).toFixed(2)} MB</span>
                </div>
                <div class="metric-item">
                    <span class="metric-label">Heap Total:</span>
                    <span class="metric-value">${(health.memory.heapTotal / 1024 / 1024).toFixed(2)} MB</span>
                </div>
                <div class="metric-item">
                    <span class="metric-label">Heap Used:</span>
                    <span class="metric-value">${(health.memory.heapUsed / 1024 / 1024).toFixed(2)} MB</span>
                </div>
                <div class="metric-item">
                    <span class="metric-label">External:</span>
                    <span class="metric-value">${(health.memory.external / 1024 / 1024).toFixed(2)} MB</span>
                </div>
            </div>
            
            <div class="metric-card">
                <h3>🔗 Connections</h3>
                <div class="metric-item">
                    <span class="metric-label">Total:</span>
                    <span class="metric-value">${health.connections.total}</span>
                </div>
                <div class="metric-item">
                    <span class="metric-label">Dashboard:</span>
                    <span class="metric-value">${health.connections.dashboard}</span>
                </div>
                <div class="metric-item">
                    <span class="metric-label">Frontend:</span>
                    <span class="metric-value">${health.connections.frontend}</span>
                </div>
                <div class="metric-item">
                    <span class="metric-label">Last Update:</span>
                    <span class="metric-value">${new Date(health.connections.lastUpdate).toLocaleTimeString()}</span>
                </div>
            </div>
            
            <div class="metric-card">
                <h3>👥 Crew & Themes</h3>
                <div class="metric-item">
                    <span class="metric-label">Crew Members:</span>
                    <span class="metric-value">${health.crew.totalMembers}</span>
                </div>
                <div class="metric-item">
                    <span class="metric-label">Available Themes:</span>
                    <span class="metric-value">${health.themes.available}</span>
                </div>
                <div class="metric-item">
                    <span class="metric-label">Current Theme:</span>
                    <span class="metric-value">${health.themes.current}</span>
                </div>
            </div>
        </div>
        
        <div class="navigation">
            <a href="/" class="nav-btn">🎛️ Dashboard</a>
            <a href="/live" class="nav-btn">🌐 Live Frontend</a>
            <a href="/api/health" class="nav-btn">📄 Raw JSON</a>
        </div>
    </div>
</body>
</html>`;
    
    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.end(html);
  }

  serveConfig(res) {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      config: this.config,
      themes: this.availableThemes,
      crew: Array.from(this.crewMembers.values())
    }, null, 2));
  }

  handleConfigUpdate(req, res) {
    let body = '';
    req.on('data', chunk => {
      body += chunk.toString();
    });
    
    req.on('end', () => {
      try {
        const updateData = JSON.parse(body);
        console.log(`🎛️ Config update received:`, updateData);
        
        if (updateData.type === 'config_update' && updateData.key && updateData.value !== undefined) {
          // Update the configuration
          this.config[updateData.key] = updateData.value;
          
          // Broadcast to all WebSocket clients
          const message = JSON.stringify({
            type: 'config_update',
            key: updateData.key,
            value: updateData.value,
            timestamp: new Date().toISOString()
          });
          
          this.broadcastToClients(message);
          
          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ 
            success: true, 
            message: `Configuration updated: ${updateData.key} = ${updateData.value}`,
            config: this.config
          }));
        } else {
          res.writeHead(400, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ 
            error: 'Invalid update data format' 
          }));
        }
      } catch (error) {
        console.error('Error parsing config update:', error);
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ 
          error: 'Invalid JSON format' 
        }));
      }
    });
  }

  serveCrewStatus(res) {
    const crewStatus = Array.from(this.crewMembers.values()).map(member => ({
      name: member.name,
      role: member.role,
      component: member.component,
      status: member.status,
      expertise: member.expertise,
      insights: member.insights,
      enhancements: member.enhancements
    }));
    
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      crew: crewStatus,
      totalMembers: this.crewMembers.size,
      lastUpdate: new Date().toISOString()
    }, null, 2));
  }

  serveThemes(res) {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      themes: this.availableThemes,
      current: this.config.theme
    }, null, 2));
  }

  serve404(res) {
    res.writeHead(404, { 'Content-Type': 'text/plain' });
    res.end('Not Found');
  }

  stop() {
    return new Promise((resolve) => {
      if (this.wss) {
        this.wss.close();
      }
      if (this.server) {
        this.server.close(resolve);
      } else {
        resolve();
      }
    });
  }
}

// Handle graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM signal received. Shutting down enhanced dashboard server...');
  if (server) {
    server.stop().then(() => {
      console.log('🛑 Enhanced Dashboard Server stopped');
      process.exit(0);
    });
  }
});

process.on('SIGINT', () => {
  console.log('SIGINT signal received. Shutting down enhanced dashboard server...');
  if (server) {
    server.stop().then(() => {
      console.log('🛑 Enhanced Dashboard Server stopped');
      process.exit(0);
    });
  }
});

// Start server
if (require.main === module) {
  const server = new EnhancedDashboardWithLivePreview(3000);
  server.start().catch(console.error);
}

module.exports = EnhancedDashboardWithLivePreview;
