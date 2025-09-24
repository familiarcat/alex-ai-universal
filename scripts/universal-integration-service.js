#!/usr/bin/env node
/**
 * Universal Integration Service
 * 
 * Maintains N8N, MCP, and Supabase integrations across all projects
 * This service ensures that Alex AI has access to all integrations
 * regardless of which project it's called from.
 */

const fs = require('fs');
const path = require('path');
const SecurityMemoryGuard = require('./security-memory-guard');

class UniversalIntegrationService {
  constructor() {
    this.integrations = {
      n8n: {
        enabled: false,
        baseUrl: process.env.N8N_BASE_URL || 'http://localhost:5678',
        apiKey: process.env.N8N_API_KEY || '',
        workflows: new Map(),
        crewMembers: new Map()
      },
      supabase: {
        enabled: false,
        url: process.env.SUPABASE_URL || '',
        anonKey: process.env.SUPABASE_ANON_KEY || '',
        serviceKey: process.env.SUPABASE_SERVICE_KEY || '',
        tables: new Map()
      },
      mcp: {
        enabled: false,
        serverUrl: process.env.MCP_SERVER_URL || '',
        config: process.env.MCP_CONFIG || '',
        tools: new Map()
      }
    };
    
    this.projectContext = null;
    this.initialized = false;
    this.securityGuard = new SecurityMemoryGuard();
  }

  async initialize(projectPath) {
    this.projectContext = {
      path: projectPath,
      name: path.basename(projectPath),
      type: 'unknown',
      timestamp: new Date().toISOString()
    };

    // Load environment variables
    await this.loadEnvironmentVariables();
    
    // Initialize all integrations
    await this.initializeN8N();
    await this.initializeSupabase();
    await this.initializeMCP();
    
    this.initialized = true;
    return this.getStatus();
  }

  async loadEnvironmentVariables() {
    try {
      const zshrcPath = path.join(process.env.HOME, '.zshrc');
      if (fs.existsSync(zshrcPath)) {
        const zshrcContent = fs.readFileSync(zshrcPath, 'utf8');
        const lines = zshrcContent.split('\n');
        
        for (const line of lines) {
          if (line.includes('export') && line.includes('=')) {
            const match = line.match(/export\s+(\w+)=(.+)/);
            if (match) {
              const [, key, value] = match;
              process.env[key] = value.replace(/['"]/g, '');
            }
          }
        }
      }
    } catch (error) {
      console.log('⚠️  Could not load environment variables from ~/.zshrc');
    }
  }

  async initializeN8N() {
    const { n8n } = this.integrations;
    
    if (!n8n.apiKey) {
      console.log('⚠️  N8N API key not found');
      return;
    }

    try {
      // Test N8N connection
      const response = await fetch(`${n8n.baseUrl}/api/v1/workflows`, {
        headers: {
          'X-N8N-API-KEY': n8n.apiKey,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        n8n.enabled = true;
        
        // Load crew member workflows
        await this.loadN8NCrewWorkflows();
        
        console.log('✅ N8N Federation Crew integration ready');
      } else {
        console.log('❌ N8N connection failed');
      }
    } catch (error) {
      console.log('❌ N8N integration error:', error.message);
    }
  }

  async loadN8NCrewWorkflows() {
    const { n8n } = this.integrations;
    
    // Define crew member workflows
    const crewWorkflows = {
      'captain-picard': {
        workflowId: 'BdNHOluRYUw2JxGW',
        webhookPath: 'crew-captain-jean-luc-picard',
        specialization: 'Strategic Planning'
      },
      'commander-data': {
        workflowId: 'gIwrQHHArgrVARjL',
        webhookPath: 'crew-commander-data',
        specialization: 'Technical Analysis'
      },
      'geordi-la-forge': {
        workflowId: 'e0UEwyVcXJqeePdj',
        webhookPath: 'crew-lieutenant-commander-geordi-la-forge',
        specialization: 'Infrastructure'
      },
      'lieutenant-worf': {
        workflowId: 'Imn7p6pVgi6SRvnF',
        webhookPath: 'crew-lieutenant-worf',
        specialization: 'Security'
      },
      'dr-crusher': {
        workflowId: 'BdNHOluRYUw2JxGW',
        webhookPath: 'crew-dr-beverly-crusher',
        specialization: 'Quality Assurance'
      },
      'counselor-troi': {
        workflowId: 'Imn7p6pVgi6SRvnF',
        webhookPath: 'crew-counselor-deanna-troi',
        specialization: 'User Experience'
      },
      'lieutenant-uhura': {
        workflowId: 'e0UEwyVcXJqeePdj',
        webhookPath: 'crew-lieutenant-uhura',
        specialization: 'Communications'
      },
      'quark': {
        workflowId: 'BdNHOluRYUw2JxGW',
        webhookPath: 'crew-quark',
        specialization: 'Business Analysis'
      }
    };

    // Store crew workflows
    for (const [crewId, workflow] of Object.entries(crewWorkflows)) {
      n8n.workflows.set(crewId, workflow);
      n8n.crewMembers.set(crewId, {
        id: crewId,
        name: this.getCrewMemberName(crewId),
        specialization: workflow.specialization,
        workflowId: workflow.workflowId,
        webhookPath: workflow.webhookPath
      });
    }
  }

  async initializeSupabase() {
    const { supabase } = this.integrations;
    
    if (!supabase.url || !supabase.anonKey) {
      console.log('⚠️  Supabase credentials not found');
      return;
    }

    try {
      // Test Supabase connection
      const response = await fetch(`${supabase.url}/rest/v1/`, {
        headers: {
          'apikey': supabase.anonKey,
          'Authorization': `Bearer ${supabase.anonKey}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        supabase.enabled = true;
        
        // Load available tables
        await this.loadSupabaseTables();
        
        console.log('✅ Supabase memory system ready');
      } else {
        console.log('❌ Supabase connection failed');
      }
    } catch (error) {
      console.log('❌ Supabase integration error:', error.message);
    }
  }

  async loadSupabaseTables() {
    const { supabase } = this.integrations;
    
    // Define Alex AI tables
    const alexAITables = {
      'crew_memories': {
        description: 'Crew member memories and experiences',
        columns: ['id', 'crew_member', 'memory_type', 'content', 'importance', 'timestamp']
      },
      'project_contexts': {
        description: 'Project context and configuration',
        columns: ['id', 'project_path', 'project_type', 'context_data', 'timestamp']
      },
      'task_assignments': {
        description: 'Task assignments and crew coordination',
        columns: ['id', 'task_name', 'assigned_crew', 'status', 'result', 'timestamp']
      },
      'integration_logs': {
        description: 'Integration activity logs',
        columns: ['id', 'integration_type', 'action', 'status', 'details', 'timestamp']
      }
    };

    // Store table definitions
    for (const [tableName, tableInfo] of Object.entries(alexAITables)) {
      supabase.tables.set(tableName, tableInfo);
    }
  }

  async initializeMCP() {
    const { mcp } = this.integrations;
    
    if (!mcp.serverUrl && !mcp.config) {
      console.log('⚠️  MCP configuration not found');
      return;
    }

    try {
      // Check MCP server availability
      if (mcp.serverUrl) {
        const response = await fetch(`${mcp.serverUrl}/health`);
        if (response.ok) {
          mcp.enabled = true;
          await this.loadMCPTools();
          console.log('✅ MCP (Model Context Protocol) ready');
        } else {
          console.log('❌ MCP server not responding');
        }
      } else if (mcp.config) {
        // MCP config available but no server URL
        mcp.enabled = true;
        console.log('✅ MCP configuration loaded');
      }
    } catch (error) {
      console.log('❌ MCP integration error:', error.message);
    }
  }

  async loadMCPTools() {
    const { mcp } = this.integrations;
    
    // Define MCP tools available to Alex AI
    const mcpTools = {
      'code_analysis': {
        description: 'Analyze code structure and patterns',
        parameters: ['code', 'language', 'context']
      },
      'memory_retrieval': {
        description: 'Retrieve relevant memories and context',
        parameters: ['query', 'crew_member', 'project_context']
      },
      'workflow_execution': {
        description: 'Execute N8N workflows',
        parameters: ['workflow_id', 'input_data', 'crew_member']
      },
      'data_synchronization': {
        description: 'Sync data between systems',
        parameters: ['source', 'target', 'data_type']
      }
    };

    // Store MCP tools
    for (const [toolName, toolInfo] of Object.entries(mcpTools)) {
      mcp.tools.set(toolName, toolInfo);
    }
  }

  async executeCrewTask(crewMemberId, task, inputData = {}) {
    if (!this.initialized) {
      throw new Error('Integration service not initialized');
    }

    const { n8n } = this.integrations;
    const crewMember = n8n.crewMembers.get(crewMemberId);
    
    if (!crewMember) {
      throw new Error(`Crew member ${crewMemberId} not found`);
    }

    if (!n8n.enabled) {
      console.log(`⚠️  N8N not available, simulating task execution for ${crewMember.name}`);
      return this.simulateTaskExecution(crewMember, task, inputData);
    }

    try {
      // Execute N8N workflow
      const response = await fetch(`${n8n.baseUrl}/api/v1/workflows/${crewMember.workflowId}/execute`, {
        method: 'POST',
        headers: {
          'X-N8N-API-KEY': n8n.apiKey,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          task,
          inputData,
          crewMember: crewMember.name,
          projectContext: this.projectContext
        })
      });

      if (response.ok) {
        const result = await response.json();
        return result;
      } else {
        throw new Error(`N8N workflow execution failed: ${response.statusText}`);
      }
    } catch (error) {
      console.log(`❌ N8N workflow execution failed: ${error.message}`);
      return this.simulateTaskExecution(crewMember, task, inputData);
    }
  }

  async simulateTaskExecution(crewMember, task, inputData) {
    // Simulate task execution when N8N is not available
    return {
      success: true,
      crewMember: crewMember.name,
      specialization: crewMember.specialization,
      task,
      result: `Task "${task}" executed by ${crewMember.name} (${crewMember.specialization})`,
      timestamp: new Date().toISOString(),
      simulated: true
    };
  }

  async storeMemory(crewMemberId, memoryType, content, importance = 'medium') {
    if (!this.initialized) {
      throw new Error('Integration service not initialized');
    }

    // SECURITY CHECK: Scan content for secrets before storing
    try {
      const memoryData = {
        crew_member: crewMemberId,
        memory_type: memoryType,
        content,
        importance,
        project_context: this.projectContext,
        timestamp: new Date().toISOString()
      };

      // Validate memory entry with security guard
      const validatedMemory = await this.securityGuard.validateMemoryEntry(memoryData);
      
      const { supabase } = this.integrations;
      
      if (!supabase.enabled) {
        console.log('⚠️  Supabase not available, storing memory locally');
        return this.storeLocalMemory(crewMemberId, memoryType, validatedMemory.content, importance);
      }

      const response = await fetch(`${supabase.url}/rest/v1/crew_memories`, {
        method: 'POST',
        headers: {
          'apikey': supabase.anonKey,
          'Authorization': `Bearer ${supabase.anonKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(validatedMemory)
      });

      if (response.ok) {
        console.log('✅ Memory stored securely with security validation');
        return await response.json();
      } else {
        throw new Error(`Supabase memory storage failed: ${response.statusText}`);
      }
    } catch (error) {
      if (error.message.includes('Memory blocked due to security concerns')) {
        console.log('🚨 MEMORY BLOCKED:', error.message);
        throw error;
      }
      console.log(`❌ Supabase memory storage failed: ${error.message}`);
      return this.storeLocalMemory(crewMemberId, memoryType, content, importance);
    }
  }

  async storeLocalMemory(crewMemberId, memoryType, content, importance) {
    // Store memory locally when Supabase is not available
    const memoryFile = path.join(this.projectContext.path, '.alex-ai-memories.json');
    
    let memories = [];
    if (fs.existsSync(memoryFile)) {
      memories = JSON.parse(fs.readFileSync(memoryFile, 'utf8'));
    }

    memories.push({
      crew_member: crewMemberId,
      memory_type: memoryType,
      content,
      importance,
      project_context: this.projectContext,
      timestamp: new Date().toISOString(),
      local: true
    });

    fs.writeFileSync(memoryFile, JSON.stringify(memories, null, 2));
    return { success: true, local: true };
  }

  getStatus() {
    return {
      initialized: this.initialized,
      projectContext: this.projectContext,
      security: this.securityGuard.generateSecurityReport(),
      integrations: {
        n8n: {
          enabled: this.integrations.n8n.enabled,
          baseUrl: this.integrations.n8n.baseUrl,
          crewMembers: this.integrations.n8n.crewMembers.size,
          workflows: this.integrations.n8n.workflows.size
        },
        supabase: {
          enabled: this.integrations.supabase.enabled,
          url: this.integrations.supabase.url,
          tables: this.integrations.supabase.tables.size,
          securityEnabled: true
        },
        mcp: {
          enabled: this.integrations.mcp.enabled,
          serverUrl: this.integrations.mcp.serverUrl,
          tools: this.integrations.mcp.tools.size
        }
      }
    };
  }

  getCrewMemberName(crewId) {
    const names = {
      'captain-picard': 'Captain Jean-Luc Picard',
      'commander-data': 'Commander Data',
      'geordi-la-forge': 'Geordi La Forge',
      'lieutenant-worf': 'Lieutenant Worf',
      'dr-crusher': 'Dr. Beverly Crusher',
      'counselor-troi': 'Counselor Deanna Troi',
      'lieutenant-uhura': 'Lieutenant Uhura',
      'quark': 'Quark'
    };
    return names[crewId] || crewId;
  }
}

// Export for use in other modules
module.exports = UniversalIntegrationService;

// CLI interface
if (require.main === module) {
  const service = new UniversalIntegrationService();
  const command = process.argv[2] || 'status';
  
  service.initialize(process.cwd())
    .then(status => {
      console.log('🔧 Universal Integration Service Status:');
      console.log(JSON.stringify(status, null, 2));
    })
    .catch(error => {
      console.error('❌ Integration service error:', error);
    });
}
