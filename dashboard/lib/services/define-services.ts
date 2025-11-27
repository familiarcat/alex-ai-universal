/**
 * 🖖 Service Definitions
 * 
 * Defines all services with their roles, dependencies, and initialization
 * Services load in dependency order and report their status
 * 
 * Crew: Data (Architecture) & La Forge (Infrastructure)
 */

import { ServiceContainer } from '../service-containers';

/**
 * Core service definitions
 * Order matters - dependencies must be defined before dependents
 */
export const SERVICE_DEFINITIONS: Omit<ServiceContainer, 'status' | 'progress' | 'lastUpdate'>[] = [
  // Foundation services (no dependencies)
  {
    id: 'supabase',
    name: 'Supabase',
    role: 'Database',
    description: 'Vector database and authentication provider',
    dependencies: []
  },
  {
    id: 'n8n',
    name: 'n8n Workflows',
    role: 'Controller (Fallback)',
    description: 'Workflow automation and fallback controller',
    dependencies: []
  },
  {
    id: 'mcp',
    name: 'MCP Server',
    role: 'Controller (Primary)',
    description: 'Model Context Protocol server - primary controller',
    dependencies: []
  },
  
  // Data services (depend on controllers)
  {
    id: 'unified-data-service',
    name: 'Unified Data Service',
    role: 'Data Access Layer',
    description: 'Client-side data access with MCP/n8n fallback',
    dependencies: ['mcp', 'n8n']
  },
  
  // Feature services (depend on data layer)
  {
    id: 'crew-memory-service',
    name: 'Crew Memory Service',
    role: 'Memory Retrieval',
    description: 'Retrieves and displays crew member memories',
    dependencies: ['unified-data-service', 'supabase']
  },
  {
    id: 'learning-analytics-service',
    name: 'Learning Analytics',
    role: 'Analytics',
    description: 'Tracks RAG memory growth and learning metrics',
    dependencies: ['unified-data-service']
  },
  {
    id: 'rag-recommendations-service',
    name: 'RAG Recommendations',
    role: 'Recommendations',
    description: 'Provides intelligent project recommendations',
    dependencies: ['unified-data-service']
  },
  {
    id: 'security-assessment-service',
    name: 'Security Assessment',
    role: 'Security',
    description: 'Continuous security monitoring and audits',
    dependencies: ['unified-data-service']
  },
  {
    id: 'cost-optimization-service',
    name: 'Cost Optimization',
    role: 'Cost Management',
    description: 'Monitors and optimizes API costs',
    dependencies: ['unified-data-service']
  },
  {
    id: 'documentation-service',
    name: 'Documentation Service',
    role: 'Documentation',
    description: 'Component-level documentation browser',
    dependencies: ['unified-data-service']
  },
  
  // UI services (depend on feature services)
  {
    id: 'live-refresh-service',
    name: 'Live Refresh',
    role: 'Real-time Updates',
    description: 'WebSocket-based live codebase change detection',
    dependencies: []
  },
  {
    id: 'theme-service',
    name: 'Theme Service',
    role: 'UI Theming',
    description: 'Global theme management and persistence',
    dependencies: ['supabase']
  }
];

/**
 * Get service definition by ID
 */
export function getServiceDefinition(id: string) {
  return SERVICE_DEFINITIONS.find(s => s.id === id);
}

/**
 * Get all service IDs in dependency order
 */
export function getServiceIdsInOrder(): string[] {
  return SERVICE_DEFINITIONS.map(s => s.id);
}



