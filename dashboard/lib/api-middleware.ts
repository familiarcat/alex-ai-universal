// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Alex AI Universal - API Middleware Helpers
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Team Gamma: Counselor Troi (UX) + Dr. Crusher (Health) + Lieutenant Worf (Security)
// Updated: Now uses @alex-ai/rate-limiter for unified rate limiting
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

import { NextRequest, NextResponse } from "next/server";
import { auth } from "./auth";
import { createNextJsRateLimiter } from "../../packages/rate-limiter/dist/index";

// Create global rate limiter instance
const rateLimiter = createNextJsRateLimiter({
  maxRequests: 100,
  windowMs: 60000,
  message: "You're doing that a bit too quickly. Take a breath and try again in a moment.",
  headers: true,
});

/**
 * Worf's Security: Require authentication for API routes
 *
 * Usage:
 * ```typescript
 * import { requireAuth } from "@/lib/api-middleware";
 *
 * export async function GET(request: NextRequest) {
 *   const authResult = await requireAuth(request);
 *   if (authResult instanceof NextResponse) return authResult; // Unauthorized
 *
 *   const { user } = authResult;
 *   // ... your API logic with authenticated user
 * }
 * ```
 */
export async function requireAuth(request: NextRequest) {
  const session = await auth();

  if (!session || !session.user) {
    return NextResponse.json(
      {
        error: "Unauthorized",
        message: "Authentication required",
        code: "AUTH_REQUIRED",
      },
      { status: 401 }
    );
  }

  return { user: session.user, session };
}

/**
 * Counselor Troi's User-Friendly Rate Limiter for API routes
 *
 * Now powered by @alex-ai/rate-limiter for unified rate limiting across all systems
 *
 * Usage:
 * ```typescript
 * export async function POST(request: NextRequest) {
 *   const rateLimitResult = await checkRateLimit(request, "api-endpoint", 10, 60000);
 *   if (rateLimitResult instanceof NextResponse) return rateLimitResult;
 *
 *   // ... your API logic
 * }
 * ```
 */
export async function checkRateLimit(
  request: NextRequest,
  endpoint: string,
  maxRequests: number = 100,
  windowMs: number = 60000
): Promise<NextResponse | true> {
  // Create custom rate limiter if non-default settings
  const limiter = (maxRequests !== 100 || windowMs !== 60000)
    ? createNextJsRateLimiter({ maxRequests, windowMs })
    : rateLimiter;

  const result = limiter.checkLimit(request, endpoint);

  if (!result.allowed && result.response) {
    return NextResponse.json(result.response.body, {
      status: result.response.status,
      headers: result.response.headers,
    });
  }

  return true;
}

/**
 * Worf's Security: Validate webhook signatures
 *
 * For n8n webhooks or external services that send signed requests
 */
export function validateWebhookSignature(
  request: NextRequest,
  expectedSignature: string
): boolean {
  const signature = request.headers.get("x-webhook-signature");

  if (!signature) {
    return false;
  }

  // Simple comparison (in production, use timing-safe comparison)
  return signature === expectedSignature;
}

/**
 * Data's Precise Error Handler
 *
 * Standardized error responses for all API routes
 */
export function apiError(
  message: string,
  code: string,
  status: number = 500,
  details?: any
): NextResponse {
  return NextResponse.json(
    {
      error: message,
      code,
      details,
      timestamp: new Date().toISOString(),
    },
    { status }
  );
}

/**
 * Data's Precise Success Handler
 *
 * Standardized success responses for all API routes
 */
export function apiSuccess<T = any>(data: T, status: number = 200): NextResponse {
  return NextResponse.json(
    {
      success: true,
      data,
      timestamp: new Date().toISOString(),
    },
    { status }
  );
}

/**
 * Worf's Security: Validate request body against schema
 *
 * Simple validation helper
 */
export function validateBody<T>(
  body: any,
  requiredFields: (keyof T)[]
): { valid: true; data: T } | { valid: false; error: NextResponse } {
  for (const field of requiredFields) {
    if (!(field in body) || body[field] === undefined || body[field] === null) {
      return {
        valid: false,
        error: apiError(
          `Missing required field: ${String(field)}`,
          "VALIDATION_ERROR",
          400
        ),
      };
    }
  }

  return { valid: true, data: body as T };
}

/**
 * Combined middleware: Auth + Rate Limiting
 *
 * Usage:
 * ```typescript
 * export async function POST(request: NextRequest) {
 *   const middleware = await withAuthAndRateLimit(request, "create-project", 10, 60000);
 *   if (middleware instanceof NextResponse) return middleware;
 *
 *   const { user } = middleware;
 *   // ... your API logic
 * }
 * ```
 */
export async function withAuthAndRateLimit(
  request: NextRequest,
  endpoint: string,
  maxRequests: number = 100,
  windowMs: number = 60000
) {
  // Check rate limit first (faster check)
  const rateLimitResult = await checkRateLimit(
    request,
    endpoint,
    maxRequests,
    windowMs
  );
  if (rateLimitResult instanceof NextResponse) {
    return rateLimitResult;
  }

  // Then check auth
  const authResult = await requireAuth(request);
  if (authResult instanceof NextResponse) {
    return authResult;
  }

  return authResult;
}

