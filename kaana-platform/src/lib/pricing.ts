/** Founding customer pricing — marketing + billing source of truth */

export const FOUNDING_SETUP_FEE_INR = 0;
export const SETUP_FEE_AFTER_FOUNDING_INR = 1999;

export const WHATS_INCLUDED = [
  'WhatsApp setup assistance',
  'Automated replies',
  'Business workflows',
  'Shared team inbox',
  'Lead CRM',
  'Mini-site',
  'Team access',
  'Support',
] as const;

export const STARTER_INCLUDES = [
  'WhatsApp setup help',
  'Automated replies',
  'Shared inbox',
  'Lead CRM',
  'Mini-site',
  '2 team members',
  'Support',
] as const;

export type MarketingPlan = {
  id: string;
  name: string;
  priceInr: number | null;
  period: string;
  highlight?: boolean;
  badge?: string;
  desc: string;
  features: readonly string[];
  cta: string;
  contactOnly?: boolean;
};

export const FOUNDING_PLANS: MarketingPlan[] = [
  {
    id: 'trial',
    name: 'Free Trial',
    priceInr: 0,
    period: '14 days',
    desc: 'Try everything before you pay. We set it up for you.',
    features: STARTER_INCLUDES,
    cta: 'Start setup',
  },
  {
    id: 'starter',
    name: 'Starter',
    priceInr: 999,
    period: '/ month',
    highlight: true,
    badge: 'Founding price',
    desc: 'For businesses getting leads on WhatsApp — our main plan while we onboard founding customers.',
    features: [
      '1 WhatsApp number',
      'Reply as a team from one WhatsApp number',
      'Track every enquiry from first message to sale',
      'Share products or services with a simple branded page',
      'Answer common questions automatically',
      'WhatsApp onboarding assistance',
      '2 team members',
      'Support',
    ],
    cta: 'Start setup',
  },
  {
    id: 'growth',
    name: 'Growth',
    priceInr: 2499,
    period: '/ month',
    desc: 'For teams that need more agents, outreach, and hands-on support.',
    features: [
      'Everything in Starter',
      '5 team members',
      'Broadcast campaigns',
      'Advanced workflows',
      'Priority support',
    ],
    cta: 'Start setup',
  },
  {
    id: 'pro',
    name: 'Pro',
    priceInr: null,
    period: 'custom',
    desc: 'For larger teams with custom needs — we scope this together.',
    features: [
      'Custom workflows',
      'Priority support',
      'Advanced integrations',
    ],
    cta: 'Contact us',
    contactOnly: true,
  },
];

export function formatPlanPrice(priceInr: number | null): string {
  if (priceInr === null) return 'Custom';
  if (priceInr === 0) return '₹0';
  return `₹${priceInr.toLocaleString('en-IN')}`;
}

export function formatPlanPeriod(period: string): string {
  if (period === 'month') return '/ month';
  return period.startsWith('/') ? period : period;
}

export function getFoundingPlan(id: string): MarketingPlan | undefined {
  return FOUNDING_PLANS.find((p) => p.id === id);
}

/** API-shaped plans for fetchPlans fallback */
export function foundingPlansForApi() {
  return FOUNDING_PLANS.map((p) => ({
    id: p.id,
    name: p.name,
    price: p.priceInr ?? -1,
    period: p.period === '/ month' ? 'month' : p.period,
    features: [...p.features],
    customPrice: p.priceInr === null,
  }));
}
