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
        
        /* Status Bar */
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

        <!-- Footer Navigation & Contact -->
        <footer style="margin-top: 80px; padding: 60px 40px 40px; ${css.cardBackground || ''}; border-top: 1px solid ${borderColor}; border-radius: 24px 24px 0 0;">
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 40px; margin-bottom: 40px;">
                <!-- Company -->
                <div>
                    <h4 style="font-size: 16px; font-weight: 600; margin-bottom: 16px; color: ${headingColor};">Company</h4>
                    <ul style="list-style: none; padding: 0; margin: 0;">
                        <li style="margin-bottom: 10px;"><a href="/about" style="color: ${textColor}; text-decoration: none; opacity: 0.8; transition: opacity 0.2s;" onmouseover="this.style.opacity='1'" onmouseout="this.style.opacity='0.8'">About Us</a></li>
                        <li style="margin-bottom: 10px;"><a href="/careers" style="color: ${textColor}; text-decoration: none; opacity: 0.8; transition: opacity 0.2s;" onmouseover="this.style.opacity='1'" onmouseout="this.style.opacity='0.8'">Careers</a></li>
                        <li style="margin-bottom: 10px;"><a href="/press" style="color: ${textColor}; text-decoration: none; opacity: 0.8; transition: opacity 0.2s;" onmouseover="this.style.opacity='1'" onmouseout="this.style.opacity='0.8'">Press & Media</a></li>
                        <li style="margin-bottom: 10px;"><a href="/partners" style="color: ${textColor}; text-decoration: none; opacity: 0.8; transition: opacity 0.2s;" onmouseover="this.style.opacity='1'" onmouseout="this.style.opacity='0.8'">Partners</a></li>
                    </ul>
                </div>
                
                <!-- Products/Services -->
                <div>
                    <h4 style="font-size: 16px; font-weight: 600; margin-bottom: 16px; color: ${headingColor};">Products</h4>
                    <ul style="list-style: none; padding: 0; margin: 0;">
                        <li style="margin-bottom: 10px;"><a href="/features" style="color: ${textColor}; text-decoration: none; opacity: 0.8; transition: opacity 0.2s;" onmouseover="this.style.opacity='1'" onmouseout="this.style.opacity='0.8'">Features</a></li>
                        <li style="margin-bottom: 10px;"><a href="/pricing" style="color: ${textColor}; text-decoration: none; opacity: 0.8; transition: opacity 0.2s;" onmouseover="this.style.opacity='1'" onmouseout="this.style.opacity='0.8'">Pricing</a></li>
                        <li style="margin-bottom: 10px;"><a href="/enterprise" style="color: ${textColor}; text-decoration: none; opacity: 0.8; transition: opacity 0.2s;" onmouseover="this.style.opacity='1'" onmouseout="this.style.opacity='0.8'">Enterprise</a></li>
                        <li style="margin-bottom: 10px;"><a href="/integrations" style="color: ${textColor}; text-decoration: none; opacity: 0.8; transition: opacity 0.2s;" onmouseover="this.style.opacity='1'" onmouseout="this.style.opacity='0.8'">Integrations</a></li>
                    </ul>
                </div>
                
                <!-- Resources -->
                <div>
                    <h4 style="font-size: 16px; font-weight: 600; margin-bottom: 16px; color: ${headingColor};">Resources</h4>
                    <ul style="list-style: none; padding: 0; margin: 0;">
                        <li style="margin-bottom: 10px;"><a href="/blog" style="color: ${textColor}; text-decoration: none; opacity: 0.8; transition: opacity 0.2s;" onmouseover="this.style.opacity='1'" onmouseout="this.style.opacity='0.8'">Blog</a></li>
                        <li style="margin-bottom: 10px;"><a href="/docs" style="color: ${textColor}; text-decoration: none; opacity: 0.8; transition: opacity 0.2s;" onmouseover="this.style.opacity='1'" onmouseout="this.style.opacity='0.8'">Documentation</a></li>
                        <li style="margin-bottom: 10px;"><a href="/support" style="color: ${textColor}; text-decoration: none; opacity: 0.8; transition: opacity 0.2s;" onmouseover="this.style.opacity='1'" onmouseout="this.style.opacity='0.8'">Support Center</a></li>
                        <li style="margin-bottom: 10px;"><a href="/community" style="color: ${textColor}; text-decoration: none; opacity: 0.8; transition: opacity 0.2s;" onmouseover="this.style.opacity='1'" onmouseout="this.style.opacity='0.8'">Community</a></li>
                    </ul>
                </div>
                
                <!-- Contact -->
                <div>
                    <h4 style="font-size: 16px; font-weight: 600; margin-bottom: 16px; color: ${headingColor};">Contact</h4>
                    <ul style="list-style: none; padding: 0; margin: 0;">
                        <li style="margin-bottom: 10px;"><a href="mailto:hello@${this.project.name.toLowerCase().replace(/\s+/g, '')}.com" style="color: ${textColor}; text-decoration: none; opacity: 0.8; transition: opacity 0.2s;" onmouseover="this.style.opacity='1'" onmouseout="this.style.opacity='0.8'">📧 Email Us</a></li>
                        <li style="margin-bottom: 10px;"><a href="tel:+1-555-0123" style="color: ${textColor}; text-decoration: none; opacity: 0.8; transition: opacity 0.2s;" onmouseover="this.style.opacity='1'" onmouseout="this.style.opacity='0.8'">📞 (555) 012-3456</a></li>
                        <li style="margin-bottom: 10px;"><a href="/locations" style="color: ${textColor}; text-decoration: none; opacity: 0.8; transition: opacity 0.2s;" onmouseover="this.style.opacity='1'" onmouseout="this.style.opacity='0.8'">📍 Find a Location</a></li>
                        <li style="margin-bottom: 10px;"><a href="/contact" style="color: ${textColor}; text-decoration: none; opacity: 0.8; transition: opacity 0.2s;" onmouseover="this.style.opacity='1'" onmouseout="this.style.opacity='0.8'">💬 Contact Form</a></li>
                    </ul>
                </div>
                
                <!-- Legal & Social -->
                <div>
                    <h4 style="font-size: 16px; font-weight: 600; margin-bottom: 16px; color: ${headingColor};">Legal</h4>
                    <ul style="list-style: none; padding: 0; margin: 0;">
                        <li style="margin-bottom: 10px;"><a href="/privacy" style="color: ${textColor}; text-decoration: none; opacity: 0.8; transition: opacity 0.2s;" onmouseover="this.style.opacity='1'" onmouseout="this.style.opacity='0.8'">Privacy Policy</a></li>
                        <li style="margin-bottom: 10px;"><a href="/terms" style="color: ${textColor}; text-decoration: none; opacity: 0.8; transition: opacity 0.2s;" onmouseover="this.style.opacity='1'" onmouseout="this.style.opacity='0.8'">Terms of Service</a></li>
                        <li style="margin-bottom: 10px;"><a href="/cookies" style="color: ${textColor}; text-decoration: none; opacity: 0.8; transition: opacity 0.2s;" onmouseover="this.style.opacity='1'" onmouseout="this.style.opacity='0.8'">Cookie Policy</a></li>
                        <li style="margin-bottom: 10px;"><a href="/accessibility" style="color: ${textColor}; text-decoration: none; opacity: 0.8; transition: opacity 0.2s;" onmouseover="this.style.opacity='1'" onmouseout="this.style.opacity='0.8'">Accessibility</a></li>
                    </ul>
                </div>
            </div>
            
            <!-- Footer Bottom: Copyright & Social -->
            <div style="border-top: 1px solid ${borderColor}; padding-top: 30px; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 20px;">
                <div style="font-size: 14px; opacity: 0.7;">
                    © ${new Date().getFullYear()} ${this.project.name}. All rights reserved.
                </div>
                <div style="display: flex; gap: 16px;">
                    <a href="https://twitter.com" target="_blank" rel="noopener" style="color: ${textColor}; opacity: 0.7; text-decoration: none; font-size: 20px; transition: opacity 0.2s;" onmouseover="this.style.opacity='1'" onmouseout="this.style.opacity='0.7'" title="Twitter">𝕏</a>
                    <a href="https://linkedin.com" target="_blank" rel="noopener" style="color: ${textColor}; opacity: 0.7; text-decoration: none; font-size: 20px; transition: opacity 0.2s;" onmouseover="this.style.opacity='1'" onmouseout="this.style.opacity='0.7'" title="LinkedIn">in</a>
                    <a href="https://github.com" target="_blank" rel="noopener" style="color: ${textColor}; opacity: 0.7; text-decoration: none; font-size: 20px; transition: opacity 0.2s;" onmouseover="this.style.opacity='1'" onmouseout="this.style.opacity='0.7'" title="GitHub">⚡</a>
                    <a href="https://instagram.com" target="_blank" rel="noopener" style="color: ${textColor}; opacity: 0.7; text-decoration: none; font-size: 20px; transition: opacity 0.2s;" onmouseover="this.style.opacity='1'" onmouseout="this.style.opacity='0.7'" title="Instagram">📷</a>
                </div>
            </div>
        </footer>
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
    const content = this.content || {};
    
    if (content.socialProof) {
      return `
        <div class="trust-section">
            <h2 class="section-heading">${content.socialProof.heading}</h2>
            <div class="trust-grid">
                ${(content.socialProof.testimonials || []).map(t => `
                    <div class="trust-item">
                        <p style="font-style: italic; margin-bottom: 8px;">"${t.text}"</p>
                        <p style="font-size: 14px; opacity: 0.7;">— ${t.author}</p>
                    </div>
                `).join('')}
            </div>
        </div>
      `;
    }
    
    if (content.trust) {
      const items = content.trust.credentials || content.trust.awards || [];
      return `
        <div class="trust-section">
            <h2 class="section-heading">${content.trust.heading}</h2>
            <div class="trust-grid">
                ${items.map(item => `
                    <div class="trust-item">${item}</div>
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
    // Use serverCSS from THEME_DEFINITIONS (single source of truth)
    const themeDef = THEME_DEFINITIONS[this.themeId] || THEME_DEFINITIONS.gradient;
    return themeDef.serverCSS || {};
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

