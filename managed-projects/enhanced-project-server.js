/**
 * Enhanced Project Server with Theme-Aligned Content
 * Loads appropriate content based on theme category
 */

const http = require('http');
const { CONTENT_TEMPLATES } = require('./content-templates');

class EnhancedProjectServer {
  constructor(project, themeId) {
    this.project = project;
    this.themeId = themeId;
    this.content = CONTENT_TEMPLATES[themeId] || CONTENT_TEMPLATES.gradient;
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
    const accessibility = this.content.accessibility;
    
    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${this.project.name} | ${this.content.businessType}</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Helvetica Neue', sans-serif;
            ${css.background}
            color: ${accessibility.textColor};
            min-height: 100vh;
            line-height: ${this.content.typography.lineHeight};
        }
        .container { max-width: 1400px; margin: 0 auto; padding: 20px; }
        
        /* Hero Section */
        .hero {
            text-align: center;
            padding: 100px 30px;
            ${css.heroBackground}
            border-radius: 24px;
            margin-bottom: 60px;
            ${accessibility.cardBackground ? `background: ${accessibility.cardBackground};` : ''}
            ${accessibility.backdropBlur ? `backdrop-filter: blur(${accessibility.backdropBlur});` : ''}
            border: 1px solid ${accessibility.borderColor || 'rgba(255, 255, 255, 0.1)'};
        }
        .hero h1 {
            font-size: ${this.content.typography.headingSize};
            font-weight: 700;
            margin-bottom: 24px;
            ${accessibility.textShadow ? `text-shadow: ${accessibility.textShadow};` : ''}
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
            ${css.buttonSecondary}
            border: 2px solid ${accessibility.borderColor || 'currentColor'};
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
            ${css.cardBackground}
            padding: 40px 30px;
            border-radius: 20px;
            border: 1px solid ${accessibility.borderColor || 'rgba(255, 255, 255, 0.1)'};
            ${accessibility.backdropBlur ? `backdrop-filter: blur(${accessibility.backdropBlur});` : ''}
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
            ${css.cardBackground}
            padding: 60px 40px;
            border-radius: 24px;
            margin-bottom: 60px;
            text-align: center;
            border: 1px solid ${accessibility.borderColor || 'rgba(255, 255, 255, 0.1)'};
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
            border-top: 1px solid ${accessibility.borderColor || 'rgba(255, 255, 255, 0.1)'};
        }
        .status-bar {
            position: fixed;
            bottom: 0;
            left: 0;
            right: 0;
            background: rgba(0, 0, 0, 0.9);
            ${accessibility.backdropBlur ? `backdrop-filter: blur(10px);` : ''}
            padding: 15px;
            text-align: center;
            font-size: 13px;
            border-top: 1px solid ${accessibility.borderColor || 'rgba(255, 255, 255, 0.1)'};
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
            outline: 3px solid ${accessibility.accentColor || '#00ff88'};
            outline-offset: 2px;
        }
    </style>
</head>
<body>
    <div class="container">
        <!-- Hero Section -->
        <div class="hero">
            <h1>${this.content.hero.headline}</h1>
            <p>${this.content.hero.subheadline}</p>
            <div class="cta-group">
                <button class="btn btn-primary">${this.content.hero.cta}</button>
                <button class="btn btn-secondary">${this.content.hero.ctaSecondary}</button>
            </div>
        </div>

        <!-- Features Section -->
        <div class="features">
            <h2 class="section-heading">Why Choose ${this.project.name}?</h2>
            <div class="features-grid">
                ${this.content.features.map(feature => `
                    <div class="feature-card">
                        <span class="feature-icon">${feature.icon}</span>
                        <h3 class="feature-title">${feature.title}</h3>
                        <p class="feature-description">${feature.description}</p>
                        <p class="feature-benefit">→ ${feature.benefit}</p>
                        ${feature.technical ? `<p style="font-size: 12px; opacity: 0.6; margin-top: 8px;">${feature.technical}</p>` : ''}
                    </div>
                `).join('')}
            </div>
        </div>

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
        ${this.content.businessType} | 
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
    // Theme-specific CSS configurations
    const themes = {
      gradient: {
        background: 'background: linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%);',
        heroBackground: 'background: rgba(255, 255, 255, 0.05);',
        cardBackground: 'background: rgba(255, 255, 255, 0.08);',
        cardHover: 'border-color: #f093fb; box-shadow: 0 10px 30px rgba(240, 147, 251, 0.3);',
        buttonPrimary: 'background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: #ffffff;',
        buttonSecondary: 'background: rgba(255, 255, 255, 0.1); color: #ffffff;',
        buttonSecondaryHover: 'background: rgba(255, 255, 255, 0.2);'
      },
      pastel: {
        background: 'background: linear-gradient(135deg, #fff5f7 0%, #f5f8ff 100%);',
        heroBackground: 'background: #ffffff;',
        cardBackground: 'background: #ffffff; box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);',
        cardHover: 'box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);',
        buttonPrimary: 'background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); color: #ffffff;',
        buttonSecondary: 'background: #ffffff; color: #4a4a4a;',
        buttonSecondaryHover: 'background: #f8f8f8;'
      },
      cyberpunk: {
        background: 'background: linear-gradient(135deg, #0a0015 0%, #150a1f 100%);',
        heroBackground: 'background: rgba(0, 255, 170, 0.03); border: 1px solid rgba(0, 255, 170, 0.2);',
        cardBackground: 'background: rgba(26, 15, 46, 0.6); border: 1px solid rgba(0, 255, 170, 0.2);',
        cardHover: 'border-color: #00ffaa; box-shadow: 0 0 20px rgba(0, 255, 170, 0.3);',
        buttonPrimary: 'background: #00ffaa; color: #0a0015; font-weight: 700;',
        buttonSecondary: 'background: transparent; color: #00ffaa; border: 2px solid #00ffaa;',
        buttonSecondaryHover: 'background: rgba(0, 255, 170, 0.1);'
      }
    };

    return themes[this.themeId] || themes.gradient;
  }

  handleRequest(req, res) {
    // Allow per-request overrides via query params for live preview
    const url = new URL(req.url, `http://localhost:${this.project.port}`);
    const oldContent = this.content;
    const oldTheme = this.themeId;
    let useOverrides = false;
    try {
      const headline = url.searchParams.get('headline');
      const subheadline = url.searchParams.get('subheadline');
      const description = url.searchParams.get('description');
      const theme = url.searchParams.get('theme');
      if (headline || subheadline || description || theme) {
        useOverrides = true;
        // clone to avoid mutating template
        const clone = JSON.parse(JSON.stringify(this.content));
        if (headline) clone.hero.headline = headline;
        if (subheadline) clone.hero.subheadline = subheadline;
        if (description) {
          // Map description to first feature description if present for richer preview
          if (clone.features && clone.features[0]) {
            clone.features[0].description = description;
          }
        }
        this.content = clone;
        if (theme) this.themeId = theme;
      }
    } catch {}

    if (url.pathname === '/' || url.pathname === '') {
      res.writeHead(200, { 'Content-Type': 'text/html' });
      res.end(this.generateHTML());
      // restore base content/theme to avoid cross-request bleed
      if (useOverrides) {
        this.content = oldContent;
        this.themeId = oldTheme;
      }
    } else if (req.url === '/api/info') {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({
        project: this.project.name,
        theme: this.themeId,
        businessType: this.content.businessType,
        customerProfile: this.content.customerProfile,
        pricePoint: this.content.pricePoint
      }));
    } else {
      res.writeHead(404);
      res.end('Not found');
    }
  }
}

module.exports = EnhancedProjectServer;

