#!/usr/bin/env node

/**
 * Alex AI Project Initialization Script
 * 
 * Instantiates Alex AI into any existing or new project
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

class AlexAIProjectInit {
  constructor() {
    this.projectPath = process.cwd();
    this.alexAIConfig = {
      version: '1.0.0',
      initializedAt: new Date().toISOString(),
      crewMembers: [
        'Commander Data',
        'Captain Jean-Luc Picard', 
        'Geordi La Forge',
        'Lieutenant Worf',
        'Dr. Beverly Crusher',
        'Counselor Deanna Troi',
        'Lieutenant Uhura',
        'Quark'
      ],
      capabilities: [
        'AI-powered code assistance',
        'Crew-based personality responses',
        'Context-aware suggestions',
        'Real-time project analysis',
        'Security and compliance checks',
        'Performance optimization',
        'Business value analysis',
        'User experience guidance'
      ]
    };
  }

  async initialize() {
    console.log('🚀 Alex AI Project Initialization');
    console.log('==================================\n');

    try {
      // Detect project type
      const projectType = await this.detectProjectType();
      console.log(`📁 Detected project type: ${projectType}\n`);

      // Create Alex AI configuration
      await this.createAlexAIConfig();

      // Install Alex AI
      await this.installAlexAI();

      // Create project-specific prompts
      await this.createProjectPrompts(projectType);

      // Create crew integration
      await this.createCrewIntegration();

      // Create documentation
      await this.createDocumentation();

      // Display success message
      this.displaySuccessMessage(projectType);

    } catch (error) {
      console.error('❌ Project initialization failed:', error.message);
      process.exit(1);
    }
  }

  async detectProjectType() {
    const packageJsonPath = path.join(this.projectPath, 'package.json');
    const requirementsPath = path.join(this.projectPath, 'requirements.txt');
    const cargoPath = path.join(this.projectPath, 'Cargo.toml');
    const pomPath = path.join(this.projectPath, 'pom.xml');
    const goModPath = path.join(this.projectPath, 'go.mod');

    if (fs.existsSync(packageJsonPath)) {
      const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
      if (packageJson.dependencies?.react) return 'react';
      if (packageJson.dependencies?.vue) return 'vue';
      if (packageJson.dependencies?.angular) return 'angular';
      if (packageJson.dependencies?.express) return 'node-express';
      if (packageJson.dependencies?.next) return 'nextjs';
      return 'node';
    } else if (fs.existsSync(requirementsPath)) {
      return 'python';
    } else if (fs.existsSync(cargoPath)) {
      return 'rust';
    } else if (fs.existsSync(pomPath)) {
      return 'java';
    } else if (fs.existsSync(goModPath)) {
      return 'go';
    } else {
      return 'generic';
    }
  }

  async createAlexAIConfig() {
    console.log('⚙️ Creating Alex AI configuration...');
    
    const configPath = path.join(this.projectPath, '.alex-ai.json');
    fs.writeFileSync(configPath, JSON.stringify(this.alexAIConfig, null, 2));
    
    console.log('✅ Alex AI configuration created');
  }

  async installAlexAI() {
    console.log('📦 Installing Alex AI...');
    
    try {
      // Install via NPX
      execSync('npx alexi init', { stdio: 'inherit', cwd: this.projectPath });
      console.log('✅ Alex AI installed successfully');
    } catch (error) {
      console.warn('⚠️ NPX installation failed, continuing with local setup');
    }
  }

  async createProjectPrompts(projectType) {
    console.log('🤖 Creating project-specific AI prompts...');
    
    const prompts = this.generateProjectPrompts(projectType);
    const promptsPath = path.join(this.projectPath, '.alex-ai-prompts.md');
    fs.writeFileSync(promptsPath, prompts);
    
    console.log('✅ Project-specific prompts created');
  }

  generateProjectPrompts(projectType) {
    const prompts = {
      react: `# Alex AI React Project Prompts

## 🚀 Quick Start
\`\`\`bash
npx alexi chat
\`\`\`

## 🤖 Crew Members for React Development

### Commander Data - Logic & Analysis
- "Analyze this React component for performance issues"
- "Explain the state management pattern in this code"
- "Help me debug this React hook"

### Geordi La Forge - Engineering
- "Optimize this React component for better performance"
- "Help me set up the build pipeline"
- "Review this component architecture"

### Lieutenant Worf - Security & Testing
- "Check this component for security vulnerabilities"
- "Help me write tests for this React component"
- "Review this code for best practices"

### Dr. Crusher - Performance
- "Analyze the bundle size of this React app"
- "Help me optimize the rendering performance"
- "Review the memory usage patterns"

## 💡 Common Prompts
- "Help me refactor this component"
- "Explain this React pattern"
- "Debug this error"
- "Optimize this code"
- "Add accessibility features"
- "Improve the user experience"`,

      node: `# Alex AI Node.js Project Prompts

## 🚀 Quick Start
\`\`\`bash
npx alexi chat
\`\`\`

## 🤖 Crew Members for Node.js Development

### Commander Data - Logic & Analysis
- "Analyze this Node.js code for potential issues"
- "Explain the async/await pattern in this code"
- "Help me debug this error handling"

### Geordi La Forge - Engineering
- "Help me set up the Express.js server"
- "Optimize this database query"
- "Review this API design"

### Lieutenant Worf - Security & Testing
- "Check this code for security vulnerabilities"
- "Help me write unit tests"
- "Review this authentication implementation"

### Dr. Crusher - Performance
- "Analyze the performance of this Node.js app"
- "Help me optimize the memory usage"
- "Review the error handling patterns"

## 💡 Common Prompts
- "Help me refactor this function"
- "Explain this Node.js concept"
- "Debug this error"
- "Optimize this code"
- "Add error handling"
- "Improve the API design"`,

      python: `# Alex AI Python Project Prompts

## 🚀 Quick Start
\`\`\`bash
npx alexi chat
\`\`\`

## 🤖 Crew Members for Python Development

### Commander Data - Logic & Analysis
- "Analyze this Python code for potential issues"
- "Explain this algorithm implementation"
- "Help me debug this error"

### Geordi La Forge - Engineering
- "Help me set up the Django/FastAPI project"
- "Optimize this Python function"
- "Review this code architecture"

### Lieutenant Worf - Security & Testing
- "Check this code for security vulnerabilities"
- "Help me write unit tests"
- "Review this data handling"

### Dr. Crusher - Performance
- "Analyze the performance of this Python code"
- "Help me optimize the memory usage"
- "Review the algorithm complexity"

## 💡 Common Prompts
- "Help me refactor this function"
- "Explain this Python concept"
- "Debug this error"
- "Optimize this code"
- "Add error handling"
- "Improve the code structure"`,

      generic: `# Alex AI Generic Project Prompts

## 🚀 Quick Start
\`\`\`bash
npx alexi chat
\`\`\`

## 🤖 Crew Members for General Development

### Commander Data - Logic & Analysis
- "Analyze this code for potential issues"
- "Explain this programming concept"
- "Help me debug this error"

### Geordi La Forge - Engineering
- "Help me set up the project structure"
- "Optimize this code"
- "Review this architecture"

### Lieutenant Worf - Security & Testing
- "Check this code for security vulnerabilities"
- "Help me write tests"
- "Review this implementation"

### Dr. Crusher - Performance
- "Analyze the performance of this code"
- "Help me optimize the execution"
- "Review the resource usage"

## 💡 Common Prompts
- "Help me refactor this code"
- "Explain this concept"
- "Debug this error"
- "Optimize this code"
- "Add error handling"
- "Improve the code quality"`
    };

    return prompts[projectType] || prompts.generic;
  }

  async createCrewIntegration() {
    console.log('👥 Creating crew integration...');
    
    const crewIntegration = `# Alex AI Crew Integration

## 🚀 Instantiate Alex AI Crew

To instantiate the full Alex AI crew with all capabilities:

\`\`\`bash
# Start interactive chat
npx alexi chat

# Show available crew members
npx alexi crew

# Check system status
npx alexi status

# Run quick demo
npx alexi demo
\`\`\`

## 🤖 Crew Capabilities

### Commander Data - Operations Officer
- **Specialization:** Data Analysis, Logic, Computing, Efficiency
- **Use for:** Code analysis, debugging, logical problem solving
- **Prompt:** "Commander Data, analyze this code for potential issues"

### Captain Jean-Luc Picard - Commanding Officer
- **Specialization:** Strategic Planning, Leadership, Mission Command
- **Use for:** Project strategy, architecture decisions, leadership guidance
- **Prompt:** "Captain Picard, help me plan the architecture for this project"

### Geordi La Forge - Chief Engineer
- **Specialization:** Engineering, System Integration, Technical Solutions
- **Use for:** Technical implementation, system design, engineering solutions
- **Prompt:** "Geordi, help me implement this technical solution"

### Lieutenant Worf - Security Officer
- **Specialization:** Security, Testing, Risk Assessment, Quality Assurance
- **Use for:** Security reviews, testing strategies, quality assurance
- **Prompt:** "Lieutenant Worf, review this code for security issues"

### Dr. Beverly Crusher - Chief Medical Officer
- **Specialization:** Performance Optimization, System Health, Diagnostics
- **Use for:** Performance analysis, system optimization, health monitoring
- **Prompt:** "Dr. Crusher, help me optimize the performance of this code"

### Counselor Deanna Troi - Ship's Counselor
- **Specialization:** User Experience, Empathy Analysis, Human Factors
- **Use for:** UX design, user research, human-centered design
- **Prompt:** "Counselor Troi, help me improve the user experience"

### Lieutenant Uhura - Communications Officer
- **Specialization:** Communications, I/O Operations, Documentation
- **Use for:** API design, documentation, communication protocols
- **Prompt:** "Lieutenant Uhura, help me design this API"

### Quark - Business Operations
- **Specialization:** Business Intelligence, ROI Analysis, Business Strategy
- **Use for:** Business analysis, ROI calculations, strategic planning
- **Prompt:** "Quark, analyze the business value of this feature"

## 🎯 AI Agent Assistant Mode

Alex AI can run as a full AI agent assistant for your project:

\`\`\`bash
# Start continuous monitoring
npx alexi monitor

# Run project analysis
npx alexi analyze

# Generate project report
npx alexi report
\`\`\`

## 🔧 Integration with IDEs

### VSCode
- Command Palette: "Engage Alex AI"
- Right-click context menu
- Integrated chat panel

### Cursor
- AI chat integration
- Context-aware responses
- Seamless workflow

## 📊 Project Monitoring

Alex AI continuously monitors your project for:
- Code quality issues
- Security vulnerabilities
- Performance bottlenecks
- Best practice violations
- Business value opportunities

## 🚀 Getting Started

1. **Initialize:** \`npx alexi init\`
2. **Engage:** \`npx alexi chat\`
3. **Ask:** "Help me with this project"
4. **Learn:** Use crew-specific prompts
5. **Grow:** Let Alex AI guide your development

**Engage! 🖖**`;

    const crewPath = path.join(this.projectPath, 'ALEX_AI_CREW.md');
    fs.writeFileSync(crewPath, crewIntegration);
    
    console.log('✅ Crew integration created');
  }

  async createDocumentation() {
    console.log('📚 Creating documentation...');
    
    const documentation = `# Alex AI Project Integration

## 🚀 What is Alex AI?

Alex AI is a Star Trek crew-based AI assistant that provides intelligent code assistance, project guidance, and development support. Each crew member has unique expertise and personality.

## 🤖 Crew Members

- **Commander Data** - Logic & Analysis
- **Captain Picard** - Strategic Leadership  
- **Geordi La Forge** - Engineering
- **Lieutenant Worf** - Security & Testing
- **Dr. Crusher** - Performance Optimization
- **Counselor Troi** - User Experience
- **Lieutenant Uhura** - Communications
- **Quark** - Business Analysis

## 🎯 How to Use

### Quick Start
\`\`\`bash
npx alexi chat
\`\`\`

### Specific Crew Member
\`\`\`bash
npx alexi chat "Commander Data, analyze this code"
\`\`\`

### Project Status
\`\`\`bash
npx alexi status
\`\`\`

### Available Crew
\`\`\`bash
npx alexi crew
\`\`\`

## 🔧 Integration

Alex AI integrates with:
- VSCode (extension)
- Cursor (extension)
- CLI (command-line)
- Web interface

## 📊 Capabilities

- Real-time code analysis
- Context-aware suggestions
- Security vulnerability detection
- Performance optimization
- Business value analysis
- User experience guidance
- Project architecture planning
- Testing strategy development

## 🚀 Getting Started

1. Run \`npx alexi chat\`
2. Ask any development question
3. Let the crew guide your project
4. Enjoy intelligent assistance!

**Engage! 🖖**`;

    const docPath = path.join(this.projectPath, 'ALEX_AI_README.md');
    fs.writeFileSync(docPath, documentation);
    
    console.log('✅ Documentation created');
  }

  displaySuccessMessage(projectType) {
    console.log('\n🎉 Alex AI Project Integration Complete!');
    console.log('=====================================\n');
    
    console.log('✨ What you can do now:');
    console.log('  • Run "npx alexi chat" to start chatting with the crew');
    console.log('  • Use "npx alexi crew" to see available crew members');
    console.log('  • Use "npx alexi status" to check system status');
    console.log('  • Read ALEX_AI_CREW.md for detailed integration guide');
    console.log('  • Read ALEX_AI_README.md for project documentation');
    
    console.log('\n🤖 Crew Members Ready:');
    this.alexAIConfig.crewMembers.forEach(member => {
      console.log(`  • ${member}`);
    });
    
    console.log('\n🚀 Quick Start:');
    console.log('  1. Run "npx alexi chat"');
    console.log('  2. Ask: "Help me with this project"');
    console.log('  3. Let the crew guide your development');
    
    console.log('\n📁 Files Created:');
    console.log('  • .alex-ai.json - Configuration');
    console.log('  • .alex-ai-prompts.md - Project-specific prompts');
    console.log('  • ALEX_AI_CREW.md - Crew integration guide');
    console.log('  • ALEX_AI_README.md - Project documentation');
    
    console.log('\n🎯 Project Type: ' + projectType);
    console.log('🤖 Your Star Trek crew is ready to assist!');
    console.log('   Engage! 🖖\n');
  }
}

// Run the initialization
new AlexAIProjectInit().initialize();







