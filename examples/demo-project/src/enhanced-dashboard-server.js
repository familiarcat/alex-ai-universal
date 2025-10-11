/**
 * Alex AI Enhanced Configuration Dashboard Server
 * 
 * Enhanced dashboard with real-time value synchronization display
 * Shows current values from both dashboard and website in real-time
 */

const http = require('http');
const fs = require('fs');
const path = require('path');

class EnhancedAlexAIDashboardServer {
  constructor(port = 3001) {
    this.port = port;
    this.server = null;
    this.configurationStore = new Map();
    this.crewMembers = new Map();
    this.currentValues = new Map();
    
    this.initializeCrewMembers();
    this.initializeDefaultValues();
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

    console.log(`👥 ${this.crewMembers.size} crew members initialized for enhanced dashboard`);
  }

  /**
   * Initialize default values
   */
  initializeDefaultValues() {
    this.currentValues.set('pageTitle', 'Alex AI Demo - Smart Home Automation System');
    this.currentValues.set('mainHeading', 'Alex AI Demo Project');
    this.currentValues.set('description', 'Smart Home Automation System');
    this.currentValues.set('bgColor', '#1e3c72');
    this.currentValues.set('textColor', '#ffffff');
    this.currentValues.set('theme', 'star-trek');
    this.currentValues.set('layout', 'grid');
    this.currentValues.set('visibility', 'show-all');
    
    console.log('🎛️ Default values initialized for real-time display');
  }

  /**
   * Start the enhanced dashboard server
   */
  start() {
    return new Promise((resolve, reject) => {
      try {
        this.server = http.createServer((req, res) => {
          this.handleRequest(req, res);
        });

        this.server.listen(this.port, (err) => {
          if (err) {
            reject(err);
            return;
          }
          
          console.log(`🖖 Enhanced Alex AI Configuration Dashboard running on http://localhost:${this.port}`);
          console.log('🔄 Real-time value synchronization enabled');
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
    } else if (pathname === '/api/current-values') {
      this.getCurrentValues(req, res);
    } else if (pathname === '/api/sync-values' && req.method === 'POST') {
      this.syncValuesFromWebsite(req, res);
    } else if (pathname === '/api/update' && req.method === 'POST') {
      this.handleConfigurationUpdate(req, res);
    } else {
      res.writeHead(404, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Not found' }));
    }
  }

  /**
   * Serve enhanced dashboard HTML
   */
  serveDashboard(res) {
    const dashboardHTML = this.generateEnhancedDashboardHTML();
    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.end(dashboardHTML);
  }

  /**
   * Generate enhanced dashboard HTML with real-time value display
   */
  generateEnhancedDashboardHTML() {
    return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>🖖 Alex AI Enhanced Configuration Dashboard</title>
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

        .sync-status {
            display: inline-block;
            padding: 5px 15px;
            border-radius: 20px;
            font-size: 0.9rem;
            margin-top: 10px;
            background: rgba(76, 175, 80, 0.2);
            border: 1px solid #4CAF50;
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
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
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

        .current-value {
            display: block;
            margin-bottom: 10px;
            padding: 5px 10px;
            background: rgba(76, 175, 80, 0.2);
            border: 1px solid #4CAF50;
            border-radius: 5px;
            font-size: 0.9rem;
            word-break: break-all;
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
            margin-top: 10px;
        }

        .btn:hover {
            transform: translateY(-2px);
            box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3);
        }

        .btn-secondary {
            background: linear-gradient(45deg, #4fc3f7, #29b6f6);
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
    <div class="dashboard-container">
        <div class="dashboard-header">
            <div class="dashboard-title">🖖 Alex AI Enhanced Configuration Dashboard</div>
            <div class="dashboard-subtitle">Real-time Value Synchronization with Website</div>
            <div class="sync-status" id="syncStatus">🔄 Syncing values...</div>
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
                    <p><span class="status-indicator status-active"></span>Configuration Store: Active</p>
                    <p><span class="status-indicator status-active"></span>Crew Validation: Active</p>
                    <p><span class="status-indicator status-active"></span>Real-time Sync: Active</p>
                </div>
            </div>
        </div>

        <div class="dashboard-panel control-panel">
            <div class="panel-title">
                🎛️ Real-time Configuration Controls with Value Display
            </div>

            <div class="control-section">
                <h3>🎨 Content Management</h3>
                <div class="control-grid">
                    <div class="control-item">
                        <label>Page Title</label>
                        <div class="current-value" id="currentPageTitle">Loading...</div>
                        <input type="text" id="pageTitle" placeholder="Enter page title">
                        <button class="btn" onclick="updateContent('title', 'pageTitle')">Update Title</button>
                    </div>
                    <div class="control-item">
                        <label>Main Heading</label>
                        <div class="current-value" id="currentMainHeading">Loading...</div>
                        <input type="text" id="mainHeading" placeholder="Enter main heading">
                        <button class="btn" onclick="updateContent('heading', 'mainHeading')">Update Heading</button>
                    </div>
                    <div class="control-item">
                        <label>Description</label>
                        <div class="current-value" id="currentDescription">Loading...</div>
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
                        <div class="current-value" id="currentBgColor">Loading...</div>
                        <input type="color" id="bgColor" value="#1e3c72">
                        <button class="btn" onclick="updateDesign('background', 'bgColor')">Update Background</button>
                    </div>
                    <div class="control-item">
                        <label>Text Color</label>
                        <div class="current-value" id="currentTextColor">Loading...</div>
                        <input type="color" id="textColor" value="#ffffff">
                        <button class="btn" onclick="updateDesign('textColor', 'textColor')">Update Text</button>
                    </div>
                    <div class="control-item">
                        <label>Theme</label>
                        <div class="current-value" id="currentTheme">Loading...</div>
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
                        <div class="current-value" id="currentLayout">Loading...</div>
                        <select id="layout">
                            <option value="grid">Grid</option>
                            <option value="flex">Flexbox</option>
                            <option value="block">Block</option>
                        </select>
                        <button class="btn" onclick="updateLayout('style', 'layout')">Update Layout</button>
                    </div>
                    <div class="control-item">
                        <label>Component Visibility</label>
                        <div class="current-value" id="currentVisibility">Loading...</div>
                        <select id="visibility">
                            <option value="show-all">Show All</option>
                            <option value="hide-sidebar">Hide Sidebar</option>
                            <option value="hide-footer">Hide Footer</option>
                        </select>
                        <button class="btn" onclick="updateLayout('visibility', 'visibility')">Update Visibility</button>
                    </div>
                    <div class="control-item">
                        <label>Sync Actions</label>
                        <button class="btn btn-secondary" onclick="syncValuesFromWebsite()">🔄 Sync from Website</button>
                        <button class="btn btn-secondary" onclick="refreshValues()">🔄 Refresh Values</button>
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
        // Initialize dashboard
        document.addEventListener('DOMContentLoaded', function() {
            initializeDashboard();
            loadCrewMembers();
            loadCurrentValues();
            
            // Set up auto-refresh for values every 3 seconds
            setInterval(loadCurrentValues, 3000);
        });

        // Initialize dashboard
        function initializeDashboard() {
            logActivity('🖖 Enhanced Alex AI Configuration Dashboard initialized', 'info');
            logActivity('🔄 Real-time value synchronization enabled', 'success');
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

        // Load current values from website
        async function loadCurrentValues() {
            try {
                const response = await fetch('/api/current-values');
                const values = await response.json();
                
                // Update current value displays
                document.getElementById('currentPageTitle').textContent = values.pageTitle || 'Not set';
                document.getElementById('currentMainHeading').textContent = values.mainHeading || 'Not set';
                document.getElementById('currentDescription').textContent = values.description || 'Not set';
                document.getElementById('currentBgColor').textContent = values.bgColor || 'Not set';
                document.getElementById('currentTextColor').textContent = values.textColor || 'Not set';
                document.getElementById('currentTheme').textContent = values.theme || 'Not set';
                document.getElementById('currentLayout').textContent = values.layout || 'Not set';
                document.getElementById('currentVisibility').textContent = values.visibility || 'Not set';
                
                // Update form values
                document.getElementById('pageTitle').value = values.pageTitle || '';
                document.getElementById('mainHeading').value = values.mainHeading || '';
                document.getElementById('description').value = values.description || '';
                document.getElementById('bgColor').value = values.bgColor || '#1e3c72';
                document.getElementById('textColor').value = values.textColor || '#ffffff';
                document.getElementById('theme').value = values.theme || 'star-trek';
                document.getElementById('layout').value = values.layout || 'grid';
                document.getElementById('visibility').value = values.visibility || 'show-all';
                
                // Update sync status
                document.getElementById('syncStatus').textContent = '✅ Values synced';
                document.getElementById('syncStatus').style.background = 'rgba(76, 175, 80, 0.2)';
                document.getElementById('syncStatus').style.borderColor = '#4CAF50';
                
            } catch (error) {
                logActivity('❌ Failed to load current values: ' + error, 'error');
                document.getElementById('syncStatus').textContent = '❌ Sync failed';
                document.getElementById('syncStatus').style.background = 'rgba(244, 67, 54, 0.2)';
                document.getElementById('syncStatus').style.borderColor = '#f44336';
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
                    logActivity('🔄 Real-time update applied to website', 'info');
                    
                    // Refresh values after update
                    setTimeout(() => {
                        loadCurrentValues();
                        refreshWebsitePreview();
                    }, 1000);
                } else {
                    logActivity('❌ Failed to send configuration update', 'error');
                }
            } catch (error) {
                logActivity('❌ Error sending update: ' + error, 'error');
            }
        }

        // Sync values from website
        async function syncValuesFromWebsite() {
            try {
                const response = await fetch('/api/sync-values', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    }
                });

                if (response.ok) {
                    logActivity('🔄 Values synced from website', 'info');
                    loadCurrentValues();
                } else {
                    logActivity('❌ Failed to sync values from website', 'error');
                }
            } catch (error) {
                logActivity('❌ Error syncing values: ' + error, 'error');
            }
        }

        // Refresh values
        function refreshValues() {
            logActivity('🔄 Refreshing current values...', 'info');
            loadCurrentValues();
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
      currentValues: Object.fromEntries(this.currentValues),
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
   * Get current values
   */
  getCurrentValues(req, res) {
    const values = Object.fromEntries(this.currentValues);
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(values));
  }

  /**
   * Sync values from website
   */
  async syncValuesFromWebsite(req, res) {
    try {
      // Fetch current values from website server
      const websiteValues = await this.fetchWebsiteValues();
      
      // Update local values
      Object.keys(websiteValues).forEach(key => {
        this.currentValues.set(key, websiteValues[key]);
      });
      
      console.log('🔄 Values synced from website server');
      
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ 
        success: true, 
        message: 'Values synced from website',
        values: websiteValues,
        timestamp: new Date().toISOString()
      }));
      
    } catch (error) {
      console.error('❌ Error syncing values from website:', error);
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Failed to sync values from website' }));
    }
  }

  /**
   * Fetch values from website server
   */
  async fetchWebsiteValues() {
    return new Promise((resolve, reject) => {
      const http = require('http');
      
      const options = {
        hostname: 'localhost',
        port: 3000,
        path: '/api/configurations',
        method: 'GET'
      };

      const req = http.request(options, (res) => {
        let data = '';
        
        res.on('data', (chunk) => {
          data += chunk;
        });
        
        res.on('end', () => {
          try {
            const values = JSON.parse(data);
            resolve(values);
          } catch (error) {
            reject(error);
          }
        });
      });

      req.on('error', (error) => {
        reject(error);
      });

      req.end();
    });
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
        
        // Update local values
        this.updateLocalValues(update);
        
        // Forward update to website server for real-time synchronization
        this.forwardUpdateToWebsite(update);
        
        console.log(`🔧 Configuration update received: ${update.type} for ${update.target}`);
        console.log(`📊 Total configurations stored: ${this.configurationStore.size}`);
        
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
   * Update local values based on configuration update
   */
  updateLocalValues(update) {
    if (update.type === 'content') {
      if (update.target === 'title') {
        this.currentValues.set('pageTitle', update.changes.value);
      } else if (update.target === 'heading') {
        this.currentValues.set('mainHeading', update.changes.value);
      } else if (update.target === 'description') {
        this.currentValues.set('description', update.changes.value);
      }
    } else if (update.type === 'design') {
      if (update.target === 'background') {
        this.currentValues.set('bgColor', update.changes.value);
      } else if (update.target === 'textColor') {
        this.currentValues.set('textColor', update.changes.value);
      } else if (update.target === 'theme') {
        this.currentValues.set('theme', update.changes.value);
      }
    } else if (update.type === 'layout') {
      if (update.target === 'style') {
        this.currentValues.set('layout', update.changes.value);
      } else if (update.target === 'visibility') {
        this.currentValues.set('visibility', update.changes.value);
      }
    }
  }

  /**
   * Forward configuration update to website server
   */
  async forwardUpdateToWebsite(update) {
    try {
      const http = require('http');
      
      const postData = JSON.stringify(update);
      
      const options = {
        hostname: 'localhost',
        port: 3000,
        path: '/api/update',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(postData)
        }
      };

      const req = http.request(options, (res) => {
        let responseData = '';
        
        res.on('data', (chunk) => {
          responseData += chunk;
        });
        
        res.on('end', () => {
          if (res.statusCode === 200) {
            console.log(`✅ Configuration forwarded to website: ${update.type} for ${update.target}`);
          } else {
            console.error(`❌ Failed to forward configuration: ${res.statusCode}`);
          }
        });
      });

      req.on('error', (error) => {
        console.error('❌ Error forwarding configuration to website:', error);
      });

      req.write(postData);
      req.end();
      
    } catch (error) {
      console.error('❌ Error in forwardUpdateToWebsite:', error);
    }
  }

  /**
   * Stop the server
   */
  stop() {
    return new Promise((resolve) => {
      if (this.server) {
        this.server.close(() => {
          console.log('🛑 Enhanced dashboard server stopped');
          resolve();
        });
      } else {
        resolve();
      }
    });
  }
}

// Export the class
module.exports = EnhancedAlexAIDashboardServer;

// Start server if run directly
if (require.main === module) {
  const dashboard = new EnhancedAlexAIDashboardServer(3001);
  
  dashboard.start().then(() => {
    console.log('✅ Enhanced Alex AI Configuration Dashboard ready');
    console.log('🔄 Real-time value synchronization enabled');
    console.log('🌐 Dashboard: http://localhost:3001');
    console.log('👥 Crew Members: 9 active');
    console.log('🎛️ Real-time controls with value display ready');
  }).catch(error => {
    console.error('❌ Failed to start enhanced dashboard:', error);
  });
}




