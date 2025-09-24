import React, { useState, useEffect } from 'react';
import axios from 'axios';

const AgentMemoryDisplay = ({ agentName, limit = 10, showStats = true }) => {
  const [memories, setMemories] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchMemories();
    if (showStats) {
      fetchStats();
    }
  }, [agentName, limit]);

  const fetchMemories = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/memories/retrieve', {
        params: {
          agent_name: agentName,
          limit: limit
        }
      });
      setMemories(response.data.memories || []);
      setError(null);
    } catch (err) {
      console.error('Error fetching memories:', err);
      setError('Failed to load memories');
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await axios.get('/api/memories/stats');
      setStats(response.data);
    } catch (err) {
      console.error('Error fetching stats:', err);
    }
  };

  const getMemoryTypeColor = (type) => {
    const colors = {
      conversation: 'bg-blue-500',
      learning: 'bg-green-500',
      experience: 'bg-yellow-500',
      insight: 'bg-purple-500'
    };
    return colors[type] || 'bg-gray-500';
  };

  const getImportanceColor = (score) => {
    if (score >= 0.8) return 'text-red-400';
    if (score >= 0.6) return 'text-yellow-400';
    return 'text-green-400';
  };

  if (loading) {
    return (
      <div className="card p-4 bg-gray-800 rounded-lg shadow-lg border border-gray-700">
        <div className="flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-alex-blue"></div>
          <span className="ml-2 text-gray-300">Loading memories...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="card p-4 bg-gray-800 rounded-lg shadow-lg border border-gray-700">
        <div className="text-red-400 text-center">
          <svg className="w-6 h-6 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
          </svg>
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="card p-4 bg-gray-800 rounded-lg shadow-lg border border-gray-700">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold text-alex-gold flex items-center">
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"></path>
          </svg>
          {agentName} Memories
        </h3>
        <span className="text-sm text-gray-400">{memories.length} memories</span>
      </div>

      {showStats && stats && (
        <div className="mb-4 p-3 bg-gray-700 rounded-lg">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-400">Total Memories:</span>
              <span className="ml-2 text-alex-green font-semibold">
                {stats.overall_stats?.total_memories || 0}
              </span>
            </div>
            <div>
              <span className="text-gray-400">Recent (24h):</span>
              <span className="ml-2 text-alex-blue font-semibold">
                {stats.overall_stats?.total_recent_memories || 0}
              </span>
            </div>
            <div>
              <span className="text-gray-400">Avg Importance:</span>
              <span className="ml-2 text-alex-gold font-semibold">
                {(stats.overall_stats?.avg_importance || 0).toFixed(2)}
              </span>
            </div>
            <div>
              <span className="text-gray-400">Active Agents:</span>
              <span className="ml-2 text-alex-purple font-semibold">
                {stats.overall_stats?.active_agents || 0}
              </span>
            </div>
          </div>
        </div>
      )}

      <div className="space-y-3 max-h-96 overflow-y-auto custom-scrollbar">
        {memories.length === 0 ? (
          <div className="text-center text-gray-400 py-8">
            <svg className="w-12 h-12 mx-auto mb-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"></path>
            </svg>
            <p>No memories found for {agentName}</p>
            <p className="text-sm mt-1">Memories will appear here as the agent learns and experiences new things.</p>
          </div>
        ) : (
          memories.map((memory, index) => (
            <div key={memory.id || index} className="p-3 bg-gray-700 rounded-lg border border-gray-600">
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center space-x-2">
                  <span className={`px-2 py-1 rounded-full text-xs font-semibold text-white ${getMemoryTypeColor(memory.memory_type)}`}>
                    {memory.memory_type}
                  </span>
                  <span className={`text-xs font-semibold ${getImportanceColor(memory.importance_score)}`}>
                    {Math.round(memory.importance_score * 100)}%
                  </span>
                </div>
                <span className="text-xs text-gray-400">
                  {new Date(memory.created_at).toLocaleDateString()}
                </span>
              </div>
              
              <p className="text-gray-200 text-sm mb-2 line-clamp-3">
                {memory.content}
              </p>
              
              {memory.metadata && Object.keys(memory.metadata).length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {Object.entries(memory.metadata).map(([key, value]) => (
                    <span key={key} className="px-2 py-1 bg-gray-600 rounded text-xs text-gray-300">
                      {key}: {typeof value === 'object' ? JSON.stringify(value) : value}
                    </span>
                  ))}
                </div>
              )}
              
              {memory.similarity_score && (
                <div className="mt-2 text-xs text-gray-400">
                  Similarity: {(memory.similarity_score * 100).toFixed(1)}%
                </div>
              )}
            </div>
          ))
        )}
      </div>

      <div className="mt-4 pt-3 border-t border-gray-600">
        <button
          onClick={fetchMemories}
          className="w-full px-4 py-2 bg-alex-blue text-white rounded-lg hover:bg-blue-600 transition-colors text-sm font-semibold"
        >
          <svg className="w-4 h-4 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
          </svg>
          Refresh Memories
        </button>
      </div>
    </div>
  );
};

export default AgentMemoryDisplay;
