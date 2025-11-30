// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Alex AI Universal - Sentry Client Configuration
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Team Gamma: Dr. Beverly Crusher (Health Monitoring) + Commander Data (Implementation)
// LLMs: GPT-4o (Diagnostics) + Claude 3.7 Sonnet (Precision)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

import * as Sentry from "@sentry/nextjs";

// Dr. Crusher: "Monitor all vital signs, even in development"
const SENTRY_DSN = process.env.NEXT_PUBLIC_SENTRY_DSN;

if (SENTRY_DSN) {
  Sentry.init({
    dsn: SENTRY_DSN,

    // Performance Monitoring
    tracesSampleRate: process.env.NODE_ENV === "production" ? 0.1 : 1.0, // 10% in prod, 100% in dev

    // Session Replay (for debugging user issues)
    replaysSessionSampleRate: process.env.NODE_ENV === "production" ? 0.1 : 1.0,
    replaysOnErrorSampleRate: 1.0, // Always capture replay when error occurs

    // Environment
    environment: process.env.NODE_ENV || "development",

    // Release tracking
    release: process.env.NEXT_PUBLIC_VERCEL_GIT_COMMIT_SHA || "development",

    // Integrations
    integrations: [
      Sentry.replayIntegration({
        maskAllText: true, // Privacy: mask sensitive text
        blockAllMedia: true, // Privacy: block images/videos
      }),
    ],

    // Dr. Crusher's Diagnostic Filters: Ignore expected errors
    ignoreErrors: [
      // Browser extensions
      "top.GLOBALS",
      // Network errors (handled gracefully)
      "Network request failed",
      "Failed to fetch",
      // Hydration errors (handled by suppressHydrationWarning)
      "Hydration failed",
      "Text content does not match",
    ],

    // Data's Precise Breadcrumb Configuration
    beforeBreadcrumb(breadcrumb, hint) {
      // Filter out sensitive data from breadcrumbs
      if (breadcrumb.category === "xhr" || breadcrumb.category === "fetch") {
        // Remove sensitive headers
        if (breadcrumb.data?.request_headers) {
          delete breadcrumb.data.request_headers;
        }
      }
      return breadcrumb;
    },

    // Dr. Crusher's Patient Privacy: Scrub sensitive data before sending
    beforeSend(event, hint) {
      // Remove sensitive user data
      if (event.user) {
        delete event.user.email;
        delete event.user.ip_address;
      }

      // Remove sensitive query params
      if (event.request?.query_string) {
        const sensitiveParams = ["token", "key", "secret", "password"];
        sensitiveParams.forEach((param) => {
          event.request.query_string = event.request.query_string?.replace(
            new RegExp(`${param}=[^&]*`, "gi"),
            `${param}=[REDACTED]`
          );
        });
      }

      return event;
    },
  });

  console.log("✅ Sentry client monitoring initialized");
} else {
  console.warn(
    "⚠️  Sentry DSN not configured. Error monitoring disabled.\n" +
      "   To enable: Set NEXT_PUBLIC_SENTRY_DSN in your environment"
  );
}

