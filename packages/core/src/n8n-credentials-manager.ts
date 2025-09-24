/**
 * N8N Credentials Manager
 * Handles N8N workflow credentials and authentication
 */

export interface N8NCredentials {
  apiKey?: string;
  baseUrl?: string;
  username?: string;
  password?: string;
}

export class N8NCredentialsManager {
  private credentials: N8NCredentials = {};

  constructor(credentials?: N8NCredentials) {
    if (credentials) {
      this.credentials = { ...credentials };
    }
  }

  /**
   * Set credentials for N8N connection
   */
  setCredentials(credentials: N8NCredentials): void {
    this.credentials = { ...credentials };
  }

  /**
   * Get current credentials
   */
  getCredentials(): N8NCredentials {
    return { ...this.credentials };
  }

  /**
   * Check if credentials are valid
   */
  hasValidCredentials(): boolean {
    return !!(this.credentials.apiKey || (this.credentials.username && this.credentials.password));
  }

  /**
   * Clear all credentials
   */
  clearCredentials(): void {
    this.credentials = {};
  }

  /**
   * Get authentication headers for API requests
   */
  getAuthHeaders(): Record<string, string> {
    const headers: Record<string, string> = {};
    
    if (this.credentials.apiKey) {
      headers['Authorization'] = `Bearer ${this.credentials.apiKey}`;
    } else if (this.credentials.username && this.credentials.password) {
      const auth = Buffer.from(`${this.credentials.username}:${this.credentials.password}`).toString('base64');
      headers['Authorization'] = `Basic ${auth}`;
    }
    
    return headers;
  }

  /**
   * Test N8N connection
   */
  async testConnection(): Promise<boolean> {
    try {
      if (!this.hasValidCredentials()) {
        return false;
      }

      const response = await fetch(`${this.credentials.baseUrl || 'http://localhost:5678'}/api/v1/workflows`, {
        headers: this.getAuthHeaders()
      });

      return response.ok;
    } catch (error) {
      console.error('N8N connection test failed:', error);
      return false;
    }
  }

  /**
   * Get N8N credentials (alias for getCredentials)
   */
  getN8NCredentials(): N8NCredentials {
    return this.getCredentials();
  }

  /**
   * Get Supabase credentials (placeholder - this might need separate implementation)
   */
  getSupabaseCredentials(): any {
    // This might need to be implemented separately or moved to a different manager
    return {};
  }
}

export default N8NCredentialsManager;