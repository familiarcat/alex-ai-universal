/**
 * Project Detector
 * 
 * Automatically detects project type, framework, and context
 * from any directory, regardless of repository structure.
 */

import * as fs from 'fs-extra';
import * as path from 'path';
import { glob } from 'glob';

export interface ProjectInfo {
  name: string;
  type: 'node' | 'python' | 'react' | 'vue' | 'angular' | 'nextjs' | 'nuxt' | 'svelte' | 'php' | 'java' | 'csharp' | 'go' | 'rust' | 'unknown';
  framework: string;
  language: string;
  path: string;
  packageManager: 'npm' | 'yarn' | 'pnpm' | 'pip' | 'poetry' | 'maven' | 'gradle' | 'cargo' | 'go-mod' | 'unknown';
  dependencies: string[];
  scripts: string[];
  hasGit: boolean;
  gitBranch?: string;
  hasDocker: boolean;
  hasTests: boolean;
  testFramework?: string;
}

export class ProjectDetector {
  private currentPath: string;

  constructor() {
    this.currentPath = process.cwd();
  }

  async detectProject(): Promise<ProjectInfo> {
    const projectInfo: ProjectInfo = {
      name: path.basename(this.currentPath),
      type: 'unknown',
      framework: 'unknown',
      language: 'unknown',
      path: this.currentPath,
      packageManager: 'unknown',
      dependencies: [],
      scripts: [],
      hasGit: false,
      hasDocker: false,
      hasTests: false
    };

    // Detect package manager and project type
    await this.detectPackageManager(projectInfo);
    await this.detectProjectType(projectInfo);
    await this.detectLanguage(projectInfo);
    await this.detectFramework(projectInfo);
    await this.detectDependencies(projectInfo);
    await this.detectScripts(projectInfo);
    await this.detectGit(projectInfo);
    await this.detectDocker(projectInfo);
    await this.detectTests(projectInfo);

    return projectInfo;
  }

  private async detectPackageManager(projectInfo: ProjectInfo): Promise<void> {
    const files = await fs.readdir(this.currentPath);
    
    if (files.includes('package.json')) {
      const packageJson = await fs.readJson(path.join(this.currentPath, 'package.json'));
      projectInfo.dependencies = Object.keys(packageJson.dependencies || {});
      projectInfo.scripts = Object.keys(packageJson.scripts || {});
      
      if (files.includes('yarn.lock')) {
        projectInfo.packageManager = 'yarn';
      } else if (files.includes('pnpm-lock.yaml')) {
        projectInfo.packageManager = 'pnpm';
      } else {
        projectInfo.packageManager = 'npm';
      }
    } else if (files.includes('requirements.txt') || files.includes('pyproject.toml')) {
      projectInfo.packageManager = 'pip';
    } else if (files.includes('poetry.lock')) {
      projectInfo.packageManager = 'poetry';
    } else if (files.includes('pom.xml')) {
      projectInfo.packageManager = 'maven';
    } else if (files.includes('build.gradle')) {
      projectInfo.packageManager = 'gradle';
    } else if (files.includes('Cargo.toml')) {
      projectInfo.packageManager = 'cargo';
    } else if (files.includes('go.mod')) {
      projectInfo.packageManager = 'go-mod';
    }
  }

  private async detectProjectType(projectInfo: ProjectInfo): Promise<void> {
    if (projectInfo.packageManager === 'npm' || projectInfo.packageManager === 'yarn' || projectInfo.packageManager === 'pnpm') {
      const packageJson = await fs.readJson(path.join(this.currentPath, 'package.json'));
      const dependencies = { ...packageJson.dependencies, ...packageJson.devDependencies };
      
      if (dependencies['next']) {
        projectInfo.type = 'nextjs';
        projectInfo.framework = 'Next.js';
      } else if (dependencies['nuxt']) {
        projectInfo.type = 'nuxt';
        projectInfo.framework = 'Nuxt.js';
      } else if (dependencies['react']) {
        projectInfo.type = 'react';
        projectInfo.framework = 'React';
      } else if (dependencies['vue']) {
        projectInfo.type = 'vue';
        projectInfo.framework = 'Vue.js';
      } else if (dependencies['@angular/core']) {
        projectInfo.type = 'angular';
        projectInfo.framework = 'Angular';
      } else if (dependencies['svelte']) {
        projectInfo.type = 'svelte';
        projectInfo.framework = 'Svelte';
      } else {
        projectInfo.type = 'node';
        projectInfo.framework = 'Node.js';
      }
    } else if (projectInfo.packageManager === 'pip' || projectInfo.packageManager === 'poetry') {
      projectInfo.type = 'python';
      projectInfo.framework = 'Python';
    } else if (projectInfo.packageManager === 'maven' || projectInfo.packageManager === 'gradle') {
      projectInfo.type = 'java';
      projectInfo.framework = 'Java';
    } else if (projectInfo.packageManager === 'cargo') {
      projectInfo.type = 'rust';
      projectInfo.framework = 'Rust';
    } else if (projectInfo.packageManager === 'go-mod') {
      projectInfo.type = 'go';
      projectInfo.framework = 'Go';
    }
  }

  private async detectLanguage(projectInfo: ProjectInfo): Promise<void> {
    const files = await glob('**/*', { cwd: this.currentPath, nodir: true });
    const extensions = new Set(files.map(file => path.extname(file)));
    
    if (extensions.has('.ts') || extensions.has('.tsx')) {
      projectInfo.language = 'TypeScript';
    } else if (extensions.has('.js') || extensions.has('.jsx')) {
      projectInfo.language = 'JavaScript';
    } else if (extensions.has('.py')) {
      projectInfo.language = 'Python';
    } else if (extensions.has('.java')) {
      projectInfo.language = 'Java';
    } else if (extensions.has('.cs')) {
      projectInfo.language = 'C#';
    } else if (extensions.has('.go')) {
      projectInfo.language = 'Go';
    } else if (extensions.has('.rs')) {
      projectInfo.language = 'Rust';
    } else if (extensions.has('.php')) {
      projectInfo.language = 'PHP';
    } else if (extensions.has('.rb')) {
      projectInfo.language = 'Ruby';
    } else if (extensions.has('.swift')) {
      projectInfo.language = 'Swift';
    } else if (extensions.has('.kt')) {
      projectInfo.language = 'Kotlin';
    } else if (extensions.has('.dart')) {
      projectInfo.language = 'Dart';
    } else {
      projectInfo.language = 'Unknown';
    }
  }

  private async detectFramework(projectInfo: ProjectInfo): Promise<void> {
    if (projectInfo.framework !== 'unknown') return;

    // Check for specific framework files
    const files = await fs.readdir(this.currentPath);
    
    if (files.includes('next.config.js') || files.includes('next.config.ts')) {
      projectInfo.framework = 'Next.js';
    } else if (files.includes('nuxt.config.js') || files.includes('nuxt.config.ts')) {
      projectInfo.framework = 'Nuxt.js';
    } else if (files.includes('vue.config.js')) {
      projectInfo.framework = 'Vue.js';
    } else if (files.includes('angular.json')) {
      projectInfo.framework = 'Angular';
    } else if (files.includes('svelte.config.js')) {
      projectInfo.framework = 'Svelte';
    } else if (files.includes('Django') || files.includes('django')) {
      projectInfo.framework = 'Django';
    } else if (files.includes('Flask') || files.includes('flask')) {
      projectInfo.framework = 'Flask';
    } else if (files.includes('FastAPI') || files.includes('fastapi')) {
      projectInfo.framework = 'FastAPI';
    } else if (files.includes('Spring') || files.includes('spring')) {
      projectInfo.framework = 'Spring';
    } else if (files.includes('Laravel') || files.includes('laravel')) {
      projectInfo.framework = 'Laravel';
    } else if (files.includes('Symfony') || files.includes('symfony')) {
      projectInfo.framework = 'Symfony';
    }
  }

  private async detectDependencies(projectInfo: ProjectInfo): Promise<void> {
    if (projectInfo.packageManager === 'npm' || projectInfo.packageManager === 'yarn' || projectInfo.packageManager === 'pnpm') {
      const packageJson = await fs.readJson(path.join(this.currentPath, 'package.json'));
      projectInfo.dependencies = Object.keys({ ...packageJson.dependencies, ...packageJson.devDependencies });
    } else if (projectInfo.packageManager === 'pip') {
      const requirementsPath = path.join(this.currentPath, 'requirements.txt');
      if (await fs.pathExists(requirementsPath)) {
        const content = await fs.readFile(requirementsPath, 'utf-8');
        projectInfo.dependencies = content.split('\n')
          .map(line => line.trim())
          .filter(line => line && !line.startsWith('#'))
          .map(line => line.split('==')[0].split('>=')[0].split('<=')[0]);
      }
    }
  }

  private async detectScripts(projectInfo: ProjectInfo): Promise<void> {
    if (projectInfo.packageManager === 'npm' || projectInfo.packageManager === 'yarn' || projectInfo.packageManager === 'pnpm') {
      const packageJson = await fs.readJson(path.join(this.currentPath, 'package.json'));
      projectInfo.scripts = Object.keys(packageJson.scripts || {});
    }
  }

  private async detectGit(projectInfo: ProjectInfo): Promise<void> {
    const gitPath = path.join(this.currentPath, '.git');
    projectInfo.hasGit = await fs.pathExists(gitPath);
    
    if (projectInfo.hasGit) {
      try {
        const { execSync } = require('child_process');
        projectInfo.gitBranch = execSync('git branch --show-current', { encoding: 'utf-8' }).trim();
      } catch (error) {
        // Git command failed, but we know git exists
      }
    }
  }

  private async detectDocker(projectInfo: ProjectInfo): Promise<void> {
    const dockerFiles = ['Dockerfile', 'docker-compose.yml', 'docker-compose.yaml'];
    const files = await fs.readdir(this.currentPath);
    projectInfo.hasDocker = dockerFiles.some(file => files.includes(file));
  }

  private async detectTests(projectInfo: ProjectInfo): Promise<void> {
    const testFiles = await glob('**/*.{test,spec}.{js,ts,jsx,tsx,py,java,cs,go,rs}', { cwd: this.currentPath });
    projectInfo.hasTests = testFiles.length > 0;
    
    if (projectInfo.hasTests) {
      const packageJson = await fs.readJson(path.join(this.currentPath, 'package.json'));
      const dependencies = { ...packageJson.dependencies, ...packageJson.devDependencies };
      
      if (dependencies['jest']) {
        projectInfo.testFramework = 'Jest';
      } else if (dependencies['mocha']) {
        projectInfo.testFramework = 'Mocha';
      } else if (dependencies['vitest']) {
        projectInfo.testFramework = 'Vitest';
      } else if (dependencies['pytest']) {
        projectInfo.testFramework = 'pytest';
      } else if (dependencies['unittest']) {
        projectInfo.testFramework = 'unittest';
      } else if (dependencies['junit']) {
        projectInfo.testFramework = 'JUnit';
      }
    }
  }
}
