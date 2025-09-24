// API endpoint for saving agent memories to Supabase
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
      agent_name,
      agent_id,
      memory_type,
      content,
      embedding,
      metadata = {},
      importance_score = 0.5,
      expires_at = null
    } = req.body;

    // Validate required fields
    if (!agent_name || !agent_id || !memory_type || !content) {
      return res.status(400).json({ 
        message: 'Missing required fields: agent_name, agent_id, memory_type, content' 
      });
    }

    // Validate memory_type
    const validMemoryTypes = ['conversation', 'learning', 'experience', 'insight'];
    if (!validMemoryTypes.includes(memory_type)) {
      return res.status(400).json({ 
        message: `Invalid memory_type. Must be one of: ${validMemoryTypes.join(', ')}` 
      });
    }

    // Validate importance_score
    if (importance_score < 0 || importance_score > 1) {
      return res.status(400).json({ 
        message: 'importance_score must be between 0 and 1' 
      });
    }

    // Save memory using the database function
    const { data, error } = await supabase.rpc('save_agent_memory', {
      p_agent_name: agent_name,
      p_agent_id: agent_id,
      p_memory_type: memory_type,
      p_content: content,
      p_embedding: embedding,
      p_metadata: metadata,
      p_importance_score: importance_score,
      p_expires_at: expires_at
    });

    if (error) {
      console.error('Error saving memory:', error);
      return res.status(500).json({ 
        message: 'Failed to save memory',
        error: error.message 
      });
    }

    // Return success response
    res.status(201).json({
      message: 'Memory saved successfully',
      memory_id: data,
      agent_name,
      memory_type,
      importance_score
    });

  } catch (error) {
    console.error('Error in save memory API:', error);
    res.status(500).json({ 
      message: 'Internal server error',
      error: error.message 
    });
  }
}
