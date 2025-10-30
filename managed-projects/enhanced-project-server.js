/**
 * Enhanced Project Server with Theme-Aligned Content
 * Loads appropriate content based on theme category
 */

const http = require('http');
const { THEME_DEFINITIONS } = require('../universal-theme-system/theme-definitions');
const UniversalThemeManager = require('../universal-theme-system/theme-manager');

class EnhancedProjectServer {
  constructor(project, themeId) {
    this.project = project;
    this.themeId = themeId;
    this.themeManager = new UniversalThemeManager();
    const themeDef = THEME_DEFINITIONS[themeId] || THEME_DEFINITIONS.gradient;
    this.content = themeDef.content || {};
    this.serverCSS = themeDef.serverCSS || {};
    this.server = null;
  }

  start() {
    return new Promise((resolve) => {
      this.server = http.createServer((req, res) => {
        this.handleRequest(req, res);
      });

      this.server.listen(this.project.port, () => {
        console.log(`🚀 ${this.project.name} on port ${this.project.port} (${this.content.businessType})`);
        resolve();
      });
    });
  }

  generateHTML() {
    const css = this.getThemeCSS();
    const themeDef = THEME_DEFINITIONS[this.themeId] || THEME_DEFINITIONS.gradient;
    const content = this.content || {};
    const hero = content.hero || { headline: this.project.name, subheadline: '', cta: 'Get Started', ctaSecondary: 'Learn More' };
    const features = content.features || [];
    const typography = content.typography || themeDef.typography || { headingSize: '48px', lineHeight: '1.6' };
    const businessType = content.businessType || 'Platform';
    
    // Extract colors from CSS tokens
    const textColor = themeDef.css?.['--text'] || '#ffffff';
    const headingColor = themeDef.css?.['--heading'] || '#ffffff';
    const borderColor = themeDef.css?.['--border'] || 'rgba(255, 255, 255, 0.1)';
    
    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${this.project.name} | ${businessType}</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Helvetica Neue', sans-serif;
            ${css.background || ''}
            color: ${textColor};
            min-height: 100vh;
            line-height: ${typography.lineHeight || '1.6'};
        }
        .container { max-width: 1400px; margin: 0 auto; padding: 20px; }
        
        /* Hero Section */
        .hero {
            text-align: center;
            padding: 100px 30px;
            ${css.heroBackground || ''}
            border-radius: 24px;
            margin-bottom: 60px;
            border: 1px solid ${borderColor};
        }
        .hero h1 {
            font-size: ${typography.headingSize || '48px'};
            font-weight: 700;
            margin-bottom: 24px;
            color: ${headingColor};
            line-height: 1.2;
        }
        .hero p {
            font-size: 22px;
            margin-bottom: 40px;
            opacity: 0.95;
            max-width: 800px;
            margin-left: auto;
            margin-right: auto;
            line-height: 1.6;
        }
        
        /* CTA Buttons */
        .cta-group {
            display: flex;
            gap: 16px;
            justify-content: center;
            flex-wrap: wrap;
        }
        .btn {
            padding: 16px 36px;
            font-size: 18px;
            font-weight: 600;
            border-radius: 12px;
            border: none;
            cursor: pointer;
            transition: all 0.3s ease;
        }
        .btn-primary {
            ${css.buttonPrimary}
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        }
        .btn-primary:hover {
            transform: translateY(-2px);
            box-shadow: 0 6px 20px rgba(0, 0, 0, 0.2);
        }
        .btn-secondary {
            ${css.buttonSecondary || ''}
            border: 2px solid ${borderColor};
        }
        .btn-secondary:hover {
            ${css.buttonSecondaryHover}
        }
        
        /* Features Grid */
        .features {
            margin-bottom: 80px;
        }
        .section-heading {
            text-align: center;
            font-size: 42px;
            font-weight: 700;
            margin-bottom: 50px;
        }
        .features-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
            gap: 30px;
        }
        .feature-card {
            ${css.cardBackground || ''}
            padding: 40px 30px;
            border-radius: 20px;
            border: 1px solid ${borderColor};
            transition: transform 0.3s ease;
        }
        .feature-card:hover {
            transform: translateY(-8px);
            ${css.cardHover}
        }
        .feature-icon {
            font-size: 48px;
            margin-bottom: 20px;
            display: block;
        }
        .feature-title {
            font-size: 24px;
            font-weight: 600;
            margin-bottom: 12px;
        }
        .feature-description {
            font-size: 16px;
            opacity: 0.9;
            margin-bottom: 12px;
            line-height: 1.6;
        }
        .feature-benefit {
            font-size: 14px;
            opacity: 0.8;
            font-style: italic;
        }
        
        /* Trust Section */
        .trust-section {
            ${css.cardBackground || ''}
            padding: 60px 40px;
            border-radius: 24px;
            margin-bottom: 60px;
            text-align: center;
            border: 1px solid ${borderColor};
        }
        .trust-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 20px;
            margin-top: 30px;
        }
        .trust-item {
            font-size: 18px;
            font-weight: 500;
        }
        
        /* Footer */
        .footer {
            text-align: center;
            padding: 40px 20px;
            opacity: 0.7;
            font-size: 14px;
            border-top: 1px solid ${borderColor};
        }
        .status-bar {
            position: fixed;
            bottom: 0;
            left: 0;
            right: 0;
            background: rgba(0, 0, 0, 0.9);
            padding: 15px;
            text-align: center;
            font-size: 13px;
            border-top: 1px solid ${borderColor};
        }
        .status-indicator {
            display: inline-block;
            width: 8px;
            height: 8px;
            border-radius: 50%;
            background: #4CAF50;
            margin-right: 8px;
            animation: pulse 2s infinite;
        }
        @keyframes pulse {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.6; }
        }
        
        /* Accessibility */
        *:focus-visible {
            outline: 3px solid ${themeDef.css?.['--accent'] || '#00ff88'};
            outline-offset: 2px;
        }
    </style>
</head>
<body>
    <div class="container">
        <!-- Hero Section -->
        <div class="hero">
            <h1>${hero.headline}</h1>
            <p>${hero.subheadline}</p>
            <div class="cta-group">
                <button class="btn btn-primary">${hero.cta}</button>
                <button class="btn btn-secondary">${hero.ctaSecondary}</button>
            </div>
        </div>

        <!-- Features Section -->
        ${features.length > 0 ? `
        <div class="features">
            <h2 class="section-heading">Why Choose ${this.project.name}?</h2>
            <div class="features-grid">
                ${features.map(feature => `
                    <div class="feature-card">
                        <span class="feature-icon">${feature.icon || '✨'}</span>
                        <h3 class="feature-title">${feature.title}</h3>
                        <p class="feature-description">${feature.description}</p>
                        ${feature.benefit ? `<p class="feature-benefit">→ ${feature.benefit}</p>` : ''}
                        ${feature.technical ? `<p style="font-size: 12px; opacity: 0.6; margin-top: 8px;">${feature.technical}</p>` : ''}
                    </div>
                `).join('')}
            </div>
        </div>
        ` : ''}

        <!-- Trust/Social Proof Section -->
        ${this.renderTrustSection()}

        <!-- Tech Stack -->
        <div class="trust-section" style="margin-bottom: 100px;">
            <h2 class="section-heading">🛠️ Powered By</h2>
            <div class="trust-grid">
                ${this.project.tech.map(tech => `
                    <div class="trust-item">${tech}</div>
                `).join('')}
            </div>
        </div>
    </div>

    <!-- Status Bar -->
    <div class="status-bar">
        <span class="status-indicator"></span>
        <span>Managed by Alex AI Dashboard | 
        ${businessType} | 
        ${this.project.assignedCrew.length} Crew Members | 
        Port ${this.project.port}</span>
    </div>
</body>
</html>`;
  }

  renderTrustSection() {
    if (this.content.socialProof) {
      return `
        <div class="trust-section">
            <h2 class="section-heading">${this.content.socialProof.heading}</h2>
            <div class="trust-grid">
                ${this.content.socialProof.testimonials.map(t => `
                    <div class="trust-item">
                        <p style="font-style: italic; margin-bottom: 8px;">"${t.text}"</p>
                        <p style="font-size: 14px; opacity: 0.7;">— ${t.author}</p>
                    </div>
                `).join('')}
            </div>
        </div>
      `;
    }
    
    if (this.content.trust) {
      return `
        <div class="trust-section">
            <h2 class="section-heading">${this.content.trust.heading}</h2>
            <div class="trust-grid">
                ${this.content.trust.credentials.map(cred => `
                    <div class="trust-item">${cred}</div>
                `).join('')}
            </div>
        </div>
      `;
    }

    if (this.content.pricing) {
      return `
        <div class="trust-section">
            <h2 class="section-heading">💰 Pricing Plans</h2>
            <div class="trust-grid">
                ${this.content.pricing.map(plan => `
                    <div class="trust-item" style="padding: 20px; ${plan.popular ? 'border: 2px solid var(--accent, #00ff88);' : ''}">
                        <div style="font-size: 20px; font-weight: 600; margin-bottom: 8px;">${plan.name}</div>
                        <div style="font-size: 32px; font-weight: 700; margin-bottom: 12px;">${plan.price}</div>
                        ${plan.features.map(f => `<div style="font-size: 14px; margin-bottom: 4px;">✓ ${f}</div>`).join('')}
                        <button class="btn btn-primary" style="margin-top: 16px; width: 100%; padding: 12px;">${plan.cta}</button>
                    </div>
                `).join('')}
            </div>
        </div>
      `;
    }

    return '';
  }

  getThemeCSS() {
    // Theme-specific CSS configurations - Each theme is visually distinct
    const themes = {
      gradient: {
        // Vibrant multi-color gradients with warm tones
        background: 'background: linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%);',
        heroBackground: 'background: rgba(255, 255, 255, 0.1); backdrop-filter: blur(8px);',
        cardBackground: 'background: rgba(255, 255, 255, 0.12); backdrop-filter: blur(10px); border: 1px solid rgba(255, 255, 255, 0.2);',
        cardHover: 'border-color: #f093fb; box-shadow: 0 10px 30px rgba(240, 147, 251, 0.4); transform: translateY(-2px);',
        buttonPrimary: 'background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: #ffffff; box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);',
        buttonSecondary: 'background: rgba(255, 255, 255, 0.15); color: #ffffff; border: 1px solid rgba(255, 255, 255, 0.3);',
        buttonSecondaryHover: 'background: rgba(255, 255, 255, 0.25);'
      },
      pastel: {
        // Soft pastels with clean whitespace - Healthcare/Minimal
        background: 'background: linear-gradient(135deg, #fff5f7 0%, #f5f8ff 100%);',
        heroBackground: 'background: #ffffff; box-shadow: 0 2px 12px rgba(0, 0, 0, 0.04);',
        cardBackground: 'background: #ffffff; box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05); border: 1px solid rgba(0, 0, 0, 0.06);',
        cardHover: 'box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1); transform: translateY(-2px);',
        buttonPrimary: 'background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); color: #ffffff; box-shadow: 0 3px 10px rgba(245, 87, 108, 0.3);',
        buttonSecondary: 'background: #ffffff; color: #4a4a4a; border: 2px solid rgba(74, 74, 74, 0.2);',
        buttonSecondaryHover: 'background: #f8f8f8; border-color: rgba(74, 74, 74, 0.3);'
      },
      cyberpunk: {
        // Dark neon with cyan/magenta accents - High-tech/Futuristic
        background: 'background: linear-gradient(135deg, #0a0015 0%, #150a1f 100%);',
        heroBackground: 'background: rgba(0, 255, 170, 0.05); border: 1px solid rgba(0, 255, 170, 0.3); box-shadow: 0 0 20px rgba(0, 255, 170, 0.2);',
        cardBackground: 'background: rgba(26, 15, 46, 0.7); border: 1px solid rgba(255, 0, 255, 0.3); box-shadow: 0 0 15px rgba(255, 0, 255, 0.15);',
        cardHover: 'border-color: #00ffaa; box-shadow: 0 0 25px rgba(0, 255, 170, 0.4), 0 0 15px rgba(255, 0, 255, 0.2);',
        buttonPrimary: 'background: #00ffaa; color: #0a0015; font-weight: 700; box-shadow: 0 0 20px rgba(0, 255, 170, 0.5);',
        buttonSecondary: 'background: transparent; color: #00ffaa; border: 2px solid #00ffaa;',
        buttonSecondaryHover: 'background: rgba(0, 255, 170, 0.15); box-shadow: 0 0 15px rgba(0, 255, 170, 0.3);'
      },
      glassmorphism: {
        // Frosted glass with blue-purple tones - Modern/Glass aesthetic
        background: 'background: linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%);',
        heroBackground: 'background: rgba(255, 255, 255, 0.08); backdrop-filter: blur(12px); border: 1px solid rgba(255, 255, 255, 0.15);',
        cardBackground: 'background: rgba(255, 255, 255, 0.1); backdrop-filter: blur(14px); border: 1px solid rgba(255, 255, 255, 0.18); box-shadow: 0 8px 32px rgba(31, 38, 135, 0.37);',
        cardHover: 'border-color: rgba(255, 255, 255, 0.3); box-shadow: 0 12px 40px rgba(31, 38, 135, 0.5); transform: translateY(-3px);',
        buttonPrimary: 'background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%); color: #ffffff; backdrop-filter: blur(8px); box-shadow: 0 4px 20px rgba(99, 102, 241, 0.4);',
        buttonSecondary: 'background: rgba(255, 255, 255, 0.12); color: #ffffff; border: 1px solid rgba(255, 255, 255, 0.2); backdrop-filter: blur(8px);',
        buttonSecondaryHover: 'background: rgba(255, 255, 255, 0.2); border-color: rgba(255, 255, 255, 0.3);'
      },
      midnight: {
        // Deep dark with cyan accents - Dark theme variant
        background: 'background: linear-gradient(135deg, #0a0a0f 0%, #121218 50%, #1a1a24 100%);',
        heroBackground: 'background: rgba(0, 255, 255, 0.04); border: 1px solid rgba(0, 255, 255, 0.2); box-shadow: 0 0 15px rgba(0, 255, 255, 0.15);',
        cardBackground: 'background: #1a1a24; border: 1px solid rgba(0, 255, 255, 0.15); box-shadow: 0 4px 20px rgba(0, 0, 0, 0.5);',
        cardHover: 'border-color: #00ffff; box-shadow: 0 0 20px rgba(0, 255, 255, 0.35), 0 8px 30px rgba(0, 0, 0, 0.6);',
        buttonPrimary: 'background: #00ffff; color: #0a0a0a; font-weight: 700; box-shadow: 0 0 20px rgba(0, 255, 255, 0.5);',
        buttonSecondary: 'background: transparent; color: #00ffff; border: 2px solid #00ffff;',
        buttonSecondaryHover: 'background: rgba(0, 255, 255, 0.1); box-shadow: 0 0 15px rgba(0, 255, 255, 0.3);'
      },
      offworld: {
        // Dark nebula with teal accents - Enhanced dashboard aesthetic
        background: 'background: linear-gradient(135deg, #0a0015 0%, #150a1f 50%, #1a0f2e 100%);',
        heroBackground: 'background: rgba(0, 255, 170, 0.03); backdrop-filter: blur(10px); border: 1px solid rgba(0, 255, 170, 0.25); box-shadow: 0 0 20px rgba(0, 255, 170, 0.15);',
        cardBackground: 'background: rgba(0, 255, 170, 0.05); backdrop-filter: blur(12px); border: 1px solid rgba(0, 255, 170, 0.2); box-shadow: 0 10px 30px rgba(0, 255, 170, 0.12);',
        cardHover: 'border-color: rgba(0, 255, 170, 0.4); box-shadow: 0 0 30px rgba(0, 255, 170, 0.25), 0 15px 40px rgba(0, 0, 0, 0.4); transform: translateY(-2px);',
        buttonPrimary: 'background: #00ffaa; color: #0a0a0a; font-weight: 700; box-shadow: 0 0 16px rgba(0, 255, 170, 0.6);',
        buttonSecondary: 'background: rgba(0, 255, 170, 0.1); color: #00ffaa; border: 1px solid rgba(0, 255, 170, 0.3);',
        buttonSecondaryHover: 'background: rgba(0, 255, 170, 0.2); border-color: rgba(0, 255, 170, 0.5); box-shadow: 0 0 15px rgba(0, 255, 170, 0.3);'
      }
    };

    return themes[this.themeId] || themes.gradient;
  }

  handleRequest(req, res) {
    // Allow per-request overrides via query params for live preview
    const url = new URL(req.url, `http://localhost:${this.project.port}`);
    const themeParam = url.searchParams.get('theme');
    
    // Reload theme from project-themes.json if no query param (to pick up dashboard changes)
    // Query param theme takes precedence over file-based theme
    let effectiveThemeId = themeParam;
    if (!effectiveThemeId) {
      // Reload from file to get latest persisted theme
      this.themeManager.loadProjectThemes();
      effectiveThemeId = this.themeManager.getProjectTheme(this.project.id) || this.themeId;
    }
    
    const oldContent = this.content;
    const oldTheme = this.themeId;
    let useOverrides = false;
    
    try {
      const headline = url.searchParams.get('headline');
      const subheadline = url.searchParams.get('subheadline');
      const description = url.searchParams.get('description');
      
      // If theme changed (from query param or file reload), reload content
      if (effectiveThemeId !== this.themeId) {
        const themeDef = THEME_DEFINITIONS[effectiveThemeId] || THEME_DEFINITIONS.gradient;
        this.content = JSON.parse(JSON.stringify(themeDef.content || {}));
        this.themeId = effectiveThemeId;
        useOverrides = true;
      }
      
      if (headline || subheadline || description || themeParam) {
        useOverrides = true;
        // clone to avoid mutating template
        const clone = JSON.parse(JSON.stringify(this.content));
        this.content = clone;
        // Apply live preview overrides
        if (headline && this.content.hero) this.content.hero.headline = headline;
        if (subheadline && this.content.hero) this.content.hero.subheadline = subheadline;
        if (description) {
          // Map description to first feature description if present for richer preview
          if (this.content.features && this.content.features[0]) {
            this.content.features[0].description = description;
          } else if (this.content.hero) {
            // Fallback: use as subheadline if no features
            this.content.hero.subheadline = description;
          }
        }
      }
    } catch {}

    if (url.pathname === '/' || url.pathname === '') {
      res.writeHead(200, { 'Content-Type': 'text/html' });
      res.end(this.generateHTML());
      // Restore content template but keep theme if it changed from file
      if (useOverrides && !themeParam && effectiveThemeId === oldTheme) {
        // Only restore if theme didn't change
        this.content = oldContent;
        this.themeId = oldTheme;
      } else if (themeParam) {
        // Query param theme - restore content but keep theme for this request
        this.content = oldContent;
        // themeId stays as effectiveThemeId (from query param)
      } else if (effectiveThemeId !== oldTheme) {
        // Theme changed from file - keep it and restore content
        this.content = oldContent;
        // themeId stays as effectiveThemeId (from file)
      }
    } else if (req.url === '/api/info') {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      const content = this.content || {};
      res.end(JSON.stringify({
        project: this.project.name,
        theme: this.themeId,
        businessType: content.businessType,
        customerProfile: content.customerProfile,
        pricePoint: content.pricePoint
      }));
    } else {
      res.writeHead(404);
      res.end('Not found');
    }
  }
}

module.exports = EnhancedProjectServer;

