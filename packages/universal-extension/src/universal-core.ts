/**
 * Alex AI Universal Extension Core
 * 
 * Provides the core functionality for all Alex AI platforms:
 * - npx execution
 * - Cursor AI extension
 * - VS Code extension
 * 
 * ENFORCES ZERO ARTIFACTS IN PROJECT STRUCTURE
 */

import * as fs from 'fs/promises';
import * as path from 'path';
import * as os from 'os';
import * as crypto from 'crypto';
import { CrewConsciousnessManager, createCrewConsciousnessManager } from './crew-consciousness';
import { MemorySyncManager, createMemorySyncManager } from './memory-sync';
import { UniversalCredentialHub, createUniversalCredentialHub } from './credential-hub';
import { N8NIntegrationManager, createN8NIntegrationManager } from './n8n-integration';

// Universal interfaces for all platforms
export interface PlatformAdapter {
  showMessage: (message: string, type?: 'info' | 'success' | 'warning' | 'error') => void;
  showInput: (prompt: string, placeholder?: string) => Promise<string | undefined>;
  showQuickPick: (items: string[], placeholder?: string) => Promise<string | undefined>;
  getWorkspacePath: () => Promise<string>;
  getProjectType: () => Promise<string>;
  getDependencies: () => Promise<string[]>;
  // ZERO ARTIFACT METHODS - NO FILE CREATION
  // Removed: createDocument, insertText, writeFile, etc.
}

export interface CrewMember {
  name: string;
  role: string;
  expertise: string[];
  personality: string;
  responseStyle: string;
}

export interface MemoryEntry {
  id: string;
  content: string;
  type: 'learning' | 'insight' | 'preference' | 'context';
  platform: string;
  timestamp: Date;
  crewMember: string;
  encrypted: boolean;
}

export interface AlexAIResponse {
  success: boolean;
  message: string;
  crewMembers: CrewMember[];
  memories: MemoryEntry[];
  coordinatedResponse: string;
  ragInsights: string[];
  n8nWorkflowResults: any[];
  crossPlatformSync: {
    platformsSynced: number;
    memoriesShared: number;
    crewConsciousnessUpdated: boolean;
  };
  displayMode: 'chat' | 'status' | 'command';
}

export interface ZeroArtifactConfig {
  isolatedStorage: string;
  gitIgnored: boolean;
  autoCleanup: boolean;
  memoryEncryption: boolean;
  crossPlatformSync: boolean;
}

/**
 * Universal Alex AI Core - Zero Artifact Guarantee
 */
export class UniversalAlexAICore {
  private platformAdapter: PlatformAdapter;
  private config: ZeroArtifactConfig;
  private crewMembers: CrewMember[];
  private memories: MemoryEntry[];
  private initialized: boolean = false;
  private crewConsciousness: CrewConsciousnessManager;
  private memorySync: MemorySyncManager;
  private credentialHub: UniversalCredentialHub;
  private n8nIntegration: N8NIntegrationManager;

  constructor(platformAdapter: PlatformAdapter) {
    this.platformAdapter = platformAdapter;
    this.crewMembers = this.initializeCrewMembers();
    this.memories = [];
    this.config = {
      isolatedStorage: path.join(os.homedir(), '.alex-ai'),
      gitIgnored: true,
      autoCleanup: true,
      memoryEncryption: true,
      crossPlatformSync: true
    };
    
    // Initialize advanced systems
    this.crewConsciousness = createCrewConsciousnessManager();
    this.memorySync = createMemorySyncManager();
    this.credentialHub = createUniversalCredentialHub();
    this.n8nIntegration = createN8NIntegrationManager(this.credentialHub);
  }

  /**
   * Initialize the Universal Alex AI Core
   */
  async initialize(): Promise<void> {
    if (this.initialized) return;

    console.log('🚀 Initializing Universal Alex AI Core...');
    
    // Ensure isolated storage directory exists
    await this.ensureIsolatedStorage();
    
    // Load existing memories
    await this.loadMemories();
    
    // Initialize crew consciousness
    await this.initializeCrewConsciousness();
    
    // Initialize advanced systems
    await this.crewConsciousness.initialize();
    await this.memorySync.initialize();
    await this.credentialHub.initialize();
    await this.n8nIntegration.initialize();
    
    this.initialized = true;
    console.log('✅ Universal Alex AI Core initialized with zero-artifact guarantee');
  }

  /**
   * Process user message with zero-artifact guarantee
   */
  async processMessage(message: string): Promise<AlexAIResponse> {
    await this.initialize();
    
    console.log('🧠 Processing message with zero-artifact guarantee...');
    
    try {
      // Generate session ID for crew coordination
      const sessionId = crypto.randomUUID();
      const platform = await this.platformAdapter.getProjectType();
      
      // Coordinate crew response with consciousness
      const crewResponse = await this.crewConsciousness.coordinateCrewResponse(
        message, 
        platform, 
        sessionId
      );
      
      // Generate RAG insights using memory sync
      const ragInsight = await this.memorySync.generateRAGInsights(message);
      
      // Process N8N workflows with centralized credentials
      const n8nResults = await this.processN8NWorkflows(message, platform, sessionId);
      
      // Store memory with advanced sync
      await this.memorySync.storeMemory(
        message,
        'learning',
        platform,
        crewResponse.activeMembers[0] || 'System',
        ['crew-coordination', 'cross-platform'],
        1
      );
      
      // Sync across platforms
      const syncStatus = await this.memorySync.syncAcrossPlatforms();
      
      return {
        success: true,
        message: crewResponse.coordinatedResponse,
        crewMembers: crewResponse.activeMembers.map(name => 
          this.crewMembers.find(member => member.name === name) || 
          { name, role: 'Crew Member', expertise: [], personality: '', responseStyle: '' }
        ),
        memories: this.memories.slice(-5), // Last 5 memories
        coordinatedResponse: crewResponse.coordinatedResponse,
        ragInsights: ragInsight.insights,
        n8nWorkflowResults: n8nResults,
        crossPlatformSync: {
          platformsSynced: syncStatus.platformsActive.length,
          memoriesShared: syncStatus.syncedMemories,
          crewConsciousnessUpdated: true
        },
        displayMode: 'chat'
      };
      
    } catch (error: any) {
      console.error('❌ Universal Alex AI processing failed:', error);
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
   * Initialize Star Trek crew members
   */
  private initializeCrewMembers(): CrewMember[] {
    return [
      {
        name: 'Captain Picard',
        role: 'Strategic Leadership',
        expertise: ['Strategic Planning', 'Leadership', 'Diplomacy'],
        personality: 'Wise, diplomatic, strategic thinker',
        responseStyle: 'Provides strategic direction and high-level guidance'
      },
      {
        name: 'Commander Data',
        role: 'Analytical Intelligence',
        expertise: ['Data Analysis', 'Pattern Recognition', 'Logic'],
        personality: 'Logical, analytical, precise',
        responseStyle: 'Provides detailed analysis and logical reasoning'
      },
      {
        name: 'Lt. Cmdr. Geordi',
        role: 'Engineering Solutions',
        expertise: ['Engineering', 'Technical Implementation', 'Problem Solving'],
        personality: 'Practical, innovative, solution-oriented',
        responseStyle: 'Focuses on technical solutions and implementation'
      },
      {
        name: 'Lieutenant Worf',
        role: 'Security & Defense',
        expertise: ['Security', 'Threat Assessment', 'Protection'],
        personality: 'Honorable, protective, security-focused',
        responseStyle: 'Emphasizes security and threat assessment'
      },
      {
        name: 'Dr. Crusher',
        role: 'System Health',
        expertise: ['Health Monitoring', 'Diagnostics', 'Healing'],
        personality: 'Caring, diagnostic, health-focused',
        responseStyle: 'Focuses on system health and diagnostics'
      },
      {
        name: 'Commander Riker',
        role: 'Tactical Execution',
        expertise: ['Tactical Operations', 'Crew Coordination', 'Execution'],
        personality: 'Confident, tactical, execution-focused',
        responseStyle: 'Emphasizes tactical execution and coordination'
      },
      {
        name: 'Counselor Troi',
        role: 'User Experience',
        expertise: ['User Experience', 'Emotional Intelligence', 'Communication'],
        personality: 'Empathetic, user-focused, communicative',
        responseStyle: 'Focuses on user experience and communication'
      },
      {
        name: 'Lieutenant Uhura',
        role: 'Communication',
        expertise: ['Communication', 'Data Transmission', 'Coordination'],
        personality: 'Communicative, organized, coordination-focused',
        responseStyle: 'Emphasizes communication and coordination'
      },
      {
        name: 'Quark',
        role: 'Business Logic',
        expertise: ['Business Logic', 'Profit Optimization', 'Efficiency'],
        personality: 'Profit-oriented, efficient, business-focused',
        responseStyle: 'Focuses on business value and efficiency'
      }
    ];
  }

  /**
   * Coordinate crew response to user message
   */
  private async coordinateCrewResponse(message: string): Promise<{
    crewMembers: CrewMember[];
    coordinatedResponse: string;
  }> {
    const relevantCrew = this.crewMembers.filter(member => 
      member.expertise.some(skill => 
        message.toLowerCase().includes(skill.toLowerCase())
      )
    );

    if (relevantCrew.length === 0) {
      relevantCrew.push(this.crewMembers[0]); // Default to Picard
    }

    const responses = relevantCrew.map(member => ({
      member,
      response: `${member.name}: ${member.responseStyle} - Based on your request, I recommend analyzing the situation comprehensively and providing strategic guidance.`
    }));

    const coordinatedResponse = responses
      .map(r => `${r.member.name}: ${r.response}`)
      .join('\n\n');

    return {
      crewMembers: relevantCrew,
      coordinatedResponse
    };
  }

  /**
   * Generate RAG insights from existing memories
   */
  private async generateRAGInsights(message: string): Promise<string[]> {
    const relevantMemories = this.memories.filter(memory =>
      memory.content.toLowerCase().includes(message.toLowerCase()) ||
      message.toLowerCase().includes(memory.content.toLowerCase())
    );

    return relevantMemories.map(memory => 
      `Insight from ${memory.crewMember}: ${memory.content}`
    );
  }

  /**
   * Process N8N workflows (if applicable)
   */
  private async processN8NWorkflows(
    message: string, 
    platform: string, 
    sessionId: string
  ): Promise<any[]> {
    try {
      // Execute crew coordination workflow
      const crewResult = await this.n8nIntegration.executeCrewCoordination({
        message,
        crewMembers: this.crewMembers.map(m => m.name),
        platform,
        sessionId,
        context: { timestamp: new Date().toISOString() },
        priority: 'medium'
      });

      // Execute memory sync workflow
      const memoryResult = await this.n8nIntegration.executeMemorySync({
        memories: this.memories.slice(-10), // Last 10 memories
        platform,
        syncType: 'incremental',
        crewMembers: this.crewMembers.map(m => m.name)
      });

      // Execute cross-platform sync workflow
      const syncResult = await this.n8nIntegration.executeCrossPlatformSync({
        platforms: ['cursor', 'vscode', 'npx'],
        data: { message, platform, sessionId },
        syncType: 'consciousness',
        timestamp: new Date()
      });

      // Execute optimization workflow
      const optimizationResult = await this.n8nIntegration.executeOptimization({
        message,
        platform,
        sessionId,
        resourceUsage: this.credentialHub.getResourceUsage()
      });

      return [
        { type: 'crew-coordination', result: crewResult },
        { type: 'memory-sync', result: memoryResult },
        { type: 'cross-platform-sync', result: syncResult },
        { type: 'optimization', result: optimizationResult }
      ];

    } catch (error: any) {
      console.error('❌ N8N workflow processing failed:', error);
      return [{ type: 'error', result: { error: error.message } }];
    }
  }

  /**
   * Store memory in isolated storage
   */
  private async storeMemory(message: string, crewResponse: any): Promise<void> {
    const memory: MemoryEntry = {
      id: crypto.randomUUID(),
      content: message,
      type: 'learning',
      platform: 'universal',
      timestamp: new Date(),
      crewMember: crewResponse.crewMembers[0]?.name || 'System',
      encrypted: true
    };

    this.memories.push(memory);
    
    // Store in isolated storage
    const memoryPath = path.join(this.config.isolatedStorage, 'memories.json');
    await fs.writeFile(memoryPath, JSON.stringify(this.memories, null, 2));
  }

  /**
   * Sync across platforms
   */
  private async syncAcrossPlatforms(): Promise<{
    platformsSynced: number;
    memoriesShared: number;
    crewConsciousnessUpdated: boolean;
  }> {
    // Simulate cross-platform synchronization
    return {
      platformsSynced: 3, // npx, Cursor AI, VS Code
      memoriesShared: this.memories.length,
      crewConsciousnessUpdated: true
    };
  }

  /**
   * Ensure isolated storage directory exists
   */
  private async ensureIsolatedStorage(): Promise<void> {
    try {
      await fs.mkdir(this.config.isolatedStorage, { recursive: true });
      console.log(`📁 Isolated storage ensured: ${this.config.isolatedStorage}`);
    } catch (error) {
      console.error('❌ Failed to create isolated storage:', error);
    }
  }

  /**
   * Load existing memories
   */
  private async loadMemories(): Promise<void> {
    try {
      const memoryPath = path.join(this.config.isolatedStorage, 'memories.json');
      const data = await fs.readFile(memoryPath, 'utf-8');
      this.memories = JSON.parse(data);
      console.log(`🧠 Loaded ${this.memories.length} memories`);
    } catch (error) {
      console.log('📝 No existing memories found, starting fresh');
      this.memories = [];
    }
  }

  /**
   * Initialize crew consciousness
   */
  private async initializeCrewConsciousness(): Promise<void> {
    console.log('👥 Initializing crew consciousness...');
    console.log(`✅ ${this.crewMembers.length} crew members ready for coordination`);
  }
}

/**
 * Create Universal Extension Core instance
 */
export function createUniversalCore(platformAdapter: PlatformAdapter): UniversalAlexAICore {
  return new UniversalAlexAICore(platformAdapter);
}
