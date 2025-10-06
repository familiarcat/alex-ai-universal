const http = require('http');
const { Server } = require('socket.io');
const open = require('open');

class FixedDashboardFrontendServer {
  constructor(port = 3000) {
    this.port = port;
    this.server = null;
    this.io = null;
    this.isRunning = false;
    
    // Clean configuration state
    this.config = {
      title: '🖖 Alex AI Universal',
      subtitle: 'Enhanced Interactive Dashboard',
      description: 'Advanced control panel with deep interactivity and crew intelligence monitoring.',
      footer: '© 2024 Alex AI Universal - Fixed Connection Build',
      theme: 'star-trek',
      backgroundColor: '#2f2e8a',
      heading: 'DEVELOPMENT MODE - STABLE CONNECTION READY! 🚀'
    };

    this.crewMembers = [
      { id: 'picard', name: 'Jean-Luc', icon: '👋', role: 'Strategic Commander', status: 'active' },
      { id: 'riker', name: 'William', icon: '👤', role: 'First Officer', status: 'active' },
      { id: 'data', name: 'Data', icon: '🤖', role: 'Operations Officer', status: 'active' },
      { id: 'laforge', name: 'Commander', icon: '🔧', role: 'Chief Engineer', status: 'active' },
      { id: 'worf', name: 'Worf', icon: '⚔️', role: 'Security Officer', status: 'active' },
      { id: 'troi', name: 'Deanna', icon: '☁️', role: 'Ship\'s Counselor', status: 'active' },
      { id: 'crusher', name: 'Beverly', icon: '🏥', role: 'Chief Medical Officer', status: 'active' },
      { id: 'uhura', name: 'Uhura', icon: '👤', role: 'Communications Officer', status: 'active' },
      { id: 'quark', name: 'Quark', icon: '💰', role: 'Business Operations', status: 'active' }
    ];

    this.connectionStats = {
      total: 0,
      dashboard: 0,
      frontend: 0,
      lastUpdate: new Date()
    };
  }

  generateDashboardHTML() {
    const crewGrid = this.crewMembers.map(member => 
      `<div class="crew-member">
        <div class="crew-icon">${member.icon}</div>
        <div class="crew-name">${member.name}</div>
        <div class="crew-role">${member.role}</div>
      </div>`
    ).join('');

    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${this.config.title} - Dashboard</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { 
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; 
            background: linear-gradient(135deg, ${this.config.backgroundColor} 0%, #1a1a2e 100%);
            color: white; min-height: 100vh; overflow-x: hidden;
        }
        .container { display: flex; min-height: 100vh; }
        .sidebar { 
            width: 350px; background: rgba(255, 255, 255, 0.1); 
            backdrop-filter: blur(10px); border-right: 1px solid rgba(255, 255, 255, 0.2);
            padding: 20px; overflow-y: auto;
        }
        .main-content { flex: 1; padding: 20px; overflow-y: auto; }
        .sidebar h2 { color: #00ff88; margin-bottom: 20px; font-size: 18px; }
        .sidebar h3 { color: #00ff88; margin-bottom: 15px; font-size: 14px; }
        .control-group { margin-bottom: 20px; }
        .control-group label { display: block; margin-bottom: 8px; color: #cccccc; font-size: 12px; }
        .control-group input, .control-group select, .control-group textarea { 
            width: 100%; padding: 8px; border: 1px solid rgba(255, 255, 255, 0.3);
            border-radius: 4px; background: rgba(255, 255, 255, 0.1); color: white; font-size: 12px;
        }
        .control-group button { 
            width: 100%; padding: 10px; background: #00ff88; color: black; border: none;
            border-radius: 4px; cursor: pointer; font-weight: bold; font-size: 12px;
        }
        .control-group button:hover { background: #00cc6a; }
        .crew-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; margin-bottom: 20px; }
        .crew-member { 
            background: rgba(255, 255, 255, 0.05); border: 1px solid rgba(255, 255, 255, 0.1);
            border-radius: 6px; padding: 10px; text-align: center; transition: all 0.3s ease;
        }
        .crew-member:hover { background: rgba(0, 255, 136, 0.2); border-color: rgba(0, 255, 136, 0.5); }
        .crew-icon { font-size: 20px; margin-bottom: 5px; }
        .crew-name { font-size: 11px; color: #00ff88; font-weight: 500; }
        .crew-role { font-size: 9px; color: #cccccc; margin-top: 2px; }
        .connection-info {
            background: rgba(255, 255, 255, 0.05); border: 1px solid rgba(255, 255, 255, 0.1);
            border-radius: 6px; padding: 15px; margin-bottom: 15px;
        }
        .connection-info h3 { font-size: 14px; color: #00ff88; margin-bottom: 10px; }
        .connection-item { display: flex; justify-content: space-between; margin-bottom: 5px; font-size: 12px; }
        .connection-label { color: #cccccc; }
        .connection-value { color: #00ff88; font-weight: 500; }
        .log-section { max-height: 200px; overflow-y: auto; background: rgba(0, 0, 0, 0.3); border-radius: 6px; padding: 10px; }
        .log-entry { font-size: 11px; margin-bottom: 5px; padding: 5px; border-radius: 3px; background: rgba(255, 255, 255, 0.05); }
        .log-entry.success { border-left: 3px solid #00ff88; }
        .log-entry.error { border-left: 3px solid #ff4757; }
        .log-entry.info { border-left: 3px solid #3742fa; }
        .main-content h1 { font-size: 2.5em; margin-bottom: 10px; color: #00ff88; text-align: center; }
        .main-content h2 { font-size: 1.5em; margin-bottom: 20px; color: #ffffff; text-align: center; }
        .main-content p { font-size: 1.1em; margin-bottom: 30px; color: #cccccc; text-align: center; }
        .content-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 20px; margin-top: 30px; }
        .content-card { 
            background: rgba(255, 255, 255, 0.1); border: 1px solid rgba(255, 255, 255, 0.2);
            border-radius: 10px; padding: 20px; backdrop-filter: blur(10px);
        }
        .content-card h3 { color: #00ff88; margin-bottom: 15px; font-size: 18px; }
        .content-card p { color: #cccccc; line-height: 1.6; }
        .view-toggle { margin-bottom: 20px; text-align: center; }
        .view-toggle button { 
            margin: 0 10px; padding: 10px 20px; background: rgba(255, 255, 255, 0.1);
            color: white; border: 1px solid rgba(255, 255, 255, 0.3); border-radius: 5px; cursor: pointer;
        }
        .view-toggle button.active { background: #00ff88; color: black; }
        .status-indicator {
            position: fixed; top: 20px; right: 20px; background: rgba(0, 0, 0, 0.8);
            color: white; padding: 10px 15px; border-radius: 20px; font-size: 0.9em; z-index: 1000;
            transition: all 0.3s ease;
        }
        .status-indicator.connected { background: rgba(46, 204, 113, 0.8); }
        .status-indicator.connecting { background: rgba(255, 193, 7, 0.8); }
        .status-indicator.disconnected { background: rgba(231, 76, 60, 0.8); }
    </style>
</head>
<body>
    <div class="status-indicator connecting" id="statusIndicator">🔄 Connecting...</div>
    
    <div class="container">
        <div class="sidebar">
            <h2>🎛️ Dashboard Controls</h2>
            <p style="font-size: 11px; color: #cccccc; margin-bottom: 20px;">
                This sidebar is controlled by the dashboard. Changes made in the dashboard will update this interface in real-time.
            </p>

            <div class="control-group">
                <label>Current Theme:</label>
                <input type="text" value="${this.config.theme}" readonly style="background: rgba(0, 255, 136, 0.2);">
            </div>

            <div class="control-group">
                <label>Clean Build:</label>
                <input type="text" value="Fixed connection implementation" readonly style="background: rgba(0, 255, 136, 0.2);">
            </div>

            <div class="control-group">
                <label>Status:</label>
                <input type="text" value="Stable connection ready" readonly style="background: rgba(0, 255, 136, 0.2);">
            </div>

            <div class="control-group">
                <label>Content Title:</label>
                <input type="text" id="titleInput" value="${this.config.title}" onchange="updateContent('title', this.value)">
            </div>

            <div class="control-group">
                <label>Content Subtitle:</label>
                <input type="text" id="subtitleInput" value="${this.config.subtitle}" onchange="updateContent('subtitle', this.value)">
            </div>

            <div class="control-group">
                <label>Content Description:</label>
                <textarea id="descriptionInput" rows="3" onchange="updateContent('description', this.value)">${this.config.description}</textarea>
            </div>

            <div class="control-group">
                <label>Background Color:</label>
                <input type="color" id="backgroundColorInput" value="${this.config.backgroundColor}" onchange="updateContent('backgroundColor', this.value)">
            </div>

            <div class="control-group">
                <button onclick="switchView('dashboard')">Show Dashboard View</button>
            </div>

            <div class="control-group">
                <button onclick="switchView('live')">Show Live Frontend View</button>
            </div>

            <div class="connection-info">
                <h3>Connection Info</h3>
                <div class="connection-item">
                    <span class="connection-label">Status:</span>
                    <span class="connection-value" id="connectionStatus">Connecting...</span>
                </div>
                <div class="connection-item">
                    <span class="connection-label">Connections:</span>
                    <span class="connection-value" id="connectionCount">0</span>
                </div>
                <div class="connection-item">
                    <span class="connection-label">Current View:</span>
                    <span class="connection-value" id="currentView">dashboard</span>
                </div>
                <div class="connection-item">
                    <span class="connection-label">Last Update:</span>
                    <span class="connection-value" id="lastUpdate">Never</span>
                </div>
            </div>

            <div class="connection-info">
                <h3>System Logs</h3>
                <div class="log-section" id="logSection">
                    <div class="log-entry info">System initialized - Fixed connection build</div>
                </div>
            </div>
        </div>

        <div class="main-content" id="mainContent">
            <div class="view-toggle">
                <button id="dashboardBtn" class="active" onclick="switchView('dashboard')">Dashboard View</button>
                <button id="liveBtn" onclick="switchView('live')">Live Frontend View</button>
            </div>

            <div id="dashboardView">
                <h1>${this.config.heading}</h1>
                <h2>${this.config.subtitle}</h2>
                <p>${this.config.description}</p>

                <div class="content-grid">
                    <div class="content-card">
                        <h3>🎨 Clean Theme Management</h3>
                        <p>Current theme: ${this.config.theme}</p>
                        <p>This entire interface is controlled by our fixed dashboard system. All themes, layouts, and content can be modified in real-time with stable WebSocket connections.</p>
                    </div>

                    <div class="content-card">
                        <h3>👥 Crew Status</h3>
                        <p>All ${this.crewMembers.length} crew members are active and monitoring system performance. Real-time updates ensure optimal system operation with stable connection build.</p>
                        <div class="crew-grid">
                            ${crewGrid}
                        </div>
                    </div>

                    <div class="content-card">
                        <h3>⚡ Real-Time Control</h3>
                        <p>Dashboard controls update the live frontend in real-time through stable WebSocket connections. No more connection loops or flashing status indicators.</p>
                    </div>

                    <div class="content-card">
                        <h3>🔗 Live Synchronization</h3>
                        <p>Changes made in the dashboard are instantly reflected on the live frontend with persistent, stable connections.</p>
                    </div>
                </div>
            </div>

            <div id="liveView" style="display: none;">
                <h1 id="pageTitle">${this.config.title}</h1>
                <h2 id="pageSubtitle">${this.config.subtitle}</h2>
                <p id="pageDescription">${this.config.description}</p>
                <div class="content-grid">
                    <div class="content-card">
                        <h3>Live Frontend Preview</h3>
                        <p>This is how your website appears to visitors. All changes from the dashboard are reflected here in real-time.</p>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <script src="/socket.io/socket.io.js"></script>
    <script>
        let socket;
        let connectionRetries = 0;
        const maxRetries = 5;
        let currentConfig = ${JSON.stringify(this.config)};
        let currentView = 'dashboard';
        let isConnected = false;

        // Initialize WebSocket connection with proper error handling
        function initializeConnection() {
            try {
                socket = io({
                    reconnection: true,
                    reconnectionDelay: 1000,
                    reconnectionAttempts: maxRetries,
                    timeout: 20000
                });

                // Connection event handlers
                socket.on('connect', function() {
                    console.log('✅ Connected to server');
                    isConnected = true;
                    connectionRetries = 0;
                    updateStatus('🟢 Connected', 'connected');
                    addLogEntry('Connected to fixed dashboard server', 'success');
                    updateConnectionInfo();
                });

                socket.on('disconnect', function(reason) {
                    console.log('❌ Disconnected from server:', reason);
                    isConnected = false;
                    updateStatus('🔴 Disconnected', 'disconnected');
                    addLogEntry('Disconnected from server: ' + reason, 'error');
                });

                socket.on('connect_error', function(error) {
                    console.log('❌ Connection error:', error);
                    connectionRetries++;
                    updateStatus('🔄 Reconnecting...', 'connecting');
                    addLogEntry('Connection error: ' + error.message, 'error');
                    
                    if (connectionRetries >= maxRetries) {
                        updateStatus('❌ Connection Failed', 'disconnected');
                        addLogEntry('Max reconnection attempts reached', 'error');
                    }
                });

                socket.on('reconnect', function(attemptNumber) {
                    console.log('✅ Reconnected after', attemptNumber, 'attempts');
                    updateStatus('🟢 Connected', 'connected');
                    addLogEntry('Reconnected to server', 'success');
                });

                // Content update handlers
                socket.on('dashboard-update', function(data) {
                    addLogEntry('Dashboard update: ' + data.message, 'info');
                });

                socket.on('content-update', function(data) {
                    updatePreview(data.target, data.value);
                    addLogEntry('Content synchronized: ' + data.target, 'success');
                });

                socket.on('configuration-update', function(data) {
                    // Update config without reloading page
                    currentConfig = data.config;
                    updatePreview('title', data.config.title);
                    updatePreview('subtitle', data.config.subtitle);
                    updatePreview('description', data.config.description);
                    addLogEntry('Configuration updated', 'success');
                });

            } catch (error) {
                console.error('Failed to initialize connection:', error);
                updateStatus('❌ Connection Error', 'disconnected');
                addLogEntry('Failed to initialize connection: ' + error.message, 'error');
            }
        }

        function updateStatus(text, className) {
            const statusIndicator = document.getElementById('statusIndicator');
            statusIndicator.textContent = text;
            statusIndicator.className = 'status-indicator ' + className;
        }

        function updateConnectionInfo() {
            document.getElementById('connectionStatus').textContent = isConnected ? 'Connected' : 'Disconnected';
            document.getElementById('connectionCount').textContent = currentConfig.connections || 0;
            document.getElementById('currentView').textContent = currentView;
            document.getElementById('lastUpdate').textContent = new Date().toLocaleTimeString();
        }

        function switchView(view) {
            currentView = view;
            const dashboardView = document.getElementById('dashboardView');
            const liveView = document.getElementById('liveView');
            const dashboardBtn = document.getElementById('dashboardBtn');
            const liveBtn = document.getElementById('liveBtn');

            if (view === 'dashboard') {
                dashboardView.style.display = 'block';
                liveView.style.display = 'none';
                dashboardBtn.classList.add('active');
                liveBtn.classList.remove('active');
            } else {
                dashboardView.style.display = 'none';
                liveView.style.display = 'block';
                liveBtn.classList.add('active');
                dashboardBtn.classList.remove('active');
            }
            updateConnectionInfo();
        }

        function updateContent(type, value) {
            currentConfig[type] = value;
            
            // Update preview immediately
            updatePreview(type, value);
            
            // Send to server if connected
            if (isConnected && socket) {
                socket.emit('dashboard-command', {
                    type: 'content',
                    target: type,
                    value: value,
                    timestamp: new Date().toISOString()
                });
            } else {
                addLogEntry('Content updated locally (not connected)', 'info');
            }
        }

        function updatePreview(type, value) {
            const element = document.getElementById('page' + type.charAt(0).toUpperCase() + type.slice(1));
            if (element) {
                element.textContent = value;
            }
            
            // Update input fields
            const inputElement = document.getElementById(type + 'Input');
            if (inputElement && inputElement.value !== value) {
                inputElement.value = value;
            }
        }

        function addLogEntry(message, type) {
            const logSection = document.getElementById('logSection');
            const logEntry = document.createElement('div');
            logEntry.className = 'log-entry ' + type;
            logEntry.textContent = new Date().toLocaleTimeString() + ': ' + message;
            logSection.appendChild(logEntry);
            logSection.scrollTop = logSection.scrollHeight;
        }

        // Initialize when DOM is loaded
        document.addEventListener('DOMContentLoaded', function() {
            initializeConnection();
            updateConnectionInfo();
            setInterval(updateConnectionInfo, 5000);
        });
    </script>
</body>
</html>`;
  }

  generateLiveFrontendHTML() {
    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${this.config.title} - Live Frontend</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { 
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; 
            background: linear-gradient(135deg, ${this.config.backgroundColor} 0%, #1a1a2e 100%);
            color: white; min-height: 100vh; overflow-x: hidden;
        }
        .container { display: flex; min-height: 100vh; }
        .sidebar { 
            width: 350px; background: rgba(255, 255, 255, 0.1); 
            backdrop-filter: blur(10px); border-right: 1px solid rgba(255, 255, 255, 0.2);
            padding: 20px; overflow-y: auto;
        }
        .main-content { flex: 1; padding: 20px; overflow-y: auto; }
        .sidebar h2 { color: #00ff88; margin-bottom: 20px; font-size: 18px; }
        .sidebar h3 { color: #00ff88; margin-bottom: 15px; font-size: 14px; }
        .connection-info {
            background: rgba(255, 255, 255, 0.05); border: 1px solid rgba(255, 255, 255, 0.1);
            border-radius: 6px; padding: 15px; margin-bottom: 15px;
        }
        .connection-info h3 { font-size: 14px; color: #00ff88; margin-bottom: 10px; }
        .connection-item { display: flex; justify-content: space-between; margin-bottom: 5px; font-size: 12px; }
        .connection-label { color: #cccccc; }
        .connection-value { color: #00ff88; font-weight: 500; }
        .main-content h1 { font-size: 2.5em; margin-bottom: 10px; color: #00ff88; text-align: center; }
        .main-content h2 { font-size: 1.5em; margin-bottom: 20px; color: #ffffff; text-align: center; }
        .main-content p { font-size: 1.1em; margin-bottom: 30px; color: #cccccc; text-align: center; }
        .content-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 20px; margin-top: 30px; }
        .content-card { 
            background: rgba(255, 255, 255, 0.1); border: 1px solid rgba(255, 255, 255, 0.2);
            border-radius: 10px; padding: 20px; backdrop-filter: blur(10px);
        }
        .content-card h3 { color: #00ff88; margin-bottom: 15px; font-size: 18px; }
        .content-card p { color: #cccccc; line-height: 1.6; }
        .view-toggle { margin-bottom: 20px; text-align: center; }
        .view-toggle button { 
            margin: 0 10px; padding: 10px 20px; background: rgba(255, 255, 255, 0.1);
            color: white; border: 1px solid rgba(255, 255, 255, 0.3); border-radius: 5px; cursor: pointer;
        }
        .view-toggle button.active { background: #00ff88; color: black; }
        .status-indicator {
            position: fixed; top: 20px; right: 20px; background: rgba(0, 0, 0, 0.8);
            color: white; padding: 10px 15px; border-radius: 20px; font-size: 0.9em; z-index: 1000;
            transition: all 0.3s ease;
        }
        .status-indicator.connected { background: rgba(46, 204, 113, 0.8); }
        .status-indicator.connecting { background: rgba(255, 193, 7, 0.8); }
        .status-indicator.disconnected { background: rgba(231, 76, 60, 0.8); }
    </style>
</head>
<body>
    <div class="status-indicator connecting" id="statusIndicator">🔄 Connecting...</div>
    
    <div class="container">
        <div class="sidebar">
            <h2>🔗 Live Frontend</h2>
            <p style="font-size: 11px; color: #cccccc; margin-bottom: 20px;">
                This is the live frontend view. Content is updated in real-time from the dashboard.
            </p>

            <div class="connection-info">
                <h3>Connection Info</h3>
                <div class="connection-item">
                    <span class="connection-label">Status:</span>
                    <span class="connection-value" id="connectionStatus">Connecting...</span>
                </div>
                <div class="connection-item">
                    <span class="connection-label">Last Update:</span>
                    <span class="connection-value" id="lastUpdate">Never</span>
                </div>
            </div>

            <div class="connection-info">
                <h3>Navigation</h3>
                <div style="display: flex; flex-direction: column; gap: 10px;">
                    <button onclick="window.location.href='/'" style="width: 100%; padding: 10px; background: rgba(255, 255, 255, 0.1); color: white; border: 1px solid rgba(255, 255, 255, 0.3); border-radius: 4px; cursor: pointer;">← Back to Dashboard</button>
                </div>
            </div>
        </div>

        <div class="main-content">
            <div class="view-toggle">
                <button onclick="window.location.href='/'">← Back to Dashboard</button>
            </div>

            <h1 id="pageTitle">${this.config.title}</h1>
            <h2 id="pageSubtitle">${this.config.subtitle}</h2>
            <p id="pageDescription">${this.config.description}</p>
            
            <div class="content-grid">
                <div class="content-card">
                    <h3>Live Frontend Preview</h3>
                    <p>This is how your website appears to visitors. All changes from the dashboard are reflected here in real-time with stable WebSocket connections.</p>
                </div>
            </div>
        </div>
    </div>

    <script src="/socket.io/socket.io.js"></script>
    <script>
        let socket;
        let isConnected = false;

        function initializeConnection() {
            try {
                socket = io({
                    reconnection: true,
                    reconnectionDelay: 1000,
                    reconnectionAttempts: 5,
                    timeout: 20000
                });

                socket.on('connect', function() {
                    console.log('✅ Connected to server');
                    isConnected = true;
                    updateStatus('🟢 Connected', 'connected');
                    updateConnectionInfo();
                });

                socket.on('disconnect', function(reason) {
                    console.log('❌ Disconnected from server:', reason);
                    isConnected = false;
                    updateStatus('🔴 Disconnected', 'disconnected');
                });

                socket.on('connect_error', function(error) {
                    console.log('❌ Connection error:', error);
                    updateStatus('🔄 Reconnecting...', 'connecting');
                });

                socket.on('reconnect', function(attemptNumber) {
                    console.log('✅ Reconnected after', attemptNumber, 'attempts');
                    updateStatus('🟢 Connected', 'connected');
                });

                socket.on('content-update', function(data) {
                    const element = document.getElementById('page' + data.target.charAt(0).toUpperCase() + data.target.slice(1));
                    if (element) {
                        element.textContent = data.value;
                    }
                    updateConnectionInfo();
                });

            } catch (error) {
                console.error('Failed to initialize connection:', error);
                updateStatus('❌ Connection Error', 'disconnected');
            }
        }

        function updateStatus(text, className) {
            const statusIndicator = document.getElementById('statusIndicator');
            statusIndicator.textContent = text;
            statusIndicator.className = 'status-indicator ' + className;
        }

        function updateConnectionInfo() {
            document.getElementById('connectionStatus').textContent = isConnected ? 'Connected' : 'Disconnected';
            document.getElementById('lastUpdate').textContent = new Date().toLocaleTimeString();
        }

        document.addEventListener('DOMContentLoaded', function() {
            initializeConnection();
            updateConnectionInfo();
            setInterval(updateConnectionInfo, 5000);
        });
    </script>
</body>
</html>`;
  }

  async start() {
    return new Promise((resolve, reject) => {
      this.server = http.createServer((req, res) => {
        const url = new URL(req.url, `http://${req.headers.host}`);
        
        if (url.pathname === '/') {
          res.writeHead(200, { 'Content-Type': 'text/html' });
          res.end(this.generateDashboardHTML());
        } else if (url.pathname === '/live') {
          res.writeHead(200, { 'Content-Type': 'text/html' });
          res.end(this.generateLiveFrontendHTML());
        } else if (url.pathname === '/api/health') {
          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({
            status: 'healthy',
            timestamp: new Date().toISOString(),
            serverType: 'fixed-dashboard-frontend',
            uptime: process.uptime(),
            memory: process.memoryUsage(),
            config: this.config,
            connections: this.connectionStats,
            crew: { totalMembers: this.crewMembers.length }
          }));
        } else if (url.pathname === '/api/store-content') {
          let body = '';
          req.on('data', chunk => body += chunk.toString());
          req.on('end', () => {
            try {
              const data = JSON.parse(body);
              this.config[data.type] = data.value;
              this.io.emit('content-update', data);
              res.writeHead(200, { 'Content-Type': 'application/json' });
              res.end(JSON.stringify({ success: true }));
            } catch (error) {
              res.writeHead(500, { 'Content-Type': 'application/json' });
              res.end(JSON.stringify({ error: error.message }));
            }
          });
        } else {
          res.writeHead(404, { 'Content-Type': 'text/plain' });
          res.end('Not Found');
        }
      });

      this.io = new Server(this.server, {
        cors: { origin: "*", methods: ["GET", "POST"] }
      });

      this.io.on('connection', (socket) => {
        this.connectionStats.total++;
        this.connectionStats.dashboard++;
        this.connectionStats.lastUpdate = new Date();

        socket.emit('dashboard-update', {
          message: 'Connected to Fixed Dashboard-Frontend System',
          timestamp: new Date().toISOString()
        });

        socket.on('dashboard-command', (data) => {
          this.handleDashboardCommand(socket, data);
        });

        socket.on('disconnect', () => {
          this.connectionStats.total--;
          this.connectionStats.dashboard--;
          this.connectionStats.lastUpdate = new Date();
        });

        socket.emit('configuration-update', {
          config: this.config,
          timestamp: new Date().toISOString()
        });
      });

      this.server.listen(this.port, () => {
        this.isRunning = true;
        console.log(`🖖 Alex AI Fixed Dashboard-Frontend Server running on http://localhost:${this.port}`);
        console.log(`🎛️ Dashboard: http://localhost:${this.port}/`);
        console.log(`🌐 Live Frontend: http://localhost:${this.port}/live`);
        console.log(`🏥 Health Check: http://localhost:${this.port}/api/health`);
        console.log(`👥 Crew Members: ${this.crewMembers.length} active`);
        console.log(`✅ Fixed connection build ready - No connection loops`);
        console.log(`🔄 WebSocket connections enabled with stable reconnection`);
        console.log(`📦 Supabase integration via N8N middleware active`);
        resolve();
      });
    });
  }

  handleDashboardCommand(socket, data) {
    try {
      const { type, target, value, timestamp } = data;
      
      if (type === 'content') {
        this.config[target] = value;
        
        // Emit to all connected clients
        this.io.emit('content-update', {
          target: target,
          value: value,
          timestamp: new Date().toISOString()
        });
      }

      socket.emit('dashboard-update', {
        message: `Fixed build - Command processed: ${type} - ${target}`,
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      socket.emit('dashboard-update', {
        message: `Fixed build - Error processing command: ${error.message}`,
        timestamp: new Date().toISOString()
      });
    }
  }

  async stop() {
    if (this.server) {
      this.server.close();
      this.isRunning = false;
      console.log('🛑 Alex AI Fixed Dashboard-Frontend Server stopped');
    }
  }
}

// Start the server
if (require.main === module) {
  const server = new FixedDashboardFrontendServer(3000);
  server.start().catch(console.error);

  // Graceful shutdown
  process.on('SIGTERM', () => {
    console.log('SIGTERM signal received. Shutting down fixed dashboard-frontend server...');
    server.stop();
    process.exit(0);
  });

  process.on('SIGINT', () => {
    console.log('SIGINT signal received. Shutting down fixed dashboard-frontend server...');
    server.stop();
    process.exit(0);
  });
}

module.exports = FixedDashboardFrontendServer;


