// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Alex AI Universal - Sentry Server Configuration
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Team Gamma: Dr. Beverly Crusher (Health Monitoring) + Commander Data (Implementation)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

import * as Sentry from "@sentry/nextjs";

const SENTRY_DSN = process.env.SENTRY_DSN;

if (SENTRY_DSN) {
  Sentry.init({
    dsn: SENTRY_DSN,

    // Performance Monitoring
    tracesSampleRate: process.env.NODE_ENV === "production" ? 0.1 : 1.0,

    // Environment
    environment: process.env.NODE_ENV || "development",

    // Release tracking
    release: process.env.VERCEL_GIT_COMMIT_SHA || "development",

    // Dr. Crusher's Server-Side Diagnostic Filters
    ignoreErrors: [
      // Expected database errors
      "SequelizeConnectionError",
      "SequelizeConnectionRefusedError",
      // Expected network timeouts
      "ETIMEDOUT",
      "ECONNREFUSED",
      // n8n webhook registration (handled separately)
      "Webhook not registered",
    ],

    // Enhanced server context
    beforeSend(event, hint) {
      // Add server diagnostics
      if (event.request) {
        event.request.headers = {
          ...event.request.headers,
          "x-server-timestamp": new Date().toISOString(),
          "x-node-version": process.version,
        };
      }

      // Remove all sensitive environment variables
      if (event.contexts?.runtime?.name === "node") {
        delete event.extra?.env;
      }

      return event;
    },
  });

  console.log("✅ Sentry server monitoring initialized");
} else {
  console.warn(
    "⚠️  Sentry DSN not configured for server. Error monitoring disabled."
  );
}

