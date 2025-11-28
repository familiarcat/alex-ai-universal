/**
 * Alex AI Instantiation System
 * 
 * Makes Alex AI framework easily activatable in Cursor AI and VS Code
 * via simple command or default activation.
 * 
 * Leadership: Lieutenant Uhura (Communication) + Chief O'Brien (Pragmatic Solutions)
 */

export interface InstantiationConfig {
  ide: 'cursor' | 'vscode' | 'auto';
  activationMode: 'default' | 'command' | 'manual';
  crewMembers: string[];
  loadMemories: boolean;
  enableRAG: boolean;
  enableObservationLounge: boolean;
  autoActivateTriggers: string[];
}

export interface ChatState {
  sessionId: string;
  timestamp: string;
  messages: Array<{
    role: 'user' | 'assistant' | 'system';
    content: string;
    crewContext?: any;
  }>;
  activeCrew: string[];
  loadedMemories: number;
  context: {
    project: string;
    workingDirectory: string;
    recentFiles: string[];
  };
}

export class AlexAIInstantiation {
  private config: InstantiationConfig;
  private chatState: ChatState | null = null;
  
  constructor(config?: Partial<InstantiationConfig>) {
    this.config = {
      ide: config?.ide || 'auto',
      activationMode: config?.activationMode || 'command',
      crewMembers: config?.crewMembers || [],
      loadMemories: config?.loadMemories ?? true,
      enableRAG: config?.enableRAG ?? true,
      enableObservationLounge: config?.enableObservationLounge ?? true,
      autoActivateTriggers: config?.autoActivateTriggers || [
        'crew', 'alex ai', 'picard', 'data', 'riker', 'n8n', 'supabase',
        'milestone', 'observation lounge', 'rag', 'memory'
      ]
    };
  }
  
  /**
   * Detect IDE and configure accordingly
   */
  detectIDE(): 'cursor' | 'vscode' {
    // Check for Cursor AI specific environment variables or features
    if (typeof process !== 'undefined' && process.env.CURSOR_AI) {
      return 'cursor';
    }
    
    // Check for VS Code
    if (typeof process !== 'undefined' && process.env.VSCODE_PID) {
      return 'vscode';
    }
    
    // Default to Cursor if in Cursor workspace
    if (typeof window !== 'undefined' && (window as any).cursor) {
      return 'cursor';
    }
    
    return 'vscode';
  }
  
  /**
   * Generate activation prompt for chat
   */
  generateActivationPrompt(): string {
    const ide = this.config.ide === 'auto' ? this.detectIDE() : this.config.ide;
    
    const basePrompt = `🖖 Activate Alex AI with Full Crew Memory Context

I'm starting a new ${ide === 'cursor' ? 'Cursor AI' : 'VS Code'} chat session and want to include Alex AI crew coordination with full memory context.

Please:
1. Load all crew member memories from our Supabase RAG system
2. Activate Alex AI crew coordination mode
3. Include the following crew members in context:
   - 🎖️ Captain Picard (Strategic leadership)
   - ⚡ Commander Riker (Tactical operations)
   - 🤖 Commander Data (Technical analysis)
   - 🔧 Lieutenant Commander La Forge (Infrastructure)
   - ⚔️ Lieutenant Worf (Security)
   - 💭 Counselor Troi (User experience)
   - 💊 Dr. Crusher (System health)
   - 📻 Lieutenant Uhura (Communication)
   - 💰 Quark (Business optimization)
   - 🛠️ Chief O'Brien (Pragmatic solutions)

4. Maintain chat memory persistence throughout this session
5. Reference previous conversations and decisions from crew memories

# 🖖 Alex AI Crew Context

**This chat session includes Alex AI crew coordination.**

## Active Crew Members:
${this.config.crewMembers.length > 0 
  ? this.config.crewMembers.map(c => `- ${c}`).join('\n')
  : '- All crew members available'}

## Features Enabled:
- ✅ RAG Memory System: ${this.config.enableRAG ? 'Active' : 'Inactive'}
- ✅ Observation Lounge: ${this.config.enableObservationLounge ? 'Active' : 'Inactive'}
- ✅ Component Coordination: Active
- ✅ Architecture Learning: Active

**Full memories available in crew context. Ask any crew member for their perspective.**`;

    return basePrompt;
  }
  
  /**
   * Check if message should auto-activate Alex AI
   */
  shouldAutoActivate(message: string): boolean {
    if (this.config.activationMode !== 'default') {
      return false;
    }
    
    const lowerMessage = message.toLowerCase();
    return this.config.autoActivateTriggers.some(trigger =>
      lowerMessage.includes(trigger.toLowerCase())
    );
  }
  
  /**
   * Save chat state for persistence
   */
  async saveChatState(state: ChatState): Promise<void> {
    this.chatState = state;
    
    // Save to localStorage (browser) or file system (Node.js)
    if (typeof window !== 'undefined' && window.localStorage) {
      localStorage.setItem('alex-ai-chat-state', JSON.stringify(state));
    } else if (typeof process !== 'undefined' && process.env.HOME) {
      // Save to file system in Node.js environment
      const fs = require('fs');
      const path = require('path');
      const stateDir = path.join(process.env.HOME, '.alex-ai');
      
      if (!fs.existsSync(stateDir)) {
        fs.mkdirSync(stateDir, { recursive: true });
      }
      
      const stateFile = path.join(stateDir, 'chat-state.json');
      fs.writeFileSync(stateFile, JSON.stringify(state, null, 2));
    }
  }
  
  /**
   * Load chat state from persistence
   */
  async loadChatState(): Promise<ChatState | null> {
    // Try to load from memory first
    if (this.chatState) {
      return this.chatState;
    }
    
    // Load from localStorage (browser)
    if (typeof window !== 'undefined' && window.localStorage) {
      const saved = localStorage.getItem('alex-ai-chat-state');
      if (saved) {
        try {
          this.chatState = JSON.parse(saved);
          return this.chatState;
        } catch (error) {
          console.error('Error loading chat state from localStorage:', error);
        }
      }
    }
    
    // Load from file system (Node.js)
    if (typeof process !== 'undefined' && process.env.HOME) {
      try {
        const fs = require('fs');
        const path = require('path');
        const stateFile = path.join(process.env.HOME, '.alex-ai', 'chat-state.json');
        
        if (fs.existsSync(stateFile)) {
          const saved = fs.readFileSync(stateFile, 'utf-8');
          this.chatState = JSON.parse(saved);
          return this.chatState;
        }
      } catch (error) {
        console.error('Error loading chat state from file system:', error);
      }
    }
    
    return null;
  }
  
  /**
   * Clear chat state
   */
  async clearChatState(): Promise<void> {
    this.chatState = null;
    
    if (typeof window !== 'undefined' && window.localStorage) {
      localStorage.removeItem('alex-ai-chat-state');
    }
    
    if (typeof process !== 'undefined' && process.env.HOME) {
      try {
        const fs = require('fs');
        const path = require('path');
        const stateFile = path.join(process.env.HOME, '.alex-ai', 'chat-state.json');
        if (fs.existsSync(stateFile)) {
          fs.unlinkSync(stateFile);
        }
      } catch (error) {
        console.error('Error clearing chat state:', error);
      }
    }
  }
  
  /**
   * Generate VS Code task configuration
   */
  generateVSCodeTask(): any {
    return {
      version: '2.0.0',
      tasks: [
        {
          label: '🖖 Activate Alex AI',
          type: 'shell',
          command: 'npm run alex-ai:activate',
          problemMatcher: [],
          presentation: {
            reveal: 'always',
            panel: 'new'
          }
        },
        {
          label: '🖖 Load Alex AI Crew Memories',
          type: 'shell',
          command: 'npm run cursor:memories',
          problemMatcher: [],
          presentation: {
            reveal: 'always',
            panel: 'new'
          }
        }
      ]
    };
  }
  
  /**
   * Generate Cursor AI configuration
   */
  generateCursorConfig(): any {
    return {
      alexAI: {
        autoActivate: this.config.activationMode === 'default',
        crewMembers: this.config.crewMembers,
        features: {
          rag: this.config.enableRAG,
          observationLounge: this.config.enableObservationLounge,
          componentCoordination: true,
          architectureLearning: true
        },
        triggers: this.config.autoActivateTriggers
      }
    };
  }
  
  /**
   * Get instantiation status
   */
  getStatus(): {
    ide: string;
    activationMode: string;
    crewMembers: number;
    features: {
      rag: boolean;
      observationLounge: boolean;
      componentCoordination: boolean;
      architectureLearning: boolean;
    };
    chatStateLoaded: boolean;
  } {
    return {
      ide: this.config.ide === 'auto' ? this.detectIDE() : this.config.ide,
      activationMode: this.config.activationMode,
      crewMembers: this.config.crewMembers.length,
      features: {
        rag: this.config.enableRAG,
        observationLounge: this.config.enableObservationLounge,
        componentCoordination: true,
        architectureLearning: true
      },
      chatStateLoaded: this.chatState !== null
    };
  }
}

