const DEFAULT_EMAIL = 'hello@kaana.in';

export function getWhatsAppLink() {
  const raw = import.meta.env.VITE_WHATSAPP_LINK as string | undefined;
  if (raw && raw.trim()) return raw.trim();
  return '';
}

export function getContactHref() {
  const wa = getWhatsAppLink();
  if (wa) return wa;
  const subject = encodeURIComponent('Kaana WhatsApp setup');
  const body = encodeURIComponent(
    "Hi Kaana,\n\nPlease contact me on WhatsApp for a quick setup call.\n\nMy name:\nMy business:\nMy WhatsApp number:\n\nThanks!",
  );
  return `mailto:${DEFAULT_EMAIL}?subject=${subject}&body=${body}`;
}

export function getContactLabel() {
  return getWhatsAppLink() ? 'Talk to us on WhatsApp' : `Email ${DEFAULT_EMAIL}`;
}

