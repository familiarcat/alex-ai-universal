// API endpoint for getting memory statistics
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    // Get memory statistics using the database function
    const { data, error } = await supabase.rpc('get_memory_stats');

    if (error) {
      console.error('Error getting memory stats:', error);
      return res.status(500).json({ 
        message: 'Failed to get memory statistics',
        error: error.message 
      });
    }

    // Calculate overall statistics
    const totalMemories = data.reduce((sum, agent) => sum + parseInt(agent.total_memories), 0);
    const totalRecentMemories = data.reduce((sum, agent) => sum + parseInt(agent.recent_memories), 0);
    const avgImportance = data.length > 0 ? 
      data.reduce((sum, agent) => sum + parseFloat(agent.avg_importance), 0) / data.length : 0;

    // Get memory type distribution
    const memoryTypeStats = {};
    data.forEach(agent => {
      if (agent.memory_types) {
        Object.entries(agent.memory_types).forEach(([type, count]) => {
          if (!memoryTypeStats[type]) {
            memoryTypeStats[type] = 0;
          }
          memoryTypeStats[type] += parseInt(count);
        });
      }
    });

    // Get agent activity levels
    const agentActivity = data.map(agent => ({
      agent_name: agent.agent_name,
      total_memories: parseInt(agent.total_memories),
      recent_memories: parseInt(agent.recent_memories),
      avg_importance: parseFloat(agent.avg_importance),
      activity_level: parseInt(agent.recent_memories) > 5 ? 'high' : 
                     parseInt(agent.recent_memories) > 2 ? 'medium' : 'low'
    }));

    // Sort agents by activity
    agentActivity.sort((a, b) => b.recent_memories - a.recent_memories);

    // Return comprehensive statistics
    res.status(200).json({
      message: 'Memory statistics retrieved successfully',
      overall_stats: {
        total_memories: totalMemories,
        total_recent_memories: totalRecentMemories,
        avg_importance: parseFloat(avgImportance.toFixed(3)),
        active_agents: data.length,
        memory_types: Object.keys(memoryTypeStats).length
      },
      memory_type_distribution: memoryTypeStats,
      agent_activity: agentActivity,
      detailed_stats: data.map(agent => ({
        agent_name: agent.agent_name,
        total_memories: parseInt(agent.total_memories),
        recent_memories: parseInt(agent.recent_memories),
        avg_importance: parseFloat(agent.avg_importance),
        memory_types: agent.memory_types
      })),
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error in memory stats API:', error);
    res.status(500).json({ 
      message: 'Internal server error',
      error: error.message 
    });
  }
}
