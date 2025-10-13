/**
 * Theme-Aligned Content Templates
 * Based on Quark & Troi's collaborative analysis
 */

const CONTENT_TEMPLATES = {
  // Gradient Fusion - Fashion E-commerce
  gradient: {
    businessType: 'Fashion E-commerce',
    customerProfile: 'Millennials/Gen Z, creative professionals',
    pricePoint: '$30-150',
    hero: {
      headline: '✨ Discover Your Next Obsession',
      subheadline: 'Curated collections of premium streetwear and creative essentials that spark joy',
      cta: 'Shop the Collection →',
      ctaSecondary: 'View New Drops'
    },
    features: [
      {
        icon: '👟',
        title: 'Limited Edition Drops',
        description: 'Exclusive sneaker releases you won\'t find anywhere else. New drops every Friday.',
        benefit: 'Be the first to rock the latest styles'
      },
      {
        icon: '🎨',
        title: 'Curated Collections',
        description: 'Hand-picked by our style team. Every piece tells a story.',
        benefit: 'Discover unique pieces that match your vibe'
      },
      {
        icon: '📦',
        title: 'Free Express Shipping',
        description: 'Get your order in 2-3 days. Free returns within 30 days.',
        benefit: 'Risk-free shopping with fast delivery'
      },
      {
        icon: '🌟',
        title: 'VIP Membership',
        description: 'Join our community for early access, exclusive discounts, and style tips.',
        benefit: 'Save 20% on every order'
      }
    ],
    socialProof: {
      heading: 'Join 25,000+ Style Enthusiasts',
      testimonials: [
        { text: 'Best sneaker drops! Always authentic, always fire 🔥', author: '@styleicon' },
        { text: 'The curation is *chef\'s kiss*. Every piece is perfection.', author: '@designlover' }
      ]
    },
    products: [
      'Premium Designer Sneakers',
      'Limited Edition Art Prints',
      'Curated Fashion Collections',
      'Exclusive Streetwear Drops'
    ],
    typography: {
      headingSize: '56px',
      bodySize: '18px',
      lineHeight: '1.7',
      fontWeight: 'Dynamic (300-700)'
    },
    accessibility: {
      textColor: '#ffffff',
      textShadow: '0 2px 4px rgba(0,0,0,0.5)',
      minContrast: '4.5:1',
      cardBackground: 'rgba(255, 255, 255, 0.1)',
      backdropBlur: '10px'
    }
  },

  // Pastel Minimalism - Healthcare
  pastel: {
    businessType: 'Healthcare Services',
    customerProfile: 'Families, health-conscious adults 30-65',
    pricePoint: '$100-500 per visit',
    hero: {
      headline: 'Compassionate Care, When You Need It Most',
      subheadline: 'Board-certified providers dedicated to your health, wellness, and peace of mind',
      cta: 'Schedule Your Appointment',
      ctaSecondary: 'Meet Our Providers'
    },
    features: [
      {
        icon: '👨‍⚕️',
        title: 'Board-Certified Providers',
        description: '15+ years of combined experience. Your health is in expert hands.',
        benefit: 'Trust in proven medical expertise'
      },
      {
        icon: '📱',
        title: 'Telemedicine Available',
        description: 'See your provider from home. Convenient, secure video consultations.',
        benefit: 'Quality care on your schedule'
      },
      {
        icon: '🔒',
        title: 'HIPAA Compliant & Secure',
        description: 'Your privacy is our priority. End-to-end encrypted patient records.',
        benefit: 'Your information stays confidential'
      },
      {
        icon: '💳',
        title: 'Insurance Accepted',
        description: 'We work with most major insurance providers. Flexible payment options available.',
        benefit: 'Affordable care that fits your budget'
      }
    ],
    trust: {
      heading: 'Why Patients Choose Us',
      credentials: [
        '✅ Board Certified Physicians',
        '✅ 10,000+ Patients Served',
        '✅ 4.9/5 Patient Satisfaction',
        '✅ HIPAA Compliant Facility'
      ]
    },
    services: [
      'Primary Care & Wellness Exams',
      'Chronic Disease Management',
      'Mental Health Counseling',
      'Pediatric Care',
      'Women\'s Health Services',
      'Telemedicine Consultations'
    ],
    typography: {
      headingSize: '42px',
      bodySize: '18px',
      lineHeight: '1.8',
      fontWeight: 'Regular (400-600)'
    },
    accessibility: {
      textColor: '#4a4a4a',
      backgroundColor: '#faf8f6',
      minContrast: '7:1', // WCAG AAA for healthcare
      cardBackground: '#ffffff',
      borderColor: 'rgba(0, 0, 0, 0.08)',
      focusVisible: 'High contrast focus indicators'
    }
  },

  // Cyberpunk Neon - Analytics Platform
  cyberpunk: {
    businessType: 'Analytics SaaS',
    customerProfile: 'Developers, data analysts, tech companies',
    pricePoint: '$0-299/month (freemium)',
    hero: {
      headline: '⚡ Unlock the Power of Your Data',
      subheadline: 'Real-time analytics, custom dashboards, and ML-powered insights for modern teams',
      cta: 'Start Free Trial →',
      ctaSecondary: 'View Live Demo'
    },
    features: [
      {
        icon: '📊',
        title: 'Real-Time Dashboards',
        description: 'Sub-second data updates. See your metrics evolve in real-time.',
        benefit: '99.9% uptime, <100ms latency',
        technical: 'WebSocket + TimescaleDB'
      },
      {
        icon: '🔌',
        title: 'RESTful API & SDKs',
        description: 'Full-featured API with SDKs for Python, JavaScript, Go, and Rust.',
        benefit: 'Integrate in minutes, not hours',
        technical: 'OpenAPI 3.0 spec included'
      },
      {
        icon: '🤖',
        title: 'ML-Powered Predictions',
        description: 'Anomaly detection, forecasting, and intelligent alerts built-in.',
        benefit: 'Know what happens before it happens',
        technical: 'TensorFlow.js + Python ML models'
      },
      {
        icon: '📈',
        title: 'Custom Report Builder',
        description: 'Drag-and-drop interface. Export to CSV, JSON, PDF, or SQL.',
        benefit: 'Any question, any format, any time',
        technical: 'SQL-compatible query builder'
      }
    ],
    technical: {
      heading: '🛠️ Built for Developers',
      specs: [
        { label: 'API Rate Limit', value: '10,000 req/min' },
        { label: 'Data Retention', value: '13 months' },
        { label: 'Query Performance', value: '<50ms p95' },
        { label: 'Webhooks', value: 'Real-time events' },
        { label: 'SDKs', value: 'Python, JS, Go, Rust' }
      ],
      codeExample: true
    },
    pricing: [
      {
        name: 'Free',
        price: '$0',
        features: ['1 Dashboard', '1K events/month', 'Basic analytics', 'Community support'],
        cta: 'Start Free'
      },
      {
        name: 'Pro',
        price: '$49/mo',
        features: ['Unlimited dashboards', '100K events/month', 'API access', 'Email support'],
        cta: 'Start Trial',
        popular: true
      },
      {
        name: 'Enterprise',
        price: 'Custom',
        features: ['Unlimited everything', 'SLA guarantee', 'Dedicated support', 'White-label'],
        cta: 'Contact Sales'
      }
    ],
    typography: {
      headingSize: '52px',
      bodySize: '16px',
      lineHeight: '1.6',
      fontWeight: 'Monospace for code, Sans for content'
    },
    accessibility: {
      textColor: '#d0d0d0', // Desaturated for readability
      accentColor: '#00ffaa', // Slightly desaturated neon
      backgroundColor: '#0a0015',
      minContrast: '4.5:1',
      codeBackground: 'rgba(0, 255, 170, 0.05)',
      reducedMotion: 'Required option',
      focusMode: 'Optional (disables glow effects)'
    }
  }
};

module.exports = { CONTENT_TEMPLATES };

