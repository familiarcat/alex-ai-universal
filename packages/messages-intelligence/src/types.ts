export interface Message {
  id: number;
  text: string;
  date: Date;
  sender: string;
  isFromMe: boolean;
  attachmentPath?: string;
  attachmentType?: string;
}

export interface Conversation {
  id: string;
  name: string;
  messageCount: number;
  lastMessage: Date;
  firstMessage: Date;
  participants: string[];
}

export interface ExportOptions {
  conversationId: string;
  startDate: Date;
  endDate: Date;
  outputDirectory: string;
  includeImages: boolean;
  format: 'markdown' | 'pdf' | 'both';
}

export interface ExportResult {
  success: boolean;
  outputPath: string;
  markdownPath?: string;
  pdfPath?: string;
  imagesPath?: string;
  messageCount: number;
  error?: string;
}

export interface AnalysisResult {
  conversation: Conversation;
  messages: Message[];
  summary: {
    totalMessages: number;
    participants: string[];
    dateRange: { start: Date; end: Date };
    keyTopics: string[];
    sentiment: 'positive' | 'negative' | 'neutral' | 'mixed';
  };
  insights: {
    communicationPatterns: string[];
    importantDates: Date[];
    actionItems: string[];
    decisions: string[];
  };
}

export interface CrewAnalysisRequest {
  crewMember: string;
  analysisType: 'strategic' | 'technical' | 'security' | 'business' | 'general';
  conversationId: string;
  dateRange?: { start: Date; end: Date };
  specificQuestions?: string[];
}
