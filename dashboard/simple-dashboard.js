#!/usr/bin/env node
const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 3000;
const HOST = '0.0.0.0';

// Enhanced Crew Data with all the features you requested
const crewData = {
    "picard": {
        "name": "Captain Jean-Luc Picard",
        "department": "Command",
        "role": "Captain",
        "status": "Operational",
        "performance": 98,
        "persona": "A highly ethical and diplomatic leader, valuing justice, exploration, and intellectual pursuits. Known for his calm demeanor and strategic thinking.",
        "skills": ["Strategic Leadership", "Diplomacy", "Tactical Command", "Archaeology", "Negotiation"],
        "llmAgent": "GPT-4o",
        "recentMemories": [
            "Reviewed Starfleet regulations on first contact protocols.",
            "Engaged in a philosophical debate with Data about consciousness.",
            "Analyzed recent sensor data from the Argus Array."
        ],
        "currentMission": "Overseeing deep space exploration in the Gamma Quadrant.",
        "expertise": "Strategic Leadership, Mission Planning, Decision Making"
    },
    "riker": {
        "name": "Commander William Riker",
        "department": "Tactical",
        "role": "First Officer",
        "status": "Operational",
        "performance": 92,
        "persona": "A confident and resourceful officer, known for his daring tactics and loyalty. Possesses a strong sense of humor and enjoys jazz.",
        "skills": ["Tactical Command", "Piloting", "Hand-to-Hand Combat", "Diplomacy", "Jazz Trombone"],
        "llmAgent": "Claude-3.5-Sonnet",
        "recentMemories": [
            "Led an away team on a hazardous planetary survey.",
            "Practiced advanced starship maneuvers in the holodeck.",
            "Assisted Geordi with a warp core diagnostic."
        ],
        "currentMission": "Leading tactical operations and away team deployments.",
        "expertise": "Tactical Operations, Leadership, Close Quarters Combat"
    },
    "data": {
        "name": "Commander Data",
        "department": "Operations",
        "role": "Second Officer, Operations Officer",
        "status": "Operational",
        "performance": 99,
        "persona": "An android striving for humanity, characterized by his immense knowledge, logical reasoning, and literal interpretation of events. Constantly learning about human emotions.",
        "skills": ["Advanced Computation", "Data Analysis", "Robotics", "Linguistics", "Artistic Expression"],
        "llmAgent": "GPT-4o",
        "recentMemories": [
            "Compiled a comprehensive report on Borg assimilation patterns.",
            "Attempted to understand a new human idiom from Dr. Crusher.",
            "Performed a violin concerto in the observation lounge."
        ],
        "currentMission": "Analyzing anomalous energy readings from Sector 001.",
        "expertise": "Artificial Intelligence, Logic, Scientific Analysis"
    },
    "geordi": {
        "name": "Lieutenant Commander Geordi La Forge",
        "department": "Engineering",
        "role": "Chief Engineer",
        "status": "Operational",
        "performance": 95,
        "persona": "A brilliant and innovative engineer, always eager to solve complex technical problems. Sees the world through his VISOR, giving him unique perspectives.",
        "skills": ["Warp Core Mechanics", "System Diagnostics", "Invention", "Problem Solving", "Starship Design"],
        "llmAgent": "Claude-3.5-Sonnet",
        "recentMemories": [
            "Successfully recalibrated the main deflector array.",
            "Collaborated with Data on a new propulsion theory.",
            "Troubleshot a recurring plasma conduit fluctuation."
        ],
        "currentMission": "Optimizing warp drive efficiency for extended missions.",
        "expertise": "Engineering, Diagnostics, Innovation"
    },
    "worf": {
        "name": "Lieutenant Worf",
        "department": "Security",
        "role": "Chief of Security, Tactical Officer",
        "status": "Operational",
        "performance": 90,
        "persona": "A proud Klingon warrior with a strong sense of honor and duty. Often struggles with Starfleet regulations conflicting with Klingon traditions.",
        "skills": ["Security Protocols", "Combat Tactics", "Mek'leth Proficiency", "Martial Arts", "Strategic Defense"],
        "llmAgent": "GPT-4o",
        "recentMemories": [
            "Led a security drill simulating a Borg incursion.",
            "Mediated a dispute between two junior officers.",
            "Studied ancient Klingon battle strategies."
        ],
        "currentMission": "Enhancing ship-wide security systems and crew training.",
        "expertise": "Security, Tactical Defense, Klingon Culture"
    },
    "troi": {
        "name": "Counselor Deanna Troi",
        "department": "Counseling",
        "role": "Ship's Counselor",
        "status": "Operational",
        "performance": 93,
        "persona": "A half-Betazoid empath, providing psychological support and advice to the crew. Her empathic abilities are invaluable in diplomatic situations.",
        "skills": ["Empathy", "Psychological Analysis", "Counseling", "Interpersonal Communication", "Diplomacy"],
        "llmAgent": "Claude-3.5-Sonnet",
        "recentMemories": [
            "Conducted a counseling session with a stressed crew member.",
            "Sensed strong emotions from an alien delegation.",
            "Advised Captain Picard on a sensitive diplomatic matter."
        ],
        "currentMission": "Monitoring crew morale and providing psychological support.",
        "expertise": "Psychology, Empathy, Interpersonal Relations"
    },
    "uhura": {
        "name": "Lieutenant Uhura",
        "department": "Communications",
        "role": "Chief Communications Officer",
        "status": "Operational",
        "performance": 96,
        "persona": "A brilliant and resourceful communications officer, fluent in numerous alien languages. Known for her calm under pressure and exceptional linguistic skills.",
        "skills": ["Linguistics", "Communication Systems", "Cryptography", "First Contact Protocols", "Cultural Diplomacy"],
        "llmAgent": "GPT-4o",
        "recentMemories": [
            "Deciphered a complex alien distress signal.",
            "Established a stable subspace link with Starfleet Command.",
            "Translated an ancient text found on a newly discovered planet."
        ],
        "currentMission": "Maintaining ship-wide communications and external diplomatic channels.",
        "expertise": "Communications, Linguistics, Cultural Understanding"
    },
    "crusher": {
        "name": "Dr. Beverly Crusher",
        "department": "Medical",
        "role": "Chief Medical Officer",
        "status": "Operational",
        "performance": 94,
        "persona": "A compassionate and highly skilled physician, dedicated to the well-being of the crew. Also a talented dancer and choreographer.",
        "skills": ["Medicine", "Surgery", "Xenobiology", "Research", "Emergency Response"],
        "llmAgent": "Claude-3.5-Sonnet",
        "recentMemories": [
            "Treated a rare alien virus affecting the crew.",
            "Conducted a medical research project on cellular regeneration.",
            "Organized a dance workshop in the holodeck."
        ],
        "currentMission": "Overseeing crew health and medical research.",
        "expertise": "Medicine, Biology, Patient Care"
    },
    "quark": {
        "name": "Quark",
        "department": "Business",
        "role": "Entrepreneur",
        "status": "Operational",
        "performance": 88,
        "persona": "A cunning and opportunistic Ferengi, always looking for a profit, but with a surprising moral compass. Operates a popular bar on Deep Space Nine.",
        "skills": ["Negotiation", "Trade", "Resource Management", "Customer Service", "Financial Acumen"],
        "llmAgent": "GPT-4o",
        "recentMemories": [
            "Successfully negotiated a new trade agreement with a visiting delegation.",
            "Identified a new market for replicated goods.",
            "Attempted to outsmart a rival Ferengi businessman."
        ],
        "currentMission": "Optimizing resource allocation and identifying new opportunities.",
        "expertise": "Business Strategy, Economics, Resource Optimization"
    }
};

const dashboardHTML = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>🖖 Alex AI Universal Dashboard</title>
    <style>
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background: linear-gradient(135deg, #1a1a2e, #1f4068);
            color: #e0e0e0;
            margin: 0;
            padding: 0;
            line-height: 1.6;
            display: flex;
            justify-content: center;
            align-items: flex-start;
            min-height: 100vh;
            padding: 20px;
            box-sizing: border-box;
        }
        .container {
            background: rgba(0, 0, 0, 0.5);
            border-radius: 20px;
            padding: 40px;
            max-width: 1200px;
            width: 100%;
            box-shadow: 0 0 50px rgba(0, 255, 255, 0.3);
            border: 1px solid rgba(0, 255, 255, 0.5);
            backdrop-filter: blur(15px);
        }
        .header { text-align: center; margin-bottom: 50px; }
        .header h1 { font-size: 3rem; color: #00bcd4; text-shadow: 0 0 15px rgba(0, 255, 255, 0.7); margin-bottom: 10px; }
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
                crewElement.innerHTML = \`
                    <div class="crew-header">
                        <div class="crew-name">\${crew.name}</div>
                        <div class="crew-status">\${crew.status}</div>
                    </div>
                    <div class="crew-department">Department: \${crew.department}</div>
                    <div class="crew-role">Role: \${crew.role}</div>
                    
                    <div class="performance">
                        <div class="performance-bar" style="width: \${crew.performance}%"></div>
                    </div>
                    <div class="performance-text">Performance: \${crew.performance}%</div>
                    
                    <div class="crew-details">
                        <div class="detail-section">
                            <div class="detail-label">Persona:</div>
                            <div class="detail-content persona">\${crew.persona}</div>
                        </div>
                        
                        <div class="detail-section">
                            <div class="detail-label">Skills:</div>
                            <div class="skills">
                                \${crew.skills.map(skill => \`<span class="skill-tag">\${skill}</span>\`).join('')}
                            </div>
                        </div>
                        
                        <div class="detail-section">
                            <div class="detail-label">LLM Agent:</div>
                            <div class="detail-content llm-agent">\${crew.llmAgent}</div>
                        </div>
                        
                        <div class="detail-section">
                            <div class="detail-label">Current Mission:</div>
                            <div class="detail-content mission-status">\${crew.currentMission}</div>
                        </div>
                        
                        <div class="detail-section">
                            <div class="detail-label">Expertise:</div>
                            <div class="detail-content expertise">\${crew.expertise}</div>
                        </div>
                        
                        <div class="detail-section">
                            <div class="detail-label">Recent Memories:</div>
                            <div class="memories">
                                \${crew.recentMemories.map(memory => \`<div class="memory-item">\${memory}</div>\`).join('')}
                            </div>
                        </div>
                    </div>
                \`;
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
    console.log('🖖 Alex AI Enhanced Dashboard running at:');
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
