// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Alex AI Universal - Test Setup
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Team Gamma: Commander Riker (Testing) + Commander Data (Implementation)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

import { expect, afterEach, vi } from "vitest";
import { cleanup } from "@testing-library/react";
import "@testing-library/jest-dom";

// Riker's Testing Discipline: Clean up after each test
afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

// Mock window.matchMedia (for theme/responsive tests)
Object.defineProperty(window, "matchMedia", {
  writable: true,
  value: vi.fn().mockImplementation((query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};

  return {
    getItem: vi.fn((key: string) => store[key] || null),
    setItem: vi.fn((key: string, value: string) => {
      store[key] = value.toString();
    }),
    removeItem: vi.fn((key: string) => {
      delete store[key];
    }),
    clear: vi.fn(() => {
      store = {};
    }),
  };
})();

Object.defineProperty(window, "localStorage", {
  value: localStorageMock,
});

// Mock fetch for API tests
global.fetch = vi.fn();

// Mock console methods to reduce noise in tests (but still log errors)
const originalError = console.error;
const originalWarn = console.warn;

console.error = (...args: any[]) => {
  // Still show actual errors
  if (
    typeof args[0] === "string" &&
    (args[0].includes("act(...)") || args[0].includes("Warning:"))
  ) {
    return;
  }
  originalError.apply(console, args);
};

console.warn = (...args: any[]) => {
  // Suppress common React warnings in tests
  if (
    typeof args[0] === "string" &&
    args[0].includes("componentWillReceiveProps")
  ) {
    return;
  }
  originalWarn.apply(console, args);
};

// Export test utilities
export { expect };

