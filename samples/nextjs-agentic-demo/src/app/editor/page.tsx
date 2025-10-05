'use client';

import { useState } from 'react';
import AgenticCodeEditor from '@/components/AgenticCodeEditor';
import '@/styles/lcars.css';

export default function EditorPage() {
  const [code, setCode] = useState(`// Alex AI Agentic Code Editor Demo
// Try typing some misspelled words like: helo world, recieve, teh, alot

import React from 'react';

interface Props {
  title: string;
  children: React.ReactNode;
}

export const ExampleComponent: React.FC<Props> = ({ title, children }) => {
  return (
    <div className="p-4 border rounded-lg">
      <h2 className="text-xl font-bold mb-2">{title}</h2>
      {children}
    </div>
  );
};

// Alex AI will provide real-time spell checking
// and assistance without creating any artifacts`);

  const handleCodeChange = (newCode: string) => {
    setCode(newCode);
  };

  return (
    <div className="lcars-theme min-h-screen p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="lcars-title">
            🛡️ Alex AI Agentic Code Editor
          </h1>
          <p className="lcars-subtitle">
            Hands-free development with real-time spell checking and Zero-Artifact Guarantee
          </p>
          
          <div className="inline-flex items-center space-x-4 text-sm">
            <div className="lcars-status lcars-status-active">
              <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
              Alex AI Active
            </div>
            <div className="lcars-status lcars-status-info">
              <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
              Spell Check Enabled
            </div>
            <div className="lcars-status lcars-status-warning">
              <span className="w-2 h-2 bg-purple-500 rounded-full mr-2"></span>
              Zero-Artifact Guarantee
            </div>
          </div>
        </div>

        {/* Main Editor */}
        <div className="lcars-panel">
          <AgenticCodeEditor
            initialCode={code}
            onCodeChange={handleCodeChange}
          />
        </div>

        {/* Features Grid */}
        <div className="lcars-panel mt-12">
          <div className="lcars-panel-header">
            🎯 Alex AI Features Demonstrated
          </div>
          
          <div className="lcars-grid lcars-grid-3">
            {/* Real-time Spell Check */}
            <div className="text-center">
              <div className="text-4xl mb-4">🔍</div>
              <h3 className="lcars-subtitle">
                Real-time Spell Check
              </h3>
              <p className="lcars-text text-sm">
                Intelligent spell checking with Alex AI branding, custom dictionary support, 
                and context-aware suggestions for technical terms.
              </p>
            </div>

            {/* Zero-Artifact Guarantee */}
            <div className="text-center">
              <div className="text-4xl mb-4">🛡️</div>
              <h3 className="lcars-subtitle">
                Zero-Artifact Guarantee
              </h3>
              <p className="lcars-text text-sm">
                Alex AI provides assistance without creating any files, directories, 
                or temporary artifacts in your project directory.
              </p>
            </div>

            {/* Boy Scout Principle */}
            <div className="text-center">
              <div className="text-4xl mb-4">🏕️</div>
              <h3 className="lcars-subtitle">
                Boy Scout Principle
              </h3>
              <p className="lcars-text text-sm">
                Leave no trace, respect the environment, and maintain clean 
                development practices with complete environmental respect.
              </p>
            </div>

            {/* Hands-free Development */}
            <div className="text-center">
              <div className="text-4xl mb-4">🤖</div>
              <h3 className="lcars-subtitle">
                Hands-free Development
              </h3>
              <p className="lcars-text text-sm">
                Agentic assistance that enhances your development workflow 
                without interference or disruption to your existing process.
              </p>
            </div>

            {/* Educational Value */}
            <div className="text-center">
              <div className="text-4xl mb-4">📚</div>
              <h3 className="lcars-subtitle">
                Educational Value
              </h3>
              <p className="lcars-text text-sm">
                Learn while you code with clear explanations, suggestions, 
                and educational content that improves your development skills.
              </p>
            </div>

            {/* Performance Optimized */}
            <div className="text-center">
              <div className="text-4xl mb-4">⚡</div>
              <h3 className="lcars-subtitle">
                Performance Optimized
              </h3>
              <p className="lcars-text text-sm">
                Minimal overhead with maximum assistance, ensuring your 
                development environment remains fast and responsive.
              </p>
            </div>
          </div>
        </div>

        {/* Code Examples */}
        <div className="lcars-panel mt-12">
          <div className="lcars-panel-header">
            💡 Try These Examples
          </div>
          
          <div className="lcars-grid lcars-grid-2">
            <div>
              <h3 className="lcars-data-label">Misspelled Words to Try:</h3>
              <div className="space-y-2 text-sm">
                <div className="lcars-data-panel">
                  <code className="lcars-spell-check-misspelled">helo world</code> → <code className="lcars-text">hello world</code>
                </div>
                <div className="lcars-data-panel">
                  <code className="lcars-spell-check-misspelled">recieve data</code> → <code className="lcars-text">receive data</code>
                </div>
                <div className="lcars-data-panel">
                  <code className="lcars-spell-check-misspelled">teh function</code> → <code className="lcars-text">the function</code>
                </div>
                <div className="lcars-data-panel">
                  <code className="lcars-spell-check-misspelled">alot of code</code> → <code className="lcars-text">a lot of code</code>
                </div>
              </div>
            </div>
            
            <div>
              <h3 className="lcars-data-label">Technical Terms (Recognized):</h3>
              <div className="space-y-2 text-sm">
                <div className="lcars-data-panel">
                  <code className="lcars-text">alex-ai</code> ✅ Recognized
                </div>
                <div className="lcars-data-panel">
                  <code className="lcars-text">typescript</code> ✅ Recognized
                </div>
                <div className="lcars-data-panel">
                  <code className="lcars-text">react</code> ✅ Recognized
                </div>
                <div className="lcars-data-panel">
                  <code className="lcars-text">nextjs</code> ✅ Recognized
                </div>
              </div>
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
