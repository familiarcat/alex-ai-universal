/**
 * Universal Theme System - Theme Definitions
 * 10 modern themes for Alex AI Platform
 * Each project and dashboard can select independently
 */

const THEME_DEFINITIONS = {
  // Shared accessibility tokens
  _a11y: {
    minContrastAA: 4.5, // WCAG AA body text
    minContrastAAA: 7.0, // WCAG AAA
    focusRing: '0 0 0 3px rgba(0, 150, 255, 0.6)'
  },
  glassmorphism: {
    name: 'Glassmorphism Modern',
    icon: '🪟',
    description: 'Frosted glass with blur effects',
    category: 'modern',
    css: {
      '--primary': '265 100% 65%',
      '--secondary': '285 75% 75%',
      '--accent': '310 80% 80%',
      '--background': 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)',
      '--surface': 'rgba(255, 255, 255, 0.1)',
      // A11y: glass panels are light; prefer dark text for legibility
      '--text': '#0f172a',
      '--heading': '#0b1220',
      '--text-muted': 'rgba(15,23,42,0.8)',
      '--border': 'rgba(0, 0, 0, 0.2)',
      '--shadow': '0 8px 32px 0 rgba(31, 38, 135, 0.37)',
      '--blur': '10px',
      '--on-primary': '#0a0a0a',
      '--scrim': 'linear-gradient(0deg, rgba(0,0,0,0.35), rgba(0,0,0,0.0))'
    },
    features: {
      backdropBlur: true,
      glassPanels: true,
      transparentSurfaces: true,
      gradientBackgrounds: true
    }
  },

  neumorphism: {
    name: 'Soft Neumorphism',
    icon: '🎨',
    description: 'Soft 3D with subtle shadows',
    category: 'minimal',
    css: {
      '--primary': '220 20% 70%',
      '--secondary': '220 15% 65%',
      '--accent': '250 40% 75%',
      '--background': 'linear-gradient(135deg, #e0e5ec 0%, #d1d9e6 100%)',
      '--surface': '#e6ebf3',
      '--text': '#1f2d3d',
      '--heading': '#1f2d3d',
      '--text-muted': 'rgba(31,45,61,0.8)',
      '--border': 'rgba(31,45,61,0.15)',
      '--shadow-light': 'rgba(255, 255, 255, 0.9)',
      '--shadow-dark': 'rgba(0, 0, 0, 0.1)',
      '--shadow': '9px 9px 16px rgba(163, 177, 198, 0.6), -9px -9px 16px rgba(255, 255, 255, 0.5)'
    },
    features: {
      extrudedElements: true,
      softShadows: true,
      monochromatic: true,
      tactile: true
    }
  },

  neubrutalism: {
    name: 'Neubrutalism Bold',
    icon: '⚡',
    description: 'Bold colors with thick borders',
    category: 'bold',
    css: {
      '--primary': '270 100% 45%',
      '--secondary': '100 85% 85%',
      '--accent': '30 100% 60%',
      '--background': 'linear-gradient(135deg, #fafafa 0%, #f5f5f5 100%)',
      '--surface': '#ffffff',
      '--text': '#1a1a1a',
      '--heading': '#1a1a1a',
      '--text-muted': 'rgba(26,26,26,0.8)',
      '--border': '#000000',
      '--border-width': '4px',
      '--shadow': 'none'
    },
    features: {
      thickBorders: true,
      flatColors: true,
      hardEdges: true,
      highContrast: true,
      noGradients: true
    }
  },

  material: {
    name: 'Material Design 3',
    icon: '📱',
    description: 'Google Material You',
    category: 'standard',
    css: {
      '--primary': '240 96% 50%',
      '--secondary': '180 80% 60%',
      '--tertiary': '60 90% 65%',
      '--background': 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)',
      '--surface': '#ffffff',
      '--text': '#1c1b1f',
      '--heading': '#1c1b1f',
      '--text-muted': 'rgba(28,27,31,0.8)',
      '--border': 'rgba(0, 0, 0, 0.12)',
      '--shadow': '0 2px 4px rgba(0, 0, 0, 0.1)',
      '--elevation-1': '0 1px 2px rgba(0, 0, 0, 0.08)',
      '--elevation-2': '0 2px 6px rgba(0, 0, 0, 0.12)',
      '--elevation-3': '0 4px 12px rgba(0, 0, 0, 0.16)'
    },
    features: {
      elevationSystem: true,
      roundedCorners: true,
      colorTokens: true,
      materialMotion: true
    }
  },

  midnight: {
    name: 'Midnight Dark',
    icon: '🌙',
    description: 'Deep dark with neon accents',
    category: 'dark',
    css: {
      '--primary': '180 100% 65%',
      '--secondary': '300 100% 60%',
      '--accent': '140 100% 70%',
      '--background': 'linear-gradient(135deg, #0a0a0f 0%, #121218 100%)',
      '--surface': '#1a1a24',
      '--text': '#e0e0e0',
      '--heading': '#ffffff',
      '--text-muted': 'rgba(224,224,224,0.85)',
      '--border': 'rgba(0, 255, 255, 0.2)',
      '--shadow': '0 0 20px rgba(0, 255, 255, 0.3)',
      '--glow': '0 0 10px currentColor',
      '--on-primary': '#0a0a0a',
      '--scrim': 'linear-gradient(0deg, rgba(0,0,0,0.35), rgba(0,0,0,0.0))'
    },
    features: {
      trueDark: true,
      neonAccents: true,
      glowEffects: true,
      highContrast: true
    }
  },

  pastel: {
    name: 'Pastel Minimalism',
    icon: '🌸',
    description: 'Soft pastels with whitespace',
    category: 'minimal',
    css: {
      '--primary': '350 70% 85%',
      '--secondary': '200 60% 85%',
      '--accent': '280 50% 85%',
      '--background': 'linear-gradient(135deg, #fff5f7 0%, #f5f8ff 100%)',
      '--surface': '#ffffff',
      '--text': '#4a4a4a',
      '--heading': '#2d2d2d',
      '--text-muted': 'rgba(74,74,74,0.85)',
      '--border': 'rgba(0, 0, 0, 0.05)',
      '--shadow': '0 2px 8px rgba(0, 0, 0, 0.05)'
    },
    features: {
      softColors: true,
      whitespace: true,
      minimal: true,
      gentle: true
    }
  },

  gradient: {
    name: 'Gradient Fusion',
    icon: '🌈',
    description: 'Vibrant multi-color gradients',
    category: 'vibrant',
    css: {
      '--primary': 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      '--secondary': 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
      '--accent': 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
      '--background': 'linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%)',
      '--surface': '#ffffff',
      '--text': '#1a202c',
      // Use dark headings on light card surfaces; reserve white for dark overlays only
      '--heading': '#111827',
      '--text-muted': 'rgba(45,55,72,0.85)',
      '--border': 'transparent',
      '--shadow': '0 10px 40px rgba(102, 126, 234, 0.3)',
      '--on-primary': '#0a0a0a',
      '--scrim': 'linear-gradient(0deg, rgba(0,0,0,0.25), rgba(0,0,0,0.0))'
    },
    features: {
      multiGradients: true,
      vibrantColors: true,
      fluidDesign: true,
      dynamic: true
    }
  },

  corporate: {
    name: 'Corporate Professional',
    icon: '💼',
    description: 'Clean blue/gray enterprise',
    category: 'professional',
    css: {
      '--primary': '210 100% 45%',
      '--secondary': '210 15% 55%',
      '--accent': '210 80% 60%',
      '--background': 'linear-gradient(135deg, #f0f4f8 0%, #e1e8ed 100%)',
      '--surface': '#ffffff',
      '--text': '#2d3748',
      '--heading': '#1a202c',
      '--text-muted': 'rgba(45,55,72,0.85)',
      '--border': '#cbd5e0',
      '--shadow': '0 1px 3px rgba(0, 0, 0, 0.12)'
    },
    features: {
      professional: true,
      trustworthy: true,
      clean: true,
      enterprise: true
    }
  },

  organic: {
    name: 'Organic Nature',
    icon: '🌿',
    description: 'Earth tones and natural feel',
    category: 'nature',
    css: {
      '--primary': '120 40% 50%',
      '--secondary': '30 50% 60%',
      '--accent': '180 30% 55%',
      '--background': 'linear-gradient(135deg, #f0ebe3 0%, #e8e1d7 100%)',
      '--surface': '#f7f4f0',
      '--text': '#3e3632',
      '--heading': '#2e2622',
      '--text-muted': 'rgba(62,54,50,0.85)',
      '--border': '#c8bfb3',
      '--shadow': '0 2px 8px rgba(62, 54, 50, 0.1)'
    },
    features: {
      earthTones: true,
      natural: true,
      warm: true,
      organic: true
    }
  },

  cyberpunk: {
    name: 'Cyberpunk Neon',
    icon: '🔮',
    description: 'Futuristic neon aesthetics',
    category: 'futuristic',
    css: {
      '--primary': '300 100% 50%',
      '--secondary': '180 100% 50%',
      '--accent': '60 100% 50%',
      '--background': 'linear-gradient(135deg, #0a0015 0%, #150a1f 100%)',
      '--surface': '#1a0f2e',
      '--text': '#00ffff',
      '--heading': '#ffffff',
      '--text-muted': 'rgba(0,255,255,0.85)',
      '--border': '#ff00ff',
      '--shadow': '0 0 20px #ff00ff',
      '--glow': '0 0 30px currentColor',
      '--scan-lines': 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0, 255, 255, 0.03) 2px, rgba(0, 255, 255, 0.03) 4px)'
    },
    features: {
      neonColors: true,
      scanLines: true,
      glitch: true,
      futuristic: true,
      highTech: true
    }
  }
  ,
  offworld: {
    name: 'Offworld Panel',
    icon: '🛸',
    description: 'Dark nebula backdrop, glass panels, neon-accent UI (enhanced dashboard aesthetic)',
    category: 'futuristic',
    css: {
      '--primary': '165 100% 65%',
      '--secondary': '285 80% 72%',
      '--accent': '#00ffaa',
      '--background': 'linear-gradient(135deg, #0a0015 0%, #150a1f 100%)',
      '--surface': 'rgba(0, 255, 170, 0.05)',
      '--text': '#d0d0d0',
      '--heading': '#00ffaa',
      '--text-muted': 'rgba(208,208,208,0.8)',
      '--border': '1px solid rgba(0, 255, 170, 0.2)',
      '--shadow': '0 10px 30px rgba(0, 255, 170, 0.12)',
      '--blur': '10px',
      '--panel': 'rgba(0, 255, 170, 0.03)',
      '--panel-strong': 'rgba(0, 255, 170, 0.1)',
      '--glow': '0 0 16px rgba(0, 255, 170, 0.6)',
      '--on-primary': '#0a0a0a',
      '--scrim': 'linear-gradient(0deg, rgba(0,0,0,0.45), rgba(0,0,0,0.0))'
    },
    features: {
      glassPanels: true,
      neonAccents: true,
      blurBackdrops: true,
      highContrastDark: true
    }
  }
};

module.exports = { THEME_DEFINITIONS };

