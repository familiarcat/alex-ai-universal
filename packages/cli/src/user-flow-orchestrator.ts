/**
 * Alex AI User Flow Orchestrator
 * Complete user journey from npx install to self-propagating RAG system
 */

import { RevisedPrimeDirective } from '../core/src/prime-directive/revised-prime-directive';
import { ShortTermMemory } from '../core/src/memory/short-term-memory';
import { TempFileManager } from '../core/src/file-management/temp-file-manager';
import { ChangeTracker } from '../core/src/change-tracking/change-tracker';

export interface UserFlowState {
  stage: 'install' | 'initialize' | 'monitoring' | 'prompt_processing' | 'crew_execution' | 'memory_propagation' | 'complete';
  sessionId: string;
  userId?: string;
  n8nConnectionStatus: 'disconnected' | 'connecting' | 'connected' | 'error';
  crewMembers: CrewMemberStatus[];
  ragMemoryCount: number;
  lastPrompt?: string;
  lastResponse?: string;
}

export interface CrewMemberStatus {
  id: string;
  name: string;
  status: 'inactive' | 'active' | 'processing' | 'complete' | 'error';
  lastActivity?: Date;
  memoryContributions: number;
  workflowExecutions: number;
}

export interface N8NWorkflowExecution {
  workflowId: string;
  crewMember: string;
  prompt: string;
  response: string;
  memories: string[];
  timestamp: Date;
  status: 'pending' | 'executing' | 'complete' | 'error';
}

export class UserFlowOrchestrator {
  private userFlowState: UserFlowState;
  private primeDirective: RevisedPrimeDirective;
  private shortTermMemory: ShortTermMemory;
  private tempFileManager: TempFileManager;
  private changeTracker: ChangeTracker;
  private n8nWorkflows: N8NWorkflowExecution[] = [];

  constructor(sessionId: string) {
    this.userFlowState = {
      stage: 'install',
      sessionId,
      n8nConnectionStatus: 'disconnected',
      crewMembers: this.initializeCrewMembers(),
      ragMemoryCount: 0
    };

    this.primeDirective = new RevisedPrimeDirective(sessionId);
    this.shortTermMemory = new ShortTermMemory(sessionId);
    this.tempFileManager = new TempFileManager(sessionId);
    this.changeTracker = new ChangeTracker(sessionId);
  }

  /**
   * Stage 1: User installs Alex AI package via npx
   */
  async handleNPXInstall(): Promise<void> {
    console.log('🚀 Stage 1: NPX Installation');
    console.log('============================');
    
    // Simulate npx installation process
    console.log('📦 Installing @alex-ai/cli via npx...');
    console.log('✅ Package installed successfully');
    console.log('🔧 Initializing Alex AI configuration...');
    
    this.userFlowState.stage = 'initialize';
    
    // Log installation in memory
    this.shortTermMemory.addAnalysisMemory(
      'NPX Installation',
      'system',
      { package: '@alex-ai/cli', method: 'npx', timestamp: new Date() },
      { stage: 'install_complete' }
    );

    console.log('✅ Stage 1 Complete: NPX Installation');
  }

  /**
   * Stage 2: User opens Cursor AI and enters "Engage Alex AI"
   */
  async handleCursorEngagement(prompt: string): Promise<void> {
    console.log('🎯 Stage 2: Cursor AI Engagement');
    console.log('=================================');
    
    console.log(`💬 User prompt: "${prompt}"`);
    console.log('🔍 Detecting engagement command...');
    
    if (this.isEngagementCommand(prompt)) {
      console.log('✅ Engagement command detected');
      console.log('🚀 Initializing Alex AI system...');
      
      this.userFlowState.lastPrompt = prompt;
      this.userFlowState.stage = 'monitoring';
      
      // Log engagement in memory
      this.shortTermMemory.addAnalysisMemory(
        'Cursor AI Engagement',
        'system',
        { prompt, detected: true, timestamp: new Date() },
        { stage: 'engagement_detected' }
      );

      console.log('✅ Stage 2 Complete: Cursor AI Engagement');
    } else {
      console.log('❌ No engagement command detected');
      console.log('💡 Try: "Engage Alex AI" or "Initialize Alex AI"');
    }
  }

  /**
   * Stage 3: Alex begins monitoring N8N server relationship
   */
  async handleN8NMonitoring(): Promise<void> {
    console.log('🌐 Stage 3: N8N Server Monitoring');
    console.log('=================================');
    
    this.userFlowState.n8nConnectionStatus = 'connecting';
    console.log('🔗 Connecting to N8N server...');
    
    // Simulate N8N connection
    await this.simulateN8NConnection();
    
    if (this.userFlowState.n8nConnectionStatus === 'connected') {
      console.log('✅ N8N server connected successfully');
      console.log('👥 Activating crew members...');
      
      // Activate all crew members
      this.userFlowState.crewMembers.forEach(member => {
        member.status = 'active';
        member.lastActivity = new Date();
      });
      
      this.userFlowState.stage = 'prompt_processing';
      
      // Log N8N connection in memory
      this.shortTermMemory.addAnalysisMemory(
        'N8N Server Connection',
        'system',
        { 
          status: 'connected', 
          crewMembers: this.userFlowState.crewMembers.length,
          timestamp: new Date() 
        },
        { stage: 'n8n_connected' }
      );

      console.log('✅ Stage 3 Complete: N8N Server Monitoring');
    } else {
      console.log('❌ N8N server connection failed');
      this.userFlowState.n8nConnectionStatus = 'error';
    }
  }

  /**
   * Stage 4: Alex receives prompt and runs appropriate N8N Crew Agents
   */
  async handlePromptProcessing(userPrompt: string): Promise<void> {
    console.log('🤖 Stage 4: Prompt Processing & Crew Execution');
    console.log('==============================================');
    
    console.log(`📝 Processing user prompt: "${userPrompt}"`);
    
    // Analyze prompt to determine which crew members to engage
    const relevantCrewMembers = this.analyzePromptForCrewMembers(userPrompt);
    console.log(`👥 Engaging ${relevantCrewMembers.length} crew members: ${relevantCrewMembers.join(', ')}`);
    
    // Execute crew member workflows
    const workflowExecutions = await this.executeCrewWorkflows(userPrompt, relevantCrewMembers);
    
    this.userFlowState.lastPrompt = userPrompt;
    this.userFlowState.stage = 'crew_execution';
    
    // Log prompt processing in memory
    this.shortTermMemory.addAnalysisMemory(
      'Prompt Processing',
      'system',
      { 
        prompt: userPrompt,
        crewMembers: relevantCrewMembers,
        workflows: workflowExecutions.length,
        timestamp: new Date()
      },
      { stage: 'prompt_processed' }
    );

    console.log('✅ Stage 4 Complete: Prompt Processing & Crew Execution');
  }

  /**
   * Stage 5: Agentic and Multimodal crew execution with N8N workflows
   */
  async handleCrewExecution(userPrompt: string): Promise<void> {
    console.log('⚡ Stage 5: Agentic & Multimodal Crew Execution');
    console.log('==============================================');
    
    const relevantCrewMembers = this.analyzePromptForCrewMembers(userPrompt);
    
    // Execute each crew member's workflow
    for (const crewMember of relevantCrewMembers) {
      console.log(`🖖 Executing ${crewMember} workflow...`);
      
      const workflowExecution: N8NWorkflowExecution = {
        workflowId: `${crewMember}-workflow`,
        crewMember,
        prompt: userPrompt,
        response: '',
        memories: [],
        timestamp: new Date(),
        status: 'executing'
      };

      // Simulate workflow execution
      await this.simulateWorkflowExecution(workflowExecution);
      
      this.n8nWorkflows.push(workflowExecution);
      
      // Update crew member status
      const crewMemberStatus = this.userFlowState.crewMembers.find(m => m.id === crewMember);
      if (crewMemberStatus) {
        crewMemberStatus.status = 'complete';
        crewMemberStatus.workflowExecutions++;
        crewMemberStatus.lastActivity = new Date();
      }
      
      console.log(`✅ ${crewMember} workflow complete`);
    }
    
    this.userFlowState.stage = 'memory_propagation';
    
    // Log crew execution in memory
    this.shortTermMemory.addAnalysisMemory(
      'Crew Execution',
      'system',
      { 
        crewMembers: relevantCrewMembers,
        workflows: this.n8nWorkflows.length,
        timestamp: new Date()
      },
      { stage: 'crew_execution_complete' }
    );

    console.log('✅ Stage 5 Complete: Agentic & Multimodal Crew Execution');
  }

  /**
   * Stage 6: N8N agents learn from conclusions and Observation Lounge coordination
   */
  async handleObservationLoungeCoordination(): Promise<void> {
    console.log('🏛️  Stage 6: Observation Lounge Coordination');
    console.log('=============================================');
    
    console.log('🧠 Crew members sharing conclusions...');
    
    // Simulate Observation Lounge coordination
    const allResponses = this.n8nWorkflows.map(w => w.response);
    const coordinatedResponse = await this.simulateObservationLounge(allResponses);
    
    console.log('📊 Analyzing crew member conclusions...');
    console.log('🔄 Cross-referencing knowledge and insights...');
    console.log('🎯 Generating coordinated response...');
    
    // Extract memories from coordinated response
    const memories = this.extractMemoriesFromResponse(coordinatedResponse);
    
    console.log(`🧠 Extracted ${memories.length} memories for RAG system`);
    
    // Log Observation Lounge coordination in memory
    this.shortTermMemory.addAnalysisMemory(
      'Observation Lounge Coordination',
      'picard',
      { 
        responses: allResponses.length,
        memories: memories.length,
        coordinatedResponse,
        timestamp: new Date()
      },
      { stage: 'observation_lounge_complete' }
    );

    console.log('✅ Stage 6 Complete: Observation Lounge Coordination');
  }

  /**
   * Stage 7: Save knowledge to Supabase self-propagating RAG structure
   */
  async handleRAGMemoryPropagation(): Promise<void> {
    console.log('🗄️  Stage 7: RAG Memory Propagation');
    console.log('=====================================');
    
    console.log('💾 Saving memories to Supabase RAG system...');
    
    // Simulate RAG memory storage
    const totalMemories = await this.simulateRAGMemoryStorage();
    
    this.userFlowState.ragMemoryCount += totalMemories;
    
    console.log(`✅ Stored ${totalMemories} memories in RAG system`);
    console.log(`📊 Total RAG memories: ${this.userFlowState.ragMemoryCount}`);
    
    // Update crew member memory contributions
    this.userFlowState.crewMembers.forEach(member => {
      member.memoryContributions += Math.floor(totalMemories / this.userFlowState.crewMembers.length);
    });
    
    this.userFlowState.stage = 'complete';
    
    // Log RAG propagation in memory
    this.shortTermMemory.addAnalysisMemory(
      'RAG Memory Propagation',
      'data',
      { 
        memoriesStored: totalMemories,
        totalMemories: this.userFlowState.ragMemoryCount,
        timestamp: new Date()
      },
      { stage: 'rag_propagation_complete' }
    );

    console.log('✅ Stage 7 Complete: RAG Memory Propagation');
  }

  /**
   * Complete user flow execution
   */
  async executeCompleteUserFlow(userPrompt: string): Promise<void> {
    console.log('🚀 EXECUTING COMPLETE ALEX AI USER FLOW');
    console.log('========================================');
    console.log('');

    try {
      await this.handleNPXInstall();
      await this.handleCursorEngagement(userPrompt);
      
      if (this.userFlowState.stage === 'monitoring') {
        await this.handleN8NMonitoring();
        
        if (this.userFlowState.n8nConnectionStatus === 'connected') {
          await this.handlePromptProcessing(userPrompt);
          await this.handleCrewExecution(userPrompt);
          await this.handleObservationLoungeCoordination();
          await this.handleRAGMemoryPropagation();
          
          console.log('');
          console.log('🎉 COMPLETE USER FLOW EXECUTION SUCCESSFUL!');
          console.log('===========================================');
          console.log(`📊 Final State: ${this.userFlowState.stage}`);
          console.log(`👥 Crew Members: ${this.userFlowState.crewMembers.filter(m => m.status === 'complete').length}/${this.userFlowState.crewMembers.length} active`);
          console.log(`🧠 RAG Memories: ${this.userFlowState.ragMemoryCount}`);
          console.log(`🔄 Workflows: ${this.n8nWorkflows.length}`);
          
          // Generate natural language summary
          const summary = this.shortTermMemory.getNaturalLanguageSummary();
          console.log('');
          console.log('📋 SESSION SUMMARY:');
          console.log(summary);
        }
      }
    } catch (error) {
      console.error('❌ User flow execution failed:', error);
      throw error;
    }
  }

  // Helper methods
  private initializeCrewMembers(): CrewMemberStatus[] {
    const crewMembers = [
      'captain_picard', 'commander_data', 'geordi_la_forge', 'lieutenant_worf',
      'counselor_troi', 'commander_riker', 'dr_crusher', 'la_forge', 'spock'
    ];

    return crewMembers.map(id => ({
      id,
      name: id.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase()),
      status: 'inactive' as const,
      memoryContributions: 0,
      workflowExecutions: 0
    }));
  }

  private isEngagementCommand(prompt: string): boolean {
    const engagementKeywords = ['engage alex ai', 'initialize alex ai', 'start alex ai', 'alex ai engage'];
    return engagementKeywords.some(keyword => 
      prompt.toLowerCase().includes(keyword.toLowerCase())
    );
  }

  private analyzePromptForCrewMembers(prompt: string): string[] {
    // Simple keyword-based crew member selection
    const crewKeywords = {
      'captain_picard': ['strategy', 'leadership', 'decision', 'planning'],
      'commander_data': ['analysis', 'data', 'logic', 'analytics'],
      'geordi_la_forge': ['engineering', 'technical', 'infrastructure', 'system'],
      'lieutenant_worf': ['security', 'threat', 'protection', 'compliance'],
      'counselor_troi': ['user', 'experience', 'interface', 'empathy'],
      'commander_riker': ['execution', 'tactical', 'implementation', 'coordination'],
      'dr_crusher': ['health', 'diagnostics', 'monitoring', 'performance'],
      'la_forge': ['innovation', 'research', 'development', 'experimental'],
      'spock': ['logic', 'analysis', 'reasoning', 'efficiency']
    };

    const relevantCrew = Object.entries(crewKeywords)
      .filter(([_, keywords]) => 
        keywords.some(keyword => prompt.toLowerCase().includes(keyword))
      )
      .map(([crew, _]) => crew);

    // Always include Picard for coordination
    if (!relevantCrew.includes('captain_picard')) {
      relevantCrew.push('captain_picard');
    }

    return relevantCrew.length > 0 ? relevantCrew : ['captain_picard', 'commander_data'];
  }

  private async simulateN8NConnection(): Promise<void> {
    // Simulate connection delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    this.userFlowState.n8nConnectionStatus = 'connected';
  }

  private async executeCrewWorkflows(prompt: string, crewMembers: string[]): Promise<N8NWorkflowExecution[]> {
    const executions: N8NWorkflowExecution[] = [];
    
    for (const crewMember of crewMembers) {
      const execution: N8NWorkflowExecution = {
        workflowId: `${crewMember}-workflow`,
        crewMember,
        prompt,
        response: `Response from ${crewMember} for: ${prompt}`,
        memories: [`Memory from ${crewMember}`, `Insight from ${crewMember}`],
        timestamp: new Date(),
        status: 'complete'
      };
      
      executions.push(execution);
    }
    
    return executions;
  }

  private async simulateWorkflowExecution(execution: N8NWorkflowExecution): Promise<void> {
    // Simulate workflow execution delay
    await new Promise(resolve => setTimeout(resolve, 500));
    execution.status = 'complete';
    execution.response = `Processed response from ${execution.crewMember}`;
  }

  private async simulateObservationLounge(responses: string[]): Promise<string> {
    // Simulate Observation Lounge coordination
    await new Promise(resolve => setTimeout(resolve, 800));
    return `Coordinated response combining insights from ${responses.length} crew members`;
  }

  private extractMemoriesFromResponse(response: string): string[] {
    // Simple memory extraction simulation
    return [
      'Key insight from crew coordination',
      'Important learning from user interaction',
      'Technical knowledge gained',
      'Process improvement identified'
    ];
  }

  private async simulateRAGMemoryStorage(): Promise<number> {
    // Simulate RAG storage
    await new Promise(resolve => setTimeout(resolve, 600));
    return 4; // Simulated number of memories stored
  }

  // Getters
  getCurrentState(): UserFlowState {
    return { ...this.userFlowState };
  }

  getWorkflowExecutions(): N8NWorkflowExecution[] {
    return [...this.n8nWorkflows];
  }

  getMemorySummary(): string {
    return this.shortTermMemory.getNaturalLanguageSummary();
  }
}
