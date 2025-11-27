
/**
 * Supabase Client Wrapper - DDD-Compliant
 * 
 * ⚠️  DEPRECATED: This file should not be used in client-side code
 * 
 * All Supabase operations must go through Next.js API routes:
 * - /api/data/learning-metrics
 * - /api/data/crew-contributions
 * - /api/data/recent-memories
 * - /api/data/learning-categories
 * - /api/data/vectors
 * - /api/data/progress/[taskId]
 * 
 * Client → Next.js API (Controller) → MCP → n8n → Supabase
 * 
 * Crew: Data (Architecture) + La Forge (Implementation)
 * Updated: 2025-11-27 - Removed direct Supabase access, use API routes instead
 */

/**
 * @deprecated Use /api/data/learning-metrics instead
 */
export const getLearningMetrics = async () => {
  try {
    const response = await fetch('/api/data/learning-metrics');
    const result = await response.json();
    return result.success ? result.data : null;
  } catch (error) {
    console.error('Error fetching learning metrics:', error);
    return null;
  }
};

/**
 * @deprecated Use /api/data/crew-contributions instead
 */
export const getCrewContributions = async () => {
  try {
    const response = await fetch('/api/data/crew-contributions');
    const result = await response.json();
    return result.success ? result.data : {};
  } catch (error) {
    console.error('Error fetching crew contributions:', error);
    return {};
  }
};

/**
 * @deprecated Use /api/data/recent-memories instead
 */
export const getRecentMemories = async (limit = 10) => {
  try {
    const response = await fetch(`/api/data/recent-memories?limit=${limit}`);
    const result = await response.json();
    return result.success ? result.data : [];
  } catch (error) {
    console.error('Error fetching recent memories:', error);
    return [];
  }
};

/**
 * @deprecated Use /api/data/learning-categories instead
 */
export const getLearningCategories = async () => {
  try {
    const response = await fetch('/api/data/learning-categories');
    const result = await response.json();
    return result.success ? result.data : {};
  } catch (error) {
    console.error('Error fetching learning categories:', error);
    return {};
  }
};







