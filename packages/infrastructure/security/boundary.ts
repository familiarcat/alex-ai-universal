/**
 * Security Boundary Enforcement
 * 
 * Ensures extensions cannot directly access domain logic
 */

export class SecurityBoundary {
  private static allowedPaths = [
    '/api/',
    '/webhook/',
    '/sdk/'
  ];
  
  static validateRequest(path: string, source: 'extension' | 'dashboard' | 'api'): boolean {
    if (source === 'extension') {
      // Extensions can only access API endpoints
      return this.allowedPaths.some(allowed => path.startsWith(allowed));
    }
    return true;
  }
  
  static enforceIsolation(context: { source: string; target: string }): void {
    if (context.source === 'extension' && context.target.startsWith('domain/')) {
      throw new Error('Extensions cannot directly access domain layer');
    }
  }
}
