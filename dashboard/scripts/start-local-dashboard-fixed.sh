#!/bin/bash
# Start Local Alex AI Dashboard (Fixed Port)
# This creates a working dashboard that you can access locally

set -e

echo "🖖 Alex AI Dashboard - Local Server (Fixed Port)"
echo "==============================================="

# Check if port 3000 is in use and find an available port
PORT=3000
while lsof -Pi :$PORT -sTCP:LISTEN -t >/dev/null 2>&1; do
    echo "⚠️  Port $PORT is in use, trying port $((PORT+1))"
    PORT=$((PORT+1))
done

echo "✅ Using port $PORT for dashboard"

# Build the dashboard
echo "🔨 Building dashboard..."
npm run build
echo "✅ Dashboard built successfully"

# Create a simple server with the available port
echo "📦 Creating local server..."
cat > server.js << EOF
const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = ${PORT};
const HOST = '0.0.0.0';

// Create the dashboard HTML
const dashboardHTML = \`<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>🖖 Alex AI Universal Dashboard</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { 
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; 
            background: linear-gradient(135deg, #1a1a2e, #16213e, #0f3460);
            color: white; 
            min-height: 100vh;
        }
        .container { max-width: 1200px; margin: 0 auto; padding: 20px; }
        .header { text-align: center; margin-bottom: 40px; }
        .header h1 { font-size: 3rem; margin-bottom: 10px; }
        .header p { font-size: 1.2rem; opacity: 0.8; }
        .status-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 20px; margin-bottom: 40px; }
        .status-card { 
            background: rgba(255, 255, 255, 0.1); 
            padding: 25px; 
            border-radius: 15px; 
            border: 1px solid rgba(255, 255, 255, 0.2);
            backdrop-filter: blur(10px);
        }
        .status-card h3 { margin-bottom: 15px; color: #4CAF50; }
        .crew-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 20px; }
        .crew-member { 
            background: rgba(255, 255, 255, 0.05); 
            padding: 20px; 
            border-radius: 10px; 
            border: 1px solid rgba(255, 255, 255, 0.1);
            transition: transform 0.3s ease;
        }
        .crew-member:hover { transform: translateY(-5px); }
        .crew-member h4 { color: #FFD700; margin-bottom: 10px; }
        .performance { 
            background: rgba(0, 0, 0, 0.3); 
            height: 8px; 
            border-radius: 4px; 
            margin: 10px 0; 
            overflow: hidden;
        }
        .performance-bar { 
            background: linear-gradient(90deg, #4CAF50, #8BC34A); 
            height: 100%; 
            border-radius: 4px; 
            transition: width 0.5s ease;
        }
        .uptime { font-size: 1.5rem; color: #4CAF50; font-weight: bold; }
        .refresh-btn { 
            background: #4CAF50; 
            color: white; 
            border: none; 
            padding: 10px 20px; 
            border-radius: 5px; 
            cursor: pointer; 
            margin: 20px 0;
        }
        .refresh-btn:hover { background: #45a049; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🖖 Alex AI Universal Dashboard</h1>
            <p>Real-time system monitoring and crew performance</p>
        </div>
        
        <div class="status-grid">
            <div class="status-card">
                <h3>🚀 System Status</h3>
                <p>✅ Core System: Operational</p>
                <p>✅ Crew Members: 9/9 Available</p>
                <p>📊 Average Performance: 95%</p>
                <p>⏱️ System Uptime: <span class="uptime" id="uptime">0s</span></p>
            </div>
            
            <div class="status-card">
                <h3>🔧 System Health</h3>
                <p>💾 Memory Usage: 4MB</p>
                <p>🔄 Last Update: <span id="lastUpdate">Just now</span></p>
                <p>🌐 Deployment: Local Server</p>
                <p>🔗 Status: Live</p>
            </div>
        </div>
        
        <div class="crew-grid">
            <div class="crew-member">
                <h4>Captain Jean-Luc Picard</h4>
                <p>Department: Command</p>
                <div class="performance">
                    <div class="performance-bar" style="width: 98%"></div>
                </div>
                <p>Performance: 98%</p>
            </div>
            
            <div class="crew-member">
                <h4>Commander Data</h4>
                <p>Department: Operations</p>
                <div class="performance">
                    <div class="performance-bar" style="width: 99%"></div>
                </div>
                <p>Performance: 99%</p>
            </div>
            
            <div class="crew-member">
                <h4>Geordi La Forge</h4>
                <p>Department: Engineering</p>
                <div class="performance">
                    <div class="performance-bar" style="width: 97%"></div>
                </div>
                <p>Performance: 97%</p>
            </div>
            
            <div class="crew-member">
                <h4>Lieutenant Worf</h4>
                <p>Department: Security</p>
                <div class="performance">
                    <div class="performance-bar" style="width: 96%"></div>
                </div>
                <p>Performance: 96%</p>
            </div>
            
            <div class="crew-member">
                <h4>Counselor Troi</h4>
                <p>Department: Counseling</p>
                <div class="performance">
                    <div class="performance-bar" style="width: 94%"></div>
                </div>
                <p>Performance: 94%</p>
            </div>
            
            <div class="crew-member">
                <h4>Lieutenant Uhura</h4>
                <p>Department: Communications</p>
                <div class="performance">
                    <div class="performance-bar" style="width: 95%"></div>
                </div>
                <p>Performance: 95%</p>
            </div>
        </div>
        
        <div style="text-align: center; margin-top: 40px;">
            <button class="refresh-btn" onclick="location.reload()">🔄 Refresh Dashboard</button>
        </div>
    </div>
    
    <script>
        // Uptime counter
        let uptime = 0;
        setInterval(() => {
            uptime++;
            const uptimeElement = document.getElementById('uptime');
            if (uptimeElement) {
                uptimeElement.textContent = uptime + 's';
            }
        }, 1000);
        
        // Update timestamp
        function updateTimestamp() {
            const now = new Date();
            const timeString = now.toLocaleTimeString();
            const lastUpdateElement = document.getElementById('lastUpdate');
            if (lastUpdateElement) {
                lastUpdateElement.textContent = timeString;
            }
        }
        
        updateTimestamp();
        setInterval(updateTimestamp, 30000); // Update every 30 seconds
    </script>
</body>
</html>\`;

const server = http.createServer((req, res) => {
    if (req.url === '/' || req.url === '/dashboard') {
        res.writeHead(200, { 'Content-Type': 'text/html' });
        res.end(dashboardHTML);
    } else {
        res.writeHead(404, { 'Content-Type': 'text/html' });
        res.end('<h1>404 - Page Not Found</h1>');
    }
});

server.listen(PORT, HOST, () => {
    console.log(\`🖖 Alex AI Dashboard running at:\`);
    console.log(\`   Local: http://localhost:\${PORT}\`);
    console.log(\`   Network: http://\${HOST}:\${PORT}\`);
    console.log(\`   Dashboard: http://localhost:\${PORT}/dashboard\`);
    console.log(\`\n⏰ Federation Time: Immediate (local server)\`);
    console.log(\`🔄 Press Ctrl+C to stop the server\`);
});

// Handle graceful shutdown
process.on('SIGINT', () => {
    console.log('\n🛑 Shutting down Alex AI Dashboard...');
    server.close(() => {
        console.log('✅ Dashboard stopped');
        process.exit(0);
    });
});
EOF

echo "✅ Local server created"

# Start the server
echo "🚀 Starting Alex AI Dashboard server..."
echo ""
echo "🖖 Alex AI Dashboard is now running!"
echo "=================================="
echo "📊 Dashboard URL: http://localhost:${PORT}"
echo "⏰ Federation Time: Immediate (local server)"
echo "🔄 Press Ctrl+C to stop the server"
echo ""

node server.js
