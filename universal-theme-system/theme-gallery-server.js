/**
 * Universal Theme Gallery Server
 * Shows all 10 themes with appropriate content in one showcase page
 */

const http = require('http');
const { THEME_DEFINITIONS } = require('./theme-definitions');
const { THEME_SHOWCASE_CONTENT } = require('./theme-showcase-content');

class ThemeGalleryServer {
  constructor(port = 3010) {
    this.port = port;
    this.server = null;
  }

  start() {
    return new Promise((resolve) => {
      this.server = http.createServer((req, res) => {
        this.handleRequest(req, res);
      });

      this.server.listen(this.port, () => {
        console.log(`🎨 Theme Gallery running on http://localhost:${this.port}`);
        resolve();
      });
    });
  }

  handleRequest(req, res) {
    if (req.url === '/') {
      this.serveGallery(res);
    } else if (req.url.startsWith('/theme/')) {
      const themeId = req.url.split('/')[2];
      this.serveThemePreview(res, themeId);
    } else {
      res.writeHead(404);
      res.end('Not found');
    }
  }

  serveGallery(res) {
    const html = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>🎨 Alex AI Theme Gallery - All 10 Themes</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
            background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
            color: #ffffff;
            min-height: 100vh;
            padding: 40px 20px;
        }
        .container { max-width: 1800px; margin: 0 auto; }
        .gallery-header {
            text-align: center;
            margin-bottom: 60px;
        }
        .gallery-header h1 {
            font-size: 56px;
            margin-bottom: 20px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
        }
        .gallery-header p {
            font-size: 20px;
            opacity: 0.9;
            margin-bottom: 10px;
        }
        .gallery-stats {
            display: flex;
            justify-content: center;
            gap: 40px;
            margin-top: 30px;
            font-size: 14px;
            opacity: 0.8;
        }
        .themes-grid {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(500px, 1fr));
            gap: 40px;
        }
        .theme-preview {
            border-radius: 20px;
            overflow: hidden;
            border: 3px solid rgba(255, 255, 255, 0.1);
            transition: all 0.3s ease;
            cursor: pointer;
            position: relative;
        }
        .theme-preview:hover {
            transform: translateY(-10px);
            border-color: rgba(255, 255, 255, 0.4);
            box-shadow: 0 20px 60px rgba(0, 0, 0, 0.4);
        }
        .theme-badge {
            position: absolute;
            top: 20px;
            right: 20px;
            background: rgba(0, 0, 0, 0.8);
            backdrop-filter: blur(10px);
            padding: 10px 20px;
            border-radius: 30px;
            font-size: 14px;
            font-weight: 600;
            border: 1px solid rgba(255, 255, 255, 0.2);
            z-index: 10;
        }
        .theme-content {
            padding: 50px 40px;
            min-height: 600px;
        }
        .theme-header {
            margin-bottom: 30px;
        }
        .theme-icon {
            font-size: 48px;
            margin-bottom: 15px;
            display: block;
        }
        .theme-title {
            font-size: 32px;
            font-weight: 700;
            margin-bottom: 15px;
        }
        .theme-subtitle {
            font-size: 18px;
            opacity: 0.9;
            margin-bottom: 25px;
            line-height: 1.5;
        }
        .theme-meta {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 15px;
            padding: 20px;
            background: rgba(0, 0, 0, 0.2);
            border-radius: 12px;
            margin-bottom: 30px;
            font-size: 13px;
        }
        .theme-meta-item {
            display: flex;
            flex-direction: column;
            gap: 4px;
        }
        .meta-label {
            opacity: 0.7;
            font-size: 11px;
            text-transform: uppercase;
        }
        .meta-value {
            font-weight: 600;
        }
        .theme-features {
            display: grid;
            gap: 15px;
            margin-bottom: 30px;
        }
        .feature-item {
            padding: 15px;
            background: rgba(255, 255, 255, 0.05);
            border-radius: 10px;
            display: flex;
            gap: 15px;
            align-items: start;
        }
        .feature-icon {
            font-size: 24px;
            flex-shrink: 0;
        }
        .feature-content h4 {
            font-size: 16px;
            margin-bottom: 5px;
        }
        .feature-content p {
            font-size: 14px;
            opacity: 0.8;
            line-height: 1.5;
        }
        .theme-cta {
            text-align: center;
        }
        .cta-button {
            padding: 16px 40px;
            font-size: 18px;
            font-weight: 700;
            border-radius: 12px;
            border: none;
            cursor: pointer;
            transition: all 0.3s;
        }
        .cta-button:hover {
            transform: translateY(-2px);
            box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
        }
        .best-for {
            text-align: center;
            margin-top: 20px;
            padding: 12px;
            background: rgba(0, 0, 0, 0.3);
            border-radius: 8px;
            font-size: 13px;
            opacity: 0.8;
        }
        
        /* Individual theme styling */
        ${this.generateThemeSpecificCSS()}
    </style>
</head>
<body>
    <div class="container">
        <div class="gallery-header">
            <h1>🎨 Alex AI Universal Theme Gallery</h1>
            <p>10 Professional Themes × Optimized Content = Perfect Customer Match</p>
            <p style="font-size: 16px; opacity: 0.7; margin-top: 10px;">
                Click any theme to see it full-screen | Each theme includes psychology-matched content
            </p>
            <div class="gallery-stats">
                <span>🎨 10 Themes</span>
                <span>📊 3 Active Projects</span>
                <span>💰 $50K Portfolio</span>
                <span>🖖 9 Crew Members</span>
            </div>
        </div>

        <div class="themes-grid">
            ${this.generateThemePreviews()}
        </div>

        <div style="text-align: center; margin-top: 60px; padding: 40px; background: rgba(0, 0, 0, 0.3); border-radius: 20px;">
            <h2 style="font-size: 28px; margin-bottom: 15px;">🖖 Ready to Create Your Project?</h2>
            <p style="opacity: 0.9; margin-bottom: 25px;">Choose your theme, we'll handle the rest</p>
            <button class="cta-button" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white;" 
                    onclick="window.location.href='http://localhost:3001'">
                Open Dashboard →
            </button>
        </div>
    </div>
</body>
</html>`;

    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.end(html);
  }

  generateThemeSpecificCSS() {
    return Object.entries(THEME_DEFINITIONS)
      .filter(([id, theme]) => theme && theme.css && typeof theme.css === 'object')
      .map(([id, theme]) => {
        const css = theme.css || {};
        const bg = css['--background'] || '#000';
        const text = css['--text'] || '#fff';
        const surface = css['--surface'];
        const border = css['--border'];
        const primary = css['--primary'] || '#00ffaa';
        return `
        .theme-${id} {
            background: ${bg};
            color: ${text};
        }
        .theme-${id} .theme-content {
            ${surface ? `background: ${surface};` : ''}
            ${border ? `border: 1px solid ${border};` : ''}
        }
        .theme-${id} .cta-button {
            background: ${primary};
            color: ${text};
        }
      `;
      }).join('\n');
  }

  generateThemePreviews() {
    return Object.entries(THEME_DEFINITIONS).map(([id, theme]) => {
      const content = THEME_SHOWCASE_CONTENT[id] || THEME_SHOWCASE_CONTENT.gradient;
      
      return `
        <div class="theme-preview theme-${id}" onclick="window.open('/theme/${id}', '_blank')">
            <div class="theme-badge">${theme.icon} ${theme.name}</div>
            <div class="theme-content">
                <div class="theme-header">
                    <span class="theme-icon">${theme.icon}</span>
                    <h2 class="theme-title">${content.headline}</h2>
                    <p class="theme-subtitle">${content.subheadline}</p>
                </div>

                <div class="theme-meta">
                    <div class="theme-meta-item">
                        <span class="meta-label">Business Type</span>
                        <span class="meta-value">${content.businessType}</span>
                    </div>
                    <div class="theme-meta-item">
                        <span class="meta-label">Target Customer</span>
                        <span class="meta-value">${content.targetCustomer}</span>
                    </div>
                    <div class="theme-meta-item">
                        <span class="meta-label">Price Point</span>
                        <span class="meta-value">${content.pricePoint}</span>
                    </div>
                    <div class="theme-meta-item">
                        <span class="meta-label">Category</span>
                        <span class="meta-value">${theme.category}</span>
                    </div>
                </div>

                <div class="theme-features">
                    ${content.features.slice(0, 2).map(feature => `
                        <div class="feature-item">
                            <span class="feature-icon">${feature.icon}</span>
                            <div class="feature-content">
                                <h4>${feature.title}</h4>
                                <p>${feature.description}</p>
                            </div>
                        </div>
                    `).join('')}
                </div>

                <div class="theme-cta">
                    <button class="cta-button">${content.cta}</button>
                </div>

                <div class="best-for">
                    Best for: ${content.bestFor}
                </div>
            </div>
        </div>
      `;
    }).join('');
  }

  serveThemePreview(res, themeId) {
    const theme = THEME_DEFINITIONS[themeId];
    const content = THEME_SHOWCASE_CONTENT[themeId];
    
    if (!theme || !content) {
      res.writeHead(404);
      res.end('Theme not found');
      return;
    }

    const css = theme.css;
    const html = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${theme.name} - Full Preview</title>
    <style>
        :root {
            ${Object.entries(css).map(([key, value]) => `${key}: ${value};`).join('\n            ')}
        }
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
            background: var(--background);
            color: var(--text);
            min-height: 100vh;
        }
        .close-button {
            position: fixed;
            top: 20px;
            right: 20px;
            background: rgba(0, 0, 0, 0.8);
            color: white;
            border: none;
            padding: 12px 24px;
            border-radius: 8px;
            cursor: pointer;
            font-size: 16px;
            z-index: 1000;
        }
        .close-button:hover {
            background: rgba(0, 0, 0, 0.9);
        }
        .hero {
            text-align: center;
            padding: 120px 40px;
            background: var(--surface, rgba(0, 0, 0, 0.3));
            ${css['--blur'] ? `backdrop-filter: blur(${css['--blur']});` : ''}
        }
        .hero h1 {
            font-size: 64px;
            font-weight: 800;
            margin-bottom: 24px;
            line-height: 1.2;
        }
        .hero p {
            font-size: 24px;
            opacity: 0.95;
            max-width: 800px;
            margin: 0 auto 40px;
            line-height: 1.6;
        }
        .cta-group {
            display: flex;
            gap: 20px;
            justify-content: center;
        }
        .btn {
            padding: 18px 40px;
            font-size: 18px;
            font-weight: 700;
            border-radius: 12px;
            border: none;
            cursor: pointer;
        }
        .btn-primary {
            background: var(--primary, #667eea);
            color: white;
        }
        .container-content {
            max-width: 1400px;
            margin: 0 auto;
            padding: 80px 40px;
        }
        .section-heading {
            text-align: center;
            font-size: 48px;
            font-weight: 700;
            margin-bottom: 60px;
        }
        .features-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
            gap: 30px;
        }
        .feature-card {
            background: var(--surface, rgba(255, 255, 255, 0.05));
            padding: 40px;
            border-radius: 20px;
            border: 1px solid var(--border, rgba(255, 255, 255, 0.1));
            ${css['--blur'] ? `backdrop-filter: blur(${css['--blur']});` : ''}
        }
        .feature-card .icon {
            font-size: 48px;
            margin-bottom: 20px;
            display: block;
        }
        .feature-card h3 {
            font-size: 24px;
            margin-bottom: 15px;
        }
        .feature-card p {
            font-size: 16px;
            opacity: 0.9;
            line-height: 1.6;
        }
        .info-banner {
            background: rgba(0, 0, 0, 0.5);
            padding: 30px;
            border-radius: 16px;
            margin: 60px auto;
            max-width: 900px;
            text-align: center;
        }
        .info-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 20px;
            margin-top: 20px;
        }
        .info-item {
            font-size: 14px;
        }
        .info-label {
            opacity: 0.7;
            font-size: 12px;
            margin-bottom: 4px;
        }
        .info-value {
            font-size: 18px;
            font-weight: 600;
        }
    </style>
</head>
<body>
    <button class="close-button" onclick="window.close()">← Back to Gallery</button>
    
    <div class="hero">
        <h1>${content.headline}</h1>
        <p>${content.subheadline}</p>
        <div class="cta-group">
            <button class="btn btn-primary">${content.cta}</button>
        </div>
    </div>

    <div class="container-content">
        <h2 class="section-heading">Key Features</h2>
        <div class="features-grid">
            ${content.features.map(f => `
                <div class="feature-card">
                    <span class="icon">${f.icon}</span>
                    <h3>${f.title}</h3>
                    <p>${f.description}</p>
                </div>
            `).join('')}
        </div>

        <div class="info-banner">
            <h3 style="font-size: 28px; margin-bottom: 20px;">${theme.icon} ${theme.name}</h3>
            <div class="info-grid">
                <div class="info-item">
                    <div class="info-label">Business Type</div>
                    <div class="info-value">${content.businessType}</div>
                </div>
                <div class="info-item">
                    <div class="info-label">Target Customer</div>
                    <div class="info-value">${content.targetCustomer}</div>
                </div>
                <div class="info-item">
                    <div class="info-label">Price Point</div>
                    <div class="info-value">${content.pricePoint}</div>
                </div>
                <div class="info-item">
                    <div class="info-label">Best For</div>
                    <div class="info-value">${content.bestFor}</div>
                </div>
            </div>
        </div>
    </div>
</body>
</html>`;

    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.end(html);
  }
}

module.exports = ThemeGalleryServer;

// Start if run directly
if (require.main === module) {
  const gallery = new ThemeGalleryServer();
  gallery.start().then(() => {
    console.log('🎨 Theme Gallery operational!');
    console.log('🖖 View all 10 themes: http://localhost:3010');
  });
}

