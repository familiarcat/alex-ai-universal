/**
 * Advanced Web Project Builder for Alex AI Universal
 * Phase 2 Implementation: Enhanced Web Project Builder
 * 
 * This module implements advanced web project building capabilities including:
 * - Comprehensive project template system
 * - Multi-framework build and deployment
 * - Advanced project customization
 * - Web-specific crew features
 */

import { AlexAICrewMember } from '@alex-ai/core';
import * as fs from 'fs-extra';
import * as path from 'path';

export interface ProjectTemplate {
  id: string;
  name: string;
  description: string;
  framework: string;
  category: ProjectCategory;
  complexity: 'beginner' | 'intermediate' | 'advanced';
  features: string[];
  dependencies: Dependency[];
  structure: ProjectStructure;
  configs: ConfigFile[];
  scripts: ProjectScript[];
}

export interface ProjectCategory {
  type: 'frontend' | 'backend' | 'fullstack' | 'mobile' | 'desktop' | 'library' | 'tool';
  tags: string[];
}

export interface Dependency {
  name: string;
  version: string;
  type: 'production' | 'development' | 'peer';
  category: 'framework' | 'ui' | 'utility' | 'testing' | 'build' | 'linting';
}

export interface ProjectStructure {
  directories: Directory[];
  files: ProjectFile[];
}

export interface Directory {
  name: string;
  path: string;
  description: string;
  required: boolean;
}

export interface ProjectFile {
  name: string;
  path: string;
  content: string;
  description: string;
  required: boolean;
  template: boolean;
}

export interface ConfigFile {
  name: string;
  content: string;
  description: string;
  required: boolean;
}

export interface ProjectScript {
  name: string;
  command: string;
  description: string;
  category: 'build' | 'test' | 'dev' | 'deploy' | 'lint';
}

export interface ProjectCustomization {
  name: string;
  description: string;
  options: CustomizationOption[];
}

export interface CustomizationOption {
  id: string;
  name: string;
  description: string;
  type: 'boolean' | 'string' | 'select' | 'number';
  default: any;
  choices?: string[];
  validation?: (value: any) => boolean;
}

export interface BuildConfiguration {
  framework: string;
  bundler: string;
  transpiler: string;
  testing: string;
  linting: string;
  deployment: string;
  features: string[];
}

export class AdvancedProjectBuilder {
  private templates: Map<string, ProjectTemplate> = new Map();
  private crewMembers: Map<string, AlexAICrewMember> = new Map();
  private customizations: Map<string, ProjectCustomization> = new Map();

  constructor() {
    this.initializeCrewMembers();
    this.initializeTemplates();
    this.initializeCustomizations();
  }

  /**
   * Initialize crew members with web-specific capabilities
   * CORRECTED: All 9 crew members synchronized with Core system
   */
  private initializeCrewMembers(): void {
    // Enhanced crew members with web-specific expertise - ALL 9 MEMBERS
    
    this.crewMembers.set('picard', new AlexAICrewMember({
      name: 'Captain Jean-Luc Picard',
      role: 'Strategic Commander',
      expertise: ['project-architecture', 'strategic-planning', 'team-coordination'],
      webCapabilities: ['project-planning', 'architecture-design', 'scalability-planning']
    }));

    this.crewMembers.set('riker', new AlexAICrewMember({
      name: 'Commander William Riker',
      role: 'First Officer',
      expertise: ['tactical-operations', 'workflow-management', 'execution'],
      webCapabilities: ['project-coordination', 'workflow-optimization', 'team-management']
    }));

    this.crewMembers.set('data', new AlexAICrewMember({
      name: 'Commander Data',
      role: 'Operations Officer',
      expertise: ['data-analysis', 'logical-reasoning', 'performance-optimization'],
      webCapabilities: ['performance-analysis', 'data-structures', 'algorithm-optimization']
    }));

    this.crewMembers.set('laforge', new AlexAICrewMember({
      name: 'Lieutenant Commander Geordi La Forge',
      role: 'Chief Engineer',
      expertise: ['engineering-solutions', 'system-optimization', 'technical-architecture'],
      webCapabilities: ['build-systems', 'deployment-pipelines', 'infrastructure-setup']
    }));

    this.crewMembers.set('worf', new AlexAICrewMember({
      name: 'Lieutenant Worf',
      role: 'Security Officer',
      expertise: ['security-protocols', 'threat-assessment', 'compliance'],
      webCapabilities: ['web-security', 'authentication', 'data-protection']
    }));

    this.crewMembers.set('troi', new AlexAICrewMember({
      name: 'Counselor Deanna Troi',
      role: 'Ship\'s Counselor',
      expertise: ['user-experience', 'communication', 'team-dynamics'],
      webCapabilities: ['ui-ux-design', 'accessibility', 'user-research']
    }));

    this.crewMembers.set('crusher', new AlexAICrewMember({
      name: 'Dr. Beverly Crusher',
      role: 'Chief Medical Officer',
      expertise: ['system-health', 'diagnostics', 'wellness'],
      webCapabilities: ['application-health', 'performance-diagnostics', 'system-wellness']
    }));

    this.crewMembers.set('uhura', new AlexAICrewMember({
      name: 'Lieutenant Uhura',
      role: 'Communications Officer',
      expertise: ['communication', 'synchronization', 'integration'],
      webCapabilities: ['api-integration', 'communication-protocols', 'synchronization']
    }));

    this.crewMembers.set('quark', new AlexAICrewMember({
      name: 'Quark',
      role: 'Business Operations',
      expertise: ['cost-optimization', 'efficiency-analysis', 'business-metrics'],
      webCapabilities: ['performance-metrics', 'cost-analysis', 'business-optimization']
    }));

    console.log(`🖖 Advanced Web Project Builder: ${this.crewMembers.size} crew members initialized (synchronized with Core system)`);
  }

  /**
   * Initialize project templates
   */
  private initializeTemplates(): void {
    // React Templates
    this.addTemplate({
      id: 'react-basic',
      name: 'React Basic App',
      description: 'A basic React application with modern tooling',
      framework: 'react',
      category: { type: 'frontend', tags: ['react', 'javascript', 'spa'] },
      complexity: 'beginner',
      features: ['routing', 'state-management', 'testing', 'linting'],
      dependencies: [
        { name: 'react', version: '^18.2.0', type: 'production', category: 'framework' },
        { name: 'react-dom', version: '^18.2.0', type: 'production', category: 'framework' },
        { name: 'react-router-dom', version: '^6.8.0', type: 'production', category: 'framework' },
        { name: 'vite', version: '^4.1.0', type: 'development', category: 'build' },
        { name: 'jest', version: '^29.5.0', type: 'development', category: 'testing' },
        { name: 'eslint', version: '^8.36.0', type: 'development', category: 'linting' }
      ],
      structure: {
        directories: [
          { name: 'src', path: 'src', description: 'Source code directory', required: true },
          { name: 'components', path: 'src/components', description: 'React components', required: true },
          { name: 'pages', path: 'src/pages', description: 'Page components', required: true },
          { name: 'hooks', path: 'src/hooks', description: 'Custom React hooks', required: false },
          { name: 'utils', path: 'src/utils', description: 'Utility functions', required: false },
          { name: 'tests', path: 'tests', description: 'Test files', required: false }
        ],
        files: [
          {
            name: 'App.jsx',
            path: 'src/App.jsx',
            content: this.getReactAppTemplate(),
            description: 'Main React application component',
            required: true,
            template: true
          },
          {
            name: 'index.js',
            path: 'src/index.js',
            content: this.getReactIndexTemplate(),
            description: 'Application entry point',
            required: true,
            template: true
          },
          {
            name: 'package.json',
            path: 'package.json',
            content: this.getPackageJsonTemplate('react'),
            description: 'Project dependencies and scripts',
            required: true,
            template: true
          }
        ]
      },
      configs: [
        {
          name: 'vite.config.js',
          content: this.getViteConfigTemplate(),
          description: 'Vite build configuration',
          required: true
        },
        {
          name: '.eslintrc.js',
          content: this.getESLintConfigTemplate(),
          description: 'ESLint configuration',
          required: true
        }
      ],
      scripts: [
        { name: 'dev', command: 'vite', description: 'Start development server', category: 'dev' },
        { name: 'build', command: 'vite build', description: 'Build for production', category: 'build' },
        { name: 'test', command: 'jest', description: 'Run tests', category: 'test' },
        { name: 'lint', command: 'eslint src', description: 'Lint code', category: 'lint' }
      ]
    });

    // Next.js Template
    this.addTemplate({
      id: 'nextjs-fullstack',
      name: 'Next.js Full-Stack App',
      description: 'A full-stack Next.js application with API routes',
      framework: 'nextjs',
      category: { type: 'fullstack', tags: ['nextjs', 'react', 'api', 'ssr'] },
      complexity: 'intermediate',
      features: ['ssr', 'api-routes', 'routing', 'optimization'],
      dependencies: [
        { name: 'next', version: '^13.2.0', type: 'production', category: 'framework' },
        { name: 'react', version: '^18.2.0', type: 'production', category: 'framework' },
        { name: 'react-dom', version: '^18.2.0', type: 'production', category: 'framework' },
        { name: 'typescript', version: '^5.0.0', type: 'development', category: 'framework' },
        { name: 'tailwindcss', version: '^3.2.0', type: 'development', category: 'ui' },
        { name: 'jest', version: '^29.5.0', type: 'development', category: 'testing' }
      ],
      structure: {
        directories: [
          { name: 'src', path: 'src', description: 'Source code directory', required: true },
          { name: 'app', path: 'src/app', description: 'App router directory', required: true },
          { name: 'components', path: 'src/components', description: 'React components', required: true },
          { name: 'lib', path: 'src/lib', description: 'Utility libraries', required: false },
          { name: 'api', path: 'src/app/api', description: 'API routes', required: false },
          { name: 'public', path: 'public', description: 'Static assets', required: true }
        ],
        files: [
          {
            name: 'layout.tsx',
            path: 'src/app/layout.tsx',
            content: this.getNextjsLayoutTemplate(),
            description: 'Root layout component',
            required: true,
            template: true
          },
          {
            name: 'page.tsx',
            path: 'src/app/page.tsx',
            content: this.getNextjsPageTemplate(),
            description: 'Home page component',
            required: true,
            template: true
          },
          {
            name: 'package.json',
            path: 'package.json',
            content: this.getPackageJsonTemplate('nextjs'),
            description: 'Project dependencies and scripts',
            required: true,
            template: true
          }
        ]
      },
      configs: [
        {
          name: 'next.config.js',
          content: this.getNextjsConfigTemplate(),
          description: 'Next.js configuration',
          required: true
        },
        {
          name: 'tailwind.config.js',
          content: this.getTailwindConfigTemplate(),
          description: 'Tailwind CSS configuration',
          required: true
        },
        {
          name: 'tsconfig.json',
          content: this.getTSConfigTemplate(),
          description: 'TypeScript configuration',
          required: true
        }
      ],
      scripts: [
        { name: 'dev', command: 'next dev', description: 'Start development server', category: 'dev' },
        { name: 'build', command: 'next build', description: 'Build for production', category: 'build' },
        { name: 'start', command: 'next start', description: 'Start production server', category: 'deploy' },
        { name: 'test', command: 'jest', description: 'Run tests', category: 'test' }
      ]
    });

    // Vue.js Template
    this.addTemplate({
      id: 'vue-modern',
      name: 'Vue 3 Modern App',
      description: 'A modern Vue 3 application with Composition API',
      framework: 'vue',
      category: { type: 'frontend', tags: ['vue', 'javascript', 'composition-api'] },
      complexity: 'intermediate',
      features: ['composition-api', 'routing', 'state-management', 'typescript'],
      dependencies: [
        { name: 'vue', version: '^3.2.0', type: 'production', category: 'framework' },
        { name: 'vue-router', version: '^4.1.0', type: 'production', category: 'framework' },
        { name: 'pinia', version: '^2.0.0', type: 'production', category: 'framework' },
        { name: 'vite', version: '^4.1.0', type: 'development', category: 'build' },
        { name: 'typescript', version: '^5.0.0', type: 'development', category: 'framework' },
        { name: 'vitest', version: '^0.29.0', type: 'development', category: 'testing' }
      ],
      structure: {
        directories: [
          { name: 'src', path: 'src', description: 'Source code directory', required: true },
          { name: 'components', path: 'src/components', description: 'Vue components', required: true },
          { name: 'views', path: 'src/views', description: 'Page views', required: true },
          { name: 'stores', path: 'src/stores', description: 'Pinia stores', required: false },
          { name: 'composables', path: 'src/composables', description: 'Vue composables', required: false },
          { name: 'types', path: 'src/types', description: 'TypeScript types', required: false }
        ],
        files: [
          {
            name: 'App.vue',
            path: 'src/App.vue',
            content: this.getVueAppTemplate(),
            description: 'Main Vue application component',
            required: true,
            template: true
          },
          {
            name: 'main.ts',
            path: 'src/main.ts',
            content: this.getVueMainTemplate(),
            description: 'Application entry point',
            required: true,
            template: true
          },
          {
            name: 'package.json',
            path: 'package.json',
            content: this.getPackageJsonTemplate('vue'),
            description: 'Project dependencies and scripts',
            required: true,
            template: true
          }
        ]
      },
      configs: [
        {
          name: 'vite.config.ts',
          content: this.getViteVueConfigTemplate(),
          description: 'Vite configuration for Vue',
          required: true
        },
        {
          name: 'tsconfig.json',
          content: this.getTSConfigTemplate(),
          description: 'TypeScript configuration',
          required: true
        }
      ],
      scripts: [
        { name: 'dev', command: 'vite', description: 'Start development server', category: 'dev' },
        { name: 'build', command: 'vue-tsc && vite build', description: 'Build for production', category: 'build' },
        { name: 'test', command: 'vitest', description: 'Run tests', category: 'test' },
        { name: 'type-check', command: 'vue-tsc --noEmit', description: 'Type check', category: 'test' }
      ]
    });

    // Node.js Backend Template
    this.addTemplate({
      id: 'nodejs-api',
      name: 'Node.js API Server',
      description: 'A modern Node.js API server with Express and TypeScript',
      framework: 'nodejs',
      category: { type: 'backend', tags: ['nodejs', 'express', 'api', 'typescript'] },
      complexity: 'intermediate',
      features: ['api-routes', 'middleware', 'authentication', 'database'],
      dependencies: [
        { name: 'express', version: '^4.18.0', type: 'production', category: 'framework' },
        { name: 'cors', version: '^2.8.5', type: 'production', category: 'utility' },
        { name: 'helmet', version: '^6.0.0', type: 'production', category: 'utility' },
        { name: 'dotenv', version: '^16.0.0', type: 'production', category: 'utility' },
        { name: 'typescript', version: '^5.0.0', type: 'development', category: 'framework' },
        { name: 'nodemon', version: '^2.0.0', type: 'development', category: 'utility' },
        { name: 'jest', version: '^29.5.0', type: 'development', category: 'testing' }
      ],
      structure: {
        directories: [
          { name: 'src', path: 'src', description: 'Source code directory', required: true },
          { name: 'routes', path: 'src/routes', description: 'API routes', required: true },
          { name: 'middleware', path: 'src/middleware', description: 'Express middleware', required: false },
          { name: 'models', path: 'src/models', description: 'Data models', required: false },
          { name: 'utils', path: 'src/utils', description: 'Utility functions', required: false },
          { name: 'tests', path: 'tests', description: 'Test files', required: false }
        ],
        files: [
          {
            name: 'app.ts',
            path: 'src/app.ts',
            content: this.getExpressAppTemplate(),
            description: 'Express application setup',
            required: true,
            template: true
          },
          {
            name: 'server.ts',
            path: 'src/server.ts',
            content: this.getExpressServerTemplate(),
            description: 'Server entry point',
            required: true,
            template: true
          },
          {
            name: 'package.json',
            path: 'package.json',
            content: this.getPackageJsonTemplate('nodejs'),
            description: 'Project dependencies and scripts',
            required: true,
            template: true
          }
        ]
      },
      configs: [
        {
          name: 'tsconfig.json',
          content: this.getTSConfigTemplate(),
          description: 'TypeScript configuration',
          required: true
        },
        {
          name: '.env.example',
          content: this.getEnvExampleTemplate(),
          description: 'Environment variables example',
          required: true
        }
      ],
      scripts: [
        { name: 'dev', command: 'nodemon src/server.ts', description: 'Start development server', category: 'dev' },
        { name: 'build', command: 'tsc', description: 'Build TypeScript', category: 'build' },
        { name: 'start', command: 'node dist/server.js', description: 'Start production server', category: 'deploy' },
        { name: 'test', command: 'jest', description: 'Run tests', category: 'test' }
      ]
    });
  }

  /**
   * Initialize project customizations
   */
  private initializeCustomizations(): void {
    this.addCustomization({
      name: 'styling',
      description: 'Choose your styling solution',
      options: [
        {
          id: 'css',
          name: 'CSS',
          description: 'Vanilla CSS',
          type: 'boolean',
          default: true
        },
        {
          id: 'scss',
          name: 'SCSS',
          description: 'Sass/SCSS preprocessor',
          type: 'boolean',
          default: false
        },
        {
          id: 'tailwind',
          name: 'Tailwind CSS',
          description: 'Utility-first CSS framework',
          type: 'boolean',
          default: false
        },
        {
          id: 'styled-components',
          name: 'Styled Components',
          description: 'CSS-in-JS solution',
          type: 'boolean',
          default: false
        }
      ]
    });

    this.addCustomization({
      name: 'testing',
      description: 'Choose your testing framework',
      options: [
        {
          id: 'jest',
          name: 'Jest',
          description: 'JavaScript testing framework',
          type: 'boolean',
          default: true
        },
        {
          id: 'vitest',
          name: 'Vitest',
          description: 'Fast Vite-native testing',
          type: 'boolean',
          default: false
        },
        {
          id: 'cypress',
          name: 'Cypress',
          description: 'End-to-end testing',
          type: 'boolean',
          default: false
        }
      ]
    });

    this.addCustomization({
      name: 'linting',
      description: 'Choose your linting and formatting tools',
      options: [
        {
          id: 'eslint',
          name: 'ESLint',
          description: 'JavaScript/TypeScript linter',
          type: 'boolean',
          default: true
        },
        {
          id: 'prettier',
          name: 'Prettier',
          description: 'Code formatter',
          type: 'boolean',
          default: true
        },
        {
          id: 'husky',
          name: 'Husky',
          description: 'Git hooks',
          type: 'boolean',
          default: false
        }
      ]
    });
  }

  /**
   * Add a project template
   */
  private addTemplate(template: ProjectTemplate): void {
    this.templates.set(template.id, template);
  }

  /**
   * Add a project customization
   */
  private addCustomization(customization: ProjectCustomization): void {
    this.customizations.set(customization.name, customization);
  }

  /**
   * Get available templates
   */
  public getAvailableTemplates(): ProjectTemplate[] {
    return Array.from(this.templates.values());
  }

  /**
   * Get template by ID
   */
  public getTemplate(templateId: string): ProjectTemplate | undefined {
    return this.templates.get(templateId);
  }

  /**
   * Get available customizations
   */
  public getAvailableCustomizations(): ProjectCustomization[] {
    return Array.from(this.customizations.values());
  }

  /**
   * Build a project with crew analysis
   */
  public async buildProject(
    templateId: string,
    projectPath: string,
    customizations: Record<string, any> = {}
  ): Promise<BuildResult> {
    const template = this.getTemplate(templateId);
    if (!template) {
      throw new Error(`Template ${templateId} not found`);
    }

    console.log(`🚀 Building ${template.name} project...`);

    // Get crew analysis
    const crewAnalysis = await this.getCrewProjectAnalysis(template, customizations);

    // Create project structure
    await this.createProjectStructure(projectPath, template, customizations);

    // Generate configuration files
    await this.generateConfigurationFiles(projectPath, template, customizations);

    // Create documentation
    await this.createProjectDocumentation(projectPath, template, crewAnalysis);

    return {
      success: true,
      projectPath,
      template,
      crewAnalysis,
      customizations,
      generatedFiles: await this.getGeneratedFiles(projectPath)
    };
  }

  /**
   * Get crew project analysis
   */
  private async getCrewProjectAnalysis(
    template: ProjectTemplate,
    customizations: Record<string, any>
  ): Promise<CrewAnalysis> {
    const analysis: CrewAnalysis = {
      strategic: '',
      technical: '',
      engineering: '',
      security: '',
      userExperience: '',
      business: ''
    };

    // Captain Picard - Strategic Analysis
    const picardResponse = await this.crewMembers.get('picard')?.analyze({
      context: 'project-strategy',
      data: { template, customizations },
      request: 'Provide strategic analysis for this project setup'
    });
    analysis.strategic = picardResponse || 'Strategic analysis unavailable';

    // Commander Data - Technical Analysis
    const dataResponse = await this.crewMembers.get('data')?.analyze({
      context: 'technical-analysis',
      data: { template, customizations },
      request: 'Provide technical analysis and recommendations'
    });
    analysis.technical = dataResponse || 'Technical analysis unavailable';

    // Commander La Forge - Engineering Analysis
    const laforgeResponse = await this.crewMembers.get('laforge')?.analyze({
      context: 'engineering',
      data: { template, customizations },
      request: 'Provide engineering recommendations'
    });
    analysis.engineering = laforgeResponse || 'Engineering analysis unavailable';

    // Lieutenant Worf - Security Analysis
    const worfResponse = await this.crewMembers.get('worf')?.analyze({
      context: 'security',
      data: { template, customizations },
      request: 'Provide security analysis and recommendations'
    });
    analysis.security = worfResponse || 'Security analysis unavailable';

    // Counselor Troi - UX Analysis
    const troiResponse = await this.crewMembers.get('troi')?.analyze({
      context: 'user-experience',
      data: { template, customizations },
      request: 'Provide user experience recommendations'
    });
    analysis.userExperience = troiResponse || 'UX analysis unavailable';

    // Quark - Business Analysis
    const quarkResponse = await this.crewMembers.get('quark')?.analyze({
      context: 'business',
      data: { template, customizations },
      request: 'Provide business optimization recommendations'
    });
    analysis.business = quarkResponse || 'Business analysis unavailable';

    return analysis;
  }

  /**
   * Create project structure
   */
  private async createProjectStructure(
    projectPath: string,
    template: ProjectTemplate,
    customizations: Record<string, any>
  ): Promise<void> {
    // Create root directory
    await fs.ensureDir(projectPath);

    // Create directories
    for (const directory of template.structure.directories) {
      const dirPath = path.join(projectPath, directory.path);
      await fs.ensureDir(dirPath);
      console.log(`📁 Created directory: ${directory.path}`);
    }

    // Create files
    for (const file of template.structure.files) {
      const filePath = path.join(projectPath, file.path);
      let content = file.content;

      // Apply customizations to content
      content = this.applyCustomizations(content, customizations);

      await fs.writeFile(filePath, content);
      console.log(`📄 Created file: ${file.path}`);
    }
  }

  /**
   * Generate configuration files
   */
  private async generateConfigurationFiles(
    projectPath: string,
    template: ProjectTemplate,
    customizations: Record<string, any>
  ): Promise<void> {
    for (const config of template.configs) {
      const configPath = path.join(projectPath, config.name);
      let content = config.content;

      // Apply customizations to content
      content = this.applyCustomizations(content, customizations);

      await fs.writeFile(configPath, content);
      console.log(`⚙️ Created config: ${config.name}`);
    }
  }

  /**
   * Create project documentation
   */
  private async createProjectDocumentation(
    projectPath: string,
    template: ProjectTemplate,
    crewAnalysis: CrewAnalysis
  ): Promise<void> {
    const readmeContent = this.generateReadme(template, crewAnalysis);
    const readmePath = path.join(projectPath, 'README.md');
    await fs.writeFile(readmePath, readmeContent);
    console.log(`📚 Created documentation: README.md`);

    // Create project analysis document
    const analysisContent = this.generateProjectAnalysis(template, crewAnalysis);
    const analysisPath = path.join(projectPath, 'PROJECT_ANALYSIS.md');
    await fs.writeFile(analysisPath, analysisContent);
    console.log(`📊 Created analysis: PROJECT_ANALYSIS.md`);
  }

  /**
   * Apply customizations to content
   */
  private applyCustomizations(content: string, customizations: Record<string, any>): string {
    let customizedContent = content;

    // Apply styling customizations
    if (customizations.styling?.tailwind) {
      customizedContent = customizedContent.replace(
        /\/\/ Add Tailwind CSS/g,
        'import "tailwindcss/tailwind.css"'
      );
    }

    // Apply testing customizations
    if (customizations.testing?.vitest) {
      customizedContent = customizedContent.replace(
        /"jest"/g,
        '"vitest"'
      );
    }

    return customizedContent;
  }

  /**
   * Get generated files list
   */
  private async getGeneratedFiles(projectPath: string): Promise<string[]> {
    const files: string[] = [];
    
    const walkDir = async (dir: string): Promise<void> => {
      const entries = await fs.readdir(dir, { withFileTypes: true });
      
      for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);
        
        if (entry.isDirectory()) {
          await walkDir(fullPath);
        } else {
          files.push(path.relative(projectPath, fullPath));
        }
      }
    };

    await walkDir(projectPath);
    return files;
  }

  /**
   * Generate README content
   */
  private generateReadme(template: ProjectTemplate, crewAnalysis: CrewAnalysis): string {
    return `# ${template.name}

${template.description}

## 🚀 Quick Start

\`\`\`bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
\`\`\`

## 📋 Available Scripts

${template.scripts.map(script => `- **\`${script.name}\`**: ${script.description}`).join('\n')}

## 🏗️ Project Structure

${template.structure.directories.map(dir => `- **${dir.path}**: ${dir.description}`).join('\n')}

## 🖖 Alex AI Crew Analysis

### 🖖 Captain Picard - Strategic Analysis
${crewAnalysis.strategic}

### 🧠 Commander Data - Technical Analysis  
${crewAnalysis.technical}

### 🔧 Commander La Forge - Engineering Recommendations
${crewAnalysis.engineering}

### 🛡️ Lieutenant Worf - Security Analysis
${crewAnalysis.security}

### 🧘 Counselor Troi - User Experience
${crewAnalysis.userExperience}

### 💼 Quark - Business Optimization
${crewAnalysis.business}

## 📚 Documentation

For detailed project analysis and recommendations, see [PROJECT_ANALYSIS.md](./PROJECT_ANALYSIS.md).

---

*Project generated by Alex AI Advanced Web Project Builder*
`;
  }

  /**
   * Generate project analysis content
   */
  private generateProjectAnalysis(template: ProjectTemplate, crewAnalysis: CrewAnalysis): string {
    return `# Alex AI Project Analysis

## 📊 Project Overview

- **Template**: ${template.name}
- **Framework**: ${template.framework}
- **Complexity**: ${template.complexity}
- **Category**: ${template.category.type}

## 🔧 Technical Stack

### Dependencies
${template.dependencies.map(dep => `- **${dep.name}** (${dep.version}) - ${dep.category}`).join('\n')}

### Features
${template.features.map(feature => `- ✅ ${feature}`).join('\n')}

## 🖖 Crew Analysis

${Object.entries(crewAnalysis).map(([key, analysis]) => `
### ${key.charAt(0).toUpperCase() + key.slice(1)} Analysis
${analysis}
`).join('\n')}

---

*Analysis generated by Alex AI Advanced Web Project Builder*
`;
  }

  // Template content generators
  private getReactAppTemplate(): string {
    return `import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';

function App() {
  return (
    <Router>
      <div className="App">
        <header className="App-header">
          <h1>Welcome to React</h1>
          <Routes>
            <Route path="/" element={<Home />} />
          </Routes>
        </header>
      </div>
    </Router>
  );
}

function Home() {
  return (
    <div>
      <p>Hello, World! This is your React app.</p>
    </div>
  );
}

export default App;`;
  }

  private getReactIndexTemplate(): string {
    return `import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);

root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);`;
  }

  private getNextjsLayoutTemplate(): string {
    return `import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Next.js App',
  description: 'A modern Next.js application',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}`;
  }

  private getNextjsPageTemplate(): string {
    return `export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <div className="z-10 max-w-5xl w-full items-center justify-between font-mono text-sm lg:flex">
        <h1 className="text-4xl font-bold">Welcome to Next.js</h1>
      </div>
      <div className="relative flex place-items-center">
        <p className="text-lg">Your Next.js application is ready!</p>
      </div>
    </main>
  );
}`;
  }

  private getVueAppTemplate(): string {
    return `<template>
  <div id="app">
    <header>
      <h1>Welcome to Vue 3</h1>
    </header>
    <main>
      <router-view />
    </main>
  </div>
</template>

<script setup lang="ts">
import { RouterView } from 'vue-router';
</script>

<style scoped>
header {
  text-align: center;
  padding: 2rem;
}

main {
  padding: 2rem;
}
</style>`;
  }

  private getVueMainTemplate(): string {
    return `import { createApp } from 'vue';
import { createRouter, createWebHistory } from 'vue-router';
import App from './App.vue';
import './style.css';

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', component: () => import('./views/Home.vue') }
  ]
});

const app = createApp(App);
app.use(router);
app.mount('#app');`;
  }

  private getExpressAppTemplate(): string {
    return `import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const app = express();

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.get('/', (req, res) => {
  res.json({ message: 'Welcome to the API Server' });
});

app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

export default app;`;
  }

  private getExpressServerTemplate(): string {
    return `import app from './app';

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(\`🚀 Server running on port \${PORT}\`);
});`;
  }

  private getPackageJsonTemplate(framework: string): string {
    const templates: Record<string, string> = {
      react: `{
  "name": "react-app",
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview",
    "test": "jest",
    "lint": "eslint src"
  },
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "react-router-dom": "^6.8.0"
  },
  "devDependencies": {
    "@types/react": "^18.0.28",
    "@types/react-dom": "^18.0.11",
    "@vitejs/plugin-react": "^3.1.0",
    "vite": "^4.1.0",
    "jest": "^29.5.0",
    "eslint": "^8.36.0"
  }
}`,
      nextjs: `{
  "name": "nextjs-app",
  "version": "1.0.0",
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "test": "jest"
  },
  "dependencies": {
    "next": "^13.2.0",
    "react": "^18.2.0",
    "react-dom": "^18.2.0"
  },
  "devDependencies": {
    "@types/node": "^20.1.0",
    "@types/react": "^18.0.28",
    "@types/react-dom": "^18.0.11",
    "typescript": "^5.0.0",
    "tailwindcss": "^3.2.0",
    "jest": "^29.5.0"
  }
}`,
      vue: `{
  "name": "vue-app",
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vue-tsc && vite build",
    "preview": "vite preview",
    "test": "vitest",
    "type-check": "vue-tsc --noEmit"
  },
  "dependencies": {
    "vue": "^3.2.0",
    "vue-router": "^4.1.0",
    "pinia": "^2.0.0"
  },
  "devDependencies": {
    "@vitejs/plugin-vue": "^4.1.0",
    "typescript": "^5.0.0",
    "vite": "^4.1.0",
    "vue-tsc": "^1.1.0",
    "vitest": "^0.29.0"
  }
}`,
      nodejs: `{
  "name": "nodejs-api",
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "dev": "nodemon src/server.ts",
    "build": "tsc",
    "start": "node dist/server.js",
    "test": "jest"
  },
  "dependencies": {
    "express": "^4.18.0",
    "cors": "^2.8.5",
    "helmet": "^6.0.0",
    "dotenv": "^16.0.0"
  },
  "devDependencies": {
    "@types/express": "^4.17.17",
    "@types/cors": "^2.8.13",
    "@types/node": "^20.1.0",
    "typescript": "^5.0.0",
    "nodemon": "^2.0.0",
    "jest": "^29.5.0"
  }
}`
    };

    return templates[framework] || templates.react;
  }

  private getViteConfigTemplate(): string {
    return `import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    open: true
  },
  build: {
    outDir: 'dist',
    sourcemap: true
  }
});`;
  }

  private getViteVueConfigTemplate(): string {
    return `import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';

export default defineConfig({
  plugins: [vue()],
  server: {
    port: 3000,
    open: true
  },
  build: {
    outDir: 'dist',
    sourcemap: true
  }
});`;
  }

  private getNextjsConfigTemplate(): string {
    return `/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    appDir: true,
  },
  images: {
    domains: [],
  },
};

module.exports = nextConfig;`;
  }

  private getTailwindConfigTemplate(): string {
    return `/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}`;
  }

  private getTSConfigTemplate(): string {
    return `{
  "compilerOptions": {
    "target": "ES2020",
    "useDefineForClassFields": true,
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx",
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true
  },
  "include": ["src"],
  "references": [{ "path": "./tsconfig.node.json" }]
}`;
  }

  private getESLintConfigTemplate(): string {
    return `module.exports = {
  env: {
    browser: true,
    es2021: true,
    node: true,
  },
  extends: [
    'eslint:recommended',
    '@typescript-eslint/recommended',
  ],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
  },
  plugins: ['@typescript-eslint'],
  rules: {
    'no-console': 'warn',
    'no-unused-vars': 'error',
  },
};`;
  }

  private getEnvExampleTemplate(): string {
    return `# Environment Variables
PORT=3000
NODE_ENV=development

# Database
DATABASE_URL=your_database_url_here

# API Keys
API_KEY=your_api_key_here

# Security
JWT_SECRET=your_jwt_secret_here`;
  }
}

// Types for the build result
export interface BuildResult {
  success: boolean;
  projectPath: string;
  template: ProjectTemplate;
  crewAnalysis: CrewAnalysis;
  customizations: Record<string, any>;
  generatedFiles: string[];
}

export interface CrewAnalysis {
  strategic: string;
  technical: string;
  engineering: string;
  security: string;
  userExperience: string;
  business: string;
}
