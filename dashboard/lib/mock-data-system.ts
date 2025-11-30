/**
 * 🖖 Mock Data System
 * 
 * Provides mock data for components that don't have live data sources yet
 * Enables e2e data flow visualization and testing
 * 
 * Leadership: Commander Data (Data Generation) + Geordi La Forge (Infrastructure)
 * Crew: All teams contributing mock data patterns
 */

export interface MockDataConfig {
  componentName: string;
  dataType: string;
  count?: number;
  dateRange?: { start: Date; end: Date };
  customFields?: Record<string, any>;
}

export class MockDataSystem {
  private static instance: MockDataSystem;
  private mockDataCache: Map<string, any> = new Map();

  private constructor() {}

  static getInstance(): MockDataSystem {
    if (!MockDataSystem.instance) {
      MockDataSystem.instance = new MockDataSystem();
    }
    return MockDataSystem.instance;
  }

  /**
   * Generate mock learning metrics
   */
  generateLearningMetrics(config: MockDataConfig = { componentName: 'LearningAnalyticsDashboard' }) {
    const cacheKey = `learning-metrics-${config.count || 30}`;
    if (this.mockDataCache.has(cacheKey)) {
      return this.mockDataCache.get(cacheKey);
    }

    const count = config.count || 30;
    const sessions = [];
    const now = new Date();

    for (let i = count - 1; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);
      
      sessions.push({
        id: `session-${i}`,
        created_at: date.toISOString(),
        timestamp: date.toISOString(),
        crew_member: this.randomCrewMember(),
        knowledge_type: this.randomKnowledgeType(),
        confidence_level: Math.floor(Math.random() * 30) + 70, // 70-100
        complexity_level: Math.floor(Math.random() * 5) + 3, // 3-8
        title: `Mock Learning Session ${i + 1}`,
        summary: `Generated mock data for testing e2e data flow`
      });
    }

    const data = { sessions, data: sessions };
    this.mockDataCache.set(cacheKey, data);
    return data;
  }

  /**
   * Generate mock crew stats
   */
  generateCrewStats(config: MockDataConfig = { componentName: 'CrewMemoryVisualization' }) {
    const cacheKey = 'crew-stats';
    if (this.mockDataCache.has(cacheKey)) {
      return this.mockDataCache.get(cacheKey);
    }

    const crewMembers = [
      { id: 'captain_picard', name: 'Captain Picard', role: 'Strategic Leadership' },
      { id: 'commander_data', name: 'Commander Data', role: 'Analytics & AI' },
      { id: 'geordi_la_forge', name: 'Geordi La Forge', role: 'Infrastructure' },
      { id: 'commander_riker', name: 'Commander Riker', role: 'Tactical Operations' },
      { id: 'lieutenant_worf', name: 'Lieutenant Worf', role: 'Security & Compliance' },
      { id: 'counselor_troi', name: 'Counselor Troi', role: 'User Experience' },
      { id: 'dr_crusher', name: 'Dr. Crusher', role: 'System Health' },
      { id: 'lieutenant_uhura', name: 'Lieutenant Uhura', role: 'Communications' },
      { id: 'quark', name: 'Quark', role: 'Business Intelligence' },
      { id: 'chief_obrien', name: 'Chief O\'Brien', role: 'Pragmatic Solutions' }
    ];

    const stats = crewMembers.map(member => ({
      name: member.name,
      role: member.role,
      contributions: Math.floor(Math.random() * 2000) + 1000,
      memories: Math.floor(Math.random() * 2000) + 1000,
      lastActive: this.randomLastActive(),
      icon: this.getCrewIcon(member.id),
      satisfaction: Math.floor(Math.random() * 30) + 70,
      concernLevel: Math.floor(Math.random() * 3)
    }));

    const data = { stats, totalMemories: stats.reduce((sum, s) => sum + s.memories, 0) };
    this.mockDataCache.set(cacheKey, data);
    return data;
  }

  /**
   * Generate mock project recommendations
   */
  generateProjectRecommendations(config: MockDataConfig = { componentName: 'RAGProjectRecommendations' }) {
    const cacheKey = `recommendations-${config.count || 5}`;
    if (this.mockDataCache.has(cacheKey)) {
      return this.mockDataCache.get(cacheKey);
    }

    const count = config.count || 5;
    const recommendations = [];

    const themes = ['gradient', 'monochromeBlue', 'cyberpunk', 'offworld', 'mochaEarth'];
    const types = ['ecommerce', 'healthcare', 'analytics', 'saas', 'portfolio'];

    for (let i = 0; i < count; i++) {
      recommendations.push({
        id: `rec-${i}`,
        title: `Recommended Project ${i + 1}`,
        description: `Mock recommendation based on crew analysis and RAG patterns`,
        theme: themes[Math.floor(Math.random() * themes.length)],
        projectType: types[Math.floor(Math.random() * types.length)],
        confidence: Math.floor(Math.random() * 30) + 70,
        tags: ['recommended', 'rag', 'mock'],
        reason: 'Generated for e2e data flow testing'
      });
    }

    const data = { recommendations, data: recommendations };
    this.mockDataCache.set(cacheKey, data);
    return data;
  }

  /**
   * Generate mock security assessment
   */
  generateSecurityData(config: MockDataConfig = { componentName: 'SecurityAssessmentDashboard' }) {
    const cacheKey = 'security-data';
    if (this.mockDataCache.has(cacheKey)) {
      return this.mockDataCache.get(cacheKey);
    }

    const data = {
      overallScore: Math.floor(Math.random() * 20) + 80, // 80-100
      vulnerabilities: [
        { id: 'vuln-1', severity: 'low', title: 'Mock vulnerability 1', status: 'resolved' },
        { id: 'vuln-2', severity: 'medium', title: 'Mock vulnerability 2', status: 'in-progress' }
      ],
      compliance: {
        gdpr: true,
        hipaa: false,
        soc2: true
      },
      lastScan: new Date().toISOString(),
      nextScan: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
    };

    this.mockDataCache.set(cacheKey, data);
    return { data, ...data };
  }

  /**
   * Generate mock cost optimization data
   */
  generateCostData(config: MockDataConfig = { componentName: 'CostOptimizationMonitor' }) {
    const cacheKey = 'cost-data';
    if (this.mockDataCache.has(cacheKey)) {
      return this.mockDataCache.get(cacheKey);
    }

    const data = {
      monthlyCost: Math.floor(Math.random() * 500) + 100,
      savings: Math.floor(Math.random() * 100) + 50,
      recommendations: [
        { id: 'rec-1', title: 'Optimize API calls', savings: 25, priority: 'high' },
        { id: 'rec-2', title: 'Cache frequently accessed data', savings: 15, priority: 'medium' }
      ],
      trends: Array.from({ length: 12 }, (_, i) => ({
        month: new Date(2024, i, 1).toLocaleDateString('en-US', { month: 'short' }),
        cost: Math.floor(Math.random() * 200) + 100
      }))
    };

    this.mockDataCache.set(cacheKey, data);
    return { data, ...data };
  }

  /**
   * Generate mock UX analytics
   */
  generateUXData(config: MockDataConfig = { componentName: 'UserExperienceAnalytics' }) {
    const cacheKey = 'ux-data';
    if (this.mockDataCache.has(cacheKey)) {
      return this.mockDataCache.get(cacheKey);
    }

    const data = {
      userSatisfaction: Math.floor(Math.random() * 20) + 80,
      metrics: {
        pageLoadTime: Math.floor(Math.random() * 500) + 500,
        bounceRate: Math.floor(Math.random() * 20) + 10,
        conversionRate: Math.floor(Math.random() * 10) + 5
      },
      feedback: [
        { id: 'fb-1', rating: 5, comment: 'Mock positive feedback', date: new Date().toISOString() },
        { id: 'fb-2', rating: 4, comment: 'Mock constructive feedback', date: new Date().toISOString() }
      ]
    };

    this.mockDataCache.set(cacheKey, data);
    return { data, ...data };
  }

  /**
   * Check if component should use mock data
   */
  shouldUseMockData(componentName: string, hasLiveData: boolean): boolean {
    // Use mock data if:
    // 1. Component doesn't have live data
    // 2. Environment variable MOCK_DATA is set to 'true'
    // 3. Component is in the mock data allowlist
    const useMock = process.env.NEXT_PUBLIC_USE_MOCK_DATA === 'true';
    const allowlist = [
      'LearningAnalyticsDashboard',
      'CrewMemoryVisualization',
      'RAGProjectRecommendations',
      'SecurityAssessmentDashboard',
      'CostOptimizationMonitor',
      'UserExperienceAnalytics'
    ];

    return (!hasLiveData && (useMock || allowlist.includes(componentName)));
  }

  /**
   * Get mock data for a component
   */
  getMockData(componentName: string, dataType?: string): any {
    switch (componentName) {
      case 'LearningAnalyticsDashboard':
        return this.generateLearningMetrics({ componentName });
      case 'CrewMemoryVisualization':
        return this.generateCrewStats({ componentName });
      case 'RAGProjectRecommendations':
        return this.generateProjectRecommendations({ componentName });
      case 'SecurityAssessmentDashboard':
        return this.generateSecurityData({ componentName });
      case 'CostOptimizationMonitor':
        return this.generateCostData({ componentName });
      case 'UserExperienceAnalytics':
        return this.generateUXData({ componentName });
      default:
        return { data: [], error: `No mock data generator for ${componentName}` };
    }
  }

  // Helper methods
  private randomCrewMember(): string {
    const members = ['captain_picard', 'commander_data', 'geordi_la_forge', 'commander_riker', 
                     'lieutenant_worf', 'counselor_troi', 'dr_crusher', 'lieutenant_uhura', 'quark', 'chief_obrien'];
    return members[Math.floor(Math.random() * members.length)];
  }

  private randomKnowledgeType(): string {
    const types = ['technical_knowledge', 'troubleshooting', 'architecture_decision', 'best_practice'];
    return types[Math.floor(Math.random() * types.length)];
  }

  private randomLastActive(): string {
    const options = ['Today', 'Yesterday', '2 days ago', 'This week'];
    return options[Math.floor(Math.random() * options.length)];
  }

  private getCrewIcon(memberId: string): string {
    const icons: Record<string, string> = {
      'captain_picard': '🎖️',
      'commander_data': '🤖',
      'geordi_la_forge': '🔧',
      'commander_riker': '⚡',
      'lieutenant_worf': '⚔️',
      'counselor_troi': '💭',
      'dr_crusher': '💊',
      'lieutenant_uhura': '📻',
      'quark': '💰',
      'chief_obrien': '🛠️'
    };
    return icons[memberId] || '👤';
  }
}

export const mockDataSystem = MockDataSystem.getInstance();

