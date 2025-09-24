/**
 * Agent Memory Client
 * Provides easy integration for N8N agents to save and retrieve memories
 */

class AgentMemoryClient {
  constructor(baseUrl = 'https://n8n.pbradygeorgen.com/dashboard/api') {
    this.baseUrl = baseUrl;
  }

  /**
   * Save a memory for an agent
   * @param {Object} memoryData - Memory data object
   * @param {string} memoryData.agent_name - Name of the agent
   * @param {string} memoryData.agent_id - Unique ID of the agent
   * @param {string} memoryData.memory_type - Type of memory (conversation, learning, experience, insight)
   * @param {string} memoryData.content - Content of the memory
   * @param {Array} memoryData.embedding - Optional vector embedding (1536 dimensions)
   * @param {Object} memoryData.metadata - Optional metadata object
   * @param {number} memoryData.importance_score - Importance score (0-1, default 0.5)
   * @param {string} memoryData.expires_at - Optional expiration date (ISO string)
   * @returns {Promise<Object>} Response object with memory_id and status
   */
  async saveMemory(memoryData) {
    try {
      const response = await fetch(`${this.baseUrl}/memories/save`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(memoryData)
      });

      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.message || 'Failed to save memory');
      }

      return result;
    } catch (error) {
      console.error('Error saving memory:', error);
      throw error;
    }
  }

  /**
   * Retrieve memories for an agent
   * @param {Object} queryParams - Query parameters
   * @param {string} queryParams.agent_name - Name of the agent
   * @param {Array} queryParams.query_embedding - Optional vector embedding for similarity search
   * @param {number} queryParams.limit - Maximum number of memories to retrieve (default 10)
   * @param {number} queryParams.similarity_threshold - Similarity threshold for vector search (default 0.7)
   * @param {string} queryParams.memory_type - Optional memory type filter
   * @param {boolean} queryParams.include_inactive - Include inactive memories (default false)
   * @returns {Promise<Object>} Response object with memories array
   */
  async retrieveMemories(queryParams) {
    try {
      const url = new URL(`${this.baseUrl}/memories/retrieve`);
      
      // Add query parameters
      Object.entries(queryParams).forEach(([key, value]) => {
        if (value !== null && value !== undefined) {
          if (Array.isArray(value)) {
            url.searchParams.set(key, JSON.stringify(value));
          } else {
            url.searchParams.set(key, value.toString());
          }
        }
      });

      const response = await fetch(url.toString());
      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.message || 'Failed to retrieve memories');
      }

      return result;
    } catch (error) {
      console.error('Error retrieving memories:', error);
      throw error;
    }
  }

  /**
   * Search memories across all agents using vector similarity
   * @param {Object} searchParams - Search parameters
   * @param {Array} searchParams.query_embedding - Vector embedding for similarity search
   * @param {number} searchParams.limit - Maximum number of results (default 20)
   * @param {number} searchParams.similarity_threshold - Similarity threshold (default 0.7)
   * @param {string|Array} searchParams.agent_filter - Optional agent filter
   * @param {string|Array} searchParams.memory_type_filter - Optional memory type filter
   * @returns {Promise<Object>} Response object with search results
   */
  async searchMemories(searchParams) {
    try {
      const response = await fetch(`${this.baseUrl}/memories/search`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(searchParams)
      });

      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.message || 'Failed to search memories');
      }

      return result;
    } catch (error) {
      console.error('Error searching memories:', error);
      throw error;
    }
  }

  /**
   * Get memory statistics
   * @returns {Promise<Object>} Response object with memory statistics
   */
  async getMemoryStats() {
    try {
      const response = await fetch(`${this.baseUrl}/memories/stats`);
      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.message || 'Failed to get memory statistics');
      }

      return result;
    } catch (error) {
      console.error('Error getting memory statistics:', error);
      throw error;
    }
  }

  /**
   * Save a conversation memory
   * @param {string} agentName - Name of the agent
   * @param {string} agentId - ID of the agent
   * @param {string} content - Conversation content
   * @param {Object} metadata - Optional metadata
   * @param {number} importanceScore - Importance score (0-1)
   * @returns {Promise<Object>} Response object
   */
  async saveConversationMemory(agentName, agentId, content, metadata = {}, importanceScore = 0.5) {
    return this.saveMemory({
      agent_name: agentName,
      agent_id: agentId,
      memory_type: 'conversation',
      content,
      metadata,
      importance_score: importanceScore
    });
  }

  /**
   * Save a learning memory
   * @param {string} agentName - Name of the agent
   * @param {string} agentId - ID of the agent
   * @param {string} content - Learning content
   * @param {Object} metadata - Optional metadata
   * @param {number} importanceScore - Importance score (0-1)
   * @returns {Promise<Object>} Response object
   */
  async saveLearningMemory(agentName, agentId, content, metadata = {}, importanceScore = 0.7) {
    return this.saveMemory({
      agent_name: agentName,
      agent_id: agentId,
      memory_type: 'learning',
      content,
      metadata,
      importance_score: importanceScore
    });
  }

  /**
   * Save an experience memory
   * @param {string} agentName - Name of the agent
   * @param {string} agentId - ID of the agent
   * @param {string} content - Experience content
   * @param {Object} metadata - Optional metadata
   * @param {number} importanceScore - Importance score (0-1)
   * @returns {Promise<Object>} Response object
   */
  async saveExperienceMemory(agentName, agentId, content, metadata = {}, importanceScore = 0.6) {
    return this.saveMemory({
      agent_name: agentName,
      agent_id: agentId,
      memory_type: 'experience',
      content,
      metadata,
      importance_score: importanceScore
    });
  }

  /**
   * Save an insight memory
   * @param {string} agentName - Name of the agent
   * @param {string} agentId - ID of the agent
   * @param {string} content - Insight content
   * @param {Object} metadata - Optional metadata
   * @param {number} importanceScore - Importance score (0-1)
   * @returns {Promise<Object>} Response object
   */
  async saveInsightMemory(agentName, agentId, content, metadata = {}, importanceScore = 0.8) {
    return this.saveMemory({
      agent_name: agentName,
      agent_id: agentId,
      memory_type: 'insight',
      content,
      metadata,
      importance_score: importanceScore
    });
  }

  /**
   * Get recent memories for an agent
   * @param {string} agentName - Name of the agent
   * @param {number} limit - Number of memories to retrieve
   * @returns {Promise<Object>} Response object with memories
   */
  async getRecentMemories(agentName, limit = 10) {
    return this.retrieveMemories({
      agent_name: agentName,
      limit
    });
  }

  /**
   * Get memories by type for an agent
   * @param {string} agentName - Name of the agent
   * @param {string} memoryType - Type of memory to retrieve
   * @param {number} limit - Number of memories to retrieve
   * @returns {Promise<Object>} Response object with memories
   */
  async getMemoriesByType(agentName, memoryType, limit = 10) {
    return this.retrieveMemories({
      agent_name: agentName,
      memory_type: memoryType,
      limit
    });
  }
}

// Export for use in Node.js environments
if (typeof module !== 'undefined' && module.exports) {
  module.exports = AgentMemoryClient;
}

// Export for use in browser environments
if (typeof window !== 'undefined') {
  window.AgentMemoryClient = AgentMemoryClient;
}
