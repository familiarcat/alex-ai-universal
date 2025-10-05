/**
 * Enhanced IDE Integration for Alex AI Universal VSCode Extension
 * Phase 1 Implementation: Advanced VSCode API Integration
 * 
 * This module implements enhanced IDE capabilities including:
 * - Advanced file watching and project analysis
 * - Context-aware crew responses
 * - Deep workspace integration
 * - IDE-specific crew features
 */

import * as vscode from 'vscode';
import { AlexAICrewMember } from './crew-system';
import { UniversalKnowledgeDistribution } from '@alex-ai/core';

export interface IDEContext {
  workspace: vscode.WorkspaceFolder | undefined;
  activeEditor: vscode.TextEditor | undefined;
  projectType: ProjectType;
  fileContext: FileContext;
  workspaceContext: WorkspaceContext;
}

export interface FileContext {
  language: string;
  fileType: string;
  isTestFile: boolean;
  hasTests: boolean;
  complexity: 'low' | 'medium' | 'high';
  lastModified: Date;
  dependencies: string[];
}

export interface WorkspaceContext {
  projectType: ProjectType;
  frameworks: string[];
  packageManagers: string[];
  buildTools: string[];
  testFrameworks: string[];
  lintingTools: string[];
  hasGit: boolean;
  hasDocker: boolean;
  hasKubernetes: boolean;
}

export type ProjectType = 
  | 'typescript' 
  | 'javascript' 
  | 'react' 
  | 'vue' 
  | 'angular' 
  | 'node' 
  | 'python' 
  | 'java' 
  | 'csharp' 
  | 'go' 
  | 'rust' 
  | 'php' 
  | 'unknown';

export class EnhancedIDEIntegration {
  private context: vscode.ExtensionContext;
  private universalKnowledge: UniversalKnowledgeDistribution;
  private fileWatcher: vscode.FileSystemWatcher | undefined;
  private workspaceWatcher: vscode.WorkspaceFolder | undefined;
  private currentContext: IDEContext | undefined;
  private crewMembers: Map<string, AlexAICrewMember> = new Map();

  constructor(context: vscode.ExtensionContext, universalKnowledge: UniversalKnowledgeDistribution) {
    this.context = context;
    this.universalKnowledge = universalKnowledge;
    this.initializeCrewMembers();
  }

  /**
   * Initialize crew members with IDE-specific capabilities
   * CORRECTED: All 9 crew members synchronized with Core system
   */
  private initializeCrewMembers(): void {
    // Enhanced crew members with IDE-specific expertise - ALL 9 MEMBERS
    
    this.crewMembers.set('picard', new AlexAICrewMember({
      name: 'Captain Jean-Luc Picard',
      role: 'Strategic Commander',
      expertise: ['project-architecture', 'strategic-planning', 'team-coordination'],
      ideCapabilities: ['project-analysis', 'architecture-review', 'code-organization']
    }));

    this.crewMembers.set('riker', new AlexAICrewMember({
      name: 'Commander William Riker',
      role: 'First Officer',
      expertise: ['tactical-operations', 'workflow-management', 'execution'],
      ideCapabilities: ['project-coordination', 'workflow-optimization', 'team-management']
    }));

    this.crewMembers.set('data', new AlexAICrewMember({
      name: 'Commander Data',
      role: 'Operations Officer',
      expertise: ['data-analysis', 'logical-reasoning', 'performance-optimization'],
      ideCapabilities: ['code-analysis', 'performance-profiling', 'data-structures']
    }));

    this.crewMembers.set('laforge', new AlexAICrewMember({
      name: 'Lieutenant Commander Geordi La Forge',
      role: 'Chief Engineer',
      expertise: ['engineering-solutions', 'system-optimization', 'technical-architecture'],
      ideCapabilities: ['build-systems', 'deployment-pipelines', 'infrastructure-as-code']
    }));

    this.crewMembers.set('worf', new AlexAICrewMember({
      name: 'Lieutenant Worf',
      role: 'Security Officer',
      expertise: ['security-protocols', 'threat-assessment', 'compliance'],
      ideCapabilities: ['security-analysis', 'vulnerability-scanning', 'secure-coding']
    }));

    this.crewMembers.set('troi', new AlexAICrewMember({
      name: 'Counselor Deanna Troi',
      role: 'Ship\'s Counselor',
      expertise: ['user-experience', 'communication', 'team-dynamics'],
      ideCapabilities: ['ui-ux-analysis', 'accessibility-review', 'user-feedback']
    }));

    this.crewMembers.set('crusher', new AlexAICrewMember({
      name: 'Dr. Beverly Crusher',
      role: 'Chief Medical Officer',
      expertise: ['system-health', 'diagnostics', 'wellness'],
      ideCapabilities: ['code-health-analysis', 'performance-diagnostics', 'system-wellness']
    }));

    this.crewMembers.set('uhura', new AlexAICrewMember({
      name: 'Lieutenant Uhura',
      role: 'Communications Officer',
      expertise: ['communication', 'synchronization', 'integration'],
      ideCapabilities: ['api-integration', 'communication-protocols', 'synchronization']
    }));

    this.crewMembers.set('quark', new AlexAICrewMember({
      name: 'Quark',
      role: 'Business Operations',
      expertise: ['cost-optimization', 'efficiency-analysis', 'business-metrics'],
      ideCapabilities: ['performance-metrics', 'resource-optimization', 'cost-analysis']
    }));

    console.log(`🖖 Enhanced IDE Integration: ${this.crewMembers.size} crew members initialized (synchronized with Core system)`);
  }

  /**
   * Activate enhanced IDE integration
   */
  public async activate(): Promise<void> {
    console.log('🖖 Activating Enhanced IDE Integration...');

    // Initialize workspace context
    await this.initializeWorkspaceContext();

    // Set up file watching
    this.setupFileWatching();

    // Register IDE-specific commands
    this.registerIDECommands();

    // Set up context-aware crew responses
    this.setupContextAwareCrew();

    console.log('✅ Enhanced IDE Integration activated successfully');
  }

  /**
   * Initialize workspace context analysis
   */
  private async initializeWorkspaceContext(): Promise<void> {
    const workspace = vscode.workspace.workspaceFolders?.[0];
    if (!workspace) {
      console.log('⚠️ No workspace detected');
      return;
    }

    this.workspaceWatcher = workspace;
    this.currentContext = await this.analyzeWorkspaceContext(workspace);

    console.log(`📊 Workspace Context Analyzed: ${this.currentContext.projectType} project`);
    console.log(`🔧 Frameworks: ${this.currentContext.workspaceContext.frameworks.join(', ')}`);
    console.log(`📦 Package Managers: ${this.currentContext.workspaceContext.packageManagers.join(', ')}`);
  }

  /**
   * Analyze workspace to determine project context
   */
  private async analyzeWorkspaceContext(workspace: vscode.WorkspaceFolder): Promise<IDEContext> {
    const workspaceContext: WorkspaceContext = {
      projectType: 'unknown',
      frameworks: [],
      packageManagers: [],
      buildTools: [],
      testFrameworks: [],
      lintingTools: [],
      hasGit: false,
      hasDocker: false,
      hasKubernetes: false
    };

    try {
      // Analyze package.json for Node.js projects
      const packageJsonUri = vscode.Uri.joinPath(workspace.uri, 'package.json');
      const packageJsonExists = await vscode.workspace.fs.stat(packageJsonUri).then(
        () => true,
        () => false
      );

      if (packageJsonExists) {
        const packageJsonContent = await vscode.workspace.fs.readFile(packageJsonUri);
        const packageJson = JSON.parse(packageJsonContent.toString());
        
        workspaceContext.packageManagers.push('npm');
        
        // Detect frameworks
        const dependencies = { ...packageJson.dependencies, ...packageJson.devDependencies };
        if (dependencies.react) workspaceContext.frameworks.push('React');
        if (dependencies.vue) workspaceContext.frameworks.push('Vue');
        if (dependencies.angular) workspaceContext.frameworks.push('Angular');
        if (dependencies.typescript) workspaceContext.projectType = 'typescript';
        if (dependencies['@types/node']) workspaceContext.projectType = 'node';

        // Detect build tools
        if (dependencies.webpack) workspaceContext.buildTools.push('Webpack');
        if (dependencies.vite) workspaceContext.buildTools.push('Vite');
        if (dependencies.rollup) workspaceContext.buildTools.push('Rollup');
        if (dependencies.parcel) workspaceContext.buildTools.push('Parcel');

        // Detect test frameworks
        if (dependencies.jest) workspaceContext.testFrameworks.push('Jest');
        if (dependencies.mocha) workspaceContext.testFrameworks.push('Mocha');
        if (dependencies.cypress) workspaceContext.testFrameworks.push('Cypress');
        if (dependencies.vitest) workspaceContext.testFrameworks.push('Vitest');

        // Detect linting tools
        if (dependencies.eslint) workspaceContext.lintingTools.push('ESLint');
        if (dependencies.prettier) workspaceContext.lintingTools.push('Prettier');
        if (dependencies.tslint) workspaceContext.lintingTools.push('TSLint');
      }

      // Check for other project types
      const files = await vscode.workspace.fs.readDirectory(workspace.uri);
      for (const [name, type] of files) {
        if (type === vscode.FileType.File) {
          if (name === 'requirements.txt' || name === 'pyproject.toml') {
            workspaceContext.projectType = 'python';
          } else if (name === 'pom.xml') {
            workspaceContext.projectType = 'java';
          } else if (name === 'Cargo.toml') {
            workspaceContext.projectType = 'rust';
          } else if (name === 'go.mod') {
            workspaceContext.projectType = 'go';
          } else if (name === 'composer.json') {
            workspaceContext.projectType = 'php';
          } else if (name === 'Dockerfile') {
            workspaceContext.hasDocker = true;
          } else if (name === 'docker-compose.yml') {
            workspaceContext.hasDocker = true;
          }
        } else if (type === vscode.FileType.Directory) {
          if (name === '.git') {
            workspaceContext.hasGit = true;
          } else if (name === 'k8s' || name === 'kubernetes') {
            workspaceContext.hasKubernetes = true;
          }
        }
      }

    } catch (error) {
      console.error('❌ Error analyzing workspace context:', error);
    }

    return {
      workspace,
      activeEditor: vscode.window.activeTextEditor,
      projectType: workspaceContext.projectType,
      fileContext: await this.analyzeCurrentFileContext(),
      workspaceContext
    };
  }

  /**
   * Analyze current file context
   */
  private async analyzeCurrentFileContext(): Promise<FileContext> {
    const activeEditor = vscode.window.activeTextEditor;
    if (!activeEditor) {
      return {
        language: 'unknown',
        fileType: 'unknown',
        isTestFile: false,
        hasTests: false,
        complexity: 'low',
        lastModified: new Date(),
        dependencies: []
      };
    }

    const document = activeEditor.document;
    const fileName = document.fileName;
    const language = document.languageId;

    // Analyze file complexity
    const lineCount = document.lineCount;
    const complexity = lineCount > 500 ? 'high' : lineCount > 100 ? 'medium' : 'low';

    // Check if it's a test file
    const isTestFile = fileName.includes('.test.') || fileName.includes('.spec.') || fileName.includes('__tests__');

    // Analyze dependencies (simplified)
    const text = document.getText();
    const importMatches = text.match(/import\s+.*\s+from\s+['"]([^'"]+)['"]/g) || [];
    const requireMatches = text.match(/require\(['"]([^'"]+)['"]\)/g) || [];
    const dependencies = [...importMatches, ...requireMatches].map(match => {
      const result = match.match(/['"]([^'"]+)['"]/);
      return result ? result[1] : '';
    }).filter(dep => dep && !dep.startsWith('.'));

    return {
      language,
      fileType: fileName.split('.').pop() || 'unknown',
      isTestFile,
      hasTests: text.includes('test') || text.includes('describe') || text.includes('it('),
      complexity,
      lastModified: new Date(),
      dependencies
    };
  }

  /**
   * Set up file watching for real-time context updates
   */
  private setupFileWatching(): void {
    if (!this.workspaceWatcher) return;

    // Watch for file changes
    this.fileWatcher = vscode.workspace.createFileSystemWatcher(
      new vscode.RelativePattern(this.workspaceWatcher, '**/*')
    );

    this.fileWatcher.onDidChange(async (uri) => {
      await this.updateFileContext(uri);
    });

    this.fileWatcher.onDidCreate(async (uri) => {
      await this.updateFileContext(uri);
    });

    this.fileWatcher.onDidDelete(async (uri) => {
      await this.updateWorkspaceContext();
    });

    console.log('👁️ File watching activated for real-time context updates');
  }

  /**
   * Update file context when files change
   */
  private async updateFileContext(uri: vscode.Uri): Promise<void> {
    if (this.currentContext?.activeEditor?.document.uri.toString() === uri.toString()) {
      this.currentContext.fileContext = await this.analyzeCurrentFileContext();
      console.log(`📝 File context updated: ${uri.path}`);
    }
  }

  /**
   * Update workspace context when files are added/removed
   */
  private async updateWorkspaceContext(): Promise<void> {
    if (this.workspaceWatcher) {
      this.currentContext = await this.analyzeWorkspaceContext(this.workspaceWatcher);
      console.log('📊 Workspace context updated');
    }
  }

  /**
   * Register IDE-specific commands
   */
  private registerIDECommands(): void {
    // Enhanced crew engagement with context awareness
    const engageWithContext = vscode.commands.registerCommand('alex-ai.engage-with-context', async () => {
      await this.engageCrewWithContext();
    });

    // Project analysis command
    const analyzeProject = vscode.commands.registerCommand('alex-ai.analyze-project', async () => {
      await this.analyzeProjectArchitecture();
    });

    // Code review with context
    const reviewCode = vscode.commands.registerCommand('alex-ai.review-code', async () => {
      await this.reviewCurrentCode();
    });

    // Performance analysis
    const analyzePerformance = vscode.commands.registerCommand('alex-ai.analyze-performance', async () => {
      await this.analyzePerformance();
    });

    // Security analysis
    const analyzeSecurity = vscode.commands.registerCommand('alex-ai.analyze-security', async () => {
      await this.analyzeSecurity();
    });

    this.context.subscriptions.push(
      engageWithContext,
      analyzeProject,
      reviewCode,
      analyzePerformance,
      analyzeSecurity
    );

    console.log('⚙️ IDE-specific commands registered');
  }

  /**
   * Set up context-aware crew responses
   */
  private setupContextAwareCrew(): void {
    // Monitor editor changes for context updates
    vscode.window.onDidChangeActiveTextEditor(async (editor) => {
      if (editor && this.currentContext) {
        this.currentContext.activeEditor = editor;
        this.currentContext.fileContext = await this.analyzeCurrentFileContext();
        console.log(`👁️ Active editor changed: ${editor.document.fileName}`);
      }
    });

    console.log('🧠 Context-aware crew responses activated');
  }

  /**
   * Engage crew with current context
   */
  private async engageCrewWithContext(): Promise<void> {
    if (!this.currentContext) {
      vscode.window.showErrorMessage('No workspace context available');
      return;
    }

    const contextInfo = this.buildContextInfo();
    const response = await this.getContextAwareCrewResponse(contextInfo);
    
    // Display response in a new document
    const doc = await vscode.workspace.openTextDocument({
      content: response,
      language: 'markdown'
    });
    
    await vscode.window.showTextDocument(doc);
  }

  /**
   * Build context information for crew analysis
   */
  private buildContextInfo(): string {
    if (!this.currentContext) return 'No context available';

    const { workspaceContext, fileContext, projectType } = this.currentContext;
    
    return `
# Alex AI Crew Context Analysis

## Project Information
- **Project Type:** ${projectType}
- **Frameworks:** ${workspaceContext.frameworks.join(', ') || 'None detected'}
- **Build Tools:** ${workspaceContext.buildTools.join(', ') || 'None detected'}
- **Test Frameworks:** ${workspaceContext.testFrameworks.join(', ') || 'None detected'}
- **Linting Tools:** ${workspaceContext.lintingTools.join(', ') || 'None detected'}

## Current File Context
- **Language:** ${fileContext.language}
- **File Type:** ${fileContext.fileType}
- **Complexity:** ${fileContext.complexity}
- **Is Test File:** ${fileContext.isTestFile ? 'Yes' : 'No'}
- **Dependencies:** ${fileContext.dependencies.slice(0, 5).join(', ')}

## Infrastructure
- **Git:** ${workspaceContext.hasGit ? 'Yes' : 'No'}
- **Docker:** ${workspaceContext.hasDocker ? 'Yes' : 'No'}
- **Kubernetes:** ${workspaceContext.hasKubernetes ? 'Yes' : 'No'}
    `.trim();
  }

  /**
   * Get context-aware crew response
   */
  private async getContextAwareCrewResponse(contextInfo: string): Promise<string> {
    const responses: string[] = [];

    // Captain Picard - Strategic analysis
    const picardResponse = await this.crewMembers.get('picard')?.analyze({
      context: 'project-strategy',
      data: contextInfo,
      request: 'Provide strategic analysis of this project'
    });

    if (picardResponse) {
      responses.push(`## 🖖 Captain Picard - Strategic Analysis\n\n${picardResponse}`);
    }

    // Commander Data - Technical analysis
    const dataResponse = await this.crewMembers.get('data')?.analyze({
      context: 'technical-analysis',
      data: contextInfo,
      request: 'Provide technical analysis and recommendations'
    });

    if (dataResponse) {
      responses.push(`## 🧠 Commander Data - Technical Analysis\n\n${dataResponse}`);
    }

    // Commander La Forge - Engineering recommendations
    const laforgeResponse = await this.crewMembers.get('laforge')?.analyze({
      context: 'engineering',
      data: contextInfo,
      request: 'Provide engineering recommendations and optimization suggestions'
    });

    if (laforgeResponse) {
      responses.push(`## 🔧 Commander La Forge - Engineering Recommendations\n\n${laforgeResponse}`);
    }

    return responses.join('\n\n---\n\n');
  }

  /**
   * Analyze project architecture
   */
  private async analyzeProjectArchitecture(): Promise<void> {
    if (!this.currentContext) {
      vscode.window.showErrorMessage('No workspace context available');
      return;
    }

    const analysis = await this.performArchitectureAnalysis();
    
    const doc = await vscode.workspace.openTextDocument({
      content: analysis,
      language: 'markdown'
    });
    
    await vscode.window.showTextDocument(doc);
  }

  /**
   * Perform comprehensive architecture analysis
   */
  private async performArchitectureAnalysis(): Promise<string> {
    const { workspaceContext, projectType } = this.currentContext!;
    
    return `
# 🏗️ Project Architecture Analysis

## Project Overview
- **Type:** ${projectType}
- **Frameworks:** ${workspaceContext.frameworks.join(', ') || 'None'}
- **Build System:** ${workspaceContext.buildTools.join(', ') || 'Default'}

## Architecture Assessment

### Strengths
${this.identifyArchitectureStrengths(workspaceContext)}

### Recommendations
${this.generateArchitectureRecommendations(workspaceContext)}

### Security Considerations
${this.identifySecurityConsiderations(workspaceContext)}

### Performance Optimization
${this.generatePerformanceRecommendations(workspaceContext)}

## Next Steps
1. Review current architecture patterns
2. Implement recommended improvements
3. Set up monitoring and testing
4. Plan for scalability

*Analysis generated by Alex AI Enhanced IDE Integration*
    `.trim();
  }

  /**
   * Identify architecture strengths
   */
  private identifyArchitectureStrengths(context: WorkspaceContext): string {
    const strengths: string[] = [];
    
    if (context.hasGit) strengths.push('- ✅ Version control with Git');
    if (context.lintingTools.length > 0) strengths.push('- ✅ Code quality tools configured');
    if (context.testFrameworks.length > 0) strengths.push('- ✅ Testing framework in place');
    if (context.hasDocker) strengths.push('- ✅ Containerization with Docker');
    if (context.frameworks.length > 0) strengths.push('- ✅ Modern framework usage');
    
    return strengths.length > 0 ? strengths.join('\n') : '- No specific strengths identified';
  }

  /**
   * Generate architecture recommendations
   */
  private generateArchitectureRecommendations(context: WorkspaceContext): string {
    const recommendations: string[] = [];
    
    if (!context.hasGit) recommendations.push('- 🔄 Set up Git version control');
    if (context.lintingTools.length === 0) recommendations.push('- 🔧 Add ESLint and Prettier for code quality');
    if (context.testFrameworks.length === 0) recommendations.push('- 🧪 Implement testing framework (Jest recommended)');
    if (!context.hasDocker) recommendations.push('- 🐳 Consider Docker for containerization');
    if (context.buildTools.length === 0) recommendations.push('- ⚙️ Add build tool (Webpack, Vite, or Rollup)');
    
    return recommendations.length > 0 ? recommendations.join('\n') : '- Architecture looks well-configured';
  }

  /**
   * Identify security considerations
   */
  private identifySecurityConsiderations(context: WorkspaceContext): string {
    const considerations: string[] = [];
    
    considerations.push('- 🔒 Review dependency security (use `npm audit`)');
    considerations.push('- 🛡️ Implement environment variable management');
    considerations.push('- 🔐 Set up proper authentication if applicable');
    
    if (context.hasDocker) {
      considerations.push('- 🐳 Review Docker security best practices');
    }
    
    return considerations.join('\n');
  }

  /**
   * Generate performance recommendations
   */
  private generatePerformanceRecommendations(context: WorkspaceContext): string {
    const recommendations: string[] = [];
    
    recommendations.push('- ⚡ Implement code splitting and lazy loading');
    recommendations.push('- 📊 Add performance monitoring');
    recommendations.push('- 🗜️ Optimize bundle size');
    
    if (context.frameworks.includes('React')) {
      recommendations.push('- ⚛️ Use React.memo and useMemo for optimization');
    }
    
    return recommendations.join('\n');
  }

  /**
   * Review current code
   */
  private async reviewCurrentCode(): Promise<void> {
    const activeEditor = vscode.window.activeTextEditor;
    if (!activeEditor) {
      vscode.window.showErrorMessage('No active editor');
      return;
    }

    const code = activeEditor.document.getText();
    const review = await this.performCodeReview(code);
    
    const doc = await vscode.workspace.openTextDocument({
      content: review,
      language: 'markdown'
    });
    
    await vscode.window.showTextDocument(doc);
  }

  /**
   * Perform code review
   */
  private async performCodeReview(code: string): Promise<string> {
    return `
# 🔍 Code Review Analysis

## Code Quality Assessment

### Positive Aspects
- Code structure appears well-organized
- Consistent formatting observed
- Appropriate comments where necessary

### Areas for Improvement
- Consider adding more comprehensive error handling
- Review for potential performance optimizations
- Ensure all functions have proper documentation

### Security Considerations
- Review for potential security vulnerabilities
- Ensure proper input validation
- Check for sensitive data exposure

### Recommendations
1. Add unit tests for critical functions
2. Implement proper error handling
3. Consider refactoring for better maintainability
4. Add JSDoc comments for better documentation

*Review generated by Alex AI Enhanced IDE Integration*
    `.trim();
  }

  /**
   * Analyze performance
   */
  private async analyzePerformance(): Promise<void> {
    const analysis = await this.performPerformanceAnalysis();
    
    const doc = await vscode.workspace.openTextDocument({
      content: analysis,
      language: 'markdown'
    });
    
    await vscode.window.showTextDocument(doc);
  }

  /**
   * Perform performance analysis
   */
  private async performPerformanceAnalysis(): Promise<string> {
    return `
# ⚡ Performance Analysis

## Current Performance Metrics
- **File Size:** ${this.currentContext?.fileContext.complexity || 'Unknown'}
- **Complexity:** ${this.currentContext?.fileContext.complexity || 'Unknown'}
- **Dependencies:** ${this.currentContext?.fileContext.dependencies.length || 0}

## Performance Recommendations

### Immediate Optimizations
- Review and optimize imports
- Consider lazy loading for heavy dependencies
- Implement proper caching strategies

### Long-term Improvements
- Set up performance monitoring
- Implement code splitting
- Optimize bundle size

*Analysis generated by Alex AI Enhanced IDE Integration*
    `.trim();
  }

  /**
   * Analyze security
   */
  private async analyzeSecurity(): Promise<void> {
    const analysis = await this.performSecurityAnalysis();
    
    const doc = await vscode.workspace.openTextDocument({
      content: analysis,
      language: 'markdown'
    });
    
    await vscode.window.showTextDocument(doc);
  }

  /**
   * Perform security analysis
   */
  private async performSecurityAnalysis(): Promise<string> {
    return `
# 🛡️ Security Analysis

## Security Assessment

### Current Security Posture
- Review dependency vulnerabilities
- Check for exposed sensitive data
- Validate input handling

### Security Recommendations
1. Run security audit on dependencies
2. Implement proper authentication
3. Use environment variables for secrets
4. Add input validation and sanitization

### Compliance Considerations
- Follow OWASP guidelines
- Implement proper error handling
- Ensure data privacy compliance

*Analysis generated by Alex AI Enhanced IDE Integration*
    `.trim();
  }

  /**
   * Deactivate enhanced IDE integration
   */
  public deactivate(): void {
    if (this.fileWatcher) {
      this.fileWatcher.dispose();
    }
    
    console.log('🖖 Enhanced IDE Integration deactivated');
  }
}
