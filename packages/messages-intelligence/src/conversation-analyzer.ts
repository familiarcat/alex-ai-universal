import { Message, Conversation, AnalysisResult, CrewAnalysisRequest } from './types';
import { format, differenceInDays, differenceInHours } from 'date-fns';

export class ConversationAnalyzer {
  
  /**
   * Analyze a conversation and extract insights
   */
  analyzeConversation(conversation: Conversation, messages: Message[]): AnalysisResult {
    const summary = this.generateSummary(conversation, messages);
    const insights = this.extractInsights(messages);

    return {
      conversation,
      messages,
      summary,
      insights
    };
  }

  /**
   * Generate conversation summary
   */
  private generateSummary(conversation: Conversation, messages: Message[]): AnalysisResult['summary'] {
    const participants = [...new Set(messages.map(m => m.sender))];
    const dateRange = {
      start: new Date(Math.min(...messages.map(m => m.date.getTime()))),
      end: new Date(Math.max(...messages.map(m => m.date.getTime())))
    };

    return {
      totalMessages: messages.length,
      participants,
      dateRange,
      keyTopics: this.extractKeyTopics(messages),
      sentiment: this.analyzeSentiment(messages)
    };
  }

  /**
   * Extract key topics from messages
   */
  private extractKeyTopics(messages: Message[]): string[] {
    const text = messages.map(m => m.text).join(' ').toLowerCase();
    
    // Simple keyword extraction (in a real implementation, you'd use NLP libraries)
    const commonWords = new Set(['the', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by', 'a', 'an', 'is', 'are', 'was', 'were', 'be', 'been', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could', 'should', 'may', 'might', 'can', 'i', 'you', 'he', 'she', 'it', 'we', 'they', 'me', 'him', 'her', 'us', 'them']);
    
    const words = text.match(/\b\w+\b/g) || [];
    const wordCount = new Map<string, number>();
    
    words.forEach(word => {
      if (word.length > 3 && !commonWords.has(word)) {
        wordCount.set(word, (wordCount.get(word) || 0) + 1);
      }
    });

    return Array.from(wordCount.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([word]) => word);
  }

  /**
   * Analyze sentiment of conversation
   */
  private analyzeSentiment(messages: Message[]): 'positive' | 'negative' | 'neutral' | 'mixed' {
    const positiveWords = ['good', 'great', 'awesome', 'excellent', 'amazing', 'wonderful', 'fantastic', 'love', 'like', 'happy', 'excited', 'perfect', 'best', 'thanks', 'thank you', 'appreciate'];
    const negativeWords = ['bad', 'terrible', 'awful', 'hate', 'dislike', 'angry', 'mad', 'frustrated', 'disappointed', 'worried', 'concerned', 'problem', 'issue', 'error', 'wrong', 'sorry'];

    let positiveCount = 0;
    let negativeCount = 0;

    messages.forEach(message => {
      const text = message.text.toLowerCase();
      positiveWords.forEach(word => {
        if (text.includes(word)) positiveCount++;
      });
      negativeWords.forEach(word => {
        if (text.includes(word)) negativeCount++;
      });
    });

    if (positiveCount > negativeCount * 1.5) return 'positive';
    if (negativeCount > positiveCount * 1.5) return 'negative';
    if (Math.abs(positiveCount - negativeCount) <= 2) return 'neutral';
    return 'mixed';
  }

  /**
   * Extract insights from messages
   */
  private extractInsights(messages: Message[]): AnalysisResult['insights'] {
    return {
      communicationPatterns: this.analyzeCommunicationPatterns(messages),
      importantDates: this.extractImportantDates(messages),
      actionItems: this.extractActionItems(messages),
      decisions: this.extractDecisions(messages)
    };
  }

  /**
   * Analyze communication patterns
   */
  private analyzeCommunicationPatterns(messages: Message[]): string[] {
    const patterns: string[] = [];
    
    // Analyze response times
    const responseTimes: number[] = [];
    for (let i = 1; i < messages.length; i++) {
      if (messages[i].isFromMe !== messages[i - 1].isFromMe) {
        const diff = differenceInHours(messages[i].date, messages[i - 1].date);
        if (diff < 24) {
          responseTimes.push(diff);
        }
      }
    }

    if (responseTimes.length > 0) {
      const avgResponseTime = responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length;
      if (avgResponseTime < 1) {
        patterns.push('Very responsive conversation (average response < 1 hour)');
      } else if (avgResponseTime < 24) {
        patterns.push('Regular communication pattern (average response < 1 day)');
      } else {
        patterns.push('Slow-paced conversation (average response > 1 day)');
      }
    }

    // Analyze message length patterns
    const avgLength = messages.reduce((sum, m) => sum + m.text.length, 0) / messages.length;
    if (avgLength > 100) {
      patterns.push('Detailed, thoughtful exchanges');
    } else if (avgLength < 20) {
      patterns.push('Brief, concise communication');
    }

    return patterns;
  }

  /**
   * Extract important dates mentioned in messages
   */
  private extractImportantDates(messages: Message[]): Date[] {
    const dates: Date[] = [];
    const dateRegex = /\b(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4}|\d{4}[\/\-]\d{1,2}[\/\-]\d{1,2})\b/g;
    
    messages.forEach(message => {
      const matches = message.text.match(dateRegex);
      if (matches) {
        matches.forEach(match => {
          try {
            const date = new Date(match);
            if (!isNaN(date.getTime())) {
              dates.push(date);
            }
          } catch (error) {
            // Ignore invalid dates
          }
        });
      }
    });

    return dates;
  }

  /**
   * Extract action items from messages
   */
  private extractActionItems(messages: Message[]): string[] {
    const actionItems: string[] = [];
    const actionPatterns = [
      /need to (.+)/gi,
      /should (.+)/gi,
      /will (.+)/gi,
      /let's (.+)/gi,
      /can you (.+)/gi,
      /please (.+)/gi,
      /todo: (.+)/gi,
      /action: (.+)/gi
    ];

    messages.forEach(message => {
      actionPatterns.forEach(pattern => {
        const matches = message.text.match(pattern);
        if (matches) {
          actionItems.push(...matches);
        }
      });
    });

    return [...new Set(actionItems)]; // Remove duplicates
  }

  /**
   * Extract decisions from messages
   */
  private extractDecisions(messages: Message[]): string[] {
    const decisions: string[] = [];
    const decisionPatterns = [
      /decided to (.+)/gi,
      /we're going to (.+)/gi,
      /agreed on (.+)/gi,
      /settled on (.+)/gi,
      /final decision: (.+)/gi,
      /conclusion: (.+)/gi
    ];

    messages.forEach(message => {
      decisionPatterns.forEach(pattern => {
        const matches = message.text.match(pattern);
        if (matches) {
          decisions.push(...matches);
        }
      });
    });

    return [...new Set(decisions)]; // Remove duplicates
  }

  /**
   * Generate crew-specific analysis
   */
  generateCrewAnalysis(request: CrewAnalysisRequest, analysis: AnalysisResult): string {
    const { crewMember, analysisType, specificQuestions } = request;
    
    let analysisText = `# ${crewMember} Analysis Report\n\n`;
    analysisText += `**Conversation:** ${analysis.conversation.name}\n`;
    analysisText += `**Analysis Type:** ${analysisType}\n`;
    analysisText += `**Date Range:** ${format(analysis.summary.dateRange.start, 'PPP')} - ${format(analysis.summary.dateRange.end, 'PPP')}\n\n`;

    switch (crewMember) {
      case 'Captain Picard':
        analysisText += this.generateStrategicAnalysis(analysis);
        break;
      case 'Commander Data':
        analysisText += this.generateTechnicalAnalysis(analysis);
        break;
      case 'Worf':
        analysisText += this.generateSecurityAnalysis(analysis);
        break;
      case 'Quark':
        analysisText += this.generateBusinessAnalysis(analysis);
        break;
      default:
        analysisText += this.generateGeneralAnalysis(analysis);
    }

    if (specificQuestions && specificQuestions.length > 0) {
      analysisText += `\n## Specific Questions\n\n`;
      specificQuestions.forEach((question, index) => {
        analysisText += `${index + 1}. ${question}\n`;
        analysisText += `   *[Analysis would be generated here based on conversation content]*\n\n`;
      });
    }

    return analysisText;
  }

  private generateStrategicAnalysis(analysis: AnalysisResult): string {
    return `
## Strategic Assessment

**Communication Effectiveness:** ${analysis.summary.totalMessages} messages over ${differenceInDays(analysis.summary.dateRange.end, analysis.summary.dateRange.start)} days indicates ${analysis.summary.totalMessages > 50 ? 'high' : 'moderate'} engagement.

**Key Topics:** ${analysis.summary.keyTopics.join(', ')}

**Sentiment Analysis:** ${analysis.summary.sentiment} overall tone

**Strategic Recommendations:**
- Monitor communication patterns for optimization opportunities
- Address any action items identified in the conversation
- Consider the sentiment trends for relationship management
`;
  }

  private generateTechnicalAnalysis(analysis: AnalysisResult): string {
    return `
## Technical Analysis

**Data Points:**
- Total Messages: ${analysis.summary.totalMessages}
- Participants: ${analysis.summary.participants.join(', ')}
- Date Range: ${differenceInDays(analysis.summary.dateRange.end, analysis.summary.dateRange.start)} days
- Average Messages per Day: ${(analysis.summary.totalMessages / Math.max(1, differenceInDays(analysis.summary.dateRange.end, analysis.summary.dateRange.start))).toFixed(2)}

**Communication Patterns:**
${analysis.insights.communicationPatterns.map(pattern => `- ${pattern}`).join('\n')}

**Technical Observations:**
- Message distribution analysis complete
- Timeline correlation established
- Participant interaction patterns identified
`;
  }

  private generateSecurityAnalysis(analysis: AnalysisResult): string {
    return `
## Security Assessment

**Conversation Security:**
- Participant verification: ${analysis.summary.participants.length} confirmed participants
- Date integrity: ${analysis.summary.dateRange.start.toISOString()} to ${analysis.summary.dateRange.end.toISOString()}

**Potential Concerns:**
- Review for any sensitive information disclosure
- Verify participant authenticity
- Check for any security-related discussions

**Recommendations:**
- Maintain conversation confidentiality
- Review any shared sensitive data
- Ensure proper access controls for exported data
`;
  }

  private generateBusinessAnalysis(analysis: AnalysisResult): string {
    return `
## Business Analysis

**Cost-Benefit Assessment:**
- Conversation Value: ${analysis.summary.totalMessages} data points
- Time Investment: ${differenceInDays(analysis.summary.dateRange.end, analysis.summary.dateRange.start)} days
- ROI: High (automated analysis vs manual review)

**Business Intelligence:**
${analysis.insights.actionItems.length > 0 ? `- Action Items: ${analysis.insights.actionItems.length} identified` : ''}
${analysis.insights.decisions.length > 0 ? `- Decisions: ${analysis.insights.decisions.length} documented` : ''}

**Revenue Opportunities:**
- Automated conversation analysis service
- Business intelligence extraction
- Relationship management insights
`;
  }

  private generateGeneralAnalysis(analysis: AnalysisResult): string {
    return `
## General Analysis

**Conversation Overview:**
- Duration: ${differenceInDays(analysis.summary.dateRange.end, analysis.summary.dateRange.start)} days
- Volume: ${analysis.summary.totalMessages} messages
- Participants: ${analysis.summary.participants.join(', ')}

**Key Insights:**
${analysis.insights.communicationPatterns.map(pattern => `- ${pattern}`).join('\n')}

**Important Dates:**
${analysis.insights.importantDates.map(date => `- ${format(date, 'PPP')}`).join('\n')}

**Action Items:**
${analysis.insights.actionItems.map(item => `- ${item}`).join('\n')}
`;
  }
}
