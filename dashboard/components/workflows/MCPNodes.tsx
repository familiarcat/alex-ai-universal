/**
 * MCP Node Type Definitions
 * 
 * Defines all available MCP node types for the workflow editor
 */

export interface MCPNodeTypeConfig {
  label: string;
  color: string;
  category: 'memory' | 'workflow' | 'llm' | 'database' | 'logic' | 'transform';
  description: string;
  inputs?: string[];
  outputs?: string[];
}

export const MCP_NODE_TYPES: Record<string, MCPNodeTypeConfig> = {
  // Memory Operations
  memoryStore: {
    label: 'Store Memory',
    color: '#3b82f6',
    category: 'memory',
    description: 'Store a memory in the MCP memory system',
    inputs: ['content', 'title', 'tags'],
    outputs: ['memoryId'],
  },
  memoryQuery: {
    label: 'Query Memory',
    color: '#10b981',
    category: 'memory',
    description: 'Query memories from the MCP memory system',
    inputs: ['query', 'limit', 'category'],
    outputs: ['results'],
  },
  
  // Workflow Operations
  workflowExecute: {
    label: 'Execute Workflow',
    color: '#8b5cf6',
    category: 'workflow',
    description: 'Execute an MCP workflow',
    inputs: ['workflowId', 'parameters'],
    outputs: ['result', 'status'],
  },
  workflowSchedule: {
    label: 'Schedule Workflow',
    color: '#f59e0b',
    category: 'workflow',
    description: 'Schedule an MCP workflow to run at a specific time',
    inputs: ['workflowId', 'cron', 'parameters'],
    outputs: ['scheduleId'],
  },
  
  // LLM Operations
  llmCall: {
    label: 'LLM Call',
    color: '#ef4444',
    category: 'llm',
    description: 'Make an optimized LLM call via OpenRouter',
    inputs: ['prompt', 'model', 'crewMember'],
    outputs: ['response'],
  },
  
  // Supabase Operations
  supabaseQuery: {
    label: 'Supabase Query',
    color: '#06b6d4',
    category: 'database',
    description: 'Query data from Supabase',
    inputs: ['table', 'filters', 'limit'],
    outputs: ['data'],
  },
  supabaseInsert: {
    label: 'Supabase Insert',
    color: '#06b6d4',
    category: 'database',
    description: 'Insert data into Supabase',
    inputs: ['table', 'data'],
    outputs: ['insertedId'],
  },
  
  // Logic Operations
  condition: {
    label: 'Condition',
    color: '#ec4899',
    category: 'logic',
    description: 'Conditional branching based on input',
    inputs: ['value', 'operator', 'compare'],
    outputs: ['true', 'false'],
  },
  
  // Transform Operations
  transform: {
    label: 'Transform Data',
    color: '#14b8a6',
    category: 'transform',
    description: 'Transform data using JavaScript',
    inputs: ['data', 'script'],
    outputs: ['transformed'],
  },
};

export type MCPNodeType = keyof typeof MCP_NODE_TYPES;

