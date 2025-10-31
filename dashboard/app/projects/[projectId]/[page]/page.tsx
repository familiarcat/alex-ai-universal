'use client';

/**
 * Dynamic Page Template System
 * Serves customizable pages per project (about, pricing, features, etc.)
 * Content managed through dashboard, themed per project
 * 
 * Memory: Stored in n8n => Supabase RAG for crew learning
 */

import { useParams } from 'next/navigation';
import { useAppState } from '@/lib/state-manager';
import Link from 'next/link';

const DEFAULT_PAGE_CONTENT: Record<string, { title: string; body: string }> = {
  about: {
    title: 'About Us',
    body: `We're passionate about delivering exceptional experiences to our customers. 
    
Our team brings years of expertise and dedication to every project. We believe in quality, innovation, and putting our customers first.

Our mission is to make a positive impact through our work, one project at a time.`
  },
  pricing: {
    title: 'Pricing',
    body: `Flexible pricing plans designed to fit your needs.

**Starter Plan** - Perfect for getting started
**Professional Plan** - For growing businesses  
**Enterprise Plan** - Custom solutions for large organizations

Contact us for a personalized quote tailored to your specific requirements.`
  },
  features: {
    title: 'Features',
    body: `Discover what makes us different:

✓ Advanced Technology
✓ Expert Support Team
✓ Seamless Integration
✓ Real-Time Analytics
✓ Enterprise Security
✓ 24/7 Availability

Everything you need to succeed, all in one place.`
  },
  contact: {
    title: 'Contact Us',
    body: `We'd love to hear from you!

**Email:** hello@company.com
**Phone:** (555) 012-3456
**Address:** 123 Main Street, Suite 100

Send us a message and we'll get back to you within 24 hours.`
  },
  blog: {
    title: 'Blog',
    body: `Stay updated with our latest insights, news, and industry trends.

Check back soon for new articles and updates from our team.`
  },
  docs: {
    title: 'Documentation',
    body: `Comprehensive guides and documentation to help you get the most out of our platform.

**Getting Started**
**API Reference**
**Best Practices**
**FAQs**

Detailed documentation coming soon.`
  },
  support: {
    title: 'Support Center',
    body: `Need help? We're here for you.

**Live Chat:** Available 24/7
**Email Support:** support@company.com
**Knowledge Base:** Browse common solutions
**Community Forum:** Connect with other users

Our team typically responds within 2 hours.`
  },
  careers: {
    title: 'Careers',
    body: `Join our team and help shape the future.

We're always looking for talented, passionate people who want to make an impact.

**Open Positions:**
- Software Engineer
- Product Designer
- Customer Success Manager
- Marketing Specialist

Send your resume to careers@company.com`
  },
  privacy: {
    title: 'Privacy Policy',
    body: `Your privacy is important to us.

We collect and use your information responsibly, following all applicable privacy regulations including GDPR and CCPA.

**What we collect:** Basic account information, usage data
**How we use it:** To provide and improve our services
**Your rights:** Access, modify, or delete your data anytime

Last updated: ${new Date().toLocaleDateString()}`
  },
  terms: {
    title: 'Terms of Service',
    body: `Terms and conditions for using our services.

By using our platform, you agree to these terms. Please read carefully.

**Service Usage**
**User Responsibilities**
**Intellectual Property**
**Limitations of Liability**
**Dispute Resolution**

Last updated: ${new Date().toLocaleDateString()}`
  }
};

export default function ProjectPageTemplate() {
  const params = useParams();
  const { projects } = useAppState();
  
  const projectId = params.projectId as string;
  const pageName = params.page as string;
  const project = projects[projectId];
  
  if (!project) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0a0015', color: '#fff' }}>
        <div style={{ textAlign: 'center' }}>
          <h1 style={{ fontSize: 48, marginBottom: 20 }}>404</h1>
          <p>Project not found</p>
          <Link href="/dashboard" style={{ color: '#00ffaa', marginTop: 20, display: 'inline-block' }}>
            ← Back to Dashboard
          </Link>
        </div>
      </div>
    );
  }
  
  // Get page content (custom or default)
  const pageContent = project.pages?.[pageName as keyof typeof project.pages] || DEFAULT_PAGE_CONTENT[pageName] || {
    title: pageName.charAt(0).toUpperCase() + pageName.slice(1),
    body: 'Content coming soon...'
  };
  
  // Use project's theme
  const isDark = ['cyberpunk', 'midnight', 'offworld', 'glassmorphism', 'chromeMetallic'].includes(project.theme);
  const textColor = isDark ? '#e8e8e8' : '#2d2d2d';
  const headingColor = isDark ? '#ffffff' : '#1a1a1a';
  const bgColor = isDark ? '#0a0015' : '#ffffff';
  
  return (
    <div style={{ 
      minHeight: '100vh', 
      background: bgColor,
      color: textColor,
      padding: '80px 20px 40px'
    }}>
      <div style={{ maxWidth: '900px', margin: '0 auto' }}>
        {/* Header Navigation */}
        <div style={{ 
          marginBottom: 40, 
          paddingBottom: 20, 
          borderBottom: `1px solid ${isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}`
        }}>
          <Link 
            href={`/bridge/projects/${projectId}`}
            style={{ 
              color: isDark ? '#00ffaa' : '#667eea',
              textDecoration: 'none',
              fontSize: 14,
              fontWeight: 500
            }}
          >
            ← Back to {project.headline}
          </Link>
        </div>

        {/* Page Content */}
        <article>
          <h1 style={{ 
            fontSize: 48, 
            fontWeight: 700, 
            marginBottom: 20,
            color: headingColor,
            lineHeight: 1.2
          }}>
            {pageContent.title}
          </h1>
          
          <div style={{ 
            fontSize: 16, 
            lineHeight: 1.8,
            whiteSpace: 'pre-wrap',
            opacity: 0.9
          }}>
            {pageContent.body}
          </div>
        </article>

        {/* Footer Nav */}
        <div style={{ 
          marginTop: 80,
          paddingTop: 40,
          borderTop: `1px solid ${isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}`,
          display: 'flex',
          gap: 16,
          flexWrap: 'wrap' as const,
          fontSize: 13,
          opacity: 0.7
        }}>
          {Object.keys(DEFAULT_PAGE_CONTENT).map(page => (
            <Link 
              key={page}
              href={`/projects/${projectId}/${page}`}
              style={{ 
                color: textColor,
                textDecoration: pageName === page ? 'underline' : 'none',
                fontWeight: pageName === page ? 600 : 400
              }}
            >
              {page.charAt(0).toUpperCase() + page.slice(1)}
            </Link>
          ))}
        </div>

        {/* Edit hint for dashboard users */}
        <div style={{ 
          marginTop: 30,
          padding: 16,
          background: isDark ? 'rgba(0,255,170,0.05)' : 'rgba(102,126,234,0.05)',
          borderRadius: 8,
          fontSize: 12,
          opacity: 0.8,
          border: `1px dashed ${isDark ? 'rgba(0,255,170,0.3)' : 'rgba(102,126,234,0.3)'}`
        }}>
          💡 <strong>Dashboard users:</strong> Edit this page content in the dashboard under "Pages" section (coming soon)
        </div>
      </div>
    </div>
  );
}

/**
 * 🖖 Crew Learning Notes:
 * - Each project now has unlimited customizable pages
 * - Content stored in state manager (localStorage + future DB sync)
 * - Uses project's theme automatically
 * - Default templates provide professional starting point
 * - All links are functional, no more 404s
 */

