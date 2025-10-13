/**
 * Complete Theme Showcase Content
 * All 10 themes with appropriate business content
 */

const THEME_SHOWCASE_CONTENT = {
  glassmorphism: {
    businessType: 'Modern SaaS Dashboard',
    targetCustomer: 'Tech-savvy professionals, 25-45',
    pricePoint: '$49-199/month',
    headline: '✨ Transform Your Workflow',
    subheadline: 'Beautiful, powerful tools that make work feel effortless',
    features: [
      { icon: '⚡', title: 'Lightning Fast', description: 'Sub-second response times that keep you in flow' },
      { icon: '🎨', title: 'Beautiful Design', description: 'Frosted glass aesthetics that inspire creativity' },
      { icon: '🔄', title: 'Real-Time Sync', description: 'Changes appear instantly across all devices' },
      { icon: '🤝', title: 'Team Collaboration', description: 'Work together seamlessly with your entire team' }
    ],
    cta: 'Start Free Trial',
    bestFor: 'SaaS dashboards, productivity tools, fintech apps'
  },

  neumorphism: {
    businessType: 'Wellness & Meditation App',
    targetCustomer: 'Mindfulness seekers, 30-55',
    pricePoint: '$9.99-29.99/month',
    headline: '🧘 Find Your Inner Peace',
    subheadline: 'Guided meditation and mindfulness for a calmer, more focused life',
    features: [
      { icon: '🌅', title: 'Daily Meditation', description: '100+ guided sessions for every mood and moment' },
      { icon: '😌', title: 'Stress Relief', description: 'Science-backed techniques to reduce anxiety' },
      { icon: '📊', title: 'Track Progress', description: 'See your mindfulness journey unfold over time' },
      { icon: '🌙', title: 'Sleep Better', description: 'Bedtime stories and soundscapes for deep rest' }
    ],
    cta: 'Begin Your Journey',
    bestFor: 'Wellness apps, meditation, minimalist tools'
  },

  neubrutalism: {
    businessType: 'Creative Agency Portfolio',
    targetCustomer: 'Brands seeking bold creative work',
    pricePoint: '$5,000-50,000 per project',
    headline: '⚡ CREATIVITY UNLEASHED',
    subheadline: 'We don\'t follow trends. We create them.',
    features: [
      { icon: '🎨', title: 'Brand Identity', description: 'Logos and visual systems that make bold statements' },
      { icon: '📱', title: 'Digital Products', description: 'Apps and websites that demand attention' },
      { icon: '🚀', title: 'Launch Campaigns', description: 'Marketing that breaks through the noise' },
      { icon: '🏆', title: 'Award-Winning', description: '50+ industry awards for creative excellence' }
    ],
    cta: 'See Our Work',
    bestFor: 'Creative agencies, startups, social platforms'
  },

  material: {
    businessType: 'Enterprise Productivity Suite',
    targetCustomer: 'Large organizations, IT departments',
    pricePoint: '$99-999/month per team',
    headline: '📱 Enterprise Productivity, Simplified',
    subheadline: 'Familiar design meets powerful features for teams that get things done',
    features: [
      { icon: '📊', title: 'Project Management', description: 'Kanban boards, Gantt charts, and timeline views' },
      { icon: '👥', title: 'Team Collaboration', description: 'Chat, video calls, and shared workspaces' },
      { icon: '📈', title: 'Analytics & Reporting', description: 'Real-time insights into team productivity' },
      { icon: '🔒', title: 'Enterprise Security', description: 'SSO, SAML, audit logs, and compliance' }
    ],
    cta: 'Request Demo',
    bestFor: 'Enterprise software, productivity tools, corporate apps'
  },

  midnight: {
    businessType: 'Developer Tools & IDE',
    targetCustomer: 'Software developers, 20-45',
    pricePoint: '$0-99/month',
    headline: '🌙 Code in the Dark, Ship at Light Speed',
    subheadline: 'The developer experience you\'ve been dreaming of',
    features: [
      { icon: '⚡', title: 'Lightning Fast', description: 'Native performance with cloud-powered intelligence' },
      { icon: '🤖', title: 'AI Pair Programming', description: 'GPT-4 powered code completion and suggestions' },
      { icon: '🔌', title: 'Any Language', description: 'Support for 50+ programming languages' },
      { icon: '🚀', title: 'Deploy Anywhere', description: 'One-click deployments to any cloud provider' }
    ],
    cta: 'Download Free',
    bestFor: 'Developer tools, code editors, gaming platforms'
  },

  pastel: {
    businessType: 'Premium Lifestyle E-commerce',
    targetCustomer: 'Conscious consumers, 25-45',
    pricePoint: '$50-300 per item',
    headline: '🌸 Elevate Your Everyday',
    subheadline: 'Thoughtfully curated essentials for a more beautiful life',
    features: [
      { icon: '🌿', title: 'Sustainably Sourced', description: 'Every product is ethically made and eco-friendly' },
      { icon: '✨', title: 'Artisan Quality', description: 'Handcrafted by skilled makers who love their craft' },
      { icon: '💝', title: 'Gift Ready', description: 'Beautiful packaging that makes every delivery special' },
      { icon: '🏡', title: 'Home Delivered', description: 'Free shipping on orders over $75' }
    ],
    cta: 'Shop the Collection',
    bestFor: 'Lifestyle brands, eco-products, baby/parenting, gifts'
  },

  gradient: {
    businessType: 'Fashion E-commerce',
    targetCustomer: 'Millennials/Gen Z, creative professionals',
    pricePoint: '$30-150',
    headline: '✨ Discover Your Next Obsession',
    subheadline: 'Curated collections of premium streetwear and creative essentials',
    features: [
      { icon: '👟', title: 'Limited Edition Drops', description: 'Exclusive releases you won\'t find anywhere else' },
      { icon: '🎨', title: 'Curated Collections', description: 'Hand-picked by our style team' },
      { icon: '📦', title: 'Free Express Shipping', description: 'Get your order in 2-3 days' },
      { icon: '🌟', title: 'VIP Membership', description: 'Early access and exclusive discounts' }
    ],
    cta: 'Shop the Collection →',
    bestFor: 'Fashion, creative products, digital goods'
  },

  corporate: {
    businessType: 'Financial Services Platform',
    targetCustomer: 'Professionals, business owners, 35-65',
    pricePoint: '$500-5,000 per service',
    headline: '💼 Smart Financial Planning for Your Future',
    subheadline: 'Trusted advisory services from certified financial professionals',
    features: [
      { icon: '📊', title: 'Investment Planning', description: 'Customized portfolios aligned with your goals' },
      { icon: '🏦', title: 'Retirement Strategy', description: '401k optimization and retirement readiness' },
      { icon: '🏠', title: 'Wealth Management', description: 'Holistic approach to growing your assets' },
      { icon: '🔒', title: 'Secure & Compliant', description: 'Bank-level security and SEC compliance' }
    ],
    cta: 'Schedule Consultation',
    bestFor: 'Financial services, legal, B2B professional services'
  },

  organic: {
    businessType: 'Organic Food Delivery',
    targetCustomer: 'Health-conscious families, 30-50',
    pricePoint: '$75-200 per week',
    headline: '🌿 Farm Fresh, Delivered to Your Door',
    subheadline: 'Organic produce and sustainable groceries from local farms',
    features: [
      { icon: '🥬', title: '100% Organic', description: 'USDA certified organic produce from trusted farms' },
      { icon: '🚜', title: 'Local Farmers', description: 'Supporting our community, one delivery at a time' },
      { icon: '📦', title: 'Custom Boxes', description: 'Choose what you love, we\'ll deliver weekly' },
      { icon: '♻️', title: 'Zero Waste', description: 'Reusable packaging and composting program' }
    ],
    cta: 'Build Your Box',
    bestFor: 'Food delivery, eco-brands, natural products'
  },

  cyberpunk: {
    businessType: 'Analytics SaaS Platform',
    targetCustomer: 'Developers, data analysts, tech companies',
    pricePoint: '$0-299/month',
    headline: '⚡ Unlock the Power of Your Data',
    subheadline: 'Real-time analytics and ML-powered insights for modern teams',
    features: [
      { icon: '📊', title: 'Real-Time Dashboards', description: 'Sub-second updates, 99.9% uptime, <100ms latency' },
      { icon: '🔌', title: 'RESTful API & SDKs', description: 'Python, JavaScript, Go, Rust - integrate in minutes' },
      { icon: '🤖', title: 'ML-Powered Predictions', description: 'Anomaly detection and intelligent forecasting' },
      { icon: '📈', title: 'Custom Reports', description: 'Export to CSV, JSON, PDF, or SQL' }
    ],
    cta: 'Start Free Trial →',
    bestFor: 'Analytics platforms, dev tools, AI/ML services, crypto/web3'
  }
};

module.exports = { THEME_SHOWCASE_CONTENT };

