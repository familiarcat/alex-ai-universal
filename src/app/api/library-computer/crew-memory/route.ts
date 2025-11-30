/**
 * Library Computer Crew Memory API
 * 
 * API endpoints for crew members to add, search, and manage their memories
 * in the shared Library Computer system with Prime Directive compliance
 */

import { NextRequest, NextResponse } from 'next/server';
import SharedLibraryComputerSystem, {
  CrewMember,
  KnowledgeType,
  PriorityLevel
} from '../../../../lib/shared-library-computer-system';

// Global instance of the library system (singleton pattern)
let librarySystem: SharedLibraryComputerSystem | null = null;

function getLibrarySystem(): SharedLibraryComputerSystem {
  if (!librarySystem) {
    librarySystem = new SharedLibraryComputerSystem();
    
    // Set up event listeners for real-time updates
    librarySystem.on('memoryAdded', (entry) => {
      console.log(`📚 Library Computer: Memory added by ${entry.crewMember}`);
    });
    
    librarySystem.on('memoryValidated', (data) => {
      console.log(`✅ Library Computer: Memory validated by ${data.validator}`);
    });
    
    librarySystem.on('conflictResolved', (resolution) => {
      console.log(`🤝 Library Computer: Conflict resolved by ${resolution.resolvedBy.join(', ')}`);
    });
  }
  
  return librarySystem;
}

/**
 * POST /api/library-computer/crew-memory
 * Add a new crew memory to the shared library
 */
export async function POST(request: NextRequest) {
  try {
    const system = getLibrarySystem();
    const body = await request.json();
    
    const {
      crewMember,
      knowledgeType,
      title,
      summary,
      detailedAnalysis,
      keyFindings,
      conclusions,
      recommendations,
      tags = [],
      priority = PriorityLevel.MEDIUM
    } = body;
    
    // Validate required fields
    if (!crewMember || !knowledgeType || !title || !summary) {
      return NextResponse.json({
        success: false,
        error: 'Missing required fields: crewMember, knowledgeType, title, summary',
        crew: crewMember ? getCrewMemberName(crewMember) : 'Unknown'
      }, { status: 400 });
    }
    
    // Validate crew member
    if (!Object.values(CrewMember).includes(crewMember)) {
      return NextResponse.json({
        success: false,
        error: `Invalid crew member. Valid members: ${Object.values(CrewMember).join(', ')}`,
        crew: 'Unknown'
      }, { status: 400 });
    }
    
    // Validate knowledge type
    if (!Object.values(KnowledgeType).includes(knowledgeType)) {
      return NextResponse.json({
        success: false,
        error: `Invalid knowledge type. Valid types: ${Object.values(KnowledgeType).join(', ')}`,
        crew: getCrewMemberName(crewMember)
      }, { status: 400 });
    }
    
    // Add memory to library system
    const memoryId = await system.addCrewMemory(
      crewMember,
      knowledgeType,
      title,
      summary,
      detailedAnalysis || '',
      Array.isArray(keyFindings) ? keyFindings : (keyFindings ? [keyFindings] : []),
      Array.isArray(conclusions) ? conclusions : (conclusions ? [conclusions] : []),
      Array.isArray(recommendations) ? recommendations : (recommendations ? [recommendations] : []),
      Array.isArray(tags) ? tags : (tags ? [tags] : []),
      priority
    );
    
    return NextResponse.json({
      success: true,
      data: {
        memoryId,
        message: 'Memory successfully added to Library Computer',
        crew: getCrewMemberName(crewMember),
        primeDirectiveCompliance: 'Maintained - knowledge stored as general principles'
      }
    });
    
  } catch (error) {
    console.error('Library Computer API Error:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to add memory to Library Computer',
      crew: 'Unknown'
    }, { status: 500 });
  }
}

/**
 * GET /api/library-computer/crew-memory
 * Search crew memories in the shared library
 */
export async function GET(request: NextRequest) {
  try {
    const system = getLibrarySystem();
    const { searchParams } = new URL(request.url);
    
    const query = searchParams.get('query') || '';
    const crewMember = searchParams.get('crewMember') as CrewMember;
    const knowledgeType = searchParams.get('knowledgeType') as KnowledgeType;
    const priority = searchParams.get('priority') as PriorityLevel;
    const maxResults = parseInt(searchParams.get('maxResults') || '10');
    const similarityThreshold = parseFloat(searchParams.get('similarityThreshold') || '0.7');
    
    if (!query.trim()) {
      return NextResponse.json({
        success: false,
        error: 'Query parameter is required',
        crew: 'Unknown'
      }, { status: 400 });
    }
    
    // Perform search
    const results = await system.searchCrewMemories({
      query,
      crewMember,
      knowledgeTypes: knowledgeType ? [knowledgeType] : undefined,
      priorityLevels: priority ? [priority] : undefined,
      maxResults,
      similarityThreshold,
      includeReferences: true
    });
    
    return NextResponse.json({
      success: true,
      data: {
        query,
        results: results.map(result => ({
          id: result.entry.id,
          title: result.entry.title,
          summary: result.entry.summary,
          crewMember: result.entry.crewMember,
          crewMemberName: getCrewMemberName(result.entry.crewMember),
          knowledgeType: result.entry.knowledgeType,
          priority: result.entry.priority,
          similarity: result.similarity,
          relevanceScore: result.relevanceScore,
          crewValidation: result.crewValidation,
          recencyScore: result.recencyScore,
          confidenceLevel: result.entry.confidenceLevel,
          validatedBy: result.entry.validatedBy.map(member => getCrewMemberName(member)),
          tags: result.entry.tags,
          timestamp: result.entry.timestamp,
          generalPrinciples: result.entry.generalPrinciples,
          referencedDocuments: result.entry.referencedDocuments
        })),
        totalResults: results.length,
        searchMetadata: {
          crewMember: crewMember ? getCrewMemberName(crewMember) : 'All Crew',
          knowledgeType: knowledgeType || 'All Types',
          priority: priority || 'All Priorities',
          similarityThreshold,
          maxResults
        }
      }
    });
    
  } catch (error) {
    console.error('Library Computer Search API Error:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to search Library Computer',
      crew: 'Unknown'
    }, { status: 500 });
  }
}

/**
 * PUT /api/library-computer/crew-memory
 * Validate or update a crew memory
 */
export async function PUT(request: NextRequest) {
  try {
    const system = getLibrarySystem();
    const body = await request.json();
    
    const {
      memoryId,
      action,
      validator,
      validation,
      conflictResolution
    } = body;
    
    if (!memoryId || !action) {
      return NextResponse.json({
        success: false,
        error: 'Missing required fields: memoryId, action',
        crew: 'Unknown'
      }, { status: 400 });
    }
    
    switch (action) {
      case 'validate':
        if (!validator || !validation) {
          return NextResponse.json({
            success: false,
            error: 'Missing required fields for validation: validator, validation',
            crew: 'Unknown'
          }, { status: 400 });
        }
        
        const validationResult = system.validateMemoryEntry(memoryId, validator, validation);
        
        if (!validationResult) {
          return NextResponse.json({
            success: false,
            error: 'Memory entry not found',
            crew: getCrewMemberName(validator)
          }, { status: 404 });
        }
        
        return NextResponse.json({
          success: true,
          data: {
            memoryId,
            message: 'Memory entry validated successfully',
            validator: getCrewMemberName(validator),
            validation
          }
        });
        
      case 'resolve_conflict':
        if (!conflictResolution) {
          return NextResponse.json({
            success: false,
            error: 'Missing conflict resolution data',
            crew: 'Unknown'
          }, { status: 400 });
        }
        
        const {
          conflictingEntries,
          resolver,
          resolutionMethod,
          finalConsensus
        } = conflictResolution;
        
        const conflictId = system.resolveConflict(
          conflictingEntries[0],
          conflictingEntries[1],
          resolver,
          resolutionMethod,
          finalConsensus
        );
        
        return NextResponse.json({
          success: true,
          data: {
            conflictId,
            message: 'Conflict resolved successfully',
            resolver: getCrewMemberName(resolver),
            resolutionMethod,
            finalConsensus
          }
        });
        
      default:
        return NextResponse.json({
          success: false,
          error: `Unknown action: ${action}`,
          crew: 'Unknown'
        }, { status: 400 });
    }
    
  } catch (error) {
    console.error('Library Computer Update API Error:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to update memory entry',
      crew: 'Unknown'
    }, { status: 500 });
  }
}

/**
 * GET /api/library-computer/crew-memory/terminal
 * Get LCARS terminal interface data for a specific crew member
 */
export async function GET_Terminal(request: NextRequest) {
  try {
    const system = getLibrarySystem();
    const { searchParams } = new URL(request.url);
    
    const crewMember = searchParams.get('crewMember') as CrewMember;
    
    if (!crewMember || !Object.values(CrewMember).includes(crewMember)) {
      return NextResponse.json({
        success: false,
        error: `Invalid crew member. Valid members: ${Object.values(CrewMember).join(', ')}`,
        crew: 'Unknown'
      }, { status: 400 });
    }
    
    const terminalData = system.getLCARSTerminalInterface(crewMember);
    
    return NextResponse.json({
      success: true,
      data: {
        crewMember,
        crewMemberName: getCrewMemberName(crewMember),
        terminalData: {
          ...terminalData,
          recentEntries: terminalData.recentEntries.map(entry => ({
            ...entry,
            crewMemberName: getCrewMemberName(entry.crewMember),
            validatedByNames: entry.validatedBy.map(member => getCrewMemberName(member))
          })),
          relatedMemories: terminalData.relatedMemories.map(memory => ({
            ...memory,
            crewMemberName: getCrewMemberName(memory.crewMember),
            validatedByNames: memory.validatedBy.map(member => getCrewMemberName(member))
          }))
        }
      }
    });
    
  } catch (error) {
    console.error('Library Computer Terminal API Error:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to get terminal interface data',
      crew: 'Unknown'
    }, { status: 500 });
  }
}

/**
 * GET /api/library-computer/crew-memory/collective-intelligence
 * Get collective intelligence insights from the shared library
 */
export async function GET_CollectiveIntelligence(request: NextRequest) {
  try {
    const system = getLibrarySystem();
    const intelligenceReport = system.getCollectiveIntelligence();
    
    return NextResponse.json({
      success: true,
      data: {
        report: {
          ...intelligenceReport,
          crewContributions: Object.fromEntries(
            Array.from(intelligenceReport.crewContributions.entries()).map(([member, count]) => [
              member,
              {
                name: getCrewMemberName(member),
                count
              }
            ])
          ),
          knowledgeDistribution: Object.fromEntries(
            Array.from(intelligenceReport.knowledgeDistribution.entries()).map(([type, count]) => [
              type,
              {
                name: type.replace('_', ' '),
                count
              }
            ])
          ),
          expertiseOverlap: Object.fromEntries(intelligenceReport.expertiseOverlap)
        },
        timestamp: new Date().toISOString(),
        crew: 'Library Computer System'
      }
    });
    
  } catch (error) {
    console.error('Library Computer Collective Intelligence API Error:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to get collective intelligence report',
      crew: 'Unknown'
    }, { status: 500 });
  }
}

/**
 * Helper function to get crew member display name
 */
function getCrewMemberName(crewMember: CrewMember): string {
  const crewNames = {
    [CrewMember.PICARD]: 'Captain Jean-Luc Picard',
    [CrewMember.RIKER]: 'Commander William Riker',
    [CrewMember.DATA]: 'Commander Data',
    [CrewMember.LA_FORGE]: 'Lieutenant Commander Geordi La Forge',
    [CrewMember.WORF]: 'Lieutenant Worf',
    [CrewMember.TROI]: 'Counselor Deanna Troi',
    [CrewMember.CRUSHER]: 'Dr. Beverly Crusher',
    [CrewMember.UHURA]: 'Lieutenant Uhura',
    [CrewMember.QUARK]: 'Quark'
  };
  
  return crewNames[crewMember] || 'Unknown Crew Member';
}

