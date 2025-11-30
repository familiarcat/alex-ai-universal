// TypeScript interfaces for Supabase RAG integration
// These types enable type-safe interaction with the Alex AI RAG system

export interface AlexAIMemory {
  memory_id: string;
  title: string;
  description: string;
  category: 'feature_discovery' | 'governance' | 'workflow_integration' | 'crew_system';
  priority: 'critical' | 'high' | 'medium' | 'low';
  tags: string[];
  content: Record<string, any>;
  created_at: string;
  updated_at: string;
  status: 'active' | 'inactive' | 'deprecated';
  source_project?: string;
  beam_up_date?: string;
  universal_applicability: boolean;
  crew_integration_status: 'pending' | 'distributed' | 'integrated';
}

export interface RAGContext {
  memory_id: string;
  context_type: string;
  search_terms: string[];
  related_concepts: string[];
  usage_scenarios: string[];
  created_at: string;
}

export interface MemoryUsage {
  memory_id: string;
  usage_count: number;
  last_accessed: string | null;
  access_context: string;
  success_rate: number;
  user_feedback: string | null;
}

// Specific types for PR Creation Capability
export interface PRCreationCapability {
  memory_id: 'professional_pr_creation_capability';
  title: 'Professional Pull Request Creation - Universal Feature';
  description: string;
  content: {
    feature_type: 'Git Workflow Enhancement';
    discovery_context: {
      source_project: string;
      discovery_date: string;
      discovery_context: string;
      discoverer: string;
    };
    technical_specification: {
      interface: {
        generatePRTitle: string;
        createPRDescription: string;
        generateTestingInstructions: string;
        createImpactAnalysis: string;
        formatPRTemplate: string;
      };
      implementation_pattern: string;
      integration_points: string[];
    };
    pr_template_structure: {
      title: string;
      description: string;
      changes_made: string;
      impact_analysis: string;
      testing_instructions: string;
      review_guidelines: string;
      milestone_integration: string;
      documentation_updates: string;
      screenshots: string;
      checklists: string;
    };
    automatic_content_generation: {
      change_summaries: string;
      impact_assessment: string;
      testing_scenarios: string;
      documentation_detection: string;
      code_examples: string;
      link_generation: string;
    };
    benefits: {
      development_teams: {
        consistency: string;
        quality: string;
        efficiency: string;
        professionalism: string;
      };
      project_management: {
        visibility: string;
        tracking: string;
        communication: string;
        documentation: string;
      };
      code_review: {
        context: string;
        focus: string;
        testing: string;
        risk_assessment: string;
      };
    };
    crew_integration: {
      captain_picard: string;
      commander_data: string;
      lieutenant_geordi: string;
      lieutenant_worf: string;
      dr_crusher: string;
      commander_riker: string;
      counselor_troi: string;
      lieutenant_uhura: string;
      quark: string;
    };
    implementation_roadmap: {
      phase_1: string;
      phase_2: string;
      phase_3: string;
      phase_4: string;
      phase_5: string;
    };
    success_metrics: {
      pr_creation_time: string;
      review_quality: string;
      team_collaboration: string;
      documentation_completeness: string;
      stakeholder_satisfaction: string;
    };
  };
}

// RAG Query Result Types
export interface PRCreationSearchResult {
  memory_id: string;
  title: string;
  description: string;
  content: Record<string, any>;
  relevance_score: number;
}

export interface PRTemplateStructure {
  template_section: string;
  description: string;
  required: boolean;
  example_content: string;
}

export interface PRCreationBenefit {
  category: string;
  benefit_name: string;
  benefit_description: string;
}

export interface CrewPRIntegration {
  crew_member: string;
  integration_role: string;
  responsibilities: string;
}

// Supabase Client Interface
export interface SupabaseRAGClient {
  // Search functions
  searchPRCreationCapability(query: string): Promise<PRCreationSearchResult[]>;
  getAllPRCapabilities(): Promise<AlexAIMemory[]>;
  getPRTemplateStructure(): Promise<PRTemplateStructure[]>;
  getPRCreationBenefits(category?: string): Promise<PRCreationBenefit[]>;
  getCrewPRIntegration(): Promise<CrewPRIntegration[]>;
  searchPRCreationContext(terms: string[]): Promise<RAGContext[]>;
  
  // Usage tracking
  updatePRCreationUsage(context: string, success: boolean, feedback?: string): Promise<void>;
  
  // Memory management
  getMemory(memoryId: string): Promise<AlexAIMemory | null>;
  updateMemory(memoryId: string, updates: Partial<AlexAIMemory>): Promise<void>;
  createMemory(memory: Omit<AlexAIMemory, 'created_at' | 'updated_at'>): Promise<void>;
}

// RAG System Configuration
export interface RAGSystemConfig {
  supabaseUrl: string;
  supabaseKey: string;
  defaultSearchLimit: number;
  relevanceThreshold: number;
  enableUsageTracking: boolean;
  enableFeedback: boolean;
}

// Usage Examples
export const RAGUsageExamples = {
  // Search for PR creation capability
  searchPRCreation: async (client: SupabaseRAGClient, query: string) => {
    return await client.searchPRCreationCapability(query);
  },
  
  // Get PR template for immediate use
  getPRTemplate: async (client: SupabaseRAGClient) => {
    return await client.getPRTemplateStructure();
  },
  
  // Get crew integration details
  getCrewIntegration: async (client: SupabaseRAGClient) => {
    return await client.getCrewPRIntegration();
  },
  
  // Track successful usage
  trackUsage: async (client: SupabaseRAGClient, context: string, feedback?: string) => {
    return await client.updatePRCreationUsage(context, true, feedback);
  }
};

// Type guards
export function isPRCreationCapability(memory: AlexAIMemory): memory is PRCreationCapability {
  return memory.memory_id === 'professional_pr_creation_capability';
}

export function isActiveMemory(memory: AlexAIMemory): boolean {
  return memory.status === 'active';
}

export function hasUniversalApplicability(memory: AlexAIMemory): boolean {
  return memory.universal_applicability === true;
}
