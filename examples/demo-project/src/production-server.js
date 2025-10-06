#!/usr/bin/env node

/**
 * 🖖 Alex AI Configuration Dashboard - Production Server
 * 
 * This server is designed for production deployment on Vercel, Docker, or other platforms.
 * It combines both web and dashboard functionality with proper production optimizations.
 */

const http = require('http');
const fs = require('fs');
const path = require('path');
const { URL } = require('url');

class AlexAIProductionServer {
    constructor(port = 3000) {
        this.port = port;
        this.server = null;
        this.isRunning = false;
        this.environment = process.env.NODE_ENV || 'production';
        this.serverType = process.env.SERVER_TYPE || 'web';
        
        // Production configuration
        this.config = {
            project: "Alex AI Configuration Dashboard",
            status: "production",
            environment: this.environment,
            serverType: this.serverType,
            universalFeatures: {
                chatCapturing: {
                    enabled: true,
                    status: "active",
                    lastCapture: new Date().toISOString()
                },
                n8nIntegration: {
                    enabled: true,
                    status: "active",
                    workflowCount: 5,
                    lastSync: new Date().toISOString()
                },
                crewAI: {
                    enabled: true,
                    status: "active",
                    activeMembers: 9,
                    lastActivity: new Date().toISOString()
                }
            },
            websiteConfig: {
                title: "🖖 Alex AI Production Dashboard",
                heading: "Welcome to Alex AI Production Environment",
                description: "This is the production deployment of the Alex AI Configuration Dashboard. Optimized for Vercel, Docker, and cloud platforms.",
                backgroundColor: "#1e3c72",
                textColor: "#ffffff",
                theme: "production",
                layout: "grid",
                components: {
                    sidebar: true,
                    footer: true,
                    header: true
                }
            },
            crewMembers: [
                { id: 'picard', name: 'Captain Jean-Luc Picard', role: 'Strategic Commander', expertise: ['strategic_planning', 'mission_coordination', 'decision_making'], validationAreas: ['content', 'design', 'layout'], avatar: '🖖' },
                { id: 'riker', name: 'Commander William Riker', role: 'First Officer', expertise: ['tactical_operations', 'workflow_management', 'execution'], validationAreas: ['layout', 'component', 'performance'], avatar: '👤' },
                { id: 'data', name: 'Commander Data', role: 'Operations Officer', expertise: ['technical_architecture', 'ai_ml_integration', 'data_processing'], validationAreas: ['component', 'performance', 'security'], avatar: '🤖' },
                { id: 'laforge', name: 'Lieutenant Commander Geordi La Forge', role: 'Chief Engineer', expertise: ['engineering_solutions', 'infrastructure', 'system_integration'], validationAreas: ['component', 'performance', 'security'], avatar: '🔧' },
                { id: 'worf', name: 'Lieutenant Worf', role: 'Security Officer', expertise: ['security_protocols', 'threat_assessment', 'compliance'], validationAreas: ['security', 'performance'], avatar: '🛡️' },
                { id: 'troi', name: 'Counselor Deanna Troi', role: 'Ship\'s Counselor', expertise: ['user_experience', 'communication', 'team_dynamics'], validationAreas: ['content', 'design', 'layout'], avatar: '💭' },
                { id: 'crusher', name: 'Dr. Beverly Crusher', role: 'Chief Medical Officer', expertise: ['system_health', 'diagnostics', 'performance_monitoring'], validationAreas: ['performance', 'security'], avatar: '🏥' },
                { id: 'uhura', name: 'Lieutenant Uhura', role: 'Communications Officer', expertise: ['communication_protocols', 'synchronization', 'integration'], validationAreas: ['content', 'component'], avatar: '📡' },
                { id: 'quark', name: 'Quark', role: 'Business Operations', expertise: ['cost_optimization', 'efficiency_analysis', 'business_metrics'], validationAreas: ['content', 'performance'], avatar: '💰' }
            ],
            activityLog: []
        };
        
        this.configFilePath = path.join(__dirname, '../config/production-config.json');
        this.loadConfig();
    }

    loadConfig() {
        try {
            if (fs.existsSync(this.configFilePath)) {
                const data = fs.readFileSync(this.configFilePath, 'utf8');
                this.config = { ...this.config, ...JSON.parse(data) };
                console.log('✅ Production configuration loaded from file.');
            } else {
                this.saveConfig();
                console.log('📝 Default production configuration saved.');
            }
        } catch (error) {
            console.error('❌ Error loading production configuration:', error.message);
            this.saveConfig();
        }
    }

    saveConfig() {
        try {
            const configDir = path.dirname(this.configFilePath);
            if (!fs.existsSync(configDir)) {
                fs.mkdirSync(configDir, { recursive: true });
            }
            fs.writeFileSync(this.configFilePath, JSON.stringify(this.config, null, 2), 'utf8');
            console.log('💾 Production configuration saved.');
        } catch (error) {
            console.error('❌ Error saving production configuration:', error.message);
        }
    }

    logActivity(type, message, details = {}) {
        const timestamp = new Date().toISOString();
        this.config.activityLog.unshift({ timestamp, type, message, details });
        if (this.config.activityLog.length > 100) {
            this.config.activityLog.pop();
        }
        this.saveConfig();
    }

    handleRequest(req, res) {
        const parsedUrl = new URL(req.url, `http://${req.headers.host}`);
        const pathname = parsedUrl.pathname;

        // Production CORS headers
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, DELETE');
        res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
        res.setHeader('X-Powered-By', 'Alex AI Production Server');
        res.setHeader('X-Environment', this.environment);

        if (req.method === 'OPTIONS') {
            res.writeHead(204);
            res.end();
            return;
        }

        // Route handling
        if (pathname === '/api/health' && req.method === 'GET') {
            this.handleHealthCheck(req, res);
        } else if (pathname === '/api/config' && req.method === 'GET') {
            this.getWebsiteConfig(req, res);
        } else if (pathname === '/api/config' && req.method === 'POST') {
            this.updateWebsiteConfig(req, res);
        } else if (pathname === '/api/crew' && req.method === 'GET') {
            this.getCrewData(req, res);
        } else if (pathname === '/api/dashboard' && req.method === 'GET') {
            this.getDashboardData(req, res);
        } else if (pathname === '/api/activity' && req.method === 'GET') {
            this.getActivityLog(req, res);
        } else if (pathname.startsWith('/dashboard')) {
            this.serveDashboard(req, res);
        } else {
            this.serveStaticFile(pathname, res);
        }
    }

    handleHealthCheck(req, res) {
        const healthStatus = {
            status: 'healthy',
            timestamp: new Date().toISOString(),
            environment: this.environment,
            serverType: this.serverType,
            uptime: process.uptime(),
            memory: process.memoryUsage(),
            crew: {
                totalMembers: this.config.crewMembers.length,
                activeMembers: this.config.crewMembers.length
            },
            features: this.config.universalFeatures
        };

        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(healthStatus));
    }

    getWebsiteConfig(req, res) {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(this.config.websiteConfig));
    }

    updateWebsiteConfig(req, res) {
        let body = '';
        req.on('data', chunk => {
            body += chunk.toString();
        });
        req.on('end', () => {
            try {
                const updates = JSON.parse(body);
                const oldConfig = { ...this.config.websiteConfig };
                this.config.websiteConfig = { ...this.config.websiteConfig, ...updates };
                this.saveConfig();
                this.logActivity('config_update', 'Website configuration updated in production', { oldConfig, newConfig: this.config.websiteConfig });

                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ success: true, message: 'Configuration updated in production', newConfig: this.config.websiteConfig }));
            } catch (error) {
                console.error('❌ Error updating website config:', error.message);
                res.writeHead(400, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ success: false, message: 'Invalid JSON or update payload', error: error.message }));
            }
        });
    }

    getCrewData(req, res) {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(this.config.crewMembers));
    }

    getDashboardData(req, res) {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
            project: this.config.project,
            status: this.config.status,
            environment: this.config.environment,
            universalFeatures: this.config.universalFeatures,
            websiteConfig: this.config.websiteConfig,
            crewMembers: this.config.crewMembers.map(c => ({ id: c.id, name: c.name, role: c.role, avatar: c.avatar })),
            activityLog: this.config.activityLog
        }));
    }

    getActivityLog(req, res) {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(this.config.activityLog));
    }

    serveDashboard(req, res) {
        const dashboardPath = path.join(__dirname, '../public/dashboard.html');
        this.serveFile(dashboardPath, 'text/html', res);
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
    <title>${this.config.websiteConfig.title}</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            margin: 0;
            padding: 20px;
            background: ${this.config.websiteConfig.backgroundColor};
            color: ${this.config.websiteConfig.textColor};
            min-height: 100vh;
        }
        .container {
            max-width: 1200px;
            margin: 0 auto;
            text-align: center;
        }
        .header {
            margin-bottom: 40px;
        }
        .crew-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
            gap: 20px;
            margin-top: 40px;
        }
        .crew-member {
            background: rgba(255, 255, 255, 0.1);
            padding: 20px;
            border-radius: 10px;
            backdrop-filter: blur(10px);
        }
        .crew-member h3 {
            margin: 0 0 10px 0;
            font-size: 1.2em;
        }
        .crew-member p {
            margin: 5px 0;
            opacity: 0.8;
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
    </style>
</head>
<body>
    <div class="status">🖖 Production Environment</div>
    <div class="container">
        <div class="header">
            <h1>${this.config.websiteConfig.heading}</h1>
            <p>${this.config.websiteConfig.description}</p>
        </div>
        
        <div class="crew-grid">
            ${this.config.crewMembers.map(member => `
                <div class="crew-member">
                    <h3>${member.avatar} ${member.name}</h3>
                    <p><strong>${member.role}</strong></p>
                    <p>${member.expertise.join(', ')}</p>
                </div>
            `).join('')}
        </div>
        
        <div style="margin-top: 40px; opacity: 0.7;">
            <p>🖖 Alex AI Configuration Dashboard - Production Environment</p>
            <p>Environment: ${this.environment} | Server Type: ${this.serverType}</p>
        </div>
    </div>
</body>
</html>`;

        res.writeHead(200, { 'Content-Type': 'text/html' });
        res.end(html);
    }

    start() {
        return new Promise((resolve, reject) => {
            this.server = http.createServer(this.handleRequest.bind(this));

            this.server.listen(this.port, () => {
                this.isRunning = true;
                console.log(`🖖 Alex AI Production Server running on http://localhost:${this.port}`);
                console.log(`🌍 Environment: ${this.environment}`);
                console.log(`🔧 Server Type: ${this.serverType}`);
                console.log(`👥 Crew Members: ${this.config.crewMembers.length} active`);
                console.log('✅ Production server ready');
                console.log(`🌐 Web Interface: http://localhost:${this.port}`);
                console.log(`🎛️ Dashboard: http://localhost:${this.port}/dashboard`);
                console.log(`🏥 Health Check: http://localhost:${this.port}/api/health`);
                resolve();
            }).on('error', (err) => {
                if (err.code === 'EADDRINUSE') {
                    console.error(`❌ Port ${this.port} is already in use.`);
                    reject(new Error(`Port ${this.port} is already in use.`));
                } else {
                    console.error('❌ Failed to start production server:', err.message);
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
                        console.error('❌ Error stopping production server:', err.message);
                        return reject(err);
                    }
                    this.isRunning = false;
                    console.log(`🛑 Alex AI Production Server stopped on port ${this.port}`);
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
    console.log('\nSIGTERM signal received. Shutting down production server...');
    if (global.productionServer) {
        await global.productionServer.stop();
    }
    process.exit(0);
});

process.on('SIGINT', async () => {
    console.log('\nSIGINT signal received. Shutting down production server...');
    if (global.productionServer) {
        await global.productionServer.stop();
    }
    process.exit(0);
});

if (require.main === module) {
    const server = new AlexAIProductionServer(parseInt(process.env.PORT) || 3000);
    global.productionServer = server;
    
    server.start().catch(error => {
        console.error('Failed to start Alex AI Production Server:', error);
        process.exit(1);
    });
}

module.exports = AlexAIProductionServer;


