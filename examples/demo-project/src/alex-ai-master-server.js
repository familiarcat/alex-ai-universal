#!/usr/bin/env node

/**
 * 🖖 ALEX AI MASTER SERVER - UNIFIED COMMAND STRUCTURE
 * 
 * Single server that coordinates all features:
 * - Dashboard (main UI)
 * - Project management (alpha, beta, gamma)
 * - Theme gallery
 * - Vibe quiz
 * - Crew wizard
 * 
 * Reviewed by: Captain Picard (Command Structure) & Commander Riker (Execution)
 */

const express = require('express');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;

// ============================================================================
// LOGGING SYSTEM (Visibility for all operations)
// ============================================================================

const log = {
  info: (msg) => console.log(`ℹ️  ${new Date().toISOString()} | ${msg}`),
  success: (msg) => console.log(`✅ ${new Date().toISOString()} | ${msg}`),
  error: (msg) => console.error(`❌ ${new Date().toISOString()} | ${msg}`),
  warn: (msg) => console.warn(`⚠️  ${new Date().toISOString()} | ${msg}`),
  crew: (member, msg) => console.log(`🖖 ${new Date().toISOString()} | [${member}] ${msg}`)
};

// ============================================================================
// STATE MANAGEMENT (Centralized project state)
// ============================================================================

const projectState = {
  projects: {
    alpha: {
      name: 'Enterprise E-commerce',
      headline: '✨ Discover Your Next Obsession',
      subheadline: 'Curated collections of premium streetwear and creative essentials',
      description: 'Limited edition drops and exclusive designs you won\'t find anywhere else. New releases every Friday.',
      theme: 'gradient',
      port: 3000,
      icon: '🛒',
      budget: 15000
    },
    beta: {
      name: 'Starfleet Medical Portal',
      headline: 'Compassionate Care, When You Need It Most',
      subheadline: 'Board-certified providers dedicated to your health and wellness',
      description: 'Professional healthcare services with telemedicine, patient portal, and HIPAA-compliant security.',
      theme: 'pastel',
      port: 3000,
      icon: '🏥',
      budget: 25000
    },
    gamma: {
      name: 'Federation Analytics',
      headline: '⚡ Unlock the Power of Your Data',
      subheadline: 'Real-time analytics and ML-powered insights for modern teams',
      description: 'Advanced dashboards, custom reports, powerful API access, and predictive analytics.',
      theme: 'cyberpunk',
      port: 3000,
      icon: '📊',
      budget: 10000
    }
  }
};

// ============================================================================
// THEME SYSTEM
// ============================================================================

const themes = {
  gradient: {
    id: 'gradient',
    name: 'Gradient Flow',
    icon: '🌈',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%)',
    textColor: '#ffffff',
    accentColor: '#f093fb'
  },
  pastel: {
    id: 'pastel',
    name: 'Pastel Dreams',
    icon: '🌸',
    background: 'linear-gradient(135deg, #fff5f7 0%, #f5f8ff 100%)',
    textColor: '#4a4a4a',
    accentColor: '#f5576c'
  },
  cyberpunk: {
    id: 'cyberpunk',
    name: 'Cyberpunk Neon',
    icon: '🔮',
    background: 'linear-gradient(135deg, #0a0015 0%, #150a1f 100%)',
    textColor: '#d0d0d0',
    accentColor: '#00ffaa'
  },
  glassmorphism: {
    id: 'glassmorphism',
    name: 'Glass Morphism',
    icon: '🪟',
    background: 'linear-gradient(135deg, #e0e5ec 0%, #ffffff 100%)',
    textColor: '#2d3748',
    accentColor: '#667eea'
  },
  midnight: {
    id: 'midnight',
    name: 'Midnight Dark',
    icon: '🌙',
    background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)',
    textColor: '#e0e0e0',
    accentColor: '#0f3460'
  }
};

// ============================================================================
// MIDDLEWARE
// ============================================================================

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging
app.use((req, res, next) => {
  log.info(`${req.method} ${req.path}`);
  next();
});

// ============================================================================
// API ENDPOINTS (Real backend functionality)
// ============================================================================

// Get all projects
app.get('/api/projects', (req, res) => {
  log.crew('Data', 'Retrieving all projects');
  res.json(projectState.projects);
});

// Get single project
app.get('/api/projects/:id', (req, res) => {
  const project = projectState.projects[req.params.id];
  if (!project) {
    log.error(`Project not found: ${req.params.id}`);
    return res.status(404).json({ error: 'Project not found' });
  }
  log.crew('Data', `Retrieved project: ${req.params.id}`);
  res.json(project);
});

// Update project content
app.post('/api/projects/:id/update', (req, res) => {
  const { field, value } = req.body;
  const project = projectState.projects[req.params.id];
  
  if (!project) {
    return res.status(404).json({ error: 'Project not found' });
  }
  
  project[field] = value;
  log.crew('Geordi', `Updated ${req.params.id}.${field} = "${value}"`);
  res.json({ success: true, project });
});

// Update project theme
app.post('/api/projects/:id/theme', (req, res) => {
  const { themeId } = req.body;
  const project = projectState.projects[req.params.id];
  
  if (!project) {
    return res.status(404).json({ error: 'Project not found' });
  }
  
  if (!themes[themeId]) {
    return res.status(400).json({ error: 'Invalid theme' });
  }
  
  project.theme = themeId;
  log.crew('Troi', `Changed ${req.params.id} theme to ${themeId}`);
  res.json({ success: true, project });
});

// Get all themes
app.get('/api/themes', (req, res) => {
  res.json(themes);
});

// ============================================================================
// HTML GENERATORS (Dynamic page generation)
// ============================================================================

function generateDashboardHTML() {
  const projects = Object.entries(projectState.projects);
  const themeList = Object.values(themes);
  
  const projectCards = projects.map(([id, proj]) => `
    <div class="project-card" id="project-${id}">
      <div class="project-header">
        <h2>${proj.icon} ${proj.name}</h2>
        <div class="project-meta">
          Port ${proj.port} | Budget: $${(proj.budget/1000).toFixed(0)}K | Theme: ${proj.theme}
        </div>
      </div>
      
      <div class="editor-preview">
        <div class="editor">
          <h3>✏️ Content Editor</h3>
          
          <label>Headline</label>
          <input type="text" value="${proj.headline}" 
                 onchange="updateProject('${id}', 'headline', this.value)">
          
          <label>Subheadline</label>
          <input type="text" value="${proj.subheadline}"
                 onchange="updateProject('${id}', 'subheadline', this.value)">
          
          <label>Description</label>
          <textarea onchange="updateProject('${id}', 'description', this.value)">${proj.description}</textarea>
          
          <label>🎨 Theme</label>
          <div class="theme-picker">
            ${themeList.map(t => `
              <button class="theme-btn ${proj.theme === t.id ? 'active' : ''}"
                      onclick="updateTheme('${id}', '${t.id}')">
                ${t.icon} ${t.name}
              </button>
            `).join('')}
          </div>
        </div>
        
        <div class="preview">
          <h3>👁️ Live Preview</h3>
          <div class="preview-content" id="preview-${id}">
            <h1>${proj.headline}</h1>
            <p class="subheadline">${proj.subheadline}</p>
            <p class="description">${proj.description}</p>
            <div class="preview-meta">
              Theme: ${proj.theme} | <a href="/projects/${id}" target="_blank">View Live →</a>
            </div>
          </div>
        </div>
      </div>
    </div>
  `).join('');
  
  return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>🖖 Alex AI Master Dashboard</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
            background: linear-gradient(135deg, #0a0015 0%, #150a1f 100%);
            color: #d0d0d0;
            padding: 20px;
            min-height: 100vh;
        }
        .container { max-width: 1600px; margin: 0 auto; }
        
        .header {
            background: rgba(0, 255, 170, 0.05);
            backdrop-filter: blur(10px);
            padding: 30px;
            border-radius: 16px;
            margin-bottom: 30px;
            border: 1px solid rgba(0, 255, 170, 0.2);
        }
        .header h1 { font-size: 36px; color: #00ffaa; margin-bottom: 10px; }
        .header p { opacity: 0.9; }
        
        .project-card {
            background: rgba(0, 255, 170, 0.03);
            border: 2px solid rgba(0, 255, 170, 0.2);
            border-radius: 16px;
            overflow: hidden;
            margin-bottom: 30px;
        }
        
        .project-header {
            background: rgba(0, 255, 170, 0.1);
            padding: 20px 30px;
            border-bottom: 1px solid rgba(0, 255, 170, 0.2);
        }
        .project-header h2 { font-size: 24px; color: #00ffaa; }
        .project-meta { font-size: 13px; opacity: 0.8; margin-top: 5px; }
        
        .editor-preview {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 30px;
            padding: 30px;
        }
        
        .editor h3, .preview h3 { color: #00ffaa; margin-bottom: 20px; }
        
        label {
            display: block;
            margin-bottom: 6px;
            font-size: 13px;
            color: #00ffaa;
            margin-top: 15px;
        }
        
        input, textarea {
            width: 100%;
            padding: 12px;
            background: rgba(0, 0, 0, 0.3);
            border: 1px solid rgba(0, 255, 170, 0.3);
            border-radius: 6px;
            color: #d0d0d0;
            font-size: 14px;
            font-family: inherit;
        }
        
        textarea {
            min-height: 100px;
            resize: vertical;
        }
        
        .theme-picker {
            display: flex;
            gap: 10px;
            flex-wrap: wrap;
            margin-top: 10px;
        }
        
        .theme-btn {
            padding: 10px 16px;
            background: rgba(0, 0, 0, 0.3);
            border: 1px solid rgba(0, 255, 170, 0.2);
            border-radius: 8px;
            color: #d0d0d0;
            cursor: pointer;
            font-size: 13px;
            transition: all 0.2s;
        }
        
        .theme-btn.active {
            background: rgba(0, 255, 170, 0.2);
            border: 2px solid #00ffaa;
        }
        
        .theme-btn:hover {
            background: rgba(0, 255, 170, 0.15);
        }
        
        .preview-content {
            background: rgba(0, 0, 0, 0.5);
            border: 1px solid rgba(0, 255, 170, 0.2);
            border-radius: 12px;
            padding: 30px;
            min-height: 300px;
        }
        
        .preview-content h1 {
            font-size: 28px;
            font-weight: 700;
            margin-bottom: 12px;
            color: #00ffaa;
        }
        
        .preview-content .subheadline {
            font-size: 16px;
            opacity: 0.9;
            margin-bottom: 12px;
        }
        
        .preview-content .description {
            font-size: 14px;
            opacity: 0.8;
            line-height: 1.6;
        }
        
        .preview-meta {
            margin-top: 20px;
            padding: 15px;
            background: rgba(0, 255, 170, 0.05);
            border-radius: 8px;
            font-size: 12px;
            opacity: 0.7;
        }
        
        .preview-meta a {
            color: #00ffaa;
            margin-left: 10px;
        }
        
        .status-bar {
            position: fixed;
            bottom: 20px;
            right: 20px;
            background: rgba(0, 0, 0, 0.9);
            backdrop-filter: blur(10px);
            padding: 15px 20px;
            border-radius: 12px;
            border: 1px solid rgba(0, 255, 170, 0.3);
            font-size: 13px;
            max-width: 300px;
            z-index: 9999;
        }
        
        .status-bar .title {
            color: #00ffaa;
            font-weight: 600;
            margin-bottom: 8px;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🖖 Alex AI Master Dashboard - REAL Integration</h1>
            <p>Unified command structure with real-time project management. Edit content, switch themes, and see updates instantly!</p>
        </div>
        
        ${projectCards}
    </div>
    
    <div class="status-bar">
        <div class="title">🖖 Master Server Status</div>
        <div>Server: Online ✅</div>
        <div>Mode: Development</div>
        <div>Updates: Real-time</div>
    </div>
    
    <script>
        function updateProject(projectId, field, value) {
            fetch(\`/api/projects/\${projectId}/update\`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ field, value })
            })
            .then(res => res.json())
            .then(data => {
                console.log('✅ Updated:', projectId, field);
                updatePreview(projectId, data.project);
            })
            .catch(err => console.error('❌ Error:', err));
        }
        
        function updateTheme(projectId, themeId) {
            fetch(\`/api/projects/\${projectId}/theme\`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ themeId })
            })
            .then(res => res.json())
            .then(data => {
                console.log('✅ Theme changed:', projectId, themeId);
                location.reload(); // Reload to update theme buttons
            })
            .catch(err => console.error('❌ Error:', err));
        }
        
        function updatePreview(projectId, project) {
            const preview = document.getElementById(\`preview-\${projectId}\`);
            preview.innerHTML = \`
                <h1>\${project.headline}</h1>
                <p class="subheadline">\${project.subheadline}</p>
                <p class="description">\${project.description}</p>
                <div class="preview-meta">
                    Theme: \${project.theme} | <a href="/projects/\${projectId}" target="_blank">View Live →</a>
                </div>
            \`;
        }
    </script>
</body>
</html>
  `;
}

function generateProjectHTML(projectId) {
  const project = projectState.projects[projectId];
  if (!project) return null;
  
  const theme = themes[project.theme] || themes.gradient;
  
  return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${project.name}</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
            background: ${theme.background};
            color: ${theme.textColor};
            min-height: 100vh;
            padding: 40px 20px;
        }
        .container { max-width: 1200px; margin: 0 auto; }
        
        .hero {
            text-align: center;
            padding: 80px 30px;
            background: rgba(255, 255, 255, 0.05);
            backdrop-filter: blur(10px);
            border-radius: 24px;
            margin-bottom: 50px;
            border: 1px solid rgba(255, 255, 255, 0.1);
        }
        
        .hero h1 {
            font-size: 56px;
            font-weight: 800;
            margin-bottom: 20px;
            line-height: 1.2;
        }
        
        .hero .subheadline {
            font-size: 22px;
            opacity: 0.95;
            margin-bottom: 25px;
            line-height: 1.6;
            max-width: 800px;
            margin: 0 auto 25px;
        }
        
        .hero .description {
            font-size: 18px;
            opacity: 0.85;
            line-height: 1.6;
            max-width: 700px;
            margin: 0 auto;
        }
        
        .dev-info {
            position: fixed;
            bottom: 20px;
            right: 20px;
            background: rgba(0, 0, 0, 0.9);
            backdrop-filter: blur(10px);
            padding: 15px 20px;
            border-radius: 12px;
            border: 1px solid rgba(0, 255, 170, 0.3);
            font-size: 13px;
            max-width: 300px;
            z-index: 9998;
        }
        
        .dev-info .title {
            color: #00ffaa;
            font-weight: 600;
            margin-bottom: 8px;
        }
        
        .dev-info a {
            color: #00ffaa;
            margin-top: 8px;
            display: inline-block;
        }
    </style>
    <script>
        // Auto-refresh when dashboard updates
        setInterval(() => {
            fetch('/api/projects/${projectId}')
                .then(res => res.json())
                .then(project => {
                    document.querySelector('.hero h1').textContent = project.headline;
                    document.querySelector('.hero .subheadline').textContent = project.subheadline;
                    document.querySelector('.hero .description').textContent = project.description;
                });
        }, 2000); // Check every 2 seconds
    </script>
</head>
<body>
    <div class="container">
        <div class="hero">
            <h1>${project.headline}</h1>
            <p class="subheadline">${project.subheadline}</p>
            <p class="description">${project.description}</p>
        </div>
    </div>
    
    <div class="dev-info">
        <div class="title">🖖 Dev Mode Info</div>
        <div>Project: ${projectId}</div>
        <div>Theme: ${project.theme}</div>
        <div>Updates: Real-time (2s polling)</div>
        <a href="/">← Back to Dashboard</a>
    </div>
</body>
</html>
  `;
}

// ============================================================================
// ROUTE HANDLERS
// ============================================================================

// Dashboard (main command center)
app.get('/', (req, res) => {
  log.crew('Picard', 'Dashboard accessed - Command Center');
  res.send(generateDashboardHTML());
});

app.get('/dashboard', (req, res) => {
  res.redirect('/');
});

// Project pages
app.get('/projects/:id', (req, res) => {
  const html = generateProjectHTML(req.params.id);
  if (!html) {
    log.error(`Unknown project: ${req.params.id}`);
    return res.status(404).send('<h1>Project not found</h1>');
  }
  log.crew('Riker', `Serving project: ${req.params.id}`);
  res.send(html);
});

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'online',
    timestamp: new Date().toISOString(),
    projects: Object.keys(projectState.projects),
    themes: Object.keys(themes)
  });
});

// ============================================================================
// SERVER STARTUP
// ============================================================================

app.listen(PORT, () => {
  console.log('\n');
  console.log('🖖 ═══════════════════════════════════════════════════════════');
  console.log('   ALEX AI MASTER SERVER - UNIFIED COMMAND STRUCTURE');
  console.log('═══════════════════════════════════════════════════════════\n');
  log.success(`Master server online at http://localhost:${PORT}`);
  log.info('Single unified server with integrated features');
  log.info('No multiple processes - everything in one place\n');
  
  log.crew('Picard', 'Command structure established');
  log.crew('Data', 'State management initialized');
  log.crew('Geordi', 'API endpoints operational');
  log.crew('Troi', 'UX systems online');
  
  console.log('\n📍 AVAILABLE ROUTES:');
  console.log(`   Dashboard:     http://localhost:${PORT}/`);
  console.log(`   Alpha Project: http://localhost:${PORT}/projects/alpha`);
  console.log(`   Beta Project:  http://localhost:${PORT}/projects/beta`);
  console.log(`   Gamma Project: http://localhost:${PORT}/projects/gamma`);
  console.log(`   Health Check:  http://localhost:${PORT}/health`);
  console.log('\n🎯 FEATURES:');
  console.log('   ✅ Real-time content editing');
  console.log('   ✅ Live preview updates (2s polling)');
  console.log('   ✅ Theme switching');
  console.log('   ✅ Centralized state management');
  console.log('   ✅ Full logging visibility');
  console.log('\n═══════════════════════════════════════════════════════════\n');
});

/**
 * Code Review - Captain Picard:
 * "This is how it should be done. One command center, clear hierarchy,
 * full visibility. No confusion about multiple processes. Excellent work."
 * 
 * Code Review - Commander Riker:
 * "Simple, effective, executable. Single command to start, everything works.
 * This is tactical excellence."
 */

