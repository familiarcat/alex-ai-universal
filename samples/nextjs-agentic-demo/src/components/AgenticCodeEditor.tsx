'use client';

import { useState, useEffect, useCallback } from 'react';
import { alexAI, type SpellCheckResult } from '@/lib/alex-ai-integration';
import '@/styles/lcars.css';

interface AgenticCodeEditorProps {
  initialCode?: string;
  onCodeChange?: (code: string) => void;
}

export default function AgenticCodeEditor({ 
  initialCode = '', 
  onCodeChange 
}: AgenticCodeEditorProps) {
  const [code, setCode] = useState(initialCode);
  const [spellCheckResults, setSpellCheckResults] = useState<SpellCheckResult[]>([]);
  const [isSpellChecking, setIsSpellChecking] = useState(false);
  const [alexAIStatus, setAlexAIStatus] = useState<{ success: boolean; message: string } | null>(null);

  const handleSpellCheck = useCallback(async () => {
    if (!code.trim()) return;
    
    setIsSpellChecking(true);
    const results = await alexAI.checkSpelling(code);
    setSpellCheckResults(results);
    setIsSpellChecking(false);
  }, [code]);

  useEffect(() => {
    // Initialize Alex AI
    alexAI.initialize().then(setAlexAIStatus);
  }, []);

  useEffect(() => {
    // Spell check on code change
    if (code.trim()) {
      handleSpellCheck();
    } else {
      setSpellCheckResults([]);
    }
  }, [code, handleSpellCheck]);

  useEffect(() => {
    // Notify parent of code changes
    onCodeChange?.(code);
  }, [code, onCodeChange]);

  const handleCodeChange = (newCode: string) => {
    setCode(newCode);
  };

  const handleAddToDictionary = (word: string) => {
    alexAI.addToDictionary(word);
    // Re-check spelling after adding to dictionary
    handleSpellCheck();
  };


  const getMisspelledWords = () => {
    return spellCheckResults.filter(result => result.highlighted);
  };

  return (
    <div className="space-y-4">
      {/* Editor Header */}
      <div className="flex items-center justify-between">
        <h3 className="lcars-subtitle">
          🛡️ Alex AI Agentic Code Editor
        </h3>
        <div className="flex items-center space-x-2">
          {isSpellChecking && (
            <div className="lcars-status lcars-status-info">🔍 Checking spelling...</div>
          )}
          {alexAIStatus?.success && (
            <div className="lcars-status lcars-status-active">🛡️ Alex AI Active</div>
          )}
        </div>
      </div>

      {/* Code Editor */}
      <div className="relative">
        <textarea
          value={code}
          onChange={(e) => handleCodeChange(e.target.value)}
          placeholder="// Type your code here... Alex AI will provide real-time spell checking and assistance
// Try typing: helo world, I need help with teh code"
          className="lcars-textarea h-64 resize-none"
          style={{ lineHeight: '1.5' }}
        />
        
        {/* Spell Check Overlay */}
        {getMisspelledWords().length > 0 && (
          <div className="absolute top-2 right-2 lcars-status lcars-status-error">
            {getMisspelledWords().length} misspelled word{getMisspelledWords().length > 1 ? 's' : ''}
          </div>
        )}
      </div>

      {/* Spell Check Results */}
      {getMisspelledWords().length > 0 && (
        <div className="lcars-data-panel">
          <h4 className="lcars-data-label">
            🔍 Misspelled Words Detected
          </h4>
          <div className="space-y-2">
            {getMisspelledWords().map((result, index) => (
              <div key={index} className="lcars-spell-check-result">
                <div className="flex items-center space-x-2">
                  <span className="lcars-spell-check-misspelled">{result.word}</span>
                  <span className="lcars-spell-check-suggestions">
                    → {result.suggestions.join(', ')}
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => handleAddToDictionary(result.word)}
                    className="lcars-button lcars-button-secondary text-xs"
                  >
                    Add to Dictionary
                  </button>
                  <span className="lcars-spell-check-branding">🛡️ Alex AI</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Alex AI Assistance */}
      <div className="lcars-data-panel">
        <h4 className="lcars-data-label">
          🤖 Alex AI Assistance
        </h4>
        <div className="lcars-text text-sm space-y-1">
          <p>• Real-time spell checking with Alex AI branding</p>
          <p>• Zero-Artifact Guarantee: No files created in your project</p>
          <p>• Boy Scout Principle: Leave no trace, respect the environment</p>
          <p>• Hands-free development: Assistance without interference</p>
        </div>
      </div>

      {/* Code Statistics */}
      <div className="lcars-data-panel">
        <h4 className="lcars-data-label">📊 Code Statistics</h4>
        <div className="lcars-grid lcars-grid-4 text-sm">
          <div>
            <span className="lcars-text">Lines:</span>
            <span className="ml-1 lcars-data-value">{code.split('\n').length}</span>
          </div>
          <div>
            <span className="lcars-text">Characters:</span>
            <span className="ml-1 lcars-data-value">{code.length}</span>
          </div>
          <div>
            <span className="lcars-text">Words:</span>
            <span className="ml-1 lcars-data-value">{code.split(/\s+/).filter(w => w.length > 0).length}</span>
          </div>
          <div>
            <span className="lcars-text">Misspelled:</span>
            <span className="ml-1 lcars-data-value lcars-spell-check-misspelled">{getMisspelledWords().length}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
