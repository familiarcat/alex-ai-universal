/**
 * 🛡️ API Security Utilities
 * 
 * Security functions for API routes:
 * - Authentication/authorization
 * - Rate limiting
 * - Error sanitization
 * - Input validation
 * 
 * Crew: Lieutenant Worf (Security Lead) + Dr. Crusher (System Health)
 */

import { NextRequest } from 'next/server';

export interface SecurityConfig {
  requireAuth?: boolean;
  requireAdmin?: boolean;
  rateLimit?: {
    maxRequests: number;
    windowMs: number;
  };
  sanitizeErrors?: boolean;
}

// In-memory rate limit store (in production, use Redis)
const rateLimitStore = new Map<string, { count: number; resetAt: number }>();

/**
 * Check if request is authenticated
 */
export function isAuthenticated(request: NextRequest): boolean {
  // Check for API key in header
  const apiKey = request.headers.get('X-API-Key') || 
                 request.headers.get('Authorization')?.replace(/^Bearer\s+/i, '');
  const expectedKey = process.env.API_KEY || process.env.ADMIN_API_KEY;
  
  if (!expectedKey) {
    // If no API key configured, allow (development mode)
    return true;
  }
  
  return apiKey === expectedKey;
}

/**
 * Check if request is from admin
 */
export function isAdmin(request: NextRequest): boolean {
  const adminKey = request.headers.get('X-Admin-Key') || 
                   request.headers.get('Authorization')?.replace(/^Bearer\s+/i, '');
  const expectedAdminKey = process.env.ADMIN_API_KEY;
  
  if (!expectedAdminKey) {
    // If no admin key configured, check regular API key
    return isAuthenticated(request);
  }
  
  return adminKey === expectedAdminKey;
}

/**
 * Rate limiting check
 */
export function checkRateLimit(
  request: NextRequest,
  maxRequests: number = 10,
  windowMs: number = 60000
): { allowed: boolean; remaining: number; resetAt: number } {
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0] || 
             request.headers.get('x-real-ip') || 
             'unknown';
  const key = `rate-limit:${ip}`;
  const now = Date.now();
  
  const record = rateLimitStore.get(key);
  
  if (!record || now > record.resetAt) {
    // New window
    rateLimitStore.set(key, {
      count: 1,
      resetAt: now + windowMs
    });
    return {
      allowed: true,
      remaining: maxRequests - 1,
      resetAt: now + windowMs
    };
  }
  
  if (record.count >= maxRequests) {
    return {
      allowed: false,
      remaining: 0,
      resetAt: record.resetAt
    };
  }
  
  record.count++;
  rateLimitStore.set(key, record);
  
  return {
    allowed: true,
    remaining: maxRequests - record.count,
    resetAt: record.resetAt
  };
}

/**
 * Sanitize error message for public consumption
 */
export function sanitizeError(error: Error | string, isAdmin: boolean = false): string {
  const message = typeof error === 'string' ? error : error.message;
  
  if (isAdmin) {
    // Admins can see full error details
    return message;
  }
  
  // Remove sensitive information from public errors
  const sanitized = message
    .replace(/API[_-]?KEY[=:]\s*[\w-]+/gi, 'API_KEY=***')
    .replace(/Bearer\s+[\w-]+/gi, 'Bearer ***')
    .replace(/https?:\/\/[^\s]+/g, (url) => {
      // Keep domain but remove paths and query params
      try {
        const urlObj = new URL(url);
        return `${urlObj.protocol}//${urlObj.hostname}`;
      } catch {
        return '***';
      }
    })
    .replace(/password[=:]\s*[\w-]+/gi, 'password=***')
    .replace(/secret[=:]\s*[\w-]+/gi, 'secret=***');
  
  // Generic error messages for common issues
  if (message.includes('unreachable') || message.includes('connection')) {
    return 'Service temporarily unavailable';
  }
  
  if (message.includes('unauthorized') || message.includes('forbidden')) {
    return 'Access denied';
  }
  
  if (message.includes('not found') || message.includes('404')) {
    return 'Resource not found';
  }
  
  return sanitized || 'An error occurred';
}

/**
 * Validate and sanitize input
 */
export function sanitizeInput(input: string | null | undefined, maxLength: number = 100): string | null {
  if (!input) return null;
  
  const sanitized = String(input)
    .trim()
    .slice(0, maxLength)
    .replace(/[<>\"']/g, ''); // Remove potential XSS characters
  
  return sanitized || null;
}

/**
 * Security middleware wrapper
 */
export function withSecurity(
  handler: (request: NextRequest) => Promise<Response>,
  config: SecurityConfig = {}
): (request: NextRequest) => Promise<Response> {
  return async (request: NextRequest) => {
    // Rate limiting
    if (config.rateLimit) {
      const rateLimit = checkRateLimit(
        request,
        config.rateLimit.maxRequests,
        config.rateLimit.windowMs
      );
      
      if (!rateLimit.allowed) {
        return new Response(
          JSON.stringify({
            success: false,
            error: 'Rate limit exceeded',
            retryAfter: Math.ceil((rateLimit.resetAt - Date.now()) / 1000)
          }),
          {
            status: 429,
            headers: {
              'Content-Type': 'application/json',
              'X-RateLimit-Limit': String(config.rateLimit.maxRequests),
              'X-RateLimit-Remaining': String(rateLimit.remaining),
              'X-RateLimit-Reset': String(rateLimit.resetAt),
              'Retry-After': String(Math.ceil((rateLimit.resetAt - Date.now()) / 1000))
            }
          }
        );
      }
    }
    
    // Authentication
    if (config.requireAuth || config.requireAdmin) {
      if (config.requireAdmin && !isAdmin(request)) {
        return new Response(
          JSON.stringify({
            success: false,
            error: sanitizeError('Unauthorized', false)
          }),
          {
            status: 401,
            headers: { 'Content-Type': 'application/json' }
          }
        );
      }
      
      if (config.requireAuth && !isAuthenticated(request)) {
        return new Response(
          JSON.stringify({
            success: false,
            error: sanitizeError('Unauthorized', false)
          }),
          {
            status: 401,
            headers: { 'Content-Type': 'application/json' }
          }
        );
      }
    }
    
    // Execute handler with error sanitization
    try {
      const response = await handler(request);
      return response;
    } catch (error: any) {
      const isAdminRequest = config.requireAdmin && isAdmin(request);
      const sanitizedError = sanitizeError(error, isAdminRequest);
      
      return new Response(
        JSON.stringify({
          success: false,
          error: sanitizedError
        }),
        {
          status: 500,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }
  };
}



