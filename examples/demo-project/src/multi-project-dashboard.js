/**
 * Alex AI Multi-Project Dashboard
 * Port 3001 - Manages multiple projects simultaneously
 */

const http = require('http');
const { Server: SocketIO } = require('socket.io');
const MultiProjectManager = require('./multi-project-manager');

class MultiProjectDashboard {
  constructor(port = 3001) {
    this.port = port;
    this.projectManager = new MultiProjectManager();
    this.server = null;
    this.io = null;
  }

  start() {
    return new Promise((resolve) => {
      this.server = http.createServer((req, res) => {
        this.handleRequest(req, res);
      });

      this.io = new SocketIO(this.server, {
        cors: { origin: '*' }
      });

      this.io.on('connection', (socket) => {
        console.log('📡 Dashboard client connected');
        
        socket.on('start-project', async (data) => {
          const project = await this.projectManager.startProject(data.projectId);
          this.io.emit('project-updated', project);
        });

        socket.on('stop-project', async (data) => {
          const project = await this.projectManager.stopProject(data.projectId);
          this.io.emit('project-updated', project);
        });

        socket.on('assign-crew', (data) => {
          const project = this.projectManager.assignCrewToProject(data.projectId, data.crewId);
          this.io.emit('project-updated', project);
        });
      });

      this.server.listen(this.port, () => {
        console.log(`🖖 Multi-Project Dashboard running on http://localhost:${this.port}`);
        resolve();
      });
    });
  }

  handleRequest(req, res) {
    const url = new URL(req.url, `http://localhost:${this.port}`);
    
    if (url.pathname === '/') {
      this.serveDashboard(res);
    } else if (url.pathname === '/api/projects') {
      this.serveProjects(res);
    } else if (url.pathname === '/api/stats') {
      this.serveStats(res);
    } else if (url.pathname === '/api/crew-workload') {
      this.serveCrewWorkload(res);
    } else {
      res.writeHead(404);
      res.end('Not found');
    }
  }

  serveProjects(res) {
    const projects = this.projectManager.getAllProjects();
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(projects));
  }

  serveStats(res) {
    const stats = this.projectManager.getProjectStats();
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(stats));
  }

  serveCrewWorkload(res) {
    const workload = this.projectManager.getCrewWorkload();
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(workload));
  }

  serveDashboard(res) {
    const html = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>🖖 Alex AI - Multi-Project Dashboard</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
            background: linear-gradient(135deg, #0c1445 0%, #1a237e 100%);
            color: #ffffff;
            min-height: 100vh;
            padding: 20px;
        }
        .container { max-width: 1600px; margin: 0 auto; }
        .header {
            background: rgba(0, 0, 0, 0.3);
            backdrop-filter: blur(10px);
            padding: 30px;
            border-radius: 12px;
            margin-bottom: 30px;
            text-align: center;
        }
        .header h1 { font-size: 36px; color: #00ff88; margin-bottom: 10px; }
        .header p { font-size: 16px; opacity: 0.8; }
        .stats-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 15px;
            margin-bottom: 30px;
        }
        .stat-card {
            background: rgba(0, 0, 0, 0.3);
            padding: 20px;
            border-radius: 10px;
            border: 1px solid rgba(0, 255, 136, 0.3);
            text-align: center;
        }
        .stat-value { font-size: 32px; font-weight: bold; color: #00ff88; }
        .stat-label { font-size: 14px; opacity: 0.7; margin-top: 5px; }
        .projects-grid {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(400px, 1fr));
            gap: 20px;
        }
        .project-card {
            background: rgba(0, 0, 0, 0.3);
            backdrop-filter: blur(10px);
            padding: 25px;
            border-radius: 12px;
            border: 1px solid rgba(255, 255, 255, 0.1);
            transition: transform 0.3s, border-color 0.3s;
        }
        .project-card:hover {
            transform: translateY(-5px);
            border-color: #00ff88;
        }
        .project-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 15px;
        }
        .project-name { font-size: 20px; font-weight: 600; color: #00ff88; }
        .project-status {
            padding: 5px 12px;
            border-radius: 20px;
            font-size: 12px;
            font-weight: 600;
        }
        .status-running { background: #4CAF50; color: white; }
        .status-stopped { background: #f44336; color: white; }
        .project-description { font-size: 14px; opacity: 0.8; margin-bottom: 15px; }
        .project-meta {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 10px;
            margin-bottom: 15px;
            font-size: 13px;
        }
        .meta-item { opacity: 0.9; }
        .tech-tags {
            display: flex;
            flex-wrap: wrap;
            gap: 6px;
            margin-bottom: 15px;
        }
        .tech-tag {
            background: rgba(0, 255, 136, 0.2);
            padding: 4px 10px;
            border-radius: 12px;
            font-size: 11px;
            border: 1px solid rgba(0, 255, 136, 0.4);
        }
        .crew-section {
            margin-bottom: 15px;
            padding: 10px;
            background: rgba(0, 0, 0, 0.2);
            border-radius: 8px;
        }
        .crew-section h4 { font-size: 12px; margin-bottom: 8px; color: #00ff88; }
        .crew-badges {
            display: flex;
            flex-wrap: wrap;
            gap: 6px;
        }
        .crew-badge {
            background: rgba(255, 255, 255, 0.1);
            padding: 4px 10px;
            border-radius: 12px;
            font-size: 11px;
        }
        .project-actions {
            display: flex;
            gap: 10px;
        }
        .btn {
            flex: 1;
            padding: 10px;
            border: none;
            border-radius: 6px;
            font-size: 14px;
            font-weight: 600;
            cursor: pointer;
            transition: opacity 0.3s;
        }
        .btn:hover { opacity: 0.8; }
        .btn-primary { background: #00ff88; color: #0c1445; }
        .btn-secondary { background: rgba(255, 255, 255, 0.1); color: white; border: 1px solid rgba(255, 255, 255, 0.3); }
        .btn-danger { background: #f44336; color: white; }
        .port-badge {
            background: rgba(255, 215, 0, 0.2);
            padding: 4px 10px;
            border-radius: 12px;
            font-size: 11px;
            border: 1px solid rgba(255, 215, 0, 0.4);
            color: #ffd700;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🖖 Alex AI Multi-Project Dashboard</h1>
            <p>Single source of truth for managing multiple web deployments</p>
        </div>

        <div class="stats-grid" id="statsGrid">
            <!-- Stats populated by JavaScript -->
        </div>

        <div class="projects-grid" id="projectsGrid">
            <!-- Projects populated by JavaScript -->
        </div>
    </div>

    <script src="/socket.io/socket.io.js"></script>
    <script>
        const socket = io();
        
        async function loadDashboard() {
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
                    <div class="stat-label">Active Projects</div>
                </div>
                <div class="stat-card">
                    <div class="stat-value">$\${(stats.totalBudget / 1000).toFixed(0)}K</div>
                    <div class="stat-label">Total Budget</div>
                </div>
                <div class="stat-card">
                    <div class="stat-value">\${stats.avgResponseTime.toFixed(0)}ms</div>
                    <div class="stat-label">Avg Response</div>
                </div>
            \`;

            // Load projects
            const projectsRes = await fetch('/api/projects');
            const projects = await projectsRes.json();
            
            document.getElementById('projectsGrid').innerHTML = projects.map(project => \`
                <div class="project-card">
                    <div class="project-header">
                        <div class="project-name">\${project.name}</div>
                        <div class="project-status status-\${project.status}">
                            \${project.status === 'running' ? '🟢 Running' : '🔴 Stopped'}
                        </div>
                    </div>
                    
                    <div class="project-description">\${project.description}</div>
                    
                    <div class="project-meta">
                        <div class="meta-item">💰 Budget: $\${(project.budget / 1000).toFixed(0)}K</div>
                        <div class="meta-item">⏱️ Timeline: \${project.timeline}</div>
                        <div class="meta-item">📊 Type: \${project.type}</div>
                        <div class="meta-item"><span class="port-badge">Port: \${project.port}</span></div>
                    </div>
                    
                    <div class="tech-tags">
                        \${project.tech.map(tech => \`<span class="tech-tag">\${tech}</span>\`).join('')}
                    </div>
                    
                    <div class="crew-section">
                        <h4>👥 Assigned Crew (\${project.assignedCrew.length})</h4>
                        <div class="crew-badges">
                            \${project.assignedCrew.map(crew => \`<span class="crew-badge">\${crew}</span>\`).join('')}
                        </div>
                    </div>
                    
                    <div class="project-actions">
                        <button class="btn btn-primary" onclick="viewProject('\${project.id}', \${project.port})">
                            🌐 View Site
                        </button>
                        <button class="btn btn-secondary" onclick="manageProject('\${project.id}')">
                            ⚙️ Manage
                        </button>
                        \${project.status === 'stopped' ? 
                            \`<button class="btn btn-primary" onclick="startProject('\${project.id}')">▶️ Start</button>\` :
                            \`<button class="btn btn-danger" onclick="stopProject('\${project.id}')">⏸️ Stop</button>\`
                        }
                    </div>
                </div>
            \`).join('');
        }

        function viewProject(projectId, port) {
            window.open(\`http://localhost:\${port}\`, '_blank');
        }

        function manageProject(projectId) {
            alert(\`Project management for \${projectId} - Coming soon!\`);
        }

        function startProject(projectId) {
            socket.emit('start-project', { projectId });
        }

        function stopProject(projectId) {
            socket.emit('stop-project', { projectId });
        }

        socket.on('project-updated', () => {
            loadDashboard();
        });

        socket.on('connect', () => {
            console.log('Connected to dashboard');
            loadDashboard();
        });

        // Initial load
        loadDashboard();
    </script>
</body>
</html>`;
    
    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.end(html);
  }
}

module.exports = MultiProjectDashboard;

// Start if run directly
if (require.main === module) {
  const dashboard = new MultiProjectDashboard();
  dashboard.start().then(() => {
    console.log('✅ Multi-Project Dashboard operational!');
    console.log('🖖 Dashboard: http://localhost:3001');
    console.log('📊 Managing 3 projects: Alpha, Beta, Gamma');
  });
}

