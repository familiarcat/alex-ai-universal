const http = require('http');
const fs = require('fs');
const path = require('path');
const { Server } = require('socket.io');
const open = require('open');

class EnhancedInteractiveDashboardServer {
  constructor(port = 3001) {
    this.port = port;
    this.server = null;
    this.io = null;
    this.isRunning = false;
    this.crewMembers = new Map();
    this.llmUsage = new Map();
    this.connectionStats = {
      total: 0,
      dashboard: 0,
      frontend: 0,
      lastUpdate: new Date()
    };
    this.uiOptions = {
      content: ['title', 'subtitle', 'description', 'footer'],
      layout: ['showSidebar', 'sidebarWidth', 'mainContentWidth'],
      theme: ['star-trek', 'minimal', 'dark', 'modern', 'classic', 'corporate'],
      styling: ['fontSize', 'fontFamily', 'colorScheme', 'spacing'],
      advanced: ['animations', 'transitions', 'accessibility', 'performance']
    };
    
    this.initializeCrewMembers();
    this.initializeLLMUsage();
  }

  initializeCrewMembers() {
    const crewData = [
      {
        id: 'picard',
        name: 'Captain Jean-Luc Picard',
        role: 'Strategic Commander',
        specialty: 'Strategic Leadership & Mission Planning',
        expertise: ['Strategic Planning', 'Decision Making', 'Team Leadership', 'Mission Coordination'],
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
        expertise: ['Tactical Operations', 'Workflow Management', 'Execution', 'Team Coordination'],
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
        expertise: ['Technical Analysis', 'AI/ML Integration', 'Data Processing', 'System Optimization'],
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
        expertise: ['System Engineering', 'Infrastructure', 'Technical Solutions', 'Build Systems'],
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
        expertise: ['Security Protocols', 'Threat Assessment', 'Compliance', 'Data Protection'],
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
        expertise: ['User Experience', 'Communication', 'Team Dynamics', 'Visual Design'],
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
        expertise: ['System Health', 'Performance Diagnostics', 'Monitoring', 'Wellness'],
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
        expertise: ['Communication Protocols', 'Synchronization', 'Integration', 'WebSocket Management'],
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
        expertise: ['Cost Optimization', 'Efficiency Analysis', 'Business Metrics', 'Resource Management'],
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

  initializeLLMUsage() {
    const llmData = [
      { model: 'GPT-4', usage: 45, efficiency: 94, lastUsed: new Date() },
      { model: 'Claude-3.5-Sonnet', usage: 32, efficiency: 96, lastUsed: new Date() },
      { model: 'GPT-3.5-Turbo', usage: 18, efficiency: 89, lastUsed: new Date() },
      { model: 'Claude-3-Haiku', usage: 5, efficiency: 87, lastUsed: new Date() }
    ];

    llmData.forEach(llm => {
      this.llmUsage.set(llm.model, llm);
    });
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
            display: flex;
            align-items: center;
            gap: 8px;
        }

        .crew-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
            gap: 16px;
        }

        .crew-member {
            background: rgba(248, 249, 250, 0.8);
            border: 1px solid rgba(0, 0, 0, 0.1);
            border-radius: 8px;
            padding: 16px;
            transition: all 0.3s ease;
        }

        .crew-member:hover {
            transform: translateY(-2px);
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        }

        .crew-member.active {
            border-color: rgba(46, 204, 113, 0.5);
            background: rgba(46, 204, 113, 0.05);
        }

        .crew-name {
            font-weight: 600;
            color: #2c3e50;
            margin-bottom: 4px;
        }

        .crew-role {
            font-size: 14px;
            color: #7f8c8d;
            margin-bottom: 8px;
        }

        .crew-specialty {
            font-size: 13px;
            color: #34495e;
            margin-bottom: 8px;
            font-style: italic;
        }

        .crew-task {
            font-size: 12px;
            color: #e74c3c;
            background: rgba(231, 76, 60, 0.1);
            padding: 4px 8px;
            border-radius: 4px;
            margin-bottom: 8px;
        }

        .performance-metrics {
            display: flex;
            gap: 12px;
            margin-top: 8px;
        }

        .metric {
            text-align: center;
            font-size: 11px;
        }

        .metric-value {
            font-weight: 600;
            color: #2c3e50;
        }

        .metric-label {
            color: #7f8c8d;
        }

        .connection-info {
            background: rgba(248, 249, 250, 0.8);
            border: 1px solid rgba(0, 0, 0, 0.1);
            border-radius: 8px;
            padding: 16px;
            margin-bottom: 16px;
        }

        .connection-stats {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
            gap: 12px;
            margin-top: 12px;
        }

        .stat-item {
            text-align: center;
            padding: 8px;
            background: rgba(255, 255, 255, 0.5);
            border-radius: 6px;
        }

        .stat-value {
            font-size: 18px;
            font-weight: 600;
            color: #2c3e50;
        }

        .stat-label {
            font-size: 12px;
            color: #7f8c8d;
            margin-top: 2px;
        }

        .llm-usage {
            margin-top: 16px;
        }

        .llm-item {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 8px 0;
            border-bottom: 1px solid rgba(0, 0, 0, 0.1);
        }

        .llm-item:last-child {
            border-bottom: none;
        }

        .llm-name {
            font-weight: 500;
            color: #2c3e50;
        }

        .llm-stats {
            font-size: 12px;
            color: #7f8c8d;
        }

        .controls-section {
            margin-top: 24px;
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

        .control-input {
            width: 100%;
            padding: 6px 8px;
            border: 1px solid rgba(0, 0, 0, 0.2);
            border-radius: 4px;
            font-size: 13px;
            background: rgba(255, 255, 255, 0.8);
        }

        .control-select {
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

        @media (max-width: 768px) {
            .main-content {
                grid-template-columns: 1fr;
            }
            
            .crew-grid {
                grid-template-columns: 1fr;
            }
        }
    </style>
</head>
<body>
    <div class="dashboard-container">
        <div class="header">
            <h1>🖖 Alex AI Enhanced Interactive Dashboard</h1>
            <div class="subtitle">Advanced Control Panel with Deep Interactivity & Crew Intelligence</div>
            <div class="status-bar">
                <div class="status-item active">🟢 System Operational</div>
                <div class="status-item active">👥 9 Crew Members Active</div>
                <div class="status-item active">🔗 Real-Time Sync Active</div>
                <div class="status-item active">🎛️ Dashboard Mode</div>
            </div>
        </div>

        <div class="main-content">
            <div class="panel">
                <h2>👥 Crew Status & Intelligence</h2>
                <div class="crew-grid" id="crewGrid">
                    <!-- Crew members will be populated by JavaScript -->
                </div>
            </div>

            <div class="panel">
                <h2>🔗 Connection & Performance Info</h2>
                <div class="connection-info">
                    <h3>Real-Time Connections</h3>
                    <div class="connection-stats" id="connectionStats">
                        <!-- Connection stats will be populated by JavaScript -->
                    </div>
                </div>
                
                <div class="llm-usage">
                    <h3>LLM Usage & Performance</h3>
                    <div id="llmUsage">
                        <!-- LLM usage will be populated by JavaScript -->
                    </div>
                </div>
            </div>
        </div>

        <div class="panel">
            <h2>🎛️ Interactive Control Panel</h2>
            <div class="controls-section">
                <div class="control-group">
                    <h3>📝 Content Management</h3>
                    <div class="control-grid">
                        <div class="control-item">
                            <div class="control-label">Page Title</div>
                            <div class="control-description">Main page title displayed in browser and header</div>
                            <input type="text" class="control-input" id="titleInput" placeholder="Enter page title...">
                        </div>
                        <div class="control-item">
                            <div class="control-label">Subtitle</div>
                            <div class="control-description">Descriptive subtitle below main title</div>
                            <input type="text" class="control-input" id="subtitleInput" placeholder="Enter subtitle...">
                        </div>
                        <div class="control-item">
                            <div class="control-label">Description</div>
                            <div class="control-description">Main content description text</div>
                            <textarea class="control-input" id="descriptionInput" rows="3" placeholder="Enter description..."></textarea>
                        </div>
                        <div class="control-item">
                            <div class="control-label">Footer Text</div>
                            <div class="control-description">Footer content and copyright information</div>
                            <input type="text" class="control-input" id="footerInput" placeholder="Enter footer text...">
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
                                <option value="star-trek">🖖 Star Trek Theme</option>
                                <option value="minimal">⚪ Minimal Theme</option>
                                <option value="dark">🌙 Dark Theme</option>
                                <option value="modern">✨ Modern Theme</option>
                                <option value="classic">📜 Classic Theme</option>
                                <option value="corporate">🏢 Corporate Theme</option>
                            </select>
                        </div>
                        <div class="control-item">
                            <div class="control-label">Sidebar Visibility</div>
                            <div class="control-description">Toggle sidebar display for navigation elements</div>
                            <select class="control-select" id="sidebarSelect">
                                <option value="true">Show Sidebar</option>
                                <option value="false">Hide Sidebar</option>
                            </select>
                        </div>
                        <div class="control-item">
                            <div class="control-label">Sidebar Width</div>
                            <div class="control-description">Adjust sidebar width (200px - 400px)</div>
                            <input type="range" class="control-input" id="sidebarWidth" min="200" max="400" value="300">
                            <span id="sidebarWidthValue">300px</span>
                        </div>
                        <div class="control-item">
                            <div class="control-label">Font Size</div>
                            <div class="control-description">Global font size adjustment (12px - 20px)</div>
                            <input type="range" class="control-input" id="fontSize" min="12" max="20" value="16">
                            <span id="fontSizeValue">16px</span>
                        </div>
                    </div>
                </div>

                <div class="control-group">
                    <h3>⚡ Advanced Options</h3>
                    <div class="control-grid">
                        <div class="control-item">
                            <div class="control-label">Animations</div>
                            <div class="control-description">Enable/disable smooth transitions and animations</div>
                            <select class="control-select" id="animationsSelect">
                                <option value="true">Enable Animations</option>
                                <option value="false">Disable Animations</option>
                            </select>
                        </div>
                        <div class="control-item">
                            <div class="control-label">Accessibility Mode</div>
                            <div class="control-description">Enhanced accessibility features and contrast</div>
                            <select class="control-select" id="accessibilitySelect">
                                <option value="false">Standard Mode</option>
                                <option value="true">Enhanced Accessibility</option>
                            </select>
                        </div>
                        <div class="control-item">
                            <div class="control-label">Performance Mode</div>
                            <div class="control-description">Optimize for performance vs visual quality</div>
                            <select class="control-select" id="performanceSelect">
                                <option value="balanced">Balanced</option>
                                <option value="performance">Performance</option>
                                <option value="quality">Quality</option>
                            </select>
                        </div>
                    </div>
                </div>

                <div style="margin-top: 20px; text-align: center;">
                    <button class="btn" onclick="applyChanges()">🚀 Apply Changes</button>
                    <button class="btn secondary" onclick="resetToDefaults()">🔄 Reset to Defaults</button>
                    <button class="btn secondary" onclick="saveConfiguration()">💾 Save Configuration</button>
                </div>
            </div>
        </div>

        <div class="panel">
            <h2>📊 Activity Log & System Status</h2>
            <div class="log-section" id="logSection">
                <!-- Log entries will be populated by JavaScript -->
            </div>
        </div>
    </div>

    <script src="/socket.io/socket.io.js"></script>
    <script>
        const socket = io();
        
        let currentConfig = {
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

        // Initialize dashboard
        document.addEventListener('DOMContentLoaded', function() {
            initializeDashboard();
            setupEventListeners();
            updateCrewStatus();
            updateConnectionInfo();
            updateLLMUsage();
            addLogEntry('Enhanced Interactive Dashboard initialized successfully', 'success');
        });

        function initializeDashboard() {
            // Populate crew grid
            const crewGrid = document.getElementById('crewGrid');
            crewGrid.innerHTML = '';
            
            const crewMembers = [
                {
                    id: 'picard',
                    name: 'Captain Jean-Luc Picard',
                    role: 'Strategic Commander',
                    specialty: 'Strategic Leadership & Mission Planning',
                    currentTask: 'Theme State Fix MVP Coordination',
                    performance: { efficiency: 95, accuracy: 98, innovation: 92 }
                },
                {
                    id: 'riker',
                    name: 'Commander William Riker',
                    role: 'First Officer',
                    specialty: 'Tactical Operations & Workflow Management',
                    currentTask: 'Real-Time Dashboard Control Implementation',
                    performance: { efficiency: 94, accuracy: 96, innovation: 89 }
                },
                {
                    id: 'data',
                    name: 'Commander Data',
                    role: 'Operations Officer',
                    specialty: 'Technical Analysis & AI/ML Integration',
                    currentTask: 'CSS Class Management System Design',
                    performance: { efficiency: 99, accuracy: 99, innovation: 97 }
                },
                {
                    id: 'laforge',
                    name: 'Lieutenant Commander Geordi La Forge',
                    role: 'Chief Engineer',
                    specialty: 'System Engineering & Infrastructure',
                    currentTask: 'Build System Optimization',
                    performance: { efficiency: 96, accuracy: 95, innovation: 94 }
                },
                {
                    id: 'worf',
                    name: 'Lieutenant Worf',
                    role: 'Security Officer',
                    specialty: 'Security Protocols & Compliance',
                    currentTask: 'Security Validation & Compliance Audit',
                    performance: { efficiency: 93, accuracy: 98, innovation: 87 }
                },
                {
                    id: 'troi',
                    name: 'Counselor Deanna Troi',
                    role: 'Ship\'s Counselor',
                    specialty: 'User Experience & Communication',
                    currentTask: 'Enhanced Visual Feedback System Design',
                    performance: { efficiency: 91, accuracy: 94, innovation: 93 }
                },
                {
                    id: 'crusher',
                    name: 'Dr. Beverly Crusher',
                    role: 'Chief Medical Officer',
                    specialty: 'System Health & Performance Diagnostics',
                    currentTask: 'System Health Monitoring Implementation',
                    performance: { efficiency: 94, accuracy: 97, innovation: 90 }
                },
                {
                    id: 'uhura',
                    name: 'Lieutenant Uhura',
                    role: 'Communications Officer',
                    specialty: 'Communication Protocols & Synchronization',
                    currentTask: 'WebSocket Communication Enhancement',
                    performance: { efficiency: 95, accuracy: 96, innovation: 91 }
                },
                {
                    id: 'quark',
                    name: 'Quark',
                    role: 'Business Operations',
                    specialty: 'Cost Optimization & Efficiency Analysis',
                    currentTask: 'Performance Metrics & Resource Optimization',
                    performance: { efficiency: 92, accuracy: 93, innovation: 88 }
                }
            ];

            crewMembers.forEach(member => {
                const crewDiv = document.createElement('div');
                crewDiv.className = 'crew-member active';
                crewDiv.innerHTML = \`
                    <div class="crew-name">\${member.name}</div>
                    <div class="crew-role">\${member.role}</div>
                    <div class="crew-specialty">\${member.specialty}</div>
                    <div class="crew-task">\${member.currentTask}</div>
                    <div class="performance-metrics">
                        <div class="metric">
                            <div class="metric-value">\${member.performance.efficiency}%</div>
                            <div class="metric-label">Efficiency</div>
                        </div>
                        <div class="metric">
                            <div class="metric-value">\${member.performance.accuracy}%</div>
                            <div class="metric-label">Accuracy</div>
                        </div>
                        <div class="metric">
                            <div class="metric-value">\${member.performance.innovation}%</div>
                            <div class="metric-label">Innovation</div>
                        </div>
                    </div>
                \`;
                crewGrid.appendChild(crewDiv);
            });
        }

        function updateConnectionInfo() {
            const connectionStats = document.getElementById('connectionStats');
            connectionStats.innerHTML = \`
                <div class="stat-item">
                    <div class="stat-value">2</div>
                    <div class="stat-label">Total Connections</div>
                </div>
                <div class="stat-item">
                    <div class="stat-value">1</div>
                    <div class="stat-label">Dashboard</div>
                </div>
                <div class="stat-item">
                    <div class="stat-value">1</div>
                    <div class="stat-label">Frontend</div>
                </div>
                <div class="stat-item">
                    <div class="stat-value">31</div>
                    <div class="stat-label">Commands Processed</div>
                </div>
            \`;
        }

        function updateLLMUsage() {
            const llmUsage = document.getElementById('llmUsage');
            const llmData = [
                { model: 'GPT-4', usage: 45, efficiency: 94, lastUsed: '2 min ago' },
                { model: 'Claude-3.5-Sonnet', usage: 32, efficiency: 96, lastUsed: '5 min ago' },
                { model: 'GPT-3.5-Turbo', usage: 18, efficiency: 89, lastUsed: '12 min ago' },
                { model: 'Claude-3-Haiku', usage: 5, efficiency: 87, lastUsed: '1 hour ago' }
            ];

            llmUsage.innerHTML = '';
            llmData.forEach(llm => {
                const llmDiv = document.createElement('div');
                llmDiv.className = 'llm-item';
                llmDiv.innerHTML = \`
                    <div class="llm-name">\${llm.model}</div>
                    <div class="llm-stats">\${llm.usage}% usage • \${llm.efficiency}% efficiency • \${llm.lastUsed}</div>
                \`;
                llmUsage.appendChild(llmDiv);
            });
        }

        function setupEventListeners() {
            // Range input updates
            document.getElementById('sidebarWidth').addEventListener('input', function(e) {
                document.getElementById('sidebarWidthValue').textContent = e.target.value + 'px';
            });

            document.getElementById('fontSize').addEventListener('input', function(e) {
                document.getElementById('fontSizeValue').textContent = e.target.value + 'px';
            });

            // Form inputs
            Object.keys(currentConfig).forEach(key => {
                const element = document.getElementById(key + 'Input') || 
                              document.getElementById(key + 'Select');
                if (element) {
                    element.value = currentConfig[key];
                }
            });
        }

        function applyChanges() {
            // Collect current form values
            currentConfig.title = document.getElementById('titleInput').value;
            currentConfig.subtitle = document.getElementById('subtitleInput').value;
            currentConfig.description = document.getElementById('descriptionInput').value;
            currentConfig.footer = document.getElementById('footerInput').value;
            currentConfig.theme = document.getElementById('themeSelect').value;
            currentConfig.showSidebar = document.getElementById('sidebarSelect').value === 'true';
            currentConfig.sidebarWidth = parseInt(document.getElementById('sidebarWidth').value);
            currentConfig.fontSize = parseInt(document.getElementById('fontSize').value);
            currentConfig.animations = document.getElementById('animationsSelect').value === 'true';
            currentConfig.accessibility = document.getElementById('accessibilitySelect').value === 'true';
            currentConfig.performance = document.getElementById('performanceSelect').value;

            // Send configuration to frontend
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

            // Update form values
            Object.keys(currentConfig).forEach(key => {
                const element = document.getElementById(key + 'Input') || 
                              document.getElementById(key + 'Select');
                if (element) {
                    element.value = currentConfig[key];
                }
            });

            // Update range displays
            document.getElementById('sidebarWidthValue').textContent = currentConfig.sidebarWidth + 'px';
            document.getElementById('fontSizeValue').textContent = currentConfig.fontSize + 'px';

            addLogEntry('Configuration reset to defaults', 'info');
        }

        function saveConfiguration() {
            const configData = JSON.stringify(currentConfig, null, 2);
            const blob = new Blob([configData], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'alex-ai-dashboard-config.json';
            a.click();
            URL.revokeObjectURL(url);

            addLogEntry('Configuration saved to file', 'success');
        }

        function addLogEntry(message, type = 'info') {
            const logSection = document.getElementById('logSection');
            const logEntry = document.createElement('div');
            logEntry.className = \`log-entry \${type}\`;
            logEntry.innerHTML = \`
                <strong>\${new Date().toLocaleTimeString()}</strong> - \${message}
            \`;
            logSection.insertBefore(logEntry, logSection.firstChild);

            // Keep only last 50 entries
            while (logSection.children.length > 50) {
                logSection.removeChild(logSection.lastChild);
            }
        }

        // Socket event handlers
        socket.on('connect', function() {
            addLogEntry('Connected to dashboard server', 'success');
            updateConnectionInfo();
        });

        socket.on('disconnect', function() {
            addLogEntry('Disconnected from dashboard server', 'error');
        });

        socket.on('dashboard-update', function(data) {
            addLogEntry(\`Dashboard update: \${data.message}\`, 'info');
        });

        socket.on('crew-update', function(data) {
            addLogEntry(\`Crew update: \${data.member} - \${data.status}\`, 'info');
            updateCrewStatus();
        });

        socket.on('connection-update', function(data) {
            updateConnectionInfo();
            addLogEntry(\`Connection update: \${data.total} total connections\`, 'info');
        });

        // Update crew status every 30 seconds
        setInterval(updateCrewStatus, 30000);
        
        // Update connection info every 10 seconds
        setInterval(updateConnectionInfo, 10000);
    </script>
</body>
</html>
    `;
  }

  async start() {
    return new Promise((resolve, reject) => {
      try {
        this.server = http.createServer((req, res) => {
          const url = new URL(req.url, `http://${req.headers.host}`);
          
          if (url.pathname === '/') {
            res.writeHead(200, { 'Content-Type': 'text/html' });
            res.end(this.generateDashboardHTML());
          } else if (url.pathname === '/api/health') {
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({
              status: 'healthy',
              timestamp: new Date().toISOString(),
              serverType: 'enhanced-interactive-dashboard',
              uptime: process.uptime(),
              memory: process.memoryUsage(),
              crew: {
                totalMembers: this.crewMembers.size,
                activeMembers: Array.from(this.crewMembers.values()).filter(m => m.status === 'active').length
              },
              connections: this.connectionStats,
              llmUsage: Object.fromEntries(this.llmUsage)
            }));
          } else if (url.pathname === '/api/crew') {
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({
              crewMembers: Array.from(this.crewMembers.values()),
              llmUsage: Object.fromEntries(this.llmUsage),
              timestamp: new Date().toISOString()
            }));
          } else {
            res.writeHead(404, { 'Content-Type': 'text/html' });
            res.end('<h1>404 Not Found</h1>');
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
            message: 'Connected to Enhanced Interactive Dashboard',
            timestamp: new Date().toISOString()
          });

          socket.on('dashboard-command', (data) => {
            this.handleDashboardCommand(socket, data);
          });

          socket.on('disconnect', () => {
            this.connectionStats.total--;
            this.connectionStats.dashboard--;
            this.connectionStats.lastUpdate = new Date();

            this.io.emit('connection-update', this.connectionStats);
          });

          // Send initial data
          socket.emit('crew-update', {
            crewMembers: Array.from(this.crewMembers.values()),
            timestamp: new Date().toISOString()
          });

          socket.emit('connection-update', this.connectionStats);
        });

        this.server.listen(this.port, () => {
          this.isRunning = true;
          console.log(`🖖 Alex AI Enhanced Interactive Dashboard Server running on http://localhost:${this.port}`);
          console.log(`🎛️ Enhanced Dashboard: http://localhost:${this.port}/`);
          console.log(`🏥 Health Check: http://localhost:${this.port}/api/health`);
          console.log(`👥 Crew Members: ${this.crewMembers.size} active`);
          console.log(`🧠 LLM Models: ${this.llmUsage.size} tracked`);
          console.log(`✅ Enhanced interactive control system ready`);
          console.log(`🔄 WebSocket connections enabled`);
          resolve();
        });

      } catch (error) {
        reject(error);
      }
    });
  }

  handleDashboardCommand(socket, data) {
    try {
      const { type, target, value, timestamp } = data;
      
      switch (type) {
        case 'configuration':
          // Handle full configuration update
          this.io.emit('configuration-update', {
            config: data.data,
            timestamp: new Date().toISOString()
          });
          break;
          
        case 'content':
          this.io.emit('content-update', {
            target,
            value,
            timestamp: new Date().toISOString()
          });
          break;
          
        case 'theme':
          this.io.emit('theme-update', {
            theme: value,
            timestamp: new Date().toISOString()
          });
          break;
          
        case 'layout':
          this.io.emit('layout-update', {
            target,
            value,
            timestamp: new Date().toISOString()
          });
          break;
          
        default:
          this.io.emit('generic-update', {
            type,
            data,
            timestamp: new Date().toISOString()
          });
      }

      // Update crew activity
      this.updateCrewActivity('dashboard-command', data);
      
      socket.emit('dashboard-update', {
        message: `Command processed: ${type}`,
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      socket.emit('dashboard-update', {
        message: `Error processing command: ${error.message}`,
        timestamp: new Date().toISOString()
      });
    }
  }

  updateCrewActivity(action, data) {
    // Update crew member activity based on action
    const crewMember = this.crewMembers.get('data'); // Default to Data for technical actions
    if (crewMember) {
      crewMember.lastActivity = new Date();
      crewMember.currentTask = `Processing ${action}: ${data.type || 'unknown'}`;
      
      this.io.emit('crew-update', {
        member: crewMember.name,
        status: 'active',
        task: crewMember.currentTask,
        timestamp: new Date().toISOString()
      });
    }
  }

  async stop() {
    return new Promise((resolve) => {
      if (this.server && this.isRunning) {
        this.server.close(() => {
          this.isRunning = false;
          console.log(`🛑 Alex AI Enhanced Interactive Dashboard Server stopped on port ${this.port}`);
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
  const server = new EnhancedInteractiveDashboardServer();
  
  server.start().then(() => {
    // Open dashboard in browser
    setTimeout(() => {
      open(`http://localhost:${server.port}`);
    }, 1000);
  }).catch(console.error);

  // Graceful shutdown
  process.on('SIGTERM', () => {
    console.log('SIGTERM signal received. Shutting down enhanced interactive dashboard server...');
    server.stop().then(() => process.exit(0));
  });

  process.on('SIGINT', () => {
    console.log('SIGINT signal received. Shutting down enhanced interactive dashboard server...');
    server.stop().then(() => process.exit(0));
  });
}

module.exports = EnhancedInteractiveDashboardServer;


