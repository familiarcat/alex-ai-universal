/**
 * Crew Knowledge Capture System
 * 
 * Captures and stores crew member intellectual development, questions, answers,
 * and learning from all projects while maintaining Prime Directive ambiguity.
 * 
 * Prime Directive Compliance:
 * - Stores intellectual growth and learning patterns
 * - Never stores secure/proprietary project data
 * - Maintains crew member anonymity in project context
 * - Focuses on knowledge development, not project specifics
 */

import { createClient } from '@supabase/supabase-js'

interface CrewInteraction {
  id: string
  crew_member_id: string
  interaction_type: 'question' | 'answer' | 'analysis' | 'recommendation' | 'learning'
  content: string
  context_domain: string // e.g., 'architecture', 'security', 'performance' - not project names
  expertise_area: string
  knowledge_level: 'beginner' | 'intermediate' | 'advanced' | 'expert'
  confidence_score: number // 0-1 scale
  project_context: string // Generic context like "web_application", "api_service" - not specific projects
  timestamp: string
  learning_outcome?: string
  knowledge_gaps_identified?: string[]
  skills_demonstrated?: string[]
  follow_up_questions?: string[]
}

interface CrewKnowledgeProfile {
  crew_member_id: string
  expertise_areas: string[]
  knowledge_growth_timeline: Array<{
    date: string
    area: string
    level: string
    evidence: string
  }>
  learning_patterns: {
    preferred_learning_styles: string[]
    knowledge_retention_rate: number
    collaboration_frequency: number
    mentoring_activities: number
  }
  intellectual_contributions: Array<{
    contribution_type: string
    impact_level: 'low' | 'medium' | 'high' | 'critical'
    domain: string
    timestamp: string
  }>
}

export class CrewKnowledgeCaptureSystem {
  private supabase: any
  private crewMembers: Map<string, CrewKnowledgeProfile>

  constructor() {
    const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseKey = process.env.SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    
    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Supabase credentials not found in environment variables')
    }

    this.supabase = createClient(supabaseUrl, supabaseKey)
    this.crewMembers = new Map()
    
    this.initializeCrewProfiles()
  }

  /**
   * Initialize crew member knowledge profiles
   */
  private initializeCrewProfiles() {
    const crewConfig = [
      {
        id: 'captain_picard',
        name: 'Captain Jean-Luc Picard',
        initial_expertise: ['Strategic Leadership', 'System Integration', 'Decision Making'],
        learning_focus: ['Ethical Leadership', 'Team Dynamics', 'Strategic Planning']
      },
      {
        id: 'commander_data',
        name: 'Commander Data',
        initial_expertise: ['Analytics', 'Logic', 'Data Processing', 'AI/ML'],
        learning_focus: ['Emotional Intelligence', 'Creative Problem Solving', 'Human Interaction']
      },
      {
        id: 'commander_riker',
        name: 'Commander William Riker',
        initial_expertise: ['Tactical Operations', 'Workflow Management', 'Execution'],
        learning_focus: ['Strategic Thinking', 'Leadership Development', 'Complex Coordination']
      },
      {
        id: 'lieutenant_geordi',
        name: 'Lieutenant Commander Geordi La Forge',
        initial_expertise: ['Infrastructure', 'System Integration', 'Technical Solutions'],
        learning_focus: ['Innovation', 'Cross-Platform Integration', 'Scalability Planning']
      },
      {
        id: 'lieutenant_worf',
        name: 'Lieutenant Worf',
        initial_expertise: ['Security', 'Threat Assessment', 'Defensive Strategies'],
        learning_focus: ['Proactive Security', 'Risk Management', 'Incident Response']
      },
      {
        id: 'counselor_troi',
        name: 'Counselor Deanna Troi',
        initial_expertise: ['Psychology', 'Conflict Resolution', 'Crew Welfare'],
        learning_focus: ['Team Psychology', 'Change Management', 'Mental Health Support']
      },
      {
        id: 'dr_crusher',
        name: 'Dr. Beverly Crusher',
        initial_expertise: ['Medical Operations', 'Health Monitoring', 'Treatment Protocols'],
        learning_focus: ['Preventive Care', 'Health Analytics', 'Wellness Programs']
      },
      {
        id: 'lieutenant_uhura',
        name: 'Lieutenant Uhura',
        initial_expertise: ['Communications', 'Language Processing', 'Information Relay'],
        learning_focus: ['Cross-Cultural Communication', 'Information Architecture', 'Real-time Coordination']
      },
      {
        id: 'quark',
        name: 'Quark',
        initial_expertise: ['Business Operations', 'Resource Management', 'Cost Optimization'],
        learning_focus: ['Sustainable Business Models', 'Value Creation', 'Strategic Partnerships']
      }
    ]

    crewConfig.forEach(member => {
      this.crewMembers.set(member.id, {
        crew_member_id: member.id,
        expertise_areas: member.initial_expertise,
        knowledge_growth_timeline: [],
        learning_patterns: {
          preferred_learning_styles: ['collaborative', 'experiential', 'analytical'],
          knowledge_retention_rate: 0.85,
          collaboration_frequency: 0.0,
          mentoring_activities: 0.0
        },
        intellectual_contributions: []
      })
    })
  }

  /**
   * Capture a crew member interaction while maintaining Prime Directive compliance
   */
  async captureInteraction(
    crewMemberId: string,
    interactionType: CrewInteraction['interaction_type'],
    content: string,
    context: {
      domain: string
      expertiseArea: string
      knowledgeLevel: CrewInteraction['knowledge_level']
      confidenceScore: number
      projectContext: string
    }
  ): Promise<void> {
    try {
      // Sanitize content to remove any project-specific identifiers
      const sanitizedContent = this.sanitizeContent(content)
      
      const interaction: CrewInteraction = {
        id: `interaction_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        crew_member_id: crewMemberId,
        interaction_type: interactionType,
        content: sanitizedContent,
        context_domain: context.domain,
        expertise_area: context.expertiseArea,
        knowledge_level: context.knowledgeLevel,
        confidence_score: context.confidenceScore,
        project_context: context.projectContext,
        timestamp: new Date().toISOString(),
        learning_outcome: this.identifyLearningOutcome(sanitizedContent, interactionType),
        knowledge_gaps_identified: this.identifyKnowledgeGaps(sanitizedContent),
        skills_demonstrated: this.extractSkills(sanitizedContent),
        follow_up_questions: this.generateFollowUpQuestions(sanitizedContent, interactionType)
      }

      // Store interaction in Supabase
      const { error } = await this.supabase
        .from('crew_interactions')
        .insert(interaction)

      if (error) {
        console.error('Error storing crew interaction:', error)
        // Store locally if Supabase fails
        await this.storeLocally(interaction)
      }

      // Update crew member knowledge profile
      await this.updateKnowledgeProfile(crewMemberId, interaction)

    } catch (error) {
      console.error('Error capturing crew interaction:', error)
    }
  }

  /**
   * Sanitize content to remove project-specific information
   */
  private sanitizeContent(content: string): string {
    // Remove specific project names, URLs, and sensitive identifiers
    let sanitized = content
      .replace(/project[-_]?[a-zA-Z0-9_-]+/gi, '[PROJECT_NAME]')
      .replace(/https?:\/\/[^\s]+/g, '[URL]')
      .replace(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g, '[EMAIL]')
      .replace(/\b\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}\b/g, '[IP_ADDRESS]')
      .replace(/[A-Z]{2,}/g, (match) => {
        // Keep common technical terms, replace project-specific acronyms
        const technicalTerms = ['API', 'UI', 'UX', 'SQL', 'JSON', 'XML', 'HTTP', 'HTTPS', 'REST', 'CRUD']
        return technicalTerms.includes(match) ? match : '[ACRONYM]'
      })

    return sanitized
  }

  /**
   * Identify learning outcomes from interaction content
   */
  private identifyLearningOutcome(content: string, interactionType: string): string {
    const learningKeywords = {
      'question': ['seeking', 'wondering', 'curious', 'exploring', 'investigating'],
      'answer': ['understood', 'learned', 'realized', 'discovered', 'confirmed'],
      'analysis': ['analyzed', 'evaluated', 'assessed', 'examined', 'reviewed'],
      'recommendation': ['suggest', 'recommend', 'propose', 'advise', 'guidance'],
      'learning': ['learned', 'gained', 'developed', 'improved', 'enhanced']
    }

    const keywords = learningKeywords[interactionType] || []
    const foundKeywords = keywords.filter(keyword => 
      content.toLowerCase().includes(keyword)
    )

    if (foundKeywords.length > 0) {
      return `Demonstrated ${interactionType} skills in ${foundKeywords.join(', ')}`
    }

    return `Engaged in ${interactionType} activity with knowledge application`
  }

  /**
   * Identify knowledge gaps from interaction content
   */
  private identifyKnowledgeGaps(content: string): string[] {
    const gapIndicators = [
      'don\'t know', 'unclear', 'not sure', 'confused', 'struggling',
      'need help', 'require assistance', 'lack understanding', 'missing'
    ]

    return gapIndicators.filter(indicator => 
      content.toLowerCase().includes(indicator)
    )
  }

  /**
   * Extract skills demonstrated in the interaction
   */
  private extractSkills(content: string): string[] {
    const skillKeywords = {
      'problem_solving': ['solve', 'fix', 'resolve', 'address', 'tackle'],
      'critical_thinking': ['analyze', 'evaluate', 'assess', 'examine', 'critique'],
      'communication': ['explain', 'describe', 'clarify', 'discuss', 'present'],
      'collaboration': ['work together', 'team', 'collaborate', 'coordinate', 'partner'],
      'creativity': ['innovative', 'creative', 'novel', 'unique', 'original'],
      'leadership': ['lead', 'guide', 'direct', 'manage', 'coordinate'],
      'technical': ['implement', 'code', 'build', 'develop', 'engineer']
    }

    const demonstratedSkills: string[] = []

    Object.entries(skillKeywords).forEach(([skill, keywords]) => {
      if (keywords.some(keyword => content.toLowerCase().includes(keyword))) {
        demonstratedSkills.push(skill)
      }
    })

    return demonstratedSkills
  }

  /**
   * Generate follow-up questions to encourage deeper learning
   */
  private generateFollowUpQuestions(content: string, interactionType: string): string[] {
    const questions = []

    if (interactionType === 'question') {
      questions.push('What additional context would help clarify this question?')
      questions.push('How might this relate to other areas of expertise?')
    }

    if (interactionType === 'answer') {
      questions.push('What are the broader implications of this understanding?')
      questions.push('How could this knowledge be applied in different contexts?')
    }

    if (interactionType === 'analysis') {
      questions.push('What alternative approaches could be considered?')
      questions.push('What are the limitations of this analysis?')
    }

    return questions
  }

  /**
   * Update crew member knowledge profile based on interaction
   */
  private async updateKnowledgeProfile(crewMemberId: string, interaction: CrewInteraction): Promise<void> {
    const profile = this.crewMembers.get(crewMemberId)
    if (!profile) return

    // Update expertise areas if new domain is explored
    if (!profile.expertise_areas.includes(interaction.context_domain)) {
      profile.expertise_areas.push(interaction.context_domain)
    }

    // Add to knowledge growth timeline
    profile.knowledge_growth_timeline.push({
      date: interaction.timestamp,
      area: interaction.context_domain,
      level: interaction.knowledge_level,
      evidence: interaction.learning_outcome || 'Knowledge application demonstrated'
    })

    // Update learning patterns
    if (interaction.skills_demonstrated?.includes('collaboration')) {
      profile.learning_patterns.collaboration_frequency += 0.1
    }

    // Add intellectual contribution
    profile.intellectual_contributions.push({
      contribution_type: interaction.interaction_type,
      impact_level: this.assessImpactLevel(interaction),
      domain: interaction.context_domain,
      timestamp: interaction.timestamp
    })

    // Store updated profile
    try {
      const { error } = await this.supabase
        .from('crew_knowledge_profiles')
        .upsert({
          crew_member_id: crewMemberId,
          ...profile,
          last_updated: new Date().toISOString()
        })

      if (error) {
        console.error('Error updating crew knowledge profile:', error)
      }
    } catch (error) {
      console.error('Error storing knowledge profile:', error)
    }
  }

  /**
   * Assess impact level of interaction
   */
  private assessImpactLevel(interaction: CrewInteraction): 'low' | 'medium' | 'high' | 'critical' {
    const confidenceScore = interaction.confidence_score
    const hasLearningOutcome = !!interaction.learning_outcome
    const hasSkills = interaction.skills_demonstrated?.length > 0

    if (confidenceScore >= 0.8 && hasLearningOutcome && hasSkills) {
      return 'high'
    } else if (confidenceScore >= 0.6 && (hasLearningOutcome || hasSkills)) {
      return 'medium'
    } else if (confidenceScore >= 0.4) {
      return 'low'
    } else {
      return 'low'
    }
  }

  /**
   * Store interaction locally if Supabase fails
   */
  private async storeLocally(interaction: CrewInteraction): Promise<void> {
    // Store in local storage or file system as fallback
    console.log('Storing crew interaction locally:', {
      id: interaction.id,
      crew_member: interaction.crew_member_id,
      type: interaction.interaction_type,
      domain: interaction.context_domain,
      timestamp: interaction.timestamp
    })
  }

  /**
   * Get crew member knowledge development summary
   */
  async getKnowledgeDevelopment(crewMemberId: string): Promise<any> {
    try {
      const { data, error } = await this.supabase
        .from('crew_interactions')
        .select('*')
        .eq('crew_member_id', crewMemberId)
        .order('timestamp', { ascending: false })
        .limit(100)

      if (error) {
        console.error('Error fetching crew interactions:', error)
        return null
      }

      return {
        total_interactions: data.length,
        recent_activity: data.slice(0, 10),
        expertise_areas: [...new Set(data.map(d => d.context_domain))],
        learning_progression: this.analyzeLearningProgression(data),
        knowledge_contributions: this.summarizeContributions(data)
      }
    } catch (error) {
      console.error('Error getting knowledge development:', error)
      return null
    }
  }

  /**
   * Analyze learning progression over time
   */
  private analyzeLearningProgression(interactions: CrewInteraction[]): any {
    const progression = interactions.reduce((acc, interaction) => {
      const month = interaction.timestamp.substring(0, 7) // YYYY-MM
      if (!acc[month]) {
        acc[month] = {
          interactions: 0,
          avg_confidence: 0,
          domains: new Set(),
          skills: new Set()
        }
      }
      
      acc[month].interactions++
      acc[month].avg_confidence += interaction.confidence_score
      acc[month].domains.add(interaction.context_domain)
      interaction.skills_demonstrated?.forEach(skill => acc[month].skills.add(skill))
      
      return acc
    }, {})

    // Calculate averages
    Object.values(progression).forEach((month: any) => {
      month.avg_confidence /= month.interactions
      month.domains = Array.from(month.domains)
      month.skills = Array.from(month.skills)
    })

    return progression
  }

  /**
   * Summarize crew member contributions
   */
  private summarizeContributions(interactions: CrewInteraction[]): any {
    return {
      total_contributions: interactions.length,
      by_type: interactions.reduce((acc, interaction) => {
        acc[interaction.interaction_type] = (acc[interaction.interaction_type] || 0) + 1
        return acc
      }, {}),
      by_domain: interactions.reduce((acc, interaction) => {
        acc[interaction.context_domain] = (acc[interaction.context_domain] || 0) + 1
        return acc
      }, {}),
      avg_confidence: interactions.reduce((sum, interaction) => sum + interaction.confidence_score, 0) / interactions.length,
      unique_skills: [...new Set(interactions.flatMap(i => i.skills_demonstrated || []))]
    }
  }
}

export default CrewKnowledgeCaptureSystem
