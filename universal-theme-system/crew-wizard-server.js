/**
 * Crew-Guided Project Creation Wizard
 * Port 3030 - Full crew interaction for new project setup
 */

const http = require('http');
const path = require('path');
const projectRoot = path.join(__dirname, '../examples/demo-project');
const { Server: SocketIO } = require(path.join(projectRoot, 'node_modules/socket.io'));
const { THEME_DEFINITIONS } = require('./theme-definitions');
const { THEME_SHOWCASE_CONTENT } = require('./theme-showcase-content');

class CrewWizardServer {
  constructor(port = 3030) {
    this.port = port;
    this.server = null;
    this.io = null;
    
    // Crew assignments by vibe
    this.crewByVibe = {
      gradient: ['troi', 'data', 'worf', 'quark'],
      pastel: ['crusher', 'laforge', 'worf', 'troi'],
      cyberpunk: ['data', 'laforge', 'uhura', 'quark'],
      glassmorphism: ['troi', 'data', 'uhura', 'quark'],
      neumorphism: ['troi', 'crusher', 'data'],
      neubrutalism: ['riker', 'data', 'quark'],
      material: ['data', 'laforge', 'picard'],
      midnight: ['data', 'laforge', 'worf'],
      corporate: ['picard', 'data', 'worf', 'quark'],
      organic: ['crusher', 'troi', 'quark']
    };

    // Crew introductions
    this.crewIntros = {
      picard: "🖖 Captain Jean-Luc Picard here. I'll provide strategic oversight and ensure your project aligns with your long-term vision.",
      troi: "💭 Counselor Deanna Troi. I'll make sure your users FEEL the right emotions and have a delightful experience.",
      data: "🤖 Commander Data. I'll handle all technical architecture and ensure optimal system performance.",
      laforge: "🔧 Geordi La Forge. I'll build rock-solid infrastructure that scales with your growth.",
      worf: "🛡️ Lieutenant Worf. I'll protect your users' data with honor and implement security best practices.",
      crusher: "🏥 Dr. Beverly Crusher. For healthcare projects, I'll ensure medical accuracy and patient safety.",
      quark: "💰 Quark. I'll optimize your business model for maximum profitability. The 47th Rule: Never trust a man wearing a better suit!",
      uhura: "📡 Lieutenant Uhura. I'll handle all communications, APIs, and integrations seamlessly.",
      riker: "👤 Commander Riker. I'll make it happen - execution is my specialty."
    };
  }

  start() {
    return new Promise((resolve) => {
      this.server = http.createServer((req, res) => {
        this.handleRequest(req, res);
      });

      this.io = new SocketIO(this.server, {
        cors: { origin: '*' },
        path: '/socket.io/'
      });

      this.io.on('connection', (socket) => {
        console.log('🎭 Wizard client connected');
        
        socket.on('start-wizard', (data) => {
          const crew = this.crewByVibe[data.vibeId] || ['picard', 'data'];
          socket.emit('crew-assigned', {
            crew,
            intros: crew.map(c => ({ id: c, intro: this.crewIntros[c] }))
          });
        });

        socket.on('submit-answers', async (data) => {
          const projectPlan = await this.generateProjectPlan(data);
          socket.emit('project-plan-ready', projectPlan);
        });

        socket.on('create-project', async (data) => {
          const project = await this.createProject(data);
          socket.emit('project-created', project);
        });
      });

      this.server.listen(this.port, () => {
        console.log(`🎭 Crew Wizard running on http://localhost:${this.port}`);
        resolve();
      });
    });
  }

  async generateProjectPlan(data) {
    // Simulate crew analysis
    const vibe = data.vibeId;
    const content = THEME_SHOWCASE_CONTENT[vibe];
    
    return {
      projectName: data.answers.projectName || 'New Project',
      vibe: vibe,
      timeline: content.pricePoint.includes('month') ? '3-4 weeks' : '4-6 weeks',
      budget: this.estimateBudget(data.answers),
      features: this.recommendFeatures(vibe, data.answers),
      crewInsights: await this.getCrewInsights(vibe, data.answers)
    };
  }

  estimateBudget(answers) {
    const baseByComplexity = {
      'simple': 5000,
      'standard': 10000,
      'advanced': 20000,
      'enterprise': 50000
    };
    return baseByComplexity[answers.complexity || 'standard'];
  }

  recommendFeatures(vibe, answers) {
    const featuresByVibe = {
      gradient: ['Product gallery', 'Shopping cart', 'Wishlist', 'Social sharing', 'Reviews'],
      pastel: ['Appointment booking', 'Patient portal', 'Secure messaging', 'Records access'],
      cyberpunk: ['Dashboard builder', 'API access', 'Real-time charts', 'Data export', 'Webhooks']
    };
    return featuresByVibe[vibe] || ['Custom homepage', 'Contact form', 'About page'];
  }

  async getCrewInsights(vibe, answers) {
    const crew = this.crewByVibe[vibe];
    return crew.map(c => ({
      crewMember: c,
      insight: this.generateInsight(c, vibe, answers)
    }));
  }

  generateInsight(crewMember, vibe, answers) {
    const insights = {
      troi: `Based on the ${vibe} vibe, your users will feel ${vibe === 'gradient' ? 'excited and inspired' : vibe === 'pastel' ? 'calm and trusting' : 'powerful and technical'}. I recommend focusing on emotional connection.`,
      data: `Analyzing requirements... Optimal tech stack for ${vibe}: ${vibe === 'gradient' ? 'React + Node.js' : vibe === 'pastel' ? 'Next.js + Supabase' : 'React + FastAPI'}. Estimated performance: 99.2% uptime.`,
      worf: `Security assessment complete. For ${vibe} projects, I recommend ${vibe === 'gradient' ? 'PCI-compliant payment processing' : vibe === 'pastel' ? 'HIPAA compliance measures' : 'API rate limiting and authentication'}.`,
      quark: `Business analysis: ${vibe} vibe targets customers willing to pay ${vibe === 'gradient' ? '$50-150' : vibe === 'pastel' ? '$100-500' : 'freemium → $299/mo'}. Expected ROI: 12-18 months.`
    };
    return insights[crewMember] || 'Standing by to assist with your project.';
  }

  async createProject(data) {
    // In production, this would actually create the project
    const newPort = 3004 + Math.floor(Math.random() * 100);
    return {
      id: `proj_${Date.now()}`,
      name: data.projectName,
      port: newPort,
      vibe: data.vibeId,
      status: 'created',
      url: `http://localhost:${newPort}`
    };
  }

  handleRequest(req, res) {
    if (req.url === '/') {
      this.serveWizard(res);
    } else {
      res.writeHead(404);
      res.end('Not found');
    }
  }

  serveWizard(res) {
    const html = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>🎭 Crew-Guided Project Wizard</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
            background: linear-gradient(135deg, #0c1445 0%, #1a237e 100%);
            color: white;
            min-height: 100vh;
            padding: 40px 20px;
        }
        .container { max-width: 1000px; margin: 0 auto; }
        .wizard-card {
            background: rgba(255, 255, 255, 0.05);
            backdrop-filter: blur(10px);
            border-radius: 24px;
            padding: 50px;
            border: 1px solid rgba(255, 255, 255, 0.1);
        }
        .step { display: none; }
        .step.active { display: block; }
        .step-header {
            text-align: center;
            margin-bottom: 40px;
        }
        .step-header h2 {
            font-size: 36px;
            margin-bottom: 15px;
        }
        .crew-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
            gap: 20px;
            margin: 40px 0;
        }
        .crew-card {
            background: rgba(0, 255, 136, 0.1);
            padding: 25px;
            border-radius: 12px;
            border: 1px solid rgba(0, 255, 136, 0.3);
            text-align: center;
        }
        .crew-avatar { font-size: 48px; margin-bottom: 12px; }
        .crew-name { font-size: 16px; font-weight: 600; margin-bottom: 8px; color: #00ff88; }
        .crew-intro { font-size: 13px; opacity: 0.9; line-height: 1.5; }
        .form-group {
            margin-bottom: 30px;
        }
        .form-group label {
            display: block;
            font-size: 16px;
            margin-bottom: 10px;
            color: #00ff88;
        }
        .form-input {
            width: 100%;
            padding: 15px;
            background: rgba(0, 0, 0, 0.3);
            border: 1px solid rgba(0, 255, 136, 0.3);
            border-radius: 8px;
            color: white;
            font-size: 16px;
        }
        .btn {
            padding: 16px 32px;
            border: none;
            border-radius: 10px;
            font-size: 16px;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.3s;
        }
        .btn-primary {
            background: #00ff88;
            color: #0c1445;
        }
        .btn-secondary {
            background: rgba(255, 255, 255, 0.1);
            color: white;
            border: 1px solid rgba(255, 255, 255, 0.3);
        }
        .btn:hover {
            transform: translateY(-2px);
            opacity: 0.9;
        }
        .project-plan {
            background: rgba(0, 0, 0, 0.3);
            padding: 30px;
            border-radius: 12px;
            margin: 30px 0;
        }
        .plan-item {
            padding: 15px 0;
            border-bottom: 1px solid rgba(255, 255, 255, 0.1);
        }
        .plan-label {
            font-size: 14px;
            opacity: 0.7;
            margin-bottom: 5px;
        }
        .plan-value {
            font-size: 20px;
            font-weight: 600;
            color: #00ff88;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="wizard-card">
            <!-- Step 1: Vibe Confirmation -->
            <div class="step active" id="step-vibe">
                <div class="step-header">
                    <h2>🎨 Your Selected Vibe</h2>
                    <p id="vibeDescription">Loading...</p>
                </div>
                <div style="text-align: center;">
                    <button class="btn btn-primary" onclick="meetCrew()">Meet Your Crew →</button>
                </div>
            </div>

            <!-- Step 2: Crew Introduction -->
            <div class="step" id="step-crew">
                <div class="step-header">
                    <h2>👥 Meet Your AI Crew</h2>
                    <p>These specialists will guide your project to success</p>
                </div>
                <div class="crew-grid" id="crewGrid"></div>
                <div style="text-align: center; margin-top: 40px;">
                    <button class="btn btn-primary" onclick="startQuestions()">Begin Project Setup →</button>
                </div>
            </div>

            <!-- Step 3: Project Questions -->
            <div class="step" id="step-questions">
                <div class="step-header">
                    <h2>📋 Project Details</h2>
                    <p>Help us understand your vision</p>
                </div>
                <div class="form-group">
                    <label>Project Name</label>
                    <input type="text" class="form-input" id="projectName" placeholder="e.g., Urban Threads">
                </div>
                <div class="form-group">
                    <label>What problem does your product solve?</label>
                    <input type="text" class="form-input" id="problem" placeholder="e.g., Hard to find unique streetwear online">
                </div>
                <div class="form-group">
                    <label>Who is your ideal customer?</label>
                    <input type="text" class="form-input" id="customer" placeholder="e.g., Fashion-forward millennials">
                </div>
                <div class="form-group">
                    <label>How will you make money?</label>
                    <select class="form-input" id="revenue">
                        <option value="products">Sell products</option>
                        <option value="services">Sell services</option>
                        <option value="subscription">Subscriptions</option>
                        <option value="freemium">Freemium model</option>
                    </select>
                </div>
                <div style="text-align: center; margin-top: 40px;">
                    <button class="btn btn-primary" onclick="generatePlan()">Generate Project Plan →</button>
                </div>
            </div>

            <!-- Step 4: Project Plan Review -->
            <div class="step" id="step-plan">
                <div class="step-header">
                    <h2>🖖 Captain Picard Presents Your Plan</h2>
                    <p>Based on crew analysis</p>
                </div>
                <div class="project-plan" id="projectPlan"></div>
                <div style="text-align: center; margin-top: 40px; display: flex; gap: 15px; justify-content: center;">
                    <button class="btn btn-secondary" onclick="location.reload()">Start Over</button>
                    <button class="btn btn-primary" onclick="createProject()">Create My Project! 🚀</button>
                </div>
            </div>

            <!-- Step 5: Success -->
            <div class="step" id="step-success">
                <div class="step-header">
                    <h2>🎉 Project Created Successfully!</h2>
                    <p id="successMessage"></p>
                </div>
                <div style="text-align: center; margin-top: 40px; display: flex; gap: 15px; justify-content: center;">
                    <button class="btn btn-primary" onclick="viewProject()">View Live Site →</button>
                    <button class="btn btn-secondary" onclick="window.location.href='http://localhost:3001'">Open Dashboard</button>
                </div>
            </div>
        </div>
    </div>

    <script src="/socket.io/socket.io.js"></script>
    <script>
        const socket = io();
        let selectedVibe = localStorage.getItem('selectedVibe') || 'gradient';
        let quizAnswers = JSON.parse(localStorage.getItem('quizAnswers') || '{}');
        let assignedCrew = [];
        let projectData = {};

        // Initialize
        document.addEventListener('DOMContentLoaded', () => {
            loadVibe();
        });

        function loadVibe() {
            fetch('http://localhost:3001/api/themes')
                .then(r => r.json())
                .then(themes => {
                    const theme = themes.find(t => t.id === selectedVibe);
                    if (theme) {
                        document.getElementById('vibeDescription').innerHTML = 
                            \`<div style="font-size: 64px; margin: 20px 0;">\${theme.icon}</div>
                            <div style="font-size: 32px; font-weight: 600; margin-bottom: 10px;">\${theme.name}</div>
                            <div style="font-size: 18px; opacity: 0.9;">\${theme.description}</div>\`;
                    }
                });
            socket.emit('start-wizard', { vibeId: selectedVibe });
        }

        socket.on('crew-assigned', (data) => {
            assignedCrew = data.crew;
            const crewHTML = data.intros.map(crew => {
                const icons = {troi: '💭', data: '🤖', worf: '🛡️', quark: '💰', picard: '🖖', 
                              laforge: '🔧', crusher: '🏥', uhura: '📡', riker: '👤'};
                const names = {troi: 'Counselor Troi', data: 'Commander Data', worf: 'Lt. Worf', 
                              quark: 'Quark', picard: 'Captain Picard', laforge: 'Geordi La Forge',
                              crusher: 'Dr. Crusher', uhura: 'Lt. Uhura', riker: 'Cmdr. Riker'};
                return \`
                    <div class="crew-card">
                        <div class="crew-avatar">\${icons[crew.id]}</div>
                        <div class="crew-name">\${names[crew.id]}</div>
                        <div class="crew-intro">\${crew.intro}</div>
                    </div>
                \`;
            }).join('');
            document.getElementById('crewGrid').innerHTML = crewHTML;
        });

        function meetCrew() {
            showStep('step-crew');
        }

        function startQuestions() {
            showStep('step-questions');
        }

        function generatePlan() {
            const answers = {
                projectName: document.getElementById('projectName').value,
                problem: document.getElementById('problem').value,
                customer: document.getElementById('customer').value,
                revenue: document.getElementById('revenue').value
            };
            
            socket.emit('submit-answers', { vibeId: selectedVibe, answers });
        }

        socket.on('project-plan-ready', (plan) => {
            projectData = plan;
            const planHTML = \`
                <div class="plan-item">
                    <div class="plan-label">Project Name</div>
                    <div class="plan-value">\${plan.projectName}</div>
                </div>
                <div class="plan-item">
                    <div class="plan-label">Timeline</div>
                    <div class="plan-value">\${plan.timeline}</div>
                </div>
                <div class="plan-item">
                    <div class="plan-label">Estimated Budget</div>
                    <div class="plan-value">$\${(plan.budget / 1000).toFixed(0)}K</div>
                </div>
                <div class="plan-item">
                    <div class="plan-label">Recommended Features</div>
                    <div class="plan-value" style="font-size: 16px;">\${plan.features.join(', ')}</div>
                </div>
                <div class="plan-item">
                    <div class="plan-label">Crew Insights</div>
                    <div style="margin-top: 15px;">
                        \${plan.crewInsights.map(i => \`
                            <div style="margin-bottom: 12px; padding: 12px; background: rgba(0, 255, 136, 0.1); border-radius: 8px; font-size: 14px;">
                                <strong>\${i.crewMember}:</strong> \${i.insight}
                            </div>
                        \`).join('')}
                    </div>
                </div>
            \`;
            document.getElementById('projectPlan').innerHTML = planHTML;
            showStep('step-plan');
        });

        function createProject() {
            socket.emit('create-project', { 
                vibeId: selectedVibe, 
                projectName: projectData.projectName,
                plan: projectData
            });
        }

        socket.on('project-created', (project) => {
            projectData.project = project;
            document.getElementById('successMessage').innerHTML = \`
                <div style="font-size: 24px; margin: 30px 0;">
                    Your project "<strong>\${project.name}</strong>" is now live!
                </div>
                <div style="font-size: 18px; opacity: 0.9;">
                    🌐 URL: <span style="color: #00ff88;">\${project.url}</span>
                </div>
                <div style="font-size: 16px; opacity: 0.8; margin-top: 20px;">
                    Your assigned crew is ready to help you succeed!
                </div>
            \`;
            showStep('step-success');
        });

        function viewProject() {
            if (projectData.project) {
                window.open(projectData.project.url, '_blank');
            }
        }

        function showStep(stepId) {
            document.querySelectorAll('.step').forEach(s => s.classList.remove('active'));
            document.getElementById(stepId).classList.add('active');
        }
    </script>
</body>
</html>`;

    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.end(html);
  }
}

module.exports = CrewWizardServer;

if (require.main === module) {
  const projectRoot = require('path').join(__dirname, '../examples/demo-project');
  const { Server: SocketIO } = require(require('path').join(projectRoot, 'node_modules/socket.io'));
  
  const wizard = new CrewWizardServer();
  wizard.start().then(() => {
    console.log('🎭 Crew-Guided Wizard operational!');
    console.log('🖖 Start here: http://localhost:3030');
  });
}

