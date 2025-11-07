// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Alex AI Universal - Vitest Configuration
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Team Gamma: Commander Riker (Testing Strategy) + Commander Data (Implementation)
// LLMs: Claude 3.7 Sonnet (Strategy + Precision)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react()],
  test: {
    // Environment
    environment: "happy-dom",

    // Global setup
    globals: true,
    setupFiles: ["./test/setup.ts"],

    // Coverage
    coverage: {
      provider: "v8",
      reporter: ["text", "json", "html", "lcov"],
      exclude: [
        "node_modules/",
        "test/",
        "*.config.{js,ts}",
        "**/*.d.ts",
        "**/*.test.{ts,tsx}",
        "**/*.spec.{ts,tsx}",
        "**/types.ts",
        "sentry.*.config.ts",
      ],
      statements: 60,
      branches: 60,
      functions: 60,
      lines: 60,
    },

    // Riker's Testing Strategy: Run tests in parallel for speed
    threads: true,
    isolate: true,

    // Timeout
    testTimeout: 10000,

    // Include/Exclude patterns
    include: ["**/*.{test,spec}.{ts,tsx}"],
    exclude: ["node_modules", ".next", "out"],

    // Reporter
    reporters: ["verbose"],

    // Mock configuration
    mockReset: true,
    restoreMocks: true,
    clearMocks: true,

    // Data's Precise Watch Mode Configuration
    watch: false,
    watchExclude: ["**/node_modules/**", "**/.next/**"],
  },

  // Resolve aliases (match Next.js)
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "."),
      "@/components": path.resolve(__dirname, "./components"),
      "@/lib": path.resolve(__dirname, "./lib"),
      "@/app": path.resolve(__dirname, "./app"),
    },
  },
});

