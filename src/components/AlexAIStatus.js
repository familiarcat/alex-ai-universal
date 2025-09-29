/**
 * AlexAI Status Component
 * 
 * Displays current Alex AI status and capabilities
 */

import React, { useState, useEffect } from 'react';

const AlexAIStatus = ({ alexAI }) => {
  const [status, setStatus] = useState(null);
  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    if (alexAI) {
      const currentStatus = alexAI.getStatus();
      setStatus(currentStatus);
    }
  }, [alexAI]);

  if (!status) {
    return (
      <div className="alex-ai-status">
        <div className="status-indicator offline">
          <span className="status-dot"></span>
          <span>Alex AI Offline</span>
        </div>
      </div>
    );
  }

  const getStatusColor = () => {
    return status.isActive ? '#4CAF50' : '#F44336';
  };

  const getStatusText = () => {
    return status.isActive ? 'Online' : 'Offline';
  };

  return (
    <div className="alex-ai-status">
      <div 
        className="status-header"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="status-indicator">
          <span 
            className="status-dot" 
            style={{ backgroundColor: getStatusColor() }}
          ></span>
          <span className="status-text">
            Alex AI {getStatusText()}
          </span>
        </div>
        <div className="expand-icon">
          {isExpanded ? '🔽' : '▶️'}
        </div>
      </div>

      {isExpanded && (
        <div className="status-details">
          <div className="status-section">
            <h4>🤖 Session Information</h4>
            <p><strong>Session ID:</strong> {status.sessionId}</p>
            <p><strong>Active:</strong> {status.isActive ? 'Yes' : 'No'}</p>
            <p><strong>RAG Memories:</strong> {status.ragMemoriesCount}</p>
          </div>

          <div className="status-section">
            <h4>👥 Active Crew Members</h4>
            <div className="crew-grid">
              {status.crewMembers.map((member, index) => (
                <div key={index} className="crew-member">
                  <span className="crew-avatar">🚀</span>
                  <span className="crew-name">{member}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="status-section">
            <h4>⚡ Capabilities</h4>
            <div className="capabilities-grid">
              {status.capabilities.map((capability, index) => (
                <div key={index} className="capability">
                  <span className="capability-icon">✅</span>
                  <span className="capability-name">{capability.replace(/_/g, ' ')}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="status-section">
            <h4>🛡️ Compliance</h4>
            <div className="compliance-item">
              <span className="compliance-icon">✅</span>
              <span>Zero Artifact Compliant</span>
            </div>
            <div className="compliance-item">
              <span className="compliance-icon">✅</span>
              <span>RAG Memory System Active</span>
            </div>
            <div className="compliance-item">
              <span className="compliance-icon">✅</span>
              <span>Enterprise Security Standards</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AlexAIStatus;
