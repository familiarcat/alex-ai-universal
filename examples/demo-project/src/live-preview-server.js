/**
 * Alex AI Live Preview Server
 * 
 * Real-time website preview with instant dashboard updates
 * WebSocket-based live preview system
 */

const http = require('http');
const fs = require('fs');
const path = require('path');
const { WebSocketServer } = require('ws');

class LivePreviewServer {
  constructor(port = 3002) {
    this.port = port;
    this.server = null;
    this.wss = null;
    this.connectedClients = new Set();
    this.previewContent = '';
    this.lastModified = new Date();
    
    this.initializePreviewContent();
  }

  /**
   * Initialize preview content
   */
  initializePreviewContent() {
    this.previewContent = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>🖖 Alex AI Live Preview</title>
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
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            padding: 20px;
        }

        .preview-container {
            background: rgba(255, 255, 255, 0.1);
            backdrop-filter: blur(10px);
            border-radius: 20px;
            padding: 40px;
            max-width: 800px;
            width: 100%;
            text-align: center;
            border: 1px solid rgba(255, 255, 255, 0.2);
            box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
        }

        .preview-header {
            margin-bottom: 30px;
        }

        .preview-title {
            font-size: 2.5rem;
            margin-bottom: 10px;
            background: linear-gradient(45deg, #64b5f6, #42a5f5);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
        }

        .preview-subtitle {
            font-size: 1.2rem;
            color: #b3e5fc;
            margin-bottom: 20px;
        }

        .status-indicator {
            display: inline-block;
            width: 12px;
            height: 12px;
            background: #4caf50;
            border-radius: 50%;
            margin-right: 8px;
            animation: pulse 2s infinite;
        }

        @keyframes pulse {
            0% { opacity: 1; }
            50% { opacity: 0.5; }
            100% { opacity: 1; }
        }

        .preview-content {
            margin: 30px 0;
            padding: 20px;
            background: rgba(0, 0, 0, 0.2);
            border-radius: 10px;
            border-left: 4px solid #64b5f6;
        }

        .crew-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 15px;
            margin: 20px 0;
        }

        .crew-member {
            background: rgba(255, 255, 255, 0.1);
            padding: 15px;
            border-radius: 10px;
            border: 1px solid rgba(255, 255, 255, 0.2);
            transition: transform 0.3s ease;
        }

        .crew-member:hover {
            transform: translateY(-5px);
            background: rgba(255, 255, 255, 0.15);
        }

        .crew-name {
            font-weight: bold;
            color: #64b5f6;
            margin-bottom: 5px;
        }

        .crew-role {
            font-size: 0.9rem;
            color: #b3e5fc;
        }

        .live-indicator {
            position: fixed;
            top: 20px;
            right: 20px;
            background: #4caf50;
            color: white;
            padding: 8px 16px;
            border-radius: 20px;
            font-size: 0.9rem;
            font-weight: bold;
            box-shadow: 0 4px 12px rgba(76, 175, 80, 0.3);
        }

        .update-log {
            margin-top: 30px;
            text-align: left;
            max-height: 200px;
            overflow-y: auto;
            background: rgba(0, 0, 0, 0.3);
            padding: 15px;
            border-radius: 10px;
            font-family: 'Courier New', monospace;
            font-size: 0.9rem;
        }

        .log-entry {
            margin: 5px 0;
            padding: 5px;
            border-radius: 5px;
        }

        .log-info { background: rgba(33, 150, 243, 0.2); }
        .log-success { background: rgba(76, 175, 80, 0.2); }
        .log-warning { background: rgba(255, 193, 7, 0.2); }
    </style>
</head>
<body>
    <div class="live-indicator">
        <span class="status-indicator"></span>
        LIVE PREVIEW
    </div>

    <div class="preview-container">
        <div class="preview-header">
            <h1 class="preview-title">🖖 Alex AI Live Preview</h1>
            <p class="preview-subtitle">Real-time dashboard updates with WebSocket connection</p>
        </div>

        <div class="preview-content">
            <h3>👥 Crew Status: All 9 Members Active</h3>
            <div class="crew-grid">
                <div class="crew-member">
                    <div class="crew-name">🖖 Captain Picard</div>
                    <div class="crew-role">Strategic Commander</div>
                </div>
                <div class="crew-member">
                    <div class="crew-name">🖖 Commander Riker</div>
                    <div class="crew-role">Executive Officer</div>
                </div>
                <div class="crew-member">
                    <div class="crew-name">🤖 Commander Data</div>
                    <div class="crew-role">Technical Operations</div>
                </div>
                <div class="crew-member">
                    <div class="crew-name">🔧 Commander La Forge</div>
                    <div class="crew-role">Chief Engineering</div>
                </div>
                <div class="crew-member">
                    <div class="crew-name">🛡️ Lieutenant Worf</div>
                    <div class="crew-role">Security Officer</div>
                </div>
                <div class="crew-member">
                    <div class="crew-name">💭 Counselor Troi</div>
                    <div class="crew-role">Ship's Counselor</div>
                </div>
                <div class="crew-member">
                    <div class="crew-name">🏥 Dr. Crusher</div>
                    <div class="crew-role">Chief Medical Officer</div>
                </div>
                <div class="crew-member">
                    <div class="crew-name">📡 Lieutenant Uhura</div>
                    <div class="crew-role">Communications Officer</div>
                </div>
                <div class="crew-member">
                    <div class="crew-name">💰 Quark</div>
                    <div class="crew-role">Business Operations</div>
                </div>
            </div>
        </div>

        <div class="update-log" id="updateLog">
            <div class="log-entry log-success">✅ Live preview server initialized</div>
            <div class="log-entry log-info">📡 WebSocket connection established</div>
            <div class="log-entry log-success">👥 All 9 crew members loaded</div>
            <div class="log-entry log-info">🔄 Ready for real-time updates</div>
        </div>
    </div>

    <script>
        class LivePreviewClient {
            constructor() {
                this.ws = null;
                this.reconnectAttempts = 0;
                this.maxReconnectAttempts = 5;
                this.connect();
                this.startHeartbeat();
            }

            connect() {
                const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
                this.ws = new WebSocket(protocol + '//' + window.location.host);

                this.ws.onopen = () => {
                    console.log('🔗 Connected to live preview server');
                    this.addLogEntry('Connected to live preview server', 'success');
                    this.reconnectAttempts = 0;
                };

                this.ws.onmessage = (event) => {
                    const data = JSON.parse(event.data);
                    this.handleUpdate(data);
                };

                this.ws.onclose = () => {
                    console.log('🔌 Disconnected from live preview server');
                    this.addLogEntry('Disconnected from server', 'warning');
                    this.reconnect();
                };

                this.ws.onerror = (error) => {
                    console.error('❌ WebSocket error:', error);
                    this.addLogEntry('WebSocket connection error', 'warning');
                };
            }

            reconnect() {
                if (this.reconnectAttempts < this.maxReconnectAttempts) {
                    this.reconnectAttempts++;
                    const delay = Math.pow(2, this.reconnectAttempts) * 1000;
                    this.addLogEntry('Reconnecting in ' + (delay/1000) + 's... (attempt ' + this.reconnectAttempts + ')', 'info');
                    
                    setTimeout(() => {
                        this.connect();
                    }, delay);
                } else {
                    this.addLogEntry('Max reconnection attempts reached', 'warning');
                }
            }

            handleUpdate(data) {
                switch (data.type) {
                    case 'content_update':
                        this.updateContent(data.content);
                        break;
                    case 'crew_update':
                        this.updateCrewStatus(data.crew);
                        break;
                    case 'status_update':
                        this.updateStatus(data.status);
                        break;
                    case 'log_update':
                        this.addLogEntry(data.message, data.level);
                        break;
                }
            }

            updateContent(content) {
                // Update preview content in real-time
                if (content.title) {
                    document.querySelector('.preview-title').textContent = content.title;
                }
                if (content.subtitle) {
                    document.querySelector('.preview-subtitle').textContent = content.subtitle;
                }
                this.addLogEntry('Content updated', 'success');
            }

            updateCrewStatus(crew) {
                const crewGrid = document.querySelector('.crew-grid');
                crewGrid.innerHTML = '';
                
                crew.forEach(member => {
                    const crewMember = document.createElement('div');
                    crewMember.className = 'crew-member';
                    crewMember.innerHTML = '<div class="crew-name">' + member.icon + ' ' + member.name + '</div><div class="crew-role">' + member.role + '</div>';
                    crewGrid.appendChild(crewMember);
                });
                
                this.addLogEntry('Crew status updated: ' + crew.length + ' members', 'success');
            }

            updateStatus(status) {
                const statusIndicator = document.querySelector('.status-indicator');
                statusIndicator.style.background = status === 'active' ? '#4caf50' : '#f44336';
                this.addLogEntry('Status: ' + status, 'info');
            }

            addLogEntry(message, level = 'info') {
                const log = document.getElementById('updateLog');
                const entry = document.createElement('div');
                entry.className = 'log-entry log-' + level;
                entry.textContent = '[' + new Date().toLocaleTimeString() + '] ' + message;
                log.appendChild(entry);
                log.scrollTop = log.scrollHeight;
                
                // Keep only last 50 entries
                while (log.children.length > 50) {
                    log.removeChild(log.firstChild);
                }
            }

            startHeartbeat() {
                setInterval(() => {
                    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
                        this.ws.send(JSON.stringify({ type: 'heartbeat' }));
                    }
                }, 30000); // Send heartbeat every 30 seconds
            }
        }

        // Initialize live preview client
        new LivePreviewClient();
    </script>
</body>
</html>`;
  }

  /**
   * Start the live preview server
   */
  start() {
    return new Promise((resolve, reject) => {
      try {
        this.server = http.createServer((req, res) => {
          this.handleRequest(req, res);
        });

        // WebSocket server for real-time updates
        this.wss = new WebSocketServer({ server: this.server });

        this.wss.on('connection', (ws) => {
          console.log('📡 Live preview client connected');
          this.connectedClients.add(ws);

          // Send initial content
          ws.send(JSON.stringify({
            type: 'content_update',
            content: {
              title: '🖖 Alex AI Live Preview',
              subtitle: 'Real-time dashboard updates with WebSocket connection'
            }
          }));

          ws.on('message', (data) => {
            try {
              const message = JSON.parse(data);
              this.handleClientMessage(ws, message);
            } catch (error) {
              console.error('Error parsing client message:', error);
            }
          });

          ws.on('close', () => {
            console.log('📡 Live preview client disconnected');
            this.connectedClients.delete(ws);
          });

          ws.on('error', (error) => {
            console.error('WebSocket error:', error);
            this.connectedClients.delete(ws);
          });
        });

        // Start server
        this.server.listen(this.port, (err) => {
          if (err) {
            reject(err);
            return;
          }
          
          console.log(`🖖 Alex AI Live Preview Server running on http://localhost:${this.port}`);
          console.log(`📡 WebSocket server ready for real-time updates`);
          console.log(`✅ Live Preview ready`);
          console.log(`🌐 Preview URL: http://localhost:${this.port}`);
          console.log(`📡 WebSocket: ws://localhost:${this.port}`);
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
    const url = new URL(req.url, 'http://' + req.headers.host);
    
    // CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    if (req.method === 'OPTIONS') {
      res.writeHead(200);
      res.end();
      return;
    }

    if (url.pathname === '/') {
      this.servePreviewPage(res);
    } else if (url.pathname === '/api/update') {
      this.handleContentUpdate(req, res);
    } else if (url.pathname === '/api/crew') {
      this.handleCrewUpdate(req, res);
    } else if (url.pathname === '/api/status') {
      this.handleStatusUpdate(req, res);
    } else {
      res.writeHead(404, { 'Content-Type': 'text/plain' });
      res.end('Not Found');
    }
  }

  /**
   * Serve the preview page
   */
  servePreviewPage(res) {
    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.end(this.previewContent);
  }

  /**
   * Handle content updates
   */
  handleContentUpdate(req, res) {
    if (req.method !== 'POST') {
      res.writeHead(405, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Method not allowed' }));
      return;
    }

    let body = '';
    req.on('data', chunk => {
      body += chunk.toString();
    });

    req.on('end', () => {
      try {
        const updateData = JSON.parse(body);
        this.lastModified = new Date();
        
        // Broadcast update to all connected clients
        this.broadcastUpdate({
          type: 'content_update',
          content: updateData
        });

        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ 
          success: true, 
          timestamp: this.lastModified.toISOString() 
        }));

      } catch (error) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Invalid JSON' }));
      }
    });
  }

  /**
   * Handle crew updates
   */
  handleCrewUpdate(req, res) {
    if (req.method !== 'POST') {
      res.writeHead(405, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Method not allowed' }));
      return;
    }

    let body = '';
    req.on('data', chunk => {
      body += chunk.toString();
    });

    req.on('end', () => {
      try {
        const crewData = JSON.parse(body);
        
        // Broadcast crew update to all connected clients
        this.broadcastUpdate({
          type: 'crew_update',
          crew: crewData
        });

        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ 
          success: true, 
          crewCount: crewData.length,
          timestamp: new Date().toISOString() 
        }));

      } catch (error) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Invalid JSON' }));
      }
    });
  }

  /**
   * Handle status updates
   */
  handleStatusUpdate(req, res) {
    if (req.method !== 'POST') {
      res.writeHead(405, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Method not allowed' }));
      return;
    }

    let body = '';
    req.on('data', chunk => {
      body += chunk.toString();
    });

    req.on('end', () => {
      try {
        const statusData = JSON.parse(body);
        
        // Broadcast status update to all connected clients
        this.broadcastUpdate({
          type: 'status_update',
          status: statusData.status,
          message: statusData.message
        });

        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ 
          success: true, 
          status: statusData.status,
          timestamp: new Date().toISOString() 
        }));

      } catch (error) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Invalid JSON' }));
      }
    });
  }

  /**
   * Handle client messages
   */
  handleClientMessage(ws, message) {
    switch (message.type) {
      case 'heartbeat':
        // Client heartbeat - no response needed
        break;
      case 'request_update':
        // Send current content to requesting client
        ws.send(JSON.stringify({
          type: 'content_update',
          content: {
            title: '🖖 Alex AI Live Preview',
            subtitle: 'Real-time dashboard updates with WebSocket connection'
          }
        }));
        break;
    }
  }

  /**
   * Broadcast update to all connected clients
   */
  broadcastUpdate(data) {
    const message = JSON.stringify(data);
    this.connectedClients.forEach(ws => {
      if (ws.readyState === ws.OPEN) {
        ws.send(message);
      }
    });
  }

  /**
   * Stop the server
   */
  stop() {
    return new Promise((resolve) => {
      if (this.wss) {
        this.wss.close();
      }
      if (this.server) {
        this.server.close(resolve);
      } else {
        resolve();
      }
    });
  }
}

// Start the live preview server
if (require.main === module) {
  const server = new LivePreviewServer();
  
  server.start().catch(error => {
    console.error('Failed to start live preview server:', error);
    process.exit(1);
  });

  // Graceful shutdown
  process.on('SIGINT', () => {
    console.log('\\n🛑 Shutting down live preview server...');
    server.stop().then(() => {
      console.log('✅ Live preview server stopped');
      process.exit(0);
    });
  });
}

module.exports = LivePreviewServer;
