#!/usr/bin/env node

/**
 * Alex AI Prompt Generator
 * 
 * Generates AI prompts for instantiation into any project
 */

const fs = require('fs');
const path = require('path');

class AlexAIPromptGenerator {
  constructor() {
    this.projectPath = process.cwd();
  }

  generatePrompts() {
    console.log('🤖 Alex AI Prompt Generator');
    console.log('==========================\n');

    const prompts = {
      instantiation: this.generateInstantiationPrompt(),
      newProject: this.generateNewProjectPrompt(),
      existingProject: this.generateExistingProjectPrompt(),
      crewSpecific: this.generateCrewSpecificPrompts(),
      agentMode: this.generateAgentModePrompts()
    };

    // Save prompts to file
    const promptsPath = path.join(this.projectPath, 'ALEX_AI_PROMPTS.md');
    fs.writeFileSync(promptsPath, this.formatPrompts(prompts));

    console.log('✅ AI prompts generated successfully!');
    console.log(`📁 Saved to: ${promptsPath}\n`);

    // Display quick start
    this.displayQuickStart();
  }

  generateInstantiationPrompt() {
    return `# 🚀 Alex AI Instantiation Prompt

## Quick Integration
\`\`\`
I want to integrate Alex AI, a Star Trek crew-based AI assistant, into this project. 

Alex AI provides:
- Real AI-powered code assistance using OpenAI
- 8 specialized crew members with unique personalities and expertise
- Context-aware responses based on project type
- Security, performance, and business analysis
- VSCode, Cursor, CLI, and web integration

Please help me:
1. Install Alex AI using "npx alexi"
2. Set up the crew integration
3. Configure project-specific prompts
4. Initialize the AI agent assistant mode

I want Alex AI to run as a full AI agent assistant for this project.
\`\`\``;
  }

  generateNewProjectPrompt() {
    return `# 🆕 New Project Integration

## For New Projects
\`\`\`
I'm starting a new project and want to integrate Alex AI as my full AI agent assistant from day one.

Alex AI is a Star Trek crew-based AI assistant that provides:
- Real AI-powered development assistance
- 8 specialized crew members with unique expertise
- Context-aware project guidance
- Security, performance, and business analysis
- Continuous project monitoring

Please help me:
1. Initialize Alex AI in this new project
2. Set up the crew integration
3. Configure project-specific AI prompts
4. Enable AI agent assistant mode
5. Create project structure with AI guidance

I want the crew to guide every aspect of development from architecture to implementation.
\`\`\``;
  }

  generateExistingProjectPrompt() {
    return `# 🔧 Existing Project Integration

## For Existing Projects
\`\`\`
I have an existing project and want to integrate Alex AI as my full AI agent assistant.

Alex AI is a Star Trek crew-based AI assistant that provides:
- Real AI-powered code analysis and assistance
- 8 specialized crew members with unique expertise
- Context-aware project understanding
- Security, performance, and business analysis
- Continuous project monitoring and improvement

Please help me:
1. Analyze the existing project structure
2. Install and configure Alex AI
3. Set up crew integration for this specific project
4. Create project-specific AI prompts
5. Enable AI agent assistant mode
6. Integrate with existing development workflow

I want the crew to understand this project and provide intelligent assistance for all development tasks.
\`\`\``;
  }

  generateCrewSpecificPrompts() {
    return `# 👥 Crew-Specific Prompts

## Commander Data - Logic & Analysis
\`\`\`
Commander Data, I need you to analyze this project and provide logical guidance for:
- Code structure and organization
- Algorithm efficiency and optimization
- Data flow and processing
- Error handling and edge cases
- Testing strategies and validation

Please examine the project and provide detailed analysis with specific recommendations for improvement.
\`\`\`

## Captain Picard - Strategic Leadership
\`\`\`
Captain Picard, I need strategic leadership for this project:
- Overall architecture and design decisions
- Project roadmap and milestone planning
- Team coordination and task assignment
- Risk assessment and mitigation strategies
- Long-term vision and scalability planning

Please provide strategic guidance and help me make informed decisions about the project's direction.
\`\`\`

## Geordi La Forge - Engineering
\`\`\`
Geordi, I need engineering expertise for this project:
- Technical implementation and system design
- Build pipeline and deployment strategies
- Performance optimization and monitoring
- Integration with external systems
- Code quality and maintainability

Please help me implement robust technical solutions and optimize the project's engineering aspects.
\`\`\`

## Lieutenant Worf - Security & Testing
\`\`\`
Lieutenant Worf, I need security and testing expertise for this project:
- Security vulnerability assessment
- Testing strategy and implementation
- Quality assurance and compliance
- Risk mitigation and security hardening
- Best practices and standards

Please help me secure this project and ensure it meets the highest quality standards.
\`\`\`

## Dr. Crusher - Performance Optimization
\`\`\`
Dr. Crusher, I need performance optimization for this project:
- Performance analysis and profiling
- Memory usage optimization
- Resource efficiency improvements
- System health monitoring
- Performance testing and validation

Please help me optimize this project for maximum performance and efficiency.
\`\`\`

## Counselor Troi - User Experience
\`\`\`
Counselor Troi, I need user experience guidance for this project:
- User interface design and usability
- User research and feedback analysis
- Accessibility and inclusive design
- User journey optimization
- Human-centered design principles

Please help me create an exceptional user experience for this project.
\`\`\`

## Lieutenant Uhura - Communications
\`\`\`
Lieutenant Uhura, I need communications expertise for this project:
- API design and documentation
- Communication protocols and standards
- Integration with external systems
- Data exchange and messaging
- Documentation and knowledge sharing

Please help me establish clear communication channels and protocols for this project.
\`\`\`

## Quark - Business Analysis
\`\`\`
Quark, I need business analysis for this project:
- Business value assessment
- ROI analysis and cost optimization
- Market positioning and competitive analysis
- Revenue generation strategies
- Business model optimization

Please help me understand the business value and optimize the project for maximum profitability.
\`\`\``;
  }

  generateAgentModePrompts() {
    return `# 🤖 AI Agent Assistant Mode

## Full AI Agent Assistant
\`\`\`
I want to activate Alex AI as a full AI agent assistant for this project. This means:
- Continuous project monitoring and analysis
- Proactive suggestions and recommendations
- Automated code review and quality checks
- Security scanning and vulnerability detection
- Performance monitoring and optimization
- Business value tracking and analysis
- User experience monitoring and improvement

Please set up Alex AI to run as an autonomous AI agent that continuously assists with all aspects of this project.
\`\`\`

## Project Monitoring Mode
\`\`\`
I want Alex AI to continuously monitor this project for:
- Code quality issues and improvements
- Security vulnerabilities and risks
- Performance bottlenecks and optimizations
- Business value opportunities
- User experience enhancements
- Best practice violations
- Technical debt accumulation

Please enable continuous monitoring and provide regular reports and recommendations.
\`\`\`

## Development Workflow Integration
\`\`\`
I want Alex AI to integrate seamlessly with my development workflow:
- Pre-commit hooks for code analysis
- Continuous integration checks
- Real-time code suggestions
- Automated testing and validation
- Performance monitoring and alerts
- Security scanning and reporting
- Documentation generation and updates

Please set up Alex AI to work as an integral part of my development process.
\`\`\``;
  }

  formatPrompts(prompts) {
    return `# 🤖 Alex AI Project Integration Prompts

${prompts.instantiation}

---

${prompts.newProject}

---

${prompts.existingProject}

---

${prompts.crewSpecific}

---

${prompts.agentMode}

---

## 🚀 Quick Start Commands

\`\`\`bash
# Install Alex AI
npx alexi

# Initialize in project
npx alexi init

# Start AI agent mode
npx alexi chat

# Show available crew
npx alexi crew

# Check system status
npx alexi status
\`\`\`

## 🎯 Usage Examples

### Daily Development
\`\`\`
"Alex AI crew, help me with today's development tasks:
- Review the code I wrote yesterday
- Suggest improvements for the current feature
- Identify potential issues before they become problems
- Optimize performance for the new functionality
- Ensure security best practices are followed"
\`\`\`

### Code Review
\`\`\`
"Commander Data, please review this code for:
- Logic errors and edge cases
- Performance optimizations
- Code clarity and maintainability
- Best practice adherence
- Potential bugs and issues"
\`\`\`

### Architecture Planning
\`\`\`
"Captain Picard, help me plan the architecture for:
- Scalability and performance requirements
- Security and compliance needs
- Integration with existing systems
- Future growth and expansion
- Team collaboration and maintenance"
\`\`\`

## 🎉 Success Metrics

When Alex AI is properly integrated, you should see:
- ✅ Real-time AI assistance in your IDE
- ✅ Context-aware code suggestions
- ✅ Proactive security and performance monitoring
- ✅ Business value analysis and optimization
- ✅ Continuous project improvement
- ✅ Seamless development workflow integration

**Engage! 🖖**`;
  }

  displayQuickStart() {
    console.log('🚀 Quick Start:');
    console.log('  1. Copy any prompt from ALEX_AI_PROMPTS.md');
    console.log('  2. Paste it into your AI chat (ChatGPT, Claude, etc.)');
    console.log('  3. Follow the AI\'s guidance to integrate Alex AI');
    console.log('  4. Run "npx alexi" to start using Alex AI');
    console.log('  5. Enjoy intelligent assistance from your Star Trek crew!');
    console.log('\n🤖 Your AI prompts are ready for instantiation!');
    console.log('   Engage! 🖖\n');
  }
}

// Run the prompt generator
new AlexAIPromptGenerator().generatePrompts();







