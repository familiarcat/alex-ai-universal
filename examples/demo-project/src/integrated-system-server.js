const http = require('http');
const fs = require('fs');
const path = require('path');
const { Server } = require('socket.io');
const open = require('open');

class IntegratedSystemServer {
  constructor(frontendPort = 3000, dashboardPort = 3001) {
    this.frontendPort = frontendPort;
    this.dashboardPort = dashboardPort;
    this.frontendServer = null;
    this.dashboardServer = null;
    this.frontendIO = null;
    this.dashboardIO = null;
    this.isRunning = false;
    
    // Shared configuration state
    this.config = {
      title: '🖖 Alex AI Universal',
      subtitle: 'Enhanced Interactive Dashboard',
      description: 'Advanced control panel with deep interactivity and crew intelligence monitoring.',
      footer: '© 2024 Alex AI Universal - Theme State Fix MVP',
      theme: 'star-trek',
      showSidebar: true,
      sidebarWidth: 300,
      fontSize: 16,
      animations: true,
      accessibility: false,
      performance: 'balanced'
    };

    this.crewMembers = new Map();
    this.connectionStats = {
      total: 0,
      frontend: 0,
      dashboard: 0,
      lastUpdate: new Date()
    };
    
    this.initializeCrewMembers();
  }

  initializeCrewMembers() {
    const crewData = [
      {
        id: 'picard',
        name: 'Captain Jean-Luc Picard',
        role: 'Strategic Commander',
        specialty: 'Strategic Leadership & Mission Planning',
        status: 'active',
        lastActivity: new Date(),
        currentTask: 'Theme State Fix MVP Coordination',
        performance: { efficiency: 95, accuracy: 98, innovation: 92 }
      },
      {
        id: 'riker',
        name: 'Commander William Riker',
        role: 'First Officer',
        specialty: 'Tactical Operations & Workflow Management',
        status: 'active',
        lastActivity: new Date(),
        currentTask: 'Real-Time Dashboard Control Implementation',
        performance: { efficiency: 94, accuracy: 96, innovation: 89 }
      },
      {
        id: 'data',
        name: 'Commander Data',
        role: 'Operations Officer',
        specialty: 'Technical Analysis & AI/ML Integration',
        status: 'active',
        lastActivity: new Date(),
        currentTask: 'CSS Class Management System Design',
        performance: { efficiency: 99, accuracy: 99, innovation: 97 }
      },
      {
        id: 'laforge',
        name: 'Lieutenant Commander Geordi La Forge',
        role: 'Chief Engineer',
        specialty: 'System Engineering & Infrastructure',
        status: 'active',
        lastActivity: new Date(),
        currentTask: 'Build System Optimization',
        performance: { efficiency: 96, accuracy: 95, innovation: 94 }
      },
      {
        id: 'worf',
        name: 'Lieutenant Worf',
        role: 'Security Officer',
        specialty: 'Security Protocols & Compliance',
        status: 'active',
        lastActivity: new Date(),
        currentTask: 'Security Validation & Compliance Audit',
        performance: { efficiency: 93, accuracy: 98, innovation: 87 }
      },
      {
        id: 'troi',
        name: 'Counselor Deanna Troi',
        role: 'Ship\'s Counselor',
        specialty: 'User Experience & Communication',
        status: 'active',
        lastActivity: new Date(),
        currentTask: 'Enhanced Visual Feedback System Design',
        performance: { efficiency: 91, accuracy: 94, innovation: 93 }
      },
      {
        id: 'crusher',
        name: 'Dr. Beverly Crusher',
        role: 'Chief Medical Officer',
        specialty: 'System Health & Performance Diagnostics',
        status: 'active',
        lastActivity: new Date(),
        currentTask: 'System Health Monitoring Implementation',
        performance: { efficiency: 94, accuracy: 97, innovation: 90 }
      },
      {
        id: 'uhura',
        name: 'Lieutenant Uhura',
        role: 'Communications Officer',
        specialty: 'Communication Protocols & Synchronization',
        status: 'active',
        lastActivity: new Date(),
        currentTask: 'WebSocket Communication Enhancement',
        performance: { efficiency: 95, accuracy: 96, innovation: 91 }
      },
      {
        id: 'quark',
        name: 'Quark',
        role: 'Business Operations',
        specialty: 'Cost Optimization & Efficiency Analysis',
        status: 'active',
        lastActivity: new Date(),
        currentTask: 'Performance Metrics & Resource Optimization',
        performance: { efficiency: 92, accuracy: 93, innovation: 88 }
      }
    ];

    crewData.forEach(member => {
      this.crewMembers.set(member.id, member);
    });
  }

  generateFrontendHTML() {
    const theme = this.config.theme;
    const themes = {
      'star-trek': { bg: 'linear-gradient(135deg, #1e3c72 0%, #2a5298 100%)', text: '#ffffff', accent: '#ffd700' },
      'minimal': { bg: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)', text: '#2c3e50', accent: '#3498db' },
      'dark': { bg: 'linear-gradient(135deg, #2c3e50 0%, #34495e 100%)', text: '#ffffff', accent: '#e74c3c' },
      'modern': { bg: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', text: '#ffffff', accent: '#f093fb' },
      'classic': { bg: 'linear-gradient(135deg, #8b4513 0%, #cd853f 100%)', text: '#ffffff', accent: '#daa520' },
      'corporate': { bg: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)', text: '#ffffff', accent: '#0f3460' }
    };

    const currentTheme = themes[theme] || themes['star-trek'];
    const sidebarWidth = this.config.sidebarWidth;
    const showSidebar = this.config.showSidebar;
    const fontSize = this.config.fontSize;

    return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${this.config.title}</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
            background: ${currentTheme.bg};
            color: ${currentTheme.text};
            min-height: 100vh;
            line-height: 1.6;
            font-size: ${fontSize}px;
            transition: all 0.3s ease;
        }

        .container {
            display: flex;
            min-height: 100vh;
            transition: all 0.3s ease;
        }

        .sidebar {
            width: ${showSidebar ? sidebarWidth : 0}px;
            background: rgba(0, 0, 0, 0.2);
            backdrop-filter: blur(10px);
            padding: 20px;
            transition: all 0.3s ease;
            overflow: hidden;
            ${showSidebar ? '' : 'display: none;'}
        }

        .main-content {
            flex: 1;
            padding: 40px;
            transition: all 0.3s ease;
        }

        .header {
            text-align: center;
            margin-bottom: 40px;
        }

        .header h1 {
            font-size: 3em;
            margin-bottom: 20px;
            color: ${currentTheme.accent};
        }

        .header .subtitle {
            font-size: 1.5em;
            opacity: 0.8;
            margin-bottom: 30px;
        }

        .header .description {
            font-size: 1.1em;
            opacity: 0.9;
            max-width: 800px;
            margin: 0 auto;
        }

        .content-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
            gap: 30px;
            margin: 40px 0;
        }

        .content-card {
            background: rgba(255, 255, 255, 0.1);
            backdrop-filter: blur(10px);
            border-radius: 15px;
            padding: 30px;
            border: 1px solid rgba(255, 255, 255, 0.2);
            transition: all 0.3s ease;
        }

        .content-card:hover {
            transform: translateY(-5px);
            box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
        }

        .content-card h3 {
            color: ${currentTheme.accent};
            margin-bottom: 15px;
            font-size: 1.3em;
        }

        .footer {
            text-align: center;
            margin-top: 60px;
            padding: 20px;
            opacity: 0.7;
        }

        .status-indicator {
            position: fixed;
            top: 20px;
            right: 20px;
            background: rgba(0, 0, 0, 0.8);
            color: white;
            padding: 10px 15px;
            border-radius: 20px;
            font-size: 0.9em;
            z-index: 1000;
        }

        .status-indicator.connected {
            background: rgba(46, 204, 113, 0.8);
        }

        @media (max-width: 768px) {
            .container {
                flex-direction: column;
            }
            
            .sidebar {
                width: 100%;
                height: auto;
            }
            
            .content-grid {
                grid-template-columns: 1fr;
            }
        }
    </style>
</head>
<body>
    <div class="status-indicator" id="statusIndicator">Connecting...</div>
    
    <div class="container">
        <div class="sidebar">
            <h3>🎛️ Dashboard Controls</h3>
            <p>This sidebar is controlled by the dashboard. Changes made in the dashboard will update this interface in real-time.</p>
            <br>
            <p><strong>Current Theme:</strong> ${theme}</p>
            <p><strong>Sidebar Width:</strong> ${sidebarWidth}px</p>
            <p><strong>Font Size:</strong> ${fontSize}px</p>
            <p><strong>Animations:</strong> ${this.config.animations ? 'Enabled' : 'Disabled'}</p>
        </div>
        
        <div class="main-content">
            <div class="header">
                <h1 id="pageTitle">${this.config.title}</h1>
                <div class="subtitle" id="pageSubtitle">${this.config.subtitle}</div>
                <div class="description" id="pageDescription">${this.config.description}</div>
            </div>
            
            <div class="content-grid">
                <div class="content-card">
                    <h3>🎨 Theme Management</h3>
                    <p>Current theme: <strong>${theme}</strong></p>
                    <p>This entire interface is controlled by our dashboard system. All themes, layouts, and content can be modified in real-time.</p>
                </div>
                
                <div class="content-card">
                    <h3>👥 Crew Status</h3>
                    <p>All 9 crew members are active and monitoring system performance.</p>
                    <p>Real-time updates ensure optimal system operation.</p>
                </div>
                
                <div class="content-card">
                    <h3>⚡ Real-Time Control</h3>
                    <p>This frontend is completely controlled by the dashboard interface.</p>
                    <p>Changes made in the dashboard appear instantly here.</p>
                </div>
                
                <div class="content-card">
                    <h3>🔗 Live Synchronization</h3>
                    <p>Bidirectional communication ensures perfect synchronization.</p>
                    <p>All modifications are applied in real-time across the system.</p>
                </div>
            </div>
            
            <div class="footer" id="pageFooter">
                ${this.config.footer}
            </div>
        </div>
    </div>

    <script src="/socket.io/socket.io.js"></script>
    <script>
        const socket = io();
        const statusIndicator = document.getElementById('statusIndicator');
        
        socket.on('connect', function() {
            statusIndicator.textContent = '🟢 Connected';
            statusIndicator.className = 'status-indicator connected';
        });
        
        socket.on('disconnect', function() {
            statusIndicator.textContent = '🔴 Disconnected';
            statusIndicator.className = 'status-indicator';
        });
        
        socket.on('content-update', function(data) {
            const element = document.getElementById('page' + data.target.charAt(0).toUpperCase() + data.target.slice(1));
            if (element) {
                element.textContent = data.value;
            }
        });
        
        socket.on('theme-update', function(data) {
            location.reload(); // Reload to apply new theme
        });
        
        socket.on('layout-update', function(data) {
            if (data.target === 'showSidebar') {
                location.reload(); // Reload to apply layout changes
            }
        });
        
        socket.on('configuration-update', function(data) {
            location.reload(); // Reload to apply full configuration
        });
    </script>
</body>
</html>
    `;
  }

  generateDashboardHTML() {
    return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>🖖 Alex AI Enhanced Interactive Dashboard</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
            background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
            color: #2c3e50;
            min-height: 100vh;
            line-height: 1.6;
        }

        .dashboard-container {
            max-width: 1400px;
            margin: 0 auto;
            padding: 20px;
        }

        .header {
            background: rgba(255, 255, 255, 0.95);
            backdrop-filter: blur(10px);
            border-radius: 12px;
            padding: 24px;
            margin-bottom: 24px;
            box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
            border: 1px solid rgba(255, 255, 255, 0.2);
        }

        .header h1 {
            font-size: 28px;
            font-weight: 600;
            color: #2c3e50;
            margin-bottom: 8px;
        }

        .header .subtitle {
            color: #7f8c8d;
            font-size: 16px;
        }

        .status-bar {
            display: flex;
            gap: 16px;
            margin-top: 16px;
            flex-wrap: wrap;
        }

        .status-item {
            background: rgba(52, 152, 219, 0.1);
            border: 1px solid rgba(52, 152, 219, 0.2);
            border-radius: 8px;
            padding: 12px 16px;
            font-size: 14px;
            color: #2c3e50;
        }

        .status-item.active {
            background: rgba(46, 204, 113, 0.1);
            border-color: rgba(46, 204, 113, 0.3);
        }

        .main-content {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 24px;
            margin-bottom: 24px;
        }

        .panel {
            background: rgba(255, 255, 255, 0.95);
            backdrop-filter: blur(10px);
            border-radius: 12px;
            padding: 24px;
            box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
            border: 1px solid rgba(255, 255, 255, 0.2);
        }

        .panel h2 {
            font-size: 20px;
            font-weight: 600;
            color: #2c3e50;
            margin-bottom: 16px;
        }

        .control-group {
            margin-bottom: 20px;
        }

        .control-group h3 {
            font-size: 16px;
            font-weight: 600;
            color: #2c3e50;
            margin-bottom: 12px;
            padding-bottom: 8px;
            border-bottom: 2px solid rgba(52, 152, 219, 0.2);
        }

        .control-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 12px;
        }

        .control-item {
            background: rgba(248, 249, 250, 0.8);
            border: 1px solid rgba(0, 0, 0, 0.1);
            border-radius: 6px;
            padding: 12px;
            transition: all 0.3s ease;
        }

        .control-item:hover {
            background: rgba(52, 152, 219, 0.05);
            border-color: rgba(52, 152, 219, 0.3);
        }

        .control-label {
            font-weight: 500;
            color: #2c3e50;
            margin-bottom: 4px;
            font-size: 14px;
        }

        .control-description {
            font-size: 12px;
            color: #7f8c8d;
            margin-bottom: 8px;
        }

        .control-input, .control-select {
            width: 100%;
            padding: 6px 8px;
            border: 1px solid rgba(0, 0, 0, 0.2);
            border-radius: 4px;
            font-size: 13px;
            background: rgba(255, 255, 255, 0.8);
        }

        .btn {
            background: rgba(52, 152, 219, 0.8);
            color: white;
            border: none;
            padding: 8px 16px;
            border-radius: 6px;
            cursor: pointer;
            font-size: 13px;
            font-weight: 500;
            transition: all 0.3s ease;
            margin: 5px;
        }

        .btn:hover {
            background: rgba(52, 152, 219, 1);
            transform: translateY(-1px);
        }

        .btn.secondary {
            background: rgba(149, 165, 166, 0.8);
        }

        .btn.secondary:hover {
            background: rgba(149, 165, 166, 1);
        }

        .log-section {
            margin-top: 24px;
            max-height: 300px;
            overflow-y: auto;
        }

        .log-entry {
            background: rgba(248, 249, 250, 0.8);
            border: 1px solid rgba(0, 0, 0, 0.1);
            border-radius: 6px;
            padding: 8px 12px;
            margin-bottom: 8px;
            font-size: 12px;
            color: #2c3e50;
        }

        .log-entry.success {
            border-left: 4px solid #27ae60;
        }

        .log-entry.error {
            border-left: 4px solid #e74c3c;
        }

        .log-entry.info {
            border-left: 4px solid #3498db;
        }
    </style>
</head>
<body>
    <div class="dashboard-container">
        <div class="header">
            <h1>🖖 Alex AI Enhanced Interactive Dashboard</h1>
            <div class="subtitle">Advanced Control Panel with Real-Time Frontend Control</div>
            <div class="status-bar">
                <div class="status-item active">🟢 System Operational</div>
                <div class="status-item active">👥 9 Crew Members Active</div>
                <div class="status-item active">🔗 Real-Time Sync Active</div>
                <div class="status-item active">🎛️ Dashboard Mode</div>
            </div>
        </div>

        <div class="main-content">
            <div class="panel">
                <h2>🎛️ Real-Time Control Panel</h2>
                <div class="control-group">
                    <h3>📝 Content Management</h3>
                    <div class="control-grid">
                        <div class="control-item">
                            <div class="control-label">Page Title</div>
                            <div class="control-description">Main page title displayed in browser and header</div>
                            <input type="text" class="control-input" id="titleInput" value="${this.config.title}">
                        </div>
                        <div class="control-item">
                            <div class="control-label">Subtitle</div>
                            <div class="control-description">Descriptive subtitle below main title</div>
                            <input type="text" class="control-input" id="subtitleInput" value="${this.config.subtitle}">
                        </div>
                        <div class="control-item">
                            <div class="control-label">Description</div>
                            <div class="control-description">Main content description text</div>
                            <textarea class="control-input" id="descriptionInput" rows="3">${this.config.description}</textarea>
                        </div>
                        <div class="control-item">
                            <div class="control-label">Footer Text</div>
                            <div class="control-description">Footer content and copyright information</div>
                            <input type="text" class="control-input" id="footerInput" value="${this.config.footer}">
                        </div>
                    </div>
                </div>

                <div class="control-group">
                    <h3>🎨 Layout & Design</h3>
                    <div class="control-grid">
                        <div class="control-item">
                            <div class="control-label">Theme Selection</div>
                            <div class="control-description">Choose from 6 available themes with distinct visual styles</div>
                            <select class="control-select" id="themeSelect">
                                <option value="star-trek" ${this.config.theme === 'star-trek' ? 'selected' : ''}>🖖 Star Trek Theme</option>
                                <option value="minimal" ${this.config.theme === 'minimal' ? 'selected' : ''}>⚪ Minimal Theme</option>
                                <option value="dark" ${this.config.theme === 'dark' ? 'selected' : ''}>🌙 Dark Theme</option>
                                <option value="modern" ${this.config.theme === 'modern' ? 'selected' : ''}>✨ Modern Theme</option>
                                <option value="classic" ${this.config.theme === 'classic' ? 'selected' : ''}>📜 Classic Theme</option>
                                <option value="corporate" ${this.config.theme === 'corporate' ? 'selected' : ''}>🏢 Corporate Theme</option>
                            </select>
                        </div>
                        <div class="control-item">
                            <div class="control-label">Sidebar Visibility</div>
                            <div class="control-description">Toggle sidebar display for navigation elements</div>
                            <select class="control-select" id="sidebarSelect">
                                <option value="true" ${this.config.showSidebar ? 'selected' : ''}>Show Sidebar</option>
                                <option value="false" ${!this.config.showSidebar ? 'selected' : ''}>Hide Sidebar</option>
                            </select>
                        </div>
                        <div class="control-item">
                            <div class="control-label">Sidebar Width</div>
                            <div class="control-description">Adjust sidebar width (200px - 400px)</div>
                            <input type="range" class="control-input" id="sidebarWidth" min="200" max="400" value="${this.config.sidebarWidth}">
                            <span id="sidebarWidthValue">${this.config.sidebarWidth}px</span>
                        </div>
                        <div class="control-item">
                            <div class="control-label">Font Size</div>
                            <div class="control-description">Global font size adjustment (12px - 20px)</div>
                            <input type="range" class="control-input" id="fontSize" min="12" max="20" value="${this.config.fontSize}">
                            <span id="fontSizeValue">${this.config.fontSize}px</span>
                        </div>
                    </div>
                </div>

                <div style="margin-top: 20px; text-align: center;">
                    <button class="btn" onclick="applyChanges()">🚀 Apply Changes</button>
                    <button class="btn secondary" onclick="resetToDefaults()">🔄 Reset to Defaults</button>
                </div>
            </div>

            <div class="panel">
                <h2>📊 System Status</h2>
                <div class="log-section" id="logSection">
                    <div class="log-entry info">
                        <strong>${new Date().toLocaleTimeString()}</strong> - Integrated system initialized successfully
                    </div>
                </div>
            </div>
        </div>
    </div>

    <script src="/socket.io/socket.io.js"></script>
    <script>
        const socket = io();
        
        let currentConfig = ${JSON.stringify(this.config)};

        document.addEventListener('DOMContentLoaded', function() {
            setupEventListeners();
        });

        function setupEventListeners() {
            document.getElementById('sidebarWidth').addEventListener('input', function(e) {
                document.getElementById('sidebarWidthValue').textContent = e.target.value + 'px';
            });

            document.getElementById('fontSize').addEventListener('input', function(e) {
                document.getElementById('fontSizeValue').textContent = e.target.value + 'px';
            });
        }

        function applyChanges() {
            currentConfig.title = document.getElementById('titleInput').value;
            currentConfig.subtitle = document.getElementById('subtitleInput').value;
            currentConfig.description = document.getElementById('descriptionInput').value;
            currentConfig.footer = document.getElementById('footerInput').value;
            currentConfig.theme = document.getElementById('themeSelect').value;
            currentConfig.showSidebar = document.getElementById('sidebarSelect').value === 'true';
            currentConfig.sidebarWidth = parseInt(document.getElementById('sidebarWidth').value);
            currentConfig.fontSize = parseInt(document.getElementById('fontSize').value);

            socket.emit('dashboard-command', {
                type: 'configuration',
                data: currentConfig,
                timestamp: new Date().toISOString()
            });

            addLogEntry(\`Configuration applied: \${JSON.stringify(currentConfig)}\`, 'success');
        }

        function resetToDefaults() {
            currentConfig = {
                title: '🖖 Alex AI Universal',
                subtitle: 'Enhanced Interactive Dashboard',
                description: 'Advanced control panel with deep interactivity and crew intelligence monitoring.',
                footer: '© 2024 Alex AI Universal - Theme State Fix MVP',
                theme: 'star-trek',
                showSidebar: true,
                sidebarWidth: 300,
                fontSize: 16,
                animations: true,
                accessibility: false,
                performance: 'balanced'
            };

            Object.keys(currentConfig).forEach(key => {
                const element = document.getElementById(key + 'Input') || 
                              document.getElementById(key + 'Select');
                if (element) {
                    element.value = currentConfig[key];
                }
            });

            document.getElementById('sidebarWidthValue').textContent = currentConfig.sidebarWidth + 'px';
            document.getElementById('fontSizeValue').textContent = currentConfig.fontSize + 'px';

            addLogEntry('Configuration reset to defaults', 'info');
        }

        function addLogEntry(message, type = 'info') {
            const logSection = document.getElementById('logSection');
            const logEntry = document.createElement('div');
            logEntry.className = \`log-entry \${type}\`;
            logEntry.innerHTML = \`
                <strong>\${new Date().toLocaleTimeString()}</strong> - \${message}
            \`;
            logSection.insertBefore(logEntry, logSection.firstChild);

            while (logSection.children.length > 50) {
                logSection.removeChild(logSection.lastChild);
            }
        }

        socket.on('connect', function() {
            addLogEntry('Connected to integrated system', 'success');
        });

        socket.on('disconnect', function() {
            addLogEntry('Disconnected from integrated system', 'error');
        });
    </script>
</body>
</html>
    `;
  }

  async start() {
    return new Promise((resolve, reject) => {
      try {
        // Start Frontend Server (Port 3000)
        this.frontendServer = http.createServer((req, res) => {
          const url = new URL(req.url, `http://${req.headers.host}`);
          
          if (url.pathname === '/') {
            res.writeHead(200, { 'Content-Type': 'text/html' });
            res.end(this.generateFrontendHTML());
          } else if (url.pathname === '/api/health') {
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({
              status: 'healthy',
              timestamp: new Date().toISOString(),
              serverType: 'integrated-frontend',
              uptime: process.uptime(),
              memory: process.memoryUsage(),
              config: this.config,
              connections: this.connectionStats
            }));
          } else {
            res.writeHead(404, { 'Content-Type': 'text/html' });
            res.end('<h1>404 Not Found</h1>');
          }
        });

        // Start Dashboard Server (Port 3001)
        this.dashboardServer = http.createServer((req, res) => {
          const url = new URL(req.url, `http://${req.headers.host}`);
          
          if (url.pathname === '/') {
            res.writeHead(200, { 'Content-Type': 'text/html' });
            res.end(this.generateDashboardHTML());
          } else if (url.pathname === '/api/health') {
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({
              status: 'healthy',
              timestamp: new Date().toISOString(),
              serverType: 'integrated-dashboard',
              uptime: process.uptime(),
              memory: process.memoryUsage(),
              config: this.config,
              connections: this.connectionStats
            }));
          } else {
            res.writeHead(404, { 'Content-Type': 'text/html' });
            res.end('<h1>404 Not Found</h1>');
          }
        });

        // Setup Socket.IO for both servers
        this.frontendIO = new Server(this.frontendServer, {
          cors: { origin: "*", methods: ["GET", "POST"] }
        });

        this.dashboardIO = new Server(this.dashboardServer, {
          cors: { origin: "*", methods: ["GET", "POST"] }
        });

        // Handle frontend connections
        this.frontendIO.on('connection', (socket) => {
          this.connectionStats.total++;
          this.connectionStats.frontend++;
          this.connectionStats.lastUpdate = new Date();

          socket.emit('configuration-update', {
            config: this.config,
            timestamp: new Date().toISOString()
          });
        });

        // Handle dashboard connections
        this.dashboardIO.on('connection', (socket) => {
          this.connectionStats.total++;
          this.connectionStats.dashboard++;
          this.connectionStats.lastUpdate = new Date();

          socket.on('dashboard-command', (data) => {
            this.handleDashboardCommand(socket, data);
          });
        });

        // Start both servers
        Promise.all([
          new Promise((resolve) => this.frontendServer.listen(this.frontendPort, resolve)),
          new Promise((resolve) => this.dashboardServer.listen(this.dashboardPort, resolve))
        ]).then(() => {
          this.isRunning = true;
          console.log(`🖖 Alex AI Integrated System Server running:`);
          console.log(`🌐 Frontend: http://localhost:${this.frontendPort}`);
          console.log(`🎛️ Dashboard: http://localhost:${this.dashboardPort}`);
          console.log(`🏥 Health Checks:`);
          console.log(`   - Frontend: http://localhost:${this.frontendPort}/api/health`);
          console.log(`   - Dashboard: http://localhost:${this.dashboardPort}/api/health`);
          console.log(`👥 Crew Members: ${this.crewMembers.size} active`);
          console.log(`✅ Integrated real-time control system ready`);
          console.log(`🔄 WebSocket connections enabled for both servers`);
          resolve();
        }).catch(reject);

      } catch (error) {
        reject(error);
      }
    });
  }

  handleDashboardCommand(socket, data) {
    try {
      const { type, data: configData } = data;
      
      if (type === 'configuration') {
        // Update shared configuration
        this.config = { ...this.config, ...configData };
        
        // Broadcast to frontend
        this.frontendIO.emit('configuration-update', {
          config: this.config,
          timestamp: new Date().toISOString()
        });

        // Broadcast to dashboard
        this.dashboardIO.emit('configuration-update', {
          config: this.config,
          timestamp: new Date().toISOString()
        });

        socket.emit('dashboard-update', {
          message: 'Configuration updated and synchronized',
          timestamp: new Date().toISOString()
        });
      }

    } catch (error) {
      socket.emit('dashboard-update', {
        message: `Error processing command: ${error.message}`,
        timestamp: new Date().toISOString()
      });
    }
  }

  async stop() {
    return new Promise((resolve) => {
      if (this.frontendServer && this.dashboardServer && this.isRunning) {
        Promise.all([
          new Promise((resolve) => this.frontendServer.close(resolve)),
          new Promise((resolve) => this.dashboardServer.close(resolve))
        ]).then(() => {
          this.isRunning = false;
          console.log(`🛑 Alex AI Integrated System Server stopped`);
          resolve();
        });
      } else {
        resolve();
      }
    });
  }
}

// Start server if run directly
if (require.main === module) {
  const server = new IntegratedSystemServer();
  
  server.start().then(() => {
    // Open both frontend and dashboard in browser
    setTimeout(() => {
      open(`http://localhost:${server.frontendPort}`);
      setTimeout(() => {
        open(`http://localhost:${server.dashboardPort}`);
      }, 1000);
    }, 2000);
  }).catch(console.error);

  // Graceful shutdown
  process.on('SIGTERM', () => {
    console.log('SIGTERM signal received. Shutting down integrated system server...');
    server.stop().then(() => process.exit(0));
  });

  process.on('SIGINT', () => {
    console.log('SIGINT signal received. Shutting down integrated system server...');
    server.stop().then(() => process.exit(0));
  });
}

module.exports = IntegratedSystemServer;
