export const CTA = {
  primary: 'Start setup',
  primaryShort: 'Start setup',
  primaryLong: 'Start setup →',
  secondary: 'Watch demo',
  signupSubmit: 'Create account → Setup questions',
  onboardingSubmit: 'Submit — our team takes it from here',
  heroSub: 'Capture leads, reply faster, and track every WhatsApp conversation in one place.',
  trialNote: '₹999/month after you\'re live · 14-day trial · ₹0 setup · No card to sign up',
} as const;

export type PlatformConfig = {
  selfServeEnabled: boolean;
  conciergeMode: boolean;
  conciergeSpotsTotal: number;
  conciergeSpotsRemaining: number;
  onboardingMessage: string;
};

export type IntakeAnswers = {
  businessDescription?: string;
  targetCustomers?: string;
  citiesServed?: string;
  useCases?: string[];
  topQuestions?: string;
  servicesList?: string;
  priceRange?: string;
  needsBooking?: string;
  teamSize?: string;
  agentNames?: string;
  businessHours?: string;
  existingWhatsApp?: string;
  hasMetaBusiness?: string;
  brandNotes?: string;
  botTone?: string;
  customRequests?: string;
};

export type OnboardingIntake = {
  id?: string;
  tenantId?: string;
  status: 'draft' | 'submitted' | 'reviewed';
  step: number;
  answers: IntakeAnswers;
  submittedAt?: string;
  tenantName?: string;
  slug?: string;
  industry?: string;
};
