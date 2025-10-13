// API endpoint for searching memories across all agents
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const {
      query_embedding,
      limit = 20,
      similarity_threshold = 0.7,
      agent_filter = null,
      memory_type_filter = null
    } = req.body;

    // Validate required fields
    if (!query_embedding) {
      return res.status(400).json({ 
        message: 'Missing required field: query_embedding' 
      });
    }

    // Validate query_embedding
    if (!Array.isArray(query_embedding) || query_embedding.length !== 1536) {
      return res.status(400).json({ 
        message: 'query_embedding must be an array of 1536 numbers' 
      });
    }

    // Parse limit and similarity_threshold
    const limitInt = parseInt(limit);
    const similarityThresholdFloat = parseFloat(similarity_threshold);

    if (isNaN(limitInt) || limitInt < 1 || limitInt > 100) {
      return res.status(400).json({ 
        message: 'limit must be a number between 1 and 100' 
      });
    }

    if (isNaN(similarityThresholdFloat) || similarityThresholdFloat < 0 || similarityThresholdFloat > 1) {
      return res.status(400).json({ 
        message: 'similarity_threshold must be a number between 0 and 1' 
      });
    }

    // Search memories using the database function
    const { data, error } = await supabase.rpc('search_all_memories', {
      p_query_embedding: query_embedding,
      p_limit: limitInt,
      p_similarity_threshold: similarityThresholdFloat
    });

    if (error) {
      console.error('Error searching memories:', error);
      return res.status(500).json({ 
        message: 'Failed to search memories',
        error: error.message 
      });
    }

    // Apply additional filters
    let filteredData = data;

    // Filter by agent if specified
    if (agent_filter) {
      if (Array.isArray(agent_filter)) {
        filteredData = filteredData.filter(memory => agent_filter.includes(memory.agent_name));
      } else {
        filteredData = filteredData.filter(memory => memory.agent_name === agent_filter);
      }
    }

    // Filter by memory type if specified
    if (memory_type_filter) {
      if (Array.isArray(memory_type_filter)) {
        filteredData = filteredData.filter(memory => memory_type_filter.includes(memory.memory_type));
      } else {
        filteredData = filteredData.filter(memory => memory.memory_type === memory_type_filter);
      }
    }

    // Group results by agent for better organization
    const groupedResults = filteredData.reduce((acc, memory) => {
      if (!acc[memory.agent_name]) {
        acc[memory.agent_name] = [];
      }
      acc[memory.agent_name].push(memory);
      return acc;
    }, {});

    // Calculate search statistics
    const searchStats = {
      total_results: filteredData.length,
      agents_found: Object.keys(groupedResults).length,
      avg_similarity: filteredData.length > 0 ? 
        filteredData.reduce((sum, mem) => sum + mem.similarity_score, 0) / filteredData.length : 0,
      similarity_range: filteredData.length > 0 ? {
        min: Math.min(...filteredData.map(mem => mem.similarity_score)),
        max: Math.max(...filteredData.map(mem => mem.similarity_score))
      } : { min: 0, max: 0 }
    };

    // Return search results
    res.status(200).json({
      message: 'Memory search completed successfully',
      search_stats: searchStats,
      results: {
        grouped_by_agent: groupedResults,
        flat_results: filteredData
      },
      query_params: {
        limit: limitInt,
        similarity_threshold: similarityThresholdFloat,
        agent_filter,
        memory_type_filter
      }
    });

  } catch (error) {
    console.error('Error in search memories API:', error);
    res.status(500).json({ 
      message: 'Internal server error',
      error: error.message 
    });
  }
}
