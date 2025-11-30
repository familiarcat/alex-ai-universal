#!/usr/bin/env node

/**
 * 🖖 Alex AI Configuration Dashboard - Production Startup Script
 * 
 * This script simulates production deployment for Vercel, Docker, or other platforms.
 */

const { spawn } = require('child_process');
const path = require('path');

class ProductionDeployment {
    constructor() {
        this.processes = [];
        this.environment = process.env.NODE_ENV || 'production';
        this.ports = {
            web: parseInt(process.env.PORT) || 3000,
            dashboard: parseInt(process.env.DASHBOARD_PORT) || 3001
        };
    }

    async start() {
        console.log(`🖖 Starting Alex AI Production Deployment Simulation`);
        console.log(`🌍 Environment: ${this.environment}`);
        console.log(`📡 Ports: Web=${this.ports.web}, Dashboard=${this.ports.dashboard}`);
        console.log('');

        try {
            // Start the production server
            await this.startProductionServer();
            
            // Wait for servers to be ready
            await this.waitForServers();
            
            // Open browser
            await this.openBrowser();
            
            console.log('');
            console.log('✅ Production deployment simulation started successfully!');
            console.log(`🌐 Web Interface: http://localhost:${this.ports.web}`);
            console.log(`🎛️ Dashboard: http://localhost:${this.ports.web}/dashboard`);
            console.log(`🏥 Health Check: http://localhost:${this.ports.web}/api/health`);
            console.log('');
            console.log('🖖 This simulates how the application would run on:');
            console.log('   • Vercel (Serverless Functions)');
            console.log('   • Docker Containers');
            console.log('   • AWS Lambda');
            console.log('   • Google Cloud Functions');
            console.log('   • Azure Functions');
            console.log('');
            console.log('Press Ctrl+C to stop the production simulation.');

        } catch (error) {
            console.error('❌ Failed to start production deployment:', error.message);
            await this.cleanup();
            process.exit(1);
        }
    }

    async startProductionServer() {
        return new Promise((resolve, reject) => {
            console.log('🚀 Starting production server...');
            
            const serverPath = path.join(__dirname, 'src/production-server.js');
            const serverProcess = spawn('node', [serverPath], {
                env: {
                    ...process.env,
                    NODE_ENV: this.environment,
                    PORT: this.ports.web,
                    SERVER_TYPE: 'production'
                },
                stdio: 'inherit'
            });

            serverProcess.on('error', (error) => {
                console.error('❌ Failed to start production server:', error.message);
                reject(error);
            });

            serverProcess.on('exit', (code) => {
                if (code !== 0) {
                    console.error(`❌ Production server exited with code ${code}`);
                    reject(new Error(`Server exited with code ${code}`));
                }
            });

            // Give server time to start
            setTimeout(() => {
                this.processes.push(serverProcess);
                resolve();
            }, 2000);
        });
    }

    async waitForServers() {
        console.log('⏳ Waiting for servers to be ready...');
        
        const maxAttempts = 30;
        let attempts = 0;

        while (attempts < maxAttempts) {
            try {
                const response = await fetch(`http://localhost:${this.ports.web}/api/health`);
                if (response.ok) {
                    console.log('✅ Production server is ready!');
                    return;
                }
            } catch (error) {
                // Server not ready yet
            }

            attempts++;
            await new Promise(resolve => setTimeout(resolve, 1000));
        }

        throw new Error('Timeout waiting for servers to be ready');
    }

    async openBrowser() {
        try {
            console.log('🌐 Opening browser...');
            const { exec } = require('child_process');
            
            // Open main web interface
            exec(`open -a "Google Chrome" http://localhost:${this.ports.web}`, (error) => {
                if (error) {
                    console.log('⚠️ Could not open Chrome automatically. Please open manually:');
                    console.log(`   http://localhost:${this.ports.web}`);
                } else {
                    console.log('✅ Browser opened successfully');
                }
            });

            // Wait a moment then open dashboard
            setTimeout(() => {
                exec(`open -a "Google Chrome" http://localhost:${this.ports.web}/dashboard`, (error) => {
                    if (error) {
                        console.log('⚠️ Could not open dashboard automatically. Please open manually:');
                        console.log(`   http://localhost:${this.ports.web}/dashboard`);
                    }
                });
            }, 2000);

        } catch (error) {
            console.log('⚠️ Could not open browser automatically. Please open manually:');
            console.log(`   Web Interface: http://localhost:${this.ports.web}`);
            console.log(`   Dashboard: http://localhost:${this.ports.web}/dashboard`);
        }
    }

    async cleanup() {
        console.log('\n🛑 Shutting down production deployment...');
        
        for (const process of this.processes) {
            if (process && !process.killed) {
                process.kill('SIGTERM');
            }
        }

        console.log('✅ Production deployment stopped');
    }

    // Add fetch polyfill for Node.js
    async fetch(url) {
        const http = require('http');
        const https = require('https');
        const { URL } = require('url');
        
        return new Promise((resolve, reject) => {
            const parsedUrl = new URL(url);
            const client = parsedUrl.protocol === 'https:' ? https : http;
            
            const req = client.request(url, { method: 'GET' }, (res) => {
                let data = '';
                res.on('data', chunk => data += chunk);
                res.on('end', () => {
                    resolve({
                        ok: res.statusCode >= 200 && res.statusCode < 300,
                        status: res.statusCode,
                        json: () => Promise.resolve(JSON.parse(data))
                    });
                });
            });
            
            req.on('error', reject);
            req.end();
        });
    }
}

// Handle graceful shutdown
process.on('SIGINT', async () => {
    console.log('\nSIGINT received. Shutting down...');
    if (global.productionDeployment) {
        await global.productionDeployment.cleanup();
    }
    process.exit(0);
});

process.on('SIGTERM', async () => {
    console.log('\nSIGTERM received. Shutting down...');
    if (global.productionDeployment) {
        await global.productionDeployment.cleanup();
    }
    process.exit(0);
});

if (require.main === module) {
    const deployment = new ProductionDeployment();
    global.productionDeployment = deployment;
    
    deployment.start().catch(error => {
        console.error('❌ Production deployment failed:', error);
        process.exit(1);
    });
}

module.exports = ProductionDeployment;




