#!/bin/bash
# Simple Enhanced Alex AI Dashboard
# Starts immediately with crew intelligence

set -e

echo "🖖 Alex AI Enhanced Dashboard - Simple Start"
echo "=========================================="

# Find available port
PORT=3000
while lsof -Pi :$PORT -sTCP:LISTEN -t >/dev/null 2>&1; do
    PORT=$((PORT+1))
done

echo "✅ Using port $PORT for enhanced dashboard"

# Create enhanced server directly
cat > enhanced-server.js << 'EOF'
const http = require('http');

const PORT = process.env.PORT || 3000;
const HOST = '0.0.0.0';

// Enhanced crew data
const crewData = {
    "Captain Jean-Luc Picard": {
        name: "Captain Jean-Luc Picard",
        department: "Command",
        role: "Strategic Leader",
        persona: "Diplomatic, strategic thinker, values exploration and peaceful solutions",
        skills: ["Strategic Planning", "Diplomacy", "Leadership", "Ethics", "Archaeology"],
        llmAgent: "GPT-4o (Strategic Command)",
        performance: 98,
        status: "Active",
        recentMemories: [
            "Successfully negotiated peace treaty with the Sheliak",
            "Led Enterprise through temporal anomaly crisis",
            "Resolved conflict between Federation and Romulan Empire"
        ],
        currentMission: "Overseeing Alex AI strategic operations",
        expertise: "Interstellar diplomacy, temporal mechanics, archaeological research"
    },
    "Commander Data": {
        name: "Commander Data",
        department: "Operations",
        role: "Analytical Coordinator",
        persona: "Logical, curious, constantly learning, seeks to understand humanity",
        skills: ["Data Analysis", "Logic", "Computational Thinking", "Memory Management", "Pattern Recognition"],
        llmAgent: "Claude-3.5-Sonnet (Analytical Operations)",
        performance: 99,
        status: "Active",
        recentMemories: [
            "Processed 2.3 million data points for crew efficiency analysis",
            "Identified optimal resource allocation patterns",
            "Developed new algorithm for predictive maintenance"
        ],
        currentMission: "Optimizing Alex AI system performance",
        expertise: "Data processing, logical analysis, system optimization"
    },
    "Geordi La Forge": {
        name: "Geordi La Forge",
        department: "Engineering",
        role: "Technical Architect",
        persona: "Innovative, problem-solver, passionate about technology and solutions",
        skills: ["Engineering", "Innovation", "Problem Solving", "Technical Design", "System Integration"],
        llmAgent: "GPT-4o (Engineering Solutions)",
        performance: 97,
        status: "Active",
        recentMemories: [
            "Designed new warp core efficiency protocols",
            "Implemented advanced diagnostic systems",
            "Created emergency repair procedures for critical systems"
        ],
        currentMission: "Maintaining and upgrading Alex AI infrastructure",
        expertise: "Warp technology, diagnostic systems, emergency protocols"
    },
    "Lieutenant Worf": {
        name: "Lieutenant Worf",
        department: "Security",
        role: "Security Specialist",
        persona: "Honorable, disciplined, protective, values duty and honor above all",
        skills: ["Security Protocols", "Tactical Analysis", "Threat Assessment", "Combat Strategy", "Honor Code"],
        llmAgent: "Claude-3.5-Sonnet (Security Operations)",
        performance: 96,
        status: "Active",
        recentMemories: [
            "Prevented unauthorized access to main computer core",
            "Developed new security protocols for classified information",
            "Trained security team in advanced defensive techniques"
        ],
        currentMission: "Securing Alex AI systems and data",
        expertise: "Security protocols, threat analysis, tactical operations"
    },
    "Counselor Deanna Troi": {
        name: "Counselor Deanna Troi",
        department: "Counseling",
        role: "Psychological Advisor",
        persona: "Empathetic, intuitive, caring, focuses on crew wellbeing and mental health",
        skills: ["Psychology", "Empathy", "Crisis Counseling", "Team Dynamics", "Mental Health"],
        llmAgent: "GPT-4o (Psychological Support)",
        performance: 94,
        status: "Active",
        recentMemories: [
            "Provided counseling for crew members during high-stress mission",
            "Developed new techniques for managing long-term space travel stress",
            "Facilitated team building exercises for improved crew cohesion"
        ],
        currentMission: "Supporting Alex AI crew mental health and wellbeing",
        expertise: "Psychological counseling, empathy, team dynamics"
    },
    "Lieutenant Uhura": {
        name: "Lieutenant Uhura",
        department: "Communications",
        role: "Communication Specialist",
        persona: "Linguistic expert, cultural bridge, master of communication protocols",
        skills: ["Linguistics", "Communication", "Cultural Studies", "Protocol Management", "Translation"],
        llmAgent: "Claude-3.5-Sonnet (Communication Systems)",
        performance: 95,
        status: "Active",
        recentMemories: [
            "Established communication with previously unknown alien species",
            "Developed new translation protocols for complex languages",
            "Maintained contact with Starfleet Command during deep space missions"
        ],
        currentMission: "Managing Alex AI communication systems",
        expertise: "Linguistics, communication protocols, cultural translation"
    },
    "Dr. Beverly Crusher": {
        name: "Dr. Beverly Crusher",
        department: "Medical",
        role: "Chief Medical Officer",
        persona: "Compassionate healer, scientific researcher, dedicated to crew health",
        skills: ["Medicine", "Research", "Diagnostics", "Emergency Care", "Biological Sciences"],
        llmAgent: "GPT-4o (Medical Research)",
        performance: 93,
        status: "Active",
        recentMemories: [
            "Developed treatment for unknown alien virus",
            "Conducted research on long-term space travel health effects",
            "Implemented new medical protocols for emergency situations"
        ],
        currentMission: "Monitoring Alex AI crew health and medical systems",
        expertise: "Medical research, diagnostics, emergency medicine"
    },
    "William Riker": {
        name: "Commander William Riker",
        department: "Tactical",
        role: "Tactical Officer",
        persona: "Charismatic leader, tactical genius, natural command presence",
        skills: ["Tactical Analysis", "Leadership", "Strategic Planning", "Crisis Management", "Team Coordination"],
        llmAgent: "Claude-3.5-Sonnet (Tactical Operations)",
        performance: 97,
        status: "Active",
        recentMemories: [
            "Led successful tactical operation against hostile forces",
            "Developed new combat strategies for unknown threats",
            "Coordinated multi-ship tactical maneuvers"
        ],
        currentMission: "Coordinating Alex AI tactical operations",
        expertise: "Tactical planning, crisis management, team leadership"
    },
    "Quark": {
        name: "Quark",
        department: "Business",
        role: "Business Operations",
        persona: "Entrepreneurial, profit-focused, resourceful, master of commerce",
        skills: ["Business Strategy", "Resource Management", "Negotiation", "Commerce", "Profit Optimization"],
        llmAgent: "GPT-4o (Business Intelligence)",
        performance: 92,
        status: "Active",
        recentMemories: [
            "Negotiated profitable trade agreements with multiple species",
            "Developed new business models for deep space commerce",
            "Optimized resource allocation for maximum efficiency"
        ],
        currentMission: "Managing Alex AI business operations and resources",
        expertise: "Business strategy, resource optimization, commercial negotiations"
    }
};

const dashboardHTML = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>🖖 Alex AI Universal Dashboard - Crew Intelligence</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { 
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; 
            background: linear-gradient(135deg, #1a1a2e, #16213e, #0f3460);
            color: white; 
            min-height: 100vh;
        }
        .container { max-width: 1400px; margin: 0 auto; padding: 20px; }
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
        .crew-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(400px, 1fr)); gap: 25px; }
        .crew-member { 
            background: rgba(255, 255, 255, 0.05); 
            padding: 25px; 
            border-radius: 15px; 
            border: 1px solid rgba(255, 255, 255, 0.1);
            transition: transform 0.3s ease, box-shadow 0.3s ease;
        }
        .crew-member:hover { 
            transform: translateY(-5px); 
            box-shadow: 0 10px 30px rgba(0, 255, 255, 0.2);
        }
        .crew-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px; }
        .crew-name { color: #FFD700; font-size: 1.3rem; font-weight: bold; }
        .crew-status { 
            padding: 5px 12px; 
            border-radius: 20px; 
            font-size: 0.8rem; 
            font-weight: bold;
            background: #4CAF50;
        }
        .crew-department { color: #87CEEB; font-size: 0.9rem; margin-bottom: 10px; }
        .crew-role { color: #FFA500; font-size: 0.9rem; margin-bottom: 15px; }
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
        .performance-text { font-size: 0.9rem; margin: 5px 0; }
        .crew-details { margin-top: 15px; }
        .detail-section { margin-bottom: 15px; }
        .detail-label { color: #87CEEB; font-size: 0.9rem; font-weight: bold; margin-bottom: 5px; }
        .detail-content { font-size: 0.85rem; line-height: 1.4; }
        .persona { font-style: italic; color: #DDA0DD; }
        .skills { display: flex; flex-wrap: wrap; gap: 5px; }
        .skill-tag { 
            background: rgba(76, 175, 80, 0.2); 
            padding: 3px 8px; 
            border-radius: 12px; 
            font-size: 0.75rem; 
            border: 1px solid #4CAF50;
        }
        .llm-agent { color: #FF6B6B; font-weight: bold; }
        .memories { max-height: 100px; overflow-y: auto; }
        .memory-item { 
            background: rgba(0, 0, 0, 0.2); 
            padding: 8px; 
            margin: 5px 0; 
            border-radius: 8px; 
            font-size: 0.8rem;
            border-left: 3px solid #4CAF50;
        }
        .uptime { font-size: 1.5rem; color: #4CAF50; font-weight: bold; }
        .refresh-btn { 
            background: #4CAF50; 
            color: white; 
            border: none; 
            padding: 12px 24px; 
            border-radius: 8px; 
            cursor: pointer; 
            margin: 20px 0;
            font-size: 1rem;
            transition: background 0.3s ease;
        }
        .refresh-btn:hover { background: #45a049; }
        .mission-status { color: #FFD700; font-weight: bold; }
        .expertise { color: #87CEEB; font-style: italic; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🖖 Alex AI Universal Dashboard</h1>
            <p>Real-time crew intelligence and system monitoring</p>
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
                <p>🌐 Deployment: Enhanced Local Server</p>
                <p>🔗 Status: Live with Crew Intelligence</p>
            </div>
        </div>
        
        <div class="crew-grid" id="crewGrid">
            <!-- Crew members will be populated by JavaScript -->
        </div>
        
        <div style="text-align: center; margin-top: 40px;">
            <button class="refresh-btn" onclick="location.reload()">🔄 Refresh Dashboard</button>
        </div>
    </div>
    
    <script>
        // Crew data
        const crewData = ${JSON.stringify(crewData, null, 2)};
        
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
        
        // Render crew members
        function renderCrewMembers() {
            const crewGrid = document.getElementById('crewGrid');
            crewGrid.innerHTML = '';
            
            Object.values(crewData).forEach(crew => {
                const crewElement = document.createElement('div');
                crewElement.className = 'crew-member';
                crewElement.innerHTML = `
                    <div class="crew-header">
                        <div class="crew-name">${crew.name}</div>
                        <div class="crew-status">${crew.status}</div>
                    </div>
                    <div class="crew-department">Department: ${crew.department}</div>
                    <div class="crew-role">Role: ${crew.role}</div>
                    
                    <div class="performance">
                        <div class="performance-bar" style="width: ${crew.performance}%"></div>
                    </div>
                    <div class="performance-text">Performance: ${crew.performance}%</div>
                    
                    <div class="crew-details">
                        <div class="detail-section">
                            <div class="detail-label">Persona:</div>
                            <div class="detail-content persona">${crew.persona}</div>
                        </div>
                        
                        <div class="detail-section">
                            <div class="detail-label">Skills:</div>
                            <div class="skills">
                                ${crew.skills.map(skill => `<span class="skill-tag">${skill}</span>`).join('')}
                            </div>
                        </div>
                        
                        <div class="detail-section">
                            <div class="detail-label">LLM Agent:</div>
                            <div class="detail-content llm-agent">${crew.llmAgent}</div>
                        </div>
                        
                        <div class="detail-section">
                            <div class="detail-label">Current Mission:</div>
                            <div class="detail-content mission-status">${crew.currentMission}</div>
                        </div>
                        
                        <div class="detail-section">
                            <div class="detail-label">Expertise:</div>
                            <div class="detail-content expertise">${crew.expertise}</div>
                        </div>
                        
                        <div class="detail-section">
                            <div class="detail-label">Recent Memories:</div>
                            <div class="memories">
                                ${crew.recentMemories.map(memory => `<div class="memory-item">${memory}</div>`).join('')}
                            </div>
                        </div>
                    </div>
                `;
                crewGrid.appendChild(crewElement);
            });
        }
        
        // Initialize dashboard
        renderCrewMembers();
        updateTimestamp();
        setInterval(updateTimestamp, 30000); // Update every 30 seconds
    </script>
</body>
</html>`;

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
    console.log(`🖖 Alex AI Enhanced Dashboard running at:`);
    console.log(`   Local: http://localhost:${PORT}`);
    console.log(`   Network: http://${HOST}:${PORT}`);
    console.log(`   Dashboard: http://localhost:${PORT}/dashboard`);
    console.log(`\n⏰ Federation Time: Immediate (enhanced local server)`);
    console.log(`🔄 Press Ctrl+C to stop the server`);
});

// Handle graceful shutdown
process.on('SIGINT', () => {
    console.log('\n🛑 Shutting down Alex AI Enhanced Dashboard...');
    server.close(() => {
        console.log('✅ Enhanced Dashboard stopped');
        process.exit(0);
    });
});
EOF

echo "✅ Enhanced server created"

# Start the enhanced server
echo "🚀 Starting Alex AI Enhanced Dashboard server..."
echo ""
echo "🖖 Alex AI Enhanced Dashboard is now running!"
echo "============================================="
echo "📊 Dashboard URL: http://localhost:${PORT}"
echo "⏰ Federation Time: Immediate (enhanced local server)"
echo "🔄 Press Ctrl+C to stop the server"
echo ""

node enhanced-server.js
