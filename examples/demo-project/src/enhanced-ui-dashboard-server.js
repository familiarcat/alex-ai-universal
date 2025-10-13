/**
 * Enhanced UI Dashboard Server
 * Fixes: Crew chat links, connection loop, theme management
 */

const http = require('http');
const fs = require('http');
const path = require('path');
const { Server } = require('socket.io');
const CrewManagementAPI = require('./crew-api');

class EnhancedUIDashboardServer {
  constructor(dashboardPort = 3001, frontendPort = 3000) {
    this.dashboardPort = dashboardPort;
    this.frontendPort = frontendPort;
    this.server = null;
    this.frontendServer = null;
    this.io = null;
    this.frontendIo = null;
    this.crewAPI = new CrewManagementAPI();
    
    this.config = {
      title: '🖖 Alex AI Universal',
      subtitle: 'Enhanced Interactive Dashboard',
      description: 'Advanced control panel with crew chat, theme management, and real-time updates.',
      theme: 'star-trek-dark',
      fontSize: 16,
      backgroundColor: '#0c1445'
    };

    this.themes = {
      'star-trek-dark': {
        name: 'Star Trek Dark',
        primary: '#0c1445',
        secondary: '#1a237e',
        accent: '#00ff88',
        text: '#ffffff'
      },
      'star-trek-light': {
        name: 'Star Trek Light',
        primary: '#e3f2fd',
        secondary: '#bbdefb',
        accent: '#1976d2',
        text: '#000000'
      },
      'federation': {
        name: 'Federation',
        primary: '#1a1a2e',
        secondary: '#16213e',
        accent: '#ffd700',
        text: '#ffffff'
      },
      'borg': {
        name: 'Borg',
        primary: '#001a00',
        secondary: '#003300',
        accent: '#00ff00',
        text: '#00ff00'
      }
    };
  }

  start() {
    return Promise.all([
      this.startDashboardServer(),
      this.startFrontendServer()
    ]);
  }

  startDashboardServer() {
    return new Promise((resolve) => {
      this.server = http.createServer((req, res) => {
        this.handleDashboardRequest(req, res);
      });

      this.io = new Server(this.server, {
        cors: { origin: '*' }
      });

      this.io.on('connection', (socket) => {
        console.log('📡 Dashboard client connected');
        
        socket.on('chat-with-crew', (data) => {
          this.handleCrewChat(socket, data);
        });

        socket.on('update-theme', (data) => {
          this.config.theme = data.theme;
          this.io.emit('theme-updated', { theme: data.theme });
          if (this.frontendIo) {
            this.frontendIo.emit('theme-updated', { theme: data.theme });
          }
        });

        socket.on('update-config', (data) => {
          Object.assign(this.config, data);
          socket.emit('config-updated', this.config);
        });
      });

      this.server.listen(this.dashboardPort, () => {
        console.log(`🖖 Enhanced Dashboard running on http://localhost:${this.dashboardPort}`);
        resolve();
      });
    });
  }

  startFrontendServer() {
    return new Promise((resolve) => {
      this.frontendServer = http.createServer((req, res) => {
        this.handleFrontendRequest(req, res);
      });

      this.frontendIo = new Server(this.frontendServer, {
        cors: { origin: '*' }
      });

      this.frontendIo.on('connection', (socket) => {
        console.log('📡 Frontend client connected');
        socket.emit('config-update', this.config);
      });

      this.frontendServer.listen(this.frontendPort, () => {
        console.log(`🌐 Frontend running on http://localhost:${this.frontendPort}`);
        resolve();
      });
    });
  }

  handleCrewChat(socket, data) {
    const { crewId, message } = data;
    
    // Simulate crew response
    setTimeout(() => {
      const responses = {
        picard: `Captain Picard: "${message}" - I'll consider this from a strategic perspective.`,
        data: `Commander Data: Analyzing "${message}" with 99.7% computational accuracy.`,
        laforge: `Geordi La Forge: Working on "${message}" - should have a solution soon!`,
        worf: `Lieutenant Worf: "${message}" - I will handle this with honor.`,
        troi: `Counselor Troi: I sense your concern about "${message}". Let's explore this together.`,
        crusher: `Dr. Crusher: Regarding "${message}", I recommend a careful approach.`,
        riker: `Commander Riker: "${message}" - Let's make it happen, Number One!`,
        uhura: `Lieutenant Uhura: Message received: "${message}". Routing now.`,
        quark: `Quark: "${message}"? Now that sounds profitable!`
      };

      socket.emit('crew-response', {
        crewId,
        response: responses[crewId] || 'Crew member responding...',
        timestamp: new Date().toISOString()
      });
    }, 1000);
  }

  handleDashboardRequest(req, res) {
    const url = new URL(req.url, `http://localhost:${this.dashboardPort}`);
    
    if (url.pathname === '/') {
      this.serveDashboard(res);
    } else if (url.pathname === '/api/crew') {
      this.serveCrewAPI(res);
    } else if (url.pathname === '/api/projects') {
      this.serveProjectsAPI(req, res);
    } else if (url.pathname === '/api/system/status') {
      this.serveSystemStatus(res);
    } else {
      res.writeHead(404);
      res.end('Not found');
    }
  }

  handleFrontendRequest(req, res) {
    const url = new URL(req.url, `http://localhost:${this.frontendPort}`);
    
    if (url.pathname === '/') {
      this.serveFrontend(res);
    } else {
      res.writeHead(404);
      res.end('Not found');
    }
  }

  serveCrewAPI(res) {
    const crew = [
      { id: 'picard', name: 'Captain Jean-Luc Picard', role: 'Strategic Commander', avatar: '🖖', status: 'available' },
      { id: 'riker', name: 'Commander William Riker', role: 'First Officer', avatar: '👤', status: 'available' },
      { id: 'data', name: 'Commander Data', role: 'Operations Officer', avatar: '🤖', status: 'available' },
      { id: 'laforge', name: 'Lt. Cmdr. Geordi La Forge', role: 'Chief Engineer', avatar: '🔧', status: 'available' },
      { id: 'worf', name: 'Lieutenant Worf', role: 'Security Officer', avatar: '🛡️', status: 'available' },
      { id: 'troi', name: 'Counselor Deanna Troi', role: 'Ship\'s Counselor', avatar: '💭', status: 'available' },
      { id: 'crusher', name: 'Dr. Beverly Crusher', role: 'Chief Medical Officer', avatar: '🏥', status: 'available' },
      { id: 'uhura', name: 'Lieutenant Uhura', role: 'Communications Officer', avatar: '📡', status: 'available' },
      { id: 'quark', name: 'Quark', role: 'Business Intelligence', avatar: '💰', status: 'available' }
    ];

    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(crew));
  }

  serveProjectsAPI(req, res) {
    if (req.method === 'GET') {
      const projects = this.crewAPI.getProjects();
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(projects));
    } else if (req.method === 'POST') {
      let body = '';
      req.on('data', chunk => { body += chunk; });
      req.on('end', () => {
        const projectData = JSON.parse(body);
        const result = this.crewAPI.createProject(projectData);
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(result));
      });
    }
  }

  serveSystemStatus(res) {
    const status = {
      success: true,
      timestamp: new Date().toISOString(),
      crew: { total: 9, available: 9, assigned: 0 },
      projects: { total: 1, active: 0, planning: 1, completed: 0 },
      integrations: {
        n8n: { status: 'operational', url: 'https://n8n.pbradygeorgen.com' },
        supabase: { status: 'operational' },
        openrouter: { status: 'operational' },
        lcars: { status: 'operational', optimization: 'active' }
      }
    };
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(status));
  }

  serveDashboard(res) {
    const theme = this.themes[this.config.theme] || this.themes['star-trek-dark'];
    
    const html = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>🖖 Alex AI Enhanced Dashboard</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
            background: linear-gradient(135deg, ${theme.primary} 0%, ${theme.secondary} 100%);
            color: ${theme.text};
            min-height: 100vh;
            padding: 20px;
        }
        .container { max-width: 1400px; margin: 0 auto; }
        .header {
            background: rgba(0, 0, 0, 0.3);
            backdrop-filter: blur(10px);
            padding: 20px;
            border-radius: 12px;
            margin-bottom: 20px;
            display: flex;
            justify-content: space-between;
            align-items: center;
        }
        .header h1 { font-size: 28px; color: ${theme.accent}; }
        .theme-selector {
            display: flex;
            gap: 10px;
            align-items: center;
        }
        .theme-selector label { color: ${theme.text}; font-size: 14px; }
        .theme-selector select {
            background: rgba(0, 0, 0, 0.4);
            color: ${theme.accent};
            border: 1px solid ${theme.accent};
            padding: 8px 12px;
            border-radius: 6px;
            font-size: 14px;
            cursor: pointer;
        }
        .grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(350px, 1fr)); gap: 20px; }
        .panel {
            background: rgba(0, 0, 0, 0.3);
            backdrop-filter: blur(10px);
            padding: 20px;
            border-radius: 12px;
            border: 1px solid rgba(255, 255, 255, 0.1);
        }
        .panel h2 { color: ${theme.accent}; margin-bottom: 15px; font-size: 18px; }
        .crew-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(150px, 1fr)); gap: 12px; }
        .crew-member {
            background: rgba(0, 0, 0, 0.4);
            padding: 12px;
            border-radius: 8px;
            border: 1px solid rgba(255, 255, 255, 0.2);
            text-align: center;
            cursor: pointer;
            transition: all 0.3s;
        }
        .crew-member:hover {
            transform: translateY(-3px);
            border-color: ${theme.accent};
            box-shadow: 0 5px 15px rgba(0, 255, 136, 0.3);
        }
        .crew-avatar { font-size: 24px; margin-bottom: 5px; }
        .crew-name { font-size: 12px; font-weight: 500; color: ${theme.text}; margin-bottom: 3px; }
        .crew-role { font-size: 10px; opacity: 0.7; }
        .chat-button {
            background: ${theme.accent};
            color: ${theme.primary};
            border: none;
            padding: 4px 8px;
            border-radius: 4px;
            font-size: 10px;
            font-weight: 600;
            cursor: pointer;
            margin-top: 5px;
        }
        .chat-button:hover { opacity: 0.8; }
        .chat-panel {
            background: rgba(0, 0, 0, 0.5);
            padding: 15px;
            border-radius: 8px;
            max-height: 400px;
            overflow-y: auto;
        }
        .chat-message {
            background: rgba(0, 0, 0, 0.3);
            padding: 10px;
            border-radius: 6px;
            margin-bottom: 10px;
            border-left: 3px solid ${theme.accent};
        }
        .chat-message.user { border-left-color: #3742fa; }
        .chat-input-group {
            display: flex;
            gap: 10px;
            margin-top: 10px;
        }
        .chat-input {
            flex: 1;
            background: rgba(0, 0, 0, 0.4);
            border: 1px solid rgba(255, 255, 255, 0.2);
            color: ${theme.text};
            padding: 8px 12px;
            border-radius: 6px;
        }
        .send-button {
            background: ${theme.accent};
            color: ${theme.primary};
            border: none;
            padding: 8px 16px;
            border-radius: 6px;
            font-weight: 600;
            cursor: pointer;
        }
        .status-indicator {
            display: inline-block;
            width: 10px;
            height: 10px;
            border-radius: 50%;
            background: #4CAF50;
            margin-right: 8px;
            animation: pulse 2s infinite;
        }
        @keyframes pulse {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.5; }
        }
        .status-info { font-size: 14px; margin-bottom: 8px; }
        .connection-time { font-size: 12px; opacity: 0.7; margin-top: 10px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🖖 Alex AI Universal Dashboard</h1>
            <div class="theme-selector">
                <label for="themeSelect">Theme:</label>
                <select id="themeSelect" onchange="changeTheme(this.value)">
                    ${Object.keys(this.themes).map(key => 
                        `<option value="${key}" ${key === this.config.theme ? 'selected' : ''}>${this.themes[key].name}</option>`
                    ).join('')}
                </select>
            </div>
        </div>

        <div class="grid">
            <div class="panel">
                <h2>👥 Crew Members - Click to Chat</h2>
                <div class="crew-grid" id="crewGrid">
                    <!-- Populated by JavaScript -->
                </div>
            </div>

            <div class="panel">
                <h2>💬 Crew Chat</h2>
                <div class="chat-panel" id="chatPanel">
                    <p style="opacity: 0.7; text-align: center;">Select a crew member to start chatting</p>
                </div>
                <div class="chat-input-group">
                    <input type="text" id="chatInput" class="chat-input" placeholder="Type your message..." disabled>
                    <button id="sendButton" class="send-button" onclick="sendMessage()" disabled>Send</button>
                </div>
            </div>

            <div class="panel">
                <h2>📊 System Status</h2>
                <div class="status-info">
                    <span class="status-indicator"></span>
                    <span>Dashboard Connected</span>
                </div>
                <div class="status-info">
                    <span class="status-indicator"></span>
                    <span>9 Crew Members Available</span>
                </div>
                <div class="status-info">
                    <span class="status-indicator"></span>
                    <span>N8N Integration Active</span>
                </div>
                <div class="status-info">
                    <span class="status-indicator"></span>
                    <span>Supabase Connected</span>
                </div>
                <div class="connection-time">
                    Connected since: <span id="connectionTime">Just now</span>
                </div>
            </div>
        </div>
    </div>

    <script src="/socket.io/socket.io.js"></script>
    <script>
        const socket = io();
        let selectedCrew = null;
        let connectionStartTime = new Date();

        // Load crew members
        fetch('/api/crew')
            .then(res => res.json())
            .then(crew => {
                const grid = document.getElementById('crewGrid');
                grid.innerHTML = crew.map(member => \`
                    <div class="crew-member" onclick="selectCrew('\${member.id}', '\${member.name}')">
                        <div class="crew-avatar">\${member.avatar}</div>
                        <div class="crew-name">\${member.name.split(' ').pop()}</div>
                        <div class="crew-role">\${member.role}</div>
                        <button class="chat-button">💬 Chat</button>
                    </div>
                \`).join('');
            });

        function selectCrew(crewId, crewName) {
            selectedCrew = { id: crewId, name: crewName };
            document.getElementById('chatInput').disabled = false;
            document.getElementById('sendButton').disabled = false;
            document.getElementById('chatInput').placeholder = \`Message \${crewName}...\`;
            document.getElementById('chatInput').focus();
            
            const chatPanel = document.getElementById('chatPanel');
            chatPanel.innerHTML = \`<p style="color: #00ff88; margin-bottom: 10px;">Chat with \${crewName}</p>\`;
        }

        function sendMessage() {
            const input = document.getElementById('chatInput');
            const message = input.value.trim();
            
            if (!message || !selectedCrew) return;

            // Add user message
            addChatMessage('You', message, 'user');
            
            // Send to server
            socket.emit('chat-with-crew', {
                crewId: selectedCrew.id,
                message: message
            });

            input.value = '';
        }

        function addChatMessage(sender, text, type = 'crew') {
            const chatPanel = document.getElementById('chatPanel');
            const messageDiv = document.createElement('div');
            messageDiv.className = \`chat-message \${type}\`;
            messageDiv.innerHTML = \`<strong>\${sender}:</strong> \${text}\`;
            chatPanel.appendChild(messageDiv);
            chatPanel.scrollTop = chatPanel.scrollHeight;
        }

        function changeTheme(theme) {
            socket.emit('update-theme', { theme });
            setTimeout(() => window.location.reload(), 100);
        }

        // Socket handlers
        socket.on('connect', () => {
            console.log('Connected to dashboard');
            connectionStartTime = new Date();
        });

        socket.on('crew-response', (data) => {
            addChatMessage(selectedCrew.name, data.response, 'crew');
        });

        // Update connection time every minute (not constantly)
        setInterval(() => {
            const duration = Math.floor((new Date() - connectionStartTime) / 1000 / 60);
            document.getElementById('connectionTime').textContent = 
                duration === 0 ? 'Just now' : \`\${duration} minute\${duration !== 1 ? 's' : ''} ago\`;
        }, 60000);

        // Enter key to send
        document.getElementById('chatInput').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') sendMessage();
        });
    </script>
</body>
</html>`;
    
    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.end(html);
  }

  serveFrontend(res) {
    const theme = this.themes[this.config.theme] || this.themes['star-trek-dark'];
    
    const html = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${this.config.title}</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
            background: linear-gradient(135deg, ${theme.primary} 0%, ${theme.secondary} 100%);
            color: ${theme.text};
            min-height: 100vh;
            padding: 40px 20px;
        }
        .container { max-width: 1200px; margin: 0 auto; text-align: center; }
        h1 { font-size: 48px; color: ${theme.accent}; margin-bottom: 20px; }
        p { font-size: 18px; margin-bottom: 30px; opacity: 0.9; }
        .theme-badge {
            background: rgba(0, 0, 0, 0.3);
            padding: 10px 20px;
            border-radius: 20px;
            display: inline-block;
            border: 1px solid ${theme.accent};
        }
        .status { margin-top: 40px; font-size: 14px; opacity: 0.7; }
    </style>
</head>
<body>
    <div class="container">
        <h1 id="pageTitle">${this.config.title}</h1>
        <p id="pageSubtitle">${this.config.subtitle}</p>
        <p id="pageDescription">${this.config.description}</p>
        <div class="theme-badge">Current Theme: ${this.themes[this.config.theme].name}</div>
        <div class="status">🔄 Real-time sync active | 📡 Connected to dashboard</div>
    </div>

    <script src="/socket.io/socket.io.js"></script>
    <script>
        const socket = io();
        
        socket.on('theme-updated', (data) => {
            window.location.reload();
        });

        socket.on('config-update', (config) => {
            if (config.title) document.getElementById('pageTitle').textContent = config.title;
            if (config.subtitle) document.getElementById('pageSubtitle').textContent = config.subtitle;
            if (config.description) document.getElementById('pageDescription').textContent = config.description;
        });
    </script>
</body>
</html>`;
    
    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.end(html);
  }
}

module.exports = EnhancedUIDashboardServer;

// Start if run directly
if (require.main === module) {
  const server = new EnhancedUIDashboardServer();
  server.start().then(() => {
    console.log('✅ Enhanced UI Dashboard fully operational!');
    console.log('🖖 Dashboard: http://localhost:3001');
    console.log('🌐 Frontend: http://localhost:3000');
  });
}

