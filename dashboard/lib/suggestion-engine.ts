import type { ProjectComponent, ProjectContent } from '@/lib/state-manager';

export type AdvisorCode = 'conversion_strategist' | 'brand_psychologist' | 'data_analyst' | 'clinical_compliance' | 'creative_director';

// Internal mapping (hidden from end-users). Not exported.
const INTERNAL_CREW_MAP: Record<AdvisorCode, { crewCodename: string; publicTitle: string; specialty: string }> = {
  conversion_strategist: { crewCodename: 'quark', publicTitle: 'Conversion Strategist', specialty: 'CRO, offer clarity, action bias' },
  brand_psychologist:   { crewCodename: 'troi',  publicTitle: 'Brand Psychologist',   specialty: 'Tone, trust, emotional framing' },
  data_analyst:          { crewCodename: 'data',  publicTitle: 'Data Analyst',          specialty: 'Evidence, precision, clarity' },
  clinical_compliance:   { crewCodename: 'crusher', publicTitle: 'Clinical Advisor',    specialty: 'Trust signals, compliance language' },
  creative_director:     { crewCodename: 'riker', publicTitle: 'Creative Director',     specialty: 'Voice, rhythm, punch' }
};

function pickAdvisor(component: ProjectComponent): AdvisorCode {
  if (component.role === 'cta' || component.intent === 'convert') return 'conversion_strategist';
  if (component.role === 'testimonial' || component.intent === 'trust') return 'brand_psychologist';
  if (component.role === 'feature' || component.intent === 'educate') return 'data_analyst';
  if (component.role === 'header' || component.role === 'hero') return 'creative_director';
  return 'brand_psychologist';
}

export function getAdvisorOptions(): Array<{ code: AdvisorCode; title: string }> {
  return (Object.keys(INTERNAL_CREW_MAP) as AdvisorCode[]).map(code => ({ code, title: INTERNAL_CREW_MAP[code].publicTitle }));
}

function clamp(text: string, max = 240) {
  if (!text) return text;
  return text.length > max ? text.slice(0, max - 1) + '…' : text;
}

function tonePrefix(tone?: ProjectComponent['tone']): string {
  switch (tone) {
    case 'bold': return 'Bold. ';
    case 'calm': return 'Calm and clear. ';
    case 'playful': return 'Playful and inviting. ';
    case 'serious': return 'Direct and professional. ';
    case 'futuristic': return 'Forward-looking. ';
    default: return '';
  }
}

export function getProfessionalSuggestion(component: ProjectComponent, project: ProjectContent, advisorOverride?: AdvisorCode): {
  advisorPublicTitle: string;
  advisorCode: AdvisorCode;
  title?: string;
  body?: string;
} {
  const advisor = advisorOverride || pickAdvisor(component);
  const { publicTitle } = INTERNAL_CREW_MAP[advisor];

  const head = (project.headline || '').trim();
  const sub = (project.subheadline || '').trim();
  const desc = (project.description || '').trim();
  const prefix = tonePrefix(component.tone);

  let title: string | undefined = component.title;
  let body: string | undefined = component.body;

  if (component.role === 'hero') {
    title = head || component.title || 'Make something people want';
    body = clamp(prefix + (sub || desc || 'Clear value, real outcomes.'));
  } else if (component.role === 'feature') {
    title = component.title || 'Why this works';
    body = clamp(prefix + (desc || 'Key benefits, explained simply.') + ' • Fast setup • Clear insights • Scales as you grow');
  } else if (component.role === 'testimonial') {
    title = component.title || 'Trusted by customers';
    body = clamp(prefix + '“This experience earned our trust immediately. Professional, reliable, and human.”');
  } else if (component.role === 'cta') {
    title = component.title || (component.intent === 'convert' ? 'Get started' : 'Learn more');
    body = clamp(prefix + (sub || 'Start in minutes. No commitment. See value fast.'));
  } else if (component.role === 'header') {
    title = component.title || head || 'Welcome';
    body = clamp(prefix + (sub || 'Focused. Clear. Useful.'));
  } else if (component.role === 'footer') {
    title = component.title || 'Company';
    body = clamp(prefix + '© ' + new Date().getFullYear() + ' · All rights reserved · Privacy · Terms');
  } else {
    title = component.title || 'Highlights';
    body = clamp(prefix + (desc || 'Concise, relevant, and useful.'));
  }

  return { advisorPublicTitle: publicTitle, advisorCode: advisor, title, body };
}


