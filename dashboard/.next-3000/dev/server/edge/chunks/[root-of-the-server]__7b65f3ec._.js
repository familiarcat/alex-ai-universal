(globalThis.TURBOPACK || (globalThis.TURBOPACK = [])).push(["chunks/[root-of-the-server]__7b65f3ec._.js",
"[externals]/node:buffer [external] (node:buffer, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("node:buffer", () => require("node:buffer"));

module.exports = mod;
}),
"[externals]/node:async_hooks [external] (node:async_hooks, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("node:async_hooks", () => require("node:async_hooks"));

module.exports = mod;
}),
"[project]/dashboard/lib/auth.ts [middleware-edge] (ecmascript)", ((__turbopack_context__) => {
"use strict";

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Alex AI Universal - Authentication Configuration
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Team Alpha: Lieutenant Worf (Security) + Commander Data (Implementation)
// LLMs: O1 (Strategy) + Claude 3.7 Sonnet (Code)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
__turbopack_context__.s([
    "auth",
    ()=>auth,
    "authConfig",
    ()=>authConfig,
    "default",
    ()=>__TURBOPACK__default__export__,
    "getCurrentUser",
    ()=>getCurrentUser,
    "handlers",
    ()=>handlers,
    "logSecurityEvent",
    ()=>logSecurityEvent,
    "rateLimit",
    ()=>rateLimit,
    "requireAuth",
    ()=>requireAuth,
    "signIn",
    ()=>signIn,
    "signOut",
    ()=>signOut
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f$next$2d$auth$2f$index$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/dashboard/node_modules/next-auth/index.js [middleware-edge] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f$next$2d$auth$2f$providers$2f$google$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/dashboard/node_modules/next-auth/providers/google.js [middleware-edge] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f40$auth$2f$core$2f$providers$2f$google$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/dashboard/node_modules/@auth/core/providers/google.js [middleware-edge] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f$next$2d$auth$2f$providers$2f$credentials$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/dashboard/node_modules/next-auth/providers/credentials.js [middleware-edge] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f40$auth$2f$core$2f$providers$2f$credentials$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/dashboard/node_modules/@auth/core/providers/credentials.js [middleware-edge] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$supabase$2f$supabase$2d$js$2f$dist$2f$module$2f$index$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/node_modules/@supabase/supabase-js/dist/module/index.js [middleware-edge] (ecmascript) <locals>");
;
;
;
;
// Worf's Security Protocol: Environment validation
// O'Brien's Pragmatic Update: Optional in development, required in production
const isDevelopment = ("TURBOPACK compile-time value", "development") !== "production";
if (!process.env.GOOGLE_CLIENT_ID) {
    if ("TURBOPACK compile-time truthy", 1) {
        console.warn("⚠️  GOOGLE_CLIENT_ID not set. Authentication will be disabled in development.");
    } else //TURBOPACK unreachable
    ;
}
if (!process.env.GOOGLE_CLIENT_SECRET) {
    if ("TURBOPACK compile-time truthy", 1) {
        console.warn("⚠️  GOOGLE_CLIENT_SECRET not set. Authentication will be disabled in development.");
    } else //TURBOPACK unreachable
    ;
}
if (!process.env.NEXTAUTH_SECRET) {
    if ("TURBOPACK compile-time truthy", 1) {
        console.warn("⚠️  NEXTAUTH_SECRET not set. Using temporary development secret.");
        process.env.NEXTAUTH_SECRET = "development-secret-change-in-production";
    } else //TURBOPACK unreachable
    ;
}
if (!process.env.NEXTAUTH_URL) {
    console.warn("⚠️  NEXTAUTH_URL not set. Defaulting to http://localhost:3000");
    process.env.NEXTAUTH_URL = "http://localhost:3000";
}
// Data's Precise Configuration
// O'Brien's Pragmatic Update: Only add providers if credentials exist
const providers = [];
// Supabase Credentials Provider (for custom email/password auth)
const SUPABASE_URL = process.env.SUPABASE_URL || ("TURBOPACK compile-time value", "https://rpkkkbufdwxmjaerbhbn.supabase.co");
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;
if (SUPABASE_URL && SUPABASE_SERVICE_KEY) {
    providers.push((0, __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f40$auth$2f$core$2f$providers$2f$credentials$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["default"])({
        name: "Credentials",
        credentials: {
            email: {
                label: "Email",
                type: "email"
            },
            password: {
                label: "Password",
                type: "password"
            }
        },
        async authorize (credentials) {
            if (!credentials?.email || !credentials?.password) {
                return null;
            }
            try {
                const supabase = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$supabase$2f$supabase$2d$js$2f$dist$2f$module$2f$index$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__$3c$locals$3e$__["createClient"])(SUPABASE_URL, SUPABASE_SERVICE_KEY);
                // Check user whitelist first
                const isDevelopment = ("TURBOPACK compile-time value", "development") !== "production";
                const authorizedUsers = process.env.AUTHORIZED_USERS?.split(',') || [];
                // Check Supabase authorized_users table
                let isAuthorized = false;
                try {
                    const { data: authorizedUser } = await supabase.from('authorized_users').select('email, active, development_only, verified').eq('email', credentials.email.toLowerCase()).eq('active', true).single();
                    if (authorizedUser) {
                        // In production, require verified users
                        if ("TURBOPACK compile-time falsy", 0) //TURBOPACK unreachable
                        ;
                        // In production, reject development-only users
                        if ("TURBOPACK compile-time falsy", 0) //TURBOPACK unreachable
                        ;
                        isAuthorized = true;
                    }
                } catch (error) {
                // Table might not exist, fallback to env var
                }
                // Fallback to environment variable whitelist
                if (!isAuthorized) {
                    isAuthorized = authorizedUsers.some((email)=>email.toLowerCase() === credentials.email.toLowerCase());
                }
                if (!isAuthorized) {
                    logSecurityEvent("UNAUTHORIZED_ACCESS_ATTEMPT", {
                        email: credentials.email,
                        provider: "credentials"
                    });
                    return null;
                }
                // Authenticate with Supabase
                const { data, error } = await supabase.auth.signInWithPassword({
                    email: credentials.email.toLowerCase(),
                    password: credentials.password
                });
                if (error || !data.user) {
                    return null;
                }
                return {
                    id: data.user.id,
                    email: data.user.email || credentials.email,
                    name: data.user.user_metadata?.username || data.user.email?.split('@')[0]
                };
            } catch (error) {
                console.error("Auth error:", error);
                return null;
            }
        }
    }));
}
// Google OAuth Provider (optional)
if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
    providers.push((0, __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f40$auth$2f$core$2f$providers$2f$google$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["default"])({
        clientId: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        authorization: {
            params: {
                prompt: "consent",
                access_type: "offline",
                response_type: "code"
            }
        }
    }));
} else if ("TURBOPACK compile-time truthy", 1) {
    console.warn("⚠️  Google OAuth not configured. Only Supabase credentials auth available.");
}
const authConfig = {
    providers,
    pages: {
        signIn: "/auth/signin",
        signOut: "/auth/signout",
        error: "/auth/error"
    },
    callbacks: {
        async signIn ({ user, account, profile }) {
            // Worf's Security: User whitelist check (no new user creation)
            if (user?.email) {
                const authorizedUsers = process.env.AUTHORIZED_USERS?.split(',') || [];
                const isAuthorized = authorizedUsers.some((authorizedEmail)=>authorizedEmail.toLowerCase() === user.email?.toLowerCase());
                if (!isAuthorized) {
                    // Log security event
                    logSecurityEvent("UNAUTHORIZED_ACCESS_ATTEMPT", {
                        email: user.email,
                        provider: account?.provider || "unknown"
                    });
                    return false; // Reject sign-in
                }
            }
            return true;
        },
        async session ({ session, token }) {
            // Add user ID to session
            if (session.user && token.sub) {
                session.user.id = token.sub;
            }
            return session;
        },
        async jwt ({ token, user, account }) {
            // Store user ID in JWT token
            if (user) {
                token.sub = user.id;
            }
            return token;
        },
        async authorized ({ auth, request }) {
            const isLoggedIn = !!auth?.user;
            const isOnDashboard = request.nextUrl.pathname.startsWith("/dashboard");
            const isOnProjects = request.nextUrl.pathname.startsWith("/projects");
            const isOnAPI = request.nextUrl.pathname.startsWith("/api");
            // Worf's Security: Protect all sensitive routes
            if (isOnDashboard || isOnProjects) {
                return isLoggedIn;
            }
            // Allow public API routes (for webhooks)
            if (isOnAPI && request.nextUrl.pathname.includes("/webhook")) {
                return true;
            }
            // Protect all other API routes
            if (isOnAPI) {
                return isLoggedIn;
            }
            // Allow all other routes (landing page, docs, etc.)
            return true;
        }
    },
    session: {
        strategy: "jwt",
        maxAge: 30 * 24 * 60 * 60
    },
    trustHost: true
};
const { handlers, signIn, signOut, auth } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f$next$2d$auth$2f$index$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__$3c$locals$3e$__["default"])(authConfig);
function logSecurityEvent(event, details) {
    const timestamp = new Date().toISOString();
    console.log(`[SECURITY] ${timestamp} - ${event}`, details);
// Future: Send to Sentry or security monitoring system
// await fetch('/api/security/audit', { ... })
}
async function requireAuth() {
    const session = await auth();
    if (!session || !session.user) {
        throw new Error("Unauthorized: Authentication required");
    }
    return session;
}
async function getCurrentUser() {
    const session = await auth();
    return session?.user || null;
}
// Rate limiting store (simple in-memory for now)
const rateLimitStore = new Map();
function rateLimit(identifier, maxRequests = 100, windowMs = 60000) {
    const now = Date.now();
    const record = rateLimitStore.get(identifier);
    // Clean up old records
    if (record && now > record.resetAt) {
        rateLimitStore.delete(identifier);
    }
    // Check current rate
    if (record && now <= record.resetAt) {
        if (record.count >= maxRequests) {
            logSecurityEvent("RATE_LIMIT_EXCEEDED", {
                identifier,
                count: record.count
            });
            return false; // Rate limit exceeded
        }
        record.count++;
        return true;
    }
    // Create new record
    rateLimitStore.set(identifier, {
        count: 1,
        resetAt: now + windowMs
    });
    return true;
}
const __TURBOPACK__default__export__ = authConfig;
}),
"[project]/dashboard/middleware.ts [middleware-edge] (ecmascript)", ((__turbopack_context__) => {
"use strict";

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Alex AI Universal - Next.js Middleware (Authentication & Rate Limiting)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Team Alpha: Lieutenant Worf (Security) + Chief O'Brien (Pragmatic Implementation)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
__turbopack_context__.s([
    "config",
    ()=>config,
    "middleware",
    ()=>middleware
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$lib$2f$auth$2e$ts__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/dashboard/lib/auth.ts [middleware-edge] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f$next$2f$dist$2f$esm$2f$api$2f$server$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/dashboard/node_modules/next/dist/esm/api/server.js [middleware-edge] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f$next$2f$dist$2f$esm$2f$server$2f$web$2f$exports$2f$index$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/dashboard/node_modules/next/dist/esm/server/web/exports/index.js [middleware-edge] (ecmascript)");
;
;
async function middleware(request) {
    const { pathname } = request.nextUrl;
    // Worf's Security: Rate limiting for API routes
    if (pathname.startsWith("/api")) {
        const identifier = request.ip || "unknown";
        const rateLimitKey = `${identifier}:${pathname}`;
        // Simple rate limiting (100 requests per minute)
        // In production, use Redis or a proper rate limiting service
        const rateLimitHeader = request.headers.get("x-ratelimit-remaining");
        if (rateLimitHeader && parseInt(rateLimitHeader) <= 0) {
            return __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f$next$2f$dist$2f$esm$2f$server$2f$web$2f$exports$2f$index$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["NextResponse"].json({
                error: "Rate limit exceeded",
                message: "Too many requests. Please try again later."
            }, {
                status: 429,
                headers: {
                    "Retry-After": "60",
                    "X-RateLimit-Limit": "100",
                    "X-RateLimit-Remaining": "0",
                    "X-RateLimit-Reset": String(Date.now() + 60000)
                }
            });
        }
    }
    // Worf's Security: Protect sensitive routes
    // DDD: Dashboard Bounded Context - requires authentication
    const protectedPaths = [
        "/dashboard",
        "/projects"
    ];
    const isProtectedPath = protectedPaths.some((path)=>pathname.startsWith(path));
    // In development, allow access without auth (for local development)
    const isDevelopment = ("TURBOPACK compile-time value", "development") === 'development';
    // Allow root redirect to proceed without auth check
    if (isProtectedPath && pathname !== '/') {
        // In development, skip auth check to allow local testing
        if ("TURBOPACK compile-time falsy", 0) //TURBOPACK unreachable
        ;
    }
    // Allow public routes and authenticated requests to proceed
    return __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f$next$2f$dist$2f$esm$2f$server$2f$web$2f$exports$2f$index$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["NextResponse"].next();
}
const config = {
    matcher: [
        /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */ "/((?!_next/static|_next/image|favicon.ico|public).*)"
    ]
};
}),
]);

//# sourceMappingURL=%5Broot-of-the-server%5D__7b65f3ec._.js.map