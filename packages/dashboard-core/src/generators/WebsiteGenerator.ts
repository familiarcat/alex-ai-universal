/**
 * Website Generator
 * 
 * Generates unique websites from dashboard project configurations.
 * Each project's dashboard can output a unique website.
 * 
 * Reviewed by: Commander Data (Logic) & Lieutenant Commander La Forge (Infrastructure)
 */

import { ProjectConfig } from '../config/ProjectConfig';
const fs = require('fs');
const path = require('path');

export interface WebsiteOutput {
  projectId: string;
  outputPath: string;
  pages: GeneratedPage[];
  assets: string[];
  config: ProjectConfig;
}

export interface GeneratedPage {
  path: string;
  content: string;
  type: 'html' | 'tsx' | 'jsx';
}

export class WebsiteGenerator {
  private outputDir: string;
  
  constructor(outputDir: string = './output') {
    this.outputDir = outputDir;
  }

  /**
   * Generate website from project configuration
   */
  async generateWebsite(config: ProjectConfig): Promise<WebsiteOutput> {
    console.log(`\n🌐 Generating website for project: ${config.projectId}`);
    
    const outputPath = path.join(this.outputDir, config.projectId);
    
    // Ensure output directory exists
    if (!fs.existsSync(outputPath)) {
      fs.mkdirSync(outputPath, { recursive: true });
    }
    
    const pages: GeneratedPage[] = [];
    const assets: string[] = [];
    
    // Generate pages based on configuration
    for (const pageName of config.website.pages) {
      const page = await this.generatePage(config, pageName);
      pages.push(page);
      
      // Write page to file system
      const pagePath = path.join(outputPath, page.path);
      const pageDir = path.dirname(pagePath);
      if (!fs.existsSync(pageDir)) {
        fs.mkdirSync(pageDir, { recursive: true });
      }
      fs.writeFileSync(pagePath, page.content);
    }
    
    // Generate configuration files
    await this.generateConfigFiles(config, outputPath);
    
    // Generate assets
    await this.generateAssets(config, outputPath, assets);
    
    console.log(`✅ Website generated: ${outputPath}`);
    console.log(`   Pages: ${pages.length}`);
    console.log(`   Assets: ${assets.length}\n`);
    
    return {
      projectId: config.projectId,
      outputPath,
      pages,
      assets,
      config
    };
  }

  /**
   * Generate a single page
   */
  private async generatePage(config: ProjectConfig, pageName: string): Promise<GeneratedPage> {
    const format = config.website.exportFormat;
    
    switch (format) {
      case 'nextjs':
        return this.generateNextJSPage(config, pageName);
      case 'react':
        return this.generateReactPage(config, pageName);
      case 'html':
        return this.generateHTMLPage(config, pageName);
      case 'static':
        return this.generateStaticPage(config, pageName);
      default:
        return this.generateHTMLPage(config, pageName);
    }
  }

  /**
   * Generate Next.js page
   */
  private generateNextJSPage(config: ProjectConfig, pageName: string): GeneratedPage {
    const isIndex = pageName === 'index';
    const route = isIndex ? 'page.tsx' : `${pageName}/page.tsx`;
    
    const content = `'use client';

import { ProjectConfig } from '@/config/ProjectConfig';

/**
 * ${this.capitalize(pageName)} Page
 * Generated from dashboard project: ${config.projectId}
 */

export default function ${this.capitalize(pageName)}Page() {
  return (
    <div className="min-h-screen" style={{
      background: 'var(--theme-background)',
      color: 'var(--theme-text)'
    }}>
      <header className="container mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold">${config.projectName}</h1>
        <p className="text-xl mt-2">${config.website.seo.description}</p>
      </header>
      
      <main className="container mx-auto px-4 py-8">
        <div className="prose max-w-none">
          <h2>${this.capitalize(pageName)}</h2>
          <p>This page was generated from your dashboard project configuration.</p>
          <p>Business Type: ${config.businessType}</p>
          <p>Theme: ${config.theme}</p>
        </div>
      </main>
      
      <footer className="container mx-auto px-4 py-8 mt-16 border-t">
        <p>&copy; ${new Date().getFullYear()} ${config.projectName}. All rights reserved.</p>
      </footer>
    </div>
  );
}
`;
    
    return {
      path: route,
      content,
      type: 'tsx'
    };
  }

  /**
   * Generate React page
   */
  private generateReactPage(config: ProjectConfig, pageName: string): GeneratedPage {
    const route = pageName === 'index' ? 'index.jsx' : `${pageName}.jsx`;
    
    const content = `import React from 'react';

/**
 * ${this.capitalize(pageName)} Page
 * Generated from dashboard project: ${config.projectId}
 */

export default function ${this.capitalize(pageName)}Page() {
  return (
    <div style={{
      minHeight: '100vh',
      background: 'var(--theme-background)',
      color: 'var(--theme-text)',
      padding: '2rem'
    }}>
      <header>
        <h1>${config.projectName}</h1>
        <p>${config.website.seo.description}</p>
      </header>
      
      <main>
        <h2>${this.capitalize(pageName)}</h2>
        <p>This page was generated from your dashboard project configuration.</p>
      </main>
    </div>
  );
}
`;
    
    return {
      path: route,
      content,
      type: 'jsx'
    };
  }

  /**
   * Generate HTML page
   */
  private generateHTMLPage(config: ProjectConfig, pageName: string): GeneratedPage {
    const route = pageName === 'index' ? 'index.html' : `${pageName}.html`;
    
    const content = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${config.website.seo.title} - ${this.capitalize(pageName)}</title>
  <meta name="description" content="${config.website.seo.description}">
  <meta name="keywords" content="${config.website.seo.keywords.join(', ')}">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      background: var(--theme-background, #ffffff);
      color: var(--theme-text, #000000);
      line-height: 1.6;
    }
    .container { max-width: 1200px; margin: 0 auto; padding: 2rem; }
    header { margin-bottom: 2rem; }
    h1 { font-size: 2.5rem; margin-bottom: 0.5rem; }
    h2 { font-size: 2rem; margin: 2rem 0 1rem; }
    footer { margin-top: 4rem; padding-top: 2rem; border-top: 1px solid #e0e0e0; }
  </style>
</head>
<body>
  <header class="container">
    <h1>${config.projectName}</h1>
    <p>${config.website.seo.description}</p>
  </header>
  
  <main class="container">
    <h2>${this.capitalize(pageName)}</h2>
    <p>This page was generated from your dashboard project configuration.</p>
    <p>Business Type: ${config.businessType}</p>
    <p>Theme: ${config.theme}</p>
  </main>
  
  <footer class="container">
    <p>&copy; ${new Date().getFullYear()} ${config.projectName}. All rights reserved.</p>
  </footer>
</body>
</html>
`;
    
    return {
      path: route,
      content,
      type: 'html'
    };
  }

  /**
   * Generate static page
   */
  private generateStaticPage(config: ProjectConfig, pageName: string): GeneratedPage {
    return this.generateHTMLPage(config, pageName);
  }

  /**
   * Generate configuration files
   */
  private async generateConfigFiles(config: ProjectConfig, outputPath: string): Promise<void> {
    // Generate package.json for Next.js/React projects
    if (config.website.exportFormat === 'nextjs' || config.website.exportFormat === 'react') {
      const packageJson = {
        name: config.projectId,
        version: config.metadata.version,
        private: true,
        scripts: {
          dev: 'next dev',
          build: 'next build',
          start: 'next start'
        },
        dependencies: {
          react: '^18.0.0',
          'react-dom': '^18.0.0',
          next: '^14.0.0'
        }
      };
      
      fs.writeFileSync(
        path.join(outputPath, 'package.json'),
        JSON.stringify(packageJson, null, 2)
      );
    }
    
    // Generate next.config.js for Next.js
    if (config.website.exportFormat === 'nextjs') {
      const nextConfig = `/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  trailingSlash: true,
  images: {
    unoptimized: true
  }
};

module.exports = nextConfig;
`;
      fs.writeFileSync(
        path.join(outputPath, 'next.config.js'),
        nextConfig
      );
    }
  }

  /**
   * Generate assets
   */
  private async generateAssets(
    config: ProjectConfig,
    outputPath: string,
    assets: string[]
  ): Promise<void> {
    // Create assets directory
    const assetsDir = path.join(outputPath, 'public');
    if (!fs.existsSync(assetsDir)) {
      fs.mkdirSync(assetsDir, { recursive: true });
    }
    
    // Generate theme CSS
    const themeCss = this.generateThemeCSS(config);
    const cssPath = path.join(assetsDir, 'theme.css');
    fs.writeFileSync(cssPath, themeCss);
    assets.push('theme.css');
    
    // Generate favicon placeholder
    // (In production, would generate actual favicon)
  }

  /**
   * Generate theme CSS
   */
  private generateThemeCSS(config: ProjectConfig): string {
    return `:root {
  --theme-background: #ffffff;
  --theme-text: #000000;
  --theme-primary: #667eea;
  --theme-secondary: #764ba2;
}

/* Theme: ${config.theme} */
/* Generated for project: ${config.projectId} */
`;
  }

  /**
   * Capitalize first letter
   */
  private capitalize(str: string): string {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }
}

// Export for CommonJS compatibility
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { WebsiteGenerator };
}

