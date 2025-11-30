import { NextRequest, NextResponse } from 'next/server';
import { getUnifiedDataService } from '@/lib/unified-data-service';

/**
 * 🖖 Crew Thoughts & Concerns API
 * 
 * Retrieves recent crew member thoughts, concerns, and emotional metrics
 * from the RAG memory system via MCP.
 * 
 * Returns:
 * - Recent thoughts/summaries from each crew member
 * - Emotional metrics (concern level, satisfaction)
 * - Active concerns about projects or observation lounge meetings
 */

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const limit = parseInt(searchParams.get('limit') || '50');
    const crewMember = searchParams.get('crew_member') || undefined;

    // Get recent crew memories with thoughts/concerns
    // Query all memories, then filter for crew-specific ones
    let memories: any[] = [];
    
    try {
      const service = getUnifiedDataService();
      
      try {
        const knowledgeData = await service.queryKnowledge({
          limit,
          crew_member: crewMember,
          query: crewMember ? `crew member ${crewMember}` : undefined
        });
        
        // Handle different response formats
        memories = knowledgeData?.data || knowledgeData?.memories || knowledgeData?.results || knowledgeData || [];
        
        // If we got crew stats instead, try to get memories from there
        if (Array.isArray(memories) && memories.length === 0) {
          const statsData = await service.getCrewStats({ limit, crew_member: crewMember });
          memories = statsData?.sessions || statsData?.data || statsData || [];
        }
      } catch (queryError: any) {
        console.warn('Knowledge query failed, trying crew stats:', queryError?.message || queryError);
        // Fallback to crew stats
        try {
          const statsData = await service.getCrewStats({ limit, crew_member: crewMember });
          memories = statsData?.sessions || statsData?.data || statsData || [];
        } catch (statsError: any) {
          console.warn('Crew stats also failed:', statsError?.message || statsError);
          // Return empty array if both fail
          memories = [];
        }
      }
    } catch (serviceError: any) {
      console.error('Failed to initialize UnifiedDataService:', serviceError?.message || serviceError);
      // Return empty array if service initialization fails
      memories = [];
    }

    // Process memories to extract thoughts and concerns
    const crewThoughts = processCrewMemories(memories);

    return NextResponse.json({
      success: true,
      crewThoughts,
      memoryCount: memories.length,
      timestamp: new Date().toISOString()
    });
  } catch (error: any) {
    console.error('Failed to fetch crew thoughts:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to fetch crew thoughts',
        crewThoughts: [],
        memoryCount: 0
      },
      { status: 500 }
    );
  }
}

/**
 * Process crew memories to extract thoughts, concerns, and emotional metrics
 */
function processCrewMemories(memories: any[]): any[] {
  const crewMap = new Map<string, {
    name: string;
    role: string;
    icon: string;
    recentThoughts: string[];
    concerns: string[];
    concernLevel: number; // 0-10 (0 = no concerns, 10 = critical)
    satisfaction: number; // 0-10 (0 = very dissatisfied, 10 = very satisfied)
    lastActive: string;
    memoryCount: number;
  }>();

  const crewMembers = [
    { name: 'Picard', role: 'Strategic Leadership', icon: '🎖️' },
    { name: 'Data', role: 'Operations & Analytics', icon: '🤖' },
    { name: 'Riker', role: 'Tactical Operations', icon: '⚡' },
    { name: 'La Forge', role: 'Engineering', icon: '🔧' },
    { name: 'Worf', role: 'Security', icon: '⚔️' },
    { name: 'Troi', role: 'UX & Empathy', icon: '💭' },
    { name: 'Crusher', role: 'System Health', icon: '💊' },
    { name: 'Uhura', role: 'Communications', icon: '📻' },
    { name: 'Quark', role: 'Business Analysis', icon: '💰' },
    { name: 'O\'Brien', role: 'Pragmatic Solutions', icon: '🛠️' }
  ];

  // Initialize crew map
  crewMembers.forEach(crew => {
    crewMap.set(crew.name, {
      ...crew,
      recentThoughts: [],
      concerns: [],
      concernLevel: 0,
      satisfaction: 7, // Default to neutral-positive
      lastActive: 'Never',
      memoryCount: 0
    });
  });

  // Process memories
  memories.forEach((memory: any) => {
    const crewName = extractCrewName(memory.crew_member || memory.crewMember || 'system');
    const crew = crewMap.get(crewName);
    
    if (!crew) return;

    crew.memoryCount++;
    
    // Extract thought/summary
    const thought = memory.summary || memory.title || memory.content || '';
    if (thought && crew.recentThoughts.length < 3) {
      crew.recentThoughts.push(thought.substring(0, 150)); // Limit length
    }

    // Extract concerns (look for keywords)
    const concernKeywords = ['concern', 'issue', 'problem', 'worry', 'risk', 'critical', 'urgent', 'failing', 'broken'];
    const lowerThought = thought.toLowerCase();
    const hasConcern = concernKeywords.some(keyword => lowerThought.includes(keyword));
    
    if (hasConcern && crew.concerns.length < 2) {
      crew.concerns.push(thought.substring(0, 120));
      crew.concernLevel = Math.min(10, crew.concernLevel + 2); // Increase concern level
    }

    // Calculate satisfaction based on memory content
    const positiveKeywords = ['success', 'complete', 'excellent', 'optimal', 'improved', 'resolved', 'working'];
    const negativeKeywords = ['failed', 'error', 'broken', 'issue', 'problem', 'concern', 'critical'];
    
    const positiveCount = positiveKeywords.filter(k => lowerThought.includes(k)).length;
    const negativeCount = negativeKeywords.filter(k => lowerThought.includes(k)).length;
    
    if (positiveCount > negativeCount) {
      crew.satisfaction = Math.min(10, crew.satisfaction + 0.5);
    } else if (negativeCount > positiveCount) {
      crew.satisfaction = Math.max(0, crew.satisfaction - 1);
    }

    // Update last active
    const memoryDate = new Date(memory.created_at || memory.timestamp || memory.storage_timestamp);
    if (memoryDate > new Date(crew.lastActive) || crew.lastActive === 'Never') {
      crew.lastActive = memoryDate.toLocaleDateString();
    }
  });

  // Normalize concern level and satisfaction
  crewMap.forEach(crew => {
    crew.concernLevel = Math.min(10, Math.max(0, crew.concernLevel));
    crew.satisfaction = Math.min(10, Math.max(0, crew.satisfaction));
  });

  return Array.from(crewMap.values());
}

/**
 * Extract crew member name from various formats
 */
function extractCrewName(crewMember: string): string {
  if (!crewMember) return 'Data'; // Default
  
  const normalized = crewMember.toLowerCase().trim();
  
  // Map common variations
  const nameMap: Record<string, string> = {
    'picard': 'Picard',
    'jean-luc picard': 'Picard',
    'captain picard': 'Picard',
    'data': 'Data',
    'commander data': 'Data',
    'riker': 'Riker',
    'commander riker': 'Riker',
    'william riker': 'Riker',
    'la forge': 'La Forge',
    'geordi': 'La Forge',
    'geordi la forge': 'La Forge',
    'worf': 'Worf',
    'lieutenant worf': 'Worf',
    'troi': 'Troi',
    'deanna troi': 'Troi',
    'counselor troi': 'Troi',
    'crusher': 'Crusher',
    'beverly crusher': 'Crusher',
    'dr. crusher': 'Crusher',
    'uhura': 'Uhura',
    'lieutenant uhura': 'Uhura',
    'quark': 'Quark',
    'obrien': 'O\'Brien',
    'chief obrien': 'O\'Brien',
    'miles obrien': 'O\'Brien'
  };

  return nameMap[normalized] || 'Data';
}

