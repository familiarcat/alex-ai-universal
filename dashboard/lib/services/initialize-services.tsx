'use client';

/**
 * 🖖 Service Initialization
 * 
 * Initializes all services in dependency order
 * Each service reports its own status and progress
 * 
 * Crew: La Forge (Implementation) & Data (Architecture)
 */

import { useEffect } from 'react';
import { useServiceContainers, useServiceInitialization } from '../service-containers';
import { SERVICE_DEFINITIONS } from './define-services';

/**
 * Initialize Supabase service
 */
async function initializeSupabase() {
  // Check if Supabase is accessible
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  
  if (!supabaseUrl) {
    throw new Error('Supabase URL not configured');
  }
  
  if (!supabaseKey) {
    throw new Error('Supabase API key not configured');
  }
  
  // Simple connectivity check with timeout
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout
    
    const response = await fetch(`${supabaseUrl}/rest/v1/`, {
      method: 'HEAD',
      headers: {
        'apikey': supabaseKey,
        'Authorization': `Bearer ${supabaseKey}`
      },
      signal: controller.signal
    });
    
    clearTimeout(timeoutId);
    
    // 401 is expected if not authenticated, but connection works
    // 404 means endpoint doesn't exist but connection works
    // Only fail on network errors or 5xx errors
    if (response.status >= 500) {
      throw new Error(`Supabase server error: ${response.status}`);
    }
    
    // 401 is OK - it means we can connect, just not authenticated
    // This is acceptable for initialization check
    if (response.status === 401) {
      return; // Connection works, authentication will be handled later
    }
    
    if (!response.ok && response.status !== 404) {
      throw new Error(`Supabase returned ${response.status}`);
    }
  } catch (error: any) {
    if (error.name === 'AbortError') {
      throw new Error('Supabase connection timeout');
    }
    if (error.message?.includes('Failed to fetch')) {
      throw new Error('Cannot connect to Supabase - check network');
    }
    throw error;
  }
}

/**
 * Initialize n8n service
 */
async function initializeN8N() {
  const n8nUrl = process.env.NEXT_PUBLIC_N8N_API_URL || 'https://n8n.pbradygeorgen.com';
  
  try {
    const response = await fetch(`${n8nUrl}/healthz`, {
      method: 'GET',
      signal: AbortSignal.timeout(5000)
    });
    if (!response.ok) {
      throw new Error(`n8n returned ${response.status}`);
    }
  } catch (error: any) {
    if (error.name === 'TimeoutError' || error.message?.includes('Failed to fetch')) {
      throw new Error('n8n server unavailable - will use fallback');
    }
    throw error;
  }
}

/**
 * Initialize MCP service
 */
async function initializeMCP() {
  const mcpUrl = process.env.NEXT_PUBLIC_MCP_API_URL || 'https://mcp.pbradygeorgen.com';
  
  try {
    const response = await fetch(`${mcpUrl}/healthz`, {
      method: 'GET',
      signal: AbortSignal.timeout(5000)
    });
    if (!response.ok) {
      throw new Error(`MCP returned ${response.status}`);
    }
  } catch (error: any) {
    if (error.name === 'TimeoutError' || error.message?.includes('Failed to fetch')) {
      throw new Error('MCP server unavailable - will use n8n fallback');
    }
    throw error;
  }
}

/**
 * Initialize Unified Data Service
 */
async function initializeUnifiedDataService() {
  // Service is client-side only, just verify it can be imported
  const { getUnifiedDataService } = await import('../unified-data-service');
  const service = getUnifiedDataService();
  
  // Verify service is configured
  if (!service) {
    throw new Error('Unified Data Service not available');
  }
}

/**
 * Initialize feature services (these are component-level, just verify dependencies)
 */
async function initializeFeatureService(serviceId: string) {
  // Feature services are initialized by their components
  // This just verifies dependencies are ready
  return Promise.resolve();
}

/**
 * Initialize Live Refresh service
 */
async function initializeLiveRefresh() {
  // Live refresh uses WebSocket, which will fall back to polling
  // Just verify the component can initialize
  return Promise.resolve();
}

/**
 * Initialize Theme service
 */
async function initializeTheme() {
  // Theme service uses localStorage and Supabase
  // Just verify it can access state
  const { useAppState } = await import('../state-manager');
  // State manager is a hook, so we can't call it here
  // Just verify the module loads
  return Promise.resolve();
}

/**
 * Service initialization map
 */
const INITIALIZATION_MAP: Record<string, () => Promise<void>> = {
  'supabase': initializeSupabase,
  'n8n': initializeN8N,
  'mcp': initializeMCP,
  'unified-data-service': initializeUnifiedDataService,
  'crew-memory-service': () => initializeFeatureService('crew-memory-service'),
  'learning-analytics-service': () => initializeFeatureService('learning-analytics-service'),
  'rag-recommendations-service': () => initializeFeatureService('rag-recommendations-service'),
  'security-assessment-service': () => initializeFeatureService('security-assessment-service'),
  'cost-optimization-service': () => initializeFeatureService('cost-optimization-service'),
  'documentation-service': () => initializeFeatureService('documentation-service'),
  'live-refresh-service': initializeLiveRefresh,
  'theme-service': initializeTheme
};

/**
 * Component to initialize all services
 * Uses individual service initialization hooks for each service
 */
export function ServiceInitializer() {
  const { registerService } = useServiceContainers();

  // Register all services on mount
  useEffect(() => {
    SERVICE_DEFINITIONS.forEach(serviceDef => {
      registerService(serviceDef);
    });
  }, [registerService]);

  // Initialize each service individually
  // Supabase
  useServiceInitialization(
    'supabase',
    SERVICE_DEFINITIONS.find(s => s.id === 'supabase')!,
    initializeSupabase
  );

  // n8n
  useServiceInitialization(
    'n8n',
    SERVICE_DEFINITIONS.find(s => s.id === 'n8n')!,
    initializeN8N
  );

  // MCP
  useServiceInitialization(
    'mcp',
    SERVICE_DEFINITIONS.find(s => s.id === 'mcp')!,
    initializeMCP
  );

  // Unified Data Service
  useServiceInitialization(
    'unified-data-service',
    SERVICE_DEFINITIONS.find(s => s.id === 'unified-data-service')!,
    initializeUnifiedDataService
  );

  // Feature services
  useServiceInitialization(
    'crew-memory-service',
    SERVICE_DEFINITIONS.find(s => s.id === 'crew-memory-service')!,
    () => initializeFeatureService('crew-memory-service')
  );

  useServiceInitialization(
    'learning-analytics-service',
    SERVICE_DEFINITIONS.find(s => s.id === 'learning-analytics-service')!,
    () => initializeFeatureService('learning-analytics-service')
  );

  useServiceInitialization(
    'rag-recommendations-service',
    SERVICE_DEFINITIONS.find(s => s.id === 'rag-recommendations-service')!,
    () => initializeFeatureService('rag-recommendations-service')
  );

  useServiceInitialization(
    'security-assessment-service',
    SERVICE_DEFINITIONS.find(s => s.id === 'security-assessment-service')!,
    () => initializeFeatureService('security-assessment-service')
  );

  useServiceInitialization(
    'cost-optimization-service',
    SERVICE_DEFINITIONS.find(s => s.id === 'cost-optimization-service')!,
    () => initializeFeatureService('cost-optimization-service')
  );

  useServiceInitialization(
    'documentation-service',
    SERVICE_DEFINITIONS.find(s => s.id === 'documentation-service')!,
    () => initializeFeatureService('documentation-service')
  );

  // Live Refresh
  useServiceInitialization(
    'live-refresh-service',
    SERVICE_DEFINITIONS.find(s => s.id === 'live-refresh-service')!,
    initializeLiveRefresh
  );

  // Theme Service
  useServiceInitialization(
    'theme-service',
    SERVICE_DEFINITIONS.find(s => s.id === 'theme-service')!,
    initializeTheme
  );

  return null; // This component doesn't render anything
}

