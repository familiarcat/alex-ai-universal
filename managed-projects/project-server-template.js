/**
 * Universal Project Server Template
 * Can be configured for Alpha, Beta, or Gamma projects
 */

const http = require('http');

class ProjectServer {
  constructor(config) {
    this.config = config;
    this.server = null;
  }

  start() {
    return new Promise((resolve) => {
      this.server = http.createServer((req, res) => {
        this.handleRequest(req, res);
      });

      this.server.listen(this.config.port, () => {
        console.log(`🚀 ${this.config.name} running on http://localhost:${this.config.port}`);
        resolve();
      });
    });
  }

  handleRequest(req, res) {
    const html = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${this.config.name}</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
            background: ${this.config.theme.background};
            color: ${this.config.theme.text};
            min-height: 100vh;
            padding: 40px 20px;
        }
        .container { max-width: 1200px; margin: 0 auto; }
        .header {
            text-align: center;
            padding: 60px 20px;
            background: ${this.config.theme.primary};
            border-radius: 20px;
            margin-bottom: 40px;
        }
        .header h1 {
            font-size: 48px;
            color: ${this.config.theme.accent};
            margin-bottom: 20px;
        }
        .header p { font-size: 20px; opacity: 0.9; }
        .features-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
            gap: 20px;
            margin-bottom: 40px;
        }
        .feature-card {
            background: ${this.config.theme.primary};
            padding: 30px;
            border-radius: 12px;
            border: 1px solid ${this.config.theme.accent};
        }
        .feature-card h3 {
            color: ${this.config.theme.accent};
            margin-bottom: 10px;
        }
        .tech-stack {
            background: ${this.config.theme.primary};
            padding: 30px;
            border-radius: 12px;
            margin-bottom: 20px;
        }
        .tech-badges {
            display: flex;
            flex-wrap: wrap;
            gap: 10px;
            margin-top: 15px;
        }
        .tech-badge {
            background: ${this.config.theme.accent};
            color: ${this.config.theme.background};
            padding: 8px 16px;
            border-radius: 20px;
            font-weight: 600;
        }
        .crew-section {
            background: ${this.config.theme.primary};
            padding: 30px;
            border-radius: 12px;
        }
        .crew-badges {
            display: flex;
            flex-wrap: wrap;
            gap: 10px;
            margin-top: 15px;
        }
        .crew-badge {
            background: rgba(255, 255, 255, 0.1);
            padding: 8px 16px;
            border-radius: 20px;
        }
        .status-bar {
            position: fixed;
            bottom: 0;
            left: 0;
            right: 0;
            background: rgba(0, 0, 0, 0.8);
            padding: 15px;
            text-align: center;
            font-size: 14px;
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
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>${this.config.icon} ${this.config.name}</h1>
            <p>${this.config.description}</p>
            <p style="margin-top: 10px; font-size: 16px; opacity: 0.7;">
                Managed by Alex AI Dashboard | Port ${this.config.port}
            </p>
        </div>

        <div class="features-grid">
            ${this.config.features.map(feature => `
                <div class="feature-card">
                    <h3>✨ ${feature}</h3>
                    <p>Powered by AI crew intelligence</p>
                </div>
            `).join('')}
        </div>

        <div class="tech-stack">
            <h2 style="color: ${this.config.theme.accent}; margin-bottom: 15px;">
                🛠️ Technology Stack
            </h2>
            <div class="tech-badges">
                ${this.config.tech.map(tech => `
                    <span class="tech-badge">${tech}</span>
                `).join('')}
            </div>
        </div>

        <div class="crew-section">
            <h2 style="color: ${this.config.theme.accent}; margin-bottom: 15px;">
                👥 Assigned Crew (${this.config.assignedCrew.length})
            </h2>
            <div class="crew-badges">
                ${this.config.assignedCrew.map(crew => `
                    <span class="crew-badge">🖖 ${crew}</span>
                `).join('')}
            </div>
        </div>
    </div>

    <div class="status-bar">
        <span class="status-indicator"></span>
        <span>Connected to Alex AI Dashboard (Port 3001) | Project Status: Active</span>
    </div>
</body>
</html>`;
    
    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.end(html);
  }
}

// Export for use by other files
module.exports = ProjectServer;

