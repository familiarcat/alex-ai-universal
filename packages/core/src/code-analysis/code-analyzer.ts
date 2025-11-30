/**
 * 🔍 Code Analysis Engine
 * 
 * Analyzes code for function execution issues
 * Maps UI elements to code functions and identifies problems
 */

export interface CodeFunction {
  name: string;
  type: 'onClick' | 'onSubmit' | 'onChange' | 'onLoad' | 'other';
  file: string;
  line: number;
  parameters: string[];
  returnType?: string;
  isAsync: boolean;
  hasErrorHandling: boolean;
  isExported: boolean;
  isImported: boolean;
}

export interface ClickHandlerMapping {
  uiElement: string;
  functionName: string;
  file: string;
  line: number;
  isWorking: boolean;
  potentialIssues: string[];
}

export interface CodeAnalysisResult {
  filePath: string;
  functions: CodeFunction[];
  clickHandlers: ClickHandlerMapping[];
  potentialIssues: string[];
  debuggingSuggestions: string[];
  confidence: number;
  timestamp: string;
}

export class CodeAnalyzer {
  private supportedLanguages = ['javascript', 'typescript', 'jsx', 'tsx', 'html', 'css'];

  constructor() {
    console.log('✅ Code Analysis Engine initialized');
  }

  /**
   * Analyze code for function execution issues
   */
  async analyzeCode(
    filePath: string, 
    uiElements?: string[], 
    context?: string
  ): Promise<CodeAnalysisResult> {
    console.log(`🔍 Analyzing code: ${filePath}`);
    
    try {
      // Phase 1: Parse code file
      const codeContent = await this.readCodeFile(filePath);
      
      // Phase 2: Extract functions
      const functions = await this.extractFunctions(codeContent, filePath);
      
      // Phase 3: Map click handlers
      const clickHandlers = await this.mapClickHandlers(functions, uiElements);
      
      // Phase 4: Identify potential issues
      const potentialIssues = await this.identifyIssues(functions, clickHandlers);
      
      // Phase 5: Generate debugging suggestions
      const suggestions = await this.generateSuggestions(functions, clickHandlers, potentialIssues);
      
      const result: CodeAnalysisResult = {
        filePath,
        functions,
        clickHandlers,
        potentialIssues,
        debuggingSuggestions: suggestions,
        confidence: this.calculateConfidence(functions, clickHandlers),
        timestamp: new Date().toISOString()
      };
      
      console.log(`✅ Code analysis completed with ${result.confidence}% confidence`);
      return result;
      
    } catch (error) {
      console.error('❌ Code analysis failed:', error);
      throw new Error(`Code analysis failed: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Read code file content
   */
  private async readCodeFile(filePath: string): Promise<string> {
    // This would read the actual file
    // For now, return mock data
    return `
import React, { useState } from 'react';

const MyComponent = () => {
  const [email, setEmail] = useState('');
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await submitForm(email);
    } catch (error) {
      console.error('Submit error:', error);
    }
  };
  
  const handleCancel = () => {
    setEmail('');
  };
  
  return (
    <form onSubmit={handleSubmit}>
      <input 
        type="email" 
        value={email} 
        onChange={(e) => setEmail(e.target.value)}
        id="email-input"
      />
      <button type="submit" id="submit-btn">Submit</button>
      <button type="button" id="cancel-btn" onClick={handleCancel}>Cancel</button>
    </form>
  );
};

export default MyComponent;
    `;
  }

  /**
   * Extract functions from code
   */
  private async extractFunctions(codeContent: string, filePath: string): Promise<CodeFunction[]> {
    const functions: CodeFunction[] = [];
    
    // Parse JavaScript/TypeScript functions
    const functionRegex = /(?:function\s+(\w+)|const\s+(\w+)\s*=\s*(?:async\s+)?(?:\([^)]*\)\s*=>|function))/g;
    const arrowFunctionRegex = /(\w+)\s*:\s*(?:async\s+)?\([^)]*\)\s*=>/g;
    
    let match;
    let lineNumber = 1;
    
    // Count lines for line number calculation
    const lines = codeContent.split('\n');
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      lineNumber = i + 1;
      
      // Check for function declarations
      if (functionRegex.test(line)) {
        const functionName = this.extractFunctionName(line);
        if (functionName) {
          functions.push({
            name: functionName,
            type: this.inferFunctionType(functionName),
            file: filePath,
            line: lineNumber,
            parameters: this.extractParameters(line),
            isAsync: line.includes('async'),
            hasErrorHandling: this.hasErrorHandling(codeContent, functionName),
            isExported: this.isExported(codeContent, functionName),
            isImported: this.isImported(codeContent, functionName)
          });
        }
      }
      
      // Check for arrow functions
      if (arrowFunctionRegex.test(line)) {
        const functionName = this.extractArrowFunctionName(line);
        if (functionName) {
          functions.push({
            name: functionName,
            type: this.inferFunctionType(functionName),
            file: filePath,
            line: lineNumber,
            parameters: this.extractParameters(line),
            isAsync: line.includes('async'),
            hasErrorHandling: this.hasErrorHandling(codeContent, functionName),
            isExported: this.isExported(codeContent, functionName),
            isImported: this.isImported(codeContent, functionName)
          });
        }
      }
    }
    
    return functions;
  }

  /**
   * Extract function name from line
   */
  private extractFunctionName(line: string): string | null {
    const match = line.match(/(?:function\s+(\w+)|const\s+(\w+)\s*=\s*(?:async\s+)?(?:\([^)]*\)\s*=>|function))/);
    return match ? (match[1] || match[2]) : null;
  }

  /**
   * Extract arrow function name from line
   */
  private extractArrowFunctionName(line: string): string | null {
    const match = line.match(/(\w+)\s*:\s*(?:async\s+)?\([^)]*\)\s*=>/);
    return match ? match[1] : null;
  }

  /**
   * Infer function type from name
   */
  private inferFunctionType(functionName: string): CodeFunction['type'] {
    const name = functionName.toLowerCase();
    
    if (name.includes('click') || name.includes('onclick')) return 'onClick';
    if (name.includes('submit') || name.includes('onsubmit')) return 'onSubmit';
    if (name.includes('change') || name.includes('onchange')) return 'onChange';
    if (name.includes('load') || name.includes('onload')) return 'onLoad';
    
    return 'other';
  }

  /**
   * Extract function parameters
   */
  private extractParameters(line: string): string[] {
    const paramMatch = line.match(/\(([^)]*)\)/);
    if (!paramMatch) return [];
    
    return paramMatch[1]
      .split(',')
      .map(param => param.trim())
      .filter(param => param.length > 0);
  }

  /**
   * Check if function has error handling
   */
  private hasErrorHandling(codeContent: string, functionName: string): boolean {
    const functionRegex = new RegExp(`(?:function\\s+${functionName}|const\\s+${functionName}\\s*=).*?\\{([\\s\\S]*?)\\n\\}`, 'g');
    const match = functionRegex.exec(codeContent);
    
    if (!match) return false;
    
    const functionBody = match[1];
    return functionBody.includes('try') || 
           functionBody.includes('catch') || 
           functionBody.includes('throw') ||
           functionBody.includes('error');
  }

  /**
   * Check if function is exported
   */
  private isExported(codeContent: string, functionName: string): boolean {
    return codeContent.includes(`export ${functionName}`) ||
           codeContent.includes(`export { ${functionName}`) ||
           codeContent.includes(`export default ${functionName}`);
  }

  /**
   * Check if function is imported
   */
  private isImported(codeContent: string, functionName: string): boolean {
    return codeContent.includes(`import.*${functionName}`) ||
           codeContent.includes(`from.*${functionName}`);
  }

  /**
   * Map click handlers to UI elements
   */
  private async mapClickHandlers(
    functions: CodeFunction[], 
    uiElements?: string[]
  ): Promise<ClickHandlerMapping[]> {
    const mappings: ClickHandlerMapping[] = [];
    
    for (const func of functions) {
      if (func.type === 'onClick' || func.type === 'onSubmit') {
        // Try to map to UI elements
        const uiElement = this.findMatchingUIElement(func.name, uiElements);
        
        mappings.push({
          uiElement: uiElement || 'unknown',
          functionName: func.name,
          file: func.file,
          line: func.line,
          isWorking: this.checkIfFunctionIsWorking(func),
          potentialIssues: this.identifyFunctionIssues(func)
        });
      }
    }
    
    return mappings;
  }

  /**
   * Find matching UI element for function
   */
  private findMatchingUIElement(functionName: string, uiElements?: string[]): string | null {
    if (!uiElements) return null;
    
    const name = functionName.toLowerCase();
    
    for (const element of uiElements) {
      const elementLower = element.toLowerCase();
      if (elementLower.includes(name) || name.includes(elementLower)) {
        return element;
      }
    }
    
    return null;
  }

  /**
   * Check if function is working properly
   */
  private checkIfFunctionIsWorking(func: CodeFunction): boolean {
    // Basic checks for function health
    if (!func.hasErrorHandling && func.isAsync) return false;
    if (!func.isExported && !func.isImported) return false;
    
    return true;
  }

  /**
   * Identify potential issues with function
   */
  private identifyFunctionIssues(func: CodeFunction): string[] {
    const issues: string[] = [];
    
    if (func.isAsync && !func.hasErrorHandling) {
      issues.push('Async function lacks error handling');
    }
    
    if (!func.isExported && !func.isImported) {
      issues.push('Function is not exported or imported');
    }
    
    if (func.parameters.length === 0 && func.type === 'onClick') {
      issues.push('Click handler should accept event parameter');
    }
    
    return issues;
  }

  /**
   * Identify potential issues in code
   */
  private async identifyIssues(
    functions: CodeFunction[], 
    clickHandlers: ClickHandlerMapping[]
  ): Promise<string[]> {
    const issues: string[] = [];
    
    // Check for missing click handlers
    const clickFunctions = functions.filter(f => f.type === 'onClick' || f.type === 'onSubmit');
    if (clickFunctions.length === 0) {
      issues.push('No click handlers found in code');
    }
    
    // Check for non-working click handlers
    const nonWorkingHandlers = clickHandlers.filter(h => !h.isWorking);
    if (nonWorkingHandlers.length > 0) {
      issues.push(`${nonWorkingHandlers.length} click handlers have potential issues`);
    }
    
    // Check for missing error handling
    const asyncFunctions = functions.filter(f => f.isAsync);
    const asyncWithoutErrorHandling = asyncFunctions.filter(f => !f.hasErrorHandling);
    if (asyncWithoutErrorHandling.length > 0) {
      issues.push(`${asyncWithoutErrorHandling.length} async functions lack error handling`);
    }
    
    return issues;
  }

  /**
   * Generate debugging suggestions
   */
  private async generateSuggestions(
    functions: CodeFunction[], 
    clickHandlers: ClickHandlerMapping[], 
    issues: string[]
  ): Promise<string[]> {
    const suggestions: string[] = [];
    
    if (issues.length > 0) {
      suggestions.push('Review and fix identified issues in code');
    }
    
    if (clickHandlers.some(h => !h.isWorking)) {
      suggestions.push('Add proper error handling to click handlers');
      suggestions.push('Ensure click handlers are properly exported/imported');
    }
    
    suggestions.push('Use browser developer tools to debug click events');
    suggestions.push('Check console for JavaScript errors');
    suggestions.push('Verify event listeners are properly attached');
    suggestions.push('Test click functionality in different browsers');
    
    return suggestions;
  }

  /**
   * Calculate analysis confidence
   */
  private calculateConfidence(functions: CodeFunction[], clickHandlers: ClickHandlerMapping[]): number {
    let confidence = 100;
    
    if (functions.length === 0) confidence -= 50;
    if (clickHandlers.length === 0) confidence -= 30;
    if (clickHandlers.some(h => !h.isWorking)) confidence -= 20;
    
    return Math.max(0, confidence);
  }
}
