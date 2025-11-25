// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Alex AI Universal - Authentication Configuration
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Team Alpha: Lieutenant Worf (Security) + Commander Data (Implementation)
// LLMs: O1 (Strategy) + Claude 3.7 Sonnet (Code)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

import NextAuth, { type DefaultSession } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import type { NextAuthConfig } from "next-auth";
import { createClient } from "@supabase/supabase-js";

// Extend session type to include user ID
declare module "next-auth" {
  interface Session {
    user: {
      id: string;
    } & DefaultSession["user"];
  }
}

// Worf's Security Protocol: Environment validation
// O'Brien's Pragmatic Update: Optional in development, required in production
const isDevelopment = process.env.NODE_ENV !== "production";

if (!process.env.GOOGLE_CLIENT_ID) {
  if (isDevelopment) {
    console.warn(
      "⚠️  GOOGLE_CLIENT_ID not set. Authentication will be disabled in development."
    );
  } else {
    throw new Error(
      "GOOGLE_CLIENT_ID is required. Add it to your environment variables."
    );
  }
}

if (!process.env.GOOGLE_CLIENT_SECRET) {
  if (isDevelopment) {
    console.warn(
      "⚠️  GOOGLE_CLIENT_SECRET not set. Authentication will be disabled in development."
    );
  } else {
    throw new Error(
      "GOOGLE_CLIENT_SECRET is required. Add it to your environment variables."
    );
  }
}

if (!process.env.NEXTAUTH_SECRET) {
  if (isDevelopment) {
    console.warn(
      "⚠️  NEXTAUTH_SECRET not set. Using temporary development secret."
    );
    process.env.NEXTAUTH_SECRET = "development-secret-change-in-production";
  } else {
    throw new Error(
      "NEXTAUTH_SECRET is required. Generate one with: openssl rand -base64 32"
    );
  }
}

if (!process.env.NEXTAUTH_URL) {
  console.warn(
    "⚠️  NEXTAUTH_URL not set. Defaulting to http://localhost:3000"
  );
  process.env.NEXTAUTH_URL = "http://localhost:3000";
}

// Data's Precise Configuration
// O'Brien's Pragmatic Update: Only add providers if credentials exist
const providers = [];

// Supabase Credentials Provider (for custom email/password auth)
const SUPABASE_URL = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;

if (SUPABASE_URL && SUPABASE_SERVICE_KEY) {
  providers.push(
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        try {
          const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);
          
          // Check user whitelist first
          const isDevelopment = process.env.NODE_ENV !== "production";
          const authorizedUsers = process.env.AUTHORIZED_USERS?.split(',') || [];
          
          // Check Supabase authorized_users table
          let isAuthorized = false;
          try {
            const { data: authorizedUser } = await supabase
              .from('authorized_users')
              .select('email, active, development_only, verified')
              .eq('email', credentials.email.toLowerCase())
              .eq('active', true)
              .single();
            
            if (authorizedUser) {
              // In production, require verified users
              if (!isDevelopment && !authorizedUser.verified) {
                logSecurityEvent("UNVERIFIED_ACCESS_ATTEMPT", {
                  email: credentials.email,
                });
                return null;
              }
              
              // In production, reject development-only users
              if (!isDevelopment && authorizedUser.development_only) {
                logSecurityEvent("DEV_USER_IN_PRODUCTION", {
                  email: credentials.email,
                });
                return null;
              }
              
              isAuthorized = true;
            }
          } catch (error) {
            // Table might not exist, fallback to env var
          }
          
          // Fallback to environment variable whitelist
          if (!isAuthorized) {
            isAuthorized = authorizedUsers.some(
              (email) => email.toLowerCase() === credentials.email.toLowerCase()
            );
          }
          
          if (!isAuthorized) {
            logSecurityEvent("UNAUTHORIZED_ACCESS_ATTEMPT", {
              email: credentials.email,
              provider: "credentials",
            });
            return null;
          }
          
          // Authenticate with Supabase
          const { data, error } = await supabase.auth.signInWithPassword({
            email: credentials.email.toLowerCase(),
            password: credentials.password,
          });
          
          if (error || !data.user) {
            return null;
          }
          
          return {
            id: data.user.id,
            email: data.user.email || credentials.email,
            name: data.user.user_metadata?.username || data.user.email?.split('@')[0],
          };
        } catch (error) {
          console.error("Auth error:", error);
          return null;
        }
      },
    })
  );
}

// Google OAuth Provider (optional)
if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
  providers.push(
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      authorization: {
        params: {
          prompt: "consent",
          access_type: "offline",
          response_type: "code",
        },
      },
    })
  );
} else if (process.env.NODE_ENV !== "production") {
  console.warn(
    "⚠️  Google OAuth not configured. Only Supabase credentials auth available."
  );
}

export const authConfig: NextAuthConfig = {
  providers,
  pages: {
    signIn: "/auth/signin",
    signOut: "/auth/signout",
    error: "/auth/error",
  },
  callbacks: {
    async signIn({ user, account, profile }) {
      // Worf's Security: User whitelist check (no new user creation)
      if (user?.email) {
        const authorizedUsers = process.env.AUTHORIZED_USERS?.split(',') || [];
        const isAuthorized = authorizedUsers.some(
          (authorizedEmail) => authorizedEmail.toLowerCase() === user.email?.toLowerCase()
        );

        if (!isAuthorized) {
          // Log security event
          logSecurityEvent("UNAUTHORIZED_ACCESS_ATTEMPT", {
            email: user.email,
            provider: account?.provider || "unknown",
          });
          return false; // Reject sign-in
        }
      }
      return true;
    },
    async session({ session, token }) {
      // Add user ID to session
      if (session.user && token.sub) {
        session.user.id = token.sub;
      }
      return session;
    },
    async jwt({ token, user, account }) {
      // Store user ID in JWT token
      if (user) {
        token.sub = user.id;
      }
      return token;
    },
    async authorized({ auth, request }) {
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
    },
  },
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  trustHost: true,
};

export const { handlers, signIn, signOut, auth } = NextAuth(authConfig);

// Worf's Security Audit Log
export function logSecurityEvent(event: string, details: any) {
  const timestamp = new Date().toISOString();
  console.log(`[SECURITY] ${timestamp} - ${event}`, details);

  // Future: Send to Sentry or security monitoring system
  // await fetch('/api/security/audit', { ... })
}

// Helper function to check if user is authenticated (for use in Server Components)
export async function requireAuth() {
  const session = await auth();

  if (!session || !session.user) {
    throw new Error("Unauthorized: Authentication required");
  }

  return session;
}

// Helper function to get current user (returns null if not authenticated)
export async function getCurrentUser() {
  const session = await auth();
  return session?.user || null;
}

// Rate limiting store (simple in-memory for now)
const rateLimitStore = new Map<string, { count: number; resetAt: number }>();

// O'Brien's Pragmatic Rate Limiter
export function rateLimit(
  identifier: string,
  maxRequests: number = 100,
  windowMs: number = 60000
): boolean {
  const now = Date.now();
  const record = rateLimitStore.get(identifier);

  // Clean up old records
  if (record && now > record.resetAt) {
    rateLimitStore.delete(identifier);
  }

  // Check current rate
  if (record && now <= record.resetAt) {
    if (record.count >= maxRequests) {
      logSecurityEvent("RATE_LIMIT_EXCEEDED", { identifier, count: record.count });
      return false; // Rate limit exceeded
    }
    record.count++;
    return true;
  }

  // Create new record
  rateLimitStore.set(identifier, {
    count: 1,
    resetAt: now + windowMs,
  });

  return true;
}

export default authConfig;

