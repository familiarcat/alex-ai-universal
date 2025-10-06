/**
 * Alex AI Demo Project - Dynamic Web Server
 * 
 * Enhanced web server with real-time configuration synchronization
 * between dashboard controls and website content
 */

const http = require('http');
const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');

class DynamicWebServer {
  constructor(port = 3000) {
    this.port = port;
    this.server = null;
    this.isRunning = false;
    
    // Configuration store for dynamic content
    this.configurations = new Map();
    this.initializeDefaultConfigurations();
  }

  /**
   * Initialize default configurations
   */
  initializeDefaultConfigurations() {
    this.configurations.set('pageTitle', 'Alex AI Demo - Smart Home Automation System');
    this.configurations.set('mainHeading', 'Alex AI Demo Project');
    this.configurations.set('description', 'Smart Home Automation System');
    this.configurations.set('bgColor', '#1e3c72');
    this.configurations.set('textColor', '#ffffff');
    this.configurations.set('theme', 'star-trek');
    this.configurations.set('layout', 'grid');
    this.configurations.set('visibility', 'show-all');
    
    console.log('🎛️ Default configurations initialized');
  }

  /**
   * Start the web server
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
          
          this.isRunning = true;
          console.log(`🌐 Dynamic web server started on http://localhost:${this.port}`);
          console.log('🎛️ Real-time configuration synchronization enabled');
          resolve();
        });

      } catch (error) {
        reject(error);
      }
    });
  }

  /**
   * Stop the web server
   */
  stop() {
    return new Promise((resolve) => {
      if (this.server && this.isRunning) {
        this.server.close(() => {
          this.isRunning = false;
          console.log('🛑 Dynamic web server stopped');
          resolve();
        });
      } else {
        resolve();
      }
    });
  }

  /**
   * Handle HTTP requests
   */
  handleRequest(req, res) {
    const url = req.url === '/' ? '/index.html' : req.url;

    // Set CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    // Handle API endpoints
    if (url.startsWith('/api/')) {
      this.handleApiRequest(req, res);
      return;
    }

    // Serve dynamic content
    if (url === '/index.html' || url === '/') {
      this.serveDynamicContent(res);
      return;
    }

    // Serve static files
    const filePath = path.join(__dirname, '..', 'public', url);
    this.serveStaticFile(filePath, res);
  }

  /**
   * Serve dynamic HTML content based on configurations
   */
  serveDynamicContent(res) {
    const pageTitle = this.configurations.get('pageTitle');
    const mainHeading = this.configurations.get('mainHeading');
    const description = this.configurations.get('description');
    const bgColor = this.configurations.get('bgColor');
    const textColor = this.configurations.get('textColor');
    const theme = this.configurations.get('theme');
    const layout = this.configurations.get('layout');
    const visibility = this.configurations.get('visibility');

    // Generate dynamic CSS based on configurations
    const dynamicCSS = this.generateDynamicCSS(bgColor, textColor, theme, layout);
    
    // Generate dynamic HTML structure
    const dynamicHTML = this.generateDynamicHTML(pageTitle, mainHeading, description, dynamicCSS, visibility);

    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.end(dynamicHTML);
  }

  /**
   * Generate dynamic CSS based on configurations
   */
  generateDynamicCSS(bgColor, textColor, theme, layout) {
    let css = `
      * {
        margin: 0;
        padding: 0;
        box-sizing: border-box;
      }

      body {
        font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
        background: ${bgColor};
        color: ${textColor};
        min-height: 100vh;
        line-height: 1.6;
        transition: all 0.3s ease;
      }

      .container {
        max-width: 1200px;
        margin: 0 auto;
        padding: 20px;
      }

      .header {
        text-align: center;
        margin-bottom: 40px;
        padding: 40px 0;
      }

      .header h1 {
        font-size: 3rem;
        margin-bottom: 10px;
        text-shadow: 2px 2px 4px rgba(0,0,0,0.3);
        color: ${textColor};
      }

      .header .subtitle {
        font-size: 1.2rem;
        opacity: 0.9;
        margin-bottom: 20px;
        color: ${textColor};
      }

      .alex-ai-logo {
        font-size: 2rem;
        margin-bottom: 20px;
      }
    `;

    // Add theme-specific styles
    if (theme === 'star-trek') {
      css += `
        .status-card, .crew-section, .technical-stack, .phases-section {
          background: rgba(255, 255, 255, 0.1);
          border-radius: 15px;
          padding: 25px;
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 255, 255, 0.2);
        }
        
        .status-card h3, .crew-member h4 {
          color: #4fc3f7;
        }
      `;
    } else if (theme === 'modern') {
      css += `
        .status-card, .crew-section, .technical-stack, .phases-section {
          background: rgba(255, 255, 255, 0.05);
          border-radius: 8px;
          padding: 20px;
          border: 1px solid rgba(255, 255, 255, 0.1);
        }
        
        .status-card h3, .crew-member h4 {
          color: #ffffff;
        }
      `;
    } else if (theme === 'minimal') {
      css += `
        .status-card, .crew-section, .technical-stack, .phases-section {
          background: transparent;
          border: 1px solid rgba(255, 255, 255, 0.2);
          border-radius: 4px;
          padding: 15px;
        }
        
        .status-card h3, .crew-member h4 {
          color: ${textColor};
        }
      `;
    }

    // Add layout-specific styles
    if (layout === 'flex') {
      css += `
        .status-grid, .crew-grid, .tech-grid {
          display: flex;
          flex-wrap: wrap;
          gap: 20px;
        }
      `;
    } else if (layout === 'block') {
      css += `
        .status-grid, .crew-grid, .tech-grid {
          display: block;
        }
        
        .status-card, .crew-member, .tech-item {
          margin-bottom: 20px;
        }
      `;
    }

    // Add visibility controls
    if (visibility === 'hide-sidebar') {
      css += `
        .crew-section {
          display: none;
        }
      `;
    } else if (visibility === 'hide-footer') {
      css += `
        .footer {
          display: none;
        }
      `;
    }

    return css;
  }

  /**
   * Generate dynamic HTML based on configurations
   */
  generateDynamicHTML(pageTitle, mainHeading, description, dynamicCSS, visibility) {
    return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${pageTitle}</title>
    <style>${dynamicCSS}</style>
</head>
<body>
    <div class="container">
        <div class="header">
            <div class="alex-ai-logo">🖖</div>
            <h1>${mainHeading}</h1>
            <div class="subtitle">${description}</div>
            <p>Generated by Alex AI Universal Integration from text conversation analysis</p>
        </div>

        <div class="status-grid">
            <div class="status-card">
                <h3>📱 Chat Capturing</h3>
                <p><span class="status-indicator status-active"></span>Active - Apple Messages integration with crew analysis</p>
            </div>
            <div class="status-card">
                <h3>⚙️ N8N Integration</h3>
                <p><span class="status-indicator status-active"></span>Active - Automated workflows for all projects</p>
            </div>
            <div class="status-card">
                <h3>👥 Crew AI</h3>
                <p><span class="status-indicator status-active"></span>Active - 6 crew members available</p>
            </div>
            <div class="status-card">
                <h3>🧠 RAG System</h3>
                <p><span class="status-indicator status-active"></span>Active - Bidirectional knowledge storage</p>
            </div>
            <div class="status-card">
                <h3>📊 Monitoring</h3>
                <p><span class="status-indicator status-active"></span>Active - Real-time system health</p>
            </div>
        </div>

        <div class="crew-section">
            <h2>👥 Crew Analysis & Recommendations</h2>
            <div class="crew-grid">
                <div class="crew-member">
                    <h4>🖖 Captain Picard</h4>
                    <div class="role">Strategic Commander</div>
                    <div class="recommendation">Focus on scalable architecture and long-term user value. Implement phased rollout strategy.</div>
                </div>
                <div class="crew-member">
                    <h4>🤖 Commander Data</h4>
                    <div class="role">Technical Operations</div>
                    <div class="recommendation">Use Node.js with TypeScript for type safety. Implement ML libraries like TensorFlow.js for behavior analysis.</div>
                </div>
                <div class="crew-member">
                    <h4>🔧 Commander La Forge</h4>
                    <div class="role">Chief Engineering</div>
                    <div class="recommendation">Design modular plugin system for device integration. Use Docker for deployment scalability.</div>
                </div>
                <div class="crew-member">
                    <h4>🛡️ Lieutenant Commander Worf</h4>
                    <div class="role">Security Officer</div>
                    <div class="recommendation">Implement OAuth 2.0 authentication, TLS encryption, and secure device pairing protocols.</div>
                </div>
                <div class="crew-member">
                    <h4>💭 Counselor Troi</h4>
                    <div class="role">Ship's Counselor</div>
                    <div class="recommendation">Create intuitive web dashboard with mobile-responsive design. Focus on user privacy controls.</div>
                </div>
                <div class="crew-member">
                    <h4>💰 Quark</h4>
                    <div class="role">Business Operations</div>
                    <div class="recommendation">Consider open-source approach to reduce costs. Plan for potential commercial licensing opportunities.</div>
                </div>
            </div>
        </div>

        <div class="technical-stack">
            <h2>🛠️ Recommended Technical Stack</h2>
            <div class="tech-grid">
                <div class="tech-item">
                    <div class="category">Backend</div>
                    <div>Node.js + TypeScript</div>
                </div>
                <div class="tech-item">
                    <div class="category">Frontend</div>
                    <div>React + Next.js</div>
                </div>
                <div class="tech-item">
                    <div class="category">Database</div>
                    <div>PostgreSQL + Redis</div>
                </div>
                <div class="tech-item">
                    <div class="category">ML</div>
                    <div>TensorFlow.js</div>
                </div>
                <div class="tech-item">
                    <div class="category">IoT</div>
                    <div>MQTT + WebSocket</div>
                </div>
                <div class="tech-item">
                    <div class="category">Deployment</div>
                    <div>Docker + Kubernetes</div>
                </div>
            </div>
        </div>

        <div class="phases-section">
            <h2>📅 Project Development Phases</h2>
            <div class="phase-item">
                <strong>Phase 1:</strong> Core Infrastructure & Security
            </div>
            <div class="phase-item">
                <strong>Phase 2:</strong> Device Integration & ML Pipeline
            </div>
            <div class="phase-item">
                <strong>Phase 3:</strong> User Interface & Experience
            </div>
            <div class="phase-item">
                <strong>Phase 4:</strong> Advanced Analytics & Optimization
            </div>
        </div>

        <div class="demo-controls">
            <a href="#" class="demo-button" onclick="runCrewAnalysis()">👥 Run Crew Analysis</a>
            <a href="#" class="demo-button" onclick="showTechnicalDetails()">🛠️ Technical Details</a>
            <a href="#" class="demo-button" onclick="startDevelopment()">🚀 Start Development</a>
        </div>

        <div class="footer">
            <p>Generated by Alex AI Universal Integration</p>
            <p>"Make it so, Number One." - Captain Picard 🖖</p>
            <p><small>Last updated: ${new Date().toLocaleString()}</small></p>
        </div>
    </div>

    <script>
        function runCrewAnalysis() {
            alert('🖖 Crew Analysis Complete!\\n\\nAll 6 crew members have provided their specialized recommendations for the Smart Home Automation System. Check the crew section above for detailed analysis.');
        }

        function showTechnicalDetails() {
            alert('🛠️ Technical Stack Details:\\n\\n• Backend: Node.js + TypeScript for type safety\\n• Frontend: React + Next.js for modern UI\\n• Database: PostgreSQL + Redis for data management\\n• ML: TensorFlow.js for behavior analysis\\n• IoT: MQTT + WebSocket for device communication\\n• Deployment: Docker + Kubernetes for scalability');
        }

        function startDevelopment() {
            alert('🚀 Development Ready!\\n\\nPhase 1: Core Infrastructure & Security\\n\\nNext steps:\\n1. Set up Node.js + TypeScript environment\\n2. Implement OAuth 2.0 authentication\\n3. Configure Docker containers\\n4. Set up PostgreSQL database\\n\\nAll crew recommendations are available in the project configuration files.');
        }

        // Add some interactive effects
        document.addEventListener('DOMContentLoaded', function() {
            const cards = document.querySelectorAll('.status-card, .crew-member, .tech-item');
            
            cards.forEach(card => {
                card.addEventListener('mouseenter', function() {
                    this.style.transform = 'translateY(-5px) scale(1.02)';
                });
                
                card.addEventListener('mouseleave', function() {
                    this.style.transform = 'translateY(0) scale(1)';
                });
            });

            // Auto-refresh every 5 seconds to pick up configuration changes
            setInterval(() => {
                // Only refresh if the page is visible
                if (!document.hidden) {
                    window.location.reload();
                }
            }, 5000);
        });
    </script>
</body>
</html>
    `;
  }

  /**
   * Handle API requests
   */
  handleApiRequest(req, res) {
    const url = req.url;

    if (url === '/api/status') {
      this.getSystemStatus(req, res);
    } else if (url === '/api/configurations') {
      this.getConfigurations(req, res);
    } else if (url === '/api/update' && req.method === 'POST') {
      this.handleConfigurationUpdate(req, res);
    } else if (url === '/api/crew-analysis') {
      this.getCrewAnalysis(req, res);
    } else if (url === '/api/technical-stack') {
      this.getTechnicalStack(req, res);
    } else if (url === '/api/project-phases') {
      this.getProjectPhases(req, res);
    } else {
      res.writeHead(404, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'API endpoint not found' }));
    }
  }

  /**
   * Handle configuration updates from dashboard
   */
  handleConfigurationUpdate(req, res) {
    let body = '';
    
    req.on('data', chunk => {
      body += chunk.toString();
    });
    
    req.on('end', () => {
      try {
        const update = JSON.parse(body);
        
        // Update configuration based on update type
        if (update.type === 'content') {
          if (update.target === 'title') {
            this.configurations.set('pageTitle', update.changes.value);
          } else if (update.target === 'heading') {
            this.configurations.set('mainHeading', update.changes.value);
          } else if (update.target === 'description') {
            this.configurations.set('description', update.changes.value);
          }
        } else if (update.type === 'design') {
          if (update.target === 'background') {
            this.configurations.set('bgColor', update.changes.value);
          } else if (update.target === 'textColor') {
            this.configurations.set('textColor', update.changes.value);
          } else if (update.target === 'theme') {
            this.configurations.set('theme', update.changes.value);
          }
        } else if (update.type === 'layout') {
          if (update.target === 'style') {
            this.configurations.set('layout', update.changes.value);
          } else if (update.target === 'visibility') {
            this.configurations.set('visibility', update.changes.value);
          }
        }

        console.log(`🔧 Configuration updated: ${update.type} for ${update.target}`);
        console.log(`📊 Total configurations: ${this.configurations.size}`);

        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ 
          success: true, 
          message: 'Configuration updated successfully',
          timestamp: new Date().toISOString()
        }));
        
      } catch (error) {
        console.error('❌ Error processing configuration update:', error);
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Invalid request' }));
      }
    });
  }

  /**
   * Get current configurations
   */
  getConfigurations(req, res) {
    const configs = Object.fromEntries(this.configurations);
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(configs));
  }

  /**
   * Get system status
   */
  getSystemStatus(req, res) {
    const status = {
      project: 'Smart Home Automation System',
      status: 'active',
      configurations: Object.fromEntries(this.configurations),
      universalFeatures: {
        chatCapturing: { enabled: true, version: '1.0.0' },
        n8nIntegration: { enabled: true, version: '1.0.0' },
        crewAI: { enabled: true, members: 6 },
        ragSystem: { enabled: true },
        monitoring: { enabled: true },
        dynamicContent: { enabled: true, configurations: this.configurations.size }
      },
      timestamp: new Date().toISOString()
    };

    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(status, null, 2));
  }

  /**
   * Get crew analysis
   */
  getCrewAnalysis(req, res) {
    const crewAnalysis = {
      crewMembers: [
        {
          name: 'Captain Picard',
          role: 'Strategic Commander',
          priority: 'High',
          recommendation: 'Focus on scalable architecture and long-term user value. Implement phased rollout strategy.'
        },
        {
          name: 'Commander Data',
          role: 'Technical Operations',
          priority: 'High',
          recommendation: 'Use Node.js with TypeScript for type safety. Implement ML libraries like TensorFlow.js for behavior analysis.'
        },
        {
          name: 'Commander La Forge',
          role: 'Chief Engineering',
          priority: 'High',
          recommendation: 'Design modular plugin system for device integration. Use Docker for deployment scalability.'
        },
        {
          name: 'Lieutenant Commander Worf',
          role: 'Security Officer',
          priority: 'Critical',
          recommendation: 'Implement OAuth 2.0 authentication, TLS encryption, and secure device pairing protocols.'
        },
        {
          name: 'Counselor Troi',
          role: 'Ship\'s Counselor',
          priority: 'High',
          recommendation: 'Create intuitive web dashboard with mobile-responsive design. Focus on user privacy controls.'
        },
        {
          name: 'Quark',
          role: 'Business Operations',
          priority: 'Medium',
          recommendation: 'Consider open-source approach to reduce costs. Plan for potential commercial licensing opportunities.'
        }
      ]
    };

    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(crewAnalysis, null, 2));
  }

  /**
   * Get technical stack
   */
  getTechnicalStack(req, res) {
    const technicalStack = {
      backend: 'Node.js + TypeScript',
      frontend: 'React + Next.js',
      database: 'PostgreSQL + Redis',
      ml: 'TensorFlow.js',
      iot: 'MQTT + WebSocket',
      deployment: 'Docker + Kubernetes'
    };

    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(technicalStack, null, 2));
  }

  /**
   * Get project phases
   */
  getProjectPhases(req, res) {
    const phases = [
      'Phase 1: Core Infrastructure & Security',
      'Phase 2: Device Integration & ML Pipeline',
      'Phase 3: User Interface & Experience',
      'Phase 4: Advanced Analytics & Optimization'
    ];

    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(phases, null, 2));
  }

  /**
   * Serve static files
   */
  serveStaticFile(filePath, res) {
    const ext = path.extname(filePath).toLowerCase();
    const mimeTypes = {
      '.html': 'text/html',
      '.js': 'text/javascript',
      '.css': 'text/css',
      '.json': 'application/json',
      '.png': 'image/png',
      '.jpg': 'image/jpeg',
      '.gif': 'image/gif',
      '.svg': 'image/svg+xml'
    };

    const contentType = mimeTypes[ext] || 'application/octet-stream';

    fs.readFile(filePath, (err, data) => {
      if (err) {
        if (err.code === 'ENOENT') {
          res.writeHead(404, { 'Content-Type': 'text/html' });
          res.end(`
            <html>
              <head><title>404 - Not Found</title></head>
              <body style="font-family: Arial, sans-serif; text-align: center; padding: 50px;">
                <h1>404 - File Not Found</h1>
                <p>The requested file could not be found.</p>
                <a href="/">← Back to Demo</a>
              </body>
            </html>
          `);
        } else {
          res.writeHead(500);
          res.end('Server Error');
        }
        return;
      }

      res.writeHead(200, { 'Content-Type': contentType });
      res.end(data);
    });
  }

  /**
   * Open browser to the demo
   */
  openBrowser() {
    const url = `http://localhost:${this.port}`;
    
    let command;
    switch (process.platform) {
      case 'darwin':
        command = `open ${url}`;
        break;
      case 'win32':
        command = `start ${url}`;
        break;
      default:
        command = `xdg-open ${url}`;
        break;
    }

    exec(command, (error) => {
      if (error) {
        console.log(`🌐 Please open your browser and navigate to: ${url}`);
      } else {
        console.log(`🌐 Opening browser to: ${url}`);
      }
    });
  }
}

module.exports = { DynamicWebServer };

// Start server if run directly
if (require.main === module) {
  const server = new DynamicWebServer(3000);
  
  server.start().then(() => {
    console.log('✅ Dynamic web server ready');
    console.log('🎛️ Real-time configuration synchronization enabled');
    console.log('🌐 Website: http://localhost:3000');
    console.log('📊 Dashboard: http://localhost:3001');
  }).catch(error => {
    console.error('❌ Failed to start dynamic web server:', error);
  });
}


