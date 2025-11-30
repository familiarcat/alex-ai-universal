import { NextResponse } from 'next/server';
import { getUnifiedServiceAccessor } from '@/scripts/utils/unified-service-accessor';

export async function GET() {
  try {
    const services = getUnifiedServiceAccessor();
    services.initialize();

    // Query crew members from RAG
    const crewQuery = await services.queryMemories('crew member', {
      limit: 20,
      category: 'crew-member'
    });

    if (!crewQuery.success || !crewQuery.results) {
      return NextResponse.json({
        success: false,
        crewMembers: [],
        error: 'No crew members found'
      });
    }

    // Transform to crew member format
    const crewMembers = crewQuery.results.map(result => ({
      name: result.metadata?.crewMember || result.title?.replace('Crew Member: ', '') || 'Unknown',
      role: result.metadata?.role || 'Unknown',
      specialization: result.metadata?.specialization || 'General',
      preferredModels: result.metadata?.preferredModels || [],
      associatedKnowledge: 0 // Would need separate query
    }));

    return NextResponse.json({
      success: true,
      crewMembers,
      total: crewMembers.length
    });
  } catch (error: any) {
    console.error('Error fetching crew roster:', error);
    return NextResponse.json({
      success: false,
      crewMembers: [],
      error: error.message || 'Failed to fetch crew roster'
    }, { status: 500 });
  }
}

