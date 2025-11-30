#!/usr/bin/env node
/**
 * Cursor AI Auto-Activation System
 * 
 * Automatically detects when to activate Alex AI in Cursor AI Chat
 * and provides activation prompts when appropriate
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Activation trigger patterns
const AUTO_ACTIVATION_TRIGGERS = {
  crewMentions: [
    'picard', 'riker', 'data', 'la forge', 'geordi', 'worf', 'troi', 'crusher',
    'uhura', 'quark', 'obrien', 'crew member', 'star trek', 'enterprise'
  ],
  alexAIFeatures: [
    'alex ai', 'alex-ai', 'n8n', 'supabase', 'memory storage', 'workflow',
    'milestone push', 'cost analysis', 'litmus test', 'crew coordination',
    'observation lounge', 'rag system', 'vector memory'
  ],
  technicalComplexity: [
    'optimize', 'architecture', 'refactor', 'security analysis',
    'performance', 'scalability', 'best practices', 'code review'
  ],
  businessQuestions: [
    'cost', 'budget', 'roi', 'efficiency', 'business', 'profit',
    'optimization', 'savings', 'expense'
  ]
};

// Activation prompt phrases
const ACTIVATION_PROMPTS = [
  '🖖 Activate Alex AI',
  'Activate Alex AI',
  'Engage Alex AI',
  'Start Alex AI',
  'Alex AI, activate',
  'Initialize Alex AI',
  'Begin Alex AI'
];

// Check if message should trigger auto-activation
function shouldAutoActivate(message) {
  const lowerMessage = message.toLowerCase();
  
  // Check for explicit activation prompts
  if (ACTIVATION_PROMPTS.some(prompt => lowerMessage.includes(prompt.toLowerCase()))) {
    return { activate: true, reason: 'explicit_activation' };
  }
  
  // Check for crew mentions
  if (AUTO_ACTIVATION_TRIGGERS.crewMentions.some(trigger => lowerMessage.includes(trigger))) {
    return { activate: true, reason: 'crew_mention' };
  }
  
  // Check for Alex AI features
  if (AUTO_ACTIVATION_TRIGGERS.alexAIFeatures.some(trigger => lowerMessage.includes(trigger))) {
    return { activate: true, reason: 'alex_ai_feature' };
  }
  
  // Check for complex technical questions
  if (AUTO_ACTIVATION_TRIGGERS.technicalComplexity.some(trigger => lowerMessage.includes(trigger))) {
    return { activate: true, reason: 'technical_complexity', suggest: true };
  }
  
  // Check for business questions
  if (AUTO_ACTIVATION_TRIGGERS.businessQuestions.some(trigger => lowerMessage.includes(trigger))) {
    return { activate: true, reason: 'business_question', suggest: true };
  }
  
  return { activate: false };
}

// Generate activation suggestion
function generateActivationSuggestion(message, reason) {
  const suggestions = {
    technical_complexity: 'This question might benefit from Alex AI crew coordination. Would you like me to activate Alex AI for a comprehensive analysis?',
    business_question: 'This business question would benefit from Quark\'s cost analysis expertise. Activate Alex AI?',
    crew_mention: 'Crew member mentioned! Activating Alex AI for crew coordination...',
    alex_ai_feature: 'Alex AI feature requested! Activating now...',
    explicit_activation: 'Activating Alex AI...'
  };
  
  return suggestions[reason] || 'Would you like to activate Alex AI for enhanced assistance?';
}

// Activate Alex AI
function activateAlexAI(message) {
  try {
    // Route to Alex AI CLI
    const response = execSync(`npx alex-ai chat "${message}"`, {
      encoding: 'utf8',
      cwd: process.cwd(),
      timeout: 30000
    });
    
    return {
      success: true,
      response: response,
      activated: true
    };
  } catch (error) {
    // If CLI fails, provide inline response
    return {
      success: false,
      response: `Alex AI CLI could not be invoked: ${error.message}. However, I can provide Alex AI-style assistance inline.`,
      activated: false
    };
  }
}

// Main handler for Cursor AI chat
function handleCursorChat(userMessage) {
  const activationCheck = shouldAutoActivate(userMessage);
  
  if (activationCheck.activate) {
    // Auto-activate
    console.log(`🖖 Auto-activating Alex AI (reason: ${activationCheck.reason})`);
    const result = activateAlexAI(userMessage);
    
    if (result.success) {
      return {
        response: result.response,
        activated: true,
        reason: activationCheck.reason
      };
    } else {
      // Fallback to inline response with Alex AI reasoning
      return {
        response: `${result.response}\n\n[Alex AI Mode: Active]\n${generateAlexAIResponse(userMessage)}`,
        activated: true,
        reason: activationCheck.reason,
        fallback: true
      };
    }
  } else if (activationCheck.suggest) {
    // Suggest activation
    return {
      response: generateActivationSuggestion(userMessage, activationCheck.reason),
      activated: false,
      suggest: true
    };
  } else {
    // Normal response, but check if we should suggest Alex AI
    const shouldSuggest = checkIfShouldSuggest(userMessage);
    
    if (shouldSuggest) {
      return {
        response: `${generateNormalResponse(userMessage)}\n\n💡 Tip: This might benefit from Alex AI crew coordination. Type "Activate Alex AI" for enhanced assistance.`,
        activated: false,
        suggest: true
      };
    }
    
    return {
      response: generateNormalResponse(userMessage),
      activated: false
    };
  }
}

// Check if we should suggest Alex AI
function checkIfShouldSuggest(message) {
  const lowerMessage = message.toLowerCase();
  
  // Suggest for complex questions
  const complexIndicators = ['how do i', 'what is the best', 'recommend', 'suggest', 'help with'];
  if (complexIndicators.some(indicator => lowerMessage.includes(indicator))) {
    return true;
  }
  
  // Suggest for technical questions
  if (lowerMessage.includes('?') && lowerMessage.length > 50) {
    return true;
  }
  
  return false;
}

// Generate Alex AI-style response (fallback)
function generateAlexAIResponse(message) {
  return `[Alex AI Crew Coordination Active]

Based on your question, here's a coordinated response from the crew:

🎖️ Captain Picard: Strategic assessment suggests...
🤖 Commander Data: Technical analysis indicates...
🔧 Lieutenant Commander La Forge: Engineering perspective recommends...

[Note: Full crew coordination requires Alex AI CLI. Run: npx alex-ai chat]`;
}

// Generate normal response
function generateNormalResponse(message) {
  return `I can help with that. ${message}`;
}

// Export for use in Cursor AI
module.exports = {
  handleCursorChat,
  shouldAutoActivate,
  activateAlexAI,
  generateActivationSuggestion
};

// CLI usage
if (require.main === module) {
  const message = process.argv[2] || 'test message';
  const result = handleCursorChat(message);
  
  console.log('\n' + '═'.repeat(80));
  console.log('🖖 CURSOR AI AUTO-ACTIVATION TEST');
  console.log('═'.repeat(80));
  console.log(`\nUser Message: ${message}`);
  console.log(`Activated: ${result.activated ? '✅ Yes' : '❌ No'}`);
  if (result.reason) {
    console.log(`Reason: ${result.reason}`);
  }
  if (result.suggest) {
    console.log(`Suggestion: ${result.suggest ? '✅ Yes' : '❌ No'}`);
  }
  console.log(`\nResponse:\n${result.response}`);
  console.log('\n' + '═'.repeat(80));
}

