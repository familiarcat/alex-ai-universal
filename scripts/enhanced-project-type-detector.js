#!/usr/bin/env node

/**
 * 🧠 Enhanced Project Type Detector
 * 
 * Detects project type with hierarchical tiers:
 * - Tier 1: Category (framework, application, library, tool, monorepo)
 * - Tier 2: Technology (nextjs, react, vue, etc.)
 * - Tier 3: Language (typescript, javascript, python, etc.)
 */

const fs = require('fs');
const path = require('path');

// Project type tiers
const PROJECT_TIERS = {
  // Tier 1: Category
  CATEGORY: {
    FRAMEWORK: 'framework',      // Full-stack frameworks (Next.js, Nuxt, etc.)
    APPLICATION: 'application',   // Standalone applications
    LIBRARY: 'library',           // Reusable libraries/packages
    TOOL: 'tool',                 // CLI tools, utilities
    MONOREPO: 'monorepo',         // Monorepo structure
    UNKNOWN: 'unknown'
  },
  
  // Tier 2: Technology/Framework
  TECHNOLOGY: {
    // Web Frameworks
    NEXTJS: 'nextjs',
    NUXT: 'nuxt',
    REMIX: 'remix',
    SVELTEKIT: 'sveltekit',
    // UI Frameworks
    REACT: 'react',
    VUE: 'vue',
    ANGULAR: 'angular',
    SVELTE: 'svelte',
    // Backend Frameworks
    EXPRESS: 'express',
    FASTIFY: 'fastify',
    NESTJS: 'nestjs',
    // Python Frameworks
    DJANGO: 'django',
    FLASK: 'flask',
    FASTAPI: 'fastapi',
    // Other
    NODE: 'node',
    PYTHON: 'python',
    RUST: 'rust',
    GO: 'go',
    JAVA: 'java',
    UNKNOWN: 'unknown'
  },
  
  // Tier 3: Language
  LANGUAGE: {
    TYPESCRIPT: 'typescript',
    JAVASCRIPT: 'javascript',
    PYTHON: 'python',
    RUST: 'rust',
    GO: 'go',
    JAVA: 'java',
    UNKNOWN: 'unknown'
  }
};

class EnhancedProjectTypeDetector {
  constructor(projectPath = process.cwd()) {
    this.projectPath = projectPath;
  }

  detect() {
    const result = {
      category: PROJECT_TIERS.CATEGORY.UNKNOWN,
      technology: PROJECT_TIERS.TECHNOLOGY.UNKNOWN,
      language: PROJECT_TIERS.LANGUAGE.UNKNOWN,
      isMonorepo: false,
      packageManager: 'unknown',
      confidence: 0
    };

    // Check for monorepo first
    if (this.isMonorepo()) {
      result.category = PROJECT_TIERS.CATEGORY.MONOREPO;
      result.isMonorepo = true;
      result.confidence += 30;
    }

    // Detect package manager
    result.packageManager = this.detectPackageManager();
    if (result.packageManager !== 'unknown') {
      result.confidence += 20;
    }

    // Detect technology and language from package.json
    if (fs.existsSync(path.join(this.projectPath, 'package.json'))) {
      const packageJson = JSON.parse(fs.readFileSync(path.join(this.projectPath, 'package.json'), 'utf8'));
      const deps = { ...packageJson.dependencies, ...packageJson.devDependencies };
      
      // Detect framework/technology
      const tech = this.detectTechnology(deps, packageJson);
      result.technology = tech.technology;
      result.language = tech.language;
      result.category = tech.category || result.category;
      result.confidence += tech.confidence || 0;
    }

    // Detect from other files
    const fileBased = this.detectFromFiles();
    if (fileBased.technology !== PROJECT_TIERS.TECHNOLOGY.UNKNOWN) {
      result.technology = fileBased.technology;
      result.confidence += 10;
    }

    return result;
  }

  isMonorepo() {
    return (
      (fs.existsSync(path.join(this.projectPath, 'package.json')) && 
       fs.existsSync(path.join(this.projectPath, 'turbo.json'))) ||
      fs.existsSync(path.join(this.projectPath, 'pnpm-workspace.yaml')) ||
      fs.existsSync(path.join(this.projectPath, 'lerna.json')) ||
      fs.existsSync(path.join(this.projectPath, 'nx.json'))
    );
  }

  detectPackageManager() {
    if (fs.existsSync(path.join(this.projectPath, 'pnpm-lock.yaml'))) return 'pnpm';
    if (fs.existsSync(path.join(this.projectPath, 'package-lock.json'))) return 'npm';
    if (fs.existsSync(path.join(this.projectPath, 'yarn.lock'))) return 'yarn';
    if (fs.existsSync(path.join(this.projectPath, 'bun.lockb'))) return 'bun';
    if (fs.existsSync(path.join(this.projectPath, 'requirements.txt'))) return 'pip';
    if (fs.existsSync(path.join(this.projectPath, 'Cargo.toml'))) return 'cargo';
    if (fs.existsSync(path.join(this.projectPath, 'go.mod'))) return 'go';
    return 'unknown';
  }

  detectTechnology(deps, packageJson) {
    let technology = PROJECT_TIERS.TECHNOLOGY.UNKNOWN;
    let language = PROJECT_TIERS.LANGUAGE.UNKNOWN;
    let category = null;
    let confidence = 0;

    // Full-stack frameworks (Tier 1: FRAMEWORK)
    if (deps.next) {
      technology = PROJECT_TIERS.TECHNOLOGY.NEXTJS;
      category = PROJECT_TIERS.CATEGORY.FRAMEWORK;
      language = PROJECT_TIERS.LANGUAGE.TYPESCRIPT; // Next.js defaults to TS
      confidence = 50;
    } else if (deps.nuxt || deps['@nuxt/core']) {
      technology = PROJECT_TIERS.TECHNOLOGY.NUXT;
      category = PROJECT_TIERS.CATEGORY.FRAMEWORK;
      language = PROJECT_TIERS.LANGUAGE.JAVASCRIPT;
      confidence = 50;
    } else if (deps.remix || deps['@remix-run/node']) {
      technology = PROJECT_TIERS.TECHNOLOGY.REMIX;
      category = PROJECT_TIERS.CATEGORY.FRAMEWORK;
      language = PROJECT_TIERS.LANGUAGE.TYPESCRIPT;
      confidence = 50;
    } else if (deps['@sveltejs/kit']) {
      technology = PROJECT_TIERS.TECHNOLOGY.SVELTEKIT;
      category = PROJECT_TIERS.CATEGORY.FRAMEWORK;
      language = PROJECT_TIERS.LANGUAGE.TYPESCRIPT;
      confidence = 50;
    }
    // UI frameworks (could be framework or library depending on usage)
    else if (deps.react && !deps.next && !deps.remix) {
      technology = PROJECT_TIERS.TECHNOLOGY.REACT;
      // Check if it's a framework (has routing, SSR, etc.) or library
      if (deps['react-router'] || deps['@tanstack/react-router']) {
        category = PROJECT_TIERS.CATEGORY.FRAMEWORK;
      } else {
        category = PROJECT_TIERS.CATEGORY.LIBRARY;
      }
      language = deps.typescript ? PROJECT_TIERS.LANGUAGE.TYPESCRIPT : PROJECT_TIERS.LANGUAGE.JAVASCRIPT;
      confidence = 40;
    } else if (deps.vue && !deps.nuxt) {
      technology = PROJECT_TIERS.TECHNOLOGY.VUE;
      category = PROJECT_TIERS.CATEGORY.LIBRARY;
      language = PROJECT_TIERS.LANGUAGE.JAVASCRIPT;
      confidence = 40;
    } else if (deps['@angular/core']) {
      technology = PROJECT_TIERS.TECHNOLOGY.ANGULAR;
      category = PROJECT_TIERS.CATEGORY.FRAMEWORK;
      language = PROJECT_TIERS.LANGUAGE.TYPESCRIPT;
      confidence = 45;
    } else if (deps.svelte && !deps['@sveltejs/kit']) {
      technology = PROJECT_TIERS.TECHNOLOGY.SVELTE;
      category = PROJECT_TIERS.CATEGORY.LIBRARY;
      language = PROJECT_TIERS.LANGUAGE.JAVASCRIPT;
      confidence = 40;
    }
    // Backend frameworks
    else if (deps['@nestjs/core']) {
      technology = PROJECT_TIERS.TECHNOLOGY.NESTJS;
      category = PROJECT_TIERS.CATEGORY.FRAMEWORK;
      language = PROJECT_TIERS.LANGUAGE.TYPESCRIPT;
      confidence = 45;
    } else if (deps.express) {
      technology = PROJECT_TIERS.TECHNOLOGY.EXPRESS;
      category = PROJECT_TIERS.CATEGORY.FRAMEWORK;
      language = deps.typescript ? PROJECT_TIERS.LANGUAGE.TYPESCRIPT : PROJECT_TIERS.LANGUAGE.JAVASCRIPT;
      confidence = 35;
    } else if (deps.fastify) {
      technology = PROJECT_TIERS.TECHNOLOGY.FASTIFY;
      category = PROJECT_TIERS.CATEGORY.FRAMEWORK;
      language = PROJECT_TIERS.LANGUAGE.JAVASCRIPT;
      confidence = 35;
    }
    // Node.js projects
    else if (packageJson.name && (deps.typescript || packageJson.scripts)) {
      technology = PROJECT_TIERS.TECHNOLOGY.NODE;
      // Determine if it's a tool (CLI) or application
      if (packageJson.bin || packageJson.name.includes('cli') || packageJson.name.includes('tool')) {
        category = PROJECT_TIERS.CATEGORY.TOOL;
      } else {
        category = PROJECT_TIERS.CATEGORY.APPLICATION;
      }
      language = deps.typescript ? PROJECT_TIERS.LANGUAGE.TYPESCRIPT : PROJECT_TIERS.LANGUAGE.JAVASCRIPT;
      confidence = 30;
    }

    // Detect language from TypeScript
    if (deps.typescript || fs.existsSync(path.join(this.projectPath, 'tsconfig.json'))) {
      language = PROJECT_TIERS.LANGUAGE.TYPESCRIPT;
      confidence += 10;
    }

    return { technology, language, category, confidence };
  }

  detectFromFiles() {
    const files = fs.readdirSync(this.projectPath);
    let technology = PROJECT_TIERS.TECHNOLOGY.UNKNOWN;

    if (files.includes('next.config.js') || files.includes('next.config.ts')) {
      technology = PROJECT_TIERS.TECHNOLOGY.NEXTJS;
    } else if (files.includes('nuxt.config.js') || files.includes('nuxt.config.ts')) {
      technology = PROJECT_TIERS.TECHNOLOGY.NUXT;
    } else if (files.includes('remix.config.js')) {
      technology = PROJECT_TIERS.TECHNOLOGY.REMIX;
    } else if (files.includes('svelte.config.js') || files.includes('svelte.config.ts')) {
      technology = PROJECT_TIERS.TECHNOLOGY.SVELTEKIT;
    } else if (files.includes('angular.json')) {
      technology = PROJECT_TIERS.TECHNOLOGY.ANGULAR;
    }

    return { technology };
  }
}

// CLI usage
if (require.main === module) {
  const detector = new EnhancedProjectTypeDetector();
  const result = detector.detect();
  
  console.log(JSON.stringify(result, null, 2));
}

module.exports = { EnhancedProjectTypeDetector, PROJECT_TIERS };

