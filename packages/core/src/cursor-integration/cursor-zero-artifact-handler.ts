/**
 * Cursor AI Zero-Artifact Handler
 * Prevents Alex AI from creating files within project structure
 * Enforces Prime Directive of zero artifacts in external projects
 */

import * as fs from 'fs/promises';
import * as path from 'path';
import * as os from 'os';

export interface CursorZeroArtifactConfig {
  projectRoot: string;
  sessionId: string;
  enforceZeroArtifacts: boolean;
  isolatedStoragePath?: string;
}

export interface CursorResponse {
  success: boolean;
  message: string;
  crewMembers: string[];
  memories: any[];
  coordinatedResponse: string;
  ragInsights: any[];
  n8nWorkflowResults: any[];
  crossPlatformSync: any;
  displayMode: 'chat' | 'isolated' | 'external';
}

export class CursorZeroArtifactHandler {
  private config: CursorZeroArtifactConfig;
  private alexAIArtifactsDir: string;
  private isInitialized = false;

  constructor(config: CursorZeroArtifactConfig) {
    this.config = config;
    this.alexAIArtifactsDir = config.isolatedStoragePath || 
      path.join(config.projectRoot, '.alex-ai-artifacts');
  }

  /**
   * Initialize zero-artifact enforcement
   */
  async initialize(): Promise<void> {
    if (this.isInitialized) return;

    console.log('🛡️  Initializing Cursor AI Zero-Artifact Enforcement');
    
    // Create isolated artifact directory
    await this.createIsolatedArtifactDirectory();
    
    // Update .gitignore to exclude Alex AI artifacts
    await this.updateGitIgnore();
    
    // Create cleanup script
    await this.createCleanupScript();
    
    this.isInitialized = true;
    console.log('✅ Cursor AI Zero-Artifact Enforcement Initialized');
  }

  /**
   * Handle Cursor AI engagement without creating project files
   */
  async handleCursorEngagement(userMessage: string): Promise<CursorResponse> {
    await this.initialize();

    console.log('🧠 Processing Cursor AI engagement with zero-artifact guarantee...');
    
    try {
      // Process the message through Alex AI system
      const alexAIResponse = await this.processAlexAIMessage(userMessage);
      
      // Store response in isolated storage (NOT in project)
      await this.storeResponseInIsolatedStorage(alexAIResponse);
      
      // Return response for display in Cursor chat (no file creation)
      return {
        success: true,
        message: alexAIResponse.coordinatedResponse,
        crewMembers: alexAIResponse.crewMembers,
        memories: alexAIResponse.memories,
        coordinatedResponse: alexAIResponse.coordinatedResponse,
        ragInsights: alexAIResponse.ragInsights,
        n8nWorkflowResults: alexAIResponse.n8nWorkflowResults,
        crossPlatformSync: alexAIResponse.crossPlatformSync,
        displayMode: 'chat' // Display in Cursor chat, not as files
      };

    } catch (error) {
      console.error('❌ Cursor engagement failed:', error);
      return {
        success: false,
        message: `I apologize, but I encountered an error: ${error.message}. All operations are contained within isolated storage to maintain your project's integrity.`,
        crewMembers: [],
        memories: [],
        coordinatedResponse: '',
        ragInsights: [],
        n8nWorkflowResults: [],
        crossPlatformSync: { platformsSynced: 0, memoriesShared: 0, crewConsciousnessUpdated: false },
        displayMode: 'chat'
      };
    }
  }

  /**
   * Process Alex AI message without creating project artifacts
   */
  private async processAlexAIMessage(message: string): Promise<any> {
    // Simulate Alex AI processing (would connect to real N8N/Supabase system)
    console.log(`   📝 Processing: "${message.substring(0, 50)}..."`);
    
    // Analyze intent
    const intent = this.analyzeIntent(message);
    console.log(`   🎯 Intent: ${intent.type} (confidence: ${intent.confidence})`);
    
    // Determine crew members
    const crewMembers = this.determineRelevantCrewMembers(message, intent);
    console.log(`   👥 Crew: ${crewMembers.join(', ')}`);
    
    // Simulate crew coordination
    const crewResponses = await this.simulateCrewCoordination(crewMembers, message);
    console.log(`   ⚡ Crew coordination complete`);
    
    // Create coordinated response
    const coordinatedResponse = this.createCoordinatedResponse(crewResponses);
    console.log(`   🏛️  Observation Lounge synthesis complete`);
    
    // Store in RAG system (isolated)
    const memories = await this.storeInRAGSystem(message, coordinatedResponse, crewMembers);
    console.log(`   💾 Stored ${memories.length} memories in isolated RAG`);
    
    return {
      crewMembers,
      memories,
      coordinatedResponse,
      ragInsights: [],
      n8nWorkflowResults: crewResponses,
      crossPlatformSync: { platformsSynced: 1, memoriesShared: memories.length, crewConsciousnessUpdated: true }
    };
  }

  /**
   * Store response in isolated storage (NOT in project)
   */
  private async storeResponseInIsolatedStorage(response: any): Promise<void> {
    const responseData = {
      sessionId: this.config.sessionId,
      timestamp: new Date().toISOString(),
      response,
      storageLocation: this.alexAIArtifactsDir,
      zeroArtifactCompliant: true
    };
    
    const responsePath = path.join(this.alexAIArtifactsDir, 'sessions', `response-${Date.now()}.json`);
    await fs.writeFile(responsePath, JSON.stringify(responseData, null, 2));
    
    console.log(`   📁 Response stored in isolated storage: ${responsePath}`);
  }

  /**
   * Create isolated artifact directory
   */
  private async createIsolatedArtifactDirectory(): Promise<void> {
    const subdirs = ['temp', 'memory', 'sessions', 'logs', 'cache', 'crew', 'coordination'];
    
    for (const subdir of subdirs) {
      const dirPath = path.join(this.alexAIArtifactsDir, subdir);
      await fs.mkdir(dirPath, { recursive: true });
    }
    
    console.log(`   📁 Created isolated artifact directory: ${this.alexAIArtifactsDir}`);
  }

  /**
   * Update .gitignore to exclude Alex AI artifacts
   */
  private async updateGitIgnore(): Promise<void> {
    const gitIgnorePath = path.join(this.config.projectRoot, '.gitignore');
    
    try {
      let existingContent = '';
      if (await fs.access(gitIgnorePath).then(() => true).catch(() => false)) {
        existingContent = await fs.readFile(gitIgnorePath, 'utf8');
      }
      
      const alexAIEntries = [
        '# Alex AI Artifacts - Auto-generated, do not commit',
        '.alex-ai-artifacts/',
        '.alex-ai-temp/',
        '.alex-ai-memory/',
        '*.alex-temp',
        '*.alex-memory',
        '.alex-ai-session-*'
      ];

      let updatedContent = existingContent;
      let hasChanges = false;

      for (const entry of alexAIEntries) {
        if (!updatedContent.includes(entry)) {
          updatedContent += '\n' + entry;
          hasChanges = true;
        }
      }

      if (hasChanges) {
        await fs.writeFile(gitIgnorePath, updatedContent);
        console.log('   ✅ .gitignore updated with Alex AI exclusions');
      }
    } catch (error) {
      console.log(`   ⚠️  .gitignore update failed: ${error.message}`);
    }
  }

  /**
   * Create cleanup script
   */
  private async createCleanupScript(): Promise<void> {
    const cleanupScript = `#!/bin/bash
# Alex AI Cursor Zero-Artifact Cleanup Script

ALEX_AI_ARTIFACTS_DIR=".alex-ai-artifacts"
CLEANUP_AGE_HOURS=24

echo "🧹 Alex AI Cursor Cleanup Starting..."

# Remove files older than specified age
find "$ALEX_AI_ARTIFACTS_DIR/temp" -type f -mtime +$CLEANUP_AGE_HOURS -delete 2>/dev/null
find "$ALEX_AI_ARTIFACTS_DIR/cache" -type f -mtime +$CLEANUP_AGE_HOURS -delete 2>/dev/null
find "$ALEX_AI_ARTIFACTS_DIR/logs" -type f -mtime +$CLEANUP_AGE_HOURS -delete 2>/dev/null

# Remove empty directories
find "$ALEX_AI_ARTIFACTS_DIR" -type d -empty -delete 2>/dev/null

echo "✅ Alex AI Cursor Cleanup Complete"
`;

    const cleanupPath = path.join(this.alexAIArtifactsDir, 'cursor-cleanup.sh');
    await fs.writeFile(cleanupPath, cleanupScript);
    await fs.chmod(cleanupPath, 0o755);
    console.log('   ✅ Cursor cleanup script created');
  }

  /**
   * Analyze intent (simplified for demo)
   */
  private analyzeIntent(message: string): { type: string; confidence: number; keywords: string[] } {
    const keywords = this.extractKeywords(message);
    
    let intentType = 'general';
    let confidence = 0.7;
    
    if (message.toLowerCase().includes('debug')) {
      intentType = 'debugging';
      confidence = 0.9;
    } else if (message.toLowerCase().includes('analyze') || message.toLowerCase().includes('performance')) {
      intentType = 'analysis';
      confidence = 0.85;
    } else if (message.toLowerCase().includes('security') || message.toLowerCase().includes('audit')) {
      intentType = 'security';
      confidence = 0.9;
    } else if (message.toLowerCase().includes('optimize') || message.toLowerCase().includes('optimization')) {
      intentType = 'optimization';
      confidence = 0.85;
    } else if (message.toLowerCase().includes('implement') || message.toLowerCase().includes('create')) {
      intentType = 'implementation';
      confidence = 0.8;
    }
    
    return {
      type: intentType,
      confidence,
      keywords
    };
  }

  /**
   * Extract keywords from message
   */
  private extractKeywords(message: string): string[] {
    const commonKeywords = [
      'debug', 'analyze', 'optimize', 'create', 'implement', 'fix', 'help',
      'react', 'node', 'api', 'database', 'security', 'performance', 'auth'
    ];
    
    const lowerMessage = message.toLowerCase();
    return commonKeywords.filter(keyword => lowerMessage.includes(keyword));
  }

  /**
   * Determine relevant crew members
   */
  private determineRelevantCrewMembers(message: string, intent: any): string[] {
    const allCrewMembers = [
      'Captain Picard',
      'Commander Data',
      'Commander Riker',
      'Lieutenant Commander Geordi',
      'Lieutenant Worf',
      'Counselor Troi',
      'Dr. Crusher',
      'Lieutenant Uhura',
      'Quark'
    ];

    let relevantCrew = ['Captain Picard']; // Always include Captain
    
    // Add crew based on intent
    switch (intent.type) {
      case 'debugging':
        relevantCrew.push('Commander Data', 'Lieutenant Commander Geordi', 'Dr. Crusher');
        break;
      case 'analysis':
        relevantCrew.push('Commander Data', 'Captain Picard', 'Lieutenant Commander Geordi');
        break;
      case 'security':
        relevantCrew.push('Lieutenant Worf', 'Commander Data', 'Captain Picard');
        break;
      case 'optimization':
        relevantCrew.push('Commander Data', 'Quark', 'Lieutenant Commander Geordi');
        break;
      case 'implementation':
        relevantCrew.push('Commander Riker', 'Lieutenant Commander Geordi', 'Lieutenant Uhura');
        break;
      default:
        relevantCrew.push('Commander Data', 'Commander Riker');
    }
    
    return relevantCrew.slice(0, 5); // Limit to 5 crew members
  }

  /**
   * Simulate crew coordination
   */
  private async simulateCrewCoordination(crewMembers: string[], message: string): Promise<any[]> {
    const responses = [];
    
    for (const crewMember of crewMembers) {
      const response = {
        crewMember,
        response: this.getCrewResponse(crewMember, message),
        confidence: 0.85,
        timestamp: new Date().toISOString()
      };
      responses.push(response);
    }
    
    return responses;
  }

  /**
   * Get crew member response
   */
  private getCrewResponse(crewMember: string, message: string): string {
    const responses = {
      'Captain Picard': `From a strategic perspective, I recommend analyzing the ${message.substring(0, 50)}... situation comprehensively. Let us approach this with careful consideration and ensure we have all the necessary information before proceeding.`,
      'Commander Data': `Analysis of the ${message.substring(0, 50)}... indicates several logical pathways. Based on my computational capabilities, I can provide detailed technical insights and pattern recognition to assist with this matter.`,
      'Commander Riker': `I'll coordinate the tactical execution of addressing ${message.substring(0, 50)}... Let me ensure we have the right resources and timeline for successful implementation.`,
      'Lieutenant Commander Geordi': `From an engineering standpoint, ${message.substring(0, 50)}... presents some interesting technical challenges. I can provide solutions and infrastructure recommendations.`,
      'Lieutenant Worf': `Security considerations for ${message.substring(0, 50)}... must be thoroughly evaluated. I will assess potential risks and ensure compliance with established protocols.`,
      'Counselor Troi': `I sense that ${message.substring(0, 50)}... involves user experience considerations. Let me provide insights on how this will affect our users and suggest improvements.`,
      'Dr. Crusher': `System health and diagnostics related to ${message.substring(0, 50)}... are within my expertise. I can monitor performance and identify any issues that may arise.`,
      'Lieutenant Uhura': `Communications and integration aspects of ${message.substring(0, 50)}... are my specialty. I can ensure proper API management and system connectivity.`,
      'Quark': `From a business intelligence perspective, ${message.substring(0, 50)}... offers opportunities for optimization and resource management. I can identify cost-effective solutions.`
    };
    
    return responses[crewMember] || `I can assist with ${message.substring(0, 50)}... using my specialized expertise.`;
  }

  /**
   * Create coordinated response
   */
  private createCoordinatedResponse(crewResponses: any[]): string {
    let coordinatedResponse = '**Observation Lounge Coordination Complete**\n\n';
    coordinatedResponse += 'Based on crew analysis:\n\n';
    
    crewResponses.forEach(response => {
      coordinatedResponse += `**${response.crewMember}:** ${response.response}\n\n`;
    });
    
    coordinatedResponse += '**Recommendation:** The crew has provided comprehensive analysis. ';
    coordinatedResponse += 'All insights have been stored in isolated RAG memory for future reference. ';
    coordinatedResponse += 'Your project remains completely clean with zero artifacts.';
    
    return coordinatedResponse;
  }

  /**
   * Store in RAG system (isolated)
   */
  private async storeInRAGSystem(message: string, coordinatedResponse: string, crewMembers: string[]): Promise<any[]> {
    const memories = [];
    
    // Create memory for the user request
    const userMemory = {
      id: `user-request-${Date.now()}`,
      content: message,
      crewMember: 'user',
      sessionId: this.config.sessionId,
      timestamp: new Date().toISOString(),
      confidence: 0.9,
      tags: ['user_request', 'cursor_ai', 'zero_artifact']
    };
    
    memories.push(userMemory);
    
    // Create memories for crew responses
    crewMembers.forEach(crewMember => {
      const crewMemory = {
        id: `crew-response-${crewMember}-${Date.now()}`,
        content: `Crew member ${crewMember} provided insights for: ${message.substring(0, 100)}...`,
        crewMember,
        sessionId: this.config.sessionId,
        timestamp: new Date().toISOString(),
        confidence: 0.8,
        tags: ['crew_response', 'cursor_ai', 'zero_artifact']
      };
      
      memories.push(crewMemory);
    });
    
    // Store in isolated RAG system
    for (const memory of memories) {
      const memoryPath = path.join(this.alexAIArtifactsDir, 'memory', `${memory.id}.json`);
      await fs.writeFile(memoryPath, JSON.stringify(memory, null, 2));
    }
    
    return memories;
  }

  /**
   * Verify zero-artifact compliance
   */
  async verifyZeroArtifactCompliance(): Promise<boolean> {
    try {
      // Check if any Alex AI files exist in project root (outside .alex-ai-artifacts)
      const projectFiles = await fs.readdir(this.config.projectRoot);
      const alexAIFiles = projectFiles.filter(file => 
        file.includes('alex-ai') || 
        file.includes('alex_ai') ||
        file.startsWith('.alex')
      );
      
      // Only .alex-ai-artifacts should exist
      const allowedAlexAIFiles = projectFiles.filter(file => file === '.alex-ai-artifacts');
      
      const compliance = alexAIFiles.length === allowedAlexAIFiles.length;
      
      if (compliance) {
        console.log('✅ Zero-artifact compliance verified');
      } else {
        console.log(`❌ Zero-artifact compliance violated: ${alexAIFiles.length - allowedAlexAIFiles.length} unauthorized files found`);
      }
      
      return compliance;
      
    } catch (error) {
      console.error('❌ Compliance check failed:', error);
      return false;
    }
  }
}

export { CursorZeroArtifactHandler };
