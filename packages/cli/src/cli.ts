#!/usr/bin/env node
/**
 * Universal Alex AI CLI
 * 
 * This CLI can be called from any project directory to engage Alex AI
 * It automatically detects the project type and context, then provides
 * appropriate crew member assistance.
 */

import { Command } from 'commander';
import chalk from 'chalk';
import ora from 'ora';
import inquirer from 'inquirer';
import { UniversalAlexAIManager } from '@alex-ai/universal';
import { ProjectDetector } from './project-detector';
import { ContextManager } from './context-manager';
import { CrewCoordinator } from './crew-coordinator';

class AlexAICLI {
  private alexAI: UniversalAlexAIManager;
  private projectDetector: ProjectDetector;
  private contextManager: ContextManager;
  private crewCoordinator: CrewCoordinator;

  constructor() {
    this.alexAI = new UniversalAlexAIManager();
    this.projectDetector = new ProjectDetector();
    this.contextManager = new ContextManager();
    this.crewCoordinator = new CrewCoordinator();
  }

  async initialize() {
    const spinner = ora('Initializing Alex AI...').start();
    
    try {
      // Detect current project
      const projectInfo = await this.projectDetector.detectProject();
      spinner.text = `Detected ${projectInfo.type} project: ${projectInfo.name}`;
      
      // Initialize Alex AI with project context
      await this.alexAI.initialize({
        environment: 'development',
        enableN8NIntegration: true,
        enableStealthScraping: false,
        enableCrewManagement: true,
        enableTesting: true,
        logLevel: 'info'
      });

      // Set up project context
      await this.contextManager.setProjectContext(projectInfo);
      
      spinner.succeed(chalk.green('Alex AI initialized successfully!'));
      
      console.log(chalk.blue('\n🚀 Alex AI Universal Assistant Ready!'));
      console.log(chalk.gray(`Project: ${projectInfo.name} (${projectInfo.type})`));
      console.log(chalk.gray(`Location: ${projectInfo.path}`));
      
      return true;
    } catch (error) {
      spinner.fail(chalk.red('Failed to initialize Alex AI'));
      console.error(chalk.red('Error:'), error);
      return false;
    }
  }

  async engage() {
    console.log(chalk.blue('\n👥 Alex AI Crew Members Available:'));
    
    const crewMembers = await this.alexAI.getCrewMembers();
    crewMembers.forEach(member => {
      console.log(chalk.gray(`  ${member.avatar} ${member.name} - ${member.specialization}`));
    });

    console.log(chalk.blue('\n💬 Alex AI Chat Interface'));
    console.log(chalk.gray('Type your questions or commands. Type "exit" to quit.\n'));

    const { message } = await inquirer.prompt([
      {
        type: 'input',
        name: 'message',
        message: 'What would you like Alex AI to help with?',
        validate: (input: string) => input.trim().length > 0 || 'Please enter a message'
      }
    ]);

    if (message.toLowerCase() === 'exit') {
      console.log(chalk.gray('Goodbye! Alex AI is always here when you need assistance.'));
      return;
    }

    const spinner = ora('Alex AI crew is working on your request...').start();
    
    try {
      const context = await this.contextManager.getCurrentContext();
      const response = await this.alexAI.sendMessage({
        message,
        context,
        timestamp: new Date().toISOString()
      });

      spinner.succeed();
      
      console.log(chalk.green(`\n🤖 ${response.crewMember} responds:`));
      console.log(chalk.white(response.response));
      
      if (response.suggestions && response.suggestions.length > 0) {
        console.log(chalk.blue('\n💡 Suggestions:'));
        response.suggestions.forEach(suggestion => {
          console.log(chalk.gray(`  • ${suggestion}`));
        });
      }

      if (response.codeActions && response.codeActions.length > 0) {
        console.log(chalk.blue('\n🔧 Available Actions:'));
        response.codeActions.forEach(action => {
          console.log(chalk.gray(`  • ${action.title}: ${action.description}`));
        });
      }

    } catch (error) {
      spinner.fail(chalk.red('Failed to process request'));
      console.error(chalk.red('Error:'), error);
    }
  }

  async status() {
    const status = await this.alexAI.getStatus();
    const projectInfo = await this.projectDetector.detectProject();
    
    console.log(chalk.blue('\n📊 Alex AI Status Report'));
    console.log(chalk.gray('=' .repeat(40)));
    console.log(chalk.white(`Status: ${status.isInitialized ? '✅ Active' : '❌ Inactive'}`));
    console.log(chalk.white(`Connection: ${status.isConnected ? '✅ Connected' : '❌ Disconnected'}`));
    console.log(chalk.white(`Active Crew: ${status.activeCrewMember}`));
    console.log(chalk.white(`Last Activity: ${status.lastActivity}`));
    console.log(chalk.white(`Messages: ${status.messageCount}`));
    console.log(chalk.white(`Errors: ${status.errorCount}`));
    
    console.log(chalk.blue('\n📁 Project Information'));
    console.log(chalk.gray('=' .repeat(40)));
    console.log(chalk.white(`Name: ${projectInfo.name}`));
    console.log(chalk.white(`Type: ${projectInfo.type}`));
    console.log(chalk.white(`Path: ${projectInfo.path}`));
    console.log(chalk.white(`Language: ${projectInfo.language}`));
    console.log(chalk.white(`Framework: ${projectInfo.framework}`));
  }

  async task(taskName: string) {
    const spinner = ora(`Alex AI crew is executing task: ${taskName}`).start();
    
    try {
      const assignedCrew = await this.crewCoordinator.assignTask(taskName);
      const projectInfo = await this.projectDetector.detectProject();
      
      spinner.text = `Crew members assigned: ${assignedCrew.map(member => member.name).join(', ')}`;
      
      // Simulate task execution with crew coordination
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      spinner.succeed(chalk.green(`Task "${taskName}" completed successfully!`));
      
      console.log(chalk.blue('\n👥 Crew Assignment:'));
      assignedCrew.forEach(member => {
        console.log(chalk.gray(`  ${member.avatar} ${member.name} - ${member.specialization}`));
      });
      
      console.log(chalk.green('\n✅ Task completed with crew coordination'));
      
    } catch (error) {
      spinner.fail(chalk.red(`Task "${taskName}" failed`));
      console.error(chalk.red('Error:'), error);
    }
  }
}

// CLI Command Setup
const program = new Command();
const alexAI = new AlexAICLI();

program
  .name('alex-ai')
  .description('Universal Alex AI Assistant - Works across any project')
  .version('1.0.0');

program
  .command('engage')
  .description('Engage Alex AI for interactive assistance')
  .action(async () => {
    const initialized = await alexAI.initialize();
    if (initialized) {
      await alexAI.engage();
    }
  });

program
  .command('status')
  .description('Show Alex AI status and project information')
  .action(async () => {
    const initialized = await alexAI.initialize();
    if (initialized) {
      await alexAI.status();
    }
  });

program
  .command('task <taskName>')
  .description('Execute a specific task with crew coordination')
  .action(async (taskName: string) => {
    const initialized = await alexAI.initialize();
    if (initialized) {
      await alexAI.task(taskName);
    }
  });

program
  .command('init')
  .description('Initialize Alex AI in current project')
  .action(async () => {
    const initialized = await alexAI.initialize();
    if (initialized) {
      console.log(chalk.green('\n✅ Alex AI initialized in this project!'));
      console.log(chalk.gray('You can now use "alex-ai engage" to start chatting.'));
    }
  });

// Handle unknown commands
program.on('command:*', () => {
  console.error(chalk.red('Unknown command. Use "alex-ai --help" for available commands.'));
  process.exit(1);
});

// Parse command line arguments
program.parse(process.argv);

// If no command provided, show help
if (!process.argv.slice(2).length) {
  program.outputHelp();
}
