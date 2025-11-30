/**
 * Security Best Practices Utilities
 * 
 * Secure credential handling and security patterns
 */

class SecurityUtils {
  /**
   * Load credentials securely from environment
   */
  static loadCredentials() {
    const credentials = {
      n8n: {
        baseUrl: process.env.N8N_URL || '',
        apiKey: process.env.N8N_API_KEY || process.env.N8N_OWNER_API_KEY || '',
        email: process.env.N8N_EMAIL || '',
        password: process.env.N8N_PASSWORD || ''
      },
      supabase: {
        url: process.env.SUPABASE_URL || '',
        key: process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY || ''
      },
      aws: {
        region: process.env.AWS_REGION || 'us-east-2',
        accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || ''
      }
    };
    
    // Validate required credentials
    this.validateCredentials(credentials);
    
    return credentials;
  }
  
  /**
   * Validate credentials without exposing values
   */
  static validateCredentials(creds) {
    const missing = [];
    
    if (!creds.n8n?.baseUrl) missing.push('N8N_URL');
    if (!creds.n8n?.apiKey) missing.push('N8N_API_KEY or N8N_OWNER_API_KEY');
    if (!creds.supabase?.url) missing.push('SUPABASE_URL');
    if (!creds.supabase?.key) missing.push('SUPABASE_SERVICE_ROLE_KEY or SUPABASE_ANON_KEY');
    
    if (missing.length > 0) {
      throw new Error(`Missing required credentials: ${missing.join(', ')}`);
    }
  }
  
  /**
   * Sanitize output to prevent credential exposure
   */
  static sanitizeOutput(output) {
    const sensitivePatterns = [
      /(api[_-]?key|apikey)\s*[:=]\s*['"]?[\w-]+['"]?/gi,
      /(password|passwd|pwd)\s*[:=]\s*['"]?[^'"]+['"]?/gi,
      /(secret|token|auth)\s*[:=]\s*['"]?[\w-]+['"]?/gi
    ];
    
    let sanitized = output;
    sensitivePatterns.forEach(pattern => {
      sanitized = sanitized.replace(pattern, '[REDACTED]');
    });
    
    return sanitized;
  }
}

module.exports = { SecurityUtils };
