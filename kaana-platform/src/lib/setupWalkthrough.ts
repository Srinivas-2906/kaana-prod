/** 8-min onboarding walkthrough — onboarding, Meta, billing (not product demos) */
export const SETUP_WALKTHROUGH_URL =
  import.meta.env.VITE_SETUP_WALKTHROUGH_URL || '';

export const SETUP_WALKTHROUGH_LABEL = 'See how setup works (8 min)';

export const WALKTHROUGH_STEPS = [
  'Tell us about your business',
  'We help connect your WhatsApp',
  'Start receiving leads',
] as const;

export const WALKTHROUGH_TRUST = [
  'Use your existing WhatsApp number',
  'Your business keeps ownership of the number',
  'We help with Meta setup',
  'Live in 1–3 business days',
] as const;

export function isWalkthroughConfigured(): boolean {
  const url = SETUP_WALKTHROUGH_URL.trim();
  return url.length > 0 && !url.includes('PLACEHOLDER');
}

/** YouTube / Vimeo watch URL → embed URL for iframe modal */
export function toEmbedUrl(url: string): string | null {
  if (!url) return null;
  try {
    const u = new URL(url);
    if (u.hostname.includes('youtube.com')) {
      const id = u.searchParams.get('v');
      if (id) return `https://www.youtube.com/embed/${id}?autoplay=1&rel=0`;
    }
    if (u.hostname === 'youtu.be') {
      const id = u.pathname.slice(1);
      if (id) return `https://www.youtube.com/embed/${id}?autoplay=1&rel=0`;
    }
    if (u.hostname.includes('vimeo.com')) {
      const id = u.pathname.split('/').filter(Boolean).pop();
      if (id) return `https://player.vimeo.com/video/${id}?autoplay=1`;
    }
  } catch {
    return null;
  }
  return null;
}
