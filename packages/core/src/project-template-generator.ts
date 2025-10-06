/**
 * Alex AI Project Template Generator
 * 
 * This module generates project templates with universal Alex AI capabilities
 * pre-integrated for easy project initialization.
 */

import { UniversalKnowledgeDistribution, UniversalFeatureSet } from './universal-knowledge-distribution';

export interface ProjectTemplate {
  name: string;
  type: 'nextjs' | 'react' | 'node' | 'typescript' | 'python' | 'universal';
  description: string;
  alexAIFeatures: UniversalFeatureSet;
  dependencies: { [key: string]: string };
  scripts: { [key: string]: string };
  configuration: any;
  setupInstructions: string[];
  examples: any[];
}

export class ProjectTemplateGenerator {
  private universalKnowledge: UniversalKnowledgeDistribution;

  constructor(universalKnowledge: UniversalKnowledgeDistribution) {
    this.universalKnowledge = universalKnowledge;
  }

  /**
   * Generate Next.js project template with Alex AI integration
   */
  generateNextJSTemplate(projectName: string): ProjectTemplate {
    const universalFeatures = this.universalKnowledge.getUniversalFeatures();
    
    return {
      name: `${projectName}-alex-ai`,
      type: 'nextjs',
      description: `Next.js project with full Alex AI Universal capabilities`,
      alexAIFeatures: universalFeatures,
      dependencies: {
        'next': '^14.0.0',
        'react': '^18.0.0',
        'react-dom': '^18.0.0',
        '@alex-ai/core': '^1.0.0',
        '@alex-ai/messages-intelligence': '^1.0.0',
        '@supabase/supabase-js': '^2.58.0',
        'typescript': '^5.0.0',
        '@types/react': '^18.0.0',
        '@types/node': '^20.0.0'
      },
      scripts: {
        'dev': 'next dev',
        'build': 'next build',
        'start': 'next start',
        'alex-ai:init': 'alex-ai universal-init',
        'alex-ai:sync': 'alex-ai universal-sync',
        'alex-ai:monitor': 'alex-ai universal-monitor',
        'alex-ai:crew': 'alex-ai crew-engage',
        'alex-ai:chat': 'alex-ai chat-capture'
      },
      configuration: {
        nextConfig: {
          experimental: {
            serverComponentsExternalPackages: ['@alex-ai/core', '@alex-ai/messages-intelligence']
          }
        },
        tsconfig: {
          compilerOptions: {
            target: 'ES2020',
            lib: ['dom', 'dom.iterable', 'es6'],
            allowJs: true,
            skipLibCheck: true,
            strict: true,
            forceConsistentCasingInFileNames: true,
            noEmit: true,
            esModuleInterop: true,
            module: 'esnext',
            moduleResolution: 'node',
            resolveJsonModule: true,
            isolatedModules: true,
            jsx: 'preserve',
            incremental: true,
            plugins: [
              {
                name: 'next'
              }
            ]
          },
          include: ['next-env.d.ts', '**/*.ts', '**/*.tsx', '.next/types/**/*.ts'],
          exclude: ['node_modules']
        }
      },
      setupInstructions: [
        '1. Run `npm install` to install dependencies',
        '2. Set up environment variables (SUPABASE_URL, SUPABASE_ANON_KEY, N8N_WEBHOOK_URL)',
        '3. Run `npm run alex-ai:init` to initialize Alex AI Universal capabilities',
        '4. Run `npm run dev` to start development server',
        '5. Visit http://localhost:3000/alex-ai to access Alex AI dashboard'
      ],
      examples: [
        {
          name: 'Alex AI Integration Example',
          file: 'pages/alex-ai-example.tsx',
          content: `
import { useEffect, useState } from 'react';
import { UniversalKnowledgeDistribution } from '@alex-ai/core';

export default function AlexAIExample() {
  const [alexAI, setAlexAI] = useState(null);
  const [crewMembers, setCrewMembers] = useState([]);

  useEffect(() => {
    // Initialize Alex AI Universal capabilities
    const initAlexAI = async () => {
      const universalKnowledge = new UniversalKnowledgeDistribution({
        supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL,
        supabaseKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
        n8nWebhookUrl: process.env.NEXT_PUBLIC_N8N_WEBHOOK_URL,
        enableUniversalSync: true,
        enableCrewKnowledgeSharing: true,
        enableN8NIntegration: true,
        enableChatCapturing: true
      });

      // Register this Next.js project
      await universalKnowledge.registerProject({
        projectId: '${projectName}-nextjs',
        projectName: '${projectName} Next.js Project',
        capabilities: ['nextjs', 'react', 'alex-ai-universal']
      });

      setAlexAI(universalKnowledge);
      setCrewMembers(universalKnowledge.getUniversalFeatures().crewAI.members);
    };

    initAlexAI();
  }, []);

  return (
    <div className="alex-ai-dashboard">
      <h1>🖖 Alex AI Universal Dashboard</h1>
      <div className="crew-members">
        <h2>Active Crew Members:</h2>
        {crewMembers.map((member, index) => (
          <div key={index} className="crew-member">
            <strong>{member}</strong>
          </div>
        ))}
      </div>
      <div className="features">
        <h2>Universal Features:</h2>
        <ul>
          <li>✅ Chat Capturing</li>
          <li>✅ N8N Integration</li>
          <li>✅ Crew AI Analysis</li>
          <li>✅ RAG System</li>
          <li>✅ Monitoring Dashboard</li>
        </ul>
      </div>
    </div>
  );
}`
        }
      ]
    };
  }

  /**
   * Generate Node.js project template with Alex AI integration
   */
  generateNodeJSTemplate(projectName: string): ProjectTemplate {
    const universalFeatures = this.universalKnowledge.getUniversalFeatures();
    
    return {
      name: `${projectName}-alex-ai`,
      type: 'node',
      description: `Node.js project with full Alex AI Universal capabilities`,
      alexAIFeatures: universalFeatures,
      dependencies: {
        '@alex-ai/core': '^1.0.0',
        '@alex-ai/messages-intelligence': '^1.0.0',
        '@supabase/supabase-js': '^2.58.0',
        'typescript': '^5.0.0',
        '@types/node': '^20.0.0',
        'express': '^4.18.0',
        'cors': '^2.8.5',
        'dotenv': '^16.0.0'
      },
      scripts: {
        'dev': 'ts-node src/index.ts',
        'build': 'tsc',
        'start': 'node dist/index.js',
        'alex-ai:init': 'alex-ai universal-init',
        'alex-ai:sync': 'alex-ai universal-sync',
        'alex-ai:monitor': 'alex-ai universal-monitor',
        'alex-ai:crew': 'alex-ai crew-engage',
        'alex-ai:chat': 'alex-ai chat-capture'
      },
      configuration: {
        packageJson: {
          type: 'module',
          main: 'dist/index.js',
          types: 'dist/index.d.ts'
        },
        tsconfig: {
          compilerOptions: {
            target: 'ES2020',
            module: 'ESNext',
            moduleResolution: 'node',
            strict: true,
            esModuleInterop: true,
            skipLibCheck: true,
            forceConsistentCasingInFileNames: true,
            outDir: './dist',
            rootDir: './src'
          },
          include: ['src/**/*'],
          exclude: ['node_modules', 'dist']
        }
      },
      setupInstructions: [
        '1. Run `npm install` to install dependencies',
        '2. Create .env file with SUPABASE_URL, SUPABASE_ANON_KEY, N8N_WEBHOOK_URL',
        '3. Run `npm run alex-ai:init` to initialize Alex AI Universal capabilities',
        '4. Run `npm run dev` to start development server',
        '5. Access Alex AI API at http://localhost:3000/alex-ai'
      ],
      examples: [
        {
          name: 'Alex AI Server Example',
          file: 'src/index.ts',
          content: `
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { UniversalKnowledgeDistribution } from '@alex-ai/core';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Initialize Alex AI Universal capabilities
const universalKnowledge = new UniversalKnowledgeDistribution({
  supabaseUrl: process.env.SUPABASE_URL!,
  supabaseKey: process.env.SUPABASE_ANON_KEY!,
  n8nWebhookUrl: process.env.N8N_WEBHOOK_URL!,
  enableUniversalSync: true,
  enableCrewKnowledgeSharing: true,
  enableN8NIntegration: true,
  enableChatCapturing: true
});

app.use(cors());
app.use(express.json());

// Register this Node.js project
await universalKnowledge.registerProject({
  projectId: '${projectName}-nodejs',
  projectName: '${projectName} Node.js Project',
  capabilities: ['nodejs', 'express', 'alex-ai-universal']
});

// Alex AI API endpoints
app.get('/alex-ai/status', (req, res) => {
  const features = universalKnowledge.getUniversalFeatures();
  res.json({
    status: 'active',
    project: '${projectName}-nodejs',
    features: features,
    crewMembers: features.crewAI.members
  });
});

app.post('/alex-ai/crew-engage', async (req, res) => {
  try {
    const { analysisRequest } = req.body;
    // Engage crew for analysis
    res.json({ message: 'Crew engagement initiated', request: analysisRequest });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/alex-ai/chat-capture', async (req, res) => {
  try {
    const { conversationData } = req.body;
    // Capture conversation with universal features
    res.json({ message: 'Conversation captured', data: conversationData });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.listen(PORT, () => {
  console.log(\`🖖 Alex AI Universal Server running on port \${PORT}\`);
  console.log(\`📊 Dashboard available at http://localhost:\${PORT}/alex-ai/status\`);
});`
        }
      ]
    };
  }

  /**
   * Generate universal project template (framework agnostic)
   */
  generateUniversalTemplate(projectName: string): ProjectTemplate {
    const universalFeatures = this.universalKnowledge.getUniversalFeatures();
    
    return {
      name: `${projectName}-alex-ai-universal`,
      type: 'universal',
      description: `Universal project template with Alex AI capabilities for any framework`,
      alexAIFeatures: universalFeatures,
      dependencies: {
        '@alex-ai/core': '^1.0.0',
        '@alex-ai/messages-intelligence': '^1.0.0',
        '@supabase/supabase-js': '^2.58.0',
        'typescript': '^5.0.0'
      },
      scripts: {
        'alex-ai:init': 'alex-ai universal-init',
        'alex-ai:sync': 'alex-ai universal-sync',
        'alex-ai:monitor': 'alex-ai universal-monitor',
        'alex-ai:crew': 'alex-ai crew-engage',
        'alex-ai:chat': 'alex-ai chat-capture',
        'alex-ai:generate': 'alex-ai generate-integration'
      },
      configuration: {
        alexAI: {
          universalSync: true,
          crewKnowledgeSharing: true,
          n8nIntegration: true,
          chatCapturing: true
        }
      },
      setupInstructions: [
        '1. Install Alex AI Universal dependencies',
        '2. Set up environment variables',
        '3. Run `npm run alex-ai:init` to initialize',
        '4. Run `npm run alex-ai:generate` to generate integration code',
        '5. Integrate generated code into your project'
      ],
      examples: [
        {
          name: 'Universal Integration Code',
          file: 'alex-ai-integration.ts',
          content: this.universalKnowledge.generateUniversalIntegrationCode(projectName)
        }
      ]
    };
  }

  /**
   * Generate project template based on type
   */
  generateTemplate(projectName: string, type: ProjectTemplate['type']): ProjectTemplate {
    switch (type) {
      case 'nextjs':
        return this.generateNextJSTemplate(projectName);
      case 'node':
        return this.generateNodeJSTemplate(projectName);
      case 'universal':
        return this.generateUniversalTemplate(projectName);
      default:
        return this.generateUniversalTemplate(projectName);
    }
  }

  /**
   * Generate all project templates
   */
  generateAllTemplates(projectName: string): { [key: string]: ProjectTemplate } {
    return {
      nextjs: this.generateNextJSTemplate(projectName),
      nodejs: this.generateNodeJSTemplate(projectName),
      universal: this.generateUniversalTemplate(projectName)
    };
  }

  /**
   * Save template to file system
   */
  async saveTemplate(template: ProjectTemplate, outputPath: string): Promise<void> {
    const fs = await import('fs-extra');
    const path = await import('path');

    // Create template directory
    await fs.ensureDir(outputPath);

    // Save template configuration
    await fs.writeJson(
      path.join(outputPath, 'alex-ai-template.json'),
      template,
      { spaces: 2 }
    );

    // Save package.json
    const packageJson = {
      name: template.name,
      version: '1.0.0',
      description: template.description,
      main: 'index.js',
      scripts: template.scripts,
      dependencies: template.dependencies,
      keywords: ['alex-ai', 'universal', 'crew-ai', 'n8n', 'rag'],
      author: 'Alex AI Universal',
      license: 'MIT'
    };

    await fs.writeJson(
      path.join(outputPath, 'package.json'),
      packageJson,
      { spaces: 2 }
    );

    // Save setup instructions
    await fs.writeFile(
      path.join(outputPath, 'ALEX_AI_SETUP.md'),
      `# Alex AI Universal Setup\n\n${template.setupInstructions.map((step, index) => `${index + 1}. ${step}`).join('\n')}\n\n## Universal Features\n\n- Chat Capturing: ${template.alexAIFeatures.chatCapturing.enabled ? '✅' : '❌'}\n- N8N Integration: ${template.alexAIFeatures.n8nIntegration.enabled ? '✅' : '❌'}\n- Crew AI: ${template.alexAIFeatures.crewAI.enabled ? '✅' : '❌'}\n- RAG System: ${template.alexAIFeatures.ragSystem.enabled ? '✅' : '❌'}\n- Monitoring: ${template.alexAIFeatures.monitoring.enabled ? '✅' : '❌'}\n`
    );

    // Save example files
    for (const example of template.examples) {
      const examplePath = path.join(outputPath, 'examples', example.file);
      await fs.ensureDir(path.dirname(examplePath));
      await fs.writeFile(examplePath, example.content);
    }

    console.log(`✅ Alex AI template saved to: ${outputPath}`);
  }
}

