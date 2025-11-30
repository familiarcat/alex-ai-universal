/**
 * LCARS Library Terminal Component
 * 
 * Individual crew member interface for accessing the shared Library Computer
 * Each crew member has their own terminal with personalized knowledge access
 */

import React, { useState, useEffect } from 'react';
import SharedLibraryComputerSystem, {
  CrewMember,
  KnowledgeType,
  PriorityLevel,
  KnowledgeSearchResult,
  LCARSTerminalData
} from '../lib/shared-library-computer-system';

interface LCARSLibraryTerminalProps {
  crewMember: CrewMember;
  className?: string;
  onMemoryAdded?: (memoryId: string) => void;
  onSearchPerformed?: (results: KnowledgeSearchResult[]) => void;
}

const LCARSLibraryTerminal: React.FC<LCARSLibraryTerminalProps> = ({
  crewMember,
  className = '',
  onMemoryAdded,
  onSearchPerformed
}) => {
  const [librarySystem] = useState(() => new SharedLibraryComputerSystem());
  const [terminalData, setTerminalData] = useState<LCARSTerminalData | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<KnowledgeSearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [activeTab, setActiveTab] = useState<'search' | 'add' | 'recent' | 'insights'>('search');
  
  // Add memory form state
  const [newMemory, setNewMemory] = useState({
    title: '',
    summary: '',
    detailedAnalysis: '',
    keyFindings: '',
    conclusions: '',
    recommendations: '',
    tags: '',
    knowledgeType: KnowledgeType.TECHNICAL_ANALYSIS,
    priority: PriorityLevel.MEDIUM
  });

  useEffect(() => {
    // Initialize terminal data
    const data = librarySystem.getLCARSTerminalInterface(crewMember);
    setTerminalData(data);

    // Set up event listeners
    librarySystem.on('memoryAdded', () => {
      const updatedData = librarySystem.getLCARSTerminalInterface(crewMember);
      setTerminalData(updatedData);
    });

    librarySystem.on('memoryValidated', () => {
      const updatedData = librarySystem.getLCARSTerminalInterface(crewMember);
      setTerminalData(updatedData);
    });

  }, [crewMember, librarySystem]);

  const getCrewMemberInfo = (member: CrewMember) => {
    const crewInfo = {
      [CrewMember.PICARD]: { name: 'Captain Jean-Luc Picard', role: 'Strategic Commander', color: 'text-blue-400' },
      [CrewMember.RIKER]: { name: 'Commander William Riker', role: 'First Officer', color: 'text-green-400' },
      [CrewMember.DATA]: { name: 'Commander Data', role: 'Operations Officer', color: 'text-yellow-400' },
      [CrewMember.LA_FORGE]: { name: 'Lt. Cmdr. Geordi La Forge', role: 'Chief Engineer', color: 'text-orange-400' },
      [CrewMember.WORF]: { name: 'Lieutenant Worf', role: 'Security Officer', color: 'text-red-400' },
      [CrewMember.TROI]: { name: 'Counselor Deanna Troi', role: 'Ship\'s Counselor', color: 'text-purple-400' },
      [CrewMember.CRUSHER]: { name: 'Dr. Beverly Crusher', role: 'Chief Medical Officer', color: 'text-cyan-400' },
      [CrewMember.UHURA]: { name: 'Lieutenant Uhura', role: 'Communications Officer', color: 'text-pink-400' },
      [CrewMember.QUARK]: { name: 'Quark', role: 'Business Operations', color: 'text-lime-400' }
    };
    return crewInfo[member];
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;

    setIsSearching(true);
    try {
      const results = await librarySystem.searchCrewMemories({
        query: searchQuery,
        maxResults: 10,
        similarityThreshold: 0.7
      });
      
      setSearchResults(results);
      onSearchPerformed?.(results);
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setIsSearching(false);
    }
  };

  const handleAddMemory = async () => {
    if (!newMemory.title.trim() || !newMemory.summary.trim()) return;

    try {
      const memoryId = await librarySystem.addCrewMemory(
        crewMember,
        newMemory.knowledgeType,
        newMemory.title,
        newMemory.summary,
        newMemory.detailedAnalysis,
        newMemory.keyFindings.split('\n').filter(f => f.trim()),
        newMemory.conclusions.split('\n').filter(f => f.trim()),
        newMemory.recommendations.split('\n').filter(f => f.trim()),
        newMemory.tags.split(',').map(t => t.trim()).filter(t => t),
        newMemory.priority
      );

      // Reset form
      setNewMemory({
        title: '',
        summary: '',
        detailedAnalysis: '',
        keyFindings: '',
        conclusions: '',
        recommendations: '',
        tags: '',
        knowledgeType: KnowledgeType.TECHNICAL_ANALYSIS,
        priority: PriorityLevel.MEDIUM
      });

      onMemoryAdded?.(memoryId);
      setActiveTab('recent');
    } catch (error) {
      console.error('Error adding memory:', error);
    }
  };

  const crewInfo = getCrewMemberInfo(crewMember);

  if (!terminalData) {
    return (
      <div className="lcars-terminal-loading bg-gray-900 border border-blue-400 p-4">
        <div className="text-blue-400 font-mono">Initializing LCARS Library Terminal...</div>
      </div>
    );
  }

  return (
    <div className={`lcars-library-terminal bg-gray-900 border border-blue-400 ${className}`}>
      {/* Header */}
      <div className="lcars-header bg-gray-800 border-b border-blue-400 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-3 h-3 bg-blue-400 rounded-full animate-pulse"></div>
            <h2 className={`text-lg font-mono ${crewInfo.color}`}>
              LCARS LIBRARY TERMINAL - {crewInfo.name.toUpperCase()}
            </h2>
          </div>
          <div className="text-sm text-gray-400 font-mono">
            {crewInfo.role} | {terminalData.totalEntries} Memories
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="lcars-nav bg-gray-800 border-b border-blue-400">
        <div className="flex space-x-1 p-2">
          {[
            { key: 'search', label: 'SEARCH', icon: '🔍' },
            { key: 'add', label: 'ADD MEMORY', icon: '➕' },
            { key: 'recent', label: 'RECENT', icon: '📋' },
            { key: 'insights', label: 'INSIGHTS', icon: '🧠' }
          ].map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as any)}
              className={`px-4 py-2 font-mono text-sm border transition-colors ${
                activeTab === tab.key
                  ? 'bg-blue-600 text-white border-blue-400'
                  : 'bg-gray-700 text-gray-300 border-gray-600 hover:bg-gray-600'
              }`}
            >
              {tab.icon} {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Main Content */}
      <div className="lcars-content p-4 max-h-96 overflow-y-auto">
        
        {/* Search Tab */}
        {activeTab === 'search' && (
          <div className="space-y-4">
            <div className="lcars-search-panel bg-gray-800 border border-blue-400 p-4">
              <h3 className="text-blue-400 font-mono text-sm mb-3">KNOWLEDGE SEARCH</h3>
              
              <div className="flex space-x-2 mb-3">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                  placeholder="Search crew memories..."
                  className="flex-1 bg-gray-700 text-white border border-gray-600 px-3 py-2 font-mono text-sm focus:border-blue-400 focus:outline-none"
                />
                <button
                  onClick={handleSearch}
                  disabled={isSearching}
                  className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 font-mono text-sm border border-blue-400 disabled:opacity-50"
                >
                  {isSearching ? 'SEARCHING...' : 'SEARCH'}
                </button>
              </div>

              {/* Search Suggestions */}
              <div className="text-xs text-gray-400 mb-2">Suggestions:</div>
              <div className="flex flex-wrap gap-2">
                {terminalData.searchSuggestions.map((suggestion, index) => (
                  <button
                    key={index}
                    onClick={() => setSearchQuery(suggestion.replace('Search for ', ''))}
                    className="bg-gray-700 hover:bg-gray-600 text-gray-300 px-2 py-1 text-xs font-mono border border-gray-600"
                  >
                    {suggestion.replace('Search for ', '')}
                  </button>
                ))}
              </div>
            </div>

            {/* Search Results */}
            {searchResults.length > 0 && (
              <div className="lcars-search-results">
                <h3 className="text-blue-400 font-mono text-sm mb-3">
                  SEARCH RESULTS ({searchResults.length})
                </h3>
                <div className="space-y-3">
                  {searchResults.map((result, index) => (
                    <div key={index} className="bg-gray-800 border border-gray-600 p-3">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="text-white font-mono text-sm">{result.entry.title}</h4>
                        <div className="flex items-center space-x-2">
                          <span className="text-xs text-gray-400">
                            {getCrewMemberInfo(result.entry.crewMember).name}
                          </span>
                          <span className="text-xs text-green-400">
                            {Math.round(result.similarity * 100)}% match
                          </span>
                        </div>
                      </div>
                      <p className="text-gray-300 text-sm mb-2">{result.entry.summary}</p>
                      <div className="flex items-center justify-between text-xs">
                        <div className="flex items-center space-x-3">
                          <span className="text-blue-400">{result.entry.knowledgeType.replace('_', ' ')}</span>
                          <span className="text-yellow-400">{result.entry.priority}</span>
                          <span className="text-purple-400">{result.entry.confidenceLevel}% confidence</span>
                        </div>
                        <div className="text-gray-400">
                          {result.entry.validatedBy.length} validations
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Add Memory Tab */}
        {activeTab === 'add' && (
          <div className="lcars-add-memory bg-gray-800 border border-blue-400 p-4">
            <h3 className="text-blue-400 font-mono text-sm mb-4">ADD CREW MEMORY</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-gray-300 text-sm font-mono mb-1">Title</label>
                <input
                  type="text"
                  value={newMemory.title}
                  onChange={(e) => setNewMemory({...newMemory, title: e.target.value})}
                  className="w-full bg-gray-700 text-white border border-gray-600 px-3 py-2 font-mono text-sm focus:border-blue-400 focus:outline-none"
                  placeholder="Memory title..."
                />
              </div>

              <div>
                <label className="block text-gray-300 text-sm font-mono mb-1">Summary</label>
                <textarea
                  value={newMemory.summary}
                  onChange={(e) => setNewMemory({...newMemory, summary: e.target.value})}
                  className="w-full bg-gray-700 text-white border border-gray-600 px-3 py-2 font-mono text-sm focus:border-blue-400 focus:outline-none h-20"
                  placeholder="Brief summary of findings..."
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-300 text-sm font-mono mb-1">Knowledge Type</label>
                  <select
                    value={newMemory.knowledgeType}
                    onChange={(e) => setNewMemory({...newMemory, knowledgeType: e.target.value as KnowledgeType})}
                    className="w-full bg-gray-700 text-white border border-gray-600 px-3 py-2 font-mono text-sm focus:border-blue-400 focus:outline-none"
                  >
                    {Object.values(KnowledgeType).map(type => (
                      <option key={type} value={type}>
                        {type.replace('_', ' ').toUpperCase()}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-gray-300 text-sm font-mono mb-1">Priority</label>
                  <select
                    value={newMemory.priority}
                    onChange={(e) => setNewMemory({...newMemory, priority: e.target.value as PriorityLevel})}
                    className="w-full bg-gray-700 text-white border border-gray-600 px-3 py-2 font-mono text-sm focus:border-blue-400 focus:outline-none"
                  >
                    {Object.values(PriorityLevel).map(priority => (
                      <option key={priority} value={priority}>
                        {priority.toUpperCase()}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-gray-300 text-sm font-mono mb-1">Detailed Analysis</label>
                <textarea
                  value={newMemory.detailedAnalysis}
                  onChange={(e) => setNewMemory({...newMemory, detailedAnalysis: e.target.value})}
                  className="w-full bg-gray-700 text-white border border-gray-600 px-3 py-2 font-mono text-sm focus:border-blue-400 focus:outline-none h-24"
                  placeholder="Detailed analysis and findings..."
                />
              </div>

              <div>
                <label className="block text-gray-300 text-sm font-mono mb-1">Key Findings (one per line)</label>
                <textarea
                  value={newMemory.keyFindings}
                  onChange={(e) => setNewMemory({...newMemory, keyFindings: e.target.value})}
                  className="w-full bg-gray-700 text-white border border-gray-600 px-3 py-2 font-mono text-sm focus:border-blue-400 focus:outline-none h-20"
                  placeholder="Key finding 1&#10;Key finding 2&#10;..."
                />
              </div>

              <div>
                <label className="block text-gray-300 text-sm font-mono mb-1">Conclusions (one per line)</label>
                <textarea
                  value={newMemory.conclusions}
                  onChange={(e) => setNewMemory({...newMemory, conclusions: e.target.value})}
                  className="w-full bg-gray-700 text-white border border-gray-600 px-3 py-2 font-mono text-sm focus:border-blue-400 focus:outline-none h-20"
                  placeholder="Conclusion 1&#10;Conclusion 2&#10;..."
                />
              </div>

              <div>
                <label className="block text-gray-300 text-sm font-mono mb-1">Recommendations (one per line)</label>
                <textarea
                  value={newMemory.recommendations}
                  onChange={(e) => setNewMemory({...newMemory, recommendations: e.target.value})}
                  className="w-full bg-gray-700 text-white border border-gray-600 px-3 py-2 font-mono text-sm focus:border-blue-400 focus:outline-none h-20"
                  placeholder="Recommendation 1&#10;Recommendation 2&#10;..."
                />
              </div>

              <div>
                <label className="block text-gray-300 text-sm font-mono mb-1">Tags (comma-separated)</label>
                <input
                  type="text"
                  value={newMemory.tags}
                  onChange={(e) => setNewMemory({...newMemory, tags: e.target.value})}
                  className="w-full bg-gray-700 text-white border border-gray-600 px-3 py-2 font-mono text-sm focus:border-blue-400 focus:outline-none"
                  placeholder="tag1, tag2, tag3..."
                />
              </div>

              <button
                onClick={handleAddMemory}
                className="w-full bg-blue-600 hover:bg-blue-500 text-white py-2 font-mono text-sm border border-blue-400"
              >
                ADD TO LIBRARY COMPUTER
              </button>
            </div>
          </div>
        )}

        {/* Recent Tab */}
        {activeTab === 'recent' && (
          <div className="lcars-recent-memories">
            <h3 className="text-blue-400 font-mono text-sm mb-4">RECENT MEMORIES</h3>
            
            <div className="space-y-3">
              {terminalData.recentEntries.map((entry, index) => (
                <div key={index} className="bg-gray-800 border border-gray-600 p-3">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-white font-mono text-sm">{entry.title}</h4>
                    <span className="text-xs text-gray-400">
                      {new Date(entry.timestamp).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-gray-300 text-sm mb-2">{entry.summary}</p>
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center space-x-3">
                      <span className="text-blue-400">{entry.knowledgeType.replace('_', ' ')}</span>
                      <span className="text-yellow-400">{entry.priority}</span>
                      <span className="text-purple-400">{entry.confidenceLevel}% confidence</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-green-400">{entry.validatedBy.length} validations</span>
                      <span className="text-gray-400">{entry.accessCount} accesses</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Insights Tab */}
        {activeTab === 'insights' && (
          <div className="lcars-insights">
            <h3 className="text-blue-400 font-mono text-sm mb-4">COLLECTIVE INTELLIGENCE INSIGHTS</h3>
            
            <div className="space-y-4">
              <div className="bg-gray-800 border border-blue-400 p-4">
                <h4 className="text-white font-mono text-sm mb-2">YOUR EXPERTISE AREAS</h4>
                <div className="flex flex-wrap gap-2">
                  {terminalData.expertiseAreas.map((area, index) => (
                    <span key={index} className="bg-blue-600 text-white px-2 py-1 text-xs font-mono">
                      {area.replace('_', ' ')}
                    </span>
                  ))}
                </div>
              </div>

              <div className="bg-gray-800 border border-green-400 p-4">
                <h4 className="text-white font-mono text-sm mb-2">KNOWLEDGE STATISTICS</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-400">Total Memories:</span>
                    <span className="text-white ml-2">{terminalData.knowledgeStats.totalEntries}</span>
                  </div>
                  <div>
                    <span className="text-gray-400">Avg Confidence:</span>
                    <span className="text-white ml-2">{Math.round(terminalData.knowledgeStats.averageConfidence)}%</span>
                  </div>
                  <div>
                    <span className="text-gray-400">Recent Activity:</span>
                    <span className="text-white ml-2">{terminalData.knowledgeStats.recentActivity} this week</span>
                  </div>
                  <div>
                    <span className="text-gray-400">Prime Directive:</span>
                    <span className="text-green-400 ml-2">COMPLIANT</span>
                  </div>
                </div>
              </div>

              <div className="bg-gray-800 border border-purple-400 p-4">
                <h4 className="text-white font-mono text-sm mb-2">RELATED MEMORIES</h4>
                <div className="space-y-2">
                  {terminalData.relatedMemories.slice(0, 3).map((memory, index) => (
                    <div key={index} className="text-sm">
                      <div className="text-white font-mono">{memory.title}</div>
                      <div className="text-gray-400 text-xs">
                        by {getCrewMemberInfo(memory.crewMember).name}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default LCARSLibraryTerminal;

