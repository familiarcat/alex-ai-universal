'use client';

import { useMemo, useState } from 'react';
import { useAppState } from '@/lib/state-manager';
import ThemeSelector from '@/components/ThemeSelector';

type BusinessType = 'ecommerce' | 'healthcare' | 'analytics' | 'portfolio' | 'saas';
type Intent = 'acquire' | 'convert' | 'educate' | 'trust' | 'delight';
type Tone = 'bold' | 'calm' | 'playful' | 'serious' | 'futuristic';

interface CombinedWizardProps {
  projectId: string;
  onCreated?: () => void;
}

function uid(prefix: string) {
  return `${prefix}_${Math.random().toString(36).slice(2, 9)}`;
}

const INTENT_TO_THEME: Record<Intent, Partial<Record<Tone, string>>> = {
  acquire:    { bold: 'brutalist', playful: 'gradient', futuristic: 'cyberpunk' },
  convert:    { bold: 'monochromeBlue', calm: 'mochaEarth', serious: 'monochromeBlue' },
  educate:    { calm: 'pastel', serious: 'monochromeBlue', playful: 'glassmorphism' },
  trust:      { calm: 'mochaEarth', serious: 'midnight', bold: 'monochromeBlue' },
  delight:    { playful: 'gradient', futuristic: 'cyberpunk', calm: 'glassmorphism' }
};

export default function CombinedWizard({ projectId, onCreated }: CombinedWizardProps) {
  const { addComponents, updateTheme, projects } = useAppState();
  
  // Inherit current project theme as default
  const currentProjectTheme = projects[projectId]?.theme || 'gradient';

  const [step, setStep] = useState<0 | 1 | 2 | 3 | 4>(0);
  const [businessType, setBusinessType] = useState<BusinessType>('ecommerce');
  const [businessName, setBusinessName] = useState('');
  const [niche, setNiche] = useState('');
  const [goals, setGoals] = useState<string>('Increase conversions and brand trust');
  const [intent, setIntent] = useState<Intent>('convert');
  const [tone, setTone] = useState<Tone>('calm');
  const [theme, setTheme] = useState<string>(currentProjectTheme);
  const [domainAnswers, setDomainAnswers] = useState<Record<string, string>>({});

  const recommendedTheme = useMemo(() => {
    const m = INTENT_TO_THEME[intent]?.[tone];
    return m || currentProjectTheme;
  }, [intent, tone, currentProjectTheme]);

  function next() { setStep((s) => (Math.min(4, (s + 1)) as 0 | 1 | 2 | 3 | 4)); }
  function back() { setStep((s) => (Math.max(0, (s - 1)) as 0 | 1 | 2 | 3 | 4)); }

  const domainQuestionBank: Record<BusinessType, Array<{ id: string; q: string; placeholder?: string }>> = {
    ecommerce: [
      { id: 'catalog', q: 'What categories or collections define your catalog?', placeholder: 'e.g., Streetwear, Accessories, Limited Drops' },
      { id: 'usp', q: 'Your unique selling proposition (USP)?', placeholder: 'e.g., Ethical sourcing, limited editions, free returns' },
      { id: 'ctaCopy', q: 'Primary action you want customers to take?', placeholder: 'e.g., Shop Now, Join the Drop, Sign Up' }
    ],
    healthcare: [
      { id: 'services', q: 'Core services offered?', placeholder: 'e.g., Telemedicine, Pediatrics, Cardiology' },
      { id: 'compliance', q: 'Any compliance/trust badges or statements?', placeholder: 'e.g., HIPAA compliant, Board-certified providers' },
      { id: 'ctaCopy', q: 'Primary action patients should take?', placeholder: 'e.g., Book Appointment, Call Now' }
    ],
    analytics: [
      { id: 'datasources', q: 'Key data sources you connect to?', placeholder: 'e.g., Postgres, BigQuery, Kafka' },
      { id: 'insights', q: 'What insights matter most?', placeholder: 'e.g., Real-time KPIs, anomaly detection, cohorts' },
      { id: 'ctaCopy', q: 'Primary conversion action?', placeholder: 'e.g., Start Free Trial, Request Demo' }
    ],
    saas: [
      { id: 'usecases', q: 'Top use cases or jobs-to-be-done?', placeholder: 'e.g., automate reports, sync CRM, notify teams' },
      { id: 'pricing', q: 'Pricing positioning?', placeholder: 'e.g., freemium, value-based, enterprise tiers' },
      { id: 'ctaCopy', q: 'Primary CTA?', placeholder: 'e.g., Try Free, Get Started' }
    ],
    portfolio: [
      { id: 'audience', q: 'Who is your primary audience?', placeholder: 'e.g., hiring managers, clients, collaborators' },
      { id: 'works', q: 'Signature works or projects to feature?', placeholder: 'e.g., case studies, awards' },
      { id: 'ctaCopy', q: 'Preferred contact/conversion path?', placeholder: 'e.g., Contact Me, Book a Call' }
    ]
  };

  function createDefaultCards() {
    // Minimal but expressive starter set, tuned to business type and goals
    const basePriority = (r: string) => (
      r === 'hero' ? 5 : r === 'header' ? 3 : r === 'cta' ? 4 : r === 'testimonial' ? 2 : r === 'feature' ? 3 : 1
    );

    const heroTitle = businessName ? `${businessName}` : (
      businessType === 'ecommerce' ? 'Shop the latest drop' :
      businessType === 'healthcare' ? 'Compassionate care, always' :
      businessType === 'analytics' ? 'Your data, illuminated' :
      businessType === 'saas' ? 'Do more with less' :
      'Welcome'
    );

    const compTheme = theme || recommendedTheme;

    const ctaCopy = domainAnswers['ctaCopy'] || (businessType === 'healthcare' ? 'Book an appointment' : 'Get started');
    const featureTail =
      businessType === 'ecommerce' ? (domainAnswers['catalog'] ? ` Collections: ${domainAnswers['catalog']}.` : '') :
      businessType === 'healthcare' ? (domainAnswers['services'] ? ` Services: ${domainAnswers['services']}.` : '') :
      businessType === 'analytics' ? (domainAnswers['datasources'] ? ` Sources: ${domainAnswers['datasources']}.` : '') :
      businessType === 'saas' ? (domainAnswers['usecases'] ? ` Use cases: ${domainAnswers['usecases']}.` : '') :
      businessType === 'portfolio' ? (domainAnswers['works'] ? ` Highlights: ${domainAnswers['works']}.` : '') : '';

    const trustTail =
      businessType === 'healthcare' && domainAnswers['compliance'] ? ` ${domainAnswers['compliance']}` : '';

    const cards = [
      {
        id: uid('hero'),
        title: heroTitle,
        body: niche ? `${niche}. ${goals}` : goals,
        role: 'hero' as const,
        priority: basePriority('hero'),
        intent,
        tone,
        theme: compTheme,
        updatedAt: Date.now()
      },
      {
        id: uid('feature'),
        title: businessType === 'analytics' ? 'Live Dashboards' : 'Top Benefits',
        body: (businessType === 'ecommerce' ? 'Curated collections, fast shipping, easy returns.' : (
          businessType === 'healthcare' ? 'Telemedicine, scheduling, HIPAA-grade security.' :
          businessType === 'analytics' ? 'Real-time charts, custom reports, API access.' :
          businessType === 'saas' ? 'Automations, integrations, delightful UX.' :
          'Highlights that matter'
        )) + featureTail,
        role: 'feature' as const,
        priority: basePriority('feature'),
        intent,
        tone,
        theme: compTheme,
        updatedAt: Date.now()
      },
      {
        id: uid('testimonial'),
        title: 'What our users say',
        body: '“It just works, beautifully.”' + trustTail,
        role: 'testimonial' as const,
        priority: basePriority('testimonial'),
        intent: 'trust' as const,
        tone: 'calm' as const,
        theme: compTheme,
        updatedAt: Date.now()
      },
      {
        id: uid('cta'),
        title: ctaCopy,
        body: businessType === 'ecommerce' ? (domainAnswers['usp'] || 'Explore the collection') : 'Try it now',
        role: 'cta' as const,
        priority: basePriority('cta'),
        intent: 'convert' as const,
        tone,
        theme: compTheme,
        updatedAt: Date.now()
      },
      {
        id: uid('footer'),
        title: 'Company',
        body: businessName || 'Your company',
        role: 'footer' as const,
        priority: basePriority('footer'),
        intent,
        tone,
        theme: compTheme,
        updatedAt: Date.now()
      }
    ];

    return cards;
  }

  function finish() {
    const cards = createDefaultCards();
    addComponents(projectId, cards as any);
    const projectTheme = theme || recommendedTheme;
    if (projectTheme) updateTheme(projectId, projectTheme);
    onCreated?.();
  }

  const box = { border: 'var(--border)', padding: 16, borderRadius: 12, background: 'var(--card)' } as const;
  const row = { display: 'flex', gap: 8, marginTop: 12, flexWrap: 'wrap' as const };
  const input = { width: '100%', padding: 10, background: 'var(--card-alt)', color: 'var(--text)', border: 'var(--border)', borderRadius: 8 } as const;

  return (
    <div style={box as any}>
      {step === 0 && (
        <div>
          <div style={{ marginBottom: 8 }}>What type of business?</div>
          <select value={businessType} onChange={(e) => setBusinessType(e.target.value as BusinessType)} style={input as any}>
            <option value="ecommerce">E-commerce</option>
            <option value="healthcare">Healthcare</option>
            <option value="analytics">Analytics</option>
            <option value="saas">SaaS</option>
            <option value="portfolio">Portfolio</option>
          </select>
          <div style={row as any}>
            <button onClick={next} style={{ padding: '8px 12px', borderRadius: 8, background: 'var(--accent)', color: '#0a0015', border: 'none' }}>Next</button>
          </div>
        </div>
      )}

      {step === 1 && (
        <div>
          <div style={{ marginBottom: 8 }}>Basic details</div>
          <input placeholder="Business name" value={businessName} onChange={(e) => setBusinessName(e.target.value)} style={input as any} />
          <input placeholder="Niche (optional)" value={niche} onChange={(e) => setNiche(e.target.value)} style={{ ...input, marginTop: 8 } as any} />
          <textarea placeholder="Goals (what should this site achieve?)" value={goals} onChange={(e) => setGoals(e.target.value)} style={{ ...input, minHeight: 100, marginTop: 8 } as any} />
          <div style={row as any}>
            <button onClick={back} style={{ padding: '8px 12px', borderRadius: 8 }}>Back</button>
            <button onClick={next} style={{ padding: '8px 12px', borderRadius: 8, background: 'var(--accent)', color: '#0a0015', border: 'none' }}>Next</button>
          </div>
        </div>
      )}

      {step === 2 && (
        <div>
          <div style={{ marginBottom: 8 }}>Intent and tone</div>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' as const }}>
            <select value={intent} onChange={(e) => setIntent(e.target.value as Intent)} style={input as any}>
              <option value="acquire">Acquire attention</option>
              <option value="convert">Convert to action</option>
              <option value="educate">Educate/learn</option>
              <option value="trust">Build trust</option>
              <option value="delight">Delight/brand</option>
            </select>
            <select value={tone} onChange={(e) => setTone(e.target.value as Tone)} style={input as any}>
              <option value="bold">Bold</option>
              <option value="calm">Calm</option>
              <option value="playful">Playful</option>
              <option value="serious">Serious</option>
              <option value="futuristic">Futuristic</option>
            </select>
          </div>
          <div style={{ marginTop: 8, fontSize: 12, opacity: 0.8 }}>Suggested theme → <b>{recommendedTheme}</b></div>
          <div style={row as any}>
            <button onClick={back} style={{ padding: '8px 12px', borderRadius: 8 }}>Back</button>
            <button onClick={next} style={{ padding: '8px 12px', borderRadius: 8, background: 'var(--accent)', color: '#0a0015', border: 'none' }}>Next</button>
          </div>
        </div>
      )}

      {step === 3 && (
        <div>
          <div style={{ marginBottom: 8 }}>Domain-specific questions</div>
          {(domainQuestionBank[businessType] || []).map(({ id, q, placeholder }) => (
            <div key={id} style={{ marginBottom: 8 }}>
              <div style={{ fontSize: 13, marginBottom: 4 }}>{q}</div>
              <input
                placeholder={placeholder}
                value={domainAnswers[id] || ''}
                onChange={(e) => setDomainAnswers(prev => ({ ...prev, [id]: e.target.value }))}
                style={{ width: '100%', padding: 10, background: 'var(--card-alt)', color: 'var(--text)', border: 'var(--border)', borderRadius: 8 }}
              />
            </div>
          ))}
          <div style={row as any}>
            <button onClick={back} style={{ padding: '8px 12px', borderRadius: 8 }}>Back</button>
            <button onClick={next} style={{ padding: '8px 12px', borderRadius: 8, background: 'var(--accent)', color: '#0a0015', border: 'none' }}>Next</button>
          </div>
        </div>
      )}

      {step === 4 && (
        <div>
          <ThemeSelector
            value={theme || recommendedTheme}
            onChange={setTheme}
            mode="dropdown"
            label={`Theme (Current: ${currentProjectTheme})`}
          />
          <div style={{ marginTop: 12, padding: 8, background: 'var(--card-alt)', borderRadius: 6, fontSize: 12 }}>
            💡 Based on your intent "{intent}" and tone "{tone}", we recommend: <strong>{recommendedTheme}</strong>
          </div>
          <div style={row as any}>
            <button onClick={back} style={{ padding: '8px 12px', borderRadius: 8 }}>Back</button>
            <button onClick={finish} style={{ padding: '8px 12px', borderRadius: 8, background: 'var(--accent)', color: '#0a0015', border: 'none' }}>Create components</button>
          </div>
        </div>
      )}
    </div>
  );
}


