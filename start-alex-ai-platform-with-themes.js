#!/usr/bin/env node

/**
 * Alex AI Platform Launcher with Universal Theme System
 * Starts Dashboard + 3 Projects with independent themes
 */

const http = require('http');
const path = require('path');

// Load from correct paths
const projectRoot = path.join(__dirname, 'examples/demo-project');
const { Server: SocketIO } = require(path.join(projectRoot, 'node_modules/socket.io'));
const MultiProjectManager = require('./examples/demo-project/src/multi-project-manager');
const UniversalThemeManager = require('./universal-theme-system/theme-manager');
const EnhancedProjectServer = require('./managed-projects/enhanced-project-server');
const ThemeGalleryServer = require('./universal-theme-system/theme-gallery-server');
const CompleteDashboardServer = require('./examples/demo-project/src/complete-dashboard-server');

class AlexAIPlatform {
  constructor() {
    this.projectManager = new MultiProjectManager();
    this.themeManager = new UniversalThemeManager();
    this.servers = new Map();
    this.dashboardServer = null;
    this.io = null;
  }

  async start() {
    console.log('\n🖖 ====================================');
    console.log('   ALEX AI PLATFORM LAUNCHER');
    console.log('   Multi-Project + Universal Themes');
    console.log('====================================\n');

    // Start dashboard
    await this.startDashboard();
    
    // Start theme gallery
    await this.startThemeGallery();
    
    // Start all projects
    await this.startAllProjects();

    console.log('\n🎉 ====================================');
    console.log('   ALL SYSTEMS OPERATIONAL!');
    console.log('====================================\n');
    console.log('🎨 Dashboard:      http://localhost:3001 (Midnight Dark 🌙)');
    console.log('🖼️  Theme Gallery:  http://localhost:3010 (View All 10 Themes)');
    console.log('🛒 Project Alpha:  http://localhost:3000 (Gradient Fusion 🌈)');
    console.log('🏥 Project Beta:   http://localhost:3002 (Pastel Minimalism 🌸)');
    console.log('📊 Project Gamma:  http://localhost:3003 (Cyberpunk Neon 🔮)');
    console.log('\n👥 9 Crew Members | 💰 $50K Portfolio | 🎨 10 Theme Options');
    console.log('\n🔄 Press Ctrl+C to stop all services\n');
  }

  async startThemeGallery() {
    const gallery = new ThemeGalleryServer(3010);
    await gallery.start();
    this.themeGallery = gallery;
  }

  async startDashboard() {
    const dashboard = new CompleteDashboardServer(3001);
    await dashboard.start();
    this.dashboardServer = dashboard;
  }

  async startAllProjects() {
    const projects = this.projectManager.getAllProjects();
    
    for (const project of projects) {
      await this.startProject(project);
    }
  }

  async startProject(project) {
    const themeId = this.themeManager.getProjectTheme(project.id);
    const projectServer = new EnhancedProjectServer(project, themeId);
    await projectServer.start();
    this.servers.set(project.id, projectServer);
  }

  handleDashboardRequest(req, res) {
    const url = new URL(req.url, 'http://localhost:3001');
    
    if (url.pathname === '/') {
      this.serveDashboardHTML(res);
    } else if (url.pathname === '/api/projects') {
      const projects = this.projectManager.getAllProjects();
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(projects));
    } else if (url.pathname === '/api/themes') {
      const themes = this.themeManager.getAllThemes();
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(themes));
    } else if (url.pathname === '/api/project-themes') {
      const assignments = this.themeManager.getAllProjectThemes();
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(assignments));
    } else if (url.pathname === '/api/stats') {
      const stats = this.projectManager.getProjectStats();
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(stats));
    } else {
      res.writeHead(404);
      res.end('Not found');
    }
  }

  serveDashboardHTML(res) {
    const themeId = this.themeManager.getProjectTheme('dashboard');
    const theme = this.themeManager.getThemeDefinition(themeId);
    const css = theme.css;
    
    const html = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>🖖 Alex AI Multi-Project Dashboard</title>
    <style>
        :root {
            ${Object.entries(css).map(([key, value]) => `${key}: ${value};`).join('\n            ')}
        }
        
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
            background: var(--background);
            color: var(--text);
            min-height: 100vh;
            padding: 20px;
        }
        .container { max-width: 1600px; margin: 0 auto; }
        .header {
            background: var(--surface);
            backdrop-filter: blur(var(--blur, 10px));
            padding: 30px;
            border-radius: 16px;
            margin-bottom: 30px;
            border: 1px solid var(--border);
        }
        .header-content { display: flex; justify-content: space-between; align-items: center; }
        .header h1 { font-size: 36px; color: var(--accent, #00ff88); }
        .theme-selector {
            display: flex;
            gap: 10px;
            align-items: center;
        }
        .theme-selector select {
            background: rgba(0, 0, 0, 0.3);
            color: var(--text);
            border: 1px solid var(--border);
            padding: 10px 15px;
            border-radius: 8px;
            font-size: 14px;
            cursor: pointer;
        }
        .stats-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 15px;
            margin-bottom: 30px;
        }
        .stat-card {
            background: var(--surface);
            padding: 25px;
            border-radius: 12px;
            border: 1px solid var(--border);
            text-align: center;
        }
        .stat-value { font-size: 36px; font-weight: bold; color: var(--accent, #00ff88); margin-bottom: 5px; }
        .stat-label { font-size: 14px; opacity: 0.8; }
        .projects-grid {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(450px, 1fr));
            gap: 20px;
        }
        .project-card {
            background: var(--surface);
            backdrop-filter: blur(var(--blur, 10px));
            padding: 25px;
            border-radius: 16px;
            border: 2px solid var(--border);
            transition: transform 0.3s, border-color 0.3s;
        }
        .project-card:hover {
            transform: translateY(-5px);
            border-color: var(--accent, #00ff88);
        }
        .project-header {
            display: flex;
            justify-content: space-between;
            align-items: start;
            margin-bottom: 15px;
        }
        .project-title { font-size: 22px; font-weight: 600; color: var(--accent, #00ff88); }
        .project-theme-badge {
            font-size: 24px;
            cursor: pointer;
            transition: transform 0.2s;
        }
        .project-theme-badge:hover { transform: scale(1.2); }
        .project-desc { font-size: 14px; opacity: 0.9; margin-bottom: 15px; line-height: 1.5; }
        .project-meta {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 10px;
            margin-bottom: 15px;
            font-size: 13px;
            padding: 15px;
            background: rgba(0, 0, 0, 0.2);
            border-radius: 8px;
        }
        .tech-tags {
            display: flex;
            flex-wrap: wrap;
            gap: 6px;
            margin-bottom: 15px;
        }
        .tech-tag {
            background: rgba(0, 255, 136, 0.15);
            padding: 5px 12px;
            border-radius: 12px;
            font-size: 11px;
            border: 1px solid rgba(0, 255, 136, 0.3);
        }
        .crew-section {
            margin-bottom: 15px;
            padding: 12px;
            background: rgba(0, 0, 0, 0.15);
            border-radius: 8px;
        }
        .crew-section h4 { font-size: 13px; margin-bottom: 10px; opacity: 0.9; }
        .crew-badges {
            display: flex;
            flex-wrap: wrap;
            gap: 8px;
        }
        .crew-badge {
            background: rgba(255, 255, 255, 0.1);
            padding: 5px 12px;
            border-radius: 12px;
            font-size: 11px;
            border: 1px solid rgba(255, 255, 255, 0.2);
        }
        .project-actions {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 10px;
        }
        .btn {
            padding: 12px;
            border: none;
            border-radius: 8px;
            font-size: 14px;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.3s;
        }
        .btn-primary {
            background: var(--accent, #00ff88);
            color: #0c1445;
        }
        .btn-secondary {
            background: rgba(255, 255, 255, 0.1);
            color: var(--text);
            border: 1px solid var(--border);
        }
        .btn:hover { transform: translateY(-2px); opacity: 0.9; }
        .theme-selector-panel {
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: var(--surface);
            padding: 30px;
            border-radius: 16px;
            border: 2px solid var(--border);
            box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
            z-index: 1000;
            display: none;
            max-width: 600px;
            max-height: 80vh;
            overflow-y: auto;
        }
        .theme-selector-panel.active { display: block; }
        .overlay {
            position: fixed;
            inset: 0;
            background: rgba(0, 0, 0, 0.7);
            backdrop-filter: blur(5px);
            z-index: 999;
            display: none;
        }
        .overlay.active { display: block; }
        .theme-option {
            padding: 15px;
            margin-bottom: 10px;
            background: rgba(0, 0, 0, 0.2);
            border-radius: 8px;
            cursor: pointer;
            border: 1px solid transparent;
            transition: all 0.2s;
        }
        .theme-option:hover {
            border-color: var(--accent, #00ff88);
            background: rgba(0, 255, 136, 0.1);
        }
        .theme-option-header {
            display: flex;
            align-items: center;
            gap: 12px;
            margin-bottom: 5px;
        }
        .theme-icon { font-size: 24px; }
        .theme-name { font-weight: 600; font-size: 16px; }
        .theme-desc { font-size: 12px; opacity: 0.7; margin-left: 36px; }
    </style>
</head>
<body>
    <div class="overlay" id="overlay" onclick="closeThemeSelector()"></div>
    <div class="theme-selector-panel" id="themeSelectorPanel">
        <h2 style="margin-bottom: 20px; color: var(--accent, #00ff88);">Select Theme</h2>
        <div id="themeOptions"></div>
        <button class="btn btn-secondary" onclick="closeThemeSelector()" style="width: 100%; margin-top: 15px;">
            Cancel
        </button>
    </div>

    <div class="container">
        <div class="header">
            <div class="header-content">
                <div>
                    <h1>🖖 Alex AI Multi-Project Dashboard</h1>
                    <p style="margin-top: 10px; opacity: 0.8; font-size: 16px;">
                        Single source of truth for managing multiple web deployments
                    </p>
                </div>
                <div style="display: flex; gap: 12px; align-items: center;">
                    <button class="btn btn-secondary" onclick="window.open('http://localhost:3010', '_blank')" style="padding: 10px 20px;">
                        🖼️ View Theme Gallery
                    </button>
                    <button class="btn btn-secondary" onclick="openThemeSelector('dashboard')" style="padding: 10px 20px;">
                        ${this.themeManager.getThemeDefinition(themeId).icon} Change Theme
                    </button>
                </div>
            </div>
        </div>

        <div class="stats-grid" id="statsGrid">
            <!-- Populated by JavaScript -->
        </div>

        <div class="projects-grid" id="projectsGrid">
            <!-- Populated by JavaScript -->
        </div>
    </div>

    <script src="/socket.io/socket.io.js"></script>
    <script>
        const socket = io();
        let currentProject = null;
        let allThemes = [];

        async function loadDashboard() {
            // Load themes
            const themesRes = await fetch('/api/themes');
            allThemes = await themesRes.json();

            // Load stats
            const statsRes = await fetch('/api/stats');
            const stats = await statsRes.json();
            
            document.getElementById('statsGrid').innerHTML = \`
                <div class="stat-card">
                    <div class="stat-value">\${stats.total}</div>
                    <div class="stat-label">Total Projects</div>
                </div>
                <div class="stat-card">
                    <div class="stat-value">\${stats.active}</div>
                    <div class="stat-label">Running Now</div>
                </div>
                <div class="stat-card">
                    <div class="stat-value">$\${(stats.totalBudget / 1000).toFixed(0)}K</div>
                    <div class="stat-label">Portfolio Value</div>
                </div>
                <div class="stat-card">
                    <div class="stat-value">10</div>
                    <div class="stat-label">Theme Options</div>
                </div>
            \`;

            // Load projects
            const projectsRes = await fetch('/api/projects');
            const projects = await projectsRes.json();
            
            const themesAssignments = await fetch('/api/project-themes').then(r => r.json());
            
            document.getElementById('projectsGrid').innerHTML = projects.map(project => {
                const projectTheme = themesAssignments.find(t => t.projectId === project.id);
                return \`
                <div class="project-card">
                    <div class="project-header">
                        <div class="project-title">\${project.name}</div>
                        <div class="project-theme-badge" onclick="openThemeSelector('\${project.id}')" title="Change theme">
                            \${projectTheme?.themeIcon || '🎨'}
                        </div>
                    </div>
                    
                    <div class="project-desc">\${project.description}</div>
                    
                    <div class="project-meta">
                        <div>💰 Budget: $\${(project.budget / 1000).toFixed(0)}K</div>
                        <div>⏱️ Timeline: \${project.timeline}</div>
                        <div>📊 Type: \${project.type}</div>
                        <div>🎨 Theme: \${projectTheme?.themeName || 'Default'}</div>
                        <div>📍 Port: \${project.port}</div>
                        <div>👥 Crew: \${project.assignedCrew.length}</div>
                    </div>
                    
                    <div class="tech-tags">
                        \${project.tech.map(tech => \`<span class="tech-tag">\${tech}</span>\`).join('')}
                    </div>
                    
                    <div class="crew-section">
                        <h4>👥 Assigned Crew (\${project.assignedCrew.length})</h4>
                        <div class="crew-badges">
                            \${project.assignedCrew.map(crew => \`<span class="crew-badge">🖖 \${crew}</span>\`).join('')}
                        </div>
                    </div>
                    
                    <div class="project-actions">
                        <button class="btn btn-primary" onclick="viewProject('\${project.id}', \${project.port})">
                            🌐 View Live Site
                        </button>
                        <button class="btn btn-secondary" onclick="openThemeSelector('\${project.id}')">
                            🎨 Change Theme
                        </button>
                    </div>
                </div>
            \`;
            }).join('');
        }

        function viewProject(projectId, port) {
            window.open(\`http://localhost:\${port}\`, '_blank');
        }

        function openThemeSelector(projectId) {
            currentProject = projectId;
            const panel = document.getElementById('themeSelectorPanel');
            const overlay = document.getElementById('overlay');
            
            document.getElementById('themeOptions').innerHTML = allThemes.map(theme => \`
                <div class="theme-option" onclick="selectTheme('\${theme.id}')">
                    <div class="theme-option-header">
                        <span class="theme-icon">\${theme.icon}</span>
                        <span class="theme-name">\${theme.name}</span>
                    </div>
                    <div class="theme-desc">\${theme.description}</div>
                </div>
            \`).join('');
            
            panel.classList.add('active');
            overlay.classList.add('active');
        }

        function closeThemeSelector() {
            document.getElementById('themeSelectorPanel').classList.remove('active');
            document.getElementById('overlay').classList.remove('active');
        }

        function selectTheme(themeId) {
            socket.emit('change-project-theme', {
                projectId: currentProject,
                themeId: themeId
            });
            closeThemeSelector();
            
            if (currentProject === 'dashboard') {
                setTimeout(() => window.location.reload(), 100);
            } else {
                setTimeout(() => loadDashboard(), 100);
            }
        }

        socket.on('connect', () => {
            console.log('Connected to dashboard');
            loadDashboard();
        });

        socket.on('theme-updated', (data) => {
            console.log(\`Theme updated for \${data.projectId}\`);
            loadDashboard();
        });

        loadDashboard();
    </script>
</body>
</html>`;
    
    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.end(html);
  }

  handleProjectRequest(req, res, project) {
    const themeId = this.themeManager.getProjectTheme(project.id);
    const theme = this.themeManager.getThemeDefinition(themeId);
    const css = theme.css;
    
    const html = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${project.name}</title>
    <style>
        :root {
            ${Object.entries(css).map(([key, value]) => `${key}: ${value};`).join('\n            ')}
        }
        
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
            background: var(--background);
            color: var(--text);
            min-height: 100vh;
            padding: 40px 20px;
        }
        .container { max-width: 1200px; margin: 0 auto; }
        .header {
            text-align: center;
            padding: 80px 30px;
            background: var(--surface);
            backdrop-filter: blur(var(--blur, 10px));
            border-radius: 24px;
            margin-bottom: 50px;
            border: 2px solid var(--border);
        }
        .header h1 {
            font-size: 56px;
            margin-bottom: 20px;
            background: var(--primary, linear-gradient(135deg, #667eea 0%, #764ba2 100%));
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
        }
        .header p { font-size: 20px; opacity: 0.9; line-height: 1.6; }
        .features-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
            gap: 25px;
            margin-bottom: 50px;
        }
        .feature-card {
            background: var(--surface);
            padding: 35px;
            border-radius: 16px;
            border: 1px solid var(--border);
            transition: transform 0.3s;
        }
        .feature-card:hover {
            transform: translateY(-8px);
            border-color: var(--accent, #00ff88);
        }
        .feature-card h3 {
            font-size: 20px;
            margin-bottom: 12px;
            color: var(--accent, #00ff88);
        }
        .info-section {
            background: var(--surface);
            padding: 30px;
            border-radius: 16px;
            border: 1px solid var(--border);
            margin-bottom: 30px;
        }
        .info-section h2 {
            font-size: 24px;
            margin-bottom: 20px;
            color: var(--accent, #00ff88);
        }
        .tech-badges {
            display: flex;
            flex-wrap: wrap;
            gap: 12px;
            margin-top: 20px;
        }
        .tech-badge {
            background: var(--primary, #667eea);
            color: white;
            padding: 10px 20px;
            border-radius: 20px;
            font-weight: 600;
            font-size: 14px;
        }
        .crew-badges {
            display: flex;
            flex-wrap: wrap;
            gap: 12px;
            margin-top: 20px;
        }
        .crew-badge {
            background: rgba(255, 255, 255, 0.1);
            padding: 10px 20px;
            border-radius: 20px;
            border: 1px solid var(--border);
            font-size: 14px;
        }
        .status-bar {
            position: fixed;
            bottom: 0;
            left: 0;
            right: 0;
            background: rgba(0, 0, 0, 0.9);
            backdrop-filter: blur(10px);
            padding: 20px;
            text-align: center;
            font-size: 14px;
            border-top: 1px solid var(--border);
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
            0%, 100% { opacity: 1; box-shadow: 0 0 10px #4CAF50; }
            50% { opacity: 0.6; }
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>${project.name}</h1>
            <p>${project.description}</p>
            <p style="margin-top: 15px; font-size: 16px; opacity: 0.7;">
                ${theme.icon} ${theme.name} Theme | Managed by Alex AI Dashboard
            </p>
        </div>

        <div class="features-grid">
            ${project.features.map(feature => `
                <div class="feature-card">
                    <h3>✨ ${feature}</h3>
                    <p style="opacity: 0.8; font-size: 14px;">Powered by AI crew intelligence and real-time coordination</p>
                </div>
            `).join('')}
        </div>

        <div class="info-section">
            <h2>🛠️ Technology Stack</h2>
            <div class="tech-badges">
                ${project.tech.map(tech => `<span class="tech-badge">${tech}</span>`).join('')}
            </div>
        </div>

        <div class="info-section">
            <h2>👥 Assigned Crew (${project.assignedCrew.length})</h2>
            <div class="crew-badges">
                ${project.assignedCrew.map(crew => `<span class="crew-badge">🖖 ${crew}</span>`).join('')}
            </div>
        </div>
    </div>

    <div class="status-bar">
        <span class="status-indicator"></span>
        <span>Connected to Alex AI Dashboard (Port 3001) | ${theme.icon} ${theme.name} Theme Active</span>
    </div>
</body>
</html>`;
    
    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.end(html);
  }
}

// Start platform
const platform = new AlexAIPlatform();
platform.start().catch(console.error);

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\n\n🛑 Shutting down Alex AI Platform...');
  console.log('✅ All services stopped');
  process.exit(0);
});

