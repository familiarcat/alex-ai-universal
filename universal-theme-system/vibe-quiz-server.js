/**
 * Find Your Vibe Quiz Server
 * AI-powered theme recommendation based on business personality
 * Port 3020
 */

const http = require('http');
const { THEME_DEFINITIONS } = require('./theme-definitions');

class VibeQuizServer {
  constructor(port = 3020) {
    this.port = port;
    this.server = null;
    
    // Quiz questions designed by Counselor Troi (psychology) and Quark (business)
    this.questions = [
      {
        id: 'brand_personality',
        question: '🎭 If your brand was a person at a party, they would be:',
        crew: 'Counselor Troi',
        options: [
          { text: 'The exciting storyteller everyone gathers around', vibes: ['gradient', 'neubrutalism'], score: 10 },
          { text: 'The calm, trusted advisor people confide in', vibes: ['pastel', 'organic'], score: 10 },
          { text: 'The tech genius showing off cool gadgets', vibes: ['cyberpunk', 'midnight'], score: 10 },
          { text: 'The polished professional with perfect credentials', vibes: ['corporate', 'material'], score: 10 },
          { text: 'The artistic creative with unique style', vibes: ['glassmorphism', 'neumorphism'], score: 10 }
        ]
      },
      {
        id: 'customer_decision',
        question: '💭 Your customers make buying decisions based on:',
        crew: 'Quark',
        options: [
          { text: 'Emotion and inspiration - "I love this!"', vibes: ['gradient', 'neubrutalism'], score: 10 },
          { text: 'Trust and credentials - "Can I rely on this?"', vibes: ['pastel', 'corporate'], score: 10 },
          { text: 'Features and specs - "Does this do what I need?"', vibes: ['cyberpunk', 'midnight'], score: 10 },
          { text: 'Values and ethics - "Does this align with my beliefs?"', vibes: ['organic', 'pastel'], score: 10 },
          { text: 'Design and aesthetics - "Is this beautiful?"', vibes: ['glassmorphism', 'neumorphism'], score: 10 }
        ]
      },
      {
        id: 'price_point',
        question: '💰 Your typical product/service price is:',
        crew: 'Quark',
        options: [
          { text: '$0-50 (Accessible to everyone)', vibes: ['neubrutalism', 'midnight'], score: 8 },
          { text: '$50-150 (Mainstream market)', vibes: ['gradient', 'material'], score: 8 },
          { text: '$150-500 (Premium offering)', vibes: ['pastel', 'glassmorphism'], score: 8 },
          { text: '$500+ (Luxury/Professional services)', vibes: ['corporate', 'neumorphism'], score: 8 },
          { text: 'Freemium/Subscription model', vibes: ['cyberpunk', 'midnight', 'material'], score: 8 }
        ]
      },
      {
        id: 'target_age',
        question: '👥 Your primary target audience age is:',
        crew: 'Commander Data',
        options: [
          { text: '18-25 (Gen Z)', vibes: ['gradient', 'neubrutalism', 'cyberpunk'], score: 7 },
          { text: '25-40 (Millennials)', vibes: ['gradient', 'glassmorphism', 'midnight'], score: 7 },
          { text: '40-60 (Gen X)', vibes: ['pastel', 'corporate', 'material'], score: 7 },
          { text: '60+ (Boomers)', vibes: ['pastel', 'organic', 'corporate'], score: 7 },
          { text: 'All ages', vibes: ['material', 'neumorphism'], score: 5 }
        ]
      },
      {
        id: 'visual_preference',
        question: '🎨 When you see a website you love, it usually has:',
        crew: 'Counselor Troi',
        options: [
          { text: 'Bold colors and thick borders', vibes: ['neubrutalism'], score: 10 },
          { text: 'Soft pastels and gentle transitions', vibes: ['pastel', 'neumorphism'], score: 10 },
          { text: 'Vibrant gradients and animations', vibes: ['gradient', 'glassmorphism'], score: 10 },
          { text: 'Dark background with neon accents', vibes: ['cyberpunk', 'midnight'], score: 10 },
          { text: 'Clean blues and professional layout', vibes: ['corporate', 'material'], score: 10 },
          { text: 'Earth tones and natural feel', vibes: ['organic'], score: 10 }
        ]
      }
    ];
  }

  start() {
    return new Promise((resolve) => {
      this.server = http.createServer((req, res) => {
        this.handleRequest(req, res);
      });

      this.server.listen(this.port, () => {
        console.log(`🎯 Vibe Quiz running on http://localhost:${this.port}`);
        resolve();
      });
    });
  }

  handleRequest(req, res) {
    const url = new URL(req.url, `http://localhost:${this.port}`);
    
    if (url.pathname === '/') {
      this.serveQuiz(res);
    } else if (url.pathname === '/api/calculate-vibe' && req.method === 'POST') {
      this.calculateVibe(req, res);
    } else {
      res.writeHead(404);
      res.end('Not found');
    }
  }

  calculateVibe(req, res) {
    let body = '';
    req.on('data', chunk => { body += chunk; });
    req.on('end', () => {
      const answers = JSON.parse(body);
      const recommendations = this.analyzeAnswers(answers);
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(recommendations));
    });
  }

  analyzeAnswers(answers) {
    // Score each vibe based on answers
    const vibeScores = {};
    
    Object.keys(THEME_DEFINITIONS).forEach(vibeId => {
      vibeScores[vibeId] = 0;
    });

    // Calculate scores
    Object.values(answers).forEach(answer => {
      answer.vibes.forEach(vibe => {
        vibeScores[vibe] = (vibeScores[vibe] || 0) + answer.score;
      });
    });

    // Get top 3 recommendations
    const sorted = Object.entries(vibeScores)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 3);

    return {
      recommendations: sorted.map(([vibeId, score]) => ({
        vibeId,
        theme: THEME_DEFINITIONS[vibeId],
        score,
        confidence: (score / 50 * 100).toFixed(0) + '%'
      })),
      allScores: vibeScores
    };
  }

  serveQuiz(res) {
    const html = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>🎯 Find Your Vibe - Alex AI Quiz</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            min-height: 100vh;
            padding: 40px 20px;
        }
        .container { max-width: 800px; margin: 0 auto; }
        .header {
            text-align: center;
            margin-bottom: 60px;
        }
        .header h1 {
            font-size: 48px;
            margin-bottom: 20px;
        }
        .header p {
            font-size: 20px;
            opacity: 0.95;
        }
        .quiz-container {
            background: rgba(255, 255, 255, 0.1);
            backdrop-filter: blur(10px);
            border-radius: 24px;
            padding: 40px;
            border: 1px solid rgba(255, 255, 255, 0.2);
        }
        .question {
            margin-bottom: 40px;
            display: none;
        }
        .question.active {
            display: block;
        }
        .question-header {
            display: flex;
            align-items: center;
            gap: 15px;
            margin-bottom: 25px;
        }
        .question-number {
            background: rgba(255, 255, 255, 0.2);
            width: 40px;
            height: 40px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-weight: 700;
            font-size: 18px;
        }
        .question-text {
            font-size: 22px;
            font-weight: 600;
            flex: 1;
        }
        .crew-badge {
            background: rgba(0, 255, 136, 0.3);
            padding: 6px 14px;
            border-radius: 20px;
            font-size: 12px;
            border: 1px solid rgba(0, 255, 136, 0.5);
        }
        .options {
            display: flex;
            flex-direction: column;
            gap: 15px;
        }
        .option {
            background: rgba(255, 255, 255, 0.05);
            padding: 20px 25px;
            border-radius: 12px;
            border: 2px solid rgba(255, 255, 255, 0.1);
            cursor: pointer;
            transition: all 0.3s;
            font-size: 16px;
        }
        .option:hover {
            background: rgba(255, 255, 255, 0.15);
            border-color: rgba(255, 255, 255, 0.4);
            transform: translateX(10px);
        }
        .option.selected {
            background: rgba(255, 255, 255, 0.2);
            border-color: #00ff88;
        }
        .progress {
            display: flex;
            gap: 8px;
            margin-bottom: 30px;
            justify-content: center;
        }
        .progress-dot {
            width: 12px;
            height: 12px;
            border-radius: 50%;
            background: rgba(255, 255, 255, 0.2);
        }
        .progress-dot.active {
            background: #00ff88;
        }
        .progress-dot.completed {
            background: #4CAF50;
        }
        .nav-buttons {
            display: flex;
            gap: 15px;
            margin-top: 30px;
        }
        .btn {
            flex: 1;
            padding: 16px;
            border: none;
            border-radius: 12px;
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
        .btn:disabled {
            opacity: 0.5;
            cursor: not-allowed;
        }
        .results {
            display: none;
        }
        .results.active {
            display: block;
        }
        .result-header {
            text-align: center;
            margin-bottom: 40px;
        }
        .result-header h2 {
            font-size: 36px;
            margin-bottom: 15px;
        }
        .recommendations {
            display: grid;
            gap: 20px;
        }
        .recommendation {
            background: rgba(255, 255, 255, 0.1);
            padding: 30px;
            border-radius: 16px;
            border: 2px solid rgba(255, 255, 255, 0.2);
            transition: all 0.3s;
            cursor: pointer;
        }
        .recommendation:hover {
            transform: translateY(-5px);
            border-color: #00ff88;
        }
        .recommendation.top {
            border-color: #00ff88;
            background: rgba(0, 255, 136, 0.1);
        }
        .rec-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 15px;
        }
        .rec-icon {
            font-size: 48px;
        }
        .rec-confidence {
            background: rgba(0, 255, 136, 0.3);
            padding: 8px 16px;
            border-radius: 20px;
            font-weight: 700;
        }
        .rec-name {
            font-size: 28px;
            font-weight: 600;
            margin-bottom: 10px;
        }
        .rec-desc {
            font-size: 16px;
            opacity: 0.9;
            line-height: 1.6;
        }
        .rec-actions {
            display: flex;
            gap: 10px;
            margin-top: 20px;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🎯 Find Your Perfect Vibe</h1>
            <p>5 quick questions to discover your ideal theme</p>
        </div>

        <div class="quiz-container">
            <div class="progress" id="progress">
                ${this.questions.map((_, i) => `<div class="progress-dot ${i === 0 ? 'active' : ''}"></div>`).join('')}
            </div>

            <!-- Questions -->
            ${this.questions.map((q, index) => `
                <div class="question ${index === 0 ? 'active' : ''}" data-question="${index}">
                    <div class="question-header">
                        <div class="question-number">${index + 1}</div>
                        <div class="question-text">${q.question}</div>
                    </div>
                    <div class="crew-badge">Asked by ${q.crew}</div>
                    <div class="options" style="margin-top: 20px;">
                        ${q.options.map((opt, optIndex) => `
                            <div class="option" onclick="selectOption(${index}, ${optIndex})">
                                ${opt.text}
                            </div>
                        `).join('')}
                    </div>
                    <div class="nav-buttons">
                        ${index > 0 ? '<button class="btn btn-secondary" onclick="previousQuestion()">← Back</button>' : '<div></div>'}
                        <button class="btn btn-primary" id="next-${index}" onclick="nextQuestion()" disabled>
                            ${index === this.questions.length - 1 ? 'See My Results →' : 'Next Question →'}
                        </button>
                    </div>
                </div>
            `).join('')}

            <!-- Results -->
            <div class="results" id="results">
                <div class="result-header">
                    <h2>🎉 Your Perfect Vibes!</h2>
                    <p style="font-size: 18px; opacity: 0.9;">Based on your answers, we recommend:</p>
                </div>
                <div class="recommendations" id="recommendations"></div>
            </div>
        </div>
    </div>

    <script>
        const questions = ${JSON.stringify(this.questions)};
        let currentQuestion = 0;
        const answers = {};

        function selectOption(questionIndex, optionIndex) {
            const question = questions[questionIndex];
            const option = question.options[optionIndex];
            
            // Store answer
            answers[question.id] = option;
            
            // Visual feedback
            document.querySelectorAll(\`[data-question="\${questionIndex}"] .option\`).forEach(el => {
                el.classList.remove('selected');
            });
            event.target.classList.add('selected');
            
            // Enable next button
            document.getElementById(\`next-\${questionIndex}\`).disabled = false;
        }

        function nextQuestion() {
            if (currentQuestion < questions.length - 1) {
                // Move to next question
                document.querySelector(\`[data-question="\${currentQuestion}"]\`).classList.remove('active');
                currentQuestion++;
                document.querySelector(\`[data-question="\${currentQuestion}"]\`).classList.add('active');
                
                // Update progress
                updateProgress();
            } else {
                // Show results
                calculateResults();
            }
        }

        function previousQuestion() {
            if (currentQuestion > 0) {
                document.querySelector(\`[data-question="\${currentQuestion}"]\`).classList.remove('active');
                currentQuestion--;
                document.querySelector(\`[data-question="\${currentQuestion}"]\`).classList.add('active');
                updateProgress();
            }
        }

        function updateProgress() {
            document.querySelectorAll('.progress-dot').forEach((dot, index) => {
                dot.classList.remove('active');
                if (index < currentQuestion) {
                    dot.classList.add('completed');
                } else if (index === currentQuestion) {
                    dot.classList.add('active');
                } else {
                    dot.classList.remove('completed');
                }
            });
        }

        async function calculateResults() {
            // Calculate vibe scores
            const response = await fetch('/api/calculate-vibe', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(answers)
            });

            const results = await response.json();
            
            // Hide quiz, show results
            document.querySelector('.quiz-container .question.active').style.display = 'none';
            document.getElementById('results').classList.add('active');
            
            // Display recommendations
            const recsHtml = results.recommendations.map((rec, index) => \`
                <div class="recommendation \${index === 0 ? 'top' : ''}" 
                     onclick="selectVibe('\${rec.vibeId}')">
                    <div class="rec-header">
                        <div class="rec-icon">\${rec.theme.icon}</div>
                        <div class="rec-confidence">
                            \${rec.confidence} Match
                            \${index === 0 ? '🏆' : ''}
                        </div>
                    </div>
                    <div class="rec-name">\${rec.theme.name}</div>
                    <div class="rec-desc">\${rec.theme.description}</div>
                    <div class="rec-actions">
                        <button class="btn btn-primary" onclick="selectVibe('\${rec.vibeId}')">
                            Create Project with This Vibe →
                        </button>
                        <button class="btn btn-secondary" onclick="window.open('http://localhost:3010', '_blank')">
                            View in Gallery
                        </button>
                    </div>
                </div>
            \`).join('');
            
            document.getElementById('recommendations').innerHTML = recsHtml;
        }

        function selectVibe(vibeId) {
            // Store selection and redirect to project creation
            localStorage.setItem('selectedVibe', vibeId);
            localStorage.setItem('quizAnswers', JSON.stringify(answers));
            
            // For now, redirect to gallery or dashboard
            alert(\`Great choice! Starting project creation wizard with \${vibeId} theme...
            
(Wizard will be on port 3030 - Coming next!)\`);
            
            window.location.href = 'http://localhost:3010';
        }
    </script>
</body>
</html>`;

    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.end(html);
  }
}

module.exports = VibeQuizServer;

if (require.main === module) {
  const quiz = new VibeQuizServer();
  quiz.start().then(() => {
    console.log('🎯 Vibe Quiz operational!');
    console.log('🖖 Take the quiz: http://localhost:3020');
  });
}

