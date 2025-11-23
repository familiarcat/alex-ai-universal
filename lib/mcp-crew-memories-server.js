#!/usr/bin/env node
/**
 * 🖖 MCP Crew Memories Server
 * 
 * Model Context Protocol server for accessing crew memories.
 * Exposes crew memories as MCP resources and tools.
 * 
 * Usage:
 *   node lib/mcp-crew-memories-server.js
 * 
 * MCP Configuration:
 *   Add to Cursor AI MCP settings:
 *   {
 *     "mcpServers": {
 *       "alex-ai-crew-memories": {
 *         "command": "node",
 *         "args": ["/path/to/lib/mcp-crew-memories-server.js"]
 *       }
 *     }
 *   }
 */

const { Server } = require('@modelcontextprotocol/sdk/server/index.js');
const { StdioServerTransport } = require('@modelcontextprotocol/sdk/server/stdio.js');
const {
  CallToolRequestSchema,
  ListResourcesRequestSchema,
  ListToolsRequestSchema,
  ReadResourceRequestSchema,
} = require('@modelcontextprotocol/sdk/types.js');

const { loadCrewMemories, formatMemoriesForCursor } = require('../scripts/crew/coordination/load-crew-memories.js');
const { createClient } = require('@supabase/supabase-js');
const { getMCPOpenRouterOptimizer } = require('../scripts/utils/mcp-openrouter-optimizer');
const { QuarkRikerTaskOptimizer } = require('../scripts/crew/quark-riker-task-optimizer');
const fs = require('fs');
const path = require('path');

// Load credentials
function loadCredentials() {
  const { loadSupabaseCredentials } = require('../scripts/utils/secure-credential-loader');
  const creds = loadSupabaseCredentials();
  
  if (!creds.url || !creds.serviceKey) {
    throw new Error('Supabase credentials not found. Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in ~/.zshrc or environment variables.');
  }
  
  return {
    supabaseUrl: creds.url,
    supabaseKey: creds.serviceKey
  };
}

// Crew member names mapping
const CREW_MEMBERS = {
  picard: 'Captain Jean-Luc Picard',
  riker: 'Commander William Riker',
  data: 'Commander Data',
  la_forge: 'Lieutenant Commander Geordi La Forge',
  worf: 'Lieutenant Worf',
  troi: 'Counselor Deanna Troi',
  crusher: 'Dr. Beverly Crusher',
  uhura: 'Lieutenant Uhura',
  quark: 'Quark',
  chief_obrien: "Chief Miles O'Brien",
  diagnostic_officer: 'Diagnostic Officer'
};

class CrewMemoriesMCPServer {
  constructor() {
    this.server = new Server(
      {
        name: 'alex-ai-crew-memories',
        version: '1.0.0',
      },
      {
        capabilities: {
          resources: {},
          tools: {},
        },
      }
    );

    this.supabase = null;
    this.memoriesCache = null;
    this.cacheTimestamp = null;
    this.cacheTTL = 5 * 60 * 1000; // 5 minutes
    this.openRouterOptimizer = null;
    this.quarkRikerOptimizer = null;

    this.setupHandlers();
  }

  setupHandlers() {
    // List available resources (crew memories)
    this.server.setRequestHandler(ListResourcesRequestSchema, async () => {
      const resources = [];

      // Resource for all crew memories
      resources.push({
        uri: 'crew://memories/all',
        name: 'All Crew Memories',
        description: 'Complete crew memory context for all crew members',
        mimeType: 'application/json',
      });

      // Resource for each crew member's memories
      for (const [crewId, crewName] of Object.entries(CREW_MEMBERS)) {
        resources.push({
          uri: `crew://memories/${crewId}`,
          name: `${crewName} Memories`,
          description: `Memories for ${crewName}`,
          mimeType: 'application/json',
        });
      }

      // Resource for formatted Cursor prompt
      resources.push({
        uri: 'crew://memories/cursor-prompt',
        name: 'Cursor AI Startup Prompt',
        description: 'Formatted crew memories ready for Cursor AI chat',
        mimeType: 'text/markdown',
      });

      return { resources };
    });

    // Read a specific resource
    this.server.setRequestHandler(ReadResourceRequestSchema, async (request) => {
      const { uri } = request.params;

      // Initialize Supabase if needed
      if (!this.supabase) {
        const { supabaseUrl, supabaseKey } = loadCredentials();
        this.supabase = createClient(supabaseUrl, supabaseKey);
      }

      // Load memories if cache is stale
      if (!this.memoriesCache || !this.cacheTimestamp || 
          (Date.now() - this.cacheTimestamp) > this.cacheTTL) {
        this.memoriesCache = await this.loadAllMemories();
        this.cacheTimestamp = Date.now();
      }

      if (uri === 'crew://memories/all') {
        return {
          contents: [
            {
              uri,
              mimeType: 'application/json',
              text: JSON.stringify(this.memoriesCache, null, 2),
            },
          ],
        };
      }

      if (uri === 'crew://memories/cursor-prompt') {
        const formatted = formatMemoriesForCursor(this.memoriesCache);
        return {
          contents: [
            {
              uri,
              mimeType: 'text/markdown',
              text: formatted,
            },
          ],
        };
      }

      // Individual crew member memories
      const crewMatch = uri.match(/^crew:\/\/memories\/(.+)$/);
      if (crewMatch) {
        const crewId = crewMatch[1];
        const crewMemories = this.memoriesCache[crewId] || [];
        return {
          contents: [
            {
              uri,
              mimeType: 'application/json',
              text: JSON.stringify(crewMemories, null, 2),
            },
          ],
        };
      }

      throw new Error(`Unknown resource: ${uri}`);
    });

    // List available tools
    this.server.setRequestHandler(ListToolsRequestSchema, async () => {
      return {
        tools: [
          {
            name: 'get_crew_memories',
            description: 'Get memories for a specific crew member or all crew members',
            inputSchema: {
              type: 'object',
              properties: {
                crewMember: {
                  type: 'string',
                  description: 'Crew member ID (picard, riker, data, etc.) or "all" for all memories',
                  enum: ['all', ...Object.keys(CREW_MEMBERS)],
                },
                limit: {
                  type: 'number',
                  description: 'Maximum number of memories to return (default: 20)',
                  default: 20,
                },
                format: {
                  type: 'string',
                  description: 'Output format: "json" or "cursor" (default: json)',
                  enum: ['json', 'cursor'],
                  default: 'json',
                },
              },
            },
          },
          {
            name: 'search_crew_memories',
            description: 'Search crew memories by query string',
            inputSchema: {
              type: 'object',
              properties: {
                query: {
                  type: 'string',
                  description: 'Search query to find relevant memories',
                },
                crewMember: {
                  type: 'string',
                  description: 'Optional: Filter by crew member ID',
                  enum: [...Object.keys(CREW_MEMBERS)],
                },
                limit: {
                  type: 'number',
                  description: 'Maximum number of results (default: 10)',
                  default: 10,
                },
              },
              required: ['query'],
            },
          },
          {
            name: 'optimize_openrouter_model',
            description: 'Select optimal OpenRouter model for a crew member\'s task with cost optimization',
            inputSchema: {
              type: 'object',
              properties: {
                crewMember: {
                  type: 'string',
                  description: 'Crew member ID (picard, data, riker, etc.)',
                  enum: [...Object.keys(CREW_MEMBERS)],
                },
                taskType: {
                  type: 'string',
                  description: 'Type of task (strategic_planning, code_generation, quick_analysis, etc.)',
                },
                complexity: {
                  type: 'string',
                  description: 'Task complexity level',
                  enum: ['low', 'medium', 'high'],
                  default: 'medium',
                },
                estimatedTokens: {
                  type: 'number',
                  description: 'Estimated number of tokens (default: 1500)',
                  default: 1500,
                },
                budgetConstraint: {
                  type: 'number',
                  description: 'Maximum cost in USD (optional)',
                },
              },
              required: ['crewMember'],
            },
          },
          {
            name: 'call_openrouter_llm',
            description: 'Make an optimized OpenRouter LLM call for a crew member with automatic model selection',
            inputSchema: {
              type: 'object',
              properties: {
                prompt: {
                  type: 'string',
                  description: 'The prompt/question for the LLM',
                },
                crewMember: {
                  type: 'string',
                  description: 'Crew member ID making the call',
                  enum: [...Object.keys(CREW_MEMBERS)],
                },
                taskType: {
                  type: 'string',
                  description: 'Type of task (optional, auto-detected from crew member)',
                },
                complexity: {
                  type: 'string',
                  description: 'Task complexity',
                  enum: ['low', 'medium', 'high'],
                  default: 'medium',
                },
                temperature: {
                  type: 'number',
                  description: 'Temperature for generation (0-2, default: 0.7)',
                  default: 0.7,
                },
                maxTokens: {
                  type: 'number',
                  description: 'Maximum tokens to generate (optional)',
                },
              },
              required: ['prompt', 'crewMember'],
            },
          },
          {
            name: 'optimize_task_assignment',
            description: 'Use Quark + Riker collaboration to optimize task assignments for the crew',
            inputSchema: {
              type: 'object',
              properties: {
                tasks: {
                  type: 'array',
                  items: { type: 'string' },
                  description: 'List of tasks to optimize and assign',
                },
                context: {
                  type: 'object',
                  description: 'Additional context for task optimization (optional)',
                },
              },
              required: ['tasks'],
            },
          },
          {
            name: 'get_task_assignment',
            description: 'Get optimized task assignment with Quark cost analysis and Riker tactical coordination for a crew member',
            inputSchema: {
              type: 'object',
              properties: {
                crewMember: {
                  type: 'string',
                  description: 'Crew member ID to get assignment for',
                  enum: [...Object.keys(CREW_MEMBERS)],
                },
                task: {
                  type: 'string',
                  description: 'Task description',
                },
                context: {
                  type: 'object',
                  description: 'Additional context (optional)',
                },
              },
              required: ['crewMember', 'task'],
            },
          },
          {
            name: 'provide_task_feedback',
            description: 'Allow a crew member to provide feedback on their assigned task, including execution perspective and conceptual insights',
            inputSchema: {
              type: 'object',
              properties: {
                crewMember: {
                  type: 'string',
                  description: 'Crew member ID providing feedback',
                  enum: [...Object.keys(CREW_MEMBERS)],
                },
                task: {
                  type: 'string',
                  description: 'Task that was assigned',
                },
                assignmentContext: {
                  type: 'object',
                  description: 'Original assignment context from Quark+Riker (optional)',
                },
                feedback: {
                  type: 'string',
                  description: 'Crew member\'s feedback on the task assignment and execution',
                },
                executionPerspective: {
                  type: 'string',
                  description: 'Crew member\'s perspective on how to execute the task',
                },
                conceptualInsights: {
                  type: 'string',
                  description: 'Crew member\'s insights on the concepts and approach',
                },
              },
              required: ['crewMember', 'task'],
            },
          },
        ],
      };
    });

    // Handle tool calls
    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      const { name, arguments: args } = request.params;

      // Initialize Supabase if needed
      if (!this.supabase) {
        const { supabaseUrl, supabaseKey } = loadCredentials();
        this.supabase = createClient(supabaseUrl, supabaseKey);
      }

      // Load memories if cache is stale
      if (!this.memoriesCache || !this.cacheTimestamp || 
          (Date.now() - this.cacheTimestamp) > this.cacheTTL) {
        this.memoriesCache = await this.loadAllMemories();
        this.cacheTimestamp = Date.now();
      }

      if (name === 'get_crew_memories') {
        const { crewMember = 'all', limit = 20, format = 'json' } = args || {};
        
        let result;
        if (crewMember === 'all') {
          result = this.memoriesCache;
        } else {
          result = { [crewMember]: this.memoriesCache[crewMember] || [] };
        }

        // Apply limit
        if (crewMember !== 'all') {
          result[crewMember] = result[crewMember].slice(0, limit);
        } else {
          for (const [key, memories] of Object.entries(result)) {
            result[key] = memories.slice(0, limit);
          }
        }

        if (format === 'cursor') {
          return {
            content: [
              {
                type: 'text',
                text: formatMemoriesForCursor(result),
              },
            ],
          };
        }

        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }

      if (name === 'search_crew_memories') {
        const { query, crewMember, limit = 10 } = args || {};
        
        if (!query) {
          throw new Error('Query parameter is required');
        }

        const searchResults = [];
        const searchLower = query.toLowerCase();

        const searchIn = crewMember 
          ? { [crewMember]: this.memoriesCache[crewMember] || [] }
          : this.memoriesCache;

        for (const [crewId, memories] of Object.entries(searchIn)) {
          for (const memory of memories) {
            const searchableText = [
              memory.title || '',
              memory.summary || '',
              memory.content || '',
              ...(memory.tags || []),
            ].join(' ').toLowerCase();

            if (searchableText.includes(searchLower)) {
              searchResults.push({
                crewMember: crewId,
                crewName: CREW_MEMBERS[crewId] || crewId,
                ...memory,
              });
            }
          }
        }

        // Sort by relevance (simple: more matches = higher relevance)
        searchResults.sort((a, b) => {
          const aMatches = (a.title || '').toLowerCase().includes(searchLower) ? 2 : 0 +
                          (a.summary || '').toLowerCase().includes(searchLower) ? 1 : 0;
          const bMatches = (b.title || '').toLowerCase().includes(searchLower) ? 2 : 0 +
                          (b.summary || '').toLowerCase().includes(searchLower) ? 1 : 0;
          return bMatches - aMatches;
        });

        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(searchResults.slice(0, limit), null, 2),
            },
          ],
        };
      }

      // OpenRouter optimization tools
      if (name === 'optimize_openrouter_model') {
        if (!this.openRouterOptimizer) {
          this.openRouterOptimizer = getMCPOpenRouterOptimizer();
          try {
            this.openRouterOptimizer.initialize();
          } catch (error) {
            throw new Error(`OpenRouter not configured: ${error.message}. Run: npm run openrouter:get-key`);
          }
        }

        const { crewMember, taskType, complexity = 'medium', estimatedTokens = 1500, budgetConstraint } = args || {};
        
        if (!crewMember) {
          throw new Error('crewMember parameter is required');
        }

        const selection = this.openRouterOptimizer.selectOptimalModel({
          crewMember,
          taskType,
          complexity,
          estimatedTokens,
          budgetConstraint
        });

        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({
                selectedModel: {
                  id: selection.modelId,
                  name: selection.model.name,
                  costPer1M: selection.model.costPer1M,
                },
                estimatedCost: selection.estimatedCost,
                estimatedTokens: selection.estimatedTokens,
                confidence: selection.confidence,
                reasoning: selection.reasoning,
                allScores: selection.scores,
              }, null, 2),
            },
          ],
        };
      }

      if (name === 'call_openrouter_llm') {
        if (!this.openRouterOptimizer) {
          this.openRouterOptimizer = getMCPOpenRouterOptimizer();
          try {
            this.openRouterOptimizer.initialize();
          } catch (error) {
            throw new Error(`OpenRouter not configured: ${error.message}. Run: npm run openrouter:get-key`);
          }
        }

        const { prompt, crewMember, taskType, complexity = 'medium', temperature = 0.7, maxTokens } = args || {};
        
        if (!prompt || !crewMember) {
          throw new Error('prompt and crewMember parameters are required');
        }

        const result = await this.openRouterOptimizer.optimizeAndCall(prompt, {
          crewMember,
          complexity,
          context: {
            taskType,
          },
          apiOptions: {
            temperature,
            max_tokens: maxTokens,
          },
        });

        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({
                response: result.choices?.[0]?.message?.content || result.body || 'No response',
                model: result.modelSelection?.model?.name || 'Unknown',
                modelId: result.modelSelection?.modelId || 'Unknown',
                cost: result.cost || result.modelSelection?.estimatedCost || 0,
                usage: result.usage || {},
                optimization: {
                  confidence: result.modelSelection?.confidence || 0,
                  reasoning: result.modelSelection?.reasoning || {},
                },
              }, null, 2),
            },
          ],
        };
      }

      // Quark + Riker task optimization tools
      if (name === 'optimize_task_assignment') {
        if (!this.quarkRikerOptimizer) {
          this.quarkRikerOptimizer = new QuarkRikerTaskOptimizer();
        }

        const { tasks, context = {} } = args || {};
        
        if (!tasks || !Array.isArray(tasks) || tasks.length === 0) {
          throw new Error('tasks parameter is required and must be a non-empty array');
        }

        const result = await this.quarkRikerOptimizer.optimizeTaskAssignment(tasks, context);

        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({
                optimizedPlan: result.optimizedPlan,
                quarkAnalysis: result.quarkAnalysis,
                rikerCoordination: result.rikerCoordination,
                costs: result.costs,
                tasks: tasks
              }, null, 2),
            },
          ],
        };
      }

      if (name === 'get_task_assignment') {
        if (!this.quarkRikerOptimizer) {
          this.quarkRikerOptimizer = new QuarkRikerTaskOptimizer();
        }

        const { crewMember, task, context = {} } = args || {};
        
        if (!crewMember || !task) {
          throw new Error('crewMember and task parameters are required');
        }

        // Get Quark's cost analysis for this specific task
        const quarkPrompt = `You are Quark, the Ferengi business operations specialist. Analyze this task assignment for crew member ${CREW_MEMBERS[crewMember] || crewMember}:

Task: ${task}

Context: ${JSON.stringify(context, null, 2)}

Provide:
1. Cost analysis (estimate LLM costs for this task)
2. Resource efficiency recommendations
3. Priority assessment
4. Cost optimization suggestions

Be specific, practical, and profit-focused.`;

        // Get Riker's tactical coordination for this specific task
        const rikerPrompt = `You are Commander William Riker, Executive Officer. Provide tactical coordination for this task assignment:

Crew Member: ${CREW_MEMBERS[crewMember] || crewMember}
Task: ${task}

Context: ${JSON.stringify(context, null, 2)}

Provide:
1. Why this crew member is assigned this task (their specialization)
2. Optimal execution approach
3. Workflow recommendations
4. Risk assessment and mitigation

Be tactical, organized, and operationally focused.`;

        if (!this.openRouterOptimizer) {
          this.openRouterOptimizer = getMCPOpenRouterOptimizer();
          try {
            this.openRouterOptimizer.initialize();
          } catch (error) {
            throw new Error(`OpenRouter not configured: ${error.message}. Run: npm run openrouter:get-key`);
          }
        }

        // Get Quark's analysis
        const quarkAnalysis = await this.openRouterOptimizer.optimizeAndCall(quarkPrompt, {
          crewMember: 'quark',
          complexity: 'medium',
          taskType: 'business_analysis',
          temperature: 0.7
        });

        // Get Riker's coordination
        const rikerCoordination = await this.openRouterOptimizer.optimizeAndCall(rikerPrompt, {
          crewMember: 'riker',
          complexity: 'medium',
          taskType: 'operations',
          temperature: 0.7
        });

        const assignment = {
          crewMember: crewMember,
          crewName: CREW_MEMBERS[crewMember] || crewMember,
          task: task,
          quarkCostAnalysis: quarkAnalysis.choices?.[0]?.message?.content || quarkAnalysis.body || '',
          rikerTacticalCoordination: rikerCoordination.choices?.[0]?.message?.content || rikerCoordination.body || '',
          costs: {
            quark: quarkAnalysis.cost || quarkAnalysis.modelSelection?.estimatedCost || 0,
            riker: rikerCoordination.cost || rikerCoordination.modelSelection?.estimatedCost || 0,
            total: (quarkAnalysis.cost || 0) + (rikerCoordination.cost || 0)
          },
          context: context
        };

        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(assignment, null, 2),
            },
          ],
        };
      }

      if (name === 'provide_task_feedback') {
        if (!this.openRouterOptimizer) {
          this.openRouterOptimizer = getMCPOpenRouterOptimizer();
          try {
            this.openRouterOptimizer.initialize();
          } catch (error) {
            throw new Error(`OpenRouter not configured: ${error.message}. Run: npm run openrouter:get-key`);
          }
        }

        const { crewMember, task, assignmentContext = {}, feedback, executionPerspective, conceptualInsights } = args || {};
        
        if (!crewMember || !task) {
          throw new Error('crewMember and task parameters are required');
        }

        // Build comprehensive feedback prompt
        const feedbackPrompt = `You are ${CREW_MEMBERS[crewMember] || crewMember}. You have been assigned the following task:

Task: ${task}

${Object.keys(assignmentContext).length > 0 ? `Assignment Context from Quark + Riker:\n${JSON.stringify(assignmentContext, null, 2)}\n` : ''}

${feedback ? `Your Feedback: ${feedback}\n` : ''}
${executionPerspective ? `Your Execution Perspective: ${executionPerspective}\n` : ''}
${conceptualInsights ? `Your Conceptual Insights: ${conceptualInsights}\n` : ''}

Provide your comprehensive perspective on:
1. Your understanding of the task and its objectives
2. Your approach to executing this task (considering Quark's cost analysis and Riker's tactical coordination)
3. Your unique insights and perspectives on the concepts involved
4. Any concerns, suggestions, or recommendations you have
5. How this task aligns with your specialization and expertise

Speak as ${CREW_MEMBERS[crewMember] || crewMember} would - with your unique personality, expertise, and concerns. Be specific and actionable.`;

        const response = await this.openRouterOptimizer.optimizeAndCall(feedbackPrompt, {
          crewMember: crewMember,
          complexity: 'medium',
          temperature: 0.8
        });

        const feedbackResult = {
          crewMember: crewMember,
          crewName: CREW_MEMBERS[crewMember] || crewMember,
          task: task,
          feedback: response.choices?.[0]?.message?.content || response.body || '',
          providedFeedback: feedback || null,
          executionPerspective: executionPerspective || null,
          conceptualInsights: conceptualInsights || null,
          cost: response.cost || response.modelSelection?.estimatedCost || 0,
          model: response.modelSelection?.model?.name || 'Unknown'
        };

        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(feedbackResult, null, 2),
            },
          ],
        };
      }

      throw new Error(`Unknown tool: ${name}`);
    });
  }

  async loadAllMemories() {
    const memoriesByCrew = {};
    const crewIds = Object.keys(CREW_MEMBERS);

    for (const crewId of crewIds) {
      const { data, error } = await this.supabase
        .from('crew_memories')
        .select('*')
        .eq('crew_member', crewId)
        .order('created_at', { ascending: false })
        .limit(20);

      if (error) {
        console.warn(`⚠️  Error loading memories for ${crewId}:`, error.message);
        memoriesByCrew[crewId] = [];
      } else {
        memoriesByCrew[crewId] = data || [];
      }
    }

    return memoriesByCrew;
  }

  async run() {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    console.error('🖖 Alex AI Crew Memories MCP Server running');
  }
}

// Run server if called directly
if (require.main === module) {
  const server = new CrewMemoriesMCPServer();
  server.run().catch(console.error);
}

module.exports = { CrewMemoriesMCPServer };

