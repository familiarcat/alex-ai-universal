/**
 * IDE Types for Alex AI Universal
 * Defines interfaces for IDE integration across different platforms
 */

export interface IDEInfo {
  name: string;
  version: string;
  platform: 'vscode' | 'cursor' | 'web' | 'terminal' | 'unknown';
  capabilities: IDECapabilities;
  projectPath?: string;
}

export interface IDECapabilities {
  codeCompletion: boolean;
  debugging: boolean;
  gitIntegration: boolean;
  extensions: boolean;
  terminal: boolean;
  fileExplorer: boolean;
  search: boolean;
  refactoring: boolean;
}

export interface ProjectInfo {
  name: string;
  type: 'node' | 'python' | 'react' | 'vue' | 'angular' | 'java' | 'csharp' | 'go' | 'rust' | 'unknown';
  framework?: string;
  language: string;
  packageManager: 'npm' | 'yarn' | 'pnpm' | 'pip' | 'cargo' | 'maven' | 'gradle' | 'unknown';
  hasGit: boolean;
  hasDocker: boolean;
  hasTests: boolean;
  dependencies?: string[];
  devDependencies?: string[];
}

export interface FileInfo {
  path: string;
  name: string;
  extension: string;
  size: number;
  lastModified: Date;
  content?: string;
  isDirectory: boolean;
}

export interface CodeContext {
  currentFile?: FileInfo;
  selection?: {
    start: number;
    end: number;
    text: string;
  };
  cursorPosition?: {
    line: number;
    column: number;
  };
  project: ProjectInfo;
  ide: IDEInfo;
}

export interface CodeSuggestion {
  text: string;
  description?: string;
  type: 'completion' | 'refactor' | 'fix' | 'optimization';
  confidence: number;
  source: 'alex-ai' | 'crew-member';
  crewMember?: string;
}

export interface CodeAnalysis {
  issues: CodeIssue[];
  suggestions: CodeSuggestion[];
  metrics: CodeMetrics;
  timestamp: Date;
}

export interface CodeIssue {
  type: 'error' | 'warning' | 'info';
  message: string;
  line?: number;
  column?: number;
  file?: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  fix?: string;
}

export interface CodeMetrics {
  complexity: number;
  maintainability: number;
  testCoverage?: number;
  linesOfCode: number;
  technicalDebt?: number;
}

export interface IDEEvent {
  type: 'file_change' | 'selection_change' | 'cursor_move' | 'command_execute';
  timestamp: Date;
  data: any;
  context: CodeContext;
}

export interface IDECommand {
  name: string;
  description: string;
  handler: (context: CodeContext, ...args: any[]) => Promise<any>;
  category: 'navigation' | 'editing' | 'analysis' | 'git' | 'build' | 'debug';
}

export interface IDEExtension {
  id: string;
  name: string;
  version: string;
  enabled: boolean;
  capabilities: string[];
  settings?: Record<string, any>;
}

export interface IDETheme {
  name: string;
  type: 'light' | 'dark' | 'auto';
  colors: Record<string, string>;
}

export interface IDESettings {
  theme: IDETheme;
  extensions: IDEExtension[];
  preferences: Record<string, any>;
  keybindings?: Record<string, string>;
}

export interface IDEIntegration {
  info: IDEInfo;
  settings: IDESettings;
  capabilities: IDECapabilities;
  commands: IDECommand[];
  events: IDEEvent[];
}

export interface CrewMemberContext {
  name: string;
  specialization: string[];
  expertise: string[];
  personality: Record<string, any>;
  preferences: Record<string, any>;
  currentTask?: string;
  status: 'available' | 'busy' | 'offline';
}

export interface CrewCoordination {
  activeMembers: CrewMemberContext[];
  taskQueue: string[];
  collaboration: boolean;
  communication: boolean;
}

export interface AlexAIIntegration {
  ide: IDEIntegration;
  crew: CrewCoordination;
  project: ProjectInfo;
  capabilities: {
    codeAnalysis: boolean;
    suggestions: boolean;
    refactoring: boolean;
    debugging: boolean;
    testing: boolean;
    documentation: boolean;
  };
  status: 'connected' | 'disconnected' | 'error';
  lastUpdate: Date;
}

export default {
  IDEInfo,
  IDECapabilities,
  ProjectInfo,
  FileInfo,
  CodeContext,
  CodeSuggestion,
  CodeAnalysis,
  CodeIssue,
  CodeMetrics,
  IDEEvent,
  IDECommand,
  IDEExtension,
  IDETheme,
  IDESettings,
  IDEIntegration,
  CrewMemberContext,
  CrewCoordination,
  AlexAIIntegration
};
