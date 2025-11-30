

 lib/supabase.js
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://your-project.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'your-anon-key';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Helper functions for Alex AI learning data
export const getLearningMetrics = async () => {
  try {
    const { data, error } = await supabase
      .from('alex_ai_learning_metrics')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error fetching learning metrics:', error);
    return null;
  }
};

export const getCrewContributions = async () => {
  try {
    const { data, error } = await supabase
      .from('alex_ai_memories')
      .select('crew_member, created_at')
      .order('created_at', { ascending: false });

    if (error) throw error;

    // Count contributions by crew member
    const contributions = data.reduce((acc, memory) => {
      const member = memory.crew_member;
      acc[member] = (acc[member] || 0) + 1;
      return acc;
    }, {});

    return contributions;
  } catch (error) {
    console.error('Error fetching crew contributions:', error);
    return {};
  }
};

export const getRecentMemories = async (limit = 10) => {
  try {
    const { data, error } = await supabase
      .from('alex_ai_memories')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error fetching recent memories:', error);
    return [];
  }
};

export const getLearningCategories = async () => {
  try {
    const { data, error } = await supabase
      .from('alex_ai_memories')
      .select('metadata, content')
      .order('created_at', { ascending: false });

    if (error) throw error;

    // Categorize memories
    const categories = {};
    data.forEach(memory => {
      const category = memory.metadata?.category || 'general';
      if (!categories[category]) {
        categories[category] = { count: 0, recent: [] };
      }
      categories[category].count++;
      if (categories[category].recent.length < 3) {
        categories[category].recent.push(memory.content.substring(0, 60) + '...');
      }
    });

    return categories;
  } catch (error) {
    console.error('Error fetching learning categories:', error);
    return {};
  }
};







