import CrewGrid from '@/components/CrewGrid'
import { ContrastText, ContrastCard } from '@/components/ContrastAware'

export default function Dashboard() {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-4xl font-bold text-theme-accent mb-4">
          🖖 Alex AI Universal Dashboard
        </h1>
        <p className="text-xl text-theme-enhancements mb-2">
          Enhanced Interactive Dashboard with Crew Intelligence
        </p>
        <p className="text-lg text-theme-enhancements">
          Advanced control panel with crew intelligence monitoring and real-time updates
        </p>
        <div className="mt-4 inline-block contrast-button variant-role">
          <ContrastText variant="component">DEVELOPMENT MODE - ENHANCED DASHBOARD READY! 🚀</ContrastText>
        </div>
      </div>

      {/* Main Features Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <ContrastCard variant="elevated">
          <div className="text-3xl mb-3">🚀</div>
          <h3 className="text-xl font-bold text-theme-accent mb-2">Enhanced Dashboard</h3>
          <p className="text-theme-enhancements">
            Advanced control panel with real-time monitoring and crew intelligence integration.
          </p>
        </ContrastCard>

        <ContrastCard variant="elevated">
          <div className="text-3xl mb-3">👥</div>
          <h3 className="text-xl font-bold text-theme-accent mb-2">Crew Integration</h3>
          <p className="text-theme-enhancements">
            Full integration with Alex AI crew members for specialized task execution and analysis.
          </p>
        </ContrastCard>

        <ContrastCard variant="elevated">
          <div className="text-3xl mb-3">⚡</div>
          <h3 className="text-xl font-bold text-theme-accent mb-2">Real-time Updates</h3>
          <p className="text-theme-enhancements">
            Live synchronization across all connected clients with WebSocket technology.
          </p>
        </ContrastCard>

        <ContrastCard variant="elevated">
          <div className="text-3xl mb-3">🧠</div>
          <h3 className="text-xl font-bold text-theme-accent mb-2">RAG Memory</h3>
          <p className="text-theme-enhancements">
            Advanced retrieval-augmented generation system for intelligent knowledge management.
          </p>
        </ContrastCard>
      </div>

      {/* Crew Grid */}
      <div>
        <h2 className="text-3xl font-bold mb-6 text-center text-theme-accent">
          🖖 Alex AI Crew Status
        </h2>
        <CrewGrid />
      </div>

      {/* System Status */}
      <ContrastCard variant="elevated">
        <h3 className="text-2xl font-bold mb-4 text-theme-accent">🔧 System Status</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-theme-role">Online</div>
            <div className="text-theme-enhancements">Server Status</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-theme-accent">9</div>
            <div className="text-theme-enhancements">Crew Members</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-theme-component">Real-time</div>
            <div className="text-theme-enhancements">Updates</div>
          </div>
        </div>
      </ContrastCard>
    </div>
  )
}