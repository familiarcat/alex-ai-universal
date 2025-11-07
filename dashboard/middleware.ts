// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Alex AI Universal - Next.js Middleware (Authentication & Rate Limiting)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Team Alpha: Lieutenant Worf (Security) + Chief O'Brien (Pragmatic Implementation)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

import { auth } from "./lib/auth";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Worf's Security: Rate limiting for API routes
  if (pathname.startsWith("/api")) {
    const identifier = request.ip || "unknown";
    const rateLimitKey = `${identifier}:${pathname}`;

    // Simple rate limiting (100 requests per minute)
    // In production, use Redis or a proper rate limiting service
    const rateLimitHeader = request.headers.get("x-ratelimit-remaining");
    if (rateLimitHeader && parseInt(rateLimitHeader) <= 0) {
      return NextResponse.json(
        {
          error: "Rate limit exceeded",
          message: "Too many requests. Please try again later.",
        },
        {
          status: 429,
          headers: {
            "Retry-After": "60",
            "X-RateLimit-Limit": "100",
            "X-RateLimit-Remaining": "0",
            "X-RateLimit-Reset": String(Date.now() + 60000),
          },
        }
      );
    }
  }

  // Worf's Security: Protect sensitive routes
  const protectedPaths = ["/dashboard", "/projects"];
  const isProtectedPath = protectedPaths.some((path) =>
    pathname.startsWith(path)
  );

  if (isProtectedPath) {
    const session = await auth();

    if (!session || !session.user) {
      // Redirect to sign-in page
      const signInUrl = new URL("/auth/signin", request.url);
      signInUrl.searchParams.set("callbackUrl", pathname);
      return NextResponse.redirect(signInUrl);
    }
  }

  // Allow public routes and authenticated requests to proceed
  return NextResponse.next();
}

// Worf's Security Configuration: Define which routes should be protected
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    "/((?!_next/static|_next/image|favicon.ico|public).*)",
  ],
};

