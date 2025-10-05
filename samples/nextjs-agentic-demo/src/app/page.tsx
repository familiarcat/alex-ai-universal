'use client';

import { useState, useEffect } from 'react';
import { alexAI, type AlexAIResponse, type SpellCheckResult } from '@/lib/alex-ai-integration';
import '@/styles/lcars.css';

export default function Home() {
  const [alexAIStatus, setAlexAIStatus] = useState<AlexAIResponse | null>(null);
  const [task, setTask] = useState('');
  const [response, setResponse] = useState<AlexAIResponse | null>(null);
  const [spellCheckText, setSpellCheckText] = useState('');
  const [spellCheckResults, setSpellCheckResults] = useState<SpellCheckResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    initializeAlexAI();
  }, []);

  const initializeAlexAI = async () => {
    setIsLoading(true);
    const result = await alexAI.initialize();
    setAlexAIStatus(result);
    setIsLoading(false);
  };

  const handleEngage = async () => {
    if (!task.trim()) return;
    
    setIsLoading(true);
    const result = await alexAI.engage(task);
    setResponse(result);
    setIsLoading(false);
  };

  const handleSpellCheck = async () => {
    if (!spellCheckText.trim()) return;
    
    const results = await alexAI.checkSpelling(spellCheckText);
    setSpellCheckResults(results);
  };

  const handleAddToDictionary = (word: string) => {
    alexAI.addToDictionary(word);
    // Re-check spelling after adding to dictionary
    handleSpellCheck();
  };

  const handleToggleSpellCheck = () => {
    const enabled = alexAI.toggleSpellCheck();
    setAlexAIStatus((prev: AlexAIResponse | null) => prev ? { ...prev, spellCheckEnabled: enabled } : null);
  };

  const handleDemonstrateZeroArtifact = async () => {
    setIsLoading(true);
    const result = await alexAI.demonstrateZeroArtifact();
    setResponse(result);
    setIsLoading(false);
  };

  return (
    <div className="lcars-theme min-h-screen p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="lcars-title">
            🛡️ Alex AI Universal - Next.js Agentic Demo
          </h1>
          <p className="lcars-subtitle">
            Hands-free development with Zero-Artifact Guarantee
          </p>
          
          {/* Alex AI Status */}
          {alexAIStatus && (
            <div className={`lcars-status ${
              alexAIStatus.success 
                ? 'lcars-status-active' 
                : 'lcars-status-error'
            }`}>
              <span className="mr-2">
                {alexAIStatus.success ? '🛡️' : '❌'}
              </span>
              {alexAIStatus.message}
            </div>
          )}
        </div>

        <div className="lcars-grid lcars-grid-2">
          {/* Alex AI Engagement */}
          <div className="lcars-panel">
            <div className="lcars-panel-header">
              🤖 Alex AI Engagement
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="lcars-data-label">
                  Development Task
                </label>
                <textarea
                  value={task}
                  onChange={(e) => setTask(e.target.value)}
                  placeholder="Describe what you need help with..."
                  className="lcars-textarea"
                  rows={3}
                />
              </div>
              
              <button
                onClick={handleEngage}
                disabled={isLoading || !task.trim()}
                className="lcars-button lcars-button-primary w-full"
              >
                {isLoading ? 'Processing...' : 'Engage Alex AI'}
              </button>

              <button
                onClick={handleDemonstrateZeroArtifact}
                disabled={isLoading}
                className="lcars-button lcars-button-success w-full"
              >
                🛡️ Demonstrate Zero-Artifact Guarantee
              </button>
            </div>

            {/* Response */}
            {response && (
              <div className="lcars-data-panel mt-6">
                <h3 className="lcars-data-label">Alex AI Response:</h3>
                <p className="lcars-text">{response.message}</p>
                
                {response.explanation && (
                  <p className="lcars-text text-sm">{response.explanation}</p>
                )}
                
                {response.suggestions && response.suggestions.length > 0 && (
                  <div className="mb-3">
                    <h4 className="lcars-data-label">Suggestions:</h4>
                    <ul className="list-disc list-inside lcars-text text-sm">
                      {response.suggestions.map((suggestion, index) => (
                        <li key={index}>{suggestion}</li>
                      ))}
                    </ul>
                  </div>
                )}
                
                {response.code && (
                  <div className="mb-3">
                    <h4 className="lcars-data-label">Code Example:</h4>
                    <pre className="lcars-code">
                      {response.code}
                    </pre>
                  </div>
                )}
                
                <p className="lcars-text text-xs">
                  Timestamp: {new Date(response.timestamp).toLocaleString()}
                </p>
              </div>
            )}
          </div>

          {/* Spell Check Demo */}
          <div className="lcars-panel">
            <div className="lcars-panel-header">
              <div className="flex items-center justify-between">
                <span>🔍 Spell Check Demo</span>
                <button
                  onClick={handleToggleSpellCheck}
                  className={`lcars-status ${
                    alexAIStatus?.spellCheckEnabled
                      ? 'lcars-status-active'
                      : 'lcars-status-error'
                  }`}
                >
                  {alexAIStatus?.spellCheckEnabled ? 'Enabled' : 'Disabled'}
                </button>
              </div>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="lcars-data-label">
                  Text to Check
                </label>
                <textarea
                  value={spellCheckText}
                  onChange={(e) => setSpellCheckText(e.target.value)}
                  placeholder="Type some text with intentional misspellings like 'helo world, I need help with teh code'"
                  className="lcars-textarea"
                  rows={4}
                />
              </div>
              
              <button
                onClick={handleSpellCheck}
                disabled={!spellCheckText.trim()}
                className="lcars-button lcars-button-secondary w-full"
              >
                Check Spelling
              </button>
            </div>

            {/* Spell Check Results */}
            {spellCheckResults.length > 0 && (
              <div className="mt-6">
                <h3 className="lcars-data-label">Spell Check Results:</h3>
                <div className="space-y-2">
                  {spellCheckResults.map((result, index) => (
                    <div key={index} className="lcars-spell-check-result">
                      <span className={`font-medium ${
                        result.highlighted ? 'lcars-spell-check-misspelled' : 'lcars-text'
                      }`}>
                        {result.word}
                      </span>
                      {result.highlighted && (
                        <div className="flex items-center space-x-2">
                          <span className="lcars-spell-check-suggestions">
                            Suggestions: {result.suggestions.join(', ')}
                          </span>
                          <button
                            onClick={() => handleAddToDictionary(result.word)}
                            className="lcars-button lcars-button-secondary text-xs"
                          >
                            Add to Dictionary
                          </button>
                        </div>
                      )}
                      {result.alexAIBranding && (
                        <span className="lcars-spell-check-branding">🛡️ Alex AI</span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Features Overview */}
        <div className="lcars-panel mt-12">
          <div className="lcars-panel-header">
            🎯 Alex AI Features Demonstrated
          </div>
          
          <div className="lcars-grid lcars-grid-4">
            <div className="text-center">
              <div className="text-3xl mb-2">🛡️</div>
              <h3 className="lcars-subtitle">Zero-Artifact Guarantee</h3>
              <p className="lcars-text text-sm">
                Alex AI provides assistance without creating any files or artifacts in your project
              </p>
            </div>
            
            <div className="text-center">
              <div className="text-3xl mb-2">🔍</div>
              <h3 className="lcars-subtitle">Real-time Spell Check</h3>
              <p className="lcars-text text-sm">
                Intelligent spell checking with Alex AI branding and custom dictionary support
              </p>
            </div>
            
            <div className="text-center">
              <div className="text-3xl mb-2">🏕️</div>
              <h3 className="lcars-subtitle">Boy Scout Principle</h3>
              <p className="lcars-text text-sm">
                Leave no trace, respect the environment, maintain clean development practices
              </p>
            </div>
            
            <div className="text-center">
              <div className="text-3xl mb-2">🤖</div>
              <h3 className="lcars-subtitle">Hands-free Development</h3>
              <p className="lcars-text text-sm">
                Agentic assistance that enhances your development workflow without interference
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="lcars-footer mt-12">
          <p className="mb-2">
            <strong>Alex AI Universal</strong> - The most helpful assistant framework
          </p>
          <p className="text-sm">
            &quot;Make it so!&quot; - Captain Picard | &quot;Resistance is futile!&quot; - The Borg (but not Alex AI)
          </p>
        </div>
      </div>
    </div>
  );
}