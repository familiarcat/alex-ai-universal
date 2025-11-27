/**
 * 🖖 Environment Configuration for Cross-Platform Deployment
 * 
 * Supports:
 * - Local macOS development (localhost)
 * - EC2 production (remote URLs)
 * - Docker deployments
 * - Terraform-managed infrastructure
 * 
 * Reviewed by: Lieutenant Commander La Forge (Infrastructure)
 */

export interface EnvironmentConfig {
  isProduction: boolean;
  isLocal: boolean;
  dashboardUrl: string;
  liveServerUrl: string;
  socketPath: string;
  n8nUrl: string;
  supabaseUrl: string;
}

/**
 * Get environment configuration
 * Automatically detects local vs production environment
 */
export function getEnvironmentConfig(): EnvironmentConfig {
  const isProduction = process.env.NODE_ENV === 'production';
  const isLocal = !isProduction && 
    (typeof window === 'undefined' || 
     window.location.hostname === 'localhost' || 
     window.location.hostname === '127.0.0.1');

  // Determine URLs based on environment
  let dashboardUrl: string;
  let liveServerUrl: string;

  if (isProduction) {
    // Production: Use EC2 URLs from environment
    dashboardUrl = process.env.EC2_DASHBOARD_URL || 
                   process.env.NEXT_PUBLIC_DASHBOARD_URL || 
                   'https://dashboard.pbradygeorgen.com';
    
    liveServerUrl = process.env.EC2_LIVE_SERVER_URL || 
                    process.env.NEXT_PUBLIC_LIVE_SERVER_URL || 
                    'https://live.pbradygeorgen.com';
  } else {
    // Local development: Use localhost
    dashboardUrl = process.env.NEXT_PUBLIC_DASHBOARD_URL || 
                   `http://localhost:${process.env.PORT || 3000}`;
    
    liveServerUrl = process.env.NEXT_PUBLIC_LIVE_SERVER_URL || 
                    `http://localhost:${process.env.LIVE_SERVER_PORT || 3001}`;
  }

  return {
    isProduction,
    isLocal,
    dashboardUrl,
    liveServerUrl,
    socketPath: process.env.NEXT_PUBLIC_SOCKET_PATH || '/api/socket',
    n8nUrl: process.env.N8N_URL || process.env.NEXT_PUBLIC_N8N_URL || 'https://n8n.pbradygeorgen.com',
    supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  };
}

/**
 * Get current server URL (for Socket.IO connection)
 */
export function getCurrentServerUrl(): string {
  if (typeof window !== 'undefined') {
    // Client-side: Use current window location
    return `${window.location.protocol}//${window.location.host}`;
  }
  
  // Server-side: Use environment config
  const config = getEnvironmentConfig();
  return config.dashboardUrl;
}

/**
 * Get target server URL for cross-server sync
 */
export function getTargetServerUrl(): string {
  const config = getEnvironmentConfig();
  const currentPort = typeof window !== 'undefined' 
    ? (parseInt(window.location.port) || 3000)
    : parseInt(process.env.PORT || '3000');
  
  // If on dashboard port (3000), sync to live server (3001)
  // If on live server port (3001), sync to dashboard (3000)
  if (currentPort === 3000 || currentPort === parseInt(process.env.DASHBOARD_PORT || '3000')) {
    return config.liveServerUrl;
  } else {
    return config.dashboardUrl;
  }
}

