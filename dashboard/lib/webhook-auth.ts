/**
 * Webhook HMAC Authentication
 * Lt. Worf's Security Protocol for N8N Webhooks
 * 
 * This module provides HMAC signature generation for all webhook calls,
 * ensuring only authorized clients can trigger n8n workflows.
 */

import crypto from 'crypto';

/**
 * Generate HMAC signature for webhook request
 * 
 * @param body - Request body (will be JSON stringified)
 * @param secret - HMAC secret key (from environment)
 * @returns HMAC signature (64-character hex string)
 */
export function generateWebhookSignature(body: any, secret: string): string {
  const bodyString = typeof body === 'string' ? body : JSON.stringify(body);
  
  const signature = crypto
    .createHmac('sha256', secret)
    .update(bodyString)
    .digest('hex');
  
  return signature;
}

/**
 * Send authenticated webhook request to n8n
 * 
 * @param url - Full webhook URL
 * @param data - Request payload
 * @param options - Additional fetch options
 * @returns Response from n8n
 */
export async function sendAuthenticatedWebhook(
  url: string,
  data: any,
  options: RequestInit = {}
): Promise<Response> {
  const body = JSON.stringify(data);
  
  // Get HMAC secret from environment
  // Note: This must be set in .env.local as NEXT_PUBLIC_N8N_WEBHOOK_HMAC_SECRET
  const secret = process.env.NEXT_PUBLIC_N8N_WEBHOOK_HMAC_SECRET;
  
  if (!secret) {
    console.error('⚠️  HMAC secret not configured! Webhook will fail authentication.');
    console.error('   Add NEXT_PUBLIC_N8N_WEBHOOK_HMAC_SECRET to .env.local');
    // For backward compatibility during rollout, continue without signature
    // This will be removed in Phase 3 (enforcement)
  }
  
  // Generate HMAC signature
  const signature = secret ? generateWebhookSignature(data, secret) : 'unsigned';
  
  // Send request with HMAC signature in header
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-N8N-Signature': signature,  // HMAC authentication
      ...options.headers
    },
    body,
    ...options
  });
  
  return response;
}

/**
 * Verify HMAC signature (for testing/debugging)
 * 
 * @param body - Request body
 * @param receivedSignature - Signature from request header
 * @param secret - HMAC secret
 * @returns true if valid, false otherwise
 */
export function verifyWebhookSignature(
  body: any,
  receivedSignature: string,
  secret: string
): boolean {
  const expectedSignature = generateWebhookSignature(body, secret);
  
  // Use timing-safe comparison to prevent timing attacks
  return crypto.timingSafeEqual(
    Buffer.from(receivedSignature, 'hex'),
    Buffer.from(expectedSignature, 'hex')
  );
}

/**
 * Example Usage:
 * 
 * ```typescript
 * import { sendAuthenticatedWebhook } from '@/lib/webhook-auth';
 * 
 * // Send authenticated request to n8n
 * const response = await sendAuthenticatedWebhook(
 *   'https://n8n.pbradygeorgen.com/webhook/knowledge-ingest',
 *   { content: 'Crew memory', type: 'innovation' }
 * );
 * 
 * if (response.ok) {
 *   console.log('✅ Webhook executed successfully');
 * } else {
 *   console.error('❌ Webhook failed:', response.status);
 * }
 * ```
 */

