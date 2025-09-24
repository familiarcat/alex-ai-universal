// API endpoint for retrieving agent memories from Supabase
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const {
      agent_name,
      query_embedding,
      limit = 10,
      similarity_threshold = 0.7,
      memory_type,
      include_inactive = false
    } = req.query;

    // Validate required fields
    if (!agent_name) {
      return res.status(400).json({ 
        message: 'Missing required field: agent_name' 
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

    // Parse query_embedding if provided
    let parsedEmbedding = null;
    if (query_embedding) {
      try {
        parsedEmbedding = JSON.parse(query_embedding);
        if (!Array.isArray(parsedEmbedding) || parsedEmbedding.length !== 1536) {
          return res.status(400).json({ 
            message: 'query_embedding must be an array of 1536 numbers' 
          });
        }
      } catch (error) {
        return res.status(400).json({ 
          message: 'Invalid query_embedding format' 
        });
      }
    }

    // Retrieve memories using the database function
    const { data, error } = await supabase.rpc('get_agent_memories', {
      p_agent_name: agent_name,
      p_query_embedding: parsedEmbedding,
      p_limit: limitInt,
      p_similarity_threshold: similarityThresholdFloat
    });

    if (error) {
      console.error('Error retrieving memories:', error);
      return res.status(500).json({ 
        message: 'Failed to retrieve memories',
        error: error.message 
      });
    }

    // Filter by memory_type if specified
    let filteredData = data;
    if (memory_type) {
      filteredData = data.filter(memory => memory.memory_type === memory_type);
    }

    // Filter out inactive memories if not requested
    if (!include_inactive) {
      filteredData = filteredData.filter(memory => memory.is_active !== false);
    }

    // Return memories with metadata
    res.status(200).json({
      message: 'Memories retrieved successfully',
      agent_name,
      total_memories: filteredData.length,
      memories: filteredData,
      query_params: {
        limit: limitInt,
        similarity_threshold: similarityThresholdFloat,
        memory_type: memory_type || 'all',
        include_inactive: include_inactive === 'true'
      }
    });

  } catch (error) {
    console.error('Error in retrieve memories API:', error);
    res.status(500).json({ 
      message: 'Internal server error',
      error: error.message 
    });
  }
}
