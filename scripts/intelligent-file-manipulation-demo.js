#!/usr/bin/env node

/**
 * Intelligent File Manipulation Demo
 * 
 * Demonstrates Alex AI's ability to automatically manipulate files with crew consensus
 */

const { 
  AlexAISafetyManager, 
  CrewConsensusManager, 
  IntelligentFileManipulator,
  AlexAICrewManager 
} = require('../packages/core/dist/index.js');
const fs = require('fs');
const path = require('path');

class IntelligentFileManipulationDemo {
  constructor() {
    this.demoDir = path.join(__dirname, '..', 'intelligent-file-demo');
    this.safetyManager = new AlexAISafetyManager();
    this.crewManager = new AlexAICrewManager();
    this.consensusManager = new CrewConsensusManager(this.crewManager.getCrewMembers());
    this.fileManipulator = new IntelligentFileManipulator(
      this.safetyManager,
      this.consensusManager,
      this.crewManager.getCrewMembers()
    );
  }

  async run() {
    console.log('🤖 Alex AI Intelligent File Manipulation Demo');
    console.log('============================================\n');

    try {
      // Create demo directory
      await this.createDemoDirectory();

      // Demonstrate intelligent file creation
      await this.demonstrateFileCreation();

      // Demonstrate intelligent file modification
      await this.demonstrateFileModification();

      // Demonstrate intelligent file deletion
      await this.demonstrateFileDeletion();

      // Demonstrate crew consensus system
      await this.demonstrateCrewConsensus();

      // Show operation statistics
      await this.showOperationStatistics();

      // Cleanup
      await this.cleanup();

      console.log('\n✅ Intelligent file manipulation demo completed!');
      console.log('🤖 Alex AI can now intelligently manipulate files with crew consensus!');

    } catch (error) {
      console.error('❌ Demo failed:', error.message);
    }
  }

  async createDemoDirectory() {
    console.log('📁 Creating demo directory...');
    
    if (!fs.existsSync(this.demoDir)) {
      fs.mkdirSync(this.demoDir, { recursive: true });
    }

    // Create some initial files
    const initialFiles = [
      'package.json',
      'README.md',
      'src/index.js',
      'config/settings.json'
    ];

    for (const file of initialFiles) {
      const filePath = path.join(this.demoDir, file);
      const dir = path.dirname(filePath);
      
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }

      let content = '';
      if (file === 'package.json') {
        content = JSON.stringify({
          name: 'demo-project',
          version: '1.0.0',
          description: 'A demo project for Alex AI'
        }, null, 2);
      } else if (file === 'README.md') {
        content = '# Demo Project\n\nThis is a demo project for Alex AI.';
      } else if (file === 'src/index.js') {
        content = 'console.log("Hello from demo project!");';
      } else if (file === 'config/settings.json') {
        content = JSON.stringify({
          debug: true,
          port: 3000
        }, null, 2);
      }

      fs.writeFileSync(filePath, content);
    }

    console.log('✅ Demo directory created with initial files');
  }

  async demonstrateFileCreation() {
    console.log('\n📝 Demonstrating Intelligent File Creation...');
    console.log('==============================================');

    // Create a new TypeScript file
    const result1 = await this.fileManipulator.proposeAndExecuteFileChange(
      path.join(this.demoDir, 'src/utils.ts'),
      'create',
      `// Utility functions for demo project
export function formatDate(date: Date): string {
  return date.toISOString().split('T')[0];
}

export function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}`,
      undefined,
      'Create utility functions for the project',
      'Alex AI',
      'medium'
    );

    console.log(`\n📄 File Creation Result:`);
    console.log(`   Success: ${result1.success ? '✅' : '❌'}`);
    console.log(`   File: ${result1.filePath}`);
    console.log(`   Reason: ${result1.reason}`);
    console.log(`   Crew Consensus: ${result1.crewConsensus?.consensus}`);
    console.log(`   Approval Rate: ${result1.crewConsensus?.approvalRate}%`);

    // Create a configuration file
    const result2 = await this.fileManipulator.proposeAndExecuteFileChange(
      path.join(this.demoDir, 'tsconfig.json'),
      'create',
      JSON.stringify({
        compilerOptions: {
          target: 'ES2020',
          module: 'commonjs',
          strict: true,
          esModuleInterop: true
        }
      }, null, 2),
      undefined,
      'Add TypeScript configuration',
      'Alex AI',
      'high'
    );

    console.log(`\n📄 TypeScript Config Creation Result:`);
    console.log(`   Success: ${result2.success ? '✅' : '❌'}`);
    console.log(`   File: ${result2.filePath}`);
    console.log(`   Reason: ${result2.reason}`);
    console.log(`   Crew Consensus: ${result2.crewConsensus?.consensus}`);
  }

  async demonstrateFileModification() {
    console.log('\n✏️ Demonstrating Intelligent File Modification...');
    console.log('================================================');

    // Modify package.json to add dependencies
    const packageJsonPath = path.join(this.demoDir, 'package.json');
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
    
    packageJson.dependencies = {
      'express': '^4.18.0',
      'cors': '^2.8.5'
    };
    packageJson.scripts = {
      'start': 'node src/index.js',
      'dev': 'nodemon src/index.js'
    };

    const result = await this.fileManipulator.proposeAndExecuteFileChange(
      packageJsonPath,
      'modify',
      JSON.stringify(packageJson, null, 2),
      undefined,
      'Add dependencies and scripts to package.json',
      'Alex AI',
      'medium'
    );

    console.log(`\n📄 Package.json Modification Result:`);
    console.log(`   Success: ${result.success ? '✅' : '❌'}`);
    console.log(`   File: ${result.filePath}`);
    console.log(`   Reason: ${result.reason}`);
    console.log(`   Crew Consensus: ${result.crewConsensus?.consensus}`);
    console.log(`   Approval Rate: ${result.crewConsensus?.approvalRate}%`);

    // Show crew votes
    if (result.crewConsensus?.votes) {
      console.log(`\n🗳️ Crew Votes:`);
      result.crewConsensus.votes.forEach(vote => {
        console.log(`   ${vote.crewMember}: ${vote.vote} (${vote.confidence}%) - ${vote.reason}`);
      });
    }
  }

  async demonstrateFileDeletion() {
    console.log('\n🗑️ Demonstrating Intelligent File Deletion...');
    console.log('=============================================');

    // Create a temporary file to delete
    const tempFile = path.join(this.demoDir, 'temp-file.txt');
    fs.writeFileSync(tempFile, 'This is a temporary file that will be deleted.');

    const result = await this.fileManipulator.proposeAndExecuteFileChange(
      tempFile,
      'delete',
      undefined,
      undefined,
      'Remove temporary file that is no longer needed',
      'Alex AI',
      'low'
    );

    console.log(`\n📄 File Deletion Result:`);
    console.log(`   Success: ${result.success ? '✅' : '❌'}`);
    console.log(`   File: ${result.filePath}`);
    console.log(`   Reason: ${result.reason}`);
    console.log(`   Crew Consensus: ${result.crewConsensus?.consensus}`);
    console.log(`   Approval Rate: ${result.crewConsensus?.approvalRate}%`);
  }

  async demonstrateCrewConsensus() {
    console.log('\n🗳️ Demonstrating Crew Consensus System...');
    console.log('=========================================');

    // Show active proposals
    const activeProposals = this.consensusManager.getActiveProposals();
    console.log(`\n📋 Active Proposals: ${activeProposals.length}`);

    // Show consensus statistics
    const stats = this.consensusManager.getConsensusStats();
    console.log(`\n📊 Consensus Statistics:`);
    console.log(`   Total Proposals: ${stats.totalProposals}`);
    console.log(`   Approved: ${stats.approvedProposals}`);
    console.log(`   Rejected: ${stats.rejectedProposals}`);
    console.log(`   Pending: ${stats.pendingProposals}`);
    console.log(`   Average Approval Rate: ${stats.averageApprovalRate}%`);

    // Show crew members
    const crewMembers = this.crewManager.getCrewMembers();
    console.log(`\n👥 Crew Members:`);
    crewMembers.forEach(member => {
      console.log(`   ${member.name} (${member.department}) - ${member.specialization}`);
    });
  }

  async showOperationStatistics() {
    console.log('\n📊 Operation Statistics...');
    console.log('==========================');

    const operationLog = this.fileManipulator.getOperationLog();
    console.log(`\n📈 Total Operations: ${operationLog.length}`);

    const successfulOps = operationLog.filter(op => op.success).length;
    const failedOps = operationLog.length - successfulOps;

    console.log(`   Successful: ${successfulOps}`);
    console.log(`   Failed: ${failedOps}`);
    console.log(`   Success Rate: ${Math.round((successfulOps / operationLog.length) * 100)}%`);

    // Show operation breakdown
    const operationTypes = {};
    operationLog.forEach(op => {
      operationTypes[op.operation] = (operationTypes[op.operation] || 0) + 1;
    });

    console.log(`\n📋 Operation Breakdown:`);
    Object.entries(operationTypes).forEach(([type, count]) => {
      console.log(`   ${type}: ${count}`);
    });

    // Show safety status
    const safetyStatus = this.safetyManager.getSafetyStatus();
    console.log(`\n🛡️ Safety Status:`);
    console.log(`   Read-only mode: ${safetyStatus.general.readOnlyMode ? 'Enabled' : 'Disabled'}`);
    console.log(`   Operations this minute: ${safetyStatus.general.operationCount}/${safetyStatus.general.maxOperationsPerMinute}`);
    console.log(`   Resources within limits: ${safetyStatus.resources.withinLimits ? '✅' : '❌'}`);
  }

  async cleanup() {
    console.log('\n🧹 Cleaning up demo...');
    
    // Clean up file manipulator
    this.fileManipulator.clearOperationLog();
    
    // Clean up safety manager
    this.safetyManager.cleanup();

    // Remove demo directory
    if (fs.existsSync(this.demoDir)) {
      fs.rmSync(this.demoDir, { recursive: true, force: true });
    }

    console.log('✅ Cleanup completed');
  }
}

// Run the intelligent file manipulation demo
new IntelligentFileManipulationDemo().run();




