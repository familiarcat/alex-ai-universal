/**
 * Context Manager
 * 
 * Manages project context and provides intelligent context awareness
 * for Alex AI across different project types and structures.
 */

import * as fs from 'fs-extra';
import * as path from 'path';
import { glob } from 'glob';
import { ProjectInfo } from './project-detector';
import { CodeContext } from '@alex-ai/universal';

export class ContextManager {
  private projectContext: ProjectInfo | null = null;
  private currentFile: string | null = null;
  private selectedCode: string | null = null;

  async setProjectContext(projectInfo: ProjectInfo): Promise<void> {
    this.projectContext = projectInfo;
  }

  async getCurrentContext(): Promise<CodeContext> {
    const context: CodeContext = {
      projectType: this.projectContext?.type || 'unknown',
      dependencies: this.projectContext?.dependencies || [],
      workspacePath: this.projectContext?.path || process.cwd()
    };

    // Add current file context if available
    if (this.currentFile) {
      context.filePath = this.currentFile;
      context.language = this.getLanguageFromFile(this.currentFile);
      
      try {
        const content = await fs.readFile(this.currentFile, 'utf-8');
        context.content = content;
      } catch (error) {
        // File might not exist or be readable
      }
    }

    // Add selected code if available
    if (this.selectedCode) {
      context.content = this.selectedCode;
    }

    return context;
  }

  async getProjectStructure(): Promise<string[]> {
    if (!this.projectContext) return [];

    const files = await glob('**/*', { 
      cwd: this.projectContext.path, 
      nodir: true,
      ignore: ['node_modules/**', '.git/**', 'dist/**', 'build/**', 'coverage/**']
    });

    return files;
  }

  async getRelevantFiles(query: string): Promise<string[]> {
    if (!this.projectContext) return [];

    const allFiles = await this.getProjectStructure();
    const queryLower = query.toLowerCase();
    
    return allFiles.filter(file => {
      const fileName = path.basename(file).toLowerCase();
      const filePath = file.toLowerCase();
      
      return fileName.includes(queryLower) || 
             filePath.includes(queryLower) ||
             this.isRelevantFileType(file, query);
    });
  }

  async getFileContent(filePath: string): Promise<string | null> {
    try {
      const fullPath = path.join(this.projectContext?.path || process.cwd(), filePath);
      return await fs.readFile(fullPath, 'utf-8');
    } catch (error) {
      return null;
    }
  }

  async getPackageJson(): Promise<any> {
    if (!this.projectContext) return null;

    try {
      const packageJsonPath = path.join(this.projectContext.path, 'package.json');
      return await fs.readJson(packageJsonPath);
    } catch (error) {
      return null;
    }
  }

  async getReadme(): Promise<string | null> {
    if (!this.projectContext) return null;

    const readmeFiles = ['README.md', 'readme.md', 'README.txt', 'readme.txt'];
    
    for (const readmeFile of readmeFiles) {
      try {
        const readmePath = path.join(this.projectContext.path, readmeFile);
        return await fs.readFile(readmePath, 'utf-8');
      } catch (error) {
        // Try next readme file
      }
    }

    return null;
  }

  async getGitInfo(): Promise<any> {
    if (!this.projectContext?.hasGit) return null;

    try {
      const { execSync } = require('child_process');
      
      return {
        branch: execSync('git branch --show-current', { encoding: 'utf-8' }).trim(),
        status: execSync('git status --porcelain', { encoding: 'utf-8' }).trim(),
        lastCommit: execSync('git log -1 --oneline', { encoding: 'utf-8' }).trim(),
        remote: execSync('git remote get-url origin', { encoding: 'utf-8' }).trim()
      };
    } catch (error) {
      return null;
    }
  }

  async getDockerInfo(): Promise<any> {
    if (!this.projectContext?.hasDocker) return null;

    const dockerFiles = ['Dockerfile', 'docker-compose.yml', 'docker-compose.yaml'];
    const dockerInfo: any = {};

    for (const dockerFile of dockerFiles) {
      try {
        const dockerPath = path.join(this.projectContext!.path, dockerFile);
        const content = await fs.readFile(dockerPath, 'utf-8');
        dockerInfo[dockerFile] = content;
      } catch (error) {
        // File doesn't exist
      }
    }

    return Object.keys(dockerInfo).length > 0 ? dockerInfo : null;
  }

  async getTestInfo(): Promise<any> {
    if (!this.projectContext?.hasTests) return null;

    const testFiles = await glob('**/*.{test,spec}.{js,ts,jsx,tsx,py,java,cs,go,rs}', { 
      cwd: this.projectContext!.path 
    });

    return {
      testFramework: this.projectContext!.testFramework,
      testFiles: testFiles,
      testCount: testFiles.length
    };
  }

  async getEnvironmentInfo(): Promise<any> {
    if (!this.projectContext) return null;

    const envFiles = ['.env', '.env.local', '.env.development', '.env.production'];
    const envInfo: any = {};

    for (const envFile of envFiles) {
      try {
        const envPath = path.join(this.projectContext.path, envFile);
        const content = await fs.readFile(envPath, 'utf-8');
        envInfo[envFile] = content.split('\n').filter(line => line.trim() && !line.startsWith('#'));
      } catch (error) {
        // File doesn't exist
      }
    }

    return Object.keys(envInfo).length > 0 ? envInfo : null;
  }

  setCurrentFile(filePath: string): void {
    this.currentFile = filePath;
  }

  setSelectedCode(code: string): void {
    this.selectedCode = code;
  }

  getProjectContext(): ProjectInfo | null {
    return this.projectContext;
  }

  private getLanguageFromFile(filePath: string): string {
    const ext = path.extname(filePath).toLowerCase();
    
    const languageMap: { [key: string]: string } = {
      '.ts': 'TypeScript',
      '.tsx': 'TypeScript',
      '.js': 'JavaScript',
      '.jsx': 'JavaScript',
      '.py': 'Python',
      '.java': 'Java',
      '.cs': 'C#',
      '.go': 'Go',
      '.rs': 'Rust',
      '.php': 'PHP',
      '.rb': 'Ruby',
      '.swift': 'Swift',
      '.kt': 'Kotlin',
      '.dart': 'Dart',
      '.html': 'HTML',
      '.css': 'CSS',
      '.scss': 'SCSS',
      '.sass': 'Sass',
      '.less': 'Less',
      '.json': 'JSON',
      '.xml': 'XML',
      '.yaml': 'YAML',
      '.yml': 'YAML',
      '.md': 'Markdown',
      '.sql': 'SQL',
      '.sh': 'Shell',
      '.bash': 'Bash',
      '.zsh': 'Zsh',
      '.fish': 'Fish'
    };

    return languageMap[ext] || 'Unknown';
  }

  private isRelevantFileType(file: string, query: string): boolean {
    const ext = path.extname(file).toLowerCase();
    const queryLower = query.toLowerCase();
    
    // Check if query matches common file types
    const fileTypeMap: { [key: string]: string[] } = {
      '.ts': ['typescript', 'ts', 'type'],
      '.js': ['javascript', 'js', 'script'],
      '.py': ['python', 'py'],
      '.java': ['java'],
      '.cs': ['csharp', 'c#', 'cs'],
      '.go': ['go', 'golang'],
      '.rs': ['rust', 'rs'],
      '.php': ['php'],
      '.rb': ['ruby', 'rb'],
      '.html': ['html', 'markup'],
      '.css': ['css', 'style', 'stylesheet'],
      '.json': ['json', 'config'],
      '.md': ['markdown', 'md', 'readme', 'doc'],
      '.sql': ['sql', 'database', 'db'],
      '.sh': ['shell', 'bash', 'script'],
      '.yaml': ['yaml', 'yml', 'config'],
      '.xml': ['xml', 'config']
    };

    const relevantTypes = fileTypeMap[ext] || [];
    return relevantTypes.some(type => type.includes(queryLower));
  }
}
