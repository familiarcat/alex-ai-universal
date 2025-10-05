#!/usr/bin/env node

/**
 * 🖖 Alex AI Integrated Dashboard Server - Complete Real-Time Control System
 * 
 * This server provides complete integration between dashboard and live frontend:
 * - Dashboard controls all content of the frontend
 * - Seamless switching between dashboard and live views
 * - Real-time WebSocket communication
 * - Complete frontend/backend separation
 */

const http = require('http');
const fs = require('fs');
const path = require('path');
const { Server: SocketServer } = require('socket.io');
const { createServer } = require('http');

class IntegratedDashboardServer {
    constructor(port = 3000) {
        this.port = port;
        this.server = null;
        this.io = null;
        this.isRunning = false;
        this.connections = new Map();
        this.commandHistory = [];
        this.currentView = 'dashboard'; // 'dashboard' or 'frontend'
        
        // Frontend content configuration (controlled by dashboard)
        this.frontendConfig = {
            // Content
            title: "🖖 Alex AI Universal Dashboard",
            heading: "Welcome to Alex AI Universal",
            subtitle: "Real-Time Controlled Interface",
            description: "This entire frontend is controlled in real-time by our secure dashboard. Every element you see can be modified instantly through our backend control system.",
            
            // Design
            backgroundColor: "#1e3c72",
            textColor: "#ffffff",
            accentColor: "#00ff00",
            theme: "modern",
            
            // Layout
            layout: "grid",
            showSidebar: true,
            showFooter: true,
            showHeader: true,
            showNavigation: true,
            
            // Features
            features: [
                {
                    icon: "🖖",
                    title: "Real-Time Control",
                    description: "Complete dashboard control over every frontend element"
                },
                {
                    icon: "👥",
                    title: "Crew AI Integration",
                    description: "Nine specialized AI crew members monitoring all changes"
                },
                {
                    icon: "⚡",
                    title: "Instant Updates",
                    description: "Changes applied immediately via WebSocket technology"
                },
                {
                    icon: "🛡️",
                    title: "Secure Architecture",
                    description: "Complete separation between dashboard and frontend"
                },
                {
                    icon: "📊",
                    title: "Live Monitoring",
                    description: "Real-time system health and performance monitoring"
                },
                {
                    icon: "🚀",
                    title: "Production Ready",
                    description: "Optimized for deployment on any cloud platform"
                }
            ],
            
            // Crew members
            crew: [
                { id: 'picard', name: 'Captain Jean-Luc Picard', role: 'Strategic Commander', avatar: '🖖', status: 'active' },
                { id: 'riker', name: 'Commander William Riker', role: 'First Officer', avatar: '👤', status: 'active' },
                { id: 'data', name: 'Commander Data', role: 'Operations Officer', avatar: '🤖', status: 'active' },
                { id: 'laforge', name: 'Lieutenant Commander Geordi La Forge', role: 'Chief Engineer', avatar: '🔧', status: 'active' },
                { id: 'worf', name: 'Lieutenant Worf', role: 'Security Officer', avatar: '🛡️', status: 'active' },
                { id: 'troi', name: 'Counselor Deanna Troi', role: 'Ship\'s Counselor', avatar: '💭', status: 'active' },
                { id: 'crusher', name: 'Dr. Beverly Crusher', role: 'Chief Medical Officer', avatar: '🏥', status: 'active' },
                { id: 'uhura', name: 'Lieutenant Uhura', role: 'Communications Officer', avatar: '📡', status: 'active' },
                { id: 'quark', name: 'Quark', role: 'Business Operations', avatar: '💰', status: 'active' }
            ]
        };

        this.configFilePath = path.join(__dirname, '../config/integrated-config.json');
        this.loadConfig();
    }

    loadConfig() {
        try {
            if (fs.existsSync(this.configFilePath)) {
                const data = fs.readFileSync(this.configFilePath, 'utf8');
                const config = JSON.parse(data);
                this.frontendConfig = { ...this.frontendConfig, ...config.frontendConfig };
                console.log('✅ Integrated configuration loaded from file.');
            } else {
                this.saveConfig();
                console.log('📝 Default integrated configuration saved.');
            }
        } catch (error) {
            console.error('❌ Error loading integrated configuration:', error.message);
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
                frontendConfig: this.frontendConfig,
                commandHistory: this.commandHistory.slice(0, 50),
                timestamp: new Date().toISOString()
            }, null, 2), 'utf8');
            console.log('💾 Integrated configuration saved.');
        } catch (error) {
            console.error('❌ Error saving integrated configuration:', error.message);
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

        // CORS headers
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, DELETE');
        res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
        res.setHeader('X-Powered-By', 'Alex AI Integrated Dashboard');

        if (req.method === 'OPTIONS') {
            res.writeHead(204);
            res.end();
            return;
        }

        // Route handling
        if (pathname === '/api/health' && req.method === 'GET') {
            this.handleHealthCheck(req, res);
        } else if (pathname === '/api/config' && req.method === 'GET') {
            this.getConfig(req, res);
        } else if (pathname === '/api/command' && req.method === 'POST') {
            this.handleCommand(req, res);
        } else if (pathname === '/api/switch-view' && req.method === 'POST') {
            this.switchView(req, res);
        } else if (pathname === '/api/crew' && req.method === 'GET') {
            this.getCrew(req, res);
        } else if (pathname === '/api/connections' && req.method === 'GET') {
            this.getConnections(req, res);
        } else if (pathname === '/dashboard' || pathname === '/dashboard/') {
            this.serveDashboard(req, res);
        } else if (pathname === '/frontend' || pathname === '/frontend/') {
            this.serveFrontend(req, res);
        } else if (pathname === '/' || pathname === '/index.html') {
            // Default to dashboard view
            this.serveDashboard(req, res);
        } else {
            this.serveStaticFile(pathname, res);
        }
    }

    handleHealthCheck(req, res) {
        const healthStatus = {
            status: 'healthy',
            timestamp: new Date().toISOString(),
            serverType: 'integrated-dashboard',
            uptime: process.uptime(),
            memory: process.memoryUsage(),
            currentView: this.currentView,
            connections: {
                total: this.connections.size,
                dashboard: Array.from(this.connections.values()).filter(c => c.type === 'dashboard').length,
                frontend: Array.from(this.connections.values()).filter(c => c.type === 'frontend').length
            },
            crew: {
                totalMembers: this.frontendConfig.crew.length,
                activeMembers: this.frontendConfig.crew.filter(c => c.status === 'active').length
            },
            commands: {
                total: this.commandHistory.length,
                recent: this.commandHistory.slice(0, 5)
            }
        };

        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(healthStatus));
    }

    getConfig(req, res) {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(this.frontendConfig));
    }

    switchView(req, res) {
        let body = '';
        req.on('data', chunk => {
            body += chunk.toString();
        });
        req.on('end', () => {
            try {
                const { view } = JSON.parse(body);
                if (view === 'dashboard' || view === 'frontend') {
                    this.currentView = view;
                    
                    // Broadcast view change to all connected clients
                    this.io.emit('view-changed', {
                        view: this.currentView,
                        timestamp: new Date().toISOString()
                    });

                    res.writeHead(200, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ 
                        success: true, 
                        view: this.currentView,
                        message: `Switched to ${this.currentView} view`
                    }));
                } else {
                    res.writeHead(400, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ success: false, message: 'Invalid view type' }));
                }
            } catch (error) {
                res.writeHead(400, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ success: false, message: error.message }));
            }
        });
    }

    handleCommand(req, res) {
        let body = '';
        req.on('data', chunk => {
            body += chunk.toString();
        });
        req.on('end', () => {
            try {
                const command = JSON.parse(body);
                
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
                case 'feature':
                    return this.updateFeature(command.target, command.value);
                default:
                    return { success: false, message: 'Unknown command type' };
            }
        } catch (error) {
            return { success: false, message: error.message };
        }
    }

    updateContent(target, value) {
        if (this.frontendConfig.hasOwnProperty(target)) {
            const oldValue = this.frontendConfig[target];
            this.frontendConfig[target] = value;
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
        const designFields = ['backgroundColor', 'textColor', 'accentColor', 'theme'];
        if (designFields.includes(target)) {
            const oldValue = this.frontendConfig[target];
            this.frontendConfig[target] = value;
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
        const layoutFields = ['layout', 'showSidebar', 'showFooter', 'showHeader', 'showNavigation'];
        if (layoutFields.includes(target)) {
            const oldValue = this.frontendConfig[target];
            this.frontendConfig[target] = value;
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

    updateFeature(target, value) {
        if (this.frontendConfig.features && this.frontendConfig.features[target]) {
            const oldValue = this.frontendConfig.features[target];
            this.frontendConfig.features[target] = value;
            this.saveConfig();
            return { 
                success: true, 
                target: target, 
                oldValue: oldValue, 
                newValue: value,
                message: `Feature updated: ${target}`
            };
        }
        return { success: false, message: `Unknown feature target: ${target}` };
    }

    getCrew(req, res) {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(this.frontendConfig.crew));
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
            connections: connections,
            currentView: this.currentView
        }));
    }

    serveDashboard(req, res) {
        const dashboardPath = path.join(__dirname, '../public/integrated-dashboard.html');
        this.serveFile(dashboardPath, 'text/html', res);
    }

    serveFrontend(req, res) {
        const frontendPath = path.join(__dirname, '../public/integrated-frontend.html');
        this.serveFile(frontendPath, 'text/html', res);
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
        // Generate a simple dashboard if no HTML file exists
        const html = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Alex AI Integrated Dashboard</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 40px; background: #1e3c72; color: white; }
        .container { max-width: 800px; margin: 0 auto; text-align: center; }
        h1 { color: #00ff00; margin-bottom: 20px; }
        .links { margin: 30px 0; }
        .links a { display: inline-block; margin: 10px; padding: 15px 30px; background: #00ff00; color: #000; text-decoration: none; border-radius: 5px; }
        .links a:hover { background: #00cc00; }
    </style>
</head>
<body>
    <div class="container">
        <h1>🖖 Alex AI Integrated Dashboard</h1>
        <p>Real-time dashboard control system for frontend content</p>
        <div class="links">
            <a href="/dashboard">Dashboard Control Panel</a>
            <a href="/frontend">Live Frontend View</a>
        </div>
    </div>
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
            socket.emit('initial-config', this.frontendConfig);
            socket.emit('current-view', this.currentView);

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

            // Handle view switching
            socket.on('switch-view', (view) => {
                if (view === 'dashboard' || view === 'frontend') {
                    this.currentView = view;
                    this.io.emit('view-changed', {
                        view: this.currentView,
                        timestamp: new Date().toISOString()
                    });
                }
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
                console.log(`🖖 Alex AI Integrated Dashboard Server running on http://localhost:${this.port}`);
                console.log(`🎛️ Dashboard Control: http://localhost:${this.port}/dashboard`);
                console.log(`🌐 Live Frontend: http://localhost:${this.port}/frontend`);
                console.log(`🏥 Health Check: http://localhost:${this.port}/api/health`);
                console.log(`👥 Crew Members: ${this.frontendConfig.crew.length} active`);
                console.log('✅ Integrated dashboard system ready');
                console.log('🔄 WebSocket connections enabled');
                console.log('🎯 Dashboard controls frontend content in real-time');
                resolve();
            }).on('error', (err) => {
                if (err.code === 'EADDRINUSE') {
                    console.error(`❌ Port ${this.port} is already in use.`);
                    reject(new Error(`Port ${this.port} is already in use.`));
                } else {
                    console.error('❌ Failed to start integrated dashboard server:', err.message);
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
                        console.error('❌ Error stopping integrated dashboard server:', err.message);
                        return reject(err);
                    }
                    this.isRunning = false;
                    console.log(`🛑 Alex AI Integrated Dashboard Server stopped on port ${this.port}`);
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
    console.log('\nSIGTERM signal received. Shutting down integrated dashboard server...');
    if (global.integratedDashboardServer) {
        await global.integratedDashboardServer.stop();
    }
    process.exit(0);
});

process.on('SIGINT', async () => {
    console.log('\nSIGINT signal received. Shutting down integrated dashboard server...');
    if (global.integratedDashboardServer) {
        await global.integratedDashboardServer.stop();
    }
    process.exit(0);
});

if (require.main === module) {
    const server = new IntegratedDashboardServer(parseInt(process.env.PORT) || 3000);
    global.integratedDashboardServer = server;
    
    server.start().catch(error => {
        console.error('Failed to start Alex AI Integrated Dashboard Server:', error);
        process.exit(1);
    });
}

module.exports = IntegratedDashboardServer;
