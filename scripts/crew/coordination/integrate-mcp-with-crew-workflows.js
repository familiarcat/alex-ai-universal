#!/usr/bin/env node

/**
 * 🖖 MCP Integration with Crew Workflows
 * 
 * Integrates MCP context layer with crew coordination workflows
 * to enable context sharing across crew members.
 */

const { getMCPCache } = require('./utils/mcp-context-cache');

/**
 * Share context with crew members
 */
function shareContextWithCrew(contextId, crewMembers) {
  const mcpCache = getMCPCache();
  return mcpCache.shareContextWithCrew(contextId, crewMembers);
}

/**
 * Get context for crew member
 */
function getContextForCrewMember(crewMember, sessionId) {
  const mcpCache = getMCPCache();
  const stats = mcpCache.getStats();
  
  // Find contexts relevant to this crew member
  // In a full implementation, this would query by crew member
  // For now, return cache stats
  return {
    crewMember,
    sessionId,
    cacheStats: stats,
    message: 'MCP context available for crew coordination'
  };
}

/**
 * Store crew analysis in MCP cache
 */
function storeCrewAnalysis(crewMember, analysis, sessionId) {
  const mcpCache = getMCPCache();
  
  const context = mcpCache.storeContext(
    JSON.stringify(analysis),
    null, // Embeddings generated separately
    {
      sessionId,
      crewMembers: [crewMember],
      tags: ['crew-analysis', crewMember, 'coordination']
    }
  );
  
  return context;
}

/**
 * Get MCP cache statistics
 */
function getMCPStats() {
  const mcpCache = getMCPCache();
  return mcpCache.getStats();
}

module.exports = {
  shareContextWithCrew,
  getContextForCrewMember,
  storeCrewAnalysis,
  getMCPStats
};

