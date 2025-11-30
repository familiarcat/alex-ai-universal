/**
 * Complete Dashboard Server
 * Full project management with content editing, theme selection, and live updates
 */

const http = require('http');
const { Server: SocketIO } = require('socket.io');
const MultiProjectManager = require('./multi-project-manager');
const UniversalThemeManager = require('../../../universal-theme-system/theme-manager');

class CompleteDashboardServer {
  constructor(port = 3001) {
    this.port = port;
    this.projectManager = new MultiProjectManager();
    this.themeManager = new UniversalThemeManager();
    this.projectContent = new Map();
    
    // Initialize default content for each project
    this.initializeProjectContent();
  }

  initializeProjectContent() {
    this.projectContent.set('alpha', {
      headline: '✨ Discover Your Next Obsession',
      subheadline: 'Curated collections of premium streetwear and creative essentials',
      description: 'Limited edition drops and exclusive designs you won\'t find anywhere else'
    });
    
    this.projectContent.set('beta', {
      headline: 'Compassionate Care, When You Need It Most',
      subheadline: 'Board-certified providers dedicated to your health and wellness',
      description: 'Professional healthcare services with telemedicine and HIPAA compliance'
    });
    
    this.projectContent.set('gamma', {
      headline: '⚡ Unlock the Power of Your Data',
      subheadline: 'Real-time analytics and ML-powered insights for modern teams',
      description: 'Advanced dashboards, custom reports, and powerful API access'
    });
  }

  start() {
    return new Promise((resolve) => {
      const server = http.createServer((req, res) => {
        this.handleRequest(req, res);
      });

      const io = new SocketIO(server, { cors: { origin: '*' } });
      
      io.on('connection', (socket) => {
        console.log('📡 Dashboard client connected');
        
        socket.on('update-content', (data) => {
          const content = this.projectContent.get(data.projectId) || {};
          content[data.field] = data.value;
          this.projectContent.set(data.projectId, content);
          io.emit('content-updated', data);
          console.log(`📝 ${data.projectId}: ${data.field} updated`);
        });

        socket.on('change-theme', (data) => {
          this.themeManager.setProjectTheme(data.projectId, data.themeId);
          io.emit('theme-changed', data);
          console.log(`🎨 ${data.projectId} theme → ${data.themeId}`);
        });

        socket.on('start-project', async (data) => {
          await this.projectManager.startProject(data.projectId);
          io.emit('project-status-changed', { projectId: data.projectId, status: 'running' });
        });

        socket.on('stop-project', async (data) => {
          await this.projectManager.stopProject(data.projectId);
          io.emit('project-status-changed', { projectId: data.projectId, status: 'stopped' });
        });
      });

      this.io = io;
      server.listen(this.port, () => {
        console.log(`🎨 Complete Dashboard running on http://localhost:${this.port}`);
        resolve();
      });
    });
  }

  handleRequest(req, res) {
    const url = new URL(req.url, `http://localhost:${this.port}`);
    
    if (url.pathname === '/') {
      this.serveDashboard(res);
    } else if (url.pathname === '/api/projects') {
      const projects = this.projectManager.getAllProjects();
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(projects));
    } else if (url.pathname === '/api/content') {
      const content = Object.fromEntries(this.projectContent);
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(content));
    } else if (url.pathname === '/api/themes') {
      const themes = this.themeManager.getAllThemes();
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(themes));
    } else if (url.pathname === '/api/stats') {
      const stats = this.projectManager.getProjectStats();
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(stats));
    } else {
      res.writeHead(404);
      res.end('Not found');
    }
  }

  serveDashboard(res) {
    const html = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>🖖 Alex AI Complete Dashboard</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
            background: linear-gradient(135deg, #0a0015 0%, #150a1f 100%);
            color: #d0d0d0;
            min-height: 100vh;
            padding: 20px;
        }
        .container { max-width: 1800px; margin: 0 auto; }
        .header {
            background: rgba(0, 255, 170, 0.05);
            backdrop-filter: blur(10px);
            padding: 30px;
            border-radius: 16px;
            margin-bottom: 30px;
            border: 1px solid rgba(0, 255, 170, 0.2);
        }
        .header h1 { font-size: 36px; color: #00ffaa; margin-bottom: 15px; }
        .header-actions {
            display: flex;
            gap: 12px;
            margin-top: 20px;
        }
        .btn {
            padding: 12px 24px;
            border: none;
            border-radius: 8px;
            font-size: 14px;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.2s;
        }
        .btn-primary { background: #00ffaa; color: #0a0015; }
        .btn-secondary { background: rgba(255, 255, 255, 0.1); color: #00ffaa; border: 1px solid rgba(0, 255, 170, 0.3); }
        .btn:hover { transform: translateY(-2px); opacity: 0.9; }
        
        .stats-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 15px;
            margin-bottom: 30px;
        }
        .stat-card {
            background: rgba(0, 255, 170, 0.05);
            padding: 25px;
            border-radius: 12px;
            border: 1px solid rgba(0, 255, 170, 0.2);
            text-align: center;
        }
        .stat-value { font-size: 36px; font-weight: 700; color: #00ffaa; }
        .stat-label { font-size: 14px; opacity: 0.8; margin-top: 5px; }
        
        .projects-list {
            display: flex;
            flex-direction: column;
            gap: 30px;
        }
        .project-panel {
            background: rgba(0, 255, 170, 0.03);
            border: 2px solid rgba(0, 255, 170, 0.2);
            border-radius: 16px;
            overflow: hidden;
        }
        .project-header {
            background: rgba(0, 255, 170, 0.1);
            padding: 20px 30px;
            display: flex;
            justify-content: space-between;
            align-items: center;
            border-bottom: 1px solid rgba(0, 255, 170, 0.2);
        }
        .project-title { font-size: 24px; font-weight: 600; color: #00ffaa; }
        .project-meta {
            display: flex;
            gap: 20px;
            font-size: 13px;
            opacity: 0.8;
        }
        .project-body {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 30px;
            padding: 30px;
        }
        
        /* Content Editor */
        .editor-panel h3 {
            font-size: 16px;
            color: #00ffaa;
            margin-bottom: 20px;
            padding-bottom: 10px;
            border-bottom: 1px solid rgba(0, 255, 170, 0.2);
        }
        .form-group {
            margin-bottom: 20px;
        }
        .form-group label {
            display: block;
            font-size: 13px;
            color: #00ffaa;
            margin-bottom: 6px;
            font-weight: 500;
        }
        .form-input {
            width: 100%;
            padding: 12px;
            background: rgba(0, 0, 0, 0.3);
            border: 1px solid rgba(0, 255, 170, 0.3);
            border-radius: 6px;
            color: #d0d0d0;
            font-size: 14px;
            font-family: inherit;
        }
        .form-input:focus {
            outline: none;
            border-color: #00ffaa;
            box-shadow: 0 0 10px rgba(0, 255, 170, 0.2);
        }
        textarea.form-input {
            min-height: 80px;
            resize: vertical;
        }
        
        /* Live Preview */
        .preview-panel h3 {
            font-size: 16px;
            color: #00ffaa;
            margin-bottom: 20px;
            padding-bottom: 10px;
            border-bottom: 1px solid rgba(0, 255, 170, 0.2);
        }
        .preview-frame {
            background: rgba(0, 0, 0, 0.5);
            border: 1px solid rgba(0, 255, 170, 0.2);
            border-radius: 12px;
            padding: 30px;
            min-height: 300px;
        }
        .preview-headline {
            font-size: 28px;
            font-weight: 700;
            margin-bottom: 12px;
            color: #00ffaa;
        }
        .preview-subheadline {
            font-size: 16px;
            opacity: 0.9;
            margin-bottom: 12px;
        }
        .preview-description {
            font-size: 14px;
            opacity: 0.8;
            line-height: 1.6;
        }
        
        /* Theme Selector */
        .theme-grid {
            display: grid;
            grid-template-columns: repeat(5, 1fr);
            gap: 10px;
            margin-top: 15px;
        }
        .theme-option {
            padding: 12px;
            background: rgba(0, 0, 0, 0.3);
            border: 2px solid rgba(0, 255, 170, 0.2);
            border-radius: 8px;
            text-align: center;
            cursor: pointer;
            transition: all 0.2s;
        }
        .theme-option:hover {
            border-color: #00ffaa;
            background: rgba(0, 255, 170, 0.1);
        }
        .theme-option.active {
            background: rgba(0, 255, 170, 0.2);
            border-color: #00ffaa;
        }
        .theme-icon { font-size: 24px; margin-bottom: 5px; }
        .theme-name { font-size: 11px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🖖 Alex AI Complete Dashboard - Project Management</h1>
            <p style="opacity: 0.9; margin-top: 10px;">
                Manage 3 projects with live content editing, theme selection, and real-time updates
            </p>
            <div class="header-actions">
                <button class="btn btn-primary" onclick="window.open('http://localhost:3010', '_blank')">
                    🖼️ View Theme Gallery
                </button>
                <button class="btn btn-secondary" onclick="refreshAll()">
                    🔄 Refresh All Projects
                </button>
            </div>
        </div>

        <div class="stats-grid" id="statsGrid"></div>

        <div class="projects-list" id="projectsList"></div>
    </div>

    <script src="/socket.io/socket.io.js"></script>
    <script>
        const socket = io();
        let allProjects = [];
        let allThemes = [];
        let projectContent = {};

        async function loadDashboard() {
            // Load data
            const [projects, themes, content, stats] = await Promise.all([
                fetch('/api/projects').then(r => r.json()),
                fetch('/api/themes').then(r => r.json()),
                fetch('/api/content').then(r => r.json()),
                fetch('/api/stats').then(r => r.json())
            ]);

            allProjects = projects;
            allThemes = themes;
            projectContent = content;

            // Render stats
            document.getElementById('statsGrid').innerHTML = \`
                <div class="stat-card">
                    <div class="stat-value">\${stats.total}</div>
                    <div class="stat-label">Total Projects</div>
                </div>
                <div class="stat-card">
                    <div class="stat-value">\${stats.active}</div>
                    <div class="stat-label">Active Now</div>
                </div>
                <div class="stat-card">
                    <div class="stat-value">$\${(stats.totalBudget/1000).toFixed(0)}K</div>
                    <div class="stat-label">Portfolio Value</div>
                </div>
                <div class="stat-card">
                    <div class="stat-value">10</div>
                    <div class="stat-label">Theme Options</div>
                </div>
            \`;

            // Render projects
            renderProjects();
        }

        function renderProjects() {
            document.getElementById('projectsList').innerHTML = allProjects.map(project => {
                const content = projectContent[project.id] || {};
                const currentTheme = allThemes.find(t => t.id === 'gradient'); // Default for now
                
                return \`
                <div class="project-panel">
                    <div class="project-header">
                        <div>
                            <div class="project-title">\${project.name}</div>
                            <div class="project-meta">
                                <span>📍 Port: \${project.port}</span>
                                <span>💰 Budget: $\${(project.budget/1000).toFixed(0)}K</span>
                                <span>👥 Crew: \${project.assignedCrew.length}</span>
                                <span>⏱️ Timeline: \${project.timeline}</span>
                            </div>
                        </div>
                        <div style="display: flex; gap: 10px;">
                            <button class="btn btn-primary" onclick="viewProject(\${project.port})">
                                🌐 View Live
                            </button>
                        </div>
                    </div>

                    <div class="project-body">
                        <!-- Content Editor -->
                        <div class="editor-panel">
                            <h3>✏️ Content Editor</h3>
                            
                            <div class="form-group">
                                <label>Headline</label>
                                <input type="text" class="form-input" 
                                       value="\${content.headline || ''}"
                                       onchange="updateContent('\${project.id}', 'headline', this.value)"
                                       placeholder="Enter headline...">
                            </div>

                            <div class="form-group">
                                <label>Subheadline</label>
                                <input type="text" class="form-input"
                                       value="\${content.subheadline || ''}"
                                       onchange="updateContent('\${project.id}', 'subheadline', this.value)"
                                       placeholder="Enter subheadline...">
                            </div>

                            <div class="form-group">
                                <label>Description</label>
                                <textarea class="form-input"
                                          onchange="updateContent('\${project.id}', 'description', this.value)"
                                          placeholder="Enter description...">\${content.description || ''}</textarea>
                            </div>

                            <div class="form-group">
                                <label>🎨 Theme Selection</label>
                                <div class="theme-grid">
                                    \${allThemes.slice(0, 10).map(theme => \`
                                        <div class="theme-option" onclick="changeProjectTheme('\${project.id}', '\${theme.id}')">
                                            <div class="theme-icon">\${theme.icon}</div>
                                            <div class="theme-name">\${theme.name.split(' ')[0]}</div>
                                        </div>
                                    \`).join('')}
                                </div>
                            </div>
                        </div>

                        <!-- Live Preview -->
                        <div class="preview-panel">
                            <h3>👁️ Live Preview</h3>
                            <div class="preview-frame" id="preview-\${project.id}">
                                <div class="preview-headline">\${content.headline || 'Add headline...'}</div>
                                <div class="preview-subheadline">\${content.subheadline || 'Add subheadline...'}</div>
                                <div class="preview-description">\${content.description || 'Add description...'}</div>
                                
                                <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid rgba(0, 255, 170, 0.2);">
                                    <div style="font-size: 13px; opacity: 0.7; margin-bottom: 15px;">
                                        Port: \${project.port} | Type: \${project.type} | Theme: Active
                                    </div>
                                    <div style="display: flex; gap: 8px; flex-wrap: wrap;">
                                        \${project.tech.map(t => \`
                                            <span style="background: rgba(0, 255, 170, 0.15); padding: 4px 10px; border-radius: 12px; font-size: 11px;">
                                                \${t}
                                            </span>
                                        \`).join('')}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                \`;
            }).join('');
        }

        function updateContent(projectId, field, value) {
            // Update local state
            if (!projectContent[projectId]) projectContent[projectId] = {};
            projectContent[projectId][field] = value;

            // Update preview
            const previewElement = document.querySelector(\`#preview-\${projectId} .preview-\${field}\`);
            if (previewElement) {
                previewElement.textContent = value || \`Add \${field}...\`;
            }

            // Broadcast to server
            socket.emit('update-content', { projectId, field, value });
        }

        function changeProjectTheme(projectId, themeId) {
            socket.emit('change-theme', { projectId, themeId });
            alert(\`Theme will change to \${themeId} on next page reload\`);
        }

        function viewProject(port) {
            window.open(\`http://localhost:\${port}\`, '_blank');
        }

        function refreshAll() {
            loadDashboard();
        }

        socket.on('connect', () => {
            console.log('✅ Connected to dashboard');
            loadDashboard();
        });

        socket.on('content-updated', (data) => {
            console.log(\`Content updated: \${data.projectId}.\${data.field}\`);
        });

        socket.on('theme-changed', (data) => {
            console.log(\`Theme changed: \${data.projectId} → \${data.themeId}\`);
        });

        loadDashboard();
    </script>
</body>
</html>`;

    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.end(html);
  }
}

module.exports = CompleteDashboardServer;

if (require.main === module) {
  const dashboard = new CompleteDashboardServer();
  dashboard.start().then(() => {
    console.log('✅ Complete Dashboard operational!');
    console.log('🎨 Full project management with content editing');
  });
}

