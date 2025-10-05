/**
 * Alex AI Demo Project - Web Server
 * 
 * Enhanced web server for the Smart Home Automation System demo
 */

const http = require('http');
const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');

class DemoWebServer {
  constructor(port = 3000) {
    this.port = port;
    this.server = null;
    this.isRunning = false;
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
          console.log(`🌐 Demo web server started on http://localhost:${this.port}`);
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
          console.log('🛑 Demo web server stopped');
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
    const filePath = path.join(__dirname, '..', 'public', url);

    // Set CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    // Handle API endpoints
    if (url.startsWith('/api/')) {
      this.handleApiRequest(req, res);
      return;
    }

    // Serve static files
    this.serveStaticFile(filePath, res);
  }

  /**
   * Handle API requests
   */
  handleApiRequest(req, res) {
    const url = req.url;

    if (url === '/api/status') {
      this.getSystemStatus(req, res);
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
   * Get system status
   */
  getSystemStatus(req, res) {
    const status = {
      project: 'Smart Home Automation System',
      status: 'active',
      universalFeatures: {
        chatCapturing: { enabled: true, version: '1.0.0' },
        n8nIntegration: { enabled: true, version: '1.0.0' },
        crewAI: { enabled: true, members: 6 },
        ragSystem: { enabled: true },
        monitoring: { enabled: true }
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

module.exports = { DemoWebServer };
