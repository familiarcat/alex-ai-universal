#!/usr/bin/env node

/**
 * Alex AI Web Interface Server
 * 
 * Simple HTTP server to serve the web interface and provide API endpoints
 */

const http = require('http');
const fs = require('fs');
const path = require('path');
const { UniversalAlexAIManager } = require('../core/dist/index.js');

const PORT = process.env.PORT || 3000;
const alexAI = new UniversalAlexAIManager();

// Initialize Alex AI
async function initializeAlexAI() {
    try {
        await alexAI.initialize({
            environment: 'development',
            enableN8NIntegration: true,
            enableStealthScraping: true,
            enableCrewManagement: true,
            enableTesting: true,
            logLevel: 'info'
        });
        console.log('✅ Alex AI initialized for web interface');
    } catch (error) {
        console.error('❌ Failed to initialize Alex AI:', error);
    }
}

// Initialize on startup
initializeAlexAI();

const server = http.createServer(async (req, res) => {
    // Enable CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        res.writeHead(200);
        res.end();
        return;
    }

    const url = new URL(req.url, `http://${req.headers.host}`);
    const pathname = url.pathname;

    try {
        if (pathname === '/') {
            // Serve the main HTML file
            const htmlPath = path.join(__dirname, 'src', 'index.html');
            const htmlContent = fs.readFileSync(htmlPath, 'utf8');
            
            res.writeHead(200, { 'Content-Type': 'text/html' });
            res.end(htmlContent);
        } else if (pathname === '/api/chat' && req.method === 'POST') {
            // Handle chat API
            let body = '';
            req.on('data', chunk => {
                body += chunk.toString();
            });
            
            req.on('end', async () => {
                try {
                    const { message, crewMember, context } = JSON.parse(body);
                    
                    const response = await alexAI.sendMessage({
                        message,
                        crewMember,
                        context: context || {}
                    });
                    
                    res.writeHead(200, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify(response));
                } catch (error) {
                    console.error('Chat API error:', error);
                    res.writeHead(500, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ error: 'Failed to process message' }));
                }
            });
        } else if (pathname === '/api/crew') {
            // Get available crew members
            const crewMembers = await alexAI.getCrewMembers();
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify(crewMembers));
        } else if (pathname === '/api/status') {
            // Get system status
            const status = await alexAI.getStatus();
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify(status));
        } else {
            // 404
            res.writeHead(404, { 'Content-Type': 'text/plain' });
            res.end('Not Found');
        }
    } catch (error) {
        console.error('Server error:', error);
        res.writeHead(500, { 'Content-Type': 'text/plain' });
        res.end('Internal Server Error');
    }
});

server.listen(PORT, () => {
    console.log(`🚀 Alex AI Web Interface running on http://localhost:${PORT}`);
    console.log(`📱 Open your browser and navigate to the URL above`);
    console.log(`🤖 AI-powered crew members are ready to assist!`);
});

// Graceful shutdown
process.on('SIGINT', () => {
    console.log('\n🛑 Shutting down Alex AI Web Interface...');
    server.close(() => {
        console.log('✅ Server closed');
        process.exit(0);
    });
});





