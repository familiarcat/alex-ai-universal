// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Alex AI Universal - State Manager Tests
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Team Gamma: Commander Riker (Test Strategy) + Commander Data (Implementation)
// Coverage Target: 100% of state-manager.tsx
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, renderHook, act, waitFor } from "@testing-library/react";
import { StateManagerProvider, useStateManager } from "../lib/state-manager";
import type { ReactNode } from "react";

// Test wrapper
const wrapper = ({ children }: { children: ReactNode }) => (
  <StateManagerProvider>{children}</StateManagerProvider>
);

describe("StateManager - Core Functionality", () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  describe("Initialization", () => {
    it("should initialize with default state", () => {
      const { result } = renderHook(() => useStateManager(), { wrapper });

      expect(result.current.projects).toBeDefined();
      expect(typeof result.current.projects).toBe("object");
    });

    it("should load state from localStorage if available", () => {
      // Pre-populate localStorage
      const mockState = {
        projects: {
          test_project: {
            headline: "Test Project",
            subheadline: "Test Subheadline",
            theme: "cyberpunk",
          },
        },
      };
      localStorage.setItem("alexai_dashboard_state", JSON.stringify(mockState));

      const { result } = renderHook(() => useStateManager(), { wrapper });

      expect(result.current.projects.test_project).toBeDefined();
      expect(result.current.projects.test_project.headline).toBe("Test Project");
    });

    it("should handle corrupted localStorage gracefully", () => {
      localStorage.setItem("alexai_dashboard_state", "invalid json {{{");

      const { result } = renderHook(() => useStateManager(), { wrapper });

      // Should fall back to default state
      expect(result.current.projects).toBeDefined();
    });
  });

  describe("Project Management", () => {
    it("should create a new project", () => {
      const { result } = renderHook(() => useStateManager(), { wrapper });

      act(() => {
        result.current.createProject({
          headline: "New Project",
          subheadline: "New Subheadline",
          theme: "monochromeBlue",
        });
      });

      const projectIds = Object.keys(result.current.projects);
      expect(projectIds.length).toBeGreaterThan(0);

      const newProject = result.current.projects[projectIds[0]];
      expect(newProject?.headline).toBe("New Project");
      expect(newProject?.theme).toBe("monochromeBlue");
    });

    it("should update an existing project", () => {
      const { result } = renderHook(() => useStateManager(), { wrapper });

      let projectId: string;

      act(() => {
        projectId = result.current.createProject({
          headline: "Original",
          theme: "cyberpunk",
        });
      });

      act(() => {
        result.current.updateProject(projectId!, {
          headline: "Updated",
          description: "New description",
        });
      });

      expect(result.current.projects[projectId!]?.headline).toBe("Updated");
      expect(result.current.projects[projectId!]?.description).toBe(
        "New description"
      );
      expect(result.current.projects[projectId!]?.theme).toBe("cyberpunk"); // Should preserve other fields
    });

    it("should delete a project", () => {
      const { result } = renderHook(() => useStateManager(), { wrapper });

      let projectId: string;

      act(() => {
        projectId = result.current.createProject({
          headline: "To Be Deleted",
          theme: "cyberpunk",
        });
      });

      expect(result.current.projects[projectId!]).toBeDefined();

      act(() => {
        result.current.deleteProject(projectId!);
      });

      expect(result.current.projects[projectId!]).toBeUndefined();
    });
  });

  describe("Theme Management", () => {
    it("should change theme for a project", () => {
      const { result } = renderHook(() => useStateManager(), { wrapper });

      let projectId: string;

      act(() => {
        projectId = result.current.createProject({
          headline: "Test",
          theme: "cyberpunk",
        });
      });

      act(() => {
        result.current.setTheme(projectId!, "mochaEarth");
      });

      expect(result.current.projects[projectId!]?.theme).toBe("mochaEarth");
    });
  });

  describe("Persistence", () => {
    it("should persist state to localStorage after changes", async () => {
      const { result } = renderHook(() => useStateManager(), { wrapper });

      act(() => {
        result.current.createProject({
          headline: "Persisted Project",
          theme: "cyberpunk",
        });
      });

      // Wait for debounced save
      await waitFor(
        () => {
          const savedState = localStorage.getItem("alexai_dashboard_state");
          expect(savedState).toBeTruthy();

          const parsed = JSON.parse(savedState!);
          expect(Object.keys(parsed.projects).length).toBeGreaterThan(0);
        },
        { timeout: 2000 }
      );
    });

    it("should debounce rapid changes", async () => {
      const { result } = renderHook(() => useStateManager(), { wrapper });
      const setItemSpy = vi.spyOn(Storage.prototype, "setItem");

      let projectId: string;

      act(() => {
        projectId = result.current.createProject({
          headline: "Test",
          theme: "cyberpunk",
        });
      });

      // Make rapid changes
      act(() => {
        result.current.updateProject(projectId!, { headline: "Update 1" });
        result.current.updateProject(projectId!, { headline: "Update 2" });
        result.current.updateProject(projectId!, { headline: "Update 3" });
      });

      // Should debounce and only save once (or a few times)
      await waitFor(() => {
        // Should be called, but not 3+ times
        expect(setItemSpy.mock.calls.length).toBeLessThan(5);
      });
    });
  });

  describe("Edge Cases", () => {
    it("should handle undefined project ID gracefully", () => {
      const { result } = renderHook(() => useStateManager(), { wrapper });

      expect(() => {
        act(() => {
          result.current.updateProject("nonexistent_project", {
            headline: "Test",
          });
        });
      }).not.toThrow();
    });

    it("should handle empty project data", () => {
      const { result } = renderHook(() => useStateManager(), { wrapper });

      expect(() => {
        act(() => {
          result.current.createProject({} as any);
        });
      }).not.toThrow();
    });

    it("should handle localStorage quota exceeded", () => {
      const { result } = renderHook(() => useStateManager(), { wrapper });

      // Mock localStorage to throw quota exceeded error
      vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
        throw new Error("QuotaExceededError");
      });

      expect(() => {
        act(() => {
          result.current.createProject({
            headline: "Test",
            theme: "cyberpunk",
          });
        });
      }).not.toThrow();
    });
  });
});

describe("StateManager - Data Integrity", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("should preserve data types", () => {
    const { result } = renderHook(() => useStateManager(), { wrapper });

    let projectId: string;

    act(() => {
      projectId = result.current.createProject({
        headline: "Test",
        theme: "cyberpunk",
        components: [
          { type: "hero", content: { title: "Hero" }, order: 0 },
        ],
      });
    });

    const project = result.current.projects[projectId!];
    expect(Array.isArray(project?.components)).toBe(true);
    expect(project?.components![0]?.order).toBe(0);
    expect(typeof project?.components![0]?.order).toBe("number");
  });

  it("should handle concurrent updates", () => {
    const { result } = renderHook(() => useStateManager(), { wrapper });

    let projectId: string;

    act(() => {
      projectId = result.current.createProject({
        headline: "Test",
        theme: "cyberpunk",
      });
    });

    // Simulate concurrent updates
    act(() => {
      result.current.updateProject(projectId!, { headline: "Update 1" });
      result.current.updateProject(projectId!, { description: "Update 2" });
      result.current.setTheme(projectId!, "mochaEarth");
    });

    // Final state should have all updates
    const project = result.current.projects[projectId!];
    expect(project?.headline).toBe("Update 1");
    expect(project?.description).toBe("Update 2");
    expect(project?.theme).toBe("mochaEarth");
  });
});

