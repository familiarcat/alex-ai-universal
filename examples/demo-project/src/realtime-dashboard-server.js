#!/usr/bin/env node

/**
 * 🖖 Alex AI Configuration Dashboard - Real-Time Control Server
 * 
 * This server implements the crew's recommended architecture for complete real-time
 * control between the secure dashboard and the public-facing page.
 * 
 * Architecture:
 * - Tier 1: Public-facing page with WebSocket connection
 * - Tier 2: Control server with message broker
 * - Tier 3: Secure dashboard with real-time command interface
 */

const http = require('http');
const fs = require('fs');
const path = require('path');
const { Server: SocketServer } = require('socket.io');
const { createServer } = require('http');

class RealTimeDashboardServer {
    constructor(port = 3002) {
        this.port = port;
        this.server = null;
        this.io = null;
        this.isRunning = false;
        this.connections = new Map();
        this.commandHistory = [];
        
        // Dashboard configuration
        this.dashboardConfig = {
            title: "🖖 Alex AI Real-Time Control Dashboard",
            description: "Secure dashboard for real-time control of public-facing pages",
            theme: "dark",
            authenticated: false
        };

        // Public page configuration (controlled by dashboard)
        this.publicPageConfig = {
            title: "Welcome to Alex AI",
            heading: "Alex AI Configuration Dashboard",
            description: "This page is controlled in real-time by the secure dashboard",
            backgroundColor: "#1e3c72",
            textColor: "#ffffff",
            theme: "modern",
            layout: "grid",
            components: {
                sidebar: true,
                footer: true,
                header: true,
                navigation: true
            }
        };

        // Crew members for validation
        this.crewMembers = [
            { id: 'picard', name: 'Captain Jean-Luc Picard', role: 'Strategic Commander', avatar: '🖖', validationAreas: ['content', 'design', 'layout'] },
            { id: 'riker', name: 'Commander William Riker', role: 'First Officer', avatar: '👤', validationAreas: ['layout', 'component', 'performance'] },
            { id: 'data', name: 'Commander Data', role: 'Operations Officer', avatar: '🤖', validationAreas: ['component', 'performance', 'security'] },
            { id: 'laforge', name: 'Lieutenant Commander Geordi La Forge', role: 'Chief Engineer', avatar: '🔧', validationAreas: ['component', 'performance', 'security'] },
            { id: 'worf', name: 'Lieutenant Worf', role: 'Security Officer', avatar: '🛡️', validationAreas: ['security', 'performance'] },
            { id: 'troi', name: 'Counselor Deanna Troi', role: 'Ship\'s Counselor', avatar: '💭', validationAreas: ['content', 'design', 'layout'] },
            { id: 'crusher', name: 'Dr. Beverly Crusher', role: 'Chief Medical Officer', avatar: '🏥', validationAreas: ['performance', 'security'] },
            { id: 'uhura', name: 'Lieutenant Uhura', role: 'Communications Officer', avatar: '📡', validationAreas: ['content', 'component'] },
            { id: 'quark', name: 'Quark', role: 'Business Operations', avatar: '💰', validationAreas: ['content', 'performance'] }
        ];

        this.configFilePath = path.join(__dirname, '../config/realtime-config.json');
        this.loadConfig();
    }

    loadConfig() {
        try {
            if (fs.existsSync(this.configFilePath)) {
                const data = fs.readFileSync(this.configFilePath, 'utf8');
                const config = JSON.parse(data);
                this.publicPageConfig = { ...this.publicPageConfig, ...config.publicPageConfig };
                this.dashboardConfig = { ...this.dashboardConfig, ...config.dashboardConfig };
                console.log('✅ Real-time configuration loaded from file.');
            } else {
                this.saveConfig();
                console.log('📝 Default real-time configuration saved.');
            }
        } catch (error) {
            console.error('❌ Error loading real-time configuration:', error.message);
            this.saveConfig();
        }
    }

    saveConfig() {
        try {
            const configDir = path.dirname(this.configFilePath);
            if (!fs.existsSync(configDir)) {
                fs.mkdirSync(configDir, { recursive: true });
            }
            fs.writeFileSync(this.configFilePath, JSON.stringify({
                publicPageConfig: this.publicPageConfig,
                dashboardConfig: this.dashboardConfig,
                commandHistory: this.commandHistory,
                timestamp: new Date().toISOString()
            }, null, 2), 'utf8');
            console.log('💾 Real-time configuration saved.');
        } catch (error) {
            console.error('❌ Error saving real-time configuration:', error.message);
        }
    }

    logCommand(command, result) {
        const logEntry = {
            timestamp: new Date().toISOString(),
            command: command,
            result: result,
            connections: this.connections.size
        };
        this.commandHistory.unshift(logEntry);
        if (this.commandHistory.length > 100) {
            this.commandHistory.pop();
        }
        this.saveConfig();
    }

    handleRequest(req, res) {
        const parsedUrl = new URL(req.url, `http://${req.headers.host}`);
        const pathname = parsedUrl.pathname;

        // CORS headers for real-time communication
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, DELETE');
        res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
        res.setHeader('X-Powered-By', 'Alex AI Real-Time Dashboard');

        if (req.method === 'OPTIONS') {
            res.writeHead(204);
            res.end();
            return;
        }

        // Route handling
        if (pathname === '/api/health' && req.method === 'GET') {
            this.handleHealthCheck(req, res);
        } else if (pathname === '/api/dashboard' && req.method === 'GET') {
            this.getDashboardData(req, res);
        } else if (pathname === '/api/public-config' && req.method === 'GET') {
            this.getPublicPageConfig(req, res);
        } else if (pathname === '/api/command' && req.method === 'POST') {
            this.handleCommand(req, res);
        } else if (pathname === '/api/crew' && req.method === 'GET') {
            this.getCrewData(req, res);
        } else if (pathname === '/api/connections' && req.method === 'GET') {
            this.getConnections(req, res);
        } else if (pathname.startsWith('/dashboard')) {
            this.serveDashboard(req, res);
        } else if (pathname.startsWith('/public')) {
            this.servePublicPage(req, res);
        } else {
            this.serveStaticFile(pathname, res);
        }
    }

    handleHealthCheck(req, res) {
        const healthStatus = {
            status: 'healthy',
            timestamp: new Date().toISOString(),
            serverType: 'realtime-dashboard',
            uptime: process.uptime(),
            memory: process.memoryUsage(),
            connections: {
                total: this.connections.size,
                dashboard: Array.from(this.connections.values()).filter(c => c.type === 'dashboard').length,
                public: Array.from(this.connections.values()).filter(c => c.type === 'public').length
            },
            crew: {
                totalMembers: this.crewMembers.length,
                activeMembers: this.crewMembers.length
            },
            commands: {
                total: this.commandHistory.length,
                recent: this.commandHistory.slice(0, 5)
            }
        };

        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(healthStatus));
    }

    getDashboardData(req, res) {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
            dashboard: this.dashboardConfig,
            publicPage: this.publicPageConfig,
            crew: this.crewMembers,
            connections: this.connections.size,
            commandHistory: this.commandHistory.slice(0, 10)
        }));
    }

    getPublicPageConfig(req, res) {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(this.publicPageConfig));
    }

    handleCommand(req, res) {
        let body = '';
        req.on('data', chunk => {
            body += chunk.toString();
        });
        req.on('end', () => {
            try {
                const command = JSON.parse(body);
                
                // Validate command
                if (!command.type || !command.target) {
                    res.writeHead(400, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ success: false, message: 'Invalid command format' }));
                    return;
                }

                // Execute command
                const result = this.executeCommand(command);
                
                // Broadcast to all connected clients
                this.io.emit('config-update', {
                    command: command,
                    result: result,
                    timestamp: new Date().toISOString()
                });

                // Log command
                this.logCommand(command, result);

                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ success: true, result: result }));
            } catch (error) {
                console.error('❌ Error processing command:', error.message);
                res.writeHead(400, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ success: false, message: error.message }));
            }
        });
    }

    executeCommand(command) {
        try {
            switch (command.type) {
                case 'content':
                    return this.updateContent(command.target, command.value);
                case 'design':
                    return this.updateDesign(command.target, command.value);
                case 'layout':
                    return this.updateLayout(command.target, command.value);
                case 'component':
                    return this.updateComponent(command.target, command.value);
                default:
                    return { success: false, message: 'Unknown command type' };
            }
        } catch (error) {
            return { success: false, message: error.message };
        }
    }

    updateContent(target, value) {
        if (this.publicPageConfig.hasOwnProperty(target)) {
            const oldValue = this.publicPageConfig[target];
            this.publicPageConfig[target] = value;
            this.saveConfig();
            return { 
                success: true, 
                target: target, 
                oldValue: oldValue, 
                newValue: value,
                message: `Content updated: ${target}`
            };
        }
        return { success: false, message: `Unknown content target: ${target}` };
    }

    updateDesign(target, value) {
        const designFields = ['backgroundColor', 'textColor', 'theme'];
        if (designFields.includes(target)) {
            const oldValue = this.publicPageConfig[target];
            this.publicPageConfig[target] = value;
            this.saveConfig();
            return { 
                success: true, 
                target: target, 
                oldValue: oldValue, 
                newValue: value,
                message: `Design updated: ${target}`
            };
        }
        return { success: false, message: `Unknown design target: ${target}` };
    }

    updateLayout(target, value) {
        if (target === 'layout') {
            const oldValue = this.publicPageConfig.layout;
            this.publicPageConfig.layout = value;
            this.saveConfig();
            return { 
                success: true, 
                target: target, 
                oldValue: oldValue, 
                newValue: value,
                message: `Layout updated: ${target}`
            };
        }
        return { success: false, message: `Unknown layout target: ${target}` };
    }

    updateComponent(target, value) {
        if (this.publicPageConfig.components && this.publicPageConfig.components.hasOwnProperty(target)) {
            const oldValue = this.publicPageConfig.components[target];
            this.publicPageConfig.components[target] = value;
            this.saveConfig();
            return { 
                success: true, 
                target: target, 
                oldValue: oldValue, 
                newValue: value,
                message: `Component updated: ${target}`
            };
        }
        return { success: false, message: `Unknown component target: ${target}` };
    }

    getCrewData(req, res) {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(this.crewMembers));
    }

    getConnections(req, res) {
        const connections = Array.from(this.connections.values()).map(conn => ({
            id: conn.id,
            type: conn.type,
            connectedAt: conn.connectedAt,
            lastActivity: conn.lastActivity
        }));
        
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
            total: this.connections.size,
            connections: connections
        }));
    }

    serveDashboard(req, res) {
        const dashboardPath = path.join(__dirname, '../public/realtime-dashboard.html');
        this.serveFile(dashboardPath, 'text/html', res);
    }

    servePublicPage(req, res) {
        const publicPath = path.join(__dirname, '../public/realtime-public.html');
        this.serveFile(publicPath, 'text/html', res);
    }

    serveStaticFile(pathname, res) {
        const filePath = path.join(__dirname, '../public', pathname === '/' ? 'index.html' : pathname);
        const extname = String(path.extname(filePath)).toLowerCase();
        const mimeTypes = {
            '.html': 'text/html',
            '.js': 'text/javascript',
            '.css': 'text/css',
            '.json': 'application/json',
            '.png': 'image/png',
            '.jpg': 'image/jpg',
            '.gif': 'image/gif',
            '.svg': 'image/svg+xml',
            '.ico': 'image/x-icon'
        };

        const contentType = mimeTypes[extname] || 'application/octet-stream';
        this.serveFile(filePath, contentType, res);
    }

    serveFile(filePath, contentType, res) {
        fs.readFile(filePath, (error, content) => {
            if (error) {
                if (error.code === 'ENOENT') {
                    // Generate dynamic content for missing files
                    if (contentType === 'text/html') {
                        this.generateDynamicContent(res);
                    } else {
                        res.writeHead(404, { 'Content-Type': 'text/html' });
                        res.end('<h1>404 Not Found</h1>', 'utf-8');
                    }
                } else {
                    res.writeHead(500);
                    res.end('Internal Server Error: ' + error.code + '\n');
                }
            } else {
                res.writeHead(200, { 'Content-Type': contentType });
                res.end(content, 'utf-8');
            }
        });
    }

    generateDynamicContent(res) {
        const html = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${this.publicPageConfig.title}</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            margin: 0;
            padding: 20px;
            background: ${this.publicPageConfig.backgroundColor};
            color: ${this.publicPageConfig.textColor};
            min-height: 100vh;
            transition: all 0.3s ease;
        }
        .container {
            max-width: 1200px;
            margin: 0 auto;
            text-align: center;
        }
        .header {
            margin-bottom: 40px;
        }
        .status {
            position: fixed;
            top: 20px;
            right: 20px;
            background: rgba(0, 255, 0, 0.2);
            padding: 10px 20px;
            border-radius: 20px;
            font-size: 0.9em;
        }
        .realtime-indicator {
            position: fixed;
            bottom: 20px;
            right: 20px;
            background: rgba(0, 255, 0, 0.2);
            padding: 10px 20px;
            border-radius: 20px;
            font-size: 0.9em;
            animation: pulse 2s infinite;
        }
        @keyframes pulse {
            0% { opacity: 1; }
            50% { opacity: 0.5; }
            100% { opacity: 1; }
        }
    </style>
</head>
<body>
    <div class="status">🖖 Real-Time Controlled</div>
    <div class="container">
        <div class="header">
            <h1>${this.publicPageConfig.heading}</h1>
            <p>${this.publicPageConfig.description}</p>
        </div>
        
        <div class="realtime-indicator">
            🔴 Live Updates Active
        </div>
    </div>
    
    <script src="/socket.io/socket.io.js"></script>
    <script>
        const socket = io();
        
        socket.on('config-update', function(data) {
            console.log('Real-time update received:', data);
            // Apply changes to the page in real-time
            if (data.result.success) {
                // Update page elements based on the command
                updatePageElement(data.command, data.result);
            }
        });
        
        function updatePageElement(command, result) {
            // Real-time page updates based on dashboard commands
            if (command.type === 'content' && command.target === 'title') {
                document.title = result.newValue;
            } else if (command.type === 'content' && command.target === 'heading') {
                document.querySelector('h1').textContent = result.newValue;
            } else if (command.type === 'content' && command.target === 'description') {
                document.querySelector('p').textContent = result.newValue;
            } else if (command.type === 'design' && command.target === 'backgroundColor') {
                document.body.style.backgroundColor = result.newValue;
            } else if (command.type === 'design' && command.target === 'textColor') {
                document.body.style.color = result.newValue;
            }
            
            // Show update notification
            showUpdateNotification(result.message);
        }
        
        function showUpdateNotification(message) {
            const notification = document.createElement('div');
            notification.style.cssText = \`
                position: fixed;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                background: rgba(0, 255, 0, 0.9);
                color: white;
                padding: 20px;
                border-radius: 10px;
                z-index: 1000;
                font-weight: bold;
            \`;
            notification.textContent = message;
            document.body.appendChild(notification);
            
            setTimeout(() => {
                document.body.removeChild(notification);
            }, 2000);
        }
    </script>
</body>
</html>`;

        res.writeHead(200, { 'Content-Type': 'text/html' });
        res.end(html);
    }

    setupSocketIO() {
        this.io = new SocketServer(this.server, {
            cors: {
                origin: "*",
                methods: ["GET", "POST"]
            }
        });

        this.io.on('connection', (socket) => {
            const connectionId = socket.id;
            const connectionType = socket.handshake.query.type || 'unknown';
            
            this.connections.set(connectionId, {
                id: connectionId,
                type: connectionType,
                connectedAt: new Date().toISOString(),
                lastActivity: new Date().toISOString()
            });

            console.log(`🔌 ${connectionType} client connected: ${connectionId}`);

            // Send current configuration to new connections
            socket.emit('initial-config', this.publicPageConfig);

            // Handle dashboard commands
            socket.on('dashboard-command', (command) => {
                const result = this.executeCommand(command);
                
                // Broadcast to all clients
                this.io.emit('config-update', {
                    command: command,
                    result: result,
                    timestamp: new Date().toISOString()
                });

                // Log command
                this.logCommand(command, result);

                // Send acknowledgment back to dashboard
                socket.emit('command-result', { success: true, result: result });
            });

            // Handle ping/pong for connection health
            socket.on('ping', () => {
                socket.emit('pong');
                const conn = this.connections.get(connectionId);
                if (conn) {
                    conn.lastActivity = new Date().toISOString();
                }
            });

            socket.on('disconnect', () => {
                this.connections.delete(connectionId);
                console.log(`🔌 Client disconnected: ${connectionId}`);
            });
        });
    }

    start() {
        return new Promise((resolve, reject) => {
            this.server = createServer(this.handleRequest.bind(this));

            // Setup Socket.IO
            this.setupSocketIO();

            this.server.listen(this.port, () => {
                this.isRunning = true;
                console.log(`🖖 Alex AI Real-Time Dashboard Server running on http://localhost:${this.port}`);
                console.log(`🎛️ Secure Dashboard: http://localhost:${this.port}/dashboard`);
                console.log(`🌐 Public Page: http://localhost:${this.port}/public`);
                console.log(`🏥 Health Check: http://localhost:${this.port}/api/health`);
                console.log(`👥 Crew Members: ${this.crewMembers.length} active`);
                console.log('✅ Real-time control system ready');
                console.log('🔄 WebSocket connections enabled');
                resolve();
            }).on('error', (err) => {
                if (err.code === 'EADDRINUSE') {
                    console.error(`❌ Port ${this.port} is already in use.`);
                    reject(new Error(`Port ${this.port} is already in use.`));
                } else {
                    console.error('❌ Failed to start real-time dashboard server:', err.message);
                    reject(err);
                }
            });
        });
    }

    stop() {
        return new Promise((resolve, reject) => {
            if (this.server && this.isRunning) {
                this.server.close((err) => {
                    if (err) {
                        console.error('❌ Error stopping real-time dashboard server:', err.message);
                        return reject(err);
                    }
                    this.isRunning = false;
                    console.log(`🛑 Alex AI Real-Time Dashboard Server stopped on port ${this.port}`);
                    resolve();
                });
            } else {
                resolve();
            }
        });
    }
}

// Handle graceful shutdown
process.on('SIGTERM', async () => {
    console.log('\nSIGTERM signal received. Shutting down real-time dashboard server...');
    if (global.realtimeDashboardServer) {
        await global.realtimeDashboardServer.stop();
    }
    process.exit(0);
});

process.on('SIGINT', async () => {
    console.log('\nSIGINT signal received. Shutting down real-time dashboard server...');
    if (global.realtimeDashboardServer) {
        await global.realtimeDashboardServer.stop();
    }
    process.exit(0);
});

if (require.main === module) {
    const server = new RealTimeDashboardServer(parseInt(process.env.PORT) || 3002);
    global.realtimeDashboardServer = server;
    
    server.start().catch(error => {
        console.error('Failed to start Alex AI Real-Time Dashboard Server:', error);
        process.exit(1);
    });
}

module.exports = RealTimeDashboardServer;




