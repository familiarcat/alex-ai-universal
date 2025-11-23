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

